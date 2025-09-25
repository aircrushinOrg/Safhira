'use client'

import { useState } from 'react';
import type { ChangeEvent } from 'react';

type ConversationRole = 'player' | 'npc';

type ConversationTurn = {
  role: ConversationRole;
  content: string;
};

type ApiSummary = {
  riskLevel: 'low' | 'medium' | 'high';
  keyRisks: string[];
  effectiveResponses: string[];
  coaching: string;
} | null;

type ApiScore = {
  refusalEffectiveness: number;
  confidence: number;
  notes: string;
} | null;

type ApiFinalReport = {
  overallAssessment: string;
  strengths: string[];
  areasForGrowth: string[];
  recommendedPractice: string[];
} | null;

type ApiResponsePayload = {
  npcReply: string;
  conversationComplete: boolean;
  conversationCompleteReason: string | null;
  summary: ApiSummary;
  score: ApiScore;
  finalReport: ApiFinalReport;
  safetyAlerts: string[];
  checkpoints: {
    totalPlayerTurns: number;
    summaryDue: boolean;
    assessmentDue: boolean;
  };
};

type TurnApiResponse = {
  sessionId: string;
  playerTurnIndex: number;
  npcTurnIndex: number;
  response: ApiResponsePayload;
};

type FinalReportApiResponse = {
  sessionId: string;
  response: ApiResponsePayload;
};

type ScenarioFormState = {
  id: string;
  title: string;
  setting: string;
  learningObjectives: string;
  supportingFacts: string;
};

type NpcFormState = {
  id: string;
  name: string;
  role: string;
  persona: string;
  goals: string;
  tactics: string;
  boundaries: string;
};

type ScenarioTemplate = {
  id: string;
  label: string;
  description: string;
  scenario: ScenarioFormState;
  npc: NpcFormState;
};

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'after-school-hallway',
    label: 'Hallway peer pressure (secondary school)',
    description: 'Practise firm refusals when a popular peer pushes to break agreed boundaries after class.',
    scenario: {
      id: 'after-school-hallway',
      title: 'Hallway Pressure',
      setting: 'School hallway after class',
      learningObjectives: 'Recognise manipulative compliments\nPractise firm but respectful refusals\nEscalate to a trusted adult when needed',
      supportingFacts: 'You have to catch the late bus home\nYour parents expect you back by 6pm',
    },
    npc: {
      id: 'upperclassman-01',
      name: 'Ken',
      role: 'Senior athlete',
      persona: 'Confident, popular senior who feels entitled to attention',
      goals: 'Convince the player to break school conduct rules\nKeep the talk secret from adults',
      tactics: 'Flattery and social status pressure\nPromises of popularity boosts',
      boundaries: 'No explicit sexual descriptions\nNo illegal behaviour promotion\nRespect firm refusals after multiple attempts',
    },
  },
  {
    id: 'clinic-screening-request',
    label: 'Clinic visit (requesting STI screening)',
    description: 'Role-play asking a healthcare provider for confidential STI testing and follow-up advice.',
    scenario: {
      id: 'clinic-screening-request',
      title: 'Clinic Screening Request',
      setting: 'Community sexual health clinic intake room',
      learningObjectives: 'Ask for STI screening despite nerves\nClarify confidentiality and support options\nPlan follow-up steps after results',
      supportingFacts: 'You had unprotected sex with a new partner last month\nYou have another class after this appointment',
    },
    npc: {
      id: 'nurse-practitioner-jamie',
      name: 'Jamie',
      role: 'Nurse practitioner',
      persona: 'Warm clinician balancing empathy with a tight schedule',
      goals: 'Understand the player\'s risk history\nProvide accurate testing information\nEncourage safer sex resources and follow-up',
      tactics: 'Ask open-ended questions to build rapport\nOffer reassurance about confidentiality\nSuggest practical next steps',
      boundaries: 'Maintain professional tone\nAvoid giving diagnoses without assessment\nKeep language supportive and non-judgmental',
    },
  },
  {
    id: 'college-party-boundaries',
    label: 'College party (negotiating condom use)',
    description: 'Practise negotiating condom use with a romantic interest in a high-energy party setting.',
    scenario: {
      id: 'college-party-boundaries',
      title: 'Party Boundaries',
      setting: 'College house party after midnight',
      learningObjectives: 'Negotiate condom use in the moment\nSet boundaries when a partner pushes for unprotected sex\nUse refusal skills while keeping the vibe respectful',
      supportingFacts: 'You and Alex have been flirting all night\nMusic is loud and friends are nearby but not listening in',
    },
    npc: {
      id: 'romantic-interest-alex',
      name: 'Alex',
      role: 'Classmate and crush',
      persona: 'Charming, excited, and dismissive of perceived risk',
      goals: 'Convince the player to have unprotected sex tonight\nKeep the moment feeling spontaneous and carefree',
      tactics: 'Compliments and minimising STI risks\nSuggesting it will feel better without protection\nAppealing to trust and chemistry',
      boundaries: 'No coercive or violent language\nKeep dialogue PG-13\nRespect a firm refusal after repeated attempts',
    },
  },
];

const CUSTOM_TEMPLATE_ID = 'custom';
const DEFAULT_TEMPLATE = SCENARIO_TEMPLATES[0];
const DEFAULT_TEMPLATE_ID = DEFAULT_TEMPLATE.id;
const DEFAULT_SCENARIO: ScenarioFormState = { ...DEFAULT_TEMPLATE.scenario };
const DEFAULT_NPC: NpcFormState = { ...DEFAULT_TEMPLATE.npc };

const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/ai-scenarios/session',
    description: 'Create a new AI coaching session using the current scenario and NPC configuration.',
  },
  {
    method: 'POST',
    path: '/api/ai-scenarios/session/:sessionId/turns',
    description: 'Send a player message and receive the NPC reply plus mid-conversation analytics.',
  },
  {
    method: 'POST',
    path: '/api/ai-scenarios/session/:sessionId/final-report',
    description: 'Request the end-of-session report, including final summary, score, and safety alerts.',
  },
] as const;

function splitInput(value: string): string[] {
  return value
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildScenarioPayload(form: ScenarioFormState) {
  return {
    id: form.id.trim() || 'scenario-placeholder',
    title: form.title.trim() || undefined,
    setting: form.setting.trim() || undefined,
    learningObjectives: splitInput(form.learningObjectives),
    supportingFacts: splitInput(form.supportingFacts),
  };
}

function buildNpcPayload(form: NpcFormState) {
  return {
    id: form.id.trim() || 'npc-placeholder',
    name: form.name.trim() || 'NPC',
    role: form.role.trim() || 'Peer',
    persona: form.persona.trim() || undefined,
    goals: splitInput(form.goals),
    tactics: splitInput(form.tactics),
    boundaries: splitInput(form.boundaries),
  };
}

export default function AiScenarioTesterPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [scenarioForm, setScenarioForm] = useState<ScenarioFormState>(DEFAULT_SCENARIO);
  const [npcForm, setNpcForm] = useState<NpcFormState>(DEFAULT_NPC);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [allowAutoEnd, setAllowAutoEnd] = useState(true);
  const [forceSummary, setForceSummary] = useState(false);
  const [forceAssessment, setForceAssessment] = useState(false);
  const [locale, setLocale] = useState('en');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ApiSummary>(null);
  const [score, setScore] = useState<ApiScore>(null);
  const [finalReport, setFinalReport] = useState<ApiFinalReport>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<string[]>([]);
  const [completeReason, setCompleteReason] = useState<string | null>(null);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [checkpoints, setCheckpoints] = useState({
    totalPlayerTurns: 0,
    summaryDue: false,
    assessmentDue: false,
  });
  const [lastRawResponse, setLastRawResponse] = useState<string | null>(null);
  const [lastRawError, setLastRawError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const selectedTemplate =
    selectedTemplateId === CUSTOM_TEMPLATE_ID
      ? null
      : SCENARIO_TEMPLATES.find((template) => template.id === selectedTemplateId) ?? null;
  const trimmedDraft = draft.trim();
  const hasSession = Boolean(sessionId);
  const canSend = trimmedDraft.length > 0 && !loading && !conversationComplete;
  const conversationBusy = loading || finalizing;
  const sessionStatusLabel = conversationComplete
    ? 'Complete'
    : hasSession
      ? 'In progress'
      : 'Not started';
  const sessionStatusClassName =
    sessionStatusLabel === 'Complete'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
      : sessionStatusLabel === 'In progress'
        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200'
        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  const processingText = loading
    ? 'Awaiting NPC response…'
    : finalizing
      ? 'Generating final report…'
      : '';
  const messageErrorId = error ? 'player-message-error' : undefined;

  function handleTemplateSelect(event: ChangeEvent<HTMLSelectElement>) {
    const nextId = event.target.value;
    setSelectedTemplateId(nextId);

    if (nextId === CUSTOM_TEMPLATE_ID) {
      return;
    }

    const template = SCENARIO_TEMPLATES.find((item) => item.id === nextId);
    if (!template) {
      return;
    }

    setScenarioForm({ ...template.scenario });
    setNpcForm({ ...template.npc });
  }

  function handleScenarioFieldChange(field: keyof ScenarioFormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (selectedTemplateId !== CUSTOM_TEMPLATE_ID) {
        setSelectedTemplateId(CUSTOM_TEMPLATE_ID);
      }
      const { value } = event.target;
      setScenarioForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  function handleNpcFieldChange(field: keyof NpcFormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (selectedTemplateId !== CUSTOM_TEMPLATE_ID) {
        setSelectedTemplateId(CUSTOM_TEMPLATE_ID);
      }
      const { value } = event.target;
      setNpcForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function ensureSession() {
    if (sessionId) return sessionId;

    const scenarioPayload = buildScenarioPayload(scenarioForm);
    const npcPayload = buildNpcPayload(npcForm);
    const trimmedLocale = locale.trim();

    const response = await fetch('/api/ai-scenarios/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: scenarioPayload,
        npc: npcPayload,
        allowAutoEnd,
        locale: trimmedLocale.length > 0 ? trimmedLocale : undefined,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    try {
      const data = JSON.parse(text) as { sessionId: string };
      if (!data?.sessionId) {
        throw new Error('Missing sessionId in response');
      }
      setSessionId(data.sessionId);
      return data.sessionId;
    } catch (parseError) {
      throw new Error('Failed to parse session response JSON');
    }
  }

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setLastRawResponse(null);
    setLastRawError(null);

    let appendedPlayerMessage = false;

    try {
      const activeSessionId = await ensureSession();

      setHistory((prev) => [...prev, { role: 'player', content: trimmed }]);
      appendedPlayerMessage = true;
      setDraft('');

      const response = await fetch(`/api/ai-scenarios/session/${activeSessionId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerMessage: trimmed,
          forceSummary,
          forceAssessment,
          allowAutoEnd,
          locale: locale.trim() || undefined,
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        setLastRawError(rawText);
        throw new Error(rawText || `Request failed with status ${response.status}`);
      }

      setLastRawResponse(rawText);

      let data: TurnApiResponse;
      try {
        data = JSON.parse(rawText) as TurnApiResponse;
      } catch (parseError) {
        setLastRawError(rawText);
        throw new Error('Failed to parse response JSON');
      }

      setSessionId(data.sessionId);

      setHistory((prev) => [...prev, { role: 'npc', content: data.response.npcReply }]);
      setSummary(data.response.summary);
      setScore(data.response.score);
      setFinalReport(data.response.finalReport);
      setSafetyAlerts(data.response.safetyAlerts || []);
      setCheckpoints(data.response.checkpoints);
      setConversationComplete(data.response.conversationComplete);
      setCompleteReason(data.response.conversationCompleteReason);

      if (data.response.conversationComplete) {
        await fetchFinalReport({
          force: false,
          reason: data.response.conversationCompleteReason ?? undefined,
          sessionOverride: data.sessionId,
        });
      }
    } catch (err) {
      console.error('AI scenario tester error', err);
      if (appendedPlayerMessage) {
        setHistory((prev) => prev.slice(0, -1));
      }
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchFinalReport(options: {
    force: boolean;
    reason?: string;
    sessionOverride?: string;
  }) {
    const activeSessionId = options.sessionOverride ?? sessionId;
    if (!activeSessionId || finalizing) return;

    try {
      setFinalizing(true);
      setError(null);

      const response = await fetch(`/api/ai-scenarios/session/${activeSessionId}/final-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force: options.force,
          completionReason: options.reason,
          locale: locale.trim() || undefined,
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        setLastRawError(rawText);
        throw new Error(rawText || `Final report failed with status ${response.status}`);
      }

      setLastRawResponse(rawText);

      let data: FinalReportApiResponse;
      try {
        data = JSON.parse(rawText) as FinalReportApiResponse;
      } catch (parseError) {
        setLastRawError(rawText);
        throw new Error('Failed to parse final report JSON');
      }

      setSessionId(data.sessionId);
      setSummary(data.response.summary);
      setScore(data.response.score);
      setFinalReport(data.response.finalReport);
      setSafetyAlerts(data.response.safetyAlerts || []);
      setCheckpoints(data.response.checkpoints);
      setConversationComplete(true);
      setCompleteReason(data.response.conversationCompleteReason);

      if (data.response.npcReply) {
        setHistory((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            if (last.role === 'npc' && last.content === data.response.npcReply) {
              return prev;
            }
          }
          return [...prev, { role: 'npc', content: data.response.npcReply }];
        });
      }
    } catch (err) {
      console.error('Final report error', err);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setFinalizing(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleReset() {
    setHistory([]);
    setDraft('');
    setSummary(null);
    setScore(null);
    setFinalReport(null);
    setSafetyAlerts([]);
    setConversationComplete(false);
    setCompleteReason(null);
    setCheckpoints({ totalPlayerTurns: 0, summaryDue: false, assessmentDue: false });
    setError(null);
    setLastRawResponse(null);
    setLastRawError(null);
    setSessionId(null);
    setFinalizing(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 text-slate-900 dark:text-slate-100">
        <header className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">AI Scenario Testerssss</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Configure a scenario, chat as the player, and inspect summaries, scores, and safety alerts returned
              by <code className="rounded bg-slate-200 px-1 py-0.5 dark:bg-slate-800 dark:text-slate-200">/api/ai-scenarios</code>.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className={`rounded-full px-3 py-1 font-medium ${sessionStatusClassName}`}>
                Status: {sessionStatusLabel}
              </span>
              {conversationBusy && (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {processingText}
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Session ID:{' '}
                <code className="text-[11px] text-slate-900 dark:text-slate-100">{sessionId ?? '—'}</code>
              </span>
              <span>
                Player turns: {checkpoints.totalPlayerTurns} · Summary due: {checkpoints.summaryDue ? 'yes' : 'no'} ·
                Assessment due: {checkpoints.assessmentDue ? 'yes' : 'no'}
              </span>
              {conversationComplete && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  Conversation complete{completeReason ? ` · ${completeReason}` : ''}
                </span>
              )}
            </div>
            {hasSession && (
              <button
                type="button"
                className="rounded bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
                disabled={
                  conversationBusy ||
                  history.length === 0 ||
                  (conversationComplete && finalReport !== null)
                }
                onClick={() =>
                  fetchFinalReport({
                    force: true,
                    reason: 'Player requested to end the conversation.',
                  })
                }
              >
                {finalizing ? 'Ending…' : 'End conversation'}
              </button>
            )}
          </div>
        </header>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Scenario templates</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Load a preset scenario and NPC pair that reflects common sexual health situations. You can tweak any field after selecting a template.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex w-full flex-col text-xs font-medium text-slate-500 dark:text-slate-400 sm:max-w-xs">
              Template
              <select
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={selectedTemplateId}
                onChange={handleTemplateSelect}
              >
                <option value={CUSTOM_TEMPLATE_ID}>Custom (keep current fields)</option>
                {SCENARIO_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedTemplate && (
              <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 sm:flex-1">
                <p>{selectedTemplate.description}</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">API endpoints in use</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Each player turn touches the endpoints below. Keep them handy when debugging or updating the backend.</p>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {API_ENDPOINTS.map((endpoint) => (
              <li
                key={endpoint.path}
                className="flex flex-col gap-2 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-slate-100 dark:text-slate-900">
                    {endpoint.method}
                  </span>
                  <code className="truncate text-[11px] text-slate-900 dark:text-slate-100" title={endpoint.path}>
                    {endpoint.path}
                  </code>
                </div>
                <p>{endpoint.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Scenario</h2>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Scenario ID
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={scenarioForm.id}
                onChange={handleScenarioFieldChange('id')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Title
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={scenarioForm.title}
                onChange={handleScenarioFieldChange('title')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Setting
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={scenarioForm.setting}
                onChange={handleScenarioFieldChange('setting')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Learning objectives (newline separated)
              <textarea
                className="mt-1 h-24 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={scenarioForm.learningObjectives}
                onChange={handleScenarioFieldChange('learningObjectives')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Supporting facts (optional, newline separated)
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={scenarioForm.supportingFacts}
                onChange={handleScenarioFieldChange('supportingFacts')}
              />
            </label>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">NPC profile</h2>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              NPC ID
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={npcForm.id}
                onChange={handleNpcFieldChange('id')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Name
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={npcForm.name}
                onChange={handleNpcFieldChange('name')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Role
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={npcForm.role}
                onChange={handleNpcFieldChange('role')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Persona
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={npcForm.persona}
                onChange={handleNpcFieldChange('persona')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Goals (newline separated)
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={npcForm.goals}
                onChange={handleNpcFieldChange('goals')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Tactics (newline separated)
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={npcForm.tactics}
                onChange={handleNpcFieldChange('tactics')}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Boundaries (newline separated)
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                value={npcForm.boundaries}
                onChange={handleNpcFieldChange('boundaries')}
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <label className="inline-flex items-center gap-2" title="Allow the simulation to end automatically once completion criteria are met.">
                <input
                  type="checkbox"
                  checked={allowAutoEnd}
                  onChange={(event) => setAllowAutoEnd(event.target.checked)}
                />
                Allow auto end
              </label>
              <label className="inline-flex items-center gap-2" title="Force the service to return a checkpoint summary with the next turn.">
                <input
                  type="checkbox"
                  checked={forceSummary}
                  onChange={(event) => setForceSummary(event.target.checked)}
                />
                Force summary
              </label>
              <label className="inline-flex items-center gap-2" title="Force the service to return an assessment with the next turn.">
                <input
                  type="checkbox"
                  checked={forceAssessment}
                  onChange={(event) => setForceAssessment(event.target.checked)}
                />
                Force assessment
              </label>
              <label className="inline-flex items-center gap-2" title="Override the default locale for generated responses.">
                Locale
                <input
                  className="rounded border border-slate-300 px-2 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value)}
                  placeholder="en"
                />
              </label>
            </div>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={handleReset}
              title="Clear the current conversation, API responses, and session ID."
            >
              Reset conversation
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Use the toggles to control when summaries or assessments are returned while you iterate on the prompt.
          </p>

          <div
            className="h-80 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            aria-live="polite"
          >
            {history.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-slate-500 dark:text-slate-400">
                <p>No messages yet. Enter a player message below to start the role-play.</p>
              </div>
            ) : (
              <ul className="space-y-2" role="log" aria-label="Conversation transcript">
                {history.map((turn, index) => (
                  <li
                    key={`${turn.role}-${index}-${turn.content.slice(0, 12)}`}
                    className={
                      turn.role === 'player'
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    }
                  >
                    <span
                      className={
                        turn.role === 'player'
                          ? 'max-w-[70%] rounded-lg bg-emerald-200 px-3 py-2 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                          : 'max-w-[70%] rounded-lg bg-white px-3 py-2 text-slate-800 dark:bg-slate-800 dark:text-slate-100 shadow'
                      }
                    >
                      <strong className="block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {turn.role === 'player' ? 'You' : 'NPC'}
                      </strong>
                      {turn.content}
                    </span>
                  </li>
                ))}
                {loading && (
                  <li className="flex justify-start">
                    <span className="max-w-[70%] animate-pulse rounded-lg bg-white px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400 shadow">
                      NPC is thinking…
                    </span>
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300" htmlFor="player-message">
              Player message
            </label>
            <textarea
              id="player-message"
              className="h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-600"
              placeholder="Type the player's next message. Press Enter to send or Shift+Enter for a new line."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-invalid={Boolean(error)}
              aria-describedby={messageErrorId}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
                disabled={!canSend}
                onClick={handleSend}
              >
                {loading ? 'Sending…' : 'Send to NPC'}
              </button>
              {conversationComplete && (
                <span className="text-xs text-slate-500 dark:text-slate-400">Conversation finished. Reset to start again.</span>
              )}
              {!conversationComplete && !loading && trimmedDraft.length === 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">Enter a message to enable sending.</span>
              )}
            </div>
            {error && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400" id="player-message-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Raw API data</h2>
          {lastRawResponse ? (
            <pre className="max-h-40 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100 dark:bg-slate-950">
              {lastRawResponse}
            </pre>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Send a message to inspect the JSON returned by the API.</p>
          )}
          {lastRawError && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-600">Raw error</p>
              <pre className="max-h-32 overflow-auto rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {lastRawError}
              </pre>
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Checkpoint summary</h2>
            {summary ? (
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Risk level: {summary.riskLevel}</p>
                {summary.keyRisks.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Risk cues</p>
                    <ul className="list-disc pl-5">
                      {summary.keyRisks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.effectiveResponses.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Effective responses</p>
                    <ul className="list-disc pl-5">
                      {summary.effectiveResponses.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.coaching && <p className="text-sm text-slate-700 dark:text-slate-200">{summary.coaching}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No summary returned yet.</p>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Score & alerts</h2>
            {score ? (
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <p>Refusal effectiveness: {score.refusalEffectiveness}</p>
                <p>Confidence: {score.confidence}</p>
                {score.notes && <p className="text-sm text-slate-600 dark:text-slate-300">{score.notes}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No score returned yet.</p>
            )}
            {safetyAlerts.length > 0 && (
              <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                <p className="text-xs font-semibold uppercase tracking-wide">Safety alerts</p>
                <ul className="list-disc pl-5">
                  {safetyAlerts.map((alert) => (
                    <li key={alert}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Final report</h2>
          {finalReport ? (
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p className="font-medium text-slate-800 dark:text-slate-100">{finalReport.overallAssessment}</p>
              {finalReport.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Strengths</p>
                  <ul className="list-disc pl-5">
                    {finalReport.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {finalReport.areasForGrowth.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Areas for growth</p>
                  <ul className="list-disc pl-5">
                    {finalReport.areasForGrowth.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {finalReport.recommendedPractice.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Recommended practice</p>
                  <ul className="list-disc pl-5">
                    {finalReport.recommendedPractice.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No final report yet. It appears once the conversation ends.</p>
          )}
        </section>
      </div>
    </div>
  );
}
