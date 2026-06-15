// --- AUDIO ENGINE ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let musicEnabled = true;

const Music = {
    bassOsc: null,
    leadOsc: null,
    beatInterval: null,
    melodyInterval: null,
    playing: false,
    bpm: 140,
    
    start: function() {
        if (!audioCtx || this.playing || !musicEnabled) return;
        this.playing = true;
        
        const beatDuration = (60 / this.bpm) * 1000;
        
        // Bass
        this.bassOsc = audioCtx.createOscillator();
        this.bassGain = audioCtx.createGain();
        this.bassOsc.type = 'sine';
        this.bassOsc.frequency.value = 65.41;
        this.bassGain.gain.value = 0.15;
        this.bassOsc.connect(this.bassGain);
        this.bassGain.connect(audioCtx.destination);
        this.bassOsc.start();
        
        // Lead
        this.leadOsc = audioCtx.createOscillator();
        this.leadGain = audioCtx.createGain();
        this.leadOsc.type = 'square';
        this.leadGain.gain.value = 0;
        this.leadOsc.connect(this.leadGain);
        this.leadGain.connect(audioCtx.destination);
        this.leadOsc.start();
        
        // Melody
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; 
        let noteIndex = 0;
        
        this.melodyInterval = setInterval(() => {
            if (!musicEnabled) return;
            const note = notes[noteIndex % notes.length];
            this.leadOsc.frequency.setValueAtTime(note, audioCtx.currentTime);
            this.leadGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            this.leadGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            noteIndex++;
        }, beatDuration / 2);
        
        // Drums
        let beatCount = 0;
        this.beatInterval = setInterval(() => {
            if (!musicEnabled) return;
            if (beatCount % 4 === 0 || beatCount % 4 === 2) this.playKick();
            if (beatCount % 2 === 1) this.playHihat();
            beatCount++;
        }, beatDuration);
    },
    
    playKick: function() {
        if (!audioCtx || !musicEnabled) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(150, audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        g.gain.setValueAtTime(0.3, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime + 0.5);
    },
    
    playHihat: function() {
        if (!audioCtx || !musicEnabled) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'square';
        o.frequency.value = 10000;
        g.gain.setValueAtTime(0.05, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime + 0.05);
    },
    
    stop: function() {
        if (!this.playing) return;
        this.playing = false;
        clearInterval(this.beatInterval);
        clearInterval(this.melodyInterval);
        if (this.bassOsc) { this.bassOsc.stop(); this.bassOsc = null; }
        if (this.leadOsc) { this.leadOsc.stop(); this.leadOsc = null; }
    },
    
    toggle: function() {
        musicEnabled = !musicEnabled;
        document.getElementById('btn-music').style.color = musicEnabled ? '#fff' : '#555';
        if (!musicEnabled) this.stop();
        else if (gameState === 'PLAYING') this.start();
    }
};

const Sound = {
    jump: () => {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'square';
        o.frequency.setValueAtTime(150, audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        o.start(); o.stop(audioCtx.currentTime + 0.1);
    },
    death: () => {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(100, audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.3);
        g.gain.setValueAtTime(0.2, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        o.start(); o.stop(audioCtx.currentTime + 0.3);
    },
    win: () => {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(440, audioCtx.currentTime);
        o.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);
        g.gain.setValueAtTime(0.2, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
        o.start(); o.stop(audioCtx.currentTime + 1.0);
    }
};

// --- GAME ENGINE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameUi = document.getElementById('game-ui');
const editorUi = document.getElementById('editor-ui');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
const TILE_SIZE = 40;
const PLAYER_SIZE = 30;
const GRAVITY = 1.2;
const JUMP_FORCE = -17;
const TERMINAL_VELOCITY = 20;
const SPEED = 6;
const FLOOR_HEIGHT = 100;
const floorY = GAME_HEIGHT - FLOOR_HEIGHT;

let scale = 1;
let gameState = 'EDITOR'; // EDITOR, PLAYING, START, DEAD, WIN
let frames = 0;
let attempts = 1;
let cameraX = 0;
let bgHue = 200;

// --- EDITOR STATE ---
let editorCameraX = 0;
let selectedTool = 'block';
let isDragging = false;
let mouseGridX = 0;
let mouseGridY = 0;
// Using a Map for efficient grid editing: key="x,y" value={type, x, y...}
let editorGrid = new Map();

// --- PHYSICS OBJECTS ---
const player = { x: 200, y: 0, vy: 0, angle: 0, grounded: false, dead: false, color: '#ffff00', trail: [] };
let levelObjects = []; // Generated from editorGrid for gameplay
let particles = [];

// Initialize Editor with default level
function initEditor() {
    // Add default floor and win block
    placeObject(200, 1, 'win'); // Win pad far right
    
    // Add a simple starter structure
    placeObject(10, 0, 'block');
    placeObject(11, 0, 'block');
    placeObject(12, 0, 'block');
    placeObject(16, 0, 'spike');
    
    // Convert to Playable Object Array
    refreshLevelObjects();
}

function placeObject(gx, gy, type) {
    if (gy < 0) return; // Don't place below floor
    const key = `${gx},${gy}`;
    
    if (type === 'eraser') {
        editorGrid.delete(key);
    } else {
        editorGrid.set(key, { type: type, gridX: gx, gridY: gy });
    }
    refreshLevelObjects();
}

function refreshLevelObjects() {
    levelObjects = [];
    
    // Convert Map to Array
    editorGrid.forEach(obj => {
        // Blocks
        if (obj.type === 'block') {
            levelObjects.push({
                type: 'block',
                x: obj.gridX * TILE_SIZE,
                y: floorY - (obj.gridY * TILE_SIZE) - TILE_SIZE,
                w: TILE_SIZE,
                h: TILE_SIZE,
                gridX: obj.gridX,
                gridY: obj.gridY
            });
        }
        // Spikes
        else if (obj.type === 'spike') {
            levelObjects.push({
                type: 'spike',
                x: obj.gridX * TILE_SIZE,
                y: floorY - (obj.gridY * TILE_SIZE) - TILE_SIZE,
                w: TILE_SIZE,
                h: TILE_SIZE
            });
        }
        // Win trigger
        else if (obj.type === 'win') {
            levelObjects.push({
                type: 'win',
                x: obj.gridX * TILE_SIZE,
                y: floorY - 80, // Taller trigger
                w: 40,
                h: 80
            });
        }
    });

    // Calculate neighbors for autotiling blocks
    const blockMap = new Set();
    levelObjects.forEach(o => { if(o.type === 'block') blockMap.add(`${o.gridX},${o.gridY}`); });

    levelObjects.forEach(obj => {
        if (obj.type === 'block') {
            obj.exposedLeft = !blockMap.has(`${obj.gridX - 1},${obj.gridY}`);
            obj.exposedRight = !blockMap.has(`${obj.gridX + 1},${obj.gridY}`);
            obj.exposedTop = !blockMap.has(`${obj.gridX},${obj.gridY + 1}`);
            obj.exposedBottom = !blockMap.has(`${obj.gridX},${obj.gridY - 1}`);
        }
    });
}

function clearLevel() {
    if(confirm("Clear entire level?")) {
        editorGrid.clear();
        refreshLevelObjects();
    }
}

// --- GAMEPLAY FUNCTIONS ---

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
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 0.02;
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
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function resetPlayer() {
    player.x = 200;
    player.y = 0;
    player.vy = 0;
    player.angle = 0;
    player.grounded = false;
    player.dead = false;
    player.trail = [];
    cameraX = 0;
    frames = 0;
    particles = [];
}

// Switch between Editor and Play
function togglePlayMode() {
    if (!audioCtx) audioCtx = new AudioContext();
    
    document.getElementById('btn-play').style.display = 'none';
    document.getElementById('btn-stop').style.display = 'flex';
    document.querySelector('.bottom-bar').style.display = 'none';
    document.getElementById('info-text').style.display = 'none';
    document.getElementById('camera-controls').style.display = 'none';
    
    resetPlayer();
    gameState = 'START';
    gameUi.style.display = 'flex';
    document.getElementById('main-title').innerText = 'TEST MODE';
    document.getElementById('start-msg').innerText = 'Click or Space to Start';
}

function stopPlayMode() {
    gameState = 'EDITOR';
    Music.stop();
    resetPlayer();
    cameraX = editorCameraX; // Restore editor view
    
    document.getElementById('btn-play').style.display = 'flex';
    document.getElementById('btn-stop').style.display = 'none';
    document.querySelector('.bottom-bar').style.display = 'flex';
    document.getElementById('info-text').style.display = 'block';
    document.getElementById('camera-controls').style.display = 'flex';
    
    gameUi.style.display = 'none';
    progressBar.style.display = 'none';
}

function startRun() {
    if (gameState === 'WIN' || gameState === 'DEAD') {
        resetPlayer();
    }
    gameState = 'PLAYING';
    gameUi.style.display = 'none';
    progressBar.style.display = 'block';
    if (musicEnabled) Music.start();
}

function jump() {
    if (gameState === 'EDITOR') return;
    
    if (gameState === 'START' || gameState === 'WIN' || gameState === 'DEAD') {
        startRun();
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
    Music.stop();
    setTimeout(() => {
        gameUi.style.display = 'flex';
        document.getElementById('main-title').innerText = 'CRASHED';
        document.getElementById('start-msg').innerText = `Attempt ${++attempts} - Click to Retry`;
    }, 500);
}

function win() {
    if (gameState !== 'PLAYING') return;
    gameState = 'WIN';
    Sound.win();
    Music.stop();
    gameUi.style.display = 'flex';
    document.getElementById('main-title').innerText = 'LEVEL COMPLETE';
    document.getElementById('start-msg').innerText = 'Click to Restart';
    progressBar.style.display = 'none';
}

function updatePhysics() {
    frames++;
    player.x += SPEED;
    cameraX = player.x - 200;

    // Gravity & Move
    player.vy += GRAVITY;
    if (player.vy > TERMINAL_VELOCITY) player.vy = TERMINAL_VELOCITY;
    player.y += player.vy;

    // Rotation
    if (!player.grounded) player.angle += 5;
    else player.angle = Math.round(player.angle / 90) * 90;

    // Floor
    if (player.y + PLAYER_SIZE >= floorY) {
        player.y = floorY - PLAYER_SIZE;
        player.vy = 0;
        player.grounded = true;
    } else {
        player.grounded = false;
    }

    // Collision
    let pRect = { x: player.x + 6, y: player.y + 6, w: PLAYER_SIZE - 12, h: PLAYER_SIZE - 12 };
    
    for (let obj of levelObjects) {
        if (obj.x + obj.w < cameraX || obj.x > cameraX + GAME_WIDTH) continue;

        if (obj.type === 'win') {
            if (player.x > obj.x) win();
            continue;
        }

        if (checkCollision(pRect, obj)) {
            if (obj.type === 'spike') {
                die();
            } else if (obj.type === 'block') {
                let overlapX = (pRect.w + obj.w) / 2 - Math.abs((pRect.x + pRect.w / 2) - (obj.x + obj.w / 2));
                let overlapY = (pRect.h + obj.h) / 2 - Math.abs((pRect.y + pRect.h / 2) - (obj.y + obj.h / 2));

                if (overlapX < overlapY) {
                    let pcx = pRect.x + pRect.w/2;
                    let bcx = obj.x + obj.w/2;
                    if (pcx < bcx) { if (obj.exposedLeft) die(); }
                    else { if (obj.exposedRight) die(); }
                } else {
                    let pcy = pRect.y + pRect.h/2;
                    let bcy = obj.y + obj.h/2;
                    if (player.vy > 0 && pcy < bcy) {
                        player.y = obj.y - PLAYER_SIZE;
                        player.vy = 0;
                        player.grounded = true;
                    } else if (player.vy < 0 && pcy > bcy) {
                        if (obj.exposedBottom) die();
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
    
    // Progress UI
    let endX = 0;
    levelObjects.forEach(o => { if(o.type === 'win') endX = o.x; });
    let pct = Math.min((player.x / Math.max(endX, 1000)) * 100, 100);
    progressFill.style.width = pct + '%';
    
    bgHue = (bgHue + 0.1) % 360;
}

// --- MAIN LOOP ---
function update() {
    if (gameState === 'PLAYING') {
        updatePhysics();
        updateParticles();
    } else if (gameState === 'EDITOR') {
        // Move camera with keys
        if (keys['ArrowRight'] || keys['KeyD']) editorCameraX += 10;
        if (keys['ArrowLeft'] || keys['KeyA']) editorCameraX = Math.max(0, editorCameraX - 10);
        cameraX = editorCameraX;
    }
}

function draw() {
    // BG
    ctx.fillStyle = `hsl(${bgHue}, 50%, 20%)`;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid (Visible in Editor)
    ctx.strokeStyle = gameState === 'EDITOR' ? 'rgba(255,255,255,0.2)' : `hsl(${bgHue}, 50%, 30%)`;
    ctx.lineWidth = gameState === 'EDITOR' ? 1 : 2;
    let gridOffsetX = -(cameraX * (gameState === 'EDITOR' ? 1 : 0.5)) % TILE_SIZE; // Parallax in game, solid in editor

    ctx.beginPath();
    // Vertical lines
    for (let x = gridOffsetX; x < GAME_WIDTH; x += TILE_SIZE) {
        ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT);
    }
    // Horizontal lines
    for (let y = 0; y < GAME_HEIGHT; y += TILE_SIZE) {
        ctx.moveTo(0, y); ctx.lineTo(GAME_WIDTH, y);
    }
    ctx.stroke();

    // Ground Line (Stronger in editor to show baseline)
    ctx.fillStyle = `hsl(${bgHue}, 60%, 40%)`;
    ctx.fillRect(0, floorY, GAME_WIDTH, GAME_HEIGHT - floorY);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(GAME_WIDTH, floorY); ctx.stroke();

    // Editor Cursor Ghost
    if (gameState === 'EDITOR') {
        // Calculate world X
        let cursorX = (mouseGridX * TILE_SIZE) - cameraX;
        let cursorY = floorY - (mouseGridY * TILE_SIZE) - TILE_SIZE;
        
        ctx.save();
        ctx.translate(cursorX, cursorY);
        
        if (mouseGridY >= 0) { // Only draw valid positions
            ctx.globalAlpha = 0.5;
            if (selectedTool === 'block') {
                ctx.fillStyle = '#00ffcc';
                ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
            } else if (selectedTool === 'spike') {
                ctx.fillStyle = '#ff3333';
                ctx.beginPath();
                ctx.moveTo(0, TILE_SIZE); ctx.lineTo(TILE_SIZE/2, 0); ctx.lineTo(TILE_SIZE, TILE_SIZE);
                ctx.fill();
            } else if (selectedTool === 'eraser') {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.strokeRect(0,0, TILE_SIZE, TILE_SIZE);
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(TILE_SIZE, TILE_SIZE); ctx.moveTo(TILE_SIZE,0); ctx.lineTo(0, TILE_SIZE); ctx.stroke();
            }
        }
        ctx.restore();
    }

    // Render Objects
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
            ctx.fill(); ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(obj.x + 8, obj.y + obj.h - 4);
            ctx.lineTo(obj.x + obj.w / 2, obj.y + 12);
            ctx.lineTo(obj.x + obj.w - 8, obj.y + obj.h - 4);
            ctx.fillStyle = "#ff3333";
            ctx.fill();
        }
        else if (obj.type === 'win') {
             ctx.fillStyle = "#ffff00";
             ctx.globalAlpha = 0.5;
             ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
             ctx.globalAlpha = 1.0;
        }
    }

    // Player
    if (gameState !== 'EDITOR' && !player.dead) {
        // Trail
        for (let t of player.trail) {
            ctx.fillStyle = player.color;
            ctx.globalAlpha = t.alpha;
            t.alpha -= 0.05;
            ctx.fillRect(t.x, t.y, PLAYER_SIZE, PLAYER_SIZE);
        }
        ctx.globalAlpha = 1.0;

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
    }
    
    ctx.restore();

    if (gameState === 'PLAYING' || gameState === 'DEAD') {
        drawParticles();
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// --- INPUT & EDITOR TOOLS ---
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (gameState !== 'EDITOR') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
            e.preventDefault();
            jump();
        }
    }
});

window.addEventListener('keyup', (e) => { keys[e.code] = false; });

canvas.addEventListener('mousedown', (e) => {
    if (gameState === 'PLAYING' || gameState === 'START') {
        jump();
        return;
    }
    if (gameState === 'EDITOR') {
        isDragging = true;
        placeObject(mouseGridX, mouseGridY, selectedTool);
    }
});

window.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('mousemove', (e) => {
    // Calculate grid position
    const rect = canvas.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / scale;
    const rawY = (e.clientY - rect.top) / scale;
    
    const worldX = rawX + cameraX;
    // Map Y: floorY is the baseline (0). Going up is positive GridY.
    // PixelY = floorY - (GridY * TILE) - TILE
    // floorY - PixelY = GridY * TILE + TILE
    // (floorY - PixelY) / TILE = GridY + 1
    // GridY = ((floorY - PixelY) / TILE) - 1
    
    mouseGridX = Math.floor(worldX / TILE_SIZE);
    mouseGridY = Math.floor((floorY - rawY) / TILE_SIZE); // 0 is the first block above ground
    
    if (isDragging && gameState === 'EDITOR') {
        placeObject(mouseGridX, mouseGridY, selectedTool);
    }
});

canvas.addEventListener('touchstart', (e) => {
    if(gameState === 'PLAYING') { e.preventDefault(); jump(); }
});

function selectTool(tool) {
    selectedTool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tool-${tool}`).classList.add('active');
}

function moveCamera(dir) {
    editorCameraX += dir * 200;
    if (editorCameraX < 0) editorCameraX = 0;
}

// --- SERIALIZATION ---
function exportLevel() {
    // Convert Map to simpler array
    const data = [];
    editorGrid.forEach(v => {
        data.push([v.gridX, v.gridY, v.type]);
    });
    const json = JSON.stringify(data);
    
    document.getElementById('level-data-io').value = json;
    document.getElementById('level-data-modal').style.display = 'flex';
    document.getElementById('modal-action-btn').onclick = () => { closeModal(); };
    document.getElementById('modal-action-btn').innerText = "Close";
}

function openImportModal() {
    document.getElementById('level-data-io').value = "";
    document.getElementById('level-data-modal').style.display = 'flex';
    document.getElementById('modal-action-btn').onclick = importLevel;
    document.getElementById('modal-action-btn').innerText = "Load";
}

function closeModal() {
    document.getElementById('level-data-modal').style.display = 'none';
}

function importLevel() {
    try {
        const json = document.getElementById('level-data-io').value;
        const data = JSON.parse(json);
        
        editorGrid.clear();
        data.forEach(item => {
            const [gx, gy, type] = item;
            editorGrid.set(`${gx},${gy}`, { gridX: gx, gridY: gy, type: type });
        });
        
        refreshLevelObjects();
        closeModal();
        alert("Level loaded!");
    } catch(e) {
        alert("Invalid Level Code");
    }
}

// --- INIT ---
function resizeCanvas() {
    const wrapper = document.getElementById('game-wrapper');
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    
    const screenRatio = w / h;
    const gameRatio = GAME_WIDTH / GAME_HEIGHT;
    
    if (screenRatio > gameRatio) {
        canvas.height = h;
        canvas.width = h * gameRatio;
    } else {
        canvas.width = w;
        canvas.height = w / gameRatio;
    }
    
    scale = canvas.width / GAME_WIDTH;
    ctx.scale(scale, scale);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
initEditor();
loop();