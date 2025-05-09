// script.js
class SnakeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.tileCountX = this.canvas.width / this.gridSize;
    this.tileCountY = this.canvas.height / this.gridSize;
    this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    this.reset();
    this.bindEvents();
  }

  reset() {
    this.snake = [{ x: 10, y: 10 }];
    this.snakeLength = 3;
    this.vel = { x: 0, y: 0 };
    this.placeApple();
    this.score = 0;
    this.level = 1;
    this.speed = 5;
    this.isPaused = false;
    this.isGameOver = false;
    this.lastTime = null;
    document.getElementById('highScore').textContent = this.highScore;
    this.updateStats();
  }

  bindEvents() {
    document.addEventListener('keydown', e => this.handleKey(e));
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    // Touch swipe on canvas
    this.canvas.addEventListener('touchstart', e => this.handleTouchStart(e), false);
    this.canvas.addEventListener('touchend', e => this.handleTouchEnd(e), false);
    // On-screen buttons
    ['up', 'left', 'down', 'right'].forEach(dir => {
      document.getElementById(`btn-${dir}`).addEventListener('touchstart', e => {
        e.preventDefault();
        this.setDirection(dir);
      }, false);
    });
  }

  handleKey(e) {
    const key = e.key.toLowerCase();
    if (key === 'p' && this.lastTime) {
      this.togglePause();
      return;
    }
    const dirs = {
      'arrowup': ['up'], 'z': ['up'],
      'arrowdown': ['down'], 's': ['down'],
      'arrowleft': ['left'], 'q': ['left'],
      'arrowright': ['right'], 'd': ['right']
    };
    if (dirs[key]) {
      this.setDirection(dirs[key][0]);
    }
  }

  setDirection(dir) {
    const map = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    };
    const [dx, dy] = map[dir];
    if (this.vel.x === -dx && this.vel.y === -dy) return;
    this.vel = { x: dx, y: dy };
    if (!this.lastTime || this.isGameOver) {
      this.start();
    }
  }

  start() {
    this.reset();
    requestAnimationFrame(t => this.loop(t));
  }

  loop(timestamp) {
    if (this.isPaused) {
      requestAnimationFrame(t => this.loop(t));
      return;
    }
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = (timestamp - this.lastTime) / 1000;
    if (delta > 1 / this.speed) {
      this.update();
      this.draw();
      this.lastTime = timestamp;
    }
    if (!this.isGameOver) requestAnimationFrame(t => this.loop(t));
  }

  update() {
    const head = { ...this.snake[this.snake.length - 1] };
    head.x += this.vel.x;
    head.y += this.vel.y;
    if (
      head.x < 0 || head.x >= this.tileCountX ||
      head.y < 0 || head.y >= this.tileCountY ||
      this.snake.some(s => s.x === head.x && s.y === head.y)
    ) {
      this.endGame();
      return;
    }
    this.snake.push(head);
    if (this.snake.length > this.snakeLength) this.snake.shift();
    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.snakeLength++;
      this.score++;
      this.updateStats();
      this.placeApple();
      this.playEatSound();
    }
  }

  draw() {
    // Fond
    const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    grad.addColorStop(0, 'var(--bg-start)');
    grad.addColorStop(1, 'var(--bg-end)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Serpent
    this.ctx.fillStyle = 'var(--snake-color)';
    this.snake.forEach(s => {
      this.ctx.fillRect(
        s.x * this.gridSize + 2,
        s.y * this.gridSize + 2,
        this.gridSize - 4,
        this.gridSize - 4
      );
    });

    // Pomme
    this.ctx.fillStyle = 'var(--apple-color)';
    this.ctx.beginPath();
    this.ctx.arc(
      this.apple.x * this.gridSize + this.gridSize / 2,
      this.apple.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0, Math.PI * 2
    );
    this.ctx.fill();

    // Game Over
    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'var(--text-color)';
      this.ctx.font = 'bold 40px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
      this.ctx.font = '20px sans-serif';
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.fillText('Appuie pour rejouer', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
  }

  endGame() {
    this.isGameOver = true;
    this.saveHighScore();
  }

  placeApple() {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.tileCountX);
      y = Math.floor(Math.random() * this.tileCountY);
    } while (this.snake.some(s => s.x === x && s.y === y));
    this.apple = { x, y };
  }

  updateStats() {
    document.getElementById('score').textContent = this.score;
    this.level = Math.floor(this.score / 5) + 1;
    this.speed = 5 + this.level;
    document.getElementById('level').textContent = this.level;
    document.getElementById('speedDisplay').textContent = this.speed;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    document.getElementById('pauseBtn').textContent = this.isPaused ? 'Reprendre' : 'Pause';
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      localStorage.setItem('snakeHighScore', this.score);
      this.highScore = this.score;
    }
  }

  playEatSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].clientX;
    this.touchStartY = e.changedTouches[0].clientY;
  }

  handleTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.setDirection(dx > 0 ? 'right' : 'left');
    } else {
      this.setDirection(dy > 0 ? 'down' : 'up');
    }
  }
}

window.addEventListener('load', () => new SnakeGame('gameCanvas'));
