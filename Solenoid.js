/* Solenoid (single-layer coil) inductance
 *
 *   Wheeler (1928) current-sheet formula, air core:
 *     L(µH) = D²·N² / (18·D + 40·ℓ)      with D, ℓ in inches
 *   A relative-permeability factor µr scales the result for a filled core.
 *
 *   Ideal long-solenoid formula (shown for comparison):
 *     L = µ0·µr·N²·A / ℓ ,   A = π·(D/2)²
 *
 *   Round-wire (Rosa) correction — refines the current-sheet result for real
 *   round wire of diameter d, which gives slightly less inductance than an
 *   ideal current sheet:
 *     L = L_Wheeler − µ0·µr·N·a·(k_s + k_m)          a = coil radius
 *     k_s = 5/4 − ln(2p/d)                            self term (pitch p = ℓ/N)
 *     k_m ≈ (ln 2π − 3/2) − 0.3308/N                  Knight's fit to Rosa's
 *                                                     mutual-correction data
 *   References: Rosa, Bull. Bureau of Standards 2(2), 1906;
 *   Wheeler, Proc. IRE 16(10), 1928; D. W. Knight, round-wire corrections, 2016.
 *
 *   Reactance:  X_L = 2π·f·L
 */
var MU0 = 1.25663706e-6; // H/m

// AWG → bare copper diameter (mm)
var AWG_MM = {
  14: 1.628, 16: 1.291, 18: 1.024, 20: 0.812, 22: 0.644, 24: 0.511,
  26: 0.405, 28: 0.321, 30: 0.255, 32: 0.202, 34: 0.160, 36: 0.127
};

// Fill the wire-diameter field when an AWG gauge is chosen
var awgSel = document.getElementById('awg');
if (awgSel) {
  awgSel.addEventListener('change', function() {
    var g = this.value;
    if (g && AWG_MM[g]) {
      var dwEl = document.getElementById('dw');
      if (dwEl) dwEl.value = AWG_MM[g];
    }
  });
}

// Close-wound: length is derived from N·d, so disable the length field
var cwEl = document.getElementById('closewound');
if (cwEl) {
  cwEl.addEventListener('change', function() {
    var lenEl = document.getElementById('len');
    if (!lenEl) return;
    if (this.checked) { lenEl.setAttribute('disabled', 'disabled'); lenEl.style.opacity = '0.5'; }
    else { lenEl.removeAttribute('disabled'); lenEl.style.opacity = '1'; }
  });
}

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var N   = parseFloat(document.getElementById("N").value);
  var D   = parseFloat(document.getElementById("D").value);   // mm
  var len = parseFloat(document.getElementById("len").value); // mm
  var mur = parseFloat(document.getElementById("mur").value);
  var f   = parseFloat(document.getElementById("freq").value); // MHz (optional)
  var dw  = parseFloat(document.getElementById("dw").value);   // mm (optional)
  var closewound = cwEl && cwEl.checked;
  if (isNaN(mur) || mur <= 0) mur = 1;
  clearError();

  if (isNaN(N) || isNaN(D) || N <= 0 || D <= 0) {
    showError('Please enter valid positive values for N and diameter.');
    return;
  }

  // Close-wound: derive coil length from turns and wire diameter
  if (closewound) {
    if (isNaN(dw) || dw <= 0) {
      showError('Close-wound mode needs a wire diameter (enter d or pick an AWG gauge).');
      return;
    }
    len = N * dw;
    document.getElementById("len").value = Math.round(len * 1000) / 1000;
  }

  if (isNaN(len) || len <= 0) {
    showError('Please enter a valid positive coil length (or tick close-wound with a wire diameter).');
    return;
  }

  // Wheeler's current-sheet formula (imperial); convert mm -> inches
  var Din = D / 25.4, lin = len / 25.4;
  var Lw = mur * (Din * Din * N * N) / (18 * Din + 40 * lin) * 1e-6; // Henries

  // Ideal long-solenoid
  var A  = Math.PI * Math.pow((D / 2) * 1e-3, 2); // m²
  var Li = MU0 * mur * N * N * A / (len * 1e-3);  // Henries

  document.getElementById("Lw").textContent = engFmt(Lw, 'H');
  document.getElementById("Li").textContent = engFmt(Li, 'H');

  // Round-wire (Rosa) correction — needs a wire diameter
  var Lbest = Lw;
  var corrEl = document.getElementById("Lc");
  if (!isNaN(dw) && dw > 0) {
    var p = len / N;         // winding pitch (mm)
    var a = (D / 2) * 1e-3;  // coil radius (m)
    if (dw > p * 1.001 && !closewound) {
      corrEl.textContent = '— (d > pitch)';
      showError('Wire diameter exceeds the turn pitch (ℓ/N = ' + (Math.round(p * 100) / 100) +
                ' mm); check d, or tick close-wound.');
    } else {
      var ks = 1.25 - Math.log(2 * p / dw);                       // Rosa self-correction
      var km = (Math.log(2 * Math.PI) - 1.5) - 0.33084236 / N;    // Knight mutual-correction
      var dL = MU0 * mur * N * a * (ks + km);                     // subtractive (H)
      var Lc = Lw - dL;
      if (Lc < 0) Lc = 0;
      Lbest = Lc;
      corrEl.textContent = engFmt(Lc, 'H');
    }
  } else {
    corrEl.textContent = '— (enter d)';
  }

  if (!isNaN(f) && f > 0) {
    var X = 2 * Math.PI * (f * 1e6) * Lbest;
    var note = (Lbest !== Lw) ? ' (corr.)' : '';
    document.getElementById("XL").textContent = engFmt(X, 'Ω') + ' @ ' + f + ' MHz' + note;
  } else {
    document.getElementById("XL").textContent = '— (enter f)';
  }

  // Gentle accuracy note for very short coils, where Wheeler is less reliable
  if (len < 0.4 * D) {
    var el = document.getElementById('error');
    var prior = el && el.textContent ? el.textContent + ' ' : '';
    showError(prior + 'Note: coil is short (ℓ < 0.4·D); Wheeler’s formula is a rough estimate here.');
  }

  if (window.drawDiagram) window.drawDiagram();
});

function showError(msg) {
  var el = document.getElementById('error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('error');
  if (el) el.textContent = '';
}
