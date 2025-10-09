import * as Phaser from 'phaser';

export type ConversationRole = 'player' | 'npc';

export interface ConversationTurn {
  role: ConversationRole;
  content: string;
}

export interface MessageLayout {
  startY: number;
  messageSpacing: number;
  fontSize: number;
  messageBgWidth: number;
  wrapWidth: number;
  npcMessageX: number;
  playerMessageX: number;
}

export interface RenderedMessage {
  role: ConversationRole;
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  height: number;
}

export interface ThinkingElements {
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  height: number;
  spacing: number;
}

interface RenderHistoryOptions {
  autoScroll: boolean;
  scrollToBottom: () => void;
  restoreOffset: (offset: number) => void;
  previousOffset: number;
}

export class ConversationHistoryView {
  private messageObjects: RenderedMessage[] = [];
  private contentHeight = 0;
  private thinkingElements: ThinkingElements | null = null;
  private thinkingTween: Phaser.Tweens.Tween | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private container: Phaser.GameObjects.Container
  ) {}

  setContainer(container: Phaser.GameObjects.Container): void {
    this.container = container;
  }

  clear(): void {
    this.messageObjects.forEach(({ bg, text }) => {
      this.container.remove(bg, true);
      this.container.remove(text, true);
    });
    this.messageObjects = [];
    this.contentHeight = 0;
    this.removeThinking();
  }

  getContentHeight(): number {
    return this.contentHeight;
  }

  hasThinking(): boolean {
    return this.thinkingElements !== null;
  }

  getThinkingHeight(includeSpacing = true): number {
    if (!this.thinkingElements) return 0;
    return this.thinkingElements.height + (includeSpacing ? this.thinkingElements.spacing : 0);
  }

  renderHistory(history: ConversationTurn[], layout: MessageLayout, options: RenderHistoryOptions): void {
    const previousOffset = options.previousOffset;
    this.clearMessagesOnly();

    let stackHeight = 0;

    history.forEach((turn, index) => {
      if (index > 0) {
        stackHeight += layout.messageSpacing;
      }
      const y = layout.startY + stackHeight;
      const rendered = this.createMessage(turn, layout, y);
      this.messageObjects.push(rendered);
      stackHeight += rendered.height;
    });

    this.contentHeight = stackHeight;

    if (options.autoScroll) {
      options.scrollToBottom();
    } else {
      options.restoreOffset(previousOffset);
    }
  }

  appendMessage(turn: ConversationTurn, layout: MessageLayout, autoScroll: boolean, scrollToBottom: () => void): void {
    if (this.hasThinking()) {
      this.removeThinking();
    }

    if (this.messageObjects.length > 0) {
      this.contentHeight += layout.messageSpacing;
    }
    const y = layout.startY + this.contentHeight;
    const rendered = this.createMessage(turn, layout, y);
    this.messageObjects.push(rendered);
    this.contentHeight += rendered.height;

    if (autoScroll) {
      scrollToBottom();
    }
  }

  addThinking(layout: MessageLayout, npcName: string, hasMessages: boolean, scrollToBottom: () => void): void {
    this.removeThinking();

    const spacing = hasMessages ? layout.messageSpacing : 0;
    const y = layout.startY + this.contentHeight + spacing;
    const text = this.scene.add.text(
      layout.npcMessageX + 20,
      y + 10,
      `${npcName} is thinking...`,
      {
        fontSize: `${layout.fontSize}px`,
        color: '#ffffff',
        fontFamily: '"VT323", sans-serif',
        wordWrap: { width: layout.wrapWidth }
      }
    );
    text.setOrigin(0, 0);
    text.setDepth(5);

    const textHeight = text.height;
    const bgHeight = Math.max(60, textHeight + 20);

    const bg = this.scene.add.rectangle(layout.npcMessageX, y, layout.messageBgWidth, bgHeight, 0x95a5a6);
    bg.setOrigin(0, 0);
    bg.setDepth(4);

    this.container.add([bg, text]);
    this.thinkingElements = { bg, text, height: bgHeight, spacing };
    this.thinkingTween = this.scene.tweens.add({
      targets: text,
      alpha: 0.5,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    scrollToBottom();
  }

  removeThinking(onScroll?: () => void): void {
    if (!this.thinkingElements) return;
    if (this.thinkingTween) {
      this.thinkingTween.stop();
      this.thinkingTween = null;
    }
    this.container.remove(this.thinkingElements.bg, true);
    this.container.remove(this.thinkingElements.text, true);
    this.thinkingElements = null;
    if (onScroll) {
      onScroll();
    }
  }

  private clearMessagesOnly(): void {
    this.messageObjects.forEach(({ bg, text }) => {
      this.container.remove(bg, true);
      this.container.remove(text, true);
    });
    this.messageObjects = [];
    this.contentHeight = 0;
  }

  private createMessage(turn: ConversationTurn, layout: MessageLayout, y: number): RenderedMessage {
    const isPlayer = turn.role === 'player';
    const alignX = isPlayer ? layout.playerMessageX : layout.npcMessageX;
    const originX = isPlayer ? 1 : 0;
    const bgColor = isPlayer ? 0x7f2be6 : 0x95a5a6;

    const text = this.scene.add.text(
      alignX + (isPlayer ? -20 : 20),
      y + 10,
      turn.content,
      {
        fontSize: `${layout.fontSize}px`,
        color: '#ffffff',
        fontFamily: '"VT323", sans-serif',
        wordWrap: { width: layout.wrapWidth }
      }
    );
    text.setOrigin(isPlayer ? 1 : 0, 0);
    text.setDepth(5);

    const textHeight = text.height;
    const bgHeight = Math.max(60, textHeight + 20);

    const bg = this.scene.add.rectangle(alignX, y, layout.messageBgWidth, bgHeight, bgColor);
    bg.setOrigin(originX, 0);
    bg.setDepth(4);

    this.container.add([bg, text]);

    return { role: turn.role, bg, text, height: bgHeight };
  }
}
