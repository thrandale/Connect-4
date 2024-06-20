import { Player } from "./Board";

export default class Column {
  private _rows: (Player | null)[];
  constructor(numRows: number) {
    this._rows = [];

    // add the squares to the column
    this._rows = Array(numRows).fill(null);
  }

  onDrop(player: Player) {
    // if the column is clicked, drop a piece unless the column is full
    let row = this.getFirstEmptyRow();
    if (row === null) return;
    this._rows[row] = player;
  }

  getFirstEmptyRow(): number | null {
    for (let i = this._rows.length - 1; i >= 0; i--) {
      if (this._rows[i] === null) {
        return i;
      }
    }
    return null;
  }

  isFull(): boolean {
    if (this._rows[0] !== null) {
      return false;
    }
    return true;
  }

  reset(): void {
    // reset the column
    for (let i = 0; i < this._rows.length; i++) {
      this._rows[i] = null;
    }
  }

  get rows() {
    return this._rows;
  }
}
