export type PlayerGender = 'boy' | 'girl';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface NPCData {
  id: string;
  name: string;
  scenarioId: string;
  x: number;
  y: number;
  sprite?: string;
  interactionRadius?: number;
  isInteractive?: boolean;
  conversationSessionId?: string;
}

export interface GameState {
  playerGender: PlayerGender;
  currentMap: string;
  playerPosition: { x: number; y: number };
  completedScenarios: string[];
}

export interface MinimapConfig {
  width: number;
  height: number;
  padding: number;
  zoom: number;
}

export interface JoystickConfig {
  x: number;
  y: number;
  radius: number;
  forceMin: number;
}

export type ConversationState = 'idle' | 'approaching' | 'active' | 'ending';

export interface ConversationContext {
  npcId: string;
  sessionId: string;
  state: ConversationState;
  turnCount: number;
  lastResponse?: string;
}

export interface NPCInteractionZone {
  npc: NPCData;
  sprite: Phaser.GameObjects.Sprite;
  interactionIndicator?: Phaser.GameObjects.Sprite;
  isPlayerNear: boolean;
  conversationContext?: ConversationContext;
}