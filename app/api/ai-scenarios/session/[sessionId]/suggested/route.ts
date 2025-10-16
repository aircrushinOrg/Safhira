import OpenAI from "openai";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

import { db } from "@/app/db";
import { aiScenarioSessions, aiScenarioTurns } from "@/db/schema";
import {
  DEFAULT_MODEL,
  buildLocaleDirective,
  getLanguageDisplayName,
  isNonEmptyString,
} from "@/lib/ai-scenarios/engine";
import {
  detectLocaleFromMessage,
  detectLanguageProportions,
  normaliseLocaleCode,
} from "@/lib/ai-scenarios/language-detection";

type SuggestedResponsePair = {
  positive: string;
  negative: string;
};

type SuggestionModelResponse = {
  positive?: unknown;
  negative?: unknown;
};

const MAX_CONTEXT_TURNS = 8;
const MAX_SUGGESTION_LENGTH = 160;

function normaliseSuggestion(value: unknown) {
  if (!isNonEmptyString(value)) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= MAX_SUGGESTION_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_SUGGESTION_LENGTH).trimEnd();
}

function formatTranscript(turns: Array<{ role: string; content: string }>, npcName: string) {
  return turns
    .map((turn) => {
      const speaker = turn.role === "npc" ? npcName || "NPC" : "Player";
      return `${speaker}: ${turn.content}`;
    })
    .join("\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const [session] = await db
      .select({
        sessionId: aiScenarioSessions.sessionId,
        scenarioTitle: aiScenarioSessions.scenarioTitle,
        scenarioSetting: aiScenarioSessions.scenarioSetting,
        npcName: aiScenarioSessions.npcName,
        npcRole: aiScenarioSessions.npcRole,
        npcPersona: aiScenarioSessions.npcPersona,
        locale: aiScenarioSessions.locale,
      })
      .from(aiScenarioSessions)
      .where(eq(aiScenarioSessions.sessionId, sessionId))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const recentTurns = await db
      .select({
        turnIndex: aiScenarioTurns.turnIndex,
        role: aiScenarioTurns.role,
        content: aiScenarioTurns.content,
      })
      .from(aiScenarioTurns)
      .where(eq(aiScenarioTurns.sessionId, sessionId))
      .orderBy(desc(aiScenarioTurns.turnIndex))
      .limit(MAX_CONTEXT_TURNS);

    if (recentTurns.length === 0) {
      return NextResponse.json({ error: "No turns recorded for session" }, { status: 409 });
    }

    const orderedTurns = [...recentTurns].sort((a, b) => a.turnIndex - b.turnIndex);
    const lastNpcTurn = [...orderedTurns].reverse().find((turn) => turn.role === "npc");

    if (!lastNpcTurn) {
      return NextResponse.json({ error: "Missing NPC response to base suggestions on" }, { status: 409 });
    }

    const transcript = formatTranscript(orderedTurns, session.npcName ?? "NPC");
    const npcDescriptorLines: string[] = [];

    if (isNonEmptyString(session.npcRole)) {
      npcDescriptorLines.push(`${session.npcName} (${session.npcRole})`);
    } else {
      npcDescriptorLines.push(session.npcName);
    }

    if (isNonEmptyString(session.npcPersona)) {
      npcDescriptorLines.push(`Persona notes: ${session.npcPersona}`);
    }

    if (isNonEmptyString(session.scenarioTitle)) {
      npcDescriptorLines.push(`Scenario: ${session.scenarioTitle}`);
    }

    if (isNonEmptyString(session.scenarioSetting)) {
      npcDescriptorLines.push(`Setting: ${session.scenarioSetting}`);
    }

    // Get latest player message - suggestions will follow its language exclusively
    const latestPlayerTurn = [...orderedTurns].reverse().find((turn) => turn.role === "player");
    const latestPlayerMessage = latestPlayerTurn?.content || "";
    const sessionLocale = normaliseLocaleCode(session.locale);
    const languageMix = detectLanguageProportions(latestPlayerMessage);
    const mixTotal = languageMix.en + languageMix.ms + languageMix.zh;

    // Calculate percentages for better decision making
    const percentages = mixTotal > 0 ? {
      ms: Math.round((languageMix.ms / mixTotal) * 100),
      en: Math.round((languageMix.en / mixTotal) * 100),
      zh: Math.round((languageMix.zh / mixTotal) * 100)
    } : { ms: 0, en: 100, zh: 0 }; // Default to English if no content

    const positiveLanguages = (['ms', 'en', 'zh'] as const).filter((code) => percentages[code] >= 5);
    const hasMix = positiveLanguages.length > 1;
    const detectedLocale = detectLocaleFromMessage(latestPlayerMessage);
    const effectiveLocale = detectedLocale ?? sessionLocale ?? "en";

    const baseLanguageDirective = buildLocaleDirective({
      locale: effectiveLocale,
      includeMirrorHint: false,
      fallback: "Use approachable, empathetic English suitable for young adults.",
      languageMix: mixTotal > 0 ? languageMix : undefined,
    });
    const languageName = getLanguageDisplayName(effectiveLocale);

    // Enhanced language directive based on proportions
    const languageDirective = (() => {
      if (mixTotal === 0) {
        return "Use approachable, empathetic English suitable for young adults.";
      }

      // Single language dominance (≥95%)
      if (percentages.ms >= 95) {
        return "Use natural, empathetic Malay exclusively. Avoid mixing other languages.";
      }
      if (percentages.en >= 95) {
        return "Use natural, empathetic English exclusively. Avoid mixing other languages.";
      }
      if (percentages.zh >= 95) {
        return "Use natural, empathetic Simplified Chinese exclusively. Avoid mixing other languages.";
      }

      // Mixed language scenarios
      if (hasMix) {
        const parts = [
          percentages.ms >= 5 ? `Malay ~${percentages.ms}%` : null,
          percentages.en >= 5 ? `English ~${percentages.en}%` : null,
          percentages.zh >= 5 ? `Chinese ~${percentages.zh}%` : null,
        ]
          .filter(Boolean)
          .join(" / ");

        // Special handling for Bahasa rojak (Malay-English mix)
        if (percentages.ms >= 15 && percentages.en >= 15) {
          const malayEmphasis = percentages.ms > percentages.en
            ? " Use Malay as the structural base with English vocabulary."
            : " Balance both languages naturally.";
          const dialectGuidance = " Use standard, easily understandable Bahasa rojak without heavy regional dialects or complex slang. Keep vocabulary accessible to all Malaysian speakers.";
          return `Use Bahasa rojak matching the player's proportions (${parts}).${malayEmphasis} Include Malay particles (lah, kan, je, kot) and maintain authentic Malaysian code-switching patterns.${dialectGuidance}`;
        }

        return `Mirror the player's language mix (${parts}) and maintain that ratio throughout both suggestions. Use standard vocabulary without heavy dialects.`;
      }

      // Single language with low confidence - default to English
      return "Use approachable, empathetic English suitable for young adults.";
    })();

    const detailedGuidanceLines = (() => {
      if (percentages.ms >= 95 || percentages.en >= 95 || percentages.zh >= 95) {
        const langName = percentages.ms >= 95 ? "Malay" : percentages.en >= 95 ? "English" : "Chinese";
        return [
          `- Use ${langName} exclusively throughout both positive and negative suggestions.`,
          `- Maintain natural, empathetic tone appropriate for young adults.`,
          `- Avoid introducing other languages unless explicitly switching context.`
        ];
      }

      if (hasMix && percentages.ms >= 15 && percentages.en >= 15) {
        const wordBreakdown = (() => {
          const targetMs = Math.max(1, Math.round((percentages.ms / 100) * 10));
          const targetEn = Math.max(1, Math.round((percentages.en / 100) * 10));
          return `${targetMs} Malay + ${targetEn} English words per 10-word segment`;
        })();

        return [
          `- Use natural Bahasa rojak with approximately ${percentages.ms}% Malay and ${percentages.en}% English.`,
          `- Mix languages within sentences (aim for ~${wordBreakdown}), not in separate blocks.`,
          `- Include Malay discourse particles: 'lah', 'kan', 'je', 'kot', 'meh' naturally.`,
          `- IMPORTANT: Use standard, easily understandable vocabulary without heavy regional dialects or complex slang.`,
          `- Keep language accessible to all Malaysian speakers regardless of region or background.`,
          `- Examples: 'I rasa this not right lah', 'You sure or not about this?', 'Cannot like that one'.`
        ];
      }

      if (hasMix) {
        const activeLangs = Object.entries(percentages)
          .filter(([, pct]) => pct >= 5)
          .map(([lang, pct]) => {
            const name = lang === 'ms' ? 'Malay' : lang === 'en' ? 'English' : 'Chinese';
            return `${name} ~${pct}%`;
          })
          .join(', ');

        return [
          `- Maintain the detected language proportions: ${activeLangs}.`,
          `- Switch languages naturally within sentences when mixing.`,
          `- Use standard vocabulary without heavy regional dialects or slang.`,
          `- Keep the same proportional balance in both positive and negative suggestions.`
        ];
      }

      const primaryLang = percentages.ms > percentages.en && percentages.ms > percentages.zh ? 'Malay' :
                         percentages.en > percentages.zh ? 'English' : 'Chinese';
      return [
        `- Use ${primaryLang} primarily, maintaining natural and empathetic tone.`,
        `- Stay consistent in language choice between both suggestions.`
      ];
    })();

    const languageGuidanceLines = [
      `- ${languageDirective}`,
      ...detailedGuidanceLines
    ];

    const prompt = [
      npcDescriptorLines.join("\n"),
      "",
      `Latest NPC message (turn ${lastNpcTurn.turnIndex}):`,
      lastNpcTurn.content,
      "",
      "Recent conversation transcript:",
      transcript,
      "",
      `Latest player message: "${latestPlayerMessage}"`,
      "",
      "Language guidance:",
      ...languageGuidanceLines,
      "",
      "Content requirements:",
      "- Option A (positive) should sound warm and empathetic while reinforcing healthy communication.",
      "- Option B (negative) should assert boundaries, surface concerns, or challenge unsafe pressure firmly yet respectfully.",
      "- Make each reply feel human and conversational, reference the NPC's latest message, and keep it under 160 characters.",
      "- Avoid stage directions or labels; deliver natural speech the player could genuinely use.",
      "- CRITICAL: Both suggestions must follow the exact same language proportions and mixing patterns specified above.",
      "- Use easily understandable language without heavy regional dialects or complex slang that might be difficult to understand.",
      "",
      'Return a strict JSON object with keys "positive" and "negative". Example:',
      '{ "positive": "I get that this matters to you, and I want us both to feel comfortable moving forward.", "negative": "I hear what you\'re saying, but I need you to stop pushing - my boundaries aren\'t up for negotiation right now." }',
    ]
      .filter(Boolean)
      .join("\n");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const completion = await client.chat.completions.create({
      model: process.env.SUGGESTION_MODEL_NAME || DEFAULT_MODEL,
      temperature: 0.6,
      max_tokens: 350,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a communication coach helping a player respond to a simulated conversation about healthy relationships. Provide contrasting response suggestions that respect safety, feel natural, and precisely match the player's detected language proportions and mixing patterns.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawContent = completion.choices?.[0]?.message?.content ?? "";
    let parsed: SuggestionModelResponse | null = null;
    try {
      parsed = rawContent ? (JSON.parse(rawContent) as SuggestionModelResponse) : null;
    } catch (error) {
      console.error("Failed to parse suggestion model response", error, rawContent);
      return NextResponse.json({ error: "Model returned invalid suggestions" }, { status: 502 });
    }

    const positive = normaliseSuggestion(parsed?.positive);
    const negative = normaliseSuggestion(parsed?.negative);

    if (!positive || !negative) {
      return NextResponse.json({ error: "Incomplete suggestions generated" }, { status: 502 });
    }

    const suggestions: SuggestedResponsePair = {
      positive,
      negative,
    };

    return NextResponse.json({
      sessionId,
      npcTurnIndex: lastNpcTurn.turnIndex,
      suggestions,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/suggested GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
