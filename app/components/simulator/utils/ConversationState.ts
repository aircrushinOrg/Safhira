export interface ConversationSceneState<TMessage> {
  sessionId: string | null;
  history: TMessage[];
  conversationComplete: boolean;
  isSessionReady: boolean;
  isLoading?: boolean;
  turnRequestCounter?: number;
  pendingTurn?: { message: string } | null;
  pendingTurnRetryCount?: number;
}

class ConversationStateStore<TMessage> {
  private cache = new Map<string, ConversationSceneState<TMessage>>();

  load(key: string): ConversationSceneState<TMessage> | undefined {
    return this.cache.get(key);
  }

  save(key: string, state: ConversationSceneState<TMessage>): void {
    this.cache.set(key, state);
  }

  clear(key: string): void {
    this.cache.delete(key);
  }
}

export const conversationStateStore = new ConversationStateStore<any>();
