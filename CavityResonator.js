/* exported cvCalc, cvHint */
/*
 * Cavity resonator — Pozar §6.3
 *   Rectangular:  f_mnℓ = (c/2)√((m/a)²+(n/b)²+(ℓ/d)²)
 *   Circular:     f = (c/2π)√((p/a)²+(ℓπ/d)²), p = J_n zero (TM) or J_n' zero (TE)
 *   TE₁₀ℓ unloaded Q: Q_c = (kad)³ b η / (2π² R_s (2ℓ²a³b+2bd³+ℓ²a³d+ad³))
 *   R_s = √(π f µ0/σ),  η = 376.730 Ω,  k = 2πf/c
 */
var CV_C = 2.99792458e8, CV_MU0 = 4 * Math.PI * 1e-7, CV_ETA = 376.730313;
// circular modes: [isTM, p (J or J' zero), ℓ]
var CV_MODES = {
  TM010: [true, 2.404826, 0], TM110: [true, 3.831706, 0], TM011: [true, 2.404826, 1],
  TE111: [false, 1.841184, 1], TE011: [false, 3.831706, 1]
};

function cvCalc() {
  clearError();
  var shape = document.getElementById('cv-shape').value;
  var a = parseFloat(document.getElementById('cv-a').value) / 1000;   // m
  var d = parseFloat(document.getElementById('cv-d').value) / 1000;
  var sig = parseFloat(document.getElementById('cv-sig').value);
  if (isNaN(a) || a <= 0 || isNaN(d) || d <= 0) { showError('Enter positive dimensions (mm).'); return; }
  if (isNaN(sig) || sig <= 0) sig = 5.8e7;

  var f, modeStr, canQ = false, b, m, n, l;
  if (shape === 'rect') {
    b = parseFloat(document.getElementById('cv-b').value) / 1000;
    m = parseInt(document.getElementById('cv-m').value); if (isNaN(m)) m = 1;
    n = parseInt(document.getElementById('cv-n').value); if (isNaN(n)) n = 0;
    l = parseInt(document.getElementById('cv-l').value); if (isNaN(l)) l = 1;
    if (isNaN(b) || b <= 0) { showError('Enter a positive height b (mm).'); return; }
    f = (CV_C / 2) * Math.sqrt(Math.pow(m/a, 2) + Math.pow(n/b, 2) + Math.pow(l/d, 2));
    modeStr = 'TE/TM ' + m + n + l;
    canQ = (m === 1 && n === 0 && l >= 1);
  } else {
    var mode = document.getElementById('cv-cmode').value;
    var mp = CV_MODES[mode];
    l = mp[2];
    f = (CV_C / (2 * Math.PI)) * Math.sqrt(Math.pow(mp[1] / a, 2) + Math.pow(l * Math.PI / d, 2));
    modeStr = mode.replace('TM', 'TM ').replace('TE', 'TE ');
  }

  document.getElementById('cv-f').textContent = engFmt(f, 'Hz');
  document.getElementById('cv-lam').textContent = engFmt(CV_C / f, 'm');
  document.getElementById('cv-mode').textContent = modeStr;

  var Rs = Math.sqrt(Math.PI * f * CV_MU0 / sig);
  document.getElementById('cv-rs').textContent = engFmt(Rs, 'Ω');

  if (canQ) {
    var k = 2 * Math.PI * f / CV_C;
    var Q = Math.pow(k * a * d, 3) * b * CV_ETA /
            (2 * Math.PI * Math.PI * Rs * (2 * l * l * a*a*a * b + 2 * b * d*d*d + l * l * a*a*a * d + a * d*d*d));
    document.getElementById('cv-q').textContent = Math.round(Q).toLocaleString();
  } else {
    document.getElementById('cv-q').textContent = '— (Q shown for rect. TE₁₀ℓ)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function cvHint() {
  var rect = document.getElementById('cv-shape').value === 'rect';
  document.getElementById('cv-shint').textContent = rect ? 'a×b×d box' : 'radius a, length d';
  document.getElementById('cv-alabel').textContent = rect ? 'Width a' : 'Radius a';
  document.getElementById('cv-ahint').textContent = rect ? 'width' : 'radius';
  document.getElementById('cv-rectmode').style.display = rect ? '' : 'none';
  document.getElementById('cv-circmode').style.display = rect ? 'none' : '';
  document.getElementById('cv-bhint').textContent = rect ? 'rect only' : '(unused)';
  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
