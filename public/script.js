import Board from "./board/Board.js";

// const gameBoard = document.getElementById('game-board');
const squares = document.getElementById("squares");
const pieces = document.getElementById("pieces");
const ROWS = 6;
const COLUMNS = 7;
const board = new Board(ROWS, COLUMNS);
const playerPiece = document.createElement("div");
const settingsButton = document.getElementById("settings-button");
const settingsMenu = document.getElementById("settings-menu");
const newGameButton = document.getElementById("new-game");
let abortController = null;

init();

function init() {
  createBoard();
  createPlayerPiece();
  activateSettingsButton();
  activateNewGameButton();
  reset();
}

function activateSettingsButton() {
  settingsButton.addEventListener("click", () => {
    settingsMenu.classList.toggle("hidden");
    if (!settingsMenu.classList.contains("hidden")) {
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
      document.removeEventListener("mousemove", handleMove);
    } else {
      play();
    }
  });
}

function activateNewGameButton() {
  newGameButton.addEventListener("click", () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    settingsMenu.classList.add("hidden");
    reset();
  });
}

async function play() {
  if (board.numHumanPlayers === 1) {
    document.addEventListener("mousemove", handleMove);
    abortController = new AbortController();

    try {
      await playerPlay(abortController.signal);
    } catch (e) {
      if (e.message === "Invalid drop") {
        return play();
      } else {
        return;
      }
    }
    if (board.winner) {
      await showWinner();
      return reset();
    }
    await aiPlay();
    if (board.winner) {
      await showWinner();
      return reset();
    }
    play();
  } else if (board.numHumanPlayers === 2) {
    document.addEventListener("mousemove", handleMove);
    abortController = new AbortController();

    try {
      await playerPlay(abortController.signal);
    } catch (e) {
      if (e.message === "Invalid drop") {
        return play();
      } else {
        return;
      }
    }
    if (board.winner) {
      await showWinner();
      return reset();
    }
    play();
  } else {
    abortController = new AbortController();
    try {
      await aiPlay(abortController.signal);
    } catch (e) {
      return reset();
    }
    if (board.winner) {
      await showWinner();
      return reset();
    }
    play();
  }
}

async function showWinner() {
  alert(`${board.winner} wins!`);
}

function createBoard() {
  for (let i = 0; i < ROWS * COLUMNS; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.setAttribute("data-column", i % COLUMNS);

    if (i % COLUMNS === 0) {
      square.classList.add("left");
    }
    if (i % COLUMNS === COLUMNS - 1) {
      square.classList.add("right");
    }
    if (i < COLUMNS) {
      square.classList.add("top");
    }
    if (i >= COLUMNS * (ROWS - 1)) {
      square.classList.add("bottom");
    }
    squares.append(square);
  }
}

function createPlayerPiece() {
  playerPiece.classList.add("piece");
  playerPiece.classList.add("player-piece");
  playerPiece.style.setProperty("--x", 0);
  playerPiece.style.setProperty("--y", -1);
  playerPiece.setAttribute("data-color", board.startingPlayer);
  playerPiece.hidden = true;
  pieces.append(playerPiece);
}

function addPiece(x, y, player) {
  let piece = document.createElement("div");
  piece.classList.add("piece");
  piece.style.setProperty("--x", x);
  piece.style.setProperty("--y", y);
  piece.setAttribute("data-color", player);
  pieces.append(piece);

  return new Promise((resolve) => {
    piece.addEventListener("animationend", resolve, { once: true });
  });
}

async function playerPlay(abortSignal) {
  return new Promise(async (resolve, reject) => {
    squares.addEventListener(
      "click",
      async (e) => {
        try {
          await handleClick(e, abortSignal);
        } catch (e) {
          return reject(e);
        }

        resolve();
      },
      { once: true },
    );
  });
}

async function aiPlay(abortSignal) {
  return new Promise(async (resolve, reject) => {
    if (abortSignal) {
      if (abortSignal.aborted) {
        return reject();
      }
    }
    const move = board.getBestMove();
    await dropPiece(move, board.currentPlayer);
    board.drop(move);
    switchPlayer();
    resolve();
  });
}

function handleMove(e) {
  const square = e.target.closest(".square");
  if (!square) {
    playerPiece.hidden = true;
    return;
  }
  playerPiece.hidden = false;
  const column = square.getAttribute("data-column");
  playerPiece.style.setProperty("--x", column);
  playerPiece.style.transform = `translateX(calc(${column} * (var(--board-size) / 7) + var(--board-size) / 7 / 2 - var(--size) / 2 - var(--border-size) / 4 * var(--x)))`;
}

async function handleClick(e, abortSignal) {
  return new Promise(async (resolve, reject) => {
    if (abortSignal.aborted) {
      return reject(e);
    }

    const square = e.target.closest(".square");
    if (!square) return reject(new Error("Invalid drop"));

    const player = board.currentPlayer;
    const column = parseInt(square.getAttribute("data-column"));

    try {
      await dropPiece(column, player);
    } catch (e) {
      return reject(e);
    }

    board.drop(column);
    switchPlayer();
    resolve();
  });
}

function switchPlayer() {
  playerPiece.setAttribute("data-color", board.currentPlayer);
}

function dropPiece(column, player) {
  return new Promise(async (resolve, reject) => {
    const row = board.getRow(column);
    if (row === null) return reject(new Error("Invalid drop"));

    playerPiece.hidden = true;
    document.removeEventListener("mousemove", handleMove);
    await addPiece(column, row, player);
    resolve();
  });
}

async function reset() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }

  let currentPieces = document.getElementsByClassName("piece");
  for (let i = currentPieces.length - 1; i >= 1; i--) {
    currentPieces[i].remove();
  }

  let blueHuman = document.getElementById("blueHuman").checked;
  let redHuman = document.getElementById("redHuman").checked;
  board.numHumanPlayers =
    blueHuman || redHuman ? (blueHuman && redHuman ? 2 : 1) : 0;
  board.startingPlayer = document.getElementById("startBlue").checked
    ? "blue"
    : "red";
  board.difficulty = document.getElementById("diff0").checked
    ? 0
    : document.getElementById("diff1").checked
      ? 1
      : 2;

  playerPiece.setAttribute("data-color", playerStarts());
  board.reset();

  if (aiStarts()) {
    await aiPlay();
  }
  play();
}

function playerStarts() {
  return document.getElementById("blueHuman").checked ||
    document.getElementById("redHuman").checked
    ? board.startingPlayer
    : board.startingPlayer === "blue"
      ? "red"
      : "blue";
}

function aiStarts() {
  return (
    (document.getElementById("blueAI").checked &&
      document.getElementById("startBlue").checked) ||
    (document.getElementById("redAI").checked &&
      document.getElementById("startRed").checked)
  );
}
