/* Amplifier Stability Factor Calculator (K, µ, MAG/MSG from S-parameters) */

document.getElementById('amp-btn').addEventListener('click', amp_calc);

function amp_calc() {
  clearError();

  // S-parameters (magnitudes and angles)
  var s11m = parseFloat(document.getElementById('amp-s11m').value);
  var s11a = parseFloat(document.getElementById('amp-s11a').value) || 0;
  var s12m = parseFloat(document.getElementById('amp-s12m').value);
  var s12a = parseFloat(document.getElementById('amp-s12a').value) || 0;
  var s21m = parseFloat(document.getElementById('amp-s21m').value);
  var s21a = parseFloat(document.getElementById('amp-s21a').value) || 0;
  var s22m = parseFloat(document.getElementById('amp-s22m').value);
  var s22a = parseFloat(document.getElementById('amp-s22a').value) || 0;

  if (isNaN(s11m)||isNaN(s12m)||isNaN(s21m)||isNaN(s22m)) {
    showError('Enter all four S-parameter magnitudes.'); return;
  }

  // Convert to complex
  var d2r = Math.PI / 180;
  var S11 = polar(s11m, s11a * d2r);
  var S12 = polar(s12m, s12a * d2r);
  var S21 = polar(s21m, s21a * d2r);
  var S22 = polar(s22m, s22a * d2r);

  // Determinant Δ = S11·S22 - S12·S21
  var Delta = sub(mul(S11,S22), mul(S12,S21));
  var Dmag  = cabs(Delta);

  // Rollett stability factor K
  var K = (1 - s11m*s11m - s22m*s22m + Dmag*Dmag) / (2 * s12m * s21m);

  // µ-factor (Edwards-Sinsky, more conservative definition)
  // µ = (1 - |S11|²) / (|S22 - Δ·S11*| + |S12·S21|)
  var DeltaS11conj = mul(Delta, conj(S11));
  var S22_minus = sub(S22, DeltaS11conj);
  var mu = (1 - s11m*s11m) / (cabs(S22_minus) + s12m * s21m);

  // µ' (reciprocal definition for output port)
  var DeltaS22conj = mul(Delta, conj(S22));
  var S11_minus2 = sub(S11, DeltaS22conj);
  var mu2 = (1 - s22m*s22m) / (cabs(S11_minus2) + s12m * s21m);

  // Stability verdict
  var uncond = (K > 1 && Dmag < 1);

  // Maximum available gain (MAG) — valid only if unconditionally stable
  var S21_S12 = s21m / s12m;
  var MAG_db, MSG_db;
  if (uncond) {
    MAG_db = 10*Math.log10(S21_S12) + 10*Math.log10(K - Math.sqrt(K*K - 1));
  }
  // Maximum stable gain (MSG) — valid at boundary K=1
  MSG_db = 10*Math.log10(S21_S12);

  // Transducer gain with conjugate match (same as MAG when unconditionally stable)
  var S21_db = 20*Math.log10(s21m);
  var S11_db = 20*Math.log10(s11m);
  var S22_db = 20*Math.log10(s22m);

  showResults({K:K, mu:mu, mu2:mu2, Dmag:Dmag, uncond:uncond,
               MAG_db:MAG_db, MSG_db:MSG_db,
               S21_db:S21_db, S11_db:S11_db, S22_db:S22_db,
               s21m:s21m, s12m:s12m});
  if (window.drawDiagram) window.drawDiagram({K:K,mu:mu,uncond:uncond});
}

// Complex number helpers
function polar(r,theta) { return {re:r*Math.cos(theta), im:r*Math.sin(theta)}; }
function mul(a,b){ return {re:a.re*b.re-a.im*b.im, im:a.re*b.im+a.im*b.re}; }
function sub(a,b){ return {re:a.re-b.re, im:a.im-b.im}; }
function conj(a) { return {re:a.re, im:-a.im}; }
function cabs(a) { return Math.sqrt(a.re*a.re+a.im*a.im); }

function showResults(r) {
  var container = document.getElementById('amp-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  var verdict = r.uncond
    ? '<span style="color:#27ae60;font-weight:700;">Unconditionally stable</span>'
    : '<span style="color:#c0392b;font-weight:700;">Potentially unstable</span>';

  var card = document.createElement('div');
  card.className = 'res-card';
  card.innerHTML = '<h4>Stability Analysis</h4>' +
    rr('Verdict', verdict, false, true) +
    rr('Rollett K-factor',       r.K.toFixed(4) + (r.K > 1 ? ' > 1 ✓' : ' < 1 — potentially unstable'), r.uncond) +
    rr('|Δ| (det magnitude)',    r.Dmag.toFixed(4) + (r.Dmag < 1 ? ' < 1 ✓' : ' ≥ 1')) +
    rr('µ (input stability)',    r.mu.toFixed(4) + (r.mu > 1 ? ' > 1 ✓' : ' ≤ 1')) +
    rr('µ′ (output stability)',  r.mu2.toFixed(4) + (r.mu2 > 1 ? ' > 1 ✓' : ' ≤ 1'));

  var card2 = document.createElement('div');
  card2.className = 'res-card';
  card2.innerHTML = '<h4>Gain Parameters</h4>' +
    rr('|S₂₁| (forward gain)',      r.S21_db.toFixed(2) + ' dB') +
    rr('|S₁₁| (input return loss)', r.S11_db.toFixed(2) + ' dB') +
    rr('|S₂₂| (output return loss)',r.S22_db.toFixed(2) + ' dB') +
    rr('MSG (max stable gain)',      r.MSG_db.toFixed(2) + ' dB') +
    (r.uncond
      ? rr('MAG (max available gain)', r.MAG_db.toFixed(2) + ' dB', true)
      : rr('MAG', 'Undefined — device is potentially unstable', false));
  container.appendChild(card);
  container.appendChild(card2);
}

function rr(lbl, val, hi, raw) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('amp-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('amp-error');
  if (el) el.textContent = '';
}
