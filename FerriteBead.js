/* exported fbCalc */
/*
 * Ferrite bead (first-order series R-L)
 *   X_L = 2π f L
 *   |Z| = sqrt(R² + X_L²)
 *   L_eq = Z_datasheet / (2π f)   (equivalent inductance from a datasheet point)
 *   Approximate — real beads use a frequency-dependent complex permeability.
 */

function fbCalc() {
  clearError();
  var L = parseFloat(document.getElementById('fb-l').value) * 1e-6; // H
  var R = parseFloat(document.getElementById('fb-r').value);        // Ω
  var f = parseFloat(document.getElementById('fb-f').value) * 1e6;  // Hz
  var Zds = parseFloat(document.getElementById('fb-z').value);      // Ω

  if (isNaN(f) || f <= 0) { showError('Enter a positive frequency (MHz).'); return; }

  if (!isNaN(L) && L > 0) {
    var XL = 2 * Math.PI * f * L;
    var Rr = (isNaN(R) || R < 0) ? 0 : R;
    document.getElementById('fb-xl').textContent = engFmt(XL, 'Ω');
    document.getElementById('fb-zmag').textContent = engFmt(Math.sqrt(Rr * Rr + XL * XL), 'Ω');
  } else {
    document.getElementById('fb-xl').textContent = '— (enter L)';
    document.getElementById('fb-zmag').textContent = '— (enter L)';
  }

  if (!isNaN(Zds) && Zds > 0) {
    document.getElementById('fb-leq').textContent = engFmt(Zds / (2 * Math.PI * f), 'H');
  } else {
    document.getElementById('fb-leq').textContent = '— (enter datasheet Z)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
