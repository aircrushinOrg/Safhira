/**
 * Living Well with STI hub page providing comprehensive support and resources for individuals diagnosed with STIs.
 * This page serves as a central navigation point for treatment adherence, lifestyle management, and relationship guidance.
 * Features a newsletter subscription, educational sections, and practical advice for managing life with an STI diagnosis.
 */
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
import BreadcrumbTrail from "../components/BreadcrumbTrail";

export default function LivingWellWithSTIPage() {
  const t = useTranslations("LivingWell");
  const tRoot = useTranslations();
  const tBreadcrumbs = useTranslations('Common.breadcrumbs');
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
      accentText: "text-teal-600 dark:text-teal-300",
      borderClass: "border-teal-100 dark:border-teal-900",
      iconBg: "bg-teal-50 dark:bg-teal-950/40",
      buttonClass: "bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400",
    },
    {
      id: "lifestyle",
      icon: HeartPulse,
      title: t("lifestyle.title"),
      description: t("lifestyle.subtitle"),
      href: "/living-well-with-sti/lifestyle",
      accentText: "text-rose-600 dark:text-rose-300",
      borderClass: "border-rose-100 dark:border-rose-900",
      iconBg: "bg-rose-50 dark:bg-rose-950/40",
      buttonClass: "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400",
    },
    {
      id: "relationships",
      icon: HeartHandshake,
      title: t("partner.title"),
      description: t("partner.subtitle"),
      href: "/living-well-with-sti/relationships",
      accentText: "text-indigo-600 dark:text-indigo-300",
      borderClass: "border-indigo-100 dark:border-indigo-900",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
      buttonClass: "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <section className="px-4 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <BreadcrumbTrail
            items={[
              {label: tBreadcrumbs('home'), href: '/'},
              {label: tBreadcrumbs('livingWell')},
            ]}
          />

          <div className="space-y-12 sm:space-y-14">
            <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setSubscriptionResult(null);
              }
            }}
          >
            <DialogContent className="max-w-md rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-slate-900 sm:p-8">
              <DialogHeader className="items-center gap-3 text-left sm:text-center">
                <span className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 size={28} aria-hidden="true" />
                </span>
                <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {t("newsletter.modalTitle")}
                </DialogTitle>
                <DialogDescription className="text-base text-slate-600 dark:text-slate-300">
                  {modalMessage}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:justify-center">
                <DialogClose asChild>
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                    {t("newsletter.close")}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <motion.section
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/90 dark:shadow-2xl dark:shadow-slate-950/50"
            initial={{opacity: 0, y: reduceMotion ? 0 : 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.5}}
          >
            <div className="grid items-start gap-12 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,7fr),minmax(0,5fr)]">
              <motion.div
                initial={{opacity: 0, x: reduceMotion ? 0 : -16}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: reduceMotion ? 0 : 0.5}}
                className="space-y-8 text-left"
              >
                <div className="flex flex-col gap-5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
                    <Heart size={24} aria-hidden="true" />
                  </span>
                  <div className="space-y-4">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                      {t("hero.title")}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                      {t("hero.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t("hero.description")}
                  </p>
                  
                  <div className="grid gap-4 sm:gap-6">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <Link 
                          key={section.id} 
                          href={section.href}
                          className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-slate-700"
                        >
                          <span className={`grid h-12 w-12 place-items-center rounded-xl ${section.iconBg} ${section.accentText} transition-transform duration-200 group-hover:scale-105`}>
                            <Icon size={20} aria-hidden="true" />
                          </span>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                              {section.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                              {section.description}
                            </p>
                          </div>
                          <ArrowRight 
                            size={18} 
                            className={`${section.accentText} transition-transform duration-200 group-hover:translate-x-1`} 
                            aria-hidden="true" 
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{opacity: 0, x: reduceMotion ? 0 : 16}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.15}}
                className="flex h-full flex-col justify-between gap-8 rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-700/60 dark:bg-slate-800/80 dark:backdrop-blur-sm"
              >
                <div className="space-y-6">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100" role="note">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5" size={18} aria-hidden="true" />
                      <div className="space-y-1">
                        <p className="font-medium">{t("disclaimer.title")}</p>
                        <p className="leading-relaxed">
                          {t("disclaimer.text")} {t("disclaimer.emergency")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {tRoot("STIs.learnMore")}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t("newsletter.description")}
                    </p>
                    <ul className="space-y-2">
                      {sections.map((section) => (
                        <li key={section.id} className="flex items-start gap-2 text-sm">
                          <ArrowRight size={14} className={`${section.accentText} mt-0.5`} aria-hidden="true" />
                          <Link 
                            href={section.href} 
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 underline-offset-2 hover:underline transition-colors"
                          >
                            {section.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-white shadow-inner dark:bg-slate-800/90 dark:ring-1 dark:ring-slate-700/50">
                  <Image
                    src="/undraw_living_well.svg"
                    alt="Living well illustration"
                    fill
                    sizes="(max-width: 1024px) 80vw, 360px"
                    className="object-contain p-6"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white/90 p-6 shadow-lg ring-1 ring-inset ring-white/60 backdrop-blur-sm transition-shadow dark:border-emerald-500/30 dark:bg-slate-900/90 dark:ring-slate-700/20 dark:shadow-2xl dark:shadow-slate-950/30 sm:p-8"
            initial={{opacity: 0, y: reduceMotion ? 0 : 12}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.3}}
            transition={{duration: reduceMotion ? 0 : 0.45}}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50/80 via-white to-cyan-50/70 dark:from-emerald-500/10 dark:via-slate-800/50 dark:to-slate-900/80"
            />
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-100 via-white to-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100/80 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:via-emerald-600/10 dark:to-emerald-700/15 dark:text-emerald-300 dark:ring-emerald-500/50 dark:shadow-lg dark:shadow-emerald-500/20">
                    <Mail size={24} aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 md:text-xl">
                      {t("newsletter.title")}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 md:text-base">
                      {t("newsletter.description")}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100/70 bg-white/70 p-3 shadow-inner sm:flex-row sm:items-center dark:border-emerald-500/40 dark:bg-slate-800/70 dark:shadow-lg dark:shadow-slate-950/20">
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
                    className="h-11 rounded-xl border border-transparent bg-white/90 px-4 text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-300 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-700/50 dark:shadow-inner dark:focus-visible:ring-emerald-400 sm:flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 font-medium text-white shadow-md focus-visible:ring-emerald-300 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-70 dark:from-emerald-600 dark:to-teal-600 dark:hover:from-emerald-500 dark:hover:to-teal-500 dark:shadow-lg dark:shadow-emerald-500/25 dark:focus-visible:ring-emerald-400 sm:w-auto"
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                    {t("newsletter.cta")}
                  </Button>
                </div>
                {showFeedback ? (
                  <div
                    id={feedbackId}
                    {...(isError && { role: "alert" })}
                    aria-live={isError ? "assertive" : "polite"}
                    className={`flex items-center gap-2 text-sm ${isError ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                  >
                    {isError ? <AlertCircle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
                    <span>{feedbackMessage}</span>
                  </div>
                ) : null}
              </form>
            </div>
          </motion.section>

          </div>
        </div>
      </section>
    </div>
  );
}
