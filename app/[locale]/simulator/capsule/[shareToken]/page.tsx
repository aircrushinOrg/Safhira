import { notFound } from 'next/navigation';
import { Award, Sparkles, ArrowRight, Calendar, Eye } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

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

type SessionInfo = {
  scenarioTitle: string | null;
  scenarioSetting: string | null;
  npcName: string;
  npcRole: string;
  completedAt: string | null;
};

type CapsuleData = {
  sessionInfo: SessionInfo | null;
  narrativeSummary: string;
  suggestedNextScenarios: NextScenario[];
  snippets: Snippet[];
  toneMetrics: {
    confidence: number;
    riskScore: number;
    notes: string;
  } | null;
  expiresAt: string | null;
  completedAt: string | null;
};

async function getCapsule(shareToken: string): Promise<CapsuleData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ai-scenarios/capsule/${shareToken}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch capsule:', error);
    return null;
  }
}

export default async function CapsulePage({
  params,
}: {
  params: Promise<{ shareToken: string; locale: string }>;
}) {
  const { shareToken } = await params;
  const capsule = await getCapsule(shareToken);

  if (!capsule) {
    notFound();
  }

  const t = await getTranslations('Simulator.chatPractice');

  const completedDate = capsule.completedAt
    ? new Date(capsule.completedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 dark:shadow-slate-950/40">
        <div className="mb-8 flex items-center gap-6">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30">
            <Award className="size-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {capsule.sessionInfo?.scenarioTitle || 'Practice Session Report'}
            </h1>
            {capsule.sessionInfo?.npcName && (
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Conversation with {capsule.sessionInfo.npcName} • {capsule.sessionInfo.npcRole}
              </p>
            )}
            {completedDate && (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="size-4" />
                {completedDate}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-sky-50 p-6 dark:border-teal-800/30 dark:from-teal-900/20 dark:to-sky-900/20">
            <h2 className="mb-4 text-xl font-semibold text-teal-900 dark:text-teal-100">
              Your Learning Journey
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-teal-800 dark:text-teal-200">
              {capsule.narrativeSummary}
            </p>
          </div>

          {capsule.toneMetrics && (
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:border-slate-700/60 dark:from-slate-800/50 dark:to-slate-700/50">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-4 dark:border-teal-800/30 dark:from-teal-900/20 dark:to-emerald-900/20">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-teal-900 dark:text-teal-100">
                      Confidence
                    </span>
                    <span className="text-xl font-bold text-teal-700 dark:text-teal-200">
                      {capsule.toneMetrics.confidence}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-teal-100 dark:bg-teal-900/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                      style={{ width: `${capsule.toneMetrics.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-800/30 dark:from-amber-900/20 dark:to-orange-900/20">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Risk Score
                    </span>
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-200">
                      {capsule.toneMetrics.riskScore}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                      style={{ width: `${capsule.toneMetrics.riskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {capsule.snippets && capsule.snippets.length > 0 && (
            <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-md">
                  <Sparkles className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Key Moments
                </h3>
              </div>
              <div className="space-y-4">
                {capsule.snippets.map((snippet, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-purple-200 bg-white p-4 dark:border-purple-700/30 dark:bg-purple-950/30"
                  >
                    <p className="mb-2 italic text-purple-800 dark:text-purple-200">
                      &ldquo;{snippet.content}&rdquo;
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{snippet.annotation}</p>
                    {snippet.impactReason && (
                      <span className="mt-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700 dark:bg-purple-800/40 dark:text-purple-200">
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
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Suggested Next Scenarios
                </h3>
              </div>
              <div className="space-y-3">
                {capsule.suggestedNextScenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-indigo-200 bg-white p-4 dark:border-indigo-700/30 dark:bg-indigo-950/30"
                  >
                    <h4 className="mb-1 font-semibold text-indigo-900 dark:text-indigo-100">
                      {scenario.title}
                    </h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">{scenario.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            <p className="flex items-center justify-center gap-2">
              <Eye className="size-4" />
              This capsule is a shareable summary created by Safhira AI
            </p>
            {capsule.expiresAt && (
              <p className="mt-1 text-xs">
                Expires on{' '}
                {new Date(capsule.expiresAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
