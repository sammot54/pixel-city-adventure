// Game Scene - Main gameplay scene
class GameScene {
    constructor() {
        this.map = null;
        this.camera = null;
        this.entities = [];
        this.npcs = [];
        this.initialized = false;
    }
    
    async enter(data = null) {
        Utils.log('Entered Game Scene');
        
        if (!this.initialized) {
            await this.initialize();
        }
        
        // Show HUD
        uiSystem.hideAllMenus();
        uiSystem.showHUD();
        
        // Setup camera to follow player
        if (game.player && this.camera) {
            this.camera.setTarget(game.player);
        }
        
        // Play background music (placeholder)
        // audioSystem.playMusic('downtown_theme.mp3');
    }
    
    async initialize() {
        Utils.log('Initializing Game Scene...');
        
        // Create camera
        this.camera = new Camera(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);
        renderSystem.setCamera(this.camera);
        
        // Create basic map
        this.map = new Map(32, 24);
        await this.map.initialize();
        
        // Add player to entities if not already added
        if (game.player && !this.entities.includes(game.player)) {
            this.entities.push(game.player);
        }
        
        // Create some basic NPCs
        this.createNPCs();
        
        this.initialized = true;
        Utils.log('Game Scene initialized');
    }
    
    createNPCs() {
        // Create a few test NPCs
        for (let i = 0; i < 3; i++) {
            const x = 200 + i * 100;
            const y = 200 + i * 50;
            const npc = new NPC(x, y, `NPC_${i}`);
            this.entities.push(npc);
            this.npcs.push(npc);
        }
    }
    
    exit() {
        Utils.log('Exiting Game Scene');
        uiSystem.hideHUD();
        audioSystem.stopMusic();
    }
    
    update(deltaTime) {
        // Update all entities
        for (const entity of this.entities) {
            if (entity.active) {
                entity.update(deltaTime);
            }
        }
        
        // Remove inactive entities
        this.entities = this.entities.filter(entity => entity.active);
        
        // Update camera
        if (this.camera) {
            this.camera.update(deltaTime);
        }
        
        // Handle input
        this.handleInput();
        
        // Update map (if it has update logic)
        if (this.map && this.map.update) {
            this.map.update(deltaTime);
        }
    }
    
    handleInput() {
        if (!game.player) return;
        
        // Handle interaction
        if (inputSystem.isInteractPressed()) {
            game.player.interact();
        }
        
        // Handle inventory
        if (inputSystem.isInventoryPressed()) {
            this.toggleInventory();
        }
        
        // Handle menu
        if (inputSystem.isMenuPressed()) {
            this.showPauseMenu();
        }
    }
    
    toggleInventory() {
        const inventory = document.getElementById('inventory');
        if (inventory && !inventory.classList.contains('hidden')) {
            uiSystem.hideInventory();
        } else {
            uiSystem.showInventory();
        }
    }
    
    showPauseMenu() {
        // Simple pause implementation - go back to main menu
        // In a full game, this would show a pause overlay
        Utils.log('Game paused - returning to menu');
        game.changeScene(CONSTANTS.SCENES.MENU);
    }
    
    render(renderSystem) {
        // Clear canvas
        renderSystem.clear('#4a7c59'); // Grass-like background
        
        // Render map
        if (this.map) {
            this.map.render(renderSystem);
        }
        
        // Render entities (sorted by Y position for proper depth)
        const sortedEntities = [...this.entities].sort((a, b) => a.y - b.y);
        for (const entity of sortedEntities) {
            if (entity.visible) {
                entity.render(renderSystem);
            }
        }
        
        // Render UI elements on top
        this.renderUI(renderSystem);
    }
    
    renderUI(renderSystem) {
        if (!game.player) return;
        
        // Show interaction prompt
        this.showInteractionPrompts(renderSystem);
        
        // Show debug info
        if (renderSystem.debugMode) {
            this.renderDebugInfo(renderSystem);
        }
    }
    
    showInteractionPrompts(renderSystem) {
        // Check for nearby NPCs
        for (const npc of this.npcs) {
            if (npc.inRangeOf(game.player, 64)) {
                const screenPos = renderSystem.worldToScreen(npc.x, npc.y - 40);
                renderSystem.drawText('Press SPACE to talk', screenPos.x, screenPos.y, {
                    font: '14px monospace',
                    fillStyle: '#ffffff',
                    textAlign: 'center',
                    strokeStyle: '#000000',
                    strokeWidth: 2
                });
            }
        }
    }
    
    renderDebugInfo(renderSystem) {
        const debugY = 150;
        renderSystem.drawText(`Player: (${Math.floor(game.player.x)}, ${Math.floor(game.player.y)})`, 10, debugY, {
            font: '12px monospace',
            fillStyle: '#ffffff'
        });
        
        renderSystem.drawText(`Camera: (${Math.floor(this.camera.x)}, ${Math.floor(this.camera.y)})`, 10, debugY + 15, {
            font: '12px monospace',
            fillStyle: '#ffffff'
        });
        
        renderSystem.drawText(`Entities: ${this.entities.length}`, 10, debugY + 30, {
            font: '12px monospace',
            fillStyle: '#ffffff'
        });
    }
}