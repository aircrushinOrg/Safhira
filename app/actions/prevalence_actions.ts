"use server";

import { db } from "../db";
import { stiState } from "../../db/schema";

export async function getAllUniqueDates(): Promise<number[]> {
  try {
    const results = await db
      .selectDistinct({
        date: stiState.date
      })
      .from(stiState)
      .orderBy(stiState.date);

    if (results.length === 0) {
      return [];
    }

    return results.map(r => r.date);
  } catch (error) {
    console.error("Error fetching unique dates:", error);
    throw new Error("Failed to fetch unique dates");
  }
}

export async function getAllUniqueDiseases(): Promise<string[]> {
  try {
    const results = await db
      .selectDistinct({
        disease: stiState.disease
      })
      .from(stiState)
      .orderBy(stiState.disease);
      
    if (results.length === 0) {
      return [];
    }
    return results.map(r => r.disease);
  }
  catch (error) {
    console.error("Error fetching unique diseases:", error);
    throw new Error("Failed to fetch unique diseases");
  }
}

export async function getAllYearDiseaseIncidences(): Promise<{ year: number, disease: string, state: string, incidence: number }[]> {
  try {
    const results = await db
      .select({
        year: stiState.date,
        disease: stiState.disease,
        state: stiState.state,
        incidence: stiState.incidence
      })
      .from(stiState)
      .orderBy(stiState.date);

    if (results.length === 0) {
      return [];
    }

    // Convert incidence from string to number
    return results.map(r => ({
      year: r.year,
      disease: r.disease,
      state: r.state,
      incidence: Number(r.incidence)
    }));
  } catch (error) {
    console.error("Error fetching year-disease incidences:", error);
    throw new Error("Failed to fetch year-disease incidences");
  }
}