/**
 * Interactive Quiz page that presents myths and facts about STIs in an engaging format.
 * This page features a tilted scroll interface displaying quiz questions, educational content, and evidence-based information.
 * Helps users learn about sexual health through gamified content while breaking down stigma and misconceptions.
 */
import { TiltedScrollDemo } from '@/app/components/quiz/TiltedScrollDemo'
import { getRandomQuizQuestions, getAllQuizQuestions, type QuizQuestionRecord } from '@/app/actions/quiz-question-actions'
import { getTranslations, getLocale } from 'next-intl/server'
import BreadcrumbTrail from '@/app/components/BreadcrumbTrail'

type QuizListItem = {
  id: string
  text: string
  fact?: string
  isTrue: boolean
}

export default async function QuizPage() {
  const t = await getTranslations('QuizPage')
  const tBreadcrumbs = await getTranslations('Common.breadcrumbs')
  const tQuiz = await getTranslations('Quiz')
  const locale = await getLocale()

  const [randomQuestions, allQuestions] = await Promise.all([
    getRandomQuizQuestions('general', 8, locale),
    getAllQuizQuestions(locale),
  ])

  const factLabel = tQuiz('fact')
  const mythLabel = tQuiz('myth')

  const mapToQuizListItem = (question: QuizQuestionRecord): QuizListItem => {
    const prefix = question.isTrue ? `${factLabel}.` : `${mythLabel}.`
    const explanation = question.explanation?.trim()
    return {
      id: question.id.toString(),
      text: question.statement,
      fact: explanation ? `${prefix} ${explanation}` : prefix,
      isTrue: question.isTrue,
    }
  }

  const featuredItems = randomQuestions.map(mapToQuizListItem)
  const allItems = allQuestions.map(mapToQuizListItem)
  const learnItems = t.raw('learn.items') as string[]

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.10] dark:opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      <section className="relative w-full px-4 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <BreadcrumbTrail
            items={[
              { label: tBreadcrumbs('home'), href: '/' },
              { label: tBreadcrumbs('quiz') },
            ]}
          />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
            {/* Left: Title & intro */}
            <div className="md:col-span-5 lg:col-span-5 xl:col-span-4">
              <header className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
                  <SparkleIcon className="h-4 w-4 text-rose-500" />
                  {t('hero.badge')}
                </div>
                <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 text-balance">
                  {t('hero.title')}
                </h1>
                <p className="mt-2 text-gray-700/90 dark:text-gray-300/90">
                  {t('hero.subtitle')}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300/80">
                  <BadgePill icon={<ShieldIcon className="h-3.5 w-3.5" />}>{t('pills.evidence')}</BadgePill>
                  <BadgePill icon={<HeartIcon className="h-3.5 w-3.5" />}>{t('pills.noJudgment')}</BadgePill>
                  <BadgePill icon={<BoltIcon className="h-3.5 w-3.5" />}>{t('pills.quickFun')}</BadgePill>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                      <BookIcon className="h-4 w-4 text-rose-500" />
                      {t('learn.title')}
                    </div>
                    <ul className="mt-1 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {learnItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 h-4 w-4 text-teal-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <InfoIcon className="h-4 w-4" />
                    {t('info')}
                  </div>
                </div>
              </header>
            </div>

            {/* Right: Quiz list */}
            <div className="md:col-span-7 lg:col-span-7 xl:col-span-8">
              <div className="relative flex justify-center md:justify-end">
                <div aria-hidden className="pointer-events-none absolute -inset-x-4 -top-4 -bottom-4 rounded-[2rem] bg-gradient-to-br from-rose-200/20 via-teal-200/15 to-amber-200/15 blur-xl dark:from-rose-400/10 dark:via-teal-400/10 dark:to-amber-400/10" />
                <div id="quiz-list" className="w-full max-w-2xl md:max-w-none">
                  <TiltedScrollDemo featuredItems={featuredItems} allItems={allItems} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Decorative SVG background removed per request

function BadgePill({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/70 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
      {icon}
      {children}
    </span>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 2l1.7 3.9L16 7l-3.3 1.1L10 12 8.3 8.1 5 7l3.3-1.1L10 2z" />
      <path d="M4 12l.9 2.1L7 15l-2.1.9L4 18l-.9-2.1L1 15l2.1-.9L4 12z" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 21s-6.7-4.3-9.3-7C.8 11.9 2 8 5.4 8c1.9 0 3.1 1.3 3.6 2.2.5-.9 1.7-2.2 3.6-2.2 3.4 0 4.6 3.9 2.7 6-2.6 2.7-9.3 7-9.3 7z" />
    </svg>
  )
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8.5 12.086l6.793-6.793a1 1 0 011.411-.003z" clipRule="evenodd" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M20 22H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2H20v20z" />
    </svg>
  )
}
