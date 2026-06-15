/**
 * SwordMaster.js - The balanced starter character
 */

import { Character } from './Character.js';

export class SwordMaster extends Character {
    constructor(x, y, facingRight = true) {
        super(1, x, y, facingRight);
        
        // Stats
        this.maxHP = 100;
        this.currentHP = 100;
        this.name = "Sword Master";
        this.color = "blue";
        
        // Abilities
        this.abilities.attack1.name = "Slash";
        this.abilities.attack1.maxCooldown = 30;
        this.abilities.attack2.name = "Parry";
        this.abilities.attack2.maxCooldown = 180;
        
        // Parry state
        this.isParrying = false;
        this.parryFrames = 0;
        this.parryDuration = 30;
    }

    update(input, opponent, deltaTime) {
        super.update(input, opponent, deltaTime);
        
        // Update parry state
        if (this.isParrying) {
            this.parryFrames--;
            if (this.parryFrames <= 0) {
                this.isParrying = false;
                this.color = "blue";
            }
        }
    }

    useAttack1(opponent) {
        // Slash attack
        this.isAttacking = true;
        this.startAbilityCooldown('attack1');
        
        // Create hitbox
        const hitboxWidth = 70;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        const hitboxY = this.position.y - hitboxHeight / 2;
        
        this.hitboxes.push({
            x: hitboxX,
            y: hitboxY,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 25,
            knockback: { x: 8, y: -4 },
            hitstun: 15,
            lifetime: 10,
            owner: this,
        });
        
        setTimeout(() => { this.isAttacking = false; }, 300);
    }

    useAttack2(opponent) {
        // Parry - becomes invincible and reflects attacks
        this.isParrying = true;
        this.isInvincible = true;
        this.parryFrames = this.parryDuration;
        this.color = "black";
        this.startAbilityCooldown('attack2');
        
        setTimeout(() => {
            this.isInvincible = false;
        }, this.parryDuration * 16.67); // Convert frames to ms at 60fps
    }

    takeDamage(amount, attacker, hitData = {}) {
        // If parrying, reflect the attack
        if (this.isParrying && attacker) {
            attacker.takeDamage(amount, this, { ...hitData, hitstun: 45 });
            attacker.hitStun = 45; // Stun the attacker
            return 0;
        }
        
        return super.takeDamage(amount, attacker, hitData);
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw parry indicator
        if (this.isParrying) {
            ctx.save();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}
