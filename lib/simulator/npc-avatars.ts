const DEFAULT_NPC_AVATAR = '/simulator-landing-classmate-both-01.png';

const NPC_AVATAR_PATHS: Record<string, string> = {
  'classmate-both-01': '/simulator-landing-classmate-both-01.png',
  'doctor-boy-01': '/simulator-landing-doctor-boy-01.png',
  'doctor-girl-01': '/simulator-landing-doctor-girl-01r.png',
  'friend-boy-01': '/simulator-landing-friend-boy-01.png',
  'friend-girl-01': '/simulator-landing-friend-girl-01.png',
};

export function getNpcAvatarPath(npcId: string | null | undefined): string {
  if (!npcId) {
    return DEFAULT_NPC_AVATAR;
  }

  return NPC_AVATAR_PATHS[npcId] ?? DEFAULT_NPC_AVATAR;
}

export { NPC_AVATAR_PATHS, DEFAULT_NPC_AVATAR };
