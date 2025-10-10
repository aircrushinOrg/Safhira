'use client'

import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Heart, BookOpen, ChevronRight, PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from '../../i18n/routing'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import BreadcrumbTrail from '../components/BreadcrumbTrail'

export interface STISummary {
  id?: number
  slug: string
  name: string
  type: 'Bacterial' | 'Viral' | 'Parasitic'
  severity: 'Low' | 'Medium' | 'High'
  treatability: 'Curable' | 'Manageable' | 'Preventable'
  description: string
  prevalence: string
}

interface PageClientProps {
  stis: STISummary[]
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'High':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const getTreatabilityColor = (treatability: string) => {
  switch (treatability) {
    case 'Curable':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Manageable':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'Preventable':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export default function PageClient({ stis }: PageClientProps) {
  const t = useTranslations('STIs')
  const tPage = useTranslations('STIsPage')
  const tPrev = useTranslations('Prevention')
  const tDetail = useTranslations('STIDetail')
  const tBreadcrumbs = useTranslations('Common.breadcrumbs')

  const whereToGet = (tPage.raw('resources.where.items') as string[]) ?? []
  const reminders = (tPage.raw('resources.reminders.items') as string[]) ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="px-4 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <BreadcrumbTrail
            items={[
              { label: tBreadcrumbs('home'), href: '/' },
              { label: tBreadcrumbs('stis') },
            ]}
          />

          <div className="space-y-12 sm:space-y-14">
            <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(280px,360px)] xl:grid-cols-[minmax(0,1fr),minmax(320px,400px)] items-center">
              <div className="space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
                    {tPage('hero.title')}
                  </h1>
                  <p className="max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {tPage('hero.subtitle')}
                  </p>
                </div>
                <Card className="p-4 sm:p-5 bg-white/85 dark:bg-gray-900/60 border border-teal-200/40 dark:border-teal-800/40 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Heart className="mt-1 text-teal-500 flex-shrink-0" size={18} />
                    <div className="space-y-1">
                      <h2 className="text-sm sm:text-base font-semibold text-teal-800 dark:text-teal-200">
                        {tPage('support.title')}
                      </h2>
                      <p className="text-sm sm:text-base text-teal-700 dark:text-teal-300 leading-relaxed">
                        {tPage('support.text')}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="order-first lg:order-last flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative w-48 h-40 sm:w-64 sm:h-52 md:w-72 md:h-60"
                >
                  <Image
                    src="/undraw_medicine_hqqg.svg"
                    alt={tPage('hero.imageAlt')}
                    fill
                    className="object-contain drop-shadow"
                    priority
                  />
                </motion.div>
              </div>
            </section>

            <section className="space-y-6">
              <header className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  {tPage('sections.learn')}
                </h2>
                <p className="max-w-2xl text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tPage('sections.learnDescription')}
                </p>
              </header>
              <Card className="p-4 sm:p-6 bg-white/90 dark:bg-gray-900/60 border border-white/50 dark:border-gray-800/70 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(320px,1.2fr)] items-center">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">
                      <PlayCircle size={16} />
                      {t('learnMore')}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                      {tPage('video.title')}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {tPage('video.description')}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl shadow-md">
                      <iframe
                        src="https://www.youtube.com/embed/gVH1gY05MsA"
                        title={tPage('video.title')}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center lg:text-left">
                      {tPage('video.caption')}
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            <section className="space-y-6">
              <header className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  {tPage('sections.guides')}
                </h2>
                <p className="max-w-2xl text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tPage('sections.guidesDescription')}
                </p>
              </header>
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/70 dark:border-green-800/60 shadow-sm">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                      <BookOpen className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          {tPage('modules.prevention.badge')}
                        </Badge>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
                          {tPrev('hero.title')}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {tPrev('hero.subtitle')}
                      </p>
                      <Link href="/stis/prevention">
                        <Button size="sm" className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700">
                          {t('startLearning')}
                          <ChevronRight size={16} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/70 dark:border-blue-800/60 shadow-sm">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                      <Heart className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                          {tPage('modules.prevalence.badge')}
                        </Badge>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
                          {tPage('modules.prevalence.title')}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {tPage('modules.prevalence.desc')}
                      </p>
                      <Link href="/stis/prevalence">
                        <Button size="sm" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700">
                          {t('viewData')}
                          <ChevronRight size={16} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section className="space-y-6">
              <header className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  {tPage('grid.title')}
                </h2>
                <p className="max-w-3xl text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tPage('sections.exploreDescription')}
                </p>
              </header>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stis.map((sti, index) => (
                  <motion.div
                    key={sti.id ?? sti.slug}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <Link href={`/stis/${sti.slug}`}>
                      <Card className="flex h-full flex-col gap-4 p-4 sm:p-6 bg-white/85 dark:bg-gray-900/60 border border-white/40 dark:border-gray-800/70 backdrop-blur hover:translate-y-[-2px] hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen className="text-teal-500 flex-shrink-0" size={18} />
                            <h3 className="truncate text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
                              {sti.name}
                            </h3>
                          </div>
                          <ChevronRight className="text-gray-400 flex-shrink-0" size={18} />
                        </div>

                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <Badge className={`${getSeverityColor(sti.severity)} text-xs`} variant="secondary">
                            {tPage(`badges.severity.${sti.severity}`)} {tDetail('risk')}
                          </Badge>
                          <Badge className={`${getTreatabilityColor(sti.treatability)} text-xs`} variant="secondary">
                            {tPage(`badges.treatability.${sti.treatability}`)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {tPage(`badges.type.${sti.type}`)}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                          {sti.description}
                        </p>

                        {sti.prevalence && (
                          <div className="mt-auto space-y-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                              <strong>{tPage('prevalenceLabel')}:</strong> {sti.prevalence}
                            </p>
                            <Button variant="outline" size="sm" className="w-full text-sm">
                              {t('learnMore')}
                            </Button>
                          </div>
                        )}
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <header className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  {tPage('sections.resources')}
                </h2>
                <p className="max-w-3xl text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tPage('sections.resourcesDescription')}
                </p>
              </header>
              <Card className="p-5 sm:p-6 md:p-8 bg-gradient-to-br from-teal-50/80 via-white to-blue-50/80 dark:from-teal-900/25 dark:via-gray-900 dark:to-blue-900/25 border border-white/60 dark:border-gray-800/70 shadow-sm">
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100">
                      {tPage('resources.where.title')}
                    </h3>
                    <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {whereToGet.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3">
                          <span className="mt-2 inline-block h-2 w-2 rounded-full bg-teal-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100">
                      {tPage('resources.reminders.title')}
                    </h3>
                    <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {reminders.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3">
                          <span className="mt-2 inline-block h-2 w-2 rounded-full bg-blue-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
