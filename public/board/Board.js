class Board {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.columns = [];
        this.turn = "";
        this.currentPlayer;
        this.init();
    }

    draw() {
        // draw the board
        for (let i = 0; i < COLUMNS; i++) {
            this.columns[i].draw();
        }
    }

    init() {
        for (let i = 0; i < COLUMNS; i++) {
            this.columns.push(new Column(i * width / COLUMNS));
        }
        this.reset();
    }

    reset() {
        for (let i = 0; i < COLUMNS; i++) {
            this.columns[i].reset();
        }

        startingPlayer = settingsMenu.startToggle.position == 1 ? player1 : player2;
        this.currentPlayer = startingPlayer;

        numHumanPlayers = settingsMenu.t1.position == 1 && settingsMenu.t2.position == 1 ? 2 : settingsMenu.t1.position == 1 || settingsMenu.t2.position == 1 ? 1 : 0;

        if (numHumanPlayers < 2) {
            if (settingsMenu.t1.position == 0 && settingsMenu.startToggle.position == 1 || settingsMenu.t2.position == 0 && settingsMenu.startToggle.position == 0) {
                this.aiPlay(startingPlayer);
            }
        }

        winner = "";
    }

    drop(column) {
        this.columns[column].onClick(column);
        this.changePlayer();
    }

    humanPlay() {
        let column = floor(mouseX / (width / COLUMNS));
        this.drop(column);
    }

    aiPlay() {
        this.drop(bestMove(this.currentPlayer));
    }

    changePlayer() {
        if (this.currentPlayer == player1) {
            this.currentPlayer = player2;
        } else {
            this.currentPlayer = player1;
        }
    }

    checkWinner(lastDrop) {
        let playerCount = 0;

        // these are the minimum and maximum rows and columns that we have to check for the win condition
        let minCol = max(lastDrop.column - 3, 0);
        let maxCol = min(lastDrop.column + 3, this.columns.length - 1);
        let minRow = max(lastDrop.row - 3, 0);
        let maxRow = min(lastDrop.row + 3, this.columns[0].rows.length - 1);

        /**** For each win direction, just check the slice that the last piece dropped is in****/
        // Horizontal
        // loop through each possible starting column
        for (let i = minCol; i <= maxCol - 3; i++) {
            playerCount = 0;
            for (let j = 0; j <= 3; j++) {
                if (this.columns[i + j].rows[lastDrop.row].player == this.columns[lastDrop.column].rows[lastDrop.row].player)
                    playerCount++;
            }
            if (playerCount >= 4)
                return this.columns[lastDrop.column].rows[lastDrop.row].player;
        }


        // Vertical
        for (let i = minRow; i <= maxRow - 3; i++) {
            playerCount = 0;
            for (let j = 0; j <= 3; j++) {
                if (this.columns[lastDrop.column].rows[i + j].player == this.columns[lastDrop.column].rows[lastDrop.row].player)
                    playerCount++;
            }
            if (playerCount >= 4)
                return this.columns[lastDrop.column].rows[lastDrop.row].player;
        }

        // Backwards Slash
        let currentRow = (lastDrop.row - min(lastDrop.row - minRow, lastDrop.column - minCol));
        let currentCol = (lastDrop.column - min(lastDrop.row - minRow, lastDrop.column - minCol));
        if (currentCol <= 3 && currentRow <= 2) {
            while (currentRow <= maxRow - 3 && currentCol <= maxCol - 3) {
                playerCount = 0;
                for (let i = 0; i <= 3; i++) {
                    if (this.columns[currentCol + i].rows[currentRow + i].player == this.columns[lastDrop.column].rows[lastDrop.row].player)
                        playerCount++;
                }
                if (playerCount >= 4)
                    return this.columns[lastDrop.column].rows[lastDrop.row].player;
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
                for (let i = 0; i <= 3; i++) {
                    if (this.columns[currentCol - i].rows[currentRow + i].player == this.columns[lastDrop.column].rows[lastDrop.row].player)
                        playerCount++;
                }
                if (playerCount >= 4)
                    return this.columns[lastDrop.column].rows[lastDrop.row].player;
                currentRow++;
                currentCol--;
            }
        }

        // if it's a tie
        let available = 0;
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].rows[0].player == "") {
                available++;
            }
        }

        if (available == 0)
            return "tie";

        // no winner
        return "";
    }
}










