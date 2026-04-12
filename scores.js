// ── RF Toolbox shared score system ──────────────────────────────────────────
// Uses localStorage. Each game key stores an array of {name, score, date}.
// Max 10 entries per game, sorted descending by score.

var SCORES_KEY_PREFIX = 'rftoolbox_scores_';
var MAX_ENTRIES = 10;

function getScores(gameId) {
  try {
    var raw = localStorage.getItem(SCORES_KEY_PREFIX + gameId);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveScore(gameId, name, score) {
  var entries = getScores(gameId);
  entries.push({ name: name.trim().slice(0, 20) || 'Anonymous', score: score, date: new Date().toLocaleDateString() });
  entries.sort(function(a, b) { return b.score - a.score; });
  entries = entries.slice(0, MAX_ENTRIES);
  try { localStorage.setItem(SCORES_KEY_PREFIX + gameId, JSON.stringify(entries)); } catch(e) {}
  return entries;
}

function clearScores(gameId) {
  try { localStorage.removeItem(SCORES_KEY_PREFIX + gameId); } catch(e) {}
}

// Render a leaderboard table into a container element
function renderLeaderboard(gameId, containerId) {
  var entries = getScores(gameId);
  var el = document.getElementById(containerId);
  if (!el) return;
  if (entries.length === 0) {
    el.innerHTML = '<p style="color:#777;font-size:12px;margin:6px 0;">No scores yet.</p>';
    return;
  }
  var html = '<table style="width:100%;border-collapse:collapse;font-size:12px;font-family:monospace;">';
  html += '<tr style="color:#AA77FF;border-bottom:1px solid #333;"><th style="text-align:left;padding:3px 6px;">#</th><th style="text-align:left;padding:3px 6px;">Name</th><th style="text-align:right;padding:3px 6px;">Score</th><th style="text-align:right;padding:3px 6px;">Date</th></tr>';
  entries.forEach(function(e, i) {
    var bg = i === 0 ? 'background:rgba(170,119,255,0.12);' : '';
    html += '<tr style="border-bottom:1px solid #1a1a1a;' + bg + '">';
    html += '<td style="padding:3px 6px;color:#777;">' + (i+1) + '</td>';
    html += '<td style="padding:3px 6px;">' + escHtml(e.name) + '</td>';
    html += '<td style="padding:3px 6px;text-align:right;color:#00ffcc;">' + e.score + '</td>';
    html += '<td style="padding:3px 6px;text-align:right;color:#555;">' + e.date + '</td>';
    html += '</tr>';
  });
  html += '</table>';
  el.innerHTML = html;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Show the name-entry + save UI after a game ends
// onSaved: callback after score is saved
function showScoreEntry(containerId, gameId, score, onSaved) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML =
    '<div style="margin:10px 0;font-family:monospace;">' +
    '<span style="font-size:13px;color:#AA77FF;">Your score: <strong>' + score + '</strong> — enter your name:</span><br><br>' +
    '<input id="score-name-input" type="text" maxlength="20" placeholder="Your name" style="font-family:monospace;font-size:13px;padding:5px 8px;border:1px solid #AA77FF;border-radius:4px;background:#111;color:#fff;width:160px;">' +
    '&nbsp;<button onclick="submitScore(\'' + gameId + '\',' + score + ')" style="font-family:monospace;font-size:13px;padding:5px 14px;border:1px solid #AA77FF;border-radius:4px;background:#AA77FF;color:#fff;cursor:pointer;">Save</button>' +
    '</div>' +
    '<div id="score-entry-lb"></div>';
  renderLeaderboard(gameId, 'score-entry-lb');
  window._scoreOnSaved = onSaved;
  window._scoreEntryContainer = containerId;
  // allow pressing Enter
  setTimeout(function() {
    var inp = document.getElementById('score-name-input');
    if (inp) inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') submitScore(gameId, score); });
  }, 50);
}

function submitScore(gameId, score) {
  var inp = document.getElementById('score-name-input');
  var name = inp ? inp.value : 'Anonymous';
  saveScore(gameId, name, score);
  var el = document.getElementById(window._scoreEntryContainer);
  if (el) {
    el.innerHTML = '<div style="font-family:monospace;font-size:12px;color:#00ffcc;margin:6px 0;">Score saved!</div><div id="score-entry-lb"></div>';
    renderLeaderboard(gameId, 'score-entry-lb');
  }
  if (typeof window._scoreOnSaved === 'function') window._scoreOnSaved();
}
