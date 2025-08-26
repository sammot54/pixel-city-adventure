// Save System for game persistence
class SaveSystem {
    constructor() {
        this.saveSlots = 3;
    }
    
    // Get information about all save slots
    getSaveSlots() {
        const slots = [];
        for (let i = 0; i < this.saveSlots; i++) {
            const saveData = Utils.loadFromLocalStorage(CONSTANTS.STORAGE.SAVE_GAME + '_' + i);
            slots.push({
                slot: i,
                exists: !!saveData,
                data: saveData,
                timestamp: saveData ? saveData.timestamp : null,
                playerName: saveData && saveData.player ? saveData.player.name : null,
                level: saveData && saveData.player ? saveData.player.level : null,
                character: saveData && saveData.player ? saveData.player.characterType : null
            });
        }
        return slots;
    }
    
    // Check if a save slot has data
    hasSaveData(slot = 0) {
        return !!Utils.loadFromLocalStorage(CONSTANTS.STORAGE.SAVE_GAME + '_' + slot);
    }
    
    // Save game to specific slot
    save(slot = 0, gameData) {
        const saveData = {
            version: '1.0.0',
            timestamp: Date.now(),
            slot: slot,
            ...gameData
        };
        
        const key = CONSTANTS.STORAGE.SAVE_GAME + '_' + slot;
        return Utils.saveToLocalStorage(key, saveData);
    }
    
    // Load game from specific slot
    load(slot = 0) {
        const key = CONSTANTS.STORAGE.SAVE_GAME + '_' + slot;
        return Utils.loadFromLocalStorage(key);
    }
    
    // Delete save data from slot
    delete(slot = 0) {
        const key = CONSTANTS.STORAGE.SAVE_GAME + '_' + slot;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            Utils.log(`Failed to delete save slot ${slot}: ${error.message}`, 'error');
            return false;
        }
    }
    
    // Get formatted timestamp for save slot
    getFormattedTimestamp(timestamp) {
        if (!timestamp) return 'Never';
        
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    // Export save data as JSON string
    exportSave(slot = 0) {
        const saveData = this.load(slot);
        if (!saveData) return null;
        
        return JSON.stringify(saveData, null, 2);
    }
    
    // Import save data from JSON string
    importSave(slot = 0, jsonString) {
        try {
            const saveData = JSON.parse(jsonString);
            
            // Validate basic save data structure
            if (!saveData.player || !saveData.version) {
                throw new Error('Invalid save data format');
            }
            
            // Update slot and timestamp
            saveData.slot = slot;
            saveData.timestamp = Date.now();
            
            return this.save(slot, saveData);
        } catch (error) {
            Utils.log(`Failed to import save: ${error.message}`, 'error');
            return false;
        }
    }
}