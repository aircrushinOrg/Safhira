import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

import { db } from "@/app/db";
import { aiScenarioCapsules, aiScenarioSnippets, aiScenarioSessions } from "@/db/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    if (!shareToken) {
      return NextResponse.json({ error: "Missing shareToken" }, { status: 400 });
    }

    const capsules = await db
      .select()
      .from(aiScenarioCapsules)
      .where(eq(aiScenarioCapsules.shareToken, shareToken))
      .limit(1);

    if (capsules.length === 0) {
      return NextResponse.json({ error: "Capsule not found" }, { status: 404 });
    }

    const capsule = capsules[0];

    if (capsule.expiresAt && new Date() > capsule.expiresAt) {
      return NextResponse.json({ error: "Capsule has expired" }, { status: 410 });
    }

    await db
      .update(aiScenarioCapsules)
      .set({ viewCount: capsule.viewCount + 1 })
      .where(eq(aiScenarioCapsules.shareToken, shareToken));

    const session = await db
      .select({
        scenarioTitle: aiScenarioSessions.scenarioTitle,
        scenarioSetting: aiScenarioSessions.scenarioSetting,
        npcName: aiScenarioSessions.npcName,
        npcRole: aiScenarioSessions.npcRole,
        completedAt: aiScenarioSessions.completedAt,
      })
      .from(aiScenarioSessions)
      .where(eq(aiScenarioSessions.sessionId, capsule.sessionId))
      .limit(1);

    const snippets = await db
      .select({
        turnIndex: aiScenarioSnippets.turnIndex,
        role: aiScenarioSnippets.role,
        content: aiScenarioSnippets.content,
        annotation: aiScenarioSnippets.annotation,
        impactReason: aiScenarioSnippets.impactReason,
      })
      .from(aiScenarioSnippets)
      .where(eq(aiScenarioSnippets.sessionId, capsule.sessionId));

    return NextResponse.json({
      sessionInfo: session[0] || null,
      narrativeSummary: capsule.narrativeSummary,
      suggestedNextScenarios: capsule.suggestedNextScenarios,
      snippets,
      toneMetrics: capsule.toneMetrics,
      expiresAt: capsule.expiresAt,
      completedAt: session[0]?.completedAt || null,
    });
  } catch (error) {
    console.error("/api/ai-scenarios/capsule/[shareToken] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
