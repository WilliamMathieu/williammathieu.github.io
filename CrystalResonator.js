/* exported crCalc */
/*
 * Quartz crystal (Butterworth-Van Dyke)
 *   fs = 1 / (2π √(L1 C1))
 *   fp = fs √(1 + C1/C0)
 *   Q  = 2π fs L1 / R1
 *   r  = C0 / C1
 *   pull to load CL:  Δf/f ≈ C1 / (2 (C0 + CL)) ;  fL = fs (1 + Δf/f)
 */

function crCalc() {
  clearError();
  var L1 = parseFloat(document.getElementById('cr-l1').value);          // H
  var C1 = parseFloat(document.getElementById('cr-c1').value) * 1e-15;  // fF -> F
  var R1 = parseFloat(document.getElementById('cr-r1').value);          // Ω
  var C0 = parseFloat(document.getElementById('cr-c0').value) * 1e-12;  // pF -> F
  var CL = parseFloat(document.getElementById('cr-cl').value) * 1e-12;  // pF -> F

  if (isNaN(L1) || L1 <= 0) { showError('Enter a positive motional inductance L1 (H).'); return; }
  if (isNaN(C1) || C1 <= 0) { showError('Enter a positive motional capacitance C1 (fF).'); return; }

  var fs = 1 / (2 * Math.PI * Math.sqrt(L1 * C1));
  document.getElementById('cr-fs').textContent = engFmt(fs, 'Hz');

  if (!isNaN(C0) && C0 > 0) {
    var fp = fs * Math.sqrt(1 + C1 / C0);
    document.getElementById('cr-fp').textContent = engFmt(fp, 'Hz');
    document.getElementById('cr-df').textContent = engFmt(fp - fs, 'Hz');
    document.getElementById('cr-r').textContent = (C0 / C1).toFixed(0);
  } else {
    document.getElementById('cr-fp').textContent = '— (enter C0)';
    document.getElementById('cr-df').textContent = '—';
    document.getElementById('cr-r').textContent = '— (enter C0)';
  }

  if (!isNaN(R1) && R1 > 0) {
    document.getElementById('cr-q').textContent = (2 * Math.PI * fs * L1 / R1).toExponential(3);
  } else {
    document.getElementById('cr-q').textContent = '— (enter R1)';
  }

  if (!isNaN(CL) && CL > 0 && !isNaN(C0) && C0 > 0) {
    var pull = C1 / (2 * (C0 + CL));       // Δf/f
    var fL = fs * (1 + pull);
    document.getElementById('cr-fl').textContent =
      engFmt(fL, 'Hz') + ' (+' + (pull * 1e6).toFixed(1) + ' ppm)';
  } else {
    document.getElementById('cr-fl').textContent = '— (enter C0, CL)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
