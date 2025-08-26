// Character Selection Scene
class CharacterSelectScene {
    constructor() {
        this.selectedCharacter = null;
        this.characterOptions = Object.keys(CONSTANTS.CHARACTERS);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Select Character button
        const selectCharacterBtn = document.getElementById('selectCharacterBtn');
        if (selectCharacterBtn) {
            selectCharacterBtn.addEventListener('click', () => {
                this.handleSelectCharacter();
            });
        }
        
        // Back to Menu button
        const backToMenuBtn = document.getElementById('backToMenuBtn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                this.handleBackToMenu();
            });
        }
    }
    
    enter(data = null) {
        Utils.log('Entered Character Select Scene');
        
        // Show character select menu
        uiSystem.hideAllMenus();
        uiSystem.showMenu('characterSelect');
        
        // Populate character grid
        this.populateCharacterGrid();
        
        // Select first character by default
        this.selectedCharacter = this.characterOptions[0].toLowerCase();
        this.updateSelection();
    }
    
    exit() {
        Utils.log('Exiting Character Select Scene');
        uiSystem.hideAllMenus();
    }
    
    populateCharacterGrid() {
        const characterGrid = document.getElementById('characterGrid');
        if (!characterGrid) return;
        
        // Clear existing options
        Utils.removeAllChildren(characterGrid);
        
        // Create character options
        this.characterOptions.forEach((characterKey) => {
            const characterData = CONSTANTS.CHARACTERS[characterKey];
            const characterOption = this.createCharacterOption(characterKey.toLowerCase(), characterData);
            characterGrid.appendChild(characterOption);
        });
    }
    
    createCharacterOption(characterId, characterData) {
        const option = Utils.createElement('div', 'character-option');
        option.dataset.character = characterId;
        
        // Create sprite display
        const sprite = Utils.createElement('canvas', 'character-sprite');
        sprite.width = 64;
        sprite.height = 64;
        const ctx = sprite.getContext('2d');
        
        // Draw character preview
        this.drawCharacterPreview(ctx, characterData);
        option.appendChild(sprite);
        
        // Create name label
        const nameLabel = Utils.createElement('div', 'character-name', characterData.name);
        option.appendChild(nameLabel);
        
        // Create stats preview
        const statsDiv = Utils.createElement('div', 'character-stats');
        const topStat = this.getTopStat(characterData.baseStats);
        const statText = Utils.createElement('small', '', `Best: ${Utils.formatStatName(topStat)}`);
        statsDiv.appendChild(statText);
        option.appendChild(statsDiv);
        
        // Add click handler
        option.addEventListener('click', () => {
            this.selectCharacter(characterId);
        });
        
        return option;
    }
    
    drawCharacterPreview(ctx, characterData) {
        // Enable pixel art rendering
        ctx.imageSmoothingEnabled = false;
        
        const color = characterData.color || CONSTANTS.COLORS.PRIMARY;
        const rgb = Utils.hexToRgb(color);
        
        // Clear canvas
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, 0, 64, 64);
        
        // Draw larger character (32x32 centered)
        const offsetX = 16;
        const offsetY = 8;
        
        // Head
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(offsetX + 12, offsetY + 4, 8, 8);
        
        // Body
        ctx.fillRect(offsetX + 10, offsetY + 12, 12, 16);
        
        // Arms
        ctx.fillRect(offsetX + 4, offsetY + 14, 6, 8);
        ctx.fillRect(offsetX + 22, offsetY + 14, 6, 8);
        
        // Legs
        ctx.fillRect(offsetX + 10, offsetY + 28, 5, 16);
        ctx.fillRect(offsetX + 17, offsetY + 28, 5, 16);
        
        // Simple face
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX + 14, offsetY + 6, 2, 2);
        ctx.fillRect(offsetX + 18, offsetY + 6, 2, 2);
        ctx.fillRect(offsetX + 14, offsetY + 9, 4, 1);
    }
    
    getTopStat(stats) {
        let topStat = '';
        let topValue = 0;
        
        for (const [stat, value] of Object.entries(stats)) {
            if (value > topValue) {
                topValue = value;
                topStat = stat;
            }
        }
        
        return topStat;
    }
    
    selectCharacter(characterId) {
        if (audioSystem) audioSystem.playSFX('click');
        
        // Update selection
        this.selectedCharacter = characterId;
        this.updateSelection();
    }
    
    updateSelection() {
        // Update visual selection
        const options = document.querySelectorAll('.character-option');
        options.forEach(option => {
            if (option.dataset.character === this.selectedCharacter) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Show character stats
        this.showCharacterDetails();
    }
    
    showCharacterDetails() {
        if (!this.selectedCharacter) return;
        
        const characterData = CONSTANTS.CHARACTERS[this.selectedCharacter.toUpperCase()];
        if (!characterData) return;
        
        // For now, just log the selection
        Utils.log(`Selected character: ${characterData.name}`);
        
        // Could show detailed stats panel here
    }
    
    handleSelectCharacter() {
        if (!this.selectedCharacter) {
            uiSystem.showNotification('Please select a character first!', 'error');
            return;
        }
        
        if (audioSystem) audioSystem.playSFX('click');
        
        // Start new game with selected character
        Utils.log(`Starting game with ${this.selectedCharacter}`);
        game.newGame(this.selectedCharacter);
    }
    
    handleBackToMenu() {
        if (audioSystem) audioSystem.playSFX('click');
        game.changeScene(CONSTANTS.SCENES.MENU);
    }
    
    update(deltaTime) {
        // Handle keyboard input
        if (inputSystem.isKeyPressed('Enter')) {
            this.handleSelectCharacter();
        }
        
        if (inputSystem.isKeyPressed('Escape')) {
            this.handleBackToMenu();
        }
        
        // Handle arrow key navigation
        if (inputSystem.isKeyPressed('ArrowLeft') || inputSystem.isKeyPressed('a')) {
            this.navigateSelection(-1);
        }
        
        if (inputSystem.isKeyPressed('ArrowRight') || inputSystem.isKeyPressed('d')) {
            this.navigateSelection(1);
        }
    }
    
    navigateSelection(direction) {
        if (!this.selectedCharacter) return;
        
        const currentIndex = this.characterOptions.findIndex(char => 
            char.toLowerCase() === this.selectedCharacter
        );
        
        if (currentIndex === -1) return;
        
        let newIndex = currentIndex + direction;
        
        // Wrap around
        if (newIndex < 0) newIndex = this.characterOptions.length - 1;
        if (newIndex >= this.characterOptions.length) newIndex = 0;
        
        this.selectCharacter(this.characterOptions[newIndex].toLowerCase());
    }
    
    render(renderSystem) {
        // Clear with background
        renderSystem.clear(CONSTANTS.COLORS.BACKGROUND);
        
        // Draw title
        const centerX = renderSystem.canvas.width / 2;
        renderSystem.drawText('Choose Your Character', centerX, 80, {
            font: 'bold 28px monospace',
            fillStyle: '#90cdf4',
            textAlign: 'center',
            strokeStyle: '#1a202c',
            strokeWidth: 2
        });
        
        // Draw selection instructions
        renderSystem.drawText('Use arrow keys or click to select, ENTER to confirm', centerX, renderSystem.canvas.height - 50, {
            font: '14px monospace',
            fillStyle: '#a0aec0',
            textAlign: 'center'
        });
        
        // Draw selected character details
        if (this.selectedCharacter) {
            this.renderCharacterStats(renderSystem);
        }
    }
    
    renderCharacterStats(renderSystem) {
        const characterData = CONSTANTS.CHARACTERS[this.selectedCharacter.toUpperCase()];
        if (!characterData) return;
        
        const startY = 200;
        const leftX = 50;
        
        renderSystem.drawText(`${characterData.name} - Starting Stats:`, leftX, startY, {
            font: 'bold 18px monospace',
            fillStyle: '#e2e8f0'
        });
        
        let yOffset = startY + 30;
        for (const [stat, value] of Object.entries(characterData.baseStats)) {
            const statName = Utils.formatStatName(stat);
            renderSystem.drawText(`${statName}: ${value}`, leftX + 20, yOffset, {
                font: '16px monospace',
                fillStyle: '#cbd5e0'
            });
            yOffset += 25;
        }
    }
}