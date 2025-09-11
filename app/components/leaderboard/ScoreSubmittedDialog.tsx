"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface ScoreSubmittedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nickname: string;
  rank: number;
  stats: {
    bestScore: number;
    averageScore: string;
    totalAttempts: number;
  };
  onViewLeaderboard: () => void;
  onTryAgain: () => void;
}

export default function ScoreSubmittedDialog({
  open,
  onOpenChange,
  nickname,
  rank,
  stats,
  onViewLeaderboard,
  onTryAgain,
}: ScoreSubmittedDialogProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { text: "1st Place!", emoji: "🥇", color: "text-yellow-600 dark:text-yellow-400" };
    if (rank === 2) return { text: "2nd Place!", emoji: "🥈", color: "text-gray-600 dark:text-gray-400" };
    if (rank === 3) return { text: "3rd Place!", emoji: "🥉", color: "text-amber-600 dark:text-amber-400" };
    if (rank <= 10) return { text: `${rank}th Place`, emoji: "⭐", color: "text-blue-600 dark:text-blue-400" };
    if (rank <= 50) return { text: `${rank}th Place`, emoji: "🎯", color: "text-green-600 dark:text-green-400" };
    return { text: `${rank}th Place`, emoji: "🚀", color: "text-purple-600 dark:text-purple-400" };
  };

  const rankInfo = getRankDisplay(rank);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎉</span>
            <DialogTitle>Score Submitted!</DialogTitle>
          </div>
          <DialogDescription>
            Your score has been added to the leaderboard
          </DialogDescription>
        </DialogHeader>

        <motion.div 
          className="space-y-4 my-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Rank Announcement */}
          <Card className="border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/50 dark:to-blue-950/50">
            <CardContent className="p-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-2"
              >
                <span className="text-4xl">{rankInfo.emoji}</span>
              </motion.div>
              <h3 className="text-lg font-bold mb-1">{nickname}</h3>
              <p className={`text-xl font-bold ${rankInfo.color}`}>
                {rankInfo.text}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                on the global leaderboard
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {stats.bestScore}
              </p>
              <p className="text-xs text-muted-foreground">Best Score</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-lg font-bold">
                {parseFloat(stats.averageScore).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-lg font-bold">
                {stats.totalAttempts}
              </p>
              <p className="text-xs text-muted-foreground">
                Attempt{stats.totalAttempts !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="text-center py-2">
            {rank <= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Badge variant="secondary" className="mb-2">
                  Amazing!
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You're in the top 3! 🎊
                </p>
              </motion.div>
            )}
            {rank > 3 && rank <= 10 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Badge variant="secondary" className="mb-2">
                  Excellent!
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You're in the top 10! Keep it up! 💪
                </p>
              </motion.div>
            )}
            {rank > 10 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Badge variant="secondary" className="mb-2">
                  Great Job!
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Try again to climb higher! 🚀
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onTryAgain();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Try Again
          </Button>
          <Button
            onClick={() => {
              onViewLeaderboard();
              onOpenChange(false);
            }}
            className="flex-1 bg-gradient-to-r from-rose-400 to-teal-500 hover:from-rose-500 hover:to-teal-600"
          >
            View Leaderboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
