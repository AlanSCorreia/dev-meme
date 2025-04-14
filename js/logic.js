const game = document.getElementById('game');
const itemButton = document.querySelector('.item-button')

let shotInterval;
let currentPointsValue = 1;

game.addEventListener('click', (event) => {
    if (!GAME_STATE.started) return;

    addPoints(currentPointsValue);
    monkey.src = 'assets/imgs/monkey_clap.png';
    playAudio(GAME_STATE.sfx.src)
    showPoints(currentPointsValue);

    setTimeout(() => {
        const currentSkin = monkey.getAttribute('data-current-skin');
        monkey.src = currentSkin

    }, 200);
});

function addPoints(points) {
    GAME_STATE.points += points
}

function setPointsValue(value) {
    return value
}

function canIBuyIt(cost) {
    return GAME_STATE.points >= cost;
}

function changePlayerSkin(path) {
    monkey.setAttribute('data-current-skin', path);
    monkey.src = path;
}

function changeScene(path) {
    const gameElement = document.getElementById('game');
    gameElement.style.backgroundImage = path;
    gameElement.style.backgroundSize = 'cover';
    gameElement.style.backgroundPosition = 'center';
}

function startRandomShots() {
    shotInterval = setInterval(() => {
        if (!GAME_STATE.started) return;

        // 40% de chance de tocar um tiro
        if (Math.random() < 0.4) {
            let lastSound = GAME_STATE.sfx.src
            changeAudio(GAME_STATE.sfx, "assets/sounds/shot.mp3")
            playAudio(GAME_STATE.sfx.src)
            changeAudio(GAME_STATE.sfx, lastSound)
        }
    }, 1000 + Math.random() * 4000); // Entre 1 e 5 segundos (reduzido de 5-15 segundos)
}