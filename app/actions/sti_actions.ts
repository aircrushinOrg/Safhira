"use server";

import { db } from "../db";
import { stiInfo } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

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

export async function getAllSTIs(): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(stiInfo)
      .orderBy(stiInfo.name);

    if (results.length === 0) {
      return [];
    }

    return results.map(sti => ({
      name: sti.name,
      type: sti.type as 'Bacterial' | 'Viral' | 'Parasitic',
      severity: sti.severity as 'Low' | 'Medium' | 'High',
      treatability: sti.treatability as 'Curable' | 'Manageable' | 'Preventable',
      symptoms: {
        common: JSON.parse(sti.symptomsCommon),
        women: JSON.parse(sti.symptomsWomen),
        men: JSON.parse(sti.symptomsMen),
        general: JSON.parse(sti.symptomsGeneral)
      },
      transmission: JSON.parse(sti.transmission),
      healthEffects: JSON.parse(sti.healthEffects),
      prevention: JSON.parse(sti.prevention),
      treatment: sti.treatment,
      malaysianContext: sti.malaysianContext
    }));
  } catch (error) {
    console.error("Error fetching all STIs:", error);
    throw new Error("Failed to fetch STI information");
  }
}

export async function getSTIByName(name: string): Promise<STIInfo | null> {
  try {
    const result = await db
      .select()
      .from(stiInfo)
      .where(eq(stiInfo.name, name))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const sti = result[0];
    return {
      name: sti.name,
      type: sti.type as 'Bacterial' | 'Viral' | 'Parasitic',
      severity: sti.severity as 'Low' | 'Medium' | 'High',
      treatability: sti.treatability as 'Curable' | 'Manageable' | 'Preventable',
      symptoms: {
        common: JSON.parse(sti.symptomsCommon),
        women: JSON.parse(sti.symptomsWomen),
        men: JSON.parse(sti.symptomsMen),
        general: JSON.parse(sti.symptomsGeneral)
      },
      transmission: JSON.parse(sti.transmission),
      healthEffects: JSON.parse(sti.healthEffects),
      prevention: JSON.parse(sti.prevention),
      treatment: sti.treatment,
      malaysianContext: sti.malaysianContext
    };
  } catch (error) {
    console.error(`Error fetching STI ${name}:`, error);
    throw new Error(`Failed to fetch STI information for ${name}`);
  }
}

export async function getSTIsByType(type: 'Bacterial' | 'Viral' | 'Parasitic'): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(stiInfo)
      .where(eq(stiInfo.type, type))
      .orderBy(stiInfo.name);

    return results.map(sti => ({
      name: sti.name,
      type: sti.type as 'Bacterial' | 'Viral' | 'Parasitic',
      severity: sti.severity as 'Low' | 'Medium' | 'High',
      treatability: sti.treatability as 'Curable' | 'Manageable' | 'Preventable',
      symptoms: {
        common: JSON.parse(sti.symptomsCommon),
        women: JSON.parse(sti.symptomsWomen),
        men: JSON.parse(sti.symptomsMen),
        general: JSON.parse(sti.symptomsGeneral)
      },
      transmission: JSON.parse(sti.transmission),
      healthEffects: JSON.parse(sti.healthEffects),
      prevention: JSON.parse(sti.prevention),
      treatment: sti.treatment,
      malaysianContext: sti.malaysianContext
    }));
  } catch (error) {
    console.error(`Error fetching STIs of type ${type}:`, error);
    throw new Error(`Failed to fetch STIs of type ${type}`);
  }
}

export async function getSTIsBySeverity(severity: 'Low' | 'Medium' | 'High'): Promise<STIInfo[]> {
  try {
    const results = await db
      .select()
      .from(stiInfo)
      .where(eq(stiInfo.severity, severity))
      .orderBy(stiInfo.name);

    return results.map(sti => ({
      name: sti.name,
      type: sti.type as 'Bacterial' | 'Viral' | 'Parasitic',
      severity: sti.severity as 'Low' | 'Medium' | 'High',
      treatability: sti.treatability as 'Curable' | 'Manageable' | 'Preventable',
      symptoms: {
        common: JSON.parse(sti.symptomsCommon),
        women: JSON.parse(sti.symptomsWomen),
        men: JSON.parse(sti.symptomsMen),
        general: JSON.parse(sti.symptomsGeneral)
      },
      transmission: JSON.parse(sti.transmission),
      healthEffects: JSON.parse(sti.healthEffects),
      prevention: JSON.parse(sti.prevention),
      treatment: sti.treatment,
      malaysianContext: sti.malaysianContext
    }));
  } catch (error) {
    console.error(`Error fetching STIs with severity ${severity}:`, error);
    throw new Error(`Failed to fetch STIs with severity ${severity}`);
  }
}

export async function getAllUniqueTypes(): Promise<string[]> {
  try {
    const results = await db
      .selectDistinct({
        type: stiInfo.type
      })
      .from(stiInfo)
      .orderBy(stiInfo.type);

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
        severity: stiInfo.severity
      })
      .from(stiInfo)
      .orderBy(stiInfo.severity);

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
      .from(stiInfo)
      .where(
        sql`LOWER(${stiInfo.name}) LIKE LOWER(${`%${searchTerm}%`}) OR 
            LOWER(${stiInfo.treatment}) LIKE LOWER(${`%${searchTerm}%`}) OR
            LOWER(${stiInfo.malaysianContext}) LIKE LOWER(${`%${searchTerm}%`})`
      )
      .orderBy(stiInfo.name);

    return results.map(sti => ({
      name: sti.name,
      type: sti.type as 'Bacterial' | 'Viral' | 'Parasitic',
      severity: sti.severity as 'Low' | 'Medium' | 'High',
      treatability: sti.treatability as 'Curable' | 'Manageable' | 'Preventable',
      symptoms: {
        common: JSON.parse(sti.symptomsCommon),
        women: JSON.parse(sti.symptomsWomen),
        men: JSON.parse(sti.symptomsMen),
        general: JSON.parse(sti.symptomsGeneral)
      },
      transmission: JSON.parse(sti.transmission),
      healthEffects: JSON.parse(sti.healthEffects),
      prevention: JSON.parse(sti.prevention),
      treatment: sti.treatment,
      malaysianContext: sti.malaysianContext
    }));
  } catch (error) {
    console.error(`Error searching STIs with term ${searchTerm}:`, error);
    throw new Error(`Failed to search STIs with term ${searchTerm}`);
  }
}