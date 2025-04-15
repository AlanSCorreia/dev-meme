let GAME_STATE = {
    started: false,
    points: 0,
    muted: false,
    master: {
        volume: 1,
    },
    sfx: {
        src: new Audio('assets/sounds/clap.mp3'),
        volume: 0.2,
    },
    music: {
        src: new Audio('assets/sounds/calm-music.mp3'),
        volume: 0.2,
    },
    items: []
};


function getState() {
    const state = localStorage.getItem('gameState');
    return state;
}

function recoverState() {
    const state = getState();

    console.debug('Recovering game state...');
    console.debug('State:', state);

    if (!state) {
        console.debug('No state found, creating a new one...');
        return;
    }

    GAME_STATE = JSON.parse(localStorage.getItem('gameState'));
    GAME_STATE.started = false;
    GAME_STATE.sfx.src = new Audio('assets/sounds/clap.mp3');
    GAME_STATE.music.src = new Audio('assets/sounds/calm-music.mp3');
}

function saveState() {
    localStorage.setItem('gameState', JSON.stringify(GAME_STATE));
}


window.addEventListener("beforeunload", function () {
    saveState();
    console.debug('Game state saved!');    
});