/**
 * This file defines the ConversationScene class for a Phaser-based game.
 * It handles AI-powered conversations between the player and NPCs,
 * using the scenario templates and AI API for dynamic responses.
 */
import * as Phaser from 'phaser';
import type { PlayerGender } from '../../../../types/game';
import type { ScenarioTemplate } from '../../../../lib/simulator/scenarios';
import type { ConversationTurn, MessageLayout } from '../utils/ConversationLogs';
import { ConversationHistoryView } from '../utils/ConversationLogs';
import { conversationStateStore, ConversationSceneState } from '../utils/ConversationState';
import { ConversationInput, ConversationInputLayout } from '../utils/ConversationInput';

interface ConversationData {
  scenario: ScenarioTemplate;
  playerGender: PlayerGender;
  playerPosition: { x: number; y: number };
}

interface ApiResponse {
  sessionId: string;
  npcTurnIndex: number;
  playerTurnIndex: number;
  response: {
    npcReply: string;
    conversationComplete: boolean;
    conversationCompleteReason: string | null;
    summary: any;
    score: any;
    finalReport: any;
    safetyAlerts: string[];
    checkpoints: {
      totalPlayerTurns: number;
      summaryDue: boolean;
      assessmentDue: boolean;
    };
  };
}

export class ConversationScene extends Phaser.Scene {
  private scenario!: ScenarioTemplate;
  private playerGender!: PlayerGender;
  private playerPosition!: { x: number; y: number };
  private conversationHistory: ConversationTurn[] = [];
  private sessionId: string | null = null;
  private inputText!: Phaser.GameObjects.DOMElement;
  private sendButton!: Phaser.GameObjects.Text;
  private endButton!: Phaser.GameObjects.Text;
  private inputBg!: Phaser.GameObjects.Rectangle;
  private headerBg!: Phaser.GameObjects.Rectangle;
  private npcSprite!: Phaser.GameObjects.Sprite;
  private npcNameText!: Phaser.GameObjects.Text;
  private npcRoleText!: Phaser.GameObjects.Text;
  private conversationBg!: Phaser.GameObjects.Rectangle;
  private conversationContainer!: Phaser.GameObjects.Container;
  private isLoading = false;
  private conversationComplete = false;
  private isRebuilding = false;
  private conversationStartY = 150;
  private npcMessageX = 60;
  private playerMessageX = 60;
  private messageBgWidth = 0;
  private messageWrapWidth = 0;
  private messageFontSizePx = 28;
  private messageSpacing = 10;
  private conversationHeight = 0;
  private conversationBottomPadding = 0;
  private historyView!: ConversationHistoryView;
  private inputManager!: ConversationInput;
  private conversationMaskGraphics: Phaser.GameObjects.Graphics | null = null;
  private conversationMask: Phaser.Display.Masks.GeometryMask | null = null;
  private conversationScrollZone!: Phaser.GameObjects.Zone;
  private isDraggingConversation = false;
  private dragStartPointerY = 0;
  private dragStartContainerY = 0;
  private sessionRequestCounter = 0;
  private turnRequestCounter = 0;
  private isSessionReady = false;
  private pendingTurn: { message: string } | null = null;
  private hasResumedPendingTurn = false;
  private pendingTurnRetryCount = 0;
  private readonly defaultInputPlaceholder = 'Type your response here...';

  constructor() {
    super({ key: 'ConversationScene' });
  }

  private getStateCacheKey(): string {
    return `${this.scenario?.scenario?.id || 'unknown'}:${this.playerGender || 'unknown'}`;
  }

  init(data: ConversationData) {
    this.scenario = data.scenario;
    this.playerGender = data.playerGender;
    this.playerPosition = data.playerPosition;
    this.conversationHistory = [];
    this.sessionId = null;
    this.conversationComplete = false;
    this.isLoading = false;
    this.isRebuilding = false;
    this.turnRequestCounter = 0;
    this.sessionRequestCounter = 0;
    this.isSessionReady = false;
    this.pendingTurn = null;
    this.hasResumedPendingTurn = false;
    this.pendingTurnRetryCount = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Add background image with smart scaling (same as InstructionScene)
    const background = this.add.image(width / 2, height / 2, 'simulator-background');
    background.setName('background'); // Set name for resize handling
    const imageWidth = background.width;
    const imageHeight = background.height;

    // Calculate scale ratios
    const scaleX = width / imageWidth;
    const scaleY = height / imageHeight;

    // Smart scaling logic
    if (width < imageWidth || height < imageHeight) {
      background.setScale(1.0);

      // Ensure the image covers the screen by using the larger scale if needed
      const minScale = Math.max(scaleX, scaleY);
      if (minScale > 1.0) {
        background.setScale(minScale);
      }

      // Focus towards bottom center of image
      const scaledImageHeight = background.height * background.scaleY;
      const excessHeight = scaledImageHeight - height;
      if (excessHeight > 0) {
        background.y = (height / 2) - (excessHeight * 0.3);
      }
    } else {
      // Screen is bigger than image - resize to fill
      const fillScale = Math.max(scaleX, scaleY);
      background.setScale(fillScale);

      const scaledImageHeight = background.height * fillScale;
      const excessHeight = scaledImageHeight - height;
      if (excessHeight > 0) {
        background.y = (height / 2) - (excessHeight * 0.3);
      }
    }

    // Add semi-transparent overlay for better text readability
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    overlay.setName('overlay'); // Set name for resize handling
    overlay.setDepth(1);

    // Create header
    this.createHeader();

    // Create conversation area
    this.createConversationArea();

    // Create input area
    this.createInputArea();

    // Apply responsive layout before showing any messages
    this.applyLayout();

    // Restore previous conversation if available, otherwise begin a new session
    if (!this.restoreConversationState()) {
      this.startConversationSession();
    }

    this.input.on('wheel', this.handleConversationWheel, this);

    // Add resize listener to handle screen size changes
    this.scale.on('resize', this.handleResize, this);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;

    // Header background
    this.headerBg = this.add.rectangle(width / 2, 60, width, 120, 0x2c3e50);
    this.headerBg.setDepth(2);

    // NPC info
    this.npcSprite = this.add.sprite(80, 60, `simulator-${this.playerGender}-npc-bar`);
    this.npcSprite.setDepth(3);
    this.npcSprite.setOrigin(0, 0.5);

    this.npcNameText = this.add.text(140, 60, this.scenario.npc.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.npcNameText.setDepth(3);
    this.npcNameText.setOrigin(0, 0.5);

    this.npcRoleText = this.add.text(140, 60, this.scenario.npc.role, {
      fontSize: '14px',
      color: '#bdc3c7',
      fontFamily: '"Press Start 2P", sans-serif'
    });
    this.npcRoleText.setDepth(3);
    this.npcRoleText.setOrigin(0, 0.5);

    // End conversation button
    this.endButton = this.add.text(width - 20, 60, 'END CHAT', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#e74c3c',
      padding: { x: 12, y: 8 },
      fontFamily: '"Press Start 2P", sans-serif'
    });
    this.endButton.setOrigin(1, 0.5);
    this.endButton.setDepth(3);
    this.endButton.setInteractive({ useHandCursor: true });

    this.endButton.on('pointerover', () => {
      this.endButton.setStyle({ backgroundColor: '#c0392b' });
    });

    this.endButton.on('pointerout', () => {
      this.endButton.setStyle({ backgroundColor: '#e74c3c' });
    });

    this.endButton.on('pointerup', () => {
      this.endConversation();
    });
  }

  private createConversationArea(): void {
    const { width, height } = this.cameras.main;

    // Position conversation area to start right under the header (header ends at y=120)
    const conversationStartY = 130;
    const conversationHeight = height - conversationStartY - 140; // Leave 140px for input area

    // Conversation background
    this.conversationBg = this.add.rectangle(
      width / 2,
      conversationStartY + conversationHeight / 2,
      width - 40,
      conversationHeight,
      0x34495e,
      0
    );
    this.conversationBg.setName('conversationBg'); // Name for resize handling
    this.conversationBg.setDepth(2);

    // Create scrollable container for messages
    this.conversationContainer = this.add.container(0, 0);
    this.conversationContainer.setDepth(3);
    this.historyView = new ConversationHistoryView(this, this.conversationContainer);

    if (!this.conversationMaskGraphics) {
      this.conversationMaskGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    }
    if (!this.conversationMask) {
      this.conversationMask = this.conversationMaskGraphics.createGeometryMask();
      this.conversationMask.setInvertAlpha(false);
    }
    this.conversationContainer.setMask(this.conversationMask);

    this.conversationScrollZone = this.add.zone(
      width / 2,
      conversationStartY + conversationHeight / 2,
      width - 40,
      conversationHeight
    );
    this.conversationScrollZone.setName('conversationScrollZone');
    this.conversationScrollZone.setDepth(5);
    this.conversationScrollZone.setInteractive({ useHandCursor: false });
    this.conversationScrollZone.on('pointerdown', this.handleConversationPointerDown, this);
    this.conversationScrollZone.on('pointermove', this.handleConversationPointerMove, this);
    this.conversationScrollZone.on('pointerup', this.handleConversationPointerUp, this);
    this.conversationScrollZone.on('pointerupoutside', this.handleConversationPointerUp, this);
    this.conversationScrollZone.on('pointerout', this.handleConversationPointerOut, this);
  }

  private createInputArea(): void {
    const { width, height } = this.cameras.main;

    // Input background
    this.inputBg = this.add.rectangle(width / 2, height - 80, width - 40, 120, 0x2c3e50);
    this.inputBg.setDepth(2);

    // Create DOM element for text input
    const bodyFontSize = width < 600 ? '20px' : '28px';
    const inputElement = document.createElement('textarea');
    inputElement.style.width = '100px';
    inputElement.style.height = '60px';
    inputElement.style.fontSize = bodyFontSize;
    inputElement.style.padding = '10px';
    inputElement.style.border = '2px solid #7f2be6';
    inputElement.style.backgroundColor = 'transparent';
    inputElement.style.color = '#ffffff';
    inputElement.style.fontFamily = '"VT323", sans-serif';
    inputElement.style.resize = 'none';
    inputElement.placeholder = this.defaultInputPlaceholder;

    this.inputText = this.add.dom(width / 2, height - 80, inputElement);
    this.inputText.setOrigin(0.5);
    this.inputText.setDepth(3);

    // Send button
    this.sendButton = this.add.text(width / 2 + 220, height - 80, 'SEND', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#7f2be6',
      padding: { x: 20, y: 15 },
      fontFamily: '"Press Start 2P", sans-serif'
    });
    this.sendButton.setOrigin(0.5);
    this.sendButton.setDepth(3);

    this.inputManager = new ConversationInput(this, this.defaultInputPlaceholder, () => this.sendMessage());
    this.inputManager.create({
      background: this.inputBg,
      domElement: this.inputText,
      sendButton: this.sendButton
    });
  }

  private applyLayout(): void {
    const { width, height } = this.cameras.main;
    const isMobile = width <= 600;
    const isTablet = width > 600 && width <= 960;

    const headerHeight = isMobile ? 90 : isTablet ? 110 : 120;
    const headerPadding = isMobile ? 16 : 24;
    const headerCenterY = headerHeight / 2;

    if (this.headerBg) {
      this.headerBg.setSize(width, headerHeight);
      this.headerBg.setPosition(width / 2, headerCenterY);
    }

    if (this.npcSprite) {
      const npcScale = isMobile ? 0.9 : isTablet ? 1.05 : 1.2;
      this.npcSprite.setScale(npcScale);
      this.npcSprite.setPosition(headerPadding, headerCenterY);
    }

    if (this.npcNameText && this.npcRoleText && this.npcSprite) {
      const textOffset = isMobile ? 12 : 16;
      const textBaseX = this.npcSprite.x + this.npcSprite.displayWidth + textOffset;
      const nameFontSize = isMobile ? '18px' : isTablet ? '22px' : '24px';
      const roleFontSize = isMobile ? '12px' : isTablet ? '14px' : '16px';

      this.npcNameText.setStyle({ fontSize: nameFontSize });
      this.npcRoleText.setStyle({ fontSize: roleFontSize });

      const nameYOffset = isMobile ? -12 : -14;
      const roleYOffset = isMobile ? 10 : 12;

      this.npcNameText.setPosition(textBaseX, headerCenterY + nameYOffset);
      this.npcRoleText.setPosition(textBaseX, headerCenterY + roleYOffset);
    }

    if (this.endButton) {
      const endFontSize = isMobile ? 12 : isTablet ? 14 : 16;
      const endPaddingX = isMobile ? 10 : 12;
      const endPaddingY = isMobile ? 6 : 8;
      this.endButton.setFontSize(endFontSize);
      this.endButton.setPadding(endPaddingX, endPaddingY, endPaddingX, endPaddingY);
      this.endButton.setPosition(width - headerPadding, headerCenterY);
    }

    if (this.npcNameText && this.npcRoleText) {
      const endButtonWidth = this.endButton ? this.endButton.displayWidth : 0;
      const availableTextWidth = Math.max(120, width - (this.npcNameText.x) - headerPadding - endButtonWidth - 16);
      this.npcNameText.setWordWrapWidth(availableTextWidth);
      this.npcRoleText.setWordWrapWidth(availableTextWidth);
    }

    const conversationHorizontalMargin = 0;
    const inputHorizontalMargin = conversationHorizontalMargin;
    const inputVerticalMargin = 0;
    const inputBgHeight = isMobile ? 150 : isTablet ? 130 : 120;
    const inputBgWidth = width;
    const inputCenterY = height - inputBgHeight / 2 - inputVerticalMargin;

    if (this.inputBg) {
      this.inputBg.setSize(inputBgWidth, inputBgHeight);
      this.inputBg.setPosition(width / 2, inputCenterY);
    }

    const conversationTopMargin = 0;
    const conversationBottomMargin = 0;
    const conversationTop = headerHeight + conversationTopMargin;
    const conversationBottom = inputCenterY - inputBgHeight / 2 - conversationBottomMargin;
    const conversationHeight = Math.max(120, conversationBottom - conversationTop);
    const conversationWidth = Math.max(220, width - conversationHorizontalMargin * 2);

    if (this.conversationBg) {
      this.conversationBg.setSize(conversationWidth, conversationHeight);
      this.conversationBg.setPosition(width / 2, conversationTop + conversationHeight / 2);
    }

    this.updateConversationViewport(conversationWidth, conversationHeight, conversationTop);

    const conversationInnerTopPadding = 8;
    this.conversationBottomPadding = 20;
    this.conversationStartY = conversationTop + conversationInnerTopPadding;
    this.conversationHeight = conversationHeight;

    const messageMargin = isMobile ? 24 : isTablet ? 32 : 48;
    const bubbleWidth = Math.max(160, conversationWidth * (isMobile ? 0.78 : isTablet ? 0.7 : 0.6));
    const wrapWidth = Math.max(120, bubbleWidth - 32);
    this.messageBgWidth = bubbleWidth;
    this.messageWrapWidth = wrapWidth;
    this.npcMessageX = width / 2 - conversationWidth / 2 + messageMargin;
    this.playerMessageX = width / 2 + conversationWidth / 2 - messageMargin;
    this.messageFontSizePx = isMobile ? 18 : isTablet ? 22 : 28;
    this.messageSpacing = isMobile ? 12 : 14;

    if (this.inputManager) {
      const inputLayout: ConversationInputLayout = {
        isMobile,
        isTablet,
        width,
        inputBgWidth,
        inputBgHeight,
        inputCenterY,
        inputPadding: isMobile ? 16 : 24,
        messageLeft: this.npcMessageX
      };
      this.inputManager.updateLayout(inputLayout);

      const inputElement = this.inputManager.getTextarea();
      if (inputElement) {
        const baseFontSize = isMobile ? Math.max(16, this.messageFontSizePx - 2) : this.messageFontSizePx;
        inputElement.style.fontSize = `${baseFontSize}px`;
        inputElement.style.borderWidth = '2px';
      }
    }

    this.refreshSendButtonState();
    this.setConversationScroll(this.conversationContainer?.y ?? 0);
  }

  private refreshSendButtonState(): void {
    if (!this.sendButton) return;

    const canInteract = this.isSessionReady && !this.isLoading && !this.conversationComplete;
    this.sendButton.setStyle({
      backgroundColor: canInteract ? '#7f2be6' : '#95a5a6'
    });
    this.sendButton.setAlpha(canInteract ? 1 : 0.75);

    if (canInteract) {
      if (!this.sendButton.input?.enabled) {
        this.sendButton.setInteractive({ useHandCursor: true });
      }
    } else {
      this.sendButton.disableInteractive();
    }
  }

  private updateInputAvailability(enabled: boolean, placeholder?: string): void {
    this.isSessionReady = enabled;

    if (this.inputManager) {
      this.inputManager.setEnabled(enabled, placeholder);
      if (enabled && !this.conversationComplete) {
        this.inputManager.focus();
      }
      this.refreshSendButtonState();
    }

    this.persistState();
  }

  private clearCachedState(): void {
    conversationStateStore.clear(this.getStateCacheKey());
  }

  private persistState(): void {
    const state: ConversationSceneState<ConversationTurn> = {
      sessionId: this.sessionId,
      history: this.conversationHistory.map(turn => ({ ...turn })),
      conversationComplete: this.conversationComplete,
      isSessionReady: this.isSessionReady,
      isLoading: this.isLoading,
      turnRequestCounter: this.turnRequestCounter,
      pendingTurn: this.pendingTurn ? { message: this.pendingTurn.message } : null,
      pendingTurnRetryCount: this.pendingTurnRetryCount
    };

    conversationStateStore.save(this.getStateCacheKey(), state);
  }

  private restoreConversationState(): boolean {
    const state = conversationStateStore.load(this.getStateCacheKey());
    if (!state) {
      return false;
    }

    this.conversationHistory = state.history.map(turn => ({ ...turn }));
    this.sessionId = state.sessionId;
    this.conversationComplete = state.conversationComplete;
    this.isSessionReady = state.isSessionReady;
    this.isLoading = state.isLoading ?? false;
    this.turnRequestCounter = state.turnRequestCounter ?? this.turnRequestCounter;
    this.pendingTurn = state.pendingTurn ? { ...state.pendingTurn } : null;
    this.hasResumedPendingTurn = false;
    this.pendingTurnRetryCount = state.pendingTurnRetryCount ?? 0;

    this.renderConversationMessages(true);

    if (this.conversationComplete) {
      if (this.endButton) {
        this.endButton.setText('RESTART CONVERSATION');
      }
      this.updateInputAvailability(false, 'Conversation finished. Tap restart to talk again.');
    } else {
      this.updateInputAvailability(this.isSessionReady, this.isSessionReady ? this.defaultInputPlaceholder : 'Loading...');

      if (!this.sessionId) {
        void this.initializeAISession();
      }
    }

    if (this.isLoading) {
      if (!this.historyView?.hasThinking()) {
        this.addThinkingMessage();
      }
      this.tryResumePendingTurn();
    }

    return true;
  }

  private updateConversationViewport(conversationWidth: number, conversationHeight: number, conversationStartY: number): void {
    if (!this.conversationMaskGraphics) {
      this.conversationMaskGraphics = this.make.graphics({ x: 0, y: 0}, false );
    }

    this.conversationMaskGraphics.clear();
    this.conversationMaskGraphics.fillStyle(0xffffff);
    const left = (this.cameras.main.width - conversationWidth) / 2;
    this.conversationMaskGraphics.fillRect(left, conversationStartY, conversationWidth, conversationHeight);

    if (!this.conversationMask) {
      this.conversationMask = this.conversationMaskGraphics.createGeometryMask();
      this.conversationMask.setInvertAlpha(false);
      this.conversationContainer?.setMask(this.conversationMask);
    }

    if (this.conversationScrollZone) {
      this.conversationScrollZone.setPosition(this.cameras.main.width / 2, conversationStartY + conversationHeight / 2);
      this.conversationScrollZone.setSize(conversationWidth, conversationHeight);
    }
  }

  private getMessageLayout(): MessageLayout {
    const { width } = this.cameras.main;
    return {
      startY: this.conversationStartY || 150,
      messageSpacing: this.messageSpacing,
      fontSize: this.messageFontSizePx || 20,
      messageBgWidth: this.messageBgWidth || width * 0.7,
      wrapWidth: this.messageWrapWidth || width * 0.6,
      npcMessageX: this.npcMessageX || 60,
      playerMessageX: this.playerMessageX || width - 60
    };
  }

  private renderConversationMessages(autoScroll: boolean): void {
    if (!this.conversationContainer || !this.historyView) {
      return;
    }

    const layout = this.getMessageLayout();
    const previousOffset = this.conversationContainer.y;

    this.historyView.renderHistory(this.conversationHistory, layout, {
      autoScroll,
      scrollToBottom: () => this.scrollToBottom(),
      restoreOffset: (offset) => this.setConversationScroll(offset),
      previousOffset
    });

    this.persistState();
  }

  private resetConversationState(): void {
    this.removeThinkingMessage();
    if (this.historyView) {
      this.historyView.clear();
    }
    this.clearCachedState();

    if (this.conversationContainer) {
      this.conversationContainer.setY(0);
    }

    this.conversationHistory = [];
    this.conversationComplete = false;
    this.isLoading = false;
    this.turnRequestCounter = 0;
    this.sessionRequestCounter = 0;
    this.isSessionReady = false;
    this.isDraggingConversation = false;
    this.sessionId = null;
    this.isRebuilding = false;
    this.pendingTurn = null;
    this.hasResumedPendingTurn = false;
    this.pendingTurnRetryCount = 0;
    this.updateInputAvailability(false, 'Loading...');

    const inputElement = this.inputText?.node as HTMLTextAreaElement | undefined;
    if (inputElement) {
      inputElement.value = '';
    }

    if (this.endButton) {
      this.endButton.setText('END CHAT');
    }
  }

  private startConversationSession(): void {
    this.resetConversationState();
    this.addMessage('npc', `Hello! I'm ${this.scenario.npc.name}.`);
    void this.initializeAISession();
  }

  private getBaseConversationContentHeight(): number {
    return this.historyView ? this.historyView.getContentHeight() : 0;
  }

  private getScrollableContentHeight(includeThinking = true): number {
    let total = this.getBaseConversationContentHeight();
    if (includeThinking && this.historyView?.hasThinking()) {
      total += this.historyView.getThinkingHeight(true);
    }
    total += this.conversationBottomPadding;
    return total;
  }

  private getScrollLimits(includeThinking = true): { minOffset: number; maxOffset: number } {
    const conversationHeight = this.conversationHeight || (this.cameras.main.height - 130 - 140);
    const totalContent = this.getScrollableContentHeight(includeThinking);

    if (totalContent <= conversationHeight) {
      return { minOffset: 0, maxOffset: 0 };
    }

    return {
      minOffset: conversationHeight - totalContent,
      maxOffset: 0
    };
  }

  private setConversationScroll(targetOffset: number, includeThinking = true): void {
    if (!this.conversationContainer) return;

    const { minOffset, maxOffset } = this.getScrollLimits(includeThinking);
    const clampedOffset = Phaser.Math.Clamp(targetOffset, minOffset, maxOffset);
    this.conversationContainer.setY(clampedOffset);
  }

  private canScrollConversation(): boolean {
    const conversationHeight = this.conversationHeight || (this.cameras.main.height - 130 - 140);
    return this.getScrollableContentHeight() > conversationHeight;
  }

  private addMessage(role: 'player' | 'npc', content: string): void {
    const turn: ConversationTurn = { role, content };
    this.conversationHistory.push(turn);
    if (this.historyView) {
      this.historyView.appendMessage(turn, this.getMessageLayout(), !this.isRebuilding, () => this.scrollToBottom());
    }
    if (!this.isRebuilding) {
      this.persistState();
    }
  }

  private scrollToBottom(): void {
    const { minOffset } = this.getScrollLimits(true);
    this.setConversationScroll(minOffset, true);
  }

  private addThinkingMessage(): void {
    if (!this.historyView) return;
    this.historyView.addThinking(this.getMessageLayout(), this.scenario.npc.name, this.conversationHistory.length > 0, () => this.scrollToBottom());
  }

  private removeThinkingMessage(): void {
    if (!this.historyView) return;
    this.historyView.removeThinking(() => {
      if (!this.isRebuilding) {
        this.scrollToBottom();
      }
    });
  }

  private handleConversationWheel(pointer: Phaser.Input.Pointer, _over: unknown[], _deltaX: number, deltaY: number, _deltaZ: number): void {
    if (!this.conversationScrollZone || !this.conversationContainer) return;
    if (!this.canScrollConversation()) return;

    const pointerX = pointer.worldX ?? pointer.x;
    const pointerY = pointer.worldY ?? pointer.y;
    const bounds = this.conversationScrollZone.getBounds();
    if (!Phaser.Geom.Rectangle.Contains(bounds, pointerX, pointerY)) return;

    pointer.event?.preventDefault();
    const newOffset = this.conversationContainer.y - deltaY * 0.6;
    this.setConversationScroll(newOffset);
  }

  private handleConversationPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.conversationContainer) return;
    if (!this.canScrollConversation()) return;

    this.isDraggingConversation = true;
    this.dragStartPointerY = pointer.worldY ?? pointer.y;
    this.dragStartContainerY = this.conversationContainer.y;
  }

  private handleConversationPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDraggingConversation || !pointer.isDown) return;
    if (!this.canScrollConversation()) return;
    const currentPointerY = pointer.worldY ?? pointer.y;
    const delta = currentPointerY - this.dragStartPointerY;
    this.setConversationScroll(this.dragStartContainerY + delta);
  }

  private handleConversationPointerUp(): void {
    this.isDraggingConversation = false;
  }

  private handleConversationPointerOut(pointer: Phaser.Input.Pointer): void {
    if (!pointer.isDown) {
      this.isDraggingConversation = false;
    }
  }

  private handlePendingTurnError(status?: number): void {
    if (!this.pendingTurn) {
      this.removeThinkingMessage();
      this.setLoading(false);
      return;
    }

    const maxRetries = 3;
    const isRateLimited = status === 429;

    if (isRateLimited) {
      this.pendingTurnRetryCount += 1;

      if (this.pendingTurnRetryCount > maxRetries) {
        this.removeThinkingMessage();
        this.addMessage('npc', 'Sorry, I am still catching up. Could you try sending that again?');
        this.pendingTurn = null;
        this.hasResumedPendingTurn = false;
        this.pendingTurnRetryCount = 0;
        this.setLoading(false);
        this.persistState();
        return;
      }

      const retryDelay = 800 * this.pendingTurnRetryCount;
      this.persistState();
      this.schedulePendingTurnRetry(retryDelay);
      return;
    }

    if (status !== undefined && status >= 500) {
      this.hasResumedPendingTurn = false;
      this.pendingTurnRetryCount += 1;
      if (this.pendingTurnRetryCount > maxRetries) {
        this.removeThinkingMessage();
        this.addMessage('npc', 'Sorry, there was an error connecting to the conversation system. Please try again.');
        this.pendingTurn = null;
        this.setLoading(false);
        this.updateInputAvailability(false, 'Unable to connect. Tap restart to try again.');
        if (this.endButton) {
          this.endButton.setText('RETRY CONVERSATION');
        }
        this.pendingTurnRetryCount = 0;
        this.persistState();
        return;
      }
      this.setLoading(true);
      this.updateInputAvailability(false, 'Loading...');
      this.persistState();

      const delay = 400 * this.pendingTurnRetryCount;
      this.time.delayedCall(delay, () => {
        if (!this.pendingTurn) {
          this.setLoading(false);
          return;
        }

        this.sessionId = null;
        this.isSessionReady = false;
        this.persistState();

        void this.initializeAISession().then(() => {
          if (this.pendingTurn) {
            this.hasResumedPendingTurn = false;
            this.schedulePendingTurnRetry();
          }
        }).catch(() => {
          this.setLoading(false);
        });
      });
      return;
    }

    this.removeThinkingMessage();
    this.addMessage('npc', 'Sorry, I lost track of that response. Could you try again?');
    this.pendingTurn = null;
    this.hasResumedPendingTurn = false;
    this.pendingTurnRetryCount = 0;
    this.setLoading(false);
    this.persistState();
  }

  private tryResumePendingTurn(): void {
    if (!this.pendingTurn || this.hasResumedPendingTurn) {
      return;
    }

    if (!this.sessionId || !this.isSessionReady) {
      return;
    }

    this.hasResumedPendingTurn = true;
    void this.resumePendingTurnRequest();
  }

  private schedulePendingTurnRetry(delay?: number): void {
    if (!this.pendingTurn) {
      return;
    }
    const retryDelay = delay ?? Math.max(1, this.pendingTurnRetryCount) * 800;
    this.time.delayedCall(retryDelay, () => {
      if (!this.pendingTurn) {
        return;
      }
      this.hasResumedPendingTurn = false;
      this.tryResumePendingTurn();
    });
  }

  private async resumePendingTurnRequest(): Promise<void> {
    if (!this.pendingTurn || !this.sessionId) {
      return;
    }

    const message = this.pendingTurn.message;
    const activeSessionId = this.sessionId;
    const turnToken = ++this.turnRequestCounter;

    if (!this.historyView?.hasThinking()) {
      this.addThinkingMessage();
    }

    this.setLoading(true);

    try {
      const response = await fetch(`/api/ai-scenarios/session/${activeSessionId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerMessage: message,
          forceSummary: false,
          forceAssessment: false,
          allowAutoEnd: true,
          locale: 'en'
        })
      });

      if (!response.ok) {
        const error = new Error(`API request failed: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      const data: ApiResponse = await response.json();
      if (turnToken !== this.turnRequestCounter || activeSessionId !== this.sessionId) {
        return;
      }

      if (!data?.response?.npcReply) {
        throw new Error('Unexpected API payload');
      }

      this.removeThinkingMessage();
      this.addMessage('npc', data.response.npcReply);

      if (data.response.conversationComplete) {
        this.conversationComplete = true;
        this.endButton.setText('RESTART CONVERSATION');
        this.addMessage('npc', `Conversation ended: ${data.response.conversationCompleteReason || 'Natural conclusion'}`);
        this.updateInputAvailability(false, 'Conversation finished. Tap restart to talk again.');
      }

      this.pendingTurn = null;
      this.hasResumedPendingTurn = false;
      this.pendingTurnRetryCount = 0;
      this.persistState();

    } catch (error) {
      console.error('Failed to resume pending message:', error);
      const status = (error as any)?.status as number | undefined;
      this.hasResumedPendingTurn = false;
      this.handlePendingTurnError(status);
    } finally {
      if (!this.pendingTurn) {
        this.setLoading(false);
      }
      this.persistState();
    }
  }

  private async initializeAISession(): Promise<void> {
    const requestToken = ++this.sessionRequestCounter;

    try {
      const response = await fetch('/api/ai-scenarios/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: {
            id: this.scenario.scenario.id,
            title: this.scenario.scenario.title,
            setting: this.scenario.scenario.setting,
            learningObjectives: this.scenario.scenario.learningObjectives.split('\n').filter(Boolean),
            supportingFacts: this.scenario.scenario.supportingFacts.split('\n').filter(Boolean)
          },
          npc: {
            id: this.scenario.npc.id,
            name: this.scenario.npc.name,
            role: this.scenario.npc.role,
            persona: this.scenario.npc.persona,
            goals: this.scenario.npc.goals.split('\n').filter(Boolean),
            tactics: this.scenario.npc.tactics.split('\n').filter(Boolean),
            boundaries: this.scenario.npc.boundaries.split('\n').filter(Boolean)
          },
          allowAutoEnd: true,
          locale: 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize session: ${response.status}`);
      }

      const data = await response.json();
      if (requestToken !== this.sessionRequestCounter) {
        return;
      }

      if (!data?.sessionId) {
        throw new Error('Missing session id in response payload');
      }

      this.sessionId = data.sessionId;
      this.pendingTurnRetryCount = 0;
      this.updateInputAvailability(true);
      this.tryResumePendingTurn();
    } catch (error) {
      console.error('Failed to initialize AI session:', error);
      if (this.pendingTurn) {
        this.hasResumedPendingTurn = false;
        this.schedulePendingTurnRetry();
      } else {
        this.addMessage('npc', 'Sorry, there was an error connecting to the conversation system.');
        this.updateInputAvailability(false, 'Unable to connect. Tap restart to try again.');
        if (this.endButton) {
          this.endButton.setText('RETRY CONVERSATION');
        }
      }
    }
  }

  private async sendMessage(): Promise<void> {
    if (this.isLoading || this.conversationComplete) return;

    const inputElement = this.inputManager?.getTextarea();
    if (!inputElement) return;
    const message = inputElement.value.trim();

    if (!message) return;

    const queuePendingTurn = () => {
      if (!this.pendingTurn) {
        this.pendingTurn = { message };
        this.hasResumedPendingTurn = false;
        this.pendingTurnRetryCount = 0;
        this.persistState();

        this.addMessage('player', message);
        if (!this.historyView?.hasThinking()) {
          this.addThinkingMessage();
        }
        this.setLoading(true);
      }

      if (!this.sessionId) {
        void this.initializeAISession();
      } else {
        this.tryResumePendingTurn();
      }
    };

    if (!this.sessionId || !this.isSessionReady) {
      queuePendingTurn();
      inputElement.value = '';
      if (!this.sessionId && !this.isLoading) {
        void this.initializeAISession();
      }
      return;
    }

    if (this.pendingTurn) {
      inputElement.value = '';
      return;
    }

    const activeSessionId = this.sessionId;
    const turnToken = ++this.turnRequestCounter;
    this.pendingTurn = { message };
    this.hasResumedPendingTurn = false;
    this.pendingTurnRetryCount = 0;
    this.persistState();

    // Clear input
    inputElement.value = '';

    // Add player message
    this.addMessage('player', message);

    // Show thinking message as a chat box
    this.addThinkingMessage();
    this.setLoading(true);

    let response: Response | null = null;
    try {
      response = await fetch(`/api/ai-scenarios/session/${activeSessionId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerMessage: message,
          forceSummary: false,
          forceAssessment: false,
          allowAutoEnd: true,
          locale: 'en'
        })
      });

      if (!response.ok) {
        const error = new Error(`API request failed: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      const data: ApiResponse = await response.json();
      if (turnToken !== this.turnRequestCounter || activeSessionId !== this.sessionId) {
        return;
      }

      if (!data?.response?.npcReply) {
        throw new Error('Unexpected API payload');
      }

      // Remove thinking message and add NPC response
      this.removeThinkingMessage();
      this.addMessage('npc', data.response.npcReply);

      // Check if conversation is complete
      if (data.response.conversationComplete) {
        this.conversationComplete = true;
        this.endButton.setText('RESTART CONVERSATION');

        // Show completion message
        this.addMessage('npc', `Conversation ended: ${data.response.conversationCompleteReason || 'Natural conclusion'}`);

        // Disable input until conversation is restarted
        this.updateInputAvailability(false, 'Conversation finished. Tap restart to talk again.');
      }

      this.pendingTurn = null;
      this.hasResumedPendingTurn = false;
      this.persistState();

    } catch (error) {
      console.error('Failed to send message:', error);
      const status = (error as any)?.status as number | undefined;
      let responseText: string | undefined;
      if (response) {
        try {
          responseText = await response.clone().text();
        } catch {
          responseText = 'unavailable';
        }
      }
      console.error('Session POST failed', {
        status,
        sessionId: this.sessionId,
        pendingTurn: this.pendingTurn,
        responseStatus: response?.status,
        responseText
      });
      this.hasResumedPendingTurn = false;
      this.handlePendingTurnError(status);
    } finally {
      if (!this.pendingTurn) {
        this.setLoading(false);
      }
      this.persistState();
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.inputManager?.setLoading(loading);
    this.refreshSendButtonState();
    this.persistState();
  }

  private handleResize(): void {
    // Rebuild UI elements for new dimensions
    this.rebuildUIElements();

    // Rebuild all messages with new screen dimensions
    this.rebuildAllMessages();
  }

  private rebuildUIElements(): void {
    const { width, height } = this.cameras.main;

    // Update background scaling
    const background = this.children.getByName('background') as Phaser.GameObjects.Image;
    if (background) {
      const imageWidth = background.texture.source[0].width;
      const imageHeight = background.texture.source[0].height;
      const scaleX = width / imageWidth;
      const scaleY = height / imageHeight;

      if (width < imageWidth || height < imageHeight) {
        background.setScale(1.0);
        const minScale = Math.max(scaleX, scaleY);
        if (minScale > 1.0) {
          background.setScale(minScale);
        }
        const scaledImageHeight = background.height * background.scaleY;
        const excessHeight = scaledImageHeight - height;
        if (excessHeight > 0) {
          background.y = (height / 2) - (excessHeight * 0.3);
        }
      } else {
        const fillScale = Math.max(scaleX, scaleY);
        background.setScale(fillScale);
        const scaledImageHeight = background.height * fillScale;
        const excessHeight = scaledImageHeight - height;
        if (excessHeight > 0) {
          background.y = (height / 2) - (excessHeight * 0.3);
        }
      }
      background.x = width / 2;
    }

    // Update overlay
    const overlay = this.children.getByName('overlay') as Phaser.GameObjects.Rectangle;
    if (overlay) {
      overlay.setSize(width, height);
      overlay.setPosition(width / 2, height / 2);
    }

    // Re-apply responsive layout for foreground elements
    this.applyLayout();
  }

  private rebuildAllMessages(): void {
    // Set rebuilding flag to prevent automatic scrolling during rebuild
    this.isRebuilding = true;

    // Remove thinking message if it exists
    const hadThinkingMessage = this.historyView?.hasThinking() ?? false;
    if (hadThinkingMessage) {
      this.removeThinkingMessage();
    }

    // Re-render conversation using current history (without mutating state)
    this.renderConversationMessages(false);

    // Re-add thinking message if we were loading
    if (this.isLoading && hadThinkingMessage) {
      this.addThinkingMessage();
    }

    // Clear rebuilding flag and ensure scroll position is correct for current layout
    this.isRebuilding = false;
    this.setConversationScroll(this.conversationContainer?.y ?? 0);
  }

  private endConversation(): void {
    this.startConversationSession();
  }

  destroy(): void {
    // Clean up resize listener
    this.scale.off('resize', this.handleResize, this);
    this.input.off('wheel', this.handleConversationWheel, this);
    if (this.conversationScrollZone) {
      this.conversationScrollZone.off('pointerdown', this.handleConversationPointerDown, this);
      this.conversationScrollZone.off('pointermove', this.handleConversationPointerMove, this);
      this.conversationScrollZone.off('pointerup', this.handleConversationPointerUp, this);
      this.conversationScrollZone.off('pointerupoutside', this.handleConversationPointerUp, this);
      this.conversationScrollZone.off('pointerout', this.handleConversationPointerOut, this);
    }
    this.persistState();
  }
}
