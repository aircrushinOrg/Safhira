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
  buildFormatInstruction,
  buildScenarioSnapshot,
  buildSystemPrompt,
  isNonEmptyString,
  normaliseStringArray,
  parseModelResponse,
  toOpenAIMessages,
} from "@/lib/ai-scenarios/engine";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
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

    return NextResponse.json({ sessionId, turns });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/turns GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
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
    const localeOverride = isNonEmptyString(body?.locale) ? body.locale.trim() : undefined;

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
    const finalReportDue = false;

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

    const effectiveAllowAutoEnd = allowAutoEndOverride ?? session.allowAutoEnd ?? true;
    const effectiveLocale = localeOverride ?? session.locale ?? undefined;

    const historyForModel: ConversationTurn[] = [
      ...history,
      { role: "player", content: playerMessageRaw },
    ];

    const systemPrompt = buildSystemPrompt({
      scenario: scenarioDescriptor,
      npc: npcProfile,
      summaryDue,
      assessmentDue,
      allowAutoEnd: effectiveAllowAutoEnd,
      finalReportDue,
      locale: effectiveLocale,
    });

    const formatInstruction = buildFormatInstruction(summaryDue, assessmentDue, finalReportDue);
    const scenarioSnapshot = buildScenarioSnapshot({
      scenario: scenarioDescriptor,
      history: historyForModel,
      summaryDue,
      assessmentDue,
      allowAutoEnd: effectiveAllowAutoEnd,
      finalReportDue,
    });

    const messages = toOpenAIMessages({
      systemPrompt,
      formatInstruction,
      scenarioSnapshot,
      history: historyForModel,
    });

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
      messages,
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    } as const;

    let completion;
    try {
      completion = await client.chat.completions.create({
        ...baseRequest,
        response_format: { type: "json_object" },
      });
    } catch (error) {
      const message =
        (typeof error === "object" && error && "message" in error && typeof (error as any).message === "string"
          ? (error as any).message
          : "") ||
        (typeof error === "object" && error && "error" in error && typeof (error as any).error?.message === "string"
          ? (error as any).error.message
          : "");

      if (/response_format/i.test(message)) {
        completion = await client.chat.completions.create(baseRequest);
      } else {
        throw error;
      }
    }

    const content = completion.choices?.[0]?.message?.content?.trim();
    const parsed = parseModelResponse(content);

    if (!parsed) {
      console.error("Scenario simulation returned unparsable content", content);
      return NextResponse.json({ error: "Model returned invalid response" }, { status: 502 });
    }

    const responseBody: SimulationResponsePayload = {
      npcReply: parsed.npcReply,
      conversationComplete: parsed.conversationComplete,
      conversationCompleteReason: parsed.conversationCompleteReason,
      summary: parsed.summary,
      score: parsed.score,
      finalReport: null,
      safetyAlerts: parsed.safetyAlerts,
      checkpoints: {
        totalPlayerTurns: playerTurns,
        summaryDue,
        assessmentDue,
      },
    };

    const now = new Date();

    const nextTurnIndex = turns.length ? turns[turns.length - 1].turnIndex + 1 : 0;
    const playerTurnIndex = nextTurnIndex;
    const npcTurnIndex = nextTurnIndex + 1;

    await db.transaction(async (tx) => {
      await tx
        .update(aiScenarioSessions)
        .set({
          updatedAt: now,
          allowAutoEnd: effectiveAllowAutoEnd,
          locale: effectiveLocale ?? null,
          ...(responseBody.summary ? { lastSummaryRisk: responseBody.summary.riskLevel } : {}),
          ...(responseBody.score ? { lastScore: responseBody.score.refusalEffectiveness } : {}),
          ...(responseBody.conversationComplete
            ? {
                completedAt: now,
                completionReason: responseBody.conversationCompleteReason ?? null,
              }
            : {}),
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
            content: responseBody.npcReply,
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
          npcReply: responseBody.npcReply,
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
            npcReply: responseBody.npcReply,
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

    return NextResponse.json({
      sessionId,
      npcTurnIndex,
      playerTurnIndex,
      response: responseBody,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/turns POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
