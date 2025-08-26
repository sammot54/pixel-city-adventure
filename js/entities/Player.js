// Player character class
class Player extends Entity {
    constructor(x = 0, y = 0, characterType = 'adventurer') {
        super(x, y);
        
        this.characterType = characterType;
        this.name = 'Player';
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = CONSTANTS.BASE_XP_TO_LEVEL;
        
        // Initialize stats based on character type
        this.initializeStats(characterType);
        
        // Health system
        this.maxHP = this.calculateMaxHP();
        this.currentHP = this.maxHP;
        
        // Movement
        this.speed = CONSTANTS.PLAYER_SPEED;
        this.solid = true;
        
        // Inventory
        this.inventory = [];
        this.maxInventorySlots = 20;
        
        // Mission tracking
        this.currentMission = null;
        this.completedMissions = [];
        
        // Interaction
        this.interactionRange = 48;
        
        // Load character sprite
        this.loadSprite();
    }
    
    initializeStats(characterType) {
        const characterData = CONSTANTS.CHARACTERS[characterType.toUpperCase()];
        if (!characterData) {
            Utils.log(`Unknown character type: ${characterType}`, 'warn');
            // Default to adventurer
            characterData = CONSTANTS.CHARACTERS.ADVENTURER;
        }
        
        this.baseStats = { ...characterData.baseStats };
        this.stats = { ...characterData.baseStats };
        this.statPoints = 0; // Available points to distribute
    }
    
    async loadSprite() {
        try {
            this.sprite = await spriteLoader.loadSprite(`character_${this.characterType}`);
        } catch (error) {
            Utils.log(`Failed to load player sprite: ${error.message}`, 'error');
        }
    }
    
    update(deltaTime) {
        // Handle input for movement
        this.handleMovementInput();
        
        // Store original position
        const originalX = this.x;
        const originalY = this.y;
        
        // Apply movement
        super.update(deltaTime);
        
        // Check collision with map if we have access to the current scene
        if (game.currentScene && game.currentScene.map) {
            Collision.resolveMapCollision(this, game.currentScene.map, deltaTime);
        }
        
        // Regenerate HP slowly
        this.regenerateHP(deltaTime);
    }
    
    handleMovementInput() {
        const movementVector = inputSystem.getMovementVector();
        
        if (movementVector.x !== 0 || movementVector.y !== 0) {
            this.setVelocity(
                movementVector.x * this.speed,
                movementVector.y * this.speed
            );
        } else {
            this.stop();
        }
    }
    
    regenerateHP(deltaTime) {
        if (this.currentHP < this.maxHP) {
            // Regenerate 1 HP per 5 seconds when not moving
            if (!this.isMoving) {
                const regenRate = 0.2; // HP per second
                this.currentHP = Math.min(this.maxHP, this.currentHP + regenRate * deltaTime / 1000);
            }
        }
    }
    
    calculateMaxHP() {
        return CONSTANTS.BASE_HP + (this.level - 1) * 10 + this.stats.athletics;
    }
    
    // Experience and leveling system
    gainExperience(amount) {
        this.experience += amount;
        
        // Check for level up
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
        
        // Show XP gain effect
        uiSystem.showXPGain(amount);
        uiSystem.updateHUD();
    }
    
    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;
        this.statPoints += 3; // 3 stat points per level
        this.experienceToNext = Math.floor(CONSTANTS.BASE_XP_TO_LEVEL * Math.pow(1.2, this.level - 1));
        
        // Increase max HP
        const oldMaxHP = this.maxHP;
        this.maxHP = this.calculateMaxHP();
        this.currentHP += (this.maxHP - oldMaxHP); // Heal the difference
        
        // Show level up notification
        uiSystem.showLevelUpNotification();
        
        Utils.log(`Player reached level ${this.level}!`);
    }
    
    // Stat system
    canIncreaseStat(statName) {
        return this.statPoints > 0 && this.stats.hasOwnProperty(statName);
    }
    
    increaseStat(statName) {
        if (this.canIncreaseStat(statName)) {
            this.stats[statName]++;
            this.statPoints--;
            
            // Update max HP if athletics was increased
            if (statName === 'athletics') {
                this.maxHP = this.calculateMaxHP();
            }
            
            Utils.log(`Increased ${statName} to ${this.stats[statName]}`);
            return true;
        }
        return false;
    }
    
    getStatTotal(statName) {
        return this.stats[statName] || 0;
    }
    
    // Health system
    takeDamage(amount, source = null) {
        const damage = Math.max(0, amount);
        this.currentHP = Math.max(0, this.currentHP - damage);
        
        Utils.log(`Player took ${damage} damage from ${source || 'unknown'}`);
        
        // Check for game over
        if (this.currentHP <= 0) {
            this.handleDeath();
        }
        
        uiSystem.updateHUD();
        return damage;
    }
    
    heal(amount) {
        const healing = Math.max(0, amount);
        this.currentHP = Math.min(this.maxHP, this.currentHP + healing);
        
        Utils.log(`Player healed ${healing} HP`);
        uiSystem.updateHUD();
        return healing;
    }
    
    handleDeath() {
        Utils.log('Player has died!');
        // TODO: Implement death/respawn system
        // For now, just respawn at spawn point with half health
        this.currentHP = Math.floor(this.maxHP / 2);
        this.setPosition(100, 100); // Default spawn point
    }
    
    // Inventory system
    canAddItem(item) {
        return this.inventory.length < this.maxInventorySlots;
    }
    
    addItem(item) {
        if (this.canAddItem(item)) {
            this.inventory.push(item);
            Utils.log(`Added ${item.name} to inventory`);
            return true;
        }
        Utils.log(`Inventory full! Cannot add ${item.name}`, 'warn');
        return false;
    }
    
    removeItem(item) {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
            Utils.log(`Removed ${item.name} from inventory`);
            return true;
        }
        return false;
    }
    
    hasItem(itemName) {
        return this.inventory.some(item => item.name === itemName);
    }
    
    getItem(itemName) {
        return this.inventory.find(item => item.name === itemName) || null;
    }
    
    // Mission system
    startMission(mission) {
        this.currentMission = mission;
        mission.start();
        Utils.log(`Started mission: ${mission.title}`);
        uiSystem.updateHUD();
    }
    
    completeMission() {
        if (this.currentMission) {
            const mission = this.currentMission;
            this.completedMissions.push(mission);
            this.currentMission = null;
            
            // Grant rewards
            if (mission.experienceReward) {
                this.gainExperience(mission.experienceReward);
            }
            
            if (mission.itemReward) {
                this.addItem(mission.itemReward);
            }
            
            Utils.log(`Completed mission: ${mission.title}`);
            uiSystem.updateHUD();
            
            return mission;
        }
        return null;
    }
    
    // Interaction
    interact() {
        if (!game.currentScene || !game.currentScene.entities) return;
        
        for (const entity of game.currentScene.entities) {
            if (entity !== this && entity.solid && this.inRangeOf(entity, this.interactionRange)) {
                // Face the entity
                this.faceTowards(entity);
                
                // Interact with it
                entity.interact(this);
                break;
            }
        }
    }
    
    // Character progression
    getProgressionTitle() {
        const titles = [
            'Rookie',           // Level 1-5
            'Street Walker',    // Level 6-10
            'City Explorer',    // Level 11-15
            'Urban Navigator',  // Level 16-20
            'District Master',  // Level 21-25
            'City Legend'       // Level 26+
        ];
        
        const titleIndex = Math.min(Math.floor((this.level - 1) / 5), titles.length - 1);
        return titles[titleIndex];
    }
    
    // Render
    render(renderSystem) {
        super.render(renderSystem);
        
        // Draw interaction range in debug mode
        if (renderSystem.debugMode) {
            renderSystem.save();
            renderSystem.applyCameraTransform();
            renderSystem.drawCircle(this.x, this.y, this.interactionRange, null, 'rgba(0, 255, 0, 0.3)');
            renderSystem.restore();
        }
    }
    
    // Serialization
    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            characterType: this.characterType,
            name: this.name,
            level: this.level,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            stats: { ...this.stats },
            baseStats: { ...this.baseStats },
            statPoints: this.statPoints,
            maxHP: this.maxHP,
            currentHP: this.currentHP,
            inventory: this.inventory.map(item => item.serialize ? item.serialize() : item),
            completedMissions: this.completedMissions.map(mission => mission.id)
        };
    }
    
    deserialize(data) {
        super.deserialize(data);
        this.characterType = data.characterType || this.characterType;
        this.name = data.name || this.name;
        this.level = data.level || this.level;
        this.experience = data.experience || this.experience;
        this.experienceToNext = data.experienceToNext || this.experienceToNext;
        this.stats = { ...this.stats, ...data.stats };
        this.baseStats = { ...this.baseStats, ...data.baseStats };
        this.statPoints = data.statPoints || this.statPoints;
        this.maxHP = data.maxHP || this.maxHP;
        this.currentHP = data.currentHP || this.currentHP;
        
        // Reload sprite
        this.loadSprite();
    }
}