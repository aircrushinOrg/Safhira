export type PlayerGender = 'boy' | 'girl';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface NPCData {
  id: string;
  name: string;
  scenarioId: string;
  x: number;
  y: number;
  sprite?: string;
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