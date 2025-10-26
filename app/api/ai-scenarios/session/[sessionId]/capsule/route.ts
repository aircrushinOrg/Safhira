import OpenAI from "openai";
import { NextResponse } from "next/server";
import { eq, asc, desc } from "drizzle-orm";
import crypto from "crypto";

export const runtime = "nodejs";

import { db } from "@/app/db";
import {
  aiScenarioSessions,
  aiScenarioTurns,
  aiScenarioCapsules,
  aiScenarioSnippets,
  aiScenarioResponses,
} from "@/db/schema";
import { DEFAULT_MODEL } from "@/lib/ai-scenarios/engine";

function generateShareToken(): string {
  return crypto.randomBytes(32).toString("base64url");
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

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const expiryDays = body?.expiryDays || 30;

    const sessionRecords = await db
      .select()
      .from(aiScenarioSessions)
      .where(eq(aiScenarioSessions.sessionId, sessionId))
      .limit(1);

    if (sessionRecords.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionRecords[0];

    if (!session.completedAt) {
      return NextResponse.json({ error: "Session must be completed before creating capsule" }, { status: 409 });
    }

    const turns = await db
      .select()
      .from(aiScenarioTurns)
      .where(eq(aiScenarioTurns.sessionId, sessionId))
      .orderBy(asc(aiScenarioTurns.turnIndex));

    const snippets = await db
      .select()
      .from(aiScenarioSnippets)
      .where(eq(aiScenarioSnippets.sessionId, sessionId))
      .orderBy(asc(aiScenarioSnippets.turnIndex));

    const latestResponse = await db
      .select()
      .from(aiScenarioResponses)
      .where(eq(aiScenarioResponses.sessionId, sessionId))
      .orderBy(desc(aiScenarioResponses.playerTurnCount))
      .limit(1);

    const finalReport = latestResponse[0]?.finalReport as any;
    const score = latestResponse[0]?.score as any;

    if (!snippets || snippets.length === 0) {
      const snippetResponse = await fetch(
        `${request.url.replace(/\/capsule.*$/, "")}/snippets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!snippetResponse.ok) {
        console.error("Failed to auto-generate snippets");
      }
    }

    const snippetsAfterGen = await db
      .select()
      .from(aiScenarioSnippets)
      .where(eq(aiScenarioSnippets.sessionId, sessionId))
      .orderBy(asc(aiScenarioSnippets.turnIndex));

    const systemPrompt = `You are creating a narrative summary capsule for a completed conversation simulation session.

Session Details:
- Scenario: ${session.scenarioTitle || "Communication practice"}
- Setting: ${session.scenarioSetting || "Conversation scenario"}
- NPC: ${session.npcName} (${session.npcRole})
- Completion: ${session.completionReason || "Session completed"}

Your task: Create a story-like narrative that:
1. Explains why this scenario mattered
2. Highlights how the learner responded (use snippets and final report)
3. Acknowledges growth and areas for improvement
4. Ends with encouraging next steps

Write in a warm, coaching tone (2-3 paragraphs). Use second person ("you").

Also suggest 3 relevant next scenarios the learner should try, formatted as:
{
  "narrativeSummary": "<your narrative here>",
  "suggestedNextScenarios": [
    {
      "scenarioId": "<scenario-id>",
      "title": "<scenario title>",
      "reason": "<1 sentence why this is a good next step>"
    }
  ]
}`;

    const snippetSummary = snippetsAfterGen
      .map((s) => `- ${s.content}\n  → ${s.annotation}`)
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
      model: DEFAULT_MODEL,
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Create a narrative capsule for this session.

Key moments:
${snippetSummary}

Final Report:
${JSON.stringify(finalReport, null, 2)}

Risk Score: ${score?.riskScore || 50}/100
Confidence: ${score?.confidence || 50}/100`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "Failed to generate capsule narrative" }, { status: 502 });
    }

    const parsed = JSON.parse(content);

    const shareToken = generateShareToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const toneMetrics = score
      ? {
          confidence: score.confidence,
          riskScore: score.riskScore,
          notes: score.notes,
        }
      : null;

    await db.delete(aiScenarioCapsules).where(eq(aiScenarioCapsules.sessionId, sessionId));

    await db.insert(aiScenarioCapsules).values({
      sessionId,
      shareToken,
      narrativeSummary: parsed.narrativeSummary,
      suggestedNextScenarios: parsed.suggestedNextScenarios || [],
      toneMetrics,
      expiresAt,
    });

    const baseUrl = new URL(request.url).origin;
    const shareUrl = `${baseUrl}/simulator/capsule/${shareToken}`;

    return NextResponse.json({
      sessionId,
      shareToken,
      shareUrl,
      narrativeSummary: parsed.narrativeSummary,
      suggestedNextScenarios: parsed.suggestedNextScenarios,
      toneMetrics,
      expiresAt,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/capsule POST error", error);
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

    const capsules = await db
      .select()
      .from(aiScenarioCapsules)
      .where(eq(aiScenarioCapsules.sessionId, sessionId))
      .limit(1);

    if (capsules.length === 0) {
      return NextResponse.json({ error: "Capsule not found" }, { status: 404 });
    }

    const capsule = capsules[0];

    if (capsule.expiresAt && new Date() > capsule.expiresAt) {
      return NextResponse.json({ error: "Capsule has expired" }, { status: 410 });
    }

    const baseUrl = new URL(request.url).origin;
    const shareUrl = `${baseUrl}/simulator/capsule/${capsule.shareToken}`;

    return NextResponse.json({
      sessionId: capsule.sessionId,
      shareUrl,
      narrativeSummary: capsule.narrativeSummary,
      suggestedNextScenarios: capsule.suggestedNextScenarios,
      toneMetrics: capsule.toneMetrics,
      expiresAt: capsule.expiresAt,
      viewCount: capsule.viewCount,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/capsule GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
