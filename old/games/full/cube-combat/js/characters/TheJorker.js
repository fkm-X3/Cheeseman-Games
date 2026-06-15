/**
 * TheJorker.js - Glass cannon with high knockback
 */

import { Character } from './Character.js';

export class TheJorker extends Character {
    constructor(x, y, facingRight = true) {
        super(5, x, y, facingRight);
        
        this.name = "The Jorker";
        this.color = "#8B4513";
        this.maxHP = 75;
        this.currentHP = 75;
        this.jumpForce = 15;
        
        this.abilities.attack1.name = "Kick";
        this.abilities.attack1.maxCooldown = 25;
        this.abilities.attack2.name = "Laser";
        this.abilities.attack2.maxCooldown = 100;
    }

    useAttack1(opponent) {
        // Kick - short range, high knockback, stun
        this.isAttacking = true;
        this.startAbilityCooldown('attack1');
        
        const hitboxWidth = 50;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        this.hitboxes.push({
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 15,
            knockback: { x: 15, y: -6 }, // High knockback!
            hitstun: 30, // Long stun
            lifetime: 8,
            owner: this,
        });
        
        setTimeout(() => { this.isAttacking = false; }, 200);
    }

    useAttack2(opponent) {
        // Yellow laser
        this.isAttacking = true;
        this.startAbilityCooldown('attack2');
        
        const laserWidth = 500;
        const laserHeight = 28;
        const laserX = this.facingRight ? this.position.x + this.size / 2 : this.position.x - laserWidth - this.size / 2;
        
        this.hitboxes.push({
            x: laserX,
            y: this.position.y - laserHeight / 2,
            width: laserWidth,
            height: laserHeight,
            damage: 25,
            knockback: { x: 8, y: -4 },
            hitstun: 15,
            lifetime: 12,
            owner: this,
            isBeam: true,
            color: 'yellow',
        });
        
        setTimeout(() => { this.isAttacking = false; }, 250);
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw yellow laser
        for (let hb of this.hitboxes) {
            if (hb.isBeam && hb.color === 'yellow') {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'yellow';
                ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
                ctx.restore();
            }
        }
    }
}
