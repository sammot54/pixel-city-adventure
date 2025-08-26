// Inventory system for managing items
class InventorySystem {
    constructor() {
        this.items = [];
        this.maxSlots = 20;
        this.isOpen = false;
        
        // Item types
        this.itemTypes = {
            MISSION: 'mission',
            CONSUMABLE: 'consumable',
            COLLECTIBLE: 'collectible',
            KEY: 'key'
        };
        
        // Initialize UI elements
        this.initializeUI();
    }
    
    initializeUI() {
        this.inventoryElement = document.getElementById('inventory');
        this.inventoryGrid = document.getElementById('inventoryGrid');
        this.closeButton = document.getElementById('closeInventoryBtn');
        
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }
        
        // Update inventory display
        this.updateDisplay();
    }
    
    // Add item to inventory
    addItem(itemData) {
        if (this.items.length >= this.maxSlots) {
            Utils.log('Inventory is full!', 'warn');
            return false;
        }
        
        // Check if item is stackable
        const existingItem = this.findItem(itemData.id);
        if (existingItem && itemData.stackable) {
            existingItem.quantity = (existingItem.quantity || 1) + (itemData.quantity || 1);
        } else {
            const item = {
                id: itemData.id,
                name: itemData.name,
                description: itemData.description || '',
                type: itemData.type || this.itemTypes.COLLECTIBLE,
                quantity: itemData.quantity || 1,
                stackable: itemData.stackable || false,
                icon: itemData.icon || null,
                value: itemData.value || 0
            };
            
            this.items.push(item);
        }
        
        this.updateDisplay();
        Utils.log(`Added ${itemData.name} to inventory`);
        return true;
    }
    
    // Remove item from inventory
    removeItem(itemId, quantity = 1) {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            Utils.log(`Item ${itemId} not found in inventory`, 'warn');
            return false;
        }
        
        const item = this.items[itemIndex];
        
        if (item.quantity > quantity) {
            item.quantity -= quantity;
        } else {
            this.items.splice(itemIndex, 1);
        }
        
        this.updateDisplay();
        Utils.log(`Removed ${quantity} ${item.name} from inventory`);
        return true;
    }
    
    // Find item by ID
    findItem(itemId) {
        return this.items.find(item => item.id === itemId);
    }
    
    // Check if inventory has item
    hasItem(itemId, quantity = 1) {
        const item = this.findItem(itemId);
        return item && item.quantity >= quantity;
    }
    
    // Get item count
    getItemCount(itemId) {
        const item = this.findItem(itemId);
        return item ? item.quantity : 0;
    }
    
    // Use item
    useItem(itemId) {
        const item = this.findItem(itemId);
        if (!item) {
            Utils.log(`Item ${itemId} not found`, 'warn');
            return false;
        }
        
        switch (item.type) {
            case this.itemTypes.CONSUMABLE:
                return this.useConsumable(item);
            case this.itemTypes.KEY:
                Utils.log(`Used key: ${item.name}`);
                return true;
            default:
                Utils.log(`${item.name} cannot be used`);
                return false;
        }
    }
    
    // Use consumable item
    useConsumable(item) {
        // Apply item effects based on item ID
        switch (item.id) {
            case 'health_potion':
                if (game.player) {
                    const healAmount = 25;
                    game.player.heal(healAmount);
                    this.removeItem(item.id, 1);
                    Utils.log(`Used ${item.name}, restored ${healAmount} HP`);
                    return true;
                }
                break;
            case 'energy_drink':
                if (game.player) {
                    game.player.restoreEnergy(50);
                    this.removeItem(item.id, 1);
                    Utils.log(`Used ${item.name}, restored energy`);
                    return true;
                }
                break;
        }
        
        return false;
    }
    
    // Open inventory
    open() {
        this.isOpen = true;
        if (this.inventoryElement) {
            this.inventoryElement.classList.remove('hidden');
        }
        this.updateDisplay();
    }
    
    // Close inventory
    close() {
        this.isOpen = false;
        if (this.inventoryElement) {
            this.inventoryElement.classList.add('hidden');
        }
    }
    
    // Toggle inventory
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    // Update inventory display
    updateDisplay() {
        if (!this.inventoryGrid) return;
        
        // Clear existing items
        this.inventoryGrid.innerHTML = '';
        
        // Create slots
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            const item = this.items[i];
            if (item) {
                slot.classList.add('has-item');
                slot.innerHTML = `
                    <div class="item-icon">${item.icon || '?'}</div>
                    <div class="item-name">${item.name}</div>
                    ${item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ''}
                `;
                
                // Add click handler
                slot.addEventListener('click', () => this.onItemClick(item));
                
                // Add tooltip
                slot.title = `${item.name}\n${item.description}`;
            }
            
            this.inventoryGrid.appendChild(slot);
        }
    }
    
    // Handle item click
    onItemClick(item) {
        Utils.log(`Clicked on ${item.name}`);
        
        // For now, just try to use the item
        if (item.type === this.itemTypes.CONSUMABLE) {
            this.useItem(item.id);
        }
    }
    
    // Clear all items (for testing/reset)
    clear() {
        this.items = [];
        this.updateDisplay();
        Utils.log('Inventory cleared');
    }
    
    // Get all items of a specific type
    getItemsByType(type) {
        return this.items.filter(item => item.type === type);
    }
    
    // Get total value of all items
    getTotalValue() {
        return this.items.reduce((total, item) => total + (item.value * item.quantity), 0);
    }
    
    // Serialize inventory for saving
    serialize() {
        return {
            items: this.items.map(item => ({ ...item })),
            maxSlots: this.maxSlots
        };
    }
    
    // Deserialize inventory from save data
    deserialize(data) {
        if (!data) return;
        
        this.items = data.items || [];
        this.maxSlots = data.maxSlots || 20;
        this.updateDisplay();
    }
}

// Create global inventory system instance
window.inventorySystem = new InventorySystem();