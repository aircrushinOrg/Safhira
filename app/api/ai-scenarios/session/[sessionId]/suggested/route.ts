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

type SuggestedQuestionPair = {
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

    const localeInstruction = buildLocaleDirective({
      locale: session.locale ?? undefined,
      includeMirrorHint: false,
    });
    const languageLabel = getLanguageDisplayName(session.locale ?? undefined);

    const prompt = [
      npcDescriptorLines.join("\n"),
      "",
      `Latest NPC message (turn ${lastNpcTurn.turnIndex}):`,
      lastNpcTurn.content,
      "",
      "Recent conversation transcript:",
      transcript,
      "",
      `Craft two contrasting follow-up questions the player could ask next, written in ${languageLabel.toLowerCase()}.`,
      "- Option A (positive) should build rapport, show empathy, or keep the conversation open while staying safe.",
      "- Option B (negative) should set boundaries, question unhealthy assumptions, or challenge unsafe pressure firmly.",
      "- Both options must be phrased as clear questions, stay under 160 characters, and remain contextually relevant.",
      "- Keep language concise, natural, and actionable for the player.",
      localeInstruction ? `- ${localeInstruction}` : "",
      "",
      'Return a strict JSON object with keys "positive" and "negative". Example:',
      '{ "positive": "How do you think we can keep things comfortable for both of us?", "negative": "Why are you pushing this when I already said I\'m not ready?" }',
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
            "You are a communication coach helping a player respond to a simulated conversation about healthy relationships. Provide contrasting question suggestions that respect safety.",
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

    const suggestions: SuggestedQuestionPair = {
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
