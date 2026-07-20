/* exported drCalc */
/*
 * Dielectric resonator (TE01δ) — Cohn/Kajfez approximation (Pozar §6.5)
 *   f_GHz = 34/(a√εr) · (a/L + 3.45),  a, L in mm
 *   valid 0.5 < a/L < 2, 30 < εr < 50
 */
var DR_C = 2.99792458e8;

function drCalc() {
  clearError();
  var a = parseFloat(document.getElementById('dr-a').value);   // mm
  var L = parseFloat(document.getElementById('dr-l').value);   // mm
  var er = parseFloat(document.getElementById('dr-er').value);
  if (isNaN(a) || a <= 0 || isNaN(L) || L <= 0) { showError('Enter positive radius and length (mm).'); return; }
  if (isNaN(er) || er <= 0) { showError('Enter the dielectric constant εr.'); return; }

  var fGHz = 34 / (a * Math.sqrt(er)) * (a / L + 3.45);
  var f = fGHz * 1e9;
  document.getElementById('dr-f').textContent = engFmt(f, 'Hz');
  document.getElementById('dr-lam').textContent = engFmt(DR_C / f, 'm');
  document.getElementById('dr-ar').textContent = (a / L).toFixed(3);

  var warn = [];
  if (a / L < 0.5 || a / L > 2) warn.push('a/L outside 0.5–2');
  if (er < 30 || er > 50) warn.push('εr outside 30–50');
  if (warn.length) showError('Outside the fitted range (' + warn.join(', ') + ') — treat as rough.');

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
