'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { getNpcAvatarPath } from '@/lib/simulator/npc-avatars';

type ChatPracticeHeaderProps = {
  npcId: string;
  npcName: string;
  npcRole: string;
  scenarioLabel: string;
  scenarioLabelPrefix: string;
};

export function ChatPracticeHeader({
  npcId,
  npcName,
  npcRole,
  scenarioLabel,
  scenarioLabelPrefix,
}: ChatPracticeHeaderProps) {
  const initials = npcName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  const avatarSrc = getNpcAvatarPath(npcId);

  return (
    <header className="relative flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-slate-200/70 shadow-sm dark:border-white/10">
          <AvatarImage src={avatarSrc} alt={`${npcName} avatar`} className="object-contain" />
          <AvatarFallback className="bg-slate-100 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-900/70 dark:text-slate-100">
            {initials || 'NPC'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{npcName}</h2>
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {npcRole}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end text-right">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {scenarioLabelPrefix}
        </span>
        <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200">
          {scenarioLabel}
        </span>
      </div>
    </header>
  );
}
