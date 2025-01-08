const themes = {
    'Forest Green': {
        light: '#E8F3E8',
        dark: '#769656',
        highlight: {
            base: 'rgba(255, 255, 0, 0.15)',
            stroke: '#FFFFFF',
            shadow: '0 0 10px rgba(255, 255, 255, 0.5)'
        },
        validMove: {
            base: 'rgba(255, 215, 0, 0.5)',
            stroke: '#FFD700',
            shadow: 'drop-shadow(0 0 4px #FFD700) drop-shadow(0 0 8px #DAA520)'
        },
        pieces: {
            white: '#FFFFFF',
            black: '#000000',
            whiteShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
            blackShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
        }
    },
    'Classic Brown': {
        light: '#f0d9b5',
        dark: '#b58863',
        highlight: {
            base: 'rgba(255, 255, 0, 0.15)',
            stroke: '#000000',
            shadow: '0 0 10px rgba(0, 0, 0, 0.5)'
        },
        validMove: {
            base: 'rgba(255, 215, 0, 0.5)',
            stroke: '#FFD700',
            shadow: 'drop-shadow(0 0 4px #FFD700) drop-shadow(0 0 8px #DAA520)'
        },
        pieces: {
            white: '#FFFFFF',
            black: '#000000',
            whiteShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
            blackShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
        }
    },
    'High Contrast': {
        light: '#FFFFFF',
        dark: '#000000',
        highlight: {
            base: 'rgba(255, 255, 0, 0.3)',
            stroke: '#FFD700',
            shadow: '0 0 10px rgba(255, 215, 0, 0.8)'
        },
        validMove: {
            base: 'rgba(255, 215, 0, 0.5)',
            stroke: '#FFD700',
            shadow: 'drop-shadow(0 0 4px #FFD700) drop-shadow(0 0 8px #DAA520)'
        },
        pieces: {
            white: '#FFFFFF',
            black: '#000000',
            whiteShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
            blackShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
        }
    },
    'Ocean Blue': {
        light: '#E8F3FF',
        dark: '#4682B4',
        highlight: {
            base: 'rgba(255, 255, 255, 0.2)',
            stroke: '#FFFFFF',
            shadow: '0 0 10px rgba(255, 255, 255, 0.6)'
        },
        validMove: {
            base: 'rgba(255, 215, 0, 0.5)',
            stroke: '#FFD700',
            shadow: 'drop-shadow(0 0 4px #FFD700) drop-shadow(0 0 8px #DAA520)'
        },
        pieces: {
            white: '#FFFFFF',
            black: '#000000',
            whiteShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
            blackShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
        }
    },
    'Twilight': {
        light: '#E8E8E8',
        dark: '#4A4A4A',
        highlight: {
            base: 'rgba(147, 112, 219, 0.2)',
            stroke: '#9370DB',
            shadow: '0 0 10px rgba(147, 112, 219, 0.6)'
        },
        validMove: {
            base: 'rgba(255, 215, 0, 0.5)',
            stroke: '#FFD700',
            shadow: 'drop-shadow(0 0 4px #FFD700) drop-shadow(0 0 8px #DAA520)'
        },
        pieces: {
            white: '#FFFFFF',
            black: '#000000',
            whiteShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
            blackShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
        }
    }
};

window.themes = themes;
