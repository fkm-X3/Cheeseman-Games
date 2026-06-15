/**
 * Fbt7.js - Developer boss character with 4 abilities
 */

import { Character } from './Character.js';

export class Fbt7 extends Character {
    constructor(x, y, facingRight = true) {
        super(8, x, y, facingRight);
        
        this.name = "Fbt_7";
        this.color = "black";
        this.maxHP = 200;
        this.currentHP = 200;
        this.moveSpeed = 6;
        this.jumpForce = 16;
        
        this.abilities.attack1.name = "Delete";
        this.abilities.attack1.maxCooldown = 45;
        this.abilities.attack2.name = "Error 404";
        this.abilities.attack2.maxCooldown = 180;
        this.abilities.special1.name = "Hatred";
        this.abilities.special1.maxCooldown = 360;
        this.abilities.special2.name = "Termination";
        this.abilities.special2.maxCooldown = 600;
        
        this.hatredMode = false;
        this.hatredDuration = 0;
        this.terminationPhase = 0;
    }

    update(input, opponent, deltaTime) {
        super.update(input, opponent, deltaTime);
        
        // Update hatred mode
        if (this.hatredMode) {
            this.hatredDuration--;
            this.color = this.hatredDuration % 10 < 5 ? 'red' : 'darkred';
            this.damageMultiplier = 2.0;
            this.moveSpeed = 8;
            
            if (this.hatredDuration <= 0) {
                this.hatredMode = false;
                this.color = 'black';
                this.damageMultiplier = 1.0;
                this.moveSpeed = 6;
            }
        }
    }

    useAttack1(opponent) {
        // Delete - poison slash
        this.isAttacking = true;
        this.startAbilityCooldown('attack1');
        
        const hitboxWidth = 75;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        const hitbox = {
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 30,
            knockback: { x: 10, y: -4 },
            hitstun: 18,
            lifetime: 12,
            owner: this,
            onHit: (target) => {
                // Apply poison
                target.applyStatusEffect({
                    type: 'poison',
                    duration: 300,
                    tickRate: 60,
                    tickTimer: 60,
                    onTick: (char) => {
                        char.takeDamage(8, this, {});
                    }
                });
            }
        };
        
        this.hitboxes.push(hitbox);
        setTimeout(() => { this.isAttacking = false; }, 300);
    }

    useAttack2(opponent) {
        // Error 404 - creates confusion
        this.startAbilityCooldown('attack2');
        
        if (opponent) {
            // Invert controls
            opponent.applyStatusEffect({
                type: 'inverted',
                duration: 180,
                onTick: () => {}
            });
            
            // Stun
            opponent.hitStun = 30;
        }
    }

    useSpecial1(opponent) {
        // Hatred mode - rage buff
        this.hatredMode = true;
        this.hatredDuration = 300; // 5 seconds
        this.startAbilityCooldown('special1');
    }

    useSpecial2(opponent) {
        // Termination - ultimate attack
        this.startAbilityCooldown('special2');
        this.terminationPhase = 1;
        
        // Multi-hit attack over 4 phases
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.terminationStrike(opponent, i);
            }, i * 200);
        }
    }

    terminationStrike(opponent, phase) {
        const hitboxWidth = 100;
        const hitboxHeight = 60;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        this.hitboxes.push({
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 15 + phase * 5,
            knockback: { x: 15, y: -8 },
            hitstun: 25,
            lifetime: 15,
            owner: this,
            isTermination: true,
            phase: phase,
        });
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw hatred aura
        if (this.hatredMode) {
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'red';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 40 + Math.sin(Date.now() / 100) * 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // Draw termination effect
        for (let hb of this.hitboxes) {
            if (hb.isTermination) {
                ctx.save();
                ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + hb.phase * 0.15})`;
                ctx.shadowBlur = 30;
                ctx.shadowColor = 'darkred';
                ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
                ctx.restore();
            }
        }
    }

    reset(x, y) {
        super.reset(x, y);
        this.hatredMode = false;
        this.hatredDuration = 0;
        this.terminationPhase = 0;
    }
}
