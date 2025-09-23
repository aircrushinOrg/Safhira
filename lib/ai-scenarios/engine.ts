import OpenAI from "openai";

export type ConversationRole = "player" | "npc";

export type ConversationTurn = {
  role: ConversationRole;
  content: string;
};

export type ScenarioDescriptor = {
  id: string;
  title?: string;
  setting?: string;
  learningObjectives?: string[];
  tensionLevel?: "low" | "medium" | "high";
  supportingFacts?: string[];
};

export type NpcProfile = {
  id: string;
  name: string;
  role: string;
  persona?: string;
  goals?: string[];
  tactics?: string[];
  boundaries?: string[];
};

export type SimulationResponsePayload = {
  npcReply: string;
  conversationComplete: boolean;
  conversationCompleteReason: string | null;
  summary: {
    riskLevel: "low" | "medium" | "high";
    keyRisks: string[];
    effectiveResponses: string[];
    coaching: string;
  } | null;
  score: {
    refusalEffectiveness: number;
    confidence: number;
    notes: string;
  } | null;
  finalReport: {
    overallAssessment: string;
    strengths: string[];
    areasForGrowth: string[];
    recommendedPractice: string[];
  } | null;
  safetyAlerts: string[];
  checkpoints: {
    totalPlayerTurns: number;
    summaryDue: boolean;
    assessmentDue: boolean;
  };
};

export const SUMMARY_INTERVAL = 3;

export const DEFAULT_MODEL =
  process.env.SCENARIO_MODEL_NAME ||
  process.env.SAFETY_SIM_MODEL ||
  process.env.OPENAI_MODEL ||
  "x-ai/grok-4-fast:free";

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function normaliseStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return `${item}`.trim();
    })
    .filter((item) => item.length > 0);
}

export function buildSystemPrompt(options: {
  scenario: ScenarioDescriptor;
  npc: NpcProfile;
  summaryDue: boolean;
  assessmentDue: boolean;
  allowAutoEnd: boolean;
  finalReportDue?: boolean;
  locale?: string;
}) {
  const {
    scenario,
    npc,
    summaryDue,
    assessmentDue,
    allowAutoEnd,
    finalReportDue = false,
    locale,
  } = options;

  const setting = scenario.setting || "a secondary school campus";
  const persona =
    npc.persona ||
    "A persuasive peer who attempts to nudge classmates toward unsafe or coercive intimate behaviour while staying within school context.";

  const goalLines = (npc.goals || [
    "Test the player's ability to recognise unhealthy sexual advances.",
    "Escalate pressure gradually while keeping the conversation realistic.",
  ])
    .map((goal) => `- ${goal}`)
    .join("\n");

  const tacticLines = (npc.tactics || [
    "Use flattery, social pressure, or misinformation about consent.",
    "Downplay risks and suggest secrecy or urgency.",
  ])
    .map((tactic) => `- ${tactic}`)
    .join("\n");

  const boundaryLines = (npc.boundaries || [
    "Never deliver explicit sexual descriptions or pornography.",
    "Avoid promoting illegal acts or age-inappropriate relationships.",
    "If the player expresses firm refusal multiple times, pivot toward reflective closure.",
  ])
    .map((rule) => `- ${rule}`)
    .join("\n");

  const learningLines = (scenario.learningObjectives || [
    "Identify manipulative or coercive tactics in social interactions.",
    "Practise delivering clear refusals and setting boundaries.",
    "Know when to seek help from trusted adults or resources.",
  ])
    .map((item) => `- ${item}`)
    .join("\n");

  const localeLine = locale
    ? `Use ${locale} language conventions. If unsure, default to plain international English.`
    : "Use accessible, empathetic English suitable for teens.";

  return `You are role-playing as ${npc.name}, ${npc.role}, inside the scenario "${
    scenario.title || scenario.id
  }" set in ${setting}. Stay in-character while following the educational intent described below.

NPC persona:
${persona}

Primary scenario learning objectives:
${learningLines}

NPC pressure goals:
${goalLines}

Preferred tactics:
${tacticLines}

Absolute boundaries:
${boundaryLines}

Interaction requirements:
- Respond naturally as ${npc.name} to the player's last message.
- Inject unhealthy or coercive undertones, but avoid explicit content and respect the boundaries.
- Encourage the player to practise refusal skills; react realistically when they resist.
- ${summaryDue ? "Provide a checkpoint summary and assessment in this turn." : "Do NOT include a summary this turn; set summary to null."}
- ${assessmentDue ? "Provide a refusal effectiveness score when instructed." : "Do NOT score this turn; set score to null."}
- ${finalReportDue ? "Produce a comprehensive final coaching report for the player." : "Do NOT include a final report this turn; set final_report to null."}
- ${
    allowAutoEnd
      ? "You may end the conversation if the learning objectives are met or the risk becomes too high."
      : "Do not end the conversation automatically; keep conversation_complete false unless the player explicitly exits."
  }
- Only produce a JSON object in your output with the exact schema provided. No markdown, no commentary.
- ${localeLine}

Safety overrides:
- If the player reports harm, escalate toward encouraging them to seek trusted adult help.
- If the player attempts to role-play illegal acts, refuse and steer back to safe guidance.`;
}

export function buildFormatInstruction(summaryDue: boolean, assessmentDue: boolean, finalReportDue: boolean) {
  return `Return a strict JSON object matching this TypeScript type. Omit no keys.
{
  "npc_reply": string; // in-character response for the player
  "conversation_complete": boolean;
  "conversation_complete_reason": string | null;
  "summary": ${summaryDue ? "{ riskLevel: 'low'|'medium'|'high'; keyRisks: string[]; effectiveResponses: string[]; coaching: string; }" : "null"};
  "score": ${assessmentDue ? "{ refusalEffectiveness: number; confidence: number; notes: string; }" : "null"};
  "final_report": ${finalReportDue ? "{ overallAssessment: string; strengths: string[]; areasForGrowth: string[]; recommendedPractice: string[]; }" : "null"};
  "safety_alerts": string[];
  "checkpoints": { totalPlayerTurns: number; summaryDue: boolean; assessmentDue: boolean; };
}
Numbers must be 0-100 with no extra text. Strings must not include markdown.
Ensure summary or score are null exactly when not required.`;
}

export function buildScenarioSnapshot(options: {
  scenario: ScenarioDescriptor;
  history: ConversationTurn[];
  summaryDue: boolean;
  assessmentDue: boolean;
  allowAutoEnd: boolean;
  finalReportDue?: boolean;
}) {
  const {
    scenario,
    history,
    summaryDue,
    assessmentDue,
    allowAutoEnd,
    finalReportDue = false,
  } = options;
  const supportingFacts = scenario.supportingFacts?.length
    ? `Supporting facts to stay consistent with: ${scenario.supportingFacts.join("; ")}.\n`
    : "";

  const latestTurns = history
    .slice(-8)
    .map((turn) => {
      const speaker = turn.role === "npc" ? "NPC" : "Player";
      return `${speaker}: ${turn.content}`;
    })
    .join("\n");

  return `Session controls:\n- Summary required this turn: ${summaryDue ? "YES" : "NO"}.\n- Assessment required this turn: ${assessmentDue ? "YES" : "NO"}.\n- Final report required this turn: ${finalReportDue ? "YES" : "NO"}.\n- Allow auto end: ${allowAutoEnd ? "YES" : "NO"}.\n${supportingFacts}\nRecent dialogue:\n${latestTurns}`;
}

export function toOpenAIMessages(params: {
  systemPrompt: string;
  formatInstruction: string;
  scenarioSnapshot: string;
  history: ConversationTurn[];
}): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const { systemPrompt, formatInstruction, scenarioSnapshot, history } = params;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "system", content: formatInstruction },
    { role: "user", content: scenarioSnapshot },
  ];

  history.forEach((turn) => {
    messages.push({
      role: turn.role === "npc" ? "assistant" : "user",
      content: turn.content,
    });
  });

  return messages;
}

export function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

export function normaliseRiskLevel(value: unknown): "low" | "medium" | "high" {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "low" || raw === "medium" || raw === "high") {
    return raw;
  }
  return "medium";
}

export function stripCodeFences(value: string): string {
  const fenced = value.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) {
    return fenced[1];
  }
  return value;
}

export function escapeLooseNewlines(value: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];

    if (inString && (char === "\n" || char === "\r")) {
      result += "\\n";
      if (char === "\r" && value[i + 1] === "\n") {
        i += 1;
      }
      escaped = false;
      continue;
    }

    result += char;

    if (char === "\\" && !escaped) {
      escaped = true;
      continue;
    }

    if (char === '"' && !escaped) {
      inString = !inString;
    }

    escaped = false;
  }

  return result;
}

export function parseModelResponse(raw: string | null | undefined): SimulationResponsePayload | null {
  if (!raw) return null;
  try {
    const cleaned = stripCodeFences(raw.trim());
    let parsed: any;

    try {
      parsed = JSON.parse(cleaned);
    } catch (jsonError) {
      parsed = JSON.parse(escapeLooseNewlines(cleaned));
    }
    if (!parsed || typeof parsed !== "object") return null;

    const npcReply = isNonEmptyString(parsed.npc_reply) ? parsed.npc_reply : null;
    const conversationComplete = Boolean(parsed.conversation_complete);
    const conversationCompleteReason = isNonEmptyString(parsed.conversation_complete_reason)
      ? parsed.conversation_complete_reason
      : null;

    const summary = parsed.summary && typeof parsed.summary === "object"
      ? {
          riskLevel: normaliseRiskLevel(parsed.summary.riskLevel),
          keyRisks: Array.isArray(parsed.summary.keyRisks)
            ? parsed.summary.keyRisks.map((item:any) => `${item}`).filter(isNonEmptyString)
            : [],
          effectiveResponses: Array.isArray(parsed.summary.effectiveResponses)
            ? parsed.summary.effectiveResponses.map((item:any) => `${item}`).filter(isNonEmptyString)
            : [],
          coaching: isNonEmptyString(parsed.summary.coaching) ? parsed.summary.coaching : "",
        }
      : null;

    const score = parsed.score && typeof parsed.score === "object"
      ? {
          refusalEffectiveness: clampScore(parsed.score.refusalEffectiveness),
          confidence: clampScore(parsed.score.confidence),
          notes: isNonEmptyString(parsed.score.notes) ? parsed.score.notes : "",
        }
      : null;

    const finalReport = parsed.final_report && typeof parsed.final_report === "object"
      ? {
          overallAssessment: isNonEmptyString(parsed.final_report.overallAssessment)
            ? parsed.final_report.overallAssessment
            : "",
          strengths: Array.isArray(parsed.final_report.strengths)
            ? parsed.final_report.strengths.map((item: unknown) => `${item}`).filter(isNonEmptyString)
            : [],
          areasForGrowth: Array.isArray(parsed.final_report.areasForGrowth)
            ? parsed.final_report.areasForGrowth.map((item: unknown) => `${item}`).filter(isNonEmptyString)
            : [],
          recommendedPractice: Array.isArray(parsed.final_report.recommendedPractice)
            ? parsed.final_report.recommendedPractice.map((item: unknown) => `${item}`).filter(isNonEmptyString)
            : [],
        }
      : null;

    const safetyAlerts = Array.isArray(parsed.safety_alerts)
      ? parsed.safety_alerts.map((item: unknown) => `${item}`).filter(isNonEmptyString)
      : [];

    const checkpoints = parsed.checkpoints && typeof parsed.checkpoints === "object"
      ? {
          totalPlayerTurns: Number(parsed.checkpoints.totalPlayerTurns ?? 0),
          summaryDue: Boolean(parsed.checkpoints.summaryDue),
          assessmentDue: Boolean(parsed.checkpoints.assessmentDue),
        }
      : { totalPlayerTurns: 0, summaryDue: false, assessmentDue: false };

    if (!npcReply) return null;

    return {
      npcReply,
      conversationComplete,
      conversationCompleteReason,
      summary,
      score,
      finalReport,
      safetyAlerts,
      checkpoints,
    };
  } catch (error) {
    console.error("Failed to parse scenario model response", error);
    return null;
  }
}
