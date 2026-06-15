/**
 * Character.js - Base character class for all fighters
 */

import { Vector2 } from '../utils/Vector2.js';
import { PHYSICS, COMBAT } from '../core/Constants.js';

export class Character {
    constructor(id, x, y, facingRight = true) {
        this.id = id;
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.facingRight = facingRight;
        
        // Stats (to be overridden by subclasses)
        this.maxHP = 100;
        this.currentHP = 100;
        this.moveSpeed = PHYSICS.MOVE_SPEED;
        this.jumpForce = PHYSICS.JUMP_FORCE;
        
        // State
        this.isGrounded = false;
        this.isJumping = false;
        this.isAttacking = false;
        this.isStunned = false;
        this.isInvincible = false;
        this.isBlocking = false;
        this.isDead = false;
        
        // Combat state
        this.hitStun = 0;
        this.blockStun = 0;
        this.comboCount = 0;
        this.comboDamage = 0;
        this.damageMultiplier = 1.0;
        
        // Abilities
        this.abilities = {
            attack1: { cooldown: 0, maxCooldown: 60, name: 'Attack1' },
            attack2: { cooldown: 0, maxCooldown: 120, name: 'Attack2' },
            special1: { cooldown: 0, maxCooldown: 180, name: 'Special1' },
            special2: { cooldown: 0, maxCooldown: 240, name: 'Special2' },
        };
        
        // Hitboxes
        this.hitboxes = [];
        this.hurtbox = {
            x: 0,
            y: 0,
            width: PHYSICS.CUBE_SIZE,
            height: PHYSICS.CUBE_SIZE,
        };
        
        // Visual
        this.color = '#00BFFF';
        this.size = PHYSICS.CUBE_SIZE;
        this.animationFrame = 0;
        this.flashTimer = 0;
        
        // Status effects
        this.statusEffects = [];
        
        // Jump tracking
        this.jumpCount = 0;
        this.maxJumps = 1;
        this.jumpBufferFrames = 0;
    }

    update(input, opponent, deltaTime = 1) {
        // Update cooldowns
        this.updateCooldowns();
        
        // Update status effects
        this.updateStatusEffects(deltaTime);
        
        // Update stun
        if (this.hitStun > 0) {
            this.hitStun--;
            this.isStunned = this.hitStun > 0;
        }
        if (this.blockStun > 0) {
            this.blockStun--;
        }
        
        // Reduce flash timer
        if (this.flashTimer > 0) this.flashTimer--;
        
        // Update jump buffer
        if (this.jumpBufferFrames > 0) this.jumpBufferFrames--;
        
        if (!this.isStunned && !this.isDead) {
            this.handleInput(input, opponent);
        }
        
        this.updatePhysics();
        this.updateHitboxes();
        this.updateAnimations();
        
        // Clamp to screen bounds
        this.clampToScreen();
    }

    handleInput(input, opponent) {
        // Movement (to be implemented by subclasses or here)
        if (input.left && !this.isAttacking) {
            this.velocity.x = -this.moveSpeed;
            this.facingRight = false;
        } else if (input.right && !this.isAttacking) {
            this.velocity.x = this.moveSpeed;
            this.facingRight = true;
        }
        
        // Jump
        if (input.jumpJust || (input.up && this.jumpBufferFrames > 0)) {
            this.tryJump();
            this.jumpBufferFrames = 0;
        } else if (input.up && !this.isGrounded) {
            this.jumpBufferFrames = 5; // 5 frame jump buffer
        }
        
        // Attacks (to be overridden by subclasses)
        if (input.attack1Just && this.canUseAbility('attack1')) {
            this.useAttack1(opponent);
        }
        if (input.attack2Just && this.canUseAbility('attack2')) {
            this.useAttack2(opponent);
        }
        if (input.special1Just && this.canUseAbility('special1')) {
            this.useSpecial1(opponent);
        }
        if (input.special2Just && this.canUseAbility('special2')) {
            this.useSpecial2(opponent);
        }
    }

    tryJump() {
        if (this.isGrounded || this.jumpCount < this.maxJumps) {
            this.velocity.y = -this.jumpForce;
            this.isJumping = true;
            this.isGrounded = false;
            this.jumpCount++;
            return true;
        }
        return false;
    }

    updatePhysics() {
        // Apply gravity
        if (!this.isGrounded) {
            this.velocity.y += PHYSICS.GRAVITY;
        }
        
        // Apply friction
        if (this.isGrounded && !this.isAttacking) {
            this.velocity.x *= PHYSICS.FRICTION;
        } else if (!this.isGrounded) {
            this.velocity.x *= PHYSICS.AIR_RESISTANCE;
        }
        
        // Update position
        this.position.add(this.velocity);
        
        // Ground collision
        if (this.position.y >= PHYSICS.FLOOR_Y) {
            this.position.y = PHYSICS.FLOOR_Y;
            this.velocity.y = 0;
            this.isGrounded = true;
            this.isJumping = false;
            this.jumpCount = 0;
        } else {
            this.isGrounded = false;
        }
    }

    updateHitboxes() {
        // Update hurtbox position
        this.hurtbox.x = this.position.x;
        this.hurtbox.y = this.position.y;
        
        // Update active hitboxes (to be implemented by subclasses)
        this.hitboxes = this.hitboxes.filter(hb => {
            hb.lifetime--;
            return hb.lifetime > 0;
        });
    }

    updateAnimations() {
        this.animationFrame++;
    }

    updateCooldowns() {
        for (let key in this.abilities) {
            if (this.abilities[key].cooldown > 0) {
                this.abilities[key].cooldown--;
            }
        }
    }

    updateStatusEffects(deltaTime) {
        this.statusEffects = this.statusEffects.filter(effect => {
            effect.duration -= deltaTime;
            if (effect.tickTimer !== undefined) {
                effect.tickTimer--;
                if (effect.tickTimer <= 0) {
                    effect.onTick(this);
                    effect.tickTimer = effect.tickRate || 60;
                }
            }
            return effect.duration > 0;
        });
    }

    clampToScreen() {
        const minX = this.size / 2;
        const maxX = 800 - this.size / 2;
        this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
    }

    // Ability system
    canUseAbility(abilityName) {
        return this.abilities[abilityName] && this.abilities[abilityName].cooldown === 0 && !this.isStunned;
    }

    startAbilityCooldown(abilityName) {
        if (this.abilities[abilityName]) {
            this.abilities[abilityName].cooldown = this.abilities[abilityName].maxCooldown;
        }
    }

    // Attack methods (to be overridden)
    useAttack1(opponent) {
        console.warn('useAttack1 not implemented for', this.constructor.name);
    }

    useAttack2(opponent) {
        console.warn('useAttack2 not implemented for', this.constructor.name);
    }

    useSpecial1(opponent) {
        console.warn('useSpecial1 not implemented for', this.constructor.name);
    }

    useSpecial2(opponent) {
        console.warn('useSpecial2 not implemented for', this.constructor.name);
    }

    // Combat methods
    takeDamage(amount, attacker, hitData = {}) {
        if (this.isInvincible || this.isDead) return 0;
        
        // Apply damage scaling for combos
        let scaledDamage = amount;
        if (attacker && attacker.comboCount > 1) {
            const scaling = 1 - (attacker.comboCount * COMBAT.COMBO_SCALING_PERCENT / 100);
            scaledDamage = amount * Math.max(scaling, COMBAT.MIN_COMBO_DAMAGE_PERCENT / 100);
        }
        
        scaledDamage = Math.round(scaledDamage * this.damageMultiplier);
        this.currentHP = Math.max(0, this.currentHP - scaledDamage);
        
        // Apply hitstun
        this.hitStun = hitData.hitstun || COMBAT.BASE_HITSTUN;
        
        // Apply knockback
        if (hitData.knockback) {
            const kb = hitData.knockback;
            this.velocity.x = kb.x * (this.facingRight ? -1 : 1);
            this.velocity.y = kb.y;
            this.isGrounded = false;
        }
        
        // Visual feedback
        this.flashTimer = 6;
        
        // Check death
        if (this.currentHP <= 0) {
            this.die();
        }
        
        return scaledDamage;
    }

    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    applyStatusEffect(effect) {
        this.statusEffects.push(effect);
    }

    die() {
        this.isDead = true;
        this.velocity.set(0, 0);
    }

    reset(x, y) {
        this.position.set(x, y);
        this.velocity.set(0, 0);
        this.currentHP = this.maxHP;
        this.isDead = false;
        this.isStunned = false;
        this.hitStun = 0;
        this.blockStun = 0;
        this.comboCount = 0;
        this.comboDamage = 0;
        this.statusEffects = [];
        this.hitboxes = [];
        this.flashTimer = 0;
        this.jumpCount = 0;
        
        for (let key in this.abilities) {
            this.abilities[key].cooldown = 0;
        }
    }

    // Rendering
    draw(ctx) {
        // Simple colored cube (to be enhanced by subclasses)
        ctx.save();
        
        // Flash effect when hit
        if (this.flashTimer > 0 && this.flashTimer % 6 < 3) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size,
            this.size
        );
        
        // Draw eyes
        ctx.fillStyle = 'white';
        const eyeSize = 6;
        const eyeY = this.position.y - 10;
        const eyeOffset = 12;
        ctx.fillRect(this.position.x - eyeOffset, eyeY, eyeSize, eyeSize);
        ctx.fillRect(this.position.x + eyeOffset - eyeSize, eyeY, eyeSize, eyeSize);
        
        ctx.restore();
    }

    drawDebug(ctx) {
        // Draw hurtbox
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            this.hurtbox.x - this.hurtbox.width / 2,
            this.hurtbox.y - this.hurtbox.height / 2,
            this.hurtbox.width,
            this.hurtbox.height
        );
        
        // Draw hitboxes
        ctx.strokeStyle = 'red';
        for (let hb of this.hitboxes) {
            ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);
        }
    }

    // Getters
    getHealthPercent() {
        return (this.currentHP / this.maxHP) * 100;
    }

    getCooldownPercent(abilityName) {
        const ability = this.abilities[abilityName];
        if (!ability) return 0;
        return (ability.cooldown / ability.maxCooldown) * 100;
    }

    isAbilityReady(abilityName) {
        return this.abilities[abilityName] && this.abilities[abilityName].cooldown === 0;
    }
}
