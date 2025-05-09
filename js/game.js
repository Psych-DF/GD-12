// ===========================
// TILE TYPE LOGIC
// ===========================

function getRandomTileType() {
  const tileTypes = [
    "dirt", "dirt", "dirt", "dirt", "dirt",
    "stone", "stone", "stone",
    "clay", "clay",
    "bone",
    "ore",
    "silver",
    "gold",
    "diamond"
  ];
  return tileTypes[Math.floor(Math.random() * tileTypes.length)];
}

// ===========================
// PLAYER STATE
// ===========================

const player = {
  x: 0,
  y: 0,
  spawnX: 0,
  spawnY: 0,
  ore: 0,
  digs: 0,
  maxSteps: 50,
  stepsLeft: 50,
  inventory: [null, null, null, null],
};

// ===========================
// GRID & TILE CREATION
// ===========================

function createGrid(container) {
  for (let y = 0; y < 40; y++) {
    for (let x = 0; x < 40; x++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.dataset.type = getRandomTileType();
      container.appendChild(tile);
    }
  }
}

function getTile(x, y) {
  return document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
}

function rebindGridEvents() {
  document.querySelectorAll(".tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const x = parseInt(tile.dataset.x, 10);
      const y = parseInt(tile.dataset.y, 10);
      mineTile(x, y);
    });
  });
}

// ===========================
// MINING LOGIC
// ===========================

function mineTile(x, y) {
  const tile = getTile(x, y);
  if (!tile || tile.classList.contains("mined")) return;

  tile.classList.add("mined");
  player.digs++;

  const type = tile.dataset.type;
  if (type === "ore") player.ore++;

  updateInventoryUI();
}

function collectMinedTile(tile) {
  if (!tile.classList.contains("mined")) return;

  const type = tile.dataset.type;
  const slotIndex = player.inventory.findIndex(item => item === null);

  if (slotIndex !== -1) {
    player.inventory[slotIndex] = type;
    tile.classList.remove("mined");
    tile.classList.add("empty");
    tile.dataset.type = "empty";
    updateInventoryUI();
  }
}

// ===========================
// GAME LOGIC, MOVEMENT, UI
// ===========================

let mineTimeout = null;

function initGame() {
  const gameContainer = document.getElementById("game");
  const oreDisplay = document.getElementById("ore-count");

  gameContainer.innerHTML = "";
  createGrid(gameContainer);

  oreDisplay.textContent = player.ore;
  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function updatePlayerPosition() {
  document.querySelectorAll(".player").forEach(el => el.classList.remove("player"));
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) tile.classList.add("player");
}

function centerCameraOnPlayer() {
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) {
    tile.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }
}

let moveInterval = null;
let heldDirection = null;
let lastMoveTime = 0;
const moveCooldown = 200;

function movePlayer(key) {
  const now = Date.now();
  if (now - lastMoveTime < moveCooldown) return;
  if (player.stepsLeft <= 0) return;

  let newX = player.x;
  let newY = player.y;

  switch (key) {
    case "arrowup": case "w": newY--; break;
    case "arrowdown": case "s": newY++; break;
    case "arrowleft": case "a": newX--; break;
    case "arrowright": case "d": newX++; break;
    default: return;
  }

  const nextTile = getTile(newX, newY);
  if (!nextTile || nextTile.dataset.type === "rock") return;

  player.x = newX;
  player.y = newY;
  player.stepsLeft--;
  updateStepDisplay();

  if (player.stepsLeft <= 0) {
    showDayEndOverlay();
    return;
  }

  lastMoveTime = now;
  updatePlayerPosition();
  centerCameraOnPlayer();
}

function handleKeyDown(e) {
  const key = e.key.toLowerCase();
  if (e.repeat || moveInterval) return;

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    heldDirection = key;
    movePlayer(heldDirection);
    moveInterval = setInterval(() => movePlayer(heldDirection), 250);
  }

  if (key === " ") {
    if (!mineTimeout) {
      mineTimeout = setTimeout(() => {
        mineTile(player.x, player.y);
        mineTimeout = null;
      }, 1000);
    }
  }

  if (key === "e") {
    const tile = getTile(player.x, player.y);
    if (tile) collectMinedTile(tile);
  }
}

function handleKeyUp(e) {
  if (e.key.toLowerCase() === heldDirection) {
    clearInterval(moveInterval);
    moveInterval = null;
    heldDirection = null;
  }

  if (e.key === " " && mineTimeout) {
    clearTimeout(mineTimeout);
    mineTimeout = null;
  }
}

function updateStepDisplay() {
  const el = document.getElementById("step-count");
  if (el) el.textContent = player.stepsLeft;
}

function updateInventoryUI() {
  for (let i = 0; i < 4; i++) {
    const slot = document.getElementById(`slot-${i + 1}`);
    const item = player.inventory[i];
    slot.textContent = item ? item.toUpperCase() : "";
    slot.title = item || "Empty";
  }
}

function showDayEndOverlay() {
  const overlay = document.getElementById("day-end-overlay");
  if (overlay) {
    document.getElementById("stat-digs").textContent = player.digs || 0;
    overlay.classList.add("active");
  }
}

window.startNewDay = function () {
  const overlay = document.getElementById("day-end-overlay");
  if (overlay) overlay.classList.remove("active");

  player.stepsLeft = player.maxSteps;
  player.x = player.spawnX;
  player.y = player.spawnY;

  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();
};

// Start game and allow music trigger
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const startOverlay = document.getElementById("start-screen-overlay");
    if (startOverlay && startOverlay.classList.contains("active")) {
      startOverlay.classList.remove("active");
      if (typeof startMusic === "function") startMusic();
    }
  }
});
