/**
 * Bobbythe124.js - Dev character with scaling jumps
 */

import { Character } from './Character.js';

export class Bobbythe124 extends Character {
    constructor(x, y, facingRight = true) {
        super(10, x, y, facingRight);
        
        this.name = "Bobbythe124";
        this.color = "#CCCCFF";
        this.maxHP = 149;
        this.currentHP = 149;
        
        this.abilities.attack1.name = "Silence";
        this.abilities.attack1.maxCooldown = 50;
        this.abilities.attack2.name = "Beam";
        this.abilities.attack2.maxCooldown = 150;
        this.abilities.special2.name = "Bleed";
        this.abilities.special2.maxCooldown = 200;
        
        // Jump scaling mechanic
        this.consecutiveJumps = 0;
        this.jumpBonus = 0;
        this.maxJumpBonus = 10;
        this.jumpScalingRate = 1.5;
        
        this.hatredMode = false;
        this.hatredDuration = 0;
    }

    update(input, opponent, deltaTime) {
        super.update(input, opponent, deltaTime);
        
        // Reset jump scaling when grounded
        if (this.isGrounded && this.consecutiveJumps > 0) {
            // Don't reset immediately, give 10 frames of buffer
            if (!this.jumpResetTimer) {
                this.jumpResetTimer = 10;
            } else {
                this.jumpResetTimer--;
                if (this.jumpResetTimer <= 0) {
                    this.consecutiveJumps = 0;
                    this.jumpBonus = 0;
                    this.jumpResetTimer = null;
                }
            }
        }
        
        // Update hatred mode
        if (this.hatredMode) {
            this.hatredDuration--;
            this.damageMultiplier = 1.5;
            if (this.hatredDuration <= 0) {
                this.hatredMode = false;
                this.damageMultiplier = 1.0;
            }
        }
    }

    tryJump() {
        const jumped = super.tryJump();
        if (jumped) {
            this.consecutiveJumps++;
            this.jumpBonus = Math.min(this.maxJumpBonus, this.consecutiveJumps * this.jumpScalingRate);
            // Apply bonus jump force
            this.velocity.y -= this.jumpBonus;
            this.jumpResetTimer = null;
        }
        return jumped;
    }

    useAttack1(opponent) {
        // Silence - heavy hitting attack
        this.isAttacking = true;
        this.startAbilityCooldown('attack1');
        
        const hitboxWidth = 70;
        const hitboxHeight = 55;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        this.hitboxes.push({
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 35,
            knockback: { x: 12, y: -5 },
            hitstun: 20,
            lifetime: 12,
            owner: this,
        });
        
        setTimeout(() => { this.isAttacking = false; }, 320);
    }

    useAttack2(opponent) {
        // Beam - highest damage projectile
        this.isAttacking = true;
        this.startAbilityCooldown('attack2');
        
        const laserWidth = 600;
        const laserHeight = 35;
        const laserX = this.facingRight ? this.position.x + this.size / 2 : this.position.x - laserWidth - this.size / 2;
        
        this.hitboxes.push({
            x: laserX,
            y: this.position.y - laserHeight / 2,
            width: laserWidth,
            height: laserHeight,
            damage: 50, // Highest damage!
            knockback: { x: 15, y: -6 },
            hitstun: 25,
            lifetime: 18,
            owner: this,
            isBeam: true,
            color: 'purple',
        });
        
        setTimeout(() => { this.isAttacking = false; }, 400);
    }

    useSpecial2(opponent) {
        // Bleed - poison DoT
        this.startAbilityCooldown('special2');
        
        const hitboxWidth = 60;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        const hitbox = {
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 10,
            knockback: { x: 5, y: -2 },
            hitstun: 10,
            lifetime: 10,
            owner: this,
            onHit: (target) => {
                // Apply bleed effect
                target.applyStatusEffect({
                    type: 'bleed',
                    duration: 300,
                    tickRate: 60,
                    tickTimer: 60,
                    onTick: (char) => {
                        char.takeDamage(10, this, {});
                    }
                });
            }
        };
        
        this.hitboxes.push(hitbox);
    }

    takeDamage(amount, attacker, hitData = {}) {
        const damage = super.takeDamage(amount, attacker, hitData);
        
        // Enter hatred mode when below 50% HP
        if (this.currentHP < this.maxHP / 2 && !this.hatredMode) {
            this.hatredMode = true;
            this.hatredDuration = 999999; // Until healed above 50%
        } else if (this.currentHP >= this.maxHP / 2) {
            this.hatredMode = false;
        }
        
        return damage;
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw jump boost indicator
        if (this.jumpBonus > 0) {
            ctx.save();
            ctx.fillStyle = 'cyan';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`+${this.jumpBonus.toFixed(1)}`, this.position.x, this.position.y + 35);
            
            // Draw trail effect
            for (let i = 0; i < 3; i++) {
                const alpha = 0.3 - i * 0.1;
                ctx.fillStyle = `rgba(204, 204, 255, ${alpha})`;
                ctx.fillRect(
                    this.position.x - this.size / 2,
                    this.position.y - this.size / 2 + i * 10,
                    this.size,
                    5
                );
            }
            ctx.restore();
        }
        
        // Draw hatred mode aura
        if (this.hatredMode) {
            ctx.save();
            ctx.strokeStyle = 'purple';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'purple';
            ctx.strokeRect(
                this.position.x - this.size / 2 - 3,
                this.position.y - this.size / 2 - 3,
                this.size + 6,
                this.size + 6
            );
            ctx.restore();
        }
        
        // Draw purple beam
        for (let hb of this.hitboxes) {
            if (hb.isBeam && hb.color === 'purple') {
                ctx.save();
                ctx.fillStyle = 'rgba(138, 43, 226, 0.9)';
                ctx.shadowBlur = 30;
                ctx.shadowColor = 'purple';
                ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
                ctx.restore();
            }
        }
    }

    reset(x, y) {
        super.reset(x, y);
        this.consecutiveJumps = 0;
        this.jumpBonus = 0;
        this.hatredMode = false;
        this.hatredDuration = 0;
    }
}
