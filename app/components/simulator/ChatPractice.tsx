'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { Loader2, Send, Sparkles } from 'lucide-react';

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

type ConversationRole = 'player' | 'npc';

type ConversationTurn = {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: string;
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

const INITIAL_CHECKPOINTS = {
  totalPlayerTurns: 0,
  summaryDue: false,
  assessmentDue: false,
};

const ALLOW_AUTO_END = true;

type ChatPracticeProps = {
  template: ChatTemplate;
};

function splitLines(value: string) {
  return value
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeList(values: string[]) {
  return values.map((item) => item.trim()).filter(Boolean);
}

function createInitialMessage(template: ChatTemplate, personaLines: string[]) {
  const personaIntro = personaLines[0] || `I'm ${template.npcName}.`;
  return `Hey, I'm ${template.npcName}. ${personaIntro} Ready to practise ${template.scenarioDescription.toLowerCase()}?`;
}

export default function ChatPractice({ template }: ChatPracticeProps) {
  const personaLines = useMemo(() => splitLines(template.npcPersona), [template.npcPersona]);
  const [messages, setMessages] = useState<ConversationTurn[]>(() => [
    {
      id: 'npc-intro',
      role: 'npc',
      content: createInitialMessage(template, personaLines),
      timestamp: new Date().toISOString(),
    },
  ]);
  const [draft, setDraft] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ApiSummary>(null);
  const [score, setScore] = useState<ApiScore>(null);
  const [finalReport, setFinalReport] = useState<ApiFinalReport>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<string[]>([]);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [completeReason, setCompleteReason] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState(INITIAL_CHECKPOINTS);
  const [lastRawResponse, setLastRawResponse] = useState<string | null>(null);
  const [lastRawError, setLastRawError] = useState<string | null>(null);
  const [typingNpcMessage, setTypingNpcMessage] = useState<string | null>(null);
  const [isStreamingReply, setIsStreamingReply] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages, typingNpcMessage]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const trimmedDraft = draft.trim();
  const canSend =
    trimmedDraft.length > 0 && !loading && !finalizing && !conversationComplete;
  const conversationBusy = loading || finalizing;

  const sessionStatusLabel = conversationComplete
    ? 'Complete'
    : sessionId
      ? 'In progress'
      : 'Not started';

  const sessionStatusClass =
    sessionStatusLabel === 'Complete'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
      : sessionStatusLabel === 'In progress'
        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200'
        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200';

  const processingText = loading
    ? 'Awaiting NPC response…'
    : finalizing
      ? 'Generating final report…'
      : null;

  async function ensureSession() {
    if (sessionId) return sessionId;

    const scenarioPayload = {
      id: template.scenarioId.trim() || 'scenario-placeholder',
      title: template.scenarioTitle.trim() || undefined,
      setting: template.setting.trim() || undefined,
      learningObjectives: sanitizeList(template.learningObjectives),
      supportingFacts: sanitizeList(template.supportingFacts),
    };

    const npcPayload = {
      id: template.npcId.trim() || 'npc-placeholder',
      name: template.npcName.trim() || 'NPC',
      role: template.npcRole.trim() || 'Peer',
      persona: template.npcPersona.trim() || undefined,
      goals: sanitizeList(template.npcGoals),
      tactics: sanitizeList(template.npcTactics),
      boundaries: sanitizeList(template.npcBoundaries),
    };

    const response = await fetch('/api/ai-scenarios/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: scenarioPayload,
        npc: npcPayload,
        allowAutoEnd: ALLOW_AUTO_END,
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

  function completeNpcStream(finalContent: string) {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `npc-${prev.length}`,
        role: 'npc',
        content: finalContent,
        timestamp: new Date().toISOString(),
      },
    ]);
    setTypingNpcMessage(null);
    setIsStreamingReply(false);
  }

  async function handleSend() {
    if (!canSend) return;

    setLoading(true);
    setError(null);
    setLastRawResponse(null);
    setLastRawError(null);

    let appendedPlayerMessage = false;
    let appendedNpcMessage = false;
    let finalPayload: { sessionId: string; response: ApiResponsePayload; raw?: string } | null = null;

    try {
      const activeSessionId = await ensureSession();

      setMessages((prev) => [
        ...prev,
        {
          id: `player-${prev.length}`,
          role: 'player',
          content: trimmedDraft,
          timestamp: new Date().toISOString(),
        },
      ]);
      appendedPlayerMessage = true;
      setDraft('');

      const response = await fetch(`/api/ai-scenarios/session/${activeSessionId}/turns/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          playerMessage: trimmedDraft,
          allowAutoEnd: ALLOW_AUTO_END,
        }),
      });

      if (!response.ok) {
        const rawText = await response.text();
        setLastRawError(rawText);
        throw new Error(rawText || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Stream response missing body');
      }

      setTypingNpcMessage('');
      setIsStreamingReply(true);
      setLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamError: Error | null = null;

      const processEvent = (eventName: string, payload: unknown) => {
        if (eventName === 'token') {
          const token =
            typeof payload === 'object' && payload && 'content' in payload && typeof (payload as any).content === 'string'
              ? (payload as any).content
              : '';
          if (token) {
            setTypingNpcMessage((prev) => (prev ?? '') + token);
          }
          return;
        }

        if (eventName === 'final') {
          const finalData =
            typeof payload === 'object' && payload
              ? (payload as { sessionId?: string; response?: ApiResponsePayload; raw?: string })
              : { response: undefined };
          if (finalData.response) {
            finalPayload = {
              sessionId: finalData.sessionId ?? activeSessionId,
              response: finalData.response,
              raw: finalData.raw,
            };
            setSessionId(finalPayload.sessionId);
            setSummary(finalPayload.response.summary ?? null);
            setScore(finalPayload.response.score ?? null);
            setFinalReport(finalPayload.response.finalReport ?? null);
            setSafetyAlerts(finalPayload.response.safetyAlerts ?? []);
            setCheckpoints(finalPayload.response.checkpoints ?? INITIAL_CHECKPOINTS);
            setConversationComplete(finalPayload.response.conversationComplete ?? false);
            setCompleteReason(finalPayload.response.conversationCompleteReason ?? null);
            setLastRawResponse(finalPayload.raw ?? null);
            setLastRawError(null);
            const replyText = finalPayload.response.npcReply ?? '';
            if (replyText) {
              appendedNpcMessage = true;
              completeNpcStream(replyText);
            } else {
              setTypingNpcMessage(null);
              setIsStreamingReply(false);
            }
          }
          return;
        }

        if (eventName === 'error') {
          const message =
            typeof payload === 'object' && payload && 'message' in payload && typeof (payload as any).message === 'string'
              ? (payload as any).message
              : 'Unexpected error';
          streamError = new Error(message);
        }
      };

      let shouldBreak = false;
      while (!shouldBreak) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundaryIndex = buffer.indexOf('\n\n');
        while (boundaryIndex !== -1) {
          const eventChunk = buffer.slice(0, boundaryIndex);
          buffer = buffer.slice(boundaryIndex + 2);

          if (eventChunk.length > 0) {
            const lines = eventChunk.split('\n');
            let eventName = 'message';
            const dataLines: string[] = [];

            for (const rawLine of lines) {
              const line = rawLine.replace(/\r$/, '');
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataLines.push(line.slice(5));
              }
            }

            const dataContent = dataLines.join('\n');
            if (dataContent) {
              try {
                const parsedPayload = JSON.parse(dataContent);
                processEvent(eventName, parsedPayload);
                if (eventName === 'final') {
                  shouldBreak = true;
                  break;
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE payload', parseError);
              }
            }
          }

          if (streamError) {
            shouldBreak = true;
            break;
          }

          boundaryIndex = buffer.indexOf('\n\n');
        }
      }

      await reader.cancel();

      if (streamError) {
        throw streamError;
      }

      if (!finalPayload) {
        throw new Error('Stream ended without final payload');
      }

      const ensuredPayload = finalPayload as { sessionId: string; response: ApiResponsePayload; raw?: string };
      if (ensuredPayload.response.conversationComplete) {
        await fetchFinalReport({
          force: false,
          reason: ensuredPayload.response.conversationCompleteReason ?? undefined,
          sessionOverride: ensuredPayload.sessionId,
        });
      }
    } catch (err) {
      if (appendedPlayerMessage && !appendedNpcMessage) {
        setMessages((prev) => prev.slice(0, -1));
      }
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setLastRawError(err instanceof Error ? err.message : 'Unexpected error');
      setTypingNpcMessage(null);
      setIsStreamingReply(false);
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
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        setLastRawError(rawText);
        throw new Error(rawText || `Final report failed with status ${response.status}`);
      }

      setLastRawResponse(rawText);
      setLastRawError(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setLastRawError(err instanceof Error ? err.message : 'Unexpected error');
      setTypingNpcMessage(null);
      setIsStreamingReply(false);
    } finally {
      setFinalizing(false);
    }
  }

  function handleReset() {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setMessages([
      {
        id: 'npc-intro',
        role: 'npc',
        content: createInitialMessage(template, personaLines),
        timestamp: new Date().toISOString(),
      },
    ]);
    setDraft('');
    setSessionId(null);
    setLoading(false);
    setFinalizing(false);
    setError(null);
    setSummary(null);
    setScore(null);
    setFinalReport(null);
    setSafetyAlerts([]);
    setConversationComplete(false);
    setCompleteReason(null);
    setCheckpoints(INITIAL_CHECKPOINTS);
    setLastRawResponse(null);
    setLastRawError(null);
    setTypingNpcMessage(null);
    setIsStreamingReply(false);
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-col gap-5 rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-white/5 dark:bg-slate-900/70 dark:shadow-slate-950/40">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 dark:border-white/5 dark:bg-slate-950/60">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Active NPC</p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{template.npcName}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{template.npcRole}</p>
        </div>
        <div className="flex flex-col items-end text-right text-xs text-slate-500 dark:text-slate-400">
          <span>Scenario · {template.scenarioLabel}</span>
          <span>ID · {template.npcId}</span>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm shadow-slate-900/5 dark:border-white/5 dark:bg-slate-900/60 dark:text-slate-300">
          <span className={cn('rounded-full px-3 py-1 font-semibold', sessionStatusClass)}>
            Status: {sessionStatusLabel}
          </span>
          {processingText && (
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              {processingText}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            Session ID: <code className="text-[11px]">{sessionId ?? '—'}</code>
          </span>
          <span>
            Turns: {checkpoints.totalPlayerTurns} · Summary due: {checkpoints.summaryDue ? 'yes' : 'no'} · Assessment due: {checkpoints.assessmentDue ? 'yes' : 'no'}
          </span>
          {conversationComplete && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              Conversation complete{completeReason ? ` · ${completeReason}` : ''}
            </span>
          )}
          <div className="ml-auto flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="justify-center border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Reset session
            </Button>
            <Button
              type="button"
              onClick={() => fetchFinalReport({ force: true })}
              disabled={!sessionId || finalizing}
              className="justify-center bg-teal-500 text-slate-900 hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-teal-500/60"
            >
              {finalizing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {finalizing ? 'Finishing…' : 'Get final scores'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex min-h-[24rem] flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/80 dark:border-white/5 dark:bg-slate-950/60"
        >
          <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-5">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex', message.role === 'player' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition',
                    message.role === 'player'
                      ? 'bg-teal-500 text-slate-900 shadow-teal-500/20 dark:bg-teal-300'
                      : 'bg-white text-slate-800 shadow-slate-900/10 dark:bg-slate-800 dark:text-slate-100',
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className="mt-2 block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {(loading || typingNpcMessage) && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-col gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-slate-900/10 dark:bg-slate-800 dark:text-slate-200">
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    {template.npcName}
                  </span>
                  <p className="min-h-[1.5rem] whitespace-pre-wrap">
                    {typingNpcMessage && typingNpcMessage.length > 0 ? (
                      typingNpcMessage
                    ) : loading ? (
                      <span className="inline-flex items-center gap-1 text-xs text-teal-500">
                        <Loader2 className="size-4 animate-spin" />
                        Thinking…
                      </span>
                    ) : (
                      '…'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          className="rounded-2xl border border-slate-200/60 bg-white/90 p-3 shadow-sm shadow-slate-900/10 dark:border-white/5 dark:bg-slate-900/80"
        >
          <div className="relative">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Write your message to ${template.npcName}…`}
              disabled={conversationBusy || conversationComplete}
              className="min-h-[110px] w-full resize-none rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm text-slate-800 shadow-inner shadow-slate-900/5 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-100 dark:shadow-none"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Summaries and scores refresh after every exchange.</span>
              <Button
                type="submit"
                size="lg"
                disabled={!canSend}
                className="bg-teal-500 text-slate-900 hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-teal-500/60"
              >
                {conversationBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {conversationBusy ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-sm text-slate-700 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Checkpoint summary</p>
            {summary ? (
              <div className="mt-3 space-y-3">
                <span className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                  summary.riskLevel === 'high'
                    ? 'border-rose-400/60 bg-rose-500/15 text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200'
                    : summary.riskLevel === 'medium'
                      ? 'border-amber-400/60 bg-amber-500/15 text-amber-600 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200'
                      : 'border-emerald-400/60 bg-emerald-500/15 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200',
                )}>
                  Risk · {summary.riskLevel}
                </span>
                {summary.keyRisks.length > 0 && (
                  <div>
                    <p className="font-semibold">Key risks</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      {summary.keyRisks.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.effectiveResponses.length > 0 && (
                  <div>
                    <p className="font-semibold">What worked</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      {summary.effectiveResponses.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.coaching && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">{summary.coaching}</p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Send a message to unlock live risk insights and coaching notes.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-sm text-slate-700 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Scorecard</p>
            {score ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200">
                  <span>Refusal effectiveness</span>
                  <span>{Math.round(score.refusalEffectiveness)}%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200">
                  <span>Confidence</span>
                  <span>{Math.round(score.confidence)}%</span>
                </div>
                {score.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">{score.notes}</p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Scores appear once the AI evaluates your latest response.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-sm text-slate-700 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Final report</p>
            {finalReport ? (
              <div className="mt-3 space-y-3 text-xs">
                <p className="font-semibold text-slate-700 dark:text-slate-200">{finalReport.overallAssessment}</p>
                {finalReport.strengths.length > 0 && (
                  <div>
                    <p className="font-semibold">Strengths</p>
                    <ul className="mt-1 space-y-1">
                      {finalReport.strengths.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {finalReport.areasForGrowth.length > 0 && (
                  <div>
                    <p className="font-semibold">Areas for growth</p>
                    <ul className="mt-1 space-y-1">
                      {finalReport.areasForGrowth.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {finalReport.recommendedPractice.length > 0 && (
                  <div>
                    <p className="font-semibold">Recommended practice</p>
                    <ul className="mt-1 space-y-1">
                      {finalReport.recommendedPractice.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Finish the session to generate a full assessment and next steps.
              </p>
            )}
          </div>
        </div>

        {safetyAlerts.length > 0 && (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4 text-xs text-rose-700 shadow-sm shadow-rose-200/40 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
            <p className="mb-2 font-semibold uppercase tracking-[0.28em]">Safety alerts</p>
            <ul className="space-y-1">
              {safetyAlerts.map((alert) => (
                <li key={alert}>• {alert}</li>
              ))}
            </ul>
          </div>
        )}

        {conversationComplete && lastRawResponse && (
          <details className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 text-xs text-slate-600 dark:border-white/5 dark:bg-slate-900/60 dark:text-slate-300">
            <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">View raw report JSON</summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded border border-slate-200/60 bg-slate-100/60 p-2 text-[11px] dark:border-slate-700 dark:bg-slate-950/50">
              {lastRawResponse}
            </pre>
            {lastRawError && (
              <p className="mt-2 text-rose-500">{lastRawError}</p>
            )}
          </details>
        )}
      </section>
    </div>
  );
}
