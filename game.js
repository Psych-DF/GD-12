// Tile list
sword
cat
necklace
heart
shroom
flame
key
bone
skull
crown
bottle
soil
coin
pebble
note
eye
root
spider
worm
bell
darkness

// ===========================
// TILE TYPE LOGIC
// ===========================

function getRandomTileType() {
  const types = [
    { type: "sword", weight: 1 },
    { type: "cat", weight: 1 },
    { type: "necklace", weight: 1 },
    { type: "heart", weight: 1 },
    { type: "shroom", weight: 1 },
    { type: "flame", weight: 1 },
    { type: "key", weight: 1 },
    { type: "bone", weight: 1 },
    { type: "skull", weight: 1 },
    { type: "crown", weight: 1 },
    { type: "bottle", weight: 1 },
    { type: "soil", weight: 1 },
    { type: "coin", weight: 1 },
    { type: "pebble", weight: 1 },
    { type: "note", weight: 1 },
    { type: "eye", weight: 1 },
    { type: "root", weight: 1 },
    { type: "spider", weight: 1 },
    { type: "worm", weight: 1 },
    { type: "bell", weight: 1 },
    { type: "darkness", weight: 1 },
  ];

  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const { type, weight } of types) {
    cumulative += weight;
    if (roll < cumulative) return type;
  }
}

// ===========================
// PLAYER STATE
// ===========================

const player = {
  x: 150,
  y: 150,
  spawnX: 150,
  spawnY: 150,
  stepsLeft: 50,
  maxSteps: 50,
  digs: 0,
  diamond: 0,
  gold: 0,
  silver: 0,
  ore: 0,
  stone: 0,
  clay: 0,
  bone: 0,
  dirt: 0,
  inventory: [null, null, null, null]
};

function updateCounters() {
  document.getElementById("step-count").textContent = player.stepsLeft;
  document.getElementById("digs-count").textContent = player.digs;
  document.getElementById("diamond-count").textContent = player.diamond;
  document.getElementById("gold-count").textContent = player.gold;
  document.getElementById("silver-count").textContent = player.silver;
  document.getElementById("ore-count").textContent = player.ore;
  document.getElementById("stone-count").textContent = player.stone;
  document.getElementById("clay-count").textContent = player.clay;
  document.getElementById("bone-count").textContent = player.bone;
  document.getElementById("dirt-count").textContent = player.dirt;
}

// ===========================
// GRID & TILE CREATION
// ===========================

function createGrid(container) {
  for (let y = 0; y < 300; y++) {
    for (let x = 0; x < 300; x++) {
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
  player[type] = (player[type] || 0) + 1;

  updateCounters();
}

function collectMinedTile(tile) {
  if (!tile.classList.contains("mined")) return;

  const type = tile.dataset.type;
  const slotIndex = player.inventory.findIndex(item => item === null);

  if (slotIndex !== -1) {
    player.inventory[slotIndex] = type;
    tile.classList.remove("mined");
    tile.classList.add("empty");
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
  if (!nextTile || nextTile.dataset.type === "darkness") return;

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

const tileImages = {
  diamond: "images/empty.png",
  gold: "images/empty.png",
  silver: "images/empty.png",
  ore: "images/empty.png",
  stone: "images/empty.png",
  clay: "images/empty.png",
  bone: "images/empty.png",
  dirt: "images/empty.png"
};

function updateInventoryUI() {
  player.inventory.forEach((type, i) => {
    const slot = document.getElementById(`slot-${i + 1}`);
    slot.innerHTML = ""; // Clear previous content

    if (type) {
      const img = document.createElement("img");
      img.src = tileImages[type];
      img.alt = type;
      img.classList.add("inventory-icon");
      slot.appendChild(img);
    }
  });
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
