/* exported rlcCalc, rlcTopo */
/*
 * Series / parallel RLC resonator.
 *   ω0 = 1/√(LC),  Z0 = √(L/C),  f0 = ω0/2π,  BW = f0/Q
 *   series:   Q = ω0 L/R = Z0/R,   α = R/(2L)
 *   parallel: Q = R/(ω0 L) = R/Z0, α = 1/(2RC)
 *   ζ = α/ω0 = 1/(2Q) ; ωd = √(ω0² − α²) (underdamped)
 */
var rlcTopo = 'series';

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }

function rlcCalc() {
  clearError();
  var topo = document.getElementById('rlc-topo').value;
  var R = parseFloat(document.getElementById('rlc-r').value);
  var L = parseFloat(document.getElementById('rlc-l').value) * parseFloat(document.getElementById('rlc-lu').value);
  var C = parseFloat(document.getElementById('rlc-c').value) * parseFloat(document.getElementById('rlc-cu').value);

  if (!(R > 0)) { showError('Enter a positive resistance R.'); return; }
  if (!(L > 0) || !(C > 0)) { showError('Enter positive L and C.'); return; }

  rlcTopo = topo;
  var w0 = 1 / Math.sqrt(L * C);
  var f0 = w0 / (2 * Math.PI);
  var Z0 = Math.sqrt(L / C);
  var Q = (topo === 'series') ? (Z0 / R) : (R / Z0);
  var alpha = (topo === 'series') ? (R / (2 * L)) : (1 / (2 * R * C));
  var zeta = alpha / w0;                       // = 1/(2Q)
  var BW = f0 / Q;

  document.getElementById('rlc-f0').textContent = engFmt(f0, 'Hz');
  document.getElementById('rlc-w0').textContent = engFmt(w0, 'rad/s');
  document.getElementById('rlc-z0').textContent = engFmt(Z0, 'Ω');
  document.getElementById('rlc-q').textContent = (Q >= 100 ? Q.toFixed(1) : Q.toFixed(3));
  document.getElementById('rlc-bw').textContent = engFmt(BW, 'Hz');

  // half-power frequencies: f1,2 = f0 (∓1/(2Q) + √(1 + 1/(4Q²)))
  var k = 1 / (2 * Q);
  var f1 = f0 * (Math.sqrt(1 + k * k) - k);
  var f2 = f0 * (Math.sqrt(1 + k * k) + k);
  document.getElementById('rlc-f12').textContent = engFmt(f1, 'Hz') + ' / ' + engFmt(f2, 'Hz');

  document.getElementById('rlc-zeta').textContent = zeta.toFixed(4);
  document.getElementById('rlc-alpha').textContent = engFmt(alpha, 'Np/s');

  var regime;
  if (zeta < 0.999) { regime = 'underdamped (rings)'; }
  else if (zeta <= 1.001) { regime = 'critically damped'; }
  else { regime = 'overdamped (no ring)'; }
  document.getElementById('rlc-regime').textContent = regime + ' (ζ ' + (zeta < 1 ? '<' : zeta > 1 ? '>' : '=') + ' 1)';

  if (zeta < 1) {
    var wd = Math.sqrt(w0 * w0 - alpha * alpha);
    document.getElementById('rlc-fd').textContent = engFmt(wd / (2 * Math.PI), 'Hz');
  } else {
    document.getElementById('rlc-fd').textContent = '— (not oscillatory)';
  }

  if (window.drawDiagram) window.drawDiagram();
}
