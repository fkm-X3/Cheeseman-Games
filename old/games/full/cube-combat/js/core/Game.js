/**
 * Game.js - Main game loop and orchestration
 */

import { GAME_CONFIG, PHYSICS, COLORS } from './Constants.js';
import { InputManager } from './InputManager.js';
import { StateManager } from './StateManager.js';
import { DebugSystem } from '../utils/DebugSystem.js';
import { Vector2 } from '../utils/Vector2.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        
        // Core systems
        this.inputManager = new InputManager();
        this.stateManager = new StateManager();
        this.debugSystem = new DebugSystem(this);
        
        // Game state
        this.running = false;
        this.paused = false;
        this.animationId = null;
        
        // Players
        this.player1 = null;
        this.player2 = null;
        
        // Visual effects
        this.particles = [];
        this.floatingTexts = [];
        this.screenShake = new Vector2(0, 0);
        this.shakeMagnitude = 0;
        
        // Performance
        this.fps = 60;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        // Debug
        this.debugMode = this.stateManager.isDebugMode();
    }

    init() {
        console.log('[Game] Initializing Cube Combat v2.0');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Pause on ESC
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.running) {
                this.togglePause();
            }
        });
        
        // Handle window focus
        window.addEventListener('blur', () => {
            if (this.running) this.pause();
        });
    }

    start(player1, player2, mode = 'ai') {
        this.player1 = player1;
        this.player2 = player2;
        this.running = true;
        this.paused = false;
        
        // Reset players
        this.player1.reset(200, PHYSICS.FLOOR_Y);
        this.player2.reset(600, PHYSICS.FLOOR_Y);
        this.player2.facingRight = false;
        
        // Start match
        this.stateManager.startMatch(
            { character: player1.id, name: player1.name },
            { character: player2.id, name: player2.name },
            mode
        );
        
        // Start game loop
        this.lastFrameTime = performance.now();
        this.gameLoop();
        
        console.log('[Game] Match started:', mode);
    }

    gameLoop(timestamp = 0) {
        if (!this.running) return;
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        
        // Calculate delta time
        this.deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Calculate FPS
        this.fps = Math.round(1000 / this.deltaTime);
        
        if (!this.paused) {
            this.update();
            this.render();
        }
    }

    update() {
        // Update input
        this.inputManager.update();
        
        // Apply debug system (for slow motion, etc.)
        const deltaMultiplier = this.debugSystem.enabled && this.debugSystem.slowMotion ? 
            this.debugSystem.slowMotionFactor : 1.0;
        
        // Get input for each player
        const p1Input = this.inputManager.getPlayerInput(1);
        const p2Input = this.inputManager.getPlayerInput(2);
        
        // Update players
        if (this.player1 && !this.player1.isDead) {
            this.player1.update(p1Input, this.player2, deltaMultiplier);
        }
        if (this.player2 && !this.player2.isDead) {
            this.player2.update(p2Input, this.player1, deltaMultiplier);
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Update particles
        this.updateParticles();
        
        // Update floating texts
        this.updateFloatingTexts();
        
        // Update screen shake
        this.updateScreenShake();
        
        // Update debug system
        this.debugSystem.update(this.deltaTime);
        
        // Check win condition
        this.checkWinCondition();
    }

    checkCollisions() {
        if (!this.player1 || !this.player2) return;
        
        // Check player1's hitboxes against player2's hurtbox
        for (let hitbox of this.player1.hitboxes) {
            if (this.checkHitboxCollision(hitbox, this.player2.hurtbox)) {
                const damage = this.player2.takeDamage(hitbox.damage, this.player1, {
                    hitstun: hitbox.hitstun,
                    knockback: hitbox.knockback,
                });
                
                if (damage > 0) {
                    this.player1.comboCount++;
                    this.createHitEffect(this.player2.position.x, this.player2.position.y, damage);
                    this.addScreenShake(hitbox.damage / 5);
                    
                    // Call onHit callback if it exists
                    if (hitbox.onHit) {
                        hitbox.onHit(this.player2);
                    }
                }
                
                // Remove hitbox after hitting (unless it's a projectile)
                if (!hitbox.isProjectile) {
                    hitbox.lifetime = 0;
                }
            }
        }
        
        // Check player2's hitboxes against player1's hurtbox
        for (let hitbox of this.player2.hitboxes) {
            if (this.checkHitboxCollision(hitbox, this.player1.hurtbox)) {
                const damage = this.player1.takeDamage(hitbox.damage, this.player2, {
                    hitstun: hitbox.hitstun,
                    knockback: hitbox.knockback,
                });
                
                if (damage > 0) {
                    this.player2.comboCount++;
                    this.createHitEffect(this.player1.position.x, this.player1.position.y, damage);
                    this.addScreenShake(hitbox.damage / 5);
                    
                    // Call onHit callback if it exists
                    if (hitbox.onHit) {
                        hitbox.onHit(this.player1);
                    }
                }
                
                // Remove hitbox after hitting (unless it's a projectile)
                if (!hitbox.isProjectile) {
                    hitbox.lifetime = 0;
                }
            }
        }
    }

    checkHitboxCollision(hitbox, hurtbox) {
        return (
            hitbox.x < hurtbox.x + hurtbox.width / 2 &&
            hitbox.x + hitbox.width > hurtbox.x - hurtbox.width / 2 &&
            hitbox.y < hurtbox.y + hurtbox.height / 2 &&
            hitbox.y + hitbox.height > hurtbox.y - hurtbox.height / 2
        );
    }

    createHitEffect(x, y, damage) {
        // Spawn particles
        for (let i = 0; i < Math.min(damage, 30); i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 60,
                maxLife: 60,
                color: COLORS.PARTICLE_HIT,
                size: Math.random() * 4 + 2,
            });
        }
        
        // Floating damage text
        this.floatingTexts.push({
            text: `-${damage}`,
            x: x,
            y: y,
            vy: -2,
            life: 90,
            color: 'red',
            size: 24,
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // Gravity
            p.life--;
            return p.life > 0;
        });
    }

    updateFloatingTexts() {
        this.floatingTexts = this.floatingTexts.filter(t => {
            t.y += t.vy;
            t.life--;
            return t.life > 0;
        });
    }

    updateScreenShake() {
        if (this.shakeMagnitude > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.shakeMagnitude;
            this.screenShake.y = (Math.random() - 0.5) * this.shakeMagnitude;
            this.shakeMagnitude *= 0.9;
            
            if (this.shakeMagnitude < 0.1) {
                this.shakeMagnitude = 0;
                this.screenShake.set(0, 0);
            }
        }
    }

    addScreenShake(magnitude) {
        this.shakeMagnitude = Math.min(this.shakeMagnitude + magnitude, 20);
    }

    checkWinCondition() {
        if (this.player1?.isDead) {
            this.endMatch(2);
        } else if (this.player2?.isDead) {
            this.endMatch(1);
        }
    }

    endMatch(winner) {
        this.running = false;
        this.stateManager.endMatch(winner);
        
        // Award coins and XP
        if (winner === 1) {
            this.stateManager.addCoins(100);
            this.stateManager.addXP(50, this.player1.id);
        } else {
            this.stateManager.addCoins(50);
        }
        
        console.log('[Game] Match ended. Winner: Player', winner);
        
        // TODO: Show victory screen
    }

    render() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = COLORS.BACKGROUND;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
        
        // Apply screen shake
        ctx.save();
        ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Draw floor
        this.drawFloor(ctx);
        
        // Draw particles
        this.drawParticles(ctx);
        
        // Draw players
        if (this.player1) this.player1.draw(ctx);
        if (this.player2) this.player2.draw(ctx);
        
        // Draw floating texts
        this.drawFloatingTexts(ctx);
        
        // Debug mode
        if (this.debugSystem.enabled) {
            if (this.player1) this.debugSystem.drawHitboxes(ctx, this.player1);
            if (this.player2) this.debugSystem.drawHitboxes(ctx, this.player2);
            this.debugSystem.draw(ctx);
        }
        
        ctx.restore();
    }

    drawFloor(ctx) {
        ctx.fillStyle = COLORS.FLOOR;
        ctx.fillRect(0, PHYSICS.FLOOR_Y + PHYSICS.CUBE_SIZE / 2, this.canvas.width, 10);
    }

    drawParticles(ctx) {
        for (let p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.restore();
        }
    }

    drawFloatingTexts(ctx) {
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        for (let t of this.floatingTexts) {
            const alpha = t.life / 90;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
        }
        
        ctx.restore();
    }

    drawDebugInfo(ctx) {
        ctx.save();
        ctx.fillStyle = 'lime';
        ctx.font = '14px monospace';
        ctx.fillText(`FPS: ${this.fps}`, 10, 20);
        ctx.fillText(`Particles: ${this.particles.length}`, 10, 40);
        if (this.player1) {
            ctx.fillText(`P1 HP: ${this.player1.currentHP}/${this.player1.maxHP}`, 10, 60);
        }
        if (this.player2) {
            ctx.fillText(`P2 HP: ${this.player2.currentHP}/${this.player2.maxHP}`, 10, 80);
        }
        ctx.restore();
    }

    pause() {
        this.paused = true;
        this.inputManager.lock();
    }

    resume() {
        this.paused = false;
        this.inputManager.unlock();
        this.lastFrameTime = performance.now();
    }

    togglePause() {
        if (this.paused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    toggleDebugMode() {
        this.debugSystem.toggle();
    }
}
