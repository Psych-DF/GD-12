// ===========================
// TILE TYPE LOGIC
// ===========================
/* LOGIC FILE FOR HOW TILES SPAWN INTO THE GRID */
// Defines function getRandomTileType
export function getRandomTileType() {
// Declares constant rand
  const rand = Math.random();

// Returns from a function
  if (rand < 0.01) return "diamond";   // 1%
// Returns from a function
  if (rand < 0.04) return "gold";      // 3%
// Returns from a function
  if (rand < 0.09) return "silver";    // 5%
// Returns from a function
  if (rand < 0.17) return "ore";       // 8%
// Returns from a function
  if (rand < 0.27) return "stone";     // 10%
// Returns from a function
  if (rand < 0.39) return "clay";      // 12%
// Returns from a function
  if (rand < 0.51) return "bone";      // 12%
// Returns from a function
  if (rand < 0.66) return "dirt";      // 15%
// Returns from a function
  return "rock";                       // 34%
}


// ===========================
// PLAYER STATE
// ===========================
/* POSTION LOGIC */
// Declares constant player
export const player = {
  x: 250, // middle of 150
  y: 250,
  spawnX: 250,
  spawnY: 250,
/* STEPS LOGIC */
  maxSteps: 50,
  stepsLeft: 50,
/* DIG COUNTER */
  digs: 0,
/* ITEMS / RESOURCE COUNTERS*/  
  diamond: 0,
  gold: 0,
  silver: 0,
  ore: 0,
  stone: 0,
  clay: 0,
  bone: 0,
  dirt: 0,
  rock: 0,
/* INVENTORY */
 inventory: [null, null, null, null], // 4 slots, empty initially
};



// ===========================
// GRID & TILE CREATION
// ===========================
// js/grid.js
import { getRandomTileType } from './tileTypes.js';
import { mineTile } from './mining.js';

// Declares constant grid
export const grid = [];
// Declares constant gridWidth
export const gridWidth = 500;
// Declares constant gridHeight
export const gridHeight = 500;

// Defines function createGrid
export function createGrid(container) {
// Declares variable y
  for (let y = 0; y < gridHeight; y++) {
// Declares variable x
    for (let x = 0; x < gridWidth; x++) {
// Declares constant type
      const type = getRandomTileType();
// Declares constant tile
      const tile = document.createElement("div");
// Adds a CSS class to an element
      tile.classList.add("tile");
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.dataset.type = type;
      tile.dataset.mined = "false";
// Appends an element to the DOM
      container.appendChild(tile);
      grid.push(tile);
    }
  }
}

// ✅ This must be outside the createGrid function
// Defines function getTile
export function getTile(x, y) {
// Returns from a function
  if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return null;
// Declares constant index
  const index = y * gridWidth + x;
// Returns from a function
  return grid[index] || null;
}

// Defines function rebindGridEvents
export function rebindGridEvents() {
// Selects a single DOM element
  document.querySelectorAll(".tile").forEach(tile => {
// Adds an event listener to an element
    tile.addEventListener("click", () => {
// Declares constant x
      const x = parseInt(tile.dataset.x, 10);
// Declares constant y
      const y = parseInt(tile.dataset.y, 10);
      mineTile(x, y);
    });
  });
}


// ===========================
// MINING LOGIC
// ===========================
import { getTile } from './grid.js';
import { player } from './player.js';

// Defines function getMiningProperties
function getMiningProperties(type) {
  switch (type) {
// Returns from a function
    case "diamond": return { time: 100, reward: 1 };
// Returns from a function
    case "gold":    return { time: 100, reward: 1 };
// Returns from a function
    case "silver":  return { time: 100, reward: 1 };
// Returns from a function
    case "ore":     return { time: 100, reward: 1 };
// Returns from a function
    case "stone":   return { time: 100, reward: 1 };
// Returns from a function
    case "clay":    return { time: 100, reward: 1 };
// Returns from a function
    case "bone":    return { time: 100, reward: 1 };
// Returns from a function
    case "dirt":    return { time: 100, reward: 1 };
// Returns from a function
    default:        return { time: 100, reward: 0 };
  }
}

// Defines function mineTile
export function mineTile(x, y) {
// Declares constant tile
  const tile = getTile(x, y);
// Returns from a function
  if (!tile || tile.dataset.mined === "true") return;

// Declares constant type
  const type = tile.dataset.type;
  /* LOG */
  console.log("Mining tile type:", type);
  /* LOG */
// Declares constant { time, reward }
  const { time, reward } = getMiningProperties(type);

// Adds a CSS class to an element
  tile.classList.add("mining");

  requestAnimationFrame(() => {
    setTimeout(() => {
      tile.dataset.mined = "true";
// Removes a CSS class from an element
      tile.classList.remove("mining");
// Removes a CSS class from an element
      tile.classList.remove(type);
// Adds a CSS class to an element
      tile.classList.add("mined");

      // ✅ Dynamically update player stat and HUD based on tile type
      if (player.hasOwnProperty(type)) {
        player[type] += reward;
// Declares constant display
        const display = document.getElementById(`${type}-count`);
// Updates the text content of a DOM element
        if (display) display.textContent = player[type];
      }

      player.digs++; // ✅ DIG INCREMENT
// Declares constant digsDisplay
      const digsDisplay = document.getElementById("digs-count");
// Updates the text content of a DOM element
      if (digsDisplay) digsDisplay.textContent = player.digs;

      console.log(`Mined ${type}. +${reward} ${type}`);
    }, time);
  });
}


// ===========================
// GAME LOGIC, MOVEMENT, UI
// ===========================
import { createGrid, getTile } from './grid.js';
import { player } from './player.js';
import { mineTile } from './mining.js';

// Declares variable mineTimeout
let mineTimeout = null;

// Defines function initGame
export function initGame() {
// Declares constant gameContainer
  const gameContainer = document.getElementById("game");
// Declares constant oreDisplay
  const oreDisplay = document.getElementById("ore-count");

// Sets or clears innerHTML content
  gameContainer.innerHTML = "";
  createGrid(gameContainer);
  createPixelRain();

// Updates the text content of a DOM element
  oreDisplay.textContent = player.ore;
  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();

// Adds a DOM event listener
  document.addEventListener("keydown", handleKeyDown);
// Adds a DOM event listener
  document.addEventListener("keyup", handleKeyUp);
}

// Defines function updatePlayerPosition
function updatePlayerPosition() {
// Removes a CSS class from an element
  document.querySelectorAll(".player").forEach((el) => el.classList.remove("player"));
// Declares constant tile
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
// Adds a CSS class to an element
  if (tile) tile.classList.add("player");
}

// Defines function centerCameraOnPlayer
function centerCameraOnPlayer() {
// Declares constant tile
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) {
// Scrolls a DOM element into view
    tile.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  }
}

// Declares variable moveInterval
let moveInterval = null;
// Declares variable heldDirection
let heldDirection = null;
// Declares variable lastMoveTime
let lastMoveTime = 0;
// Declares constant moveCooldown
const moveCooldown = 200;

// Defines function movePlayer
function movePlayer(key) {
// Declares constant now
  const now = Date.now();
// Returns from a function
  if (now - lastMoveTime < moveCooldown) return;
// Returns from a function
  if (player.stepsLeft <= 0) return;

// Declares variable newX
  let newX = player.x;
// Declares variable newY
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
// Returns from a function
      return;
  }

// Declares constant nextTile
  const nextTile = getTile(newX, newY);
// Returns from a function
  if (!nextTile || nextTile.dataset.type === "rock") return;

  player.x = newX;
  player.y = newY;
  player.stepsLeft--;
  updateStepDisplay();

  if (player.stepsLeft <= 0) {
    showDayEndOverlay();
// Returns from a function
    return;
  }

  lastMoveTime = now;
  updatePlayerPosition();
  centerCameraOnPlayer();
}

// Defines function handleKeyDown
function handleKeyDown(e) {
// Declares constant key
  const key = e.key.toLowerCase();
// Returns from a function
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

// Defines function handleKeyUp
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

// Defines function updateStepDisplay
export function updateStepDisplay() {
// Declares constant el
  const el = document.getElementById("step-count");
// Updates the text content of a DOM element
  if (el) el.textContent = player.stepsLeft;
}

// Defines function showDayEndOverlay
function showDayEndOverlay() {
// Declares constant overlay
  const overlay = document.getElementById("day-end-overlay");
  if (overlay) {
// Updates the text content of a DOM element
    document.getElementById("stat-digs").textContent = player.digs || 0;
// Adds a CSS class to an element
    overlay.classList.add("active");
  }
}

// Defines function 
window.startNewDay = function () {
// Declares constant overlay
  const overlay = document.getElementById("day-end-overlay");
// Removes a CSS class from an element
  if (overlay) overlay.classList.remove("active");

  player.stepsLeft = player.maxSteps;
  player.x = player.spawnX;
  player.y = player.spawnY;

  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();
};

// 🎮 Start game on page load
// Adds a window event listener
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});

// ⌨️ Reveal start screen on Enter
// Adds a DOM event listener
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
// Declares constant startOverlay
    const startOverlay = document.getElementById("start-screen-overlay");
    if (startOverlay && startOverlay.classList.contains("active")) {
// Removes a CSS class from an element
      startOverlay.classList.remove("active");
    }
  }
});

/* RAIN */

// Defines function createPixelRain
function createPixelRain() {
// Declares constant rainContainer
  const rainContainer = document.getElementById("rain");
// Returns from a function
  if (!rainContainer) return;

// Declares constant numDrops
  const numDrops = 100; // adjust for more or less rain

// Declares variable i
for (let i = 0; i < numDrops; i++) {
// Declares constant drop
  const drop = document.createElement("div");
// Adds a CSS class to an element
  drop.classList.add("pixel-drop");

  drop.style.left = Math.random() * 100 + "vw";
  drop.style.top = "-10px"; // ✅ critical line
  drop.style.animationDelay = Math.random() * 5 + "s";
  drop.style.animationDuration = 1 + Math.random() * 2 + "s";

// Appends an element to the DOM
  rainContainer.appendChild(drop);
  }
}

/* collect mined object */

// Adds a DOM event listener
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "e") {
// Declares constant tile
    const tile = getTile(player.x, player.y);
    if (tile) collectMinedTile(tile);
  }
});

// Defines function collectMinedTile
export function collectMinedTile(tile) {
// Returns from a function
  if (!tile.classList.contains("mined")) return;

// Declares constant type
  const type = tile.dataset.type;
// Declares constant slotIndex
  const slotIndex = player.inventory.findIndex(item => item === null);

  if (slotIndex !== -1) {
    // Add item to inventory
    player.inventory[slotIndex] = type;

    // Clear tile visually and logically
// Removes a CSS class from an element
    tile.classList.remove("mined");
// Adds a CSS class to an element
    tile.classList.add("empty");
    tile.dataset.type = "empty";

    updateInventoryUI();
  }
}
// Adds a DOM event listener
document.addEventListener("keydown", (e) => {
  if (e.key === "e") {
// Declares constant tile
    const tile = getTile(player.x, player.y);
    if (tile) collectpMinedTile(tile);
  }
});
