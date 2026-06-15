/**
 * SniperCube.js - Zoning character with charged laser
 */

import { Character } from './Character.js';

export class SniperCube extends Character {
    constructor(x, y, facingRight = true) {
        super(3, x, y, facingRight);
        
        this.name = "Sniper Cube";
        this.color = "green";
        this.maxHP = 100;
        this.currentHP = 100;
        this.moveSpeed = 4;
        this.jumpForce = 13;
        
        this.abilities.attack1.name = "Slash";
        this.abilities.attack1.maxCooldown = 40;
        this.abilities.attack2.name = "Charged Laser";
        this.abilities.attack2.maxCooldown = 150;
        
        this.isCharging = false;
        this.chargeFrames = 0;
        this.maxChargeFrames = 60;
    }

    update(input, opponent, deltaTime) {
        super.update(input, opponent, deltaTime);
        
        if (this.isCharging) {
            this.chargeFrames++;
            this.velocity.x = 0; // Cannot move while charging
            
            // Flash effect
            const flashSpeed = Math.max(2, 20 - Math.floor(this.chargeFrames / 3));
            if (this.chargeFrames % flashSpeed < flashSpeed / 2) {
                this.color = "lime";
            } else {
                this.color = "green";
            }
            
            if (this.chargeFrames >= this.maxChargeFrames) {
                this.fireLaser();
                this.isCharging = false;
                this.chargeFrames = 0;
                this.color = "green";
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
        this.isCharging = true;
        this.chargeFrames = 0;
        this.startAbilityCooldown('attack2');
    }

    fireLaser() {
        const laserWidth = 800;
        const laserHeight = 25;
        const laserX = this.facingRight ? this.position.x + this.size / 2 : -laserWidth + this.position.x - this.size / 2;
        
        this.hitboxes.push({
            x: laserX,
            y: this.position.y - laserHeight / 2,
            width: laserWidth,
            height: laserHeight,
            damage: 25,
            knockback: { x: 10, y: -4 },
            hitstun: 18,
            lifetime: 12,
            owner: this,
            isBeam: true,
        });
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw charging indicator
        if (this.isCharging) {
            ctx.save();
            const progress = this.chargeFrames / this.maxChargeFrames;
            ctx.strokeStyle = 'lime';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 30, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
            ctx.stroke();
            ctx.restore();
        }
        
        // Draw laser beam
        for (let hb of this.hitboxes) {
            if (hb.isBeam) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                ctx.shadowBlur = 25;
                ctx.shadowColor = 'lime';
                ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
                ctx.restore();
            }
        }
    }
}
