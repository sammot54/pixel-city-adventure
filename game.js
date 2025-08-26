// Game state and objects
const gameState = {
    isRunning: false,
    canvas: null,
    ctx: null,
    player: {
        x: 400,
        y: 300,
        width: 30,
        height: 30,
        color: '#4CAF50',
        speed: 200, // pixels per second
        health: 100,
        level: 1
    },
    npcs: [
        {
            x: 100,
            y: 100,
            width: 25,
            height: 25,
            color: '#FF9800',
            message: 'Hello! Can you deliver this package to the NPC at the bottom right?',
            questGiven: false,
            isTarget: false
        },
        {
            x: 650,
            y: 500,
            width: 25,
            height: 25,
            color: '#2196F3',
            message: 'Thank you for the delivery! Here is your reward.',
            questGiven: false,
            isTarget: true
        }
    ],
    walls: [
        // Outer boundaries
        {x: 0, y: 0, width: 800, height: 10, color: '#666'}, // Top
        {x: 0, y: 590, width: 800, height: 10, color: '#666'}, // Bottom
        {x: 0, y: 0, width: 10, height: 600, color: '#666'}, // Left
        {x: 790, y: 0, width: 10, height: 600, color: '#666'}, // Right
        
        // Inner obstacles
        {x: 200, y: 200, width: 100, height: 20, color: '#888'}, // Horizontal wall
        {x: 500, y: 100, width: 20, height: 150, color: '#888'}, // Vertical wall
        {x: 300, y: 400, width: 200, height: 20, color: '#888'}, // Another horizontal wall
    ],
    keys: {},
    lastTime: 0,
    currentMission: 'Talk to the orange NPC for a mission',
    missionProgress: 'start'
};

// Input handling
function setupInput() {
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        gameState.keys[e.code] = false;
    });
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update player position based on input
function updatePlayer(deltaTime) {
    const player = gameState.player;
    const speed = player.speed * (deltaTime / 1000);
    
    let newX = player.x;
    let newY = player.y;
    
    // Handle input
    if (gameState.keys['KeyW'] || gameState.keys['ArrowUp']) {
        newY -= speed;
    }
    if (gameState.keys['KeyS'] || gameState.keys['ArrowDown']) {
        newY += speed;
    }
    if (gameState.keys['KeyA'] || gameState.keys['ArrowLeft']) {
        newX -= speed;
    }
    if (gameState.keys['KeyD'] || gameState.keys['ArrowRight']) {
        newX += speed;
    }
    
    // Check collision with walls
    const newPlayerRect = {x: newX, y: newY, width: player.width, height: player.height};
    
    let canMoveX = true;
    let canMoveY = true;
    
    for (const wall of gameState.walls) {
        if (checkCollision({x: newX, y: player.y, width: player.width, height: player.height}, wall)) {
            canMoveX = false;
        }
        if (checkCollision({x: player.x, y: newY, width: player.width, height: player.height}, wall)) {
            canMoveY = false;
        }
    }
    
    if (canMoveX) {
        player.x = newX;
    }
    if (canMoveY) {
        player.y = newY;
    }
    
    // Handle interaction with NPCs (Space key)
    if (gameState.keys['Space']) {
        for (const npc of gameState.npcs) {
            const distance = Math.sqrt(
                Math.pow(player.x + player.width/2 - (npc.x + npc.width/2), 2) +
                Math.pow(player.y + player.height/2 - (npc.y + npc.height/2), 2)
            );
            
            if (distance < 60) { // Interaction range
                handleNPCInteraction(npc);
                gameState.keys['Space'] = false; // Prevent multiple interactions
                break;
            }
        }
    }
}

// Handle NPC interactions and mission system
function handleNPCInteraction(npc) {
    if (npc === gameState.npcs[0] && !npc.questGiven) {
        // Quest giver NPC
        alert(npc.message);
        npc.questGiven = true;
        gameState.currentMission = 'Deliver package to blue NPC';
        gameState.missionProgress = 'delivering';
        updateUI();
    } else if (npc === gameState.npcs[1] && gameState.missionProgress === 'delivering') {
        // Quest target NPC
        alert(npc.message);
        gameState.currentMission = 'Mission Complete! Well done!';
        gameState.missionProgress = 'complete';
        gameState.player.level++;
        updateUI();
    } else if (gameState.missionProgress === 'complete') {
        alert('Thank you for completing the delivery mission!');
    } else if (gameState.missionProgress === 'start') {
        alert('Go talk to the orange NPC first for a mission!');
    }
}

// Render everything
function render() {
    const ctx = gameState.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // Draw background pattern
    ctx.fillStyle = '#1a1a1a';
    for (let x = 0; x < gameState.canvas.width; x += 40) {
        for (let y = 0; y < gameState.canvas.height; y += 40) {
            if ((x / 40 + y / 40) % 2 === 0) {
                ctx.fillRect(x, y, 40, 40);
            }
        }
    }
    
    // Draw walls
    for (const wall of gameState.walls) {
        ctx.fillStyle = wall.color;
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    // Draw NPCs
    for (const npc of gameState.npcs) {
        ctx.fillStyle = npc.color;
        ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
        
        // Add a simple face or indicator
        ctx.fillStyle = 'white';
        ctx.fillRect(npc.x + 5, npc.y + 5, 4, 4); // Left eye
        ctx.fillRect(npc.x + 16, npc.y + 5, 4, 4); // Right eye
        ctx.fillRect(npc.x + 8, npc.y + 15, 9, 2); // Mouth
        
        // Show interaction indicator when player is near
        const player = gameState.player;
        const distance = Math.sqrt(
            Math.pow(player.x + player.width/2 - (npc.x + npc.width/2), 2) +
            Math.pow(player.y + player.height/2 - (npc.y + npc.height/2), 2)
        );
        
        if (distance < 60) {
            ctx.fillStyle = 'yellow';
            ctx.font = '14px Arial';
            ctx.fillText('Press SPACE', npc.x - 10, npc.y - 10);
        }
    }
    
    // Draw player
    const player = gameState.player;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Add simple player details
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 8, player.y + 8, 4, 4); // Left eye
    ctx.fillRect(player.x + 18, player.y + 8, 4, 4); // Right eye
    ctx.fillRect(player.x + 10, player.y + 20, 10, 2); // Mouth
    
    // Player name tag
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('Player', player.x, player.y - 5);
}

// Update UI elements
function updateUI() {
    document.getElementById('health').textContent = gameState.player.health;
    document.getElementById('level').textContent = gameState.player.level;
    document.getElementById('currentMission').textContent = gameState.currentMission;
}

// Main game loop
function gameLoop(timestamp) {
    if (!gameState.isRunning) return;
    
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;
    
    updatePlayer(deltaTime);
    render();
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
function initGame() {
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    if (!gameState.ctx) {
        alert('Canvas not supported by your browser!');
        return;
    }
    
    setupInput();
    gameState.isRunning = true;
    gameState.lastTime = performance.now();
    
    // Hide start screen and show game
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
    
    console.log('Game initialized successfully!');
}

// Setup event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startButton').addEventListener('click', initGame);
    console.log('Pixel City Adventure loaded and ready to start!');
});