import Column from "./Column.js";
import AI from "./AI.js";

export default class Board {
  #columns;
  #currentPlayer;
  #ROWS;
  #COLUMNS;
  #startingPlayer = "blue";
  #numHumanPlayers = 1;
  #player1;
  #player2;
  #lastDrop;
  #winner;
  #AI;
  #difficulty = 2;

  constructor(ROWS, COLUMNS) {
    this.#columns = [];
    this.#currentPlayer;
    this.#ROWS = ROWS;
    this.#COLUMNS = COLUMNS;
    this.#player1 = "red";
    this.#player2 = "blue";
    this.#winner = null;
    this.#AI = new AI(this.#ROWS, this.#COLUMNS);
    this.#init();
  }

  #init() {
    for (let i = 0; i < this.#COLUMNS; i++) {
      this.#columns.push(new Column(i, this.#ROWS));
    }
    this.reset();
  }

  reset() {
    for (let i = 0; i < this.#COLUMNS; i++) {
      this.#columns[i].reset();
    }
    this.#currentPlayer = this.#startingPlayer;
    this.#winner = null;
    this.#AI.setDifficulty(this.#difficulty);
  }

  #drop(column) {
    this.#columns[column].onDrop(column, this.#currentPlayer);
    this.#lastDrop = {
      row: this.#columns[column].getRow() + 1,
      column: column,
    };
    this.#changePlayer();
  }

  drop(column) {
    this.#drop(column);
    this.#winner = this.checkWinner(column);
  }

  getBestMove() {
    let bestMove = this.#AI.bestMove(this, this.#currentPlayer);
    return bestMove;
  }

  #changePlayer() {
    this.#currentPlayer =
      this.#currentPlayer === this.#player1 ? this.#player2 : this.#player1;
    document.getElementById("piece");
  }

  isFull(column) {
    return this.#columns[column].isFull();
  }

  getRow(column) {
    return this.#columns[column].getRow();
  }

  checkWinner(column) {
    let playerCount = 0;
    for (let i = 0; i < this.#ROWS; i++) {
      if (this.#columns[column].rows[i]) {
        this.#lastDrop = { row: i, column: column };
        break;
      }
    }

    // these are the minimum and maximum rows and columns that we have to check for the win condition
    let minCol = Math.max(this.#lastDrop.column - 3, 0);
    let maxCol = Math.min(this.#lastDrop.column + 3, this.#columns.length - 1);
    let minRow = Math.max(this.#lastDrop.row - 3, 0);
    let maxRow = Math.min(
      this.#lastDrop.row + 3,
      this.#columns[0].rows.length - 1,
    );

    /**** For each win direction, just check the slice that the last piece dropped is in****/
    // Horizontal
    // loop through each possible starting column
    for (let i = minCol; i <= maxCol - 3; i++) {
      playerCount = 0;
      for (let j = 0; j <= 3; j++) {
        if (
          this.#columns[i + j].rows[this.#lastDrop.row] ===
          this.#columns[this.#lastDrop.column].rows[this.#lastDrop.row]
        )
          playerCount++;
      }
      if (playerCount >= 4)
        return this.#columns[this.#lastDrop.column].rows[this.#lastDrop.row];
    }

    // Vertical
    for (let i = minRow; i <= maxRow - 3; i++) {
      playerCount = 0;
      for (let j = 0; j <= 3; j++) {
        if (
          this.#columns[this.#lastDrop.column].rows[i + j] ===
          this.#columns[this.#lastDrop.column].rows[this.#lastDrop.row]
        )
          playerCount++;
      }
      if (playerCount >= 4)
        return this.#columns[this.#lastDrop.column].rows[this.#lastDrop.row];
    }

    // Forward Slash
    let currentRow =
      this.#lastDrop.row -
      Math.min(this.#lastDrop.row - minRow, this.#lastDrop.column - minCol);
    let currentCol =
      this.#lastDrop.column -
      Math.min(this.#lastDrop.row - minRow, this.#lastDrop.column - minCol);
    if (currentCol <= 3 && currentRow <= 2) {
      while (currentRow <= maxRow - 3 && currentCol <= maxCol - 3) {
        playerCount = 0;
        for (let i = 0; i <= 3; i++) {
          if (
            this.#columns[currentCol + i].rows[currentRow + i] ===
            this.#columns[this.#lastDrop.column].rows[this.#lastDrop.row]
          )
            playerCount++;
        }
        if (playerCount >= 4)
          return this.#columns[this.#lastDrop.column].rows[this.#lastDrop.row];
        currentRow++;
        currentCol++;
      }
    }

    // Backwards Slash
    currentRow =
      this.#lastDrop.row -
      Math.min(this.#lastDrop.row - minRow, maxCol - this.#lastDrop.column);
    currentCol =
      this.#lastDrop.column +
      Math.min(this.#lastDrop.row - minRow, maxCol - this.#lastDrop.column);
    if (currentCol >= 3 && currentRow <= 2) {
      while (currentRow <= maxRow - 3 && currentCol >= minCol + 3) {
        playerCount = 0;
        for (let i = 0; i <= 3; i++) {
          if (
            this.#columns[currentCol - i].rows[currentRow + i] ===
            this.#columns[this.#lastDrop.column].rows[this.#lastDrop.row]
          )
            playerCount++;
        }
        if (playerCount >= 4)
          return this.#columns[this.#lastDrop.column].rows[this.#lastDrop.row];
        currentRow++;
        currentCol--;
      }
    }

    // if it's a tie
    let available = 0;
    for (let i = 0; i < this.#columns.length; i++) {
      if (this.#columns[i].rows[0] === null) {
        available++;
      }
    }

    if (available === 0) return "tie";

    // no winner
    return null;
  }

  get currentPlayer() {
    return this.#currentPlayer;
  }

  get numHumanPlayers() {
    return this.#numHumanPlayers;
  }

  get winner() {
    return this.#winner;
  }

  get columns() {
    return this.#columns;
  }

  get startingPlayer() {
    return this.#startingPlayer;
  }

  set startingPlayer(player) {
    this.#startingPlayer = player;
  }

  set numHumanPlayers(num) {
    this.#numHumanPlayers = num;
  }

  get difficulty() {
    return this.#difficulty;
  }

  set difficulty(difficulty) {
    this.#difficulty = difficulty;
  }
}
