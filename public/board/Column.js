/*
A Column of the board made up of squares
*/

export default class Column {
  #rows;
  constructor(numRows) {
    this.#rows = [];

    // add the squares to the column
    this.#rows = Array(numRows).fill(null);
  }

  onDrop(player) {
    // if the column is clicked, drop a piece unless the column is full
    let row = this.getFirstEmptyRow();
    if (row === null) return;
    this.#rows[row] = player;
  }

  getFirstEmptyRow() {
    for (let i = this.#rows.length - 1; i >= 0; i--) {
      if (this.#rows[i] === null) {
        return i;
      }
    }
    return null;
  }

  isFull() {
    if (this.#rows[0] !== null) {
      return false;
    }
    return true;
  }

  reset() {
    // reset the column
    for (let i = 0; i < this.#rows.length; i++) {
      this.#rows[i] = null;
    }
  }

  get rows() {
    return this.#rows;
  }
}
