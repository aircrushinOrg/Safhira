import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { quizResults, quizLeaderboardStats } from '@/db/schema';
import { desc, eq, sql, and, or } from 'drizzle-orm';
import { LeaderboardFilters, LeaderboardEntry, LeaderboardResponse } from '@/types/leaderboard';

// GET /api/leaderboard - Get leaderboard entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: LeaderboardFilters = {
      quizType: searchParams.get('quizType') || 'myths',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: (searchParams.get('sortBy') as any) || 'bestScore',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    const nickname = searchParams.get('nickname');

    // Build the sorting column
    const sortColumn = {
      bestScore: quizLeaderboardStats.bestScore,
      averageScore: quizLeaderboardStats.averageScore,
      totalAttempts: quizLeaderboardStats.totalAttempts,
      lastPlayedAt: quizLeaderboardStats.lastPlayedAt,
    }[filters.sortBy!];

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
      .where(eq(quizLeaderboardStats.quizType, filters.quizType!))
      .orderBy(filters.sortOrder === 'desc' ? desc(sortColumn) : sortColumn)
      .limit(filters.limit!)
      .offset(filters.offset!);

    // Convert to LeaderboardEntry format with ranks
    const leaderboardEntries: LeaderboardEntry[] = entries.map((entry, index) => ({
      nickname: entry.nickname,
      bestScore: entry.bestScore,
      averageScore: parseFloat(entry.averageScore),
      totalAttempts: entry.totalAttempts,
      lastPlayedAt: entry.lastPlayedAt,
      rank: filters.offset! + index + 1,
    }));

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizLeaderboardStats)
      .where(eq(quizLeaderboardStats.quizType, filters.quizType!));
    
    const totalEntries = totalCountResult[0]?.count || 0;

    // Get user's rank and stats if nickname is provided
    let userRank: number | undefined;
    let userStats: any;

    if (nickname) {
      // Get user's stats
      const userStatsResult = await db
        .select()
        .from(quizLeaderboardStats)
        .where(
          and(
            eq(quizLeaderboardStats.nickname, nickname),
            eq(quizLeaderboardStats.quizType, filters.quizType!)
          )
        );

      userStats = userStatsResult[0];

      if (userStats) {
        // Calculate user's rank
        const betterScoresCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(quizLeaderboardStats)
          .where(
            and(
              eq(quizLeaderboardStats.quizType, filters.quizType!),
              or(
                sql`${quizLeaderboardStats.bestScore} > ${userStats.bestScore}`,
                and(
                  sql`${quizLeaderboardStats.bestScore} = ${userStats.bestScore}`,
                  sql`${quizLeaderboardStats.averageScore} > ${userStats.averageScore}`
                )
              )
            )
          );
        
        userRank = (betterScoresCount[0]?.count || 0) + 1;
      }
    }

    const response: LeaderboardResponse = {
      entries: leaderboardEntries,
      totalEntries,
      userRank,
      userStats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
