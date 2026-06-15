/**
 * MagicCube.js - Defensive character with energy shield
 */

import { Character } from './Character.js';

export class MagicCube extends Character {
    constructor(x, y, facingRight = true) {
        super(4, x, y, facingRight);
        
        this.name = "Magic Cube";
        this.color = "hotpink";
        this.maxHP = 100;
        this.currentHP = 100;
        this.moveSpeed = 4;
        this.jumpForce = 12;
        
        this.abilities.attack1.name = "Slash";
        this.abilities.attack1.maxCooldown = 35;
        this.abilities.attack2.name = "Block";
        this.abilities.attack2.maxCooldown = 0;
        
        // Shield energy
        this.maxShieldEnergy = 100;
        this.shieldEnergy = 100;
        this.isShielding = false;
        this.shieldRechargeDelay = 0;
    }

    update(input, opponent, deltaTime) {
        // Handle shield input before super.update
        if (input.attack2 && this.shieldEnergy > 0) {
            this.isShielding = true;
            this.isBlocking = true;
            this.shieldEnergy = Math.max(0, this.shieldEnergy - 1);
            this.shieldRechargeDelay = 60;
            this.velocity.x *= 0.5; // Slow movement while blocking
        } else {
            this.isShielding = false;
            this.isBlocking = false;
        }
        
        super.update(input, opponent, deltaTime);
        
        // Recharge shield when not blocking
        if (!this.isShielding) {
            if (this.shieldRechargeDelay > 0) {
                this.shieldRechargeDelay--;
            } else {
                this.shieldEnergy = Math.min(this.maxShieldEnergy, this.shieldEnergy + 0.5);
            }
        }
    }

    useAttack1(opponent) {
        this.isAttacking = true;
        this.startAbilityCooldown('attack1');
        
        const hitboxWidth = 65;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        this.hitboxes.push({
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 22,
            knockback: { x: 7, y: -3 },
            hitstun: 14,
            lifetime: 10,
            owner: this,
        });
        
        setTimeout(() => { this.isAttacking = false; }, 280);
    }

    useAttack2(opponent) {
        // Block is handled in update() based on held input
    }

    takeDamage(amount, attacker, hitData = {}) {
        if (this.isShielding && this.shieldEnergy > 0) {
            // Shield absorbs damage
            const shieldDamage = Math.min(amount, this.shieldEnergy);
            this.shieldEnergy -= shieldDamage;
            const remainingDamage = amount - shieldDamage;
            
            if (remainingDamage > 0) {
                return super.takeDamage(remainingDamage, attacker, hitData);
            }
            return 0;
        }
        
        return super.takeDamage(amount, attacker, hitData);
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw shield
        if (this.isShielding) {
            ctx.save();
            ctx.strokeStyle = 'cyan';
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        
        // Draw shield energy bar (when below 100%)
        if (this.shieldEnergy < this.maxShieldEnergy) {
            ctx.save();
            const barWidth = 50;
            const barHeight = 4;
            const barX = this.position.x - barWidth / 2;
            const barY = this.position.y - 40;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = 'cyan';
            ctx.fillRect(barX, barY, barWidth * (this.shieldEnergy / this.maxShieldEnergy), barHeight);
            ctx.restore();
        }
    }

    reset(x, y) {
        super.reset(x, y);
        this.shieldEnergy = this.maxShieldEnergy;
        this.isShielding = false;
        this.shieldRechargeDelay = 0;
    }
}
