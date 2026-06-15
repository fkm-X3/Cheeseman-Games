/**
 * StateManager.js - Centralized game state management with save/load
 */

import { STORAGE_KEYS } from './Constants.js';

export class StateManager {
    constructor() {
        this.state = {
            gameMode: 'menu',
            matchState: null,
            playerData: {
                accountLevel: 1,
                accountXP: 0,
                coins: 0,
                unlockedCharacters: [1, 2], // Sword Master and Angry Sniper unlocked by default
                achievements: [],
                characterLevels: {},
                characterXP: {},
                settings: {
                    masterVolume: 1.0,
                    musicVolume: 0.7,
                    sfxVolume: 0.8,
                    voiceVolume: 0.9,
                    screenShake: true,
                    particles: true,
                    showFPS: false,
                    reducedMotion: false,
                },
            },
            match: {
                player1: null,
                player2: null,
                winner: null,
                roundNumber: 1,
                player1Wins: 0,
                player2Wins: 0,
            },
            network: {
                peer: null,
                conn: null,
                role: null,
                keys: {},
            }
        };

        this.achievements = this.initAchievements();
        this.loadGameData();
    }

    initAchievements() {
        return [
            { id: 1, name: "First Blood", desc: "Win your first battle", unlocks: 3, unlocked: false },
            { id: 2, name: "Sharpshooter", desc: "Hit 15 beams total", unlocks: 4, unlocked: false, progress: 0, maxProgress: 15 },
            { id: 3, name: "Unstoppable", desc: "Win without taking damage", unlocks: 5, unlocked: false },
            { id: 4, name: "Wombo Combo", desc: "Counter then hit every shot to win", unlocks: 6, unlocked: false },
            { id: 5, name: "In every timeline I kill you", desc: "Lose to Fbt_7", unlocks: 7, unlocked: false },
            { id: 6, name: "Not like this", desc: "Fbt_7 vs Bobbythe124", unlocks: null, unlocked: false },
            { id: 7, name: "Cube Master", desc: "Unlock all other cubes", unlocks: 9, unlocked: false }
        ];
    }

    saveGameData() {
        try {
            const saveData = {
                playerData: this.state.playerData,
                achievements: this.achievements,
                version: '2.0.0',
                timestamp: Date.now(),
            };
            localStorage.setItem(STORAGE_KEYS.GAME_DATA, JSON.stringify(saveData));
            console.log('[StateManager] Game saved successfully');
            return true;
        } catch (error) {
            console.error('[StateManager] Save failed:', error);
            return false;
        }
    }

    loadGameData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEYS.GAME_DATA);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Merge saved data
                if (data.playerData) {
                    this.state.playerData = { ...this.state.playerData, ...data.playerData };
                }
                if (data.achievements) {
                    this.achievements = data.achievements;
                }
                
                console.log('[StateManager] Game loaded successfully');
                return true;
            }
        } catch (error) {
            console.error('[StateManager] Load failed:', error);
        }
        return false;
    }

    resetProgress() {
        localStorage.removeItem(STORAGE_KEYS.GAME_DATA);
        this.state.playerData.unlockedCharacters = [1, 2];
        this.state.playerData.coins = 0;
        this.state.playerData.accountLevel = 1;
        this.state.playerData.accountXP = 0;
        this.achievements = this.initAchievements();
        this.saveGameData();
    }

    // Achievement management
    unlockAchievement(id) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            
            // Unlock associated character
            if (achievement.unlocks && !this.state.playerData.unlockedCharacters.includes(achievement.unlocks)) {
                this.state.playerData.unlockedCharacters.push(achievement.unlocks);
            }
            
            this.saveGameData();
            return achievement;
        }
        return null;
    }

    updateAchievementProgress(id, amount = 1) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked && achievement.hasOwnProperty('progress')) {
            achievement.progress += amount;
            if (achievement.progress >= achievement.maxProgress) {
                this.unlockAchievement(id);
            }
            this.saveGameData();
        }
    }

    isCharacterUnlocked(characterId) {
        return this.state.playerData.unlockedCharacters.includes(characterId);
    }

    // Currency and XP
    addCoins(amount) {
        this.state.playerData.coins += amount;
        this.saveGameData();
    }

    spendCoins(amount) {
        if (this.state.playerData.coins >= amount) {
            this.state.playerData.coins -= amount;
            this.saveGameData();
            return true;
        }
        return false;
    }

    addXP(amount, characterId = null) {
        // Account XP
        this.state.playerData.accountXP += amount;
        const newLevel = this.calculateLevel(this.state.playerData.accountXP);
        if (newLevel > this.state.playerData.accountLevel) {
            this.state.playerData.accountLevel = newLevel;
            console.log(`[StateManager] Level up! Now level ${newLevel}`);
        }

        // Character XP
        if (characterId) {
            if (!this.state.playerData.characterXP[characterId]) {
                this.state.playerData.characterXP[characterId] = 0;
                this.state.playerData.characterLevels[characterId] = 1;
            }
            this.state.playerData.characterXP[characterId] += amount;
            const charLevel = this.calculateLevel(this.state.playerData.characterXP[characterId], 50);
            if (charLevel > (this.state.playerData.characterLevels[characterId] || 1)) {
                this.state.playerData.characterLevels[characterId] = charLevel;
            }
        }

        this.saveGameData();
    }

    calculateLevel(xp, maxLevel = 100) {
        // XP curve: level N requires 100 * N XP
        let level = 1;
        let xpRequired = 0;
        while (level < maxLevel) {
            xpRequired += 100 * level;
            if (xp < xpRequired) break;
            level++;
        }
        return Math.min(level, maxLevel);
    }

    // Settings
    updateSetting(key, value) {
        if (this.state.playerData.settings.hasOwnProperty(key)) {
            this.state.playerData.settings[key] = value;
            this.saveGameData();
        }
    }

    getSetting(key) {
        return this.state.playerData.settings[key];
    }

    // Match state
    startMatch(player1Data, player2Data, mode = 'ai') {
        this.state.gameMode = mode;
        this.state.match = {
            player1: player1Data,
            player2: player2Data,
            winner: null,
            roundNumber: 1,
            player1Wins: 0,
            player2Wins: 0,
            startTime: Date.now(),
        };
    }

    endMatch(winner) {
        this.state.match.winner = winner;
        this.state.match.endTime = Date.now();
    }

    getGameMode() {
        return this.state.gameMode;
    }

    setGameMode(mode) {
        this.state.gameMode = mode;
    }

    // Debug
    enableDebugMode() {
        localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, 'true');
    }

    isDebugMode() {
        return localStorage.getItem(STORAGE_KEYS.DEBUG_MODE) === 'true';
    }

    isDevMode() {
        return localStorage.getItem(STORAGE_KEYS.DEV_MODE) === 'true';
    }
}
