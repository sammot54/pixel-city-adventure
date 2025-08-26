// Camera system for following the player and managing viewport
class Camera {
    constructor(x = 0, y = 0, width = CONSTANTS.CANVAS_WIDTH, height = CONSTANTS.CANVAS_HEIGHT) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.target = null;
        this.followSpeed = 5;
        this.smoothing = true;
        
        // Camera bounds (optional)
        this.bounds = null; // { x, y, width, height }
        
        // Shake effect
        this.shake = 0;
        this.shakeDecay = 0.95;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        
        // Zoom (for future use)
        this.zoom = 1.0;
        this.targetZoom = 1.0;
    }
    
    setTarget(target) {
        this.target = target;
    }
    
    setBounds(x, y, width, height) {
        this.bounds = { x, y, width, height };
    }
    
    clearBounds() {
        this.bounds = null;
    }
    
    update(deltaTime) {
        if (this.target) {
            this.followTarget(deltaTime);
        }
        
        this.updateShake();
        this.updateZoom(deltaTime);
        this.applyBounds();
    }
    
    followTarget(deltaTime) {
        const targetX = this.target.x - this.width / 2;
        const targetY = this.target.y - this.height / 2;
        
        if (this.smoothing) {
            // Smooth camera movement
            const factor = 1 - Math.pow(0.001, deltaTime / 1000);
            this.x = Utils.lerp(this.x, targetX, factor);
            this.y = Utils.lerp(this.y, targetY, factor);
        } else {
            // Immediate camera movement
            this.x = targetX;
            this.y = targetY;
        }
    }
    
    updateShake() {
        if (this.shake > 0) {
            this.shakeOffsetX = (Math.random() - 0.5) * this.shake * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shake * 2;
            this.shake *= this.shakeDecay;
            
            if (this.shake < 0.5) {
                this.shake = 0;
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }
    }
    
    updateZoom(deltaTime) {
        if (Math.abs(this.zoom - this.targetZoom) > 0.01) {
            const factor = 1 - Math.pow(0.001, deltaTime / 1000);
            this.zoom = Utils.lerp(this.zoom, this.targetZoom, factor);
        }
    }
    
    applyBounds() {
        if (!this.bounds) return;
        
        // Clamp camera position to bounds
        this.x = Utils.clamp(this.x, this.bounds.x, this.bounds.x + this.bounds.width - this.width);
        this.y = Utils.clamp(this.y, this.bounds.y, this.bounds.y + this.bounds.height - this.height);
    }
    
    // Get actual camera position including shake
    getX() {
        return this.x + this.shakeOffsetX;
    }
    
    getY() {
        return this.y + this.shakeOffsetY;
    }
    
    // World to screen coordinate conversion
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.getX()) * this.zoom,
            y: (worldY - this.getY()) * this.zoom
        };
    }
    
    // Screen to world coordinate conversion
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.zoom) + this.getX(),
            y: (screenY / this.zoom) + this.getY()
        };
    }
    
    // Check if a point is visible
    isPointVisible(x, y) {
        const screenPos = this.worldToScreen(x, y);
        return screenPos.x >= 0 && screenPos.x <= this.width &&
               screenPos.y >= 0 && screenPos.y <= this.height;
    }
    
    // Check if a rectangle is visible
    isRectVisible(x, y, width, height) {
        const screenPos = this.worldToScreen(x, y);
        const scaledWidth = width * this.zoom;
        const scaledHeight = height * this.zoom;
        
        return !(screenPos.x + scaledWidth < 0 || 
                screenPos.x > this.width ||
                screenPos.y + scaledHeight < 0 || 
                screenPos.y > this.height);
    }
    
    // Move camera to position
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }
    
    // Move camera by offset
    moveBy(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    
    // Center camera on position
    centerOn(x, y) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.applyBounds();
    }
    
    // Add screen shake
    addShake(intensity) {
        this.shake = Math.max(this.shake, intensity);
    }
    
    // Set zoom level
    setZoom(zoom) {
        this.targetZoom = Utils.clamp(zoom, 0.5, 3.0);
    }
    
    // Get camera viewport bounds in world coordinates
    getViewportBounds() {
        return {
            x: this.getX(),
            y: this.getY(),
            width: this.width / this.zoom,
            height: this.height / this.zoom
        };
    }
    
    // Get center of camera in world coordinates
    getCenter() {
        return {
            x: this.getX() + (this.width / 2) / this.zoom,
            y: this.getY() + (this.height / 2) / this.zoom
        };
    }
}