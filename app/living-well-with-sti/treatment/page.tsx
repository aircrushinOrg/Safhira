"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../../i18n/routing";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Label} from "../../components/ui/label";
import {Input} from "../../components/ui/input";
import {Checkbox} from "../../components/ui/checkbox";
import {Badge} from "../../components/ui/badge";
import {Switch} from "../../components/ui/switch";
import {Separator} from "../../components/ui/separator";
import {AlertTriangle, Bell, Calendar, CheckCircle2, Clock, Pill, ShieldAlert, ArrowLeft} from "lucide-react";
import {Toaster} from "../../components/ui/sonner";
import {toast} from "sonner";
import {motion, useReducedMotion} from "framer-motion";

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
  const reduceMotion = useReducedMotion();

  const [regimen, setRegimen] = useState<RegimenType>("daily");
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    times: ["09:00"],
    days: [1, 2, 3, 4, 5, 6, 0],
    snoozeMinutes: null,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [tzChanged, setTzChanged] = useState(false);
  const [tracking, setTracking] = useState<Record<string, DayDose[]>>({});
  const lastNotifiedMinuteRef = useRef<string>("");

  // Load persisted state
  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.settings);
      if (s) {
        const parsed = JSON.parse(s) as ReminderSettings;
        setSettings((prev) => ({...prev, ...parsed}));
        const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (parsed.tz && parsed.tz !== currentTz) {
          setTzChanged(true);
        }
      }
      const r = localStorage.getItem(STORAGE_KEYS.regimen);
      if (r) setRegimen(r as RegimenType);
      const tr = localStorage.getItem(STORAGE_KEYS.tracking);
      if (tr) setTracking(JSON.parse(tr));
    } catch {}
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.regimen, regimen);
      localStorage.setItem(STORAGE_KEYS.tracking, JSON.stringify(tracking));
    } catch {}
  }, [settings, regimen, tracking]);

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

  const nextDose = useMemo(() => {
    const key = getTodayKey();
    const today = tracking[key] || [];
    const pending = today.filter((d) => d.status === "pending");
    if (pending.length === 0) return null;
    const now = new Date();
    const upcoming = pending
      .map((d) => ({...d, dt: localTimeToDateToday(d.time)}))
      .filter((x) => x.dt >= now)
      .sort((a, b) => a.dt.getTime() - b.dt.getTime());
    return upcoming[0] || null;
  }, [tracking]);

  const onTzBannerDismiss = () => {
    setTzChanged(false);
    setSettings((s) => ({...s, tz: Intl.DateTimeFormat().resolvedOptions().timeZone}));
  };

  const clearAll = () => {
    setTracking({});
    setSettings({enabled: false, times: ["09:00"], days: [1, 2, 3, 4, 5, 6, 0], snoozeMinutes: null, tz: Intl.DateTimeFormat().resolvedOptions().timeZone});
    setRegimen("daily");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Toaster richColors position="top-center" />

      <section className="py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.header className="mb-6 md:mb-8"
            initial={{opacity: 0, y: reduceMotion ? 0 : 8}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.4}}
          >
            <Link href="/living-well-with-sti" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4">
              <ArrowLeft size={16} />
              {t("back")}
            </Link>
            
            <div className="flex items-start gap-3 mb-3">
              <Pill className="text-teal-600 mt-1" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("adherence.title")}</h1>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{t("adherence.subtitle")}</p>
              </div>
            </div>
            
            <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800" role="note">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                <ShieldAlert className="mt-0.5" size={18} />
                <p className="text-sm leading-relaxed">
                  <strong>{t("disclaimer.title")}:</strong> {t("disclaimer.text")} {t("disclaimer.emergency")}
                </p>
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

          <div className="grid gap-6">
            {/* Adherence & Regimen */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35}}
            >
              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-teal-600" />
                  <h2 className="font-semibold text-lg">{t("adherence.title")}</h2>
                </div>

                <Label htmlFor="regimen" className="text-sm">{t("adherence.regimen.label")}</Label>
                <div id="regimen" className="mt-2 grid grid-cols-3 gap-2" role="radiogroup">
                  {(["single","daily","multi"] as RegimenType[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRegimen(key)}
                      aria-checked={regimen===key ? "true" : "false"}
                      role="radio"
                      className={`px-3 py-2 rounded-md border text-sm ${regimen===key?"border-teal-500 bg-teal-50 dark:bg-teal-900/20":"border-gray-200 dark:border-gray-700"}`}
                    >
                      {t(`adherence.regimen.options.${key}`)}
                    </button>
                  ))}
                </div>

                <Separator className="my-4" />

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
                  <div className="rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">
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
              <Card className="p-4 md:p-6">
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
                    <div className="mt-3 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-3" role="alert">
                      <p className="text-xs text-red-900 dark:text-red-100 leading-relaxed">
                        <strong>{t("sideEffects.urgent.title")}:</strong> {t("sideEffects.urgent.text")} <Link href="/rights" className="underline font-medium">{t("sideEffects.urgent.resources")}</Link>
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
              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="text-indigo-600" />
                  <h2 className="font-semibold text-lg">{t("reminders.title")}</h2>
                </div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{t("reminders.desc")}</p>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reminders-switch" className="text-sm">{t("reminders.enable")}</Label>
                    <Switch id="reminders-switch" checked={settings.enabled} onCheckedChange={(v) => setSettings((s) => ({...s, enabled: v}))} />
                  </div>
                </div>

                <fieldset aria-disabled={!settings.enabled ? "true" : "false"} className={!settings.enabled?"opacity-50 pointer-events-none":""}>
                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm">{t("reminders.times")}</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {settings.times.map((time, idx) => (
                          <div key={idx} className="flex items-center gap-2">
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
                                    onClick={() => setSettings((s) => ({...s, times: s.times.filter((_, i) => i !== idx)}))}>-
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setSettings((s) => ({...s, times: [...s.times, "18:00"]}))}>{t("reminders.addTime")}</Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">{t("reminders.days")}</Label>
                      <div className="grid grid-cols-7 gap-2 mt-2">
                        {[0,1,2,3,4,5,6].map((d) => (
                          <label key={d} className="inline-flex items-center gap-2 text-sm">
                            <Checkbox checked={settings.days.includes(d)} onCheckedChange={() => toggleDay(d)} />
                            <span>{t(`reminders.week.${d}`)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </fieldset>
              </Card>
            </motion.div>

            {/* Dose Tracking */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.15}}
            >
              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="text-emerald-600" />
                  <h2 className="font-semibold text-lg">{t("tracking.title")}</h2>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{t("tracking.desc")}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline"><Pill size={14} className="mr-1 inline" /> {t(`adherence.regimen.options.${regimen}`)}</Badge>
                  {nextDose ? (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      <Clock size={14} className="mr-1 inline" /> {t("tracking.next")} {nextDose.time}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{t("tracking.allDone")}</Badge>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {(tracking[getTodayKey()] || []).map((dose) => (
                    <li key={dose.time} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span className="font-medium">{dose.time}</span>
                        <span className="text-xs text-gray-500">{t(`tracking.status.${dose.status}`)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => markDose(dose.time, "taken")}>{t("tracking.actions.taken")}</Button>
                        <Button size="sm" variant="outline" onClick={() => markDose(dose.time, "missed")}>{t("tracking.actions.missed")}</Button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="rounded-md bg-slate-50 dark:bg-slate-900/40 border p-3">
                  <h3 className="text-sm font-medium mb-1">{t("catchup.title")}</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{t(`catchup.${regimen}.details`)}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2"><strong>{t("catchup.neverDoubleDose")}</strong></p>
                </div>
              </Card>
            </motion.div>

            {/* Governance */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 8}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35}}
            >
              <Card className="p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-gray-600 mt-1" size={18} />
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <p><strong>{t("governance.title")}</strong> {t("governance.reviewed")} <span className="ml-1">{t("governance.lastReviewed")}</span></p>
                    <p className="mt-1"><strong>{t("sources.title")}</strong> {t("sources.items.0")}; {t("sources.items.1")}</p>
                    <div className="mt-2">
                      <Button variant="ghost" size="sm" onClick={clearAll}>{t("privacy.clearLocal")}</Button>
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
