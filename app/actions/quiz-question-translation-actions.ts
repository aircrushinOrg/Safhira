"use server";

import { db } from "../db";
import { quizQuestions, quizQuestionTranslations } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type SupportedQuizTranslationLocale = "en" | "ms" | "zh";

const SUPPORTED_LOCALES: SupportedQuizTranslationLocale[] = ["en", "ms", "zh"];

export interface QuizQuestionTranslationRecord {
  questionId: number;
  locale: SupportedQuizTranslationLocale;
  statement: string;
  explanation: string;
  hasTranslation: boolean;
  category: string;
  fallbackCategory: string;
  fallbackStatement: string;
  fallbackExplanation: string;
}

function normalizeLocale(raw?: string | null): SupportedQuizTranslationLocale {
  const value = (raw ?? "").toLowerCase();
  if (SUPPORTED_LOCALES.includes(value as SupportedQuizTranslationLocale)) {
    return value as SupportedQuizTranslationLocale;
  }
  return "en";
}

function assertWriteLocale(locale: SupportedQuizTranslationLocale): asserts locale is "ms" | "zh" {
  if (locale === "en") {
    throw new Error("English content is managed on the base quiz question. Choose a non-English locale for translations.");
  }
}

export async function getQuizQuestionTranslation(
  questionId: number,
  locale?: string | null,
): Promise<QuizQuestionTranslationRecord> {
  if (!Number.isFinite(questionId) || questionId <= 0) {
    throw new Error("A valid numeric questionId is required.");
  }

  const resolvedLocale = normalizeLocale(locale);

  const baseRows = await db
    .select({
      id: quizQuestions.id,
      statement: quizQuestions.statement,
      explanation: quizQuestions.explanation,
      category: quizQuestions.category,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.id, questionId))
    .limit(1);

  if (!baseRows.length) {
    throw new Error(`Quiz question ${questionId} was not found.`);
  }

  const base = baseRows[0];

  if (resolvedLocale === "en") {
    return {
      questionId,
      locale: resolvedLocale,
      statement: base.statement,
      explanation: base.explanation,
      hasTranslation: true,
      category: base.category,
      fallbackCategory: base.category,
      fallbackStatement: base.statement,
      fallbackExplanation: base.explanation,
    };
  }

  const translationRows = await db
    .select({
      statement: quizQuestionTranslations.statement,
      explanation: quizQuestionTranslations.explanation,
      category: quizQuestionTranslations.category,
    })
    .from(quizQuestionTranslations)
    .where(
      and(
        eq(quizQuestionTranslations.questionId, questionId),
        eq(quizQuestionTranslations.locale, resolvedLocale),
      ),
    )
    .limit(1);

  const translated = translationRows[0];
  const hasTranslation = Boolean(translated);

  return {
    questionId,
    locale: resolvedLocale,
    statement: hasTranslation ? translated!.statement : base.statement,
    explanation: hasTranslation ? translated!.explanation : base.explanation,
    hasTranslation,
    category: hasTranslation ? translated!.category : base.category,
    fallbackCategory: base.category,
    fallbackStatement: base.statement,
    fallbackExplanation: base.explanation,
  };
}

interface UpsertQuizQuestionTranslationInput {
  questionId: number;
  locale: SupportedQuizTranslationLocale;
  statement: string;
  explanation: string;
  category?: string;
}

export async function upsertQuizQuestionTranslation({
  questionId,
  locale,
  statement,
  explanation,
  category,
}: UpsertQuizQuestionTranslationInput): Promise<QuizQuestionTranslationRecord> {
  if (!Number.isFinite(questionId) || questionId <= 0) {
    throw new Error("A valid numeric questionId is required.");
  }

  const resolvedLocale = normalizeLocale(locale);
  assertWriteLocale(resolvedLocale);

  const trimmedStatement = (statement ?? "").trim();
  const trimmedExplanation = (explanation ?? "").trim();
  const trimmedCategory = (category ?? "").trim();

  if (!trimmedStatement || !trimmedExplanation) {
    throw new Error("Both statement and explanation are required.");
  }

  const baseRows = await db
    .select({
      id: quizQuestions.id,
      statement: quizQuestions.statement,
      explanation: quizQuestions.explanation,
      category: quizQuestions.category,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.id, questionId))
    .limit(1);

  if (!baseRows.length) {
    throw new Error(`Quiz question ${questionId} was not found.`);
  }

  const base = baseRows[0];
  const resolvedCategory = trimmedCategory || base.category;

  await db
    .insert(quizQuestionTranslations)
    .values({
      questionId,
      locale: resolvedLocale,
      statement: trimmedStatement,
      explanation: trimmedExplanation,
      category: resolvedCategory,
    })
    .onConflictDoUpdate({
      target: [quizQuestionTranslations.questionId, quizQuestionTranslations.locale],
      set: {
        statement: trimmedStatement,
        explanation: trimmedExplanation,
        category: resolvedCategory,
      },
    });

  return {
    questionId,
    locale: resolvedLocale,
    statement: trimmedStatement,
    explanation: trimmedExplanation,
    hasTranslation: true,
    category: resolvedCategory,
    fallbackCategory: base.category,
    fallbackStatement: base.statement,
    fallbackExplanation: base.explanation,
  };
}
