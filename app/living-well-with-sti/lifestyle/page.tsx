"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../../i18n/routing";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Badge} from "../../components/ui/badge";
import {Separator} from "../../components/ui/separator";
import {AlertTriangle, Heart, Bookmark, BookmarkCheck, ExternalLink, ArrowLeft, ShieldAlert, Sparkles} from "lucide-react";
import {toast} from "sonner";
import {motion, useReducedMotion} from "framer-motion";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../../components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../components/ui/tabs";
import {Toaster} from "../../components/ui/sonner";

type Story = {
  id: string;
  sensitive?: boolean;
  topic: string;
  lastReviewed: string;
};

const STORAGE_KEYS = {
  bookmarks: "lwsti_bookmarks"
};

export default function LifestylePage() {
  const t = useTranslations("LivingWell");
  const reduceMotion = useReducedMotion();

  const storyList: Story[] = useMemo(() => [
    {
      id: "mental-health",
      sensitive: false,
      topic: "mental",
      lastReviewed: "2025-01-01"
    },
    {
      id: "relationships",
      sensitive: false,
      topic: "relationships",
      lastReviewed: "2025-01-01"
    },
    {
      id: "stigma-coping",
      sensitive: true,
      topic: "stigma",
      lastReviewed: "2025-01-01"
    },
    {
      id: "work-life",
      sensitive: false,
      topic: "work",
      lastReviewed: "2025-01-01"
    },
    {
      id: "exercise-wellness",
      sensitive: false,
      topic: "exercise",
      lastReviewed: "2025-01-01"
    }
  ], []);

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selected, setSelected] = useState<Story | null>(null);
  const [ackWarning, setAckWarning] = useState<boolean>(false);

  // Load persisted state
  useEffect(() => {
    try {
      const bm = localStorage.getItem(STORAGE_KEYS.bookmarks);
      if (bm) setBookmarks(JSON.parse(bm));
    } catch {}
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  const getStorySources = (topic: string) => {
    try {
      return (t.raw(`lifestyle.stories.${topic}.sources`) as {label: string; url: string}[]) || [];
    } catch {
      return [];
    }
  };

  const latestReviewed = useMemo(() => {
    const sorted = [...storyList].sort((a, b) => (a.lastReviewed < b.lastReviewed ? 1 : -1));
    return sorted[0]?.lastReviewed ?? "";
  }, [storyList]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Toaster richColors position="top-center" />

      <section className="relative py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.header
            className="mb-8 md:mb-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8"
            initial={{opacity: 0, y: reduceMotion ? 0 : 8}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.4}}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Link
                  href="/living-well-with-sti"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-teal-700 transition hover:-translate-x-0.5 hover:text-teal-800 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  <ArrowLeft size={16} />
                  {t("back")}
                </Link>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Sparkles className="h-4 w-4 text-teal-500" />
                  {t("lifestyle.subtitle")}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)]">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-sm">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                        {t("lifestyle.title")}
                      </h1>
                      <p className="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-200">
                        {t("lifestyle.subtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5" size={18} />
                      <p className="leading-relaxed">
                        <strong>{t("disclaimer.title")}:</strong> {t("disclaimer.text")} {t("disclaimer.emergency")}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{opacity: 0, x: reduceMotion ? 0 : 12}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.2}}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-emerald-200">
                    <Sparkles className="h-4 w-4" />
                    {t("lifestyle.tabs.all")}
                  </div>
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <p>{t("lifestyle.subtitle")}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
                        {t("lifestyle.tabs.all")}: {storyList.length}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                        {t("lifestyle.tabs.bookmarks")}: {bookmarks.length}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.header>

          <motion.div
            initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: reduceMotion ? 0 : 0.35}}
          >
            <Card className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-sm dark:bg-slate-800">
                  <TabsTrigger value="all" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-700 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-teal-200">
                    {t("lifestyle.tabs.all")}
                  </TabsTrigger>
                  <TabsTrigger value="bookmarks" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-700 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-teal-200">
                    {t("lifestyle.tabs.bookmarks")}
                  </TabsTrigger>
                </TabsList>
                <Separator className="my-6" />

                {(["all", "bookmarks"] as const).map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {storyList
                        .filter((s) => (tab === "bookmarks" ? bookmarks.includes(s.id) : true))
                        .map((s, index) => (
                          <motion.div
                            key={s.id}
                            initial={{opacity: 0, y: reduceMotion ? 0 : 12}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, amount: 0.2}}
                            transition={{duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : index * 0.04}}
                          >
                            <Card
                              className="group relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg before:absolute before:inset-y-6 before:-left-1 before:w-1.5 before:rounded-full before:bg-teal-200/70 before:content-[''] after:absolute after:bottom-5 after:right-6 after:h-1 after:w-20 after:rounded-full after:bg-slate-200/60 after:opacity-0 after:transition dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/70 dark:to-slate-950 dark:before:bg-emerald-800/40 dark:after:bg-slate-700/60 group-hover:after:opacity-100"
                            >
                              <div className="mb-4 flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium capitalize">
                                  {t(`lifestyle.stories.${s.topic}.badge`)}
                                </Badge>
                                {s.sensitive && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-100">
                                    <AlertTriangle size={12} /> {t("lifestyle.contentWarning.short")}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 space-y-3">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                  {t(`lifestyle.stories.${s.topic}.title`)}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  {t(`lifestyle.stories.${s.topic}.summary`)}
                                </p>
                              </div>

                              <div className="mt-6 space-y-3 border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {t("lifestyle.lastReviewed")}: {s.lastReviewed}
                                </p>

                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setSelected(s);
                                    setAckWarning(!s.sensitive);
                                  }}
                                >
                                  {t("lifestyle.actions.view")}
                                </Button>

                                <Button
                                  size="sm"
                                  variant={bookmarks.includes(s.id) ? "secondary" : "outline"}
                                  className="w-full justify-center gap-2"
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
                                >
                                  {bookmarks.includes(s.id) ? (
                                    <>
                                      <BookmarkCheck size={16} />
                                      <span>{t("lifestyle.actions.bookmarked")}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Bookmark size={16} />
                                      <span>{t("lifestyle.actions.bookmark")}</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                    </div>

                    {tab === "bookmarks" && storyList.filter((s) => bookmarks.includes(s.id)).length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 py-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
                        <Heart className="mx-auto mb-4 text-teal-500" size={40} />
                        <p className="text-sm text-slate-600 dark:text-slate-300">{t("lifestyle.emptyBookmarks")}</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          </motion.div>

          {/* Story Dialog */}
          <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setAckWarning(false); } }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              {selected && !ackWarning && selected.sensitive ? (
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <AlertTriangle size={18} /> {t("lifestyle.contentWarning.title")}
                    </DialogTitle>
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
                  
                  <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
                    <div>
                      <h4 className="font-medium mb-2">{t("lifestyle.actions.steps")}</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {t.raw(`lifestyle.stories.${selected.topic}.steps`).map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">{t("lifestyle.resources.title")}</h4>
                      <ul className="space-y-2">
                        {getStorySources(selected.topic).map((src) => (
                          <li key={src.url}>
                            <a href={src.url} target="_blank" rel="noopener noreferrer" 
                               className="text-teal-700 dark:text-teal-300 inline-flex items-center gap-1 hover:underline">
                              {src.label} <ExternalLink size={14} />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setSelected(null)}>
                      {t("lifestyle.actions.close")}
                    </Button>
                  </DialogFooter>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}
