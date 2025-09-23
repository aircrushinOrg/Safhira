'use client'

import { useState } from 'react';

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

const DEFAULT_SCENARIO: ScenarioFormState = {
  id: 'after-school-hallway',
  title: 'Hallway Pressure',
  setting: 'School hallway after class',
  learningObjectives: 'Recognise manipulative compliments\nPractise firm but respectful refusals\nEscalate to a trusted adult when needed',
  supportingFacts: 'You have to catch the late bus home\nYour parents expect you back by 6pm',
};

const DEFAULT_NPC: NpcFormState = {
  id: 'upperclassman-01',
  name: 'Ken',
  role: 'Senior athlete',
  persona: 'Confident, popular senior who feels entitled to attention',
  goals: 'Convince the player to break school conduct rules\nKeep the talk secret from adults',
  tactics: 'Flattery and social status pressure\nPromises of popularity boosts',
  boundaries: 'No explicit sexual descriptions\nNo illegal behaviour promotion\nRespect firm refusals after multiple attempts',
};

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
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">AI Scenario Tester</h1>
          <p className="text-sm text-slate-600">
            Configure a scenario, chat as the player, and inspect summaries, scores, and safety alerts returned
            by <code className="rounded bg-slate-200 px-1 py-0.5">/api/ai-scenarios</code>.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>Session: {sessionId ?? '—'}</span>
            <span>
              Player turns: {checkpoints.totalPlayerTurns} · Summary due: {checkpoints.summaryDue ? 'yes' : 'no'} ·
              Assessment due: {checkpoints.assessmentDue ? 'yes' : 'no'}
            </span>
            {conversationComplete && (
              <span className="rounded bg-emerald-100 px-2 py-1 font-medium text-emerald-700">
                Conversation complete{completeReason ? ` · ${completeReason}` : ''}
              </span>
            )}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Scenario</h2>
            <label className="block text-xs font-medium text-slate-500">
              Scenario ID
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={scenarioForm.id}
                onChange={(event) => setScenarioForm((prev) => ({ ...prev, id: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Title
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={scenarioForm.title}
                onChange={(event) => setScenarioForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Setting
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={scenarioForm.setting}
                onChange={(event) => setScenarioForm((prev) => ({ ...prev, setting: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Learning objectives (newline separated)
              <textarea
                className="mt-1 h-24 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={scenarioForm.learningObjectives}
                onChange={(event) =>
                  setScenarioForm((prev) => ({ ...prev, learningObjectives: event.target.value }))
                }
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Supporting facts (optional, newline separated)
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={scenarioForm.supportingFacts}
                onChange={(event) =>
                  setScenarioForm((prev) => ({ ...prev, supportingFacts: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">NPC profile</h2>
            <label className="block text-xs font-medium text-slate-500">
              NPC ID
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={npcForm.id}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, id: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Name
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={npcForm.name}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Role
              <input
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={npcForm.role}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, role: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Persona
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={npcForm.persona}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, persona: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Goals (newline separated)
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={npcForm.goals}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, goals: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Tactics (newline separated)
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={npcForm.tactics}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, tactics: event.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium text-slate-500">
              Boundaries (newline separated)
              <textarea
                className="mt-1 h-16 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={npcForm.boundaries}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, boundaries: event.target.value }))}
              />
            </label>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowAutoEnd}
                onChange={(event) => setAllowAutoEnd(event.target.checked)}
              />
              Allow auto end
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={forceSummary}
                onChange={(event) => setForceSummary(event.target.checked)}
              />
              Force summary
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={forceAssessment}
                onChange={(event) => setForceAssessment(event.target.checked)}
              />
              Force assessment
            </label>
            <label className="inline-flex items-center gap-2">
              Locale
              <input
                className="rounded border border-slate-300 px-2 py-0.5 text-xs"
                value={locale}
                onChange={(event) => setLocale(event.target.value)}
                placeholder="en"
              />
            </label>
            <button
              className="ml-auto rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              onClick={handleReset}
              type="button"
            >
              Reset conversation
            </button>
          </div>

          <div className="h-80 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-3 text-sm">
            {history.length === 0 ? (
              <p className="text-slate-500">No messages yet. Enter a player message below to begin.</p>
            ) : (
              <ul className="space-y-2">
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
                          ? 'max-w-[70%] rounded-lg bg-emerald-200 px-3 py-2 text-emerald-900'
                          : 'max-w-[70%] rounded-lg bg-white px-3 py-2 text-slate-800 shadow'
                      }
                    >
                      <strong className="block text-xs uppercase tracking-wide text-slate-500">
                        {turn.role === 'player' ? 'You' : 'NPC'}
                      </strong>
                      {turn.content}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <textarea
              className="h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Enter the player's next message (Enter to send, Shift+Enter for new line)"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-3">
              <button
                className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500"
                disabled={loading || conversationComplete}
                onClick={handleSend}
                type="button"
              >
                {loading ? 'Sending…' : 'Send to NPC'}
              </button>
              {conversationComplete && (
                <span className="text-xs text-slate-500">Conversation finished. Reset to start again.</span>
              )}
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
          </div>
        </section>

        <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Raw API data</h2>
          {lastRawResponse ? (
            <pre className="max-h-40 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
              {lastRawResponse}
            </pre>
          ) : (
            <p className="text-sm text-slate-500">Send a message to inspect the JSON returned by the API.</p>
          )}
          {lastRawError && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-600">Raw error</p>
              <pre className="max-h-32 overflow-auto rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {lastRawError}
              </pre>
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Checkpoint summary</h2>
            {summary ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p className="text-xs uppercase tracking-wide text-slate-500">Risk level: {summary.riskLevel}</p>
                {summary.keyRisks.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Risk cues</p>
                    <ul className="list-disc pl-5">
                      {summary.keyRisks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.effectiveResponses.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Effective responses</p>
                    <ul className="list-disc pl-5">
                      {summary.effectiveResponses.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.coaching && <p className="text-sm text-slate-700">{summary.coaching}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No summary returned yet.</p>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Score & alerts</h2>
            {score ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p>Refusal effectiveness: {score.refusalEffectiveness}</p>
                <p>Confidence: {score.confidence}</p>
                {score.notes && <p className="text-sm text-slate-600">{score.notes}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No score returned yet.</p>
            )}
            {safetyAlerts.length > 0 && (
              <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
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

        <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Final report</h2>
          {finalReport ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p className="font-medium text-slate-800">{finalReport.overallAssessment}</p>
              {finalReport.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Strengths</p>
                  <ul className="list-disc pl-5">
                    {finalReport.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {finalReport.areasForGrowth.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Areas for growth</p>
                  <ul className="list-disc pl-5">
                    {finalReport.areasForGrowth.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {finalReport.recommendedPractice.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Recommended practice</p>
                  <ul className="list-disc pl-5">
                    {finalReport.recommendedPractice.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No final report yet. It appears once the conversation ends.</p>
          )}
        </section>
      </div>
    </div>
  );
}
