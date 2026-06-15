/**
 * CharacterFactory.js - Creates character instances by ID
 */

import { SwordMaster } from '../characters/SwordMaster.js';
import { AngrySniper } from '../characters/AngrySniper.js';
import { SniperCube } from '../characters/SniperCube.js';
import { MagicCube } from '../characters/MagicCube.js';
import { TheJorker } from '../characters/TheJorker.js';
import { ImaTouchYou } from '../characters/ImaTouchYou.js';
import { Vigilante } from '../characters/Vigilante.js';
import { Fbt7 } from '../characters/Fbt7.js';
import { MasterCube } from '../characters/MasterCube.js';
import { Bobbythe124 } from '../characters/Bobbythe124.js';

export class CharacterFactory {
    static create(characterId, x, y, facingRight = true) {
        switch (characterId) {
            case 1:
                return new SwordMaster(x, y, facingRight);
            case 2:
                return new AngrySniper(x, y, facingRight);
            case 3:
                return new SniperCube(x, y, facingRight);
            case 4:
                return new MagicCube(x, y, facingRight);
            case 5:
                return new TheJorker(x, y, facingRight);
            case 6:
                return new ImaTouchYou(x, y, facingRight);
            case 7:
                return new Vigilante(x, y, facingRight);
            case 8:
                return new Fbt7(x, y, facingRight);
            case 9:
                return new MasterCube(x, y, facingRight);
            case 10:
                return new Bobbythe124(x, y, facingRight);
            default:
                console.warn(`Unknown character ID: ${characterId}, defaulting to Sword Master`);
                return new SwordMaster(x, y, facingRight);
        }
    }

    static getCharacterData() {
        return [
            { id: 1, name: "Sword Master", color: "blue", description: "Balanced fighter" },
            { id: 2, name: "Angry Sniper", color: "red", description: "Aggressive rushdown" },
            { id: 3, name: "Sniper Cube", color: "green", description: "Zoning specialist" },
            { id: 4, name: "Magic Cube", color: "hotpink", description: "Defensive tank" },
            { id: 5, name: "The Jorker", color: "#8B4513", description: "Glass cannon" },
            { id: 6, name: "Ima Touch You", color: "indigo", description: "Control character" },
            { id: 7, name: "Vigilante", color: "#2F4F4F", description: "Tank with support" },
            { id: 8, name: "Fbt_7", color: "black", description: "Boss character", dev: true },
            { id: 9, name: "Master Cube", color: "#FFD700", description: "Shape shifter", unlock: "Unlock all" },
            { id: 10, name: "Bobbythe124", color: "#CCCCFF", description: "Dev character", dev: true },
        ];
    }

    static getAvailableCharacters(stateManager) {
        const allCharacters = this.getCharacterData();
        const isDev = stateManager.isDevMode();
        
        return allCharacters.filter(char => {
            // Dev characters require dev mode
            if (char.dev && !isDev) return false;
            
            // Check if character is unlocked
            return stateManager.isCharacterUnlocked(char.id);
        });
    }
}
