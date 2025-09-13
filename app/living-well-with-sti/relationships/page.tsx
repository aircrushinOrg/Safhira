"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../../i18n/routing";
import {Card} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {Label} from "../../components/ui/label";
import {Switch} from "../../components/ui/switch";
import {Separator} from "../../components/ui/separator";
import {Heart, Copy, ExternalLink, ArrowLeft} from "lucide-react";
import {toast} from "sonner";
import {motion, useReducedMotion} from "framer-motion";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../components/ui/tabs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select";
import {Textarea} from "../../components/ui/textarea";
import {Toaster} from "../../components/ui/sonner";

type StiType = "chlamydia" | "gonorrhea" | "syphilis" | "hiv" | "herpes";

export default function RelationshipsPage() {
  const t = useTranslations("LivingWell");
  const reduceMotion = useReducedMotion();

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
              <Heart className="text-teal-600 mt-1" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("partner.title")}</h1>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{t("partner.subtitle")}</p>
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
              <Tabs defaultValue="templates">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">{t("partner.tabs.templates")}</TabsTrigger>
                  <TabsTrigger value="safer">{t("partner.tabs.safer")}</TabsTrigger>
                </TabsList>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{t("partner.templates.title")}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {t("partner.templates.desc")}
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
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
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">{t("partner.templates.note")}</p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                        <h4 className="font-medium text-sm mb-2">Best Practices</h4>
                        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• Choose a comfortable, private setting</li>
                          <li>• Be honest and direct, but respectful</li>
                          <li>• Allow time for questions and discussion</li>
                          <li>• Provide resources for more information</li>
                          <li>• Remember: disclosure is often legally required</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="tplText">{t("partner.templates.messageLabel")}</Label>
                      <Textarea 
                        id="tplText" 
                        value={tplText} 
                        onChange={(e) => setTplText(e.target.value)} 
                        rows={8}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500">{t("partner.templates.help")}</p>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(tplText);
                              toast.success(t("partner.templates.copied"));
                            } catch {
                              toast.error(t("partner.templates.copyError"));
                            }
                          }}
                          className="flex-1"
                        >
                          <Copy size={16} className="mr-2" /> {t("partner.templates.copy")}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setTplText(partnerTemplates[tplKey as keyof typeof partnerTemplates] || "")}
                        >
                          {t("partner.templates.reset")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                    <p className="font-medium mb-1">{t("partner.legal.title")}</p>
                    <p>{t("partner.legal.note")} <a className="text-teal-700 dark:text-teal-300 underline" href="https://www.unaids.org/en/topic/hiv-law" target="_blank" rel="noopener noreferrer">{t("partner.legal.linkLabel")}</a></p>
                  </div>
                </TabsContent>

                {/* Safer Sex Tab */}
                <TabsContent value="safer" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{t("partner.safer.title")}</h3>
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

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                        <h4 className="font-medium mb-3">{t("partner.safer.checklistTitle")}</h4>
                        <ul className="text-sm space-y-2">
                          {t.raw(`partner.safer.checklists.${stiType}`).map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-teal-600 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {stiType === "hiv" && (
                          <div className="mt-3 p-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded">
                            <p className="text-xs text-teal-700 dark:text-teal-300">{t("partner.safer.uuNote")}</p>
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

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                        <h4 className="font-medium mb-2">{t("partner.resources.linksTitle")}</h4>
                        <ul className="space-y-2 text-sm">
                          {(!locationShared || !region) && t.raw("partner.resources.generic").map((x: {label: string; url: string}) => (
                            <li key={x.url}>
                              <a href={x.url} target="_blank" rel="noopener noreferrer" 
                                 className="text-teal-700 dark:text-teal-300 inline-flex items-center gap-1 hover:underline">
                                {x.label} <ExternalLink size={14} />
                              </a>
                            </li>
                          ))}
                          {(locationShared && region) && t.raw(`partner.resources.byRegion.${region}`).map((x: {label: string; url: string}) => (
                            <li key={x.url}>
                              <a href={x.url} target="_blank" rel="noopener noreferrer" 
                                 className="text-teal-700 dark:text-teal-300 inline-flex items-center gap-1 hover:underline">
                                {x.label} <ExternalLink size={14} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                        <p className="font-medium mb-1">{t("partner.resources.privacyTitle")}</p>
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
