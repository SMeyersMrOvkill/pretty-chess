class Chess {
    constructor(container, theme) {
        if (!container) {
            throw new Error('Container element is required');
        }
        
        this.container = container;
        // Create the SVG board if it doesn't exist
        this.board = container.querySelector('#chessboard') || this.createChessboard();
        this.squares = [];
        this.pieces = [];
        this.selectedPiece = null;
        this.moveHistory = [];
        
        // Initialize theme
        this.currentTheme = theme || themes['Forest Green'];
        if (!this.currentTheme) {
            console.error('Theme not found, falling back to Forest Green');
            this.currentTheme = themes['Forest Green'];
        }
        
        // Set up piece colors based on theme
        this.pieceColors = {
            white: this.currentTheme.pieces.white,
            black: this.currentTheme.pieces.black
        };
        
        this.currentTurn = 'white';
        this.boardState = Array(8).fill().map(() => Array(8).fill(null));
        
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

    createChessboard() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'chessboard');
        svg.setAttribute('viewBox', '0 0 800 800');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        this.container.querySelector('.board-container').appendChild(svg);
        return svg;
    }

    init() {
        this.createBoard();
        this.setupPieces();
    }

    initSettings() {
        const themeSelect = document.getElementById('theme-select');
        const resetGame = document.getElementById('resetGame');

        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                const selectedTheme = themes[e.target.value];
                if (selectedTheme) {
                    this.updateTheme(selectedTheme);
                }
            });
        }

        if (resetGame) {
            resetGame.addEventListener('click', () => {
                this.resetGame();
            });
        }
    }

    updateTheme(theme) {
        if (!theme) {
            console.error('Invalid theme provided');
            return;
        }
        
        this.currentTheme = theme;
        this.pieceColors = {
            white: theme.pieces.white,
            black: theme.pieces.black
        };
        
        // Update board colors
        this.squares.forEach((square, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isLight = (row + col) % 2 === 0;
            square.setAttribute('fill', isLight ? theme.light : theme.dark);
        });

        // Update piece colors and effects
        this.pieces.forEach(piece => {
            const path = piece.querySelector('path');
            if (path) {
                const color = piece.dataset.color;
                path.setAttribute('fill', this.pieceColors[color]);
                
                // Update shadow effect
                const shadowId = `shadow-${color}-${Math.random().toString(36).substr(2, 9)}`;
                const existingFilter = this.board.querySelector(`#${shadowId}`);
                if (existingFilter) {
                    existingFilter.remove();
                }
                
                const shadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                shadowFilter.setAttribute('id', shadowId);
                
                const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
                feDropShadow.setAttribute('dx', '0');
                feDropShadow.setAttribute('dy', '0');
                feDropShadow.setAttribute('stdDeviation', '2');
                feDropShadow.setAttribute('flood-color', color === 'white' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)');
                
                shadowFilter.appendChild(feDropShadow);
                this.board.appendChild(shadowFilter);
                
                path.style.filter = `url(#${shadowId})`;
            }
        });

        // Update highlights for selected pieces and valid moves
        if (this.selectedPiece) {
            const square = this.selectedPiece.parentElement;
            if (square) {
                const highlight = square.querySelector('.highlight');
                if (highlight) {
                    highlight.setAttribute('fill', theme.highlight.base);
                    highlight.style.stroke = theme.highlight.stroke;
                    highlight.style.filter = theme.highlight.shadow;
                }
            }
            
            // Update valid move indicators
            const validMoves = document.querySelectorAll('.valid-move');
            validMoves.forEach(move => {
                move.setAttribute('fill', theme.validMove.base);
                move.style.stroke = theme.validMove.stroke;
                move.style.filter = theme.validMove.shadow;
            });
        }
    }

    createBoard() {
        // Clear existing squares
        while (this.boardGroup.firstChild) {
            this.boardGroup.removeChild(this.boardGroup.firstChild);
        }
        this.squares = [];

        // Create coordinate labels
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('class', 'coordinates');
        
        // Files (a-h)
        for (let i = 0; i < 8; i++) {
            const file = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            file.textContent = String.fromCharCode(97 + i); // a-h
            file.setAttribute('x', i * 100 + 50);
            file.setAttribute('y', 795);
            file.setAttribute('text-anchor', 'middle');
            file.setAttribute('fill', (i % 2 === 0) ? this.currentTheme.dark : this.currentTheme.light);
            file.setAttribute('font-size', '20');
            file.setAttribute('font-family', 'Arial, sans-serif');
            file.setAttribute('font-weight', 'bold');
            file.style.textShadow = '2px 2px 0 #000000, -2px 2px 0 #000000, 2px -2px 0 #000000, -2px -2px 0 #000000';
            labelGroup.appendChild(file);
        }
        
        // Ranks (1-8)
        for (let i = 0; i < 8; i++) {
            const rank = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            rank.textContent = 8 - i;
            rank.setAttribute('x', 10);
            rank.setAttribute('y', i * 100 + 50);
            rank.setAttribute('text-anchor', 'middle');
            rank.setAttribute('dominant-baseline', 'middle');
            rank.setAttribute('fill', (i % 2 === 0) ? this.currentTheme.dark : this.currentTheme.light);
            rank.setAttribute('font-size', '20');
            rank.setAttribute('font-family', 'Arial, sans-serif');
            rank.setAttribute('font-weight', 'bold');
            rank.style.textShadow = '2px 2px 0 #000000, -2px 2px 0 #000000, 2px -2px 0 #000000, -2px -2px 0 #000000';
            labelGroup.appendChild(rank);
        }

        // Create squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                const isLight = (row + col) % 2 === 0;
                
                square.setAttribute('x', col * 100);
                square.setAttribute('y', row * 100);
                square.setAttribute('width', 100);
                square.setAttribute('height', 100);
                square.setAttribute('fill', isLight ? this.currentTheme.light : this.currentTheme.dark);
                square.setAttribute('class', 'square');
                square.dataset.row = row;
                square.dataset.col = col;
                
                this.boardGroup.appendChild(square);
                this.squares.push(square);
                
                // Store in board state
                this.boardState[row][col] = null;
            }
        }
        
        // Add labels on top of squares
        this.board.appendChild(labelGroup);
    }

    setupPieces() {
        // Use default state from metadata to setup pieces
        const defaultState = this.metadata?.defaultState?.pieces || [
            { type: 'rook', color: 'black', position: 'a8' },
            { type: 'knight', color: 'black', position: 'b8' },
            { type: 'bishop', color: 'black', position: 'c8' },
            { type: 'queen', color: 'black', position: 'd8' },
            { type: 'king', color: 'black', position: 'e8' },
            { type: 'bishop', color: 'black', position: 'f8' },
            { type: 'knight', color: 'black', position: 'g8' },
            { type: 'rook', color: 'black', position: 'h8' },
            { type: 'pawn', color: 'black', position: 'a7' },
            { type: 'pawn', color: 'black', position: 'b7' },
            { type: 'pawn', color: 'black', position: 'c7' },
            { type: 'pawn', color: 'black', position: 'd7' },
            { type: 'pawn', color: 'black', position: 'e7' },
            { type: 'pawn', color: 'black', position: 'f7' },
            { type: 'pawn', color: 'black', position: 'g7' },
            { type: 'pawn', color: 'black', position: 'h7' },
            { type: 'rook', color: 'white', position: 'a1' },
            { type: 'knight', color: 'white', position: 'b1' },
            { type: 'bishop', color: 'white', position: 'c1' },
            { type: 'queen', color: 'white', position: 'd1' },
            { type: 'king', color: 'white', position: 'e1' },
            { type: 'bishop', color: 'white', position: 'f1' },
            { type: 'knight', color: 'white', position: 'g1' },
            { type: 'rook', color: 'white', position: 'h1' },
            { type: 'pawn', color: 'white', position: 'a2' },
            { type: 'pawn', color: 'white', position: 'b2' },
            { type: 'pawn', color: 'white', position: 'c2' },
            { type: 'pawn', color: 'white', position: 'd2' },
            { type: 'pawn', color: 'white', position: 'e2' },
            { type: 'pawn', color: 'white', position: 'f2' },
            { type: 'pawn', color: 'white', position: 'g2' },
            { type: 'pawn', color: 'white', position: 'h2' }
        ];

        defaultState.forEach(piece => {
            const col = piece.position.charCodeAt(0) - 97;
            const row = 8 - parseInt(piece.position[1]);
            const newPiece = this.createPiece(piece.type, piece.color, row, col);
            this.boardState[row][col] = newPiece;
            this.pieces.push(newPiece);
        });
    }

    createPiece(type, color, row, col) {
        const piece = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        piece.classList.add('piece');
        piece.dataset.type = type;
        piece.dataset.color = color;
        piece.dataset.row = row;
        piece.dataset.col = col;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', this.getPiecePath(type));
        path.setAttribute('fill', this.pieceColors[color]);
        path.setAttribute('stroke', color === 'white' ? '#2c3e50' : '#ffffff');
        path.setAttribute('stroke-width', '2');

        const offset = { x: -22, y: -22 };
        path.setAttribute('transform', 
            `translate(${col * 100 + 50 + offset.x}, ${row * 100 + 50 + offset.y})`
        );

        piece.appendChild(path);
        this.pieceGroup.appendChild(piece);
        return piece;
    }

    getPiecePath(type) {
        // SVG paths for chess pieces
        const paths = {
            pawn: 'M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.21-1.79-4-4-4z',
            rook: 'M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5H11zM34 14l-3 3H14l-3-3M31 17v12.5H14V17',
            knight: 'M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18 M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10',
            bishop: 'M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zm6-4c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z',
            queen: 'M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z',
            king: 'M22.5 11.63V6M20 8h5v5h-5zm-2.5 14.87c.54-1.77 2.17-3.02 4-3.02 1.83 0 3.46 1.25 4 3.02M15 21h15m-7.5 4L22 14h1.5l-.5 11M9 26c8.5-1.5 21-1.5 27 0l2-12H7l2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4'
        };
        return paths[type];
    }

    getSquareCenter(row, col) {
        return {
            x: col * 100 + 50,
            y: row * 100 + 50
        };
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getPieceAt(row, col) {
        return this.boardState[row][col];
    }

    getValidMoves(piece) {
        if (!piece) return [];
        
        const row = parseInt(piece.dataset.row);
        const col = parseInt(piece.dataset.col);
        const type = piece.dataset.type;
        const color = piece.dataset.color;
        const moves = [];

        const addMove = (r, c) => {
            if (!this.isValidPosition(r, c)) return false;
            const targetPiece = this.getPieceAt(r, c);
            if (!targetPiece || targetPiece.dataset.color !== color) {
                moves.push({row: r, col: c});
                return !targetPiece; // continue only if empty
            }
            return false; // stop if blocked
        };

        switch (type) {
            case 'pawn':
                const direction = color === 'white' ? -1 : 1;
                const startRow = color === 'white' ? 6 : 1;
                
                // Forward move
                if (this.isValidPosition(row + direction, col) && !this.getPieceAt(row + direction, col)) {
                    moves.push({row: row + direction, col: col});
                    // Double move from start
                    if (row === startRow && !this.getPieceAt(row + 2 * direction, col)) {
                        moves.push({row: row + 2 * direction, col: col});
                    }
                }
                
                // Captures
                for (let dcol of [-1, 1]) {
                    const r = row + direction;
                    const c = col + dcol;
                    if (this.isValidPosition(r, c)) {
                        const targetPiece = this.getPieceAt(r, c);
                        if (targetPiece && targetPiece.dataset.color !== color) {
                            moves.push({row: r, col: c});
                        }
                    }
                }
                break;

            case 'rook':
                // Horizontal and vertical moves
                for (let direction of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                    let r = row + direction[0];
                    let c = col + direction[1];
                    while (addMove(r, c)) {
                        r += direction[0];
                        c += direction[1];
                    }
                }
                break;

            case 'knight':
                // L-shaped moves
                for (let move of [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]) {
                    addMove(row + move[0], col + move[1]);
                }
                break;

            case 'bishop':
                // Diagonal moves
                for (let direction of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                    let r = row + direction[0];
                    let c = col + direction[1];
                    while (addMove(r, c)) {
                        r += direction[0];
                        c += direction[1];
                    }
                }
                break;

            case 'queen':
                // Combine rook and bishop moves
                for (let direction of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                    let r = row + direction[0];
                    let c = col + direction[1];
                    while (addMove(r, c)) {
                        r += direction[0];
                        c += direction[1];
                    }
                }
                break;

            case 'king':
                // One square in any direction
                for (let direction of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                    addMove(row + direction[0], col + direction[1]);
                }
                break;
        }

        return moves;
    }

    showValidMoves(piece) {
        // Clear existing highlights
        const highlights = this.board.querySelectorAll('.valid-move-highlight');
        highlights.forEach(h => h.remove());

        if (!piece) return;

        const validMoves = this.getValidMoves(piece);
        validMoves.forEach(move => {
            // Create highlight group
            const highlightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            highlightGroup.classList.add('valid-move-highlight');
            highlightGroup.dataset.row = move.row;
            highlightGroup.dataset.col = move.col;

            // Create outer glow circle
            const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glowCircle.setAttribute('cx', move.col * 100 + 50);
            glowCircle.setAttribute('cy', move.row * 100 + 50);
            glowCircle.setAttribute('r', 18);
            glowCircle.setAttribute('fill', 'none');
            glowCircle.setAttribute('stroke', this.currentTheme.validMove.stroke);
            glowCircle.setAttribute('stroke-width', '2');
            glowCircle.style.filter = this.currentTheme.validMove.shadow;

            // Create the main circle indicator
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', move.col * 100 + 50);
            circle.setAttribute('cy', move.row * 100 + 50);
            circle.setAttribute('r', 15);
            circle.setAttribute('fill', this.currentTheme.validMove.base);
            circle.style.filter = this.currentTheme.validMove.shadow;
            circle.classList.add('valid-move-indicator');

            // Create invisible square for better click target
            const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            square.setAttribute('x', move.col * 100);
            square.setAttribute('y', move.row * 100);
            square.setAttribute('width', 100);
            square.setAttribute('height', 100);
            square.setAttribute('fill', 'transparent');
            square.classList.add('valid-move-square');

            highlightGroup.appendChild(square);
            highlightGroup.appendChild(glowCircle);
            highlightGroup.appendChild(circle);
            this.board.appendChild(highlightGroup);
        });
    }

    movePiece(piece, targetRow, targetCol) {
        const sourceRow = parseInt(piece.dataset.row);
        const sourceCol = parseInt(piece.dataset.col);
        const pieceType = piece.dataset.type;
        const pieceColor = piece.dataset.color;

        // Record the move
        const move = {
            piece: pieceType,
            color: pieceColor,
            from: {
                row: sourceRow,
                col: sourceCol,
                algebraic: this.toAlgebraic(sourceRow, sourceCol)
            },
            to: {
                row: targetRow,
                col: targetCol,
                algebraic: this.toAlgebraic(targetRow, targetCol)
            },
            timestamp: new Date().toISOString()
        };

        // Check if there's a capture
        const capturedPiece = this.getPieceAt(targetRow, targetCol);
        if (capturedPiece) {
            move.captured = {
                piece: capturedPiece.dataset.type,
                color: capturedPiece.dataset.color
            };
            capturedPiece.remove();
        }

        this.moveHistory.push(move);

        // Clear current square
        this.boardState[sourceRow][sourceCol] = null;
        
        // Update piece position in data and visually
        piece.dataset.row = targetRow;
        piece.dataset.col = targetCol;
        
        // Move piece
        const path = piece.querySelector('path');
        const offset = { x: -22, y: -22 };
        path.setAttribute('transform', 
            `translate(${targetCol * 100 + 50 + offset.x}, ${targetRow * 100 + 50 + offset.y})`
        );
        
        // Update board state
        this.boardState[targetRow][targetCol] = piece;
        
        // Clear highlights
        const highlights = this.board.querySelectorAll('.valid-move-highlight');
        highlights.forEach(h => h.remove());
    }

    toAlgebraic(row, col) {
        const file = String.fromCharCode(97 + col); // 'a' through 'h'
        const rank = 8 - row; // 1 through 8
        return `${file}${rank}`;
    }

    resetGame() {
        // Clear all pieces
        while (this.pieceGroup.firstChild) {
            this.pieceGroup.removeChild(this.pieceGroup.firstChild);
        }
        
        // Clear all highlights and indicators
        const highlights = this.board.querySelectorAll('.valid-move-highlight');
        highlights.forEach(h => h.remove());
        
        // Reset arrays and state
        this.pieces = [];
        this.boardState = Array(8).fill().map(() => Array(8).fill(null));
        this.selectedPiece = null;
        this.currentTurn = 'white';
        this.moveHistory = [];
    }

    exportToJson() {
        const pieceToJson = (piece) => {
            if (!piece) return null;
            return {
                type: piece.dataset.type,
                color: piece.dataset.color
            };
        };

        const gameState = {
            metadata: {
                version: '1.0',
                timestamp: new Date().toISOString(),
                currentTurn: this.currentTurn,
                theme: Object.keys(themes).find(key => themes[key] === this.currentTheme),
                selectedPiece: this.selectedPiece ? {
                    type: this.selectedPiece.dataset.type,
                    color: this.selectedPiece.dataset.color,
                    position: this.toAlgebraic(
                        parseInt(this.selectedPiece.dataset.row),
                        parseInt(this.selectedPiece.dataset.col)
                    )
                } : null,
                defaultState: {
                    pieces: [
                        { type: 'rook', color: 'black', position: 'a8' },
                        { type: 'knight', color: 'black', position: 'b8' },
                        { type: 'bishop', color: 'black', position: 'c8' },
                        { type: 'queen', color: 'black', position: 'd8' },
                        { type: 'king', color: 'black', position: 'e8' },
                        { type: 'bishop', color: 'black', position: 'f8' },
                        { type: 'knight', color: 'black', position: 'g8' },
                        { type: 'rook', color: 'black', position: 'h8' },
                        { type: 'pawn', color: 'black', position: 'a7' },
                        { type: 'pawn', color: 'black', position: 'b7' },
                        { type: 'pawn', color: 'black', position: 'c7' },
                        { type: 'pawn', color: 'black', position: 'd7' },
                        { type: 'pawn', color: 'black', position: 'e7' },
                        { type: 'pawn', color: 'black', position: 'f7' },
                        { type: 'pawn', color: 'black', position: 'g7' },
                        { type: 'pawn', color: 'black', position: 'h7' },
                        { type: 'rook', color: 'white', position: 'a1' },
                        { type: 'knight', color: 'white', position: 'b1' },
                        { type: 'bishop', color: 'white', position: 'c1' },
                        { type: 'queen', color: 'white', position: 'd1' },
                        { type: 'king', color: 'white', position: 'e1' },
                        { type: 'bishop', color: 'white', position: 'f1' },
                        { type: 'knight', color: 'white', position: 'g1' },
                        { type: 'rook', color: 'white', position: 'h1' },
                        { type: 'pawn', color: 'white', position: 'a2' },
                        { type: 'pawn', color: 'white', position: 'b2' },
                        { type: 'pawn', color: 'white', position: 'c2' },
                        { type: 'pawn', color: 'white', position: 'd2' },
                        { type: 'pawn', color: 'white', position: 'e2' },
                        { type: 'pawn', color: 'white', position: 'f2' },
                        { type: 'pawn', color: 'white', position: 'g2' },
                        { type: 'pawn', color: 'white', position: 'h2' }
                    ]
                }
            },
            board: Array(8).fill().map((_, row) => 
                Array(8).fill().map((_, col) => pieceToJson(this.boardState[row][col]))
            ),
            moveHistory: this.moveHistory
        };

        return JSON.stringify(gameState, null, 2);
    }

    downloadGameState() {
        const gameState = this.exportToJson();
        const blob = new Blob([gameState], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chess-game-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    loadFromJson(jsonString) {
        try {
            const gameState = JSON.parse(jsonString);
            
            // Validate version
            if (!gameState.metadata?.version?.startsWith('1.')) {
                throw new Error('Unsupported game state version. Please use a compatible version.');
            }

            // Validate required fields
            if (!gameState.board || !Array.isArray(gameState.board) || 
                gameState.board.length !== 8 || 
                !gameState.board.every(row => Array.isArray(row) && row.length === 8)) {
                throw new Error('Invalid board format. The board must be 8x8.');
            }

            if (!gameState.metadata?.currentTurn || 
                !['white', 'black'].includes(gameState.metadata.currentTurn)) {
                throw new Error('Invalid turn state. Must be either "white" or "black".');
            }

            // Clear existing game state
            this.resetGame();

            // Load metadata
            if (gameState.metadata) {
                this.currentTurn = gameState.metadata.currentTurn;
                
                // Load theme if it exists
                if (gameState.metadata.theme && themes[gameState.metadata.theme]) {
                    this.updateTheme(themes[gameState.metadata.theme]);
                }
            }

            // Load board state
            let piecesLoaded = 0;
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const pieceData = gameState.board[row][col];
                    if (pieceData) {
                        // Validate piece data
                        if (!pieceData.type || !pieceData.color || 
                            !['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'].includes(pieceData.type) ||
                            !['white', 'black'].includes(pieceData.color)) {
                            throw new Error(`Invalid piece at ${this.toAlgebraic(row, col)}. Check piece type and color.`);
                        }

                        const piece = this.createPiece(
                            pieceData.type,
                            pieceData.color,
                            row,
                            col
                        );
                        this.boardState[row][col] = piece;
                        this.pieces.push(piece);
                        piecesLoaded++;
                    }
                }
            }

            // Validate reasonable number of pieces
            if (piecesLoaded > 32) {
                throw new Error('Too many pieces on the board. Maximum allowed is 32.');
            }

            // Load move history
            if (Array.isArray(gameState.moveHistory)) {
                this.moveHistory = gameState.moveHistory.map((move, index) => {
                    // Validate move data
                    if (!move.piece || !move.color || !move.from || !move.to) {
                        throw new Error(`Invalid move at position ${index + 1}. Missing required move data.`);
                    }

                    // Handle both string and object formats for from/to
                    const fromStr = typeof move.from === 'string' ? move.from : move.from.algebraic;
                    const toStr = typeof move.to === 'string' ? move.to : move.to.algebraic;

                    return {
                        piece: move.piece,
                        color: move.color,
                        from: {
                            algebraic: fromStr,
                            row: 8 - parseInt(fromStr[1]),
                            col: fromStr.charCodeAt(0) - 97
                        },
                        to: {
                            algebraic: toStr,
                            row: 8 - parseInt(toStr[1]),
                            col: toStr.charCodeAt(0) - 97
                        },
                        captured: move.captured,
                        timestamp: move.timestamp || new Date().toISOString()
                    };
                });
            }

            // Restore selected piece if it exists
            if (gameState.metadata?.selectedPiece) {
                const sp = gameState.metadata.selectedPiece;
                if (!sp.type || !sp.color || !sp.position) {
                    throw new Error('Invalid selected piece data. Missing required fields.');
                }

                const row = 8 - parseInt(sp.position[1]);
                const col = sp.position.charCodeAt(0) - 97;
                const piece = this.getPieceAt(row, col);
                if (piece) {
                    this.selectedPiece = piece;
                    const path = piece.querySelector('path');
                    path.setAttribute('stroke', this.currentTheme.highlight.stroke);
                    path.setAttribute('stroke-width', '3');
                    this.showValidMoves(piece);
                }
            }

            return true;
        } catch (error) {
            // On error, ensure we're in a clean state
            this.resetGame();
            throw error; // Re-throw the error for the UI to handle
        }
    }

    handleClick(event) {
        const target = event.target;
        const piece = target.closest('.piece');
        const validMove = target.closest('.valid-move-highlight');

        if (piece) {
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
                    path.setAttribute('stroke', this.currentTheme.highlight.stroke);
                    path.setAttribute('stroke-width', '3');
                    this.showValidMoves(piece);
                } else {
                    this.selectedPiece = null;
                }
            }
        } else if (validMove && this.selectedPiece) {
            const targetRow = parseInt(validMove.dataset.row);
            const targetCol = parseInt(validMove.dataset.col);
            
            this.movePiece(this.selectedPiece, targetRow, targetCol);
            
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

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const container = document.querySelector('.board-container');
    new Chess(container);
});
