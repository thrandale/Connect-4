import AI from "./AI.js";
import Column from "./Column.js";

export type Player = "red" | "blue";
export type Drop = { row: number; column: number; player?: Player };
type Winner = Player | "tie";

export default class Board {
  private _columns: Column[];
  private _numRows;
  private _numColumns;
  private _startingPlayer: Player = "blue";
  private _currentPlayer: Player = this._startingPlayer;
  private _bluePlayerAI: boolean = false;
  private _redPlayerAI: boolean = false;
  private _player1: Player;
  private _player2: Player;
  private _lastDrop: Drop | null = null;
  private _winner: Winner | null;
  private _AI: AI;
  private _difficulty: number = 2;

  constructor(numRows: number, numColumns: number) {
    this._columns = [];
    this._numRows = numRows;
    this._numColumns = numColumns;
    this._player1 = "red";
    this._player2 = "blue";
    this._winner = null;
    this._AI = new AI(this._numColumns);
    this._init();
  }

  _init() {
    for (let i = 0; i < this._numColumns; i++) {
      this._columns.push(new Column(this._numRows));
    }
    this.reset();
  }

  reset(): void {
    for (let i = 0; i < this._numColumns; i++) {
      this._columns[i].reset();
    }
    this._currentPlayer = this._startingPlayer;
    this._winner = null;
    this._AI.setDifficulty(this._difficulty);
  }

  _drop(column: number): void {
    this._columns[column].onDrop(this._currentPlayer);
    let row = this._columns[column].getFirstEmptyRow();
    if (row === null) return;
    this._lastDrop = { row: row + 1, column: column };
    this._changePlayer();
  }

  drop(column: number): void {
    this._drop(column);
    this._winner = this.checkWinner(column);
  }

  getBestMove() {
    let bestMove = this._AI.bestMove(this, this._currentPlayer);
    return bestMove;
  }

  _changePlayer() {
    this._currentPlayer =
      this._currentPlayer === this._player1 ? this._player2 : this._player1;
    document.getElementById("piece");
  }

  isFull(column: number): boolean {
    return this._columns[column].isFull();
  }

  getFirstEmptyRow(column: number): number | null {
    return this._columns[column].getFirstEmptyRow();
  }

  checkWinner(column: number): Winner | null {
    let playerCount = 0;
    for (let i = 0; i < this._numRows; i++) {
      if (this._columns[column].rows[i]) {
        this._lastDrop = { row: i, column: column };
        break;
      }
    }

    if (this._lastDrop === null) return null;

    // these are the minimum and maximum rows and columns that we have to check for the win condition
    let minCol = Math.max(this._lastDrop.column - 3, 0);
    let maxCol = Math.min(this._lastDrop.column + 3, this._columns.length - 1);
    let minRow = Math.max(this._lastDrop.row - 3, 0);
    let maxRow = Math.min(
      this._lastDrop.row + 3,
      this._columns[0].rows.length - 1,
    );

    /**** For each win direction, just check the slice that the last piece dropped is in****/
    // Horizontal
    // loop through each possible starting column
    for (let i = minCol; i <= maxCol - 3; i++) {
      playerCount = 0;
      for (let j = 0; j <= 3; j++) {
        if (
          this._columns[i + j].rows[this._lastDrop.row] ===
          this._columns[this._lastDrop.column].rows[this._lastDrop.row]
        )
          playerCount++;
      }
      if (playerCount >= 4)
        return this._columns[this._lastDrop.column].rows[this._lastDrop.row];
    }

    // Vertical
    for (let i = minRow; i <= maxRow - 3; i++) {
      playerCount = 0;
      for (let j = 0; j <= 3; j++) {
        if (
          this._columns[this._lastDrop.column].rows[i + j] ===
          this._columns[this._lastDrop.column].rows[this._lastDrop.row]
        )
          playerCount++;
      }
      if (playerCount >= 4)
        return this._columns[this._lastDrop.column].rows[this._lastDrop.row];
    }

    // Forward Slash
    let currentRow =
      this._lastDrop.row -
      Math.min(this._lastDrop.row - minRow, this._lastDrop.column - minCol);
    let currentCol =
      this._lastDrop.column -
      Math.min(this._lastDrop.row - minRow, this._lastDrop.column - minCol);
    if (currentCol <= 3 && currentRow <= 2) {
      while (currentRow <= maxRow - 3 && currentCol <= maxCol - 3) {
        playerCount = 0;
        for (let i = 0; i <= 3; i++) {
          if (
            this._columns[currentCol + i].rows[currentRow + i] ===
            this._columns[this._lastDrop.column].rows[this._lastDrop.row]
          )
            playerCount++;
        }
        if (playerCount >= 4)
          return this._columns[this._lastDrop.column].rows[this._lastDrop.row];
        currentRow++;
        currentCol++;
      }
    }

    // Backwards Slash
    currentRow =
      this._lastDrop.row -
      Math.min(this._lastDrop.row - minRow, maxCol - this._lastDrop.column);
    currentCol =
      this._lastDrop.column +
      Math.min(this._lastDrop.row - minRow, maxCol - this._lastDrop.column);
    if (currentCol >= 3 && currentRow <= 2) {
      while (currentRow <= maxRow - 3 && currentCol >= minCol + 3) {
        playerCount = 0;
        for (let i = 0; i <= 3; i++) {
          if (
            this._columns[currentCol - i].rows[currentRow + i] ===
            this._columns[this._lastDrop.column].rows[this._lastDrop.row]
          )
            playerCount++;
        }
        if (playerCount >= 4)
          return this._columns[this._lastDrop.column].rows[this._lastDrop.row];
        currentRow++;
        currentCol--;
      }
    }

    // if it's a tie
    let available = 0;
    for (let i = 0; i < this._columns.length; i++) {
      if (this._columns[i].rows[0] === null) {
        available++;
      }
    }

    if (available === 0) return "tie";

    // no winner
    return null;
  }

  get currentPlayer() {
    return this._currentPlayer;
  }

  get numHumanPlayers() {
    return [this._bluePlayerAI, this._redPlayerAI].filter((x) => !x).length;
  }

  get winner() {
    return this._winner;
  }

  get columns() {
    return this._columns;
  }

  get startingPlayer() {
    return this._startingPlayer;
  }

  set startingPlayer(player) {
    this._startingPlayer = player;
  }

  set bluePlayerAI(isAI: boolean) {
    this._bluePlayerAI = isAI;
  }

  set redPlayerAI(isAI: boolean) {
    this._redPlayerAI = isAI;
  }

  get difficulty() {
    return this._difficulty;
  }

  set difficulty(difficulty) {
    this._difficulty = difficulty;
  }

  get AI() {
    return this._AI;
  }
}
