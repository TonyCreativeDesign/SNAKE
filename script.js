/***************************************************
 * Sélection des éléments HTML
 ***************************************************/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

/***************************************************
 * Paramètres du jeu
 ***************************************************/
// Dimensions du canvas
const CANVAS_WIDTH = canvas.width;   // 800
const CANVAS_HEIGHT = canvas.height; // 600

// Taille d’une “case” pour le snake
const gridSize = 20; 
// Nombre de cellules horizontales et verticales
const tileCountX = CANVAS_WIDTH / gridSize; // 800 / 20 = 40
const tileCountY = CANVAS_HEIGHT / gridSize; // 600 / 20 = 30

// Vitesse de rafraîchissement (ms). 100ms ~ 10 FPS
let gameSpeed = 100;

// Variables principales du Snake
let snake = [];
let snakeLength = 3;
let snakeX = 10; 
let snakeY = 10; 
let velocityX = 0; 
let velocityY = 0;

// Position de la pomme
let appleX = 5;
let appleY = 5;

// Score
let score = 0;

// État du jeu
let isGameStarted = false;
let isGameOver = false;
let gameLoopInterval = null;

/***************************************************
 * Gestion des touches
 ***************************************************/
document.addEventListener('keydown', onKeyDown);

/**
 * Fonction appelée à chaque pression d’une touche
 */
function onKeyDown(e) {
  // Si la partie n’est pas lancée ou qu’elle est terminée :
  if (!isGameStarted || isGameOver) {
    // On lance ou relance la partie
    startGame();
  }

  // Ensuite, on gère la direction selon la touche
  switch (e.key) {
    case 'ArrowLeft':
    case 'q':
    case 'Q':
      // Empêche le demi-tour immédiat (si on se déplaçait déjà vers la droite)
      if (velocityX === 1) break;
      velocityX = -1;
      velocityY = 0;
      break;

    case 'ArrowRight':
    case 'd':
    case 'D':
      if (velocityX === -1) break;
      velocityX = 1;
      velocityY = 0;
      break;

    case 'ArrowUp':
    case 'z':
    case 'Z':
      if (velocityY === 1) break;
      velocityX = 0;
      velocityY = -1;
      break;

    case 'ArrowDown':
    case 's':
    case 'S':
      if (velocityY === -1) break;
      velocityX = 0;
      velocityY = 1;
      break;
  }
}

/***************************************************
 * startGame : initialise ou réinitialise une partie
 ***************************************************/
function startGame() {
  // On annule l’éventuel interval existant
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }
  
  // Réinitialise toutes les variables
  isGameStarted = true;
  isGameOver = false;
  score = 0;
  scoreDisplay.textContent = score;

  snake = [];
  snakeLength = 3;
  snakeX = 10;  // position de départ
  snakeY = 10;
  velocityX = 0; 
  velocityY = 0;

  // Place la pomme quelque part au hasard
  placeApple();

  // Lance la boucle de jeu
  gameLoopInterval = setInterval(gameLoop, gameSpeed);
}

/***************************************************
 * gameLoop : appelé régulièrement (100ms)
 ***************************************************/
function gameLoop() {
  update();
  draw();
}

/***************************************************
 * update : met à jour la logique du snake
 ***************************************************/
function update() {
  // Avancer la tête du serpent
  snakeX += velocityX;
  snakeY += velocityY;

  // Vérifier si on sort de l’écran
  if (snakeX < 0 || snakeX >= tileCountX || snakeY < 0 || snakeY >= tileCountY) {
    endGame();
    return;
  }

  // On ajoute la nouvelle position en tête
  snake.push({ x: snakeX, y: snakeY });

  // On retire le segment de trop si on dépasse la taille
  while (snake.length > snakeLength) {
    snake.shift();
  }

  // Collision avec soi-même
  for (let i = 0; i < snake.length - 1; i++) {
    const segment = snake[i];
    if (segment.x === snakeX && segment.y === snakeY) {
      // La tête rentre dans un de ses segments
      endGame();
      return;
    }
  }

  // Manger la pomme
  if (snakeX === appleX && snakeY === appleY) {
    snakeLength++;
    score++;
    scoreDisplay.textContent = score;
    placeApple();
  }
}

/***************************************************
 * draw : dessine le jeu sur le canvas
 ***************************************************/
function draw() {
  // Fond
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Dessin du serpent
  ctx.fillStyle = '#0f0';
  for (let i = 0; i < snake.length; i++) {
    const part = snake[i];
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
  }

  // Dessin de la pomme
  ctx.fillStyle = '#f00';
  ctx.fillRect(appleX * gridSize, appleY * gridSize, gridSize, gridSize);

  // Si c’est game over, on affiche un overlay
  if (isGameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.font = '20px Arial';
    ctx.fillText(`Score : ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText(`Appuie sur une touche de direction pour rejouer`, 
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50
    );
  }
}

/***************************************************
 * endGame : fin de partie
 ***************************************************/
function endGame() {
  isGameOver = true;
  clearInterval(gameLoopInterval);
}

/***************************************************
 * placeApple : positionne la pomme au hasard
 ***************************************************/
function placeApple() {
  appleX = Math.floor(Math.random() * tileCountX);
  appleY = Math.floor(Math.random() * tileCountY);
}
