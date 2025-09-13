"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../../i18n/routing";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Badge} from "../../components/ui/badge";
import {Separator} from "../../components/ui/separator";
import {AlertTriangle, Heart, Bookmark, BookmarkCheck, Flag, ExternalLink, ArrowLeft} from "lucide-react";
import {toast} from "sonner";
import {motion, useReducedMotion} from "framer-motion";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../../components/ui/dialog";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "../../components/ui/alert-dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../components/ui/tabs";
import {Toaster} from "../../components/ui/sonner";

type Story = {
  id: string;
  sensitive?: boolean;
  topic: string;
  lastReviewed: string;
};

const STORAGE_KEYS = {
  bookmarks: "lwsti_bookmarks",
  reports: "lwsti_reports"
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
  const [reported, setReported] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selected, setSelected] = useState<Story | null>(null);
  const [ackWarning, setAckWarning] = useState<boolean>(false);

  // Load persisted state
  useEffect(() => {
    try {
      const bm = localStorage.getItem(STORAGE_KEYS.bookmarks);
      if (bm) setBookmarks(JSON.parse(bm));
      const rp = localStorage.getItem(STORAGE_KEYS.reports);
      if (rp) setReported(JSON.parse(rp));
    } catch {}
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks));
      localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reported));
    } catch {}
  }, [bookmarks, reported]);

  const getStorySources = (topic: string) => {
    try {
      return (t.raw(`lifestyle.stories.${topic}.sources`) as {label: string; url: string}[]) || [];
    } catch {
      return [];
    }
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
              <Heart className="text-rose-600 mt-1" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("lifestyle.title")}</h1>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{t("lifestyle.subtitle")}</p>
              </div>
            </div>
          </motion.header>

          <motion.div
            initial={{opacity: 0, y: reduceMotion ? 0 : 10}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: reduceMotion ? 0 : 0.35}}
          >
            <Card className="p-4 md:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">{t("lifestyle.tabs.all")}</TabsTrigger>
                  <TabsTrigger value="bookmarks">{t("lifestyle.tabs.bookmarks")}</TabsTrigger>
                </TabsList>
                <Separator className="my-4" />

                {(["all", "bookmarks"] as const).map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {storyList
                        .filter((s) => !reported.includes(s.id))
                        .filter((s) => (tab === "bookmarks" ? bookmarks.includes(s.id) : true))
                        .map((s) => (
                          <Card key={s.id} className="p-4 flex flex-col justify-between h-full">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="capitalize">{t(`lifestyle.stories.${s.topic}.badge`)}</Badge>
                                {s.sensitive && (
                                  <span className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                    <AlertTriangle size={12} /> {t("lifestyle.contentWarning.short")}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t(`lifestyle.stories.${s.topic}.title`)}</h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{t(`lifestyle.stories.${s.topic}.summary`)}</p>
                              <p className="text-xs text-gray-500">{t("lifestyle.lastReviewed")}: {s.lastReviewed}</p>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => { setSelected(s); setAckWarning(!s.sensitive); }}
                              >
                                {t("lifestyle.actions.view")}
                              </Button>
                              
                              <div className="flex items-center justify-between gap-2">
                                <Button 
                                  size="sm" 
                                  variant={bookmarks.includes(s.id) ? "secondary" : "outline"}
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
                                  {bookmarks.includes(s.id) ? 
                                    <BookmarkCheck size={16} /> : 
                                    <Bookmark size={16} />
                                  }
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                      <Flag size={16} />
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
                            </div>
                          </Card>
                        ))}
                    </div>

                    {tab === "bookmarks" && storyList.filter((s) => bookmarks.includes(s.id) && !reported.includes(s.id)).length === 0 && (
                      <div className="text-center py-8">
                        <Heart className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t("lifestyle.emptyBookmarks")}</p>
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
                    
                    <p className="text-xs text-gray-500 pt-2 border-t">
                      {t("lifestyle.lastReviewed")}: {selected.lastReviewed}
                    </p>
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
