/*
A Column of the board made up of squares
*/

export default class Column {
    #x
    #rows
    #ROWS
    constructor(x, rows) {
        this.#x = x;
        this.#rows = [];
        this.#ROWS = rows;

        // add the squares to the column
        for (let i = 0; i < this.#ROWS; i++) {
            this.#rows.push(null);
        }
    }

    onDrop(column, player) {
        // if the column is clicked, drop a piece unless the column is full
        let row = this.getRow();
        if (row === null) return;
        this.#rows[row] = player;
        let currentDrop = { row: row, column: column };
    }

    getRow() {
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



