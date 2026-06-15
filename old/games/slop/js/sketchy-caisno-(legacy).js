// State
        let balance = 1000;
        let debt = 0;
        let stocks = 0;
        let stockPrice = 50;
        let selectedSnail = null;
        let isRacing = false;

        // --- PREDATORY DEBT ENGINE ---
        // Debt increases by 5% every 5 seconds if you have any debt
        setInterval(() => {
            if (debt > 0) {
                // Minimum 10 dabloon increase or 5%
                const increase = Math.max(10, Math.floor(debt * 0.05));
                debt += increase;
                
                // Visual Indicator
                const display = document.getElementById('debt-display');
                display.style.fontSize = '2.5rem';
                display.style.color = 'red';
                setTimeout(() => {
                    display.style.fontSize = ''; 
                    display.style.color = '';
                }, 200);
                
                updateUI();
            }
        }, 5000);

        // --- CHAOS ROULETTE ---
        function checkChaos() {
            // 40% chance of random event on win
            if (Math.random() < 0.4) {
                triggerRandomChaos();
            }
        }

        function triggerRandomChaos() {
            const body = document.getElementById('main-body');
            const events = [
                'gravity-failure', 
                'deep-fried', 
                'classic-spin',
                'irs-raid',
                'flashbang'
            ];
            
            const event = events[Math.floor(Math.random() * events.length)];
            
            console.log("TRIGGERING EVENT: " + event); // For debug

            switch(event) {
                case 'gravity-failure':
                    alert("⚠️ ALERT: GRAVITY IS OUT OF SERVICE ⚠️");
                    const buttons = document.querySelectorAll('button');
                    buttons.forEach(btn => {
                        btn.classList.add('unanchored');
                        // Random direction
                        const x = (Math.random() - 0.5) * window.innerWidth;
                        const y = window.innerHeight + 100; // Fall down
                        const rot = (Math.random() - 0.5) * 720;
                        btn.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
                    });
                    
                    // Restore after 4 seconds
                    setTimeout(() => {
                        buttons.forEach(btn => {
                            btn.style.transform = '';
                            setTimeout(() => btn.classList.remove('unanchored'), 1000);
                        });
                    }, 4000);
                    break;

                case 'deep-fried':
                    body.classList.add('deep-fried');
                    playSound('lose'); // Distorted feeling
                    setTimeout(() => body.classList.remove('deep-fried'), 4000);
                    break;

                case 'classic-spin':
                    body.classList.add('chaos-spin-active');
                    spawnConfetti();
                    setTimeout(() => body.classList.remove('chaos-spin-active'), 3000);
                    break;
                
                case 'flashbang':
                    let flashCount = 0;
                    const flashInterval = setInterval(() => {
                        body.classList.toggle('inverted');
                        flashCount++;
                        if(flashCount > 10) {
                            clearInterval(flashInterval);
                            body.classList.remove('inverted');
                        }
                    }, 100);
                    break;

                case 'irs-raid':
                    document.getElementById('siren-overlay').style.display = 'block';
                    const tax = Math.floor(balance * 0.1);
                    balance -= tax;
                    alert(`🚨 THE IRS IS HERE! THEY TOOK ${tax} DABLOONS AS TAX! 🚨`);
                    updateUI();
                    setTimeout(() => {
                        document.getElementById('siren-overlay').style.display = 'none';
                    }, 3000);
                    break;
            }
        }

        function spawnConfetti() {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            for (let i = 0; i < 200; i++) {
                const conf = document.createElement('div');
                conf.classList.add('confetti');
                conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                conf.style.left = '50vw';
                conf.style.top = '50vh';
                
                const angle = Math.random() * Math.PI * 2;
                const velocity = 10 + Math.random() * 40;
                const tx = Math.cos(angle) * velocity * 20;
                const ty = Math.sin(angle) * velocity * 20;
                const rot = Math.random() * 720;
                
                conf.style.transition = `all ${1 + Math.random()}s cubic-bezier(0.25, 1, 0.5, 1)`;
                document.body.appendChild(conf);

                // Force reflow
                conf.getBoundingClientRect();

                setTimeout(() => {
                    conf.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
                    conf.style.opacity = '0';
                }, 10);

                setTimeout(() => conf.remove(), 2000);
            }
        }

        // SKELETON RUNNER LOGIC
        setInterval(() => {
            if (Math.random() < 0.1) {
                spawnSkeleton();
            }
        }, 1000);

        function spawnSkeleton() {
            const skel = document.createElement('img');
            skel.src = "https://media1.tenor.com/m/22OALqw6nVIAAAAd/noticing-one-point-three-seconds.gif";
            skel.onerror = function() { this.src = "https://api.iconify.design/noto:skull.svg"; this.style.width="100px"; };
            
            skel.classList.add('skeleton-runner');
            
            const size = 50 + Math.random() * 400; 
            const top = Math.random() * 80; 
            const speed = 1 + Math.random() * 4; 
            const direction = Math.random() > 0.5 ? 1 : -1; 

            skel.style.width = `${size}px`;
            skel.style.top = `${top}vh`;
            
            if (direction === 1) {
                skel.style.left = `-${size}px`;
                skel.style.transform = "scaleX(1)"; 
            } else {
                skel.style.left = "100vw";
                skel.style.transform = "scaleX(-1)"; 
            }

            document.getElementById('skeleton-layer').appendChild(skel);

            requestAnimationFrame(() => {
                skel.style.transition = `left ${speed}s linear`;
                requestAnimationFrame(() => {
                    if (direction === 1) {
                        skel.style.left = "100vw";
                    } else {
                        skel.style.left = `-${size}px`;
                    }
                });
            });

            setTimeout(() => {
                skel.remove();
            }, speed * 1000 + 100);
        }

        // Sounds (simulated)
        function playSound(type) {
            const sounds = {
                win: ["KA-CHING!", "WOWZA!", "MONEY NOISES!"],
                lose: ["WOMP WOMP", "OOF", "RIP BOZO"],
                spin: ["BRRRRR...", "CLACK CLACK", "SPIN NOISES"]
            };
            const text = document.createElement('div');
            text.innerText = type === 'win' ? sounds.win[Math.floor(Math.random()*3)] : 
                             type === 'lose' ? sounds.lose[Math.floor(Math.random()*3)] : 
                             sounds.spin[Math.floor(Math.random()*3)];
            text.style.position = 'fixed';
            text.style.left = Math.random() * 80 + 10 + 'vw';
            text.style.top = Math.random() * 80 + 10 + 'vh';
            text.style.fontSize = '2rem';
            text.style.fontWeight = 'bold';
            text.style.color = type === 'win' ? 'gold' : type === 'lose' ? 'red' : 'white';
            text.style.textShadow = '2px 2px 0 #000';
            text.style.pointerEvents = 'none';
            text.style.zIndex = 100;
            text.style.transition = 'all 1s';
            document.body.appendChild(text);

            setTimeout(() => {
                text.style.transform = 'translateY(-100px) scale(1.5)';
                text.style.opacity = '0';
            }, 50);
            setTimeout(() => text.remove(), 1000);
        }

        function updateUI() {
            document.getElementById('balance-display').innerText = Math.floor(balance);
            document.getElementById('debt-display').innerText = Math.floor(debt);
            document.getElementById('stocks-owned').innerText = stocks;
            document.getElementById('stocks-value').innerText = Math.floor(stocks * stockPrice);

            if (balance <= 0 && stocks === 0) {
                setTimeout(() => {
                    if(balance <= 0 && stocks === 0) document.getElementById('bankruptcy-modal').style.display = 'flex';
                }, 1000);
            }
        }

        // --- LOAN SHARK ---
        function takeLoan() {
            if (debt > 50000) {
                alert("GRANDMA SAYS NO MORE! SHE IS CALLING THE COPS!");
                return;
            }
            const amount = 500;
            balance += amount;
            debt += amount * 1.5; 
            playSound('win');
            updateUI();
        }

        function resetGame() {
            balance = 1000;
            debt = 0;
            stocks = 0;
            document.getElementById('bankruptcy-modal').style.display = 'none';
            updateUI();
        }

        // --- SLOTS ---
        const symbols = ["🍒", "🍋", "🍆", "💎", "💩", "🤡", "🗿"];
        
        function spinSlots() {
            const betInput = document.getElementById('slot-bet');
            const bet = parseInt(betInput.value);
            const msg = document.getElementById('slot-msg');
            const btn = document.getElementById('spin-btn');

            if (bet > balance) {
                msg.innerText = "YOU ARE TOO POOR!";
                msg.style.color = "red";
                return;
            }
            if (bet <= 0) {
                 msg.innerText = "NICE TRY!";
                 return;
            }

            balance -= bet;
            updateUI();
            msg.innerText = "SPINNING...";
            playSound('spin');
            
            btn.disabled = true;
            
            let spins = 0;
            const interval = setInterval(() => {
                document.getElementById('reel1').innerText = symbols[Math.floor(Math.random() * symbols.length)];
                document.getElementById('reel2').innerText = symbols[Math.floor(Math.random() * symbols.length)];
                document.getElementById('reel3').innerText = symbols[Math.floor(Math.random() * symbols.length)];
                spins++;
                if(spins > 10) {
                    clearInterval(interval);
                    finalizeSlots(bet);
                    btn.disabled = false;
                }
            }, 100);
        }

        function finalizeSlots(bet) {
            const r1 = symbols[Math.floor(Math.random() * symbols.length)];
            const r2 = symbols[Math.floor(Math.random() * symbols.length)];
            const r3 = symbols[Math.floor(Math.random() * symbols.length)];

            document.getElementById('reel1').innerText = r1;
            document.getElementById('reel2').innerText = r2;
            document.getElementById('reel3').innerText = r3;

            const msg = document.getElementById('slot-msg');

            // Logic
            if (r1 === r2 && r2 === r3) {
                // Jackpot
                let mult = 10;
                if (r1 === "🗿") mult = 50; 
                if (r1 === "💩") mult = 1; 
                
                const win = bet * mult;
                balance += win;
                msg.innerText = `JACKPOT! YOU WON ${win}!`;
                msg.classList.add('win-anim');
                playSound('win');
                checkChaos(); // CHECK CHAOS
            } else if (r1 === r2 || r2 === r3 || r1 === r3) {
                // Small win
                const win = Math.floor(bet * 1.5);
                balance += win;
                msg.innerText = `Small win! ${win} Dabloons.`;
                msg.classList.remove('win-anim');
                playSound('win');
                checkChaos(); // CHECK CHAOS
            } else {
                msg.innerText = "L + RATIO + YOU LOST";
                msg.classList.remove('win-anim');
                playSound('lose');
            }
            updateUI();
        }

        // --- STONKS ---
        setInterval(() => {
            const move = (Math.random() - 0.5) * 5; 
            stockPrice += move;
            if (stockPrice < 1) stockPrice = 1; 
            if (stockPrice > 200) stockPrice = 100; 

            const line = document.getElementById('stock-line');
            const display = document.getElementById('stock-price');
            
            const height = Math.min(Math.max(stockPrice, 0), 100);
            line.style.height = height + "%";
            display.innerText = stockPrice.toFixed(2);
            
            if (move > 0) {
                line.className = "absolute bottom-0 left-0 transition-all duration-300 w-full bg-green-500";
                display.className = "absolute bottom-2 right-2 font-mono text-xl text-green-500";
            } else {
                line.className = "absolute bottom-0 left-0 transition-all duration-300 w-full bg-red-600";
                display.className = "absolute bottom-2 right-2 font-mono text-xl text-red-600";
            }

            document.getElementById('stocks-value').innerText = Math.floor(stocks * stockPrice);
        }, 1000);

        function buyStock() {
            if (balance >= stockPrice) {
                balance -= stockPrice;
                stocks++;
                updateUI();
            }
        }

        function sellStock() {
            if (stocks > 0) {
                balance += stockPrice;
                stocks--;
                updateUI();
                checkChaos(); // Selling is winning technically
            }
        }

        // --- SNAIL RACE ---
        function selectSnail(id) {
            if(isRacing) return;
            selectedSnail = id;
            document.querySelectorAll('.snail-btn').forEach(btn => btn.classList.remove('bg-yellow-400', 'border-4', 'border-red-500'));
            document.getElementById(`btn-snail-${id}`).classList.add('bg-yellow-400', 'border-4', 'border-red-500');
        }

        function startRace() {
            if (isRacing) return;
            if (!selectedSnail) { alert("PICK A SNAIL, COWARD!"); return; }
            
            const betInput = document.getElementById('race-bet');
            const bet = parseInt(betInput.value);
            
            if (bet > balance || bet <= 0) return;

            balance -= bet;
            updateUI();
            isRacing = true;

            const snails = [
                { id: 1, pos: 0, el: document.getElementById('snail1') },
                { id: 2, pos: 0, el: document.getElementById('snail2') },
                { id: 3, pos: 0, el: document.getElementById('snail3') }
            ];

            const raceInterval = setInterval(() => {
                let winner = null;

                snails.forEach(snail => {
                    if (Math.random() > 0.2) {
                        snail.pos += Math.random() * 5;
                    }
                    if (Math.random() > 0.95) {
                        snail.pos -= 2;
                    }
                    snail.el.style.left = snail.pos + "%";

                    if (snail.pos >= 90 && !winner) {
                        winner = snail.id;
                    }
                });

                if (winner) {
                    clearInterval(raceInterval);
                    isRacing = false;
                    if (winner === selectedSnail) {
                        const win = bet * 3;
                        balance += win;
                        playSound('win');
                        alert(`SNAIL ${winner} WON! YOU ARE RICH!`);
                        checkChaos(); // CHECK CHAOS
                    } else {
                        playSound('lose');
                        alert(`SNAIL ${winner} WON! YOU LOST!`);
                    }
                    updateUI();
                    setTimeout(() => {
                        snails.forEach(s => { s.el.style.left = "0%"; });
                    }, 1000);
                }
            }, 100);
        }

        // --- 50/50 ---
        function playFiftyFifty() {
            if (balance === 0) return;
            
            document.body.style.backgroundColor = "black";
            setTimeout(() => { document.body.style.backgroundColor = ""; }, 100);

            if (Math.random() > 0.5) {
                balance *= 2;
                playSound('win');
                checkChaos(); // CHECK CHAOS
            } else {
                balance = Math.floor(balance / 2);
                playSound('lose');
            }
            updateUI();
        }

        updateUI();