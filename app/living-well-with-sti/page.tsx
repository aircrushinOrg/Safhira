"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../i18n/routing";
import {Card} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Label} from "../components/ui/label";
import {Input} from "../components/ui/input";
import {Checkbox} from "../components/ui/checkbox";
import {Badge} from "../components/ui/badge";
import {Switch} from "../components/ui/switch";
import {Separator} from "../components/ui/separator";
import {AlertTriangle, Bell, Calendar, CheckCircle2, Clock, Heart, Pill, ShieldAlert, Bookmark, BookmarkCheck, Flag, ExternalLink, Copy} from "lucide-react";
import {Toaster} from "../components/ui/sonner";
import {toast} from "sonner";
import {motion, useReducedMotion} from "framer-motion";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../components/ui/dialog";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "../components/ui/alert-dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../components/ui/select";
import {Textarea} from "../components/ui/textarea";

type RegimenType = "single" | "daily" | "multi";

type ReminderSettings = {
  enabled: boolean;
  times: string[]; // HH:mm (local)
  days: number[]; // 0-6, Sunday=0
  snoozeMinutes: number | null;
  pauseFrom?: string; // YYYY-MM-DD
  pauseTo?: string; // YYYY-MM-DD
  tz?: string; // IANA timezone
};

type DoseStatus = "pending" | "taken" | "missed";

type DayDose = {
  time: string; // HH:mm
  status: DoseStatus;
};

const STORAGE_KEYS = {
  settings: "lwsti_settings",
  regimen: "lwsti_regimen",
  tracking: "lwsti_tracking", // per-day map
  bookmarks: "lwsti_bookmarks",
  reports: "lwsti_reports"
};

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
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

export default function LivingWellWithSTIPage() {
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

  // Lifestyle (US 5.2)
  type Story = {
    id: string;
    sensitive?: boolean;
    topic: string; // i18n key suffix
    lastReviewed: string; // i18n string
    sources: {label: string; url: string}[];
  };

  const storyList: Story[] = useMemo(() => [
    {
      id: "mental-health",
      sensitive: false,
      topic: "mental",
      lastReviewed: "2025-01-01",
      sources: [
        {label: "WHO Mental Health", url: "https://www.who.int/health-topics/mental-health"},
        {label: "MOH Malaysia", url: "https://www.moh.gov.my/"}
      ]
    },
    {
      id: "relationships",
      sensitive: false,
      topic: "relationships",
      lastReviewed: "2025-01-01",
      sources: [
        {label: "CDC Healthy Relationships", url: "https://www.cdc.gov/healthyweight/healthy_communications/index.html"},
        {label: "PT Foundation (MY)", url: "https://www.ptfmalaysia.org/"}
      ]
    },
    {
      id: "stigma-coping",
      sensitive: true,
      topic: "stigma",
      lastReviewed: "2025-01-01",
      sources: [
        {label: "UNAIDS Stigma", url: "https://www.unaids.org/en/topic/stigma"},
        {label: "Befrienders KL", url: "https://www.befrienders.org.my/"}
      ]
    }
  ], [t]);

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [reported, setReported] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selected, setSelected] = useState<Story | null>(null);
  const [ackWarning, setAckWarning] = useState<boolean>(false);

  // Partner Notification & Safer Sex (US 5.3)
  type StiType = "chlamydia" | "gonorrhea" | "syphilis" | "hiv" | "herpes";
  const [stiType, setStiType] = useState<StiType>("chlamydia");
  const [tplKey, setTplKey] = useState<string>("gentle");
  const [tplText, setTplText] = useState<string>("");
  const [locationShared, setLocationShared] = useState<boolean>(false);
  const [region, setRegion] = useState<string>("");

  const partnerTemplates = useMemo(() => ({
    gentle: t("partner.templates.gentle"),
    direct: t("partner.templates.direct"),
    text: t("partner.templates.text")
  }), [t]);

  useEffect(() => {
    // Initialize template text when key changes; do not persist
    setTplText(partnerTemplates[tplKey as keyof typeof partnerTemplates] || "");
  }, [tplKey, partnerTemplates]);

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
      const bm = localStorage.getItem(STORAGE_KEYS.bookmarks);
      if (bm) setBookmarks(JSON.parse(bm));
      const rp = localStorage.getItem(STORAGE_KEYS.reports);
      if (rp) setReported(JSON.parse(rp));
    } catch {}
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.regimen, regimen);
      localStorage.setItem(STORAGE_KEYS.tracking, JSON.stringify(tracking));
      localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks));
      localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reported));
    } catch {}
  }, [settings, regimen, tracking, bookmarks, reported]);

  // Ensure today entry exists when times change
  useEffect(() => {
    const key = getTodayKey();
    const today = tracking[key] || settings.times.map((time) => ({time, status: "pending" as DoseStatus}));
    // Sync times: add new, keep status for matching times
    const byTime = new Map(today.map((d) => [d.time, d.status] as const));
    const normalized = settings.times.map((t) => ({time: t, status: (byTime.get(t) || "pending") as DoseStatus}));
    setTracking((prev) => ({...prev, [key]: normalized}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.times]);

  // Reminder engine (in-tab only)
  useEffect(() => {
    if (!settings.enabled) return;
    const id = setInterval(() => {
      const now = new Date();
      if (inPauseRange(settings, now)) return;
      const dow = now.getDay();
      if (!settings.days.includes(dow)) return;

      const minuteKey = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
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
    }, 1000 * 20); // check every 20s to be responsive within the minute
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
      localStorage.removeItem(STORAGE_KEYS.bookmarks);
      localStorage.removeItem(STORAGE_KEYS.reports);
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
            <div className="flex items-start gap-3 mb-3">
              <Pill className="text-teal-600 mt-1" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("hero.title")}</h1>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{t("hero.subtitle")}</p>
              </div>
            </div>
            <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800" role="note" aria-label={t("disclaimer.title")}>
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Adherence & Regimen */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35}}
            >
            <Card className="p-4 md:p-6 bg-white/90 dark:bg-gray-900/60">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="text-teal-600" />
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t("adherence.title")}</h2>
              </div>

              <Label htmlFor="regimen" className="text-sm">{t("adherence.regimen.label")}</Label>
              <div id="regimen" className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("adherence.regimen.label")}>
                {(["single","daily","multi"] as RegimenType[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRegimen(key)}
                    aria-checked={regimen===key}
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
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">{t("adherence.dos.title")}</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {(t.raw(`adherence.${regimen}.dos`) as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">{t("adherence.donts.title")}</h3>
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

            {/* Side-effects */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.05}}
            >
            <Card className="p-4 md:p-6 bg-white/90 dark:bg-gray-900/60">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="text-rose-500" />
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t("sideEffects.title")}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t("sideEffects.commonTitle")}</h3>
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
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{t("sideEffects.redFlagTitle")}</h3>
                  <ul className="space-y-2">
                    {(t.raw("sideEffects.redFlags") as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-3" role="alert" aria-live="assertive">
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
            <Card className="p-4 md:p-6 bg-white/90 dark:bg-gray-900/60">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="text-indigo-600" />
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t("reminders.title")}</h2>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{t("reminders.desc")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="reminders-switch" className="text-sm">{t("reminders.enable")}</Label>
                  <Switch id="reminders-switch" checked={settings.enabled} onCheckedChange={(v) => setSettings((s) => ({...s, enabled: v}))} />
                </div>
              </div>

              <Separator className="my-4" />

              <fieldset aria-disabled={!settings.enabled} className={!settings.enabled?"opacity-50 pointer-events-none":""}>
                <legend className="sr-only">{t("reminders.legend")}</legend>

                <div className="grid gap-3">
                  <div>
                    <Label className="text-sm">{t("reminders.times")}</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {settings.times.map((time, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="time"
                            aria-label={t("reminders.timeAria", {index: idx + 1})}
                            value={time}
                            onChange={(e) => {
                              const v = e.target.value;
                              setSettings((s) => ({...s, times: s.times.map((t, i) => (i === idx ? v : t))}));
                            }}
                            className="w-28"
                          />
                          <Button variant="outline" size="icon" aria-label={t("reminders.removeTime")}
                                  onClick={() => setSettings((s) => ({...s, times: s.times.filter((_, i) => i !== idx)}))}>-
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setSettings((s) => ({...s, times: [...s.times, "18:00"]}))}>{t("reminders.addTime")}</Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">{t("reminders.days")}</Label>
                    <div className="grid grid-cols-7 gap-2 mt-2" role="group" aria-label={t("reminders.days")}>
                      {[0,1,2,3,4,5,6].map((d) => (
                        <label key={d} className="inline-flex items-center gap-2 text-sm">
                          <Checkbox checked={settings.days.includes(d)} onCheckedChange={() => toggleDay(d)} aria-label={t(`reminders.week.${d}`)} />
                          <span>{t(`reminders.week.${d}`)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <Label htmlFor="snooze" className="text-sm">{t("reminders.snooze")}</Label>
                      <Input id="snooze" type="number" inputMode="numeric" min={0} max={120} className="w-28" value={settings.snoozeMinutes ?? 0}
                             onChange={(e) => setSettings((s) => ({...s, snoozeMinutes: Math.max(0, Number(e.target.value)||0)}))}
                             aria-describedby="snooze-help" />
                      <p id="snooze-help" className="text-xs text-gray-500 mt-1">{t("reminders.snoozeHelp")}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="sm" onClick={() => {
                        const mins = settings.snoozeMinutes ?? 10;
                        const until = new Date(Date.now() + mins*60000);
                        toast(t("reminders.snoozed"), {description: until.toLocaleTimeString()});
                      }}>{t("reminders.snoozeNow")}</Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="pauseFrom" className="text-sm">{t("reminders.pauseFrom")}</Label>
                      <Input id="pauseFrom" type="date" value={settings.pauseFrom ?? ""}
                             onChange={(e) => setSettings((s) => ({...s, pauseFrom: e.target.value||undefined}))} />
                    </div>
                    <div>
                      <Label htmlFor="pauseTo" className="text-sm">{t("reminders.pauseTo")}</Label>
                      <Input id="pauseTo" type="date" value={settings.pauseTo ?? ""}
                             onChange={(e) => setSettings((s) => ({...s, pauseTo: e.target.value||undefined}))} />
                    </div>
                  </div>
                </div>
              </fieldset>
            </Card>
            </motion.div>

            {/* Dose tracking */}
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.15}}
            >
            <Card className="p-4 md:p-6 bg-white/90 dark:bg-gray-900/60">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="text-emerald-600" />
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t("tracking.title")}</h2>
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

              <ul className="space-y-2">
                {(tracking[getTodayKey()] || []).map((dose) => (
                  <li key={dose.time} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span className="font-medium">{dose.time}</span>
                      <span className="text-xs text-gray-500">{dose.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => markDose(dose.time, "taken")}>{t("tracking.actions.taken")}</Button>
                      <Button size="sm" variant="outline" onClick={() => markDose(dose.time, "missed")}>{t("tracking.actions.missed")}</Button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-md bg-slate-50 dark:bg-slate-900/40 border p-3">
                <h3 className="text-sm font-medium mb-1">{t("catchup.title")}</h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{t(`catchup.${regimen}.details`)}</p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-2"><strong>{t("catchup.neverDoubleDose")}</strong></p>
              </div>
            </Card>
            </motion.div>
          </div>

          <div className="mt-6">
            <motion.div
              initial={{opacity: 0, y: reduceMotion ? 0 : 8}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: reduceMotion ? 0 : 0.35}}
            >
            <Card className="p-4 md:p-6 bg-white/90 dark:bg-gray-900/60">
              <div className="flex items-start gap-3">
                <div className="mt-1"><ShieldAlert className="text-gray-600" size={18} /></div>
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

          {/* Lifestyle: Positive-Living Content (US 5.2) */}
          <motion.section
            className="mt-8 md:mt-12"
            initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: reduceMotion ? 0 : 0.35}}
          >
            <div className="flex items-start gap-2 mb-3">
              <Heart className="text-rose-600 mt-1" />
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("lifestyle.title")}</h2>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{t("lifestyle.subtitle")}</p>
              </div>
            </div>

            <Card className="p-4 md:p-6 bg-white/90 dark:bg-gray-900/60">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">{t("lifestyle.tabs.all")}</TabsTrigger>
                  <TabsTrigger value="bookmarks">{t("lifestyle.tabs.bookmarks")}</TabsTrigger>
                </TabsList>
                <Separator className="my-4" />

                {(["all", "bookmarks"] as const).map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="grid gap-4 md:grid-cols-3">
                      {storyList
                        .filter((s) => !reported.includes(s.id))
                        .filter((s) => (tab === "bookmarks" ? bookmarks.includes(s.id) : true))
                        .map((s) => (
                          <Card key={s.id} className="p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="capitalize">{t(`lifestyle.stories.${s.topic}.badge`)}</Badge>
                                {s.sensitive && (
                                  <span className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1"><AlertTriangle size={14} /> {t("lifestyle.contentWarning.short")}</span>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t(`lifestyle.stories.${s.topic}.title`)}</h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{t(`lifestyle.stories.${s.topic}.summary`)}</p>
                              <p className="text-xs text-gray-500 mt-2">{t("lifestyle.lastReviewed")}: {s.lastReviewed}</p>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => { setSelected(s); setAckWarning(!s.sensitive); }}>
                                  {t("lifestyle.actions.view")}
                                </Button>
                                <Button size="sm" variant={bookmarks.includes(s.id) ? "secondary" : "outline"}
                                  onClick={() => {
                                    setBookmarks((prev) => {
                                      const set = new Set(prev);
                                      if (set.has(s.id)) set.delete(s.id); else set.add(s.id);
                                      const arr = Array.from(set);
                                      toast(
                                        set.has(s.id) ? t("lifestyle.toast.bookmarked") : t("lifestyle.toast.unbookmarked")
                                      );
                                      return arr;
                                    });
                                  }}
                                  aria-pressed={bookmarks.includes(s.id)}
                                  aria-label={bookmarks.includes(s.id) ? t("lifestyle.actions.bookmarked") : t("lifestyle.actions.bookmark")}
                                >
                                  {bookmarks.includes(s.id) ? <BookmarkCheck className="mr-2" size={16} /> : <Bookmark className="mr-2" size={16} />}
                                  {bookmarks.includes(s.id) ? t("lifestyle.actions.bookmarked") : t("lifestyle.actions.bookmark")}
                                </Button>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" aria-label={t("lifestyle.actions.report")}>
                                    <Flag size={16} className="mr-1" /> {t("lifestyle.actions.report")}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("lifestyle.report.title")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("lifestyle.report.desc")}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("lifestyle.report.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => {
                                      setReported((prev) => {
                                        if (prev.includes(s.id)) return prev;
                                        const next = [...prev, s.id];
                                        toast.success(t("lifestyle.toast.reported"));
                                        return next;
                                      });
                                    }}>{t("lifestyle.report.confirm")}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </Card>
                        ))}
                    </div>

                    {tab === "bookmarks" && storyList.filter((s) => bookmarks.includes(s.id) && !reported.includes(s.id)).length === 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">{t("lifestyle.emptyBookmarks")}</p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </Card>

            {/* Story Dialog */}
            <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setAckWarning(false); } }}>
              <DialogContent className="max-w-2xl">
                {selected && !ackWarning && selected.sensitive ? (
                  <div className="space-y-3">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300"><AlertTriangle size={18} /> {t("lifestyle.contentWarning.title")}</DialogTitle>
                      <DialogDescription>{t("lifestyle.contentWarning.desc")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button onClick={() => setAckWarning(true)}>{t("lifestyle.contentWarning.continue")}</Button>
                    </DialogFooter>
                  </div>
                ) : selected ? (
                  <div className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>{t(`lifestyle.stories.${selected.topic}.title`)}</DialogTitle>
                      <DialogDescription>{t(`lifestyle.stories.${selected.topic}.summary`)}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
                      <h4 className="font-medium">{t("lifestyle.actions.steps")}</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {t.raw(`lifestyle.stories.${selected.topic}.steps`).map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                      <Separator />
                      <div>
                        <h4 className="font-medium">{t("lifestyle.resources.title")}</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {selected.sources.map((src) => (
                            <li key={src.url}>
                              <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 dark:text-teal-300 inline-flex items-center gap-1">
                                {src.label} <ExternalLink size={14} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-gray-500">{t("lifestyle.lastReviewed")}: {selected.lastReviewed}</p>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary" onClick={() => setSelected(null)}>{t("lifestyle.actions.close")}</Button>
                    </DialogFooter>
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </motion.section>

          {/* Partner Notification & Safer Sex (US 5.3) */}
          <motion.section
            className="mt-8 md:mt-12"
            initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: reduceMotion ? 0 : 0.35}}
          >
            <div className="flex items-start gap-2 mb-3">
              <Heart className="text-teal-600 mt-1" />
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("partner.title")}</h2>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{t("partner.subtitle")}</p>
              </div>
            </div>
            <Card className="p-4 md:p-6 bg-white/90 dark:bg-gray-900/60">
              <Tabs defaultValue="templates">
                <TabsList>
                  <TabsTrigger value="templates">{t("partner.tabs.templates")}</TabsTrigger>
                  <TabsTrigger value="safer" className="ml-2">{t("partner.tabs.safer")}</TabsTrigger>
                </TabsList>
                <Separator className="my-4" />

                {/* Templates Tab */}
                <TabsContent value="templates">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="tplKind">{t("partner.templates.label")}</Label>
                      <Select value={tplKey} onValueChange={setTplKey}>
                        <SelectTrigger id="tplKind" aria-label={t("partner.templates.label")}>
                          <SelectValue placeholder={t("partner.templates.choose")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gentle">{t("partner.templates.kinds.gentle")}</SelectItem>
                          <SelectItem value="direct">{t("partner.templates.kinds.direct")}</SelectItem>
                          <SelectItem value="text">{t("partner.templates.kinds.text")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{t("partner.templates.note")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tplText">{t("partner.templates.messageLabel")}</Label>
                      <Textarea id="tplText" value={tplText} onChange={(e) => setTplText(e.target.value)} rows={8}
                        aria-describedby="tplHelp"
                      />
                      <p id="tplHelp" className="text-xs text-gray-500">{t("partner.templates.help")}</p>
                      <div className="flex gap-2">
                        <Button onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(tplText);
                            toast.success(t("partner.templates.copied"));
                          } catch {
                            toast.error(t("partner.templates.copyError"));
                          }
                        }} aria-label={t("partner.templates.copyAria")}>
                          <Copy size={16} className="mr-2" /> {t("partner.templates.copy")}
                        </Button>
                        <Button variant="outline" onClick={() => setTplText(partnerTemplates[tplKey as keyof typeof partnerTemplates] || "")}>{t("partner.templates.reset")}</Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <p>{t("partner.legal.note")} <a className="text-teal-700 dark:text-teal-300 underline" href="https://www.unaids.org/en/topic/hiv-law" target="_blank" rel="noopener noreferrer">{t("partner.legal.linkLabel")}</a></p>
                  </div>
                </TabsContent>

                {/* Safer Sex Tab */}
                <TabsContent value="safer">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="stiType">{t("partner.safer.stiLabel")}</Label>
                      <Select value={stiType} onValueChange={(v) => setStiType(v as StiType)}>
                        <SelectTrigger id="stiType" aria-label={t("partner.safer.stiLabel")}>
                          <SelectValue placeholder={t("partner.safer.chooseSti")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chlamydia">{t("partner.safer.types.chlamydia")}</SelectItem>
                          <SelectItem value="gonorrhea">{t("partner.safer.types.gonorrhea")}</SelectItem>
                          <SelectItem value="syphilis">{t("partner.safer.types.syphilis")}</SelectItem>
                          <SelectItem value="hiv">{t("partner.safer.types.hiv")}</SelectItem>
                          <SelectItem value="herpes">{t("partner.safer.types.herpes")}</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="mt-3">
                        <h4 className="font-medium">{t("partner.safer.checklistTitle")}</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {t.raw(`partner.safer.checklists.${stiType}`).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                        {stiType === "hiv" && (
                          <p className="text-xs mt-2 text-teal-700 dark:text-teal-300">{t("partner.safer.uuNote")}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>{t("partner.resources.title")}</Label>
                      <div className="flex items-center gap-2">
                        <Switch id="loc" checked={locationShared} onCheckedChange={(v) => setLocationShared(!!v)} />
                        <Label htmlFor="loc">{t("partner.resources.shareLocation")}</Label>
                      </div>
                      <div className="max-w-sm">
                        <Label htmlFor="region">{t("partner.resources.regionLabel")}</Label>
                        <Select value={region} onValueChange={setRegion}>
                          <SelectTrigger id="region" aria-label={t("partner.resources.regionLabel")}>
                            <SelectValue placeholder={t("partner.resources.chooseRegion")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kl">{t("partner.resources.regions.kl")}</SelectItem>
                            <SelectItem value="penang">{t("partner.resources.regions.penang")}</SelectItem>
                            <SelectItem value="johor">{t("partner.resources.regions.johor")}</SelectItem>
                            <SelectItem value="sabah">{t("partner.resources.regions.sabah")}</SelectItem>
                            <SelectItem value="sarawak">{t("partner.resources.regions.sarawak")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <h4 className="font-medium">{t("partner.resources.linksTitle")}</h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {(!locationShared || !region) && t.raw("partner.resources.generic").map((x: {label: string; url: string}) => (
                            <li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 dark:text-teal-300 inline-flex items-center gap-1">{x.label} <ExternalLink size={14} /></a></li>
                          ))}
                          {(locationShared && region) && t.raw(`partner.resources.byRegion.${region}`).map((x: {label: string; url: string}) => (
                            <li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 dark:text-teal-300 inline-flex items-center gap-1">{x.label} <ExternalLink size={14} /></a></li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        <p>{t("partner.resources.privacy")}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.section>
        </div>
      </section>
    </div>
  );
}
