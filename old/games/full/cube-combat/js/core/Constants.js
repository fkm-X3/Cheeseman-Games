/**
 * Constants.js - Global game constants
 */

export const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    FRAME_TIME: 1000 / 60,
};

export const PHYSICS = {
    GRAVITY: 0.6,
    FRICTION: 0.8,
    MOVE_SPEED: 5,
    JUMP_FORCE: 14,
    FLOOR_Y: 550,
    CUBE_SIZE: 50,
    AIR_RESISTANCE: 0.98,
};

export const COMBAT = {
    BASE_HITSTUN: 15,
    BASE_BLOCKSTUN: 8,
    PARRY_WINDOW_FRAMES: 8,
    COMBO_SCALING_PERCENT: 10,
    MIN_COMBO_DAMAGE_PERCENT: 50,
    MAX_COMBO_LENGTH: 20,
    KNOCKBACK_BASE: 8,
    KNOCKBACK_SCALING: 0.5,
};

export const COLORS = {
    PLAYER_BLUE: '#00BFFF',
    PLAYER_RED: '#FF6347',
    BACKGROUND: '#0a0a0a',
    FLOOR: '#333',
    HEALTH_GREEN: '#00FF00',
    HEALTH_YELLOW: '#FFFF00',
    HEALTH_RED: '#FF0000',
    PARTICLE_HIT: '#FF4444',
    PARTICLE_CRITICAL: '#FFD700',
};

export const INPUT = {
    PLAYER1: {
        LEFT: 'KeyA',
        RIGHT: 'KeyD',
        UP: 'KeyW',
        DOWN: 'KeyS',
        ATTACK1: 'Space',
        ATTACK2: 'KeyF',
        SPECIAL1: 'KeyQ',
        SPECIAL2: 'KeyE',
    },
    PLAYER2: {
        LEFT: 'ArrowLeft',
        RIGHT: 'ArrowRight',
        UP: 'ArrowUp',
        DOWN: 'ArrowDown',
        ATTACK1: 'Numpad0',
        ATTACK2: 'Numpad1',
        SPECIAL1: 'Numpad2',
        SPECIAL2: 'Numpad3',
    }
};

export const STORAGE_KEYS = {
    GAME_DATA: 'cubeCombatData',
    DEBUG_MODE: 'cc_debugMode',
    DEV_MODE: 'cc_dev',
    TESTER_MODE: 'cc_tester',
    SETTINGS: 'cc_settings',
    PROGRESSION: 'cc_progression',
};

export const PROGRESSION = {
    COINS_PER_WIN: 100,
    COINS_PER_LOSS: 50,
    COINS_COMBO_BONUS: 5,
    XP_PER_WIN: 50,
    XP_PER_LOSS: 25,
    ACCOUNT_LEVEL_CAP: 100,
    CHARACTER_LEVEL_CAP: 50,
};

export const UI = {
    TOAST_DURATION: 3000,
    SCREEN_SHAKE_DECAY: 0.9,
    PARTICLE_LIFETIME: 60,
    FLOATING_TEXT_DURATION: 90,
    MENU_TRANSITION_TIME: 300,
};
