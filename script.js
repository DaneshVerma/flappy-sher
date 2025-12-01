function game() {
  const scoreElement = document.querySelector("#scoreBoard .current");
  const highScoreElement = document.querySelector("#scoreBoard .high");
  const scoreBoard = document.getElementById("scoreBoard");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScore = document.getElementById("finalScore");
  const restartBtn = document.getElementById("restartBtn");
  const gameSong = new Audio("./sounds/game.mp3");
  const crashSong = new Audio("./sounds/crash.mp3");
  const gameStartScreen = document.getElementById("gameStartScreen");
  const startBtn = document.getElementById("startBtn");

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  canvas.width = 1080;
  canvas.height = 1280;

  let pipes = [];
  let pipeWidth = 120;
  let pipeSpwanTimer = 0;
  let birdY = 20;
  let birdX = 200;
  let birdWidth = 80;
  let birdHeight = 150;
  let birdVelocity = 0;
  let score = 0;
  let highScore = localStorage.getItem("flappyscore") || 0;
  let dead = false;
  let animationId = null;
  let spawnInterval = 240; // frames between pipe spawns
  let baseSpeed = 3;
  let backgroundOffsetY = 0; // track background vertical position

  const gravity = 0.4;
  const jumpForce = -8;

  const pipeImg = new Image();
  pipeImg.src = "./images/image.png";

  const BiirdImg = new Image();
  BiirdImg.src = "./images/harshbhaiya.png";

  function spawnPipe() {
    const gap = 400;
    const minTop = 80;
    const maxTop = canvas.height - gap - 80;

    const topHeight = Math.floor(Math.random() * (maxTop - minTop) + minTop);

    pipes.push({
      x: canvas.width,
      topHeight: topHeight,
      gap: gap,
      counted: false,
    });
  }
  function resetGame() {
    // reset game state
    pipes = [];
    pipeSpwanTimer = 0;
    birdY = 20;
    birdX = 200;
    birdVelocity = 0;
    score = 0;
    dead = false;
    spawnInterval = 180;
    backgroundOffsetY = 0;
    canvas.style.backgroundPosition = `center calc(50% + ${backgroundOffsetY}px)`;
    scoreElement.innerText = `Score : ${score}`;
    gameOverScreen.classList.add("hidden");
    scoreElement.classList.remove("hidden");
  }

  function restart() {
    resetGame();
    loop();
  }
  function gameOver() {
    gameSong.pause();
    gameSong.currentTime = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    score > highScore ? localStorage.setItem("flappyscore", score) : null;
    gameOverScreen.classList.remove("hidden");
    finalScore.innerText = `Your score is: ${score}`;
    cancelAnimationFrame(animationId);
    restartBtn.onclick = restart;
  }

  function isColliding(
    aLeft,
    aTop,
    aWidth,
    aHeight,
    bLeft,
    bTop,
    bWidth,
    bHeight
  ) {
    aRight = aLeft + aWidth;
    aBottom = aTop + aHeight;
    bRight = bLeft + bWidth;
    bBottom = bTop + bHeight;
    const offset = 10; // optional offset to make collision less sensitive
    return (
      aLeft + offset < bRight &&
      aRight - offset > bLeft + offset &&
      aTop + offset < bBottom &&
      aBottom - offset > bTop
    );
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // DRAW BIRD
    ctx.fillStyle = "transparent";
    ctx.drawImage(BiirdImg, birdX, birdY, birdWidth, birdHeight);
    gameSong.play();
    // UPDATE BIRD
    birdVelocity += gravity;
    birdY += birdVelocity;

    // UPDATE BACKGROUND POSITION (parallax effect)
    backgroundOffsetY += birdVelocity * 0.2; // move background at 20% of bird speed
    backgroundOffsetY = Math.max(-100, Math.min(100, backgroundOffsetY)); 
    canvas.style.backgroundPosition = `center calc(50% + ${backgroundOffsetY}px)`;

    // UPDATE + DRAW PIPES
    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];
      pipe.x -= baseSpeed;

      // draw
      ctx.fillStyle = "green";
      ctx.drawImage(pipeImg, pipe.x, 0, pipeWidth, pipe.topHeight);

      let bottomY = pipe.topHeight + pipe.gap;
      ctx.drawImage(
        pipeImg,
        pipe.x,
        bottomY,
        pipeWidth,
        canvas.height - bottomY
      );

      // scoring
      if (!pipe.counted && !dead && pipe.x + pipeWidth < birdX) {
        score++;
        scoreElement.innerText = `Score: ${score}`;
        pipe.counted = true;
        if (score > highScore) {
          highScore = score;
          highScoreElement.innerText = `HighScore: ${highScore}`;
        }
        if (score % 5 === 0 && spawnInterval > 60) {
          spawnInterval -= 15; // increase difficulty
          baseSpeed += 0.5; // increase pipe speed
        }
      }

      // remove offscreen pipes
      if (pipe.x + pipeWidth < 0) {
        pipes.splice(i, 1);
        i--;
      }

      // collision check
      if (
        isColliding(
          birdX,
          birdY,
          birdWidth,
          birdHeight,
          pipe.x,
          0,
          pipeWidth,
          pipe.topHeight
        ) ||
        isColliding(
          birdX,
          birdY,
          birdWidth,
          birdHeight,
          pipe.x,
          bottomY,
          pipeWidth,
          canvas.height - bottomY
        )
      ) {
        dead = true;
      }
    }
    // boundary check AFTER all pipe logic
    if (birdY < 0 || birdY + birdHeight >= canvas.height + 10) {
      dead = true;
    }

    // game-over trigger
    if (dead) {
      crashSong.play();
      gameOver();
      return;
    }

    // spawn new pipe
    pipeSpwanTimer++;
    if (pipeSpwanTimer > spawnInterval) {
      spawnPipe();
      pipeSpwanTimer = 0;
    }

    animationId = requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      birdVelocity = jumpForce;
      // background jumps slightly with the bird (clamped to prevent white space)
      backgroundOffsetY += jumpForce * 0.3;
      backgroundOffsetY = Math.max(-100, Math.min(100, backgroundOffsetY));
    } else if (e.code === "ArrowLeft") {
      birdX = birdX - 10;
    } else if (e.code === "ArrowRight") {
      birdX = birdX + 10;
    } else if (e.code === "Enter") {
      if (!gameStartScreen.classList.contains("hidden")) {
        gameStartScreen.classList.add("hidden");
        highScoreElement.innerText = `HighScore: ${highScore}`;
        scoreBoard.classList.remove("hidden");
        scoreBoard.style.display = "flex";
        loop();
      }
      if (dead) {
        restart();
      }
    }
  });

  startBtn.onclick = function () {
    gameStartScreen.classList.add("hidden");
    highScoreElement.innerText = `HighScore: ${highScore}`;
    scoreBoard.classList.remove("hidden");
    scoreBoard.style.display = "flex";
    loop();
  };
}

if (window.outerWidth < 720) {
  document.querySelector("#gameStartScreen .card").innerHTML =
    "<h1>Bhai Laptop ya Desktop pe khelo.</h1>";
} else {
  game();
}
