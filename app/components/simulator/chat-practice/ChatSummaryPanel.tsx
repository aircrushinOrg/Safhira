'use client';

import { Loader2, Sparkles, Brain, AlertTriangle, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { cn } from '@/app/components/ui/utils';

type ChatSummaryPanelProps = {
  sessionStatusClass: string;
  sessionStatusLabel: string;
  scores: {
    confidence: number;
    riskScore: number;
  };
  finalizing: boolean;
  reportProgress: number;
  onReset: () => void;
  onReportAction: () => void | Promise<void>;
  reportActionDisabled: boolean;
  finalReportAvailable: boolean;
  reportGenerated: boolean;
};

export function ChatSummaryPanel({
  sessionStatusClass,
  sessionStatusLabel,
  scores,
  finalizing,
  reportProgress,
  onReset,
  onReportAction,
  reportActionDisabled,
  finalReportAvailable,
  reportGenerated,
}: ChatSummaryPanelProps) {
  const t = useTranslations('Simulator.chatPractice');

  const confidenceLabel = t('metrics.confidence', { score: scores.confidence }).split(':')[0];
  const confidenceTooltip = t('metrics.confidenceTooltip');
  const riskLabel = t('metrics.riskScore', { score: scores.riskScore }).split(':')[0];
  const riskTooltip = t('metrics.riskScoreTooltip');
  const reportButtonLabel = finalizing
    ? t('buttons.finalScoresLoading')
    : finalReportAvailable || reportGenerated
      ? t('buttons.viewReport')
      : t('buttons.generateReport');

  return (
    <section className="space-y-4">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white/90 to-slate-50/80 px-6 py-4 text-xs text-slate-600 shadow-lg shadow-slate-900/10 dark:border-white/5 dark:from-slate-900/70 dark:to-slate-800/80 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-slate-500 dark:text-slate-400" />
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', sessionStatusClass)}>
            {t('labels.status')}: {sessionStatusLabel}
          </span>
        </div>

        <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-1 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-4 transition-colors dark:border-teal-800/30 dark:from-teal-900/20 dark:to-emerald-900/20">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-teal-100 text-teal-600 shadow-sm dark:bg-teal-800/40 dark:text-teal-200">
                    <Brain className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-teal-900 dark:text-teal-100">{confidenceLabel}</span>
                      <span className="text-sm font-bold text-teal-700 dark:text-teal-200">{scores.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-teal-100 dark:bg-teal-900/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out shadow-sm dark:from-teal-400 dark:to-emerald-500"
                      style={{ width: `${scores.confidence}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={12} className="max-w-xs text-left">
              {confidenceTooltip}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-1 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-colors dark:border-amber-800/30 dark:from-amber-900/20 dark:to-orange-900/20">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 shadow-sm dark:bg-amber-800/40 dark:text-amber-200">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">{riskLabel}</span>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-200">{scores.riskScore}%</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out shadow-sm dark:from-amber-400 dark:to-orange-500"
                      style={{ width: `${scores.riskScore}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={12} className="max-w-xs text-left">
              {riskTooltip}
            </TooltipContent>
          </Tooltip>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">{t('scoreDelayNotice')}</p>

        {finalizing && (
          <div className="w-full overflow-hidden rounded-2xl border border-teal-200/60 bg-teal-50/80 p-4 shadow-inner shadow-teal-500/10 backdrop-blur-sm dark:border-teal-500/30 dark:bg-teal-500/10">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-200">
              <Loader2 className="size-4 animate-spin" />
              {t('processing.finalizing')}
            </div>
            <div className="mt-3">
              <div className="relative">
                <Progress value={reportProgress} className="h-2 bg-teal-100/60 dark:bg-teal-900/40" />
                <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-80 mix-blend-overlay" />
                <div className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-teal-300/0 via-teal-300/40 to-teal-300/0" />
              </div>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-teal-600/80 dark:text-teal-200/70">
                {t('buttons.finalScoresLoading')}
              </p>
            </div>
          </div>
        )}

        <div className="ml-auto flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="justify-center border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t('buttons.reset')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              void onReportAction();
            }}
            disabled={reportActionDisabled}
            className="justify-center bg-teal-500 text-slate-900 hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-teal-500/60"
          >
            {finalizing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {reportButtonLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
