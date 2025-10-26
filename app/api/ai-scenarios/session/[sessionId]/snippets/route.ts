import OpenAI from "openai";
import { NextResponse } from "next/server";
import { eq, and, asc } from "drizzle-orm";

export const runtime = "nodejs";

import { db } from "@/app/db";
import { aiScenarioSessions, aiScenarioTurns, aiScenarioSnippets, aiScenarioResponses } from "@/db/schema";
import { REPORT_MODEL_NAME } from "@/lib/ai-scenarios/engine";

type SnippetData = {
  turnIndex: number;
  role: string;
  content: string;
  annotation: string;
  impactReason: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
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

    if (turns.length === 0) {
      return NextResponse.json({ error: "No turns found for this session" }, { status: 404 });
    }

    const latestResponseRecords = await db
      .select({
        finalReport: aiScenarioResponses.finalReport,
        score: aiScenarioResponses.score,
      })
      .from(aiScenarioResponses)
      .where(eq(aiScenarioResponses.sessionId, sessionId))
      .orderBy(asc(aiScenarioResponses.playerTurnCount))
      .limit(1);

    const finalReport = latestResponseRecords[0]?.finalReport as any;
    const score = latestResponseRecords[0]?.score as any;

    const conversationText = turns
      .map((turn) => `${turn.role === "player" ? "Player" : session.npcName}: ${turn.content}`)
      .join("\n");

    const systemPrompt = `You are analyzing a conversation simulation where a player practiced navigating a sensitive scenario about sexual health and boundaries.

Scenario: ${session.scenarioTitle || "Communication practice"}
Setting: ${session.scenarioSetting || "Conversation scenario"}
NPC Role: ${session.npcRole}

Your task: Identify 3-5 impactful dialogue turns from the player's responses and provide annotations that highlight why these moments mattered.

Focus on turns where the player:
- Clearly validated consent or boundaries
- Showed empathy and active listening
- Corrected misinformation effectively
- Navigated a difficult moment with care
- Made a risky choice that needs coaching
- Demonstrated growth or learning

Format your response as JSON with an array of snippets:
{
  "snippets": [
    {
      "turnIndex": <number>,
      "role": "player",
      "content": "<exact player message>",
      "annotation": "<2-3 sentence explanation of why this moment matters>",
      "impactReason": "<brief label: e.g., 'validated consent', 'showed empathy', 'missed boundary cue'>"
    }
  ]
}

${finalReport ? `\nFinal Report Context:\n${JSON.stringify(finalReport, null, 2)}` : ""}
${score ? `\nRisk Score: ${score.riskScore}/100` : ""}`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const completion = await client.chat.completions.create({
      model: REPORT_MODEL_NAME,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this conversation and identify impactful moments:\n\n${conversationText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "Failed to generate snippets" }, { status: 502 });
    }

    const parsed = JSON.parse(content);
    const snippets = parsed.snippets as SnippetData[];

    if (!Array.isArray(snippets) || snippets.length === 0) {
      return NextResponse.json({ error: "No snippets generated" }, { status: 502 });
    }

    await db.delete(aiScenarioSnippets).where(eq(aiScenarioSnippets.sessionId, sessionId));

    for (const snippet of snippets) {
      await db.insert(aiScenarioSnippets).values({
        sessionId,
        turnIndex: snippet.turnIndex,
        role: snippet.role,
        content: snippet.content,
        annotation: snippet.annotation,
        impactReason: snippet.impactReason,
      });
    }

    return NextResponse.json({
      sessionId,
      snippets,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/snippets POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const snippets = await db
      .select()
      .from(aiScenarioSnippets)
      .where(eq(aiScenarioSnippets.sessionId, sessionId))
      .orderBy(asc(aiScenarioSnippets.turnIndex));

    return NextResponse.json({
      sessionId,
      snippets,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/snippets GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
