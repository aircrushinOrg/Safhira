import { TiltedScrollDemo } from '@/app/components/QuizList'

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-10 md:py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          <header className="mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              STI Myths & Facts
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Tap a myth to see the fact.
            </p>
          </header>

          <div className="flex justify-center">
            <TiltedScrollDemo />
          </div>
        </div>
      </section>
    </div>
  )
}

