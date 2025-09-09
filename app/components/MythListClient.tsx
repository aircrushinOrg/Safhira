"use client"

import { useMemo, useState } from "react"
import { TiltedScroll } from "./ui/tilted-scroll"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

type Item = { id: string; text: string; fact?: string }

type QuizQuestion = {
  id: string
  statement: string
  isTrue: boolean
  fact?: string
}

export default function MythListClient({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Item | null>(null)

  const [quizOpen, setQuizOpen] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const handleClick = (item: Item) => {
    setSelected(item)
    setOpen(true)
  }

  const deriveTruth = (fact?: string) => {
    if (!fact) return false
    const t = fact.trim().toLowerCase()
    // Determine if the statement is true based on the explanation prefix
    // e.g., "Fact. ..." => true, "Myth. ..." => false
    if (t.startsWith("fact.")) return true
    if (t.startsWith("myth.")) return false
    // Fallback: if contains "fact." earlier than "myth.", assume true
    const fi = t.indexOf("fact.")
    const mi = t.indexOf("myth.")
    if (fi !== -1 && (mi === -1 || fi < mi)) return true
    if (mi !== -1 && (fi === -1 || mi < fi)) return false
    return false
  }

  const startQuiz = () => {
    // Build quiz questions from items and pick 5 at random
    const pool: QuizQuestion[] = items.map((it) => ({
      id: it.id,
      statement: it.text,
      isTrue: deriveTruth(it.fact),
      fact: it.fact,
    }))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const chosen = shuffled.slice(0, Math.min(5, shuffled.length))
    setQuestions(chosen)
    setCurrent(0)
    setScore(0)
    setFinished(false)
    setQuizOpen(true)
  }

  const answer = (userSaysTrue: boolean) => {
    const q = questions[current]
    if (!q) return
    const correct = q.isTrue === userSaysTrue
    if (correct) setScore((s) => s + 1)
    const next = current + 1
    if (next >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(next)
    }
  }

  const achievement = useMemo(() => {
    const total = questions.length || 5
    const ratio = total ? score / total : 0
    if (ratio === 1) return { label: "Gold", desc: "Perfect score!", variant: "default" as const }
    if (ratio >= 0.6) return { label: "Silver", desc: "Great job!", variant: "secondary" as const }
    if (ratio >= 0.2) return { label: "Bronze", desc: "Nice try!", variant: "outline" as const }
    return { label: "Keep Learning", desc: "Try again to improve", variant: "outline" as const }
  }, [score, questions.length])

  return (
    <div className="space-y-10">
      <TiltedScroll items={items} onItemClick={handleClick} className="mt-4" />

      <div className="flex justify-center">
        <Button
          size="lg"
          className="h-12 md:h-14 px-8 text-base md:text-lg bg-teal-600 hover:bg-teal-700 text-white"
          onClick={startQuiz}
          disabled={items.length === 0}
        >
          Start Quiz
        </Button>
      </div>

      {/* Info Dialog for single myth */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Myth</Badge>
              <DialogTitle className="text-balance">
                {selected?.text || "Myth"}
              </DialogTitle>
            </div>
            <DialogDescription>
              Tap outside the dialog to close.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge>Fact</Badge>
              <span className="text-sm text-muted-foreground">The truth behind the myth</span>
            </div>
            <p className="leading-relaxed text-foreground">
              {selected?.fact || "Fact not available."}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="sm:max-w-xl">
          {!finished ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Question {current + 1} of {questions.length || 5}
                </DialogTitle>
                <DialogDescription>
                  Decide if the statement is true or false
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-md border bg-card p-4">
                <p className="text-lg leading-relaxed">{questions[current]?.statement}</p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => answer(false)}>False</Button>
                <Button onClick={() => answer(true)}>True</Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Quiz Complete</DialogTitle>
                <DialogDescription>Your results</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={achievement.variant}>{achievement.label}</Badge>
                  <span className="text-sm text-muted-foreground">{achievement.desc}</span>
                </div>
                <div className="rounded-md border bg-card p-4">
                  <p className="text-lg">Score: {score} / {questions.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Tap Try Again to retake the quiz.</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setQuizOpen(false)}>Close</Button>
                  <Button onClick={startQuiz}>Try Again</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
