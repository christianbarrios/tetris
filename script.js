document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('start-button');

    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');
    const downButton = document.getElementById('down-button');
    const rotateButton = document.getElementById('rotate-button');

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
            [width, width + 1, width + 2, width + 3], // Horizontal
            [1, 1 + width, 1 + 2 * width, 1 + 3 * width] // Vertical
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
    
    // Standard Super Rotation System (SRS) Wall Kick Data
    // kickOffsets[pieceType][fromRotation_toRotation_index] = [deltaX, deltaY]
    // where deltaY is vertical offset (multiplied by width), deltaX is horizontal offset.
    const kickOffsets = {
        'JLTZ': {
            '0_1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
            '1_0': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
            '1_2': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
            '2_1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
            '2_3': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
            '3_2': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
            '3_0': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
            '0_3': [[0,0], [1,0], [1,-1], [0,2], [1,-2]]
        },
        'I': {
            '0_1': [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
            '1_0': [[0,0], [2,0], [-1,0], [2,-1], [-1,2]],
            '1_2': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
            '2_1': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
            '2_3': [[0,0], [2,0], [-1,0], [2,-1], [-1,2]],
            '3_2': [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
            '3_0': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
            '0_3': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]]
        },
        'O': { // O-piece does not use wall kicks to rotate
            '0_1': [[0,0]], '1_0': [[0,0]], '1_2': [[0,0]], '2_1': [[0,0]],
            '2_3': [[0,0]], '3_2': [[0,0]], '3_0': [[0,0]], '0_3': [[0,0]]
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
            // Only draw if within board boundaries
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
        // Start position - roughly centered at the top
        currentPosition = Math.floor(width / 2) - 1; // Adjust for typical Tetris spawn point
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
        // Check if moving left would cross the right edge of the board (wrap around)
        // Or if any part of the tetromino would cross the left edge.
        const isAtLeftEdge = tetrominoes[currentTetromino.type][rotation].some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge && isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
            currentPosition = nextPosition;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const nextPosition = currentPosition + 1;
        // Check if moving right would cross the left edge of the board (wrap around)
        // Or if any part of the tetromino would cross the right edge.
        const isAtRightEdge = tetrominoes[currentTetromino.type][rotation].some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge && isValidMove(nextPosition, tetrominoes[currentTetromino.type][rotation])) {
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
        if (nextRotation < 0) nextRotation += tetrominoes[currentTetromino.type].length; // Ensure positive rotation

        const nextShape = tetrominoes[currentTetromino.type][nextRotation];
        
        // Determine which set of kick data to use (JLTZ, I, or O)
        const kickSet = currentTetromino.type === 'I' ? 'I' : (currentTetromino.type === 'O' ? 'O' : 'JLTZ');
        const rotationKey = `${originalRotation}_${nextRotation}`;
        const kicks = kickOffsets[kickSet][rotationKey];

        let rotationSuccessful = false;

        for (let i = 0; i < kicks.length; i++) {
            const [offsetX, offsetY] = kicks[i];
            // Calculate the test position by applying the kick offset
            // offsetY is multiplied by `width` because it's a row offset
            const testPosition = originalPosition + offsetX + (offsetY * width);

            if (isValidMove(testPosition, nextShape)) {
                currentPosition = testPosition;
                rotation = nextRotation;
                rotationSuccessful = true;
                break; // Exit loop if a valid kick is found
            }
        }
        
        if (!rotationSuccessful) {
            rotation = originalRotation; // Revert to original rotation
            currentPosition = originalPosition; // Revert to original position
        }
        draw();
    }

    // Check if a move is valid
    function isValidMove(testPosition, shape) {
        // Ensure 'shape' is always an array
        if (!Array.isArray(shape)) {
            console.error("isValidMove: 'shape' is not an array.", shape);
            return false;
        }

        return shape.every(index => {
            const newCellIndex = testPosition + index;
            const x = newCellIndex % width;
            const y = Math.floor(newCellIndex / width);

            // 1. Check if it's within the top/bottom boundaries (0 to height*width - 1)
            if (newCellIndex < 0 || newCellIndex >= width * height) {
                return false;
            }

            // 2. Check for horizontal boundary crossing (e.g., piece wrapping around from right to left)
            // This is the most crucial part for rotation issues.
            // Compare the x-coordinate of the current block with the x-coordinate of its "root" within the piece.
            // If the piece crosses a wall, the X coordinates won't align correctly.
            // This is complex, so let's use a simpler, common approach for SRS:
            // Ensure the individual block's new X position is within the board, AND
            // ensure it doesn't cross a "vertical line" that isn't expected for the piece's current position.
            const originalXOfPiece = testPosition % width;
            const originalYOfPiece = Math.floor(testPosition / width);
            
            const blockXRelativeToPieceStart = index % width; // X-coord of block within its shape definition (0-9)
            const blockYRelativeToPieceStart = Math.floor(index / width); // Y-coord of block within its shape definition (0-3)

            // If the block would move to a different row but its relative X is still the same, that's fine.
            // The problem is when a block would "cross a wall" horizontally.
            
            // This check needs to be precise: ensure all blocks of the piece remain within the same 'column chunk'
            // as the overall piece's horizontal position.
            if (Math.floor((testPosition + index) / width) !== Math.floor(testPosition / width) + blockYRelativeToPieceStart) {
                 // If the block is on a different row than expected based on the piece's Y position, it means
                 // it likely wrapped vertically, which shouldn't happen during a horizontal move/rotation check.
                 // This specific check might be too aggressive or not hit the core problem.
            }
            
            // The most robust horizontal check: ensure all blocks of the piece
            // stay within the same column range *relative to the original position*
            // This is often handled implicitly by carefully crafted wall kick data.
            // Let's focus on simple border check and collision for now.
            
            // Simplified check: if block's x is wildly different from piece's x, it's a wrap-around
            // Example: if piece starts at x=0, and a block lands at x=9, it wrapped.
            // This depends on the piece's structure. For SRS, wall kicks handle this.
            
            // A more direct check for horizontal wrapping during any move:
            const currentBlockX = (currentPosition + index) % width;
            const testBlockX = newCellIndex % width;
            
            // If the piece moved by -1 (left) and crossed right boundary, or +1 (right) and crossed left boundary
            const movedHorizontally = Math.abs(currentBlockX - testBlockX) > 1 && Math.abs(currentBlockX - testBlockX) < width - 1;

            if (movedHorizontally) {
                // This is a simple flag, a true SRS check is much more complex
                // and often done by making sure the test kicks don't cause these issues
            }

            // Simpler and generally sufficient for SRS with correct kick data:
            // Check if the block's new X position is within the 0-width-1 range.
            // This covers horizontal boundaries.
            if (x < 0 || x >= width) return false;


            // 3. Check for collision with already frozen tetrominoes
            if (gameBoard.children[newCellIndex] && gameBoard.children[newCellIndex].classList.contains('tetromino-fixed')) {
                return false;
            }

            return true;
        });
    }
    
    // Freeze the tetromino when it lands
    function freeze() {
        const shape = tetrominoes[currentTetromino.type][rotation];
        shape.forEach(index => {
            const cellIndex = currentPosition + index;
            if (cellIndex >= 0 && cellIndex < width * height) { // Ensure within bounds before adding class
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
                // Shift all cells above the cleared row downwards
                for (let i = rowStart - 1; i >= 0; i--) {
                    const currentCell = gameBoard.children[i];
                    const targetCell = gameBoard.children[i + cellsToRemove];
                    if (currentCell && targetCell) {
                        targetCell.className = currentCell.className; // Copy all classes (fixed, color)
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

    const timerDisplay = document.getElementById('timer');
    let gameTime = 0;
    let timerInterval = null;

    // ... (Your existing code here, before the functions) ...
    
    // START NEW CODE

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
        
        // ---
        // NEW LINE TO ADD
        // ---
        startTimer(); // Start the timer
    }

    // End the game
    function endGame() {
        clearInterval(timerId);
        // ---
        // NEW LINE TO ADD
        // ---
        stopTimer(); // Stop the timer
        gameOver = true;
        document.removeEventListener('keydown', control);
        alert('¡Game Over! Puntuación final: ' + score);
    }

    startButton.addEventListener('click', startGame);
    leftButton.addEventListener('click', moveLeft);
    rightButton.addEventListener('click', moveRight);
    downButton.addEventListener('click', moveDown);
    rotateButton.addEventListener('click', rotate);


    initBoard(); // Initialize board on page load
});