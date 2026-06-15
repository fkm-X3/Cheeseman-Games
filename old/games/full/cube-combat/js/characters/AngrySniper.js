/**
 * AngrySniper.js - Aggressive rushdown character
 */

import { Character } from './Character.js';

export class AngrySniper extends Character {
    constructor(x, y, facingRight = true) {
        super(2, x, y, facingRight);
        
        this.name = "Angry Sniper";
        this.color = "red";
        this.maxHP = 100;
        this.currentHP = 100;
        
        // Abilities
        this.abilities.attack1.name = "Dash";
        this.abilities.attack1.maxCooldown = 0; // No cooldown!
        this.abilities.attack2.name = "Laser";
        this.abilities.attack2.maxCooldown = 120;
        
        // Laser state
        this.isChargingLaser = false;
        this.laserChargeFrames = 0;
        this.laserChargeDuration = 45;
    }

    update(input, opponent, deltaTime) {
        super.update(input, opponent, deltaTime);
        
        // Update laser charging
        if (this.isChargingLaser) {
            this.laserChargeFrames++;
            
            // Flash between cyan and black
            if (this.laserChargeFrames % 10 < 5) {
                this.color = "cyan";
            } else {
                this.color = "black";
            }
            
            if (this.laserChargeFrames >= this.laserChargeDuration) {
                this.fireLaser(opponent);
                this.isChargingLaser = false;
                this.laserChargeFrames = 0;
                this.color = "red";
            }
        }
    }

    useAttack1(opponent) {
        // Dash - instant charge with invincibility
        this.isAttacking = true;
        this.isInvincible = true;
        
        const dashSpeed = 15;
        const dashDirection = this.facingRight ? 1 : -1;
        this.velocity.x = dashSpeed * dashDirection;
        
        // Create hitbox
        const hitboxWidth = 60;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        this.hitboxes.push({
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 15,
            knockback: { x: 10, y: -3 },
            hitstun: 12,
            lifetime: 8,
            owner: this,
        });
        
        setTimeout(() => {
            this.isAttacking = false;
            this.isInvincible = false;
        }, 200);
    }

    useAttack2(opponent) {
        // Start laser charging
        this.isChargingLaser = true;
        this.laserChargeFrames = 0;
        this.velocity.x = 0; // Can't move while charging
        this.startAbilityCooldown('attack2');
    }

    fireLaser(opponent) {
        const laserWidth = 600;
        const laserHeight = 30;
        const laserX = this.facingRight ? this.position.x + this.size / 2 : this.position.x - laserWidth - this.size / 2;
        
        this.hitboxes.push({
            x: laserX,
            y: this.position.y - laserHeight / 2,
            width: laserWidth,
            height: laserHeight,
            damage: 30,
            knockback: { x: 12, y: -5 },
            hitstun: 20,
            lifetime: 15,
            owner: this,
            isBeam: true,
        });
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw laser beam
        if (this.isChargingLaser) {
            ctx.save();
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            const beamX = this.facingRight ? this.position.x + 30 : this.position.x - 300;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(beamX, this.position.y);
            ctx.stroke();
            ctx.restore();
        }
        
        // Draw active laser
        for (let hb of this.hitboxes) {
            if (hb.isBeam) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'red';
                ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
                ctx.restore();
            }
        }
    }
}
