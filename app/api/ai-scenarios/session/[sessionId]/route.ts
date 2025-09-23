import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

export const runtime = "nodejs";

import { db } from "@/app/db";
import { aiScenarioResponses, aiScenarioSessions, aiScenarioTurns } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const sessionRecord = await db
      .select()
      .from(aiScenarioSessions)
      .where(eq(aiScenarioSessions.sessionId, sessionId))
      .limit(1);

    if (sessionRecord.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const turns = await db
      .select({
        turnIndex: aiScenarioTurns.turnIndex,
        role: aiScenarioTurns.role,
        content: aiScenarioTurns.content,
        createdAt: aiScenarioTurns.createdAt,
      })
      .from(aiScenarioTurns)
      .where(eq(aiScenarioTurns.sessionId, sessionId))
      .orderBy(asc(aiScenarioTurns.turnIndex));

    const responses = await db
      .select({
        playerTurnCount: aiScenarioResponses.playerTurnCount,
        summaryDue: aiScenarioResponses.summaryDue,
        assessmentDue: aiScenarioResponses.assessmentDue,
        npcReply: aiScenarioResponses.npcReply,
        summary: aiScenarioResponses.summary,
        score: aiScenarioResponses.score,
        finalReport: aiScenarioResponses.finalReport,
        safetyAlerts: aiScenarioResponses.safetyAlerts,
        conversationComplete: aiScenarioResponses.conversationComplete,
        conversationCompleteReason: aiScenarioResponses.conversationCompleteReason,
        rawResponse: aiScenarioResponses.rawResponse,
        createdAt: aiScenarioResponses.createdAt,
      })
      .from(aiScenarioResponses)
      .where(eq(aiScenarioResponses.sessionId, sessionId))
      .orderBy(asc(aiScenarioResponses.playerTurnCount));

    const latestResponse = responses.length
      ? responses[responses.length - 1]
      : null;

    return NextResponse.json({
      session: sessionRecord[0],
      turns,
      responses,
      latestResponse,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
