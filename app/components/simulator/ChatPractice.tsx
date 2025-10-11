'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Progress } from '@/app/components/ui/progress';
import { cn } from '@/app/components/ui/utils';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

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
  confidence: number;
  riskScore: number;
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
  aiTemplate?: ChatTemplate;
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

type Translator = ReturnType<typeof useTranslations>;

function createInitialMessage(
  template: ChatTemplate,
  personaLines: string[],
  translate: Translator,
) {
  const fallbackPersona = translate('intro.fallbackPersona', { name: template.npcName });
  const personaIntro = personaLines[0] || fallbackPersona;
  return translate('intro.message', {
    name: template.npcName,
    persona: personaIntro,
    scenario: template.scenarioDescription.toLowerCase(),
  });
}

export default function ChatPractice({ template: displayTemplate, aiTemplate }: ChatPracticeProps) {
  const t = useTranslations('Simulator.chatPractice');
  const locale = useLocale();
  const personaLines = useMemo(
    () => splitLines(displayTemplate.npcPersona),
    [displayTemplate.npcPersona],
  );
  const apiTemplate = aiTemplate ?? displayTemplate;
  const [messages, setMessages] = useState<ConversationTurn[]>(() => [
    {
      id: 'npc-intro',
      role: 'npc',
      content: createInitialMessage(displayTemplate, personaLines, t),
      timestamp: new Date().toISOString(),
    },
  ]);
  const [draft, setDraft] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setSummary] = useState<ApiSummary>(null);
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
  const [isFinalReportOpen, setIsFinalReportOpen] = useState(false);

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

  const statusCompleteLabel = t('status.complete');
  const statusInProgressLabel = t('status.inProgress');
  const statusNotStartedLabel = t('status.notStarted');

  const sessionStatusLabel = conversationComplete
    ? statusCompleteLabel
    : sessionId
      ? statusInProgressLabel
      : statusNotStartedLabel;

  const sessionStatusClass =
    sessionStatusLabel === statusCompleteLabel
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
      : sessionStatusLabel === statusInProgressLabel
        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200'
        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200';

  const processingText = loading
    ? t('processing.awaiting')
    : finalizing
      ? t('processing.finalizing')
      : null;

  const hasScore = Boolean(score);
  const displayedScore = {
    confidence: Math.max(0, Math.min(100, Math.round(score?.confidence ?? 0))),
    riskScore: Math.max(0, Math.min(100, Math.round(score?.riskScore ?? 0))),
  };

  async function handleDownloadFinalReportDocx() {
    if (!finalReport) return;

    try {
      // Import docx library
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

      const now = new Date();
      const docTitle = t('pdf.title');
      const metaLine = t('pdf.meta', {
        name: displayTemplate.npcName,
        label: displayTemplate.scenarioLabel,
      });
      const dateLine = now.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const generatedLine = t('pdf.generated', { timestamp: dateLine });
      const docSections = {
        overall: t('pdf.sections.overall'),
        highlights: t('pdf.sections.highlights'),
        strengths: t('pdf.sections.strengths'),
        areas: t('pdf.sections.areas'),
        recommended: t('pdf.sections.recommended'),
      };

      // Create document sections
      const docChildren: any[] = [];

      // Title
      docChildren.push(
        new Paragraph({
          text: docTitle,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );

      // Metadata
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: metaLine })],
          spacing: { after: 100 },
        })
      );

      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: generatedLine })],
          spacing: { after: 400 },
        })
      );

      // Overall Assessment
      docChildren.push(
        new Paragraph({
          text: docSections.overall,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: finalReport.overallAssessment })],
          spacing: { after: 300 },
        })
      );

      // Highlights
      docChildren.push(
        new Paragraph({
          text: docSections.highlights,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      // Strengths
      if (finalReport.strengths.length > 0) {
        docChildren.push(
          new Paragraph({
            text: docSections.strengths,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 100, after: 100 },
          })
        );

        finalReport.strengths.forEach((item) => {
          docChildren.push(
            new Paragraph({
              text: `• ${item}`,
              spacing: { after: 100 },
              indent: { left: 720 },
            })
          );
        });
      }

      // Areas for Growth
      if (finalReport.areasForGrowth.length > 0) {
        docChildren.push(
          new Paragraph({
            text: docSections.areas,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          })
        );

        finalReport.areasForGrowth.forEach((item) => {
          docChildren.push(
            new Paragraph({
              text: `• ${item}`,
              spacing: { after: 100 },
              indent: { left: 720 },
            })
          );
        });
      }

      // Recommended Practice
      if (finalReport.recommendedPractice.length > 0) {
        docChildren.push(
          new Paragraph({
            text: docSections.recommended,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          })
        );

        finalReport.recommendedPractice.forEach((item) => {
          docChildren.push(
            new Paragraph({
              text: `• ${item}`,
              spacing: { after: 100 },
              indent: { left: 720 },
            })
          );
        });
      }

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docChildren,
          },
        ],
      });

      // Generate and download the DOCX file
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `final-report-${sessionId ?? 'session'}.docx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report DOCX';
      setError(message);
      console.error('Final report DOCX generation failed', err);
    }
  }

  async function ensureSession() {
    if (sessionId) return sessionId;

    const scenarioPayload = {
      id: apiTemplate.scenarioId.trim() || 'scenario-placeholder',
      title: apiTemplate.scenarioTitle.trim() || undefined,
      setting: apiTemplate.setting.trim() || undefined,
      learningObjectives: sanitizeList(apiTemplate.learningObjectives),
      supportingFacts: sanitizeList(apiTemplate.supportingFacts),
    };

    const npcPayload = {
      id: apiTemplate.npcId.trim() || 'npc-placeholder',
      name: apiTemplate.npcName.trim() || 'NPC',
      role: apiTemplate.npcRole.trim() || 'Peer',
      persona: apiTemplate.npcPersona.trim() || undefined,
      goals: sanitizeList(apiTemplate.npcGoals),
      tactics: sanitizeList(apiTemplate.npcTactics),
      boundaries: sanitizeList(apiTemplate.npcBoundaries),
    };

    const response = await fetch('/api/ai-scenarios/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: scenarioPayload,
        npc: npcPayload,
        allowAutoEnd: ALLOW_AUTO_END,
        locale,
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
          locale,
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
    openDialog?: boolean;
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
          locale,
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

      // Open the dialog automatically if requested
      if (options.openDialog && data.response.finalReport) {
        setIsFinalReportOpen(true);
      }
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
        content: createInitialMessage(displayTemplate, personaLines, t),
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
    setIsFinalReportOpen(false);
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-1 flex-col gap-5 rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-white/5 dark:bg-slate-900/70 dark:shadow-slate-950/40">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 dark:border-white/5 dark:bg-slate-950/60">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{t('activeNpc')}</p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{displayTemplate.npcName}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{displayTemplate.npcRole}</p>
        </div>
        <div className="flex flex-col items-end text-right text-xs text-slate-500 dark:text-slate-400">
          <span>{t('labels.scenario')}: {displayTemplate.scenarioLabel}</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm shadow-slate-900/5 dark:border-white/5 dark:bg-slate-900/60 dark:text-slate-300">
          <span className={cn('rounded-full px-3 py-1 font-semibold', sessionStatusClass)}>
            {t('labels.status')}: {sessionStatusLabel}
          </span>
          {hasScore && (
            <>
              <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                {t('metrics.confidence', { score: displayedScore.confidence })}
              </span>
              <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700 dark:bg-red-900/40 dark:text-red-200">
                {t('metrics.riskScore', { score: displayedScore.riskScore })}
              </span>
            </>
          )}
          {processingText && (
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              {processingText}
            </span>
          )}
          {conversationComplete && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              {completeReason ? t('conversationCompleteWithReason', { reason: completeReason }) : t('conversationComplete')}
            </span>
          )}
          <div className="ml-auto flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="justify-center border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('buttons.reset')}
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!finalReport) {
                  await fetchFinalReport({ force: true, openDialog: true });
                } else {
                  setIsFinalReportOpen(true);
                }
              }}
              disabled={!sessionId || finalizing}
              className="justify-center bg-teal-500 text-slate-900 hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-teal-500/60"
            >
              {finalizing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {finalizing ? t('buttons.finalScoresLoading') : t('buttons.generateReport')}
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
                    {displayTemplate.npcName}
                  </span>
                  <p className="min-h-[1.5rem] whitespace-pre-wrap">
                    {typingNpcMessage && typingNpcMessage.length > 0 ? (
                      typingNpcMessage
                    ) : loading ? (
                      <span className="inline-flex items-center gap-1 text-xs text-teal-500">
                        <Loader2 className="size-4 animate-spin" />
                        {t('thinking')}
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
              placeholder={t('placeholder', { name: displayTemplate.npcName })}
              disabled={conversationBusy || conversationComplete}
              className="min-h-[110px] w-full resize-none rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm text-slate-800 shadow-inner shadow-slate-900/5 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-100 dark:shadow-none"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t('summaryHint')}</span>
              <Button
                type="submit"
                size="lg"
                disabled={!canSend}
                className="bg-teal-500 text-slate-900 hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-teal-500/60"
              >
                {conversationBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {conversationBusy ? t('buttons.sending') : t('buttons.send')}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <section className="space-y-4">
        {safetyAlerts.length > 0 && (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4 text-xs text-rose-700 shadow-sm shadow-rose-200/40 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
            <p className="mb-2 font-semibold uppercase tracking-[0.28em]">{t('safetyAlerts')}</p>
            <ul className="space-y-1">
              {safetyAlerts.map((alert) => (
                <li key={alert}>• {alert}</li>
              ))}
            </ul>
          </div>
        )}

        {conversationComplete && lastRawResponse && (
          <details className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 text-xs text-slate-600 dark:border-white/5 dark:bg-slate-900/60 dark:text-slate-300">
            <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">{t('rawReport')}</summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded border border-slate-200/60 bg-slate-100/60 p-2 text-[11px] dark:border-slate-700 dark:bg-slate-950/50">
              {lastRawResponse}
            </pre>
            {lastRawError && (
              <p className="mt-2 text-rose-500">{lastRawError}</p>
            )}
          </details>
        )}
      </section>

      <Dialog open={isFinalReportOpen && Boolean(finalReport)} onOpenChange={setIsFinalReportOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-50">
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('dialog.description')}
            </DialogDescription>
          </DialogHeader>

          {finalReport ? (
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
              <p className="font-semibold text-slate-900 dark:text-slate-50">{finalReport.overallAssessment}</p>
              {finalReport.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('dialog.sections.strengths')}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {finalReport.strengths.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {finalReport.areasForGrowth.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('dialog.sections.areas')}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {finalReport.areasForGrowth.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {finalReport.recommendedPractice.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('dialog.sections.recommended')}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {finalReport.recommendedPractice.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsFinalReportOpen(false)}>
              {t('dialog.close')}
            </Button>
            <Button disabled={!finalReport} onClick={handleDownloadFinalReportDocx}>
              {t('dialog.download')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
