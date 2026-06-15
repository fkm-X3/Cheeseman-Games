const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const ui = document.getElementById('ui');
        const startBtn = document.getElementById('startBtn');
        const overlay = document.getElementById('overlay');
        const playerHealthBar = document.getElementById('playerHealth');
        const scoreDisplay = document.getElementById('score');
        const waveDisplay = document.getElementById('wave');

        // Game State
        let gameRunning = false;
        let score = 0;
        let wave = 1;
        let mouse = { x: 0, y: 0 };
        let camera = { x: 0, y: 0, shake: 0 };

        // Constants
        const FRICTION = 0.92; // Slippery physics
        const PLAYER_SPEED = 1.5; // Slow acceleration

        class Entity {
            constructor(x, y, radius, color) {
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.color = color;
                this.vx = 0;
                this.vy = 0;
                this.health = 100;
                this.maxHealth = 100;
                this.dead = false;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Wall/Boundary handling (bouncy)
                if (this.x < 0) { this.x = 0; this.vx *= -0.8; }
                if (this.x > canvas.width) { this.x = canvas.width; this.vx *= -0.8; }
                if (this.y < 0) { this.y = 0; this.vy *= -0.8; }
                if (this.y > canvas.height) { this.y = canvas.height; this.vy *= -0.8; }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x + camera.x, this.y + camera.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        }

        class Player extends Entity {
            constructor() {
                super(canvas.width / 2, canvas.height / 2, 20, '#00ffff');
                this.speed = PLAYER_SPEED;
                this.attackCooldown = 0;
                this.angle = 0;
            }

            update(input) {
                // Apply "Baked" Physics (Floaty)
                if (input.w) this.vy -= this.speed;
                if (input.s) this.vy += this.speed;
                if (input.a) this.vx -= this.speed;
                if (input.d) this.vx += this.speed;

                this.vx *= FRICTION;
                this.vy *= FRICTION;

                // Rotate randomly slightly to simulate dizziness
                this.angle += (Math.random() - 0.5) * 0.1;

                this.attackCooldown--;

                super.update();
            }

            draw() {
                // Draw Body
                ctx.save();
                ctx.translate(this.x + camera.x, this.y + camera.y);
                ctx.rotate(this.angle); // Dizzy rotation

                // Glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color;

                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();

                // Eyes (Droopy)
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(-7, -5, 3, 5, Math.PI / 4, 0, Math.PI * 2);
                ctx.ellipse(7, -5, 3, 5, -Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();

                // Mouth (Wobbly)
                ctx.beginPath();
                ctx.moveTo(-10, 10);
                ctx.quadraticCurveTo(0, 5 + Math.sin(Date.now() / 200) * 5, 10, 10);
                ctx.stroke();

                ctx.restore();
            }

            attack(enemies) {
                if (this.attackCooldown > 0) return;
                this.attackCooldown = 20;

                // Visual punch/shockwave
                ctx.save();
                ctx.translate(this.x + camera.x, this.y + camera.y);
                const angleToMouse = Math.atan2(mouse.y - (this.y + camera.y), mouse.x - (this.x + camera.x));

                ctx.beginPath();
                ctx.arc(Math.cos(angleToMouse) * 40, Math.sin(angleToMouse) * 40, 15, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.restore();

                // Hit detection
                const punchDist = 40;
                const punchX = this.x + Math.cos(angleToMouse) * punchDist;
                const punchY = this.y + Math.sin(angleToMouse) * punchDist;

                enemies.forEach(e => {
                    const dx = e.x - punchX;
                    const dy = e.y - punchY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Hitbox radius: Enemy Radius (15) + Punch Radius (15) + Leniency (20)
                    if (dist < 50) {
                        e.vx += Math.cos(angleToMouse) * 20;
                        e.vy += Math.sin(angleToMouse) * 20;
                        e.health -= 100; // Insta-kill
                        camera.shake = 15;
                    }
                });
            }
        }

        class Enemy extends Entity {
            constructor() {
                // Spawn randomly at edges
                const side = Math.floor(Math.random() * 4);
                let x, y;
                if (side === 0) { x = Math.random() * canvas.width; y = -50; }
                else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
                else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
                else { x = -50; y = Math.random() * canvas.height; }

                super(x, y, 15, '#ff0055');
                this.speed = 0.5 + Math.random() * 0.5;
            }

            update(player) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0) {
                    this.vx += (dx / dist) * 0.2;
                    this.vy += (dy / dist) * 0.2;
                }

                // Drag
                this.vx *= 0.95;
                this.vy *= 0.95;

                super.update();

                // Attack player
                if (dist < this.radius + player.radius) {
                    player.health -= 0.5;
                    // Push player a bit
                    player.vx += this.vx * 0.5;
                    player.vy += this.vy * 0.5;
                    // Bounce back
                    this.vx *= -1;
                    this.vy *= -1;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x + camera.x, this.y + camera.y);

                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;

                ctx.beginPath();
                ctx.moveTo(0, -this.radius);
                ctx.lineTo(this.radius, this.radius);
                ctx.lineTo(-this.radius, this.radius);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();

                ctx.restore();
            }
        }

        // --- Main Game Logic ---

        const player = new Player();
        const enemies = [];
        const input = { w: false, a: false, s: false, d: false };

        window.addEventListener('keydown', e => {
            if (e.key === 'w' || e.key === 'W') input.w = true;
            if (e.key === 'a' || e.key === 'A') input.a = true;
            if (e.key === 's' || e.key === 'S') input.s = true;
            if (e.key === 'd' || e.key === 'D') input.d = true;
        });

        window.addEventListener('keyup', e => {
            if (e.key === 'w' || e.key === 'W') input.w = false;
            if (e.key === 'a' || e.key === 'A') input.a = false;
            if (e.key === 's' || e.key === 'S') input.s = false;
            if (e.key === 'd' || e.key === 'D') input.d = false;
        });

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mousedown', () => {
            if (gameRunning) player.attack(enemies);
        });

        function spawnEnemy() {
            if (!gameRunning) return;
            enemies.push(new Enemy());
            // Difficult ramp
            let nextSpawn = 2000 - (wave * 100);
            if (nextSpawn < 500) nextSpawn = 500;

            setTimeout(spawnEnemy, nextSpawn);
        }

        function gameLoop() {
            if (!gameRunning) return;
            requestAnimationFrame(gameLoop);

            // 1. Visual "Trails" Effect
            // Instead of clearing rect, we draw a semi-transparent black rect
            // This leaves trails of moving objects
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Camera Shake logic
            if (camera.shake > 0) {
                camera.x = (Math.random() - 0.5) * camera.shake;
                camera.y = (Math.random() - 0.5) * camera.shake;
                camera.shake *= 0.9;
                if (camera.shake < 0.5) camera.shake = 0;
            } else {
                camera.x = 0;
                camera.y = 0;
            }

            // 3. Update & Draw Player
            player.update(input);
            player.draw();

            // 4. Update & Draw Enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                enemies[i].update(player);
                enemies[i].draw();

                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1);
                    score += 10;
                    scoreDisplay.innerText = "SCORE: " + score;
                    if (score % 100 === 0) {
                        wave++;
                        waveDisplay.innerText = "WAVE: " + wave;
                    }
                }
            }

            // 5. Update UI
            playerHealthBar.style.width = player.health + "%";
            if (player.health <= 0) {
                gameOver();
            }
        }

        function startGame() {
            player.x = canvas.width / 2;
            player.y = canvas.height / 2;
            player.health = 100;
            player.vx = 0;
            player.vy = 0;
            enemies.length = 0;
            score = 0;
            wave = 1;

            playerHealthBar.style.width = "100%";
            scoreDisplay.innerText = "SCORE: 0";
            waveDisplay.innerText = "WAVE: 1";

            gameRunning = true;
            overlay.style.display = 'none';

            spawnEnemy();
            gameLoop();
        }

        function gameOver() {
            gameRunning = false;
            overlay.style.display = 'flex';
            document.querySelector('#overlay h1').innerText = "TRIP ENDED";
            startBtn.innerText = "TRY AGAIN";
        }

        startBtn.addEventListener('click', startGame);