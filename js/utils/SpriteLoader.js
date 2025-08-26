// Sprite loading and management system
class SpriteLoader {
    constructor() {
        this.sprites = new Map();
        this.loaded = new Set();
        this.loading = new Set();
        this.onLoadCallbacks = [];
    }
    
    // Create a simple pixel art character sprite
    createCharacterSprite(character) {
        const canvas = document.createElement('canvas');
        canvas.width = 128; // 4 frames * 32px width
        canvas.height = 128; // 4 directions * 32px height
        const ctx = canvas.getContext('2d');
        
        // Enable pixel art rendering
        ctx.imageSmoothingEnabled = false;
        
        const color = character.color || CONSTANTS.COLORS.PRIMARY;
        const rgb = Utils.hexToRgb(color);
        
        // Draw character sprites for each direction and frame
        for (let dir = 0; dir < 4; dir++) { // up, right, down, left
            for (let frame = 0; frame < 4; frame++) { // idle, walk1, walk2, walk3
                this.drawCharacterFrame(ctx, frame * 32, dir * 32, rgb, frame > 0);
            }
        }
        
        return canvas;
    }
    
    drawCharacterFrame(ctx, x, y, rgb, isWalking) {
        // Simple pixel character (16x24 centered in 32x32)
        const offsetX = x + 8;
        const offsetY = y + 4;
        
        // Head
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(offsetX + 6, offsetY, 4, 4);
        
        // Body
        ctx.fillRect(offsetX + 5, offsetY + 4, 6, 8);
        
        // Arms
        const armOffset = isWalking ? Math.floor(Math.random() * 2) : 0;
        ctx.fillRect(offsetX + 2, offsetY + 5 + armOffset, 3, 4);
        ctx.fillRect(offsetX + 11, offsetY + 5 - armOffset, 3, 4);
        
        // Legs
        const legOffset = isWalking ? (Math.random() > 0.5 ? 1 : -1) : 0;
        ctx.fillRect(offsetX + 5, offsetY + 12, 2, 8);
        ctx.fillRect(offsetX + 9, offsetY + 12 + legOffset, 2, 8);
        
        // Simple face
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX + 7, offsetY + 1, 1, 1);
        ctx.fillRect(offsetX + 8, offsetY + 1, 1, 1);
    }
    
    // Create tileset for map
    createTileset() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; // 8 tiles * 32px
        canvas.height = 256; // 8 tiles * 32px
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = false;
        
        // Tile 0: Grass
        this.drawTile(ctx, 0, 0, '#4a7c59');
        
        // Tile 1: Road
        this.drawTile(ctx, 32, 0, '#6b7280');
        
        // Tile 2: Building wall
        this.drawTile(ctx, 64, 0, '#9ca3af');
        
        // Tile 3: Water
        this.drawTile(ctx, 96, 0, '#3b82f6');
        
        // Tile 4: Sidewalk
        this.drawTile(ctx, 128, 0, '#d1d5db');
        
        // Tile 5: Door
        this.drawTile(ctx, 160, 0, '#7c2d12');
        
        // Tile 6: Window
        this.drawTile(ctx, 192, 0, '#60a5fa');
        
        // Tile 7: Tree
        this.drawTile(ctx, 224, 0, '#16a34a');
        
        return canvas;
    }
    
    drawTile(ctx, x, y, baseColor) {
        const rgb = Utils.hexToRgb(baseColor);
        
        // Fill base color
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, 32, 32);
        
        // Add some texture/pattern
        ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillRect(x + i * 4, y + j * 4, 2, 2);
                }
            }
        }
    }
    
    // Load a sprite (or create if it's a generated sprite)
    loadSprite(name, src = null) {
        if (this.sprites.has(name)) {
            return Promise.resolve(this.sprites.get(name));
        }
        
        if (this.loading.has(name)) {
            return new Promise((resolve) => {
                const checkLoaded = () => {
                    if (this.loaded.has(name)) {
                        resolve(this.sprites.get(name));
                    } else {
                        setTimeout(checkLoaded, 10);
                    }
                };
                checkLoaded();
            });
        }
        
        this.loading.add(name);
        
        // Handle generated sprites
        if (name.startsWith('character_')) {
            const characterId = name.split('_')[1];
            const character = CONSTANTS.CHARACTERS[characterId.toUpperCase()];
            if (character) {
                const sprite = this.createCharacterSprite(character);
                this.sprites.set(name, sprite);
                this.loaded.add(name);
                this.loading.delete(name);
                return Promise.resolve(sprite);
            }
        }
        
        if (name === 'tileset') {
            const tileset = this.createTileset();
            this.sprites.set(name, tileset);
            this.loaded.add(name);
            this.loading.delete(name);
            return Promise.resolve(tileset);
        }
        
        // Load from file if src is provided
        if (src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.sprites.set(name, img);
                    this.loaded.add(name);
                    this.loading.delete(name);
                    resolve(img);
                };
                img.onerror = () => {
                    this.loading.delete(name);
                    reject(new Error(`Failed to load sprite: ${src}`));
                };
                img.src = src;
            });
        }
        
        // Create placeholder sprite
        const placeholder = this.createPlaceholderSprite();
        this.sprites.set(name, placeholder);
        this.loaded.add(name);
        this.loading.delete(name);
        return Promise.resolve(placeholder);
    }
    
    createPlaceholderSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#ff00ff'; // Magenta placeholder
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, 4, 24, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', 16, 20);
        
        return canvas;
    }
    
    // Get sprite synchronously (must be loaded first)
    getSprite(name) {
        return this.sprites.get(name) || null;
    }
    
    // Load all character sprites
    async loadAllCharacterSprites() {
        const promises = [];
        for (const characterKey of Object.keys(CONSTANTS.CHARACTERS)) {
            promises.push(this.loadSprite(`character_${characterKey.toLowerCase()}`));
        }
        promises.push(this.loadSprite('tileset'));
        
        await Promise.all(promises);
        Utils.log('All sprites loaded');
    }
    
    // Draw sprite with animation support
    drawSprite(ctx, spriteName, x, y, width = 32, height = 32, frameX = 0, frameY = 0, frameWidth = 32, frameHeight = 32) {
        const sprite = this.getSprite(spriteName);
        if (!sprite) {
            // Draw placeholder
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(x, y, width, height);
            return;
        }
        
        ctx.drawImage(
            sprite,
            frameX, frameY, frameWidth, frameHeight,
            x, y, width, height
        );
    }
    
    // Get animation frame based on direction and animation time
    getAnimationFrame(direction, animationTime, isMoving = false) {
        if (!isMoving) {
            return { frameX: 0, frameY: this.getDirectionY(direction) };
        }
        
        // Walking animation: frames 1, 2, 3, 2, repeat
        const frameSequence = [1, 2, 3, 2];
        const frameIndex = Math.floor(animationTime * 8) % frameSequence.length;
        const frame = frameSequence[frameIndex];
        
        return {
            frameX: frame * 32,
            frameY: this.getDirectionY(direction)
        };
    }
    
    getDirectionY(direction) {
        switch (direction) {
            case 'up': return 0;
            case 'right': return 32;
            case 'down': return 64;
            case 'left': return 96;
            default: return 64; // Default to down
        }
    }
}

// Create global sprite loader instance
const spriteLoader = new SpriteLoader();