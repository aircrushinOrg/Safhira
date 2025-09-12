import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { quizQuestions } from "@/db/schema";

// GET /api/myths
// Fetch myths/facts questions from the database instead of CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? "myths";
    const activeOnly = (searchParams.get("activeOnly") ?? "true").toLowerCase() !== "false";
    const limit = parseInt(searchParams.get("limit") || "0", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const rows = await db
      .select({
        id: quizQuestions.id,
        myth: quizQuestions.statement,
        fact: quizQuestions.explanation,
      })
      .from(quizQuestions)
      .limit(limit > 0 ? limit : undefined as any)
      .offset(offset > 0 ? offset : undefined as any);

    const data = rows.map((r) => ({ id: String(r.id), myth: r.myth, fact: r.fact }));
    return NextResponse.json(data);
  } catch (e) {
    console.error("Failed to fetch myths from DB:", e);
    return NextResponse.json([], { status: 200 });
  }
}
