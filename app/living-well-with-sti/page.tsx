"use client";

import {useTranslations} from "next-intl";
import {Link} from "../../i18n/routing";
import {Card} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Stethoscope, Heart, HeartPulse, HeartHandshake, ShieldAlert, ArrowRight} from "lucide-react";
import {motion, useReducedMotion} from "framer-motion";
import Image from "next/image";

export default function LivingWellWithSTIPage() {
  const t = useTranslations("LivingWell");
  const tRoot = useTranslations();
  const reduceMotion = useReducedMotion();

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
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
                  className="max-w-full h-auto"
                  priority
                />
              </motion.div>
            </div>
          </motion.header>

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
