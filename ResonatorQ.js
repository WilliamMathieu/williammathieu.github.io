/* exported rqCalc */
/*
 * Resonator Q
 *   1/QL = 1/Q0 + 1/Qe
 *   BW_3dB = f0 / QL
 *   β = Q0 / Qe            (coupling coefficient)
 *   IL = -20 log10(1 - QL/Q0)  dB   (loss at resonance)
 *   Ref: Pozar, Microwave Engineering 4e.
 */

function rqCalc() {
  clearError();
  var Q0 = parseFloat(document.getElementById('rq-q0').value);
  var Qe = parseFloat(document.getElementById('rq-qe').value);
  var f0 = parseFloat(document.getElementById('rq-f0').value) * 1e6;

  if (isNaN(Q0) || Q0 <= 0) { showError('Enter a positive unloaded Q.'); return; }
  if (isNaN(Qe) || Qe <= 0) { showError('Enter a positive external Q.'); return; }

  var QL = 1 / (1 / Q0 + 1 / Qe);
  var beta = Q0 / Qe;
  var IL = -20 * Math.log10(1 - QL / Q0);

  document.getElementById('rq-ql').textContent = QL.toFixed(2);
  document.getElementById('rq-beta').textContent = beta.toFixed(3);
  document.getElementById('rq-regime').textContent =
    beta < 0.98 ? 'undercoupled' : (beta > 1.02 ? 'overcoupled' : 'critical');
  document.getElementById('rq-il').textContent = IL.toFixed(2) + ' dB';

  if (!isNaN(f0) && f0 > 0) {
    document.getElementById('rq-bw').textContent = engFmt(f0 / QL, 'Hz');
  } else {
    document.getElementById('rq-bw').textContent = '— (enter f0)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
