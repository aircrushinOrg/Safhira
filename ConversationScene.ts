/**
 * This file defines the ConversationScene class for a Phaser-based game.
 * It handles AI-powered conversations between the player and NPCs,
 * using the scenario templates and AI API for dynamic responses.
 * 
 * Updated to use pure DOM elements for the conversation interface.
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
  private isLoading = false;
  private conversationComplete = false;
  private thinkingMessageElement: HTMLDivElement | null = null;
  private isRebuilding = false;

  // DOM elements
  private conversationUI!: HTMLDivElement;
  private chatContainer!: HTMLDivElement;
  private inputContainer!: HTMLDivElement;
  private headerContainer!: HTMLDivElement;

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

    // Create the complete conversation UI as a DOM overlay
    this.createConversationUI();

    // Initialize AI session
    this.initializeAISession();

    // Add resize listener to handle screen size changes
    this.scale.on('resize', this.handleResize, this);
  }

  private createConversationUI(): void {
    const { width, height } = this.cameras.main;

    // Create main conversation UI container
    this.conversationUI = document.createElement('div');
    this.conversationUI.id = 'conversation-ui';
    this.conversationUI.style.position = 'fixed';
    this.conversationUI.style.top = '0';
    this.conversationUI.style.left = '0';
    this.conversationUI.style.width = '100vw';
    this.conversationUI.style.height = '100vh';
    this.conversationUI.style.zIndex = '1000';
    this.conversationUI.style.display = 'flex';
    this.conversationUI.style.flexDirection = 'column';
    this.conversationUI.style.fontFamily = '"Press Start 2P", monospace';

    // Create header
    this.createHeader();

    // Create conversation area
    this.createConversationArea();

    // Create input area
    this.createInputArea();

    // Add to DOM
    document.body.appendChild(this.conversationUI);
  }

  private createHeader(): void {
    const { width } = this.cameras.main;

    // Header container
    this.headerContainer = document.createElement('div');
    this.headerContainer.style.display = 'flex';
    this.headerContainer.style.alignItems = 'center';
    this.headerContainer.style.justifyContent = 'space-between';
    this.headerContainer.style.padding = '20px';
    this.headerContainer.style.backgroundColor = '#2c3e50';
    this.headerContainer.style.borderBottom = '2px solid #7f2be6';
    this.headerContainer.style.minHeight = '80px';

    // NPC info section
    const npcInfo = document.createElement('div');
    npcInfo.style.display = 'flex';
    npcInfo.style.alignItems = 'center';
    npcInfo.style.gap = '20px';

    // NPC sprite placeholder (you can replace this with actual sprite if needed)
    const npcSprite = document.createElement('div');
    npcSprite.style.width = '60px';
    npcSprite.style.height = '60px';
    npcSprite.style.backgroundColor = '#7f2be6';
    npcSprite.style.borderRadius = '8px';
    npcSprite.style.display = 'flex';
    npcSprite.style.alignItems = 'center';
    npcSprite.style.justifyContent = 'center';
    npcSprite.style.color = '#ffffff';
    npcSprite.style.fontSize = '12px';
    npcSprite.textContent = 'NPC';

    // NPC text info
    const npcText = document.createElement('div');
    npcText.style.display = 'flex';
    npcText.style.flexDirection = 'column';
    npcText.style.gap = '5px';

    const npcName = document.createElement('div');
    npcName.textContent = this.scenario.npc.name;
    npcName.style.color = '#ffffff';
    npcName.style.fontSize = width < 600 ? '16px' : '20px';
    npcName.style.fontWeight = 'bold';

    const npcRole = document.createElement('div');
    npcRole.textContent = this.scenario.npc.role;
    npcRole.style.color = '#bdc3c7';
    npcRole.style.fontSize = width < 600 ? '10px' : '12px';

    npcText.appendChild(npcName);
    npcText.appendChild(npcRole);
    npcInfo.appendChild(npcSprite);
    npcInfo.appendChild(npcText);

    // End conversation button
    const endButton = document.createElement('button');
    endButton.textContent = 'END CONVERSATION';
    endButton.style.padding = '12px 20px';
    endButton.style.backgroundColor = '#e74c3c';
    endButton.style.color = '#ffffff';
    endButton.style.border = 'none';
    endButton.style.borderRadius = '8px';
    endButton.style.fontSize = width < 600 ? '12px' : '14px';
    endButton.style.fontFamily = '"Press Start 2P", monospace';
    endButton.style.cursor = 'pointer';
    endButton.style.transition = 'background-color 0.2s';

    endButton.addEventListener('mouseenter', () => {
      endButton.style.backgroundColor = '#c0392b';
    });

    endButton.addEventListener('mouseleave', () => {
      endButton.style.backgroundColor = '#e74c3c';
    });

    endButton.addEventListener('click', () => {
      this.endConversation();
    });

    this.headerContainer.appendChild(npcInfo);
    this.headerContainer.appendChild(endButton);
    this.conversationUI.appendChild(this.headerContainer);

    // Store reference for Phaser compatibility
    this.endButton = this.add.text(0, 0, '', { fontSize: '1px' }); // Dummy Phaser text object
  }

  private createConversationArea(): void {
    const { width, height } = this.cameras.main;

    // Chat container
    this.chatContainer = document.createElement('div');
    this.chatContainer.id = 'chat-container';
    this.chatContainer.style.flex = '1';
    this.chatContainer.style.padding = '20px';
    this.chatContainer.style.backgroundColor = 'rgba(52, 73, 94, 0.95)';
    this.chatContainer.style.overflowY = 'auto';
    this.chatContainer.style.display = 'flex';
    this.chatContainer.style.flexDirection = 'column';
    this.chatContainer.style.gap = '12px';
    this.chatContainer.style.fontFamily = '"VT323", monospace';
    this.chatContainer.style.fontSize = width < 600 ? '18px' : '24px';
    this.chatContainer.style.lineHeight = '1.4';

    // Add initial NPC greeting only if conversation history is empty
    if (this.conversationHistory.length === 0) {
      this.addMessage('npc', `Hello! I'm ${this.scenario.npc.name}.`);
    }

    this.conversationUI.appendChild(this.chatContainer);
  }

  private createInputArea(): void {
    const { width, height } = this.cameras.main;

    // Input container
    this.inputContainer = document.createElement('div');
    this.inputContainer.style.display = 'flex';
    this.inputContainer.style.alignItems = 'center';
    this.inputContainer.style.gap = '15px';
    this.inputContainer.style.padding = '20px';
    this.inputContainer.style.backgroundColor = '#2c3e50';
    this.inputContainer.style.borderTop = '2px solid #7f2be6';

    // Text input
    const inputElement = document.createElement('textarea');
    inputElement.style.flex = '1';
    inputElement.style.minHeight = '60px';
    inputElement.style.maxHeight = '120px';
    inputElement.style.padding = '12px';
    inputElement.style.border = '2px solid #7f2be6';
    inputElement.style.borderRadius = '8px';
    inputElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    inputElement.style.color = '#ffffff';
    inputElement.style.fontFamily = '"VT323", monospace';
    inputElement.style.fontSize = width < 600 ? '18px' : '22px';
    inputElement.style.resize = 'vertical';
    inputElement.style.outline = 'none';
    inputElement.placeholder = 'Type your response here...';

    // Auto-resize textarea
    inputElement.addEventListener('input', () => {
      inputElement.style.height = 'auto';
      inputElement.style.height = Math.min(inputElement.scrollHeight, 120) + 'px';
    });

    // Send button
    const sendButton = document.createElement('button');
    sendButton.textContent = 'SEND';
    sendButton.style.padding = '15px 25px';
    sendButton.style.backgroundColor = '#7f2be6';
    sendButton.style.color = '#ffffff';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '8px';
    sendButton.style.fontSize = width < 600 ? '14px' : '16px';
    sendButton.style.fontFamily = '"Press Start 2P", monospace';
    sendButton.style.cursor = 'pointer';
    sendButton.style.transition = 'background-color 0.2s';
    sendButton.style.whiteSpace = 'nowrap';

    sendButton.addEventListener('mouseenter', () => {
      if (!this.isLoading) {
        sendButton.style.backgroundColor = '#6c2bd9';
      }
    });

    sendButton.addEventListener('mouseleave', () => {
      if (!this.isLoading) {
        sendButton.style.backgroundColor = '#7f2be6';
      }
    });

    sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

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

    this.inputContainer.appendChild(inputElement);
    this.inputContainer.appendChild(sendButton);
    this.conversationUI.appendChild(this.inputContainer);

    // Store references for compatibility
    this.inputText = this.add.dom(0, 0, inputElement);
    this.sendButton = this.add.text(0, 0, '', { fontSize: '1px' }); // Dummy Phaser text object
  }

  private addMessage(role: 'player' | 'npc', content: string): void {
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.justifyContent = role === 'player' ? 'flex-end' : 'flex-start';
    messageContainer.style.marginBottom = '8px';

    // Create message bubble
    const messageBubble = document.createElement('div');
    messageBubble.style.maxWidth = '75%';
    messageBubble.style.borderRadius = '12px';
    messageBubble.style.padding = '12px 16px';
    messageBubble.style.color = '#ffffff';
    messageBubble.style.fontFamily = '"VT323", monospace';
    messageBubble.style.fontSize = 'inherit';
    messageBubble.style.lineHeight = '1.4';
    messageBubble.style.wordWrap = 'break-word';
    messageBubble.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';

    if (role === 'player') {
      messageBubble.style.backgroundColor = '#7f2be6';
      messageBubble.style.marginLeft = 'auto';
    } else {
      messageBubble.style.backgroundColor = '#95a5a6';
      messageBubble.style.marginRight = 'auto';
    }

    // Create role label
    const roleLabel = document.createElement('div');
    roleLabel.style.fontSize = '0.75em';
    roleLabel.style.textTransform = 'uppercase';
    roleLabel.style.letterSpacing = '0.05em';
    roleLabel.style.marginBottom = '4px';
    roleLabel.style.opacity = '0.8';
    roleLabel.textContent = role === 'player' ? 'You' : 'NPC';

    // Create message text
    const messageText = document.createElement('div');
    messageText.textContent = content;
    messageText.style.whiteSpace = 'pre-wrap';

    // Assemble message
    messageBubble.appendChild(roleLabel);
    messageBubble.appendChild(messageText);
    messageContainer.appendChild(messageBubble);

    // Add to chat container
    this.chatContainer.appendChild(messageContainer);

    // Add to history
    this.conversationHistory.push({ role, content });

    // Scroll to bottom
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    // Smooth scroll to bottom
    this.chatContainer.scrollTo({
      top: this.chatContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  private addThinkingMessage(): void {
    // Create thinking message container
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.justifyContent = 'flex-start';
    messageContainer.style.marginBottom = '8px';

    // Create thinking message bubble (NPC style)
    const messageBubble = document.createElement('div');
    messageBubble.style.maxWidth = '75%';
    messageBubble.style.borderRadius = '12px';
    messageBubble.style.padding = '12px 16px';
    messageBubble.style.color = '#ffffff';
    messageBubble.style.fontFamily = '"VT323", monospace';
    messageBubble.style.fontSize = 'inherit';
    messageBubble.style.lineHeight = '1.4';
    messageBubble.style.wordWrap = 'break-word';
    messageBubble.style.backgroundColor = '#95a5a6';
    messageBubble.style.marginRight = 'auto';
    messageBubble.style.opacity = '0.8';
    messageBubble.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';

    // Create role label
    const roleLabel = document.createElement('div');
    roleLabel.style.fontSize = '0.75em';
    roleLabel.style.textTransform = 'uppercase';
    roleLabel.style.letterSpacing = '0.05em';
    roleLabel.style.marginBottom = '4px';
    roleLabel.style.opacity = '0.8';
    roleLabel.textContent = 'NPC';

    // Create thinking text with animation
    const messageText = document.createElement('div');
    messageText.textContent = `${this.scenario.npc.name} is thinking...`;

    // Add CSS animation for pulsing effect
    messageBubble.style.animation = 'pulse 1.5s ease-in-out infinite alternate';

    // Add keyframes for pulse animation
    if (!document.getElementById('thinking-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'thinking-animation-styles';
      style.textContent = `
        @keyframes pulse {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Assemble message
    messageBubble.appendChild(roleLabel);
    messageBubble.appendChild(messageText);
    messageContainer.appendChild(messageBubble);

    // Add to chat container
    this.chatContainer.appendChild(messageContainer);

    // Store reference
    this.thinkingMessageElement = messageContainer;

    // Scroll to bottom
    this.scrollToBottom();
  }

  private removeThinkingMessage(): void {
    if (this.thinkingMessageElement && this.thinkingMessageElement.parentNode) {
      this.thinkingMessageElement.parentNode.removeChild(this.thinkingMessageElement);
      this.thinkingMessageElement = null;
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

    // Clear input and reset height
    inputElement.value = '';
    inputElement.style.height = 'auto';

    // Add player message
    this.addMessage('player', message);

    // Show thinking message
    this.addThinkingMessage();
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

      // Remove thinking message and add NPC response
      this.removeThinkingMessage();
      this.addMessage('npc', data.response.npcReply);

      // Check if conversation is complete
      if (data.response.conversationComplete) {
        this.conversationComplete = true;
        
        // Update end button text
        const endButton = this.headerContainer.querySelector('button') as HTMLButtonElement;
        if (endButton) {
          endButton.textContent = 'RETURN TO GAME';
        }

        // Show completion message
        this.addMessage('npc', `Conversation ended: ${data.response.conversationCompleteReason || 'Natural conclusion'}`);

        // Disable input
        const textarea = this.inputContainer.querySelector('textarea') as HTMLTextAreaElement;
        const sendBtn = this.inputContainer.querySelector('button') as HTMLButtonElement;
        if (textarea) textarea.disabled = true;
        if (sendBtn) {
          sendBtn.disabled = true;
          sendBtn.style.backgroundColor = '#95a5a6';
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove thinking message and add error message
      this.removeThinkingMessage();
      this.addMessage('npc', 'Sorry, I had trouble understanding that. Could you try again?');
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    const sendButton = this.inputContainer.querySelector('button') as HTMLButtonElement;
    if (sendButton) {
      sendButton.style.backgroundColor = loading ? '#95a5a6' : '#7f2be6';
      sendButton.disabled = loading;
    }
  }

  private handleResize(): void {
    const { width, height } = this.cameras.main;

    // Update font sizes in DOM elements
    if (this.chatContainer) {
      this.chatContainer.style.fontSize = width < 600 ? '18px' : '24px';
    }

    // Update header font sizes
    const npcName = this.headerContainer.querySelector('div > div:first-child') as HTMLElement;
    const npcRole = this.headerContainer.querySelector('div > div:last-child') as HTMLElement;
    const endButton = this.headerContainer.querySelector('button') as HTMLElement;
    
    if (npcName) npcName.style.fontSize = width < 600 ? '16px' : '20px';
    if (npcRole) npcRole.style.fontSize = width < 600 ? '10px' : '12px';
    if (endButton) endButton.style.fontSize = width < 600 ? '12px' : '14px';

    // Update input area font sizes
    const textarea = this.inputContainer.querySelector('textarea') as HTMLElement;
    const sendBtn = this.inputContainer.querySelector('button') as HTMLElement;
    
    if (textarea) textarea.style.fontSize = width < 600 ? '18px' : '22px';
    if (sendBtn) sendBtn.style.fontSize = width < 600 ? '14px' : '16px';

    // Update background scaling (Phaser elements)
    this.updatePhaserElements();
  }

  private updatePhaserElements(): void {
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
  }

  private endConversation(): void {
    // Return to game
    this.scene.start('GameScene', {
      playerGender: this.playerGender,
      preservedPosition: this.playerPosition
    });
  }

  destroy(): void {
    // Clean up DOM elements
    if (this.conversationUI && this.conversationUI.parentNode) {
      this.conversationUI.parentNode.removeChild(this.conversationUI);
    }

    // Clean up CSS styles
    const thinkingStyles = document.getElementById('thinking-animation-styles');
    if (thinkingStyles && thinkingStyles.parentNode) {
      thinkingStyles.parentNode.removeChild(thinkingStyles);
    }

    // Clean up resize listener
    this.scale.off('resize', this.handleResize, this);
    super.destroy();
  }
}