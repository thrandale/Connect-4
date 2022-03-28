

export default class AI {
    #WIN_SCORE = 100;
    #CENTER_COLUMN_SCORE = 8;
    #CENTER_COLUMN_HEIGHT = 1.2;
    #TWO_BAR_SCORE = 3;
    #THREE_BAR_SCORE = 4;
    #TWO_BAR_SCORE_BLOCK = 3;
    #THREE_BAR_SCORE_BLOCK = 4;
    #ADJACENT_SCORE = 1;
    #DEPTH_SCORE = 2;
    #TOLERANCE = 1;
    #DEPTH = 5;
    #ROWS
    #COLUMNS
    #iterations

    constructor(rows, columns) {
        this.#ROWS = rows;
        this.#COLUMNS = columns;
    }

    bestMove(board, player) {
        let bestMove;
        let bestScore = -Infinity;
        let score = 0;
        let lastDrop = { row: 0, column: 0, player: null };
        let opponent = player === "red" ? "blue" : "red";
        this.#iterations = 0

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
                    score = this.#minimax(board, lastDrop, this.#DEPTH, -Infinity, Infinity, false, player, opponent);

                    // only evaluate move farther if it is not a winning or losing score
                    if (score < this.#WIN_SCORE && score > -this.#WIN_SCORE) {
                        score += this.#evaluation(lastDrop, board);
                    }

                    console.log("Col: " + lastDrop.column + ", Score: " + Math.round(score, 2));

                    // undo the move
                    board.columns[i].rows[j] = null;

                    // if multiple moves are within the this.#TOLERANCE, choose a random one
                    if (score >= (bestScore - this.#TOLERANCE) && score <= (bestScore + this.#TOLERANCE)) {
                        let rand = Math.round(Math.random());
                        if (rand === 0) {
                            bestScore = score;
                            bestMove = { row: j, column: i };
                        }
                    } else if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row: j, column: i };
                    }
                    break;
                }
            }
        }

        console.log("Iterations: " + this.#iterations + "\n\n");

        return bestMove.column;
    }

    #minimax = function (board, lastDrop, depth, alpha, beta, isMaximizing, player, opponent) {
        let bestScore;
        let score;


        let dropTmp = { row: 0, col: 0, player: null };

        // // check for win and return result
        let result = board.checkWinner(lastDrop);

        if (result !== null) {
            switch (result) {
                case player:
                    return this.#WIN_SCORE + this.#evaluateDepth(depth);
                case opponent:
                    return -this.#WIN_SCORE - this.#evaluateDepth(depth);
                case "tie":
                    return 0;
            }
        }
        // return if reached depth
        if (depth <= 0) {

            if (isMaximizing)
                return this.#evaluation(lastDrop, board, depth);
            else
                return -this.#evaluation(lastDrop, board, depth);
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
                        score = this.#minimax(board, dropTmp, depth - 1, alpha, beta, !isMaximizing, player, opponent)

                        //alpha beta pruning
                        alpha = Math.max(alpha, score);

                        board.columns[i].rows[j] = null;

                        if (score >= bestScore - .5 && score <= bestScore + .5) {
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
                if (beta <= alpha)
                    break;
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
                        score = this.#minimax(board, dropTmp, depth - 1, alpha, beta, !isMaximizing, player, opponent);


                        // alpha beta pruning
                        beta = Math.min(beta, score);

                        board.columns[i].rows[j] = null;
                        if (score >= bestScore - .5 && score <= bestScore + .5) {
                            let rand = Math.round(Math.random(0, 1));
                            if (rand === 0) {
                                bestScore = score;
                            }
                        } if (score < bestScore) {
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

    }


    #evaluation(lastDrop, board, depth = 0) {
        let score = 0;

        score += this.#prioritizeCenter(lastDrop);
        //score += checkAdjacent(lastDrop);
        score += this.#checkBar(lastDrop, board);
        //score += evaluateDepth(depth);

        return score;
    }


    #prioritizeCenter(lastDrop) {
        if (lastDrop.column === Math.floor(this.#COLUMNS / 2)) {
            return this.#CENTER_COLUMN_SCORE * (lastDrop.row + 1) / this.#CENTER_COLUMN_HEIGHT;
        }
        else
            return 0;
    }

    #evaluateDepth(depth) {
        return depth * this.#DEPTH_SCORE;
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
                    //print(board.columns[i + j].rows[lastDrop.row]);
                    opponentCount++;
                }
                else
                    emptyCount++;
            }
            if (playerCount + emptyCount >= 4) {
                if (playerCount === 3) {
                    score += this.#THREE_BAR_SCORE;
                } else if (playerCount === 2) {
                    score += this.#TWO_BAR_SCORE;
                }
            }
            if (opponentCount + emptyCount >= 3) {
                if (opponentCount === 2) {
                    // score += this.#TWO_BAR_SCORE_BLOCK;
                } else if (opponentCount === 1) {
                    //print(opponentCount);
                    //print(10);
                    // score += this.#THREE_BAR_SCORE_BLOCK;
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
                }
                else
                    emptyCount++;

            }
            if (playerCount + emptyCount >= 4) {
                if (playerCount === 3) {
                    score += this.#THREE_BAR_SCORE;
                } else if (playerCount === 2) {
                    score += this.#TWO_BAR_SCORE;
                }
            }
            if (opponentCount + emptyCount >= 3) {
                if (opponentCount === 2) {
                    // score += this.#TWO_BAR_SCORE_BLOCK;
                } else if (opponentCount === 1) {
                    //print(11);
                    // score += this.#THREE_BAR_SCORE_BLOCK;
                }
            }
        }


        // Backwards Slash
        let currentRow = (lastDrop.row - Math.min(lastDrop.row - minRow, lastDrop.column - minCol));
        let currentCol = (lastDrop.column - Math.min(lastDrop.row - minRow, lastDrop.column - minCol));
        if (currentCol <= 3 && currentRow <= 2) {
            while (currentRow <= maxRow - 3 && currentCol <= maxCol - 3) {
                playerCount = 0;
                emptyCount = 0;
                opponentCount = 0;
                for (let i = 0; i <= 3; i++) {
                    if (board.columns[currentCol + i].rows[currentRow + i] === checkPlayer)
                        playerCount++;
                    else if (board.columns[currentCol + i].rows[currentRow + i] === checkOpponent)
                        opponentCount++;
                    else
                        emptyCount++;
                }
                if (playerCount + emptyCount >= 4) {
                    if (playerCount === 3) {
                        score += this.#THREE_BAR_SCORE;
                    } else if (playerCount === 2) {
                        score += this.#TWO_BAR_SCORE;
                    }
                }
                if (opponentCount + emptyCount >= 3) {
                    if (opponentCount === 2) {
                        //score += this.#TWO_BAR_SCORE_BLOCK;
                    } else if (opponentCount === 1) {
                        //print(12);
                        //score += this.#THREE_BAR_SCORE_BLOCK;
                    }
                }
                currentRow++;
                currentCol++;
            }
        }

        // Forward Slash
        currentRow = (lastDrop.row - Math.min(lastDrop.row - minRow, maxCol - lastDrop.column));
        currentCol = (lastDrop.column + Math.min(lastDrop.row - minRow, maxCol - lastDrop.column));
        if (currentCol >= 3 && currentRow <= 2) {
            while (currentRow <= maxRow - 3 && currentCol >= minCol + 3) {
                playerCount = 0;
                emptyCount = 0;
                opponentCount = 0;
                for (let i = 0; i <= 3; i++) {
                    if (board.columns[currentCol - i].rows[currentRow + i] === checkPlayer)
                        playerCount++;
                    else if (board.columns[currentCol - i].rows[currentRow + i] === checkOpponent)
                        opponentCount++;
                    else
                        emptyCount++;
                }
                if (playerCount + emptyCount >= 4) {
                    if (playerCount === 3) {
                        score += this.#THREE_BAR_SCORE;
                    } else if (playerCount === 2) {
                        score += this.#TWO_BAR_SCORE;
                    }
                }
                if (opponentCount + emptyCount >= 3) {
                    if (opponentCount === 2) {
                        // score += this.#TWO_BAR_SCORE_BLOCK;
                    } else if (opponentCount === 1) {
                        //print(13);
                        // score += this.#THREE_BAR_SCORE_BLOCK;
                    }
                }
                currentRow++;
                currentCol--;
            }
        }

        return score;
    }

    #checkAdjacent(lastDrop) {
        let score = 0;
        if (lastDrop.row > 0) {
            if (board.columns[lastDrop.column].rows[lastDrop.row - 1] === board.columns[lastDrop.column].rows[lastDrop.row])
                score += this.#ADJACENT_SCORE;
        }
        if (lastDrop.column < this.#COLUMNS - 1) {
            if (board.columns[lastDrop.column + 1].rows[lastDrop.row] === board.columns[lastDrop.column].rows[lastDrop.row])
                score += this.#ADJACENT_SCORE;
        }
        if (lastDrop.row < board.columns[0].length - 1) {
            if (board.columns[lastDrop.column].rows[lastDrop.row + 1] === board.columns[lastDrop.column].rows[lastDrop.row])
                score += this.#ADJACENT_SCORE;
        }
        if (lastDrop.column > 0) {
            if (board.columns[lastDrop.column - 1].rows[lastDrop.row] === board.columns[lastDrop.column].rows[lastDrop.row])
                score += this.#ADJACENT_SCORE;
        }
        return score;
    }
}