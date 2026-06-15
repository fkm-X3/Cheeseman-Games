/**
 * ImaTouchYou.js - Control character that inverts enemy inputs
 */

import { Character } from './Character.js';

export class ImaTouchYou extends Character {
    constructor(x, y, facingRight = true) {
        super(6, x, y, facingRight);
        
        this.name = "Ima Touch You";
        this.color = "indigo";
        this.maxHP = 75;
        this.currentHP = 75;
        
        this.abilities.attack1.name = "Slash";
        this.abilities.attack1.maxCooldown = 30;
        this.abilities.attack2.name = "Pull";
        this.abilities.attack2.maxCooldown = 200;
        
        this.isPulling = false;
        this.pullTarget = null;
        this.pullDuration = 0;
        this.pullWindup = 0;
    }

    update(input, opponent, deltaTime) {
        super.update(input, opponent, deltaTime);
        
        // Update pull effect
        if (this.isPulling && this.pullTarget) {
            this.pullDuration--;
            
            if (this.pullWindup > 0) {
                this.pullWindup--;
            } else {
                // Pull opponent toward this character
                const dx = this.position.x - this.pullTarget.position.x;
                const pullStrength = 2;
                this.pullTarget.velocity.x += Math.sign(dx) * pullStrength;
                
                // Check if close enough to invert controls
                const distance = Math.abs(dx);
                if (distance < 80 && !this.pullTarget.statusEffects.find(e => e.type === 'inverted')) {
                    this.invertControls(this.pullTarget);
                }
            }
            
            if (this.pullDuration <= 0) {
                this.isPulling = false;
                this.pullTarget = null;
            }
        }
    }

    useAttack1(opponent) {
        this.isAttacking = true;
        this.startAbilityCooldown('attack1');
        
        const hitboxWidth = 60;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        this.hitboxes.push({
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 20,
            knockback: { x: 6, y: -3 },
            hitstun: 12,
            lifetime: 10,
            owner: this,
        });
        
        setTimeout(() => { this.isAttacking = false; }, 250);
    }

    useAttack2(opponent) {
        // Pull ability
        this.isPulling = true;
        this.pullTarget = opponent;
        this.pullDuration = 90; // 1.5 seconds
        this.pullWindup = 20;
        this.startAbilityCooldown('attack2');
    }

    invertControls(target) {
        target.applyStatusEffect({
            type: 'inverted',
            duration: 180, // 3 seconds
            onTick: () => {
                // Effect is handled in InputManager or Game class
            }
        });
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw pull tether
        if (this.isPulling && this.pullTarget) {
            ctx.save();
            ctx.strokeStyle = 'purple';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.pullTarget.position.x, this.pullTarget.position.y);
            ctx.stroke();
            
            // Draw pull particles
            const steps = 5;
            for (let i = 0; i < steps; i++) {
                const t = i / steps + (Date.now() % 1000) / 1000;
                const x = this.position.x + (this.pullTarget.position.x - this.position.x) * (t % 1);
                const y = this.position.y + (this.pullTarget.position.y - this.position.y) * (t % 1);
                ctx.fillStyle = 'rgba(138, 43, 226, 0.8)';
                ctx.fillRect(x - 3, y - 3, 6, 6);
            }
            
            ctx.restore();
        }
    }
}
