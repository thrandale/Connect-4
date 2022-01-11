/* 
Represents one square on the connect 4 board.
*/

let Square = function (x, y) {
    this.x = x;
    this.y = y;
    this.player = "";
    this.size = width / columns;
}

Square.prototype.draw = function () {
    fill(100);
    stroke(0);
    rect(this.x, this.y, this.size, this.size);

    // set the color based on the player
    switch (this.player) {
        case player1:
            fill(37, 28, 140);
            break;
        case player2:
            fill(153, 20, 20);
            break;
        default:
            fill(255);
            break;
    }
    circle(this.x + this.size / 2, this.y + this.size / 2, this.size - this.size * .3);
}