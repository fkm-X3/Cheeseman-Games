/**
 * InputManager.js - Centralized input handling
 */

import { INPUT } from './Constants.js';

export class InputManager {
    constructor() {
        this.keys = {};
        this.prevKeys = {};
        this.player1Controls = INPUT.PLAYER1;
        this.player2Controls = INPUT.PLAYER2;
        this.locked = false;
        
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.locked) return;
            this.keys[e.code] = true;
            
            // Prevent default for game controls
            if (this.isGameControl(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.locked) return;
            this.keys[e.code] = false;
        });

        window.addEventListener('blur', () => {
            this.reset();
        });
    }

    isGameControl(code) {
        const allControls = [...Object.values(this.player1Controls), ...Object.values(this.player2Controls)];
        return allControls.includes(code);
    }

    update() {
        this.prevKeys = { ...this.keys };
    }

    isPressed(key) {
        return !!this.keys[key];
    }

    justPressed(key) {
        return this.keys[key] && !this.prevKeys[key];
    }

    justReleased(key) {
        return !this.keys[key] && this.prevKeys[key];
    }

    // Player-specific input checks
    getPlayerInput(playerNum) {
        const controls = playerNum === 1 ? this.player1Controls : this.player2Controls;
        
        return {
            left: this.isPressed(controls.LEFT),
            right: this.isPressed(controls.RIGHT),
            up: this.isPressed(controls.UP),
            down: this.isPressed(controls.DOWN),
            attack1: this.isPressed(controls.ATTACK1),
            attack2: this.isPressed(controls.ATTACK2),
            special1: this.isPressed(controls.SPECIAL1),
            special2: this.isPressed(controls.SPECIAL2),
            attack1Just: this.justPressed(controls.ATTACK1),
            attack2Just: this.justPressed(controls.ATTACK2),
            special1Just: this.justPressed(controls.SPECIAL1),
            special2Just: this.justPressed(controls.SPECIAL2),
            jumpJust: this.justPressed(controls.UP),
        };
    }

    reset() {
        this.keys = {};
        this.prevKeys = {};
    }

    lock() {
        this.locked = true;
        this.reset();
    }

    unlock() {
        this.locked = false;
    }

    setPlayerControls(playerNum, controls) {
        if (playerNum === 1) {
            this.player1Controls = controls;
        } else if (playerNum === 2) {
            this.player2Controls = controls;
        }
    }
}
