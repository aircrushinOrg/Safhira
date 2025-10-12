import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/app/components/ui/button";
import {
  Gamepad2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Compass,
  Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BreadcrumbTrail } from "@/app/components/BreadcrumbTrail";

const highlightConfigs: Array<{
  key: "practice" | "coaching" | "feedback";
  icon: LucideIcon;
}> = [
  { key: "practice", icon: MessageCircle },
  { key: "feedback", icon: Sparkles },
];

const pillarConfigs: Array<{
  key: "choose" | "build" | "review";
  icon: LucideIcon;
}> = [
  { key: "choose", icon: Compass },
  { key: "build", icon: Lightbulb },
  { key: "review", icon: Gamepad2 },
];

export default async function SimulatorLandingPage() {
  const t = await getTranslations("Simulator.landing");
  const tCommon = await getTranslations("Common");

  const breadcrumbs = [
    { label: tCommon("breadcrumbs.home"), href: "/" },
    { label: t("badge") },
  ];

  const highlights = highlightConfigs.map(({ key, icon }) => ({
    key,
    icon,
    title: t(`highlights.${key}.title`),
    description: t(`highlights.${key}.description`),
  }));

  const pillars = pillarConfigs.map(({ key, icon }) => ({
    key,
    icon,
    title: t(`pillars.${key}.title`),
    description: t(`pillars.${key}.description`),
  }));

  return (
    <div className="relative isolate overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-200/40 via-cyan-100/40 to-indigo-200/50 dark:from-teal-500/30 dark:via-cyan-500/10 dark:to-indigo-500/30" />
        <Image
          src="/simulator-background.png"
          alt="Illustration of the Safhira simulator environment"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30 mix-blend-multiply dark:opacity-20 dark:mix-blend-screen"
        />
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/60" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
        <BreadcrumbTrail items={breadcrumbs} />
        <div className="mt-4 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
              <Gamepad2 className="size-4" />
              {t("badge")}
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 dark:text-slate-50 md:text-5xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-slate-600 dark:text-slate-200 md:text-xl">
              {t("subtitle")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="bg-teal-500 text-slate-900 hover:bg-teal-400"
              >
                <Link href="/simulator/game" className="font-semibold">
                  {t("cta.primary")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-300 bg-slate-900/5 text-slate-900 hover:bg-slate-900/10 dark:border-slate-200/60 dark:bg-white/10 dark:text-slate-50 dark:hover:bg-slate-100/20"
              >
                <Link href="/simulator/npc-list" className="font-semibold">
                  {t("cta.secondary")}
                </Link>
              </Button>
            </div>

            <ul className="grid gap-4 text-sm text-slate-600 dark:text-slate-200 sm:grid-cols-2">
              {highlights.map(({ key, title, description, icon: Icon }) => (
                <li
                  key={key}
                  className="flex gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-white/5 dark:bg-slate-900/60 dark:shadow-slate-950/40"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-200">
                    <Icon className="size-5" />
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="relative mx-auto max-w-[100%]] rounded-[2.5rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_25px_70px_-25px_rgba(15,99,116,0.35)] dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_25px_70px_-25px_rgba(15,99,116,0.6)]">
              <div className="rounded-[2rem] border border-slate-200/60 bg-white/90 p-5 backdrop-blur dark:border-white/5 dark:bg-slate-900/80">
                <Image
                  src="/simulator-map.png"
                  alt="Safhira simulator map preview"
                  width={540}
                  height={540}
                  className="h-auto w-full rounded-[1.75rem] border border-slate-200/70 object-cover shadow-2xl dark:border-white/10"
                />
              </div>
            </div>

            <div className="absolute -left-6 bottom-8 hidden max-w-[260px] rounded-3xl border border-teal-400/40 bg-white/90 p-4 text-sm text-slate-700 shadow-xl shadow-teal-500/20 backdrop-blur-md dark:border-teal-400/30 dark:bg-slate-900/80 dark:text-slate-100 lg:flex">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-200">
                  <Sparkles className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-teal-700/70 dark:text-teal-200/80">
                    {t("liveFeedback.badge")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {t("liveFeedback.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3 md:px-6">
          {pillars.map(({ key, title, description, icon: Icon }) => (
            <div
              key={key}
              className="group relative flex h-full flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg shadow-slate-900/10 transition hover:border-teal-400/40 hover:bg-white dark:border-white/5 dark:bg-slate-900/60 dark:shadow-slate-950/40 dark:hover:bg-slate-900/80"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-600 transition group-hover:bg-teal-500/25 dark:text-teal-200">
                <Icon className="size-6" />
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="">
        <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/80 p-6 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <ShieldCheck className="size-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {t("aiDisclaimer.title")}
              </h3>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t("aiDisclaimer.description")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
