'use client';

import { type RefObject } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/app/components/ui/utils';

import { type ConversationTurn } from './types';

type ChatMessageListProps = {
  messages: ConversationTurn[];
  npcName: string;
  loading: boolean;
  typingNpcMessage: string | null;
  thinkingLabel: string;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export function ChatMessageList({
  messages,
  npcName,
  loading,
  typingNpcMessage,
  thinkingLabel,
  scrollRef,
}: ChatMessageListProps) {
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
      </div>
    </div>
  );
}
