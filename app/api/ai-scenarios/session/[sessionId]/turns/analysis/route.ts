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
  normaliseStringArray,
} from "@/lib/ai-scenarios/engine";

const ANALYSIS_MODEL = process.env.ANALYSIS_MODEL_NAME || DEFAULT_MODEL;

type ScoreAnalysisResult = {
  confidence: number;
  riskScore: number;
};

function normaliseScoreValue(raw: unknown, fallback: number): number {
  const asNumber = Number(raw);
  if (Number.isNaN(asNumber)) return fallback;
  return Math.max(0, Math.min(100, Math.round(asNumber)));
}

function parseScoreResponse(raw: string | null): ScoreAnalysisResult | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object") return null;

    const confidence = normaliseScoreValue((parsed as any).confidence, 50);
    const riskScore = normaliseScoreValue((parsed as any).riskScore, 50);

    return {
      confidence,
      riskScore,
    };
  } catch (error) {
    console.error("Failed to parse score response", error, raw);
    return null;
  }
}

function buildScorePrompts(options: {
  scenario: ScenarioDescriptor;
  history: ConversationTurn[];
  npc: NpcProfile;
  locale?: string;
}) {
  const { scenario, history, npc, locale } = options;

  const recentTurns = history.slice(-8);
  const transcript = recentTurns
    .map((turn, index) => {
      const speaker = turn.role === "npc" ? npc.name : "Player";
      return `${index + 1}. ${speaker}: ${turn.content}`;
    })
    .join("\n");

  const settingLine = scenario.setting ? `setting: ${scenario.setting}` : undefined;
  const objectivesLine = scenario.learningObjectives && scenario.learningObjectives.length > 0
    ? `objectives: ${scenario.learningObjectives.join(", ")}`
    : undefined;

  const systemPrompt = [
    "You are a concise evaluator scoring an STI risk role-play.",
    "Output only strict JSON with keys confidence and riskScore (0-100 integers).",
    "Use confidence to show certainty in the current player's skills.",
    "Use riskScore to reflect the player's current exposure to risky behaviour.",
    "Do not add explanations, prose, markdown, or extra keys.",
  ].join(" ");

  const userParts = [
    `scenario: ${scenario.title ?? scenario.id}`,
    settingLine,
    objectivesLine,
    locale ? `locale: ${locale}` : undefined,
    `npc persona: ${npc.persona ?? npc.role}`,
    "recent turns:",
    transcript || "(no conversation yet)",
  ].filter(Boolean);

  const userPrompt = userParts.join("\n");

  return {
    systemPrompt,
    userPrompt,
  };
}

async function runAnalysis(params: {
  client: OpenAI;
  baseRequest: Omit<Parameters<OpenAI["chat"]["completions"]["create"]>[0], "messages">;
  scenario: ScenarioDescriptor;
  npc: NpcProfile;
  history: ConversationTurn[];
  locale?: string;
  playerTurns: number;
  summaryDue: boolean;
}) {
  const { client, baseRequest, scenario, npc, history, locale, playerTurns, summaryDue } = params;

  const { systemPrompt, userPrompt } = buildScorePrompts({
    scenario,
    history,
    npc,
    locale,
  });

  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];

  let completion;
  try {
    completion = await client.chat.completions.create({
      ...baseRequest,
      messages,
      response_format: { type: "json_object" },
      stream: false,
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
      completion = await client.chat.completions.create({
        ...baseRequest,
        messages,
        stream: false,
      });
    } else {
      throw error;
    }
  }

  const rawContent = completion.choices?.[0]?.message?.content?.trim() ?? null;
  const parsed = parseScoreResponse(rawContent);
  if (!parsed) {
    return { response: null, raw: rawContent };
  }

  const latestNpcReply = [...history].reverse().find((turn) => turn.role === "npc")?.content ?? "";

  const responseBody: SimulationResponsePayload = {
    npcReply: latestNpcReply,
    conversationComplete: false,
    conversationCompleteReason: null,
    summary: null,
    score: {
      confidence: parsed.confidence,
      riskScore: parsed.riskScore,
      notes: "",
    },
    finalReport: null,
    safetyAlerts: [],
    checkpoints: {
      totalPlayerTurns: playerTurns,
      summaryDue,
      assessmentDue: summaryDue,
    },
  };

  return { response: responseBody, raw: rawContent };
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

    const body = await request.json().catch(() => ({}));
    const forceSummary = Boolean(body?.force);
    const allowAutoEndOverride = typeof body?.allowAutoEnd === "boolean" ? body.allowAutoEnd : undefined;
    const localeOverride =
      typeof body?.locale === "string" && body.locale.trim().length > 0
        ? body.locale.trim()
        : undefined;

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
      return NextResponse.json({ error: "No turns recorded for session" }, { status: 400 });
    }

    const history: ConversationTurn[] = turns.map((turn) => ({
      role: turn.role === "npc" ? "npc" : "player",
      content: turn.content,
    }));

    const playerTurns = history.filter((turn) => turn.role === "player").length;
    const scheduledSummaryDue = playerTurns > 0 && playerTurns % SUMMARY_INTERVAL === 0;
    const summaryDue = forceSummary || scheduledSummaryDue;

    if (!summaryDue) {
      return NextResponse.json({
        sessionId,
        skipped: true,
        reason: "Analysis not due",
        checkpoints: {
          totalPlayerTurns: playerTurns,
          summaryDue: scheduledSummaryDue,
          assessmentDue: scheduledSummaryDue,
        },
      });
    }

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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

  const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const baseRequest = {
      model: ANALYSIS_MODEL,
      temperature: 0.2,
    } as const;

    const { response, raw } = await runAnalysis({
      client,
      baseRequest,
      scenario: scenarioDescriptor,
      npc: npcProfile,
      history,
      locale: effectiveLocale,
      playerTurns,
      summaryDue,
    });

    if (!response) {
      return NextResponse.json({ error: "Model returned invalid analytics", raw }, { status: 502 });
    }

    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(aiScenarioSessions)
        .set({
          updatedAt: now,
          allowAutoEnd: effectiveAllowAutoEnd,
          locale: effectiveLocale ?? null,
          ...(response.score ? { lastScore: response.score.riskScore } : {}),
        })
        .where(eq(aiScenarioSessions.sessionId, sessionId));

      await tx
        .insert(aiScenarioResponses)
        .values({
          sessionId,
          playerTurnCount: playerTurns,
          summaryDue,
          assessmentDue: summaryDue,
          npcReply: response.npcReply,
          summary: response.summary,
          score: response.score,
          finalReport: response.finalReport,
          safetyAlerts: response.safetyAlerts,
          conversationComplete: response.conversationComplete,
          conversationCompleteReason: response.conversationCompleteReason,
          rawResponse: response,
        })
        .onConflictDoUpdate({
          target: [aiScenarioResponses.sessionId, aiScenarioResponses.playerTurnCount],
          set: {
            summaryDue,
            assessmentDue: summaryDue,
            npcReply: response.npcReply,
            summary: response.summary,
            score: response.score,
            finalReport: response.finalReport,
            safetyAlerts: response.safetyAlerts,
            conversationComplete: response.conversationComplete,
            conversationCompleteReason: response.conversationCompleteReason,
            rawResponse: response,
          },
        });
    });

    return NextResponse.json({
      sessionId,
      response,
      raw,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session/[id]/turns/analysis POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
