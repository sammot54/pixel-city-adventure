// Experience and leveling system
class ExperienceSystem {
    constructor() {
        this.level = 1;
        this.currentXP = 0;
        this.xpToNextLevel = CONSTANTS.BASE_XP_TO_LEVEL;
        this.statPoints = 0;
        this.totalXP = 0;
        
        // XP sources and values
        this.xpSources = {
            MISSION_COMPLETE: 50,
            BATTLE_WIN: 25,
            NPC_INTERACTION: 5,
            EXPLORATION: 10,
            ITEM_DISCOVERY: 15,
            PUZZLE_SOLVE: 30
        };
        
        // Level progression
        this.maxLevel = 50;
        this.statPointsPerLevel = 3;
        
        // Initialize UI
        this.initializeUI();
    }
    
    initializeUI() {
        this.xpBar = document.getElementById('xpBar');
        this.levelText = document.getElementById('levelText');
        
        this.updateDisplay();
    }
    
    // Award experience points
    awardXP(amount, source = 'Unknown') {
        if (this.level >= this.maxLevel) {
            Utils.log('Already at max level', 'info');
            return;
        }
        
        const oldLevel = this.level;
        this.currentXP += amount;
        this.totalXP += amount;
        
        Utils.log(`Gained ${amount} XP from ${source}`);
        
        // Check for level up
        while (this.currentXP >= this.xpToNextLevel && this.level < this.maxLevel) {
            this.levelUp();
        }
        
        // Show XP gain effect
        this.showXPGain(amount);
        this.updateDisplay();
        
        // Trigger level up notification if leveled up
        if (this.level > oldLevel) {
            this.showLevelUpNotification();
        }
    }
    
    // Level up the character
    levelUp() {
        this.currentXP -= this.xpToNextLevel;
        this.level++;
        this.statPoints += this.statPointsPerLevel;
        
        // Calculate XP required for next level (exponential growth)
        this.xpToNextLevel = Math.floor(CONSTANTS.BASE_XP_TO_LEVEL * Math.pow(1.2, this.level - 1));
        
        Utils.log(`Level up! Now level ${this.level}`);
        
        // Play level up sound
        if (window.audioSystem) {
            window.audioSystem.playSFX('levelup');
        }
        
        // Heal player on level up
        if (game.player) {
            game.player.heal(25);
        }
    }
    
    // Show XP gain visual effect
    showXPGain(amount) {
        if (!window.uiSystem) return;
        
        // Create floating text effect
        const text = `+${amount} XP`;
        const color = '#4299e1';
        
        // This would be implemented in UISystem to show floating text
        window.uiSystem.showFloatingText(text, color);
    }
    
    // Show level up notification
    showLevelUpNotification() {
        if (!window.uiSystem) return;
        
        const message = `Level Up! You are now level ${this.level}!`;
        window.uiSystem.showNotification(message, 'success', 3000);
        
        // Show level up effect
        window.uiSystem.showLevelUpEffect();
    }
    
    // Spend stat points
    spendStatPoint(statName) {
        if (this.statPoints <= 0) {
            Utils.log('No stat points available', 'warn');
            return false;
        }
        
        if (!game.player) {
            Utils.log('No player to apply stat points to', 'error');
            return false;
        }
        
        // Check if stat exists
        if (!game.player.stats.hasOwnProperty(statName)) {
            Utils.log(`Invalid stat name: ${statName}`, 'error');
            return false;
        }
        
        // Apply stat point
        game.player.stats[statName]++;
        this.statPoints--;
        
        Utils.log(`Increased ${statName} by 1. Stat points remaining: ${this.statPoints}`);
        return true;
    }
    
    // Get XP progress as percentage
    getXPProgress() {
        if (this.level >= this.maxLevel) return 1.0;
        return this.currentXP / this.xpToNextLevel;
    }
    
    // Get XP required for specific level
    getXPRequiredForLevel(targetLevel) {
        let totalXP = 0;
        for (let level = 1; level < targetLevel; level++) {
            totalXP += Math.floor(CONSTANTS.BASE_XP_TO_LEVEL * Math.pow(1.2, level - 1));
        }
        return totalXP;
    }
    
    // Calculate current level from total XP
    calculateLevelFromXP(totalXP) {
        let level = 1;
        let xpUsed = 0;
        
        while (level < this.maxLevel) {
            const xpForNextLevel = Math.floor(CONSTANTS.BASE_XP_TO_LEVEL * Math.pow(1.2, level - 1));
            if (xpUsed + xpForNextLevel > totalXP) break;
            
            xpUsed += xpForNextLevel;
            level++;
        }
        
        return { level, currentXP: totalXP - xpUsed, xpToNextLevel: Math.floor(CONSTANTS.BASE_XP_TO_LEVEL * Math.pow(1.2, level - 1)) };
    }
    
    // Award XP from different sources
    awardMissionXP(missionDifficulty = 1) {
        const baseXP = this.xpSources.MISSION_COMPLETE;
        const bonusXP = Math.floor(baseXP * (missionDifficulty - 1) * 0.5);
        this.awardXP(baseXP + bonusXP, 'Mission Complete');
    }
    
    awardBattleXP(opponentLevel = 1) {
        const baseXP = this.xpSources.BATTLE_WIN;
        const levelDiff = Math.max(0, opponentLevel - this.level);
        const bonusXP = levelDiff * 5;
        this.awardXP(baseXP + bonusXP, 'Battle Victory');
    }
    
    awardExplorationXP() {
        this.awardXP(this.xpSources.EXPLORATION, 'Exploration');
    }
    
    awardInteractionXP() {
        this.awardXP(this.xpSources.NPC_INTERACTION, 'NPC Interaction');
    }
    
    awardDiscoveryXP() {
        this.awardXP(this.xpSources.ITEM_DISCOVERY, 'Item Discovery');
    }
    
    awardPuzzleXP() {
        this.awardXP(this.xpSources.PUZZLE_SOLVE, 'Puzzle Solved');
    }
    
    // Update UI display
    updateDisplay() {
        if (this.xpBar) {
            const progress = this.getXPProgress();
            this.xpBar.style.width = `${progress * 100}%`;
        }
        
        if (this.levelText) {
            this.levelText.textContent = `Level ${this.level}`;
        }
        
        // Update XP tooltip
        if (this.xpBar && this.xpBar.parentElement) {
            const xpText = this.level >= this.maxLevel 
                ? 'MAX LEVEL' 
                : `${this.currentXP}/${this.xpToNextLevel} XP`;
            this.xpBar.parentElement.title = `Level ${this.level} - ${xpText}`;
        }
    }
    
    // Reset experience (for testing)
    reset() {
        this.level = 1;
        this.currentXP = 0;
        this.xpToNextLevel = CONSTANTS.BASE_XP_TO_LEVEL;
        this.statPoints = 0;
        this.totalXP = 0;
        this.updateDisplay();
        Utils.log('Experience reset to level 1');
    }
    
    // Get character progression status
    getProgressionStatus() {
        return {
            level: this.level,
            currentXP: this.currentXP,
            xpToNextLevel: this.xpToNextLevel,
            statPoints: this.statPoints,
            totalXP: this.totalXP,
            progress: this.getXPProgress(),
            isMaxLevel: this.level >= this.maxLevel
        };
    }
    
    // Serialize for saving
    serialize() {
        return {
            level: this.level,
            currentXP: this.currentXP,
            xpToNextLevel: this.xpToNextLevel,
            statPoints: this.statPoints,
            totalXP: this.totalXP
        };
    }
    
    // Deserialize from save data
    deserialize(data) {
        if (!data) return;
        
        this.level = data.level || 1;
        this.currentXP = data.currentXP || 0;
        this.xpToNextLevel = data.xpToNextLevel || CONSTANTS.BASE_XP_TO_LEVEL;
        this.statPoints = data.statPoints || 0;
        this.totalXP = data.totalXP || 0;
        
        this.updateDisplay();
    }
}

// Create global experience system instance
window.experienceSystem = new ExperienceSystem();