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
  buildLocaleDirective,
  isNonEmptyString,
  normaliseStringArray,
  parseModelResponse,
  toOpenAIMessages,
} from "@/lib/ai-scenarios/engine";

const SUPPORTED_LOCALES = new Set(["en", "ms", "zh"]);
const HAN_CHARACTER_REGEX = /[\u3400-\u9FFF]/;
const MALAY_KEYWORDS = [
  "saya",
  "anda",
  "awak",
  "kamu",
  "kita",
  "kami",
  "tidak",
  "tak",
  "boleh",
  "kerana",
  "sebab",
  "bagaimana",
  "kenapa",
  "mengapa",
  "terima kasih",
  "tolong",
  "selamat",
  "harap",
  "maaf",
  "mungkin",
  "jangan",
  "akan",
  "perlu",
  "suka",
  "benci",
  "betul",
  "salah",
  "sangat",
];

function normaliseLocaleCode(raw: unknown): "en" | "ms" | "zh" | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return undefined;
  if (SUPPORTED_LOCALES.has(trimmed as "en" | "ms" | "zh")) {
    return trimmed as "en" | "ms" | "zh";
  }
  if (trimmed.startsWith("zh")) return "zh";
  if (trimmed.startsWith("ms") || trimmed.startsWith("id")) return "ms";
  if (trimmed.startsWith("en")) return "en";
  return undefined;
}

function detectLocaleFromMessage(message: string): "en" | "ms" | "zh" | undefined {
  const content = message.trim();
  if (!content) return undefined;

  if (HAN_CHARACTER_REGEX.test(content)) {
    return "zh";
  }

  const lower = content.toLowerCase();
  const hasMalayKeyword = MALAY_KEYWORDS.some((keyword) => lower.includes(keyword));
  if (hasMalayKeyword) {
    return "ms";
  }

  if (/[a-zA-Z]/.test(content)) {
    return "en";
  }

  return undefined;
}

function buildStreamingMessages(params: {
  scenario: ScenarioDescriptor;
  npc: NpcProfile;
  history: ConversationTurn[];
  playerMessage: string;
  locale?: string;
}) {
  const { scenario, npc, history, playerMessage, locale } = params;

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

  const languageDirective = buildLocaleDirective({
    locale,
    fallback: "Use approachable, empathetic English suitable for young adults.",
  });

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
- Reply in the same language as the player's latest message unless they clearly request a different language.
- ${languageDirective}`;

  const userPrompt = `Scenario setting: ${scenario.setting || "secondary school campus"}.
Here is the recent conversation:
${recentDialogue}

Respond as ${npc.name} to the player's latest message.`;

  return [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];
}

async function generateAnalysis(params: {
  client: OpenAI;
  baseRequest: Omit<Parameters<OpenAI["chat"]["completions"]["create"]>[0], "messages">;
  scenario: ScenarioDescriptor;
  npc: NpcProfile;
  history: ConversationTurn[];
  playerMessage: string;
  npcReply: string;
  summaryDue: boolean;
  assessmentDue: boolean;
  allowAutoEnd: boolean;
  finalReportDue: boolean;
  locale?: string;
}) {
  const {
    client,
    baseRequest,
    scenario,
    npc,
    history,
    playerMessage,
    npcReply,
    summaryDue,
    assessmentDue,
    allowAutoEnd,
    finalReportDue,
    locale,
  } = params;

  const historyWithNpc: ConversationTurn[] = [
    ...history,
    { role: "player", content: playerMessage },
    { role: "npc", content: npcReply },
  ];

  const systemPrompt = buildSystemPrompt({
    scenario,
    npc,
    summaryDue,
    assessmentDue,
    allowAutoEnd,
    finalReportDue,
    locale,
  });

  const formatInstruction = buildFormatInstruction(summaryDue, assessmentDue, finalReportDue);
  const scenarioSnapshot = buildScenarioSnapshot({
    scenario,
    history: historyWithNpc,
    summaryDue,
    assessmentDue,
    allowAutoEnd,
    finalReportDue,
  });

  const messages = toOpenAIMessages({
    systemPrompt,
    formatInstruction,
    scenarioSnapshot,
    history: historyWithNpc,
  });

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
  const parsed = parseModelResponse(rawContent);
  if (!parsed) {
    return { response: null, raw: rawContent };
  }

  return {
    response: {
      ...parsed,
      npcReply,
    },
    raw: rawContent,
  };
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

    const sessionLocale = normaliseLocaleCode(session.locale);

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

          const analysis = await generateAnalysis({
            client,
            baseRequest,
            scenario: scenarioDescriptor,
            npc: npcProfile,
            history,
            playerMessage: playerMessageRaw,
            npcReply,
            summaryDue,
            assessmentDue,
            allowAutoEnd: effectiveAllowAutoEnd,
            finalReportDue,
            locale: effectiveLocale,
          });

          if (!analysis.response) {
            sendEvent("error", { message: "Model returned invalid analytics", raw: analysis.raw });
            controller.close();
            return;
          }

          const responseBody: SimulationResponsePayload = {
            ...analysis.response,
            npcReply,
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
            raw: analysis.raw,
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
