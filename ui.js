class UISystem {
    constructor() {
        this.currentConversationNPC = null;
        this.conversationHistory = [];
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close conversation with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (game.currentState === 'conversation') {
                    this.endConversation();
                } else if (game.currentState === 'battle') {
                    // Don't allow escaping from battle with Escape
                    // Players must use the Run button
                }
            }
        });
    }
    
    // Conversation UI Methods
    startConversation(npc) {
        this.currentConversationNPC = npc;
        this.conversationHistory = [];
        this.displayConversation();
        this.showConversationUI();
    }
    
    showConversationUI() {
        document.getElementById('conversationUI').classList.remove('hidden');
        document.getElementById('conversationUI').classList.add('fade-in');
    }
    
    hideConversationUI() {
        document.getElementById('conversationUI').classList.add('hidden');
        document.getElementById('conversationUI').classList.remove('fade-in');
    }
    
    displayConversation() {
        if (!this.currentConversationNPC) return;
        
        const conversation = this.currentConversationNPC.getConversation();
        
        // Update NPC name
        document.getElementById('npcName').textContent = this.currentConversationNPC.name;
        
        // Update dialogue text with typing effect
        this.typeText(conversation.text, document.getElementById('dialogueText'));
        
        // Update dialogue options
        const optionsContainer = document.getElementById('dialogueOptions');
        optionsContainer.innerHTML = '';
        
        conversation.responses.forEach((response, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'dialogue-option';
            optionElement.textContent = response.text;
            optionElement.addEventListener('click', () => this.selectDialogueOption(response.id));
            optionsContainer.appendChild(optionElement);
        });
    }
    
    typeText(text, element, speed = 30) {
        element.textContent = '';
        let index = 0;
        
        const typeInterval = setInterval(() => {
            element.textContent += text.charAt(index);
            index++;
            
            if (index >= text.length) {
                clearInterval(typeInterval);
            }
        }, speed);
    }
    
    selectDialogueOption(responseId) {
        if (!this.currentConversationNPC) return;
        
        this.conversationHistory.push({
            npc: this.currentConversationNPC.name,
            response: responseId,
            timestamp: Date.now()
        });
        
        // Process the NPC's response to this choice
        this.currentConversationNPC.processResponse(responseId);
        
        // Get the response data to check for special actions
        const currentConv = this.currentConversationNPC.getConversation();
        const response = currentConv.responses.find(r => r.id === responseId);
        
        // If this response ends the conversation, end it
        if (response && response.nextConversation === 'greeting') {
            setTimeout(() => this.endConversation(), 1000);
        } else {
            // Continue the conversation with updated content
            setTimeout(() => this.displayConversation(), 500);
        }
    }
    
    endConversation() {
        this.hideConversationUI();
        this.currentConversationNPC = null;
        game.currentState = 'exploration';
    }
    
    // Notification system for game events
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: ${type === 'info' ? '#16213e' : type === 'success' ? '#4CAF50' : '#e94560'};
            color: white;
            padding: 15px;
            border-radius: 5px;
            border: 2px solid ${type === 'info' ? '#e94560' : type === 'success' ? '#45a049' : '#d63031'};
            z-index: 1000;
            font-family: 'Courier New', monospace;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after duration
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    // Status effect display
    updateStatusEffects() {
        // This could show things like poisoned, blessed, etc.
        // For now, we'll just handle basic status updates
    }
    
    // Inventory display (basic implementation)
    showInventory() {
        // Simple inventory system - could be expanded
        const inventoryItems = [
            'Health Potion x3',
            'Iron Sword',
            'Leather Armor',
            'Quest Item: Animal Tooth'
        ];
        
        let inventoryHTML = '<h3>Inventory</h3><ul>';
        inventoryItems.forEach(item => {
            inventoryHTML += `<li>${item}</li>`;
        });
        inventoryHTML += '</ul>';
        
        this.showNotification('Inventory opened! (Feature under development)', 'info', 2000);
    }
    
    // Helper method to format health bars
    formatHealthBar(current, max, width = 100) {
        const percentage = (current / max) * 100;
        return `<div style="width: ${width}px; height: 10px; background: #333; border: 1px solid #666;">
                    <div style="width: ${percentage}%; height: 100%; background: ${percentage > 50 ? '#4CAF50' : percentage > 25 ? '#FFA500' : '#e94560'};"></div>
                </div>`;
    }
    
    // Quest tracking UI
    updateQuestTracker() {
        // This could track active quests and progress
        // For now, it's a placeholder for future development
    }
    
    // Game menu system
    showGameMenu() {
        // Pause menu functionality
        this.showNotification('Game menu opened! (Feature under development)', 'info', 2000);
    }
    
    // Achievement system
    showAchievement(title, description) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement-popup';
        achievement.innerHTML = `
            <div style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 15px; border-radius: 8px; margin: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                <h4 style="margin: 0 0 5px 0;">🏆 Achievement Unlocked!</h4>
                <strong>${title}</strong><br>
                <small>${description}</small>
            </div>
        `;
        
        achievement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            animation: achievementPop 0.5s ease-out;
        `;
        
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            if (achievement.parentNode) {
                achievement.parentNode.removeChild(achievement);
            }
        }, 4000);
    }
    
    // Tutorial/Help system
    showTutorial(step) {
        const tutorials = {
            movement: "Use WASD keys to move around the city. Explore and find NPCs to talk to!",
            interaction: "Press SPACE when near an NPC (shown in different colors) to start a conversation.",
            combat: "When you encounter wild animals, choose Attack, Defend, or Run. Defending reduces damage!",
            progression: "Defeat enemies to gain experience and level up. Higher levels mean stronger attacks and more health!"
        };
        
        if (tutorials[step]) {
            this.showNotification(tutorials[step], 'info', 5000);
        }
    }
    
    // Statistics display
    showStats() {
        const stats = `
            Level: ${game.player.level}
            Health: ${game.player.health}/${game.player.maxHealth}
            Attack: ${game.player.attack}
            Defense: ${game.player.defense}
            Experience: ${game.player.experience}/${game.player.experienceToNext}
        `;
        
        this.showNotification(`Player Stats:\n${stats}`, 'info', 4000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes achievementPop {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    .notification {
        font-size: 14px;
        line-height: 1.4;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }
`;

document.head.appendChild(style);