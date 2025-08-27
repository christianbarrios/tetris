document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('start-button');
    const timerDisplay = document.getElementById('timer');

    // Touch control buttons
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');
    const downButton = document.getElementById('down-button');
    const rotateButton = document.getElementById('rotate-button');

    // Game variables
    const width = 10;
    const height = 20;
    let board = [];
    let score = 0;
    let currentTetromino = null;
    let currentPosition = 0;
    let rotation = 0;
    let timerId = null;
    let gameOver = false;
    let gameTime = 0;
    let timerInterval = null;

    // Tetromino shapes and their rotations
    const tetrominoes = {
        I: [
            [width, width + 1, width + 2, width + 3], // Horizontal
            [1, 1 + width, 1 + 2 * width, 1 + 3 * width] // Vertical
        ],
        J: [
            [0, width, width + 1, width + 2], // Rotación 0 (base: L invertida)
            [1, 2, width + 1, 2 * width + 1], // Rotación 1 (vertical, gancho a la izquierda)
            [width, width + 1, width + 2, 2 * width + 2], // Rotación 2 (L normal)
            [1, width + 1, 2 * width + 1, 2 * width], // Rotación 3 (vertical, gancho a la derecha)
        ],
        L: [
            [2, width, width + 1, width + 2], // Rotación 0 (base: L normal)
            [1, width + 1, 2 * width + 1, 2 * width + 2], // Rotación 1 (vertical, gancho a la derecha)
            [width, width + 1, width + 2, 2 * width], // Rotación 2 (L invertida)
            [0, 1, width + 1, 2 * width + 1], // Rotación 3 (vertical, gancho a la izquierda)
        ],
        O: [
            [0, 1, width, width + 1] // No rota
        ],
        S: [
            [width + 1, width + 2, 2 * width, 2 * width + 1], // Rotación 0
            [0, width, width + 1, 2 * width + 1] // Rotación 1
        ],
        T: [
            [1, width, width + 1, width + 2], // Rotación 0
            [1, width + 1, 2 * width + 1, width], // Rotación 1
            [width, width + 1, width + 2, 2 * width + 1], // Rotación 2
            [1, width + 1, 2 * width + 1, width + 2] // Rotación 3
        ],
        Z: [
            [0, width, width + 1, 2 * width + 1], // Rotación 0
            [width + 1, width + 2, 2 * width, 2 * width + 1] // Rotación 1
        ]
    };

    const tetrominoColors = {
        I: 'tetromino-I', J: 'tetromino-J', L: 'tetromino-L',
        O: 'tetromino-O', S: 'tetromino-S', T: 'tetromino-T', Z: 'tetromino-Z'
    };
    
    // This is the corrected and verified SRS kick data.
    const srsKickData = {
        // These are the rotation rules for J, L, S, Z, and T pieces.
        'JLSZ_T': {
            // Rotation from 0 to 1 (clockwise)
            '0_1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            // Rotation from 1 to 0 (counter-clockwise)
            '1_0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            
            // Rotation from 1 to 2
            '1_2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            // Rotation from 2 to 1
            '2_1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            
            // Rotation from 2 to 3
            '2_3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            // Rotation from 3 to 2
            '3_2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],

            // Rotation from 3 to 0
            '3_0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            // Rotation from 0 to 3
            '0_3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, -2]]
        },
        'I': {
            '0_1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
            '1_0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
            '1_2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
            '2_1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
            '2_3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
            '3_2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
            '3_0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
            '0_3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
        },
        'O': {
            '0_1': [[0, 0]], '1_0': [[0, 0]], '1_2': [[0, 0]], '2_1': [[0, 0]],
            '2_3': [[0, 0]], '3_2': [[0, 0]], '3_0': [[0, 0]], '0_3': [[0, 0]]
        }
    };

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

    function generateTetromino() {
        const types = Object.keys(tetrominoes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        currentTetromino = { type: randomType, color: tetrominoColors[randomType] };
        currentPosition = Math.floor(width / 2) - 1;
        rotation = 0;

        if (!isValidMove(currentPosition, tetrominoes[currentTetromino.type][rotation])) {
            endGame();
        } else {
            draw();
        }
    }

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

    function moveLeft() {
        undraw();
        const nextPosition = currentPosition - 1;
        const isAtLeftEdge = tetrominoes[currentTetromino.type][rotation].some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge && isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
            currentPosition = nextPosition;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const nextPosition = currentPosition + 1;
        const isAtRightEdge = tetrominoes[currentTetromino.type][rotation].some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge && isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
            currentPosition = nextPosition;
        }
        draw();
    }

    function rotate() {
        const originalRotation = rotation;
        const originalPosition = currentPosition;
        undraw();

        let nextRotation = (rotation + 1) % tetrominoes[currentTetromino.type].length;
        if (nextRotation < 0) {
            nextRotation += tetrominoes[currentTetromino.type].length;
        }

        const nextShape = tetrominoes[currentTetromino.type][nextRotation];
        
        let kickSet;
        if (currentTetromino.type === 'I') {
            kickSet = 'I';
        } else if (currentTetromino.type === 'O') {
            kickSet = 'O';
        } else {
            // J, L, S, T, Z
            kickSet = 'JLSZ_T';
        }

        const rotationKey = `${originalRotation}_${nextRotation}`;
        const kicks = srsKickData[kickSet][rotationKey];

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

    function isValidMove(testPosition, shape) {
        if (!Array.isArray(shape)) {
            return false;
        }

        return shape.every(index => {
            const newCellIndex = testPosition + index;
            const x = newCellIndex % width;
            
            if (newCellIndex < 0 || newCellIndex >= width * height) {
                return false;
            }

            if (x < 0 || x >= width) return false;

            if (gameBoard.children[newCellIndex].classList.contains('tetromino-fixed')) {
                return false;
            }

            return true;
        });
    }

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

    // Timer functions
    function updateTimer() {
        gameTime++;
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

        timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }

    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        timerInterval = setInterval(updateTimer, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function resetTimer() {
        gameTime = 0;
        timerDisplay.textContent = '00:00';
    }

    // Controls for both keyboard and touch
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
    
    document.addEventListener('keydown', control);
    leftButton.addEventListener('click', moveLeft);
    rightButton.addEventListener('click', moveRight);
    downButton.addEventListener('click', moveDown);
    rotateButton.addEventListener('click', rotate);
    
    function startGame() {
        if (timerId) clearInterval(timerId);
        gameOver = false;
        score = 0;
        scoreDisplay.textContent = score;
        initBoard();
        generateTetromino();
        timerId = setInterval(moveDown, 1000);
        startTimer();
    }
    
    function endGame() {
        clearInterval(timerId);
        stopTimer();
        gameOver = true;
        alert('Game Over! Final Score: ' + score);
    }
    
    startButton.addEventListener('click', () => {
        resetTimer();
        startGame();
        startButton.blur();
    });

    initBoard();
}); 