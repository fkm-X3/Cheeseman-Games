const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let musicEnabled = true;
let musicNodes = [];

// Background Music System
const Music = {
    bassOsc: null,
    leadOsc: null,
    hihatOsc: null,
    kickOsc: null,
    bassGain: null,
    leadGain: null,
    hihatGain: null,
    kickGain: null,
    beatInterval: null,
    melodyInterval: null,
    playing: false,
    bpm: 140,
    
    start: function() {
        if (!audioCtx || this.playing || !musicEnabled) return;
        this.playing = true;
        
        const beatDuration = (60 / this.bpm) * 1000; // milliseconds per beat
        
        // Bass line (4/4 time)
        this.bassOsc = audioCtx.createOscillator();
        this.bassGain = audioCtx.createGain();
        this.bassOsc.type = 'sine';
        this.bassOsc.frequency.value = 65.41; // C2
        this.bassGain.gain.value = 0.15;
        this.bassOsc.connect(this.bassGain);
        this.bassGain.connect(audioCtx.destination);
        this.bassOsc.start();
        
        // Lead melody
        this.leadOsc = audioCtx.createOscillator();
        this.leadGain = audioCtx.createGain();
        this.leadOsc.type = 'square';
        this.leadGain.gain.value = 0;
        this.leadOsc.connect(this.leadGain);
        this.leadGain.connect(audioCtx.destination);
        this.leadOsc.start();
        
        // Melody pattern (pentatonic scale)
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C, D, E, G, A
        let noteIndex = 0;
        
        this.melodyInterval = setInterval(() => {
            if (!musicEnabled) return;
            
            const note = notes[noteIndex % notes.length];
            this.leadOsc.frequency.setValueAtTime(note, audioCtx.currentTime);
            this.leadGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            this.leadGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            noteIndex++;
        }, beatDuration / 2);
        
        // Kick drum pattern
        let beatCount = 0;
        this.beatInterval = setInterval(() => {
            if (!musicEnabled) return;
            
            // Kick on beats 1 and 3
            if (beatCount % 4 === 0 || beatCount % 4 === 2) {
                this.playKick();
            }
            
            // Hi-hat on off beats
            if (beatCount % 2 === 1) {
                this.playHihat();
            }
            
            beatCount++;
        }, beatDuration);
    },
    
    playKick: function() {
        if (!audioCtx || !musicEnabled) return;
        
        const kickOsc = audioCtx.createOscillator();
        const kickGain = audioCtx.createGain();
        
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(150, audioCtx.currentTime);
        kickOsc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        kickGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        kickOsc.connect(kickGain);
        kickGain.connect(audioCtx.destination);
        
        kickOsc.start(audioCtx.currentTime);
        kickOsc.stop(audioCtx.currentTime + 0.5);
    },
    
    playHihat: function() {
        if (!audioCtx || !musicEnabled) return;
        
        const hihatOsc = audioCtx.createOscillator();
        const hihatGain = audioCtx.createGain();
        
        hihatOsc.type = 'square';
        hihatOsc.frequency.value = 10000;
        
        hihatGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        hihatGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        
        hihatOsc.connect(hihatGain);
        hihatGain.connect(audioCtx.destination);
        
        hihatOsc.start(audioCtx.currentTime);
        hihatOsc.stop(audioCtx.currentTime + 0.05);
    },
    
    stop: function() {
        if (!this.playing) return;
        this.playing = false;
        
        if (this.beatInterval) clearInterval(this.beatInterval);
        if (this.melodyInterval) clearInterval(this.melodyInterval);
        
        if (this.bassOsc) this.bassOsc.stop();
        if (this.leadOsc) this.leadOsc.stop();
        
        this.bassOsc = null;
        this.leadOsc = null;
    },
    
    toggle: function() {
        musicEnabled = !musicEnabled;
        const btn = document.getElementById('music-toggle');
        btn.textContent = musicEnabled ? '🔊 Music: ON' : '🔇 Music: OFF';
        
        if (!musicEnabled) {
            this.stop();
        } else if (gameState === 'PLAYING') {
            this.start();
        }
    }
};

const Sound = {
    jump: () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },
    death: () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    },
    win: () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.0);
    }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const debugInfo = document.getElementById('debug-info');

// Logical resolution (HD aspect)
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
const TILE_SIZE = 40;
const PLAYER_SIZE = 30;
const GRAVITY = 1.2;
const JUMP_FORCE = -17;
const TERMINAL_VELOCITY = 20;
const SPEED = 6;
const FLOOR_HEIGHT = 100;

let scale = 1;

let gameState = 'START';
let frames = 0;
let attempts = 1;
let cameraX = 0;
let bgHue = 200;

// --- Physics Objects ---
const player = {
    x: 200,
    y: 0,
    vy: 0,
    angle: 0,
    grounded: false,
    dead: false,
    color: '#ffff00',
    trail: []
};

// Level Objects
const levelObjects = [];
const floorY = GAME_HEIGHT - FLOOR_HEIGHT;

function buildLevel() {
    levelObjects.length = 0;
    
    // Track block positions for neighbor detection
    const blockMap = new Set();
    
    let x = 10;
    
    function addBlock(bx, by) {
        const key = `${bx},${by}`;
        blockMap.add(key);
        levelObjects.push({ 
            type: 'block', 
            x: bx * TILE_SIZE, 
            y: floorY - (by * TILE_SIZE) - TILE_SIZE, 
            w: TILE_SIZE, 
            h: TILE_SIZE,
            gridX: bx,
            gridY: by
        });
    }
    
    function addSpike(bx, by) {
        levelObjects.push({ type: 'spike', x: bx * TILE_SIZE, y: floorY - (by * TILE_SIZE) - TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE });
    }
    
    function hasNeighbor(bx, by) {
        return blockMap.has(`${bx},${by}`);
    }
    
    // Simple starter section
    addBlock(20, 0);
    addBlock(21, 0);
    addBlock(22, 0);
    
    addSpike(27, 0);
    
    addBlock(30, 0);
    addBlock(31, 0);
    
    addBlock(35, 0);
    addBlock(36, 0);
    addBlock(36, 1);
    
    addSpike(40, 0);
    addSpike(41, 0);
    
    addBlock(45, 0);
    addBlock(46, 0);
    addBlock(47, 0);
    addBlock(47, 1);
    addBlock(47, 2);
    
    addSpike(52, 0);
    
    addBlock(56, 0);
    addBlock(57, 0);
    addBlock(58, 0);
    
    addBlock(62, 0);
    addBlock(62, 1);
    addBlock(63, 0);
    addBlock(63, 1);
    
    addSpike(68, 0);
    addSpike(69, 0);
    
    addBlock(73, 0);
    addBlock(74, 0);
    addBlock(75, 0);
    addBlock(75, 1);
    
    addBlock(80, 0);
    addBlock(81, 0);
    addBlock(82, 0);
    addBlock(82, 1);
    addBlock(82, 2);
    
    addSpike(87, 0);
    
    addBlock(91, 0);
    addBlock(92, 0);
    addBlock(93, 0);
    
    // Extended level - more content so it doesn't end randomly
    for (let i = 100; i < 200; i += 5) {
        if (Math.random() > 0.5) {
            addBlock(i, 0);
            addBlock(i + 1, 0);
            if (Math.random() > 0.7) {
                addBlock(i + 1, 1);
            }
        } else {
            if (Math.random() > 0.6) {
                addSpike(i, 0);
            }
        }
    }
    
    levelObjects.push({ 
        type: 'win', 
        x: 200 * TILE_SIZE, 
        y: floorY - 80, 
        w: 40, 
        h: 80 
    });
    
    // Calculate exposed sides for each block
    for (let obj of levelObjects) {
        if (obj.type === 'block') {
            obj.exposedLeft = !hasNeighbor(obj.gridX - 1, obj.gridY);
            obj.exposedRight = !hasNeighbor(obj.gridX + 1, obj.gridY);
            obj.exposedTop = !hasNeighbor(obj.gridX, obj.gridY + 1);
            obj.exposedBottom = !hasNeighbor(obj.gridX, obj.gridY - 1);
        }
    }
}

buildLevel();
const levelLength = 200 * TILE_SIZE;

// Particles
const particles = [];
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    ctx.save();
    ctx.translate(-cameraX, 0);
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();
}

function checkCollision(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

function start() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    
    if (gameState === 'WIN') {
        buildLevel();
        attempts = 1;
    }
    
    reset();
    gameState = 'PLAYING';
    uiLayer.style.display = 'none';
    progressBar.style.display = 'block';
    
    // Start music when game starts
    if (musicEnabled) {
        Music.start();
    }
}

function jump() {
    if (gameState === 'START' || gameState === 'WIN' || gameState === 'DEAD') {
        start();
        return;
    }
    
    if (gameState === 'PLAYING' && player.grounded && !player.dead) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
        Sound.jump();
    }
}

function die() {
    if (player.dead) return;
    player.dead = true;
    gameState = 'DEAD';
    Sound.death();
    createParticles(player.x + PLAYER_SIZE/2, player.y + PLAYER_SIZE/2, player.color, 20);
    
    // Stop music on death
    Music.stop();
    
    setTimeout(() => {
        uiLayer.style.display = 'flex';
        document.getElementById('main-title').innerText = 'YOU DIED';
        document.getElementById('start-msg').innerText = `Attempt ${++attempts} - Click to Retry`;
    }, 500);
}

function win() {
    if (gameState !== 'PLAYING') return;
    gameState = 'WIN';
    Sound.win();
    Music.stop();
    uiLayer.style.display = 'flex';
    document.getElementById('main-title').innerText = '🏆 YOU WIN! 🏆';
    document.getElementById('start-msg').innerText = 'Click to Restart';
    progressBar.style.display = 'none';
}

function reset() {
    player.x = 200;
    player.y = 0;
    player.vy = 0;
    player.angle = 0;
    player.grounded = false;
    player.dead = false;
    player.trail = [];
    cameraX = 0;
    frames = 0;
    particles.length = 0;
    gameState = 'START';
    uiLayer.style.display = 'flex';
    document.getElementById('main-title').innerText = 'GEOMETRY DASH';
    document.getElementById('start-msg').innerText = 'Click or Space to Start';
    progressBar.style.display = 'none';
}

function update() {
    if (gameState !== 'PLAYING') {
        updateParticles();
        return;
    }

    frames++;

    // Move camera
    player.x += SPEED;
    cameraX = player.x - 200;

    // Apply Gravity
    player.vy += GRAVITY;
    if (player.vy > TERMINAL_VELOCITY) player.vy = TERMINAL_VELOCITY;
    player.y += player.vy;

    // Rotation
    if (!player.grounded) {
        player.angle += 5;
    } else {
        let nearest90 = Math.round(player.angle / 90) * 90;
        player.angle = nearest90;
    }

    // Floor Collision
    if (player.y + PLAYER_SIZE >= floorY) {
        player.y = floorY - PLAYER_SIZE;
        player.vy = 0;
        player.grounded = true;
    } else {
        player.grounded = false;
    }

    // Object Collision - IMPROVED: Safe top landing
    let playerRect = { 
        x: player.x + 6,
        y: player.y + 6,
        w: PLAYER_SIZE - 12,
        h: PLAYER_SIZE - 12
    };
    
    for (let obj of levelObjects) {
        if (obj.x + obj.w < cameraX || obj.x > cameraX + GAME_WIDTH) continue;

        if (obj.type === 'win') {
            if (player.x > obj.x) win();
            continue;
        }

        if (checkCollision(playerRect, obj)) {
            if (obj.type === 'spike') {
                die();
            } else if (obj.type === 'block') {
                // Calculate overlap amounts
                let overlapX = (playerRect.w + obj.w) / 2 - Math.abs((playerRect.x + playerRect.w / 2) - (obj.x + obj.w / 2));
                let overlapY = (playerRect.h + obj.h) / 2 - Math.abs((playerRect.y + playerRect.h / 2) - (obj.y + obj.h / 2));

                // Calculate player center
                let playerCenterX = playerRect.x + playerRect.w / 2;
                let playerCenterY = playerRect.y + playerRect.h / 2;
                let blockCenterX = obj.x + obj.w / 2;
                let blockCenterY = obj.y + obj.h / 2;

                // Determine which side the player is hitting
                if (overlapX < overlapY) {
                    // Horizontal collision (left or right side)
                    if (playerCenterX < blockCenterX) {
                        // Hitting LEFT side of block
                        if (obj.exposedLeft) {
                            die();
                        }
                    } else {
                        // Hitting RIGHT side of block
                        if (obj.exposedRight) {
                            die();
                        }
                    }
                } else {
                    // Vertical collision (top or bottom)
                    if (player.vy > 0 && playerCenterY < blockCenterY) {
                        // Landing on TOP - SAFE
                        player.y = obj.y - PLAYER_SIZE;
                        player.vy = 0;
                        player.grounded = true;
                    } else if (player.vy < 0 && playerCenterY > blockCenterY) {
                        // Hitting BOTTOM while going up
                        if (obj.exposedBottom) {
                            die();
                        }
                    }
                }
            }
        }
    }

    // Trail
    if (frames % 3 === 0) {
        player.trail.push({ x: player.x, y: player.y, alpha: 0.6 });
        if (player.trail.length > 10) player.trail.shift();
    }

    updateParticles();
    
    // Background Shift
    if (frames % 60 === 0) bgHue = (bgHue + 10) % 360;
    
    // Progress
    let pct = Math.min((player.x / levelLength) * 100, 100);
    progressFill.style.width = pct + '%';
}

function draw() {
    // Clear
    ctx.fillStyle = `hsl(${bgHue}, 50%, 20%)`;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Background Grid
    ctx.strokeStyle = `hsl(${bgHue}, 50%, 30%)`;
    ctx.lineWidth = 2;
    let gridOffsetX = -(cameraX * 0.5) % TILE_SIZE;
    
    ctx.beginPath();
    for (let x = gridOffsetX; x < GAME_WIDTH; x += TILE_SIZE) {
        ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += TILE_SIZE) {
        ctx.moveTo(0, y); ctx.lineTo(GAME_WIDTH, y);
    }
    ctx.stroke();

    // Floor
    ctx.fillStyle = `hsl(${bgHue}, 60%, 40%)`;
    ctx.fillRect(0, floorY, GAME_WIDTH, GAME_HEIGHT - floorY);
    
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(GAME_WIDTH, floorY);
    ctx.stroke();

    // Objects
    ctx.save();
    ctx.translate(-cameraX, 0);

    for (let obj of levelObjects) {
        if (obj.x + obj.w < cameraX || obj.x > cameraX + GAME_WIDTH) continue;

        if (obj.type === 'block') {
            ctx.fillStyle = "#000000";
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
            
            ctx.strokeStyle = "#00ffcc";
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
            
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(obj.x + 5, obj.y + 5, obj.w - 10, obj.h - 10);
            ctx.globalAlpha = 1.0;
        } 
        else if (obj.type === 'spike') {
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "#ff3333";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + obj.h);
            ctx.lineTo(obj.x + obj.w / 2, obj.y);
            ctx.lineTo(obj.x + obj.w, obj.y + obj.h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(obj.x + 8, obj.y + obj.h - 4);
            ctx.lineTo(obj.x + obj.w / 2, obj.y + 12);
            ctx.lineTo(obj.x + obj.w - 8, obj.y + obj.h - 4);
            ctx.closePath();
            ctx.fillStyle = "#ff3333";
            ctx.fill();
        }
    }

    // Player Trail
    if (!player.dead) {
        for (let t of player.trail) {
            ctx.fillStyle = player.color;
            ctx.globalAlpha = t.alpha;
            t.alpha -= 0.05;
            ctx.fillRect(t.x, t.y, PLAYER_SIZE, PLAYER_SIZE);
        }
    }
    ctx.globalAlpha = 1.0;

    // Player
    if (!player.dead) {
        ctx.translate(player.x + PLAYER_SIZE/2, player.y + PLAYER_SIZE/2);
        ctx.rotate(player.angle * Math.PI / 180);
        
        ctx.fillStyle = player.color;
        ctx.fillRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
        
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.strokeRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
        
        ctx.fillStyle = "#000";
        ctx.fillRect(2, -8, 8, 8);
        ctx.fillRect(4, 4, 10, 3);
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(scale, scale);
    }
    
    ctx.restore();

    drawParticles();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Input Handlers
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('mousedown', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

// Music toggle
document.getElementById('music-toggle').addEventListener('click', () => {
    Music.toggle();
});

// Resize Handler
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const screenRatio = window.innerWidth / window.innerHeight;
    const gameRatio = GAME_WIDTH / GAME_HEIGHT;
    
    if (screenRatio > gameRatio) {
        canvas.height = window.innerHeight * 0.9;
        canvas.width = canvas.height * gameRatio;
    } else {
        canvas.width = window.innerWidth * 0.9;
        canvas.height = canvas.width / gameRatio;
    }
    
    scale = canvas.width / GAME_WIDTH;
    ctx.scale(scale, scale);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Start
requestAnimationFrame(gameLoop);