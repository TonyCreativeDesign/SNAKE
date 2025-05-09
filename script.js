// script.js
class SnakeGame {
    constructor(canvasId) {
      this.canvas=document.getElementById(canvasId);
      this.ctx=this.canvas.getContext('2d');
      this.gridSize=20;
      this.tileCountX=this.canvas.width/this.gridSize;
      this.tileCountY=this.canvas.height/this.gridSize;
      this.highScore=parseInt(localStorage.getItem('snakeHighScore'))||0;
      this.reset();
      this.bindEvents();
    }
  
    reset() {
      this.snake=[{x:10,y:10}];
      this.snakeLength=3;
      this.vel={x:0,y:0};
      this.placeApple();
      this.score=0;
      this.level=1;
      this.speed=5;
      this.isPaused=false;
      this.isGameOver=false;
      this.lastTime=null;
      this.updateInfo();
    }
  
    bindEvents() {
      document.addEventListener('keydown',(e)=>this.handleKey(e));
      document.getElementById('pauseBtn').addEventListener('click',()=>this.togglePause());
      this.canvas.addEventListener('touchstart',(e)=>this.handleTouchStart(e),false);
      this.canvas.addEventListener('touchend',(e)=>this.handleTouchEnd(e),false);
    }
  
    handleKey(e) {
      const key=e.key.toLowerCase();
      const dirs={
        arrowup:[0,-1], z:[0,-1],
        arrowdown:[0,1], s:[0,1],
        arrowleft:[-1,0], q:[-1,0],
        arrowright:[1,0], d:[1,0]
      };
  
      if (key==='p' && this.lastTime) {
        this.togglePause();
        return;
      }
  
      // direction keys
      if (dirs[key]) {
        const [dx,dy]=dirs[key];
        // prevent reverse
        if (this.vel.x===-dx && this.vel.y===-dy) return;
        this.vel={x:dx,y:dy};
        // start on first move or restart when game over
        if (!this.lastTime || this.isGameOver) {
          this.start();
        }
      }
    }
  
    start() {
      this.reset();
      requestAnimationFrame((t)=>this.loop(t));
    }
  
    loop(timestamp) {
      if (this.isPaused) {
        requestAnimationFrame((t)=>this.loop(t));
        return;
      }
      if (!this.lastTime) this.lastTime=timestamp;
      const delta=(timestamp-this.lastTime)/1000;
      if (delta>1/this.speed) {
        this.update();
        this.draw();
        this.lastTime=timestamp;
      }
      if (!this.isGameOver) {
        requestAnimationFrame((t)=>this.loop(t));
      }
    }
  
    update() {
      const head={...this.snake[this.snake.length-1]};
      head.x+=this.vel.x;
      head.y+=this.vel.y;
      // wall or self collision
      if (head.x<0||head.x>=this.tileCountX||head.y<0||head.y>=this.tileCountY||
          this.snake.some(s=>s.x===head.x&&s.y===head.y)) {
        this.endGame();
        return;
      }
      this.snake.push(head);
      if (this.snake.length>this.snakeLength) this.snake.shift();
  
      if (head.x===this.apple.x&&head.y===this.apple.y) {
        this.snakeLength++;
        this.score++;
        this.updateStats();
        this.placeApple();
        this.playEatSound();
      }
    }
  
    draw() {
      // clear canvas
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      // draw snake
      this.ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--snake-color');
      this.snake.forEach(s=>{
        this.ctx.fillRect(
          s.x*this.gridSize+2,
          s.y*this.gridSize+2,
          this.gridSize-4,
          this.gridSize-4
        );
      });
      // draw apple
      this.ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--apple-color');
      this.ctx.beginPath();
      this.ctx.arc(
        this.apple.x*this.gridSize+this.gridSize/2,
        this.apple.y*this.gridSize+this.gridSize/2,
        this.gridSize/2-2,
        0,Math.PI*2
      );
      this.ctx.fill();
      // game over overlay
      if (this.isGameOver) {
        this.ctx.fillStyle='rgba(0,0,0,0.6)';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        this.ctx.font='bold 40px sans-serif';
        this.ctx.textAlign='center';
        this.ctx.fillText('GAME OVER',this.canvas.width/2,this.canvas.height/2-20);
        this.ctx.font='20px sans-serif';
        this.ctx.fillText(`Score: ${this.score}`,this.canvas.width/2,this.canvas.height/2+20);
        this.ctx.fillText('Appuie sur une touche pour rejouer',this.canvas.width/2,this.canvas.height/2+50);
      }
    }
  
    endGame() {
      this.isGameOver=true;
      this.saveHighScore();
    }
  
    placeApple() {
      let x,y;
      do {
        x=Math.floor(Math.random()*this.tileCountX);
        y=Math.floor(Math.random()*this.tileCountY);
      } while (this.snake.some(s=>s.x===x&&s.y===y));
      this.apple={x,y};
    }
  
    updateStats() {
      document.getElementById('score').textContent=this.score;
      this.level=Math.floor(this.score/5)+1;
      this.speed=5+this.level;
      document.getElementById('level').textContent=this.level;
      document.getElementById('speedDisplay').textContent=this.speed;
    }
  
    updateInfo() {
      document.getElementById('highScore').textContent=this.highScore;
      this.updateStats();
    }
  
    togglePause() {
      this.isPaused=!this.isPaused;
      document.getElementById('pauseBtn').textContent=this.isPaused?'Reprendre':'Pause';
    }
  
    saveHighScore() {
      if (this.score>this.highScore) {
        localStorage.setItem('snakeHighScore',this.score);
        this.highScore=this.score;
      }
    }
  
    playEatSound() {
      const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      const osc=audioCtx.createOscillator();
      const gain=audioCtx.createGain();
      osc.type='square';
      osc.frequency.setValueAtTime(440,audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1,audioCtx.currentTime);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime+0.1);
    }
  
    handleTouchStart(e) {
      this.touchStartX=e.changedTouches[0].clientX;
      this.touchStartY=e.changedTouches[0].clientY;
    }
    handleTouchEnd(e) {
      const dx=e.changedTouches[0].clientX-this.touchStartX;
      const dy=e.changedTouches[0].clientY-this.touchStartY;
      if(Math.abs(dx)>Math.abs(dy)) {
        this.vel={x:dx>0?1:-1,y:0};
      } else {
        this.vel={x:0,y:dy>0?1:-1};
      }
      if (!this.lastTime || this.isGameOver) {
        this.start();
      }
    }
  }
  
  window.addEventListener('load',()=>new SnakeGame('gameCanvas'));
