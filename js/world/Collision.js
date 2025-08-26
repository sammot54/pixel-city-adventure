// Collision detection system
class Collision {
    static checkEntityCollision(entity, map, newX, newY) {
        if (!map) return false;
        
        // Get entity collision bounds at new position
        const bounds = {
            x: newX - entity.collisionWidth / 2 + entity.collisionOffsetX,
            y: newY - entity.collisionHeight / 2 + entity.collisionOffsetY,
            width: entity.collisionWidth,
            height: entity.collisionHeight
        };
        
        return map.checkCollision(bounds);
    }
    
    static resolveMapCollision(entity, map, deltaTime) {
        if (!entity.solid || !map) return;
        
        const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
        if (speed === 0) return;
        
        // Calculate new position
        const newX = entity.x + entity.vx * deltaTime / 1000;
        const newY = entity.y + entity.vy * deltaTime / 1000;
        
        // Check X movement
        let finalX = entity.x;
        if (entity.vx !== 0) {
            if (!this.checkEntityCollision(entity, map, newX, entity.y)) {
                finalX = newX;
            } else {
                // Collision on X axis, stop horizontal movement
                entity.vx = 0;
            }
        }
        
        // Check Y movement
        let finalY = entity.y;
        if (entity.vy !== 0) {
            if (!this.checkEntityCollision(entity, map, finalX, newY)) {
                finalY = newY;
            } else {
                // Collision on Y axis, stop vertical movement
                entity.vy = 0;
            }
        }
        
        // Update entity position
        entity.x = finalX;
        entity.y = finalY;
    }
    
    static resolveEntityCollision(entity1, entity2) {
        if (!entity1.solid || !entity2.solid) return false;
        
        const bounds1 = entity1.getCollisionBounds();
        const bounds2 = entity2.getCollisionBounds();
        
        if (!Utils.rectCollision(bounds1, bounds2)) return false;
        
        // Calculate overlap
        const overlapX = Math.min(bounds1.x + bounds1.width - bounds2.x, bounds2.x + bounds2.width - bounds1.x);
        const overlapY = Math.min(bounds1.y + bounds1.height - bounds2.y, bounds2.y + bounds2.height - bounds1.y);
        
        // Resolve collision by moving entities apart
        if (overlapX < overlapY) {
            // Resolve horizontally
            if (bounds1.x < bounds2.x) {
                entity1.x -= overlapX / 2;
                entity2.x += overlapX / 2;
            } else {
                entity1.x += overlapX / 2;
                entity2.x -= overlapX / 2;
            }
        } else {
            // Resolve vertically
            if (bounds1.y < bounds2.y) {
                entity1.y -= overlapY / 2;
                entity2.y += overlapY / 2;
            } else {
                entity1.y += overlapY / 2;
                entity2.y -= overlapY / 2;
            }
        }
        
        return true;
    }
    
    static checkLineOfSight(start, end, map, tileSize = CONSTANTS.TILE_SIZE) {
        if (!map) return true;
        
        // Bresenham's line algorithm for line-of-sight checking
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const sx = start.x < end.x ? 1 : -1;
        const sy = start.y < end.y ? 1 : -1;
        let err = dx - dy;
        
        let x = Math.floor(start.x / tileSize);
        let y = Math.floor(start.y / tileSize);
        const endX = Math.floor(end.x / tileSize);
        const endY = Math.floor(end.y / tileSize);
        
        while (true) {
            // Check if current tile blocks line of sight
            if (map.hasCollision(x, y)) {
                return false;
            }
            
            if (x === endX && y === endY) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        
        return true;
    }
    
    static findPath(start, end, map) {
        // Simple A* pathfinding implementation
        // For now, return direct path - can be enhanced later
        return [start, end];
    }
    
    static getCollisionNormal(bounds1, bounds2) {
        // Get the collision normal vector
        const centerX1 = bounds1.x + bounds1.width / 2;
        const centerY1 = bounds1.y + bounds1.height / 2;
        const centerX2 = bounds2.x + bounds2.width / 2;
        const centerY2 = bounds2.y + bounds2.height / 2;
        
        const dx = centerX2 - centerX1;
        const dy = centerY2 - centerY1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return { x: 0, y: -1 }; // Default up
        
        return {
            x: dx / length,
            y: dy / length
        };
    }
    
    static slideAlongWall(entity, map, originalVelocity, deltaTime) {
        // Try to slide along walls when collision occurs
        const originalX = entity.x;
        const originalY = entity.y;
        
        // Try horizontal movement only
        entity.x = originalX + originalVelocity.x * deltaTime / 1000;
        entity.y = originalY;
        
        if (!this.checkEntityCollision(entity, map, entity.x, entity.y)) {
            return true; // Successful horizontal slide
        }
        
        // Try vertical movement only
        entity.x = originalX;
        entity.y = originalY + originalVelocity.y * deltaTime / 1000;
        
        if (!this.checkEntityCollision(entity, map, entity.x, entity.y)) {
            return true; // Successful vertical slide
        }
        
        // No slide possible, revert to original position
        entity.x = originalX;
        entity.y = originalY;
        return false;
    }
}