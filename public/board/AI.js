export default class AI {
  #winScore = 100;
  #tolerance = 1;

  #centerColumnScore = 0;
  #centerColumnHeight = 0;
  #twoBarScore = 0;
  #threeBarScore = 0;
  #twoBarScoreBlock = 0;
  #threeBarScoreBlock = 0;
  #depthScore = 0;
  #depth = 0;

  #difficulty = 2;
  #ROWS;
  #COLUMNS;
  #iterations;
  #DEBUG = true;

  constructor(rows, columns) {
    this.#ROWS = rows;
    this.#COLUMNS = columns;
  }

  bestMove(board, player) {
    let bestMove;
    let bestScore = -Infinity;
    let bestMoves = [];
    let score = 0;
    let lastDrop = { row: 0, column: 0, player: null };
    let opponent = player === "red" ? "blue" : "red";
    this.#iterations = 0;

    // get the best move
    for (let i = 0; i < this.#COLUMNS; i++) {
      // if column is available, play in it.
      for (let j = this.#ROWS - 1; j >= 0; j--) {
        if (board.columns[i].rows[j] === null) {
          let currentIterations = 0;

          // play the piece
          board.columns[i].rows[j] = player;
          lastDrop.column = i;
          lastDrop.row = j;
          lastDrop.player = player;

          // get the score
          score = this.#minimax(
            board,
            lastDrop,
            this.#depth,
            -Infinity,
            Infinity,
            false,
            player,
            opponent,
          );

          // only evaluate move farther if it is not a winning or losing score
          if (score < this.#winScore && score > -this.#winScore) {
            score += this.#evaluation(lastDrop, board);
          }

          if (this.#DEBUG)
            console.log(
              `Col: ${lastDrop.column}, Score: ${Math.round(score, 2)}`,
            );

          // undo the move
          board.columns[i].rows[j] = null;

          // if the score is within the tolerance, add it to the best moves
          if (
            score >= bestScore - this.#tolerance &&
            score <= bestScore + this.#tolerance
          ) {
            bestMoves.push(i);
          } else if (score > bestScore) {
            bestScore = score;
            bestMoves = [i];
            bestMove = { row: j, column: i };
          }
          break;
        }
      }
    }

    if (this.#DEBUG) {
      console.log(`Depth: ${this.#depth}`);
      console.log(`Iterations: ${this.#iterations}\n\n`);
    }

    // if multiple moves are within the tolerance, choose a random one
    if (bestMoves.length > 1) {
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    if (bestMove === undefined) {
      return Math.floor(Math.random() * this.#COLUMNS);
    }

    return bestMove.column;
  }

  #minimax = function (
    board,
    lastDrop,
    depth,
    alpha,
    beta,
    isMaximizing,
    player,
    opponent,
  ) {
    let bestScore;
    let score;

    let dropTmp = { row: 0, col: 0, player: null };

    // // check for win and return result
    let result = board.checkWinner(lastDrop.column);

    if (result !== null) {
      switch (result) {
        case player:
          return this.#winScore + this.#evaluateDepth(depth);
        case opponent:
          return -this.#winScore - this.#evaluateDepth(depth);
        case "tie":
          return 0;
      }
    }
    // return if reached depth
    if (depth <= 0) {
      if (isMaximizing) return this.#evaluation(lastDrop, board, depth);
      else return -this.#evaluation(lastDrop, board, depth);
    }
    this.#iterations++;

    if (isMaximizing) {
      bestScore = -Infinity;
      for (let i = 0; i < this.#COLUMNS; i++) {
        // if column is available, play in it.
        for (let j = board.columns[i].rows.length - 1; j >= 0; j--) {
          if (board.columns[i].rows[j] === null) {
            // play the piece
            board.columns[i].rows[j] = player;
            dropTmp.column = i;
            dropTmp.row = j;
            dropTmp.player = player;
            score = this.#minimax(
              board,
              dropTmp,
              depth - 1,
              alpha,
              beta,
              !isMaximizing,
              player,
              opponent,
            );

            //alpha beta pruning
            alpha = Math.max(alpha, score);

            board.columns[i].rows[j] = null;

            if (score >= bestScore - 0.5 && score <= bestScore + 0.5) {
              let rand = Math.round(Math.random(0, 1));
              if (rand === 0) {
                bestScore = score;
              }
            } else if (score > bestScore) {
              bestScore = score;
            }
            break;
          }
        }
        //alpha beta pruning
        if (beta <= alpha) break;
      }
      return bestScore;
    } else {
      bestScore = Infinity;
      for (let i = 0; i < this.#COLUMNS; i++) {
        // if column is available, play in it.
        for (let j = board.columns[i].rows.length - 1; j >= 0; j--) {
          if (board.columns[i].rows[j] === null) {
            // play the piece
            board.columns[i].rows[j] = opponent;

            dropTmp.column = i;
            dropTmp.row = j;
            dropTmp.player = opponent;
            score = this.#minimax(
              board,
              dropTmp,
              depth - 1,
              alpha,
              beta,
              !isMaximizing,
              player,
              opponent,
            );

            // alpha beta pruning
            beta = Math.min(beta, score);

            board.columns[i].rows[j] = null;
            if (score >= bestScore - 0.5 && score <= bestScore + 0.5) {
              let rand = Math.round(Math.random(0, 1));
              if (rand === 0) {
                bestScore = score;
              }
            }
            if (score < bestScore) {
              bestScore = score;
            }
            break;
          }
        }

        // alpha beta pruning
        if (beta <= alpha) break;
      }
      return bestScore;
    }
  };

  #evaluation(lastDrop, board, depth = 0) {
    let score = 0;

    score += this.#prioritizeCenter(lastDrop);
    score += this.#checkBar(lastDrop, board);

    return score;
  }

  #prioritizeCenter(lastDrop) {
    if (lastDrop.column === Math.floor(this.#COLUMNS / 2)) {
      return (
        (this.#centerColumnScore * (lastDrop.row + 1)) /
        this.#centerColumnHeight
      );
    } else return 0;
  }

  #evaluateDepth(depth) {
    return depth * this.#depthScore;
  }

  #checkBar(lastDrop, board) {
    let score = 0;
    let playerCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;

    let checkPlayer = lastDrop.player;
    let checkOpponent = checkPlayer === "red" ? "blue" : "red";

    // these are the minimum and maximum rows- and columns that we have to check for the win condition
    let minCol = Math.max(lastDrop.column - 3, 0);
    let maxCol = Math.min(lastDrop.column + 3, this.#COLUMNS - 1);
    let minRow = Math.max(lastDrop.row - 3, 0);
    let maxRow = Math.min(lastDrop.row + 3, board.columns[0].rows.length - 1);

    //For each win direction, just check the slice that the last piece lastDropped is in

    // Horizontal
    // loop through each possible starting column
    for (let i = minCol; i <= maxCol - 3; i++) {
      playerCount = 0;
      emptyCount = 0;
      opponentCount = 0;
      for (let j = 0; j <= 3; j++) {
        if (board.columns[i + j].rows[lastDrop.row] === checkPlayer)
          playerCount++;
        else if (board.columns[i + j].rows[lastDrop.row] === checkOpponent) {
          opponentCount++;
        } else emptyCount++;
      }
      if (playerCount + emptyCount >= 4) {
        if (playerCount === 3) {
          score += this.#threeBarScore;
        } else if (playerCount === 2) {
          score += this.#twoBarScore;
        }
      }
      if (opponentCount + emptyCount >= 3) {
        if (opponentCount === 2) {
          score += this.#twoBarScoreBlock;
        } else if (opponentCount === 1) {
          score += this.#threeBarScoreBlock;
        }
      }
    }

    // Vertical
    for (let i = minRow; i <= maxRow - 3; i++) {
      playerCount = 0;
      emptyCount = 0;
      opponentCount = 0;
      for (let j = 0; j <= 3; j++) {
        if (board.columns[lastDrop.column].rows[i + j] === checkPlayer)
          playerCount++;
        else if (board.columns[lastDrop.column].rows[i + j] === checkOpponent) {
          opponentCount++;
        } else emptyCount++;
      }
      if (playerCount + emptyCount >= 4) {
        if (playerCount === 3) {
          score += this.#threeBarScore;
        } else if (playerCount === 2) {
          score += this.#twoBarScore;
        }
      }
      if (opponentCount + emptyCount >= 3) {
        if (opponentCount === 2) {
          score += this.#twoBarScoreBlock;
        } else if (opponentCount === 1) {
          score += this.#threeBarScoreBlock;
        }
      }
    }

    // Backwards Slash
    let currentRow =
      lastDrop.row - Math.min(lastDrop.row - minRow, lastDrop.column - minCol);
    let currentCol =
      lastDrop.column -
      Math.min(lastDrop.row - minRow, lastDrop.column - minCol);
    if (currentCol <= 3 && currentRow <= 2) {
      while (currentRow <= maxRow - 3 && currentCol <= maxCol - 3) {
        playerCount = 0;
        emptyCount = 0;
        opponentCount = 0;
        for (let i = 0; i <= 3; i++) {
          if (
            board.columns[currentCol + i].rows[currentRow + i] === checkPlayer
          )
            playerCount++;
          else if (
            board.columns[currentCol + i].rows[currentRow + i] === checkOpponent
          )
            opponentCount++;
          else emptyCount++;
        }
        if (playerCount + emptyCount >= 4) {
          if (playerCount === 3) {
            score += this.#threeBarScore;
          } else if (playerCount === 2) {
            score += this.#twoBarScore;
          }
        }
        if (opponentCount + emptyCount >= 3) {
          if (opponentCount === 2) {
            score += this.#twoBarScoreBlock;
          } else if (opponentCount === 1) {
            score += this.#threeBarScoreBlock;
          }
        }
        currentRow++;
        currentCol++;
      }
    }

    // Forward Slash
    currentRow =
      lastDrop.row - Math.min(lastDrop.row - minRow, maxCol - lastDrop.column);
    currentCol =
      lastDrop.column +
      Math.min(lastDrop.row - minRow, maxCol - lastDrop.column);
    if (currentCol >= 3 && currentRow <= 2) {
      while (currentRow <= maxRow - 3 && currentCol >= minCol + 3) {
        playerCount = 0;
        emptyCount = 0;
        opponentCount = 0;
        for (let i = 0; i <= 3; i++) {
          if (
            board.columns[currentCol - i].rows[currentRow + i] === checkPlayer
          )
            playerCount++;
          else if (
            board.columns[currentCol - i].rows[currentRow + i] === checkOpponent
          )
            opponentCount++;
          else emptyCount++;
        }
        if (playerCount + emptyCount >= 4) {
          if (playerCount === 3) {
            score += this.#threeBarScore;
          } else if (playerCount === 2) {
            score += this.#twoBarScore;
          }
        }
        if (opponentCount + emptyCount >= 3) {
          if (opponentCount === 2) {
            score += this.#twoBarScoreBlock;
          } else if (opponentCount === 1) {
            score += this.#threeBarScoreBlock;
          }
        }
        currentRow++;
        currentCol--;
      }
    }

    return score;
  }

  setDifficulty(difficulty) {
    this.#difficulty = difficulty;
    switch (this.#difficulty) {
      case 0:
        this.#centerColumnScore = -8;
        this.#centerColumnHeight = 1.2;
        this.#twoBarScore = -3;
        this.#threeBarScore = -4;
        this.#twoBarScoreBlock = -2;
        this.#threeBarScoreBlock = -3;
        this.#depthScore = -2;

        this.#depth = 1;
        break;
      case 1:
        this.#centerColumnScore = 0;
        this.#centerColumnHeight = 1.2;
        this.#twoBarScore = 3;
        this.#threeBarScore = 4;
        this.#twoBarScoreBlock = 0;
        this.#threeBarScoreBlock = 0;
        this.#depthScore = 2;

        this.#depth = 3;
        break;
      case 2:
        this.#centerColumnScore = 8;
        this.#centerColumnHeight = 1.2;
        this.#twoBarScore = 3;
        this.#threeBarScore = 4;
        this.#twoBarScoreBlock = 2;
        this.#threeBarScoreBlock = 3;
        this.#depthScore = 2;

        this.#depth = 5;
        break;
    }
  }
}
