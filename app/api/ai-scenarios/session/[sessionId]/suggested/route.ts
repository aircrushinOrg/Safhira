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
import { detectLocaleFromMessage } from "@/lib/ai-scenarios/language-detection";

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
      "CRITICAL: Detect the language in the LATEST PLAYER MESSAGE and generate suggestions in THAT LANGUAGE ONLY.",
      "- Analyze the latest player message language: English, Malay (Bahasa Melayu), or Chinese.",
      "- Generate BOTH suggestions in the SAME language as the latest player message.",
      "- Ignore all previous conversation languages - only match the latest player message.",
      "- Never mix languages.",
      "",
      "Content requirements:",
      "- Option A (positive) should sound warm and empathetic while reinforcing healthy communication.",
      "- Option B (negative) should assert boundaries, surface concerns, or challenge unsafe pressure firmly yet respectfully.",
      "- Make each reply feel human and conversational, reference the NPC's latest message, and keep it under 160 characters.",
      "- Avoid stage directions or labels; deliver natural speech the player could genuinely use.",
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
            "You are a communication coach helping a player respond to a simulated conversation about healthy relationships. Provide contrasting response suggestions that respect safety and feel natural.",
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
