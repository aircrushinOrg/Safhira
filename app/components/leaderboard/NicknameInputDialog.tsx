/**
 * Nickname input dialog component for capturing user names when submitting quiz scores to the leaderboard.
 * This component provides form validation, character limits, and user-friendly input experience for score submission.
 * Features input validation, submission handling, and integration with the leaderboard system for competitive gameplay.
 */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import generateRandomNickname from "@/lib/nickname";
import { containsProfanity, sanitizeNickname } from "@/lib/profanity";

interface NicknameInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  onSubmit: (nickname: string) => void;
  isSubmitting?: boolean;
}

export default function NicknameInputDialog({
  open,
  onOpenChange,
  score,
  totalQuestions,
  correctAnswers,
  onSubmit,
  isSubmitting = false,
}: NicknameInputDialogProps) {
  const [nickname, setNickname] = useState(() => generateRandomNickname());
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = sanitizeNickname(nickname);
    
    if (!trimmed) {
      setError("Please enter a nickname");
      return;
    }

    if (containsProfanity(trimmed)) {
      setError("Please choose a respectful nickname");
      return;
    }
    
    if (trimmed.length > 100) {
      setError("Nickname must be 100 characters or less");
      return;
    }
    
    if (trimmed.length < 2) {
      setError("Nickname must be at least 2 characters");
      return;
    }

    setError("");
    onSubmit(trimmed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmit();
    }
  };

  const achievement = () => {
    const ratio = score / 100;
    if (ratio === 1) return { label: "Perfect!", color: "bg-gradient-to-r from-yellow-400 to-orange-500", emoji: "🏆" };
    if (ratio >= 0.8) return { label: "Excellent!", color: "bg-gradient-to-r from-green-400 to-emerald-500", emoji: "🎯" };
    if (ratio >= 0.6) return { label: "Great Job!", color: "bg-gradient-to-r from-blue-400 to-cyan-500", emoji: "⭐" };
    if (ratio >= 0.4) return { label: "Good Try!", color: "bg-gradient-to-r from-purple-400 to-pink-500", emoji: "👍" };
    return { label: "Keep Learning!", color: "bg-gradient-to-r from-gray-400 to-slate-500", emoji: "📚" };
  };

  const ach = achievement();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{ach.emoji}</span>
            <DialogTitle>Submit Your Score!</DialogTitle>
          </div>
          <DialogDescription>
            Enter your nickname to save your score to the leaderboard
          </DialogDescription>
        </DialogHeader>

        {/* Score Summary */}
        <motion.div 
          className="space-y-3 my-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`rounded-lg p-4 text-white ${ach.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-2 bg-white/20 text-white">
                  {ach.label}
                </Badge>
                <p className="text-2xl font-bold">{score}/100</p>
                <p className="text-sm opacity-90">
                  {correctAnswers}/{totalQuestions} correct answers
                </p>
              </div>
              <div className="text-4xl opacity-80">
                {ach.emoji}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Nickname Input */}
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            placeholder="Enter your nickname..."
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (error) setError("");
            }}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            maxLength={100}
            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            This will be displayed on the leaderboard
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !nickname.trim()}
            className="bg-gradient-to-r from-rose-400 to-teal-500 hover:from-rose-500 hover:to-teal-600"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </div>
            ) : (
              "Submit Score"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
