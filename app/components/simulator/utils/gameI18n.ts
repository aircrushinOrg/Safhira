export type GameTranslations = {
  preload: {
    loading: string;
  };
  title: {
    subtitle: string;
    start: string;
    instructions: string;
  };
  gender: {
    title: string;
    boy: string;
    girl: string;
    back: string;
  };
  instruction: {
    title: string;
    sections: {
      movement: {
        title: string;
        keyboard: string;
        keyboardShortened?: string;
        touch: string;
        touchShortened?: string;
      };
      interaction: {
        title: string;
        keyboard: string;
        keyboardShortened?: string;
        touch: string;
        touchShortened?: string;
      };
      minimap: {
        title: string;
        description: string;
      };
    };
    back: string;
  };
  game: {
    menu: string;
  };
};

const defaultTranslations: GameTranslations = {
  preload: {
    loading: 'Loading...',
  },
  title: {
    subtitle: 'SIMULATION GAME',
    start: 'START GAME',
    instructions: 'INSTRUCTIONS',
  },
  gender: {
    title: 'SELECT GENDER',
    boy: 'BOY',
    girl: 'GIRL',
    back: 'BACK TO TITLE',
  },
  instruction: {
    title: 'HOW TO PLAY',
    sections: {
      movement: {
        title: 'MOVEMENT',
        keyboard:
          '* W / UP key : Move up \n* S / DOWN key : Move down \n* A / LEFT key : Move left \n* D / RIGHT key : Move right',
        keyboardShortened:
          '* Use WASD or Arrow keys to move \n* Move in four directions: Up, Down, Left, Right \n*Walk up to NPCs to interact',
        touch:
          '* Drag the joystick to move your character \n* Move in four directions: Up, Down, Left, Right \n* Release to stop moving',
        touchShortened:
          '* Drag joystick to move \n* Move in four directions: Up, Down, Left, Right \n*Walk up to NPCs to interact',
      },
      interaction: {
        title: 'INTERACTION',
        keyboard:
          '* Walk up to NPCs and press SPACE / ENTER to interact \n* Different NPCs have different scenarios',
        keyboardShortened:
          '* Press SPACE / ENTER to interact with NPCs \n* Different NPCs have different scenarios',
        touch:
          '* Walk up to NPCs and tap on them to interact \n* Different NPCs have different scenarios',
        touchShortened:
          '* Tap on NPCs to interact \n* Different NPCs have different scenarios',
      },
      minimap: {
        title: 'MINIMAP',
        description:
          '* Minimap in top-left shows your surroundings \n* Red dot: Your character \n* Yellow dot: NPCs \n* Green rectangle: Your current view area',
      },
    },
    back: 'BACK TO TITLE',
  },
  game: {
    menu: 'MENU'
  },
};

let currentTranslations: GameTranslations = defaultTranslations;

export function setGameTranslations(translations: GameTranslations) {
  currentTranslations = translations;
}

export function getGameTranslations(): GameTranslations {
  return currentTranslations;
}
