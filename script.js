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

    // Tetromino shapes and their rotations
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
    
    // Wall Kick Data (Super Rotation System)
    const wallKickData = {
        'JLTZ': {
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
        currentPosition = Math.floor(width / 2) - Math.floor(tetrominoes[randomType][0].length / 2);
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
        if (isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
            currentPosition = nextPosition;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const nextPosition = currentPosition + 1;
        if (isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
            currentPosition = nextPosition;
        }
        draw();
    }

    function rotate() {
        const originalRotation = rotation;
        const originalPosition = currentPosition;
        undraw();
    
        let nextRotation = (rotation + 1) % tetrominoes[currentTetromino.type].length;
        if (nextRotation < 0) nextRotation += tetrominoes[currentTetromino.type].length;

        const nextShape = tetrominoes[currentTetromino.type][nextRotation];
        
        let rotationKey;
        if (currentTetromino.type === 'O') {
             rotationKey = '0_1'; // La O no rota, siempre usa el mismo kick
        } else if (['J', 'L', 'T', 'S', 'Z'].includes(currentTetromino.type)) {
            rotationKey = `${originalRotation}_${nextRotation}`;
        } else { // I piece
            rotationKey = `${originalRotation}_${nextRotation}`;
        }
        
        const kicks = wallKickData[currentTetromino.type === 'I' ? 'I' : currentTetromino.type === 'O' ? 'O' : 'JLTZ'][rotationKey];

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
        return shape.every(index => {
            const newCellIndex = testPosition + index;

            if (newCellIndex < 0 || newCellIndex >= width * height) return false;

            const x = newCellIndex % width;
            if (x < 0 || x >= width) return false;

            if (gameBoard.children[newCellIndex].classList.contains('tetromino-fixed')) return false;

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

    function endGame() {
        clearInterval(timerId);
        gameOver = true;
        document.removeEventListener('keydown', control);
        alert('¡Game Over! Puntuación final: ' + score);
    }

    startButton.addEventListener('click', startGame);

    initBoard();
});