let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = '';
let scoreX = 0;
let scoreO = 0;
let playerXName = '';
let playerOName = '';
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const winnerPopup = document.getElementById('winnerPopup');
const winnerText = document.getElementById('winnerText');
const nameInputDiv = document.getElementById('nameInput');
const gameBoard = document.getElementById('gameBoard');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);

function startGame() {
    playerXName = document.getElementById('playerX').value || 'Player X';
    playerOName = document.getElementById('playerO').value || 'Player O';

    // Get the first letters of the player names
    const playerXSymbol = playerXName.charAt(0).toUpperCase();
    const playerOSymbol = playerOName.charAt(0).toUpperCase();

    // Update player names and scores in the score display
    document.getElementById('playerXScore').textContent = `${playerXName} (${playerXSymbol}): ${scoreX}`;
    document.getElementById('playerOScore').textContent = `${playerOName} (${playerOSymbol}): ${scoreO}`;
    currentPlayer = playerXSymbol;

    board.fill('');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.addEventListener('click', handleClick, { once: true });
    });
    
    nameInputDiv.style.display = 'none';
    gameBoard.style.display = 'grid';
}

function handleClick(e) {
    const index = e.target.dataset.index;
    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;

    if (checkWinner(currentPlayer)) {
        handleWin(currentPlayer);
    } else if (board.every(cell => cell)) {
        handleDraw();
    } else {
        currentPlayer = currentPlayer === playerXName.charAt(0).toUpperCase() ? playerOName.charAt(0).toUpperCase() : playerXName.charAt(0).toUpperCase();
    }
}

function checkWinner(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

function handleWin(winner) {
    if (winner === playerXName.charAt(0).toUpperCase()) {
        scoreX++;
        winnerText.textContent = `${playerXName} (${winner}) Wins!`;
    } else {
        scoreO++;
        winnerText.textContent = `${playerOName} (${winner}) Wins!`;
    }
    updateScoreDisplay();
    showPopup();
}

function handleDraw() {
    winnerText.textContent = "It's a Draw!";
    showPopup();
}

function updateScoreDisplay() {
    const playerXSymbol = playerXName.charAt(0).toUpperCase();
    const playerOSymbol = playerOName.charAt(0).toUpperCase();
    document.getElementById('playerXScore').textContent = `${playerXName} (${playerXSymbol}): ${scoreX}`;
    document.getElementById('playerOScore').textContent = `${playerOName} (${playerOSymbol}): ${scoreO}`;
}

function showPopup() {
    winnerPopup.style.display = 'flex';
    setTimeout(() => {
        winnerPopup.style.display = 'none';
        startGame(); // Restart the game without going back to names
    }, 3000);
}

function restartGame() {
    scoreX = 0;
    scoreO = 0;
    updateScoreDisplay();
    nameInputDiv.style.display = 'block';
    gameBoard.style.display = 'none';
}