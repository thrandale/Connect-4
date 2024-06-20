import AI from "./AI.js";
import Column from "./Column.js";

export type Player = "red" | "blue";
export type Drop = { row: number; column: number; player?: Player };
type Winner = Player | "tie";

type Bitboards = {
  [player in Player]: bigint;
};

export default class Board {
  private _columns: Column[];
  private _numRows;
  private _numColumns;
  private _startingPlayer: Player = "blue";
  private _currentPlayer: Player = this._startingPlayer;
  private _bluePlayerAI: boolean = false;
  private _redPlayerAI: boolean = true;
  private _player1: Player;
  private _player2: Player;
  private _winner: Winner | null;
  private _AI: AI;
  private _difficulty: number = 2;

  private _bitboards: Bitboards = {
    red: 0n,
    blue: 0n,
  };
  private _bitboardHeights: number[] = [];
  private _bitboardNumRows: number;
  private _bitboardNumColumns: number;

  constructor(numRows: number, numColumns: number) {
    this._columns = [];
    this._numRows = numRows;
    this._numColumns = numColumns;
    this._bitboardNumRows = numRows + 1;
    this._bitboardNumColumns = numColumns + 2;
    this._player1 = "red";
    this._player2 = "blue";
    this._winner = null;
    this._AI = new AI(this._numColumns);
    for (let i = 0; i < numColumns; i++) {
      this._columns.push(new Column(numRows));
      this._bitboardHeights.push(i * numColumns);
    }
    this.reset();
  }

  makeMoveBitboard(column: number, player: Player) {
    let move: bigint = 1n << BigInt(this._bitboardHeights[column]++);
    this._bitboards[player] ^= move;
    // this._printBitboards();
  }

  unmakeMoveBitboard(column: number, player: Player) {
    let move: bigint = 1n << BigInt(--this._bitboardHeights[column]);
    this._bitboards[player] ^= move;
    // this._printBitboards();
  }

  _printBitboards() {
    let mask = 1n;
    let rows = Array(this._bitboardNumRows).fill("");
    for (let i = 0; i < this._bitboardNumRows * this._bitboardNumColumns; i++) {
      let row = i % (this._numRows + 1);
      if (this._bitboards.blue & mask) {
        rows[row] += "O ";
      } else if (this._bitboards.red & mask) {
        rows[row] += "X ";
      } else {
        rows[row] += ". ";
      }
      mask <<= 1n;
    }

    rows = rows
      .reverse()
      .slice(1)
      .map((row) => "| " + row.slice(0, -4) + "|");
    rows.push("|" + "-".repeat(this._bitboardNumRows * 2 + 1) + "|");
    rows.push("| 0 1 2 3 4 5 6 |\n\n");
    console.log(rows.join("\n"));
  }

  reset(): void {
    this._bitboards.red = 0n;
    this._bitboards.blue = 0n;
    for (let i = 0; i < this._numColumns; i++) {
      this._columns[i].reset();
      this._bitboardHeights[i] = i * this._numColumns;
    }
    this._currentPlayer = this._startingPlayer;
    this._winner = null;
    this._AI.setDifficulty(this._difficulty);
  }

  _drop(column: number): void {
    this.makeMoveBitboard(column, this._currentPlayer);

    this._columns[column].onDrop(this._currentPlayer);
    let row = this._columns[column].getFirstEmptyRow();
    if (row === null) return;
    this._changePlayer();
  }

  drop(column: number): void {
    this._drop(column);
    this._winner = this.checkWinner();
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

  checkWinner(): Winner | null {
    let redWin = this.checkBitboardWinner(this._bitboards.red);
    let blueWin = this.checkBitboardWinner(this._bitboards.blue);
    if (redWin && blueWin) {
      return "tie";
    } else if (redWin) {
      return "red";
    } else if (blueWin) {
      return "blue";
    } else {
      return null;
    }
  }

  checkBitboardWinner(bitboard: bigint): boolean {
    // 1 = vertical
    // 7 = horizontal
    // 6 = diagonal \
    // 8 = diagonal /
    let directions = [1n, 7n, 6n, 8n];
    for (let direction of directions) {
      let shifted = bitboard & (bitboard >> direction);
      if ((shifted & (shifted >> (direction * 2n))) !== 0n) {
        return true;
      }
    }

    return false;
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

  get bluePlayerAI() {
    return this._bluePlayerAI;
  }

  get redPlayerAI() {
    return this._redPlayerAI;
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
