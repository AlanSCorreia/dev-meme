window.onload = () => {
    // Variáveis de volume
    let isMuted = false;
    let masterVolume = 1;
    let musicVolume = 0.2;
    let clapVolume = 1;
    let score = 0; // Variável de bananas
    let started = false;
    let currentMusic; // Variável para controlar a música atual

    const monkey = document.getElementById('monkey');
    const scoreDisplay = document.getElementById('score');
    const cpsDisplay = document.getElementById('cps-counter');
    const clapSound = new Audio('assets/sounds/clap.mp3');
    const calmMusic = new Audio('assets/sounds/calm-music.mp3');
    const funkMusic = new Audio('assets/sounds/funk.mp3'); // Nova música funk
    const shotSound = new Audio('assets/sounds/shot.mp3'); // Novo som de tiro
    const startScreen = document.getElementById('start-screen');
    const shopContainer = document.getElementById('shop-items');

    // Configuração das músicas
    calmMusic.loop = true;
    funkMusic.loop = true;
    currentMusic = calmMusic; // Começa com a música calma

    // Lista de itens da loja
    const shopItems = [
        {
            name: 'Camisa do Flamengo',
            cost: 10,
            image: 'assets/imgs/monkey_idle_flamengo.png',
            onPurchase: () => {
                monkey.src = 'assets/imgs/monkey_idle_flamengo.png';
                monkey.setAttribute('data-current-skin', 'flamengo');
                alert('Você comprou a Camisa do Flamengo! Agora o macaco está estiloso com as cores do Flamengo.');
            }
        },
        {
            name: 'Camisa do São Paulo',
            cost: 10,
            image: 'assets/imgs/monkey_idle_saopaulo.png',
            onPurchase: () => {
                monkey.src = 'assets/imgs/monkey_idle_saopaulo.png';
                monkey.setAttribute('data-current-skin', 'saopaulo');
                alert('Você comprou a Camisa do Flamengo! Agora o macaco está estiloso com as cores do Flamengo.');
            }
        },
        {
            name: 'Camisa do Palmeiras',
            cost: 10,
            image: 'assets/imgs/monkey_idle_palmeiras.png',
            onPurchase: () => {
                monkey.src = 'assets/imgs/monkey_idle_palmeiras.png';
                monkey.setAttribute('data-current-skin', 'palmeiras');
                alert('Você comprou a Camisa do Flamengo! Agora o macaco está estiloso com as cores do Flamengo.');
            }
        },
        {
            name: 'Fundo de Favela',
            cost: 20,
            image: 'https://img.freepik.com/fotos-gratis/bela-vista-de-uma-pequena-cidade-nas-montanhas-durante-o-por-do-sol-no-brasil_181624-39388.jpg',
            onPurchase: () => {
                const gameElement = document.getElementById('game');
                gameElement.style.backgroundImage = 'url("https://img.freepik.com/fotos-gratis/bela-vista-de-uma-pequena-cidade-nas-montanhas-durante-o-por-do-sol-no-brasil_181624-39388.jpg")';
                gameElement.style.backgroundSize = 'cover';
                gameElement.style.backgroundPosition = 'center';

                // Troca a música
                currentMusic.pause();
                currentMusic.currentTime = 0;
                currentMusic = funkMusic;
                if (started) {
                    currentMusic.play().catch(err => {
                        console.warn("Erro ao tocar música funk:", err);
                    });
                    applyAudioSettings();
                }

                alert('Você comprou o Fundo de Favela! Agora o macaco está em seu habitat natural.');

                // Inicia os sons aleatórios de tiros
                startRandomShots();
            }
        }
        // Você pode adicionar mais itens aqui facilmente
    ];

    // Atualiza a exibição de bananas
    function updateScoreDisplay() {
        scoreDisplay.innerText = `Banana: ${score}`;
    }

    // Sliders
    const volumeMaster = document.getElementById('volume-master');
    const volumeClap = document.getElementById('volume-clap');
    const volumeMusic = document.getElementById('volume-music');
    const muteToggle = document.getElementById('mute-toggle');

    // Música
    calmMusic.loop = true;

    function applyAudioSettings() {
        const master = isMuted ? 0 : masterVolume;
        currentMusic.volume = musicVolume * master; // Usa a música atual
        clapSound.volume = clapVolume * master;
        shotSound.volume = clapVolume * master;
        currentMusic.muted = isMuted;
        clapSound.muted = isMuted;
        shotSound.muted = isMuted;
    }

    function updateVolumes() {
        masterVolume = parseFloat(volumeMaster.value);
        clapVolume = parseFloat(volumeClap.value);
        musicVolume = parseFloat(volumeMusic.value);
        applyAudioSettings();
    }

    // Eventos de sliders
    volumeMaster.addEventListener('input', updateVolumes);
    volumeClap.addEventListener('input', updateVolumes);
    volumeMusic.addEventListener('input', updateVolumes);

    muteToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        muteToggle.innerText = isMuted ? '🔊 Ativar Som' : '🔇 Mutar';
        applyAudioSettings();
    });

    // Início do jogo
    function startGame() {
        if (started) return;
        currentMusic.play().then(() => {
            started = true;
            applyAudioSettings();
            startScreen.classList.add('fade-out');
        }).catch(err => {
            console.warn("Erro ao iniciar música:", err);
        });
    }

    document.addEventListener('click', startGame);
    document.addEventListener('keydown', startGame);

    document.addEventListener('click', () => {
        if (!started) return;

        score++;
        updateScoreDisplay();
        monkey.src = 'assets/imgs/monkey_clap.png';
        clapSound.currentTime = 0;
        clapSound.play();
        showPlusOne();

        setTimeout(() => {
            const currentSkin = monkey.getAttribute('data-current-skin') || 'default';

            if (currentSkin != 'default') {
                monkey.src = `assets/imgs/monkey_idle_${currentSkin}.png`;
            } else {
                monkey.src = 'assets/imgs/monkey_idle.png'; // Retorna ao skin padrão
            }

        }, 200);
    });

    // DPS / CPS
    let clicks = 0;
    setInterval(() => {
        cpsDisplay.innerText = `CPS: ${clicks}`;
        clicks = 0;
    }, 1000);

    document.addEventListener('click', () => {
        if (started) clicks++;
    });

    // Animação +1
    let lastPlusOnePosition = { x: 0, y: 0 };
    function showPlusOne() {
        const game = document.getElementById('game');
        const plusOne = document.createElement('div');
        plusOne.classList.add('plus-one');
        plusOne.innerHTML = '+1 🍌'; // Adiciona o ícone de banana junto ao texto

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
            Math.abs(centerX + offsetX - lastPlusOnePosition.x) < 50 &&
            Math.abs(centerY + offsetY - lastPlusOnePosition.y) < 50 &&
            attempts < 10
        );

        lastPlusOnePosition = { x: centerX + offsetX, y: centerY + offsetY };

        plusOne.style.left = `${lastPlusOnePosition.x}px`;
        plusOne.style.top = `${lastPlusOnePosition.y}px`;
        game.appendChild(plusOne);

        requestAnimationFrame(() => {
            plusOne.classList.add('show');
        });

        setTimeout(() => {
            plusOne.remove();
        }, 800);
    }

    applyAudioSettings();

    // Lógica para compra de itens
    function purchaseItem(itemIndex, cost, onPurchase) {
        if (score < cost) {
            alert('Você precisa de mais bananas para comprar este item!');
            return;
        }

        score -= cost;
        updateScoreDisplay();
        onPurchase();

        // Remove o item comprado da loja visualmente e da lista
        if (itemIndex >= 0 && itemIndex < shopItems.length) {
            shopItems.splice(itemIndex, 1);
        }
    }

    // Função para tocar tiros aleatoriamente
    let shotInterval;
    function startRandomShots() {
        shotInterval = setInterval(() => {
            // Verifica se o jogo começou
            if (!started) return;

            // 60% de chance de tocar um tiro (aumentado de 20%)
            if (Math.random() < 0.6) {
                shotSound.currentTime = 0;
                shotSound.play().catch(err => {
                    console.warn("Erro ao tocar som de tiro:", err);
                });
            }
        }, 1000 + Math.random() * 4000); // Entre 1 e 5 segundos (reduzido de 5-15 segundos)
    }

    applyAudioSettings();
};