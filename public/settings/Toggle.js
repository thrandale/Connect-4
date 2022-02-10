class Toggle {
    constructor(x, y, width, height, leftArg, rightArg, label, position) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.left = leftArg;
        this.right = rightArg;
        this.label = label;
        this.position = position;
        this.togglePos = position == 0 ? this.x : this.x + this.width / 2;
    }

    draw() {

        // draw background
        fill(COLOR_HIGHLIGHT);
        stroke(COLOR_GRAY);
        strokeWeight(5);
        rect(this.x, this.y, this.width, this.height, 10, 10);

        // draw text
        noStroke();
        fill(COLOR_BACKGROUND);
        textAlign(CENTER, CENTER);
        textSize(this.height / 2.8);
        text(this.left, this.x + this.width / 4, this.y + this.height / 2);
        text(this.right, this.x + this.width * 3 / 4, this.y + this.height / 2);

        // draw toggle
        fill(COLOR_GRAY);
        // stroke(COLOR_HIGHLIGHT);
        // strokeWeight(2.5);
        rect(this.togglePos, this.y, this.width / 2, this.height, 10, 10);

        // draw label
        noStroke();
        fill(COLOR_HIGHLIGHT);
        textAlign(RIGHT, CENTER);
        textSize(this.height / 1.8);
        text(this.label, this.x - this.width / 10, this.y + this.height / 2);

    }

    swap() {
        // animate the toggle
        let toggleSpeed = this.width / 10;
        if (this.position == 0) {
            this.position = 1;
            this.togglePos = this.x + this.width / 2;
        } else {
            this.position = 0;
            this.togglePos = this.x;
        }
    }

    contains(x, y) {
        return (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height);
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        this.togglePos = this.position == 0 ? this.x : this.x + this.width / 2;
    }
}




