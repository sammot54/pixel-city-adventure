// Menu Scene - Main menu of the game
class MenuScene {
    constructor() {
        this.backgroundPattern = null;
        this.setupEventListeners();
        this.createBackgroundPattern();
    }
    
    createBackgroundPattern() {
        // Create a simple animated background pattern
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Create a city-like pattern
        ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, 64, 64);
        
        // Add some building-like shapes
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(10, 20, 12, 44);
        ctx.fillRect(30, 15, 8, 49);
        ctx.fillRect(45, 25, 10, 39);
        
        // Add some lights (windows)
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 8; j++) {
                if (Math.random() > 0.7) {
                    ctx.fillRect(12 + i * 2, 22 + j * 5, 1, 1);
                }
            }
        }
        
        this.backgroundPattern = ctx.createPattern(canvas, 'repeat');
    }
    
    setupEventListeners() {
        // Start Game button
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.handleStartGame();
            });
        }
        
        // Character Select button
        const characterSelectBtn = document.getElementById('characterSelectBtn');
        if (characterSelectBtn) {
            characterSelectBtn.addEventListener('click', () => {
                this.handleCharacterSelect();
            });
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.handleSettings();
            });
        }
    }
    
    enter(data = null) {
        Utils.log('Entered Menu Scene');
        
        // Show main menu
        uiSystem.hideAllMenus();
        uiSystem.showMenu('mainMenu');
        uiSystem.hideHUD();
        
        // Stop any background music and play menu music
        // (We'll add actual music files later)
        
        // Handle user interaction for audio
        this.setupAudioInteraction();
    }
    
    exit() {
        Utils.log('Exiting Menu Scene');
        uiSystem.hideAllMenus();
    }
    
    setupAudioInteraction() {
        // Setup one-time click handler for audio context
        const handleFirstInteraction = () => {
            if (audioSystem.audioContext && audioSystem.audioContext.state === 'suspended') {
                audioSystem.audioContext.resume();
            }
            audioSystem.handleUserInteraction();
            
            // Remove the handler after first interaction
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
        
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
    }
    
    handleStartGame() {
        if (audioSystem) audioSystem.playSFX('click');
        
        // Check if there's a save game
        if (saveSystem.hasSaveData(0)) {
            // Show continue/new game options
            this.showContinueOrNewGame();
        } else {
            // Start new game with default character
            this.startNewGame('adventurer');
        }
    }
    
    handleCharacterSelect() {
        if (audioSystem) audioSystem.playSFX('click');
        game.changeScene(CONSTANTS.SCENES.CHARACTER_SELECT);
    }
    
    handleSettings() {
        if (audioSystem) audioSystem.playSFX('click');
        this.showSettingsMenu();
    }
    
    showContinueOrNewGame() {
        // Simple implementation - just continue the game
        // In a full implementation, this would show a proper dialog
        if (game.loadGame()) {
            // Successfully loaded game
            return;
        } else {
            // Failed to load, start new game
            this.startNewGame('adventurer');
        }
    }
    
    startNewGame(characterType) {
        Utils.log(`Starting new game with character: ${characterType}`);
        game.newGame(characterType);
    }
    
    showSettingsMenu() {
        // Simple settings implementation
        const settingsHTML = `
            <div style="text-align: left; color: white;">
                <h3>Settings</h3>
                <label>Master Volume: <input type="range" id="masterVolumeSlider" min="0" max="1" step="0.1" value="${game.gameData.settings.masterVolume}"></label><br><br>
                <label>Music Volume: <input type="range" id="musicVolumeSlider" min="0" max="1" step="0.1" value="${game.gameData.settings.musicVolume}"></label><br><br>
                <label>SFX Volume: <input type="range" id="sfxVolumeSlider" min="0" max="1" step="0.1" value="${game.gameData.settings.sfxVolume}"></label><br><br>
                <button onclick="game.scenes['menu'].applySettings()">Apply</button>
                <button onclick="uiSystem.showMenu('mainMenu')">Back</button>
            </div>
        `;
        
        // Create temporary settings display
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            const originalContent = mainMenu.innerHTML;
            mainMenu.innerHTML = settingsHTML;
            
            // Store original content for restoration
            this.originalMenuContent = originalContent;
        }
    }
    
    applySettings() {
        const masterVolume = document.getElementById('masterVolumeSlider')?.value || 0.7;
        const musicVolume = document.getElementById('musicVolumeSlider')?.value || 0.5;
        const sfxVolume = document.getElementById('sfxVolumeSlider')?.value || 0.8;
        
        game.gameData.settings.masterVolume = parseFloat(masterVolume);
        game.gameData.settings.musicVolume = parseFloat(musicVolume);
        game.gameData.settings.sfxVolume = parseFloat(sfxVolume);
        
        audioSystem.setMasterVolume(game.gameData.settings.masterVolume);
        audioSystem.setMusicVolume(game.gameData.settings.musicVolume);
        audioSystem.setSFXVolume(game.gameData.settings.sfxVolume);
        
        game.saveSettings();
        
        if (audioSystem) audioSystem.playSFX('click');
        
        // Restore original menu
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu && this.originalMenuContent) {
            mainMenu.innerHTML = this.originalMenuContent;
            this.setupEventListeners(); // Re-setup event listeners
        }
        
        uiSystem.showNotification('Settings saved!', 'success');
    }
    
    update(deltaTime) {
        // Handle menu input
        if (inputSystem.isKeyPressed('Enter')) {
            this.handleStartGame();
        }
        
        if (inputSystem.isKeyPressed('Escape')) {
            // Could be used to exit game or show exit confirmation
        }
    }
    
    render(renderSystem) {
        // Clear with animated background
        renderSystem.clear(CONSTANTS.COLORS.BACKGROUND);
        
        // Draw background pattern
        if (this.backgroundPattern) {
            renderSystem.ctx.fillStyle = this.backgroundPattern;
            renderSystem.ctx.globalAlpha = 0.3;
            renderSystem.ctx.fillRect(0, 0, renderSystem.canvas.width, renderSystem.canvas.height);
            renderSystem.ctx.globalAlpha = 1.0;
        }
        
        // Draw title on canvas (in addition to HTML)
        const centerX = renderSystem.canvas.width / 2;
        const centerY = 100;
        
        renderSystem.drawText('PIXEL CITY ADVENTURE', centerX, centerY, {
            font: 'bold 32px monospace',
            fillStyle: '#63b3ed',
            textAlign: 'center',
            strokeStyle: '#1a202c',
            strokeWidth: 3
        });
        
        // Draw subtitle
        renderSystem.drawText('A Pokemon-Inspired Urban Adventure', centerX, centerY + 50, {
            font: '18px monospace',
            fillStyle: '#90cdf4',
            textAlign: 'center',
            strokeStyle: '#1a202c',
            strokeWidth: 2
        });
        
        // Draw instructions at bottom
        renderSystem.drawText('Press ENTER to start or use the menu buttons', centerX, renderSystem.canvas.height - 50, {
            font: '14px monospace',
            fillStyle: '#a0aec0',
            textAlign: 'center'
        });
        
        // Draw version info
        renderSystem.drawText('v1.0.0', renderSystem.canvas.width - 10, renderSystem.canvas.height - 10, {
            font: '12px monospace',
            fillStyle: '#4a5568',
            textAlign: 'right',
            textBaseline: 'bottom'
        });
    }
}