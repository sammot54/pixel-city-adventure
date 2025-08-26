// Battle Scene - Turn-based combat scene
class BattleScene {
    constructor() {
        this.player = null;
        this.opponent = null;
        this.turnState = 'select'; // select, animating, result
        this.availableMoves = [];
        this.selectedMove = null;
        this.battleLog = [];
        this.returnScene = null;
    }
    
    enter(data = null) {
        Utils.log('Entered Battle Scene');
        
        // Get battle data
        this.player = data?.player || game.player;
        this.opponent = data?.opponent;
        this.returnScene = data?.returnScene || CONSTANTS.SCENES.GAME;
        
        if (!this.player || !this.opponent) {
            Utils.log('Missing battle participants, returning to game', 'warn');
            game.changeScene(this.returnScene);
            return;
        }
        
        // Initialize battle
        this.initializeBattle();
        
        // Show battle UI
        uiSystem.hideHUD();
        uiSystem.showBattleUI(this.player.name, this.opponent.name);
        
        // Setup battle moves
        this.setupBattleMoves();
        
        // Update HP bars
        this.updateHPBars();
        
        // Play battle music
        // audioSystem.playMusic('battle_theme.mp3');
        
        Utils.log(`Battle started: ${this.player.name} vs ${this.opponent.name}`);
    }
    
    initializeBattle() {
        this.turnState = 'select';
        this.battleLog = [];
        this.availableMoves = this.getPlayerMoves();
        
        // Reset any battle-specific states
        this.player.battleHP = this.player.currentHP;
        this.opponent.battleHP = this.opponent.currentHP || 100;
    }
    
    getPlayerMoves() {
        // Return available battle moves based on player stats
        const moves = [];
        
        // All players have basic moves
        moves.push({ ...CONSTANTS.BATTLE_MOVES.DEBATE });
        moves.push({ ...CONSTANTS.BATTLE_MOVES.CHARM });
        
        // Add moves based on high stats
        if (this.player.stats.athletics >= 15) {
            moves.push({ ...CONSTANTS.BATTLE_MOVES.CHALLENGE });
        }
        
        if (this.player.stats.techSavvy >= 15) {
            moves.push({ ...CONSTANTS.BATTLE_MOVES.HACK });
        }
        
        if (this.player.stats.creativity >= 15) {
            moves.push({ ...CONSTANTS.BATTLE_MOVES.INSPIRE });
        }
        
        return moves;
    }
    
    setupBattleMoves() {
        uiSystem.setupBattleMoves(this.availableMoves, (move, index) => {
            this.selectMove(move);
        });
    }
    
    selectMove(move) {
        if (this.turnState !== 'select') return;
        
        this.selectedMove = move;
        this.turnState = 'animating';
        
        // Execute turn
        this.executeTurn();
    }
    
    executeTurn() {
        if (!this.selectedMove) return;
        
        // Player attacks
        const playerDamage = this.calculateDamage(this.player, this.selectedMove);
        this.opponent.battleHP = Math.max(0, this.opponent.battleHP - playerDamage);
        
        this.addToBattleLog(`${this.player.name} used ${this.selectedMove.name} for ${playerDamage} damage!`);
        
        // Check if opponent is defeated
        if (this.opponent.battleHP <= 0) {
            this.endBattle(true);
            return;
        }
        
        // Opponent attacks back
        setTimeout(() => {
            this.opponentTurn();
        }, 1000);
    }
    
    opponentTurn() {
        // Simple AI - random move
        const opponentMoves = [
            CONSTANTS.BATTLE_MOVES.DEBATE,
            CONSTANTS.BATTLE_MOVES.CHARM,
            CONSTANTS.BATTLE_MOVES.CHALLENGE
        ];
        
        const move = Utils.randomChoice(opponentMoves);
        const damage = this.calculateDamage(this.opponent, move);
        
        this.player.battleHP = Math.max(0, this.player.battleHP - damage);
        
        this.addToBattleLog(`${this.opponent.name} used ${move.name} for ${damage} damage!`);
        
        // Check if player is defeated
        if (this.player.battleHP <= 0) {
            this.endBattle(false);
            return;
        }
        
        // Next turn
        setTimeout(() => {
            this.turnState = 'select';
            this.updateHPBars();
        }, 1000);
    }
    
    calculateDamage(attacker, move) {
        const statValue = attacker.stats?.[move.stat] || attacker[move.stat] || 10;
        const baseDamage = move.baseDamage || 15;
        const randomFactor = Utils.randomFloat(0.8, 1.2);
        
        return Math.floor(baseDamage * (statValue / 15) * randomFactor);
    }
    
    addToBattleLog(message) {
        this.battleLog.push(message);
        Utils.log(`Battle: ${message}`);
        
        // Keep only last 5 messages
        if (this.battleLog.length > 5) {
            this.battleLog.shift();
        }
    }
    
    updateHPBars() {
        uiSystem.updateBattleHP(
            this.player.battleHP,
            this.player.maxHP,
            this.opponent.battleHP,
            this.opponent.maxHP || 100
        );
    }
    
    endBattle(playerWon) {
        this.turnState = 'result';
        
        if (playerWon) {
            this.addToBattleLog(`${this.player.name} wins!`);
            
            // Grant experience
            const xpGain = 50 + Math.floor(Math.random() * 30);
            this.player.gainExperience(xpGain);
            
            // Play victory sound
            if (audioSystem) audioSystem.playSFX('success');
            
            uiSystem.showNotification('Victory!', 'success');
        } else {
            this.addToBattleLog(`${this.player.name} was defeated!`);
            
            // Play defeat sound
            if (audioSystem) audioSystem.playSFX('error');
            
            uiSystem.showNotification('Defeat!', 'error');
        }
        
        // Update player's actual HP
        this.player.currentHP = this.player.battleHP;
        
        // Return to previous scene after delay
        setTimeout(() => {
            this.exitBattle();
        }, 3000);
    }
    
    exitBattle() {
        uiSystem.hideBattleUI();
        game.changeScene(this.returnScene);
    }
    
    exit() {
        Utils.log('Exiting Battle Scene');
        uiSystem.hideBattleUI();
        audioSystem.stopMusic();
    }
    
    update(deltaTime) {
        // Handle input during move selection
        if (this.turnState === 'select') {
            if (inputSystem.isKeyPressed('Escape')) {
                // Try to flee
                this.tryToFlee();
            }
        }
        
        // Update HP bars continuously
        this.updateHPBars();
    }
    
    tryToFlee() {
        // Simple flee mechanic
        if (Math.random() > 0.5) {
            this.addToBattleLog(`${this.player.name} fled from battle!`);
            setTimeout(() => {
                this.exitBattle();
            }, 1000);
        } else {
            this.addToBattleLog(`${this.player.name} couldn't escape!`);
            // Continue battle
        }
    }
    
    render(renderSystem) {
        // Clear with battle background
        renderSystem.clear('#2d1b69'); // Purple battle background
        
        // Draw battle participants
        this.renderBattleParticipants(renderSystem);
        
        // Draw battle log
        this.renderBattleLog(renderSystem);
        
        // Draw turn indicator
        this.renderTurnIndicator(renderSystem);
    }
    
    renderBattleParticipants(renderSystem) {
        const centerX = renderSystem.canvas.width / 2;
        const centerY = renderSystem.canvas.height / 2;
        
        // Draw player (left side)
        renderSystem.drawText(this.player.name, centerX - 200, centerY - 100, {
            font: '20px monospace',
            fillStyle: '#63b3ed',
            textAlign: 'center'
        });
        
        // Draw player sprite (simplified)
        renderSystem.drawRect(centerX - 220, centerY - 50, 40, 40, this.player.characterType === 'adventurer' ? '#4299e1' : '#9f7aea');
        
        // Draw opponent (right side)
        renderSystem.drawText(this.opponent.name, centerX + 200, centerY - 100, {
            font: '20px monospace',
            fillStyle: '#e53e3e',
            textAlign: 'center'
        });
        
        // Draw opponent sprite
        renderSystem.drawRect(centerX + 180, centerY - 50, 40, 40, '#e53e3e');
        
        // Draw HP indicators
        const hpBarWidth = 150;
        const hpBarHeight = 20;
        
        // Player HP
        const playerHPPercent = this.player.battleHP / this.player.maxHP;
        renderSystem.drawRect(centerX - 275, centerY + 60, hpBarWidth, hpBarHeight, '#2d3748', '#4a5568');
        renderSystem.drawRect(centerX - 274, centerY + 61, (hpBarWidth - 2) * playerHPPercent, hpBarHeight - 2, '#e53e3e');
        
        // Opponent HP
        const opponentHPPercent = this.opponent.battleHP / (this.opponent.maxHP || 100);
        renderSystem.drawRect(centerX + 125, centerY + 60, hpBarWidth, hpBarHeight, '#2d3748', '#4a5568');
        renderSystem.drawRect(centerX + 126, centerY + 61, (hpBarWidth - 2) * opponentHPPercent, hpBarHeight - 2, '#e53e3e');
    }
    
    renderBattleLog(renderSystem) {
        const startY = renderSystem.canvas.height - 150;
        let yOffset = 0;
        
        for (const message of this.battleLog.slice(-3)) {
            renderSystem.drawText(message, 20, startY + yOffset, {
                font: '14px monospace',
                fillStyle: '#e2e8f0'
            });
            yOffset += 20;
        }
    }
    
    renderTurnIndicator(renderSystem) {
        if (this.turnState === 'select') {
            renderSystem.drawText('Choose your move!', renderSystem.canvas.width / 2, 50, {
                font: '18px monospace',
                fillStyle: '#f6e05e',
                textAlign: 'center'
            });
        } else if (this.turnState === 'animating') {
            renderSystem.drawText('Battle in progress...', renderSystem.canvas.width / 2, 50, {
                font: '18px monospace',
                fillStyle: '#90cdf4',
                textAlign: 'center'
            });
        }
        
        // Show flee instruction
        renderSystem.drawText('Press ESC to try to flee', renderSystem.canvas.width - 20, renderSystem.canvas.height - 20, {
            font: '12px monospace',
            fillStyle: '#a0aec0',
            textAlign: 'right'
        });
    }
}