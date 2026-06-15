// ==================== GAME STATE ====================
let balance = 1000.00;
let totalWagered = 0;
let totalWon = 0;
let gamesPlayed = 0;
let winStreak = 0;
let isVIP = false;

// Blackjack state
let deck = [];
let playerHand = [];
let dealerHand = [];
let blackjackInProgress = false;

// Crash game state
let crashInProgress = false;
let crashMultiplier = 1.00;
let crashBetAmount = 0;
let crashInterval = null;

// ==================== PREDATORY MECHANICS ====================

// Fake loading screen with inflated numbers
window.addEventListener('load', () => {
    setTimeout(() => {
        const loading = document.getElementById('fake-loading');
        loading.style.opacity = '0';
        loading.style.visibility = 'hidden';
        setTimeout(() => loading.remove(), 500);
        
        // Show VIP popup after 10 seconds
        setTimeout(showVipPopup, 10000);
        
        // Start fake winner notifications
        startFakeWinners();
        
        // Update fake online count
        updateFakeOnlineCount();
    }, 2000);
});

// Fake winner notifications
function startFakeWinners() {
    setInterval(() => {
        if (Math.random() > 0.7) {
            showFakeWinner();
        }
    }, 15000);
}

function showFakeWinner() {
    const names = ['Sarah K.', 'Mike T.', 'Jennifer L.', 'David M.', 'Emma R.', 'James P.', 'Lisa W.', 'Robert H.'];
    const amounts = ['$4,283', '$12,847', '$6,392', '$23,156', '$8,729', '$15,493', '$9,821', '$31,284'];
    
    const toast = document.getElementById('fake-winner-toast');
    document.getElementById('fake-winner-name').textContent = names[Math.floor(Math.random() * names.length)];
    document.getElementById('fake-winner-amount').textContent = amounts[Math.floor(Math.random() * amounts.length)];
    
    toast.classList.remove('hidden');
    toast.querySelector('div').classList.add('toast-animate');
    
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.querySelector('div').classList.remove('toast-animate');
    }, 4000);
}

// Fake online count that fluctuates
function updateFakeOnlineCount() {
    setInterval(() => {
        const baseCount = 47382;
        const variance = Math.floor(Math.random() * 200) - 100;
        document.getElementById('fake-online').textContent = (baseCount + variance).toLocaleString();
    }, 5000);
}

// VIP Popup
function showVipPopup() {
    if (!isVIP && gamesPlayed >= 5) {
        document.getElementById('vip-popup').classList.remove('hidden');
        document.getElementById('vip-popup').classList.add('flex', 'modal-fade-in');
    }
}

function closeVipPopup() {
    isVIP = true;
    document.getElementById('vip-popup').classList.add('hidden');
    showNotification('VIP STATUS ACTIVATED! (Nothing actually changed)', 'success');
}

// Low balance modal (predatory)
function checkLowBalance() {
    if (balance < 100 && balance > 0) {
        document.getElementById('low-balance-modal').classList.remove('hidden');
        document.getElementById('low-balance-modal').classList.add('flex', 'modal-fade-in');
    }
}

function closeLowBalanceModal() {
    document.getElementById('low-balance-modal').classList.add('hidden');
}

function quickDeposit(amount) {
    balance += amount;
    updateBalance();
    closeLowBalanceModal();
    showNotification(`Deposited $${amount}! Now lose it all!`, 'success');
}

function showDepositPopup() {
    const amount = prompt('How much would you like to deposit? (This is fake money)', '100');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        balance += parseFloat(amount);
        updateBalance();
        showNotification(`Deposited $${amount}! Good luck (you'll need it)`, 'success');
    }
}

// ==================== UI UPDATES ====================

function updateBalance() {
    const balanceEl = document.getElementById('balance');
    const oldBalance = parseFloat(balanceEl.textContent.replace('$', '').replace(',', ''));
    balanceEl.textContent = `$${balance.toFixed(2)}`;
    
    // Animate balance change
    if (balance > oldBalance) {
        balanceEl.classList.add('balance-increase');
        setTimeout(() => balanceEl.classList.remove('balance-increase'), 500);
    } else if (balance < oldBalance) {
        balanceEl.classList.add('balance-decrease');
        setTimeout(() => balanceEl.classList.remove('balance-decrease'), 500);
    }
    
    // Check for low balance
    if (balance < 100 && balance > 0) {
        setTimeout(checkLowBalance, 1000);
    }
    
    // Bankruptcy check
    if (balance <= 0) {
        balance = 0;
        updateBalance();
        setTimeout(() => {
            alert('💀 BANKRUPT! 💀\n\nYou lost everything. Want to deposit more? (This is why the house always wins)');
            balance = 500; // "Generous" restart
            updateBalance();
        }, 500);
    }
}

function updateStreak() {
    const streakEl = document.getElementById('streak-display');
    streakEl.textContent = `${winStreak} 🔥`;
    if (winStreak > 0) {
        streakEl.classList.add('streak-pulse');
        setTimeout(() => streakEl.classList.remove('streak-pulse'), 500);
    }
}

function showNotification(message, type = 'info') {
    // Could implement a toast notification system here
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// ==================== SLOTS ====================

const slotSymbols = ['🍒', '🍋', '💎', '7️⃣', '🍀', '⭐', '🎰'];

function spinSlots() {
    const betInput = document.getElementById('slot-bet');
    const bet = parseFloat(betInput.value);
    const messageEl = document.getElementById('slot-message');
    const spinButton = document.getElementById('spin-button');
    
    if (isNaN(bet) || bet <= 0) {
        messageEl.textContent = 'Invalid bet amount!';
        messageEl.style.color = '#ef4444';
        return;
    }
    
    if (bet > balance) {
        messageEl.textContent = 'Insufficient balance!';
        messageEl.style.color = '#ef4444';
        return;
    }
    
    // Deduct bet
    balance -= bet;
    totalWagered += bet;
    gamesPlayed++;
    updateBalance();
    
    messageEl.textContent = 'SPINNING...';
    messageEl.style.color = '#fff';
    spinButton.disabled = true;
    
    // Spin animation
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    reels.forEach(reel => reel.classList.add('spin-reel'));
    
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        });
        spinCount++;
        
        if (spinCount > 15) {
            clearInterval(spinInterval);
            reels.forEach(reel => reel.classList.remove('spin-reel'));
            finalizeSlots(bet, reels);
            spinButton.disabled = false;
        }
    }, 100);
}

function finalizeSlots(bet, reels) {
    // "Random" results with house edge
    const houseEdge = 0.40; // 60% RTP (brutal)
    const willWin = Math.random() > houseEdge;
    
    const messageEl = document.getElementById('slot-message');
    
    if (willWin) {
        // Determine win type
        const bigWin = Math.random() > 0.8;
        
        if (bigWin) {
            // Triple match
            const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            reels.forEach(reel => {
                reel.textContent = symbol;
                reel.classList.add('card-slide-in');
            });
            
            let multiplier = 10;
            if (symbol === '💎') multiplier = 50;
            if (symbol === '7️⃣') multiplier = 25;
            
            const winAmount = bet * multiplier;
            balance += winAmount;
            totalWon += winAmount;
            winStreak++;
            
            messageEl.textContent = `🎉 JACKPOT! WON $${winAmount.toFixed(2)}! 🎉`;
            messageEl.style.color = '#fbbf24';
            messageEl.classList.add('glow-text');
            
            document.querySelector('.bg-gradient-to-br.from-purple-900').classList.add('win-flash');
            setTimeout(() => {
                document.querySelector('.bg-gradient-to-br.from-purple-900').classList.remove('win-flash');
                messageEl.classList.remove('glow-text');
            }, 1500);
            
        } else {
            // Small win (2 matching)
            const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            const positions = Math.random() > 0.5 ? [0, 1] : [1, 2];
            
            reels[positions[0]].textContent = symbol;
            reels[positions[1]].textContent = symbol;
            reels.find((r, i) => !positions.includes(i)).textContent = 
                slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            
            const winAmount = bet * 2;
            balance += winAmount;
            totalWon += winAmount;
            winStreak++;
            
            messageEl.textContent = `Small win! +$${winAmount.toFixed(2)}`;
            messageEl.style.color = '#4ade80';
        }
        
        updateBalance();
        updateStreak();
        
    } else {
        // Loss
        reels.forEach(reel => {
            reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        });
        
        // Make sure no matches
        if (reels[0].textContent === reels[1].textContent) {
            reels[1].textContent = slotSymbols[(slotSymbols.indexOf(reels[0].textContent) + 1) % slotSymbols.length];
        }
        
        messageEl.textContent = 'Better luck next time!';
        messageEl.style.color = '#ef4444';
        winStreak = 0;
        updateStreak();
        
        document.querySelector('.bg-gradient-to-br.from-purple-900').classList.add('lose-shake');
        setTimeout(() => {
            document.querySelector('.bg-gradient-to-br.from-purple-900').classList.remove('lose-shake');
        }, 500);
    }
}

// ==================== BLACKJACK ====================

function createDeck() {
    const suits = ['♥️', '♦️', '♣️', '♠️'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit, numValue: getCardValue(value) });
        }
    }
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

function getCardValue(value) {
    if (value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(value)) return 10;
    return parseInt(value);
}

function calculateHandValue(hand) {
    let value = hand.reduce((sum, card) => sum + card.numValue, 0);
    let aces = hand.filter(card => card.value === 'A').length;
    
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    
    return value;
}

function dealBlackjack() {
    const betInput = document.getElementById('blackjack-bet');
    const bet = parseFloat(betInput.value);
    
    if (isNaN(bet) || bet <= 0) {
        document.getElementById('blackjack-message').textContent = 'Invalid bet!';
        return;
    }
    
    if (bet > balance) {
        document.getElementById('blackjack-message').textContent = 'Insufficient balance!';
        return;
    }
    
    balance -= bet;
    totalWagered += bet;
    gamesPlayed++;
    updateBalance();
    
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    blackjackInProgress = true;
    
    renderBlackjackHands(true);
    
    const playerValue = calculateHandValue(playerHand);
    
    // Check for immediate blackjack
    if (playerValue === 21) {
        setTimeout(() => finishBlackjack(bet), 500);
    } else {
        document.getElementById('hit-button').disabled = false;
        document.getElementById('stand-button').disabled = false;
        document.getElementById('deal-button').disabled = true;
    }
}

function hitBlackjack() {
    if (!blackjackInProgress) return;
    
    playerHand.push(deck.pop());
    renderBlackjackHands(true);
    
    const playerValue = calculateHandValue(playerHand);
    
    if (playerValue > 21) {
        const bet = parseFloat(document.getElementById('blackjack-bet').value);
        finishBlackjack(bet);
    }
}

function standBlackjack() {
    if (!blackjackInProgress) return;
    
    const bet = parseFloat(document.getElementById('blackjack-bet').value);
    
    // Reveal dealer card
    renderBlackjackHands(false);
    
    // Dealer draws
    let dealerValue = calculateHandValue(dealerHand);
    
    const dealerDrawInterval = setInterval(() => {
        if (dealerValue < 17) {
            dealerHand.push(deck.pop());
            dealerValue = calculateHandValue(dealerHand);
            renderBlackjackHands(false);
        } else {
            clearInterval(dealerDrawInterval);
            setTimeout(() => finishBlackjack(bet), 500);
        }
    }, 600);
}

function finishBlackjack(bet) {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    renderBlackjackHands(false);
    
    const messageEl = document.getElementById('blackjack-message');
    
    let result = '';
    
    if (playerValue > 21) {
        result = 'BUST! You lose.';
        messageEl.style.color = '#ef4444';
        winStreak = 0;
    } else if (dealerValue > 21) {
        result = `Dealer busts! You win $${(bet * 2).toFixed(2)}!`;
        messageEl.style.color = '#4ade80';
        balance += bet * 2;
        totalWon += bet * 2;
        winStreak++;
    } else if (playerValue > dealerValue) {
        result = `You win $${(bet * 2).toFixed(2)}!`;
        messageEl.style.color = '#4ade80';
        balance += bet * 2;
        totalWon += bet * 2;
        winStreak++;
    } else if (playerValue < dealerValue) {
        result = 'Dealer wins. You lose.';
        messageEl.style.color = '#ef4444';
        winStreak = 0;
    } else {
        result = `Push! Bet returned: $${bet.toFixed(2)}`;
        messageEl.style.color = '#fbbf24';
        balance += bet;
    }
    
    messageEl.textContent = result;
    updateBalance();
    updateStreak();
    
    blackjackInProgress = false;
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    document.getElementById('deal-button').disabled = false;
}

function renderBlackjackHands(hideDealer) {
    const playerCardsEl = document.getElementById('player-cards');
    const dealerCardsEl = document.getElementById('dealer-cards');
    
    // Render player cards
    playerCardsEl.innerHTML = '';
    playerHand.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'w-16 h-24 bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-center text-2xl card-flip';
        cardEl.innerHTML = `
            <div class="${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'}">${card.value}</div>
            <div class="${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'} text-sm">${card.suit}</div>
        `;
        playerCardsEl.appendChild(cardEl);
    });
    
    // Render dealer cards
    dealerCardsEl.innerHTML = '';
    dealerHand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        
        if (hideDealer && index === 1) {
            cardEl.className = 'w-16 h-24 bg-blue-600 rounded border-2 border-blue-800 flex items-center justify-center text-3xl';
            cardEl.textContent = '🂠';
        } else {
            cardEl.className = 'w-16 h-24 bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-center text-2xl card-flip';
            cardEl.innerHTML = `
                <div class="${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'}">${card.value}</div>
                <div class="${card.suit === '♥️' || card.suit === '♦️' ? 'text-red-500' : 'text-black'} text-sm">${card.suit}</div>
            `;
        }
        
        dealerCardsEl.appendChild(cardEl);
    });
    
    // Update totals
    const playerValue = calculateHandValue(playerHand);
    document.getElementById('player-total').textContent = playerValue;
    
    if (hideDealer) {
        document.getElementById('dealer-total').textContent = '?';
    } else {
        const dealerValue = calculateHandValue(dealerHand);
        document.getElementById('dealer-total').textContent = dealerValue;
    }
}

// ==================== COINFLIP ====================

function flipCoin() {
    if (balance <= 0) {
        alert('You need money to gamble!');
        return;
    }
    
    const button = document.getElementById('coinflip-button');
    const coinEl = document.getElementById('coin-display');
    const messageEl = document.getElementById('coinflip-message');
    
    button.disabled = true;
    
    const betAmount = balance;
    totalWagered += betAmount;
    gamesPlayed++;
    
    messageEl.textContent = 'Flipping...';
    coinEl.classList.add('flip-animation');
    
    // Rigged coinflip - house edge
    const willWin = Math.random() > 0.52; // 48% win rate
    
    setTimeout(() => {
        coinEl.classList.remove('flip-animation');
        
        if (willWin) {
            coinEl.textContent = '🟡';
            balance = balance * 2;
            totalWon += betAmount * 2;
            winStreak++;
            messageEl.textContent = `🎉 YOU WON! Doubled to $${balance.toFixed(2)}!`;
            messageEl.style.color = '#4ade80';
        } else {
            coinEl.textContent = '⚫';
            balance = Math.floor(balance / 2);
            winStreak = 0;
            messageEl.textContent = `💀 YOU LOST! Down to $${balance.toFixed(2)}`;
            messageEl.style.color = '#ef4444';
        }
        
        updateBalance();
        updateStreak();
        
        setTimeout(() => {
            coinEl.textContent = '🪙';
            messageEl.textContent = '';
            button.disabled = false;
        }, 2000);
    }, 2000);
}

// ==================== CRASH GAME ====================

function startCrash() {
    const betInput = document.getElementById('crash-bet');
    const bet = parseFloat(betInput.value);
    
    if (isNaN(bet) || bet <= 0) {
        document.getElementById('crash-message').textContent = 'Invalid bet!';
        return;
    }
    
    if (bet > balance) {
        document.getElementById('crash-message').textContent = 'Insufficient balance!';
        return;
    }
    
    if (crashInProgress) return;
    
    balance -= bet;
    crashBetAmount = bet;
    totalWagered += bet;
    gamesPlayed++;
    updateBalance();
    
    crashInProgress = true;
    crashMultiplier = 1.00;
    
    document.getElementById('crash-start').disabled = true;
    document.getElementById('crash-cashout').disabled = false;
    document.getElementById('crash-message').textContent = '';
    
    // Determine crash point (rigged)
    const crashPoint = 1.00 + Math.random() * 4; // Crashes between 1.00x and 5.00x
    
    crashInterval = setInterval(() => {
        crashMultiplier += 0.01 + Math.random() * 0.05;
        
        document.getElementById('crash-multiplier').textContent = crashMultiplier.toFixed(2) + 'x';
        const progress = Math.min((crashMultiplier / 10) * 100, 100);
        document.getElementById('crash-progress').style.width = progress + '%';
        
        if (crashMultiplier >= crashPoint) {
            crashGame();
        }
    }, 100);
}

function cashoutCrash() {
    if (!crashInProgress) return;
    
    clearInterval(crashInterval);
    
    const winAmount = crashBetAmount * crashMultiplier;
    balance += winAmount;
    totalWon += winAmount;
    winStreak++;
    
    document.getElementById('crash-message').textContent = `Cashed out at ${crashMultiplier.toFixed(2)}x! Won $${winAmount.toFixed(2)}!`;
    document.getElementById('crash-message').style.color = '#4ade80';
    
    updateBalance();
    updateStreak();
    resetCrash();
}

function crashGame() {
    clearInterval(crashInterval);
    
    document.getElementById('crash-message').textContent = `💥 CRASHED at ${crashMultiplier.toFixed(2)}x! You lost!`;
    document.getElementById('crash-message').style.color = '#ef4444';
    
    winStreak = 0;
    updateStreak();
    resetCrash();
}

function resetCrash() {
    crashInProgress = false;
    crashBetAmount = 0;
    
    setTimeout(() => {
        crashMultiplier = 1.00;
        document.getElementById('crash-multiplier').textContent = '1.00x';
        document.getElementById('crash-progress').style.width = '0%';
        document.getElementById('crash-start').disabled = false;
        document.getElementById('crash-cashout').disabled = true;
    }, 2000);
}

// ==================== INITIALIZATION ====================

updateBalance();
updateStreak();