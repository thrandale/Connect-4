/*
A Column of the board made up of squares
*/

let Column = function (x) {
    this.x = x;
    this.rows = [];
    this.size = width / columns;

    // add the squares to the column
    for (let i = 0; i < rows; i++) {
        this.rows.push(new Square(this.x, (i * (height - topBarHeight) / rows) + topBarHeight));
    }
}

Column.prototype.draw = function () {
    // draw squares
    for (let i = 0; i < this.rows.length; i++) {
        this.rows[i].draw();
    }
}

Column.prototype.onClick = function () {
    // if the column is clicked, drop a piece unless the column is full
    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > 0 && mouseY < height && this.rows[0].player == "") {
        for (let i = this.rows.length - 1; i >= 0; i--) {
            if (this.rows[i].player == "") {
                this.rows[i].player = currentPlayer;
                let currentDrop = new Drop(floor(this.x / width * columns), i);
                if (checkWinner(currentDrop) != "")
                    winner = checkWinner(currentDrop);

                if (currentPlayer == player1)
                    currentPlayer = player2;
                else
                    currentPlayer = player1;
                break;
            }
        }
    }

}