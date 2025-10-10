/**
 * Server actions for retrieving localized STI and state translations.
 * Provides helpers to access translated metadata while preserving English fallbacks.
 */
"use server";

import { db } from "../db";
import { sti, stiTranslations, state, stateTranslations } from "../../db/schema";
import { and, eq } from "drizzle-orm";

export const SUPPORTED_TRANSLATION_LOCALES = ["en", "ms", "zh"] as const;
export type TranslationLocale = (typeof SUPPORTED_TRANSLATION_LOCALES)[number];

const localeSet = new Set<TranslationLocale>(SUPPORTED_TRANSLATION_LOCALES);

function normalizeLocale(locale: string | null | undefined): TranslationLocale {
  const raw = (locale ?? "").toLowerCase() as TranslationLocale;
  return localeSet.has(raw) ? raw : "en";
}

export interface StateTranslationRecord {
  stateId: number;
  locale: TranslationLocale;
  englishName: string;
  translatedName: string;
  hasTranslation: boolean;
}

export interface STITranslationContent {
  name: string;
  type: string;
  severity: string;
  treatability: string;
  treatment: string;
  malaysianContext: string;
}

export interface STITranslationRecord {
  stiId: number;
  locale: TranslationLocale;
  english: STITranslationContent;
  translated: STITranslationContent;
  hasTranslation: boolean;
}

export async function getStateTranslations(locale: string): Promise<StateTranslationRecord[]> {
  const resolvedLocale = normalizeLocale(locale);

  try {
    if (resolvedLocale === "en") {
      const rows = await db
        .select({
          stateId: state.stateId,
          name: state.stateName,
        })
        .from(state)
        .orderBy(state.stateName);

      return rows.map((row) => ({
        stateId: row.stateId,
        locale: resolvedLocale,
        englishName: row.name,
        translatedName: row.name,
        hasTranslation: true,
      }));
    }

    const rows = await db
      .select({
        stateId: state.stateId,
        englishName: state.stateName,
        translatedName: stateTranslations.stateName,
      })
      .from(state)
      .leftJoin(
        stateTranslations,
        and(eq(stateTranslations.stateId, state.stateId), eq(stateTranslations.locale, resolvedLocale)),
      )
      .orderBy(state.stateName);

    return rows.map((row) => ({
      stateId: row.stateId,
      locale: resolvedLocale,
      englishName: row.englishName,
      translatedName: row.translatedName ?? row.englishName,
      hasTranslation: row.translatedName !== null && row.translatedName !== undefined,
    }));
  } catch (error) {
    console.error(`[getStateTranslations] Failed to fetch state translations for locale ${locale}:`, error);
    throw new Error(`Failed to fetch state translations for locale ${locale}`);
  }
}

export async function getSTITranslations(locale: string): Promise<STITranslationRecord[]> {
  const resolvedLocale = normalizeLocale(locale);

  try {
    if (resolvedLocale === "en") {
      const rows = await db
        .select({
          stiId: sti.stiId,
          name: sti.name,
          type: sti.type,
          severity: sti.severity,
          treatability: sti.treatability,
          treatment: sti.treatment,
          malaysianContext: sti.malaysianContext,
        })
        .from(sti)
        .orderBy(sti.name);

      return rows.map((row) => {
        const content: STITranslationContent = {
          name: row.name,
          type: row.type,
          severity: row.severity,
          treatability: row.treatability,
          treatment: row.treatment,
          malaysianContext: row.malaysianContext,
        };

        return {
          stiId: row.stiId,
          locale: resolvedLocale,
          english: content,
          translated: content,
          hasTranslation: true,
        };
      });
    }

    const rows = await db
      .select({
        stiId: sti.stiId,
        englishName: sti.name,
        englishType: sti.type,
        englishSeverity: sti.severity,
        englishTreatability: sti.treatability,
        englishTreatment: sti.treatment,
        englishMalaysianContext: sti.malaysianContext,
        translatedName: stiTranslations.name,
        translatedType: stiTranslations.type,
        translatedSeverity: stiTranslations.severity,
        translatedTreatability: stiTranslations.treatability,
        translatedTreatment: stiTranslations.treatment,
        translatedMalaysianContext: stiTranslations.malaysianContext,
      })
      .from(sti)
      .leftJoin(
        stiTranslations,
        and(eq(stiTranslations.stiId, sti.stiId), eq(stiTranslations.locale, resolvedLocale)),
      )
      .orderBy(sti.name);

    return rows.map((row) => {
      const englishContent: STITranslationContent = {
        name: row.englishName,
        type: row.englishType,
        severity: row.englishSeverity,
        treatability: row.englishTreatability,
        treatment: row.englishTreatment,
        malaysianContext: row.englishMalaysianContext,
      };

      const translatedContent: STITranslationContent = {
        name: row.translatedName ?? row.englishName,
        type: row.translatedType ?? row.englishType,
        severity: row.translatedSeverity ?? row.englishSeverity,
        treatability: row.translatedTreatability ?? row.englishTreatability,
        treatment: row.translatedTreatment ?? row.englishTreatment,
        malaysianContext: row.translatedMalaysianContext ?? row.englishMalaysianContext,
      };

      const hasTranslation =
        row.translatedName !== null &&
        row.translatedName !== undefined &&
        row.translatedType !== null &&
        row.translatedType !== undefined &&
        row.translatedSeverity !== null &&
        row.translatedSeverity !== undefined &&
        row.translatedTreatability !== null &&
        row.translatedTreatability !== undefined &&
        row.translatedTreatment !== null &&
        row.translatedTreatment !== undefined &&
        row.translatedMalaysianContext !== null &&
        row.translatedMalaysianContext !== undefined;

      return {
        stiId: row.stiId,
        locale: resolvedLocale,
        english: englishContent,
        translated: translatedContent,
        hasTranslation,
      };
    });
  } catch (error) {
    console.error(`[getSTITranslations] Failed to fetch STI translations for locale ${locale}:`, error);
    throw new Error(`Failed to fetch STI translations for locale ${locale}`);
  }
}
