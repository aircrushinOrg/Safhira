/**
 * Treatment adherence tracking page for individuals managing STI medications and care regimens.
 * This page provides tools for medication scheduling, dose tracking, appointment management, and adherence monitoring.
 * Features interactive medication calendar, reminder system, progress tracking, and educational resources for treatment compliance.
 */
"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations, useLocale} from "next-intl";
import {Link} from "../../../i18n/routing";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Label} from "../../components/ui/label";
import {Input} from "../../components/ui/input";
import {Checkbox} from "../../components/ui/checkbox";
import {Separator} from "../../components/ui/separator";
import {AlertTriangle, Bell, CheckCircle2, ShieldAlert, ArrowLeft, Pill, Clock, CalendarPlus, Sparkles, Droplets} from "lucide-react";
import {Toaster} from "../../components/ui/sonner";
import {toast} from "sonner";
import {motion, useReducedMotion} from "framer-motion";
import BreadcrumbTrail from "../../components/BreadcrumbTrail";

type RegimenType = "single" | "daily" | "multi";

type ReminderSettings = {
  enabled: boolean;
  times: string[];
  days: number[];
  snoozeMinutes: number | null;
  pauseFrom?: string;
  pauseTo?: string;
  tz?: string;
};

type DoseStatus = "pending" | "taken" | "missed";

type DayDose = {
  time: string;
  status: DoseStatus;
};

const DEFAULT_DAYS: ReadonlyArray<number> = [1, 2, 3, 4, 5, 6, 0];

function createDefaultSettings(): ReminderSettings {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    enabled: true,
    times: [],
    days: [...DEFAULT_DAYS],
    snoozeMinutes: null,
    tz: timezone,
  };
}

const STORAGE_KEYS = {
  settings: "lwsti_settings",
  regimen: "lwsti_regimen",
  tracking: "lwsti_tracking",
};

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function inPauseRange(settings: ReminderSettings, now = new Date()) {
  if (!settings.pauseFrom || !settings.pauseTo) return false;
  const from = new Date(settings.pauseFrom + "T00:00:00");
  const to = new Date(settings.pauseTo + "T23:59:59");
  return now >= from && now <= to;
}

function localTimeToDateToday(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}

export default function TreatmentAdherencePage() {
  const t = useTranslations("LivingWell");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const tBreadcrumbs = useTranslations('Common.breadcrumbs');

  const [regimen, setRegimen] = useState<RegimenType>("daily");
  const [settings, setSettings] = useState<ReminderSettings>(() => createDefaultSettings());
  const [tzChanged, setTzChanged] = useState(false);
  const [tracking, setTracking] = useState<Record<string, DayDose[]>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const lastNotifiedMinuteRef = useRef<string>("");

  const dayNames = useMemo(() => settings.days.map((d) => t(`reminders.week.${d}`)), [settings.days, t]);
  const regimenLabel = useMemo(() => t(`adherence.regimen.options.${regimen}`), [regimen, t]);
  const upcomingDose = useMemo(() => {
    if (!settings.times.length) return null;
    const sortedTimes = [...settings.times].sort();
    const soonest = sortedTimes[0];
    const nextTime = nextOccurrence(soonest, settings.days);
    return {
      label: soonest,
      date: nextTime,
    };
  }, [settings.times, settings.days]);
  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale ?? undefined, {
    weekday: 'short',
  }), [locale]);
  const timeFormatter = useMemo(() => new Intl.DateTimeFormat(locale ?? undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }), [locale]);
  const heroStats = useMemo(() => [
    {
      label: t('adherence.regimen.label'),
      value: regimenLabel,
      icon: Pill,
    },
    {
      label: t('reminders.times'),
      value: settings.times.length ? settings.times.join(', ') : t('reminders.addTime'),
      icon: Clock,
    },
    upcomingDose
      ? {
          label: 'Next dose',
          value: `${weekdayFormatter.format(upcomingDose.date)} • ${timeFormatter.format(upcomingDose.date)}`,
          icon: Droplets,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof Pill }> , [regimenLabel, settings.times, t, upcomingDose, weekdayFormatter, timeFormatter]);

  // Load persisted state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const storedSettings = localStorage.getItem(STORAGE_KEYS.settings);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings) as ReminderSettings;
        setSettings((prev) => {
          const base = createDefaultSettings();
          return {
            ...base,
            ...parsed,
            days: Array.isArray(parsed.days) ? parsed.days : base.days,
            enabled: true,
          };
        });
        if (parsed.tz && parsed.tz !== currentTz) {
          setTzChanged(true);
        }
      } else {
        setSettings(createDefaultSettings());
      }

      const storedRegimen = localStorage.getItem(STORAGE_KEYS.regimen) as RegimenType | null;
      if (storedRegimen && ["single", "daily", "multi"].includes(storedRegimen)) {
        setRegimen(storedRegimen);
      }

      const storedTracking = localStorage.getItem(STORAGE_KEYS.tracking);
      if (storedTracking) {
        setTracking(JSON.parse(storedTracking));
      }
    } catch (error) {
      console.error("Failed to restore treatment settings from localStorage", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Persist state
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.regimen, regimen);
      localStorage.setItem(STORAGE_KEYS.tracking, JSON.stringify(tracking));
    } catch {}
  }, [settings, regimen, tracking, isInitialized]);

  // Ensure today entry exists when times change
  useEffect(() => {
    const key = getTodayKey();
    const today = tracking[key] || settings.times.map((time) => ({time, status: "pending" as DoseStatus}));
    const byTime = new Map(today.map((d) => [d.time, d.status] as const));
    const normalized = settings.times.map((t) => ({time: t, status: (byTime.get(t) || "pending") as DoseStatus}));
    setTracking((prev) => ({...prev, [key]: normalized}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.times]);

  // Reminder engine
  useEffect(() => {
    if (!settings.enabled) return;
    const id = setInterval(() => {
      const now = new Date();
      if (inPauseRange(settings, now)) return;
      const dow = now.getDay();
      if (!settings.days.includes(dow)) return;

      const minuteKey = now.toISOString().slice(0, 16);
      if (lastNotifiedMinuteRef.current === minuteKey) return;

      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const current = `${hh}:${mm}`;
      if (settings.times.includes(current)) {
        lastNotifiedMinuteRef.current = minuteKey;
        toast(t("reminders.toast.title"), {
          description: t("reminders.toast.desc"),
          action: {
            label: t("tracking.actions.taken"),
            onClick: () => markDose(current, "taken")
          }
        });
      }
    }, 1000 * 20);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const markDose = (time: string, status: DoseStatus) => {
    const key = getTodayKey();
    setTracking((prev) => {
      const today = prev[key] || [];
      const next = today.map((d) => (d.time === time ? {...d, status} : d));
      return {...prev, [key]: next};
    });
    if (status === "missed") {
      toast(t("tracking.toast.missed"), {description: t(`catchup.${regimen}.summary`)});
    }
  };

  // Dose tracking UI removed — next dose computation no longer needed

  const onTzBannerDismiss = () => {
    setTzChanged(false);
    setSettings((s) => ({...s, tz: Intl.DateTimeFormat().resolvedOptions().timeZone}));
  };

  const clearAll = () => {
    const defaults = createDefaultSettings();
    setTracking({});
    setSettings(defaults);
    setRegimen("daily");
    setTzChanged(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.settings);
      localStorage.removeItem(STORAGE_KEYS.regimen);
      localStorage.removeItem(STORAGE_KEYS.tracking);
    } catch {}
  };

  const toggleDay = (idx: number) => {
    setSettings((s) => {
      const set = new Set(s.days);
      if (set.has(idx)) set.delete(idx); else set.add(idx);
      return {...s, days: Array.from(set).sort()};
    });
  };

  // Compute next occurrence for a given HH:mm within selected days
  function nextOccurrence(time: string, days: number[]) {
    const [hh, mm] = time.split(":").map(Number);
    const now = new Date();
    for (let i = 0; i < 14; i++) { // search up to 2 weeks ahead
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      d.setHours(hh, mm, 0, 0);
      const dow = d.getDay();
      if (days.includes(dow) && d > now) return d;
    }
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d;
  }

  // Format to ICS local (floating) time: YYYYMMDDTHHMMSS
  const icsLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  };

  const icsUtc = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      d.getUTCFullYear().toString() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
    );
  };

  const byDayParam = (days: number[]) => {
    const map: Record<number, string> = {0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA'};
    const ordered = [1,2,3,4,5,6,0];
    const selected = ordered.filter((d) => days.includes(d)).map((d) => map[d]);
    if (selected.length === 7) return '';
    if (selected.length === 0) return '';
    return `;BYDAY=${selected.join(',')}`;
  };

  const buildICS = (times: string[], days: number[]) => {
    const now = new Date();
    const dtstamp = icsUtc(now);
    const byday = byDayParam(days);
    const freq = days.length === 7 ? 'DAILY' : 'WEEKLY';
    const summary = t("reminders.calendar.eventTitle");
    const description = t("reminders.calendar.eventDesc");
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Safhira//Medication Reminders//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];
    times.forEach((time) => {
      const start = nextOccurrence(time, days);
      const uid = `${start.getTime()}-${time.replace(':','')}-${Math.random().toString(36).slice(2)}@safhira`;
      const dtstart = icsLocal(start);
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        'DURATION:PT15M',
        `RRULE:FREQ=${freq}${byday}`,
        `SUMMARY:${summary.replace(/\r?\n/g, ' ')}`,
        `DESCRIPTION:${description.replace(/\r?\n/g, ' ')}`,
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  const downloadICS = (filename: string, content: string) => {
    try {
      const blob = new Blob([content], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success(t('reminders.calendar.toastCreated'));
    } catch (e) {
      // no-op
    }
  };

  const addTimesToCalendar = (times: string[]) => {
    const ics = buildICS(times, settings.days);
    const name = times.length > 1 ? 'sti-reminders.ics' : `sti-reminder-${times[0].replace(':','')}.ics`;
    downloadICS(name, ics);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="absolute -top-24 -right-20 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-rose-300/40 via-amber-200/30 to-teal-200/50 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="absolute -bottom-32 left-0 h-[360px] w-[360px] rounded-full bg-gradient-to-br from-teal-400/30 via-sky-300/40 to-indigo-300/30 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 1.1, delay: 0.8 }}
          className="absolute inset-x-0 top-1/2 h-[220px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.28),_transparent_70%)]"
        />
      </div>
      <Toaster richColors position="top-center" />

      <section className="relative py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <BreadcrumbTrail
            items={[
              {label: tBreadcrumbs('home'), href: '/'},
              {label: tBreadcrumbs('livingWell'), href: '/living-well-with-sti'},
              {label: tBreadcrumbs('livingWellTreatment')},
            ]}
          />
          <motion.header className="relative z-10 mb-8 md:mb-12 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg shadow-rose-200/40 backdrop-blur dark:border-teal-950/40 dark:bg-teal-950/40 dark:shadow-black/40 md:p-8"
            initial={{opacity: 0, y: reduceMotion ? 0 : 8}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.4}}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Link href="/living-well-with-sti" className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50/80 px-4 py-2 text-xs font-medium uppercase tracking-wide text-teal-700 transition hover:-translate-x-1 hover:text-teal-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <ArrowLeft size={16} />
                  {t("back")}
                </Link>
                <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-200">
                  <Sparkles className="h-4 w-4" />
                  {t('adherence.subtitle')}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)]">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-400 text-white shadow-lg shadow-teal-500/40">
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-gray-900 drop-shadow-sm dark:text-white md:text-4xl">
                        {t("adherence.title")}
                      </h1>
                      <p className="mt-2 max-w-xl text-base text-slate-700 dark:text-slate-200">
                        {t("adherence.subtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-100/90 via-white/80 to-orange-100/70 p-4 shadow-inner dark:border-amber-700/50 dark:from-amber-500/10 dark:via-teal-950/30 dark:to-orange-500/10">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-orange-200/50 blur-2xl dark:bg-amber-500/20" />
                    <div className="flex items-start gap-3 text-sm text-amber-900 dark:text-amber-100">
                      <ShieldAlert className="mt-0.5" size={18} />
                      <p className="leading-relaxed">
                        <strong>{t("disclaimer.title")}:</strong> {t("disclaimer.text")} {t("disclaimer.emergency")}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.2 }}
                  className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl shadow-slate-300/60 backdrop-blur md:p-6 dark:border-teal-900/40 dark:bg-slate-900/70 dark:shadow-black/40"
                >
                  <div className="absolute inset-x-6 top-4 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />
                  <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
                    <Sparkles className="h-4 w-4" />
                    Wellness Snapshot
                  </div>
                  <div className="grid gap-3">
                    {heroStats.map(({ label, value, icon: Icon }, index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.15 * index }}
                        className="group flex items-center justify-between rounded-2xl border border-teal-100/60 bg-gradient-to-r from-teal-50/70 via-white/70 to-white/70 px-4 py-3 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 dark:border-teal-900/40 dark:from-teal-900/40 dark:via-teal-950/40 dark:to-slate-950/40"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600 transition group-hover:bg-teal-500/20 dark:text-teal-200">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{label}</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
                          </div>
                        </div>
                        <Sparkles className="h-4 w-4 text-teal-400 opacity-0 transition group-hover:opacity-100" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {tzChanged && (
            <div className="mb-4" role="status" aria-live="polite">
              <Card className="p-3 border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-2 text-blue-800 dark:text-blue-100">
                  <Clock size={18} className="mt-0.5" />
                  <div className="text-sm">
                    <p>{t("reminders.tzChanged")}</p>
                    <div className="mt-2">
                      <Button size="sm" onClick={onTzBannerDismiss}>{t("reminders.tzDismiss")}</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="relative z-10 grid gap-8">
            {/* Adherence & Regimen */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35}}
            >
              <Card className="relative overflow-hidden rounded-3xl border border-teal-100/70 bg-white/85 p-6 shadow-md shadow-teal-100/40 backdrop-blur-sm md:p-8 dark:border-teal-900/40 dark:bg-teal-950/45 dark:shadow-black/30">
                <div className="pointer-events-none absolute -right-12 top-6 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-200/25 to-teal-400/20 blur-3xl dark:from-emerald-500/10 dark:to-teal-500/15" />
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-teal-600" />
                  <h2 className="font-semibold text-lg">{t("adherence.title")}</h2>
                </div>

                <Label htmlFor="regimen" className="text-sm">{t("adherence.regimen.label")}</Label>
                <div id="regimen" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(["single","daily","multi"] as RegimenType[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRegimen(key)}
                      className={`relative overflow-hidden rounded-xl border px-3 py-3 text-sm font-medium transition ${regimen===key?"border-teal-500 bg-gradient-to-br from-teal-100 via-white to-teal-50 shadow-lg dark:from-teal-900/40 dark:via-teal-950/40 dark:to-emerald-900/20":"border-slate-200 bg-white/60 hover:border-teal-200 hover:bg-teal-50/60 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-emerald-700"}`}
                    >
                      {t(`adherence.regimen.options.${key}`)}
                    </button>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{t(`adherence.${regimen}.overview`)}</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <h3 className="font-medium text-sm mb-2">{t("adherence.dos.title")}</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {(t.raw(`adherence.${regimen}.dos`) as string[]).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-2">{t("adherence.donts.title")}</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {(t.raw(`adherence.${regimen}.donts`) as string[]).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-slate-50 to-sky-100/60 p-4 shadow-inner dark:border-blue-800/60 dark:from-slate-900/40 dark:via-slate-950/40 dark:to-blue-900/20">
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      {t("interactions.caution")} <em>{t("interactions.confirm")}</em>
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Side Effects */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.05}}
            >
              <Card className="relative overflow-hidden rounded-3xl border border-rose-100/60 bg-white/85 p-6 shadow-md shadow-rose-100/40 backdrop-blur-sm md:p-8 dark:border-rose-900/40 dark:bg-rose-950/40 dark:shadow-black/30">
                <div className="pointer-events-none absolute -left-12 top-10 h-36 w-36 rounded-full bg-rose-200/25 blur-3xl dark:bg-rose-500/10" />
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-rose-500" />
                  <h2 className="font-semibold text-lg">{t("sideEffects.title")}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("sideEffects.commonTitle")}</h3>
                    <ul className="space-y-2">
                      {(t.raw("sideEffects.common") as string[]).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle2 size={16} className="text-emerald-600 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("sideEffects.redFlagTitle")}</h3>
                    <ul className="space-y-2">
                      {(t.raw("sideEffects.redFlags") as string[]).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 rounded-xl border border-red-300/70 bg-gradient-to-br from-red-100/90 via-rose-50 to-white/80 p-4 shadow-inner dark:border-red-900/60 dark:from-red-900/40 dark:via-rose-950/40 dark:to-slate-950/40" role="alert">
                      <p className="text-xs text-red-900 dark:text-red-100 leading-relaxed">
                        <strong>{t("sideEffects.urgent.title")}:</strong> {t("sideEffects.urgent.text")} <Link href="/find-healthcare" className="underline font-medium">{t("sideEffects.urgent.resources")}</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Reminders */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.1}}
            >
              <Card className="relative overflow-hidden rounded-3xl border border-indigo-100/60 bg-white/85 p-6 shadow-md shadow-indigo-100/30 backdrop-blur-sm md:p-8 dark:border-indigo-900/40 dark:bg-indigo-950/35 dark:shadow-black/30">
                <div className="pointer-events-none absolute right-6 top-6 h-32 w-32 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/15" />
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="text-indigo-600" />
                  <h2 className="font-semibold text-lg">{t("reminders.title")}</h2>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{t("reminders.desc")}</p>
                </div>

                <fieldset>
                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm">{t("reminders.times")}</Label>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {settings.times.map((time, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white/70 px-3 py-2 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-900/20">
                            <Input
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSettings((s) => ({...s, times: s.times.map((t, i) => (i === idx ? v : t))}));
                              }}
                              className="w-28"
                            />
                            <Button variant="outline" size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setSettings((s) => ({...s, times: s.times.filter((_, i) => i !== idx)}))}>-
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSettings((s) => ({...s, times: [...s.times, "18:00"]}));
                          }}
                        >
                          {t("reminders.addTime")}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">{t("reminders.days")}</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7 mt-3">
                        {[0,1,2,3,4,5,6].map((d) => (
                          <label key={d} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${settings.days.includes(d) ? "border-indigo-400 bg-indigo-400/10 text-indigo-600 dark:border-indigo-400/50 dark:bg-indigo-500/30 dark:text-indigo-200" : "border-slate-200 bg-white/70 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/40"}`}>
                            <Checkbox checked={settings.days.includes(d)} onCheckedChange={() => toggleDay(d)} />
                            <span>{t(`reminders.week.${d}`)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2 text-white shadow-md shadow-teal-300/30 hover:from-teal-600 hover:to-emerald-600"
                        size="sm"
                        onClick={() => {
                          if (!settings.times || settings.times.length === 0) {
                          toast(t("reminders.addTime"), { description: t("reminders.desc") });
                            return;
                          }
                          addTimesToCalendar(settings.times);
                        }}
                      >
                        <CalendarPlus size={16} /> {t('reminders.calendar.add')}
                      </Button>
                    </div>
                  </div>
                </fieldset>
              </Card>
            </motion.div>

            {/* Dose Tracking UI removed per request */}

            {/* Governance */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 8}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35}}
            >
              <Card className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/85 p-6 shadow-md shadow-slate-200/40 backdrop-blur-sm md:p-8 dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-black/30">
                <div className="pointer-events-none absolute inset-x-6 bottom-2 h-px bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-gray-600 mt-1" size={18} />
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <p><strong>{t("governance.title")}</strong> {t("governance.reviewed")}</p>
                    <p className="mt-1"><strong>{t("sources.title")}</strong> {t("sources.items.0")}; {t("sources.items.1")}</p>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="rounded-full border border-rose-300/70 bg-gradient-to-r from-rose-100 via-white to-rose-50 px-4 py-2 text-rose-700 shadow-sm hover:from-rose-200 hover:to-rose-100 dark:border-rose-800/50 dark:bg-rose-900/30 dark:text-rose-200"
                        onClick={clearAll}
                      >
                        {t("privacy.clearLocal")}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
