import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { quizQuestions } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

// GET /api/quiz-questions
// Returns quiz questions from the DB with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? "myths";
    const difficulty = searchParams.get("difficulty");
    const activeOnly = (searchParams.get("activeOnly") ?? "true").toLowerCase() !== "false";
    const random = (searchParams.get("random") ?? "false").toLowerCase() === "true";
    const count = parseInt(searchParams.get("count") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "0", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build where clause
    const conditions = [eq(quizQuestions.category, category)];
    if (activeOnly) conditions.push(eq(quizQuestions.isActive, true));
    if (difficulty) conditions.push(eq(quizQuestions.difficulty, difficulty));

    const whereClause = and(...conditions);

    let query = db
      .select({
        id: quizQuestions.id,
        statement: quizQuestions.statement,
        isTrue: quizQuestions.isTrue,
        explanation: quizQuestions.explanation,
        category: quizQuestions.category,
        difficulty: quizQuestions.difficulty,
      })
      .from(quizQuestions)
      .where(whereClause);

    if (random) {
      // Order randomly for sampling
      query = query.orderBy(sql`random()`);
      if (count > 0) {
        query = query.limit(count);
      }
    } else {
      if (limit > 0) query = query.limit(limit);
      if (offset > 0) query = query.offset(offset);
    }

    const rows = await query;

    return NextResponse.json(rows);
  } catch (e) {
    console.error("Failed to fetch quiz questions:", e);
    return NextResponse.json({ error: "Failed to fetch quiz questions" }, { status: 500 });
  }
}

