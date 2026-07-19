/* exported prCalc */
/*
 * Radar PRF & ambiguity
 *   PRI   = 1/PRF
 *   R_ua  = c / (2 PRF)
 *   λ     = c / f0
 *   v_ua  = ± λ PRF / 4         (unambiguous Doppler velocity span ±)
 *   v_blind = n λ PRF / 2       (first blind speed n=1)
 *   duty  = τ · PRF
 *   ΔR    = c τ / 2
 *   Ref: Skolnik, Introduction to Radar Systems 3e.
 */
var PR_C = 2.99792458e8;

function prCalc() {
  clearError();
  var PRF = parseFloat(document.getElementById('pr-prf').value) * 1e3; // Hz
  var f0 = parseFloat(document.getElementById('pr-f0').value) * 1e9;   // Hz
  var tau = parseFloat(document.getElementById('pr-tau').value) * 1e-6; // s

  if (isNaN(PRF) || PRF <= 0) { showError('Enter a positive PRF (kHz).'); return; }

  var PRI = 1 / PRF;
  var Rua = PR_C / (2 * PRF);
  document.getElementById('pr-pri').textContent = engFmt(PRI, 's');
  document.getElementById('pr-rua').textContent = engFmt(Rua, 'm');

  if (!isNaN(tau) && tau > 0) {
    document.getElementById('pr-duty').textContent = (tau * PRF * 100).toFixed(3) + ' %';
    document.getElementById('pr-dr').textContent = engFmt(PR_C * tau / 2, 'm');
  } else {
    document.getElementById('pr-duty').textContent = '— (enter τ)';
    document.getElementById('pr-dr').textContent = '— (enter τ)';
  }

  if (!isNaN(f0) && f0 > 0) {
    var lam = PR_C / f0;
    document.getElementById('pr-lam').textContent = engFmt(lam, 'm');
    document.getElementById('pr-vua').textContent = '±' + engFmt(lam * PRF / 4, 'm/s');
    document.getElementById('pr-blind').textContent = engFmt(lam * PRF / 2, 'm/s');
  } else {
    document.getElementById('pr-lam').textContent = '— (enter f0)';
    document.getElementById('pr-vua').textContent = '— (enter f0)';
    document.getElementById('pr-blind').textContent = '— (enter f0)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
