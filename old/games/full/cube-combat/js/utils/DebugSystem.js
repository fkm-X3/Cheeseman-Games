/**
 * DebugSystem.js - Advanced debugging tools for development
 */

export class DebugSystem {
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.showHitboxes = true;
        this.showFrameData = true;
        this.showPerformance = true;
        this.showEntityInfo = true;
        this.godMode = false;
        this.slowMotion = false;
        this.slowMotionFactor = 0.25;
        
        // Performance tracking
        this.frameHistory = [];
        this.maxFrameHistory = 60;
        this.drawCallCount = 0;
        this.entityCount = 0;
        
        // Frame data recording
        this.recordingFrames = false;
        this.frameDataLog = [];
        
        this.setupKeyboardShortcuts();
    }

    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Toggle debug mode: Ctrl + D
            if (e.ctrlKey && e.code === 'KeyD') {
                e.preventDefault();
                this.toggle();
            }
            
            // Toggle hitboxes: Ctrl + H
            if (e.ctrlKey && e.code === 'KeyH') {
                e.preventDefault();
                this.showHitboxes = !this.showHitboxes;
                console.log('[Debug] Hitboxes:', this.showHitboxes ? 'ON' : 'OFF');
            }
            
            // Toggle frame data: Ctrl + F
            if (e.ctrlKey && e.code === 'KeyF') {
                e.preventDefault();
                this.showFrameData = !this.showFrameData;
                console.log('[Debug] Frame Data:', this.showFrameData ? 'ON' : 'OFF');
            }
            
            // Toggle god mode: Ctrl + G
            if (e.ctrlKey && e.code === 'KeyG') {
                e.preventDefault();
                this.godMode = !this.godMode;
                if (this.game.player1) this.game.player1.isInvincible = this.godMode;
                console.log('[Debug] God Mode:', this.godMode ? 'ON' : 'OFF');
            }
            
            // Toggle slow motion: Ctrl + S
            if (e.ctrlKey && e.code === 'KeyS') {
                e.preventDefault();
                this.slowMotion = !this.slowMotion;
                console.log('[Debug] Slow Motion:', this.slowMotion ? 'ON' : 'OFF');
            }
            
            // Heal P1: Ctrl + 1
            if (e.ctrlKey && e.code === 'Digit1') {
                e.preventDefault();
                if (this.game.player1) {
                    this.game.player1.heal(50);
                    console.log('[Debug] P1 healed +50 HP');
                }
            }
            
            // Heal P2: Ctrl + 2
            if (e.ctrlKey && e.code === 'Digit2') {
                e.preventDefault();
                if (this.game.player2) {
                    this.game.player2.heal(50);
                    console.log('[Debug] P2 healed +50 HP');
                }
            }
            
            // Reset cooldowns: Ctrl + R
            if (e.ctrlKey && e.code === 'KeyR') {
                e.preventDefault();
                if (this.game.player1) {
                    for (let key in this.game.player1.abilities) {
                        this.game.player1.abilities[key].cooldown = 0;
                    }
                }
                if (this.game.player2) {
                    for (let key in this.game.player2.abilities) {
                        this.game.player2.abilities[key].cooldown = 0;
                    }
                }
                console.log('[Debug] All cooldowns reset');
            }
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        console.log('[Debug] Debug mode:', this.enabled ? 'ENABLED' : 'DISABLED');
        
        if (this.enabled) {
            this.printHelp();
        }
    }

    printHelp() {
        console.log(`
╔═══════════════════════════════════════════╗
║       CUBE COMBAT DEBUG CONTROLS          ║
╠═══════════════════════════════════════════╣
║ Ctrl + D : Toggle debug overlay          ║
║ Ctrl + H : Toggle hitbox visualization   ║
║ Ctrl + F : Toggle frame data display     ║
║ Ctrl + G : Toggle god mode (P1)          ║
║ Ctrl + S : Toggle slow motion            ║
║ Ctrl + R : Reset all cooldowns           ║
║ Ctrl + 1 : Heal P1 (+50 HP)              ║
║ Ctrl + 2 : Heal P2 (+50 HP)              ║
╚═══════════════════════════════════════════╝
        `);
    }

    update(deltaTime) {
        if (!this.enabled) return;
        
        // Track FPS
        this.frameHistory.push(deltaTime);
        if (this.frameHistory.length > this.maxFrameHistory) {
            this.frameHistory.shift();
        }
        
        // Apply slow motion
        if (this.slowMotion) {
            return deltaTime * this.slowMotionFactor;
        }
        
        return deltaTime;
    }

    draw(ctx) {
        if (!this.enabled) return;
        
        ctx.save();
        
        // Draw debug overlay background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 350, this.calculateOverlayHeight());
        
        ctx.fillStyle = 'lime';
        ctx.font = '12px monospace';
        let y = 30;
        const lineHeight = 16;
        
        // Performance
        if (this.showPerformance) {
            const avgDelta = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
            const fps = Math.round(1000 / avgDelta);
            const minFps = Math.round(1000 / Math.max(...this.frameHistory));
            const maxFps = Math.round(1000 / Math.min(...this.frameHistory));
            
            ctx.fillText(`=== PERFORMANCE ===`, 20, y); y += lineHeight;
            ctx.fillText(`FPS: ${fps} (min: ${minFps}, max: ${maxFps})`, 20, y); y += lineHeight;
            ctx.fillText(`Delta: ${avgDelta.toFixed(2)}ms`, 20, y); y += lineHeight;
            ctx.fillText(`Particles: ${this.game.particles.length}`, 20, y); y += lineHeight;
            ctx.fillText(`Floating Texts: ${this.game.floatingTexts.length}`, 20, y); y += lineHeight;
            y += lineHeight / 2;
        }
        
        // Entity info
        if (this.showEntityInfo && this.game.player1) {
            ctx.fillText(`=== PLAYER 1 ===`, 20, y); y += lineHeight;
            ctx.fillText(`HP: ${this.game.player1.currentHP}/${this.game.player1.maxHP}`, 20, y); y += lineHeight;
            ctx.fillText(`Pos: (${Math.round(this.game.player1.position.x)}, ${Math.round(this.game.player1.position.y)})`, 20, y); y += lineHeight;
            ctx.fillText(`Vel: (${this.game.player1.velocity.x.toFixed(1)}, ${this.game.player1.velocity.y.toFixed(1)})`, 20, y); y += lineHeight;
            ctx.fillText(`Grounded: ${this.game.player1.isGrounded}`, 20, y); y += lineHeight;
            ctx.fillText(`Stunned: ${this.game.player1.isStunned} (${this.game.player1.hitStun}f)`, 20, y); y += lineHeight;
            ctx.fillText(`Combo: ${this.game.player1.comboCount}`, 20, y); y += lineHeight;
            y += lineHeight / 2;
        }
        
        if (this.showEntityInfo && this.game.player2) {
            ctx.fillText(`=== PLAYER 2 ===`, 20, y); y += lineHeight;
            ctx.fillText(`HP: ${this.game.player2.currentHP}/${this.game.player2.maxHP}`, 20, y); y += lineHeight;
            ctx.fillText(`Pos: (${Math.round(this.game.player2.position.x)}, ${Math.round(this.game.player2.position.y)})`, 20, y); y += lineHeight;
            ctx.fillText(`Vel: (${this.game.player2.velocity.x.toFixed(1)}, ${this.game.player2.velocity.y.toFixed(1)})`, 20, y); y += lineHeight;
            ctx.fillText(`Grounded: ${this.game.player2.isGrounded}`, 20, y); y += lineHeight;
            ctx.fillText(`Stunned: ${this.game.player2.isStunned} (${this.game.player2.hitStun}f)`, 20, y); y += lineHeight;
            ctx.fillText(`Combo: ${this.game.player2.comboCount}`, 20, y); y += lineHeight;
            y += lineHeight / 2;
        }
        
        // Frame data
        if (this.showFrameData && this.game.player1) {
            ctx.fillText(`=== COOLDOWNS (P1) ===`, 20, y); y += lineHeight;
            for (let [key, ability] of Object.entries(this.game.player1.abilities)) {
                const cd = ability.cooldown;
                const status = cd === 0 ? 'READY' : `${Math.ceil(cd / 60)}s`;
                ctx.fillText(`${ability.name}: ${status}`, 20, y); y += lineHeight;
            }
        }
        
        // Indicators
        y += lineHeight;
        if (this.godMode) {
            ctx.fillStyle = 'gold';
            ctx.fillText(`[GOD MODE ACTIVE]`, 20, y); y += lineHeight;
        }
        if (this.slowMotion) {
            ctx.fillStyle = 'cyan';
            ctx.fillText(`[SLOW MOTION: ${this.slowMotionFactor}x]`, 20, y); y += lineHeight;
        }
        
        ctx.restore();
    }

    calculateOverlayHeight() {
        let lines = 2; // Header padding
        
        if (this.showPerformance) lines += 6;
        if (this.showEntityInfo) {
            if (this.game.player1) lines += 8;
            if (this.game.player2) lines += 8;
        }
        if (this.showFrameData && this.game.player1) {
            lines += 1 + Object.keys(this.game.player1.abilities).length;
        }
        if (this.godMode) lines += 1;
        if (this.slowMotion) lines += 1;
        
        return lines * 16 + 20;
    }

    drawHitboxes(ctx, character) {
        if (!this.enabled || !this.showHitboxes) return;
        
        ctx.save();
        
        // Draw hurtbox (green)
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            character.hurtbox.x - character.hurtbox.width / 2,
            character.hurtbox.y - character.hurtbox.height / 2,
            character.hurtbox.width,
            character.hurtbox.height
        );
        
        // Draw hitboxes (red)
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        for (let hitbox of character.hitboxes) {
            ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
            
            // Draw hitbox info
            ctx.fillStyle = 'white';
            ctx.font = '10px monospace';
            ctx.fillText(`${hitbox.damage}dmg`, hitbox.x, hitbox.y - 5);
        }
        
        ctx.restore();
    }

    logFrameData(message) {
        if (this.recordingFrames) {
            this.frameDataLog.push({
                frame: this.frameDataLog.length,
                timestamp: performance.now(),
                message: message,
            });
        }
    }

    startRecording() {
        this.recordingFrames = true;
        this.frameDataLog = [];
        console.log('[Debug] Frame recording started');
    }

    stopRecording() {
        this.recordingFrames = false;
        console.log('[Debug] Frame recording stopped. Frames:', this.frameDataLog.length);
        return this.frameDataLog;
    }

    exportFrameData() {
        const data = JSON.stringify(this.frameDataLog, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cube-combat-frames-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('[Debug] Frame data exported');
    }
}
