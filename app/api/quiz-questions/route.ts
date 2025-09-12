import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { quizQuestions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export type QuizQuestion = {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type QuizQuestionsResponse = {
  questions: QuizQuestion[];
  total: number;
};

export type RandomQuizResponse = {
  questions: QuizQuestion[];
  total: number;
};

// GET /api/quiz-questions - Get quiz questions with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get('category') || 'myths';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const random = searchParams.get('random'); // For random selection
    const count = parseInt(searchParams.get('count') || '5'); // For random quiz count

    // Validate limit (max 50 for performance)
    const validLimit = Math.min(Math.max(limit, 1), 50);
    const validOffset = Math.max(offset, 0);

    // Build where conditions
    const whereConditions = [
      eq(quizQuestions.category, category)
    ];

    // Special handling for random quiz questions
    if (random === 'true') {
      // Get random questions for quiz
      const validCount = Math.min(Math.max(count, 1), 10); // Max 10 questions per quiz
      
      const randomQuestions = await db
        .select({
          id: quizQuestions.id,
          statement: quizQuestions.statement,
          isTrue: quizQuestions.isTrue,
          explanation: quizQuestions.explanation,
          category: quizQuestions.category,
          createdAt: quizQuestions.createdAt,
          updatedAt: quizQuestions.updatedAt,
        })
        .from(quizQuestions)
        .where(and(...whereConditions))
        .orderBy(sql`RANDOM()`)
        .limit(validCount);

      // Get total count for this category
      const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(quizQuestions)
        .where(and(...whereConditions));

      const total = totalCountResult[0]?.count || 0;

      const response: RandomQuizResponse = {
        questions: randomQuestions.map(q => ({
          id: q.id,
          statement: q.statement,
          isTrue: q.isTrue,
          explanation: q.explanation,
          category: q.category,
          createdAt: q.createdAt.toISOString(),
          updatedAt: q.updatedAt.toISOString(),
        })),
        total,
      };

      return NextResponse.json(response);
    }

    // Regular paginated query
    const questions = await db
      .select({
        id: quizQuestions.id,
        statement: quizQuestions.statement,
        isTrue: quizQuestions.isTrue,
        explanation: quizQuestions.explanation,
        category: quizQuestions.category,
        createdAt: quizQuestions.createdAt,
        updatedAt: quizQuestions.updatedAt,
      })
      .from(quizQuestions)
      .where(and(...whereConditions))
      .limit(validLimit)
      .offset(validOffset)
      .orderBy(quizQuestions.id);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizQuestions)
      .where(and(...whereConditions));

    const total = totalCountResult[0]?.count || 0;

    const response: QuizQuestionsResponse = {
      questions: questions.map(q => ({
        id: q.id,
        statement: q.statement,
        isTrue: q.isTrue,
        explanation: q.explanation,
        category: q.category,
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.updatedAt.toISOString(),
      })),
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}

// POST /api/quiz-questions - Create a new quiz question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { statement, isTrue, explanation, category = 'myths' } = body;

    // Validate required fields
    if (!statement || typeof isTrue !== 'boolean' || !explanation) {
      return NextResponse.json(
        { error: 'Missing required fields: statement, isTrue, explanation' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['myths', 'general', 'sti', 'health'];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await db
      .insert(quizQuestions)
      .values({
        statement: statement.trim(),
        isTrue,
        explanation: explanation.trim(),
        category,
      })
      .returning({
        id: quizQuestions.id,
        statement: quizQuestions.statement,
        isTrue: quizQuestions.isTrue,
        explanation: quizQuestions.explanation,
        category: quizQuestions.category,
        createdAt: quizQuestions.createdAt,
        updatedAt: quizQuestions.updatedAt,
      });

    const newQuestion = result[0];

    return NextResponse.json({
      success: true,
      question: {
        id: newQuestion.id,
        statement: newQuestion.statement,
        isTrue: newQuestion.isTrue,
        explanation: newQuestion.explanation,
        category: newQuestion.category,
        createdAt: newQuestion.createdAt.toISOString(),
        updatedAt: newQuestion.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz question' },
      { status: 500 }
    );
  }
}
