/**
 * Server actions for quiz question management and educational content delivery.
 * This module handles quiz question retrieval, categorization, random selection, 
 * and content management for interactive learning.
 * Features quiz data queries, myth/fact management, category filtering, and 
 * educational content organization for gamified learning experiences.
 */
"use server";

import { db } from "../db";
import { quizQuestions, quizQuestionTranslations } from "../../db/schema";
import { eq, sql, and, ilike } from "drizzle-orm";

export interface QuizQuestionRecord {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestionFilters {
  category?: string;
  limit?: number;
  offset?: number;
}

export interface QuizQuestionListResponse {
  questions: QuizQuestionRecord[];
  total: number;
}

function normalizeLocale(locale?: string): 'en' | 'ms' | 'zh' {
  const raw = (locale ?? '').toLowerCase();
  return raw === 'ms' || raw === 'zh' ? (raw as 'ms' | 'zh') : 'en';
}

function buildLocalizedSelection(locale?: string) {
  const resolved = normalizeLocale(locale);
  return {
    id: quizQuestions.id,
    statement: sql<string>`COALESCE(${quizQuestionTranslations.statement}, ${quizQuestions.statement})`,
    isTrue: quizQuestions.isTrue,
    explanation: sql<string>`COALESCE(${quizQuestionTranslations.explanation}, ${quizQuestions.explanation})`,
    category: sql<string>`COALESCE(${quizQuestionTranslations.category}, ${quizQuestions.category})`,
    createdAt: quizQuestions.createdAt,
    updatedAt: quizQuestions.updatedAt,
    _locale: sql<string>`${resolved}`,
  };
}

function mapQuizQuestion(row: {
  id: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}): QuizQuestionRecord {
  return {
    id: row.id,
    statement: row.statement,
    isTrue: row.isTrue,
    explanation: row.explanation,
    category: row.category,
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date(0).toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : new Date(0).toISOString(),
  };
}

function normalizeCategory(category?: string): string {
  if (!category) return "myths";
  const trimmed = category.trim().toLowerCase();
  if (trimmed.startsWith("fact")) return "facts";
  if (trimmed.startsWith("myth")) return "myths";
  if (["general", "sti", "health"].includes(trimmed)) return trimmed;
  return "myths";
}

function normalizeLimit(limit?: number, fallback = 10, max = 100): number {
  if (!limit || !Number.isFinite(limit)) {
    return fallback;
  }
  return Math.min(Math.max(Math.trunc(limit), 1), max);
}

function normalizeOffset(offset?: number): number {
  if (!offset || !Number.isFinite(offset)) {
    return 0;
  }
  return Math.max(Math.trunc(offset), 0);
}

export async function listQuizQuestions(filters: QuizQuestionFilters = {}, locale?: string): Promise<QuizQuestionListResponse> {
  try {
    const category = normalizeCategory(filters.category);
    const limit = normalizeLimit(filters.limit);
    const offset = normalizeOffset(filters.offset);
    const resolved = normalizeLocale(locale);

    const conditions = [eq(quizQuestions.category, category)];

    const rows = await db
      .select(buildLocalizedSelection(resolved))
      .from(quizQuestions)
      .leftJoin(
        quizQuestionTranslations,
        sql`${quizQuestionTranslations.questionId} = ${quizQuestions.id} AND ${quizQuestionTranslations.locale} = ${resolved}`,
      )
      .where(and(...conditions))
      .orderBy(quizQuestions.id)
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizQuestions)
      .where(and(...conditions));

    return {
      questions: rows.map(mapQuizQuestion),
      total: countResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error("Error listing quiz questions:", error);
    throw new Error("Failed to fetch quiz questions");
  }
}

export async function getQuizQuestionById(id: number, locale?: string): Promise<QuizQuestionRecord | null> {
  try {
    const resolved = normalizeLocale(locale);
    const rows = await db
      .select(buildLocalizedSelection(resolved))
      .from(quizQuestions)
      .leftJoin(
        quizQuestionTranslations,
        sql`${quizQuestionTranslations.questionId} = ${quizQuestions.id} AND ${quizQuestionTranslations.locale} = ${resolved}`,
      )
      .where(eq(quizQuestions.id, id))
      .limit(1);

    if (!rows.length) {
      return null;
    }

    return mapQuizQuestion(rows[0]);
  } catch (error) {
    console.error(`Error fetching quiz question ${id}:`, error);
    throw new Error("Failed to fetch quiz question");
  }
}

export async function getRandomQuizQuestions(category: string, count = 5, locale?: string): Promise<QuizQuestionRecord[]> {
  try {
    const normalizedCategory = normalizeCategory(category);
    const limit = normalizeLimit(count, 5, 20);
    const resolved = normalizeLocale(locale);

    const rows = await db
      .select(buildLocalizedSelection(resolved))
      .from(quizQuestions)
      .leftJoin(
        quizQuestionTranslations,
        sql`${quizQuestionTranslations.questionId} = ${quizQuestions.id} AND ${quizQuestionTranslations.locale} = ${resolved}`,
      )
      .where(eq(quizQuestions.category, normalizedCategory))
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    return rows.map(mapQuizQuestion);
  } catch (error) {
    console.error(`Error fetching random quiz questions for category ${category}:`, error);
    throw new Error("Failed to fetch random quiz questions");
  }
}

export async function searchQuizQuestions(term: string, filters: QuizQuestionFilters = {}, locale?: string): Promise<QuizQuestionRecord[]> {
  try {
    const value = (term ?? "").trim();
    if (!value) {
      const { questions } = await listQuizQuestions(filters, locale);
      return questions;
    }

    const category = normalizeCategory(filters.category);
    const limit = normalizeLimit(filters.limit);
    const resolved = normalizeLocale(locale);

    const rows = await db
      .select(buildLocalizedSelection(resolved))
      .from(quizQuestions)
      .leftJoin(
        quizQuestionTranslations,
        sql`${quizQuestionTranslations.questionId} = ${quizQuestions.id} AND ${quizQuestionTranslations.locale} = ${resolved}`,
      )
      .where(
        and(
          eq(quizQuestions.category, category),
          ilike(quizQuestions.statement, `%${value}%`),
        ),
      )
      .orderBy(quizQuestions.id)
      .limit(limit);

    return rows.map(mapQuizQuestion);
  } catch (error) {
    console.error(`Error searching quiz questions with term "${term}":`, error);
    throw new Error("Failed to search quiz questions");
  }
}

export async function getAllQuizQuestions(locale?: string): Promise<QuizQuestionRecord[]> {
  try {
    const resolved = normalizeLocale(locale);
    const rows = await db
      .select(buildLocalizedSelection(resolved))
      .from(quizQuestions)
      .leftJoin(
        quizQuestionTranslations,
        sql`${quizQuestionTranslations.questionId} = ${quizQuestions.id} AND ${quizQuestionTranslations.locale} = ${resolved}`,
      )
      .orderBy(quizQuestions.id);

    return rows.map(mapQuizQuestion);
  } catch (error) {
    console.error("Error fetching all quiz questions:", error);
    throw new Error("Failed to fetch all quiz questions");
  }
}
export async function getQuizQuestionCountsByCategory(): Promise<Array<{ category: string; count: number }>> {
  try {
    const rows = await db
      .select({
        category: quizQuestions.category,
        count: sql<number>`count(*)`,
      })
      .from(quizQuestions)
      .groupBy(quizQuestions.category)
      .orderBy(quizQuestions.category);

    return rows.map((row) => ({
      category: row.category,
      count: Number(row.count) || 0,
    }));
  } catch (error) {
    console.error("Error counting quiz questions by category:", error);
    throw new Error("Failed to count quiz questions by category");
  }
}



