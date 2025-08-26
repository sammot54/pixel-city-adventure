class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentState = 'exploration'; // 'exploration', 'conversation', 'battle'
        
        // Game objects
        this.player = new Player(400, 300);
        this.npcs = [];
        this.battleSystem = new BattleSystem();
        this.uiSystem = new UISystem();
        this.encounterSystem = new EncounterSystem();
        
        // Game settings
        this.lastFrameTime = 0;
        this.isRunning = false;
        this.debugMode = false;
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Create NPCs around the city
        this.createNPCs();
        
        // Setup canvas
        this.ctx.imageSmoothingEnabled = false; // Pixel art style
        
        // Initialize HUD
        this.player.updateHUD();
        
        // Show welcome message
        this.uiSystem.showNotification("Welcome to Pixel City Adventure! Use WASD to move, SPACE to interact.", 'info', 5000);
        
        // Start tutorial
        setTimeout(() => {
            this.uiSystem.showTutorial('movement');
        }, 6000);
        
        // Start game loop
        this.isRunning = true;
        this.gameLoop();
    }
    
    createNPCs() {
        // Create various NPCs around the city
        this.npcs = [
            createNPC(200, 150, 'shopkeeper', 'Marcus the Merchant'),
            createNPC(600, 100, 'guard', 'Captain Elena'),
            createNPC(150, 400, 'citizen', 'Jenny the Townsperson'),
            createNPC(650, 450, 'quest_giver', 'Elder Aldric'),
            createNPC(100, 250, 'citizen', 'Bob the Farmer'),
            createNPC(700, 300, 'guard', 'Guard Thomas'),
            createNPC(350, 100, 'citizen', 'Sarah the Baker'),
            createNPC(500, 500, 'shopkeeper', 'Luna the Alchemist')
        ];
        
        // Show interaction tutorial after a delay
        setTimeout(() => {
            this.uiSystem.showTutorial('interaction');
        }, 12000);
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Update game state
        this.update(deltaTime);
        
        // Render everything
        this.render();
        
        // Continue the game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        switch(this.currentState) {
            case 'exploration':
                this.updateExploration(deltaTime);
                break;
            case 'conversation':
                // Conversation updates handled by UI system
                break;
            case 'battle':
                // Battle updates handled by battle system
                break;
        }
    }
    
    updateExploration(deltaTime) {
        // Update player
        this.player.update(deltaTime);
        
        // Check for random encounters (moved from player to centralize logic)
        if (this.encounterSystem.checkForEncounter(this.player.x, this.player.y)) {
            const animalName = this.encounterSystem.getRandomAnimal();
            this.startBattle(animalName);
        }
        
        // Update NPCs (if they had animations or behavior)
        this.npcs.forEach(npc => {
            // NPCs could have idle animations or movement patterns here
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw city environment
        this.renderEnvironment();
        
        // Only render game world during exploration
        if (this.currentState === 'exploration') {
            // Render NPCs
            this.npcs.forEach(npc => npc.render(this.ctx));
            
            // Render player
            this.player.render(this.ctx);
            
            // Render interaction hints
            this.renderInteractionHints();
        }
        
        // Render battle effects if in battle
        if (this.currentState === 'battle') {
            this.battleSystem.render(this.ctx);
        }
        
        // Debug information
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }
    
    renderEnvironment() {
        // Draw simple city environment
        this.ctx.fillStyle = '#16213e';
        
        // Draw city boundaries
        this.ctx.fillRect(0, 0, 800, 15); // Top wall
        this.ctx.fillRect(0, 585, 800, 15); // Bottom wall
        this.ctx.fillRect(0, 0, 15, 600); // Left wall
        this.ctx.fillRect(785, 0, 15, 600); // Right wall
        
        // Draw some simple city features
        this.drawCityFeatures();
    }
    
    drawCityFeatures() {
        // Simple buildings/structures
        this.ctx.fillStyle = '#1a1a2e';
        
        // Building 1
        this.ctx.fillRect(50, 50, 80, 60);
        this.ctx.fillRect(60, 40, 60, 20); // Roof
        
        // Building 2
        this.ctx.fillRect(670, 50, 80, 80);
        this.ctx.fillRect(680, 35, 60, 25); // Roof
        
        // Building 3
        this.ctx.fillRect(50, 480, 100, 70);
        this.ctx.fillRect(60, 470, 80, 20); // Roof
        
        // Building 4
        this.ctx.fillRect(650, 420, 90, 90);
        this.ctx.fillRect(660, 410, 70, 20); // Roof
        
        // Central plaza
        this.ctx.fillStyle = '#e94560';
        this.ctx.fillRect(350, 250, 100, 100);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PLAZA', 400, 305);
        this.ctx.textAlign = 'left';
        
        // Paths
        this.ctx.fillStyle = '#2d3436';
        this.ctx.fillRect(0, 285, 800, 30); // Horizontal path
        this.ctx.fillRect(385, 0, 30, 600); // Vertical path
    }
    
    renderInteractionHints() {
        // Show interaction hints for nearby NPCs
        this.npcs.forEach(npc => {
            const distance = Math.sqrt(
                Math.pow(this.player.x + this.player.width/2 - (npc.x + npc.width/2), 2) +
                Math.pow(this.player.y + this.player.height/2 - (npc.y + npc.height/2), 2)
            );
            
            if (distance < 60) {
                // Draw interaction prompt
                this.ctx.fillStyle = 'rgba(233, 69, 96, 0.8)';
                this.ctx.fillRect(npc.x - 5, npc.y - 25, npc.width + 10, 20);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '10px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Press SPACE', npc.x + npc.width/2, npc.y - 12);
                this.ctx.textAlign = 'left';
            }
        });
    }
    
    renderDebugInfo() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px Courier New';
        this.ctx.fillText(`State: ${this.currentState}`, 10, 550);
        this.ctx.fillText(`Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`, 10, 565);
        this.ctx.fillText(`NPCs: ${this.npcs.length}`, 10, 580);
        if (this.battleSystem.currentAnimal) {
            this.ctx.fillText(`Battle: ${this.battleSystem.currentAnimal.name}`, 150, 550);
        }
    }
    
    // Game state management
    startConversation(npc) {
        this.currentState = 'conversation';
        this.uiSystem.startConversation(npc);
    }
    
    startBattle(animalName) {
        this.currentState = 'battle';
        this.battleSystem.startBattle(animalName);
        
        // Show combat tutorial on first battle
        if (!localStorage.getItem('combatTutorialShown')) {
            setTimeout(() => {
                this.uiSystem.showTutorial('combat');
                localStorage.setItem('combatTutorialShown', 'true');
            }, 2000);
        }
    }
    
    // Input handlers
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        this.uiSystem.showNotification(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`, 'info', 2000);
    }
    
    // Save/Load system (basic implementation)
    saveGame() {
        const gameData = {
            playerStats: {
                x: this.player.x,
                y: this.player.y,
                health: this.player.health,
                maxHealth: this.player.maxHealth,
                level: this.player.level,
                experience: this.player.experience,
                attack: this.player.attack,
                defense: this.player.defense
            },
            npcs: this.npcs.map(npc => ({
                x: npc.x,
                y: npc.y,
                type: npc.type,
                name: npc.name,
                currentConversationId: npc.currentConversationId,
                questsGiven: npc.questsGiven
            })),
            timestamp: Date.now()
        };
        
        localStorage.setItem('pixelCityAdventureSave', JSON.stringify(gameData));
        this.uiSystem.showNotification('Game saved successfully!', 'success', 2000);
    }
    
    loadGame() {
        const savedData = localStorage.getItem('pixelCityAdventureSave');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                
                // Restore player stats
                Object.assign(this.player, gameData.playerStats);
                this.player.updateHUD();
                
                // Restore NPC states
                gameData.npcs.forEach((savedNPC, index) => {
                    if (this.npcs[index]) {
                        this.npcs[index].currentConversationId = savedNPC.currentConversationId;
                        this.npcs[index].questsGiven = savedNPC.questsGiven || [];
                    }
                });
                
                this.uiSystem.showNotification('Game loaded successfully!', 'success', 2000);
            } catch (error) {
                this.uiSystem.showNotification('Failed to load game data.', 'error', 3000);
            }
        } else {
            this.uiSystem.showNotification('No save data found.', 'info', 2000);
        }
    }
}

// Global game instance
let game;

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new Game();
    
    // Add some keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (game.currentState === 'exploration') {
            switch(e.key.toLowerCase()) {
                case 'f1':
                    game.toggleDebugMode();
                    e.preventDefault();
                    break;
                case 'f5':
                    game.saveGame();
                    e.preventDefault();
                    break;
                case 'f9':
                    game.loadGame();
                    e.preventDefault();
                    break;
                case 'i':
                    game.uiSystem.showInventory();
                    e.preventDefault();
                    break;
                case 'c':
                    game.uiSystem.showStats();
                    e.preventDefault();
                    break;
            }
        }
    });
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    console.log('Pixel City Adventure loaded successfully!');
    console.log('Controls: WASD = Move, SPACE = Interact');
    console.log('Shortcuts: F1 = Debug, F5 = Save, F9 = Load, I = Inventory, C = Stats');
});