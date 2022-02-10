# Connect4
## An AI for connect 4 written in js
- Main file is sketch.js
- AI is implemented in ai.js
- Classes for the connect4 board are in the 'board' folder.
- Graphics are implemented using [p5.js](https://p5js.org/)

## How to use
- It is hosted using firebase at [theo-connect4](https://theo-connect4.web.app/)
- To run locally, open the *index.html* file

## The AI
- The AI is a minimax algorithm with alpha-beta pruning.
- The minimax is going a very low depth, as it is intended to be used on an arduino in the future.
- Because of the low search depth, it implements several heuristics to improve the performance.
### Heuristics
| Check                | Score |
| -------------------: | :---: |
| Win                  | 100   |
| Center Column        | 7     |
| Center Column Height | 2     |
| Bar of 2             | 3     |
| Bar of 3             | 4     |
| Adjacent Piece       | 1     |
| Depth                | 2     |


