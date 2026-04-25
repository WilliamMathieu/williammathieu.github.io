/* Coupled LC Resonators Calculator */

var PI = Math.PI;

document.getElementById('cr-btn').addEventListener('click', cr_calc);

function cr_calc() {
  clearError();

  var Lv   = parseFloat(document.getElementById('cr-L').value);
  var Lmul = parseFloat(document.getElementById('cr-L-unit').value);
  var Cv   = parseFloat(document.getElementById('cr-C').value);
  var Cmul = parseFloat(document.getElementById('cr-C-unit').value);
  var Rv   = parseFloat(document.getElementById('cr-R').value) || 0;
  var kv   = parseFloat(document.getElementById('cr-k').value);
  var Mv   = parseFloat(document.getElementById('cr-M').value);
  var Mv_u = parseFloat(document.getElementById('cr-M-unit').value);

  if (!(Lv > 0)) { showError('Enter a valid inductance L.'); return; }
  if (!(Cv > 0)) { showError('Enter a valid capacitance C.'); return; }

  var L = Lv * Lmul;
  var C = Cv * Cmul;
  var R = Rv;

  var f0 = 1 / (2 * PI * Math.sqrt(L * C));  // uncoupled resonant frequency
  var w0 = 2 * PI * f0;
  var Q  = (R > 0) ? w0 * L / R : Infinity;

  // Coupling coefficient k (dimensionless, 0 < k < 1)
  // Can be specified directly or via mutual inductance M
  var k;
  if (!isNaN(kv) && kv > 0) {
    k = kv;
  } else if (!isNaN(Mv) && Mv > 0) {
    var M = Mv * Mv_u;
    k = M / L;
  } else {
    showError('Enter either coupling coefficient k or mutual inductance M.'); return;
  }

  if (k <= 0 || k >= 1) { showError('Coupling coefficient k must be between 0 and 1.'); return; }

  // Split frequencies of coupled resonators (identical resonators):
  // f+ = f0 / sqrt(1 - k)   (higher, odd mode)
  // f- = f0 / sqrt(1 + k)   (lower, even mode)
  var f_plus  = f0 / Math.sqrt(1 - k);
  var f_minus = f0 / Math.sqrt(1 + k);

  // Passband bandwidth (−3 dB): BW ≈ k·f0 for high-Q resonators
  var BW = k * f0;

  // Loaded Q (for 2-resonator BP filter, Qloaded = f0/BW = 1/k)
  var Q_loaded = 1 / k;

  // Critical coupling: k_crit = 1/Q (maximum response occurs at k = k_crit)
  var k_crit = (Q < Infinity) ? 1 / Q : 0;
  var coupling_regime = (k < k_crit) ? 'Under-coupled' : (k > k_crit) ? 'Over-coupled' : 'Critically coupled';

  showResults({f0:f0, f_plus:f_plus, f_minus:f_minus, BW:BW, Q:Q, Q_loaded:Q_loaded,
               k:k, k_crit:k_crit, coupling_regime:coupling_regime, L:L, C:C, R:R});
  if (window.drawDiagram) window.drawDiagram({f_minus:f_minus, f_plus:f_plus, f0:f0, BW:BW});
}

function showResults(r) {
  var container = document.getElementById('cr-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  var QStr = isFinite(r.Q) ? r.Q.toFixed(1) : '∞ (lossless)';

  var card = document.createElement('div');
  card.className = 'res-card';
  card.innerHTML = '<h4>Coupled Resonator Response</h4>' +
    rr('Uncoupled resonant frequency, f₀', engFmt(r.f0,'Hz')) +
    rr('Unloaded Q (single resonator)',    QStr) +
    rr('Coupling coefficient, k',          r.k.toFixed(4)) +
    rr('Critical coupling, k<sub>crit</sub>', isFinite(r.k_crit) ? r.k_crit.toFixed(4) : 'N/A (lossless)') +
    rr('Coupling regime',                  r.coupling_regime);

  var card2 = document.createElement('div');
  card2.className = 'res-card';
  card2.innerHTML = '<h4>Frequency Splitting</h4>' +
    rr('Even mode (lower), f₋',  engFmt(r.f_minus,'Hz'), true) +
    rr('Odd mode (upper), f₊',   engFmt(r.f_plus,'Hz'), true) +
    rr('Mode splitting, Δf',     engFmt(r.f_plus - r.f_minus,'Hz')) +
    rr('Passband bandwidth',     engFmt(r.BW,'Hz') + '  (= k·f₀)', true) +
    rr('Loaded Q',               r.Q_loaded.toFixed(1) + '  (= 1/k)');

  container.appendChild(card);
  container.appendChild(card2);
}

function rr(lbl, val, hi) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('cr-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('cr-error');
  if (el) el.textContent = '';
}
