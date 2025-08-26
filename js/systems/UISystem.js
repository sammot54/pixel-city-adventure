// UI System for managing user interface
class UISystem {
    constructor() {
        this.notifications = [];
        this.hudVisible = false;
        this.currentDialogue = null;
        this.dialogueCallback = null;
    }
    
    // Notification system
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            message,
            type,
            timestamp: Date.now(),
            duration
        };
        this.notifications.push(notification);
        Utils.log(`Notification: ${message}`);
    }
    
    showXPGain(amount) {
        this.showNotification(`+${amount} XP!`, 'xp');
        if (window.audioSystem) window.window.audioSystem.playSFX('xp');
    }
    
    // Show floating text effect
    showFloatingText(text, color = '#4299e1') {
        console.log(`Floating text: ${text} (${color})`);
        // For now, just show as notification
        this.showNotification(text, 'info', 1500);
    }
    
    // Show level up effect
    showLevelUpEffect() {
        console.log('Level up effect triggered');
        // Visual effect would go here
    }
    
    showLevelUpNotification() {
        // Create visual level-up effect
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.textContent = 'LEVEL UP!';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #000;
            padding: 20px 40px;
            font-size: 24px;
            font-weight: bold;
            border: 3px solid #ffd700;
            border-radius: 10px;
            z-index: 10000;
            animation: levelUpBounce 2s ease-out;
        `;
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 2000);
        
        if (window.audioSystem) window.window.audioSystem.playSFX('levelup');
    }
    
    // HUD management
    updateHUD() {
        if (!game.player) return;
        
        // Update HP bar
        const hpBar = document.getElementById('hpBar');
        const hpText = document.getElementById('hpText');
        if (hpBar && hpText) {
            const hpPercent = (game.player.currentHP / game.player.maxHP) * 100;
            hpBar.style.width = hpPercent + '%';
            hpText.textContent = `${Math.ceil(game.player.currentHP)}/${game.player.maxHP}`;
        }
        
        // Update XP bar
        const xpBar = document.getElementById('xpBar');
        const levelText = document.getElementById('levelText');
        if (xpBar && levelText) {
            const xpPercent = (game.player.experience / game.player.experienceToNext) * 100;
            xpBar.style.width = xpPercent + '%';
            levelText.textContent = `Level ${game.player.level}`;
        }
        
        // Update mission info
        const missionInfo = document.getElementById('currentMission');
        if (missionInfo) {
            if (game.player.currentMission) {
                missionInfo.textContent = game.player.currentMission.title;
            } else {
                missionInfo.textContent = 'No active mission';
            }
        }
    }
    
    showHUD() {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.classList.remove('hidden');
            this.hudVisible = true;
            this.updateHUD();
        }
    }
    
    hideHUD() {
        const hud = document.getElementById('hud');
        if (hud) {
            hud.classList.add('hidden');
            this.hudVisible = false;
        }
    }
    
    // Dialogue system
    showDialogue(text, options = [], callback = null) {
        const dialogueBox = document.getElementById('dialogueBox');
        const dialogueText = document.getElementById('dialogueText');
        const dialogueOptions = document.getElementById('dialogueOptions');
        
        if (!dialogueBox || !dialogueText || !dialogueOptions) return;
        
        this.currentDialogue = { text, options, callback };
        this.dialogueCallback = callback;
        
        // Set text
        dialogueText.textContent = text;
        
        // Clear previous options
        Utils.removeAllChildren(dialogueOptions);
        
        // Add new options
        options.forEach((option, index) => {
            const optionElement = Utils.createElement('div', 'dialogue-option', option.text);
            optionElement.addEventListener('click', () => {
                this.selectDialogueOption(index);
            });
            dialogueOptions.appendChild(optionElement);
        });
        
        // Show dialogue box
        dialogueBox.classList.remove('hidden');
    }
    
    selectDialogueOption(index) {
        if (!this.currentDialogue || index >= this.currentDialogue.options.length) return;
        
        const selectedOption = this.currentDialogue.options[index];
        
        if (audioSystem) window.audioSystem.playSFX('click');
        
        // Hide dialogue
        this.hideDialogue();
        
        // Execute callback if provided
        if (this.dialogueCallback) {
            this.dialogueCallback(selectedOption, index);
        }
    }
    
    hideDialogue() {
        const dialogueBox = document.getElementById('dialogueBox');
        if (dialogueBox) {
            dialogueBox.classList.add('hidden');
        }
        this.currentDialogue = null;
        this.dialogueCallback = null;
    }
    
    // Menu management
    showMenu(menuId) {
        // Hide all menus first
        this.hideAllMenus();
        
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.classList.remove('hidden');
        }
    }
    
    hideMenu(menuId) {
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.classList.add('hidden');
        }
    }
    
    hideAllMenus() {
        const menus = document.querySelectorAll('.menu');
        menus.forEach(menu => menu.classList.add('hidden'));
    }
    
    // Inventory management
    showInventory() {
        if (!game.player) return;
        
        const inventory = document.getElementById('inventory');
        const inventoryGrid = document.getElementById('inventoryGrid');
        
        if (!inventory || !inventoryGrid) return;
        
        // Clear current inventory display
        Utils.removeAllChildren(inventoryGrid);
        
        // Create inventory slots
        for (let i = 0; i < game.player.maxInventorySlots; i++) {
            const slot = Utils.createElement('div', 'inventory-slot');
            
            if (i < game.player.inventory.length) {
                const item = game.player.inventory[i];
                slot.classList.add('occupied');
                slot.title = item.name || 'Item';
                
                // Add item visual representation
                const itemText = Utils.createElement('span', '', item.name ? item.name.charAt(0).toUpperCase() : '?');
                slot.appendChild(itemText);
            }
            
            inventoryGrid.appendChild(slot);
        }
        
        inventory.classList.remove('hidden');
    }
    
    hideInventory() {
        const inventory = document.getElementById('inventory');
        if (inventory) {
            inventory.classList.add('hidden');
        }
    }
    
    // Battle UI
    showBattleUI(playerName, opponentName) {
        const battleUI = document.getElementById('battleUI');
        if (!battleUI) return;
        
        // Update names
        const playerNameEl = document.getElementById('playerName');
        const opponentNameEl = document.getElementById('opponentName');
        
        if (playerNameEl) playerNameEl.textContent = playerName;
        if (opponentNameEl) opponentNameEl.textContent = opponentName;
        
        battleUI.classList.remove('hidden');
    }
    
    hideBattleUI() {
        const battleUI = document.getElementById('battleUI');
        if (battleUI) {
            battleUI.classList.add('hidden');
        }
    }
    
    updateBattleHP(playerHP, playerMaxHP, opponentHP, opponentMaxHP) {
        const playerHPBar = document.getElementById('playerBattleHp');
        const opponentHPBar = document.getElementById('opponentBattleHp');
        
        if (playerHPBar) {
            const percentage = (playerHP / playerMaxHP) * 100;
            playerHPBar.style.width = percentage + '%';
        }
        
        if (opponentHPBar) {
            const percentage = (opponentHP / opponentMaxHP) * 100;
            opponentHPBar.style.width = percentage + '%';
        }
    }
    
    setupBattleMoves(moves, callback) {
        const battleMoves = document.getElementById('battleMoves');
        if (!battleMoves) return;
        
        Utils.removeAllChildren(battleMoves);
        
        moves.forEach((move, index) => {
            const moveButton = Utils.createElement('button', 'battle-move', move.name);
            moveButton.title = move.description || '';
            moveButton.addEventListener('click', () => {
                if (audioSystem) window.audioSystem.playSFX('click');
                callback(move, index);
            });
            battleMoves.appendChild(moveButton);
        });
    }
    
    update(deltaTime) {
        // Remove expired notifications
        const now = Date.now();
        this.notifications = this.notifications.filter(
            notification => now - notification.timestamp < notification.duration
        );
        
        // Update HUD if visible and player exists
        if (this.hudVisible && game.player) {
            this.updateHUD();
        }
    }
    
    render(renderSystem) {
        // Render notifications
        let yOffset = 100;
        for (const notification of this.notifications) {
            const timeLeft = notification.duration - (Date.now() - notification.timestamp);
            const alpha = Math.min(1, timeLeft / 1000);
            
            let color = '#ffffff';
            switch (notification.type) {
                case 'xp':
                    color = '#4299e1';
                    break;
                case 'levelup':
                    color = '#f6e05e';
                    break;
                case 'error':
                    color = '#e53e3e';
                    break;
                case 'success':
                    color = '#38a169';
                    break;
            }
            
            renderSystem.drawText(notification.message, renderSystem.canvas.width / 2, yOffset, {
                textAlign: 'center',
                fillStyle: `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`,
                font: '18px monospace',
                strokeStyle: '#000000',
                strokeWidth: 2
            });
            yOffset += 30;
        }
    }
}