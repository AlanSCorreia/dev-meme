function changeAudio(sound, newSrc) {
    sound.src = Audio(newSrc);
    sound.load();
    console.debug(`Changed sound source to: ${newSrc}`);
}

function playAudio(sound) {
    sound.currentTime = 0;
    sound.play().then(() => {
        console.debug(`Playing sound: ${sound.src}`);
    }).catch((error) => {
        console.error(`Error playing sound: ${error}`);
    });
}