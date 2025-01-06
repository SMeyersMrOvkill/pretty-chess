class Chess {
    constructor() {
        this.board = document.getElementById('chessboard');
        this.squares = [];
        this.pieces = [];
        this.selectedPiece = null;
        this.currentTheme = themes.classic;
        this.colors = { ...this.currentTheme };
        this.pieceColors = {
            white: this.currentTheme.white,
            black: this.currentTheme.black
        };
        this.currentTurn = 'white';
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
        this.updateTheme('classic');
        
        // Add click handler for the board
        this.board.addEventListener('click', this.handleClick.bind(this));
    }

    init() {
        this.createBoard();
        this.setupPieces();
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
        this.pieceColors = {
            white: this.currentTheme.white,
            black: this.currentTheme.black
        };
        
        document.body.style.backgroundColor = this.currentTheme.background;
        
        // Update square colors
        this.squares.forEach((square, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isLight = (row + col) % 2 === 0;
            square.setAttribute('fill', isLight ? this.colors.light : this.colors.dark);
        });

        // Update piece colors
        this.pieces.forEach(piece => {
            const path = piece.querySelector('path');
            if (path) {
                path.setAttribute('fill', this.pieceColors[piece.dataset.color]);
                path.setAttribute('stroke', piece.dataset.color === 'white' ? '#2c3e50' : '#ffffff');
                path.setAttribute('stroke-width', '2');
            }
        });
    }

    updatePieceSizes() {
        this.pieces.forEach(piece => {
            const path = piece.querySelector('path');
            const type = piece.dataset.type;
            const row = parseInt(piece.dataset.row);
            const col = parseInt(piece.dataset.col);
            const offset = this.getPieceOffset(type);
            path.setAttribute('transform', 
                `translate(${col * 100 + 50 + offset.x * this.pieceSize}, 
                          ${row * 100 + 50 + offset.y * this.pieceSize}) 
                 scale(${this.pieceSize})`
            );
        });
    }

    getPieceOffset(type) {
        const offsets = {
            pawn: { x: -22, y: -22 },
            rook: { x: -22, y: -22 },
            knight: { x: -22, y: -22 },
            bishop: { x: -22, y: -22 },
            queen: { x: -22, y: -22 },
            king: { x: -22, y: -22 }
        };
        return offsets[type];
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
                
                // Store in board state
                this.boardState[row][col] = null;
            }
        }
    }

    setupPieces() {
        const layout = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn']
        ];

        // Clear existing pieces
        while (this.pieceGroup.firstChild) {
            this.pieceGroup.removeChild(this.pieceGroup.firstChild);
        }
        this.pieces = [];

        // Setup black pieces
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                this.createPiece(layout[row][col], 'black', row, col);
            }
        }

        // Setup white pieces
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                this.createPiece(layout[row][col], 'white', 7 - row, col);
            }
        }
    }

    createPiece(type, color, row, col) {
        const piece = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        piece.setAttribute('class', 'piece');
        piece.dataset.type = type;
        piece.dataset.color = color;
        piece.dataset.row = row;
        piece.dataset.col = col;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', this.pieceColors[color]);
        path.setAttribute('stroke', color === 'white' ? '#2c3e50' : '#ffffff');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('d', this.getPiecePath(type));

        const offset = this.getPieceOffset(type);
        path.setAttribute('transform', 
            `translate(${col * 100 + 50 + offset.x * this.pieceSize}, 
                      ${row * 100 + 50 + offset.y * this.pieceSize}) 
             scale(${this.pieceSize})`
        );

        piece.appendChild(path);
        this.pieceGroup.appendChild(piece);
        this.pieces.push(piece);
        this.boardState[row][col] = piece;
    }

    getPiecePath(type) {
        // SVG paths for chess pieces
        const paths = {
            pawn: 'M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z',
            rook: 'M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5H11zM34 14l-3 3H14l-3-3M31 17v12.5H14V17',
            knight: 'M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18 M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10',
            bishop: 'M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zm6-4c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z',
            queen: 'M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z',
            king: 'M22.5 11.63V6M20 8h5v5h-5zm-2.5 14.87c.54-1.77 2.17-3.02 4-3.02 1.83 0 3.46 1.25 4 3.02M15 21h15m-7.5 4L22 14h1.5l-.5 11M9 26c8.5-1.5 21-1.5 27 0l2-12H7l2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4'
        };
        return paths[type];
    }

    setupEventListeners() {
        this.board.addEventListener('click', (e) => {
            const piece = e.target.closest('.piece');
            if (piece) {
                if (this.selectedPiece) {
                    const path = this.selectedPiece.querySelector('path');
                    path.setAttribute('stroke', this.selectedPiece.dataset.color === 'white' ? '#2c3e50' : '#ffffff');
                }
                
                if (this.selectedPiece !== piece) {
                    this.selectedPiece = piece;
                    piece.querySelector('path').setAttribute('stroke', this.colors.selected);
                } else {
                    this.selectedPiece = null;
                }
            } else {
                const square = e.target.closest('.square');
                if (square && this.selectedPiece) {
                    const row = parseInt(square.dataset.row);
                    const col = parseInt(square.dataset.col);
                    this.movePiece(this.selectedPiece, row, col);
                    this.selectedPiece.querySelector('path').setAttribute('stroke', this.selectedPiece.dataset.color === 'white' ? '#2c3e50' : '#ffffff');
                    this.selectedPiece = null;
                }
            }
        });
    }

    movePiece(piece, row, col) {
        const path = piece.querySelector('path');
        const type = piece.dataset.type;
        const offset = this.getPieceOffset(type);
        path.setAttribute('transform', 
            `translate(${col * 100 + 50 + offset.x * this.pieceSize}, 
                      ${row * 100 + 50 + offset.y * this.pieceSize}) 
             scale(${this.pieceSize})`
        );
        piece.dataset.row = row;
        piece.dataset.col = col;
        this.boardState[row][col] = piece;
    }

    resetGame() {
        // Remove all pieces
        this.pieces.forEach(piece => piece.remove());
        this.pieces = [];
        this.selectedPiece = null;
        this.currentTurn = 'white';
        this.boardState = Array(8).fill().map(() => Array(8).fill(null));
        
        // Reset board colors
        this.updateTheme(this.currentTheme);

        // Setup new pieces
        this.setupPieces();
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
                    const path = this.selectedPiece.querySelector('path');
                    path.setAttribute('stroke', this.selectedPiece.dataset.color === 'white' ? '#2c3e50' : '#ffffff');
                    path.setAttribute('stroke-width', '2');
                }
                
                if (this.selectedPiece !== piece) {
                    // Select new piece
                    this.selectedPiece = piece;
                    const path = piece.querySelector('path');
                    path.setAttribute('stroke', this.colors.selected);
                    path.setAttribute('stroke-width', '3');
                } else {
                    // Deselect if clicking same piece
                    this.selectedPiece = null;
                }
            }
        }
        // Handle square selection for move
        else if (target.closest('.square') && this.selectedPiece) {
            const square = target.closest('.square');
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            // Check if move is valid (you can add more complex validation later)
            const targetPiece = this.boardState[row][col];
            if (!targetPiece || targetPiece.dataset.color !== this.currentTurn) {
                this.movePiece(this.selectedPiece, row, col);
                // Reset selection
                const path = this.selectedPiece.querySelector('path');
                path.setAttribute('stroke', this.selectedPiece.dataset.color === 'white' ? '#2c3e50' : '#ffffff');
                path.setAttribute('stroke-width', '2');
                this.selectedPiece = null;
                // Switch turns
                this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
            }
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Chess();
});
