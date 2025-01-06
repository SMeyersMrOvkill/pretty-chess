class Backgammon {
    constructor(container, colors) {
        this.container = container;
        this.colors = colors || {
            light: '#f0d9b5',
            dark: '#b58863',
            black: '#000000',
            white: '#ffffff',
            selected: '#ffff00',
            validMove: '#90EE90',
            point1: '#8B4513',  // Dark brown for points
            point2: '#D2691E'   // Lighter brown for contrast
        };
        this.diceValues = [null, null];
        this.selectedPiece = null;
        this.currentTurn = 'white';
        this.board = null;
        this.pieces = [];
        this.points = [];
        this.createBoard();
        this.setupPieces();
        this.setupEventListeners();
    }

    createBoard() {
        // Create SVG container
        this.board = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.board.setAttribute('width', '100%');
        this.board.setAttribute('height', '100%');
        this.board.setAttribute('viewBox', '0 0 1400 800');
        this.board.classList.add('backgammon-board');
        
        // Create board background
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '1400');
        background.setAttribute('height', '800');
        background.setAttribute('fill', this.colors.light);
        this.board.appendChild(background);

        // Create points (triangles)
        const pointWidth = 100;
        const pointHeight = 300;
        
        // Bottom points
        for (let i = 0; i < 12; i++) {
            const point = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = 50 + (i * pointWidth) + (i >= 6 ? 100 : 0);
            const color = i % 2 === 0 ? this.colors.point1 : this.colors.point2;
            
            point.setAttribute('d', `M ${x} 800 L ${x + pointWidth} 800 L ${x + pointWidth/2} ${800 - pointHeight} Z`);
            point.setAttribute('fill', color);
            point.setAttribute('data-point', i < 6 ? 12 + i : i + 13);
            this.board.appendChild(point);
            this.points.push(point);
        }

        // Top points
        for (let i = 0; i < 12; i++) {
            const point = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = 50 + (i * pointWidth) + (i >= 6 ? 100 : 0);
            const color = i % 2 === 0 ? this.colors.point1 : this.colors.point2;
            
            point.setAttribute('d', `M ${x} 0 L ${x + pointWidth} 0 L ${x + pointWidth/2} ${pointHeight} Z`);
            point.setAttribute('fill', color);
            point.setAttribute('data-point', 11 - i);
            this.board.appendChild(point);
            this.points.push(point);
        }

        // Add center bar
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', '675');
        bar.setAttribute('y', '0');
        bar.setAttribute('width', '50');
        bar.setAttribute('height', '800');
        bar.setAttribute('fill', this.colors.point1);
        this.board.appendChild(bar);

        // Add dice area
        this.diceArea = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.diceArea.setAttribute('transform', 'translate(600, 350)');
        this.board.appendChild(this.diceArea);

        this.container.appendChild(this.board);
    }

    setupPieces() {
        // Initial piece positions
        const startingPositions = {
            0: { count: 2, color: 'white' },   // Point 24
            5: { count: 5, color: 'black' },   // Point 19
            7: { count: 3, color: 'black' },   // Point 17
            11: { count: 5, color: 'white' },  // Point 13
            12: { count: 5, color: 'black' },  // Point 12
            16: { count: 3, color: 'white' },  // Point 8
            18: { count: 5, color: 'white' },  // Point 6
            23: { count: 2, color: 'black' }   // Point 1
        };

        Object.entries(startingPositions).forEach(([point, data]) => {
            for (let i = 0; i < data.count; i++) {
                this.createPiece(parseInt(point), data.color);
            }
        });
    }

    createPiece(point, color) {
        const piece = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const pointCoords = this.getPointCoordinates(point);
        
        piece.setAttribute('cx', pointCoords.x);
        piece.setAttribute('cy', this.getPieceY(point, this.getPieceCountOnPoint(point)));
        piece.setAttribute('r', '40');
        piece.setAttribute('fill', this.colors[color]);
        piece.setAttribute('stroke', '#000');
        piece.setAttribute('stroke-width', '2');
        piece.setAttribute('data-color', color);
        piece.setAttribute('data-point', point);
        
        this.board.appendChild(piece);
        this.pieces.push(piece);
    }

    getPointCoordinates(point) {
        const pointWidth = 100;
        const x = 100 + (point % 12) * pointWidth + (point >= 12 ? 100 : 0);
        return { x: x, y: point < 12 ? 0 : 800 };
    }

    getPieceY(point, pieceNum) {
        const spacing = 85;
        return point < 12 ? spacing * pieceNum : 800 - spacing * pieceNum;
    }

    getPieceCountOnPoint(point) {
        return this.pieces.filter(p => parseInt(p.getAttribute('data-point')) === point).length;
    }

    rollDice() {
        this.diceValues = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        this.renderDice();
    }

    renderDice() {
        this.diceArea.innerHTML = '';
        
        this.diceValues.forEach((value, index) => {
            const die = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            die.setAttribute('transform', `translate(${index * 100}, 0)`);
            
            // Die background
            const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            background.setAttribute('width', '80');
            background.setAttribute('height', '80');
            background.setAttribute('rx', '10');
            background.setAttribute('fill', '#fff');
            background.setAttribute('stroke', '#000');
            die.appendChild(background);
            
            // Die dots
            const dotPatterns = {
                1: [[40, 40]],
                2: [[20, 20], [60, 60]],
                3: [[20, 20], [40, 40], [60, 60]],
                4: [[20, 20], [20, 60], [60, 20], [60, 60]],
                5: [[20, 20], [20, 60], [40, 40], [60, 20], [60, 60]],
                6: [[20, 20], [20, 40], [20, 60], [60, 20], [60, 40], [60, 60]]
            };
            
            const dots = dotPatterns[value] || [];
            dots.forEach(([x, y]) => {
                const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dot.setAttribute('cx', x);
                dot.setAttribute('cy', y);
                dot.setAttribute('r', '5');
                dot.setAttribute('fill', '#000');
                die.appendChild(dot);
            });
            
            this.diceArea.appendChild(die);
        });
    }

    setupEventListeners() {
        this.board.addEventListener('click', (e) => {
            const piece = e.target.closest('circle');
            if (piece) {
                this.handlePieceClick(piece);
            } else {
                const point = e.target.closest('path');
                if (point) {
                    this.handlePointClick(point);
                }
            }
        });
    }

    handlePieceClick(piece) {
        const color = piece.getAttribute('data-color');
        if (color === this.currentTurn) {
            if (this.selectedPiece) {
                this.selectedPiece.setAttribute('stroke', '#000');
                this.selectedPiece.setAttribute('stroke-width', '2');
            }
            this.selectedPiece = piece;
            piece.setAttribute('stroke', this.colors.selected);
            piece.setAttribute('stroke-width', '3');
            this.showValidMoves(piece);
        }
    }

    handlePointClick(point) {
        if (this.selectedPiece && point.getAttribute('fill') === this.colors.validMove) {
            const targetPoint = parseInt(point.getAttribute('data-point'));
            this.movePiece(this.selectedPiece, targetPoint);
            this.selectedPiece = null;
            this.resetPointColors();
            this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        }
    }

    showValidMoves(piece) {
        this.resetPointColors();
        // TODO: Implement valid move logic based on dice values
    }

    resetPointColors() {
        this.points.forEach((point, i) => {
            point.setAttribute('fill', i % 2 === 0 ? this.colors.point1 : this.colors.point2);
        });
    }

    movePiece(piece, targetPoint) {
        const coords = this.getPointCoordinates(targetPoint);
        const pieceCount = this.getPieceCountOnPoint(targetPoint);
        piece.setAttribute('data-point', targetPoint);
        piece.setAttribute('cx', coords.x);
        piece.setAttribute('cy', this.getPieceY(targetPoint, pieceCount + 1));
    }
}
