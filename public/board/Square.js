/* 
Represents one square on the connect 4 board.
*/

class Square {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.player = "";
        this.size = width / COLUMNS;
    }
    
    draw() {
        fill(COLOR_GRAY);

        stroke(COLOR_BACKGROUND);
        strokeWeight(5);
        rect(this.x, this.y, this.size, this.size);

        // set the color based on the player
        switch (this.player) {
            case player1:
                fill(33, 26, 115);
                break;
            case player2:
                fill(130, 31, 31);
                break;
            default:
                fill(COLOR_HIGHLIGHT);
                break;
        }
        circle(this.x + this.size / 2, this.y + this.size / 2, this.size - this.size * .3);
    }
}

