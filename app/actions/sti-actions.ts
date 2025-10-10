/**
 * Server actions for STI database operations providing comprehensive STI information management.
 * This module handles STI data retrieval, search functionality, and related content queries for symptoms, transmission, and prevention.
 * Features database queries for STI details, health effects, prevention methods, and symptom information with optimized performance.
 */
"use server";

import { db } from "../db";
import {
  sti,
  stiTranslations,
  symptom,
  symptomTranslations,
  stiSymptom,
  transmission,
  transmissionTranslations,
  stiTransmission,
  healthEffect,
  healthEffectTranslations,
  stiHealthEffect,
  prevention,
  preventionTranslations,
  stiPrevention,
} from "../../db/schema";
import { eq, sql } from "drizzle-orm";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function candidatesFromName(name: string): string[] {
  const base = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const paren = name.match(/\(([^)]+)\)/)?.[1] ?? '';
  const slugs = new Set<string>();
  slugs.add(slugify(name));
  if (base.length > 0) slugs.add(slugify(base));
  if (paren.length > 0) slugs.add(slugify(paren));
  return Array.from(slugs).filter(Boolean);
}
export interface STIInfo {
  name: string;
  type: 'Bacterial' | 'Viral' | 'Parasitic';
  severity: 'Low' | 'Medium' | 'High';
  treatability: 'Curable' | 'Manageable' | 'Preventable';
  symptoms: {
    common: string[];
    women: string[];
    men: string[];
    general: string[];
  };
  transmission: string[];
  healthEffects: string[];
  prevention: string[];
  treatment: string;
  malaysianContext: string;
}

function normalizeLocale(locale?: string): 'en' | 'ms' | 'zh' {
  const raw = (locale ?? '').toLowerCase();
  return raw === 'ms' || raw === 'zh' ? (raw as 'ms' | 'zh') : 'en';
}

// Helper function to get all related data for an STI
async function getSTIWithRelatedData(stiId: number, locale?: string): Promise<STIInfo | null> {
  try {
    const resolvedLocale = normalizeLocale(locale);

    // Get basic STI info (localized via left join on translations with fallback)
    const stiData = await db
      .select({
        nameEn: sti.name,
        typeEn: sti.type,
        severityEn: sti.severity,
        treatabilityEn: sti.treatability,
        treatmentEn: sti.treatment,
        malaysianContextEn: sti.malaysianContext,
        nameTr: stiTranslations.name,
        typeTr: stiTranslations.type,
        severityTr: stiTranslations.severity,
        treatabilityTr: stiTranslations.treatability,
        treatmentTr: stiTranslations.treatment,
        malaysianContextTr: stiTranslations.malaysianContext,
      })
      .from(sti)
      .leftJoin(
        stiTranslations,
        sql`${stiTranslations.stiId} = ${sti.stiId} AND ${stiTranslations.locale} = ${resolvedLocale}`
      )
      .where(eq(sti.stiId, stiId))
      .limit(1);

    if (stiData.length === 0) {
      return null;
    }

    const stiInfo = stiData[0];

    // Get symptoms grouped by category (localized)
    const symptomsData = await db
      .select({
        symptomTextEn: symptom.symptomText,
        symptomTextTr: symptomTranslations.symptomText,
        category: stiSymptom.stiSymptomCategory,
      })
      .from(stiSymptom)
      .innerJoin(symptom, eq(stiSymptom.symptomId, symptom.symptomId))
      .leftJoin(
        symptomTranslations,
        sql`${symptomTranslations.symptomId} = ${symptom.symptomId} AND ${symptomTranslations.locale} = ${resolvedLocale}`
      )
      .where(eq(stiSymptom.stiId, stiId));

    // Get transmission methods (localized)
    const transmissionData = await db
      .select({
        transmissionTextEn: transmission.transmissionText,
        transmissionTextTr: transmissionTranslations.transmissionText,
      })
      .from(stiTransmission)
      .innerJoin(transmission, eq(stiTransmission.transmissionId, transmission.transmissionId))
      .leftJoin(
        transmissionTranslations,
        sql`${transmissionTranslations.transmissionId} = ${transmission.transmissionId} AND ${transmissionTranslations.locale} = ${resolvedLocale}`
      )
      .where(eq(stiTransmission.stiId, stiId));

    // Get health effects (localized)
    const healthEffectsData = await db
      .select({
        healthEffectTextEn: healthEffect.healthEffectText,
        healthEffectTextTr: healthEffectTranslations.healthEffectText,
      })
      .from(stiHealthEffect)
      .innerJoin(healthEffect, eq(stiHealthEffect.healthEffectId, healthEffect.healthEffectId))
      .leftJoin(
        healthEffectTranslations,
        sql`${healthEffectTranslations.healthEffectId} = ${healthEffect.healthEffectId} AND ${healthEffectTranslations.locale} = ${resolvedLocale}`
      )
      .where(eq(stiHealthEffect.stiId, stiId));

    // Get prevention methods (localized)
    const preventionData = await db
      .select({
        preventionTextEn: prevention.preventionText,
        preventionTextTr: preventionTranslations.preventionText,
      })
      .from(stiPrevention)
      .innerJoin(prevention, eq(stiPrevention.preventionId, prevention.preventionId))
      .leftJoin(
        preventionTranslations,
        sql`${preventionTranslations.preventionId} = ${prevention.preventionId} AND ${preventionTranslations.locale} = ${resolvedLocale}`
      )
      .where(eq(stiPrevention.stiId, stiId));

    // Group symptoms by category
    const symptoms = {
      common: symptomsData
        .filter((s) => s.category === 'common')
        .map((s) => s.symptomTextTr ?? s.symptomTextEn),
      women: symptomsData
        .filter((s) => s.category === 'women')
        .map((s) => s.symptomTextTr ?? s.symptomTextEn),
      men: symptomsData
        .filter((s) => s.category === 'men')
        .map((s) => s.symptomTextTr ?? s.symptomTextEn),
      general: symptomsData
        .filter((s) => s.category === 'general')
        .map((s) => s.symptomTextTr ?? s.symptomTextEn),
    };

    return {
      name: stiInfo.nameTr ?? stiInfo.nameEn,
      type: stiInfo.typeEn as 'Bacterial' | 'Viral' | 'Parasitic',
      severity: stiInfo.severityEn as 'Low' | 'Medium' | 'High',
      treatability: stiInfo.treatabilityEn as 'Curable' | 'Manageable' | 'Preventable',
      symptoms,
      transmission: transmissionData.map((t) => t.transmissionTextTr ?? t.transmissionTextEn),
      healthEffects: healthEffectsData.map((h) => h.healthEffectTextTr ?? h.healthEffectTextEn),
      prevention: preventionData.map((p) => p.preventionTextTr ?? p.preventionTextEn),
      treatment: stiInfo.treatmentTr ?? stiInfo.treatmentEn,
      malaysianContext: stiInfo.malaysianContextTr ?? stiInfo.malaysianContextEn,
    };
  } catch (error) {
    console.error('Error fetching STI with related data:', error);
    return null;
  }
}

export async function getAllSTIs(locale?: string): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(sti)
      .orderBy(sti.name);

    if (results.length === 0) {
      return [];
    }

    // Get full details for each STI
    const fullSTIs = await Promise.all(
      results.map(async (stiRecord) => {
        return await getSTIWithRelatedData(stiRecord.stiId, locale);
      })
    );

    // Filter out any nulls and return the valid STI objects
    return fullSTIs.filter((stiInfo): stiInfo is STIInfo => stiInfo !== null);
  } catch (error) {
    console.error("Error fetching all STIs:", error);
    throw new Error("Failed to fetch STI information");
  }
}


export async function getSTIBySlug(slug: string, locale?: string): Promise<STIInfo | null> {
  try {
    const targetSlug = slugify(slug);
    const results = await db
      .select({
        stiId: sti.stiId,
        name: sti.name,
      })
      .from(sti);

    const match = results.find((record) => {
      const candidates = candidatesFromName(record.name);
      return candidates.includes(targetSlug);
    });

    if (!match) {
      return null;
    }

    return await getSTIWithRelatedData(match.stiId, locale);
  } catch (error) {
    console.error(`Error fetching STI with slug ${slug}:`, error);
    throw new Error(`Failed to fetch STI information for ${slug}`);
  }
}

export async function getSTIByName(name: string, locale?: string): Promise<STIInfo | null> {
  try {
    const result = await db
      .select()
      .from(sti)
      .where(eq(sti.name, name))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const stiRecord = result[0];
    return await getSTIWithRelatedData(stiRecord.stiId, locale);
  } catch (error) {
    console.error(`Error fetching STI ${name}:`, error);
    throw new Error(`Failed to fetch STI information for ${name}`);
  }
}

export async function getSTIsByType(type: 'Bacterial' | 'Viral' | 'Parasitic', locale?: string): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(sti)
      .where(eq(sti.type, type))
      .orderBy(sti.name);

    // Get full details for each STI
    const fullSTIs = await Promise.all(
      results.map(async (stiRecord) => {
        return await getSTIWithRelatedData(stiRecord.stiId, locale);
      })
    );

    // Filter out any nulls and return the valid STI objects
    return fullSTIs.filter((stiInfo): stiInfo is STIInfo => stiInfo !== null);
  } catch (error) {
    console.error(`Error fetching STIs of type ${type}:`, error);
    throw new Error(`Failed to fetch STIs of type ${type}`);
  }
}

export async function getSTIsBySeverity(severity: 'Low' | 'Medium' | 'High', locale?: string): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(sti)
      .where(eq(sti.severity, severity))
      .orderBy(sti.name);

    // Get full details for each STI
    const fullSTIs = await Promise.all(
      results.map(async (stiRecord) => {
        return await getSTIWithRelatedData(stiRecord.stiId, locale);
      })
    );

    // Filter out any nulls and return the valid STI objects
    return fullSTIs.filter((stiInfo): stiInfo is STIInfo => stiInfo !== null);
  } catch (error) {
    console.error(`Error fetching STIs with severity ${severity}:`, error);
    throw new Error(`Failed to fetch STIs with severity ${severity}`);
  }
}

export async function getAllUniqueTypes(): Promise<string[]> {
  try {
    const results = await db
      .selectDistinct({
        type: sti.type
      })
      .from(sti)
      .orderBy(sti.type);

    return results.map(r => r.type);
  } catch (error) {
    console.error("Error fetching unique STI types:", error);
    throw new Error("Failed to fetch unique STI types");
  }
}

export async function getAllUniqueSeverities(): Promise<string[]> {
  try {
    const results = await db
      .selectDistinct({
        severity: sti.severity
      })
      .from(sti)
      .orderBy(sti.severity);

    return results.map(r => r.severity);
  } catch (error) {
    console.error("Error fetching unique severities:", error);
    throw new Error("Failed to fetch unique severities");
  }
}

export async function searchSTIs(searchTerm: string): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(sti)
      .where(
        sql`LOWER(${sti.name}) LIKE LOWER(${`%${searchTerm}%`}) OR 
            LOWER(${sti.treatment}) LIKE LOWER(${`%${searchTerm}%`}) OR
            LOWER(${sti.malaysianContext}) LIKE LOWER(${`%${searchTerm}%`})`
      )
      .orderBy(sti.name);

    // Get full details for each STI
    const fullSTIs = await Promise.all(
      results.map(async (stiRecord) => {
        return await getSTIWithRelatedData(stiRecord.stiId);
      })
    );

    // Filter out any nulls and return the valid STI objects
    return fullSTIs.filter((stiInfo): stiInfo is STIInfo => stiInfo !== null);
  } catch (error) {
    console.error(`Error searching STIs with term ${searchTerm}:`, error);
    throw new Error(`Failed to search STIs with term ${searchTerm}`);
  }
}