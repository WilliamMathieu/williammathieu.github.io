/* exported gdCalc, gdPoles */
/*
 * Lowpass-prototype group delay at band center (DC), from poles (ωc = 1).
 *   τ_g(0) = Σ_k (-σ_k)/(σ_k² + ω_k²)      (normalized, ×1/ωc for real units)
 *   Butterworth poles:  angle θ = π(2k-1+n)/(2n),  p = (cosθ, sinθ)
 *   Chebyshev poles:    a = asinh(1/ε)/n, ε = √(10^(Rp/10)-1)
 *                       σ = -sinh(a) sin(θk), ω = cosh(a) cos(θk), θk=π(2k-1)/2n
 */

function gdPoles(type, n, rp) {
  var poles = [], k, th;
  if (type === 'cheby') {
    if (isNaN(rp) || rp <= 0) rp = 0.5;
    var eps = Math.sqrt(Math.pow(10, rp / 10) - 1);
    var a = Math.asinh(1 / eps) / n;
    var sh = Math.sinh(a), ch = Math.cosh(a);
    for (k = 1; k <= n; k++) {
      th = Math.PI * (2 * k - 1) / (2 * n);
      poles.push([-sh * Math.sin(th), ch * Math.cos(th)]);
    }
  } else {
    for (k = 1; k <= n; k++) {
      th = Math.PI * (2 * k - 1 + n) / (2 * n);
      poles.push([Math.cos(th), Math.sin(th)]);
    }
  }
  return poles;
}

function gdCalc() {
  clearError();
  var type = document.getElementById('gd-type').value;
  var n = parseInt(document.getElementById('gd-n').value);
  var rp = parseFloat(document.getElementById('gd-rp').value);
  var fc = parseFloat(document.getElementById('gd-fc').value) * 1e6;

  if (isNaN(n) || n < 1 || n > 12) { showError('Enter a filter order between 1 and 12.'); return; }
  if (isNaN(fc) || fc <= 0) { showError('Enter a positive cutoff frequency (MHz).'); return; }

  var poles = gdPoles(type, n, rp);
  var tauNorm = 0;
  for (var i = 0; i < poles.length; i++) {
    var s = poles[i][0], w = poles[i][1];
    tauNorm += (-s) / (s * s + w * w);
  }
  var wc = 2 * Math.PI * fc;
  var tau = tauNorm / wc;

  document.getElementById('gd-tau').textContent = engFmt(tau, 's');
  document.getElementById('gd-norm').textContent = tauNorm.toFixed(4);
  document.getElementById('gd-cyc').textContent = (tau * fc).toFixed(4) + ' cycles';

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
