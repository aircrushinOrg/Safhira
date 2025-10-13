'use client';

type ChatPracticeHeaderProps = {
  npcName: string;
  npcRole: string;
  scenarioLabel: string;
  scenarioLabelPrefix: string;
};

export function ChatPracticeHeader({
  npcName,
  npcRole,
  scenarioLabel,
  scenarioLabelPrefix,
}: ChatPracticeHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 dark:border-white/5 dark:bg-slate-950/60">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{npcName}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{npcRole}</p>
      </div>
      <div className="flex flex-col items-end text-right text-xs text-slate-500 dark:text-slate-400">
        <span>
          {scenarioLabelPrefix}: {scenarioLabel}
        </span>
      </div>
    </header>
  );
}
