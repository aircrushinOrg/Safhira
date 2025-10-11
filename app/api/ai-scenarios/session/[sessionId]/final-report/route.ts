import OpenAI from "openai";
import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

import { db } from "@/app/db";
import { aiScenarioResponses, aiScenarioSessions, aiScenarioTurns } from "@/db/schema";
import {
  ConversationTurn,
  NpcProfile,
  ScenarioDescriptor,
  SimulationResponsePayload,
  buildFormatInstruction,
  buildScenarioSnapshot,
  buildSystemPrompt,
  isNonEmptyString,
  normaliseStringArray,
  parseModelResponse,
  REPORT_MODEL_NAME,
  toOpenAIMessages,
} from "@/lib/ai-scenarios/engine";

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
    } catch (error) {
      body = {};
    }

    const force = Boolean(body?.force);
    const completionReasonOverride = isNonEmptyString(body?.completionReason)
      ? body.completionReason.trim()
      : undefined;
    const localeOverride = isNonEmptyString(body?.locale) ? body.locale.trim() : undefined;

    const sessionRecords = await db
      .select()
      .from(aiScenarioSessions)
      .where(eq(aiScenarioSessions.sessionId, sessionId))
      .limit(1);

    if (sessionRecords.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionRecords[0];

    const latestResponseRecords = await db
      .select({
        playerTurnCount: aiScenarioResponses.playerTurnCount,
        conversationComplete: aiScenarioResponses.conversationComplete,
        conversationCompleteReason: aiScenarioResponses.conversationCompleteReason,
      })
      .from(aiScenarioResponses)
      .where(eq(aiScenarioResponses.sessionId, sessionId))
      .orderBy(desc(aiScenarioResponses.playerTurnCount))
      .limit(1);

    if (latestResponseRecords.length === 0) {
      return NextResponse.json({ error: "No turns recorded for this session" }, { status: 409 });
    }

    const latestResponse = latestResponseRecords[0];

    const conversationAlreadyComplete = Boolean(
      session.completedAt || latestResponse.conversationComplete
    );

    if (!conversationAlreadyComplete && !force) {
      return NextResponse.json(
        { error: "Conversation is still active. Pass force=true to override." },
        { status: 409 },
      );
    }

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
      return NextResponse.json({ error: "Cannot build report without any turns" }, { status: 409 });
    }

    const history: ConversationTurn[] = turns.map((turn) => ({
      role: turn.role === "npc" ? "npc" : "player",
      content: turn.content,
    }));

    const playerTurns = history.filter((turn) => turn.role === "player").length;

    const summaryDue = true;
    const assessmentDue = true;
    const finalReportDue = true;

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

    const effectiveLocale = localeOverride ?? session.locale ?? undefined;

    const systemPrompt = buildSystemPrompt({
      scenario: scenarioDescriptor,
      npc: npcProfile,
      summaryDue,
      assessmentDue,
      allowAutoEnd: true,
      finalReportDue,
      locale: effectiveLocale,
    });

    const formatInstruction = buildFormatInstruction(summaryDue, assessmentDue, finalReportDue);
    const scenarioSnapshot = buildScenarioSnapshot({
      scenario: scenarioDescriptor,
      history,
      summaryDue,
      assessmentDue,
      allowAutoEnd: true,
      finalReportDue,
    });

    const messages = toOpenAIMessages({
      systemPrompt,
      formatInstruction,
      scenarioSnapshot,
      history,
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
      model: REPORT_MODEL_NAME,
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    } as const;

    const createCompletion = async (chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) => {
      try {
        return await client.chat.completions.create({
          ...baseRequest,
          messages: chatMessages,
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
          return client.chat.completions.create({
            ...baseRequest,
            messages: chatMessages,
          });
        }

        throw error;
      }
    }

    let completion = await createCompletion(messages);
    let content = completion.choices?.[0]?.message?.content?.trim();
    let parsed = parseModelResponse(content);

    if (!parsed || !parsed.finalReport) {
      const reminderMessages = [
        ...messages,
        {
          role: "user" as const,
          content:
            "Reminder: respond with a JSON object where `final_report` is a non-null object containing `overallAssessment` (string), `strengths` (string[]), `areasForGrowth` (string[]), and `recommendedPractice` (string[]). Do not return null, markdown, or extra commentary.",
        },
      ];

      completion = await createCompletion(reminderMessages);
      content = completion.choices?.[0]?.message?.content?.trim();
      parsed = parseModelResponse(content);
    }

    if (!parsed || !parsed.finalReport) {
      console.error("Final report generation returned invalid payload", content);
      return NextResponse.json({ error: "Model failed to produce final report" }, { status: 502 });
    }

    const computedReason =
      completionReasonOverride ||
      parsed.conversationCompleteReason ||
      latestResponse.conversationCompleteReason ||
      session.completionReason ||
      (force ? "Player ended the conversation." : null);

    const checkpoints = parsed.checkpoints || {
      totalPlayerTurns: playerTurns,
      summaryDue,
      assessmentDue,
    };

    const responseBody: SimulationResponsePayload = {
      npcReply: parsed.npcReply,
      conversationComplete: true,
      conversationCompleteReason: computedReason,
      summary: parsed.summary,
      score: parsed.score,
      finalReport: parsed.finalReport,
      safetyAlerts: parsed.safetyAlerts,
      checkpoints: {
        totalPlayerTurns: checkpoints.totalPlayerTurns ?? playerTurns,
        summaryDue,
        assessmentDue,
      },
    };

    const now = new Date();
    const completionTimestamp = session.completedAt ?? now;

    await db.transaction(async (tx) => {
      await tx
        .update(aiScenarioSessions)
        .set({
          updatedAt: now,
          completedAt: completionTimestamp,
          completionReason: responseBody.conversationCompleteReason,
        })
        .where(eq(aiScenarioSessions.sessionId, sessionId));

      await tx
        .update(aiScenarioResponses)
        .set({
          summary: responseBody.summary,
          score: responseBody.score,
          finalReport: responseBody.finalReport,
          safetyAlerts: responseBody.safetyAlerts,
          conversationComplete: true,
          conversationCompleteReason: responseBody.conversationCompleteReason,
          rawResponse: responseBody,
        })
        .where(
          and(
            eq(aiScenarioResponses.sessionId, sessionId),
            eq(aiScenarioResponses.playerTurnCount, latestResponse.playerTurnCount),
          ),
        );
    });

    return NextResponse.json({
      sessionId,
      response: responseBody,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/final-report POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
