/**
 * Relationship guidance page addressing communication, disclosure, and intimacy concerns for individuals with STIs.
 * This page provides tools for partner conversations, disclosure strategies, and maintaining healthy intimate relationships.
 * Features conversation starters, AI-powered response suggestions, and evidence-based advice for relationship navigation.
 */
"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../../i18n/routing";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Label} from "../../components/ui/label";
import {Switch} from "../../components/ui/switch";
import {Separator} from "../../components/ui/separator";
import {Heart, Copy, ExternalLink, ArrowLeft, Wand2, MessageCircle, Lock, Lightbulb, CheckCircle2, Loader2, Sparkles} from "lucide-react";
import {toast} from "sonner";
import {motion, useReducedMotion} from "framer-motion";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select";
import {Textarea} from "../../components/ui/textarea";
import {Toaster} from "../../components/ui/sonner";
import {Badge} from "../../components/ui/badge";
import BreadcrumbTrail from "../../components/BreadcrumbTrail";

type StiType = "chlamydia" | "gonorrhea" | "syphilis" | "hiv" | "herpes";

export default function RelationshipsPage() {
  const t = useTranslations("LivingWell");
  const reduceMotion = useReducedMotion();
  const tBreadcrumbs = useTranslations('Common.breadcrumbs');

  const [stiType, setStiType] = useState<StiType>("chlamydia");
  const [tplKey, setTplKey] = useState<string>("gentle");
  const [tplText, setTplText] = useState<string>("");
  const [aiTone, setAiTone] = useState<string>("supportive");
  const [isTuning, setIsTuning] = useState<boolean>(false);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const tuneWithAI = async () => {
    if (!tplText?.trim()) {
      toast.error(t("partner.ai.empty"));
      return;
    }
    setIsTuning(true);
    try {
      const res = await fetch("/api/tone-tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tplText, tone: aiTone }),
      });
      if (!res.ok || !res.body) throw new Error("Bad response");
      // Stream chunks and append directly for a live typing effect
      setTplText("");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) setTplText((s) => s + chunk);
      }
      toast.success(t("partner.ai.tuned"));
    } catch (e) {
      console.error(e);
      toast.error(t("partner.ai.error"));
    } finally {
      setIsTuning(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{opacity: 0, scale: 0.9}}
          animate={{opacity: 0.75, scale: 1}}
          transition={{duration: 1.1, delay: 0.4}}
          className="absolute -top-20 -right-16 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-rose-300/40 via-amber-200/35 to-teal-200/45 blur-3xl"
        />
        <motion.div
          initial={{opacity: 0, scale: 0.9}}
          animate={{opacity: 0.45, scale: 1}}
          transition={{duration: 1.2, delay: 0.6}}
          className="absolute -bottom-28 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-teal-400/30 via-sky-300/35 to-indigo-300/25 blur-3xl"
        />
        <motion.div
          initial={{opacity: 0, y: 22}}
          animate={{opacity: 0.3, y: 0}}
          transition={{duration: 1, delay: 0.8}}
          className="absolute inset-x-0 top-2/3 h-[220px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_70%)] dark:bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.32),_transparent_75%)]"
        />
      </div>
      <Toaster richColors position="top-center" />

      <section className="relative py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <BreadcrumbTrail
            items={[
              {label: tBreadcrumbs('home'), href: '/'},
              {label: tBreadcrumbs('livingWell'), href: '/living-well-with-sti'},
              {label: tBreadcrumbs('livingWellRelationships')},
            ]}
          />
          <motion.header
            className="relative z-10 mb-8 md:mb-12 rounded-3xl border border-white/40 bg-white/75 p-6 shadow-lg shadow-rose-200/50 backdrop-blur dark:border-emerald-950/40 dark:bg-emerald-950/35 dark:shadow-black/40 md:p-8"
            initial={{opacity: 0, y: reduceMotion ? 0 : 8}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.4}}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Link
                  href="/living-well-with-sti"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200/70 bg-teal-50/90 px-4 py-2 text-xs font-medium uppercase tracking-wide text-teal-700 transition hover:-translate-x-0.5 hover:text-teal-800 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-200"
                >
                  <ArrowLeft size={16} />
                  {t("back")}
                </Link>
                <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-emerald-100">
                  <Sparkles className="h-4 w-4" />
                  {t("partner.subtitle")}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)]">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-lg shadow-rose-300/40 dark:shadow-rose-950/40">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                        {t("partner.title")}
                      </h1>
                      <p className="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-200">
                        {t("partner.subtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200/70 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-700/60 dark:bg-amber-900/25 dark:text-amber-100">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500 dark:text-amber-300" />
                      <p className="leading-relaxed">
                        {t("partner.templates.desc")}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{opacity: 0, x: reduceMotion ? 0 : 12}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.2}}
                  className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-md shadow-teal-200/50 backdrop-blur-sm md:p-6 dark:border-emerald-950/50 dark:bg-emerald-950/35 dark:shadow-black/30"
                >
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-emerald-200">
                    <Sparkles className="h-4 w-4" />
                    Toolkit Highlights
                  </div>
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
                    <p>{t("partner.tabs.templates")}: {t("partner.templates.desc")}</p>
                    <p>{t("partner.tabs.safer")}: {t("partner.safer.desc")}</p>
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
            <Card className="p-4 md:p-6 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-white/20 shadow-xl">
              <Tabs defaultValue="templates">
                <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-100/80 p-1 shadow-inner dark:border dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:shadow-[inset_0_1px_4px_rgba(16,185,129,0.25)]">
                  <TabsTrigger
                    value="templates"
                    className="rounded-full text-gray-700 transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-emerald-200 dark:data-[state=active]:border-emerald-600/40 dark:data-[state=active]:bg-emerald-900/55 dark:data-[state=active]:text-emerald-100 dark:data-[state=active]:shadow-[0_8px_20px_rgba(16,185,129,0.28)]"
                  >
                    {t("partner.tabs.templates")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="safer"
                    className="rounded-full text-gray-700 transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-emerald-200 dark:data-[state=active]:border-emerald-600/40 dark:data-[state=active]:bg-emerald-900/55 dark:data-[state=active]:text-emerald-100 dark:data-[state=active]:shadow-[0_8px_20px_rgba(16,185,129,0.28)]"
                  >
                    {t("partner.tabs.safer")}
                  </TabsTrigger>
                </TabsList>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 mt-2">{t("partner.templates.title")}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {t("partner.templates.desc")}
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4 md:sticky md:top-4 self-start">
                      <div>
                        <Label htmlFor="tplKind">{t("partner.templates.label")}</Label>
                        <Select value={tplKey} onValueChange={setTplKey}>
                          <SelectTrigger id="tplKind" className="mt-2">
                            <SelectValue placeholder={t("partner.templates.choose")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gentle">{t("partner.templates.kinds.gentle")}</SelectItem>
                            <SelectItem value="direct">{t("partner.templates.kinds.direct")}</SelectItem>
                            <SelectItem value="text">{t("partner.templates.kinds.text")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                            <Lock size={12} />
                            {t("partner.templates.note")}
                          </Badge>
                        </div>
                      </div>

                      <div className="rounded-xl p-4 border border-amber-200/60 dark:border-amber-600/30 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-900/20 dark:to-rose-900/10 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="text-amber-500" size={16} />
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{t("partner.templates.best.title")}</h4>
                        </div>
                        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
                          {t.raw("partner.templates.best.items").map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="text-teal-500 mt-0.5" size={14} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="tplText" className="text-sm font-medium">{t("partner.templates.messageLabel")}</Label>
                          <Select value={aiTone} onValueChange={setAiTone}>
                            <SelectTrigger id="toneSel-inline" className="h-8 w-[160px] text-xs border-purple-200 dark:border-purple-500/30 bg-white/80 dark:bg-gray-800/80">
                              <SelectValue placeholder={t("partner.ai.chooseTone")} />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                              <SelectItem value="supportive">{t("partner.ai.tones.supportive")}</SelectItem>
                              <SelectItem value="empathetic">{t("partner.ai.tones.empathetic")}</SelectItem>
                              <SelectItem value="reassuring">{t("partner.ai.tones.reassuring")}</SelectItem>
                              <SelectItem value="calm-direct">{t("partner.ai.tones.calmDirect")}</SelectItem>
                              <SelectItem value="appreciative">{t("partner.ai.tones.appreciative")}</SelectItem>
                              <SelectItem value="collaborative">{t("partner.ai.tones.collaborative")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={tuneWithAI} 
                            disabled={isTuning} 
                            className="h-8 px-3 text-xs gap-1 disabled:opacity-60 text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-400/40 border border-emerald-700/30 shadow-none"
                            aria-label={t("partner.ai.tune")}
                            title={t("partner.ai.tune")}
                          >
                            <Wand2 size={14} className={`${isTuning ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">{isTuning ? t("partner.ai.tuning") : t("partner.ai.tune")}</span>
                          </Button>
                        </div>
                      </div>
                      <div className="relative">
                        <Textarea 
                          id="tplText" 
                          value={tplText} 
                          onChange={(e) => setTplText(e.target.value)} 
                          rows={8}
                          readOnly={isTuning}
                          aria-busy={isTuning}
                          className="resize-none bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                        />
                        {isTuning && (
                          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-white/30 dark:bg-gray-900/20 backdrop-blur-[1px]">
                            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 text-xs">
                              <Loader2 size={14} className="animate-spin" />
                              {t("partner.ai.tuning")}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("partner.templates.help")}</p>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(tplText);
                              toast.success(t("partner.templates.copied"));
                            } catch {
                              toast.error(t("partner.templates.copyError"));
                            }
                          }}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Copy size={16} className="mr-2" /> {t("partner.templates.copy")}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setTplText(partnerTemplates[tplKey as keyof typeof partnerTemplates] || "")}
                          className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                        >
                          {t("partner.templates.reset")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="text-xs text-gray-600 dark:text-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-600/30 shadow-sm">
                    <p className="font-semibold mb-2 text-blue-800 dark:text-blue-300">{t("partner.legal.title")}</p>
                    <p>{t("partner.legal.note")} <a className="text-teal-600 dark:text-teal-400 underline hover:text-teal-700 dark:hover:text-teal-300 transition-colors" href="https://www.unaids.org/en" target="_blank" rel="noopener noreferrer">{t("partner.legal.linkLabel")}</a></p>
                  </div>
                </TabsContent>

                {/* Safer Sex Tab */}
                <TabsContent value="safer" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 mt-2">{t("partner.safer.title")}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {t("partner.safer.desc")}
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stiType">{t("partner.safer.stiLabel")}</Label>
                        <Select value={stiType} onValueChange={(v) => setStiType(v as StiType)}>
                          <SelectTrigger id="stiType" className="mt-2">
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
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                          {t("partner.safer.checklistTitle")}
                        </h4>
                        <ul className="text-sm space-y-2">
                          {t.raw(`partner.safer.checklists.${stiType}`).map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-teal-500 mt-1">•</span>
                              <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {stiType === "hiv" && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200/50 dark:border-teal-600/30 rounded-lg">
                            <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">{t("partner.safer.uuNote")}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">{t("partner.resources.title")}</h4>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Switch 
                            id="loc" 
                            checked={locationShared} 
                            onCheckedChange={(v) => setLocationShared(!!v)} 
                          />
                          <Label htmlFor="loc" className="text-sm">{t("partner.resources.shareLocation")}</Label>
                        </div>

                        {locationShared && (
                          <div className="mb-4">
                            <Label htmlFor="region" className="text-sm">{t("partner.resources.regionLabel")}</Label>
                            <Select value={region} onValueChange={setRegion}>
                              <SelectTrigger id="region" className="mt-2">
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
                        )}
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                          {t("partner.resources.linksTitle")}
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {(!locationShared || !region) && t.raw("partner.resources.generic").map((x: {label: string; url: string}) => (
                            <li key={x.url}>
                              <a href={x.url} target="_blank" rel="noopener noreferrer" 
                                 className="text-teal-600 dark:text-teal-400 inline-flex items-center gap-1 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
                                {x.label} <ExternalLink size={14} />
                              </a>
                            </li>
                          ))}
                          {(locationShared && region) && t.raw(`partner.resources.byRegion.${region}`).map((x: {label: string; url: string}) => (
                            <li key={x.url}>
                              <a href={x.url} target="_blank" rel="noopener noreferrer" 
                                 className="text-teal-600 dark:text-teal-400 inline-flex items-center gap-1 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
                                {x.label} <ExternalLink size={14} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-600/30 shadow-sm">
                        <p className="font-semibold mb-2 text-blue-800 dark:text-blue-300">{t("partner.resources.privacyTitle")}</p>
                        <p>{t("partner.resources.privacy")}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
