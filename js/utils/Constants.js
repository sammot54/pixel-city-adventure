// Game Constants
const CONSTANTS = {
    // Canvas settings
    CANVAS_WIDTH: 1024,
    CANVAS_HEIGHT: 768,
    
    // Tile settings
    TILE_SIZE: 32,
    TILES_X: 32,
    TILES_Y: 24,
    
    // Game settings
    FPS: 60,
    FRAME_TIME: 1000 / 60,
    
    // Player settings
    PLAYER_SPEED: 120, // pixels per second
    PLAYER_SIZE: 32,
    
    // Character stats
    BASE_HP: 100,
    BASE_XP_TO_LEVEL: 100,
    
    // Scene types
    SCENES: {
        MENU: 'menu',
        CHARACTER_SELECT: 'character_select',
        GAME: 'game',
        BATTLE: 'battle'
    },
    
    // Character types
    CHARACTERS: {
        ADVENTURER: {
            id: 'adventurer',
            name: 'The Adventurer',
            baseStats: {
                streetSmarts: 15,
                charisma: 12,
                athletics: 18,
                techSavvy: 8,
                creativity: 10
            },
            color: '#4299e1'
        },
        SCHOLAR: {
            id: 'scholar',
            name: 'The Scholar',
            baseStats: {
                streetSmarts: 20,
                charisma: 14,
                athletics: 8,
                techSavvy: 18,
                creativity: 12
            },
            color: '#9f7aea'
        },
        ARTIST: {
            id: 'artist',
            name: 'The Artist',
            baseStats: {
                streetSmarts: 10,
                charisma: 18,
                athletics: 12,
                techSavvy: 14,
                creativity: 20
            },
            color: '#ed8936'
        },
        ATHLETE: {
            id: 'athlete',
            name: 'The Athlete',
            baseStats: {
                streetSmarts: 12,
                charisma: 16,
                athletics: 20,
                techSavvy: 8,
                creativity: 10
            },
            color: '#38a169'
        }
    },
    
    // Mission types
    MISSION_TYPES: {
        DELIVERY: 'delivery',
        INVESTIGATION: 'investigation',
        SOCIAL: 'social'
    },
    
    // Battle moves
    BATTLE_MOVES: {
        DEBATE: {
            name: 'Debate',
            stat: 'streetSmarts',
            baseDamage: 15,
            description: 'Use logic and facts to win the argument'
        },
        CHARM: {
            name: 'Charm',
            stat: 'charisma',
            baseDamage: 12,
            description: 'Win them over with your personality'
        },
        CHALLENGE: {
            name: 'Physical Challenge',
            stat: 'athletics',
            baseDamage: 18,
            description: 'Settle it with physical prowess'
        },
        HACK: {
            name: 'Tech Solution',
            stat: 'techSavvy',
            baseDamage: 14,
            description: 'Use technology to gain an advantage'
        },
        INSPIRE: {
            name: 'Creative Solution',
            stat: 'creativity',
            baseDamage: 16,
            description: 'Think outside the box'
        }
    },
    
    // Audio
    AUDIO: {
        MASTER_VOLUME: 0.7,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8
    },
    
    // Controls
    CONTROLS: {
        UP: ['ArrowUp', 'w', 'W'],
        DOWN: ['ArrowDown', 's', 'S'],
        LEFT: ['ArrowLeft', 'a', 'A'],
        RIGHT: ['ArrowRight', 'd', 'D'],
        INTERACT: [' ', 'Enter'],
        INVENTORY: ['i', 'I'],
        MENU: ['Escape']
    },
    
    // Colors
    COLORS: {
        PRIMARY: '#4299e1',
        SECONDARY: '#9f7aea',
        SUCCESS: '#38a169',
        WARNING: '#ed8936',
        DANGER: '#e53e3e',
        BACKGROUND: '#1a202c',
        SURFACE: '#2d3748',
        TEXT: '#e2e8f0'
    },
    
    // Districts
    DISTRICTS: {
        DOWNTOWN_CORE: {
            id: 'downtown_core',
            name: 'Downtown Core',
            color: '#4299e1',
            music: 'downtown_theme.mp3'
        }
    },
    
    // Storage keys
    STORAGE: {
        SAVE_GAME: 'pixelCityAdventure_saveGame',
        SETTINGS: 'pixelCityAdventure_settings'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSTANTS;
}