/**
 * Server actions for leaderboard management and quiz scoring functionality.
 * This module handles score submission, ranking calculations, leaderboard retrieval, and competitive gaming features.
 * Features score validation, ranking algorithms, statistical analysis, and user achievement tracking for gamified learning.
 */
'use server';

import { db } from '@/app/db';
import { quizResults, quizLeaderboardStats } from '@/db/schema';
import { desc, eq, sql, and, or } from 'drizzle-orm';
import { 
  SubmitScoreRequest, 
  LeaderboardFilters, 
  LeaderboardResponse,
  LeaderboardEntry,
  QuizLeaderboardStats
} from '@/types/leaderboard';
import { containsProfanity, sanitizeNickname } from '@/lib/profanity';

async function computeLeaderboardRank(quizType: string, nickname: string): Promise<number | null> {
  if (!nickname) return null;

  const rankedEntries = await db
    .select({
      nickname: quizLeaderboardStats.nickname,
      rank: sql<number>`rank() over (
        order by
          ${quizLeaderboardStats.bestScore} desc,
          ${quizLeaderboardStats.averageScore} desc,
          ${quizLeaderboardStats.lastPlayedAt} asc,
          ${quizLeaderboardStats.nickname} asc
      )`,
    })
    .from(quizLeaderboardStats)
    .where(eq(quizLeaderboardStats.quizType, quizType));

  const matchingEntry = rankedEntries.find((entry) => entry.nickname === nickname);

  return matchingEntry ? Number(matchingEntry.rank) : null;
}

export async function submitQuizScore(data: SubmitScoreRequest) {
  try {
    // Validate required fields
    if (!data.nickname || typeof data.score !== 'number' || typeof data.correctAnswers !== 'number') {
      return {
        success: false,
        error: 'Missing required fields: nickname, score, correctAnswers'
      };
    }

    // Validate score range
    if (data.score < 0 || data.score > 100) {
      return {
        success: false,
        error: 'Score must be between 0 and 100'
      };
    }

    // Validate nickname length
    if (data.nickname.length > 100 || data.nickname.trim().length === 0) {
      return {
        success: false,
        error: 'Nickname must be between 1 and 100 characters'
      };
    }

    const {
      nickname,
      score,
      totalQuestions = 5,
      correctAnswers,
      quizType = 'myths'
    } = data;

    // Sanitize nickname
    const sanitizedNickname = sanitizeNickname(nickname);

    // Profanity check (server-side enforcement)
    if (containsProfanity(sanitizedNickname)) {
      return {
        success: false,
        error: 'Nickname contains inappropriate language'
      };
    }

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Insert quiz result
      const insertedResult = await tx
        .insert(quizResults)
        .values({
          nickname: sanitizedNickname,
          score,
          totalQuestions,
          correctAnswers,
          quizType,
        })
        .returning({ id: quizResults.id });

      // Get current stats for this nickname and quiz type
      const existingStats = await tx
        .select()
        .from(quizLeaderboardStats)
        .where(
          and(
            eq(quizLeaderboardStats.nickname, sanitizedNickname),
            eq(quizLeaderboardStats.quizType, quizType)
          )
        );

      if (existingStats.length === 0) {
        // First time playing - create new stats record
        await tx
          .insert(quizLeaderboardStats)
          .values({
            nickname: sanitizedNickname,
            bestScore: score,
            averageScore: score.toString(),
            totalAttempts: 1,
            quizType,
            lastPlayedAt: new Date(),
          });
      } else {
        // Update existing stats
        const current = existingStats[0];
        const newTotalAttempts = current.totalAttempts + 1;
        const currentAverage = parseFloat(current.averageScore);
        const newAverageScore = ((currentAverage * current.totalAttempts) + score) / newTotalAttempts;
        const newBestScore = Math.max(current.bestScore, score);

        await tx
          .update(quizLeaderboardStats)
          .set({
            bestScore: newBestScore,
            averageScore: newAverageScore.toFixed(2),
            totalAttempts: newTotalAttempts,
            lastPlayedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(quizLeaderboardStats.nickname, sanitizedNickname),
              eq(quizLeaderboardStats.quizType, quizType)
            )
          );
      }

      return insertedResult[0];
    });

    // Get updated stats to return
    const updatedStats = await db
      .select()
      .from(quizLeaderboardStats)
      .where(
        and(
          eq(quizLeaderboardStats.nickname, sanitizedNickname),
          eq(quizLeaderboardStats.quizType, quizType)
        )
      );

    // Calculate rank using the same ordering rules as the leaderboard view
    const rank = await computeLeaderboardRank(quizType, sanitizedNickname);

    return {
      success: true,
      resultId: result.id,
      stats: updatedStats[0],
      rank: rank ?? null,
      message: 'Score submitted successfully!',
    };

  } catch (error) {
    console.error('Error submitting score:', error);
    return {
      success: false,
      error: 'Failed to submit score'
    };
  }
}

export async function getLeaderboard(
  filters: LeaderboardFilters = {},
  nickname?: string
): Promise<LeaderboardResponse> {
  try {
    const {
      quizType = 'myths',
      limit = 50,
      offset = 0,
      sortBy = 'bestScore',
      sortOrder = 'desc',
    } = filters;

    // Build the sorting column
    const sortColumn = {
      bestScore: quizLeaderboardStats.bestScore,
      averageScore: quizLeaderboardStats.averageScore,
      totalAttempts: quizLeaderboardStats.totalAttempts,
      lastPlayedAt: quizLeaderboardStats.lastPlayedAt,
    }[sortBy];

    // Build the complete query with sorting and pagination
    const entries = await db
      .select({
        nickname: quizLeaderboardStats.nickname,
        bestScore: quizLeaderboardStats.bestScore,
        averageScore: quizLeaderboardStats.averageScore,
        totalAttempts: quizLeaderboardStats.totalAttempts,
        lastPlayedAt: quizLeaderboardStats.lastPlayedAt,
      })
      .from(quizLeaderboardStats)
      .where(eq(quizLeaderboardStats.quizType, quizType))
      .orderBy(sortOrder === 'desc' ? desc(sortColumn) : sortColumn)
      .limit(limit)
      .offset(offset);

    // Convert to LeaderboardEntry format with ranks
    const leaderboardEntries: LeaderboardEntry[] = entries.map((entry, index) => ({
      nickname: entry.nickname,
      bestScore: entry.bestScore,
      averageScore: parseFloat(entry.averageScore),
      totalAttempts: entry.totalAttempts,
      lastPlayedAt: entry.lastPlayedAt,
      rank: offset + index + 1,
    }));

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizLeaderboardStats)
      .where(eq(quizLeaderboardStats.quizType, quizType));
    
    const totalEntries = totalCountResult[0]?.count || 0;

    // Get user's rank and stats if nickname is provided
    let userRank: number | undefined;
    let userStats: QuizLeaderboardStats | undefined;

    if (nickname) {
      // Get user's stats
      const userStatsResult = await db
        .select()
        .from(quizLeaderboardStats)
        .where(
          and(
            eq(quizLeaderboardStats.nickname, nickname),
            eq(quizLeaderboardStats.quizType, quizType)
          )
        );

      userStats = userStatsResult[0];

      if (userStats) {
        // Calculate user's rank
        userRank = await computeLeaderboardRank(quizType, userStats.nickname) ?? undefined;
      }
    }

    return {
      entries: leaderboardEntries,
      totalEntries,
      userRank,
      userStats,
    };

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('Failed to fetch leaderboard');
  }
}

export async function getUserStats(nickname: string, quizType: string = 'myths') {
  try {
    const stats = await db
      .select()
      .from(quizLeaderboardStats)
      .where(
        and(
          eq(quizLeaderboardStats.nickname, nickname),
          eq(quizLeaderboardStats.quizType, quizType)
        )
      );

    if (stats.length === 0) {
      return null;
    }

    // Calculate rank
    return {
      ...stats[0],
      rank: await computeLeaderboardRank(quizType, nickname) ?? null,
    };

  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw new Error('Failed to fetch user stats');
  }
}

export async function getRecentResults(nickname: string, quizType: string = 'myths', limit: number = 10) {
  try {
    const results = await db
      .select()
      .from(quizResults)
      .where(
        and(
          eq(quizResults.nickname, nickname),
          eq(quizResults.quizType, quizType)
        )
      )
      .orderBy(desc(quizResults.createdAt))
      .limit(limit);

    return results;

  } catch (error) {
    console.error('Error fetching recent results:', error);
    throw new Error('Failed to fetch recent results');
  }
}
