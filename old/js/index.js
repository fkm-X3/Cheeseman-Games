function setTheme(themeName) {
    if (themeName === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }
    localStorage.setItem('cheeseman-theme', themeName);

    
    document.querySelectorAll('.active-theme-btn').forEach(btn => {
        if (btn.dataset.theme === themeName) {
            btn.classList.add('ring-2', 'ring-cheeseman-primary', 'ring-offset-2', 'ring-offset-transparent');
        } else {
            btn.classList.remove('ring-2', 'ring-cheeseman-primary', 'ring-offset-2', 'ring-offset-transparent');
        }
    });
}


function toggleSetting(settingId) {
    const checkbox = document.getElementById(`setting-${settingId.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
    if (!checkbox) return;

    const isEnabled = checkbox.checked;
    localStorage.setItem(`cheeseman-setting-${settingId}`, isEnabled);

    
    if (settingId === 'reducedMotion') {
        if (isEnabled) {
            document.documentElement.style.setProperty('--transition-speed', '0s');
            document.body.classList.add('reduce-motion');
        } else {
            document.documentElement.style.removeProperty('--transition-speed');
            document.body.classList.remove('reduce-motion');
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    const savedTheme = localStorage.getItem('cheeseman-theme') || 'default';
    setTheme(savedTheme);

    
    switchTab('home');

    
    const settings = ['reducedMotion', 'showFps'];
    settings.forEach(setting => {
        const savedValue = localStorage.getItem(`cheeseman-setting-${setting}`);
        const checkbox = document.getElementById(`setting-${setting.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
        if (checkbox && savedValue !== null) {
            checkbox.checked = savedValue === 'true';
            
            if (setting === 'reducedMotion' && checkbox.checked) {
                document.body.classList.add('reduce-motion');
            }
        }
    });

    
});


function switchTab(tabId) {
    
    ['home', 'games', 'community', 'settings', 'credits', 'socials'].forEach(id => {
        const el = document.getElementById(`view-${id}`);
        if (el) el.classList.add('hidden');
    });

    
    const view = document.getElementById(`view-${tabId}`);
    if (view) view.classList.remove('hidden');

    
    const mainScroll = document.getElementById('main-scroll');
    if (mainScroll) mainScroll.scrollTop = 0;

    
    
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-cheeseman-highlight/20', 'text-cheeseman-content');
        el.classList.add('text-cheeseman-muted');
    });
    const deskBtn = document.getElementById(`desk-nav-${tabId}`);
    if (deskBtn) {
        deskBtn.classList.add('bg-cheeseman-highlight/20', 'text-cheeseman-content');
        deskBtn.classList.remove('text-cheeseman-muted');
    }

    
    document.querySelectorAll('.mobile-nav-btn').forEach(el => {
        el.classList.remove('text-cheeseman-primary');
        el.classList.add('text-cheeseman-muted');
        if (el.dataset.target === tabId) {
            el.classList.add('text-cheeseman-primary');
            el.classList.remove('text-cheeseman-muted');
        }
    });
}


let gameInterval = null;
let activeGame = null;
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const tttBoard = document.getElementById('ttt-board');
const memoryBoard = document.getElementById('memory-board');
const highlowBoard = document.getElementById('highlow-board');
const solBoard = document.getElementById('solitaire-board');
const iframe = document.getElementById('game-iframe');

const overlay = document.getElementById('game-overlay');
const uiLayer = document.getElementById('game-ui-layer');
const titleEl = document.getElementById('active-game-title');
const statusTitle = document.getElementById('game-status-title');
const statusDesc = document.getElementById('game-status-desc');
const startBtn = document.getElementById('start-btn');
const hintEl = document.getElementById('game-controls-hint');

function launchGame(gameType) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    activeGame = gameType;
    uiLayer.classList.remove('hidden');
    statusTitle.textContent = "READY?";
    statusTitle.className = "text-4xl font-black text-white mb-2 italic tracking-widest";
    statusDesc.textContent = "Press start to begin.";
    startBtn.classList.remove('hidden');

    
    canvas.classList.add('hidden');
    tttBoard.classList.add('hidden');
    memoryBoard.classList.add('hidden');
    highlowBoard.classList.add('hidden');
    highlowBoard.classList.remove('flex');
    solBoard.classList.add('hidden');
    solBoard.classList.remove('flex');
    iframe.classList.add('hidden');
    iframe.src = '';

    if (gameType === 'tictactoe') {
        titleEl.innerHTML = '<i class="fa-solid fa-x text-indigo-400 mr-2"></i> NEON TIC-TAC-TOE';
        hintEl.innerHTML = 'Tap a square to place your mark';
        tttBoard.classList.remove('hidden');
        tttBoard.classList.add('grid');
        initTicTacToe(false);
    } else if (gameType === 'snake') {
        titleEl.innerHTML = '<i class="fa-solid fa-worm text-emerald-400 mr-2"></i> CYBER SNAKE';
        hintEl.innerHTML = 'Use Arrow Keys or Swipe to change direction';
        canvas.classList.remove('hidden');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 400, 400);
    } else if (gameType === 'reflex') {
        titleEl.innerHTML = '<i class="fa-solid fa-bolt text-orange-400 mr-2"></i> REFLEX TESTER';
        hintEl.innerHTML = 'Wait for green, then click FAST!';
        canvas.classList.remove('hidden');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 400, 400);
    } else if (gameType === 'breaker') {
        titleEl.innerHTML = '<i class="fa-solid fa-shield-halved text-blue-400 mr-2"></i> NEON BREAKER';
        hintEl.innerHTML = 'Use Arrow Keys or Touch to move paddle';
        canvas.classList.remove('hidden');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 400, 400);
    } else if (gameType === 'match') {
        titleEl.innerHTML = '<i class="fa-solid fa-layer-group text-purple-400 mr-2"></i> CYBER MATCH';
        hintEl.innerHTML = 'Tap cards to find pairs';
        memoryBoard.classList.remove('hidden');
        memoryBoard.classList.add('grid');
        initMemoryMatch(false);
    } else if (gameType === 'highlow') {
        titleEl.innerHTML = '<i class="fa-solid fa-arrow-down-up-across-line text-yellow-400 mr-2"></i> NEON HIGH-LOW';
        hintEl.innerHTML = 'Guess if next card is higher or lower';
        highlowBoard.classList.remove('hidden');
        highlowBoard.classList.add('flex');
        initHighLow(false);
    } else if (gameType === 'solitaire') {
        titleEl.innerHTML = '<i class="fa-solid fa-diamond text-green-400 mr-2"></i> CYBER SOLITAIRE';
        hintEl.innerHTML = 'Tap to Move • Tap Deck to Deal';
        solBoard.classList.remove('hidden');
        solBoard.classList.add('flex');
    } else if (gameType === 'cubecombat') {
        titleEl.innerHTML = '<i class="fa-solid fa-cube text-indigo-400 mr-2"></i> CUBE COMBAT';
        hintEl.innerHTML = 'Physics Arena';
        iframe.classList.remove('hidden');
        iframe.src = 'games/full/cube-combat.html';
        
        startBtn.classList.add('hidden');
        statusTitle.textContent = "";
        statusDesc.textContent = "";
        uiLayer.classList.add('hidden'); 
    } else if (gameType === 'sketchycasino') {
        titleEl.innerHTML = '<i class="fa-solid fa-dice text-red-400 mr-2"></i> SKETCHY CASINO';
        hintEl.innerHTML = 'Try Your Luck';
        iframe.classList.remove('hidden');
        iframe.src = 'games/full/sketchy-casino.html';
        
        startBtn.classList.add('hidden');
        statusTitle.textContent = "";
        statusDesc.textContent = "";
        uiLayer.classList.add('hidden'); 
    }
}

function closeGame() {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    clearInterval(gameInterval);
    activeGame = null;
    if (iframe) {
        iframe.classList.add('hidden');
        iframe.src = '';
    }
}

startBtn.addEventListener('click', () => {
    uiLayer.classList.add('hidden');
    if (activeGame === 'snake') startSnake();
    if (activeGame === 'tictactoe') initTicTacToe(true);
    if (activeGame === 'reflex') startReflex();
    if (activeGame === 'breaker') startBreaker();
    if (activeGame === 'match') initMemoryMatch(true);
    if (activeGame === 'highlow') initHighLow(true);
    if (activeGame === 'solitaire') initSolitaire();
});


function startSnake() {
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gridSize = 20;
    let tileCount = 20; 
    let speed = 100;

    draw();

    const handleKey = (e) => {
        if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
        if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
        if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
        if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
    };
    document.addEventListener('keydown', handleKey);

    let touchStartX = 0;
    let touchStartY = 0;
    overlay.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    overlay.addEventListener('touchend', e => {
        let touchEndX = e.changedTouches[0].screenX;
        let touchEndY = e.changedTouches[0].screenY;
        handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    }, { passive: true });

    function handleSwipe(sx, sy, ex, ey) {
        let xDiff = ex - sx;
        let yDiff = ey - sy;
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0 && dx === 0) { dx = 1; dy = 0; }
            else if (xDiff < 0 && dx === 0) { dx = -1; dy = 0; }
        } else {
            if (yDiff > 0 && dy === 0) { dx = 0; dy = 1; }
            else if (yDiff < 0 && dy === 0) { dx = 0; dy = -1; }
        }
    }

    function gameLoop() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver(`Score: ${score}`);
            return;
        }
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y && snake.length > 1) {
                gameOver(`Score: ${score}`);
                return;
            }
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++;
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } else {
            if (dx !== 0 || dy !== 0) snake.pop();
        }
        draw();
    }

    function draw() {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 400, 400);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i < tileCount; i++) {
            ctx.beginPath(); ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, 400); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * gridSize); ctx.lineTo(400, i * gridSize); ctx.stroke();
        }
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        for (let i = 0; i < snake.length; i++) {
            if (i === 0) ctx.fillStyle = '#34d399';
            else ctx.fillStyle = '#10b981';
            ctx.fillRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    gameInterval = setInterval(gameLoop, speed);

    function gameOver(msg) {
        clearInterval(gameInterval);
        document.removeEventListener('keydown', handleKey);
        uiLayer.classList.remove('hidden');
        statusTitle.textContent = "GAME OVER";
        statusTitle.className = "text-4xl font-black text-red-500 mb-2 italic";
        statusDesc.textContent = msg;
        startBtn.innerHTML = "RETRY";
    }
}


function initTicTacToe(playable) {
    tttBoard.innerHTML = '';
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = playable;

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'bg-slate-700/50 rounded-lg flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-slate-600 transition-colors h-full w-full aspect-square border-2 border-slate-600';
        if (playable) {
            cell.addEventListener('click', () => handleCellClick(cell, i));
        }
        tttBoard.appendChild(cell);
    }

    function handleCellClick(cell, index) {
        if (board[index] === '' && gameActive) {
            board[index] = currentPlayer;
            cell.textContent = currentPlayer;
            cell.classList.add(currentPlayer === 'X' ? 'text-indigo-400' : 'text-pink-400');
            if (checkWin()) {
                gameActive = false;
                setTimeout(() => endTTT(false), 500);
            } else if (!board.includes('')) {
                gameActive = false;
                setTimeout(() => endTTT(true), 500);
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                if (currentPlayer === 'O') setTimeout(aiMove, 300);
            }
        }
    }

    function aiMove() {
        if (!gameActive) return;
        let available = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
        if (available.length > 0) {
            let move = available[Math.floor(Math.random() * available.length)];
            board[move] = 'O';
            const cells = tttBoard.children;
            cells[move].textContent = 'O';
            cells[move].classList.add('text-pink-400');
            if (checkWin()) {
                gameActive = false;
                setTimeout(() => endTTT(false), 500);
            } else if (!board.includes('')) {
                setTimeout(() => endTTT(true), 500);
            } else {
                currentPlayer = 'X';
            }
        }
    }

    function checkWin() {
        const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        return wins.some(condition => {
            return condition.every(index => board[index] === currentPlayer);
        });
    }

    function endTTT(draw) {
        uiLayer.classList.remove('hidden');
        if (draw) {
            statusTitle.textContent = "DRAW";
            statusTitle.className = "text-4xl font-black text-slate-400 mb-2";
        } else {
            const color = currentPlayer === 'X' ? 'text-indigo-400' : 'text-pink-400';
            statusTitle.textContent = `${currentPlayer} WINS!`;
            statusTitle.className = `text-4xl font-black ${color} mb-2`;
        }
        statusDesc.textContent = "Play again?";
        startBtn.innerHTML = "REMATCH";
    }
}


function startReflex() {
    let state = 'waiting';
    let startTime = 0;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("WAIT FOR GREEN...", 200, 200);

    const randomDelay = 2000 + Math.random() * 3000;
    const timeout = setTimeout(() => {
        if (activeGame !== 'reflex') return;
        state = 'ready';
        startTime = Date.now();
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = 'white';
        ctx.fillText("CLICK NOW!", 200, 200);
    }, randomDelay);

    const clickHandler = () => {
        if (state === 'waiting') {
            clearTimeout(timeout);
            finishReflex("Too Early!", true);
        } else if (state === 'ready') {
            const reaction = Date.now() - startTime;
            finishReflex(`${reaction}ms`, false);
        }
        canvas.removeEventListener('mousedown', clickHandler);
        canvas.removeEventListener('touchstart', clickHandler);
    };
    canvas.addEventListener('mousedown', clickHandler);
    canvas.addEventListener('touchstart', clickHandler);

    function finishReflex(text, isBad) {
        uiLayer.classList.remove('hidden');
        statusTitle.textContent = text;
        statusTitle.className = isBad ? "text-4xl font-black text-red-500 mb-2" : "text-5xl font-black text-white mb-2";
        statusDesc.textContent = isBad ? "Try again" : "Great reaction time!";
        startBtn.innerHTML = "TRY AGAIN";
    }
}


function startBreaker() {
    let paddleH = 10, paddleW = 75, paddleX = (canvas.width - paddleW) / 2;
    let rightPressed = false, leftPressed = false;
    let ballRadius = 8;
    let x = canvas.width / 2, y = canvas.height - 30;
    let dx = 3, dy = -3;
    let brickRowCount = 5, brickColumnCount = 6;
    let brickWidth = 55, brickHeight = 20, brickPadding = 10;
    let brickOffsetTop = 30, brickOffsetLeft = 10;
    let score = 0;

    let bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    function keyDownHandler(e) {
        if (e.key == "Right" || e.key == "ArrowRight") rightPressed = true;
        else if (e.key == "Left" || e.key == "ArrowLeft") leftPressed = true;
    }
    function keyUpHandler(e) {
        if (e.key == "Right" || e.key == "ArrowRight") rightPressed = false;
        else if (e.key == "Left" || e.key == "ArrowLeft") leftPressed = false;
    }
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        let touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        paddleX = touchX - paddleW / 2;
    }, { passive: false });

    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                let b = bricks[c][r];
                if (b.status == 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score++;
                        if (score == brickRowCount * brickColumnCount) endGame("YOU WIN!", false);
                    }
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status == 1) {
                    let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = `hsl(${c * 60}, 70%, 60%)`;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleH - 5, paddleW, paddleH);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();
        ctx.closePath();
        ctx.font = "16px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Score: " + score, 8, 20);

        collisionDetection();

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
        if (y + dy < ballRadius) dy = -dy;
        else if (y + dy > canvas.height - ballRadius - 10) {
            if (x > paddleX && x < paddleX + paddleW) dy = -dy;
            else {
                endGame("GAME OVER", true);
                return;
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleW) paddleX += 5;
        else if (leftPressed && paddleX > 0) paddleX -= 5;

        x += dx;
        y += dy;
        gameInterval = requestAnimationFrame(draw);
    }

    function endGame(msg, bad) {
        cancelAnimationFrame(gameInterval);
        document.removeEventListener("keydown", keyDownHandler);
        document.removeEventListener("keyup", keyUpHandler);
        uiLayer.classList.remove('hidden');
        statusTitle.textContent = msg;
        statusTitle.className = bad ? "text-4xl font-black text-red-500 mb-2" : "text-4xl font-black text-green-500 mb-2";
        statusDesc.textContent = `Final Score: ${score}`;
        startBtn.innerHTML = "RETRY";
    }
    draw();
}


function initMemoryMatch(playable) {
    memoryBoard.innerHTML = '';
    const icons = ['fa-ghost', 'fa-gamepad', 'fa-heart', 'fa-bolt', 'fa-star', 'fa-bomb', 'fa-robot', 'fa-dragon'];
    const cards = [...icons, ...icons];
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    let flippedCards = [];
    let matchedPairs = 0;
    let locked = false;

    cards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'bg-slate-700/50 rounded-lg flex items-center justify-center text-3xl transition-all duration-300 transform perspective-1000 h-full w-full aspect-square border-2 border-slate-600 cursor-pointer hover:bg-slate-600';
        card.innerHTML = `<i class="fa-solid fa-question text-slate-500"></i>`;
        card.dataset.icon = icon;

        if (playable) {
            card.addEventListener('click', () => {
                if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
                card.classList.add('flipped', 'bg-indigo-600', 'border-indigo-400');
                card.classList.remove('bg-slate-700/50', 'border-slate-600');
                card.innerHTML = `<i class="fa-solid ${icon} text-white animate-bounce"></i>`;
                flippedCards.push(card);

                if (flippedCards.length === 2) {
                    locked = true;
                    checkForMatch();
                }
            });
        }
        memoryBoard.appendChild(card);
    });

    function checkForMatch() {
        const [c1, c2] = flippedCards;
        if (c1.dataset.icon === c2.dataset.icon) {
            c1.classList.add('matched', 'bg-emerald-600', 'border-emerald-400');
            c2.classList.add('matched', 'bg-emerald-600', 'border-emerald-400');
            matchedPairs++;
            flippedCards = [];
            locked = false;
            if (matchedPairs === 8) {
                setTimeout(() => {
                    uiLayer.classList.remove('hidden');
                    statusTitle.textContent = "COMPLETED!";
                    statusTitle.className = "text-4xl font-black text-emerald-400 mb-2";
                    statusDesc.textContent = "Memory updated.";
                    startBtn.innerHTML = "PLAY AGAIN";
                }, 500);
            }
        } else {
            setTimeout(() => {
                c1.classList.remove('flipped', 'bg-indigo-600', 'border-indigo-400');
                c1.classList.add('bg-slate-700/50', 'border-slate-600');
                c1.innerHTML = `<i class="fa-solid fa-question text-slate-500"></i>`;
                c2.classList.remove('flipped', 'bg-indigo-600', 'border-indigo-400');
                c2.classList.add('bg-slate-700/50', 'border-slate-600');
                c2.innerHTML = `<i class="fa-solid fa-question text-slate-500"></i>`;
                flippedCards = [];
                locked = false;
            }, 1000);
        }
    }
}


function initHighLow(playable) {
    let deck = [], score = 0, currentCard = null;
    const suits = ['♥', '♦', '♣', '♠'];
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; 

    function createDeck() {
        deck = [];
        for (let s of suits) {
            for (let v of values) {
                let display = v;
                if (v == 11) display = 'J'; if (v == 12) display = 'Q'; if (v == 13) display = 'K'; if (v == 14) display = 'A';
                let color = (s == '♥' || s == '♦') ? 'text-red-500' : 'text-black';
                deck.push({ val: v, display: display, suit: s, color: color });
            }
        }
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function drawCard() {
        if (deck.length === 0) createDeck();
        return deck.pop();
    }

    function updateUI() {
        const disp = document.getElementById('hl-card-display');
        disp.innerHTML = `<div class="${currentCard.color} flex flex-col items-center"><span>${currentCard.display}</span><span class="text-6xl">${currentCard.suit}</span></div>`;
        document.getElementById('hl-score').textContent = score;
    }

    function handleGuess(isHigher) {
        if (!playable) return;
        const nextCard = drawCard();
        let win = false;
        if (isHigher && nextCard.val >= currentCard.val) win = true;
        if (!isHigher && nextCard.val <= currentCard.val) win = true;

        currentCard = nextCard;
        updateUI();

        if (win) {
            score++;
            document.getElementById('hl-score').textContent = score;
        } else {
            playable = false;
            setTimeout(() => {
                uiLayer.classList.remove('hidden');
                statusTitle.textContent = "GAME OVER";
                statusTitle.className = "text-4xl font-black text-red-500 mb-2";
                statusDesc.textContent = `Streak: ${score}`;
                startBtn.innerHTML = "RETRY";
            }, 800);
        }
    }

    createDeck();
    currentCard = drawCard();
    if (playable) updateUI();
    else {
        document.getElementById('hl-card-display').innerHTML = `<div class="text-red-500 flex flex-col items-center"><span>A</span><span class="text-6xl">♥</span></div>`;
    }

    
    const btnHigh = document.getElementById('hl-higher');
    const btnLow = document.getElementById('hl-lower');
    const newHigh = btnHigh.cloneNode(true);
    const newLow = btnLow.cloneNode(true);
    btnHigh.parentNode.replaceChild(newHigh, btnHigh);
    btnLow.parentNode.replaceChild(newLow, btnLow);

    if (playable) {
        newHigh.addEventListener('click', () => handleGuess(true));
        newLow.addEventListener('click', () => handleGuess(false));
    }
}


function initSolitaire() {
    let deck = [], tableau = [[], [], [], [], [], [], []], foundations = [[], [], [], []], stock = [], talon = [];
    let selectedCard = null;

    const suits = ['♥', '♦', '♣', '♠']; 
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    function createDeck() {
        deck = [];
        for (let s of suits) {
            for (let v of values) {
                let display = v;
                if (v == 1) display = 'A'; if (v == 11) display = 'J'; if (v == 12) display = 'Q'; if (v == 13) display = 'K';
                let color = (s == '♥' || s == '♦') ? 'red' : 'black';
                deck.push({ val: v, display: display, suit: s, color: color, id: Math.random().toString(36).substr(2, 9), faceUp: false });
            }
        }
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function deal() {
        createDeck();
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                let card = deck.pop();
                if (j === i) card.faceUp = true;
                tableau[i].push(card);
            }
        }
        stock = deck;
        render();
    }

    function getCardHTML(card) {
        if (!card) return '';
        if (!card.faceUp) return `<div class="playing-card w-full h-24 bg-blue-800 border-2 border-white rounded-md flex items-center justify-center"><i class="fa-solid fa-gamepad text-blue-900 opacity-50"></i></div>`;
        const isSel = selectedCard && selectedCard.id === card.id ? 'selected' : '';
        return `<div class="playing-card ${card.color} ${isSel} w-full h-24 flex flex-col items-center justify-center text-xl font-bold cursor-pointer" onclick="solCardClick('${card.id}')">
            <span class="text-xs absolute top-1 left-1">${card.display}</span>
            <span class="text-2xl">${card.suit}</span>
        </div>`;
    }

    function render() {
        
        const talonHTML = talon.length > 0 ? getCardHTML({ ...talon[talon.length - 1], faceUp: true }) : '';
        document.getElementById('sol-talon').innerHTML = talonHTML;

        
        for (let i = 0; i < 4; i++) {
            const fd = foundations[i];
            const el = document.querySelector(`[data-type="foundation"][data-id="${i}"]`);
            if (fd.length > 0) el.innerHTML = getCardHTML(fd[fd.length - 1]);
            else el.innerHTML = `<i class="fa-solid fa-${['heart', 'diamond', 'clover', 'spa'][i]} opacity-20"></i>`;
        }

        
        const tabEl = document.getElementById('sol-tableau');
        tabEl.innerHTML = '';
        tableau.forEach((col, cIdx) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'flex-1 mx-1 flex flex-col relative min-h-[200px] cursor-pointer';
            colDiv.onclick = (e) => { if (e.target === colDiv) solColumnClick(cIdx); };

            col.forEach((card, rIdx) => {
                const cardDiv = document.createElement('div');
                cardDiv.style.position = 'absolute';
                cardDiv.style.top = (rIdx * 25) + 'px';
                cardDiv.style.width = '100%';
                cardDiv.innerHTML = getCardHTML(card);
                colDiv.appendChild(cardDiv);
            });
            tabEl.appendChild(colDiv);
        });
    }

    window.solCardClick = (id) => {
        
        let loc = findCard(id);
        if (!loc) return;

        
        if (loc.place === 'talon') {
            handleSelection(loc.card, 'talon');
            return;
        }
        
        if (loc.place === 'tableau') {
            
            if (loc.card.faceUp) handleSelection(loc.card, 'tableau', loc.colIdx);
            else if (loc.isLast) {
                
                loc.card.faceUp = true;
                render();
            }
        }
    };

    window.solColumnClick = (colIdx) => {
        if (selectedCard) {
            tryMove(selectedCard, 'tableau', colIdx);
        }
    };

    document.getElementById('sol-stock').onclick = () => {
        if (stock.length > 0) {
            let c = stock.pop();
            c.faceUp = true;
            talon.push(c);
        } else {
            stock = talon.reverse();
            talon = [];
            stock.forEach(c => c.faceUp = false);
        }
        selectedCard = null;
        render();
    };

    function findCard(id) {
        if (talon.length && talon[talon.length - 1].id === id) return { place: 'talon', card: talon[talon.length - 1] };
        for (let i = 0; i < 7; i++) {
            let col = tableau[i];
            for (let j = 0; j < col.length; j++) {
                if (col[j].id === id) return { place: 'tableau', colIdx: i, rowIdx: j, card: col[j], isLast: j === col.length - 1 };
            }
        }
        return null;
    }

    function handleSelection(card, place, colIdx) {
        
        if (selectedCard && selectedCard.id === card.id) {
            selectedCard = null;
            render();
            return;
        }

        
        if (selectedCard) {
            if (place === 'tableau') tryMove(selectedCard, 'tableau', colIdx);
            
            return;
        }

        
        
        if (tryAutoFoundation(card, place, colIdx)) return;

        
        selectedCard = card;
        render();
    }

    function tryAutoFoundation(card, place, colIdx) {
        for (let i = 0; i < 4; i++) {
            let fd = foundations[i];
            
            if (fd.length === 0) {
                if (card.val === 1) {
                    doMove(card, place, colIdx, 'foundation', i);
                    return true;
                }
            } else {
                
                let top = fd[fd.length - 1];
                if (top.suit === card.suit && card.val === top.val + 1) {
                    doMove(card, place, colIdx, 'foundation', i);
                    return true;
                }
            }
        }
        return false;
    }

    function tryMove(card, toPlace, toIdx) {
        if (toPlace === 'tableau') {
            let destCol = tableau[toIdx];
            
            if (destCol.length === 0) {
                if (card.val === 13) doMove(card, findCard(card.id).place, findCard(card.id).colIdx, 'tableau', toIdx);
            } else {
                let top = destCol[destCol.length - 1];
                
                if (top.color !== card.color && top.val === card.val + 1) {
                    doMove(card, findCard(card.id).place, findCard(card.id).colIdx, 'tableau', toIdx);
                }
            }
        }
        selectedCard = null;
        render();
    }

    function doMove(card, fromPlace, fromIdx, toPlace, toIdx) {
        
        let movingCards = [];
        if (fromPlace === 'talon') {
            movingCards.push(talon.pop());
        } else if (fromPlace === 'tableau') {
            let col = tableau[fromIdx];
            let cIdx = col.findIndex(c => c.id === card.id);
            movingCards = col.splice(cIdx);
            
            if (col.length > 0) col[col.length - 1].faceUp = true;
        }

        
        if (toPlace === 'foundation') {
            foundations[toIdx].push(movingCards[0]);
            
            if (foundations.every(f => f.length === 13)) {
                setTimeout(() => {
                    uiLayer.classList.remove('hidden');
                    statusTitle.textContent = "YOU WIN!";
                    statusTitle.className = "text-4xl font-black text-green-500 mb-2";
                    statusDesc.textContent = "All suits completed.";
                    startBtn.innerHTML = "PLAY AGAIN";
                }, 500);
            }
        } else if (toPlace === 'tableau') {
            tableau[toIdx] = tableau[toIdx].concat(movingCards);
        }
        selectedCard = null;
        render();
    }

    deal();
}