const screen = document;
const game = document.getElementById('game');
const returnButton = document.getElementById('back');
const muteButton = document.getElementById('mute');

let lastPointPosition = { x: 0, y: 0 };

window.addEventListener('load', () => {
    eventEmitter.emit('game:load');
});

returnButton.addEventListener('click', () => {
    eventEmitter.emit('game:returnButton');
});

game.addEventListener('click', (event) => {
    eventEmitter.emit('game:addBananas');
    eventEmitter.emit('game:monkeyAnimation');
});

screen.addEventListener('click', async function () {
    eventEmitter.emit('game:started');
});

document.addEventListener('click', () => {
    eventEmitter.emit('game:CPS');
});

// Muting all sounds
muteButton.addEventListener('click', () => {
    eventEmitter.emit('game:isMuted');
});

// Audio controls
const volumeControls = {
    master: document.getElementById('master'),
    music: document.getElementById('music'),
    sfx: document.getElementById('sfx'),
};

for (const volumeControl of Object.keys(volumeControls)) {
    const control = volumeControls[volumeControl];
    control.addEventListener('input', updateVolume);
    control.setAttribute("value", GAME_STATE[volumeControl].volume)

    if (GAME_STATE[volumeControl].src) {
        GAME_STATE[volumeControl].src.volume = GAME_STATE[volumeControl].volume;
        GAME_STATE[volumeControl].volume = GAME_STATE[volumeControl].volume;
    } else {
        GAME_STATE.music.src.volume = GAME_STATE.music.volume;
        GAME_STATE.music.volume = GAME_STATE.music.volume;
        GAME_STATE.sfx.src.volume = GAME_STATE.sfx.volume;
        GAME_STATE.sfx.volume = GAME_STATE.sfx.volume;
    }
}

function updateVolume(event) {
    let sound = event.target.id;
    let desired_volume = parseFloat(event.target.value);

    console.debug(`Setting ${sound} volume to ${desired_volume}`);

    if (GAME_STATE[sound].src) {
        GAME_STATE[sound].src.volume = desired_volume;
        GAME_STATE[sound].volume = desired_volume;
    } else {
        GAME_STATE.music.src.volume = desired_volume;
        GAME_STATE.music.volume = desired_volume;
        GAME_STATE.sfx.src.volume = desired_volume;
        GAME_STATE.sfx.volume = desired_volume;
    }
}