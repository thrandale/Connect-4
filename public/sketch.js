
// the number of rows and columns in the board
const ROWS = 6;
const COLUMNS = 7;

let COLOR_BACKGROUND;
let COLOR_HIGHLIGHT;
let COLOR_GRAY;

let topBarHeight;
let currentScene = "play";
let board;
let settingsMenu;
let player1 = "blue";
let player2 = "red";
let winner = "";
let numHumanPlayers;
let startingPlayer;
let debug = false;
let reviewing = false;

function setup() {
  COLOR_BACKGROUND = color(66, 77, 82);
  COLOR_HIGHLIGHT = color(134, 156, 139);
  COLOR_GRAY = color(105);

  topBarHeight = windowHeight / 10;
  createCanvas((windowHeight / ROWS) * COLUMNS - 25 - topBarHeight, windowHeight - 25);
  settingsMenu = new Settings(width / 2, topBarHeight, width / 2, height / 2);
  board = new Board();
}

function draw() {
  background(255);

  // draw the board
  board.draw();

  // draw the heading
  strokeWeight(1);
  fill(COLOR_BACKGROUND);
  rect(0, 0, width, topBarHeight);
  noStroke()
  textAlign(CENTER, CENTER);
  textSize(width / 10);
  fill(COLOR_HIGHLIGHT);
  text("Connect Four", width / 2, topBarHeight / 2 + topBarHeight / 15);
  strokeWeight(5);
  stroke(COLOR_HIGHLIGHT);
  line(0, topBarHeight, width, topBarHeight);

  // draw settings bars
  let settingsWidth = width / 7 - width / 12
  let settingsHeight = topBarHeight / 8;
  noStroke();
  for (let i = 1; i < 4; i++) {
    rect(width - width / 7 + width / 24, topBarHeight / 9 * i * 2, settingsWidth, settingsHeight, 10, 10);
  }

  // draw the win screen
  if (currentScene == "win") {
    background(COLOR_BACKGROUND);
    textAlign(CENTER, CENTER);
    text(winner == "tie" ? "It's a tie!" : "Player " + winner == "red" ? "Blue Player" : "Red Player" + " wins!", width / 2, height / 4);
  }

  // draw the settings menu
  if (currentScene == "settings" || currentScene == "win") {
    settingsMenu.draw();
  }

  // draw a border around the canvas
  fill(255, 255, 255, 0);
  stroke(COLOR_HIGHLIGHT);
  strokeWeight(10);
  rect(0, 0, width, height);
}

function mouseClicked() {
  // if mouse is within the p5.js canvas
  if (!mouseIsInCanvas()) {
    return;
  }

  // open and close the settings menu if clicking on the settings bar
  if (mouseX > width - width / 7 + width / 24 && mouseX < width - width / 24 && mouseY > topBarHeight / 9 * 2 && mouseY < topBarHeight - topBarHeight / 9 * 2) {
    if (currentScene == "play") {
      currentScene = "settings";
    }
    else {
      currentScene = "play";
    }
  }

  // if in the play scene and the mouse is clicked
  if (currentScene == "play") {
    if (mouseY > topBarHeight) {
      if (numHumanPlayers == 1) {
        board.humanPlay();
        board.aiPlay();
      } else if (numHumanPlayers == 2) {
        board.humanPlay();
      } else {
        board.aiPlay();
      }
    }
  } else {
    // in the settings scene
    if (settingsMenu.contains(mouseX, mouseY)) {
      settingsMenu.onClick();
    } else if (mouseY > topBarHeight && currentScene != "win") {
      // close the settings menu
      currentScene = "play";
    }
  }

  if (winner != "") {
    currentScene = "win";
    settingsMenu.setPos(width / 2 - settingsMenu.width / 2, height / 4);
  }
}

mousePressed = function () {
  if (currentScene == "win" && mouseIsInCanvas()) {
    if (mouseX > settingsMenu.reviewX && mouseX < settingsMenu.reviewX + settingsMenu.reviewW && mouseY > settingsMenu.reviewY && mouseY < settingsMenu.reviewY + settingsMenu.reviewH) {
      print("reviewing");
      reviewing = true;
      currentScene = "play";
    }
  }
}

mouseReleased = function () {
  if (reviewing && mouseIsInCanvas()) {
    reviewing = false;
    currentScene = "win";
  }
}

mouseIsInCanvas = function () {
  return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}

