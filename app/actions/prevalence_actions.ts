"use server";

import { db } from "../db";
import { stiState } from "../../db/schema";
import { eq, like, and, sql } from "drizzle-orm";

export interface IngredientSearchResult {
  ing_id: number;
  ing_name: string;
  ing_risk_summary: string;
  ing_risk_type: 'B' | 'H' | 'L' | 'N';
}

export interface BannedTrendData {
  year: number;
  banned_count: number;
}

export interface IngredientTrends {
  ingredient_name: string;
  total_banned_count: number;
  yearly_trends: BannedTrendData[];
}

export async function searchIngredientAction(ingredientName: string): Promise<IngredientSearchResult | null> {
  try {
    const results = await db
      .select({
        ing_id: ingredientTable.ing_id,
        ing_name: ingredientTable.ing_name,
        ing_risk_summary: ingredientTable.ing_risk_summary,
        ing_risk_type: ingredientTable.ing_risk_type
      })
      .from(ingredientTable)
      .where(like(sql`lower(${ingredientTable.ing_name})`, `%${ingredientName.toLowerCase()}%`));

    if (results.length === 0) {
      return null;
    }

    if (results.length === 1) {
      return results[0] as IngredientSearchResult;
    }

    // Multiple results - calculate relevance scores
    const searchTerm = ingredientName.toLowerCase().trim();
    
    const scoredResults = results.map(result => {
      const ingName = result.ing_name.toLowerCase();
      let score = 0;
      
      // Exact match gets highest score
      if (ingName === searchTerm) {
        score = 1000;
      }
      // Starts with search term gets high score
      else if (ingName.startsWith(searchTerm)) {
        score = 800;
      }
      // Ends with search term gets medium-high score
      else if (ingName.endsWith(searchTerm)) {
        score = 600;
      }
      // Contains search term as whole word gets medium score
      else if (ingName.includes(` ${searchTerm} `) || 
               ingName.includes(`-${searchTerm}-`) ||
               ingName.includes(`_${searchTerm}_`)) {
        score = 400;
      }
      // Contains search term gets lower score
      else if (ingName.includes(searchTerm)) {
        score = 200;
      }
      // Fallback score (shouldn't happen due to LIKE query, but just in case)
      else {
        score = 100;
      }
      
      // Boost score for shorter names (more specific matches)
      const lengthPenalty = Math.max(0, ingName.length - searchTerm.length) * 2;
      score -= lengthPenalty;
      
      // Additional scoring factors
      // Boost score if search term is at word boundaries
      const wordBoundaryRegex = new RegExp(`\\b${searchTerm}\\b`);
      if (wordBoundaryRegex.test(ingName)) {
        score += 300;
      }
      
      return {
        ...result,
        relevanceScore: score
      };
    });
    
    // Sort by relevance score (highest first) and return the top result
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Remove the relevanceScore property before returning
    const { relevanceScore, ...topResult } = scoredResults[0];
    
    return topResult as IngredientSearchResult;

  } catch (error) {
    console.error("Error searching ingredient:", error);
    throw new Error("Failed to search ingredient");
  }
}