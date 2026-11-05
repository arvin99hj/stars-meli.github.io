const audio = document.getElementById("audio");
const constellation = document.getElementById("constellation");
const intro = document.getElementById("intro");
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

const playButton = document.getElementById("play");
const playIcon = document.getElementById("play-icon");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const lyrics = [
    { section: "Verse 1", text: "Where have you been?" },
    { section: "Verse 1", text: "Do you know when you're coming back?" },
    { section: "Verse 1", text: "'Cause since you've been gone" },
    { section: "Verse 1", text: "I've got along but I've been sad" },

    { section: "Pre-Chorus", text: "I tried to put it out for you to get" },
    { section: "Pre-Chorus", text: "Could've, should've but you never did" },
    { section: "Pre-Chorus", text: "Wish you wanted it a little bit" },
    { section: "Pre-Chorus", text: "More but it's a chore for you to give" },

    { section: "Refrain", text: "Where have you been?" },
    { section: "Refrain", text: "Do you know if you're coming back?" },

    { section: "Chorus", text: "We were too close to the stars" },
    { section: "Chorus", text: "I never knew somebody like you, somebody" },
    { section: "Chorus", text: "Falling just as hard" },
    { section: "Chorus", text: "I'd rather lose somebody than use somebody" },
    { section: "Chorus", text: "Maybe it's a blessing in disguise" },
    { section: "Chorus", text: "I see myself in you" },
    { section: "Chorus", text: "I see my reflection in your eyes" },

    { section: "Verse 2", text: "I know you're sick" },
    { section: "Verse 2", text: "Hoping you fix whatever's broken" },
    { section: "Verse 2", text: "Ignorant bliss" },
    { section: "Verse 2", text: "And a few sips might be the potion" },

    { section: "Pre-Chorus", text: "I tried to put it out for you to get" },
    { section: "Pre-Chorus", text: "Could've, should've but you never did" },
    { section: "Pre-Chorus", text: "Wish you wanted in a little bit" },
    { section: "Pre-Chorus", text: "More but it's a chore for you to give" },

    { section: "Refrain", text: "Where have you been?" },
    { section: "Refrain", text: "Do you know if you're coming back?" },

    { section: "Chorus", text: "We were too close to the stars" },
    { section: "Chorus", text: "I never knew somebody like you, somebody" },
    { section: "Chorus", text: "Falling just as hard" },
    { section: "Chorus", text: "I'd rather lose somebody than use somebody" },
    { section: "Chorus", text: "Maybe it's a blessing in disguise" },
    { section: "Chorus", text: "I see myself in you" },
    { section: "Chorus", text: "I see my reflection in your eyes" },

    { section: "Bridge", text: "So close, so close" },
    { section: "Bridge", text: "Yet so far away" },
    { section: "Bridge", text: "I don't know" },
    { section: "Bridge", text: "How to be solo" },
    { section: "Bridge", text: "So don't go, oh no, just stay" },
    { section: "Bridge", text: "You and I were bright, shooting through the sky daily" },
    { section: "Bridge", text: "Lighting up the night, wasn't always right, baby" },
    { section: "Bridge", text: "Yeah, every time that we realign, it's crazy" },
    { section: "Bridge", text: "And you save me" },

    { section: "Chorus", text: "We were too close to the stars" },
    { section: "Chorus", text: "I never knew somebody like you, somebody" },
    { section: "Chorus", text: "Falling just as hard" },
    { section: "Chorus", text: "I'd rather lose somebody than use somebody" },
    { section: "Chorus", text: "Maybe it's a blessing in disguise" },
    { section: "Chorus", text: "I see myself in you" },
    { section: "Chorus", text: "I see my reflection in your eyes" },

    { section: "Outro", text: "Yeah, I bought the same ones too" },
    { section: "Outro", text: "I know you're tired, I know you tried" },
    { section: "Outro", text: "Just say your point of view" },
    { section: "Outro", text: "Yeah, sick of all the poison in me" },
    { section: "Outro", text: "What the hell do you want from me, babe?" },
    { section: "Outro", text: "I see myself in you, I see myself in you, baby" },
    { section: "Outro", text: "I see myself in you, alright" },
    { section: "Outro", text: "I sold my soul for you" },
    { section: "Outro", text: "Maybe you should stick with us now" }
];

const words = lyrics.flatMap(line =>
    line.text.split(/\s+/).map(word => ({
        word,
        section: line.section
    }))
);

const storageKey = "reflections-word-timings-v1";

let timings = loadTimings();
let currentWord = 0;
let previousStar = null;
let stars = [];
let backgroundStars = [];
let isRecording = false;
let muteBefore = 0;

function loadTimings() {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveTimings() {
    localStorage.setItem(storageKey, JSON.stringify(timings));
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    createBackgroundStars();
}

function createBackgroundStars() {
    backgroundStars = Array.from({ length: 150 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.3 + 0.3,
        opacity: Math.random() * 0.55 + 0.15,
        speed: Math.random() * 0.008 + 0.002,
        phase: Math.random() * Math.PI * 2
    }));
}

function drawBackground(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    backgroundStars.forEach(star => {
        const opacity = star.opacity *
            (0.65 + Math.sin(time * star.speed + star.phase) * 0.35);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 220, 255, ${opacity})`;
        ctx.fill();
    });

    requestAnimationFrame(drawBackground);
}

function randomPosition() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const minX = width < 600 ? 8 : 7;
    const maxX = width < 600 ? 92 : 93;

    const minY = 15;
    const maxY = 83;

    return {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY)
    };
}

function createConnection(previous, current) {
    if (!previous) return;

    const svg = document.getElementById("connection-layer");

    const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    line.setAttribute("x1", `${previous.x}%`);
    line.setAttribute("y1", `${previous.y}%`);
    line.setAttribute("x2", `${current.x}%`);
    line.setAttribute("y2", `${current.y}%`);
    line.setAttribute("class", "connection");

    svg.appendChild(line);
}

function createStar(wordData) {
    const position = randomPosition();

    const star = document.createElement("div");
    star.className = "star";

    const size = Math.random() * 5 + 5;
    star.style.setProperty("--size", `${size}px`);
    star.style.left = `${position.x}%`;
    star.style.top = `${position.y}%`;

    constellation.appendChild(star);

    const currentStar = {
        x: position.x,
        y: position.y,
        element: star
    };

    createConnection(previousStar, currentStar);

    previousStar = currentStar;
    stars.push(currentStar);

    createLyric(wordData.word, position);

    intro.classList.add("hidden");
}

function createLyric(word, position) {
    const lyric = document.createElement("div");
    lyric.className = "lyric-word";
    lyric.textContent = word;

    const offsetX = Math.random() > 0.5 ? 38 : -38;
    const offsetY = Math.random() > 0.5 ? -20 : 20;

    let x = position.x + offsetX / window.innerWidth * 100;
    let y = position.y + offsetY / window.innerHeight * 100;

    x = Math.max(7, Math.min(93, x));
    y = Math.max(12, Math.min(87, y));

    lyric.style.left = `${x}%`;
    lyric.style.top = `${y}%`;

    constellation.appendChild(lyric);

    setTimeout(() => {
        lyric.classList.add("fade-out");

        setTimeout(() => {
            lyric.remove();
        }, 1000);
    }, 3500);
}

function displayNextWord() {
    if (currentWord >= words.length) return;

    createStar(words[currentWord]);
    currentWord++;
}

function clearConstellation() {
    constellation.querySelectorAll(".star, .lyric-word, .connections").forEach(element => {
        element.remove();
    });

    previousStar = null;
    stars = [];

    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.id = "connection-layer";
    svg.setAttribute("class", "connections");
    svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
    svg.setAttribute("preserveAspectRatio", "none");
  
    constellation.prepend(svg);
}

function updateSyncInterface() {
    const count = timings.length;
    const total = words.length;

    document.getElementById("sync-count").textContent =
        `${count} / ${total} words synchronized`;

    document.getElementById("sync-progress-fill").style.width =
        `${count / total * 100}%`;

    const next = words[count];

    document.getElementById("sync-current").textContent =
        next ? next.word : "All words synchronized";

    document.getElementById("mark-word").disabled =
        count >= total;

    document.getElementById("mark-word").style.opacity =
        count >= total ? "0.4" : "1";
}

function markNextWord() {
    if (timings.length >= words.length) return;

    timings.push(audio.currentTime);
    saveTimings();
    updateSyncInterface();
}

function startPlayback() {
    audio.play().catch(() => {
        alert("Please check that reflections.mp3 exists in the assets folder.");
    });
}

playButton.addEventListener("click", () => {
    if (audio.paused) {
        startPlayback();
    } else {
        audio.pause();
    }
});

audio.addEventListener("play", () => {
    playIcon.innerHTML = '<path d="M7 5h4v14H7z M15 5h4v14h-4z"/>';
    intro.classList.add("hidden");
});

audio.addEventListener("pause", () => {
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
});

audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;

    document.getElementById("current-time").textContent =
        formatTime(audio.currentTime);

    document.getElementById("duration").textContent =
        formatTime(audio.duration);

    progress.value = audio.currentTime / audio.duration * 100;

    while (
        currentWord < timings.length &&
        audio.currentTime >= timings[currentWord]
    ) {
        displayNextWord();
    }
});

audio.addEventListener("loadedmetadata", () => {
    document.getElementById("duration").textContent =
        formatTime(audio.duration);
});

progress.addEventListener("input", () => {
    if (!audio.duration) return;

    audio.currentTime = progress.value / 100 * audio.duration;
});

audio.addEventListener("seeked", () => {
    currentWord = 0;
    clearConstellation();
    intro.classList.remove("hidden");

    while (
        currentWord < timings.length &&
        timings[currentWord] < audio.currentTime
    ) {
        currentWord++;
    }
});

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);

    if (audio.volume > 0) {
        audio.muted = false;
    }
});

document.getElementById("volume-button").addEventListener("click", () => {
    if (!audio.muted) {
        muteBefore = audio.volume;
        audio.muted = true;
    } else {
        audio.muted = false;
        audio.volume = muteBefore || 0.7;
        volume.value = audio.volume;
    }
});

document.getElementById("restart").addEventListener("click", () => {
    audio.currentTime = 0;
    currentWord = 0;
    clearConstellation();
    intro.classList.remove("hidden");
    startPlayback();
});

document.getElementById("sync-toggle").addEventListener("click", () => {
    document.getElementById("sync-panel").classList.add("open");
    updateSyncInterface();
});

document.getElementById("close-sync").addEventListener("click", () => {
    document.getElementById("sync-panel").classList.remove("open");
});

document.getElementById("mark-word").addEventListener("click", markNextWord);

document.getElementById("save-sync").addEventListener("click", () => {
    saveTimings();
    updateSyncInterface();
    document.getElementById("sync-panel").classList.remove("open");
});

document.getElementById("reset-sync").addEventListener("click", () => {
    if (!confirm("Delete all synchronized word timings?")) return;

    timings = [];
    currentWord = 0;

    saveTimings();
    clearConstellation();
    intro.classList.remove("hidden");
    updateSyncInterface();
});

const connectionLayer = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
);

connectionLayer.id = "connection-layer";
connectionLayer.setAttribute("class", "connections");
connectionLayer.setAttribute("preserveAspectRatio", "none");

const initialLayer = constellation.querySelector(".connections");

if (initialLayer) initialLayer.remove();

const resizeObserver = new ResizeObserver(() => {
    connectionLayer.setAttribute(
        "viewBox",
        `0 0 ${window.innerWidth} ${window.innerHeight}`
    );
});

const existingLayer = document.getElementById("connection-layer");

if (!existingLayer) {
    constellation.prepend(connectionLayer);
}

resizeObserver.observe(constellation);

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
requestAnimationFrame(drawBackground);

audio.volume = 0.7;
updateSyncInterface();
