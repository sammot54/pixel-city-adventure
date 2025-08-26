// Input handling system
class InputSystem {
    constructor() {
        this.keys = new Set();
        this.prevKeys = new Set();
        this.mousePos = { x: 0, y: 0 };
        this.mouseButtons = new Set();
        this.prevMouseButtons = new Set();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.key);
            
            // Prevent default for game controls
            if (this.isGameKey(e.key)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
        
        // Mouse events
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                this.mousePos.x = (e.clientX - rect.left) * scaleX;
                this.mousePos.y = (e.clientY - rect.top) * scaleY;
            });
            
            canvas.addEventListener('mousedown', (e) => {
                this.mouseButtons.add(e.button);
                e.preventDefault();
            });
            
            canvas.addEventListener('mouseup', (e) => {
                this.mouseButtons.delete(e.button);
            });
            
            // Prevent context menu
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
        
        // Touch events for mobile
        if (canvas) {
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                this.mousePos.x = (touch.clientX - rect.left) * scaleX;
                this.mousePos.y = (touch.clientY - rect.top) * scaleY;
                this.mouseButtons.add(0); // Treat touch as left mouse button
            });
            
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                this.mousePos.x = (touch.clientX - rect.left) * scaleX;
                this.mousePos.y = (touch.clientY - rect.top) * scaleY;
            });
            
            canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mouseButtons.delete(0);
            });
        }
        
        // Prevent scrolling on mobile
        document.body.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.body.addEventListener('touchend', (e) => {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.tagName === 'CANVAS') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    isGameKey(key) {
        const gameKeys = [
            ...CONSTANTS.CONTROLS.UP,
            ...CONSTANTS.CONTROLS.DOWN,
            ...CONSTANTS.CONTROLS.LEFT,
            ...CONSTANTS.CONTROLS.RIGHT,
            ...CONSTANTS.CONTROLS.INTERACT,
            ...CONSTANTS.CONTROLS.INVENTORY,
            ...CONSTANTS.CONTROLS.MENU
        ];
        return gameKeys.includes(key);
    }
    
    // Update method to be called each frame
    update() {
        // Store previous frame state
        this.prevKeys = new Set(this.keys);
        this.prevMouseButtons = new Set(this.mouseButtons);
    }
    
    // Check if key is currently pressed
    isKeyDown(key) {
        return this.keys.has(key);
    }
    
    // Check if key was just pressed this frame
    isKeyPressed(key) {
        return this.keys.has(key) && !this.prevKeys.has(key);
    }
    
    // Check if key was just released this frame
    isKeyReleased(key) {
        return !this.keys.has(key) && this.prevKeys.has(key);
    }
    
    // Check if any key in array is down
    isAnyKeyDown(keys) {
        return keys.some(key => this.isKeyDown(key));
    }
    
    // Check if any key in array was just pressed
    isAnyKeyPressed(keys) {
        return keys.some(key => this.isKeyPressed(key));
    }
    
    // Movement input helpers
    getMovementVector() {
        const vector = { x: 0, y: 0 };
        
        if (this.isAnyKeyDown(CONSTANTS.CONTROLS.LEFT)) {
            vector.x -= 1;
        }
        if (this.isAnyKeyDown(CONSTANTS.CONTROLS.RIGHT)) {
            vector.x += 1;
        }
        if (this.isAnyKeyDown(CONSTANTS.CONTROLS.UP)) {
            vector.y -= 1;
        }
        if (this.isAnyKeyDown(CONSTANTS.CONTROLS.DOWN)) {
            vector.y += 1;
        }
        
        // Normalize diagonal movement
        if (vector.x !== 0 && vector.y !== 0) {
            const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            vector.x /= length;
            vector.y /= length;
        }
        
        return vector;
    }
    
    // Get primary movement direction for animation
    getPrimaryDirection() {
        const vector = this.getMovementVector();
        
        if (Math.abs(vector.x) > Math.abs(vector.y)) {
            return vector.x > 0 ? 'right' : 'left';
        } else if (vector.y !== 0) {
            return vector.y > 0 ? 'down' : 'up';
        }
        
        return null;
    }
    
    // Check for interact input
    isInteractPressed() {
        return this.isAnyKeyPressed(CONSTANTS.CONTROLS.INTERACT);
    }
    
    // Check for inventory input
    isInventoryPressed() {
        return this.isAnyKeyPressed(CONSTANTS.CONTROLS.INVENTORY);
    }
    
    // Check for menu input
    isMenuPressed() {
        return this.isAnyKeyPressed(CONSTANTS.CONTROLS.MENU);
    }
    
    // Mouse input helpers
    isMouseDown(button = 0) {
        return this.mouseButtons.has(button);
    }
    
    isMousePressed(button = 0) {
        return this.mouseButtons.has(button) && !this.prevMouseButtons.has(button);
    }
    
    isMouseReleased(button = 0) {
        return !this.mouseButtons.has(button) && this.prevMouseButtons.has(button);
    }
    
    getMousePosition() {
        return { ...this.mousePos };
    }
    
    // Virtual gamepad for mobile
    drawVirtualGamepad(ctx) {
        if (!this.isMobile()) return;
        
        const canvas = ctx.canvas;
        const buttonSize = 60;
        const margin = 20;
        
        // Movement pad (left side)
        const padX = margin + buttonSize;
        const padY = canvas.height - margin - buttonSize;
        
        // Draw D-pad background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(padX, padY, buttonSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction buttons
        const directions = [
            { key: 'up', x: padX, y: padY - buttonSize/2, symbol: '↑' },
            { key: 'down', x: padX, y: padY + buttonSize/2, symbol: '↓' },
            { key: 'left', x: padX - buttonSize/2, y: padY, symbol: '←' },
            { key: 'right', x: padX + buttonSize/2, y: padY, symbol: '→' }
        ];
        
        directions.forEach(dir => {
            const pressed = this.isAnyKeyDown(CONSTANTS.CONTROLS[dir.key.toUpperCase()]);
            ctx.fillStyle = pressed ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(dir.x, dir.y, 20, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dir.symbol, dir.x, dir.y);
        });
        
        // Action buttons (right side)
        const actionX = canvas.width - margin - buttonSize;
        const actionY = canvas.height - margin - buttonSize;
        
        // Interact button
        const interactPressed = this.isAnyKeyDown(CONSTANTS.CONTROLS.INTERACT);
        ctx.fillStyle = interactPressed ? 'rgba(66, 153, 225, 0.8)' : 'rgba(66, 153, 225, 0.4)';
        ctx.beginPath();
        ctx.arc(actionX, actionY, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('A', actionX, actionY);
        
        // Menu button
        const menuX = actionX - 50;
        const menuY = actionY - 50;
        const menuPressed = this.isAnyKeyDown(CONSTANTS.CONTROLS.MENU);
        ctx.fillStyle = menuPressed ? 'rgba(237, 137, 54, 0.8)' : 'rgba(237, 137, 54, 0.4)';
        ctx.beginPath();
        ctx.arc(menuX, menuY, 25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚐', menuX, menuY);
    }
    
    // Handle virtual gamepad touches
    handleVirtualGamepadTouch(x, y, isPressed) {
        if (!this.isMobile()) return;
        
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const buttonSize = 60;
        const margin = 20;
        
        // Movement pad
        const padX = margin + buttonSize;
        const padY = canvas.height - margin - buttonSize;
        
        // Check if touching movement pad
        const padDistance = Utils.distance(x, y, padX, padY);
        if (padDistance < buttonSize) {
            const angle = Math.atan2(y - padY, x - padX);
            const direction = Utils.getDirectionFromAngle(angle);
            
            // Clear all movement keys first
            CONSTANTS.CONTROLS.UP.forEach(key => this.keys.delete(key));
            CONSTANTS.CONTROLS.DOWN.forEach(key => this.keys.delete(key));
            CONSTANTS.CONTROLS.LEFT.forEach(key => this.keys.delete(key));
            CONSTANTS.CONTROLS.RIGHT.forEach(key => this.keys.delete(key));
            
            if (isPressed && padDistance > 20) { // Dead zone
                // Add the appropriate direction key
                CONSTANTS.CONTROLS[direction.toUpperCase()].forEach(key => {
                    if (key === 'w' || key === 's' || key === 'a' || key === 'd') {
                        this.keys.add(key);
                    }
                });
            }
            return;
        }
        
        // Action buttons
        const actionX = canvas.width - margin - buttonSize;
        const actionY = canvas.height - margin - buttonSize;
        
        // Interact button
        const interactDistance = Utils.distance(x, y, actionX, actionY);
        if (interactDistance < 30) {
            if (isPressed) {
                CONSTANTS.CONTROLS.INTERACT.forEach(key => {
                    if (key === ' ') this.keys.add(key);
                });
            } else {
                CONSTANTS.CONTROLS.INTERACT.forEach(key => this.keys.delete(key));
            }
            return;
        }
        
        // Menu button
        const menuX = actionX - 50;
        const menuY = actionY - 50;
        const menuDistance = Utils.distance(x, y, menuX, menuY);
        if (menuDistance < 25) {
            if (isPressed) {
                CONSTANTS.CONTROLS.MENU.forEach(key => {
                    if (key === 'Escape') this.keys.add(key);
                });
            } else {
                CONSTANTS.CONTROLS.MENU.forEach(key => this.keys.delete(key));
            }
            return;
        }
    }
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

// Create global input system instance
const inputSystem = new InputSystem();