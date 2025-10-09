import * as Phaser from 'phaser';

export interface ConversationInputLayout {
  isMobile: boolean;
  isTablet: boolean;
  width: number;
  inputBgWidth: number;
  inputBgHeight: number;
  inputCenterY: number;
  inputPadding: number;
  messageLeft: number;
}

export interface ConversationInputRefs {
  background: Phaser.GameObjects.Rectangle;
  domElement: Phaser.GameObjects.DOMElement;
  sendButton: Phaser.GameObjects.Text;
}

type SubmitHandler = () => void;

export class ConversationInput {
  private readonly scene: Phaser.Scene;
  private readonly onSubmit: SubmitHandler;
  private readonly defaultPlaceholder: string;
  private background!: Phaser.GameObjects.Rectangle;
  private dom!: Phaser.GameObjects.DOMElement;
  private sendButton!: Phaser.GameObjects.Text;
  private styleElement?: HTMLStyleElement;

  constructor(scene: Phaser.Scene, placeholder: string, onSubmit: SubmitHandler) {
    this.scene = scene;
    this.onSubmit = onSubmit;
    this.defaultPlaceholder = placeholder;
  }

  create(initialRefs: ConversationInputRefs): void {
    this.background = initialRefs.background;
    this.dom = initialRefs.domElement;
    this.sendButton = initialRefs.sendButton;
    this.ensureFocusStyle();
    this.setupInteractions();
  }

  updateLayout(layout: ConversationInputLayout): void {
    const {
      isMobile,
      isTablet,
      width,
      inputBgWidth,
      inputBgHeight,
      inputCenterY,
      inputPadding,
      messageLeft
    } = layout;

    const alignedLeft = messageLeft ?? (width / 2 - inputBgWidth / 2 + inputPadding);

    if (this.background) {
      this.background.setSize(inputBgWidth, inputBgHeight);
      this.background.setPosition(width / 2, inputCenterY);
    }

    const inputElement = this.getTextarea();
    if (!inputElement || !this.dom || !this.sendButton) {
      return;
    }

    if (isMobile) {
      const inputFieldWidth = Math.max(160, inputBgWidth - inputPadding * 2);
      const inputFieldHeight = 80;
      inputElement.style.width = `${inputFieldWidth}px`;
      inputElement.style.height = `${inputFieldHeight}px`;
      this.dom.setPosition(messageLeft + inputPadding * 2.5, inputCenterY - inputBgHeight / 2 + inputPadding + inputFieldHeight / 2 - 20);

      this.sendButton.setFontSize(16);
      this.sendButton.setPadding(20, 12, 20, 12);
      const mobileButtonWidth = Math.max(this.sendButton.displayWidth, inputFieldWidth);
      this.sendButton.setPosition(width / 2, inputCenterY + inputBgHeight / 2 - 30);
      this.sendButton.setOrigin(0.5);
    } else {
      const availableWidth = inputBgWidth - inputPadding * 2;
      const singleColumn = availableWidth < 520;
      const gapBetween = singleColumn ? 16 : 20;
      const buttonTargetWidth = singleColumn ? Math.min(220, availableWidth - gapBetween * 2) : Math.min(180, availableWidth * 0.32);
      const inputFieldWidth = singleColumn
        ? Math.max(280, availableWidth - gapBetween * 2)
        : Math.max(280, availableWidth - buttonTargetWidth - gapBetween);
      const inputFieldHeight = 60;

      inputElement.style.width = `${inputFieldWidth}px`;
      inputElement.style.height = `${inputFieldHeight}px`;

      if (singleColumn) {
        const rowTop = inputCenterY - inputFieldHeight / 2;
        this.dom.setPosition(messageLeft + inputPadding * 2, rowTop + inputFieldHeight / 2);

        this.sendButton.setFontSize(isTablet ? 16 : 18);
        this.sendButton.setPadding(24, 14, 24, 14);
        const buttonWidth = Math.max(buttonTargetWidth, this.sendButton.displayWidth);
        const buttonHeight = this.sendButton.displayHeight;
        this.sendButton.setPosition(width / 2, inputCenterY + inputFieldHeight / 2 + gapBetween + buttonHeight / 2);
        this.sendButton.setOrigin(0.5);
      } else {
        const inputLeft = alignedLeft;
        this.dom.setPosition(messageLeft + inputPadding * 2, inputCenterY);

        this.sendButton.setFontSize(isTablet ? 16 : 18);
        this.sendButton.setPadding(24, 14, 24, 14);
        const buttonWidth = Math.max(buttonTargetWidth, this.sendButton.displayWidth);
        const buttonX = inputLeft + inputFieldWidth + gapBetween + buttonWidth / 2;
        this.sendButton.setPosition(buttonX, inputCenterY);
        this.sendButton.setOrigin(0.5);
      }
    }
  }

  setEnabled(enabled: boolean, placeholder?: string): void {
    const textarea = this.getTextarea();
    if (textarea) {
      textarea.disabled = !enabled;
      textarea.placeholder = placeholder ?? (enabled ? this.defaultPlaceholder : 'Loading...');
    }

    if (this.sendButton) {
      if (enabled) {
        this.sendButton.setAlpha(1);
        this.sendButton.setInteractive({ useHandCursor: true });
        this.sendButton.setStyle({ backgroundColor: '#7f2be6' });
      } else {
        this.sendButton.setAlpha(0.75);
        this.sendButton.disableInteractive();
        this.sendButton.setStyle({ backgroundColor: '#95a5a6' });
      }
    }
  }

  setLoading(isLoading: boolean): void {
    if (this.sendButton && this.sendButton.input) {
      this.sendButton.setStyle({
        backgroundColor: isLoading ? '#95a5a6' : '#7f2be6'
      });
    }
  }

  getValue(): string {
    const textarea = this.getTextarea();
    return textarea ? textarea.value : '';
  }

  clearValue(): void {
    const textarea = this.getTextarea();
    if (textarea) {
      textarea.value = '';
    }
  }

  focus(): void {
    // focus no-op to avoid triggering browser focus styles
  }

  blur(): void {
    const textarea = this.getTextarea();
    if (textarea) {
      textarea.blur();
    }
  }

  getTextarea(): HTMLTextAreaElement | undefined {
    return this.dom?.node as HTMLTextAreaElement | undefined;
  }

  getSendButton(): Phaser.GameObjects.Text | undefined {
    return this.sendButton;
  }

  getBackground(): Phaser.GameObjects.Rectangle | undefined {
    return this.background;
  }

  getDomElement(): Phaser.GameObjects.DOMElement | undefined {
    return this.dom;
  }

  private setupInteractions(): void {
    const textarea = this.getTextarea();
    if (!textarea || !this.sendButton) return;

    this.sendButton.setInteractive({ useHandCursor: true });

    this.sendButton.on('pointerover', () => {
      if (!this.sendButton.input?.enabled) return;
      this.sendButton.setStyle({ backgroundColor: '#6c2bd9' });
    });

    this.sendButton.on('pointerout', () => {
      if (!this.sendButton.input?.enabled) return;
      this.sendButton.setStyle({ backgroundColor: '#7f2be6' });
    });

    this.sendButton.on('pointerup', () => {
      this.onSubmit();
    });

    textarea.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.onSubmit();
      }
    });

    textarea.addEventListener('keyup', (event) => {
      event.stopPropagation();
    });

    textarea.addEventListener('focus', () => {});

    textarea.addEventListener('blur', () => {});
  }

  private ensureFocusStyle(): void {
    if (this.styleElement || typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      textarea:focus {
        outline: none !important;
        box-shadow: none !important;
        border-color: inherit !important;
      }
    `;
    document.head.appendChild(style);
    this.styleElement = style;
  }
}
