'use client';

import { useState } from 'react';
import { Award, BarChart3, Brain, AlertTriangle, CheckCircle, TrendingUp, BookOpen, Download, X, Share2, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';

import { type ApiFinalReport } from './types';

type Snippet = {
  turnIndex: number;
  role: string;
  content: string;
  annotation: string;
  impactReason: string;
};

type NextScenario = {
  scenarioId: string;
  title: string;
  reason: string;
};

type Capsule = {
  shareUrl: string;
  narrativeSummary: string;
  suggestedNextScenarios: NextScenario[];
  snippets?: Snippet[];
};

type ChatFinalReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalReport: ApiFinalReport;
  displayedScore: {
    confidence: number;
    riskScore: number;
  };
  onDownload: () => void | Promise<void>;
  sessionId?: string | null;
};

export function ChatFinalReportDialog({
  open,
  onOpenChange,
  finalReport,
  displayedScore,
  onDownload,
  sessionId,
}: ChatFinalReportDialogProps) {
  const t = useTranslations('Simulator.chatPractice');
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loadingCapsule, setLoadingCapsule] = useState(false);
  const [capsuleError, setCapsuleError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const confidenceLabel = t('metrics.confidence', { score: displayedScore.confidence }).split(':')[0];
  const riskLabel = t('metrics.riskScore', { score: displayedScore.riskScore }).split(':')[0];

  async function handleShareCapsule() {
    if (!sessionId || loadingCapsule) return;

    try {
      setLoadingCapsule(true);
      setCapsuleError(null);

      const response = await fetch(`/api/ai-scenarios/session/${sessionId}/capsule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiryDays: 30 }),
      });

      if (!response.ok) {
        throw new Error('Failed to create capsule');
      }

      const data = await response.json();

      const snippetsResponse = await fetch(`/api/ai-scenarios/session/${sessionId}/snippets`);
      const snippetsData = snippetsResponse.ok ? await snippetsResponse.json() : { snippets: [] };

      setCapsule({
        shareUrl: data.shareUrl,
        narrativeSummary: data.narrativeSummary,
        suggestedNextScenarios: data.suggestedNextScenarios || [],
        snippets: snippetsData.snippets || [],
      });
    } catch (error) {
      console.error('Failed to create capsule:', error);
      setCapsuleError(t('dialog.capsuleError'));
    } finally {
      setLoadingCapsule(false);
    }
  }

  function handleCopyLink() {
    if (!capsule?.shareUrl) return;

    navigator.clipboard.writeText(capsule.shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <Dialog open={open && Boolean(finalReport)} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-1/2 top-[55%] z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 transform max-h-[85vh] overflow-y-auto rounded-3xl border-0 bg-gradient-to-br from-white to-slate-50 text-slate-800 shadow-xl shadow-slate-900/20 dark:from-slate-900 dark:to-slate-800 dark:text-slate-50 dark:shadow-slate-950/40">
        <DialogHeader className="space-y-4 border-b border-slate-200/60 pb-6 dark:border-slate-700/60">
          <div className="flex items-center gap-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30">
              <Award className="size-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left text-2xl font-bold text-slate-900 dark:text-slate-50">
                {t('dialog.title')}
              </DialogTitle>
              <DialogDescription className="mt-1 text-left text-slate-600 dark:text-slate-300">
                {t('dialog.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {finalReport ? (
          <div className="py-6 space-y-6 text-slate-700 dark:text-slate-200">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:from-slate-800/50 dark:to-slate-700/50">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md">
                  <BarChart3 className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {t('dialog.performanceMetrics')}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-4 dark:border-teal-800/30 dark:from-teal-900/20 dark:to-emerald-900/20">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-teal-100 text-teal-600 shadow-sm dark:bg-teal-800/40 dark:text-teal-200">
                      <Brain className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-teal-900 dark:text-teal-100">{confidenceLabel}</span>
                        <span className="text-xl font-bold text-teal-700 dark:text-teal-200">{displayedScore.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-teal-100 dark:bg-teal-900/30">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out shadow-sm dark:from-teal-400 dark:to-emerald-500"
                        style={{ width: `${displayedScore.confidence}%` }}
                      />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-800/30 dark:from-amber-900/20 dark:to-orange-900/20">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 shadow-sm dark:bg-amber-800/40 dark:text-amber-200">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">{riskLabel}</span>
                        <span className="text-xl font-bold text-amber-700 dark:text-amber-200">{displayedScore.riskScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out shadow-sm dark:from-amber-400 dark:to-orange-500"
                        style={{ width: `${displayedScore.riskScore}%` }}
                      />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-sky-50 p-6 dark:border-teal-800/30 dark:from-teal-900/20 dark:to-sky-900/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md">
                  <CheckCircle className="size-5" />
                </div>
                <h3 className="font-semibold text-teal-900 dark:text-teal-100">{t('dialog.sections.overall')}</h3>
              </div>
              <p className="leading-relaxed text-teal-800 dark:text-teal-200">{finalReport.overallAssessment}</p>
            </div>

            {finalReport.strengths.length > 0 && (
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 dark:border-emerald-800/30 dark:from-emerald-900/20 dark:to-teal-900/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                    <CheckCircle className="size-5" />
                  </div>
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">{t('dialog.sections.strengths')}</h3>
                </div>
                <ul className="space-y-2">
                  {finalReport.strengths.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-emerald-800 dark:text-emerald-200">
                      <CheckCircle className="mt-0.5 size-4 flex-shrink-0 text-emerald-500" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {finalReport.areasForGrowth.length > 0 && (
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-6 dark:border-amber-800/30 dark:from-amber-900/20 dark:to-orange-900/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                    <TrendingUp className="size-5" />
                  </div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">{t('dialog.sections.areas')}</h3>
                </div>
                <ul className="space-y-2">
                  {finalReport.areasForGrowth.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                      <TrendingUp className="mt-0.5 size-4 flex-shrink-0 text-amber-500" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {finalReport.recommendedPractice.length > 0 && (
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-6 dark:border-sky-800/30 dark:from-sky-900/20 dark:to-cyan-900/20">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 shadow-md dark:bg-sky-800/40 dark:text-sky-200">
                    <BookOpen className="size-5" />
                  </div>
                  <h3 className="font-semibold text-sky-900 dark:text-sky-100">{t('dialog.sections.recommended')}</h3>
                </div>
                <ul className="space-y-2">
                  {finalReport.recommendedPractice.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sky-800 dark:text-sky-200">
                      <BookOpen className="mt-0.5 size-4 flex-shrink-0 text-sky-500" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {capsule && (
              <>
                {capsule.snippets && capsule.snippets.length > 0 && (
                  <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-md">
                        <Sparkles className="size-5" />
                      </div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">{t('dialog.sections.keyMoments')}</h3>
                    </div>
                    <div className="space-y-4">
                      {capsule.snippets.map((snippet, index) => (
                        <div key={index} className="rounded-xl border border-purple-200 bg-white p-4 dark:border-purple-700/30 dark:bg-purple-950/30">
                          <p className="mb-2 italic text-purple-800 dark:text-purple-200">&ldquo;{snippet.content}&rdquo;</p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">{snippet.annotation}</p>
                          {snippet.impactReason && (
                            <span className="mt-2 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-800/40 dark:text-purple-200">
                              {snippet.impactReason}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {capsule.suggestedNextScenarios && capsule.suggestedNextScenarios.length > 0 && (
                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 dark:border-indigo-800/30 dark:from-indigo-900/20 dark:to-blue-900/20">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-md">
                        <ArrowRight className="size-5" />
                      </div>
                      <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">{t('dialog.sections.nextSteps')}</h3>
                    </div>
                    <div className="space-y-3">
                      {capsule.suggestedNextScenarios.map((scenario, index) => (
                        <div key={index} className="rounded-xl border border-indigo-200 bg-white p-4 dark:border-indigo-700/30 dark:bg-indigo-950/30">
                          <h4 className="mb-1 font-semibold text-indigo-900 dark:text-indigo-100">{scenario.title}</h4>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300">{scenario.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {capsule.shareUrl && (
                  <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 p-4 dark:border-teal-800/30 dark:from-teal-900/20 dark:to-emerald-900/20">
                    <p className="mb-2 text-sm font-semibold text-teal-900 dark:text-teal-100">{t('dialog.capsuleCreated')}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={capsule.shareUrl}
                        className="flex-1 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm text-teal-800 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-200"
                      />
                      <Button
                        size="sm"
                        onClick={handleCopyLink}
                        className="bg-teal-500 hover:bg-teal-600"
                      >
                        {linkCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        {linkCopied ? t('dialog.linkCopied') : t('dialog.copyLink')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {capsuleError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
                {capsuleError}
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="flex flex-col gap-3 border-t border-slate-200/60 pt-6 dark:border-slate-700/60 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="order-3 flex items-center gap-2 sm:order-1"
          >
            <X className="size-4" />
            {t('dialog.close')}
          </Button>
          <Button
            disabled={!finalReport || !sessionId || loadingCapsule}
            onClick={() => {
              void handleShareCapsule();
            }}
            className="order-2 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600 sm:order-2"
          >
            {loadingCapsule ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('dialog.sharing')}
              </>
            ) : (
              <>
                <Share2 className="size-4" />
                {t('dialog.share')}
              </>
            )}
          </Button>
          <Button
            disabled={!finalReport}
            onClick={() => {
              void onDownload();
            }}
            className="order-1 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg hover:from-teal-600 hover:to-emerald-600 sm:order-3"
          >
            <Download className="size-4" />
            {t('dialog.download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
