const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

const player = {
  x: canvas.width / 2 - 10,
  y: canvas.height - 30,
  width: 20,
  height: 20,
  speed: 5,
  dx: 0,
  dy: 0,
  lives: 3,
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  attackPower: 5,
  shootInterval: 1000, // 플레이어 총 발사 간격 (1초)
  lastShotTime: 0,
  bulletsPerShot: 1
};

const bullets = [];
const enemies = [];
const enemyBullets = [];
const experienceDrops = [];
const items = [];
let boss = null;
let score = 0;
let mouseX = 0;
let mouseY = 0;

function drawPlayer() {
  ctx.fillStyle = 'white';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
  ctx.fillStyle = 'red';
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  if (boss) {
    ctx.fillStyle = 'red';
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  }
}

function drawEnemyBullets() {
  ctx.fillStyle = 'yellow';
  enemyBullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

function drawExperience() {
  ctx.fillStyle = 'green';
  experienceDrops.forEach(exp => {
    ctx.fillRect(exp.x, exp.y, exp.width, exp.height);
  });
}

function drawItems() {
  ctx.fillStyle = 'blue';
  items.forEach(item => {
    ctx.fillRect(item.x, item.y, item.width, item.height);
  });
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
  player.x += player.dx;
  player.y += player.dy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function movePlayer(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    player.dx = player.speed;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    player.dx = -player.speed;
  } else if (e.key === 'Up' || e.key === 'ArrowUp') {
    player.dy = -player.speed;
  } else if (e.key === 'Down' || e.key === 'ArrowDown') {
    player.dy = player.speed;
  }
}

function stopPlayer(e) {
  if (
    e.key === 'Right' || e.key === 'ArrowRight' ||
    e.key === 'Left' || e.key === 'ArrowLeft' ||
    e.key === 'Up' || e.key === 'ArrowUp' ||
    e.key === 'Down' || e.key === 'ArrowDown'
  ) {
    player.dx = 0;
    player.dy = 0;
  }
}

function shootBullet() {
  const now = Date.now();
  if (now - player.lastShotTime < player.shootInterval) return; // 발사 간격 체크

  const angle = Math.atan2(mouseY - (player.y + player.height / 2), mouseX - (player.x + player.width / 2));
  for (let i = 0; i < player.bulletsPerShot; i++) {
    bullets.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      width: 5,
      height: 5,
      dx: Math.cos(angle) * 7,
      dy: Math.sin(angle) * 7
    });
  }
  player.lastShotTime = now;
}

function updateBullets() {
  bullets.forEach((bullet, index) => {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    if (bullet.x + bullet.width < 0 || bullet.x > canvas.width || bullet.y + bullet.height < 0 || bullet.y > canvas.height) {
      bullets.splice(index, 1);
    }
  });
}

function createEnemy() {
  const x = Math.random() * (canvas.width - 30);
  const type = Math.random() < 0.5 ? 'straight' : 'diagonal';
  let color, health, shootInterval, bulletSpeed, bulletCount;

  if (player.level < 5) {
    color = type === 'straight' ? 'blue' : 'purple';
    health = 5 + player.level;
    shootInterval = 500;
    bulletSpeed = 3;
    bulletCount = 1;
  } else if (player.level < 10) {
    color = type === 'straight' ? 'cyan' : 'magenta';
    health = 10 + player.level;
    shootInterval = 400;
    bulletSpeed = 5;
    bulletCount = 2;
  } else {
    color = type === 'straight' ? 'green' : 'pink';
    health = 15 + player.level;
    shootInterval = 300;
    bulletSpeed = 7;
    bulletCount = 3;
  }

  enemies.push({
    x,
    y: 0,
    width: 30,
    height: 30,
    dy: 2,
    type,
    color,
    health,
    lastShotTime: 0,
    shootInterval,
    bulletSpeed,
    bulletCount
  });
}

function createBoss() {
  boss = {
    x: canvas.width / 2 - 50,
    y: 50,
    width: 100,
    height: 100,
    dy: 1,
    health: 20 + player.level * 2,
    bulletSpeed: 5,
    bulletCount: 5
  };
}

function updateEnemies() {
  enemies.forEach((enemy, index) => {
    if (enemy.type === 'straight') {
      enemy.y += enemy.dy;
    } else {
      enemy.x += Math.sin(enemy.y / 20) * 5;
      enemy.y += enemy.dy;
    }

    // 플레이어를 따라다니게 하기
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.dx = Math.cos(angle) * 2;
    enemy.dy = Math.sin(angle) * 2;
    enemy.x += enemy.dx;
    enemy.y += enemy.dy;

    if (enemy.y + enemy.height > canvas.height) {
      enemies.splice(index, 1);
    } else if (Math.random() < 0.01) {
      shootEnemyBullet(enemy);
    }

    // 몬스터 총알 발사 간격 조정
    const now = Date.now();
    if (now - enemy.lastShotTime >= enemy.shootInterval) {
      shootEnemyBullet(enemy);
      enemy.lastShotTime = now;
    }
  });

  if (boss) {
    boss.y += boss.dy;
    if (boss.y + boss.height > canvas.height) {
      boss.y = 0;
    }
    if (Math.random() < 0.02) {
      shootBossBullet();
    }
  }
}

function shootEnemyBullet(enemy) {
  for (let i = 0; i < enemy.bulletCount; i++) {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemyBullets.push({
      x: enemy.x + enemy.width / 2 - 2.5,
      y: enemy.y + enemy.height,
      width: 5,
      height: 10,
      dx: Math.cos(angle) * enemy.bulletSpeed,
      dy: Math.sin(angle) * enemy.bulletSpeed
    });
  }
}

function shootBossBullet() {
  const directions = [
    { dx: 0, dy: 5 },
    { dx: 2, dy: 5 },
    { dx: -2, dy: 5 },
    { dx: 3, dy: 4 },
    { dx: -3, dy: 4 }
  ];
  directions.forEach(direction => {
    enemyBullets.push({
      x: boss.x + boss.width / 2 - 2.5,
      y: boss.y + boss.height,
      width: 5,
      height: 10,
      dx: direction.dx,
      dy: direction.dy
    });
  });
}

function updateEnemyBullets() {
  enemyBullets.forEach((bullet, index) => {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    if (bullet.y > canvas.height) {
      enemyBullets.splice(index, 1);
    }
  });
}

function detectCollision() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        bullets.splice(bIndex, 1);
        enemy.health -= player.attackPower;
        if (enemy.health <= 0) {
          enemies.splice(eIndex, 1);
          score += 10;
          dropExperience(enemy.x, enemy.y);
        }
      }
    });

    if (boss && bullet.x < boss.x + boss.width && bullet.x + bullet.width > boss.x && bullet.y < boss.y + boss.height && bullet.y + bullet.height > boss.y) {
      bullets.splice(bIndex, 1);
      boss.health -= player.attackPower;
      if (boss.health <= 0) {
        boss = null;
        score += 100;
        dropExperience(boss.x, boss.y, true);
      }
    }
  });

  enemies.forEach((enemy, eIndex) => {
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      enemies.splice(eIndex, 1);
      player.lives -= 1;
      updateLives();
      checkGameOver();
    }
  });

  enemyBullets.forEach((bullet, bIndex) => {
    if (
      player.x < bullet.x + bullet.width &&
      player.x + player.width > bullet.x &&
      player.y < bullet.y + bullet.height &&
      player.y + player.height > bullet.y
    ) {
      enemyBullets.splice(bIndex, 1);
      player.lives -= 1;
      updateLives();
      checkGameOver();
    }

    bullets.forEach((playerBullet, pIndex) => {
      if (
        bullet.x < playerBullet.x + playerBullet.width &&
        bullet.x + bullet.width > playerBullet.x &&
        bullet.y < playerBullet.y + playerBullet.height &&
        bullet.y + bullet.height > playerBullet.y
      ) {
        enemyBullets.splice(bIndex, 1);
        bullets.splice(pIndex, 1);
      }
    });
  });

  experienceDrops.forEach((exp, index) => {
    if (
      player.x < exp.x + exp.width &&
      player.x + player.width > exp.x &&
      player.y < exp.y + exp.height &&
      player.y + player.height > exp.y
    ) {
      experienceDrops.splice(index, 1);
      player.experience += exp.value;
      updateExperience();
      checkLevelUp();
    }
  });

  items.forEach((item, index) => {
    if (
      player.x < item.x + item.width &&
      player.x + player.width > item.x &&
      player.y < item.y + item.height &&
      player.y + player.height > item.y
    ) {
      items.splice(index, 1);
      applyItemEffect(item.type);
    }
  });
}

function dropExperience(x, y, isBoss = false) {
  const value = isBoss ? 50 : 10;
  experienceDrops.push({
    x,
    y,
    width: 10,
    height: 10,
    value
  });
}

function updateExperience() {
  document.getElementById('experience').innerText = `Experience: ${player.experience}`;
}

function checkLevelUp() {
  if (player.experience >= player.experienceToNextLevel) {
    player.level += 1;
    player.experience = 0;
    player.experienceToNextLevel += 100;
    player.attackPower += 2;
    if (player.level % 5 === 0) {
      player.bulletsPerShot += 1;
    }
    if (player.level >= 3) {
      player.shootInterval = 200; // 레벨 3이 되면 발사 간격을 0.2초로 변경
    }
    updateLevel();
    spawnItem();
  }
}

function updateLevel() {
  document.getElementById('level').innerText = `Level: ${player.level}`;
}

function spawnItem() {
  const x = Math.random() * (canvas.width - 30);
  const y = Math.random() * (canvas.height - 30);
  items.push({
    x,
    y,
    width: 20,
    height: 20,
    type: 'heal'
  });
}

function applyItemEffect(type) {
  if (type === 'heal') {
    player.lives += 1;
    updateLives();
  }
}

function updateLives() {
  document.getElementById('lives').innerText = `Lives: ${player.lives}`;
}

function checkGameOver() {
  if (player.lives <= 0) {
    alert('Game Over');
    document.location.reload();
  }
}

function update() {
  clear();
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawEnemyBullets();
  drawExperience();
  drawItems();
  newPos();
  updateBullets();
  updateEnemies();
  updateEnemyBullets();
  detectCollision();
  requestAnimationFrame(update);
}

update();
setInterval(createEnemy, 2000);
setTimeout(createBoss, 15000);

document.addEventListener('keydown', movePlayer);
document.addEventListener('keyup', stopPlayer);
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX - canvas.offsetLeft;
  mouseY = e.clientY - canvas.offsetTop;
});
document.addEventListener('mousedown', () => {
  shootBullet();
  setInterval(shootBullet, player.shootInterval); // 플레이어 총 발사 간격
});
