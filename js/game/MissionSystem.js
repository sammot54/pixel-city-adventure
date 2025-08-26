// Mission System for managing delivery, investigation, and social missions
class MissionSystem {
    constructor() {
        this.activeMissions = [];
        this.completedMissions = [];
        this.availableMissions = [];
        this.missionCounter = 0;
        
        // Mission types
        this.missionTypes = {
            DELIVERY: 'delivery',
            INVESTIGATION: 'investigation',
            SOCIAL: 'social'
        };
        
        this.generateInitialMissions();
    }
    
    // Create a new mission
    createMission(data) {
        const mission = {
            id: data.id || `mission_${++this.missionCounter}`,
            title: data.title,
            description: data.description,
            type: data.type || this.missionTypes.DELIVERY,
            objectives: data.objectives || [],
            experienceReward: data.experienceReward || 50,
            itemReward: data.itemReward || null,
            goldReward: data.goldReward || 0,
            completed: false,
            failed: false,
            startLocation: data.startLocation || null,
            endLocation: data.endLocation || null,
            npcGiver: data.npcGiver || null,
            timeLimit: data.timeLimit || null,
            startTime: null,
            completionTime: null,
            
            // Mission methods
            start: function() {
                this.startTime = Date.now();
                Utils.log(`Mission started: ${this.title}`);
            },
            
            complete: function() {
                this.completed = true;
                this.completionTime = Date.now();
                Utils.log(`Mission completed: ${this.title}`);
            },
            
            fail: function() {
                this.failed = true;
                Utils.log(`Mission failed: ${this.title}`);
            },
            
            getProgress: function() {
                if (this.completed) return 1.0;
                if (this.failed) return 0.0;
                
                const completedObjectives = this.objectives.filter(obj => obj.completed).length;
                return completedObjectives / Math.max(1, this.objectives.length);
            }
        };
        
        return mission;
    }
    
    // Add mission to available missions
    addAvailableMission(missionData) {
        const mission = this.createMission(missionData);
        this.availableMissions.push(mission);
        Utils.log(`New mission available: ${mission.title}`);
        return mission;
    }
    
    // Accept a mission
    acceptMission(missionId) {
        const missionIndex = this.availableMissions.findIndex(m => m.id === missionId);
        if (missionIndex === -1) {
            Utils.log(`Mission ${missionId} not found`, 'warn');
            return false;
        }
        
        const mission = this.availableMissions.splice(missionIndex, 1)[0];
        mission.start();
        this.activeMissions.push(mission);
        
        // Update mission display
        this.updateMissionDisplay();
        
        return true;
    }
    
    // Complete a mission
    completeMission(missionId) {
        const missionIndex = this.activeMissions.findIndex(m => m.id === missionId);
        if (missionIndex === -1) {
            Utils.log(`Active mission ${missionId} not found`, 'warn');
            return false;
        }
        
        const mission = this.activeMissions.splice(missionIndex, 1)[0];
        mission.complete();
        this.completedMissions.push(mission);
        
        // Award rewards
        this.awardMissionRewards(mission);
        
        // Update mission display
        this.updateMissionDisplay();
        
        return true;
    }
    
    // Award mission rewards
    awardMissionRewards(mission) {
        // Award XP
        if (window.experienceSystem && mission.experienceReward > 0) {
            window.experienceSystem.awardXP(mission.experienceReward, 'Mission Complete');
        }
        
        // Award items
        if (window.inventorySystem && mission.itemReward) {
            window.inventorySystem.addItem(mission.itemReward);
        }
        
        // Award gold (if player has gold system)
        if (game.player && mission.goldReward > 0) {
            game.player.addGold(mission.goldReward);
        }
        
        Utils.log(`Mission rewards awarded for: ${mission.title}`);
    }
    
    // Update objective progress
    updateObjective(missionId, objectiveIndex, completed = true) {
        const mission = this.activeMissions.find(m => m.id === missionId);
        if (!mission || !mission.objectives[objectiveIndex]) {
            return false;
        }
        
        mission.objectives[objectiveIndex].completed = completed;
        
        // Check if all objectives are complete
        const allComplete = mission.objectives.every(obj => obj.completed);
        if (allComplete) {
            this.completeMission(missionId);
        }
        
        return true;
    }
    
    // Generate initial missions
    generateInitialMissions() {
        // Add some starter missions
        this.addAvailableMission({
            title: "Welcome to the City",
            description: "Explore downtown and talk to 3 different NPCs to learn about the city.",
            type: this.missionTypes.SOCIAL,
            objectives: [
                { description: "Talk to the Shopkeeper", completed: false },
                { description: "Talk to the Office Worker", completed: false },
                { description: "Talk to the Street Artist", completed: false }
            ],
            experienceReward: 30
        });
        
        this.addAvailableMission({
            title: "Package Delivery",
            description: "Deliver this package from the post office to the business district.",
            type: this.missionTypes.DELIVERY,
            objectives: [
                { description: "Pick up package at Post Office", completed: false },
                { description: "Deliver package to Business District", completed: false }
            ],
            experienceReward: 50,
            itemReward: { id: 'delivery_receipt', name: 'Delivery Receipt', type: 'collectible' }
        });
        
        this.addAvailableMission({
            title: "The Missing Keys",
            description: "Someone lost their keys near the park. Help them search for clues.",
            type: this.missionTypes.INVESTIGATION,
            objectives: [
                { description: "Search the park area", completed: false },
                { description: "Question witnesses", completed: false },
                { description: "Find the keys", completed: false }
            ],
            experienceReward: 75
        });
    }
    
    // Update mission display in UI
    updateMissionDisplay() {
        const missionInfo = document.getElementById('currentMission');
        if (!missionInfo) return;
        
        if (this.activeMissions.length > 0) {
            const mission = this.activeMissions[0]; // Show first active mission
            const progress = mission.getProgress();
            missionInfo.innerHTML = `
                <div class="mission-title">${mission.title}</div>
                <div class="mission-progress">${Math.floor(progress * 100)}% Complete</div>
            `;
        } else {
            missionInfo.textContent = 'No active mission';
        }
    }
    
    // Get current active mission
    getCurrentMission() {
        return this.activeMissions[0] || null;
    }
    
    // Get all available missions
    getAvailableMissions() {
        return this.availableMissions;
    }
    
    // Serialize for saving
    serialize() {
        return {
            activeMissions: this.activeMissions,
            completedMissions: this.completedMissions,
            availableMissions: this.availableMissions,
            missionCounter: this.missionCounter
        };
    }
    
    // Deserialize from save data
    deserialize(data) {
        if (!data) return;
        
        this.activeMissions = data.activeMissions || [];
        this.completedMissions = data.completedMissions || [];
        this.availableMissions = data.availableMissions || [];
        this.missionCounter = data.missionCounter || 0;
        
        this.updateMissionDisplay();
    }
}

// Create global mission system instance
window.missionSystem = new MissionSystem();