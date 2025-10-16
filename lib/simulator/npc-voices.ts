const NPC_VOICE_IDS: Record<string, string> = {
  "friend-boy-01": "93nuHbke4dTER9x2pDwE", // Jordan
  "friend-girl-01": "lcMyyd2HUfFzxdCaC4Ta", // Maya
  "classmate-both-01": "93nuHbke4dTER9x2pDwE", // Amir
  "doctor-boy-01": "93nuHbke4dTER9x2pDwE", // Dr. Tan
  "doctor-girl-01": "FUfBrNit0NNZAwb58KWH", // Dr. Wong
};

export function getNpcVoiceId(npcId: string | null | undefined): string | null {
  if (!npcId) {
    return null;
  }
  return NPC_VOICE_IDS[npcId] ?? null;
}

export { NPC_VOICE_IDS };
