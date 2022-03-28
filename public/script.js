import Board from './board/Board.js';

// const gameBoard = document.getElementById('game-board');
const squares = document.getElementById('squares');
const pieces = document.getElementById('pieces');
const ROWS = 6;
const COLUMNS = 7;
const board = new Board(ROWS, COLUMNS, "blue");
const playerPiece = document.createElement('div');
let numHumanPlayers = 1;

init();

function init() {
    createBoard();
    createPlayerPiece();
    play();
}

async function play() {
    if (numHumanPlayers === 1) {
        await playerPlay();
        aiPlay();
    } else if (numHumanPlayers === 2) {
        await playerPlay();
        play();
    } else {
        aiPlay();
    }
}

function createBoard() {
    for (let i = 0; i < ROWS * COLUMNS; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.setAttribute('data-column', i % COLUMNS);

        if (i % COLUMNS === 0) {
            square.classList.add('left');
        }
        if (i % COLUMNS === COLUMNS - 1) {
            square.classList.add('right');
        }
        if (i < COLUMNS) {
            square.classList.add('top');
        } if (i >= COLUMNS * (ROWS - 1)) {
            square.classList.add('bottom');
        }

        const squareInner = document.createElement('div');
        squareInner.classList.add('square-inner');
        squareInner.setAttribute('data-column', i % COLUMNS);
        square.append(squareInner);
        squares.append(square);
    }
}

function createPlayerPiece() {
    playerPiece.classList.add('piece');
    playerPiece.classList.add('player-piece');
    playerPiece.style.setProperty('--x', 0);
    playerPiece.style.setProperty('--y', -1);
    playerPiece.setAttribute("data-color", board.startingPlayer);
    playerPiece.hidden = true;
    pieces.append(playerPiece);
}

function addPiece(x, y, player) {
    let piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.setProperty('--x', x);
    piece.style.setProperty('--y', y);
    piece.setAttribute("data-color", player);
    pieces.append(piece);

    return new Promise(resolve => {
        piece.addEventListener("animationend", resolve, { once: true });
    });
}

async function playerPlay() {
    document.addEventListener('mousemove', handleMove);
    return new Promise(resolve => {
        document.addEventListener('click', async function (e) {
            try {
                await handleClick(e);
                resolve();
            } catch (e) {
                play();
            }
        }, { once: true });
    });
}

async function aiPlay() {
    const move = board.getBestMove();
    await dropPiece(move, board.currentPlayer);
    board.drop(move);
    switchPlayer();
    play();
}

function handleMove(e) {
    const square = e.target.closest('.square');
    if (!square) {
        playerPiece.hidden = true;
        return;
    }
    playerPiece.hidden = false;
    const column = square.getAttribute('data-column');
    playerPiece.style.setProperty('--x', column);
    playerPiece.style.transform = `translateX(calc(${column} * (var(--board-size) / 7) + var(--board-size) / 7 / 2 - var(--size) / 2 - var(--border-size) / 4 * var(--x)))`;
}

async function handleClick(e) {
    const square = e.target.closest('.square') || e.target.closest('.square-inner');
    if (!square) return new Promise((resolve, reject) => reject());

    const column = parseInt(square.getAttribute('data-column'));
    const player = board.currentPlayer;

    try {
        await dropPiece(column, player);
    } catch (e) {
        return new Promise((resolve, reject) => reject());
    }
    board.drop(column);
    switchPlayer();
    return new Promise(resolve => resolve());
}

function switchPlayer() {
    playerPiece.setAttribute("data-color", board.currentPlayer);
}

function dropPiece(column, player) {
    const row = board.getRow(column);
    if (row === null) return new Promise((resolve, reject) => reject());
    playerPiece.hidden = true;
    document.removeEventListener('mousemove', handleMove);
    return addPiece(column, row, player);
}
