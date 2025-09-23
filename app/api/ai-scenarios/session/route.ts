import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

import { db } from "@/app/db";
import { aiScenarioSessions } from "@/db/schema";
import {
  isNonEmptyString,
  normaliseStringArray,
  ScenarioDescriptor,
  NpcProfile,
} from "@/lib/ai-scenarios/engine";

function toScenarioDescriptor(input: any): ScenarioDescriptor | null {
  if (!input || typeof input !== "object") return null;
  if (!isNonEmptyString(input.id)) return null;

  const learningObjectives = normaliseStringArray(input.learningObjectives);
  const supportingFacts = normaliseStringArray(input.supportingFacts);

  const tension = typeof input.tensionLevel === "string" ? input.tensionLevel.trim().toLowerCase() : "";
  const tensionLevel = tension === "low" || tension === "medium" || tension === "high" ? tension : undefined;

  return {
    id: input.id.trim(),
    title: isNonEmptyString(input.title) ? input.title.trim() : undefined,
    setting: isNonEmptyString(input.setting) ? input.setting.trim() : undefined,
    learningObjectives: learningObjectives.length > 0 ? learningObjectives : undefined,
    supportingFacts: supportingFacts.length > 0 ? supportingFacts : undefined,
    tensionLevel,
  };
}

function toNpcProfile(input: any): NpcProfile | null {
  if (!input || typeof input !== "object") return null;
  if (!isNonEmptyString(input.id) || !isNonEmptyString(input.name) || !isNonEmptyString(input.role)) {
    return null;
  }

  const goals = normaliseStringArray(input.goals);
  const tactics = normaliseStringArray(input.tactics);
  const boundaries = normaliseStringArray(input.boundaries);

  return {
    id: input.id.trim(),
    name: input.name.trim(),
    role: input.role.trim(),
    persona: isNonEmptyString(input.persona) ? input.persona.trim() : undefined,
    goals: goals.length > 0 ? goals : undefined,
    tactics: tactics.length > 0 ? tactics : undefined,
    boundaries: boundaries.length > 0 ? boundaries : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scenario = toScenarioDescriptor(body?.scenario);
    const npc = toNpcProfile(body?.npc);
    const allowAutoEnd = typeof body?.allowAutoEnd === "boolean" ? body.allowAutoEnd : true;
    const locale = isNonEmptyString(body?.locale) ? body.locale.trim() : null;
    const sessionId = isNonEmptyString(body?.sessionId) ? body.sessionId.trim() : randomUUID();

    if (!scenario) {
      return NextResponse.json({ error: "Invalid scenario descriptor" }, { status: 400 });
    }
    if (!npc) {
      return NextResponse.json({ error: "Invalid NPC profile" }, { status: 400 });
    }

    const now = new Date();

    await db
      .insert(aiScenarioSessions)
      .values({
        sessionId,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title ?? null,
        scenarioSetting: scenario.setting ?? null,
        tensionLevel: scenario.tensionLevel ?? null,
        learningObjectives: scenario.learningObjectives ?? [],
        supportingFacts: scenario.supportingFacts ?? [],
        locale,
        allowAutoEnd,
        npcId: npc.id,
        npcName: npc.name,
        npcRole: npc.role,
        npcPersona: npc.persona ?? null,
        npcGoals: npc.goals ?? [],
        npcTactics: npc.tactics ?? [],
        npcBoundaries: npc.boundaries ?? [],
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: aiScenarioSessions.sessionId,
        set: {
          scenarioId: scenario.id,
          scenarioTitle: scenario.title ?? null,
          scenarioSetting: scenario.setting ?? null,
          tensionLevel: scenario.tensionLevel ?? null,
          learningObjectives: scenario.learningObjectives ?? [],
          supportingFacts: scenario.supportingFacts ?? [],
          locale,
          allowAutoEnd,
          npcId: npc.id,
          npcName: npc.name,
          npcRole: npc.role,
          npcPersona: npc.persona ?? null,
          npcGoals: npc.goals ?? [],
          npcTactics: npc.tactics ?? [],
          npcBoundaries: npc.boundaries ?? [],
          updatedAt: now,
        },
      });

    return NextResponse.json({
      sessionId,
      scenario,
      npc,
      allowAutoEnd,
      locale,
      createdAt: now.toISOString(),
    });
  } catch (error) {
    console.error("/api/ai-scenarios/session POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
