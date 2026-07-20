/* exported ssCalc */
/*
 * Single-stub (shunt) matching — Pozar Microwave Engineering §5.2
 *   t = tanβd = [X_L ± √(R_L((Z0-R_L)²+X_L²)/Z0)] / (R_L - Z0)   (R_L ≠ Z0)
 *               = -X_L/(2Z0)                                     (R_L = Z0)
 *   B = [R_L² t - (Z0 - X_L t)(X_L + Z0 t)] / [Z0(R_L² + (X_L+Z0 t)²)]
 *   Stub provides susceptance Bs = -B.
 *   The analytic (d, ℓ) are re-checked by transforming Z_L through the line
 *   and stub and confirming the input VSWR = 1.
 */

function cmul(a, b) { return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; }
function cdiv(a, b) { var d = b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d, (a[1]*b[0]-a[0]*b[1])/d]; }
function cmag(a) { return Math.hypot(a[0], a[1]); }

function ssCalc() {
  clearError();
  var RL = parseFloat(document.getElementById('ss-rl').value);
  var XL = parseFloat(document.getElementById('ss-xl').value);
  var Z0 = parseFloat(document.getElementById('ss-z0').value);
  var type = document.getElementById('ss-type').value;
  if (isNaN(RL) || RL <= 0) { showError('Enter a positive load resistance R_L.'); return; }
  if (isNaN(XL)) { showError('Enter the load reactance X_L (0 if purely resistive).'); return; }
  if (isNaN(Z0) || Z0 <= 0) { showError('Enter a positive line impedance Z0.'); return; }

  var Y0 = 1 / Z0;
  // Load reflection / VSWR
  var num = [RL - Z0, XL], den = [RL + Z0, XL];
  var gL = cmag(cdiv(num, den));
  document.getElementById('ss-gl').textContent = gL.toFixed(4);
  document.getElementById('ss-vl').textContent = gL < 1 ? ((1 + gL) / (1 - gL)).toFixed(3) : '∞';

  // t solutions
  var ts;
  if (Math.abs(RL - Z0) > 1e-9) {
    var disc = RL * ((Z0 - RL) * (Z0 - RL) + XL * XL) / Z0;
    var sq = Math.sqrt(Math.max(disc, 0));
    ts = [(XL + sq) / (RL - Z0), (XL - sq) / (RL - Z0)];
  } else {
    ts = [-XL / (2 * Z0)];
  }

  var out = ts.map(function (t) {
    var dlam = Math.atan(t) / (2 * Math.PI);
    if (dlam < 0) dlam += 0.5;
    var B = (RL * RL * t - (Z0 - XL * t) * (XL + Z0 * t)) /
            (Z0 * (RL * RL + (XL + Z0 * t) * (XL + Z0 * t)));
    var Bs = -B;                                   // stub susceptance to cancel
    var llam;
    if (type === 'open') { llam = Math.atan(Bs / Y0) / (2 * Math.PI); }
    else { llam = Math.atan(-Y0 / Bs) / (2 * Math.PI); }
    if (llam < 0) llam += 0.5;

    // Independent forward check: transform Z_L through d, add stub, get VSWR
    var tt = Math.tan(2 * Math.PI * dlam);
    var N = [RL, XL + Z0 * tt];
    var D = [Z0 - tt * XL, tt * RL];
    var Zd = cmul([Z0, 0], cdiv(N, D));            // impedance at distance d
    var Yline = cdiv([1, 0], Zd);
    var Ytot = [Yline[0], Yline[1] + Bs];          // add shunt stub susceptance
    var Zin = cdiv([1, 0], Ytot);
    var g = cmag(cdiv([Zin[0] - Z0, Zin[1]], [Zin[0] + Z0, Zin[1]]));
    var vswr = g < 0.9999 ? (1 + g) / (1 - g) : 1;
    return { d: dlam, l: llam, vswr: vswr };
  });

  var f = function (x) { return x.toFixed(4) + ' λ'; };
  document.getElementById('ss-d1').textContent = f(out[0].d);
  document.getElementById('ss-l1').textContent = f(out[0].l);
  document.getElementById('ss-v1').textContent = out[0].vswr.toFixed(3);
  if (out[1]) {
    document.getElementById('ss-d2').textContent = f(out[1].d);
    document.getElementById('ss-l2').textContent = f(out[1].l);
    document.getElementById('ss-v2').textContent = out[1].vswr.toFixed(3);
  } else {
    document.getElementById('ss-d2').textContent = '— (single solution)';
    document.getElementById('ss-l2').textContent = '—';
    document.getElementById('ss-v2').textContent = '—';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
