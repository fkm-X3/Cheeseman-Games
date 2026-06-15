/**
 * MasterCube.js - Swaps between minion forms
 */

import { Character } from './Character.js';

export class MasterCube extends Character {
    constructor(x, y, facingRight = true) {
        super(9, x, y, facingRight);
        
        this.name = "Master Cube";
        this.color = "#FFD700";
        this.maxHP = 100;
        this.currentHP = 100;
        
        this.abilities.attack1.name = "Overtime";
        this.abilities.attack1.maxCooldown = 240;
        this.abilities.attack2.name = "Call Back";
        this.abilities.attack2.maxCooldown = 180;
        
        this.currentMinion = null;
        this.isMaster = true;
        this.overtimeActive = false;
        this.overtimeDuration = 0;
        this.returnDelay = 0;
        
        this.minionTypes = [
            { name: 'Fighter', color: 'crimson', damage: 20, speed: 6 },
            { name: 'Tank', color: 'steelblue', damage: 15, speed: 4, hp: 120 },
            { name: 'Speedster', color: 'lime', damage: 12, speed: 8 },
            { name: 'Sniper', color: 'purple', damage: 25, speed: 3 },
        ];
    }

    update(input, opponent, deltaTime) {
        super.update(input, opponent, deltaTime);
        
        // Update overtime buff
        if (this.overtimeActive) {
            this.overtimeDuration--;
            if (this.overtimeDuration <= 0) {
                this.overtimeActive = false;
                this.damageMultiplier = this.isMaster ? 0.5 : 1.0;
            }
        }
        
        // Handle return delay after minion dies
        if (this.returnDelay > 0) {
            this.returnDelay--;
            if (this.returnDelay === 0) {
                this.returnToMaster();
            }
        }
    }

    useAttack1(opponent) {
        // Overtime - buff minion stats
        if (!this.isMaster) {
            this.overtimeActive = true;
            this.overtimeDuration = 300; // 5 seconds
            this.damageMultiplier = 2.0;
            this.moveSpeed *= 1.5;
            this.startAbilityCooldown('attack1');
        }
    }

    useAttack2(opponent) {
        // Call Back - swap forms
        if (this.isMaster) {
            this.swapToMinion();
        } else {
            this.returnToMaster();
        }
        this.startAbilityCooldown('attack2');
    }

    swapToMinion() {
        const minion = this.minionTypes[Math.floor(Math.random() * this.minionTypes.length)];
        this.currentMinion = minion;
        this.isMaster = false;
        this.color = minion.color;
        this.moveSpeed = minion.speed;
        this.damageMultiplier = 0.5; // Minions do less damage unless in Overtime
        
        if (minion.hp) {
            this.maxHP = minion.hp;
            this.currentHP = minion.hp;
        }
    }

    returnToMaster() {
        this.isMaster = true;
        this.color = "#FFD700";
        this.moveSpeed = 5;
        this.damageMultiplier = 1.0;
        this.overtimeActive = false;
        this.currentMinion = null;
        this.maxHP = 100;
        this.currentHP = Math.min(this.currentHP, this.maxHP);
        this.returnDelay = 0;
        this.isInvincible = false;
    }

    takeDamage(amount, attacker, hitData = {}) {
        const damage = super.takeDamage(amount, attacker, hitData);
        
        // If minion dies, return to master after delay
        if (this.isDead && !this.isMaster) {
            this.isDead = false;
            this.currentHP = 1;
            this.isInvincible = true;
            this.returnDelay = 100;
        }
        
        return damage;
    }

    handleInput(input, opponent) {
        // Basic attack for minions
        if (!this.isMaster && input.attack1Just && !this.isAttacking) {
            this.minionAttack();
        } else {
            super.handleInput(input, opponent);
        }
    }

    minionAttack() {
        this.isAttacking = true;
        
        const hitboxWidth = 65;
        const hitboxHeight = 50;
        const hitboxX = this.position.x + (this.facingRight ? this.size / 2 : -this.size / 2 - hitboxWidth);
        
        const baseDamage = this.currentMinion?.damage || 20;
        
        this.hitboxes.push({
            x: hitboxX,
            y: this.position.y - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight,
            damage: baseDamage,
            knockback: { x: 8, y: -3 },
            hitstun: 14,
            lifetime: 10,
            owner: this,
        });
        
        setTimeout(() => { this.isAttacking = false; }, 250);
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw overtime indicator
        if (this.overtimeActive) {
            ctx.save();
            ctx.strokeStyle = 'gold';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'gold';
            ctx.strokeRect(
                this.position.x - this.size / 2 - 5,
                this.position.y - this.size / 2 - 5,
                this.size + 10,
                this.size + 10
            );
            ctx.restore();
        }
        
        // Draw minion type indicator
        if (!this.isMaster && this.currentMinion) {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.currentMinion.name, this.position.x, this.position.y - 35);
            ctx.restore();
        }
    }

    reset(x, y) {
        super.reset(x, y);
        this.returnToMaster();
    }
}
