
// the number of rows and columns in the board
const rows = 6;
const columns = 7;
let topBarHeight;

// the board
let board = [];

// player 1 is human, player 2 is ai
let player1 = "blue";
let player2 = "red";

// the current player
let currentPlayer;

// keeps track of the winner
let winner = "";

// the scores for the AI
let winScore = 100;
let centerColumnScore = 8;
let centerColumnHeight = 1.1;
let TwoBarScore = 3;
let ThreeBarScore = 4;
let TwoBarScoreBlock = 3;
let ThreeBarScoreBlock = 4;
let adjacentScore = 1;
let depthScore = 2;

// how many levels deep the ai should look
let depth = 3;

// the amount of variance in the score accepted by the ai
let tolerance = 1;

// enables the print statements
let debug = true;

// number of human players
let numPlayers = 1;

// the starting player
// 1 is human, 2 is AI
let startingPlayer = player1;

function setup() {
  // initialize the p5.js canvas
  topBarHeight = windowHeight / 10;
  createCanvas((windowHeight / rows) * columns - 25 - topBarHeight, windowHeight - 25);

  // add the columns to the board
  for (let i = 0; i < columns; i++) {
    board.push(new Column(i * width / columns));
  }

  // set the current player
  if (numPlayers != 0) {
    currentPlayer = startingPlayer;
  }
  else {
    currentPlayer = player1;
  }

  // if the ai starts, ai plays the first move
  if (startingPlayer == player2 && numPlayers == 1) {
    aiPlay(player2);
  }
}

function draw() {
  // set the background color
  background(220);

  // draw the board
  for (let i = 0; i < columns; i++) {
    board[i].draw();
  }

  // draw the winner
  if (winner != "") {
    textAlign(CENTER, CENTER);
    textSize(width / 6);
    fill(0, 186, 19);
    if (winner != "tie")
      text(winner.toUpperCase() + " Won!!", width / 2, height / 2);
    else
      text("It's a TIE!", width / 2, height / 2);
  }

  // draw the heading
  fill(66, 77, 82);
  rect(0, 0, width, topBarHeight);
  textAlign(CENTER, CENTER);
  textSize(width / 10);
  fill(154, 181, 160);
  text("Connect Four", width / 2, topBarHeight / 2);

  // draw settings bars
  let settingsWidth = width / 7 - width / 12
  let settingsHeight = topBarHeight / 8;
  for (let i = 1; i < 4; i++) {
    rect(width - width / 7 + width / 24, topBarHeight / 9 * i * 2, settingsWidth, settingsHeight, 10, 10);
  }
}


function mouseClicked() {
  if (numPlayers == 0) {
    // ai plays against itself
    while (winner == "") {
      aiPlay(player1);
      for (let i = 0; i < columns; i++) {
        board[i].draw();
      }
      aiPlay(player2);
    }
  } else if (numPlayers == 1) {
    // human plays
    if (mouseY > topBarHeight) {
      playerPlay();

      for (let i = 0; i < columns; i++) {
        board[i].draw();
      }

      // ai plays
      aiPlay(player2);
    }
  } else {
    // two human players
    playerPlay();
  }
}


let playerPlay = function () {
  if (winner == "") {
    for (let i = 0; i < columns; i++) {
      board[i].onClick();
    }
  }
}

let aiPlay = function (player) {
  // have the ai play keeping track of the time it takes
  if (currentPlayer == player && winner == "") {
    let startTime = millis();
    bestMove(player);
    let endTime = millis();
    let timeTaken = (endTime - startTime) / 1000;
    console.log("Time taken: " + round(timeTaken, 2) + "s\n\n");
  }
}


let checkWinner = function (lastDrop) {
  let playerCount = 0;

  // these are the minimum and maximum rows and columns that we have to check for the win condition
  let minCol = max(lastDrop.column - 3, 0);
  let maxCol = min(lastDrop.column + 3, board.length - 1);
  let minRow = max(lastDrop.row - 3, 0);
  let maxRow = min(lastDrop.row + 3, board[0].rows.length - 1);

  /**** For each win direction, just check the slice that the last piece dropped is in****/

  // Horizontal
  // loop through each possible starting column
  for (let i = minCol; i <= maxCol - 3; i++) {
    playerCount = 0;
    for (let j = 0; j <= 3; j++) {
      if (board[i + j].rows[lastDrop.row].player == board[lastDrop.column].rows[lastDrop.row].player)
        playerCount++;
    }
    if (playerCount >= 4)
      return board[lastDrop.column].rows[lastDrop.row].player;
  }


  // Vertical
  for (let i = minRow; i <= maxRow - 3; i++) {
    playerCount = 0;
    for (let j = 0; j <= 3; j++) {
      if (board[lastDrop.column].rows[i + j].player == board[lastDrop.column].rows[lastDrop.row].player)
        playerCount++;
    }
    if (playerCount >= 4)
      return board[lastDrop.column].rows[lastDrop.row].player;
  }

  // Backwards Slash
  let currentRow = (lastDrop.row - min(lastDrop.row - minRow, lastDrop.column - minCol));
  let currentCol = (lastDrop.column - min(lastDrop.row - minRow, lastDrop.column - minCol));
  if (currentCol <= 3 && currentRow <= 2) {
    while (currentRow <= maxRow - 3 && currentCol <= maxCol - 3) {
      playerCount = 0;
      for (let i = 0; i <= 3; i++) {
        if (board[currentCol + i].rows[currentRow + i].player == board[lastDrop.column].rows[lastDrop.row].player)
          playerCount++;
      }
      if (playerCount >= 4)
        return board[lastDrop.column].rows[lastDrop.row].player;
      currentRow++;
      currentCol++;
    }
  }

  // Forward Slash
  currentRow = (lastDrop.row - min(lastDrop.row - minRow, maxCol - lastDrop.column));
  currentCol = (lastDrop.column + min(lastDrop.row - minRow, maxCol - lastDrop.column));
  if (currentCol >= 3 && currentRow <= 2) {
    while (currentRow <= maxRow - 3 && currentCol >= minCol + 3) {
      playerCount = 0;
      for (let i = 0; i <= 3; i++) {
        if (board[currentCol - i].rows[currentRow + i].player == board[lastDrop.column].rows[lastDrop.row].player)
          playerCount++;
      }
      if (playerCount >= 4)
        return board[lastDrop.column].rows[lastDrop.row].player;
      currentRow++;
      currentCol--;
    }
  }

  // if it's a tie
  let available = 0;
  for (let i = 0; i < board.length; i++) {
    if (board[i].rows[0].player == "") {
      available++;
    }
  }
  if (available == 0)
    return "tie";

  // no winner
  return "";
}

