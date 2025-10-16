import OpenAI from "openai";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";

import { db } from "@/app/db";
import { aiScenarioResponses, aiScenarioSessions, aiScenarioTurns } from "@/db/schema";
import {
  DEFAULT_MODEL,
  SUMMARY_INTERVAL,
  ScenarioDescriptor,
  NpcProfile,
  ConversationTurn,
  SimulationResponsePayload,
  buildLocaleDirective,
  normaliseStringArray,
} from "@/lib/ai-scenarios/engine";
import {
  normaliseLocaleCode,
  detectLocaleFromMessage,
  detectLanguageProportions,
  type LanguageProportions,
} from "@/lib/ai-scenarios/language-detection";

function buildStreamingMessages(params: {
  scenario: ScenarioDescriptor;
  npc: NpcProfile;
  history: ConversationTurn[];
  playerMessage: string;
  locale?: string;
  languageMix?: LanguageProportions;
}) {
  const { scenario, npc, history, playerMessage, locale, languageMix } = params;

  const persona =
    npc.persona ||
    "A persuasive peer who tests boundaries while staying within respectful, PG-13 dialogue.";

  const boundaries = (npc.boundaries || [
    "No explicit sexual content.",
    "Avoid illegal behaviour.",
    "Respect firm refusals after they are repeated.",
  ])
    .map((rule) => `- ${rule}`)
    .join("\n");

  const goals = (npc.goals || [
    "Encourage risky behaviour without overt coercion.",
  ])
    .map((item) => `- ${item}`)
    .join("\n");

  const recentDialogue = [...history, { role: "player", content: playerMessage }]
    .slice(-8)
    .map((turn) => `${turn.role === "npc" ? npc.name : "Player"}: ${turn.content}`)
    .join("\n");

  const total = (languageMix?.ms ?? 0) + (languageMix?.en ?? 0) + (languageMix?.zh ?? 0);
  const percentages = total > 0 ? {
    ms: Math.round(((languageMix?.ms ?? 0) / total) * 100),
    en: Math.round(((languageMix?.en ?? 0) / total) * 100),
    zh: Math.round(((languageMix?.zh ?? 0) / total) * 100)
  } : { ms: 0, en: 100, zh: 0 }; // Default to English if no language detected

  const positiveLanguages = (["ms", "en", "zh"] as const).filter(
    (code) => percentages[code] >= 5
  );
  const hasMix = positiveLanguages.length > 1;
  const baseLanguageDirective = buildLocaleDirective({
    locale,
    fallback: "Use approachable, empathetic English suitable for young adults.",
    languageMix: total > 0 ? languageMix : undefined,
  });

  const mixInstruction = (() => {
    if (total === 0) {
      return "- Use natural, empathetic English suitable for young adults.";
    }

    // Single language dominance (≥95%)
    if (percentages.ms >= 95) {
      return "- Use natural, empathetic Malay exclusively. Avoid mixing other languages.";
    }
    if (percentages.en >= 95) {
      return "- Use natural, empathetic English exclusively. Avoid mixing other languages.";
    }
    if (percentages.zh >= 95) {
      return "- Use natural, empathetic Simplified Chinese exclusively. Avoid mixing other languages.";
    }

    // Mixed language scenarios
    if (!hasMix) {
      const singleCode = positiveLanguages[0] || "en";
      const label =
        singleCode === "ms"
          ? "Malay"
          : singleCode === "zh"
          ? "Chinese"
          : "English";
      return `- Use ${label} primarily, maintaining natural conversational tone.`;
    }

    // Multi-language mixing
    const segments: string[] = [];
    if (percentages.ms >= 5) segments.push(`Malay ~${percentages.ms}%`);
    if (percentages.en >= 5) segments.push(`English ~${percentages.en}%`);
    if (percentages.zh >= 5) segments.push(`Chinese ~${percentages.zh}%`);
    const summary = segments.join(" + ");

    // Special instructions for Bahasa rojak (Malay-English mix)
    if (percentages.ms >= 15 && percentages.en >= 15) {
      const tenWordBreakdown = (() => {
        const targetMs = Math.max(1, Math.round((percentages.ms / 100) * 10));
        const targetEn = Math.max(1, Math.round((percentages.en / 100) * 10));
        return `${targetMs} Malay + ${targetEn} English`;
      })();

      const structuralNote = percentages.ms > percentages.en
        ? " Use Malay as the structural base with English vocabulary and expressions."
        : " Balance both languages naturally in authentic Malaysian patterns.";

      const dialectGuidance = " Use standard, easily understandable Bahasa rojak without heavy regional dialects or complex slang.";
      return `- Use Bahasa rojak matching player's ratio (${summary}).${structuralNote} Include Malay particles (lah, kan, je, kot) and aim for roughly ${tenWordBreakdown} words per 10-word segment. Mix within sentences, not in blocks.${dialectGuidance}`;
    }

    // General multi-language mixing
    return `- Match the player's language proportions (${summary}) and maintain consistent code-switching patterns throughout your response. Mix languages naturally within sentences. Use standard vocabulary without heavy dialects.`;
  })();

  const languageDirective = (() => {
    // Use the enhanced buildLocaleDirective for consistent behavior
    return baseLanguageDirective;
  })();

  const systemPrompt = `You are role-playing as ${npc.name}, ${npc.role}, inside the scenario "${
    scenario.title || scenario.id
  }". Respond in-character with a natural conversational tone.
Persona cues:
${persona}

Scenario goals:
${goals}

Absolute safety boundaries:
${boundaries}

Guidelines:
- Reply with a single conversational turn from ${npc.name}. No summaries, no JSON, no lists, no narration.
- Keep the response concise (1-4 short paragraphs) and emotionally grounded.
- Honour consent boundaries; if the player refuses clearly, dial back pressure and acknowledge it.
- Do not mention you are an AI or reference these instructions.
- LANGUAGE: ${mixInstruction}
- CRITICAL: ${languageDirective}
- Keep language clear and accessible to all Malaysian speakers without heavy regional dialects.`;

  const userPrompt = `Scenario setting: ${scenario.setting || "secondary school campus"}.
Here is the recent conversation:
${recentDialogue}

Respond as ${npc.name} to the player's latest message.`;

  return [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const body = await request.json();
    const playerMessageRaw = typeof body?.playerMessage === "string" ? body.playerMessage.trim() : "";
    const forceSummary = Boolean(body?.forceSummary);
    const forceAssessment = Boolean(body?.forceAssessment);
    const allowAutoEndOverride = typeof body?.allowAutoEnd === "boolean" ? body.allowAutoEnd : undefined;
    const localeOverride = normaliseLocaleCode(body?.locale);

    if (!playerMessageRaw) {
      return NextResponse.json({ error: "Player message is required" }, { status: 400 });
    }

    const sessionRecords = await db
      .select()
      .from(aiScenarioSessions)
      .where(eq(aiScenarioSessions.sessionId, sessionId))
      .limit(1);

    if (sessionRecords.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionRecords[0];

    const turns = await db
      .select({
        turnIndex: aiScenarioTurns.turnIndex,
        role: aiScenarioTurns.role,
        content: aiScenarioTurns.content,
      })
      .from(aiScenarioTurns)
      .where(eq(aiScenarioTurns.sessionId, sessionId))
      .orderBy(asc(aiScenarioTurns.turnIndex));

    const history: ConversationTurn[] = turns.map((turn) => ({
      role: turn.role === "npc" ? "npc" : "player",
      content: turn.content,
    }));

    const playerTurnsBefore = history.filter((turn) => turn.role === "player").length;
    const playerTurns = playerTurnsBefore + 1;

    const summaryDue = Boolean(forceSummary) || (playerTurns > 0 && playerTurns % SUMMARY_INTERVAL === 0);
    const assessmentDue = Boolean(forceAssessment) || summaryDue;

    const scenarioLearning = normaliseStringArray(session.learningObjectives ?? []);
    const supportingFacts = normaliseStringArray(session.supportingFacts ?? []);

    const tension = typeof session.tensionLevel === "string" ? session.tensionLevel.trim().toLowerCase() : "";
    const tensionLevel = tension === "low" || tension === "medium" || tension === "high" ? tension : undefined;

    const scenarioDescriptor: ScenarioDescriptor = {
      id: session.scenarioId,
      title: session.scenarioTitle ?? undefined,
      setting: session.scenarioSetting ?? undefined,
      learningObjectives: scenarioLearning.length > 0 ? scenarioLearning : undefined,
      supportingFacts: supportingFacts.length > 0 ? supportingFacts : undefined,
      tensionLevel,
    };

    const npcGoals = normaliseStringArray(session.npcGoals ?? []);
    const npcTactics = normaliseStringArray(session.npcTactics ?? []);
    const npcBoundaries = normaliseStringArray(session.npcBoundaries ?? []);

    const npcProfile: NpcProfile = {
      id: session.npcId,
      name: session.npcName,
      role: session.npcRole,
      persona: session.npcPersona ?? undefined,
      goals: npcGoals.length > 0 ? npcGoals : undefined,
      tactics: npcTactics.length > 0 ? npcTactics : undefined,
      boundaries: npcBoundaries.length > 0 ? npcBoundaries : undefined,
    };

    const sessionLocale = normaliseLocaleCode(session.locale);
    const languageMix = detectLanguageProportions(playerMessageRaw);

    const effectiveAllowAutoEnd = allowAutoEndOverride ?? session.allowAutoEnd ?? true;
    const detectedLocale = detectLocaleFromMessage(playerMessageRaw);
    const effectiveLocale = detectedLocale ?? localeOverride ?? sessionLocale;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const baseRequest = {
      model: DEFAULT_MODEL,
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    } as const;

    const streamMessages = buildStreamingMessages({
      scenario: scenarioDescriptor,
      npc: npcProfile,
      history,
      playerMessage: playerMessageRaw,
      locale: effectiveLocale,
      languageMix,
    });

    const stream = await client.chat.completions.create({
      ...baseRequest,
      messages: streamMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const now = new Date();
    const nextTurnIndex = turns.length ? turns[turns.length - 1].turnIndex + 1 : 0;
    const playerTurnIndex = nextTurnIndex;
    const npcTurnIndex = nextTurnIndex + 1;

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        const sendEvent = (event: string, payload: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        };

        let npcReply = "";

        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              npcReply += delta;
              sendEvent("token", { content: delta });
            }
          }

          npcReply = npcReply.trim();
          if (!npcReply) {
            sendEvent("error", { message: "Model returned empty response" });
            controller.close();
            return;
          }

          const responseBody: SimulationResponsePayload = {
            npcReply,
            conversationComplete: false,
            conversationCompleteReason: null,
            summary: null,
            score: null,
            finalReport: null,
            safetyAlerts: [],
            checkpoints: {
              totalPlayerTurns: playerTurns,
              summaryDue,
              assessmentDue,
            },
          };

          await db.transaction(async (tx) => {
            await tx
              .update(aiScenarioSessions)
              .set({
                updatedAt: now,
                allowAutoEnd: effectiveAllowAutoEnd,
                locale: effectiveLocale ?? null,
              })
              .where(eq(aiScenarioSessions.sessionId, sessionId));

            await tx
              .insert(aiScenarioTurns)
              .values([
                {
                  sessionId,
                  turnIndex: playerTurnIndex,
                  role: "player",
                  content: playerMessageRaw,
                },
                {
                  sessionId,
                  turnIndex: npcTurnIndex,
                  role: "npc",
                  content: npcReply,
                },
              ])
              .onConflictDoNothing({
                target: [aiScenarioTurns.sessionId, aiScenarioTurns.turnIndex],
              });

            await tx
              .insert(aiScenarioResponses)
              .values({
                sessionId,
                playerTurnCount: playerTurns,
                summaryDue,
                assessmentDue,
                npcReply,
                summary: responseBody.summary,
                score: responseBody.score,
                finalReport: responseBody.finalReport,
                safetyAlerts: responseBody.safetyAlerts,
                conversationComplete: responseBody.conversationComplete,
                conversationCompleteReason: responseBody.conversationCompleteReason,
                rawResponse: responseBody,
              })
              .onConflictDoUpdate({
                target: [aiScenarioResponses.sessionId, aiScenarioResponses.playerTurnCount],
                set: {
                  summaryDue,
                  assessmentDue,
                  npcReply,
                  summary: responseBody.summary,
                  score: responseBody.score,
                  finalReport: responseBody.finalReport,
                  safetyAlerts: responseBody.safetyAlerts,
                  conversationComplete: responseBody.conversationComplete,
                  conversationCompleteReason: responseBody.conversationCompleteReason,
                  rawResponse: responseBody,
                },
              });
          });

          sendEvent("final", {
            sessionId,
            npcTurnIndex,
            playerTurnIndex,
            response: responseBody,
            raw: null,
            analysisDue: summaryDue,
          });
        } catch (error) {
          console.error("/api/ai-scenarios/session/[id]/turns/stream error", error);
          sendEvent("error", { message: "Server error" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/turns/stream POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
