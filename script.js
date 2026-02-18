// Antigravity Raffle Agent Logic - V5 (Strict Parsing)
// Senior JS Implementation

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

// Audit Logs Elements
const rejectedModal = document.getElementById('rejectedModal');
const rejectedTableBody = document.getElementById('rejectedTableBody');
const rejectedCountSpan = document.getElementById('rejectedCount');
const btnCloseRejected = document.getElementById('btnCloseRejected');
const invalidStatBox = document.querySelector('.stat-box.invalid');

const validModal = document.getElementById('validModal');
const validList = document.getElementById('validList');
const validCountModal = document.getElementById('validCountModal');
const btnCloseValid = document.getElementById('btnCloseValid');
const btnCopyValid = document.getElementById('btnCopyValid');
const validStatBox = document.querySelector('.stat-box.valid');

// State
let participants = []; 
let rejectedEntries = [];
let isSpinning = false;
let currentRotation = 0; 
let spinSpeed = 0;
let animationFrameId = null;

// Configuration
const colors = ['#00f3ff', '#2c67ff', '#ff0055', '#ffffff'];
const BLOCKED_USERS = [
    'bellakvet', 'Recenze', 'O MNĚ', 'Sbírka', 'Košík', 'Hledat', 'Upraveno', 
    'MATERIÁL', 'BALENÍ', 'Vyhraj', 'Chcete', 'Sleduj', 'Dej', 'Označ', 
    'POZOR', 'Musí', 'Pouze', 'Soutěž', 'Vítěze', 'Www', 
    '1', '2', '3', 'Giveaway', 'Koralky', 'Sperky', 'Rucniprace', 'Naramek',
    'Sbírka kytiček'
];

// --- Extractor Scripts ---

const INSTAGRAM_SCRIPT = `
// Antigravity Raffle Agent - Instagram Extractor (v2)
(function() {
    let comments = [];
    const items = document.querySelectorAll('ul li');
    
    items.forEach(li => {
        let userEl = li.querySelector('h3, h2');
        if (!userEl) userEl = li.querySelector('div > a');
        if (!userEl) return;
        const username = userEl.innerText.trim();
        
        let text = "";
        const textSpan = li.querySelector('span[dir="auto"]');
        
        if (textSpan) {
             text = textSpan.innerText.trim();
        } else {
             text = li.innerText.replace(username, '').trim(); 
        }

        if(username && text.length > 0) {
            comments.push(username + ' ### ' + text);
        }
    });

    if(comments.length === 0) {
        alert('Nenalezeny žádné komentáře.');
        return;
    }

    const output = comments.join('\\n');
    const el = document.createElement('textarea');
    el.value = output;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Zkopírováno ' + comments.length + ' komentářů! (Formát: User ### Text)');
})();
`.trim();

const FACEBOOK_SCRIPT = `
// Antigravity Raffle Agent - Facebook Extractor (Smart Tagging)
(function() {
    let comments = [];
    // Hledáme komentáře (aria-label="Komentář od..." nebo "Comment by...")
    const commentDivs = document.querySelectorAll('div[aria-label^="Comment by"], div[aria-label^="Komentář od"]');
    
    if(commentDivs.length === 0) {
        alert("Nenalezeny komentáře. Zkuste přepnout filtr na 'Všechny komentáře' a rozbalit je.");
        return;
    }

    commentDivs.forEach(div => {
        const label = div.getAttribute('aria-label');
        let username = label.replace('Comment by ', '').replace('Komentář od ', '').trim();
        
        // Najdeme kontejner s textem (často div s dir="auto")
        const textDiv = div.querySelector('div[dir="auto"]');
        
        if(username && textDiv) {
            // CLONE: Vytvoříme kopii elementu, abychom neničili stránku
            const clone = textDiv.cloneNode(true);
            
            // MAGIC: Najdeme všechny odkazy (tagy) v kopii a přidáme k nim zavináč
            const links = clone.querySelectorAll('a');
            links.forEach(link => {
                // Pokud odkaz obsahuje text (není to třeba jen smajlík), přidáme @
                if(link.innerText.length > 1) {
                    link.innerText = '@' + link.innerText;
                }
            });

            // Teď vezmeme text z upravené kopie
            let finalBody = clone.innerText.trim();
            
            // Uložíme s oddělovačem
            comments.push(username + ' ### ' + finalBody);
        }
    });

    if(comments.length > 0) {
        const output = comments.join('\\n');
        const el = document.createElement('textarea');
        el.value = output;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('Zkopírováno ' + comments.length + ' komentářů! (Automaticky doplněny @ u označených přátel)');
    } else {
        alert('Žádné komentáře se nepodařilo zpracovat.');
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
btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));

btnHelp.addEventListener('click', () => extractorModal.classList.remove('hidden'));
btnCloseExtractor.addEventListener('click', () => extractorModal.classList.add('hidden'));

// Audit Logs Listeners
invalidStatBox.addEventListener('click', showRejectedModal);
btnCloseRejected.addEventListener('click', () => rejectedModal.classList.add('hidden'));

validStatBox.addEventListener('click', showValidModal);
btnCloseValid.addEventListener('click', () => validModal.classList.add('hidden'));
btnCopyValid.addEventListener('click', () => {
    if (participants.length === 0) return;
    const text = participants.join('\n');
    navigator.clipboard.writeText(text).then(() => {
        btnCopyValid.innerText = '✅ ZKOPÍROVÁNO!';
        setTimeout(() => btnCopyValid.innerText = '📋 ZKOPÍROVAT SEZNAM', 2000);
    });
});

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

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

btnPaste.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        commentsInput.value = text;
        commentsInput.focus();
    } catch (err) {
        alert('Nepodařilo se načíst ze schránky.');
    }
});


// =============================================
// CORE LOGIC (V5 - Strict Parsing)
// =============================================

function parseData() {
    const rawText = commentsInput.value;
    const lines = rawText.split('\n');
    let loaded = 0;
    let valid = 0;
    let invalid = 0;
    
    const seenUsers = new Set();
    const newParticipants = [];
    rejectedEntries = []; // Reset audit log

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return; 
        loaded++;

        let username = '';
        let commentText = '';

        // 1. Strict Format Detection
        if (trimmed.includes('###')) {
            // Standard extractor format
            const parts = trimmed.split('###');
            username = parts[0].trim();
            commentText = parts.slice(1).join('###').trim();
        } 
        else {
            // Non-standard format? Danger zone.
            
            // STRICT RULE: If no separator AND no '@', assume it's Rule Text
            if (!trimmed.includes('@')) {
                invalid++;
                // Use first few words as 'name' for the log
                const preview = trimmed.substring(0, 30) + (trimmed.length > 30 ? '...' : '');
                rejectedEntries.push({ name: preview, reason: 'TEXT/PRAVIDLA' });
                return;
            }

            // Fallback parsing for manual entries containing '@'
            if (trimmed.includes(' - ')) {
                const parts = trimmed.split(' - ');
                username = parts[0].trim();
                commentText = parts.slice(1).join(' - ').trim();
            } else {
                const firstSpace = trimmed.indexOf(' ');
                if (firstSpace > -1) {
                    username = trimmed.substring(0, firstSpace).trim();
                    commentText = trimmed.substring(firstSpace + 1).trim();
                } else {
                    username = trimmed;
                    commentText = '';
                }
            }
        }

        // Cleanup metadata noise
        commentText = commentText.replace(/(\d+\s*[dhmsw]\s*)?Odpovědět.*$/i, '');
        commentText = commentText.replace(/(\d+\s*[dhmsw]\s*)?Reply.*$/i, '');
        commentText = commentText.replace(/To se mi líbí.*$/i, '');
        commentText = commentText.replace(/Upraveno.*$/i, '');
        commentText = commentText.trim();

        const lowerUser = username.toLowerCase();

        // --- FILTER 1: Blacklist (Reason: BLACKLIST) ---
        if (BLOCKED_USERS.some(b => b.toLowerCase() === lowerUser)) {
            invalid++;
            rejectedEntries.push({ name: username, reason: 'BLACKLIST' });
            return;
        }

        // --- FILTER 2: Navigation noise (Reason: NAVIGACE) ---
        if (commentText && lowerUser === commentText.toLowerCase()) {
            invalid++;
            rejectedEntries.push({ name: username, reason: 'NAVIGACE' });
            return;
        }

        // --- FILTER 3: Bad format (Reason: VADNÝ FORMÁT) ---
        if (!username || !commentText) {
            invalid++;
            rejectedEntries.push({ name: username || '(prázdné)', reason: 'VADNÝ FORMÁT' });
            return;
        }

        // --- FILTER 4: Long text (Reason: DLOUHÝ TEXT) ---
        if (commentText.length > 300) {
            invalid++;
            rejectedEntries.push({ name: username, reason: 'DLOUHÝ TEXT' });
            return;
        }

        // --- FILTER 5: Mandatory '@' (Reason: CHYBÍ @) ---
        // Just in case parsing succeeded but @ is missing (caught by STRICT rule usually, but explicit format might miss it)
        if (!commentText.includes('@')) {
            invalid++;
            rejectedEntries.push({ name: username, reason: 'CHYBÍ @' });
            return;
        }

        // --- FILTER 6: Deduplication (Reason: DUPLICITA) ---
        if (seenUsers.has(lowerUser)) {
            invalid++;
            rejectedEntries.push({ name: username, reason: 'DUPLICITA' });
            return;
        }

        // ✅ PASS
        seenUsers.add(lowerUser);
        newParticipants.push(username); 
        valid++;
    });

    if (newParticipants.length === 0) {
        alert("Žádní platní účastníci! Zkontrolujte, zda komentáře obsahují '@' a nejsou textem pravidel.");
    }

    participants = newParticipants;
    
    countLoadedSpan.innerText = loaded;
    countValidSpan.innerText = valid;
    countInvalidSpan.innerText = invalid;
    
    btnSpin.disabled = participants.length === 0;
    btnReset.disabled = false;
    
    drawWheel();
}


// =============================================
// AUDIT LOG MODAL (Rejected)
// =============================================

function showRejectedModal() {
    if (rejectedEntries.length === 0) return;
    
    rejectedCountSpan.innerText = rejectedEntries.length;

    let html = '';
    rejectedEntries.forEach((entry, i) => {
        const badgeClass = getBadgeClass(entry.reason);
        html += `<tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(entry.name)}</td>
            <td><span class="reason-badge ${badgeClass}">${entry.reason}</span></td>
        </tr>`;
    });
    
    rejectedTableBody.innerHTML = html;
    rejectedModal.classList.remove('hidden');
}

function getBadgeClass(reason) {
    switch (reason) {
        case 'BLACKLIST':     return 'blacklist';
        case 'TEXT/PRAVIDLA': return 'blacklist'; // Same style as blacklist
        case 'CHYBÍ @':       return 'missing-at';
        case 'DUPLICITA':     return 'duplicate';
        case 'DLOUHÝ TEXT':   return 'long-text';
        case 'VADNÝ FORMÁT':  return 'bad-format';
        case 'NAVIGACE':      return 'nav-noise';
        case 'TEXT BEZ @':    return 'missing-at';
        default:              return '';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// =============================================
// VALID PARTICIPANTS MODAL
// =============================================

function showValidModal() {
    if (participants.length === 0) return;

    validCountModal.innerText = participants.length;

    let html = '<ul class="valid-list">';
    participants.forEach((name, i) => {
        html += `<li>
            <span class="valid-index">${i + 1}.</span>
            <span class="valid-name">${escapeHtml(name)}</span>
        </li>`;
    });
    html += '</ul>';

    validList.innerHTML = html;
    validModal.classList.remove('hidden');
}


// =============================================
// RESET
// =============================================

function resetApp() {
    isSpinning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    participants = [];
    rejectedEntries = [];
    currentRotation = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    commentsInput.value = '';
    countLoadedSpan.innerText = '0';
    countValidSpan.innerText = '0';
    countInvalidSpan.innerText = '0';
    btnSpin.disabled = true;
    btnReset.disabled = true;
}


// =============================================
// WHEEL GRAPHICS
// =============================================

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


// =============================================
// ANIMATION & PHYSICS
// =============================================

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
    spinSpeed *= 0.985;

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
    
    showWinner(participants[winnerIndex]);
}

function showWinner(name) {
    winnerNameSpan.innerText = name;
    modal.classList.remove('hidden');
}
