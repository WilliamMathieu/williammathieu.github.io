/* Helical Antenna (Axial Mode) Calculator */

var C0 = 2.998e8;
var PI = Math.PI;

document.getElementById('helix-btn').addEventListener('click', helix_calc);

function helix_calc() {
  clearError();

  var fv   = parseFloat(document.getElementById('helix-f').value);
  var fmul = parseFloat(document.getElementById('helix-f-unit').value);
  var n    = parseFloat(document.getElementById('helix-n').value);
  var Dv   = parseFloat(document.getElementById('helix-D').value);
  var Dmul = parseFloat(document.getElementById('helix-D-unit').value);
  var Sv   = parseFloat(document.getElementById('helix-S').value);
  var Smul = parseFloat(document.getElementById('helix-S-unit').value);
  var mode = document.getElementById('helix-mode').value;

  if (!(fv > 0)) { showError('Enter a valid frequency.'); return; }

  var f = fv * fmul;
  var lam = C0 / f;  // free-space wavelength

  if (mode === 'design') {
    // Design mode: compute optimal dimensions for given frequency
    // Axial-mode optimal: C ≈ λ (helix circumference), pitch angle α ≈ 14°
    // → D ≈ λ/π, S ≈ λ/4 (spacing per turn), α = arctan(S/(π·D)) ≈ 14°
    var D_opt = lam / PI;
    var S_opt = lam / 4;
    var n_use = n || 10;  // default 10 turns if not given
    var alpha = Math.atan(S_opt / (PI * D_opt)) * 180 / PI;
    var C = PI * D_opt;
    var Gain_db = 10*Math.log10(15 * n_use * (C/lam)*(C/lam) * (S_opt/lam));
    var HPBW = 52 / (C/lam * Math.sqrt(n_use * S_opt/lam));
    var Z_in = 140 * (C / lam);  // input impedance ≈ 140·C/λ (Kraus)
    var L_total = n_use * Math.sqrt((PI*D_opt)*(PI*D_opt) + S_opt*S_opt);

    showResults({D:D_opt, S:S_opt, alpha:alpha, n:n_use, lam:lam,
                 Gain_db:Gain_db, HPBW:HPBW, Z_in:Z_in, L_total:L_total, f:f, mode:'design'});
  } else {
    // Analysis mode: compute gain etc. for given D, S, n
    if (!(n > 0)) { showError('Enter number of turns N.'); return; }
    if (!(Dv > 0)) { showError('Enter helix diameter D.'); return; }
    if (!(Sv > 0)) { showError('Enter turn spacing S.'); return; }

    var D = Dv * Dmul;
    var S = Sv * Smul;
    var C = PI * D;
    var alpha = Math.atan(S / C) * 180 / PI;

    // Check axial-mode condition: 3/4 < C/λ < 4/3
    var ratio = C / lam;
    var warning = '';
    if (ratio < 0.75 || ratio > 1.33) {
      warning = 'C/λ = ' + ratio.toFixed(2) + '; axial mode requires 0.75–1.33.';
    }

    // Kraus gain formula
    var Gain_db = 10*Math.log10(15 * n * ratio*ratio * S/lam);
    var HPBW = 52 / (ratio * Math.sqrt(n * S/lam));
    var Z_in = 140 * ratio;
    var L_total = n * Math.sqrt(C*C + S*S);

    showResults({D:D, S:S, alpha:alpha, n:n, lam:lam,
                 Gain_db:Gain_db, HPBW:HPBW, Z_in:Z_in, L_total:L_total, f:f, mode:'analyze', warning:warning});
  }
}

function showResults(r) {
  var container = document.getElementById('helix-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  if (r.warning) {
    var w = document.createElement('div');
    w.style.cssText = 'background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:8px 12px;font-size:12px;color:#856404;margin-bottom:8px;';
    w.textContent = '⚠ ' + r.warning;
    container.appendChild(w);
  }

  var card = document.createElement('div');
  card.className = 'res-card';
  card.innerHTML = '<h4>Axial-Mode Helix (' + (r.mode==='design'?'Optimised':'Analysis') + ')</h4>' +
    rr('Frequency',                   engFmt(r.f,'Hz')) +
    rr('Free-space wavelength, λ',    engFmt(r.lam,'m')) +
    rr('Helix diameter, D',           engFmt(r.D,'m') + '  (C/λ = '+(Math.PI*r.D/r.lam).toFixed(3)+')') +
    rr('Turn spacing, S',             engFmt(r.S,'m') + '  (S/λ = '+(r.S/r.lam).toFixed(3)+')') +
    rr('Pitch angle, α',              r.alpha.toFixed(1) + '°  (optimal ≈ 14°)') +
    rr('Number of turns, N',          r.n.toString()) +
    rr('Total wire length',           engFmt(r.L_total,'m'));

  var card2 = document.createElement('div');
  card2.className = 'res-card';
  card2.innerHTML = '<h4>Performance</h4>' +
    rr('Directivity/Gain',    r.Gain_db.toFixed(1) + ' dBi', true) +
    rr('Half-power beamwidth',r.HPBW.toFixed(1) + '°', true) +
    rr('Input impedance',     r.Z_in.toFixed(0) + ' Ω  (match with λ/4 stripline transformer)');

  container.appendChild(card);
  container.appendChild(card2);
  if (window.drawDiagram) window.drawDiagram(r);
}

function rr(lbl, val, hi) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('helix-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('helix-error');
  if (el) el.textContent = '';
}
