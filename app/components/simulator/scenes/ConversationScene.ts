/**
 * This file defines the ConversationScene class for a Phaser-based game.
 * It handles AI-powered conversations between the player and NPCs,
 * using the scenario templates and AI API for dynamic responses.
 */
import * as Phaser from 'phaser';
import type { PlayerGender } from '../../../../types/game';
import type { ScenarioTemplate } from '../../../../lib/simulator/scenarios';

interface ConversationData {
  scenario: ScenarioTemplate;
  playerGender: PlayerGender;
  playerPosition: { x: number; y: number };
}

interface ConversationTurn {
  role: 'player' | 'npc';
  content: string;
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
  private conversationContainer!: Phaser.GameObjects.Container;
  private loadingText!: Phaser.GameObjects.Text;
  private isLoading = false;
  private conversationComplete = false;

  constructor() {
    super({ key: 'ConversationScene' });
  }

  init(data: ConversationData) {
    this.scenario = data.scenario;
    this.playerGender = data.playerGender;
    this.playerPosition = data.playerPosition;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a252f);

    // Create header
    this.createHeader();

    // Create conversation area
    this.createConversationArea();

    // Create input area
    this.createInputArea();

    // Initialize AI session
    this.initializeAISession();
  }

  private createHeader(): void {
    const { width } = this.cameras.main;

    // Header background
    const headerBg = this.add.rectangle(width / 2, 60, width, 120, 0x2c3e50);
    headerBg.setDepth(1);

    // NPC info
    const npcSprite = this.add.sprite(80, 60, `simulator-${this.playerGender}-npc-bar`);
    npcSprite.setScale(1.2);
    npcSprite.setDepth(2);

    const npcName = this.add.text(140, 40, this.scenario.npc.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    npcName.setDepth(2);

    const npcRole = this.add.text(140, 70, this.scenario.npc.role, {
      fontSize: '14px',
      color: '#bdc3c7',
      fontFamily: 'Arial, sans-serif'
    });
    npcRole.setDepth(2);

    // End conversation button
    this.endButton = this.add.text(width - 20, 60, 'END CONVERSATION', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#e74c3c',
      padding: { x: 12, y: 8 },
      fontFamily: 'Arial, sans-serif'
    });
    this.endButton.setOrigin(1, 0.5);
    this.endButton.setDepth(2);
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

    // Conversation background
    const conversationBg = this.add.rectangle(
      width / 2,
      height / 2 + 20,
      width - 40,
      height - 300,
      0x34495e
    );
    conversationBg.setDepth(1);

    // Create scrollable container for messages
    this.conversationContainer = this.add.container(0, 0);
    this.conversationContainer.setDepth(2);

    // Add initial NPC greeting
    this.addMessage('npc', `Hello! I'm ${this.scenario.npc.name}. ${this.scenario.scenario.setting}`);
  }

  private createInputArea(): void {
    const { width, height } = this.cameras.main;

    // Input background
    const inputBg = this.add.rectangle(width / 2, height - 80, width - 40, 120, 0x2c3e50);
    inputBg.setDepth(1);

    // Create DOM element for text input
    const inputElement = document.createElement('textarea');
    inputElement.style.width = '600px';
    inputElement.style.height = '60px';
    inputElement.style.fontSize = '16px';
    inputElement.style.padding = '10px';
    inputElement.style.border = '2px solid #7f2be6';
    inputElement.style.borderRadius = '8px';
    inputElement.style.backgroundColor = '#ffffff';
    inputElement.style.color = '#2c3e50';
    inputElement.style.fontFamily = 'Arial, sans-serif';
    inputElement.style.resize = 'none';
    inputElement.placeholder = 'Type your response here...';

    this.inputText = this.add.dom(width / 2 - 100, height - 80, inputElement);
    this.inputText.setDepth(2);

    // Send button
    this.sendButton = this.add.text(width / 2 + 220, height - 80, 'SEND', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#7f2be6',
      padding: { x: 20, y: 15 },
      fontFamily: 'Arial, sans-serif'
    });
    this.sendButton.setOrigin(0.5);
    this.sendButton.setDepth(2);
    this.sendButton.setInteractive({ useHandCursor: true });

    this.sendButton.on('pointerover', () => {
      this.sendButton.setStyle({ backgroundColor: '#6c2bd9' });
    });

    this.sendButton.on('pointerout', () => {
      this.sendButton.setStyle({ backgroundColor: '#7f2be6' });
    });

    this.sendButton.on('pointerup', () => {
      this.sendMessage();
    });

    // Loading indicator
    this.loadingText = this.add.text(width / 2, height - 40, 'AI is thinking...', {
      fontSize: '14px',
      color: '#bdc3c7',
      fontFamily: 'Arial, sans-serif'
    });
    this.loadingText.setOrigin(0.5);
    this.loadingText.setDepth(2);
    this.loadingText.setVisible(false);

    // Handle keyboard events for input
    inputElement.addEventListener('keydown', (event) => {
      // Prevent Phaser from capturing WASD and other keys when typing
      event.stopPropagation();

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    });

    // Also prevent keyup events from being captured by Phaser
    inputElement.addEventListener('keyup', (event) => {
      event.stopPropagation();
    });

    // Prevent Phaser input when focused on textarea
    inputElement.addEventListener('focus', () => {
      // Disable Phaser keyboard input when textarea is focused
      if (this.input.keyboard) {
        this.input.keyboard.enabled = false;
      }
    });

    inputElement.addEventListener('blur', () => {
      // Re-enable Phaser keyboard input when textarea loses focus
      if (this.input.keyboard) {
        this.input.keyboard.enabled = true;
      }
    });
  }

  private addMessage(role: 'player' | 'npc', content: string): void {
    const { width } = this.cameras.main;
    const messageY = 140 + (this.conversationHistory.length * 80);

    // Message background
    const isPlayer = role === 'player';
    const bgColor = isPlayer ? 0x7f2be6 : 0x95a5a6;
    const textColor = '#ffffff';
    const alignX = isPlayer ? width - 60 : 60;
    const originX = isPlayer ? 1 : 0;

    const messageBg = this.add.rectangle(alignX, messageY, width * 0.7, 60, bgColor);
    messageBg.setOrigin(originX, 0);
    messageBg.setDepth(2);

    // Message text
    const messageText = this.add.text(alignX + (isPlayer ? -20 : 20), messageY + 10, content, {
      fontSize: '14px',
      color: textColor,
      fontFamily: 'Arial, sans-serif',
      wordWrap: { width: width * 0.6 }
    });
    messageText.setOrigin(isPlayer ? 1 : 0, 0);
    messageText.setDepth(3);

    // Add to conversation container
    this.conversationContainer.add([messageBg, messageText]);

    // Add to history
    this.conversationHistory.push({ role, content });

    // Scroll to bottom
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    // Simple scroll implementation - move container up if messages exceed viewport
    const { height } = this.cameras.main;
    const maxVisibleMessages = Math.floor((height - 300) / 80);

    if (this.conversationHistory.length > maxVisibleMessages) {
      const scrollOffset = (this.conversationHistory.length - maxVisibleMessages) * 80;
      this.conversationContainer.setY(-scrollOffset);
    }
  }

  private async initializeAISession(): Promise<void> {
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
      this.sessionId = data.sessionId;
    } catch (error) {
      console.error('Failed to initialize AI session:', error);
      this.addMessage('npc', 'Sorry, there was an error connecting to the conversation system.');
    }
  }

  private async sendMessage(): Promise<void> {
    if (this.isLoading || this.conversationComplete) return;

    const inputElement = this.inputText.node as HTMLTextAreaElement;
    const message = inputElement.value.trim();

    if (!message || !this.sessionId) return;

    // Clear input
    inputElement.value = '';

    // Add player message
    this.addMessage('player', message);

    // Show loading
    this.setLoading(true);

    try {
      const response = await fetch(`/api/ai-scenarios/session/${this.sessionId}/turns`, {
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
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Add NPC response
      this.addMessage('npc', data.response.npcReply);

      // Check if conversation is complete
      if (data.response.conversationComplete) {
        this.conversationComplete = true;
        this.endButton.setText('RETURN TO GAME');

        // Show completion message
        this.addMessage('npc', `Conversation ended: ${data.response.conversationCompleteReason || 'Natural conclusion'}`);

        // Disable input
        inputElement.disabled = true;
        this.sendButton.setStyle({ backgroundColor: '#95a5a6' });
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      this.addMessage('npc', 'Sorry, I had trouble understanding that. Could you try again?');
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.loadingText.setVisible(loading);
    this.sendButton.setStyle({
      backgroundColor: loading ? '#95a5a6' : '#7f2be6'
    });
  }

  private endConversation(): void {
    // Return to game
    this.scene.start('GameScene', {
      playerGender: this.playerGender,
      preservedPosition: this.playerPosition
    });
  }
}