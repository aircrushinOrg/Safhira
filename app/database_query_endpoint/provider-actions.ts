"use server";

import { db } from "../db";
import { provider, state } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

export interface ProviderRecord {
  id: number;
  stateId: number;
  stateName: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  longitude: number | null;
  latitude: number | null;
  providesPrep: boolean;
  providesPep: boolean;
  freeStiScreening: boolean;
}

function mapProviderRow(row: {
  id: number;
  stateId: number;
  stateName: string | null;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  longitude: string | null;
  latitude: string | null;
  providesPrep: boolean;
  providesPep: boolean;
  freeStiScreening: boolean;
}): ProviderRecord {
  const parseCoordinate = (value: string | null): number | null => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    id: row.id,
    stateId: row.stateId,
    stateName: row.stateName ?? "",
    name: row.name,
    address: row.address,
    phone: row.phone,
    email: row.email,
    longitude: parseCoordinate(row.longitude),
    latitude: parseCoordinate(row.latitude),
    providesPrep: row.providesPrep,
    providesPep: row.providesPep,
    freeStiScreening: row.freeStiScreening,
  };
}

const providerSelection = {
  id: provider.providerId,
  stateId: provider.stateId,
  stateName: state.stateName,
  name: provider.providerName,
  address: provider.providerAddress,
  phone: provider.providerPhoneNum,
  email: provider.providerEmail,
  longitude: provider.providerLongitude,
  latitude: provider.providerLatitude,
  providesPrep: provider.providerProvidePrep,
  providesPep: provider.providerProvidePep,
  freeStiScreening: provider.providerFreeStiScreening,
};

export async function getAllProviders(): Promise<ProviderRecord[]> {
  try {
    const rows = await db
      .select(providerSelection)
      .from(provider)
      .leftJoin(state, eq(provider.stateId, state.stateId))
      .orderBy(state.stateName, provider.providerName);

    return rows.map(mapProviderRow);
  } catch (error) {
    console.error("Error fetching providers:", error);
    throw new Error("Failed to fetch provider directory");
  }
}

export async function getProviderById(id: number): Promise<ProviderRecord | null> {
  try {
    const rows = await db
      .select(providerSelection)
      .from(provider)
      .leftJoin(state, eq(provider.stateId, state.stateId))
      .where(eq(provider.providerId, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return mapProviderRow(rows[0]);
  } catch (error) {
    console.error(`Error fetching provider ${id}:`, error);
    throw new Error("Failed to fetch provider details");
  }
}

export async function getProvidersByState(stateName: string): Promise<ProviderRecord[]> {
  try {
    const trimmed = stateName.trim();
    if (!trimmed) {
      return [];
    }

    const rows = await db
      .select(providerSelection)
      .from(provider)
      .innerJoin(state, eq(provider.stateId, state.stateId))
      .where(sql`LOWER(${state.stateName}) = LOWER(${trimmed})`)
      .orderBy(provider.providerName);

    return rows.map(mapProviderRow);
  } catch (error) {
    console.error(`Error fetching providers for state ${stateName}:`, error);
    throw new Error("Failed to fetch providers by state");
  }
}

export async function searchProviders(term: string): Promise<ProviderRecord[]> {
  try {
    const value = term.trim();
    if (!value) {
      return await getAllProviders();
    }

    const likeTerm = `%${value}%`;
    const rows = await db
      .select(providerSelection)
      .from(provider)
      .leftJoin(state, eq(provider.stateId, state.stateId))
      .where(
        sql`LOWER(${provider.providerName}) LIKE LOWER(${likeTerm}) OR
            LOWER(${provider.providerAddress}) LIKE LOWER(${likeTerm}) OR
            LOWER(${provider.providerPhoneNum}) LIKE LOWER(${likeTerm}) OR
            LOWER(${provider.providerEmail}) LIKE LOWER(${likeTerm}) OR
            LOWER(${state.stateName}) LIKE LOWER(${likeTerm})`
      )
      .orderBy(state.stateName, provider.providerName);

    return rows.map(mapProviderRow);
  } catch (error) {
    console.error(`Error searching providers with term ${term}:`, error);
    throw new Error("Failed to search providers");
  }
}

export async function getProviderCountsByState(): Promise<{ stateName: string; count: number }[]> {
  try {
    const rows = await db
      .select({
        stateName: state.stateName,
        count: sql<number>`COUNT(${provider.providerId})`,
      })
      .from(provider)
      .innerJoin(state, eq(provider.stateId, state.stateId))
      .groupBy(state.stateName)
      .orderBy(state.stateName);

    return rows.map((row) => ({
      stateName: row.stateName ?? "",
      count: Number(row.count) || 0,
    }));
  } catch (error) {
    console.error("Error fetching provider counts by state:", error);
    throw new Error("Failed to fetch provider counts by state");
  }
}
