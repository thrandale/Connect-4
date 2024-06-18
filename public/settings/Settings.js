class Settings {
  constructor(xIn, yIn, widthIn, heightIn) {
    this.x = xIn;
    this.y = yIn;
    this.width = widthIn;
    this.height = heightIn;
    this.t1 = new Toggle(
      this.x + this.width / 2,
      this.y + this.height / 13,
      (this.width / 8) * 3,
      this.height / (13 / 2),
      "Human",
      "AI",
      "Blue",
      1,
    );
    this.t2 = new Toggle(
      this.x + this.width / 2,
      this.y + (this.height / 13) * 4,
      (this.width / 8) * 3,
      this.height / (13 / 2),
      "Human",
      "AI",
      "Red",
      0,
    );
    this.startToggle = new Toggle(
      this.x + this.width / 2,
      this.y + (this.height / 13) * 7,
      (this.width / 8) * 3,
      this.height / (13 / 2),
      "Blue",
      "Red",
      "Start",
      1,
    );
    this.resetW = (this.width / 8) * 3;
    this.resetH = this.height / (13 / 2);
    this.resetX = this.x + this.width / 2 - ((this.width / 8) * 3) / 2;
    this.resetY = this.y + (this.height / 13) * 10;
    this.reviewW = this.width / 2;
    this.reviewH = this.height / 5;
    this.reviewX = width - this.reviewW - width / 20;
    this.reviewY = height - this.reviewH - height / 20;
  }

  draw() {
    // draw reveal button
    if (currentScene == "win") {
      background(COLOR_BACKGROUND);
      textAlign(CENTER, CENTER);
      noStroke();
      fill(COLOR_HIGHLIGHT);
      textSize(width / 10);
      text(
        winner == "tie"
          ? "It's a tie!"
          : (winner == "red" ? "Red" : "Blue") + " player wins!",
        width / 2,
        height / 8,
      );

      fill(COLOR_HIGHLIGHT);
      stroke(COLOR_GRAY);
      strokeWeight(5);
      rect(this.reviewX, this.reviewY, this.reviewW, this.reviewH, 10, 10);

      fill(COLOR_BACKGROUND);
      textSize(this.reviewH / 2.83);
      noStroke();
      text(
        "Hold to review\nlast game",
        this.reviewX + this.reviewW / 2,
        this.reviewY + this.reviewH / 2,
      );
    }

    fill(COLOR_BACKGROUND);
    strokeWeight(5);
    stroke(COLOR_HIGHLIGHT);
    if (currentScene == "win") {
      noStroke();
    }

    rect(this.x, this.y, this.width, this.height, 10, 10);

    this.t1.draw();
    this.t2.draw();
    this.startToggle.draw();

    // draw reset button
    // stroke(0);
    fill(COLOR_HIGHLIGHT);
    stroke(COLOR_GRAY);
    strokeWeight(5);
    rect(this.resetX, this.resetY, this.resetW, this.resetH, 10, 10);

    noStroke();
    fill(COLOR_BACKGROUND);
    textAlign(CENTER, CENTER);
    textSize(this.resetH / 2.1);
    text(
      "New Game",
      this.resetX + this.resetW / 2,
      this.resetY + this.resetH / 2,
    );
  }

  onClick() {
    if (this.t1.contains(mouseX, mouseY)) {
      this.t1.swap();
    } else if (this.t2.contains(mouseX, mouseY)) {
      this.t2.swap();
    } else if (this.startToggle.contains(mouseX, mouseY)) {
      this.startToggle.swap();
    } else if (
      mouseX > this.resetX &&
      mouseX < this.resetX + this.resetW &&
      mouseY > this.resetY &&
      mouseY < this.resetY + this.resetH
    ) {
      board.reset();
      if (currentScene == "win") {
        this.setPos(width / 2, topBarHeight, width / 2, height / 2);
      }
      currentScene = "play";
    }
  }

  contains(x, y) {
    return (
      x > this.x &&
      x < this.x + this.width &&
      y > this.y &&
      y < this.y + this.height
    );
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
    this.t1.setPos(this.x + this.width / 2, this.y + this.height / 13);
    this.t2.setPos(this.x + this.width / 2, this.y + (this.height / 13) * 4);
    this.startToggle.setPos(
      this.x + this.width / 2,
      this.y + (this.height / 13) * 7,
    );
    this.resetX = this.x + this.width / 2 - ((this.width / 8) * 3) / 2;
    this.resetY = this.y + (this.height / 13) * 10;
  }
}
