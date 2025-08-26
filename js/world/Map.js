// Map system for tile-based world
class Map {
    constructor(width = 32, height = 24) {
        this.width = width;
        this.height = height;
        this.tileSize = CONSTANTS.TILE_SIZE;
        
        // Map data - 2D array of tile IDs
        this.tiles = [];
        this.collisionMap = [];
        
        // Tileset
        this.tileset = null;
        
        // Initialize empty map
        this.initializeEmpty();
    }
    
    initializeEmpty() {
        // Initialize with empty arrays
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            this.collisionMap[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = 0; // Default to grass
                this.collisionMap[y][x] = false; // No collision by default
            }
        }
    }
    
    async initialize() {
        // Load tileset
        this.tileset = await spriteLoader.loadSprite('tileset');
        
        // Generate a simple city map
        this.generateCityMap();
        
        Utils.log('Map initialized');
    }
    
    generateCityMap() {
        // Create a simple city layout
        
        // Fill with grass
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = 0; // Grass
                this.collisionMap[y][x] = false;
            }
        }
        
        // Add roads (horizontal and vertical)
        for (let x = 0; x < this.width; x++) {
            this.tiles[Math.floor(this.height / 2)][x] = 1; // Road
            this.collisionMap[Math.floor(this.height / 2)][x] = false;
        }
        
        for (let y = 0; y < this.height; y++) {
            this.tiles[y][Math.floor(this.width / 2)] = 1; // Road
            this.collisionMap[y][Math.floor(this.width / 2)] = false;
        }
        
        // Add sidewalks around roads
        const centerY = Math.floor(this.height / 2);
        const centerX = Math.floor(this.width / 2);
        
        for (let x = 0; x < this.width; x++) {
            if (centerY > 0) {
                this.tiles[centerY - 1][x] = 4; // Sidewalk
                this.collisionMap[centerY - 1][x] = false;
            }
            if (centerY < this.height - 1) {
                this.tiles[centerY + 1][x] = 4; // Sidewalk
                this.collisionMap[centerY + 1][x] = false;
            }
        }
        
        for (let y = 0; y < this.height; y++) {
            if (centerX > 0) {
                this.tiles[y][centerX - 1] = 4; // Sidewalk
                this.collisionMap[y][centerX - 1] = false;
            }
            if (centerX < this.width - 1) {
                this.tiles[y][centerX + 1] = 4; // Sidewalk
                this.collisionMap[y][centerX + 1] = false;
            }
        }
        
        // Add some buildings
        this.addBuildings();
        
        // Add some trees and decorations
        this.addDecorations();
    }
    
    addBuildings() {
        const buildings = [
            { x: 5, y: 5, width: 4, height: 3 },
            { x: 15, y: 3, width: 5, height: 4 },
            { x: 22, y: 6, width: 3, height: 3 },
            { x: 8, y: 16, width: 4, height: 4 },
            { x: 18, y: 17, width: 6, height: 3 }
        ];
        
        for (const building of buildings) {
            for (let y = building.y; y < building.y + building.height; y++) {
                for (let x = building.x; x < building.x + building.width; x++) {
                    if (this.isValidTile(x, y)) {
                        if (y === building.y + building.height - 1 && x === building.x + Math.floor(building.width / 2)) {
                            // Door
                            this.tiles[y][x] = 5;
                            this.collisionMap[y][x] = false;
                        } else if (y === building.y) {
                            // Window or roof
                            this.tiles[y][x] = 6;
                            this.collisionMap[y][x] = true;
                        } else {
                            // Wall
                            this.tiles[y][x] = 2;
                            this.collisionMap[y][x] = true;
                        }
                    }
                }
            }
        }
    }
    
    addDecorations() {
        // Add some trees
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            
            // Don't place on roads or buildings
            if (this.getTile(x, y) === 0 && !this.hasCollision(x, y)) {
                this.tiles[y][x] = 7; // Tree
                this.collisionMap[y][x] = true;
            }
        }
    }
    
    // Get tile ID at position
    getTile(x, y) {
        if (!this.isValidTile(x, y)) return null;
        return this.tiles[y][x];
    }
    
    // Set tile at position
    setTile(x, y, tileId) {
        if (!this.isValidTile(x, y)) return false;
        this.tiles[y][x] = tileId;
        return true;
    }
    
    // Check if position has collision
    hasCollision(x, y) {
        if (!this.isValidTile(x, y)) return true; // Out of bounds = collision
        return this.collisionMap[y][x];
    }
    
    // Set collision at position
    setCollision(x, y, hasCollision) {
        if (!this.isValidTile(x, y)) return false;
        this.collisionMap[y][x] = hasCollision;
        return true;
    }
    
    // Check if tile coordinates are valid
    isValidTile(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    // Convert world coordinates to tile coordinates
    worldToTile(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }
    
    // Convert tile coordinates to world coordinates (center of tile)
    tileToWorld(tileX, tileY) {
        return {
            x: tileX * this.tileSize + this.tileSize / 2,
            y: tileY * this.tileSize + this.tileSize / 2
        };
    }
    
    // Check collision for entity bounds
    checkCollision(bounds) {
        const startTileX = Math.floor(bounds.x / this.tileSize);
        const endTileX = Math.floor((bounds.x + bounds.width) / this.tileSize);
        const startTileY = Math.floor(bounds.y / this.tileSize);
        const endTileY = Math.floor((bounds.y + bounds.height) / this.tileSize);
        
        for (let y = startTileY; y <= endTileY; y++) {
            for (let x = startTileX; x <= endTileX; x++) {
                if (this.hasCollision(x, y)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Get all collision tiles that overlap with bounds
    getCollidingTiles(bounds) {
        const tiles = [];
        const startTileX = Math.floor(bounds.x / this.tileSize);
        const endTileX = Math.floor((bounds.x + bounds.width) / this.tileSize);
        const startTileY = Math.floor(bounds.y / this.tileSize);
        const endTileY = Math.floor((bounds.y + bounds.height) / this.tileSize);
        
        for (let y = startTileY; y <= endTileY; y++) {
            for (let x = startTileX; x <= endTileX; x++) {
                if (this.hasCollision(x, y)) {
                    tiles.push({ x, y });
                }
            }
        }
        
        return tiles;
    }
    
    render(renderSystem) {
        if (!this.tileset) return;
        
        renderSystem.drawTileMap(this, this.tileset);
        
        // Draw collision map in debug mode
        if (renderSystem.debugMode) {
            this.renderCollisionDebug(renderSystem);
        }
    }
    
    renderCollisionDebug(renderSystem) {
        renderSystem.save();
        renderSystem.applyCameraTransform();
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.hasCollision(x, y)) {
                    const worldX = x * this.tileSize;
                    const worldY = y * this.tileSize;
                    
                    renderSystem.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    renderSystem.ctx.fillRect(worldX, worldY, this.tileSize, this.tileSize);
                }
            }
        }
        
        renderSystem.restore();
    }
    
    // Get spawn points (doors or specific tiles)
    getSpawnPoints() {
        const spawnPoints = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tileId = this.getTile(x, y);
                if (tileId === 5) { // Door tiles are spawn points
                    const worldPos = this.tileToWorld(x, y);
                    spawnPoints.push({
                        x: worldPos.x,
                        y: worldPos.y + this.tileSize, // Spawn below the door
                        type: 'door'
                    });
                }
            }
        }
        
        // Add default spawn point if no doors found
        if (spawnPoints.length === 0) {
            spawnPoints.push({
                x: this.tileSize * 2,
                y: this.tileSize * 2,
                type: 'default'
            });
        }
        
        return spawnPoints;
    }
    
    // Serialize map data
    serialize() {
        return {
            width: this.width,
            height: this.height,
            tiles: this.tiles,
            collisionMap: this.collisionMap
        };
    }
    
    // Deserialize map data
    deserialize(data) {
        this.width = data.width;
        this.height = data.height;
        this.tiles = data.tiles;
        this.collisionMap = data.collisionMap;
    }
}