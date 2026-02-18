// Antigravity Raffle Agent Logic - V6 (Final)

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

// Extractor Elements
const btnHelp = document.getElementById("btnHelp");
const btnPaste = document.getElementById("btnPaste");
const extractorModal = document.getElementById("extractorModal");
const btnCloseExtractor = document.getElementById("btnCloseExtractor");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const codeInstagram = document.getElementById("codeInstagram");
const codeFacebook = document.getElementById("codeFacebook");
const btnCopyInstagram = document.getElementById("btnCopyInstagram");
const btnCopyFacebook = document.getElementById("btnCopyFacebook");

// Audit Logs Elements
const rejectedModal = document.getElementById("rejectedModal");
const rejectedTableBody = document.getElementById("rejectedTableBody");
const rejectedCountSpan = document.getElementById("rejectedCount");
const btnCloseRejected = document.getElementById("btnCloseRejected");
const invalidStatBox = document.querySelector(".stat-box.invalid");

const validModal = document.getElementById("validModal");
const validList = document.getElementById("validList");
const validCountModal = document.getElementById("validCountModal");
const btnCloseValid = document.getElementById("btnCloseValid");
const btnCopyValid = document.getElementById("btnCopyValid");
const validStatBox = document.querySelector(".stat-box.valid");

// State
let participants = [];
let rejectedEntries = [];
let isSpinning = false;
let currentRotation = 0;
let spinSpeed = 0;
let animationFrameId = null;

// Configuration
const colors = ["#00f3ff", "#2c67ff", "#ff0055", "#ffffff"];
const BLOCKED_USERS = [
  "bellakvet",
  "Recenze",
  "O MNĚ",
  "Sbírka",
  "Košík",
  "Hledat",
  "Upraveno",
  "MATERIÁL",
  "BALENÍ",
  "Vyhraj",
  "Chcete",
  "Sleduj",
  "Dej",
  "Označ",
  "POZOR",
  "Musí",
  "Pouze",
  "Soutěž",
  "Vítěze",
  "Www",
  "1",
  "2",
  "3",
  "Giveaway",
  "Koralky",
  "Sperky",
  "Rucniprace",
  "Naramek",
  "Sbírka kytiček",
];

// =============================================
// EXTRACTOR SCRIPTS (Template Strings)
// =============================================

var INSTAGRAM_SCRIPT = [
  "// Antigravity Raffle Agent - Instagram Extractor (v2)",
  "(function() {",
  "    var comments = [];",
  '    var items = document.querySelectorAll("ul li");',
  "    items.forEach(function(li) {",
  '        var userEl = li.querySelector("h3, h2");',
  '        if (!userEl) userEl = li.querySelector("div > a");',
  "        if (!userEl) return;",
  "        var username = userEl.innerText.trim();",
  '        var text = "";',
  "        var textSpan = li.querySelector('span[dir=\"auto\"]');",
  "        if (textSpan) {",
  "            text = textSpan.innerText.trim();",
  "        } else {",
  '            text = li.innerText.replace(username, "").trim();',
  "        }",
  "        if (username && text.length > 0) {",
  '            comments.push(username + " ### " + text);',
  "        }",
  "    });",
  "    if (comments.length === 0) {",
  '        alert("Nenalezeny komentare.");',
  "        return;",
  "    }",
  '    var output = comments.join("\\n");',
  '    var el = document.createElement("textarea");',
  "    el.value = output;",
  "    document.body.appendChild(el);",
  "    el.select();",
  '    document.execCommand("copy");',
  "    document.body.removeChild(el);",
  '    alert("Zkopirovano " + comments.length + " komentaru!");',
  "})();",
].join("\n");

var FACEBOOK_SCRIPT = [
  "// Antigravity Raffle Agent - Facebook Extractor (v3 - Jarmila Fix)",
  "(function() {",
  "    var comments = [];",
  '    var commentDivs = document.querySelectorAll(\'div[aria-label^="Comment by"], div[aria-label^="Komentář od"]\');',
  "    if (commentDivs.length === 0) {",
  '        alert("Nenalezeny komentare. Rozbalte Vsechny komentare.");',
  "        return;",
  "    }",
  "    commentDivs.forEach(function(div) {",
  '        var label = div.getAttribute("aria-label");',
  '        var username = label.replace("Comment by ", "").replace("Komentář od ", "").trim();',
  "        var textDiv = div.querySelector('div[dir=\"auto\"]');",
  '        if (!textDiv) textDiv = div.querySelector(".x1lliihq.x6ikm8r.x10wlt62 span");',
  "        if (username && textDiv) {",
  "            var clone = textDiv.cloneNode(true);",
  '            clone.querySelectorAll("br").forEach(function(br) { br.replaceWith(" "); });',
  '            clone.querySelectorAll("a").forEach(function(link) {',
  '                if (link.innerText.length > 1 && !link.innerText.startsWith("#")) {',
  '                    link.innerText = "@" + link.innerText;',
  "                }",
  "            });",
  '            var finalBody = clone.innerText.replace(/\\s+/g, " ").trim();',
  "            if (finalBody.startsWith(username)) {",
  "                finalBody = finalBody.substring(username.length).trim();",
  "            }",
  "            if (finalBody.length > 0) {",
  '                comments.push(username + " ### " + finalBody);',
  "            }",
  "        }",
  "    });",
  "    if (comments.length > 0) {",
  '        var el = document.createElement("textarea");',
  '        el.value = comments.join("\\n");',
  "        document.body.appendChild(el);",
  "        el.select();",
  '        document.execCommand("copy");',
  "        document.body.removeChild(el);",
  '        alert("Zkopirovano " + comments.length + " zaznamu! (Vcetne opravy vice radku)");',
  "    } else {",
  '        alert("Nepodarilo se nacist texty.");',
  "    }",
  "})();",
].join("\n");

// Fill code areas
codeInstagram.value = INSTAGRAM_SCRIPT;
codeFacebook.value = FACEBOOK_SCRIPT;

// =============================================
// EVENT LISTENERS
// =============================================

btnLoad.addEventListener("click", function () {
  parseData();
});
btnSpin.addEventListener("click", function () {
  startSpin();
});
btnReset.addEventListener("click", function () {
  resetApp();
});
btnCloseModal.addEventListener("click", function () {
  modal.classList.add("hidden");
});

btnHelp.addEventListener("click", function () {
  extractorModal.classList.remove("hidden");
});
btnCloseExtractor.addEventListener("click", function () {
  extractorModal.classList.add("hidden");
});

// Audit Logs Listeners
invalidStatBox.addEventListener("click", function () {
  showRejectedModal();
});
btnCloseRejected.addEventListener("click", function () {
  rejectedModal.classList.add("hidden");
});

validStatBox.addEventListener("click", function () {
  showValidModal();
});
btnCloseValid.addEventListener("click", function () {
  validModal.classList.add("hidden");
});

btnCopyValid.addEventListener("click", function () {
  if (participants.length === 0) return;
  var text = participants.join("\n");
  navigator.clipboard.writeText(text).then(function () {
    btnCopyValid.innerText = "✅ ZKOPÍROVÁNO!";
    setTimeout(function () {
      btnCopyValid.innerText = "📋 ZKOPÍROVAT SEZNAM";
    }, 2000);
  });
});

tabButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    tabButtons.forEach(function (b) {
      b.classList.remove("active");
    });
    tabContents.forEach(function (c) {
      c.classList.remove("active");
    });
    btn.classList.add("active");
    document
      .getElementById(btn.getAttribute("data-target"))
      .classList.add("active");
  });
});

btnCopyInstagram.addEventListener("click", function () {
  navigator.clipboard.writeText(INSTAGRAM_SCRIPT).then(function () {
    btnCopyInstagram.innerText = "ZKOPÍROVÁNO!";
    setTimeout(function () {
      btnCopyInstagram.innerText = "ZKOPÍROVAT KÓD";
    }, 2000);
  });
});

btnCopyFacebook.addEventListener("click", function () {
  navigator.clipboard.writeText(FACEBOOK_SCRIPT).then(function () {
    btnCopyFacebook.innerText = "ZKOPÍROVÁNO!";
    setTimeout(function () {
      btnCopyFacebook.innerText = "ZKOPÍROVAT KÓD";
    }, 2000);
  });
});

btnPaste.addEventListener("click", function () {
  navigator.clipboard
    .readText()
    .then(function (text) {
      commentsInput.value = text;
      commentsInput.focus();
    })
    .catch(function () {
      alert("Nepodařilo se načíst ze schránky.");
    });
});

// =============================================
// CORE LOGIC - PARSE DATA
// =============================================

function parseData() {
  var rawText = commentsInput.value;
  var lines = rawText.split("\n");
  var loaded = 0;
  var valid = 0;
  var invalid = 0;

  var seenUsers = new Set();
  var newParticipants = [];
  rejectedEntries = [];

  lines.forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed) return;
    loaded++;

    var username = "";
    var commentText = "";

    // 1. Strict Format Detection
    if (trimmed.includes("###")) {
      var parts = trimmed.split("###");
      username = parts[0].trim();
      commentText = parts.slice(1).join("###").trim();
    } else {
      // STRICT RULE: If no separator AND no '@', assume it's Rule Text
      if (!trimmed.includes("@")) {
        invalid++;
        var preview =
          trimmed.substring(0, 30) + (trimmed.length > 30 ? "..." : "");
        rejectedEntries.push({ name: preview, reason: "TEXT/PRAVIDLA" });
        return;
      }

      // Fallback parsing for manual entries containing '@'
      if (trimmed.includes(" - ")) {
        var parts2 = trimmed.split(" - ");
        username = parts2[0].trim();
        commentText = parts2.slice(1).join(" - ").trim();
      } else {
        var firstSpace = trimmed.indexOf(" ");
        if (firstSpace > -1) {
          username = trimmed.substring(0, firstSpace).trim();
          commentText = trimmed.substring(firstSpace + 1).trim();
        } else {
          username = trimmed;
          commentText = "";
        }
      }
    }

    // Cleanup metadata noise
    commentText = commentText.replace(/(\d+\s*[dhmsw]\s*)?Odpovědět.*$/i, "");
    commentText = commentText.replace(/(\d+\s*[dhmsw]\s*)?Reply.*$/i, "");
    commentText = commentText.replace(/To se mi líbí.*$/i, "");
    commentText = commentText.replace(/Upraveno.*$/i, "");
    commentText = commentText.trim();

    var lowerUser = username.toLowerCase();

    // --- FILTER 1: Blacklist ---
    if (
      BLOCKED_USERS.some(function (b) {
        return b.toLowerCase() === lowerUser;
      })
    ) {
      invalid++;
      rejectedEntries.push({ name: username, reason: "BLACKLIST" });
      return;
    }

    // --- FILTER 2: Navigation noise ---
    if (commentText && lowerUser === commentText.toLowerCase()) {
      invalid++;
      rejectedEntries.push({ name: username, reason: "NAVIGACE" });
      return;
    }

    // --- FILTER 3: Bad format ---
    if (!username || !commentText) {
      invalid++;
      rejectedEntries.push({
        name: username || "(prázdné)",
        reason: "VADNÝ FORMÁT",
      });
      return;
    }

    // --- FILTER 4: Long text ---
    if (commentText.length > 300) {
      invalid++;
      rejectedEntries.push({ name: username, reason: "DLOUHÝ TEXT" });
      return;
    }

    // --- FILTER 5: Mandatory '@' ---
    if (!commentText.includes("@")) {
      invalid++;
      rejectedEntries.push({ name: username, reason: "CHYBÍ @" });
      return;
    }

    // --- FILTER 6: Deduplication ---
    if (seenUsers.has(lowerUser)) {
      invalid++;
      rejectedEntries.push({ name: username, reason: "DUPLICITA" });
      return;
    }

    // PASS
    seenUsers.add(lowerUser);
    newParticipants.push(username);
    valid++;
  });

  if (newParticipants.length === 0) {
    alert(
      "Žádní platní účastníci! Zkontrolujte, zda komentáře obsahují '@' a nejsou textem pravidel.",
    );
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

  var html = "";
  rejectedEntries.forEach(function (entry, i) {
    var badgeClass = getBadgeClass(entry.reason);
    html += "<tr>";
    html += "<td>" + (i + 1) + "</td>";
    html += "<td>" + escapeHtml(entry.name) + "</td>";
    html +=
      '<td><span class="reason-badge ' +
      badgeClass +
      '">' +
      entry.reason +
      "</span></td>";
    html += "</tr>";
  });

  rejectedTableBody.innerHTML = html;
  rejectedModal.classList.remove("hidden");
}

function getBadgeClass(reason) {
  switch (reason) {
    case "BLACKLIST":
      return "blacklist";
    case "TEXT/PRAVIDLA":
      return "blacklist";
    case "CHYBÍ @":
      return "missing-at";
    case "DUPLICITA":
      return "duplicate";
    case "DLOUHÝ TEXT":
      return "long-text";
    case "VADNÝ FORMÁT":
      return "bad-format";
    case "NAVIGACE":
      return "nav-noise";
    case "TEXT BEZ @":
      return "missing-at";
    default:
      return "";
  }
}

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// =============================================
// VALID PARTICIPANTS MODAL
// =============================================

function showValidModal() {
  if (participants.length === 0) return;

  validCountModal.innerText = participants.length;

  var html = '<ul class="valid-list">';
  participants.forEach(function (name, i) {
    html += "<li>";
    html += '<span class="valid-index">' + (i + 1) + ".</span>";
    html += '<span class="valid-name">' + escapeHtml(name) + "</span>";
    html += "</li>";
  });
  html += "</ul>";

  validList.innerHTML = html;
  validModal.classList.remove("hidden");
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
  commentsInput.value = "";
  countLoadedSpan.innerText = "0";
  countValidSpan.innerText = "0";
  countInvalidSpan.innerText = "0";
  btnSpin.disabled = true;
  btnReset.disabled = true;
}

// =============================================
// WHEEL GRAPHICS
// =============================================

function drawWheel() {
  if (participants.length === 0) return;

  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var radius = Math.min(centerX, centerY) - 10;
  var arcSize = (2 * Math.PI) / participants.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(currentRotation);

  participants.forEach(function (name, i) {
    var startAngle = i * arcSize;
    var endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = i % 2 === 0 ? colors[0] : colors[1];
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
  var normalizedRotation = currentRotation % (2 * Math.PI);
  var pointerAngle = (3 * Math.PI) / 2 - normalizedRotation;
  if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
  pointerAngle = pointerAngle % (2 * Math.PI);

  var arcSize = (2 * Math.PI) / participants.length;
  var winnerIndex = Math.floor(pointerAngle / arcSize);

  showWinner(participants[winnerIndex]);
}

function showWinner(name) {
  winnerNameSpan.innerText = name;
  modal.classList.remove("hidden");
}
