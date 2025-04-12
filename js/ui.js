const screen = document;
const cpsDisplay = document.getElementById('cps-counter');
const startScreen = document.getElementById('start-screen');
const scoreDisplay = document.getElementById('score');
const shopContainer = document.getElementById('shop-items');

let lastPointPosition = { x: 0, y: 0 };

// Start screen
screen.addEventListener('click', function(){ 
    if (GAME_STATE.started) {
        return;
    }

    GAME_STATE.started = !GAME_STATE.started;
    startScreen.classList = 'fade-out';

    playAudio(GAME_STATE.music.src);

    console.debug('Game started!');
});

// CPS
let clicks = 0;
setInterval(() => {
    cpsDisplay.innerText = `CPS: ${clicks}`;
    clicks = 0;
}, 1000);

document.addEventListener('click', () => {
    if (GAME_STATE.started) clicks++;
    updateScoreDisplay();
});

// Audio controls
const volumeControls = {
    master: document.getElementById('master'),
    music: document.getElementById('music'),
    sfx: document.getElementById('sfx'),
};

const muteButton = document.getElementById('mute');

for (const volumeControl of Object.keys(volumeControls)) {
    const control = volumeControls[volumeControl];
    control.addEventListener('input', updateVolume);
    control.setAttribute("value", GAME_STATE[volumeControl].volume)
    
    if(GAME_STATE[volumeControl].src) {
        GAME_STATE[volumeControl].src.volume = GAME_STATE[volumeControl].volume;
        GAME_STATE[volumeControl].volume = GAME_STATE[volumeControl].volume;
    } else {
        GAME_STATE.music.src.volume = GAME_STATE.music.volume;
        GAME_STATE.music.volume = GAME_STATE.music.volume;
        GAME_STATE.sfx.src.volume = GAME_STATE.sfx.volume;
        GAME_STATE.sfx.volume = GAME_STATE.sfx.volume;
    }
}

muteButton.addEventListener('click', () => {
    GAME_STATE.isMuted = !GAME_STATE.isMuted;
    muteButton.innerText = GAME_STATE.isMuted ? '🔊 Ativar som' : '🔇 Mutar';

    if(GAME_STATE.isMuted) {
        console.debug('Muting all sounds...');
        GAME_STATE.music.src.pause();
        GAME_STATE.sfx.src.volume = 0;
    } else {
        console.debug('Unmuting all sounds...');
        GAME_STATE.music.src.play();
        GAME_STATE.sfx.src.volume = GAME_STATE.sfx.volume;
    }
});

function updateVolume(event) {
    let sound = event.target.id;
    let desired_volume = parseFloat(event.target.value);

    console.debug(`Setting ${sound} volume to ${desired_volume}`);

    if(GAME_STATE[sound].src) {
        GAME_STATE[sound].src.volume = desired_volume;
        GAME_STATE[sound].volume = desired_volume;
    } else {
        GAME_STATE.music.src.volume = desired_volume;
        GAME_STATE.music.volume = desired_volume;
        GAME_STATE.sfx.src.volume = desired_volume;
        GAME_STATE.sfx.volume = desired_volume;
    }
}

function updateScoreDisplay() {
    scoreDisplay.innerText = `Banana: ${GAME_STATE.points}`;
}

// Função para construir a loja de itens
function buildShop() {
    shopContainer.innerHTML = ''; // Limpa o conteúdo atual

    shopItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.marginBottom = '10px';

        const button = document.createElement('button');
        button.id = `item-${index}`; // Usa o índice para criar o ID
        button.className = 'shop-item';

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.style.width = '24px';
        img.style.height = '24px';
        img.style.verticalAlign = 'middle';

        button.appendChild(img);
        button.appendChild(document.createTextNode(` ${item.name} - ${item.cost} 🍌`));

        // Adiciona evento de clique ao botão, passa o índice em vez do ID
        button.addEventListener('click', () => {
            purchaseItem(index, item.cost, item.onPurchase);
        });

        itemDiv.appendChild(button);
        shopContainer.appendChild(itemDiv);
    });
}

function showPoints(currentPointsValue) {
    const game = document.getElementById('game');
    const plusPoint = document.createElement('div');
    plusPoint.classList.add('plus-points');
    plusPoint.innerHTML = `+${currentPointsValue} 🍌`; // Adiciona o ícone de banana junto ao texto

    const monkeyRect = monkey.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();
    const centerX = monkeyRect.left + monkeyRect.width / 2 - gameRect.left;
    const centerY = monkeyRect.top + monkeyRect.height / 2 - gameRect.top;

    let offsetX, offsetY, attempts = 0;
    do {
        offsetX = (Math.random() - 0.5) * monkey.offsetWidth * 1.5;
        offsetY = (Math.random() - 0.5) * monkey.offsetHeight * 1.5;
        attempts++;
    } while (
        Math.abs(centerX + offsetX - lastPointPosition.x) < 50 &&
        Math.abs(centerY + offsetY - lastPointPosition.y) < 50 &&
        attempts < 10
    );

    lastPointPosition = { x: centerX + offsetX, y: centerY + offsetY };

    plusPoint.style.left = `${lastPointPosition.x}px`;
    plusPoint.style.top = `${lastPointPosition.y}px`;
    game.appendChild(plusPoint);

    requestAnimationFrame(() => {
        plusPoint.classList.add('show');
    });

    setTimeout(() => {
        plusPoint.remove();
    }, 800);
}