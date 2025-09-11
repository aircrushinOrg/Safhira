import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { quizResults, quizLeaderboardStats } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { SubmitScoreRequest } from '@/types/leaderboard';

// POST /api/leaderboard/submit - Submit quiz score
export async function POST(request: NextRequest) {
  try {
    const body: SubmitScoreRequest = await request.json();

    // Validate required fields
    if (!body.nickname || typeof body.score !== 'number' || typeof body.correctAnswers !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: nickname, score, correctAnswers' },
        { status: 400 }
      );
    }

    // Validate score range
    if (body.score < 0 || body.score > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate nickname length
    if (body.nickname.length > 100 || body.nickname.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nickname must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

    const {
      nickname,
      score,
      totalQuestions = 5,
      correctAnswers,
      quizType = 'myths'
    } = body;

    // Sanitize nickname
    const sanitizedNickname = nickname.trim();

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

    // Calculate rank
    const betterScoresCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizLeaderboardStats)
      .where(
        and(
          eq(quizLeaderboardStats.quizType, quizType),
          sql`${quizLeaderboardStats.bestScore} > ${updatedStats[0].bestScore}`
        )
      );

    const rank = (betterScoresCount[0]?.count || 0) + 1;

    return NextResponse.json({
      success: true,
      resultId: result.id,
      stats: updatedStats[0],
      rank,
      message: 'Score submitted successfully!',
    });

  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}
