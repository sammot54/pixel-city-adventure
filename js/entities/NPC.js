// NPC (Non-Player Character) class
class NPC extends Entity {
    constructor(x = 0, y = 0, name = 'NPC') {
        super(x, y);
        
        this.name = name;
        this.characterType = 'npc';
        this.solid = true;
        
        // NPC properties
        this.dialogue = [];
        this.currentDialogueIndex = 0;
        this.hasInteracted = false;
        this.canInteract = true;
        
        // AI properties
        this.aiState = 'idle'; // idle, walking, talking
        this.walkTarget = null;
        this.walkSpeed = 60; // slower than player
        this.idleTime = 0;
        this.maxIdleTime = 3000; // 3 seconds
        
        // Mission properties
        this.hasMission = false;
        this.mission = null;
        
        // Battle properties
        this.canBattle = false;
        this.battleStats = {
            streetSmarts: 10,
            charisma: 10,
            athletics: 10,
            techSavvy: 10,
            creativity: 10
        };
        this.maxHP = 80;
        this.currentHP = 80;
        
        // Visual properties
        this.nameTagVisible = false;
        this.interactionIndicator = false;
        
        // Initialize NPC
        this.initialize();
    }
    
    async initialize() {
        // Set default dialogue
        this.setDefaultDialogue();
        
        // Load sprite (random NPC appearance)
        await this.loadSprite();
        
        // Set random stats
        this.randomizeStats();
    }
    
    async loadSprite() {
        // For now, use a random character sprite
        const characterTypes = Object.keys(CONSTANTS.CHARACTERS);
        const randomType = Utils.randomChoice(characterTypes).toLowerCase();
        
        try {
            this.sprite = await spriteLoader.loadSprite(`character_${randomType}`);
        } catch (error) {
            Utils.log(`Failed to load NPC sprite: ${error.message}`, 'warn');
        }
    }
    
    setDefaultDialogue() {
        const greetings = [
            "Hello there! Welcome to the city!",
            "Nice day, isn't it?",
            "Have you explored downtown yet?",
            "I love living in this neighborhood!",
            "The city never sleeps, you know.",
            "Are you new around here?"
        ];
        
        const responses = [
            "Hope you enjoy your time here!",
            "Take care now!",
            "See you around!",
            "Good luck with your adventures!"
        ];
        
        this.dialogue = [
            {
                text: Utils.randomChoice(greetings),
                options: [
                    { text: "Tell me about this area", action: 'info' },
                    { text: "Any missions for me?", action: 'mission' },
                    { text: "Goodbye", action: 'end' }
                ]
            },
            {
                text: "This is the downtown core area. Lots of interesting people and opportunities here!",
                options: [
                    { text: "Thanks for the info", action: 'end' }
                ]
            },
            {
                text: this.hasMission ? "Actually, yes! I could use some help." : "Sorry, nothing right now. Check back later!",
                options: [
                    { text: "Okay, thanks", action: 'end' }
                ]
            },
            {
                text: Utils.randomChoice(responses),
                options: []
            }
        ];
    }
    
    randomizeStats() {
        // Randomize battle stats within a range
        for (const stat in this.battleStats) {
            this.battleStats[stat] = Utils.randomInt(8, 15);
        }
        
        // Pick one stat to be higher (NPC specialty)
        const specialStat = Utils.randomChoice(Object.keys(this.battleStats));
        this.battleStats[specialStat] = Utils.randomInt(15, 20);
        
        // Adjust HP based on athletics
        this.maxHP = 60 + this.battleStats.athletics * 2;
        this.currentHP = this.maxHP;
        
        // Maybe can battle
        this.canBattle = Math.random() > 0.6;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update AI
        this.updateAI(deltaTime);
        
        // Update interaction indicator
        this.updateInteractionIndicator();
        
        // Update name tag visibility
        this.updateNameTag();
    }
    
    updateAI(deltaTime) {
        switch (this.aiState) {
            case 'idle':
                this.updateIdleAI(deltaTime);
                break;
            case 'walking':
                this.updateWalkingAI(deltaTime);
                break;
            case 'talking':
                // Do nothing, handled by dialogue system
                break;
        }
    }
    
    updateIdleAI(deltaTime) {
        this.idleTime += deltaTime;
        
        if (this.idleTime >= this.maxIdleTime) {
            // Start walking to random point
            if (Math.random() > 0.7) { // 30% chance to walk
                this.startRandomWalk();
            }
            this.idleTime = 0;
        }
    }
    
    updateWalkingAI(deltaTime) {
        if (!this.walkTarget) {
            this.aiState = 'idle';
            return;
        }
        
        // Move towards target
        const distance = Utils.distance(this.x, this.y, this.walkTarget.x, this.walkTarget.y);
        
        if (distance < 16) {
            // Reached target
            this.stop();
            this.walkTarget = null;
            this.aiState = 'idle';
            this.idleTime = 0;
        } else {
            // Keep moving towards target
            const angle = Utils.getAngle(this.x, this.y, this.walkTarget.x, this.walkTarget.y);
            const vx = Math.cos(angle) * this.walkSpeed;
            const vy = Math.sin(angle) * this.walkSpeed;
            this.setVelocity(vx, vy);
        }
    }
    
    startRandomWalk() {
        // Pick a random point within reasonable range
        const range = 128;
        const targetX = this.x + Utils.randomInt(-range, range);
        const targetY = this.y + Utils.randomInt(-range, range);
        
        this.walkTarget = { x: targetX, y: targetY };
        this.aiState = 'walking';
    }
    
    updateInteractionIndicator() {
        if (!game.player) {
            this.interactionIndicator = false;
            return;
        }
        
        const distance = this.distanceTo(game.player);
        this.interactionIndicator = distance <= 64 && this.canInteract;
    }
    
    updateNameTag() {
        if (!game.player) {
            this.nameTagVisible = false;
            return;
        }
        
        const distance = this.distanceTo(game.player);
        this.nameTagVisible = distance <= 96;
    }
    
    interact(player) {
        if (!this.canInteract) return;
        
        // Stop moving and face player
        this.stop();
        this.faceTowards(player);
        this.aiState = 'talking';
        
        // Start dialogue
        this.startDialogue();
        
        this.hasInteracted = true;
    }
    
    startDialogue() {
        if (this.dialogue.length === 0) return;
        
        this.currentDialogueIndex = 0;
        this.showCurrentDialogue();
    }
    
    showCurrentDialogue() {
        const dialogueEntry = this.dialogue[this.currentDialogueIndex];
        if (!dialogueEntry) {
            this.endDialogue();
            return;
        }
        
        uiSystem.showDialogue(dialogueEntry.text, dialogueEntry.options, (option, index) => {
            this.handleDialogueChoice(option, index);
        });
    }
    
    handleDialogueChoice(option, index) {
        switch (option.action) {
            case 'info':
                this.currentDialogueIndex = 1;
                this.showCurrentDialogue();
                break;
                
            case 'mission':
                this.currentDialogueIndex = 2;
                if (this.hasMission && this.mission) {
                    this.offerMission();
                } else {
                    this.showCurrentDialogue();
                }
                break;
                
            case 'battle':
                this.startBattle();
                break;
                
            case 'end':
                this.endDialogue();
                break;
                
            default:
                this.currentDialogueIndex++;
                this.showCurrentDialogue();
        }
    }
    
    offerMission() {
        if (!this.mission || !game.player) return;
        
        uiSystem.showDialogue(
            `Mission: ${this.mission.title}\n${this.mission.description}\nReward: ${this.mission.experienceReward} XP`,
            [
                { text: "Accept", action: 'accept_mission' },
                { text: "Decline", action: 'end' }
            ],
            (option) => {
                if (option.action === 'accept_mission') {
                    game.player.startMission(this.mission);
                    this.hasMission = false;
                    this.mission = null;
                }
                this.endDialogue();
            }
        );
    }
    
    startBattle() {
        if (!this.canBattle || !game.player) return;
        
        this.endDialogue();
        
        // Switch to battle scene
        game.changeScene(CONSTANTS.SCENES.BATTLE, {
            player: game.player,
            opponent: this,
            returnScene: CONSTANTS.SCENES.GAME
        });
    }
    
    endDialogue() {
        uiSystem.hideDialogue();
        this.aiState = 'idle';
        this.idleTime = 0;
    }
    
    // Mission system
    setMission(mission) {
        this.mission = mission;
        this.hasMission = true;
        
        // Update dialogue to mention mission
        if (this.dialogue.length > 2) {
            this.dialogue[2].text = "Actually, yes! I could use some help.";
        }
    }
    
    render(renderSystem) {
        super.render(renderSystem);
        
        // Render interaction indicator
        if (this.interactionIndicator) {
            this.renderInteractionIndicator(renderSystem);
        }
        
        // Render name tag
        if (this.nameTagVisible) {
            this.renderNameTag(renderSystem);
        }
        
        // Render mission indicator
        if (this.hasMission) {
            this.renderMissionIndicator(renderSystem);
        }
    }
    
    renderInteractionIndicator(renderSystem) {
        renderSystem.save();
        renderSystem.applyCameraTransform();
        
        // Floating interaction prompt
        const time = Date.now() / 1000;
        const bobOffset = Math.sin(time * 3) * 2;
        
        renderSystem.drawText('!', this.x, this.y - 45 + bobOffset, {
            font: 'bold 20px monospace',
            fillStyle: '#f6e05e',
            textAlign: 'center',
            strokeStyle: '#744210',
            strokeWidth: 2
        });
        
        renderSystem.restore();
    }
    
    renderNameTag(renderSystem) {
        renderSystem.save();
        renderSystem.applyCameraTransform();
        
        renderSystem.drawText(this.name, this.x, this.y - 60, {
            font: '12px monospace',
            fillStyle: '#e2e8f0',
            textAlign: 'center',
            strokeStyle: '#1a202c',
            strokeWidth: 1
        });
        
        renderSystem.restore();
    }
    
    renderMissionIndicator(renderSystem) {
        renderSystem.save();
        renderSystem.applyCameraTransform();
        
        const time = Date.now() / 1000;
        const pulseScale = 1 + Math.sin(time * 4) * 0.1;
        
        renderSystem.ctx.save();
        renderSystem.ctx.translate(this.x + 20, this.y - 35);
        renderSystem.ctx.scale(pulseScale, pulseScale);
        
        renderSystem.drawText('?', 0, 0, {
            font: 'bold 16px monospace',
            fillStyle: '#4299e1',
            textAlign: 'center',
            strokeStyle: '#1e40af',
            strokeWidth: 2
        });
        
        renderSystem.ctx.restore();
        renderSystem.restore();
    }
    
    // Serialization
    serialize() {
        const baseData = super.serialize();
        return {
            ...baseData,
            name: this.name,
            hasInteracted: this.hasInteracted,
            hasMission: this.hasMission,
            canBattle: this.canBattle,
            battleStats: { ...this.battleStats },
            currentHP: this.currentHP,
            maxHP: this.maxHP
        };
    }
    
    deserialize(data) {
        super.deserialize(data);
        this.name = data.name || this.name;
        this.hasInteracted = data.hasInteracted || false;
        this.hasMission = data.hasMission || false;
        this.canBattle = data.canBattle || false;
        this.battleStats = { ...this.battleStats, ...data.battleStats };
        this.currentHP = data.currentHP || this.currentHP;
        this.maxHP = data.maxHP || this.maxHP;
        
        // Reload sprite and dialogue
        this.initialize();
    }
}