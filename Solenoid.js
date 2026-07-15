/* Solenoid (single-layer coil) inductance
 *
 *   Wheeler (1928) current-sheet formula, air core:
 *     L(µH) = D²·N² / (18·D + 40·ℓ)      with D, ℓ in inches
 *   A relative-permeability factor µr scales the result for a filled core.
 *
 *   Ideal long-solenoid formula (shown for comparison):
 *     L = µ0·µr·N²·A / ℓ ,   A = π·(D/2)²
 *
 *   Reactance:  X_L = 2π·f·L
 */
var MU0 = 1.25663706e-6; // H/m

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var N   = parseFloat(document.getElementById("N").value);
  var D   = parseFloat(document.getElementById("D").value);   // mm
  var len = parseFloat(document.getElementById("len").value); // mm
  var mur = parseFloat(document.getElementById("mur").value);
  var f   = parseFloat(document.getElementById("freq").value); // MHz (optional)
  if (isNaN(mur) || mur <= 0) mur = 1;
  clearError();

  if (isNaN(N) || isNaN(D) || isNaN(len) || N <= 0 || D <= 0 || len <= 0) {
    showError('Please enter valid positive values for N, diameter, and length.');
    return;
  }

  // Wheeler's formula (imperial); convert mm -> inches
  var Din = D / 25.4, lin = len / 25.4;
  var Lw = mur * (Din * Din * N * N) / (18 * Din + 40 * lin) * 1e-6; // Henries

  // Ideal long-solenoid
  var A  = Math.PI * Math.pow((D / 2) * 1e-3, 2); // m²
  var Li = MU0 * mur * N * N * A / (len * 1e-3);  // Henries

  document.getElementById("Lw").textContent = engFmt(Lw, 'H');
  document.getElementById("Li").textContent = engFmt(Li, 'H');

  if (!isNaN(f) && f > 0) {
    var X = 2 * Math.PI * (f * 1e6) * Lw;
    document.getElementById("XL").textContent = engFmt(X, 'Ω') + ' @ ' + f + ' MHz';
  } else {
    document.getElementById("XL").textContent = '— (enter f)';
  }

  // Gentle accuracy note for very short coils, where Wheeler is less reliable
  if (len < 0.4 * D) {
    showError('Note: coil is short (ℓ < 0.4·D); Wheeler’s formula is a rough estimate here.');
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
