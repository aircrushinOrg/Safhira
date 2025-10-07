/**
 * Server actions for STI database operations providing comprehensive STI information management.
 * This module handles STI data retrieval, search functionality, and related content queries for symptoms, transmission, and prevention.
 * Features database queries for STI details, health effects, prevention methods, and symptom information with optimized performance.
 */
"use server";

import { db } from "../db";
import { 
  sti, 
  symptom, 
  stiSymptom, 
  transmission, 
  stiTransmission, 
  healthEffect, 
  stiHealthEffect, 
  prevention, 
  stiPrevention 
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

// Helper function to get all related data for an STI
async function getSTIWithRelatedData(stiId: number): Promise<STIInfo | null> {
  try {
    // Get basic STI info
    const stiData = await db
      .select()
      .from(sti)
      .where(eq(sti.stiId, stiId))
      .limit(1);

    if (stiData.length === 0) {
      return null;
    }

    const stiInfo = stiData[0];

    // Get symptoms grouped by category
    const symptomsData = await db
      .select({
        symptomText: symptom.symptomText,
        category: stiSymptom.stiSymptomCategory
      })
      .from(stiSymptom)
      .innerJoin(symptom, eq(stiSymptom.symptomId, symptom.symptomId))
      .where(eq(stiSymptom.stiId, stiId));

    // Get transmission methods
    const transmissionData = await db
      .select({
        transmissionText: transmission.transmissionText
      })
      .from(stiTransmission)
      .innerJoin(transmission, eq(stiTransmission.transmissionId, transmission.transmissionId))
      .where(eq(stiTransmission.stiId, stiId));

    // Get health effects
    const healthEffectsData = await db
      .select({
        healthEffectText: healthEffect.healthEffectText
      })
      .from(stiHealthEffect)
      .innerJoin(healthEffect, eq(stiHealthEffect.healthEffectId, healthEffect.healthEffectId))
      .where(eq(stiHealthEffect.stiId, stiId));

    // Get prevention methods
    const preventionData = await db
      .select({
        preventionText: prevention.preventionText
      })
      .from(stiPrevention)
      .innerJoin(prevention, eq(stiPrevention.preventionId, prevention.preventionId))
      .where(eq(stiPrevention.stiId, stiId));

    // Group symptoms by category
    const symptoms = {
      common: symptomsData.filter(s => s.category === 'common').map(s => s.symptomText),
      women: symptomsData.filter(s => s.category === 'women').map(s => s.symptomText),
      men: symptomsData.filter(s => s.category === 'men').map(s => s.symptomText),
      general: symptomsData.filter(s => s.category === 'general').map(s => s.symptomText)
    };

    return {
      name: stiInfo.name,
      type: stiInfo.type as 'Bacterial' | 'Viral' | 'Parasitic',
      severity: stiInfo.severity as 'Low' | 'Medium' | 'High',
      treatability: stiInfo.treatability as 'Curable' | 'Manageable' | 'Preventable',
      symptoms,
      transmission: transmissionData.map(t => t.transmissionText),
      healthEffects: healthEffectsData.map(h => h.healthEffectText),
      prevention: preventionData.map(p => p.preventionText),
      treatment: stiInfo.treatment,
      malaysianContext: stiInfo.malaysianContext
    };
  } catch (error) {
    console.error('Error fetching STI with related data:', error);
    return null;
  }
}

export async function getAllSTIs(): Promise<STIInfo[]> {
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
        return await getSTIWithRelatedData(stiRecord.stiId);
      })
    );

    // Filter out any nulls and return the valid STI objects
    return fullSTIs.filter((stiInfo): stiInfo is STIInfo => stiInfo !== null);
  } catch (error) {
    console.error("Error fetching all STIs:", error);
    throw new Error("Failed to fetch STI information");
  }
}


export async function getSTIBySlug(slug: string): Promise<STIInfo | null> {
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

    return await getSTIWithRelatedData(match.stiId);
  } catch (error) {
    console.error(`Error fetching STI with slug ${slug}:`, error);
    throw new Error(`Failed to fetch STI information for ${slug}`);
  }
}

export async function getSTIByName(name: string): Promise<STIInfo | null> {
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
    return await getSTIWithRelatedData(stiRecord.stiId);
  } catch (error) {
    console.error(`Error fetching STI ${name}:`, error);
    throw new Error(`Failed to fetch STI information for ${name}`);
  }
}

export async function getSTIsByType(type: 'Bacterial' | 'Viral' | 'Parasitic'): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(sti)
      .where(eq(sti.type, type))
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
    console.error(`Error fetching STIs of type ${type}:`, error);
    throw new Error(`Failed to fetch STIs of type ${type}`);
  }
}

export async function getSTIsBySeverity(severity: 'Low' | 'Medium' | 'High'): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(sti)
      .where(eq(sti.severity, severity))
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