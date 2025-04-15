const screen = document;
const cpsDisplay = document.getElementById('cps-counter');
const startScreen = document.getElementById('start-screen');
const scoreDisplay = document.getElementById('score');
const shopContainer = document.getElementById('shop-items');
const backButton = document.getElementById('back');

let lastPointPosition = { x: 0, y: 0 };

// Back button
backButton.addEventListener('click', () => {
    const shop = document.querySelector('#shop');
    const categoriesContainer = shop.querySelector('.categories');
    const shopItems = document.querySelector('#shop-items');

    showElement(categoriesContainer);
    hideElement(shopItems);
});

// Start screen
screen.addEventListener('click', async function () {
    if (GAME_STATE.started) {
        return;
    }

    GAME_STATE.started = !GAME_STATE.started;
    startScreen.classList = 'fade-out';
    
    changeScene("assets/imgs/fundo_de_floresta.png")
    playAudio(GAME_STATE.music.src);
    await loadItems();
    buildShop();

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

muteButton.addEventListener('click', () => {
    GAME_STATE.isMuted = !GAME_STATE.isMuted;
    muteButton.innerText = GAME_STATE.isMuted ? '🔊 Ativar som' : '🔇 Mutar';

    if (GAME_STATE.isMuted) {
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

function updateScoreDisplay() {
    scoreDisplay.innerText = `Banana: ${GAME_STATE.points}`;
}

// Função para construir a loja de itens
async function loadItems() {
    try {
        const response = await fetch("./assets/shopItems/items.json");
        const items = await response.json();
        GAME_STATE.items = items;
        console.debug('Itens da loja:', items);
    } catch (error) {
        console.error('Erro ao carregar os itens da loja:', error);
    }
}

function buildShop() {
    const items = GAME_STATE.items;
    const shop = document.querySelector('#shop');
    const shopItems = document.querySelector('#shop-items');
    const categoriesContainer = shop.querySelector('.categories');

    const categories = [...new Set(items.map(item => item.type))];
    console.debug('Categorias:', categories);

    categories.map(category => {
        const button = document.createElement('button');
        button.innerText = category;
        button.addEventListener('click', () => {
            showElement(shopItems);
            hideElement(categoriesContainer);
            setCategory(category);
        });

        categoriesContainer.appendChild(button);
    });
}

function setCategory(category) {
    const items = GAME_STATE.items;
    const shopItems = document.querySelector('#shop-items');
    shopItems.innerHTML = '';

    const filteredItems = items.filter(item => item.type === category);
    console.debug('Itens filtrados:', filteredItems);

    filteredItems.forEach(item => {
        const button = document.createElement('button');
        const img = document.createElement('img');

        img.src = item.imagePath;
        button.appendChild(img);
        button.classList = 'item-button';
        const cost = item.cost == 0 ? 'Já possui' : `${item.cost} 🍌`;
        button.innerHTML = button.innerHTML + cost;

        shopItems.appendChild(button);

        button.addEventListener('click', (event) => {
            const element = event.target.querySelector('img')
            if (canIBuyIt(item.cost)) {
                GAME_STATE.points -= item.cost;
                if (item.type === "cosmetic") {
                    changePlayerSkin(element.src);
                }
                else {
                    changeScene(element.src, item.points)
                }
                const path = img.src.split('/').splice(3).join('/')
                const index = GAME_STATE.items.findIndex(item => item.imagePath === path);
                button.innerHTML = button.innerHTML.replace(`${item.cost} 🍌`, 'Já possui');
                GAME_STATE.items[index].cost = 0;
            }
        })
    });
}

// Função para atualizar pontos do jogo
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

function hideElement(element) {
    element.classList.add('hidden');
}

function showElement(element) {
    element.classList.remove('hidden');
}