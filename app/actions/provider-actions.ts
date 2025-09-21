/**
 * Server actions for healthcare provider database operations and search functionality.
 * This module manages provider data retrieval, location-based search, distance calculations, and filtering capabilities.
 * Features comprehensive provider queries, geographical search, service filtering, and state-based organization for healthcare access.
 */
"use server";

import { db } from "../db";
import { provider, state } from "../../db/schema";
import { eq, sql, and, ilike, inArray, desc, ne } from "drizzle-orm";

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
  googlePlaceId: string | null;
  distance?: number; // in kilometers (driving distance)
  drivingTime?: string; // e.g., "15 mins"
}

export interface ProviderSearchFilters {
  stateIds?: number[];
  searchQuery?: string;
  providePrep?: boolean;
  providePep?: boolean;
  freeStiScreening?: boolean;
  limit?: number;
  offset?: number;
  userLatitude?: number;
  userLongitude?: number;
  maxDistance?: number; // in kilometers
}

export interface ProviderSearchResponse {
  providers: ProviderRecord[];
  total: number;
}

export interface StateOption {
  stateId: number;
  stateName: string;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
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
  googlePlaceId: string | null;
}, userLat?: number, userLon?: number): ProviderRecord {
  const parseCoordinate = (value: string | null): number | null => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const providerLat = parseCoordinate(row.latitude);
  const providerLon = parseCoordinate(row.longitude);
  
  let distance: number | undefined;
  if (userLat && userLon && providerLat && providerLon) {
    distance = calculateDistance(userLat, userLon, providerLat, providerLon);
  }

  return {
    id: row.id,
    stateId: row.stateId,
    stateName: row.stateName ?? "",
    name: row.name,
    address: row.address,
    phone: row.phone,
    email: row.email,
    longitude: providerLon,
    latitude: providerLat,
    providesPrep: row.providesPrep,
    providesPep: row.providesPep,
    freeStiScreening: row.freeStiScreening,
    googlePlaceId: row.googlePlaceId,
    distance,
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
  googlePlaceId: provider.providerGooglePlaceId,
};

export async function getAllProviders(): Promise<ProviderRecord[]> {
  try {
    const rows = await db
      .select(providerSelection)
      .from(provider)
      .leftJoin(state, eq(provider.stateId, state.stateId))
      .orderBy(state.stateName, provider.providerName);

    return rows.map(row => mapProviderRow(row));
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

    return rows.map(row => mapProviderRow(row));
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

    return rows.map(row => mapProviderRow(row));
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

export async function getAllStates(): Promise<StateOption[]> {
  try {
    const rows = await db
      .select({
        stateId: state.stateId,
        stateName: state.stateName,
      })
      .from(state)
      .where(ne(state.stateName, "Malaysia"))
      .orderBy(state.stateName);

    return rows.map((row) => ({
      stateId: row.stateId,
      stateName: row.stateName,
    }));
  } catch (error) {
    console.error("Error fetching states:", error);
    throw new Error("Failed to fetch states");
  }
}

export async function searchProvidersWithFilters(filters: ProviderSearchFilters): Promise<ProviderSearchResponse> {
  try {
    // Build WHERE conditions
    const conditions = [];

    // State filter
    if (filters.stateIds && filters.stateIds.length > 0) {
      conditions.push(inArray(provider.stateId, filters.stateIds));
    }

    // Search query filter (searches provider name and address)
    if (filters.searchQuery) {
      conditions.push(
        sql`(${ilike(provider.providerName, `%${filters.searchQuery}%`)} OR ${ilike(provider.providerAddress, `%${filters.searchQuery}%`)})`
      );
    }

    // Service filters
    if (filters.providePrep === true) {
      conditions.push(eq(provider.providerProvidePrep, true));
    }

    if (filters.providePep === true) {
      conditions.push(eq(provider.providerProvidePep, true));
    }

    if (filters.freeStiScreening === true) {
      conditions.push(eq(provider.providerFreeStiScreening, true));
    }

    // Location-based filtering - only include providers with coordinates if location search is requested
    if (filters.userLatitude && filters.userLongitude) {
      conditions.push(sql`${provider.providerLatitude} IS NOT NULL AND ${provider.providerLongitude} IS NOT NULL`);
    }

    // Build the main query with join to get state name
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let rows = await db
      .select(providerSelection)
      .from(provider)
      .leftJoin(state, eq(provider.stateId, state.stateId))
      .where(whereClause);

    // Map rows with distance calculation
    let mappedProviders = rows.map(row => mapProviderRow(row, filters.userLatitude, filters.userLongitude));

    // Apply distance filtering and sorting if location is provided
    if (filters.userLatitude && filters.userLongitude) {
      // Filter by max distance if specified
      if (filters.maxDistance) {
        mappedProviders = mappedProviders.filter(p => p.distance && p.distance <= filters.maxDistance!);
      }
      
      // Sort by distance (closest first)
      mappedProviders.sort((a, b) => {
        if (!a.distance && !b.distance) return 0;
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      });
    } else {
      // Default sorting by provider name
      mappedProviders.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Apply pagination after sorting
    const start = filters.offset || 0;
    const limit = filters.limit || 20;
    const paginatedProviders = mappedProviders.slice(start, start + limit);

    return {
      providers: paginatedProviders,
      total: mappedProviders.length,
    };
  } catch (error) {
    console.error("Error searching providers with filters:", error);
    throw new Error("Failed to search providers with filters");
  }
}
