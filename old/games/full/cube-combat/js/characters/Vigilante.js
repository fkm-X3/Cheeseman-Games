/**
 * Vigilante.js - Tank character with drone support
 */

import { Character } from './Character.js';

export class Vigilante extends Character {
    constructor(x, y, facingRight = true) {
        super(7, x, y, facingRight);
        
        this.name = "Vigilante";
        this.color = "#2F4F4F";
        this.maxHP = 125;
        this.currentHP = 125;
        this.moveSpeed = 4;
        this.jumpForce = 12;
        
        this.abilities.attack1.name = "Takedown";
        this.abilities.attack1.maxCooldown = 60;
        this.abilities.attack2.name = "Drone";
        this.abilities.attack2.maxCooldown = 300;
        
        this.drone = null;
        this.droneActive = false;
    }

    update(input, opponent, deltaTime) {
        super.update(input, opponent, deltaTime);
        
        // Update drone
        if (this.droneActive && this.drone) {
            this.drone.lifetime--;
            
            // Drone shoots every 30 frames
            if (this.drone.lifetime % 30 === 0 && opponent) {
                this.droneShoot(opponent);
            }
            
            // Drone orbits around character
            const angle = (Date.now() / 1000) % (Math.PI * 2);
            this.drone.x = this.position.x + Math.cos(angle) * 60;
            this.drone.y = this.position.y + Math.sin(angle) * 40 - 20;
            
            if (this.drone.lifetime <= 0) {
                this.droneActive = false;
                this.drone = null;
            }
        }
    }

    useAttack1(opponent) {
        // Takedown dash
        this.isAttacking = true;
        this.startAbilityCooldown('attack1');
        
        const dashSpeed = 18;
        const dashDirection = this.facingRight ? 1 : -1;
        this.velocity.x = dashSpeed * dashDirection;
        this.velocity.y = -2;
        
        const hitboxWidth = 70;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        this.hitboxes.push({
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: 20,
            knockback: { x: 12, y: -5 },
            hitstun: 16,
            lifetime: 12,
            owner: this,
        });
        
        setTimeout(() => { this.isAttacking = false; }, 300);
    }

    useAttack2(opponent) {
        // Deploy drone
        if (!this.droneActive) {
            this.droneActive = true;
            this.drone = {
                x: this.position.x,
                y: this.position.y - 40,
                lifetime: 600, // 10 seconds
            };
            this.startAbilityCooldown('attack2');
        }
    }

    droneShoot(opponent) {
        // Create projectile toward opponent
        const projectile = {
            x: this.drone.x,
            y: this.drone.y,
            width: 10,
            height: 10,
            damage: 5,
            knockback: { x: 2, y: -1 },
            hitstun: 8,
            lifetime: 60,
            owner: this,
            vx: (opponent.position.x - this.drone.x) / 30,
            vy: (opponent.position.y - this.drone.y) / 30,
            isProjectile: true,
        };
        
        this.hitboxes.push(projectile);
    }

    updateHitboxes() {
        super.updateHitboxes();
        
        // Update projectile positions
        for (let hb of this.hitboxes) {
            if (hb.isProjectile) {
                hb.x += hb.vx;
                hb.y += hb.vy;
            }
        }
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw drone
        if (this.droneActive && this.drone) {
            ctx.save();
            ctx.fillStyle = '#00CED1';
            ctx.strokeStyle = '#008B8B';
            ctx.lineWidth = 2;
            
            // Drone body
            ctx.fillRect(this.drone.x - 8, this.drone.y - 8, 16, 16);
            ctx.strokeRect(this.drone.x - 8, this.drone.y - 8, 16, 16);
            
            // Propellers
            const propAngle = (Date.now() / 50) % (Math.PI * 2);
            ctx.strokeStyle = '#00CED1';
            ctx.beginPath();
            ctx.moveTo(this.drone.x - 12, this.drone.y);
            ctx.lineTo(this.drone.x + 12, this.drone.y);
            ctx.moveTo(this.drone.x, this.drone.y - 12);
            ctx.lineTo(this.drone.x, this.drone.y + 12);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Draw projectiles
        for (let hb of this.hitboxes) {
            if (hb.isProjectile) {
                ctx.save();
                ctx.fillStyle = 'cyan';
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'cyan';
                ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
                ctx.restore();
            }
        }
    }

    reset(x, y) {
        super.reset(x, y);
        this.droneActive = false;
        this.drone = null;
    }
}
