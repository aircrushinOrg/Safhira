'use client';

import { type RefObject } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import { cn } from '@/app/components/ui/utils';

import { type ConversationTurn, type SuggestedQuestions } from './types';

type ChatMessageListProps = {
  messages: ConversationTurn[];
  npcName: string;
  loading: boolean;
  typingNpcMessage: string | null;
  thinkingLabel: string;
  scrollRef: RefObject<HTMLDivElement | null>;
  suggestions?: SuggestedQuestions | null;
  suggestionsLoading?: boolean;
  suggestionsDisabled?: boolean;
  onSuggestionSelect?: (value: string) => void;
};

export function ChatMessageList({
  messages,
  npcName,
  loading,
  typingNpcMessage,
  thinkingLabel,
  scrollRef,
  suggestions,
  suggestionsLoading = false,
  suggestionsDisabled = false,
  onSuggestionSelect,
}: ChatMessageListProps) {
  const t = useTranslations('Simulator.chatPractice');
  const positiveOption = suggestions?.positive?.trim() ?? '';
  const negativeOption = suggestions?.negative?.trim() ?? '';
  const hasSuggestionContent = positiveOption.length > 0 || negativeOption.length > 0;
  const showSuggestionLoading = suggestionsLoading && !hasSuggestionContent;

  return (
    <div className="flex min-h-[24rem] flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/80 dark:border-white/5 dark:bg-slate-950/60">
      <div ref={scrollRef} className="flex h-[50vh] flex-col gap-3 overflow-y-auto px-4 py-5">
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
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              <span className="mt-2 block text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {(loading || typingNpcMessage) && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] flex-col gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-slate-900/10 dark:bg-slate-800 dark:text-slate-200">
              <span className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{npcName}</span>
              <p className="min-h-[1.5rem] whitespace-pre-wrap">
                {typingNpcMessage && typingNpcMessage.length > 0 ? (
                  typingNpcMessage
                ) : loading ? (
                  <span className="inline-flex items-center gap-1 text-xs text-teal-500">
                    <Loader2 className="size-4 animate-spin" />
                    {thinkingLabel}
                  </span>
                ) : (
                  '…'
                )}
              </p>
            </div>
          </div>
        )}

        {(showSuggestionLoading || hasSuggestionContent) && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] flex-col gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-slate-900/10 dark:bg-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                <span>{t('quickPicks.title')}</span>
              </div>

              {showSuggestionLoading ? (
                <div className="flex items-center gap-2 text-xs text-teal-500">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t('quickPicks.loading')}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-sm">
                  {positiveOption && (
                    <button
                      type="button"
                      onClick={() => {
                        if (suggestionsDisabled) return;
                        onSuggestionSelect?.(positiveOption);
                      }}
                      disabled={suggestionsDisabled}
                      className="rounded-2xl border border-teal-100 bg-teal-50/80 px-3 py-2 text-left text-teal-700 transition hover:border-teal-300 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-100 dark:hover:border-teal-500/50 dark:hover:bg-teal-500/20"
                    >
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                        A
                      </span>
                      {positiveOption}
                    </button>
                  )}
                  {negativeOption && (
                    <button
                      type="button"
                      onClick={() => {
                        if (suggestionsDisabled) return;
                        onSuggestionSelect?.(negativeOption);
                      }}
                      disabled={suggestionsDisabled}
                      className="rounded-2xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-left text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:border-rose-500/50 dark:hover:bg-rose-500/20"
                    >
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                        B
                      </span>
                      {negativeOption}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
