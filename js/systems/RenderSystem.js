// Rendering system for the game
class RenderSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = null;
        
        // Setup canvas for pixel art
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        
        // Rendering settings
        this.debugMode = false;
        this.showFPS = true;
        this.fpsHistory = [];
        this.maxFPSHistory = 60;
    }
    
    setCamera(camera) {
        this.camera = camera;
    }
    
    // Clear the canvas
    clear(color = CONSTANTS.COLORS.BACKGROUND) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Save canvas state
    save() {
        this.ctx.save();
    }
    
    // Restore canvas state
    restore() {
        this.ctx.restore();
    }
    
    // Apply camera transform
    applyCameraTransform() {
        if (this.camera) {
            this.ctx.translate(-this.camera.x, -this.camera.y);
        }
    }
    
    // Reset camera transform
    resetCameraTransform() {
        if (this.camera) {
            this.ctx.translate(this.camera.x, this.camera.y);
        }
    }
    
    // World-to-screen coordinate conversion
    worldToScreen(worldX, worldY) {
        if (!this.camera) return { x: worldX, y: worldY };
        return {
            x: worldX - this.camera.x,
            y: worldY - this.camera.y
        };
    }
    
    // Screen-to-world coordinate conversion
    screenToWorld(screenX, screenY) {
        if (!this.camera) return { x: screenX, y: screenY };
        return {
            x: screenX + this.camera.x,
            y: screenY + this.camera.y
        };
    }
    
    // Check if rectangle is visible on screen
    isVisible(x, y, width, height) {
        if (!this.camera) return true;
        
        const screenPos = this.worldToScreen(x, y);
        return !(screenPos.x + width < 0 || 
                screenPos.x > this.canvas.width ||
                screenPos.y + height < 0 || 
                screenPos.y > this.canvas.height);
    }
    
    // Draw tile map
    drawTileMap(map, tileset) {
        if (!map || !tileset) return;
        
        this.save();
        this.applyCameraTransform();
        
        const tileSize = CONSTANTS.TILE_SIZE;
        const startX = this.camera ? Math.floor(this.camera.x / tileSize) : 0;
        const startY = this.camera ? Math.floor(this.camera.y / tileSize) : 0;
        const endX = Math.min(startX + Math.ceil(this.canvas.width / tileSize) + 1, map.width);
        const endY = Math.min(startY + Math.ceil(this.canvas.height / tileSize) + 1, map.height);
        
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const tileId = map.getTile(x, y);
                if (tileId !== null) {
                    this.drawTile(tileset, tileId, x * tileSize, y * tileSize);
                }
            }
        }
        
        this.restore();
    }
    
    // Draw a single tile
    drawTile(tileset, tileId, x, y, size = CONSTANTS.TILE_SIZE) {
        const tilesPerRow = tileset.width / size;
        const sourceX = (tileId % tilesPerRow) * size;
        const sourceY = Math.floor(tileId / tilesPerRow) * size;
        
        this.ctx.drawImage(
            tileset,
            sourceX, sourceY, size, size,
            x, y, size, size
        );
    }
    
    // Draw sprite with optional animation frame
    drawSprite(sprite, x, y, width = 32, height = 32, frameX = 0, frameY = 0, frameWidth = 32, frameHeight = 32) {
        if (!sprite) return;
        
        this.ctx.drawImage(
            sprite,
            frameX, frameY, frameWidth, frameHeight,
            Math.floor(x), Math.floor(y), width, height
        );
    }
    
    // Draw entity
    drawEntity(entity) {
        if (!entity.sprite || !this.isVisible(entity.x - 16, entity.y - 16, 32, 32)) return;
        
        this.save();
        this.applyCameraTransform();
        
        const frame = spriteLoader.getAnimationFrame(entity.direction, entity.animationTime, entity.isMoving);
        this.drawSprite(
            entity.sprite,
            entity.x - 16, entity.y - 16,
            32, 32,
            frame.frameX, frame.frameY,
            32, 32
        );
        
        // Draw debug info
        if (this.debugMode) {
            this.drawEntityDebugInfo(entity);
        }
        
        this.restore();
    }
    
    // Draw debug information for entity
    drawEntityDebugInfo(entity) {
        // Draw collision bounds
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(entity.x - 12, entity.y - 8, 24, 16);
        
        // Draw position
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.floor(entity.x)},${Math.floor(entity.y)}`, entity.x, entity.y - 20);
    }
    
    // Draw text
    drawText(text, x, y, options = {}) {
        const defaults = {
            font: '16px monospace',
            fillStyle: CONSTANTS.COLORS.TEXT,
            textAlign: 'left',
            textBaseline: 'top',
            strokeStyle: null,
            strokeWidth: 0
        };
        
        const opts = { ...defaults, ...options };
        
        this.ctx.font = opts.font;
        this.ctx.fillStyle = opts.fillStyle;
        this.ctx.textAlign = opts.textAlign;
        this.ctx.textBaseline = opts.textBaseline;
        
        if (opts.strokeStyle && opts.strokeWidth > 0) {
            this.ctx.strokeStyle = opts.strokeStyle;
            this.ctx.lineWidth = opts.strokeWidth;
            this.ctx.strokeText(text, x, y);
        }
        
        this.ctx.fillText(text, x, y);
    }
    
    // Draw wrapped text
    drawWrappedText(text, x, y, maxWidth, lineHeight, options = {}) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                this.drawText(line, x, currentY, options);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.drawText(line, x, currentY, options);
        
        return currentY + lineHeight; // Return the final Y position
    }
    
    // Draw rectangle
    drawRect(x, y, width, height, fillStyle, strokeStyle = null) {
        if (fillStyle) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(x, y, width, height);
        }
        
        if (strokeStyle) {
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, width, height);
        }
    }
    
    // Draw circle
    drawCircle(x, y, radius, fillStyle, strokeStyle = null) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (fillStyle) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.fill();
        }
        
        if (strokeStyle) {
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }
    
    // Draw line
    drawLine(x1, y1, x2, y2, strokeStyle, lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
    }
    
    // Draw health bar
    drawHealthBar(x, y, width, height, currentHp, maxHp, backgroundColor = '#333', foregroundColor = '#e53e3e') {
        const percentage = Math.max(0, Math.min(1, currentHp / maxHp));
        
        // Background
        this.drawRect(x, y, width, height, backgroundColor, '#666');
        
        // Foreground
        if (percentage > 0) {
            this.drawRect(x + 1, y + 1, (width - 2) * percentage, height - 2, foregroundColor);
        }
    }
    
    // Draw progress bar
    drawProgressBar(x, y, width, height, progress, backgroundColor = '#333', foregroundColor = '#4299e1') {
        const percentage = Math.max(0, Math.min(1, progress));
        
        // Background
        this.drawRect(x, y, width, height, backgroundColor, '#666');
        
        // Foreground
        if (percentage > 0) {
            this.drawRect(x + 1, y + 1, (width - 2) * percentage, height - 2, foregroundColor);
        }
    }
    
    // Draw FPS counter
    drawFPS(deltaTime) {
        if (!this.showFPS) return;
        
        const fps = Math.round(1000 / deltaTime);
        this.fpsHistory.push(fps);
        
        if (this.fpsHistory.length > this.maxFPSHistory) {
            this.fpsHistory.shift();
        }
        
        const avgFPS = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
        
        this.drawText(`FPS: ${avgFPS}`, 10, 10, {
            font: '14px monospace',
            fillStyle: avgFPS < 50 ? '#e53e3e' : avgFPS < 55 ? '#ed8936' : '#38a169'
        });
    }
    
    // Draw debug grid
    drawDebugGrid() {
        if (!this.debugMode) return;
        
        this.save();
        this.applyCameraTransform();
        
        const tileSize = CONSTANTS.TILE_SIZE;
        const startX = this.camera ? Math.floor(this.camera.x / tileSize) * tileSize : 0;
        const startY = this.camera ? Math.floor(this.camera.y / tileSize) * tileSize : 0;
        const endX = startX + this.canvas.width + tileSize;
        const endY = startY + this.canvas.height + tileSize;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = startX; x < endX; x += tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = startY; y < endY; y += tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
        
        this.restore();
    }
    
    // Toggle debug mode
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        Utils.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
    }
    
    // Toggle FPS display
    toggleFPSDisplay() {
        this.showFPS = !this.showFPS;
        Utils.log(`FPS display: ${this.showFPS ? 'ON' : 'OFF'}`);
    }
}

// Create global render system instance (will be initialized in main.js)
let renderSystem = null;