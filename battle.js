class Animal {
    constructor(name, stats) {
        this.name = name;
        this.maxHealth = stats.health;
        this.health = this.maxHealth;
        this.attack = stats.attack;
        this.defense = stats.defense;
        this.speed = stats.speed || 1;
        this.experienceValue = stats.experienceValue || 25;
        this.abilities = stats.abilities || [];
        this.color = stats.color || '#8B4513';
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health = Math.max(0, this.health - actualDamage);
        return actualDamage;
    }
    
    isAlive() {
        return this.health > 0;
    }
    
    getRandomAttack() {
        const attacks = ['bite', 'claw', 'charge', 'roar'];
        return attacks[Math.floor(Math.random() * attacks.length)];
    }
    
    performAttack(target) {
        const attackType = this.getRandomAttack();
        let damage = this.attack + Math.floor(Math.random() * 5) - 2; // Random variance
        let message = '';
        
        switch(attackType) {
            case 'bite':
                message = `${this.name} bites fiercely!`;
                break;
            case 'claw':
                damage = Math.floor(damage * 1.1);
                message = `${this.name} slashes with sharp claws!`;
                break;
            case 'charge':
                damage = Math.floor(damage * 1.2);
                message = `${this.name} charges with full force!`;
                break;
            case 'roar':
                damage = Math.floor(damage * 0.8);
                message = `${this.name} lets out a terrifying roar and attacks!`;
                break;
        }
        
        const actualDamage = target.takeDamage(damage);
        return {
            message: message,
            damage: actualDamage
        };
    }
}

class BattleSystem {
    constructor() {
        this.currentAnimal = null;
        this.battleLog = [];
        this.playerDefending = false;
        this.battleTurn = 'player'; // 'player' or 'enemy'
        this.battleActive = false;
        this.setupBattleUI();
    }
    
    setupBattleUI() {
        document.getElementById('attackBtn').addEventListener('click', () => this.playerAttack());
        document.getElementById('defendBtn').addEventListener('click', () => this.playerDefend());
        document.getElementById('runBtn').addEventListener('click', () => this.playerRun());
    }
    
    startBattle(animalName) {
        this.currentAnimal = this.createAnimal(animalName);
        this.battleLog = [];
        this.playerDefending = false;
        this.battleTurn = 'player';
        this.battleActive = true;
        
        this.updateBattleUI();
        this.addToBattleLog(`A wild ${this.currentAnimal.name} appears!`);
        this.showBattleUI();
    }
    
    createAnimal(name) {
        const animalStats = {
            'Wolf': {
                health: 40,
                attack: 12,
                defense: 3,
                speed: 2,
                experienceValue: 30,
                color: '#696969'
            },
            'Bear': {
                health: 80,
                attack: 18,
                defense: 6,
                speed: 1,
                experienceValue: 60,
                color: '#8B4513'
            },
            'Wild Boar': {
                health: 60,
                attack: 15,
                defense: 4,
                speed: 1.5,
                experienceValue: 45,
                color: '#A0522D'
            },
            'Fox': {
                health: 25,
                attack: 8,
                defense: 2,
                speed: 3,
                experienceValue: 20,
                color: '#FF6347'
            }
        };
        
        return new Animal(name, animalStats[name] || animalStats['Wolf']);
    }
    
    showBattleUI() {
        document.getElementById('battleUI').classList.remove('hidden');
        document.getElementById('battleUI').classList.add('fade-in');
    }
    
    hideBattleUI() {
        document.getElementById('battleUI').classList.add('hidden');
        document.getElementById('battleUI').classList.remove('fade-in');
    }
    
    updateBattleUI() {
        // Update player health
        const playerHealthPercent = (game.player.health / game.player.maxHealth) * 100;
        document.getElementById('playerHealthBar').style.width = playerHealthPercent + '%';
        document.getElementById('playerHealth').textContent = `${game.player.health}/${game.player.maxHealth}`;
        
        // Update enemy health
        if (this.currentAnimal) {
            const enemyHealthPercent = (this.currentAnimal.health / this.currentAnimal.maxHealth) * 100;
            document.getElementById('enemyHealthBar').style.width = enemyHealthPercent + '%';
            document.getElementById('enemyHealth').textContent = `${this.currentAnimal.health}/${this.currentAnimal.maxHealth}`;
            document.getElementById('enemyName').textContent = this.currentAnimal.name;
        }
        
        // Update action buttons based on turn
        const buttons = ['attackBtn', 'defendBtn', 'runBtn'];
        buttons.forEach(btnId => {
            document.getElementById(btnId).disabled = this.battleTurn !== 'player';
        });
    }
    
    addToBattleLog(message) {
        this.battleLog.push(message);
        const logElement = document.getElementById('battleLog');
        logElement.innerHTML = this.battleLog.slice(-8).join('<br>'); // Show last 8 messages
        logElement.scrollTop = logElement.scrollHeight;
    }
    
    playerAttack() {
        if (this.battleTurn !== 'player' || !this.battleActive) return;
        
        const damage = game.player.attack + Math.floor(Math.random() * 6) - 2; // Random variance
        const actualDamage = this.currentAnimal.takeDamage(damage);
        
        this.addToBattleLog(`You attack for ${actualDamage} damage!`);
        
        if (!this.currentAnimal.isAlive()) {
            this.playerWins();
            return;
        }
        
        this.playerDefending = false;
        this.battleTurn = 'enemy';
        this.updateBattleUI();
        
        // Enemy turn after short delay
        setTimeout(() => this.enemyTurn(), 1000);
    }
    
    playerDefend() {
        if (this.battleTurn !== 'player' || !this.battleActive) return;
        
        this.playerDefending = true;
        this.addToBattleLog("You raise your guard, reducing incoming damage!");
        
        this.battleTurn = 'enemy';
        this.updateBattleUI();
        
        // Enemy turn after short delay
        setTimeout(() => this.enemyTurn(), 1000);
    }
    
    playerRun() {
        if (this.battleTurn !== 'player' || !this.battleActive) return;
        
        // Calculate escape chance based on speed difference
        const escapeChance = 0.7 + (game.player.level * 0.05);
        
        if (Math.random() < escapeChance) {
            this.addToBattleLog("You successfully escape from battle!");
            setTimeout(() => this.endBattle(), 1500);
        } else {
            this.addToBattleLog("You couldn't escape!");
            this.battleTurn = 'enemy';
            this.updateBattleUI();
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }
    
    enemyTurn() {
        if (!this.battleActive || !this.currentAnimal.isAlive()) return;
        
        const attackResult = this.currentAnimal.performAttack(game.player);
        let finalDamage = attackResult.damage;
        
        // Apply defense bonus if player was defending
        if (this.playerDefending) {
            finalDamage = Math.floor(finalDamage * 0.5);
            this.addToBattleLog(attackResult.message);
            this.addToBattleLog(`Your defense reduces the damage! You take ${finalDamage} damage.`);
        } else {
            this.addToBattleLog(attackResult.message);
            this.addToBattleLog(`You take ${finalDamage} damage!`);
        }
        
        if (game.player.health <= 0) {
            this.playerLoses();
            return;
        }
        
        this.playerDefending = false;
        this.battleTurn = 'player';
        this.updateBattleUI();
    }
    
    playerWins() {
        this.addToBattleLog(`${this.currentAnimal.name} is defeated!`);
        this.addToBattleLog(`You gain ${this.currentAnimal.experienceValue} experience!`);
        
        game.player.gainExperience(this.currentAnimal.experienceValue);
        
        setTimeout(() => this.endBattle(), 2000);
    }
    
    playerLoses() {
        this.addToBattleLog("You have been defeated!");
        this.addToBattleLog("You will respawn at the city center...");
        
        // Reset player health and position
        game.player.health = Math.floor(game.player.maxHealth * 0.5);
        game.player.x = 400;
        game.player.y = 300;
        game.player.updateHUD();
        
        setTimeout(() => this.endBattle(), 3000);
    }
    
    endBattle() {
        this.battleActive = false;
        this.currentAnimal = null;
        this.hideBattleUI();
        game.currentState = 'exploration';
    }
    
    render(ctx) {
        if (!this.battleActive || !this.currentAnimal) return;
        
        // This could render battle animations or effects
        // For now, the battle UI handles the visual representation
    }
}

// Animal encounter system
class EncounterSystem {
    constructor() {
        this.encounterChance = 0.001; // Base encounter rate
        this.lastEncounterTime = 0;
        this.minTimeBetweenEncounters = 5000; // 5 seconds minimum
    }
    
    checkForEncounter(playerX, playerY) {
        const now = Date.now();
        if (now - this.lastEncounterTime < this.minTimeBetweenEncounters) {
            return false;
        }
        
        // Higher encounter chance near edges of map
        const distanceFromCenter = Math.sqrt(
            Math.pow(playerX - 400, 2) + Math.pow(playerY - 300, 2)
        );
        const edgeMultiplier = 1 + (distanceFromCenter / 300);
        
        const adjustedChance = this.encounterChance * edgeMultiplier;
        
        if (Math.random() < adjustedChance) {
            this.lastEncounterTime = now;
            return true;
        }
        
        return false;
    }
    
    getRandomAnimal() {
        const animals = ['Wolf', 'Bear', 'Wild Boar', 'Fox'];
        const weights = [3, 1, 2, 4]; // Fox most common, Bear least common
        
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < animals.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return animals[i];
            }
        }
        
        return animals[0]; // Fallback
    }
}