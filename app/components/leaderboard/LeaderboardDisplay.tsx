"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LeaderboardEntry, LeaderboardResponse, SortBy } from "@/types/leaderboard";
import { getLeaderboard } from "@/app/actions/leaderboard-actions";

interface LeaderboardDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: LeaderboardResponse;
}

export default function LeaderboardDisplay({
  open,
  onOpenChange,
  initialData,
}: LeaderboardDisplayProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [sortBy, setSortBy] = useState<SortBy>("bestScore");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard({
        quizType: "myths",
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sortBy,
        sortOrder: "desc",
      });
      setLeaderboardData(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, page]);

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
    }
  }, [open, page, sortBy, fetchLeaderboard]);

  // Reset to page 1 when sort changes
  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-600 dark:text-yellow-400";
    if (rank === 2) return "text-gray-600 dark:text-gray-400";
    if (rank === 3) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🏆</span>
            Quiz Leaderboard
          </DialogTitle>
          <DialogDescription>
            Top performers in the myths quiz challenge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bestScore">Best Score</SelectItem>
                    <SelectItem value="averageScore">Average Score</SelectItem>
                    <SelectItem value="totalAttempts">Total Attempts</SelectItem>
                    <SelectItem value="lastPlayedAt">Last Played</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLeaderboard()}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Refreshing...
                  </div>
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {/* Leaderboard List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">Loading leaderboard...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboardData?.entries.map((entry, index) => (
                  <motion.div
                    key={entry.nickname}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-bold min-w-[60px] ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {entry.nickname}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.totalAttempts} attempt{entry.totalAttempts !== 1 ? 's' : ''} • 
                          Last played {formatDate(entry.lastPlayedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                            {entry.bestScore}
                          </p>
                          <p className="text-xs text-muted-foreground">Best</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">
                            {entry.averageScore.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">Avg</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {leaderboardData?.entries.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No scores submitted yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Be the first to make it to the leaderboard!</p>
                  </div>
                )}
                {/* Pagination */}
                {leaderboardData && leaderboardData.totalEntries > 0 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {(page - 1) * pageSize + 1}
                      -{Math.min(page * pageSize, leaderboardData.totalEntries)} of {leaderboardData.totalEntries}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                      >
                        Prev
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {page} of {Math.max(1, Math.ceil(leaderboardData.totalEntries / pageSize))}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= Math.ceil(leaderboardData.totalEntries / pageSize) || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
