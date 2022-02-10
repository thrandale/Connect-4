/*
A Column of the board made up of squares
*/

class Column {
    constructor(x) {
        this.x = x;
        this.rows = [];
        this.size = width / COLUMNS;

        // add the squares to the column
        for (let i = 0; i < ROWS; i++) {
            this.rows.push(new Square(this.x, (i * (height - topBarHeight) / ROWS) + topBarHeight));
        }
    }

    draw() {
        // draw squares
        for (let i = 0; i < this.rows.length; i++) {
            this.rows[i].draw();
        }
    }

    onClick() {
        // if the column is clicked, drop a piece unless the column is full
        for (let i = this.rows.length - 1; i >= 0; i--) {
            if (this.rows[i].player == "") {
                this.rows[i].player = board.currentPlayer;
                let currentDrop = new Drop(floor(this.x / width * COLUMNS), i);
                winner = board.checkWinner(currentDrop);
                break;
            }
        }
    }

    reset() {
        // reset the column
        for (let i = 0; i < this.rows.length; i++) {
            this.rows[i].player = "";
        }
    }
}



