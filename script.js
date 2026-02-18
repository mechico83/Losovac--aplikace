// Antigravity Raffle Agent Logic

const commentsInput = document.getElementById("commentsInput");
const btnLoad = document.getElementById("btnLoad");
const btnSpin = document.getElementById("btnSpin");
const btnReset = document.getElementById("btnReset");
const countLoadedSpan = document.getElementById("countLoaded");
const countValidSpan = document.getElementById("countValid");
const countInvalidSpan = document.getElementById("countInvalid");
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const modal = document.getElementById("winnerModal");
const winnerNameSpan = document.getElementById("winnerName");
const btnCloseModal = document.getElementById("btnCloseModal");

let participants = []; // Array of valid usernames
let isSpinning = false;
let currentRotation = 0; // in radians
let spinSpeed = 0;
let animationFrameId = null;

// Neon Palette
const colors = ['#00f3ff', '#2c67ff', '#ff0055', '#ffffff'];

// --- Event Listeners ---

btnLoad.addEventListener('click', parseData);
btnSpin.addEventListener('click', startSpin);
btnReset.addEventListener('click', resetApp);
btnCloseModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    // Optional: Reset wheel visual or keep it there? Keep it there.
});

// --- Core Logic ---

function parseData() {
    const rawText = commentsInput.value;
    const lines = rawText.split('\n');
    let loaded = 0;
    let valid = 0;
    let invalid = 0;
    
    const seenUsers = new Set();
    const newParticipants = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return; // Skip empty lines
        loaded++;

        // Basic parsing: "Username Comment..."
        // Assume first word is username
        const parts = trimmed.split(/\s+/);
        const username = parts[0];
        const commentText = trimmed.substring(username.length).trim(); // The rest

        // Rule A: Check for '@' in the *whole line* (usually in comment)
        if (!trimmed.includes('@')) {
            invalid++;
            return;
        }

        // Rule B: Deduplication
        // We use lowercase for comparison to avoid "User" and "user" duplicates if desired, 
        // but strict usernames are often case-sensitive. Let's assume case-insensitive for safety.
        const userKey = username.toLowerCase();

        if (seenUsers.has(userKey)) {
            // Duplicate (already valid entry exists)
            // We count it as ignored/invalid? Or just don't count it as valid?
            // "Ostatní jsou ignorovány" -> typically implies they are 'discarded' from the valid pool.
            // Let's count as duplicate -> invalid/ignored bucket.
            invalid++;
        } else {
            seenUsers.add(userKey);
            newParticipants.push(username); // Store original casing
            valid++;
        }
    });

    // Valid check
    if (newParticipants.length === 0) {
        alert("Žádní platní účastníci! Zkontrolujte, zda komentáře obsahují '@'.");
        return;
    }

    // Update State
    participants = newParticipants;
    
    // Update UI
    countLoadedSpan.innerText = loaded;
    countValidSpan.innerText = valid;
    countInvalidSpan.innerText = invalid;
    
    btnSpin.disabled = false;
    btnReset.disabled = false;
    
    // Draw initial wheel
    drawWheel();
}

function resetApp() {
    isSpinning = false;
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    participants = [];
    currentRotation = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    commentsInput.value = '';
    countLoadedSpan.innerText = '0';
    countValidSpan.innerText = '0';
    countInvalidSpan.innerText = '0';
    btnSpin.disabled = true;
    btnReset.disabled = true;
}

// --- Wheel Graphics ---

function drawWheel() {
    if (participants.length === 0) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10; // Margin
    const arcSize = (2 * Math.PI) / participants.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation); // Apply rotation

    participants.forEach((name, i) => {
        const startAngle = i * arcSize;
        const endAngle = startAngle + arcSize;

        ctx.beginPath();
        ctx.moveTo(0, 0); // Center
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Color Logic: Alternate neon colors
        ctx.fillStyle = (i % 2 === 0) ? colors[0] : colors[1];
        // If odd total, last connects to first same color -> use Red
        if (participants.length % 2 !== 0 && i === participants.length - 1) {
             ctx.fillStyle = colors[2]; // Red/Pink
        }
        
        ctx.fill();
        ctx.stroke();

    // Text
    ctx.save();
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px 'Roboto', sans-serif";
    // Ensure text fits
    ctx.fillText(name, radius - 20, 5);
    ctx.restore();
  });

  ctx.restore();
}

// --- Animation & Physics ---

function startSpin() {
  if (isSpinning || participants.length === 0) return;

  isSpinning = true;
  btnSpin.disabled = true;
  btnLoad.disabled = true;

  // Randomize initial speed (20-40 rad/s is fast)
  // Actually typically want it to spin for X seconds.
  // Let's use a simple decay physics model.
  spinSpeed = Math.random() * 0.2 + 0.3; // High initial speed

  animate();
}

function animate() {
  // Decelerate
  spinSpeed *= 0.985; // Friction

  if (spinSpeed < 0.002) {
    // Stop
    isSpinning = false;
    resolveWinner();
    btnSpin.disabled = false;
    btnLoad.disabled = false;
    return;
  }

  currentRotation += spinSpeed;
  drawWheel();
  animationFrameId = requestAnimationFrame(animate);
}

function resolveWinner() {
  // Determine angle at the top pointer (Top is 270 deg or -PI/2 in Canvas 0-start system)
  // Canvas 0 is right (3 o'clock).
  // Rotation is Clockwise.
  // We need to know which segment is at -PI/2 (top).

  // Normalize rotation to 0 - 2PI
  const normalizedRotation = currentRotation % (2 * Math.PI);

  // The canvas rotates the *drawing*.
  // If we rotate +10 deg, the segment at 0 moves to 10.
  // The pointer is static at -90 deg (270).
  // So we need to find which segment `i` satisfies:
  // (i * arc + rotation) contains -PI/2?

  // Simpler: The pointer is at 3/2 PI (270 deg) or -PI/2 in the rotated frame.
  // Effective angle of pointer relative to 0-index segment = (PointerAngle - Rotation)
  let pointerAngle = (3 * Math.PI) / 2 - normalizedRotation;

  // Normalize to 0-2PI
  if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
  pointerAngle %= 2 * Math.PI;

  const arcSize = (2 * Math.PI) / participants.length;
  const winnerIndex = Math.floor(pointerAngle / arcSize);

  const winner = participants[winnerIndex];

  // Show Modal
  showWinner(winner);
}

function showWinner(name) {
  winnerNameSpan.innerText = name;
  modal.classList.remove("hidden");

  // Confetti effect could go here
}
