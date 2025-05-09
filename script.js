// script.js
class SnakeGame {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.gridSize = 20;
      this.tileCountX = this.canvas.width / this.gridSize;
      this.tileCountY = this.canvas.height / this.gridSize;
  
      // Récupération des variables CSS
      const style = getComputedStyle(document.documentElement);
      this.colors = {
        bgStart: style.getPropertyValue('--bg-start').trim() || '#111',
        bgEnd: style.getPropertyValue('--bg-end').trim() || '#333',
        snake: style.getPropertyValue('--snake-color').trim() || '#0f0',
        apple: style.getPropertyValue('--apple-color').trim() || '#f00',
        text: style.getPropertyValue('--text-color').trim() || '#fff',
      };
  
      this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
      this.isStarted = false;
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
      this.isStarted = false;
  
      document.getElementById('highScore').textContent = this.highScore;
      this.updateStats();
    }
  
    bindEvents() {
      document.addEventListener('keydown', e => this.handleKey(e));
      document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
  
      // Gestes tactiles sur le canvas
      this.canvas.addEventListener('touchstart', e => this.handleTouchStart(e), false);
      this.canvas.addEventListener('touchend', e => this.handleTouchEnd(e), false);
  
      // Boutons tactiles
      ['up', 'left', 'down', 'right'].forEach(dir => {
        const btn = document.getElementById(`btn-${dir}`);
        if (btn) {
          btn.addEventListener('touchstart', e => {
            e.preventDefault();
            this.handleDirection(dir);
          }, false);
        }
      });
    }
  
    handleKey(e) {
      const key = e.key.toLowerCase();
      if (key === 'p' && this.isStarted) {
        this.togglePause();
        return;
      }
      const map = {
        arrowup: 'up', z: 'up',
        arrowdown: 'down', s: 'down',
        arrowleft: 'left', q: 'left',
        arrowright: 'right', d: 'right'
      };
      if (map[key]) {
        this.handleDirection(map[key]);
      }
    }
  
    handleDirection(direction) {
      const vectors = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
      };
      const [dx, dy] = vectors[direction];
      // Empêche demi-tour
      if (this.vel.x === -dx && this.vel.y === -dy) return;
      this.vel = { x: dx, y: dy };
  
      if (!this.isStarted || this.isGameOver) {
        this.start();
      }
    }
  
    start() {
      this.reset();
      this.isStarted = true;
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
  
      // Collision murs ou soi-même
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
  
      // Manger la pomme
      if (head.x === this.apple.x && head.y === this.apple.y) {
        this.snakeLength++;
        this.score++;
        this.updateStats();
        this.placeApple();
        this.playEatSound();
      }
    }
  
    draw() {
      const { ctx, canvas, colors } = this;
      // Fond dégradé
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, colors.bgStart);
      grad.addColorStop(1, colors.bgEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Serpent
      ctx.fillStyle = colors.snake;
      this.snake.forEach(s => {
        ctx.fillRect(
          s.x * this.gridSize + 2,
          s.y * this.gridSize + 2,
          this.gridSize - 4,
          this.gridSize - 4
        );
      });
  
      // Pomme
      ctx.fillStyle = colors.apple;
      ctx.beginPath();
      ctx.arc(
        this.apple.x * this.gridSize + this.gridSize / 2,
        this.apple.y * this.gridSize + this.gridSize / 2,
        this.gridSize / 2 - 2,
        0, Math.PI * 2
      );
      ctx.fill();
  
      // Game Over
      if (this.isGameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px sans-serif';
        ctx.fillText(`Score: ${this.score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Toucher ou appuyer pour rejouer', canvas.width / 2, canvas.height / 2 + 50);
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
        this.handleDirection(dx > 0 ? 'right' : 'left');
      } else {
        this.handleDirection(dy > 0 ? 'down' : 'up');
      }
    }
  }
  
  window.addEventListener('load', () => new SnakeGame('gameCanvas'));
