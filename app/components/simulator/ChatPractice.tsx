'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  type AnalysisApiResponse,
  type AnalysisSkipResponse,
  type ApiFinalReport,
  type ApiResponsePayload,
  type ApiScore,
  type ApiSummary,
  type ChatTemplate,
  type ConversationTurn,
  type FinalReportApiResponse,
  type SuggestedQuestions,
  type SuggestedQuestionsApiResponse,
  type StreamFinalEvent,
  type StreamResponsePayload,
} from './chat-practice/types';
import { ChatComposer } from './chat-practice/ChatComposer';
import { ChatFinalReportDialog } from './chat-practice/ChatFinalReportDialog';
import { ChatMessageList } from './chat-practice/ChatMessageList';
import { ChatPracticeHeader } from './chat-practice/ChatPracticeHeader';
import { ChatSummaryPanel } from './chat-practice/ChatSummaryPanel';

export type { ChatTemplate } from './chat-practice/types';

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
  const scenarioMessages = translate.raw('intro.scenarioMessages') as Record<string, string> | undefined;
  const scenarioSummary = template.scenarioDescription.trim();
  if (scenarioMessages?.[template.scenarioId]) {
    return translate(`intro.scenarioMessages.${template.scenarioId}`, {
      name: template.npcName,
      persona: personaIntro,
      scenario: scenarioSummary,
      setting: template.setting,
    });
  }
  return translate('intro.message', {
    name: template.npcName,
    persona: personaIntro,
    scenario: scenarioSummary,
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
  const [persistedScore, setPersistedScore] = useState({ confidence: 0, riskScore: 0 });
  const [finalReport, setFinalReport] = useState<ApiFinalReport>(null);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [completeReason, setCompleteReason] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState(INITIAL_CHECKPOINTS);
  const [lastRawResponse, setLastRawResponse] = useState<string | null>(null);
  const [lastRawError, setLastRawError] = useState<string | null>(null);
  const [typingNpcMessage, setTypingNpcMessage] = useState<string | null>(null);
  const [isStreamingReply, setIsStreamingReply] = useState(false);
  const [isFinalReportOpen, setIsFinalReportOpen] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [suggestedState, setSuggestedState] = useState<{
    npcTurnIndex: number;
    options: SuggestedQuestions;
  } | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    // Use setTimeout to ensure the DOM has updated before scrolling
    const timeoutId = setTimeout(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, typingNpcMessage]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Additional autoscroll trigger for streaming state changes
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    // Scroll when streaming states change (start/stop streaming)
    const timeoutId = setTimeout(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isStreamingReply, loading]);

  const trimmedDraft = draft.trim();
  const canSend =
    trimmedDraft.length > 0 && !loading && !finalizing && !conversationComplete && !isStreamingReply;
  const conversationBusy = loading || finalizing || isStreamingReply;
  const textareaDisabled = conversationComplete; // Only disable textarea when conversation is complete

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

  function clearReportProgressInterval() {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }

  useEffect(() => {
    clearReportProgressInterval();

    if (!finalizing) {
      setReportProgress(0);
      return;
    }

    setReportProgress(12);

    progressIntervalRef.current = window.setInterval(() => {
      setReportProgress((prev) => {
        if (prev >= 90) {
          return prev;
        }

        const increment = Math.random() * 12 + 4;
        return Math.min(prev + increment, 90);
      });
    }, 320);

    return () => {
      clearReportProgressInterval();
    };
  }, [finalizing]);

  function applyScoreUpdate(nextScore: ApiScore | null) {
    setScore(nextScore);
    if (nextScore?.confidence != null && nextScore?.riskScore != null) {
      setPersistedScore({
        confidence: Math.max(0, Math.min(100, Math.round(nextScore.confidence))),
        riskScore: Math.max(0, Math.min(100, Math.round(nextScore.riskScore))),
      });
    }
  }

  const displayedScore = persistedScore;
  const reportActionDisabled = !sessionId || finalizing || (reportGenerated && !finalReport);

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

  async function loadSuggestedQuestions(options: { session: string; npcTurnIndex: number }) {
    const activeSession = options.session;
    if (!activeSession || options.npcTurnIndex < 0) {
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/ai-scenarios/session/${activeSession}/suggested`, {
        method: 'GET',
        cache: 'no-store',
      });
      const rawText = await response.text();
      if (!response.ok) {
        throw new Error(rawText || `Suggestions failed with status ${response.status}`);
      }

      let data: SuggestedQuestionsApiResponse;
      try {
        data = JSON.parse(rawText) as SuggestedQuestionsApiResponse;
      } catch (parseError) {
        throw new Error('Failed to parse suggested questions JSON');
      }

      if (data.npcTurnIndex !== options.npcTurnIndex) {
        return;
      }

      setSuggestedState({
        npcTurnIndex: data.npcTurnIndex,
        options: data.suggestions,
      });
    } catch (err) {
      console.error('Failed to load suggested questions', err);
      setSuggestedState(null);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function fetchTurnAnalysis(options: { session: string; force?: boolean }) {
    try {
      const response = await fetch(`/api/ai-scenarios/session/${options.session}/turns/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force: options.force ?? false,
          allowAutoEnd: ALLOW_AUTO_END,
          locale,
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        setLastRawError(rawText);
        throw new Error(rawText || `Analysis failed with status ${response.status}`);
      }

      setLastRawResponse(rawText);
      setLastRawError(null);

      let data: AnalysisApiResponse | AnalysisSkipResponse;
      try {
        data = JSON.parse(rawText) as AnalysisApiResponse | AnalysisSkipResponse;
      } catch (_parseError) {
        setLastRawError(rawText);
        throw new Error('Failed to parse analysis JSON');
      }

      if ('skipped' in data && data.skipped) {
        if (data.checkpoints) {
          setCheckpoints(data.checkpoints);
        }
        return;
      }

      const analysis = data as AnalysisApiResponse;
      setSessionId(analysis.sessionId);
      setSummary(analysis.response.summary);
      applyScoreUpdate(analysis.response.score);
      setFinalReport(analysis.response.finalReport);
      setCheckpoints(analysis.response.checkpoints ?? INITIAL_CHECKPOINTS);
      setConversationComplete(Boolean(analysis.response.conversationComplete));
      setCompleteReason(analysis.response.conversationCompleteReason ?? null);

      if (analysis.response.conversationComplete) {
        await fetchFinalReport({
          force: false,
          reason: analysis.response.conversationCompleteReason ?? undefined,
          sessionOverride: analysis.sessionId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setLastRawError(err instanceof Error ? err.message : 'Unexpected error');
      setTypingNpcMessage(null);
      setIsStreamingReply(false);
    }
  }

  async function handleSend(messageOverride?: string) {
    const usingOverride = typeof messageOverride === 'string';
    const rawMessage = usingOverride ? messageOverride ?? '' : draft;
    const messageToSend = rawMessage.trim();

    if (!messageToSend) return;
    if (conversationComplete) return;
    if (conversationBusy) return;
    if (!usingOverride && !canSend) return;

    setSuggestedState(null);
    setLoadingSuggestions(false);
    setLoading(true);
    setError(null);
    setLastRawResponse(null);
    setLastRawError(null);

    let appendedPlayerMessage = false;
    let appendedNpcMessage = false;
    let finalPayload: StreamFinalEvent | null = null;

    try {
      const activeSessionId = await ensureSession();

      setMessages((prev) => [
        ...prev,
        {
          id: `player-${prev.length}`,
          role: 'player',
          content: messageToSend,
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
          playerMessage: messageToSend,
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
              ? (payload as StreamFinalEvent)
              : { response: undefined };
          if (finalData.response) {
            finalPayload = {
              sessionId: finalData.sessionId ?? activeSessionId,
              playerTurnIndex: finalData.playerTurnIndex ?? -1,
              npcTurnIndex: finalData.npcTurnIndex ?? -1,
              response: finalData.response,
              raw: finalData.raw ?? null,
              analysisDue:
                typeof finalData.analysisDue === 'boolean'
                  ? finalData.analysisDue
                  : finalData.response.checkpoints?.summaryDue ?? false,
            };

            setSessionId(finalPayload.sessionId);

            if (finalData.response.summary) {
              setSummary(finalData.response.summary);
            }
            if (finalData.response.score) {
              applyScoreUpdate(finalData.response.score);
            }
            if (finalData.response.finalReport) {
              setFinalReport(finalData.response.finalReport);
            }

            setCheckpoints(finalData.response.checkpoints ?? INITIAL_CHECKPOINTS);

            if (Object.prototype.hasOwnProperty.call(finalData.response, 'conversationComplete')) {
              setConversationComplete(Boolean(finalData.response.conversationComplete));
            }
            if (Object.prototype.hasOwnProperty.call(finalData.response, 'conversationCompleteReason')) {
              setCompleteReason(finalData.response.conversationCompleteReason ?? null);
            }

            setLastRawResponse(finalData.raw ?? null);
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

      const resolvedPayload: StreamFinalEvent = finalPayload;
      const needsAnalysis =
        resolvedPayload.analysisDue ?? resolvedPayload.response.checkpoints.summaryDue;

      if (!resolvedPayload.response.conversationComplete) {
        void loadSuggestedQuestions({
          session: resolvedPayload.sessionId,
          npcTurnIndex: resolvedPayload.npcTurnIndex ?? -1,
        });
      } else {
        setSuggestedState(null);
      }

      if (resolvedPayload.response.conversationComplete && !needsAnalysis) {
        await fetchFinalReport({
          force: false,
          reason: resolvedPayload.response.conversationCompleteReason ?? undefined,
          sessionOverride: resolvedPayload.sessionId,
        });
      }

      if (needsAnalysis) {
        await fetchTurnAnalysis({ session: resolvedPayload.sessionId });
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
      applyScoreUpdate(data.response.score);
      setFinalReport(data.response.finalReport);
      setCheckpoints(data.response.checkpoints);
      setConversationComplete(true);
      setCompleteReason(data.response.conversationCompleteReason);
      setReportGenerated(true);

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
    clearReportProgressInterval();
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
    setPersistedScore({ confidence: 0, riskScore: 0 });
    setFinalReport(null);
    setConversationComplete(false);
    setCompleteReason(null);
    setCheckpoints(INITIAL_CHECKPOINTS);
    setLastRawResponse(null);
    setLastRawError(null);
    setTypingNpcMessage(null);
    setIsStreamingReply(false);
    setIsFinalReportOpen(false);
    setReportGenerated(false);
    setReportProgress(0);
    setSuggestedState(null);
    setLoadingSuggestions(false);
  }

  async function handleReportButtonClick() {
    if (!sessionId || finalizing || (reportGenerated && !finalReport)) {
      return;
    }

    if (!finalReport && !reportGenerated) {
      setReportGenerated(true);
      await fetchFinalReport({ force: true, openDialog: true });
      return;
    }

    setIsFinalReportOpen(true);
  }

  return (
    <div className="mb-[1rem] flex h-full min-h-[70vh] flex-1 flex-col gap-5 rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-white/5 dark:bg-slate-900/70 dark:shadow-slate-950/40">
      <ChatPracticeHeader
        npcId={displayTemplate.npcId}
        npcName={displayTemplate.npcName}
        npcRole={displayTemplate.npcRole}
        scenarioLabel={displayTemplate.scenarioLabel}
        scenarioLabelPrefix={t('labels.scenario')}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </div>
        )}

        <ChatMessageList
          messages={messages}
          npcName={displayTemplate.npcName}
          loading={loading}
          typingNpcMessage={typingNpcMessage}
          thinkingLabel={t('thinking')}
          scrollRef={scrollRef}
          suggestions={suggestedState?.options ?? null}
          suggestionsLoading={loadingSuggestions}
          suggestionsDisabled={conversationBusy || conversationComplete}
          onSuggestionSelect={(value) => {
            void handleSend(value);
          }}
        />

        <ChatComposer
          draft={draft}
          onDraftChange={(value) => setDraft(value)}
          canSend={canSend}
          disabled={textareaDisabled}
          busy={conversationBusy}
          onSend={handleSend}
          placeholder={t('placeholder', { name: displayTemplate.npcName })}
          sendLabel={t('buttons.send')}
          sendingLabel={t('buttons.sending')}
        />
      </div>

      <ChatSummaryPanel
        sessionStatusClass={sessionStatusClass}
        sessionStatusLabel={sessionStatusLabel}
        scores={displayedScore}
        finalizing={finalizing}
        reportProgress={reportProgress}
        onReset={handleReset}
        onReportAction={handleReportButtonClick}
        reportActionDisabled={reportActionDisabled}
        finalReportAvailable={Boolean(finalReport)}
        reportGenerated={reportGenerated}
      />

      <ChatFinalReportDialog
        open={isFinalReportOpen}
        onOpenChange={setIsFinalReportOpen}
        finalReport={finalReport}
        displayedScore={displayedScore}
        onDownload={handleDownloadFinalReportDocx}
      />
    </div>
  );
}
