// Base Entity class for all game objects
class Entity {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.direction = 'down';
        this.sprite = null;
        this.isMoving = false;
        this.animationTime = 0;
        
        // Physics properties
        this.vx = 0;
        this.vy = 0;
        this.speed = 100; // pixels per second
        
        // State
        this.active = true;
        this.visible = true;
        
        // Collision properties
        this.solid = false;
        this.collisionWidth = 24;
        this.collisionHeight = 16;
        this.collisionOffsetX = 0;
        this.collisionOffsetY = 8;
    }
    
    // Update the entity (called each frame)
    update(deltaTime) {
        if (!this.active) return;
        
        // Update animation time
        this.animationTime += deltaTime / 1000;
        
        // Update position based on velocity
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;
        
        // Update movement state
        this.isMoving = this.vx !== 0 || this.vy !== 0;
    }
    
    // Set velocity and update direction
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
        
        // Update direction based on velocity
        if (this.isMoving) {
            if (Math.abs(vx) > Math.abs(vy)) {
                this.direction = vx > 0 ? 'right' : 'left';
            } else if (vy !== 0) {
                this.direction = vy > 0 ? 'down' : 'up';
            }
        }
    }
    
    // Move in a direction
    move(direction, speed = this.speed) {
        switch (direction) {
            case 'up':
                this.setVelocity(0, -speed);
                break;
            case 'down':
                this.setVelocity(0, speed);
                break;
            case 'left':
                this.setVelocity(-speed, 0);
                break;
            case 'right':
                this.setVelocity(speed, 0);
                break;
        }
    }
    
    // Stop movement
    stop() {
        this.setVelocity(0, 0);
    }
    
    // Get collision bounds
    getCollisionBounds() {
        return {
            x: this.x - this.collisionWidth / 2 + this.collisionOffsetX,
            y: this.y - this.collisionHeight / 2 + this.collisionOffsetY,
            width: this.collisionWidth,
            height: this.collisionHeight
        };
    }
    
    // Check collision with another entity
    collidesWith(other) {
        const bounds1 = this.getCollisionBounds();
        const bounds2 = other.getCollisionBounds();
        
        return Utils.rectCollision(bounds1, bounds2);
    }
    
    // Get distance to another entity
    distanceTo(other) {
        return Utils.distance(this.x, this.y, other.x, other.y);
    }
    
    // Get angle to another entity
    angleTo(other) {
        return Utils.getAngle(this.x, this.y, other.x, other.y);
    }
    
    // Move towards another entity
    moveTowards(other, speed = this.speed) {
        const angle = this.angleTo(other);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.setVelocity(vx, vy);
    }
    
    // Check if entity is within interaction range
    inRangeOf(other, range = 48) {
        return this.distanceTo(other) <= range;
    }
    
    // Set position
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    // Teleport to position (no collision checking)
    teleport(x, y) {
        this.setPosition(x, y);
        this.stop();
    }
    
    // Face towards another entity
    faceTowards(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else if (dy !== 0) {
            this.direction = dy > 0 ? 'down' : 'up';
        }
    }
    
    // Face in a specific direction
    faceDirection(direction) {
        this.direction = direction;
    }
    
    // Get center position
    getCenter() {
        return {
            x: this.x,
            y: this.y
        };
    }
    
    // Get bounds for rendering
    getRenderBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    // Check if entity is on screen
    isOnScreen(camera, canvasWidth, canvasHeight) {
        const bounds = this.getRenderBounds();
        const screenPos = camera ? {
            x: bounds.x - camera.x,
            y: bounds.y - camera.y
        } : bounds;
        
        return !(screenPos.x + bounds.width < 0 || 
                screenPos.x > canvasWidth ||
                screenPos.y + bounds.height < 0 || 
                screenPos.y > canvasHeight);
    }
    
    // Render the entity
    render(renderSystem) {
        if (!this.visible || !this.sprite) return;
        
        renderSystem.drawEntity(this);
    }
    
    // Handle interaction with another entity
    interact(other) {
        // Override in subclasses
        Utils.log(`${this.constructor.name} interacting with ${other.constructor.name}`);
    }
    
    // Destroy the entity
    destroy() {
        this.active = false;
        this.visible = false;
    }
    
    // Serialize entity data for saving
    serialize() {
        return {
            type: this.constructor.name,
            x: this.x,
            y: this.y,
            direction: this.direction,
            active: this.active,
            visible: this.visible
        };
    }
    
    // Deserialize entity data from save
    deserialize(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.direction = data.direction || this.direction;
        this.active = data.active !== undefined ? data.active : this.active;
        this.visible = data.visible !== undefined ? data.visible : this.visible;
    }
}