"use client";

import {FormEvent, useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Link} from "../../i18n/routing";
import {Card} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose} from "../components/ui/dialog";
import {subscribeToNewsletter, type NewsletterSubscribeResult} from "./actions";
import {Stethoscope, Heart, HeartPulse, HeartHandshake, ShieldAlert, ArrowRight, Mail, Loader2, CheckCircle2, AlertCircle} from "lucide-react";
import {motion, useReducedMotion} from "framer-motion";
import Image from "next/image";

export default function LivingWellWithSTIPage() {
  const t = useTranslations("LivingWell");
  const tRoot = useTranslations();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [subscriptionResult, setSubscriptionResult] = useState<NewsletterSubscribeResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const feedbackId = useId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const messageMap: Record<NewsletterSubscribeResult["code"], string> = {
    subscribed: t("newsletter.success"),
    already_subscribed: t("newsletter.already"),
    missing_email: t("newsletter.missing"),
    invalid_email: t("newsletter.invalid"),
    server_error: t("newsletter.serverError"),
  };

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const submittedEmail = formData.get("email");
    const emailValue = typeof submittedEmail === "string" ? submittedEmail : "";

    setSubscriptionResult(null);
    setIsDialogOpen(false);

    startTransition(() => {
      subscribeToNewsletter(emailValue)
        .then((result) => {
          setSubscriptionResult(result);
          if (result.status === "success") {
            setEmail("");
            setIsDialogOpen(true);
          }
        })
        .catch(() => {
          setSubscriptionResult({ status: "error", code: "server_error" });
        });
    });
  };

  const isError = subscriptionResult?.status === "error";
  const isSuccess = subscriptionResult?.status === "success";
  const feedbackMessage = isError && subscriptionResult ? messageMap[subscriptionResult.code] : "";
  const showFeedback = Boolean(isError);
  const modalMessage = isSuccess && subscriptionResult ? messageMap[subscriptionResult.code] : t("newsletter.success");

  const sections = [
    {
      id: "treatment",
      icon: Stethoscope,
      title: t("adherence.title"),
      description: t("adherence.subtitle"),
      href: "/living-well-with-sti/treatment",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      borderColor: "border-teal-200 dark:border-teal-800",
      buttonClass: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600",
      glowLight: "bg-teal-300/60",
      glowDark: "dark:bg-teal-800/60"
    },
    {
      id: "lifestyle", 
      icon: HeartPulse,
      title: t("lifestyle.title"),
      description: t("lifestyle.subtitle"),
      href: "/living-well-with-sti/lifestyle",
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-900/20", 
      borderColor: "border-rose-200 dark:border-rose-800",
      buttonClass: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600",
      glowLight: "bg-rose-300/60",
      glowDark: "dark:bg-rose-800/60"
    },
    {
      id: "relationships",
      icon: HeartHandshake,
      title: t("partner.title"), 
      description: t("partner.subtitle"),
      href: "/living-well-with-sti/relationships",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      buttonClass: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
      glowLight: "bg-indigo-300/60",
      glowDark: "dark:bg-indigo-800/60"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-8 md:py-12 lg:py-16 xl:py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setSubscriptionResult(null);
              }
            }}
          >
            <DialogContent className="max-w-sm text-center sm:max-w-md">
              <DialogHeader className="items-center gap-3">
                <span className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 size={28} aria-hidden="true" />
                </span>
                <DialogTitle className="text-xl text-gray-900 dark:text-gray-100">
                  {t("newsletter.modalTitle")}
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
                  {modalMessage}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row sm:justify-center">
                <DialogClose asChild>
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                    {t("newsletter.close")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <motion.header className="mb-8 md:mb-12"
            initial={{opacity: 0, y: reduceMotion ? 0 : 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.5}}
          >
            {/* Header Left-Right Layout */}
            <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
              {/* Left side - Title, Description, and Disclaimer */}
              <motion.div 
                className="text-center lg:text-left"
                initial={{opacity: 0, x: reduceMotion ? 0 : -20}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: reduceMotion ? 0 : 0.6}}
              >
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <Heart className="text-rose-600" size={32} />
                  <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-gray-100">
                    {t("hero.title")}
                  </h1>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  {t("hero.subtitle")}
                </p>
                
                {/* Disclaimer moved here */}
                <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800" role="note">
                  <div className="flex items-start gap-3 text-amber-800 dark:text-amber-200">
                    <ShieldAlert className="mt-0.5 flex-shrink-0" size={20} />
                    <div className="text-sm leading-relaxed">
                      <p className="font-medium mb-1">{t("disclaimer.title")}</p>
                      <p>{t("disclaimer.text")} {t("disclaimer.emergency")}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right side - Illustration */}
              <motion.div 
                className="flex justify-center lg:justify-start"
                initial={{opacity: 0, x: reduceMotion ? 0 : 20}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.2}}
              >
                <Image
                  src="/undraw_living_well.svg"
                  alt="Living well illustration"
                  width={400}
                  height={300}
                  className="max-w-full h-auto hidden md:block"
                  priority
                />
              </motion.div>
            </div>
          </motion.header>

          <motion.section
            className="mb-8 md:mb-12"
            initial={{opacity: 0, y: reduceMotion ? 0 : 12}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.3}}
            transition={{duration: reduceMotion ? 0 : 0.5}}
          >
            <Card className="relative overflow-hidden border-emerald-200/70 bg-white/90 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-emerald-900/40 dark:bg-emerald-950/40 md:p-8">
              <div className="pointer-events-none absolute -top-16 -right-16 hidden size-44 rounded-full bg-emerald-300/50 blur-3xl dark:bg-emerald-600/40 md:block" />
              <div className="relative flex flex-col gap-6">
                <div className="flex items-start gap-3">
                  <span className="grid size-12 flex-shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Mail size={24} />
                  </span>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 md:text-xl">
                      {t("newsletter.title")}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 md:text-base">
                      {t("newsletter.description")}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3" noValidate>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      enterKeyHint="send"
                      placeholder={t("newsletter.placeholder")}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (subscriptionResult) {
                          setSubscriptionResult(null);
                        }
                      }}
                      aria-describedby={showFeedback ? feedbackId : undefined}
                      aria-invalid={isError}
                      className="h-11 sm:flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400 disabled:opacity-70 dark:bg-emerald-500 dark:hover:bg-emerald-400 sm:w-auto"
                    >
                      {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                      {t("newsletter.cta")}
                    </Button>
                  </div>
                  {showFeedback ? (
                    <div
                      id={feedbackId}
                      role={isError ? "alert" : "status"}
                      aria-live={isError ? "assertive" : "polite"}
                      className={`flex items-center gap-2 text-sm ${isError ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                    >
                      {isError ? <AlertCircle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
                      <span>{feedbackMessage}</span>
                    </div>
                  ) : null}
                </form>
              </div>
            </Card>
          </motion.section>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  initial={{opacity: 0, y: reduceMotion ? 0 : 16}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true, amount: 0.3}}
                  transition={{
                    duration: reduceMotion ? 0 : 0.4,
                    delay: reduceMotion ? 0 : index * 0.1
                  }}
                  className="h-full"
                >
                  <Card className={`group p-6 md:p-7 h-full flex flex-col relative overflow-hidden ${section.bgColor} ${section.borderColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}>
                    {/* Decorative glow */}
                    <div className={`pointer-events-none absolute -top-10 -right-10 size-28 rounded-full blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90 ${section.glowLight} ${section.glowDark}`} />

                    <div className="relative flex flex-col items-center text-center h-full">
                      {/* Icon */}
                      <div className={`relative ${section.color} mb-5`}>
                        <span className="absolute -inset-2 rounded-2xl bg-current/10 blur-xl opacity-70 group-hover:opacity-90 transition-opacity" />
                        <div className="relative size-14 grid place-items-center rounded-2xl bg-white/80 dark:bg-gray-900/40 shadow-sm ring-1 ring-current/20 backdrop-blur">
                          <Icon size={28} className="transition-transform duration-300 group-hover:scale-110" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between w-full">
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
                            {section.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm">
                            {section.description}
                          </p>
                        </div>

                        {/* Button */}
                        <div className="mt-auto">
                          <Link href={section.href}>
                            <Button
                              className={`group/btn inline-flex items-center gap-2 ${section.buttonClass} text-white font-medium px-5 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300`}
                              size="sm"
                            >
                              {tRoot("STIs.learnMore")}
                              <ArrowRight
                                size={16}
                                className="transition-transform duration-300 group-hover/btn:translate-x-1"
                              />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
