/**
 * Interactive myth list client component providing gamified STI education through myths and facts.
 * This component manages quiz interactions, scoring, leaderboards, and educational content delivery.
 * Features tilted scroll interface, myth revelation, scoring system, and leaderboard integration for engaging learning experiences.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TiltedScroll } from "../ui/tilted-scroll";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";
import NicknameInputDialog from "../leaderboard/NicknameInputDialog";
import ScoreSubmittedDialog from "../leaderboard/ScoreSubmittedDialog";
import LeaderboardDisplay from "../leaderboard/LeaderboardDisplay";
import { submitQuizScore } from "../../actions/leaderboard-actions";
import { LeaderboardResponse } from "@/types/leaderboard";
import {useTranslations} from 'next-intl';

type Item = { id: string; text: string; fact?: string; isTrue?: boolean };

type QuizQuestion = {
  id: string;
  statement: string;
  isTrue: boolean;
  fact?: string;
};

// Utils
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripLeadingLabel(text: string, labels: string[]) {
  if (!text) return '';
  const pattern = new RegExp(`^(?:${labels.map(escapeRegExp).join('|')})[.,:]*\\s*`, 'i');
  return text.replace(pattern, '').trim();
}

function deriveTruth(fact?: string, fallback?: boolean) {
  if (typeof fallback === 'boolean') {
    return fallback;
  }
  if (!fact) return false;
  const normalized = fact.trim().toLowerCase();
  if (normalized.startsWith('fact.')) return true;
  if (normalized.startsWith('myth.')) return false;
  const fi = normalized.indexOf('fact.');
  const mi = normalized.indexOf('myth.');
  if (fi !== -1 && (mi === -1 || fi < mi)) return true;
  if (mi !== -1 && (fi === -1 || mi < fi)) return false;
  return false;
}

// Small presentational components
function MythFactBadge({ isFactual, t }: { isFactual: boolean; t: any }) {
  return isFactual ? (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300">
      ✓ {t('modal.factConfirmed')}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-red-600 border-red-200 dark:text-red-400 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
      ✗ {t('modal.mythDebunked')}
    </Badge>
  );
}

function ViewAllListItem({
  item,
  onSelect,
  t,
  labels,
}: {
  item: Item;
  onSelect: (item: Item) => void;
  t: any;
  labels: { fact: string; myth: string };
}) {
  const isFactual = deriveTruth(item.fact, item.isTrue);
  const factText = item.fact || '';
  const explanation = stripLeadingLabel(factText, [labels.fact, labels.myth, 'Fact', 'Myth']);
  
  return (
    <div
      className="p-4 rounded-lg border border-border/40 bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02] group"
      onClick={() => onSelect(item)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <MythFactBadge isFactual={isFactual} t={t} />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-5 h-5 text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground/90 mb-2 leading-relaxed line-clamp-2">
            {item.text}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {explanation || t('factUnavailable')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MythListClient({ items, allItems }: { items: Item[]; allItems?: Item[] }) {
  const t = useTranslations('Quiz');
  const labelSet = { fact: t('fact'), myth: t('myth') };
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);

  const [quizOpen, setQuizOpen] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Track per-question responses so users can go back to review without editing
  const [responses, setResponses] = useState<(null | { userAnswer: boolean; isCorrect: boolean })[]>([]);

  // Leaderboard states
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [scoreSubmittedDialogOpen, setScoreSubmittedDialogOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [submittedNickname, setSubmittedNickname] = useState("");
  const [userRank, setUserRank] = useState<number>(0);
  const [userStats, setUserStats] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [viewAllFilter, setViewAllFilter] = useState<"all" | "myth" | "fact">("all");

  const completeList = useMemo(() => {
    if (allItems && allItems.length > 0) {
      return allItems;
    }
    return items;
  }, [items, allItems]);

  const filteredList = useMemo(() => {
    if (viewAllFilter === "all") {
      return completeList;
    }
    return completeList.filter((item) => {
      const isFactual = deriveTruth(item.fact, item.isTrue);
      return viewAllFilter === "fact" ? isFactual : !isFactual;
    });
  }, [completeList, viewAllFilter]);

  const handleClick = (item: Item) => {
    setSelected(item);
    setOpen(true);
  };

  const handleViewAll = () => {
    setViewAllOpen(true);
  };

  const startQuiz = () => {
    // Build quiz questions from the full dataset and pick 5 at random
    const pool: QuizQuestion[] = completeList.map((it) => ({
      id: it.id,
      statement: it.text,
      isTrue: deriveTruth(it.fact, it.isTrue),
      fact: it.fact,
    }));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(5, shuffled.length));
    setQuestions(chosen);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setAnswered(false);
    setIsCorrect(null);
    setResponses(Array(chosen.length).fill(null));
    setQuizOpen(true);
  };

  const answer = useCallback((userSaysTrue: boolean) => {
    const q = questions[current];
    if (!q) return;
    if (answered) return;
    const correct = q.isTrue === userSaysTrue;
    setIsCorrect(correct);
    setAnswered(true);
    setResponses((prev) => {
      const next = [...prev];
      next[current] = { userAnswer: userSaysTrue, isCorrect: correct };
      return next;
    });
    if (correct) setScore((s) => s + 1);
  }, [questions, current, answered]);

  const goNext = useCallback(() => {
    if (!answered) return;
    const next = current + 1;
    if (next >= questions.length) {
      setFinished(true);
      // Celebrate good runs
      const total = questions.length || 1;
      const ratio = score / total;
      if (ratio >= 0.6 || score === total) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2400);
      }
    } else {
      setCurrent(next);
      const resp = responses[next];
      setAnswered(!!resp);
      setIsCorrect(resp ? resp.isCorrect : null);
    }
  }, [answered, current, questions.length, score, responses]);

  const goPrev = useCallback(() => {
    const prev = current - 1;
    if (prev < 0) return;
    setCurrent(prev);
    const resp = responses[prev];
    setAnswered(!!resp);
    setIsCorrect(resp ? resp.isCorrect : null);
  }, [current, responses]);

  // Handle quiz completion and show nickname input
  const handleQuizComplete = () => {
    setQuizOpen(false);
    setNicknameDialogOpen(true);
  };

  // Handle score submission
  const handleSubmitScore = async (nickname: string) => {
    setIsSubmittingScore(true);
    try {
      const scorePercentage = score * 20; // Convert to 0-100 scale
      const result = await submitQuizScore({
        nickname,
        score: scorePercentage,
        totalQuestions: questions.length,
        correctAnswers: score,
        quizType: "myths",
      });

      if (result.success) {
        setSubmittedNickname(nickname);
        setUserRank(result.rank || 0);
        setUserStats(result.stats);
        setNicknameDialogOpen(false);
        setScoreSubmittedDialogOpen(true);
      } else {
        console.error("Score submission failed:", result.error);
        // You could show an error dialog here
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Handle viewing leaderboard
  const handleViewLeaderboard = () => {
    setLeaderboardOpen(true);
  };

  // Handle try again
  const handleTryAgain = () => {
    startQuiz();
  };

  const achievement = useMemo(() => {
    const total = questions.length || 5;
    const ratio = total ? score / total : 0;
    if (ratio === 1)
      return {
        label: t('achievements.gold.label'),
        desc: t('achievements.gold.desc'),
        variant: "default" as const,
      };
    if (ratio >= 0.6)
      return {
        label: t('achievements.silver.label'),
        desc: t('achievements.silver.desc'),
        variant: "secondary" as const,
      };
    if (ratio >= 0.2)
      return {
        label: t('achievements.bronze.label'),
        desc: t('achievements.bronze.desc'),
        variant: "outline" as const,
      };
    return {
      label: t('achievements.keepLearning.label'),
      desc: t('achievements.keepLearning.desc'),
      variant: "outline" as const,
    };
  }, [score, questions.length, t]);

  // Keyboard shortcuts: T/ArrowRight for True, F/ArrowLeft for False, Enter for Next
  useEffect(() => {
    if (!quizOpen || finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "t" || e.key === "ArrowRight") {
        e.preventDefault();
        if (!answered) answer(true);
        return;
      }
      if (e.key.toLowerCase() === "f" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (!answered) answer(false);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (answered) goNext();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quizOpen, finished, answered, current, questions, answer, goNext]);

  return (
    <div className="space-y-16">
      <TooltipProvider>
        <div className="relative">
          <Tooltip delayDuration={1500}>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <TiltedScroll items={items} onItemClick={handleClick} className="mt-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-center">
                {t('tooltips.clickCard')}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="flex justify-center gap-4 flex-wrap">
        <Button
          size="lg"
          className="flex h-12 md:h-14 px-6 md:px-8 py-3 text-base md:text-lg bg-gradient-to-r from-rose-400 to-teal-500 dark:from-rose-400 dark:to-teal-500 hover:from-rose-600 hover:to-teal-600 dark:hover:from-rose-500  dark:hover:to-teal-500 text-white dark:text-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
          onClick={startQuiz}
          disabled={completeList.length === 0}
        >
          {t('start')}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex h-12 md:h-14 px-6 md:px-8 py-3 text-base md:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
          onClick={handleViewLeaderboard}
        >
          🏆 {t('leaderboard')}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex h-12 md:h-14 px-6 md:px-8 py-3 text-base md:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          onClick={handleViewAll}
        >
          📋 {t('viewAll.button')}
        </Button>
      </div>

      {/* Info Dialog for myths and facts */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            (() => {
              const isFactual = deriveTruth(selected?.fact, selected?.isTrue);
              const factText = selected?.fact || '';
              const explanation = stripLeadingLabel(factText, [labelSet.fact, labelSet.myth, 'Fact', 'Myth']);
              
              return (
                <>
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MythFactBadge isFactual={isFactual} t={t} />
                    </div>
                    <DialogTitle className="text-lg font-medium text-left">
                      {selected?.text}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-left">
                      {isFactual ? t('modal.factTitle') : t('modal.mythTitle')} • {t('dialog.closeHint')}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {isFactual ? t('modal.factExplanation') : t('modal.truthExplanation')}
                      </span>
                    </div>
                    <div className={`rounded-lg p-4 border-l-4 ${
                      isFactual 
                        ? 'bg-green-50 dark:bg-green-950/40 border-green-500'
                        : 'bg-blue-50 dark:bg-blue-950/40 border-blue-500'
                    }`}>
                      <p className="text-sm leading-relaxed">
                        {explanation || t('factUnavailable')}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-hidden p-8">
          {!finished && (
            <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-muted w-full sm:w-80 md:w-96">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium text-muted-foreground">
                  {t('quick.title')}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] border font-mono">
                    T
                  </kbd>
                  <span>{t('quick.true')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] border font-mono">
                    F
                  </kbd>
                  <span>{t('quick.false')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] border font-mono">
                    ↵
                  </kbd>
                  <span>{t('quick.continue')}</span>
                </div>
              </div>
            </div>
          )}
          {!finished ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t('quiz.question', {current: current + 1, total: questions.length || 5})}
                </DialogTitle>
                <DialogDescription>
                  {t('quiz.instruction')}
                </DialogDescription>
              </DialogHeader>

              <div className="relative">
                <div
                  aria-hidden
                  className="genz-gradient pointer-events-none absolute -inset-4 rounded-3xl opacity-70 blur-2xl"
                />
                <motion.div
                  className={`relative rounded-2xl border p-5 md:p-6 backdrop-blur-xl transition-all shadow-md bg-white/60 dark:bg-white/5 ${answered ? (isCorrect ? 'border-green-500/60 ring-1 ring-green-500/30' : 'border-red-500/60 ring-1 ring-red-500/30 shake') : 'border-white/60 dark:border-white/10'}`}
                  initial={{ y: 8, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                  <p className="relative text-lg md:text-xl leading-relaxed text-foreground/90 text-balance">
                    {questions[current]?.statement}
                  </p>
                </motion.div>
              </div>

              {!answered ? (
                <div className={`flex items-center ${current > 0 ? 'justify-between' : 'justify-end'} mt-8`}>
                  {current > 0 && (
                    <Button
                      variant="ghost"
                      onClick={goPrev}
                      className="transition-transform active:scale-95"
                    >
                      ← {t('actions.previous')}
                    </Button>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => answer(false)}
                      className="transition-transform active:scale-95"
                    >
                      {t('actions.false')}
                    </Button>
                    <Button
                      onClick={() => answer(true)}
                      className="transition-transform active:scale-95"
                    >
                      {t('actions.true')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`flex items-start gap-3 rounded-md border p-3 ${
                      isCorrect
                        ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
                    }`}
                  >
                    {isCorrect ? (
                      <svg
                        className="h-5 w-5 text-green-600 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.829a1 1 0 111.414-1.414l3.01 3.01 6.657-6.657a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-600 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          isCorrect
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {isCorrect ? t('feedback.correct') : t('feedback.wrong')}
                      </p>
                      {questions[current]?.fact && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {questions[current]?.fact}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center ${current > 0 ? 'justify-between' : 'justify-end'}`}>
                    {current > 0 && (
                      <Button
                        variant="ghost"
                        onClick={goPrev}
                        className="transition-transform active:scale-95"
                      >
                        ← {t('actions.previous')}
                      </Button>
                    )}
                    <Button
                      onClick={goNext}
                      className="transition-transform active:scale-95"
                    >
                      {current === questions.length - 1 ? t('actions.finish') : t('actions.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t('complete.title')}</DialogTitle>
                <DialogDescription>{t('complete.subtitle')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={achievement.variant}>
                    {achievement.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {achievement.desc}
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-md border bg-card p-5">
                  {showConfetti && <ConfettiBurst />}
                  <p className="text-lg">
                    {t('complete.scoreLabel')}{" "}
                    <span className="font-semibold text-teal-700 dark:text-teal-300">
                      {score * 20}
                    </span>{" "}
                    {t('complete.of100')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('complete.tryHint')}
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleQuizComplete}>
                    {t('actions.submitScore')}
                  </Button>
                  <Button variant="outline" onClick={() => setQuizOpen(false)}>
                    {t('actions.close')}
                  </Button>
                  <Button onClick={startQuiz}>{t('actions.tryAgain')}</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Nickname Input Dialog */}
      <NicknameInputDialog
        open={nicknameDialogOpen}
        onOpenChange={setNicknameDialogOpen}
        score={score * 20} // Convert to 0-100 scale
        totalQuestions={questions.length}
        correctAnswers={score}
        onSubmit={handleSubmitScore}
        isSubmitting={isSubmittingScore}
      />

      {/* Score Submitted Dialog */}
      <ScoreSubmittedDialog
        open={scoreSubmittedDialogOpen}
        onOpenChange={setScoreSubmittedDialogOpen}
        nickname={submittedNickname}
        rank={userRank}
        stats={userStats || { bestScore: 0, averageScore: "0", totalAttempts: 0 }}
        onViewLeaderboard={handleViewLeaderboard}
        onTryAgain={handleTryAgain}
      />

      {/* Leaderboard Display */}
      <LeaderboardDisplay
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
        initialData={leaderboardData || undefined}
      />

      {/* View All Myths & Facts Dialog */}
      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {t('viewAll.title')}
            </DialogTitle>
            <DialogDescription>
              {t('viewAll.subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 border-b pb-3">
            <Button
              size="sm"
              variant={viewAllFilter === "all" ? "default" : "outline"}
              onClick={() => setViewAllFilter("all")}
              className="transition-all duration-200"
            >
              {t('viewAll.filterAll', {count: completeList.length})}
            </Button>
            <Button
              size="sm"
              variant={viewAllFilter === "myth" ? "default" : "outline"}
              onClick={() => setViewAllFilter("myth")}
              className="transition-all duration-200"
            >
              ✗ {t('viewAll.filterMyths', {count: completeList.filter(item => !deriveTruth(item.fact, item.isTrue)).length})}
            </Button>
            <Button
              size="sm"
              variant={viewAllFilter === "fact" ? "default" : "outline"}
              onClick={() => setViewAllFilter("fact")}
              className="transition-all duration-200"
            >
              ✓ {t('viewAll.filterFacts', {count: completeList.filter(item => deriveTruth(item.fact, item.isTrue)).length})}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((item, index) => {
                const isFactual = deriveTruth(item.fact, item.isTrue);
                const factText = item.fact || '';
                const explanation = stripLeadingLabel(factText, [labelSet.fact, labelSet.myth, 'Fact', 'Myth']);
                
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-border/40 bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02] group"
                    onClick={() => {
                      handleClick(item);
                      setViewAllOpen(false);
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-shrink-0">
                          {isFactual ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300">
                              ✓ {t('modal.factConfirmed')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-200 dark:text-red-400 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                              ✗ {t('modal.mythDebunked')}
                            </Badge>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-5 h-5 text-blue-600 dark:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground/90 mb-2 leading-relaxed line-clamp-2">
                          {item.text}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {explanation || t('factUnavailable')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setViewAllOpen(false)}
              className="transition-all duration-200 hover:scale-105"
            >
              {t('actions.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Local styles for small animations */}
      <style jsx>{`
        .shake {
          animation: shake 250ms ease-in-out;
        }
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-3px);
          }
          50% {
            transform: translateX(3px);
          }
          75% {
            transform: translateX(-2px);
          }
          100% {
            transform: translateX(0);
          }
        }
        .genz-gradient {
          background:
            radial-gradient(120px 120px at 10% 10%, rgba(56,189,248,0.35), transparent 60%),
            radial-gradient(160px 160px at 90% 20%, rgba(244,114,182,0.35), transparent 60%),
            radial-gradient(140px 140px at 20% 90%, rgba(250,204,21,0.35), transparent 60%),
            radial-gradient(160px 160px at 80% 80%, rgba(167,139,250,0.35), transparent 60%);
          animation: floaty 10s ease-in-out infinite alternate;
        }
        @keyframes floaty {
          0% { transform: translateY(0px) translateX(0px) scale(1); filter: hue-rotate(0deg); }
          50% { transform: translateY(4px) translateX(-2px) scale(1.02); }
          100% { transform: translateY(-2px) translateX(2px) scale(1.01); filter: hue-rotate(10deg); }
        }
      `}</style>
    </div>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 28 });
  const colors = [
    "#34d399", // teal-400
    "#f472b6", // pink-400
    "#60a5fa", // blue-400
    "#fbbf24", // amber-400
    "#a78bfa", // violet-400
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.2;
        const duration = 1.2 + Math.random() * 0.8;
        const size = 6 + Math.random() * 6;
        const rotate = Math.random() * 360;
        const bg = colors[i % colors.length];
        return (
          <span
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${left}%`,
              top: `-10%`,
              width: `${size}px`,
              height: `${size * 0.6}px`,
              background: bg,
              transform: `rotate(${rotate}deg)`,
              animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10%) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(120%) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
