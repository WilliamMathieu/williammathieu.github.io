/* exported csCalc */
/*
 * Capacitor self-resonant frequency
 *   f_SRF = 1 / (2π √(ESL·C))
 *   X_C = 1/(2π f C),  X_L = 2π f ESL
 *   Q = X_C / ESR      |Z|_min = ESR at SRF
 */

function csCalc() {
  clearError();
  var C = parseFloat(document.getElementById('cs-c').value) * 1e-12;   // F
  var ESL = parseFloat(document.getElementById('cs-esl').value) * 1e-9; // H
  var ESR = parseFloat(document.getElementById('cs-esr').value);       // Ω
  var f = parseFloat(document.getElementById('cs-f').value) * 1e6;     // Hz

  if (isNaN(C) || C <= 0) { showError('Enter a positive capacitance (pF).'); return; }
  if (isNaN(ESL) || ESL <= 0) { showError('Enter a positive ESL (nH).'); return; }

  var srf = 1 / (2 * Math.PI * Math.sqrt(ESL * C));
  document.getElementById('cs-srf').textContent = engFmt(srf, 'Hz');
  document.getElementById('cs-zmin').textContent = isNaN(ESR) ? '— (enter ESR)' : engFmt(ESR, 'Ω');

  if (!isNaN(f) && f > 0) {
    var Xc = 1 / (2 * Math.PI * f * C);
    var Xl = 2 * Math.PI * f * ESL;
    var Xnet = Xc - Xl;                    // net reactance (cap positive)
    document.getElementById('cs-x').textContent = engFmt(Math.abs(Xnet), 'Ω');
    document.getElementById('cs-beh').textContent =
      f < srf ? 'capacitive' : (f > srf ? 'inductive' : 'resonant');
    if (!isNaN(ESR) && ESR > 0) {
      document.getElementById('cs-q').textContent = (Xc / ESR).toFixed(1);
    } else {
      document.getElementById('cs-q').textContent = '— (enter ESR)';
    }
  } else {
    document.getElementById('cs-x').textContent = '— (enter f)';
    document.getElementById('cs-beh').textContent = '—';
    document.getElementById('cs-q').textContent = '— (enter f, ESR)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
