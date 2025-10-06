/**
 * Server actions for STI prevalence data management and epidemiological analysis.
 * This module handles prevalence data retrieval, statistical analysis, and data visualization support for public health insights.
 * Features data aggregation, temporal analysis, geographical breakdowns, and statistical queries for epidemiological research.
 */
"use server";

import { db } from "../db";
import { prevalence, state, sti } from "../../db/schema";
import { eq, ne } from "drizzle-orm";

export async function getAllUniqueDates(): Promise<number[]> {
  try {
    const results = await db
      .selectDistinct({
        year: prevalence.prevalenceYear,
      })
      .from(prevalence)
      .orderBy(prevalence.prevalenceYear);

    if (results.length === 0) {
      return [];
    }

    return results.map((r) => r.year);
  } catch (error) {
    console.error("Error fetching unique dates:", error);
    throw new Error("Failed to fetch unique dates");
  }
}

export async function getAllUniqueDiseases(): Promise<string[]> {
  try {
    const results = await db
      .selectDistinct({
        disease: sti.name,
      })
      .from(prevalence)
      .innerJoin(sti, eq(prevalence.stiId, sti.stiId))
      .orderBy(sti.name);

    if (results.length === 0) {
      return [];
    }

    return results.map((r) => r.disease);
  } catch (error) {
    console.error("Error fetching unique diseases:", error);
    throw new Error("Failed to fetch unique diseases");
  }
}

export async function getAllUniqueStates(): Promise<string[]> {
  try {
    const results = await db
      .selectDistinct({
        state: state.stateName,
      })
      .from(prevalence)
      .innerJoin(state, eq(prevalence.stateId, state.stateId))
      .where(ne(state.stateName, "Malaysia"))
      .orderBy(state.stateName);

    if (results.length === 0) {
      return [];
    }

    return results.map((r) => r.state);
  } catch (error) {
    console.error("Error fetching unique states:", error);
    throw new Error("Failed to fetch unique states");
  }
}

export async function getAllYearDiseaseIncidences(): Promise<{ year: number; disease: string; state: string; incidence: number }[]> {
  try {
    const results = await db
      .select({
        year: prevalence.prevalenceYear,
        disease: sti.name,
        state: state.stateName,
        incidence: prevalence.prevalenceIncidence,
      })
      .from(prevalence)
      .innerJoin(sti, eq(prevalence.stiId, sti.stiId))
      .innerJoin(state, eq(prevalence.stateId, state.stateId))
      .where(ne(state.stateName, "Malaysia"))
      .orderBy(prevalence.prevalenceYear);

    if (results.length === 0) {
      return [];
    }

    return results.map((r) => ({
      year: r.year,
      disease: r.disease,
      state: r.state,
      incidence: Number(r.incidence),
    }));
  } catch (error) {
    console.error("Error fetching year-disease incidences:", error);
    throw new Error("Failed to fetch year-disease incidences");
  }
}
