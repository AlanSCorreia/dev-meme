const startScreen = document.getElementById('start-screen');
const shopContainer = document.getElementById('shop-items');
const cpsDisplay = document.getElementById('cps-counter');
const scoreDisplay = document.getElementById('score');
const itemButton = document.querySelector('.item-button');

let shotInterval;
let clicks = 0;
let currentPointsValue = 1;

eventEmitter.addListener('game:load', () => {
    console.debug('Window loaded!');
    recoverState();
    updateScoreDisplay();
});

eventEmitter.addListener('game:started', async () => {
    if (GAME_STATE.started) {
        console.debug('Game already started!');
        return;
    }

    GAME_STATE.started = !GAME_STATE.started;
    startScreen.classList = 'fade-out';
    
    changeScene("assets/imgs/fundo_de_floresta.png");
    playAudio(GAME_STATE.music.src);
    await loadShopItems();
    buildShop();
    createMission('mission1', 'Clique 100 vezes', 0, 100);

    console.debug('Game started!');
});

eventEmitter.addListener('game:returnButton', () => {
    const shop = document.querySelector('#shop');
    const categoriesContainer = shop.querySelector('.categories');
    const shopItems = document.querySelector('#shop-items');

    showElement(categoriesContainer);
    hideElement(shopItems);
});

eventEmitter.addListener('game:CPS', () => {
    if (GAME_STATE.started) clicks++;
    updateScoreDisplay();
});

eventEmitter.addListener('game:isMuted', () => {
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

eventEmitter.addListener('game:addBananas', () => {
    addPoints(currentPointsValue);
});

eventEmitter.addListener('game:monkeyAnimation', () => {
    if (!GAME_STATE.started) return;

    monkey.src = 'assets/imgs/monkey_clap.png';
    playAudio(GAME_STATE.sfx.src);
    showPoints(currentPointsValue);

    setTimeout(() => {
        const currentSkin = monkey.getAttribute('data-current-skin');
        monkey.src = currentSkin;

    }, 200);
});

setInterval(() => {
    cpsDisplay.innerText = `CPS: ${clicks}`;
    clicks = 0;
}, 1000);

function addPoints(points) {
    GAME_STATE.points += points;
}

function isAffordable(cost) {
    return GAME_STATE.points >= cost;
}

function updateScoreDisplay() {
    scoreDisplay.innerText = `Bananas: ${GAME_STATE.points}`;
}

function changePlayerSkin(path) {
    monkey.setAttribute('data-current-skin', path);
    monkey.src = path;
}

function hideElement(element) {
    element.classList.add('hidden');
}

function showElement(element) {
    element.classList.remove('hidden');
}

function changeScene(path, points) {
    currentPointsValue = points ? points : 1;
    const gameElement = document.getElementById('game');
    gameElement.style.backgroundImage = `url(${path})`;
    gameElement.style.backgroundSize = 'cover';
    gameElement.style.backgroundPosition = 'center';
}

function startRandomShots() {
    shotInterval = setInterval(() => {
        if (!GAME_STATE.started) return;

        // 40% de chance de tocar um tiro
        if (Math.random() < 0.4) {
            let lastSound = GAME_STATE.sfx.src;
            changeAudio(GAME_STATE.sfx, "assets/sounds/shot.mp3");
            playAudio(GAME_STATE.sfx.src);
            changeAudio(GAME_STATE.sfx, lastSound);
        }
    }, 1000 + Math.random() * 4000); // Entre 1 e 5 segundos (reduzido de 5-15 segundos)
}

async function loadShopItems() {
    try {
        const has_state = getState();
        if (has_state) {
            console.debug('State found, loading items from state...');
            GAME_STATE.items = JSON.parse(localStorage.getItem('gameState')).items;
            return;
        }
        
        const response = await fetch("./assets/shopItems/items.json");
        const items = await response.json();
        GAME_STATE.items = items;
        console.debug('Itens da loja:', items);
    } catch (error) {
        console.error('Erro ao carregar os itens da loja:', error);
    }
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
            if (isAffordable(item.cost)) {
                GAME_STATE.points -= item.cost;

                if (item.type === "cosmetic") { changePlayerSkin(element.src); }
                else { changeScene(element.src, item.points); }

                const path = img.src.split('/').splice(3).join('/')
                const index = GAME_STATE.items.findIndex(item => item.imagePath === path);
                button.innerHTML = button.innerHTML.replace(`${item.cost} 🍌`, 'Já possui');
                GAME_STATE.items[index].cost = 0;
            }
        })
    });
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

function showPoints(currentPointsValue) {
    const game = document.getElementById('game');
    const plusPoint = document.createElement('div');
    plusPoint.classList.add('plus-points');
    plusPoint.innerHTML = `+${currentPointsValue} 🍌`;

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

function createMission(id, description, initialValue, objectiveValue) {
    const missionHtml = `<div class="mission" id="${id}">
                <div class="mission-text">${description}</div>
                <progress class="mission-progress" value="${initialValue}" max="${objectiveValue}"></progress>
                <div class="mission-progress-text">${initialValue}/${objectiveValue}</div>
            </div>`;

    const missionContainer = document.querySelector('.missions');
    missionContainer.innerHTML += missionHtml;
}