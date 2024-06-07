class Player {

    constructor(name, token){
        this.name = name;
        this.token = token;
    }

}

class Cell {

    constructor() {
        this.value = 0;
        this.valueSymbol = '';
    }

    addToken(player){
        this.value = player
        this.valueSymbol = (player === 1) ? 'X' : 'O';
    }
    
}

class Board {

    constructor() {
        this.board = [];

        for (let i = 0; i < 3; i++) {
            this.board[i] = [];
            for (let j = 0; j < 3; j++) {
              this.board[i].push(new Cell());
            }
          }

    }

    get rowsCellValues(){
        return this.board.map(function(row) {
            return row.map(function(cell) {
                return cell.value;
            });
        });
    }

    get columnCellValues(){
        const transposedMatrix= [];
        const matrix = this.rowsCellValues;
        for (let j = 0; j < 3; j++) {
            // Create a new row for each column
            transposedMatrix[j] = [];
            // Loop through rows
            for (let i = 0; i < 3; i++) {
                // Fill the transposed matrix with values from the original matrix
                transposedMatrix[j][i] = matrix[i][j];
            }
        }
        return transposedMatrix
    }

    get diagonalCellValues(){
        const matrix = this.rowsCellValues;
        const mainDiagonal = [];
        const secondaryDiagonal = [];

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                // If element belongs to main diagonal
                if (i === j) {
                    mainDiagonal.push(matrix[i][j]);
                }
                // If element belongs to secondary diagonal
                if (i + j === 2) {
                    secondaryDiagonal.push(matrix[i][j]);
                }
            }
        }
        return [mainDiagonal, secondaryDiagonal];
    }

    placeToken(row,column,player){
        let cell = this.board[row][column];
        cell.addToken(player);
    }

    printBoard(){
        console.log(this.rowsCellValues);
    };

    checkWin(){
        const winArray = [...this.rowsCellValues, ...this.columnCellValues, ...this.diagonalCellValues]
        const winArrayStr = JSON.stringify(winArray);
        const winPlayerOne = JSON.stringify([1,1,1]);
        const winPlayerTwo = JSON.stringify([2,2,2]);
        
        if (winArrayStr.includes(winPlayerOne) || winArrayStr.includes(winPlayerTwo)){
            return true
        }
        else{
            return false
        }
    }

    checkTie(){
        const tie = (array) => array.includes(0)
        return !this.rowsCellValues.some(tie);
    }
}


class GameController{
    
    #_playerOneName
    #_playerTwoName
    #_board
    #_playerOne
    #_playerTwo
    #_players
    #_activePlayer
    #_message
    #_playerMessage


    constructor(playerOneName = "Player One",
    playerTwoName = "Player Two"){
        this.#_playerOneName = playerOneName;
        this.#_playerTwoName = playerTwoName;
        this.#_board = new Board();
        this.#_playerOne = new Player(playerOneName,1);
        this.#_playerTwo = new Player(playerTwoName,2);
        this.#_players = [this.#_playerOne, this.#_playerTwo];
        this.#_activePlayer = this.#_players[0];
        //this.#printNewRound(); // Initial play game message
        this.#_message = '';
        this.#_playerMessage = '';
    }

    get activePlayer(){
        return this.#_activePlayer;
    }

    set activePlayer(value){
        this.#_activePlayer = value; 
    }

    get board(){
        return this.#_board
    }

    get  message(){
        return this.#_message
    }

    set message(value){
        this.#_message = value
    }

    get playerMessage() {
        return `${this.#_activePlayer.name}'s turn.`
    }


    #switchPlayerTurn(){
        this.#_activePlayer = this.#_activePlayer === this.#_players[0] ? this.#_players[1] : this.#_players[0];
    }

    /*#printNewRound(){
        this.#_board.printBoard();
        console.log(this.playerMessage);
    }
    */

    playRound(row, column){
            const placeValue = this.#_board.board[row][column].value 
            // Place a token for the current player
            
            // Check if the selected position is already occupied
            if (placeValue !== 0) {
            this.#_message = 'This space is already selected by the other player.';
            //this.#printNewRound();
            return; // Exit the function early
            }

            // Place the token
            this.#_board.placeToken(row, column, this.#_activePlayer.token);

            // Check if the current player has won
            if (this.#_board.checkWin()) {
            this.#_message = (`${this.#_activePlayer.name} Wins!`);
            //this.#_board.printBoard()
            return
            }

            // Check if it's a tie
            if (this.#_board.checkTie()) {
            this.#_message = 'No more blank spaces. It is a Tie.';
            //this.#_board.printBoard()
            return
            }

            // Switch player's turn and print new round
            this.#switchPlayerTurn();
            //this.#printNewRound();
        }
    
    reset(){
        this.#_board = new Board();
        this.#_activePlayer = this.#_players[0];
        this.#_message = '';
        this.#_playerMessage = '';
    }
}

function ScreenController() {
    const game = new GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const messDiv = document.querySelector('.message')
    const resetButton = document.querySelector('.resetButton')

    const updateScreen = () => {
        // clear the board
        boardDiv.textContent = "";
  
        // get the newest version of the board and player turn
        const board = game.board.board
  
        // Display player's turn
        playerTurnDiv.textContent = game.playerMessage;
        
        //Display messages
        messDiv.textContent = game.message
        
        // Render board squares
        board.forEach((row, rowIndex) => {
            row.forEach((cell, columIndex) => {
            // Anything clickable should be a button!!
            const cellButton = document.createElement("button");
            cellButton.classList.add("cell");
            // Create a data attribute to identify the column
            // This makes it easier to pass into our `playRound` function 
            cellButton.dataset.row = rowIndex;
            cellButton.dataset.column = columIndex;
            cellButton.textContent = cell.valueSymbol;
            boardDiv.appendChild(cellButton);
            })
        })
    }

    // Event listener for the reset button 
    resetButton.addEventListener('click', function() {
        game.reset();
        updateScreen();
    });

    // Add event listener for the board
    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column;
        const selectedRow = e.target.dataset.row;
        // Make sure I've clicked a column and not the gaps in between
        if ((!selectedColumn) || (!selectedRow)) return;
        
        //Avoid placing tokens once the game is finished
        if ((game.board.checkWin()) || (game.board.checkTie())) return;

      game.playRound(selectedRow, selectedColumn);
      updateScreen();
    }
    
    boardDiv.addEventListener("click", clickHandlerBoard);
    
    // Initial render
    updateScreen();

  }
  
ScreenController();



