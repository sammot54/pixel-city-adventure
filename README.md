# Pixel City Adventure

A complete Pokemon-inspired city adventure game built with HTML5 Canvas and vanilla JavaScript. Explore a pixel art city, level up your character, complete missions, and engage in turn-based battles!

![Game Screenshot](https://github.com/user-attachments/assets/49a020c1-6875-4b7b-bdb0-0ed0f9603428)

## 🎮 Game Features

### ✨ Core Gameplay
- **Character Selection**: Choose from 4 unique character types (Adventurer, Scholar, Artist, Athlete)
- **City Exploration**: Navigate a tile-based city environment with buildings, roads, and NPCs
- **Turn-based Battles**: Engage in Pokemon-style debates, challenges, and competitions
- **Mission System**: Complete delivery, investigation, and social missions
- **Inventory Management**: Collect and use items throughout your adventure
- **Experience & Leveling**: Gain XP, level up, and distribute stat points

### 🎯 Character System
Each character type has unique base stats affecting their performance:

- **The Adventurer**: High Athletics (18), balanced explorer
- **The Scholar**: High Street Smarts (20) and Tech Savvy (18), intellectual approach  
- **The Artist**: High Creativity (20) and Charisma (18), creative solutions
- **The Athlete**: High Athletics (20) and Charisma (16), physical prowess

### ⚔️ Battle System
Turn-based encounters with 5 different move types:
- **Debate**: Use Street Smarts to win arguments with logic and facts
- **Charm**: Use Charisma to win people over with personality
- **Physical Challenge**: Use Athletics to settle disputes with physical prowess
- **Tech Solution**: Use Tech Savvy to gain advantages through technology
- **Creative Solution**: Use Creativity to think outside the box

### 🎯 Mission Types
- **Delivery Missions**: Transport items across the city
- **Investigation Missions**: Solve puzzles and gather clues
- **Social Missions**: Interact with multiple NPCs to complete objectives

## 🕹️ Controls

- **Movement**: WASD or Arrow Keys
- **Interact**: Space or Enter (when near NPCs)
- **Inventory**: I key
- **Menu**: Escape key
- **Debug Mode**: ` (backtick)
- **Toggle FPS**: F3
- **Quick Save**: F5
- **Quick Load**: F9

## 🚀 How to Play

1. **Start the Game**: Open `index.html` in a modern web browser
2. **Character Selection**: Choose your character type from the main menu
3. **Explore the City**: Move around the city and interact with NPCs
4. **Complete Missions**: Accept and complete missions from the mission board
5. **Battle NPCs**: Engage in turn-based battles to gain experience
6. **Level Up**: Spend stat points to customize your character's growth
7. **Manage Inventory**: Collect and use items to aid your adventure

## 🛠️ Technical Features

### Architecture
- **Modular Design**: Separate systems for rendering, input, audio, UI, and game logic
- **Scene Management**: Clean transitions between menu, character select, and game scenes
- **Event-Driven**: Responsive UI with proper event handling
- **Save System**: Local storage save/load functionality

### Game Systems
- **RenderSystem**: HTML5 Canvas rendering with camera following
- **InputSystem**: Keyboard and mouse input with mobile gamepad support
- **AudioSystem**: Music and sound effects (expandable)
- **UISystem**: HUD, menus, notifications, and dialogue
- **ExperienceSystem**: XP tracking, level progression, stat management
- **InventorySystem**: Item collection, usage, and management
- **BattleSystem**: Turn-based combat with AI opponents
- **MissionSystem**: Quest tracking and completion

## 📁 Project Structure

```
pixel-city-adventure/
├── index.html              # Main game file
├── css/
│   ├── styles.css          # Base styles
│   └── game.css           # Game-specific styles
├── js/
│   ├── main.js            # Game initialization and main loop
│   ├── systems/           # Core game systems
│   │   ├── RenderSystem.js
│   │   ├── InputSystem.js
│   │   ├── AudioSystem.js
│   │   ├── UISystem.js
│   │   └── SaveSystem.js
│   ├── entities/          # Game entities
│   │   ├── Entity.js
│   │   ├── Player.js
│   │   └── NPC.js
│   ├── game/              # Game logic systems
│   │   ├── ExperienceSystem.js
│   │   ├── InventorySystem.js
│   │   ├── BattleSystem.js
│   │   └── MissionSystem.js
│   ├── scenes/            # Game scenes
│   │   ├── MenuScene.js
│   │   ├── CharacterSelectScene.js
│   │   ├── GameScene.js
│   │   └── BattleScene.js
│   ├── world/             # World systems
│   │   ├── Map.js
│   │   ├── Camera.js
│   │   └── Collision.js
│   └── utils/             # Utilities
│       ├── Constants.js
│       ├── Utils.js
│       └── SpriteLoader.js
└── assets/                # Game assets
    ├── sprites/           # Character and world sprites
    ├── audio/             # Music and sound effects
    └── data/              # Game data files
```

## 🎨 Customization

The game is designed to be easily expandable:

- **Add New Characters**: Define new character types in `Constants.js`
- **Create New Missions**: Add missions in `MissionSystem.js` 
- **Expand Battle Moves**: Add new moves and abilities
- **New Areas**: Expand the city with additional districts
- **Items & Equipment**: Add more items and equipment systems
- **NPCs**: Create unique NPCs with custom dialogue and behaviors

## 🌟 Game Progression

1. **Rookie** (Level 1-5): Learn the basics, complete simple missions
2. **Explorer** (Level 6-15): Tackle more complex investigations
3. **Specialist** (Level 16-30): Master your character's unique abilities
4. **Expert** (Level 31-45): Take on the toughest challenges
5. **City Legend** (Level 46+): Become the ultimate city adventurer!

## 🔧 Development

Built with:
- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** (no external frameworks)
- **CSS3** for styling and animations
- **Web APIs** for audio and local storage

## 🎯 Future Enhancements

- Add actual pixel art sprites and animations
- Implement multiplayer functionality  
- Create more city districts to explore
- Add weather and day/night cycles
- Expand the story with main quest line
- Add mini-games and side activities
- Implement trading and economy systems

---

**Have fun exploring Pixel City! 🏙️✨**