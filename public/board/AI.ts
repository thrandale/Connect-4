import Board, { Drop, Player } from "./Board";

export default class AI {
  private _winScore = 100;
  private _tolerance = 1;

  // Set in the setDifficulty function
  private _centerColumnScore = 0;
  private _centerColumnHeight = 0;
  private _twoBarScore = 0;
  private _threeBarScore = 0;
  private _twoBarScoreBlock = 0;
  private _threeBarScoreBlock = 0;
  private _depthScore = 0;
  private _depth = 0;

  private _difficulty = 2;
  private _numColumns;
  private _iterations = 0;
  private _DEBUG = true;
  public timeIterations: number[] = [];

  constructor(numColumns: number) {
    this._numColumns = numColumns;
  }

  bestMove(board: Board, player: Player): number {
    let startTime = new Date().getTime();
    let bestMove;
    let bestScore = -Infinity;
    let bestMoves: number[] = [];
    let score = 0;
    let lastDrop;
    let opponent: Player = player === "red" ? "blue" : "red";
    this._iterations = 0;

    // get the best move
    for (let col = 0; col < this._numColumns; col++) {
      // if column is available, play in it.
      let row = board.columns[col].getFirstEmptyRow();
      if (row === null) continue;

      // play the piece
      board.columns[col].rows[row] = player;
      lastDrop = { row: row, column: col, player: player };

      // get the score
      score = this._minimax(
        board,
        lastDrop,
        this._depth,
        -Infinity,
        Infinity,
        false,
        player,
        opponent,
      );

      // only evaluate move farther if it is not a winning or losing score
      if (score < this._winScore && score > -this._winScore) {
        score += this._evaluation(lastDrop, board);
      }

      if (this._DEBUG)
        console.log(`Col: ${lastDrop.column}, Score: ${score.toFixed(2)}`);

      // undo the move
      board.columns[col].rows[row] = null;

      // if the score is within the tolerance, add it to the best moves
      if (
        score >= bestScore - this._tolerance &&
        score <= bestScore + this._tolerance
      ) {
        bestMoves.push(col);
      } else if (score > bestScore) {
        bestScore = score;
        bestMoves = [col];
        bestMove = { row: row, column: col };
      }
    }

    if (this._DEBUG) {
      console.log(`Depth: ${this._depth}`);
      console.log(`Iterations: ${this._iterations}\n`);
      let endTime = new Date().getTime();
      let timeTaken = endTime - startTime;
      console.log(`Time taken: ${timeTaken}ms\n\n`);
      if (this._iterations > 0) {
        let timeIteration = timeTaken / this._iterations;
        console.log("Time/Iteration: " + timeIteration);
        this.timeIterations.push(timeIteration);
      }
    }

    // if multiple moves are within the tolerance, choose a random one
    if (bestMoves.length > 1) {
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    if (bestMove === undefined) {
      return Math.floor(Math.random() * this._numColumns);
    }

    return bestMove.column;
  }

  _minimax(
    board: Board,
    lastDrop: Drop,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    player: Player,
    opponent: Player,
  ) {
    let bestScore = isMaximizing ? -Infinity : Infinity;
    let dropTmp;
    let score;

    // check for win and return result
    let result = board.checkWinner(lastDrop.column);

    if (result !== null) {
      switch (result) {
        case player:
          return this._winScore + this._evaluateDepth(depth);
        case opponent:
          return -this._winScore - this._evaluateDepth(depth);
        case "tie":
          return 0;
      }
    }

    // return if reached depth
    if (depth <= 0) {
      return isMaximizing
        ? this._evaluation(lastDrop, board)
        : -this._evaluation(lastDrop, board);
    }

    this._iterations++;
    for (let col = 0; col < this._numColumns; col++) {
      // if column is available, play in it.
      let row = board.columns[col].getFirstEmptyRow();
      if (row === null) continue;

      // play the piece
      let activePlayer = isMaximizing ? player : opponent;
      board.columns[col].rows[row] = activePlayer;
      dropTmp = { row: row, column: col, player: activePlayer };
      score = this._minimax(
        board,
        dropTmp,
        depth - 1,
        alpha,
        beta,
        !isMaximizing,
        player,
        opponent,
      );

      if (isMaximizing) {
        alpha = Math.max(alpha, score);

        // if the score is within the tolerance, add it to the best moves
        if (score >= bestScore - 0.5 && score <= bestScore + 0.5) {
          let rand = Math.round(Math.random());
          if (rand === 0) {
            bestScore = score;
          }
        } else if (score > bestScore) {
          bestScore = score;
        }
      } else {
        beta = Math.min(beta, score);

        // if the score is within the tolerance, add it to the best moves
        if (score <= bestScore - 0.5 && score >= bestScore + 0.5) {
          let rand = Math.round(Math.random());
          if (rand === 0) {
            bestScore = score;
          }
        } else if (score < bestScore) {
          bestScore = score;
        }
      }

      // undo the move
      board.columns[col].rows[row] = null;

      //alpha beta pruning
      if (beta <= alpha) break;
    }

    return bestScore;
  }

  _evaluation(lastDrop: Drop, board: Board) {
    return this._prioritizeCenter(lastDrop) + this._checkBar(lastDrop, board);
  }

  _prioritizeCenter(lastDrop: Drop): number {
    if (lastDrop.column === Math.floor(this._numColumns / 2)) {
      return (
        (this._centerColumnScore * (lastDrop.row + 1)) /
        this._centerColumnHeight
      );
    }

    return 0;
  }

  _evaluateDepth(depth: number): number {
    return depth * this._depthScore;
  }

  _checkBar(lastDrop: Drop, board: Board): number {
    let score = 0;
    let playerCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;

    let checkPlayer = lastDrop.player;
    let checkOpponent = checkPlayer === "red" ? "blue" : "red";

    // these are the minimum and maximum rows- and columns that we have to check for the win condition
    let minCol = Math.max(lastDrop.column - 3, 0);
    let maxCol = Math.min(lastDrop.column + 3, this._numColumns - 1);
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
          score += this._threeBarScore;
        } else if (playerCount === 2) {
          score += this._twoBarScore;
        }
      }
      if (opponentCount + emptyCount >= 3) {
        if (opponentCount === 2) {
          score += this._twoBarScoreBlock;
        } else if (opponentCount === 1) {
          score += this._threeBarScoreBlock;
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
          score += this._threeBarScore;
        } else if (playerCount === 2) {
          score += this._twoBarScore;
        }
      }
      if (opponentCount + emptyCount >= 3) {
        if (opponentCount === 2) {
          score += this._twoBarScoreBlock;
        } else if (opponentCount === 1) {
          score += this._threeBarScoreBlock;
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
            score += this._threeBarScore;
          } else if (playerCount === 2) {
            score += this._twoBarScore;
          }
        }
        if (opponentCount + emptyCount >= 3) {
          if (opponentCount === 2) {
            score += this._twoBarScoreBlock;
          } else if (opponentCount === 1) {
            score += this._threeBarScoreBlock;
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
            score += this._threeBarScore;
          } else if (playerCount === 2) {
            score += this._twoBarScore;
          }
        }
        if (opponentCount + emptyCount >= 3) {
          if (opponentCount === 2) {
            score += this._twoBarScoreBlock;
          } else if (opponentCount === 1) {
            score += this._threeBarScoreBlock;
          }
        }
        currentRow++;
        currentCol--;
      }
    }

    return score;
  }

  setDifficulty(difficulty: number) {
    this._difficulty = difficulty;
    switch (this._difficulty) {
      case 0:
        // Negative values to look for the worst move instead of the best
        this._centerColumnScore = -8;
        this._centerColumnHeight = 1.2;
        this._twoBarScore = -3;
        this._threeBarScore = -4;
        this._twoBarScoreBlock = -2;
        this._threeBarScoreBlock = -3;
        this._depthScore = -2;

        this._depth = 1;
        break;
      case 1:
        this._centerColumnScore = 0;
        this._centerColumnHeight = 1.2;
        this._twoBarScore = 3;
        this._threeBarScore = 4;
        this._twoBarScoreBlock = 0;
        this._threeBarScoreBlock = 0;
        this._depthScore = 2;

        this._depth = 3;
        break;
      case 2:
        this._centerColumnScore = 8;
        this._centerColumnHeight = 1.2;
        this._twoBarScore = 3;
        this._threeBarScore = 4;
        this._twoBarScoreBlock = 2;
        this._threeBarScoreBlock = 3;
        this._depthScore = 2;

        this._depth = 5;
        break;
    }
  }
}
