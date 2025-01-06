class Checkers {
    constructor() {
        this.board = document.getElementById('chessboard');
        this.squares = [];
        this.pieces = [];
        this.selectedPiece = null;
        this.currentTheme = themes.forest; // Default theme for checkers
        this.colors = { ...this.currentTheme };
        this.pieceColors = {
            red: '#e74c3c',
            black: '#2c3e50'
        };
        this.currentTurn = 'red';
        this.boardState = Array(8).fill().map(() => Array(8).fill(null));
        this.pieceSize = 0.9;
        
        // Create groups for board and pieces
        this.boardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.boardGroup.setAttribute('class', 'board-squares');
        this.pieceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.pieceGroup.setAttribute('class', 'pieces');
        
        this.board.appendChild(this.boardGroup);
        this.board.appendChild(this.pieceGroup);
        
        // Initialize the game
        this.createBoard();
        this.setupPieces();
        this.initSettings();
        
        // Add click handler for the board
        this.board.addEventListener('click', this.handleClick.bind(this));
    }

    createBoard() {
        // Clear existing squares
        while (this.boardGroup.firstChild) {
            this.boardGroup.removeChild(this.boardGroup.firstChild);
        }
        this.squares = [];

        // Create squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                const isLight = (row + col) % 2 === 0;
                
                square.setAttribute('x', col * 100);
                square.setAttribute('y', row * 100);
                square.setAttribute('width', 100);
                square.setAttribute('height', 100);
                square.setAttribute('fill', isLight ? this.colors.light : this.colors.dark);
                square.setAttribute('class', 'square');
                square.dataset.row = row;
                square.dataset.col = col;
                
                this.boardGroup.appendChild(square);
                this.squares.push(square);
                this.boardState[row][col] = null;
            }
        }
    }

    setupPieces() {
        // Clear existing pieces
        while (this.pieceGroup.firstChild) {
            this.pieceGroup.removeChild(this.pieceGroup.firstChild);
        }
        this.pieces = [];

        // Setup pieces for both players (12 each)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.createPiece('black', row, col);
                }
            }
        }

        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.createPiece('red', row, col);
                }
            }
        }
    }

    createPiece(color, row, col) {
        const piece = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        piece.setAttribute('class', 'piece');
        piece.dataset.color = color;
        piece.dataset.row = row;
        piece.dataset.col = col;
        piece.dataset.king = 'false';

        // Create the checker piece (circle)
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', col * 100 + 50);
        circle.setAttribute('cy', row * 100 + 50);
        circle.setAttribute('r', 35 * this.pieceSize);
        circle.setAttribute('fill', this.pieceColors[color]);
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '3');

        piece.appendChild(circle);
        this.pieceGroup.appendChild(piece);
        this.pieces.push(piece);
        this.boardState[row][col] = piece;
    }

    initSettings() {
        const themeSelect = document.getElementById('theme');
        const pieceSize = document.getElementById('pieceSize');
        const resetGame = document.getElementById('resetGame');

        themeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            if (themes[selectedTheme]) {
                this.updateTheme(selectedTheme);
            }
        });

        pieceSize.addEventListener('input', (e) => {
            this.pieceSize = parseFloat(e.target.value);
            this.updatePieceSizes();
        });

        resetGame.addEventListener('click', () => {
            this.resetGame();
        });
    }

    updateTheme(themeName) {
        if (!themes[themeName]) return;
        
        this.currentTheme = themes[themeName];
        this.colors = { ...this.currentTheme };
        
        document.body.style.backgroundColor = this.currentTheme.background;
        
        // Update square colors
        this.squares.forEach((square, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isLight = (row + col) % 2 === 0;
            square.setAttribute('fill', isLight ? this.colors.light : this.colors.dark);
        });
    }

    updatePieceSizes() {
        this.pieces.forEach(piece => {
            const circle = piece.querySelector('circle');
            const row = parseInt(piece.dataset.row);
            const col = parseInt(piece.dataset.col);
            circle.setAttribute('r', 35 * this.pieceSize);
        });
    }

    isValidMove(piece, targetRow, targetCol) {
        const currentRow = parseInt(piece.dataset.row);
        const currentCol = parseInt(piece.dataset.col);
        const color = piece.dataset.color;
        const isKing = piece.dataset.king === 'true';
        
        // Basic movement rules
        const rowDiff = targetRow - currentRow;
        const colDiff = Math.abs(targetCol - currentCol);
        
        // Regular move
        if (colDiff === 1) {
            if (color === 'red' && !isKing && rowDiff !== -1) return false;
            if (color === 'black' && !isKing && rowDiff !== 1) return false;
            if (isKing && Math.abs(rowDiff) !== 1) return false;
            return !this.boardState[targetRow][targetCol];
        }
        
        // Capture move
        if (colDiff === 2 && Math.abs(rowDiff) === 2) {
            const jumpedRow = currentRow + rowDiff / 2;
            const jumpedCol = currentCol + (targetCol - currentCol) / 2;
            const jumpedPiece = this.boardState[jumpedRow][jumpedCol];
            
            if (!jumpedPiece || jumpedPiece.dataset.color === color) return false;
            return !this.boardState[targetRow][targetCol];
        }
        
        return false;
    }

    movePiece(piece, targetRow, targetCol) {
        const currentRow = parseInt(piece.dataset.row);
        const currentCol = parseInt(piece.dataset.col);
        
        // Update board state
        this.boardState[currentRow][currentCol] = null;
        this.boardState[targetRow][targetCol] = piece;
        
        // Update piece position
        piece.dataset.row = targetRow;
        piece.dataset.col = targetCol;
        const circle = piece.querySelector('circle');
        circle.setAttribute('cx', targetCol * 100 + 50);
        circle.setAttribute('cy', targetRow * 100 + 50);
        
        // Check for capture
        if (Math.abs(targetCol - currentCol) === 2) {
            const jumpedRow = currentRow + (targetRow - currentRow) / 2;
            const jumpedCol = currentCol + (targetCol - currentCol) / 2;
            const jumpedPiece = this.boardState[jumpedRow][jumpedCol];
            
            if (jumpedPiece) {
                jumpedPiece.remove();
                this.pieces = this.pieces.filter(p => p !== jumpedPiece);
                this.boardState[jumpedRow][jumpedCol] = null;
            }
        }
        
        // Check for king promotion
        if (!piece.dataset.king && 
            ((piece.dataset.color === 'red' && targetRow === 0) || 
             (piece.dataset.color === 'black' && targetRow === 7))) {
            piece.dataset.king = 'true';
            // Add crown to indicate king
            const crown = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            crown.textContent = '♔';
            crown.setAttribute('x', targetCol * 100 + 50);
            crown.setAttribute('y', targetRow * 100 + 50);
            crown.setAttribute('text-anchor', 'middle');
            crown.setAttribute('dominant-baseline', 'middle');
            crown.setAttribute('font-size', '40');
            crown.setAttribute('fill', '#ffffff');
            piece.appendChild(crown);
        }
    }

    handleClick(event) {
        const target = event.target;
        
        // Handle piece selection
        if (target.closest('.piece')) {
            const piece = target.closest('.piece');
            const pieceColor = piece.dataset.color;
            
            // Only allow selecting pieces of current turn
            if (pieceColor === this.currentTurn) {
                if (this.selectedPiece) {
                    // Deselect currently selected piece
                    const circle = this.selectedPiece.querySelector('circle');
                    circle.setAttribute('stroke', '#ffffff');
                    circle.setAttribute('stroke-width', '3');
                }
                
                if (this.selectedPiece !== piece) {
                    // Select new piece
                    this.selectedPiece = piece;
                    const circle = piece.querySelector('circle');
                    circle.setAttribute('stroke', this.colors.selected);
                    circle.setAttribute('stroke-width', '4');
                } else {
                    // Deselect if clicking same piece
                    this.selectedPiece = null;
                }
            }
        }
        // Handle square selection for move
        else if (target.closest('.square') && this.selectedPiece) {
            const square = target.closest('.square');
            const targetRow = parseInt(square.dataset.row);
            const targetCol = parseInt(square.dataset.col);
            
            if (this.isValidMove(this.selectedPiece, targetRow, targetCol)) {
                this.movePiece(this.selectedPiece, targetRow, targetCol);
                // Reset selection
                const circle = this.selectedPiece.querySelector('circle');
                circle.setAttribute('stroke', '#ffffff');
                circle.setAttribute('stroke-width', '3');
                this.selectedPiece = null;
                // Switch turns
                this.currentTurn = this.currentTurn === 'red' ? 'black' : 'red';
            }
        }
    }

    resetGame() {
        // Remove all pieces
        this.pieces.forEach(piece => piece.remove());
        this.pieces = [];
        this.selectedPiece = null;
        this.currentTurn = 'red';
        this.boardState = Array(8).fill().map(() => Array(8).fill(null));
        
        // Reset board colors
        this.updateTheme(this.currentTheme);

        // Setup new pieces
        this.setupPieces();
    }
}

// Export the Checkers class
window.Checkers = Checkers;
