// Antigravity Raffle Agent Logic

const commentsInput = document.getElementById('commentsInput');
const btnLoad = document.getElementById('btnLoad');
const btnSpin = document.getElementById('btnSpin');
const btnReset = document.getElementById('btnReset');
const countLoadedSpan = document.getElementById('countLoaded');
const countValidSpan = document.getElementById('countValid');
const countInvalidSpan = document.getElementById('countInvalid');
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('winnerModal');
const winnerNameSpan = document.getElementById('winnerName');
const btnCloseModal = document.getElementById('btnCloseModal');

// Extractor Elements
const btnHelp = document.getElementById('btnHelp');
const btnPaste = document.getElementById('btnPaste');
const extractorModal = document.getElementById('extractorModal');
const btnCloseExtractor = document.getElementById('btnCloseExtractor');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const codeInstagram = document.getElementById('codeInstagram');
const codeFacebook = document.getElementById('codeFacebook');
const btnCopyInstagram = document.getElementById('btnCopyInstagram');
const btnCopyFacebook = document.getElementById('btnCopyFacebook');


let participants = []; 
let isSpinning = false;
let currentRotation = 0; 
let spinSpeed = 0;
let animationFrameId = null;

// Neon Palette
const colors = ['#00f3ff', '#2c67ff', '#ff0055', '#ffffff'];

// --- Extractor Scripts (Updated V2) ---

const INSTAGRAM_SCRIPT = `
// Antigravity Raffle Agent - Instagram Extractor (v2)
(function() {
    let comments = [];
    const items = document.querySelectorAll('ul li');
    
    items.forEach(li => {
        // 1. Získání jména (H3, H2 nebo odkaz uvnitř divu)
        let userEl = li.querySelector('h3, h2');
        if (!userEl) userEl = li.querySelector('div > a'); // Fallback

        if (!userEl) return;
        const username = userEl.innerText.trim();
        
        // 2. Získání textu (element s dir="auto" nebo span)
        // Ignorujeme jméno, pokud je v textu zopakováné
        let text = "";
        const textSpan = li.querySelector('span[dir="auto"]');
        
        if (textSpan) {
             text = textSpan.innerText.trim();
        } else {
             // Fallback: text celého obsahu minus jméno
             // Toto se ale často chytne i metadat
             text = li.innerText.replace(username, '').trim(); 
        }

        if(username && text.length > 0) {
            // Oddělovač ### pro bezpečnější split v aplikaci
            comments.push(username + ' ### ' + text);
        }
    });

    if(comments.length === 0) {
        alert('Nenalezeny žádné komentáře. Ujistěte se, že jste je načetli (tlačítko +).');
        return;
    }

    const output = comments.join('\\n');
    copyToClipboard(output, comments.length);

    function copyToClipboard(text, count) {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('Zkopírováno ' + count + ' komentářů! (Formát: User ### Text)');
    }
})();
`.trim();

const FACEBOOK_SCRIPT = `
// Antigravity Raffle Agent - Facebook Extractor
// Spusťte v konzoli (F12) na stránce příspěvku s otevřenými komentáři.
(function() {
    let comments = [];
    const commentDivs = document.querySelectorAll('div[aria-label^="Comment by"], div[aria-label^="Komentář od"]');
    
    if(commentDivs.length === 0) {
        alert("Nenalezeny komentáře pomocí standardních selektorů. Zkuste rozbalit 'Všechny komentáře'.");
    }

    commentDivs.forEach(div => {
        const label = div.getAttribute('aria-label');
        let username = label.replace('Comment by ', '').replace('Komentář od ', '').trim();
        
        const textDiv = div.querySelector('div[dir="auto"]');
        
        if(username && textDiv) {
            // Použijeme stejný bezpečný oddělovač
            comments.push(username + ' ### ' + textDiv.innerText);
        }
    });

    if(comments.length > 0) {
        const output = comments.join('\\n');
        copyToClipboard(output, comments.length);
    } else {
        alert('Žádné komentáře nenalezeny. (Zkuste sjet dolů a načíst více)');
    }

    function copyToClipboard(text, count) {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('Zkopírováno ' + count + ' komentářů! (Formát: User ### Text)');
    }
})();
`.trim();

// Fill code areas
codeInstagram.value = INSTAGRAM_SCRIPT;
codeFacebook.value = FACEBOOK_SCRIPT;

// --- Event Listeners ---

btnLoad.addEventListener('click', parseData);
btnSpin.addEventListener('click', startSpin);
btnReset.addEventListener('click', resetApp);

// Winner Modal
btnCloseModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Help/Extractor Modal
btnHelp.addEventListener('click', () => {
    extractorModal.classList.remove('hidden');
});

btnCloseExtractor.addEventListener('click', () => {
    extractorModal.classList.add('hidden');
});

// Tabs Logic
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Deactivate all
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active')); // Actually typically add hidden, but using CSS .active block display
        // Activate one
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// Copy Buttons
btnCopyInstagram.addEventListener('click', () => {
    navigator.clipboard.writeText(INSTAGRAM_SCRIPT).then(() => {
        btnCopyInstagram.innerText = "ZKOPÍROVÁNO!";
        setTimeout(() => btnCopyInstagram.innerText = "ZKOPÍROVAT KÓD", 2000);
    });
});

btnCopyFacebook.addEventListener('click', () => {
    navigator.clipboard.writeText(FACEBOOK_SCRIPT).then(() => {
        btnCopyFacebook.innerText = "ZKOPÍROVÁNO!";
        setTimeout(() => btnCopyFacebook.innerText = "ZKOPÍROVAT KÓD", 2000);
    });
});

// Paste Button
btnPaste.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        commentsInput.value = text;
        // Trigger visual feedback like flash?
        commentsInput.focus();
    } catch (err) {
        alert('Nepodařilo se načíst ze schránky. Zkontrolujte oprávnění prohlížeče.');
    }
});


// --- Core Logic ---

function parseData() {
    const rawText = commentsInput.value;
    const lines = rawText.split('\\n');
    let loaded = 0;
    let valid = 0;
    let invalid = 0;
    
    const seenUsers = new Set();
    const newParticipants = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return; // Skip empty lines
        loaded++;

        let username = '';
        let commentText = '';
        
        // Parsing Logic with Priority for Separators
        if (trimmed.includes(' ### ')) {
            // Priority 1: New Cleaner Separator
             const splitInd = trimmed.indexOf(' ### ');
             username = trimmed.substring(0, splitInd).trim();
             commentText = trimmed.substring(splitInd + 5).trim();
        } else if (trimmed.includes(' - ')) {
            // Priority 2: Dash Separator (Older Extractor or manual)
             const splitInd = trimmed.indexOf(' - ');
             username = trimmed.substring(0, splitInd).trim();
             commentText = trimmed.substring(splitInd + 3).trim();
        } else {
            // Priority 3: First space (Manual input fallback)
            const firstSpace = trimmed.indexOf(' ');
            if (firstSpace > -1) {
                username = trimmed.substring(0, firstSpace);
                commentText = trimmed.substring(firstSpace + 1);
            } else {
                username = trimmed;
            }
        }
        
        // --- CLEANING RULES ---
        // Odstranění "smetí" z konce řádku (metadata Instagram/FB)
        // Regex vysvětlení:
        // (\d+\s*[dhmsw]\s*)? -> Volitelně číslo + d/h/m/s/w (čas), např "2 d", "8 h", "12w"
        // Odpovědět -> Klíčové slovo
        // .*$ -> Vše do konce řádku
        
        // Remove "2 dOdpovědět", "8 hOdpovědět", "Odpovědět", "Reply"
        commentText = commentText.replace(/(\d+\s*[dhmsw]\s*)?Odpovědět.*$/i, '');
        commentText = commentText.replace(/(\d+\s*[dhmsw]\s*)?Reply.*$/i, '');
        commentText = commentText.replace(/To se mi líbí.*$/i, '');
        commentText = commentText.trim();
        
        // --- VALIDATION & DEDUPLICATION ---

        // Rule A: Check for '@' in the *whole line* (usually in comment)
        // Contest Rule: Must tag a friend.
        if (!trimmed.includes('@')) {
            invalid++;
            return;
        }

        // Rule B: Deduplication
        const userKey = username.toLowerCase();

        if (seenUsers.has(userKey)) {
            invalid++;
        } else {
            seenUsers.add(userKey);
            newParticipants.push(username); 
            valid++;
        }
    });

    if (newParticipants.length === 0) {
        alert("Žádní platní účastníci! Zkontrolujte, zda komentáře obsahují '@'.");
        return;
    }

    participants = newParticipants;
    
    countLoadedSpan.innerText = loaded;
    countValidSpan.innerText = valid;
    countInvalidSpan.innerText = invalid;
    
    btnSpin.disabled = false;
    btnReset.disabled = false;
    
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
    const radius = Math.min(centerX, centerY) - 10; 
    const arcSize = (2 * Math.PI) / participants.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation); 

    participants.forEach((name, i) => {
        const startAngle = i * arcSize;
        const endAngle = startAngle + arcSize;

        ctx.beginPath();
        ctx.moveTo(0, 0); 
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = (i % 2 === 0) ? colors[0] : colors[1];
        if (participants.length % 2 !== 0 && i === participants.length - 1) {
             ctx.fillStyle = colors[2]; 
        }
        
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.save();
        ctx.rotate(startAngle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px 'Roboto', sans-serif";
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
    btnReset.disabled = true;
    
    spinSpeed = Math.random() * 0.2 + 0.3; 
    
    animate();
}

function animate() {
    spinSpeed *= 0.985; // Friction

    if (spinSpeed < 0.002) {
        isSpinning = false;
        resolveWinner();
        btnSpin.disabled = false;
        btnLoad.disabled = false;
        btnReset.disabled = false;
        return;
    }

    currentRotation += spinSpeed;
    drawWheel();
    animationFrameId = requestAnimationFrame(animate);
}

function resolveWinner() {
    const normalizedRotation = currentRotation % (2 * Math.PI);
    let pointerAngle = (3 * Math.PI / 2) - normalizedRotation;
    if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
    pointerAngle %= (2 * Math.PI);
    
    const arcSize = (2 * Math.PI) / participants.length;
    const winnerIndex = Math.floor(pointerAngle / arcSize);
    
    const winner = participants[winnerIndex];
    
    showWinner(winner);
}

function showWinner(name) {
    winnerNameSpan.innerText = name;
    modal.classList.remove('hidden');
}
