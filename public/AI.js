let winScore = 100;
let centerColumnScore = 8;
let centerColumnHeight = 1.1;
let TwoBarScore = 3;
let ThreeBarScore = 4;
let TwoBarScoreBlock = 3;
let ThreeBarScoreBlock = 4;
let adjacentScore = 1;
let depthScore = 2;
let tolerance = 1;

let depth = 3;

let bestMove = function (player) {
    let bestMove;
    let bestScore = -Infinity;
    let score = 0;
    let lastDrop = { row: 0, col: 0 };
    let opponent;

    // the number of possible moves that have been checked
    iterations = 0;
    // set the opponent
    switch (player) {
        case player2:
            opponent = player1;
            break;
        case player1:
            opponent = player2;
            break;
    }

    // get the best move
    for (let i = 0; i < COLUMNS; i++) {
        // if column is available, play in it.
        for (let j = ROWS - 1; j >= 0; j--) {
            if (board.columns[i].rows[j].player == "") {
                currentIterations = 0;

                // play the piece
                board.columns[i].rows[j].player = player;
                lastDrop.column = i;
                lastDrop.row = j;

                // get the score
                score = minimax(board, lastDrop, depth, -Infinity, Infinity, false, player, opponent);

                // only evaluate move farther if it is not a winning or losing score
                if (score < winScore && score > -winScore) {
                    score += evaluation(lastDrop);
                }

                // debug prints
                if (debug) {
                    print("Col: " + lastDrop.column + ", Score: " + round(score, 2));
                }

                // undo the move
                board.columns[i].rows[j].player = "";

                // if multiple moves are within the tolerance, choose a random one
                if (score >= bestScore - tolerance && score <= bestScore + tolerance) {
                    let rand = round(random(0, 1));
                    if (rand == 0) {
                        bestScore = score;
                        bestMove = new Drop(i, j);
                    }
                } else if (score > bestScore) {
                    bestScore = score;
                    bestMove = new Drop(i, j);
                }
                break;
            }
        }
    }

    // debug prints
    if (debug)
        print("Iterations: " + iterations);

    winner = board.checkWinner(bestMove);

    return bestMove.column;
}

let minimax = function (board, lastDrop, depth, alpha, beta, isMaximizing, player, opponent) {
    let bestScore;
    let score;


    let dropTmp = { row: 0, col: 0 };

    // // check for win and return result
    let result = board.checkWinner(lastDrop);

    if (result != "") {
        switch (result) {
            case player:
                return winScore + evaluateDepth(depth);
            case opponent:
                return -winScore - evaluateDepth(depth);
            case "tie":
                return 0;
        }
    }
    // return if reached depth
    if (depth <= 0) {

        if (isMaximizing)
            return evaluation(lastDrop, depth);
        else
            return -evaluation(lastDrop, depth);
    }
    iterations++;

    if (isMaximizing) {
        bestScore = -Infinity;
        for (let i = 0; i < COLUMNS; i++) {
            // if column is available, play in it.
            for (let j = board.columns[i].rows.length - 1; j >= 0; j--) {
                if (board.columns[i].rows[j].player == "") {
                    // play the piece
                    board.columns[i].rows[j].player = player;
                    dropTmp.column = i;
                    dropTmp.row = j;
                    score = minimax(board, dropTmp, depth - 1, alpha, beta, !isMaximizing, player, opponent)

                    //alpha beta pruning
                    alpha = max(alpha, score);

                    board.columns[i].rows[j].player = "";

                    if (score >= bestScore - .5 && score <= bestScore + .5) {
                        let rand = round(random(0, 1));
                        if (rand == 0) {
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
        for (let i = 0; i < COLUMNS; i++) {
            // if column is available, play in it.
            for (let j = board.columns[i].rows.length - 1; j >= 0; j--) {
                if (board.columns[i].rows[j].player == "") {
                    // play the piece
                    board.columns[i].rows[j].player = opponent;

                    dropTmp.column = i;
                    dropTmp.row = j;
                    score = minimax(board, dropTmp, depth - 1, alpha, beta, !isMaximizing, player, opponent);


                    // alpha beta pruning
                    beta = min(beta, score);

                    board.columns[i].rows[j].player = "";
                    if (score >= bestScore - .5 && score <= bestScore + .5) {
                        let rand = round(random(0, 1));
                        if (rand == 0) {
                            bestScore = score;
                        }
                    } if (score < bestScore) {
                        bestScore = score;
                    }
                    break;
                }
            }

            // alpha beta pruning
            if (beta <= alpha)
                break;
        }
        return bestScore;
    }

}


let evaluation = function (lastDrop, depth = 0) {
    let score = 0;
    score += prioritizeCenter(lastDrop);
    //score += checkAdjacent(lastDrop);
    score += checkBar(lastDrop);
    //score += evaluateDepth(depth);

    return score;
}


let prioritizeCenter = function (lastDrop) {
    if (lastDrop.column == floor(COLUMNS / 2)) {
        return centerColumnScore * (lastDrop.row + 1) / centerColumnHeight;
    }
    else
        return 0;
}

let evaluateDepth = function (depth) {
    return depth * depthScore;
}

let checkBar = function (lastDrop) {
    let score = 0;
    let playerCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;

    let checkPlayer = board.columns[lastDrop.column].rows[lastDrop.row].player;
    let checkOpponent;

    if (checkPlayer == player1)
        checkOpponent = player2;
    else
        checkOpponent = player1;

    // these are the minimum and maximum rows- and columns that we have to check for the win condition
    let minCol = max(lastDrop.column - 3, 0);
    let maxCol = min(lastDrop.column + 3, COLUMNS - 1);
    let minRow = max(lastDrop.row - 3, 0);
    let maxRow = min(lastDrop.row + 3, board.columns[0].rows.length - 1);

    //For each win direction, just check the slice that the last piece lastDropped is in

    // Horizontal
    // loop through each possible starting column
    for (let i = minCol; i <= maxCol - 3; i++) {
        playerCount = 0;
        emptyCount = 0;
        opponentCount = 0;
        for (let j = 0; j <= 3; j++) {
            if (board.columns[i + j].rows[lastDrop.row].player == checkPlayer)
                playerCount++;

            else if (board.columns[i + j].rows[lastDrop.row].player == checkOpponent) {
                //print(board.columns[i + j].rows[lastDrop.row].player);
                opponentCount++;
            }
            else
                emptyCount++;
        }
        if (playerCount + emptyCount >= 4) {
            if (playerCount == 3) {
                score += ThreeBarScore;
            } else if (playerCount == 2) {
                score += TwoBarScore;
            }
        }
        if (opponentCount + emptyCount >= 3) {
            if (opponentCount == 2) {
                // score += TwoBarScoreBlock;
            } else if (opponentCount == 1) {
                //print(opponentCount);
                //print(10);
                // score += ThreeBarScoreBlock;
            }
        }
    }


    // Vertical
    for (let i = minRow; i <= maxRow - 3; i++) {
        playerCount = 0;
        emptyCount = 0;
        opponentCount = 0;
        for (let j = 0; j <= 3; j++) {
            if (board.columns[lastDrop.column].rows[i + j].player == checkPlayer)
                playerCount++;
            else if (board.columns[lastDrop.column].rows[i + j].player == checkOpponent) {

                opponentCount++;
            }
            else
                emptyCount++;

        }
        if (playerCount + emptyCount >= 4) {
            if (playerCount == 3) {
                score += ThreeBarScore;
            } else if (playerCount == 2) {
                score += TwoBarScore;
            }
        }
        if (opponentCount + emptyCount >= 3) {
            if (opponentCount == 2) {
                // score += TwoBarScoreBlock;
            } else if (opponentCount == 1) {
                //print(11);
                // score += ThreeBarScoreBlock;
            }
        }
    }


    // Backwards Slash
    let currentRow = (lastDrop.row - min(lastDrop.row - minRow, lastDrop.column - minCol));
    let currentCol = (lastDrop.column - min(lastDrop.row - minRow, lastDrop.column - minCol));
    if (currentCol <= 3 && currentRow <= 2) {
        while (currentRow <= maxRow - 3 && currentCol <= maxCol - 3) {
            playerCount = 0;
            emptyCount = 0;
            opponentCount = 0;
            for (let i = 0; i <= 3; i++) {
                if (board.columns[currentCol + i].rows[currentRow + i].player == checkPlayer)
                    playerCount++;
                else if (board.columns[currentCol + i].rows[currentRow + i].player == checkOpponent)
                    opponentCount++;
                else
                    emptyCount++;
            }
            if (playerCount + emptyCount >= 4) {
                if (playerCount == 3) {
                    score += ThreeBarScore;
                } else if (playerCount == 2) {
                    score += TwoBarScore;
                }
            }
            if (opponentCount + emptyCount >= 3) {
                if (opponentCount == 2) {
                    //score += TwoBarScoreBlock;
                } else if (opponentCount == 1) {
                    //print(12);
                    //score += ThreeBarScoreBlock;
                }
            }
            currentRow++;
            currentCol++;
        }
    }

    // Forward Slash
    currentRow = (lastDrop.row - min(lastDrop.row - minRow, maxCol - lastDrop.column));
    currentCol = (lastDrop.column + min(lastDrop.row - minRow, maxCol - lastDrop.column));
    if (currentCol >= 3 && currentRow <= 2) {
        while (currentRow <= maxRow - 3 && currentCol >= minCol + 3) {
            playerCount = 0;
            emptyCount = 0;
            opponentCount = 0;
            for (let i = 0; i <= 3; i++) {
                if (board.columns[currentCol - i].rows[currentRow + i].player == checkPlayer)
                    playerCount++;
                else if (board.columns[currentCol - i].rows[currentRow + i].player == checkOpponent)
                    opponentCount++;
                else
                    emptyCount++;
            }
            if (playerCount + emptyCount >= 4) {
                if (playerCount == 3) {
                    score += ThreeBarScore;
                } else if (playerCount == 2) {
                    score += TwoBarScore;
                }
            }
            if (opponentCount + emptyCount >= 3) {
                if (opponentCount == 2) {
                    // score += TwoBarScoreBlock;
                } else if (opponentCount == 1) {
                    //print(13);
                    // score += ThreeBarScoreBlock;
                }
            }
            currentRow++;
            currentCol--;
        }
    }

    return score;
}

let checkAdjacent = function (lastDrop) {
    let score = 0;
    if (lastDrop.row > 0) {
        if (board.columns[lastDrop.column].rows[lastDrop.row - 1].player == board.columns[lastDrop.column].rows[lastDrop.row].player)
            score += adjacentScore;
    }
    if (lastDrop.column < COLUMNS - 1) {
        if (board.columns[lastDrop.column + 1].rows[lastDrop.row].player == board.columns[lastDrop.column].rows[lastDrop.row].player)
            score += adjacentScore;
    }
    if (lastDrop.row < board.columns[0].length - 1) {
        if (board.columns[lastDrop.column].rows[lastDrop.row + 1].player == board.columns[lastDrop.column].rows[lastDrop.row].player)
            score += adjacentScore;
    }
    if (lastDrop.column > 0) {
        if (board.columns[lastDrop.column - 1].rows[lastDrop.row].player == board.columns[lastDrop.column].rows[lastDrop.row].player)
            score += adjacentScore;
    }
    return score;
}