const GAME_STATE = {
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
};