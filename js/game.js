import { createGrid, getTile } from './grid.js';
import { player } from './player.js';
import { mineTile } from './mining.js';

let mineTimeout = null;

export function initGame() {
  const gameContainer = document.getElementById("game");
  const oreDisplay = document.getElementById("ore-count");

  gameContainer.innerHTML = "";
  createGrid(gameContainer);
  createPixelRain();

  oreDisplay.textContent = player.ore;
  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function updatePlayerPosition() {
  document.querySelectorAll(".player").forEach((el) => el.classList.remove("player"));
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) tile.classList.add("player");
}

function centerCameraOnPlayer() {
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) {
    tile.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
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
    case "arrowup":
    case "w":
      newY--;
      break;
    case "arrowdown":
    case "s":
      newY++;
      break;
    case "arrowleft":
    case "a":
      newX--;
      break;
    case "arrowright":
    case "d":
      newX++;
      break;
    default:
      return;
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

export function updateStepDisplay() {
  const el = document.getElementById("step-count");
  if (el) el.textContent = player.stepsLeft;
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

// 🎮 Start game on page load
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});

// ⌨️ Reveal start screen on Enter
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const startOverlay = document.getElementById("start-screen-overlay");
    if (startOverlay && startOverlay.classList.contains("active")) {
      startOverlay.classList.remove("active");
    }
  }
});

/* RAIN */

function createPixelRain() {
  const rainContainer = document.getElementById("rain");
  if (!rainContainer) return;

  const numDrops = 100; // adjust for more or less rain

for (let i = 0; i < numDrops; i++) {
  const drop = document.createElement("div");
  drop.classList.add("pixel-drop");

  drop.style.left = Math.random() * 100 + "vw";
  drop.style.top = "-10px"; // ✅ critical line
  drop.style.animationDelay = Math.random() * 5 + "s";
  drop.style.animationDuration = 1 + Math.random() * 2 + "s";

  rainContainer.appendChild(drop);
  }
}

/* collect mined object */

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "e") {
    const tile = getTile(player.x, player.y);
    if (tile) collectMinedTile(tile);
  }
});

export function collectMinedTile(tile) {
  if (!tile.classList.contains("mined")) return;

  const type = tile.dataset.type;
  const slotIndex = player.inventory.findIndex(item => item === null);

  if (slotIndex !== -1) {
    // Add item to inventory
    player.inventory[slotIndex] = type;

    // Clear tile visually and logically
    tile.classList.remove("mined");
    tile.classList.add("empty");
    tile.dataset.type = "empty";

    updateInventoryUI();
  }
}
document.addEventListener("keydown", (e) => {
  if (e.key === "e") {
    const tile = getTile(player.x, player.y);
    if (tile) collectpMinedTile(tile);
  }
});
