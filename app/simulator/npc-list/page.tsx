import { Button } from '@/app/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  getLocalizedScenarioTemplates,
  type ScenarioLocale,
} from '@/lib/simulator/scenarios';
import { Users } from 'lucide-react';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';

const npcAvatarById: Record<string, string> = {
  'classmate-both-01': '/simulator-landing-classmate-both-01.png',
  'doctor-boy-01': '/simulator-landing-doctor-boy-01.png',
  'doctor-girl-01': '/simulator-landing-doctor-girl-01r.png',
  'friend-boy-01': '/simulator-landing-friend-boy-01.png',
  'friend-girl-01': '/simulator-landing-friend-girl-01.png',
};

export default async function SimulatorNpcListPage() {
  const [t, locale] = await Promise.all([
    getTranslations('Simulator.npcList'),
    getLocale(),
  ]);
  const localizedTemplates = getLocalizedScenarioTemplates(locale as ScenarioLocale);

  return (
    <div className="relative isolate overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/40 via-cyan-100/40 to-indigo-200/50 dark:from-teal-500/20 dark:via-cyan-600/10 dark:to-indigo-700/30" />
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 md:px-6 md:py-20">
        <header className="space-y-4 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
            <Users className="size-4" />
            {t('badge')}
          </span>
          <h1 className="text-balance text-3xl font-semibold md:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto text-pretty text-base text-slate-600 dark:text-slate-300">
            {t('subtitle')}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {localizedTemplates.map(({ id, label, description, npc }) => (
            <article
              key={id}
              className="group flex h-full flex-col justify-between gap-6 rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-lg shadow-slate-900/10 backdrop-blur transition hover:border-teal-400/40 hover:bg-white dark:border-white/5 dark:bg-slate-900/70 dark:shadow-slate-950/40 dark:hover:bg-slate-900"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/10">
                    <Image
                      src={npcAvatarById[npc.id] ?? '/simulator-landing-classmate-both-01.png'}
                      alt={`${npc.name} avatar`}
                      fill
                      sizes="64px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:border-teal-400/20 dark:bg-teal-500/15 dark:text-teal-200">
                      {label}
                    </span>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                      {npc.name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{npc.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-teal-500 text-slate-900 hover:bg-teal-400"
                >
                  <Link href={`/simulator/chat?scenario=${id}&npc=${npc.id}`}>
                    {t('startChat')}
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
