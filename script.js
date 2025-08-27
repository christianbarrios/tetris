document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('start-button');

    const width = 10;
    const height = 20;
    let board = [];
    let score = 0;
    let currentTetromino = null;
    let currentPosition = 0;
    let rotation = 0;
    let timerId = null;
    let gameOver = false;

    const tetrominoes = {
        I: [
            [width, width + 1, width + 2, width + 3],
            [1, 1 + width, 1 + 2 * width, 1 + 3 * width]
        ],
        J: [
            [1, width + 1, 2 * width + 1, 2 * width],
            [width, width + 1, width + 2, 2],
            [1, 2 * width + 1, 2 * width + 2, width + 2],
            [width, 2 * width, 2 * width + 1, 2 * width + 2]
        ],
        L: [
            [0, 1, width + 1, 2 * width + 1],
            [width, width + 1, width + 2, 2 * width + 2],
            [1, width + 1, 2 * width + 1, 2],
            [width, 2 * width, 2 * width + 1, 2 * width + 2]
        ],
        O: [
            [0, 1, width, width + 1]
        ],
        S: [
            [width + 1, width + 2, 2 * width, 2 * width + 1],
            [0, width, width + 1, 2 * width + 1]
        ],
        T: [
            [1, width, width + 1, width + 2],
            [1, width + 1, 2 * width + 1, width],
            [width, width + 1, width + 2, 2 * width + 1],
            [1, width + 1, 2 * width + 1, width + 2]
        ],
        Z: [
            [0, width, width + 1, 2 * width + 1],
            [width + 1, width + 2, 2 * width, 2 * width + 1]
        ]
    };

    const tetrominoColors = {
        I: 'tetromino-I', J: 'tetromino-J', L: 'tetromino-L',
        O: 'tetromino-O', S: 'tetromino-S', T: 'tetromino-T', Z: 'tetromino-Z'
    };
    
    // Wall Kick Data (Super Rotation System simplified)
    const wallKickData = {
        'J': {
            '0_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '1_0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '1_2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '2_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '2_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            '3_2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '3_0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '0_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
        },
        'L': {
            '0_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '1_0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '1_2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '2_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '2_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            '3_2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '3_0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '0_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
        },
        'T': {
            '0_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '1_0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '1_2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '2_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '2_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            '3_2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '3_0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '0_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
        },
        'S': {
            '0_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '1_0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '1_2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '2_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '2_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            '3_2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '3_0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '0_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
        },
        'Z': {
            '0_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '1_0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '1_2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            '2_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            '2_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            '3_2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '3_0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            '0_3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
        },
        'I': {
            '0_1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
            '1_0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
            '1_2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
            '2_1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
            '2_3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
            '3_2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
            '3_0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
            '0_3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
        },
        'O': {
            '0_1': [[0, 0]], '1_0': [[0, 0]], '1_2': [[0, 0]], '2_1': [[0, 0]],
            '2_3': [[0, 0]], '3_2': [[0, 0]], '3_0': [[0, 0]], '0_3': [[0, 0]]
        }
    };

    // Initialize the game board
    function initBoard() {
        gameBoard.innerHTML = '';
        board = [];
        for (let i = 0; i < width * height; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gameBoard.appendChild(cell);
            board.push(null);
        }
    }

    // Draw the current tetromino
    function draw() {
        if (!currentTetromino) return;
        const shape = tetrominoes[currentTetromino.type][rotation];
        shape.forEach(index => {
            const cellIndex = currentPosition + index;
            if (cellIndex >= 0 && cellIndex < width * height) {
                const cell = gameBoard.children[cellIndex];
                if (cell) {
                    cell.classList.add(tetrominoColors[currentTetromino.type]);
                }
            }
        });
    }

    // Undraw the current tetromino
    function undraw() {
        if (!currentTetromino) return;
        const shape = tetrominoes[currentTetromino.type][rotation];
        shape.forEach(index => {
            const cellIndex = currentPosition + index;
            if (cellIndex >= 0 && cellIndex < width * height) {
                const cell = gameBoard.children[cellIndex];
                if (cell) {
                    cell.classList.remove(tetrominoColors[currentTetromino.type]);
                }
            }
        });
    }

    // Generate a new random tetromino
    function generateTetromino() {
        const types = Object.keys(tetrominoes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        currentTetromino = { type: randomType, color: tetrominoColors[randomType] };
        currentPosition = Math.floor(width / 2) - Math.floor(tetrominoes[randomType][0].length / 2);
        rotation = 0;

        if (!isValidMove(currentPosition, tetrominoes[currentTetromino.type][rotation])) {
            endGame();
        } else {
            draw();
        }
    }

    // Move tetromino down
    function moveDown() {
        undraw();
        const nextPosition = currentPosition + width;
        if (isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
            currentPosition = nextPosition;
            draw();
        } else {
            freeze();
            generateTetromino();
        }
    }

    // Move tetromino left
    function moveLeft() {
        undraw();
        const nextPosition = currentPosition - 1;
        if (isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
            currentPosition = nextPosition;
        }
        draw();
    }

    // Move tetromino right
    function moveRight() {
        undraw();
        const nextPosition = currentPosition + 1;
        if (isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
            currentPosition = nextPosition;
        }
        draw();
    }

    // Rotate tetromino
    function rotate() {
        const originalRotation = rotation;
        const originalPosition = currentPosition;
        undraw();
    
        let nextRotation = (rotation + 1) % tetrominoes[currentTetromino.type].length;
        if (nextRotation < 0) nextRotation += tetrominoes[currentTetromino.type].length;

        const nextShape = tetrominoes[currentTetromino.type][nextRotation];
        
        const rotationKey = `${originalRotation}_${nextRotation}`;
        const kicks = wallKickData[currentTetromino.type][rotationKey];

        let rotationSuccessful = false;

        for (let i = 0; i < kicks.length; i++) {
            const [offsetX, offsetY] = kicks[i];
            const testPosition = originalPosition + offsetX + (offsetY * width);

            if (isValidMove(testPosition, nextShape)) {
                currentPosition = testPosition;
                rotation = nextRotation;
                rotationSuccessful = true;
                break;
            }
        }
        
        if (!rotationSuccessful) {
            rotation = originalRotation;
            currentPosition = originalPosition;
        }
        draw();
    }

    // Check if a move is valid
    function isValidMove(testPosition, shape) {
        return shape.every(index => {
            const newCellIndex = testPosition + index;
            const newX = newCellIndex % width;
            const newY = Math.floor(newCellIndex / width);
            const pieceX = index % width;

            if (newCellIndex < 0 || newCellIndex >= width * height) return false;
            
            if (Math.floor((testPosition + index) / width) !== newY) {
                if (Math.abs(newX - pieceX) > 1 && Math.abs(newY - Math.floor(index / width)) > 1) {
                    return false;
                }
            }

            if(gameBoard.children[newCellIndex].classList.contains('tetromino-fixed')) return false;

            return true;
        });
    }

    // Fix the tetromino when it lands
    function freeze() {
        const shape = tetrominoes[currentTetromino.type][rotation];
        shape.forEach(index => {
            const cellIndex = currentPosition + index;
            if (cellIndex >= 0 && cellIndex < width * height) {
                gameBoard.children[cellIndex].classList.add('tetromino-fixed');
                gameBoard.children[cellIndex].classList.add(tetrominoColors[currentTetromino.type]);
            }
        });
        checkRows();
        scoreDisplay.textContent = score;
    }

    // Check and clear completed rows
    function checkRows() {
        for (let r = 0; r < height; r++) {
            const rowStart = r * width;
            const rowEnd = rowStart + width;
            const rowCells = Array.from(gameBoard.children).slice(rowStart, rowEnd);

            if (rowCells.every(cell => cell.classList.contains('tetromino-fixed'))) {
                score += 100;
                rowCells.forEach(cell => {
                    cell.classList.remove('tetromino-fixed');
                    Object.values(tetrominoColors).forEach(colorClass => cell.classList.remove(colorClass));
                });
                
                const cellsToRemove = rowCells.length;
                for (let i = rowStart - 1; i >= 0; i--) {
                    const currentCell = gameBoard.children[i];
                    const targetCell = gameBoard.children[i + cellsToRemove];
                    if (currentCell && targetCell) {
                        targetCell.className = currentCell.className;
                    }
                }
            }
        }
    }

    // Handle keyboard events
    function control(e) {
        if (gameOver) return;
        if (e.key === 'ArrowLeft') {
            moveLeft();
        } else if (e.key === 'ArrowRight') {
            moveRight();
        } else if (e.key === 'ArrowDown') {
            moveDown();
        } else if (e.key === 'ArrowUp') {
            rotate();
        }
    }

    // Start the game
    function startGame() {
        if (timerId) clearInterval(timerId);
        gameOver = false;
        score = 0;
        scoreDisplay.textContent = score;
        initBoard();
        generateTetromino();
        document.addEventListener('keydown', control);
        timerId = setInterval(moveDown, 1000);
    }

    // End the game
    function endGame() {
        clearInterval(timerId);
        gameOver = true;
        document.removeEventListener('keydown', control);
        alert('Game Over! Final Score: ' + score);
    }

    startButton.addEventListener('click', startGame);

    initBoard();
});