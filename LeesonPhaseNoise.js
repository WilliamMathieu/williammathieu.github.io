/* exported lsCalc, lsPN, lsParams */
/*
 * Leeson oscillator phase-noise model (1966)
 *   L(fm) = 10 log10[ (2 F k T / Pavs)
 *                     · (1 + (f0/(2 QL fm))^2)
 *                     · (1 + fc/fm) ]
 *   F = 10^(NF/10) linear,  Pavs in W,  frequencies in Hz.
 */
var LS_K = 1.380649e-23;

function lsParams() {
  var f0 = parseFloat(document.getElementById('ls-f0').value) * 1e6;   // Hz
  var Q = parseFloat(document.getElementById('ls-q').value);
  var nf = parseFloat(document.getElementById('ls-nf').value);
  var pdbm = parseFloat(document.getElementById('ls-p').value);
  var fc = parseFloat(document.getElementById('ls-fc').value) * 1e3;   // Hz
  var fm = parseFloat(document.getElementById('ls-fm').value) * 1e3;   // Hz
  var T = parseFloat(document.getElementById('ls-t').value);
  if (isNaN(T) || T <= 0) T = 290;
  if (isNaN(f0) || f0 <= 0 || isNaN(Q) || Q <= 0 || isNaN(nf) || isNaN(pdbm) ||
      isNaN(fc) || fc < 0) return null;
  return {
    f0: f0, Q: Q, F: Math.pow(10, nf / 10),
    P: Math.pow(10, (pdbm - 30) / 10), // W
    fc: fc, fm: (isNaN(fm) ? 1e4 : fm), T: T
  };
}

function lsPN(p, fm) {
  var lin = (2 * p.F * LS_K * p.T / p.P) *
            (1 + Math.pow(p.f0 / (2 * p.Q * fm), 2)) *
            (1 + p.fc / fm);
  return 10 * Math.log10(lin);
}

function lsCalc() {
  clearError();
  var p = lsParams();
  if (!p) { showError('Enter f0, Q, NF, power and flicker corner.'); return; }
  if (parseFloat(document.getElementById('ls-fm').value) <= 0) {
    showError('Offset frequency must be positive.'); return;
  }

  document.getElementById('ls-l').textContent = lsPN(p, p.fm).toFixed(2) + ' dBc/Hz';
  document.getElementById('ls-corner').textContent = engFmt(p.f0 / (2 * p.Q), 'Hz');
  // Far-offset noise floor: 10 log10(2 F k T / Pavs)
  var floor = 10 * Math.log10(2 * p.F * LS_K * p.T / p.P);
  document.getElementById('ls-floor').textContent = floor.toFixed(2) + ' dBc/Hz';

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
