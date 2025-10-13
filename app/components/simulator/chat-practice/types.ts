export type ChatTemplate = {
  scenarioId: string;
  scenarioTitle: string;
  scenarioLabel: string;
  scenarioDescription: string;
  setting: string;
  learningObjectives: string[];
  supportingFacts: string[];
  npcId: string;
  npcName: string;
  npcRole: string;
  npcPersona: string;
  npcGoals: string[];
  npcTactics: string[];
  npcBoundaries: string[];
};

export type ConversationRole = 'player' | 'npc';

export type ConversationTurn = {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: string;
};

export type ApiSummary = {
  riskLevel: 'low' | 'medium' | 'high';
  keyRisks: string[];
  effectiveResponses: string[];
  coaching: string;
} | null;

export type ApiScore = {
  confidence: number;
  riskScore: number;
  notes: string;
} | null;

export type ApiFinalReport = {
  overallAssessment: string;
  strengths: string[];
  areasForGrowth: string[];
  recommendedPractice: string[];
} | null;

export type ApiResponsePayload = {
  npcReply: string;
  conversationComplete: boolean;
  conversationCompleteReason: string | null;
  summary: ApiSummary;
  score: ApiScore;
  finalReport: ApiFinalReport;
  checkpoints: {
    totalPlayerTurns: number;
    summaryDue: boolean;
    assessmentDue: boolean;
  };
};

export type SuggestedQuestions = {
  positive: string;
  negative: string;
};

export type SuggestedQuestionsApiResponse = {
  sessionId: string;
  npcTurnIndex: number;
  suggestions: SuggestedQuestions;
};

export type FinalReportApiResponse = {
  sessionId: string;
  response: ApiResponsePayload;
};

export type StreamResponsePayload = {
  npcReply: string;
  conversationComplete?: boolean;
  conversationCompleteReason?: string | null;
  summary?: ApiSummary | null;
  score?: ApiScore | null;
  finalReport?: ApiFinalReport | null;
  safetyAlerts?: string[];
  checkpoints: {
    totalPlayerTurns: number;
    summaryDue: boolean;
    assessmentDue: boolean;
  };
};

export type StreamFinalEvent = {
  sessionId: string;
  playerTurnIndex: number;
  npcTurnIndex: number;
  response: StreamResponsePayload;
  raw?: string | null;
  analysisDue?: boolean;
};

export type AnalysisApiResponse = {
  sessionId: string;
  response: ApiResponsePayload;
  raw?: string | null;
};

export type AnalysisSkipResponse = {
  sessionId: string;
  skipped: true;
  reason?: string;
  checkpoints?: StreamResponsePayload['checkpoints'];
};
