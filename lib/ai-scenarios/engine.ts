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
    confidence: number;
    riskScore: number;
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
  "x-ai/grok-4-fast:free";

export const REPORT_MODEL_NAME = process.env.REPORT_MODEL_NAME || DEFAULT_MODEL;

const LOCALE_LANGUAGE_NAMES: Record<string, string> = {
  en: "natural, empathetic English",
  zh: "natural, empathetic Simplified Chinese",
  "zh-cn": "natural, empathetic Simplified Chinese",
  "zh-hans": "natural, empathetic Simplified Chinese",
  ms: "natural, empathetic Malay",
  "ms-my": "natural, empathetic Malay",
};

export function languageNameFromLocale(locale?: string): string | null {
  if (!locale || typeof locale !== "string") return null;
  const normalised = locale.trim().toLowerCase();
  if (!normalised) return null;
  if (LOCALE_LANGUAGE_NAMES[normalised]) {
    return LOCALE_LANGUAGE_NAMES[normalised];
  }

  const base = normalised.split("-")[0];
  return LOCALE_LANGUAGE_NAMES[base] ?? null;
}

export function getLanguageDisplayName(locale?: string): string {
  const languageName = languageNameFromLocale(locale);
  if (languageName) {
    if (languageName.includes("Chinese")) return "Simplified Chinese";
    if (languageName.includes("Malay")) return "Malay";
    return "English";
  }
  return "English"; // Default fallback
}

export function buildLocaleDirective(options: {
  locale?: string;
  fallback?: string;
  includeMirrorHint?: boolean;
}): string {
  const {
    locale,
    fallback = "Use approachable, empathetic English suitable for young adults.",
    includeMirrorHint = true,
  } = options;
  const languageName = languageNameFromLocale(locale);
  const mirrorHint = includeMirrorHint
    ? " Mirror the player's tone and switch languages gracefully if the player does."
    : "";
  if (languageName) {
    return `Use ${languageName}.${mirrorHint}`.trim();
  }
  return `${fallback}${mirrorHint}`.trim();
}

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

  const localeLine = buildLocaleDirective({
    locale,
    fallback: "Use accessible, empathetic English suitable for teens.",
  });

  const scoringGuidance = assessmentDue ? `

RISK SCORING FRAMEWORK (when assessment is required):
Evaluate the player's responses across these dimensions and calculate a riskScore (0-100):

1. RECOGNITION OF MANIPULATION (0-25 points):
   - 0-8: Failed to identify any manipulative tactics; accepted coercive framing
   - 9-16: Showed some awareness but didn't name specific tactics
   - 17-25: Clearly identified manipulation (flattery, pressure, misinformation, etc.)

2. BOUNDARY SETTING (0-30 points):
   - 0-10: Agreed to risky behavior; no boundaries set
   - 11-20: Hesitant or unclear boundaries; gave mixed signals
   - 21-30: Firm, clear, direct refusal or boundary statement

3. COMMUNICATION EFFECTIVENESS (0-25 points):
   - 0-8: Apologetic, vague, or people-pleasing responses
   - 9-16: Somewhat clear but lacked confidence or directness
   - 17-25: Assertive, confident, and unambiguous communication

4. SAFETY AWARENESS & HELP-SEEKING (0-20 points):
   - 0-6: No mention of seeking help or involving trusted adults
   - 7-13: Acknowledged need for support but didn't commit to action
   - 14-20: Actively mentioned seeking help, telling trusted adults, or leaving situation

RISK SCORE CALCULATION:
- Add points from all four dimensions (total possible: 100)
- CRITICAL: The riskScore reflects the player's RISK EXPOSURE, so INVERT the total:
  riskScore = 100 - (total points earned)
- Result interpretation:
  * 0-30: LOW RISK - Player demonstrated strong refusal skills and safety awareness
  * 31-60: MEDIUM RISK - Player showed some skills but has gaps in protection
  * 61-100: HIGH RISK - Player is vulnerable; failed to set boundaries or recognize danger

CONFIDENCE SCORE (0-100):
Base confidence on:
- Clarity of player's responses (clear intent = higher confidence)
- Consistency across conversation turns (consistent = higher confidence)
- Length of conversation history (more turns = higher confidence)
- Ambiguity or contradictions (reduce confidence accordingly)

NOTES FIELD:
Provide 2-3 sentences explaining:
- Which specific dimension(s) drove the score
- Concrete examples from player's recent responses
- What the player did well or needs to improve` : "";

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
- ${assessmentDue ? "Provide a refusal effectiveness score using the detailed scoring framework below." : "Do NOT score this turn; set score to null."}
- ${
    finalReportDue
      ? `Produce a comprehensive final coaching report (multi-paragraph overview plus targeted action items). Tie insights to specific player choices. IMPORTANT: Write the final report in ${getLanguageDisplayName(locale)}.`
      : "Do NOT include a final report this turn; set final_report to null."
  }
- CRITICAL: Any safety_alerts must be generated in ${getLanguageDisplayName(locale)}. All safety communications must be in this language.
- ${
    allowAutoEnd
      ? "You may end the conversation if the learning objectives are met or the risk becomes too high."
      : "Do not end the conversation automatically; keep conversation_complete false unless the player explicitly exits."
  }
- Only produce a JSON object in your output with the exact schema provided. No markdown, no commentary.
- ${localeLine}
${scoringGuidance}

Safety overrides:
- If the player reports harm, escalate toward encouraging them to seek trusted adult help.
- If the player attempts to role-play illegal acts, refuse and steer back to safe guidance.`;
}

export function buildFormatInstruction(summaryDue: boolean, assessmentDue: boolean, finalReportDue: boolean, locale?: string) {
  const languageName = getLanguageDisplayName(locale);

  const finalReportLanguageNote = finalReportDue
    ? `\n\nCRITICAL: Generate the ENTIRE final_report (overallAssessment, strengths, areasForGrowth, and recommendedPractice) in ${languageName}. Write all content in this language consistently.`
    : "";

  const safetyAlertsLanguageNote = `\n\nIMPORTANT: Generate ALL safety_alerts in ${languageName}. All safety communications must be written in this language for user comprehension.`;

  const scoreGuidance = assessmentDue ? `

SCORING FIELD REQUIREMENTS:
- confidence (0-100): How certain you are about this assessment based on response clarity and conversation length
- riskScore (0-100): INVERTED score where higher = more vulnerable (use framework above: 100 - total_points_earned)
- notes: 2-3 complete sentences citing specific player statements and explaining the score rationale

EXAMPLE SCORING:
Good example: { "confidence": 85, "riskScore": 45, "notes": "Player clearly identified the pressure tactic ('You're using urgency to push me') earning high marks for recognition. However, their boundary was hesitant ('Maybe we should wait?') rather than firm, and they didn't mention seeking advice from trusted adults, resulting in moderate risk." }

Bad example: { "confidence": 50, "riskScore": 60, "notes": "Not great." } // TOO VAGUE - must cite specific evidence` : "";

  return `Return a strict JSON object matching this TypeScript type. Omit no keys.
{
  "npc_reply": string; // in-character response for the player
  "conversation_complete": boolean;
  "conversation_complete_reason": string | null;
  "summary": ${summaryDue ? "{ riskLevel: 'low'|'medium'|'high'; keyRisks: string[]; effectiveResponses: string[]; coaching: string; }" : "null"};
  "score": ${assessmentDue ? "{ confidence: number; riskScore: number; notes: string; }" : "null"};
  "final_report": ${finalReportDue ? "{ overallAssessment: string; strengths: string[]; areasForGrowth: string[]; recommendedPractice: string[]; }" : "null"};
  "safety_alerts": string[]; // CRITICAL: Generate in ${languageName}
  "checkpoints": { totalPlayerTurns: number; summaryDue: boolean; assessmentDue: boolean; };
}
Numbers must be 0-100 with no extra text. Strings must not include markdown.
Ensure summary or score are null exactly when not required.
When final_report is required, write a 4-6 sentence overallAssessment that references concrete dialogue moments.
Include at least three rich bullet points in strengths, areasForGrowth, and recommendedPractice, each focusing on actionable guidance.${scoreGuidance}${finalReportLanguageNote}${safetyAlertsLanguageNote}`;
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
          confidence: clampScore(parsed.score.confidence),
          riskScore: clampScore(parsed.score.riskScore),
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
