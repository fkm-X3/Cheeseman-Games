/**
 * main.js - Application bootstrap
 */

import { Game } from './core/Game.js';
import { CharacterFactory } from './utils/CharacterFactory.js';
import { PHYSICS } from './core/Constants.js';

class CubeCombatApp {
    constructor() {
        this.game = null;
        this.currentScreen = 'main-menu';
        this.selectedP1Character = 1;
        this.selectedP2Character = 2;
    }

    async init() {
        console.log('🎮 Cube Combat v2.0 - Overhauled Edition');
        console.log('Initializing...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Initialize game
        this.game = new Game('gameCanvas');
        this.game.init();
        
        // Setup UI event listeners
        this.setupUI();
        
        console.log('✓ Game initialized');
        
        // Show main menu
        this.showScreen('screen-main');
    }

    setupUI() {
        // Start button
        const startBtn = document.getElementById('btn-start-ai');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showCharacterSelect());
        }
        
        // Settings button
        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showScreen('screen-settings'));
        }
        
        // Back buttons
        const backButtons = document.querySelectorAll('[data-back]');
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-back') || 'screen-main';
                this.showScreen(target);
            });
        });
        
        // Character select
        this.setupCharacterSelect();
    }
    
    setupCharacterSelect() {
        const container = document.getElementById('character-grid');
        if (!container) return;
        
        const characters = CharacterFactory.getCharacterData();
        const availableChars = characters.filter(char => {
            if (char.dev && !this.game.stateManager.isDevMode()) return false;
            return this.game.stateManager.isCharacterUnlocked(char.id);
        });
        
        container.innerHTML = '';
        availableChars.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.charId = char.id;
            card.innerHTML = `
                <div class="char-icon" style="background: ${char.color}"></div>
                <div class="char-name">${char.name}</div>
                <div class="char-desc">${char.description}</div>
            `;
            
            card.addEventListener('click', () => {
                this.selectCharacter(char.id);
            });
            
            container.appendChild(card);
        });
        
        // Start match button
        const startMatchBtn = document.getElementById('btn-start-match');
        if (startMatchBtn) {
            startMatchBtn.addEventListener('click', () => this.startQuickMatch());
        }
    }
    
    selectCharacter(charId) {
        // For now, just set P1 character
        this.selectedP1Character = charId;
        
        // Visual feedback
        document.querySelectorAll('.character-card').forEach(card => {
            card.classList.remove('selected');
        });
        const selected = document.querySelector(`[data-char-id="${charId}"]`);
        if (selected) {
            selected.classList.add('selected');
        }
        
        // Update display
        const display = document.getElementById('selected-character');
        if (display) {
            const charData = CharacterFactory.getCharacterData().find(c => c.id === charId);
            display.textContent = charData ? charData.name : 'Unknown';
        }
    }
    
    showCharacterSelect() {
        this.showScreen('screen-character-select');
    }

    showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('[id^="screen-"]');
        screens.forEach(s => s.style.display = 'none');
        
        // Show target screen
        const target = document.getElementById(screenId);
        if (target) {
            target.style.display = 'block';
            this.currentScreen = screenId;
        }
        
        // Hide/show canvas container
        const gameContainer = document.querySelector('.main-wrapper');
        if (gameContainer) {
            gameContainer.style.display = screenId === 'screen-game' ? 'flex' : 'none';
        }
    }

    startQuickMatch() {
        console.log('[App] Starting quick match...');
        
        // Create players using CharacterFactory
        const player1 = CharacterFactory.create(this.selectedP1Character, 200, PHYSICS.FLOOR_Y, true);
        const player2 = CharacterFactory.create(this.selectedP2Character, 600, PHYSICS.FLOOR_Y, false);
        
        // Show game screen
        this.showScreen('screen-game');
        
        // Update sidebar names
        const p1Name = document.getElementById('p1-sb-name');
        const p2Name = document.getElementById('p2-sb-name');
        if (p1Name) p1Name.textContent = player1.name;
        if (p2Name) p2Name.textContent = player2.name;
        
        // Start the match
        this.game.start(player1, player2, 'local');
    }

    showMainMenu() {
        this.game?.stop();
        this.showScreen('screen-main');
    }
}

// Bootstrap the application
const app = new CubeCombatApp();
app.init().catch(error => {
    console.error('Failed to initialize Cube Combat:', error);
    alert('Failed to load game. Please refresh the page.');
});

// Expose to window for debugging
window.cubeCombat = app;
