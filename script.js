let timer;
let isRunning = false;
let startTime = null; 
let elapsedTime = 0;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const continueBtn = document.getElementById('continueBtn'); // New continue button
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

const socket = new WebSocket('ws://192.168.29.111:8080');

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.startTime) {
        startTime = data.startTime;
        isRunning = true;
        runTimer();
    }

    if (data.reset) {
        clearInterval(timer);
        startTime = null;
        elapsedTime = 0;
        isRunning = false;
        display.textContent = formatTime(0, 0);
    }
};

startBtn.addEventListener('click', () => {
    if (!isRunning) {
        socket.send(JSON.stringify({ type: 'start' }));
    }
});

continueBtn.addEventListener('click', () => {
    if (!isRunning) {
        // Resume the timer
        startTime = Date.now() - elapsedTime; // Adjust startTime to account for elapsed time
        isRunning = true;
        runTimer();
    }
});

stopBtn.addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = Date.now() - startTime; // Calculate elapsed time
});

resetBtn.addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'reset' }));
});

function runTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        const now = Date.now();
        const timePassed = elapsedTime + (now - startTime);
        const seconds = Math.floor(timePassed / 1000);
        const milliseconds = timePassed % 1000;
        display.textContent = formatTime(seconds, milliseconds);
    }, 10); // Update every 10 ms
}

function formatTime(seconds, milliseconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const ms = Math.floor(milliseconds / 10);
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(ms, 2)}`;
}

function pad(num, size = 2) {
    return num.toString().padStart(size, '0');
}
