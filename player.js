class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 2;
        this.direction = 'down';
        
        // Player stats
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.attack = 20;
        this.defense = 5;
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        
        // Movement
        this.isMoving = false;
        this.movementKeys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 200; // ms between frames
        
        this.setupControls();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.movementKeys) {
                this.movementKeys[key] = true;
                e.preventDefault();
            }
            
            // Interaction key
            if (key === ' ') {
                this.interact();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.movementKeys) {
                this.movementKeys[key] = false;
                e.preventDefault();
            }
        });
    }
    
    update(deltaTime) {
        // Only move during exploration state
        if (game && game.currentState !== 'exploration') return;
        
        let dx = 0;
        let dy = 0;
        
        // Handle movement
        if (this.movementKeys.w) dy -= this.speed;
        if (this.movementKeys.s) dy += this.speed;
        if (this.movementKeys.a) dx -= this.speed;
        if (this.movementKeys.d) dx += this.speed;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // 1/sqrt(2)
            dy *= 0.707;
        }
        
        // Update direction and position
        if (dx !== 0 || dy !== 0) {
            this.isMoving = true;
            
            // Update direction
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 'right' : 'left';
            } else {
                this.direction = dy > 0 ? 'down' : 'up';
            }
            
            // Check collision before moving
            const newX = this.x + dx;
            const newY = this.y + dy;
            
            if (this.canMoveTo(newX, newY)) {
                this.x = newX;
                this.y = newY;
                
                // Check for random encounters
                this.checkRandomEncounter();
            }
        } else {
            this.isMoving = false;
        }
        
        // Update animation
        if (this.isMoving) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 4;
                this.animationTimer = 0;
            }
        } else {
            this.animationFrame = 0;
        }
    }
    
    canMoveTo(x, y) {
        // Check canvas boundaries
        if (x < 16 || x > 800 - 16 - this.width || 
            y < 16 || y > 600 - 16 - this.height) {
            return false;
        }
        
        // Check collision with NPCs
        if (game && game.npcs) {
            for (let npc of game.npcs) {
                if (this.isColliding(x, y, this.width, this.height, 
                                   npc.x, npc.y, npc.width, npc.height)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    
    interact() {
        if (!game || game.currentState !== 'exploration') return;
        
        // Check for nearby NPCs
        if (game.npcs) {
            for (let npc of game.npcs) {
                const distance = Math.sqrt(
                    Math.pow(this.x + this.width/2 - (npc.x + npc.width/2), 2) +
                    Math.pow(this.y + this.height/2 - (npc.y + npc.height/2), 2)
                );
                
                if (distance < 60) {
                    game.startConversation(npc);
                    return;
                }
            }
        }
    }
    
    checkRandomEncounter() {
        // Small chance of wild animal encounter while moving
        if (game && Math.random() < 0.001) { // 0.1% chance per movement
            const animals = ['Wolf', 'Bear', 'Wild Boar', 'Fox'];
            const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
            game.startBattle(randomAnimal);
        }
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health = Math.max(0, this.health - actualDamage);
        this.updateHUD();
        return actualDamage;
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHUD();
    }
    
    gainExperience(amount) {
        this.experience += amount;
        if (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
        this.updateHUD();
    }
    
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNext;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.2);
        
        // Increase stats
        this.maxHealth += 10;
        this.health = this.maxHealth; // Full heal on level up
        this.attack += 2;
        this.defense += 1;
        
        console.log(`Level up! Now level ${this.level}`);
        this.updateHUD();
    }
    
    updateHUD() {
        document.getElementById('hudHealth').textContent = this.health;
        document.getElementById('hudXP').textContent = this.experience;
        document.getElementById('hudLevel').textContent = this.level;
    }
    
    render(ctx) {
        // Simple colored rectangle for now (can be replaced with sprites later)
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw direction indicator
        ctx.fillStyle = '#2E7D32';
        switch(this.direction) {
            case 'up':
                ctx.fillRect(this.x + 12, this.y, 8, 8);
                break;
            case 'down':
                ctx.fillRect(this.x + 12, this.y + 24, 8, 8);
                break;
            case 'left':
                ctx.fillRect(this.x, this.y + 12, 8, 8);
                break;
            case 'right':
                ctx.fillRect(this.x + 24, this.y + 12, 8, 8);
                break;
        }
        
        // Draw simple animation effect when moving
        if (this.isMoving && this.animationFrame % 2 === 1) {
            ctx.fillStyle = 'rgba(76, 175, 80, 0.7)';
            ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        }
    }
}