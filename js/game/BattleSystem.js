// Turn-based battle system for competitions and debates
class BattleSystem {
    constructor() {
        this.isActive = false;
        this.player = null;
        this.opponent = null;
        this.currentTurn = 'player';
        this.battleLog = [];
        this.battleType = 'debate'; // debate, sports, tech, creative
        
        // Battle states
        this.states = {
            INTRO: 'intro',
            PLAYER_TURN: 'player_turn',
            OPPONENT_TURN: 'opponent_turn',
            VICTORY: 'victory',
            DEFEAT: 'defeat'
        };
        
        this.currentState = this.states.INTRO;
        this.stateTimer = 0;
        
        // Initialize UI
        this.initializeUI();
    }
    
    initializeUI() {
        this.battleUI = document.getElementById('battleUI');
        this.playerName = document.getElementById('playerName');
        this.opponentName = document.getElementById('opponentName');
        this.playerHPBar = document.getElementById('playerBattleHp');
        this.opponentHPBar = document.getElementById('opponentBattleHp');
        this.battleMoves = document.getElementById('battleMoves');
        
        // Hide battle UI initially
        if (this.battleUI) {
            this.battleUI.classList.add('hidden');
        }
    }
    
    // Start a battle
    startBattle(opponent, battleType = 'debate') {
        if (this.isActive || !game.player) {
            Utils.log('Battle already in progress or no player', 'warn');
            return false;
        }
        
        this.isActive = true;
        this.player = {
            name: 'Player',
            hp: 100,
            maxHP: 100,
            stats: { ...game.player.stats }
        };
        
        this.opponent = {
            name: opponent.name,
            hp: opponent.hp || 100,
            maxHP: opponent.maxHP || 100,
            stats: { ...opponent.stats },
            ai: opponent.ai || this.createBasicAI()
        };
        
        this.battleType = battleType;
        this.currentTurn = 'player';
        this.currentState = this.states.INTRO;
        this.stateTimer = 0;
        this.battleLog = [];
        
        // Show battle UI
        this.showBattleUI();
        
        // Initialize battle display
        this.updateDisplay();
        
        Utils.log(`Battle started: ${this.player.name} vs ${this.opponent.name}`);
        this.addToLog(`${this.opponent.name} challenges you to a ${battleType}!`);
        
        // Play battle music
        if (window.audioSystem) {
            window.audioSystem.playMusic('battle_theme');
        }
        
        return true;
    }
    
    // End battle
    endBattle(victory) {
        if (!this.isActive) return;
        
        this.currentState = victory ? this.states.VICTORY : this.states.DEFEAT;
        this.stateTimer = 3000; // Show result for 3 seconds
        
        if (victory) {
            this.addToLog('Victory! You won the battle!');
            
            // Award XP
            if (window.experienceSystem) {
                window.experienceSystem.awardBattleXP(this.opponent.level || 1);
            }
            
            // Play victory sound
            if (window.audioSystem) {
                window.audioSystem.playSFX('victory');
            }
            
        } else {
            this.addToLog('Defeat! Better luck next time.');
            
            // Play defeat sound
            if (window.audioSystem) {
                window.audioSystem.playSFX('defeat');
            }
        }
        
        // Schedule battle cleanup
        setTimeout(() => {
            this.cleanup();
        }, this.stateTimer);
    }
    
    // Cleanup after battle
    cleanup() {
        this.isActive = false;
        this.player = null;
        this.opponent = null;
        this.battleLog = [];
        
        // Hide battle UI
        this.hideBattleUI();
        
        // Stop battle music
        if (window.audioSystem) {
            window.audioSystem.stopMusic();
        }
        
        Utils.log('Battle ended and cleaned up');
    }
    
    // Player uses a move
    playerUseMove(moveKey) {
        if (!this.isActive || this.currentState !== this.states.PLAYER_TURN) {
            return false;
        }
        
        const move = CONSTANTS.BATTLE_MOVES[moveKey];
        if (!move) {
            Utils.log(`Invalid move: ${moveKey}`, 'error');
            return false;
        }
        
        // Calculate damage
        const playerStatValue = this.player.stats[move.stat] || 10;
        const damage = this.calculateDamage(move.baseDamage, playerStatValue, this.opponent.stats[move.stat] || 10);
        
        // Apply damage
        this.opponent.hp = Math.max(0, this.opponent.hp - damage);
        
        // Add to battle log
        this.addToLog(`You use ${move.name}! Dealt ${damage} damage.`);
        
        // Play attack sound
        if (window.audioSystem) {
            window.audioSystem.playSFX('attack');
        }
        
        // Check for victory
        if (this.opponent.hp <= 0) {
            this.endBattle(true);
            return true;
        }
        
        // Switch to opponent turn
        this.currentTurn = 'opponent';
        this.currentState = this.states.OPPONENT_TURN;
        this.stateTimer = 1500; // Delay before opponent acts
        
        this.updateDisplay();
        return true;
    }
    
    // Opponent's turn (AI)
    opponentTurn() {
        if (!this.isActive || this.currentState !== this.states.OPPONENT_TURN) {
            return;
        }
        
        // Get AI move decision
        const moveKey = this.opponent.ai.selectMove(this.opponent, this.player, this.battleType);
        const move = CONSTANTS.BATTLE_MOVES[moveKey];
        
        if (!move) {
            Utils.log('Opponent AI selected invalid move', 'error');
            return;
        }
        
        // Calculate damage
        const opponentStatValue = this.opponent.stats[move.stat] || 10;
        const damage = this.calculateDamage(move.baseDamage, opponentStatValue, this.player.stats[move.stat] || 10);
        
        // Apply damage
        this.player.hp = Math.max(0, this.player.hp - damage);
        
        // Add to battle log
        this.addToLog(`${this.opponent.name} uses ${move.name}! You take ${damage} damage.`);
        
        // Play attack sound
        if (window.audioSystem) {
            window.audioSystem.playSFX('enemy_attack');
        }
        
        // Check for defeat
        if (this.player.hp <= 0) {
            this.endBattle(false);
            return;
        }
        
        // Switch back to player turn
        this.currentTurn = 'player';
        this.currentState = this.states.PLAYER_TURN;
        
        this.updateDisplay();
    }
    
    // Calculate damage based on stats
    calculateDamage(baseDamage, attackerStat, defenderStat) {
        const statRatio = attackerStat / Math.max(1, defenderStat);
        const damage = Math.floor(baseDamage * statRatio * (0.8 + Math.random() * 0.4));
        return Math.max(1, damage);
    }
    
    // Create basic AI for opponents
    createBasicAI() {
        return {
            selectMove: (opponent, player, battleType) => {
                const moves = Object.keys(CONSTANTS.BATTLE_MOVES);
                
                // Simple AI: choose move based on highest stat
                let bestMove = moves[0];
                let bestStatValue = 0;
                
                for (const moveKey of moves) {
                    const move = CONSTANTS.BATTLE_MOVES[moveKey];
                    const statValue = opponent.stats[move.stat] || 0;
                    
                    if (statValue > bestStatValue) {
                        bestStatValue = statValue;
                        bestMove = moveKey;
                    }
                }
                
                return bestMove;
            }
        };
    }
    
    // Update battle display
    updateDisplay() {
        if (!this.isActive) return;
        
        // Update names
        if (this.playerName) {
            this.playerName.textContent = this.player.name;
        }
        
        if (this.opponentName) {
            this.opponentName.textContent = this.opponent.name;
        }
        
        // Update HP bars
        if (this.playerHPBar) {
            const playerHPPercent = (this.player.hp / this.player.maxHP) * 100;
            this.playerHPBar.style.width = `${playerHPPercent}%`;
        }
        
        if (this.opponentHPBar) {
            const opponentHPPercent = (this.opponent.hp / this.opponent.maxHP) * 100;
            this.opponentHPBar.style.width = `${opponentHPPercent}%`;
        }
        
        // Update battle moves
        this.updateBattleMoves();
    }
    
    // Update available battle moves
    updateBattleMoves() {
        if (!this.battleMoves) return;
        
        this.battleMoves.innerHTML = '';
        
        if (this.currentState === this.states.PLAYER_TURN) {
            Object.entries(CONSTANTS.BATTLE_MOVES).forEach(([key, move]) => {
                const button = document.createElement('button');
                button.className = 'battle-move-btn';
                button.innerHTML = `
                    <div class="move-name">${move.name}</div>
                    <div class="move-description">${move.description}</div>
                `;
                
                button.addEventListener('click', () => {
                    this.playerUseMove(key);
                });
                
                this.battleMoves.appendChild(button);
            });
        } else {
            this.battleMoves.innerHTML = '<div class="battle-message">Opponent\'s turn...</div>';
        }
    }
    
    // Add message to battle log
    addToLog(message) {
        this.battleLog.push({
            message: message,
            timestamp: Date.now()
        });
        
        // Keep log to reasonable size
        if (this.battleLog.length > 10) {
            this.battleLog.shift();
        }
        
        Utils.log(`[Battle] ${message}`);
    }
    
    // Show battle UI
    showBattleUI() {
        if (this.battleUI) {
            this.battleUI.classList.remove('hidden');
        }
        
        // Hide other UI elements
        const hud = document.getElementById('hud');
        if (hud) {
            hud.classList.add('hidden');
        }
    }
    
    // Hide battle UI
    hideBattleUI() {
        if (this.battleUI) {
            this.battleUI.classList.add('hidden');
        }
        
        // Show other UI elements
        const hud = document.getElementById('hud');
        if (hud) {
            hud.classList.remove('hidden');
        }
    }
    
    // Update battle system
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Handle state timing
        if (this.stateTimer > 0) {
            this.stateTimer -= deltaTime;
            
            if (this.stateTimer <= 0) {
                switch (this.currentState) {
                    case this.states.INTRO:
                        this.currentState = this.states.PLAYER_TURN;
                        this.updateDisplay();
                        break;
                        
                    case this.states.OPPONENT_TURN:
                        this.opponentTurn();
                        break;
                }
            }
        }
    }
    
    // Get battle status
    getStatus() {
        return {
            isActive: this.isActive,
            currentState: this.currentState,
            currentTurn: this.currentTurn,
            player: this.player,
            opponent: this.opponent,
            battleType: this.battleType
        };
    }
}

// Create global battle system instance
window.battleSystem = new BattleSystem();