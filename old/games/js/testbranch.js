tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                gray: {
                    850: '#1f2937',
                    900: '#0f172a',
                    950: '#020617',
                },
                teal: {
                    450: '#14b8a6',
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('game-frame');
    const explanation = document.getElementById('explanation-panel');

    /**
     * Injects a game into the main iframe viewport
     * @param {string} gamePath - The filename/path of the game
     */
    window.loadGame = function (gamePath) {
        explanation.classList.add('hidden');
        iframe.classList.remove('hidden');

        // Prevent reloading if already active
        if (!iframe.src.includes(gamePath)) {
            iframe.src = gamePath;
        }
    };

    /**
     * Closes the active simulation and stops any logic/audio
     */
    window.closeGame = function () {
        explanation.classList.remove('hidden');
        iframe.classList.add('hidden');
        iframe.src = ""; // Critical to stop game music/loops
    };
});