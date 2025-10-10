import type { PlayerGender } from '@/types/game';
import type { ScenarioTemplate } from './scenarios';

export const CONVERSATION_OVERLAY_OPEN_EVENT = 'safhira:conversation-overlay:open';
export const CONVERSATION_OVERLAY_CLOSE_EVENT = 'safhira:conversation-overlay:close';

export type ConversationOverlayOpenDetail = {
  scenario: ScenarioTemplate;
  playerGender: PlayerGender;
  playerPosition: { x: number; y: number };
};

export function emitConversationOverlayOpen(detail: ConversationOverlayOpenDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONVERSATION_OVERLAY_OPEN_EVENT, { detail }));
}

export function emitConversationOverlayClose() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONVERSATION_OVERLAY_CLOSE_EVENT));
}
