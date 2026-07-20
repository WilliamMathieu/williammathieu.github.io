/* exported noCalc */
/*
 * One-port negative-resistance oscillator — Pozar §13.3
 *   Γin = (Zin - Z0)/(Zin + Z0),  |Γin| > 1 for R_in < 0
 *   Oscillation: Γin·ΓL = 1  ⇔  Z_L = -Z_in  (R_L = -R_in, X_L = -X_in)
 *   Start-up: R_L + R_in(0) < 0; practical R_L ≈ |R_in(0)|/3.
 */

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }

function cdiv(a, b) { var d = b[0]*b[0] + b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d, (a[1]*b[0]-a[0]*b[1])/d]; }
function cmul(a, b) { return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; }
function cmag(a) { return Math.hypot(a[0], a[1]); }
function fmtG(G) { return cmag(G).toFixed(3) + '∠' + (Math.atan2(G[1], G[0])*180/Math.PI).toFixed(1) + '°'; }
function fmtZ(R, X) { return R.toFixed(2) + (X >= 0 ? ' + j' : ' − j') + Math.abs(X).toFixed(2) + ' Ω'; }

function noCalc() {
  clearError();
  var Rin = parseFloat(document.getElementById('no-rin').value);
  var Xin = parseFloat(document.getElementById('no-xin').value);
  var Z0 = parseFloat(document.getElementById('no-z0').value);

  if (isNaN(Rin) || isNaN(Xin)) { showError('Enter the device R_in and X_in.'); return; }
  if (!(Z0 > 0)) { showError('Z₀ must be positive.'); return; }

  var Gin = cdiv([Rin - Z0, Xin], [Rin + Z0, Xin]);
  var RL = -Rin, XL = -Xin;
  var Gl = cdiv([RL - Z0, XL], [RL + Z0, XL]);
  var prod = cmul(Gin, Gl);

  document.getElementById('no-zin').textContent = fmtZ(Rin, Xin);
  document.getElementById('no-gin').textContent = fmtG(Gin);
  var neg = (Rin < 0);
  document.getElementById('no-neg').textContent = neg
    ? 'yes — |Γ_in| = ' + cmag(Gin).toFixed(3) + ' > 1'
    : 'no (R_in ≥ 0: not an oscillator)';
  document.getElementById('no-zl').textContent = fmtZ(RL, XL);
  document.getElementById('no-gl').textContent = fmtG(Gl);
  document.getElementById('no-chk').textContent = cmag(prod).toFixed(4) + ' (should be 1.0000)';
  document.getElementById('no-rl').textContent = neg ? RL.toFixed(2) + ' Ω' : '—';
  document.getElementById('no-rl3').textContent = neg ? (Math.abs(Rin) / 3).toFixed(2) + ' Ω' : '—';

  if (!neg) { showError('R_in ≥ 0 — the device has no negative resistance, so it will not oscillate.'); }

  if (window.drawDiagram) window.drawDiagram();
}
