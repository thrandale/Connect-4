# Connect4
## An AI for connect 4 written in js
- Main file is sketch.js
- AI is implemented in ai.js
- Classes for the connect4 board are in the 'board' folder.
- Graphics are implemented using [p5.js](https://p5js.org/)

## How to use
- Open the index.html file in your browser.
- You can configure a few things in the sketch.js file.
    - starting player
    - number of human players (0, 1 or 2)

## The AI
- The AI is a minimax algorithm with alpha-beta pruning.
- The minimax is going a very low depth, as it is intended to be used on an arduino in the future.
- Because of the low search depth, it implements several heuristics to improve the performance.

