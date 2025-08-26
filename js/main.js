// Main game class and entry point
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentScene = null;
        this.scenes = new Map();
        this.lastTime = 0;
        this.running = false;
        this.initialized = false;
        
        // Game state
        this.player = null;
        this.gameData = {
            settings: {
                masterVolume: 0.7,
                musicVolume: 0.5,
                sfxVolume: 0.8
            }
        };
    }
    
    async initialize() {
        if (this.initialized) return;
        
        Utils.log('Initializing game...');
        
        // Setup canvas
        this.setupCanvas();
        
        // Initialize systems
        await this.initializeSystems();
        
        // Create scenes
        this.createScenes();
        
        // Load settings
        this.loadSettings();
        
        // Start with menu scene
        this.changeScene(CONSTANTS.SCENES.MENU);
        
        this.initialized = true;
        Utils.log('Game initialized successfully');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Set canvas size
        this.resizeCanvas();
        
        // Setup resize listener
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    resizeCanvas() {
        // Calculate canvas size to maintain aspect ratio
        const targetAspect = CONSTANTS.CANVAS_WIDTH / CONSTANTS.CANVAS_HEIGHT;
        const windowAspect = window.innerWidth / window.innerHeight;
        
        let canvasWidth, canvasHeight;
        
        if (windowAspect > targetAspect) {
            // Window is wider than target aspect ratio
            canvasHeight = Math.min(window.innerHeight * 0.9, CONSTANTS.CANVAS_HEIGHT);
            canvasWidth = canvasHeight * targetAspect;
        } else {
            // Window is taller than target aspect ratio
            canvasWidth = Math.min(window.innerWidth * 0.95, CONSTANTS.CANVAS_WIDTH);
            canvasHeight = canvasWidth / targetAspect;
        }
        
        this.canvas.width = CONSTANTS.CANVAS_WIDTH;
        this.canvas.height = CONSTANTS.CANVAS_HEIGHT;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        // Re-setup canvas context for pixel art
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }
    
    async initializeSystems() {
        // Initialize render system
        window.renderSystem = new RenderSystem(this.canvas, this.ctx);
        
        // Initialize audio system
        window.audioSystem = new AudioSystem();
        
        // Initialize UI system
        window.uiSystem = new UISystem();
        
        // Initialize save system
        window.saveSystem = new SaveSystem();
        
        // Load sprites
        await spriteLoader.loadAllCharacterSprites();
        
        Utils.log('All systems initialized');
    }
    
    createScenes() {
        // Create scene instances
        this.scenes.set(CONSTANTS.SCENES.MENU, new MenuScene());
        this.scenes.set(CONSTANTS.SCENES.CHARACTER_SELECT, new CharacterSelectScene());
        this.scenes.set(CONSTANTS.SCENES.GAME, new GameScene());
        this.scenes.set(CONSTANTS.SCENES.BATTLE, new BattleScene());
        
        Utils.log('Scenes created');
    }
    
    loadSettings() {
        const savedSettings = Utils.loadFromLocalStorage(CONSTANTS.STORAGE.SETTINGS);
        if (savedSettings) {
            this.gameData.settings = { ...this.gameData.settings, ...savedSettings };
            audioSystem.setMasterVolume(this.gameData.settings.masterVolume);
            audioSystem.setMusicVolume(this.gameData.settings.musicVolume);
            audioSystem.setSFXVolume(this.gameData.settings.sfxVolume);
        }
    }
    
    saveSettings() {
        Utils.saveToLocalStorage(CONSTANTS.STORAGE.SETTINGS, this.gameData.settings);
    }
    
    changeScene(sceneName, data = null) {
        const newScene = this.scenes.get(sceneName);
        if (!newScene) {
            Utils.log(`Scene '${sceneName}' not found`, 'error');
            return false;
        }
        
        // Exit current scene
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        // Enter new scene
        this.currentScene = newScene;
        this.currentScene.enter(data);
        
        Utils.log(`Changed to scene: ${sceneName}`);
        return true;
    }
    
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        Utils.log('Game started');
    }
    
    stop() {
        this.running = false;
        Utils.log('Game stopped');
    }
    
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Limit delta time to prevent large jumps
        const clampedDelta = Math.min(deltaTime, CONSTANTS.FRAME_TIME * 3);
        
        try {
            // Update
            this.update(clampedDelta);
            
            // Render
            this.render(clampedDelta);
            
        } catch (error) {
            Utils.log(`Game loop error: ${error.message}`, 'error');
            console.error(error);
        }
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update input system
        inputSystem.update();
        
        // Update current scene
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
        
        // Update UI system
        uiSystem.update(deltaTime);
        
        // Update audio system
        audioSystem.update(deltaTime);
        
        // Handle global input
        this.handleGlobalInput();
    }
    
    handleGlobalInput() {
        // Toggle debug mode
        if (inputSystem.isKeyPressed('`')) {
            renderSystem.toggleDebugMode();
        }
        
        // Toggle FPS display
        if (inputSystem.isKeyPressed('F3')) {
            renderSystem.toggleFPSDisplay();
        }
        
        // Quick save/load (for testing)
        if (inputSystem.isKeyPressed('F5')) {
            this.quickSave();
        }
        
        if (inputSystem.isKeyPressed('F9')) {
            this.quickLoad();
        }
    }
    
    render(deltaTime) {
        // Clear canvas
        renderSystem.clear();
        
        // Render current scene
        if (this.currentScene) {
            this.currentScene.render(renderSystem);
        }
        
        // Render UI overlays
        uiSystem.render(renderSystem);
        
        // Render virtual gamepad on mobile
        inputSystem.drawVirtualGamepad(this.ctx);
        
        // Render debug info
        renderSystem.drawFPS(deltaTime);
        renderSystem.drawDebugGrid();
    }
    
    // Create new game
    newGame(characterType = 'adventurer') {
        Utils.log(`Starting new game with character: ${characterType}`);
        
        // Create player
        this.player = new Player(100, 100, characterType);
        
        // Initialize game world
        this.initializeGameWorld();
        
        // Switch to game scene
        this.changeScene(CONSTANTS.SCENES.GAME);
    }
    
    initializeGameWorld() {
        // This will be implemented when we create the GameScene
        Utils.log('Game world initialized');
    }
    
    // Save game
    saveGame(slotName = 'default') {
        if (!this.player) {
            Utils.log('No game to save', 'warn');
            return false;
        }
        
        const saveData = {
            version: '1.0.0',
            timestamp: Date.now(),
            player: this.player.serialize(),
            currentScene: this.getCurrentSceneName(),
            gameData: this.gameData
        };
        
        const success = Utils.saveToLocalStorage(CONSTANTS.STORAGE.SAVE_GAME + '_' + slotName, saveData);
        if (success) {
            Utils.log(`Game saved to slot: ${slotName}`);
            uiSystem.showNotification('Game Saved!');
        } else {
            Utils.log(`Failed to save game to slot: ${slotName}`, 'error');
            uiSystem.showNotification('Failed to save game!', 'error');
        }
        
        return success;
    }
    
    // Load game
    loadGame(slotName = 'default') {
        const saveData = Utils.loadFromLocalStorage(CONSTANTS.STORAGE.SAVE_GAME + '_' + slotName);
        if (!saveData) {
            Utils.log(`No save data found for slot: ${slotName}`, 'warn');
            return false;
        }
        
        try {
            // Create player from save data
            this.player = new Player();
            this.player.deserialize(saveData.player);
            
            // Restore game data
            this.gameData = { ...this.gameData, ...saveData.gameData };
            
            // Switch to appropriate scene
            const sceneName = saveData.currentScene || CONSTANTS.SCENES.GAME;
            this.changeScene(sceneName);
            
            Utils.log(`Game loaded from slot: ${slotName}`);
            uiSystem.showNotification('Game Loaded!');
            return true;
            
        } catch (error) {
            Utils.log(`Failed to load game: ${error.message}`, 'error');
            uiSystem.showNotification('Failed to load game!', 'error');
            return false;
        }
    }
    
    // Quick save/load for testing
    quickSave() {
        this.saveGame('quicksave');
    }
    
    quickLoad() {
        this.loadGame('quicksave');
    }
    
    // Get current scene name
    getCurrentSceneName() {
        for (const [name, scene] of this.scenes) {
            if (scene === this.currentScene) {
                return name;
            }
        }
        return null;
    }
    
    // Game over
    gameOver() {
        Utils.log('Game Over');
        // TODO: Implement game over screen
        this.changeScene(CONSTANTS.SCENES.MENU);
    }
    
    // Pause/unpause
    togglePause() {
        if (this.currentScene && this.currentScene.pause) {
            this.currentScene.pause();
        }
    }
}

// Create global game instance
const game = new Game();

// Initialize and start the game when page loads
window.addEventListener('load', async () => {
    try {
        await game.initialize();
        game.start();
    } catch (error) {
        Utils.log(`Failed to start game: ${error.message}`, 'error');
        console.error(error);
        
        // Show error message to user
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center; font-family: monospace;">
                <div>
                    <h1>Failed to load game</h1>
                    <p>Error: ${error.message}</p>
                    <p>Please refresh the page to try again.</p>
                </div>
            </div>
        `;
    }
});