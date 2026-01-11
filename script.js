// ads
// site

let isRunning = true;
let wordTyped = '';

let startTime = null;      // timestamp when the run starts
let timerInterval = null; // interval id for the timer

let spawnDelay = 1000; // ms between spawns
const MIN_DELAY = 300; // cap difficulty (lower = harder)
const RAMP = 0.985;    // 0.985 = gentle, 0.97 = aggressive

let z = 1000000;
let wordsCleared = 0;
let level = 5;
const words = [];

let formattedTime = 0;
let wpm = 0;

// Highlight the next word the player needs to type
let activeWordEl = null;

let loseCheckRaf = null;

function endGame() {
    isRunning = false;

    // Stop timers/loops
    if (timerInterval) clearInterval(timerInterval);
    if (loseCheckRaf) cancelAnimationFrame(loseCheckRaf);

    document.getElementById('final-words').innerText = wordsCleared;
    document.getElementById('final-time').innerText = formattedTime;
    document.getElementById('final-score').innerText = wpm;
    document.getElementById('game-over-modal').style.display = 'block';
}

function startLoseCheckLoop() {
    if (loseCheckRaf) cancelAnimationFrame(loseCheckRaf);

    const loop = () => {
        if (!isRunning) return;

        if (words.length > 0 && words[0].el) {
            const containerRect = document.getElementById('word-container').getBoundingClientRect();
            const wordRect = words[0].el.getBoundingClientRect();

            // Trigger game over as soon as the word's right edge reaches/passes the container's right edge
            if (wordRect.right >= containerRect.right) {
                endGame();
                return;
            }
        }

        loseCheckRaf = requestAnimationFrame(loop);
    };

    loseCheckRaf = requestAnimationFrame(loop);
}

function updateActiveWordHighlight() {
    // Remove highlight from previous active word
    if (activeWordEl) {
        activeWordEl.style.color = '';
        activeWordEl.style.fontWeight = '';
        activeWordEl = null;
    }

    // Apply highlight to the current active word (the first word in the queue)
    if (words.length > 0 && words[0].el) {
        activeWordEl = words[0].el;
        activeWordEl.style.color = '#4ecdc4';
        activeWordEl.style.fontWeight = '700';
    }
}

function startTimer() {
    startTime = Date.now();

    // Clear any existing timer
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!isRunning) return;

        const elapsedMs = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((elapsedMs % 1000) / 10);

        // Format as MM:SS.CC
        formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
        document.getElementById('time').innerText = formattedTime;

        // modify wpm
        wpm = `${Math.floor((wordsCleared / totalSeconds) * 60) || 0}`;
        document.getElementById('score').innerText = `${Math.floor((wordsCleared / totalSeconds) * 60) || 0}`;
    }, 50); // update 4x per second for smoothness
}

function gameTick() {
    if (!isRunning) return;

    // Spawn a word
    const w = new Word(z);
    z -= 1;
    words.push(w);
    updateActiveWordHighlight();

    

    // Schedule next tick using the NEW delay
    setTimeout(gameTick, spawnDelay);
}

function onWordCleared() {
    wordsCleared++;
    document.getElementById("words-cleared").innerText = wordsCleared;
  
    // Ramp every clear, not every spawn (feels earned)
    if (wordsCleared >= level) {
        const target = spawnDelay * RAMP;
        spawnDelay = Math.max(MIN_DELAY, target);

        level += wordsCleared;
    }
}

function restartGame() {
    // Stop any existing run by flipping the flag
    isRunning = false;

    // Clear words from DOM
    while (words.length) {
        words[0].remove();
        words.shift();
    }

    // Reset state
    isRunning = true;
    spawnDelay = 1000;
    z= 1000000;
    wordsCleared = 0;
    wordTyped = '';
        
    // Clear input
    document.getElementById('words-cleared').innerText = wordsCleared;
    document.getElementById('player-input').textContent = '';
    document.getElementById('game-over-modal').style.display = 'none';

    // Restart loop
    document.getElementById('time').innerText = '0:00'; // Reset timer display
    document.getElementById('score').innerText = '0'; // Reset wpm display
    setTimeout(gameTick, spawnDelay);
    startTimer();
    startLoseCheckLoop();
}

// Start loop
setTimeout(gameTick, spawnDelay);
startTimer();
startLoseCheckLoop();

window.addEventListener('keydown', e => {
    if (!isRunning) return;

    if (e.key == 'Backspace') {
        wordTyped = wordTyped.slice(0, -1);
    } else if (e.key == 'Enter') {
        wordTyped = '';
    } 
    else {
        wordTyped += e.key;
    }
    
    document.getElementById('player-input').innerText = wordTyped;

    if (wordTyped == words[0].el.innerText){
        onWordCleared();
        words[0].remove();
        words.shift();
        wordTyped = '';
        document.getElementById('player-input').innerText = '';

        updateActiveWordHighlight();
    }
});

