import Column from "./Column.js"
import AI from "./AI.js"

export default class Board {
    #columns
    #currentPlayer
    #ROWS
    #COLUMNS
    #startingPlayer
    #numHumanPlayers
    #player1
    #player2
    #lastDrop
    #winner
    #AI

    constructor(ROWS, COLUMNS, startingPlayer, numHumanPlayers) {
        this.#columns = [];
        this.#currentPlayer;
        this.#ROWS = ROWS;
        this.#COLUMNS = COLUMNS;
        this.#startingPlayer = startingPlayer;
        this.#player1 = "red";
        this.#player2 = "blue";
        this.#winner = null;
        this.#init();
        this.#AI = new AI(this.#ROWS, this.#COLUMNS);
    }

    #init() {
        for (let i = 0; i < this.#COLUMNS; i++) {
            this.#columns.push(new Column(i, this.#ROWS));
        }
        this.#reset();
    }

    #reset() {
        for (let i = 0; i < this.COLUMNS; i++) {
            this.#columns[i].reset();
        }

        this.#currentPlayer = this.#startingPlayer;

        this.#winner = null;
    }

    #drop(column) {
        this.#columns[column].onDrop(column, this.#currentPlayer);
        this.#lastDrop = { row: this.#columns[column].getRow() + 1, column: column };
        this.#changePlayer();
    }

    drop(column) {
        this.#drop(column);
        this.#winner = this.checkWinner(this.#lastDrop);
    }

    getBestMove() {
        let bestMove = this.#AI.bestMove(this, this.#currentPlayer);
        return bestMove;
    }

    #changePlayer() {
        this.#currentPlayer = this.#currentPlayer === this.#player1 ? this.#player2 : this.#player1;
        document.getElementById("piece");
    }

    isFull(column) {
        return this.#columns[column].isFull();
    }

    getRow(column) {
        return this.#columns[column].getRow();
    }

    checkWinner(lastDrop) {
        let playerCount = 0;

        // these are the minimum and maximum rows and columns that we have to check for the win condition
        let minCol = Math.max(lastDrop.column - 3, 0);
        let maxCol = Math.min(lastDrop.column + 3, this.#columns.length - 1);
        let minRow = Math.max(lastDrop.row - 3, 0);
        let maxRow = Math.min(lastDrop.row + 3, this.#columns[0].rows.length - 1);

        /**** For each win direction, just check the slice that the last piece dropped is in****/
        // Horizontal
        // loop through each possible starting column
        for (let i = minCol; i <= maxCol - 3; i++) {
            playerCount = 0;
            for (let j = 0; j <= 3; j++) {
                if (this.#columns[i + j].rows[lastDrop.row] === this.#columns[lastDrop.column].rows[lastDrop.row])
                    playerCount++;
            }
            if (playerCount >= 4)
                return this.#columns[lastDrop.column].rows[lastDrop.row];
        }


        // Vertical
        for (let i = minRow; i <= maxRow - 3; i++) {
            playerCount = 0;
            for (let j = 0; j <= 3; j++) {
                if (this.#columns[lastDrop.column].rows[i + j] === this.#columns[lastDrop.column].rows[lastDrop.row])
                    playerCount++;
            }
            if (playerCount >= 4)
                return this.#columns[lastDrop.column].rows[lastDrop.row];
        }

        // Forward Slash
        let currentRow = (lastDrop.row - Math.min(lastDrop.row - minRow, lastDrop.column - minCol));
        let currentCol = (lastDrop.column - Math.min(lastDrop.row - minRow, lastDrop.column - minCol));
        if (currentCol <= 3 && currentRow <= 2) {
            while (currentRow <= maxRow - 3 && currentCol <= maxCol - 3) {
                playerCount = 0;
                for (let i = 0; i <= 3; i++) {
                    if (this.#columns[currentCol + i].rows[currentRow + i] === this.#columns[lastDrop.column].rows[lastDrop.row])
                        playerCount++;
                }
                if (playerCount >= 4)
                    return this.#columns[lastDrop.column].rows[lastDrop.row];
                currentRow++;
                currentCol++;
            }
        }

        // Backwards Slash
        currentRow = (lastDrop.row - Math.min(lastDrop.row - minRow, maxCol - lastDrop.column));
        currentCol = (lastDrop.column + Math.min(lastDrop.row - minRow, maxCol - lastDrop.column));
        if (currentCol >= 3 && currentRow <= 2) {
            while (currentRow <= maxRow - 3 && currentCol >= minCol + 3) {
                playerCount = 0;
                for (let i = 0; i <= 3; i++) {
                    if (this.#columns[currentCol - i].rows[currentRow + i] === this.#columns[lastDrop.column].rows[lastDrop.row])
                        playerCount++;
                }
                if (playerCount >= 4)
                    return this.#columns[lastDrop.column].rows[lastDrop.row];
                currentRow++;
                currentCol--;
            }
        }

        // if it's a tie
        let available = 0;
        for (let i = 0; i < this.#columns.length; i++) {
            if (this.#columns[i].rows[0] === null) {
                available++;
            }
        }

        if (available === 0)
            return "tie";

        // no winner
        return null;
    }

    get currentPlayer() {
        return this.#currentPlayer;
    }

    get numHumanPlayers() {
        return this.#numHumanPlayers;
    }

    get winner() {
        return this.#winner;
    }

    get columns() {
        return this.#columns;
    }

    get startingPlayer() {
        return this.#startingPlayer;
    }

}










