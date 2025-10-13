'use client';

import { FormEvent } from 'react';
import { Loader2, Send } from 'lucide-react';

import { Button } from '@/app/components/ui/button';

type ChatComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  canSend: boolean;
  disabled: boolean;
  busy: boolean;
  onSend: () => void | Promise<void>;
  placeholder: string;
  sendLabel: string;
  sendingLabel: string;
};

export function ChatComposer({
  draft,
  onDraftChange,
  canSend,
  disabled,
  busy,
  onSend,
  placeholder,
  sendLabel,
  sendingLabel,
}: ChatComposerProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSend();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-3">
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (canSend) {
                  void onSend();
                }
              }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[60px] flex-1 resize-none rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm text-slate-800 shadow-inner shadow-slate-900/5 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-100 dark:shadow-none"
        />
        <Button
          type="submit"
          size="lg"
          disabled={!canSend}
          className="self-center bg-teal-500 text-slate-900 hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-teal-500/60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          <span className="hidden sm:inline">{busy ? sendingLabel : sendLabel}</span>
        </Button>
      </div>
    </form>
  );
}
