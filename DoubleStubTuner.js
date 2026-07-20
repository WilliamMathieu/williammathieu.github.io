/* exported dsCalc */
/*
 * Double-stub tuner — Pozar Microwave Engineering §5.3
 *   First stub at the load, second stub a spacing d away. t = tanβd.
 *   G_L, B_L = real/imag of the load admittance Y_L = 1/Z_L.
 *   B1 = -B_L + [Y0 ± √((1+t²)G_L Y0 - G_L² t²)] / t
 *   B2 = [± Y0 √((1+t²)G_L Y0 - G_L² t²) + G_L Y0] / (G_L t)
 *   Solutions exist only if G_L ≤ Y0 (1+t²)/t² = Y0/sin²βd.
 *   Each (B1,B2) is re-checked by transforming Z_L through the network.
 */

function cmul(a, b) { return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; }
function cdiv(a, b) { var d = b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d, (a[1]*b[0]-a[0]*b[1])/d]; }
function cmag(a) { return Math.hypot(a[0], a[1]); }

function stubLen(B, Y0, type) {
  var l;
  if (type === 'open') l = Math.atan(B / Y0) / (2 * Math.PI);
  else l = Math.atan(-Y0 / B) / (2 * Math.PI);
  if (l < 0) l += 0.5;
  return l;
}

function dsCalc() {
  clearError();
  var RL = parseFloat(document.getElementById('ds-rl').value);
  var XL = parseFloat(document.getElementById('ds-xl').value);
  var Z0 = parseFloat(document.getElementById('ds-z0').value);
  var dlam = parseFloat(document.getElementById('ds-d').value);
  var type = document.getElementById('ds-type').value;
  if (isNaN(RL) || RL <= 0) { showError('Enter a positive load resistance R_L.'); return; }
  if (isNaN(XL)) { showError('Enter the load reactance X_L.'); return; }
  if (isNaN(Z0) || Z0 <= 0) { showError('Enter a positive line impedance Z0.'); return; }
  if (isNaN(dlam) || dlam <= 0) { showError('Enter a positive stub spacing d (λ).'); return; }

  var Y0 = 1 / Z0;
  var YL = cdiv([1, 0], [RL, XL]);          // load admittance
  var GL = YL[0], BL = YL[1];
  var t = Math.tan(2 * Math.PI * dlam);

  var Gmax = Y0 * (1 + t * t) / (t * t);
  document.getElementById('ds-gl').textContent = engFmt(GL, 'S');
  document.getElementById('ds-gmax').textContent = engFmt(Gmax, 'S');

  var rad = (1 + t * t) * GL * Y0 - GL * GL * t * t;
  if (rad < 0) {
    ['ds-l1a','ds-l2a','ds-v1','ds-l1b','ds-l2b','ds-v2'].forEach(function (id) {
      document.getElementById(id).textContent = '—';
    });
    showError('Load is in the forbidden region for this spacing (G_L > Y0/sin²βd). ' +
              'Add a line length before the first stub, or change d.');
    if (window.drawDiagram) window.drawDiagram();
    return;
  }
  var sq = Math.sqrt(rad);

  var signs = [1, -1];
  var sols = signs.map(function (sgn) {
    var B1 = -BL + (Y0 + sgn * sq) / t;
    var B2 = (sgn * Y0 * sq + GL * Y0) / (GL * t);
    var l1 = stubLen(B1, Y0, type), l2 = stubLen(B2, Y0, type);

    // forward check: Y_L + jB1 -> transform through d -> + jB2 -> should be Y0
    var Y1 = [YL[0], YL[1] + B1];
    var Z1 = cdiv([1, 0], Y1);
    var Zt = cmul([Z0, 0], cdiv([Z1[0], Z1[1] + Z0 * t], [Z0 - t * Z1[1], t * Z1[0]]));
    var Yt = cdiv([1, 0], Zt);
    var Ytot = [Yt[0], Yt[1] + B2];
    var Zin = cdiv([1, 0], Ytot);
    var g = cmag(cdiv([Zin[0] - Z0, Zin[1]], [Zin[0] + Z0, Zin[1]]));
    var vswr = g < 0.9999 ? (1 + g) / (1 - g) : 1;
    return { l1: l1, l2: l2, vswr: vswr };
  });

  var f = function (x) { return x.toFixed(4) + ' λ'; };
  document.getElementById('ds-l1a').textContent = f(sols[0].l1);
  document.getElementById('ds-l2a').textContent = f(sols[0].l2);
  document.getElementById('ds-v1').textContent = sols[0].vswr.toFixed(3);
  document.getElementById('ds-l1b').textContent = f(sols[1].l1);
  document.getElementById('ds-l2b').textContent = f(sols[1].l2);
  document.getElementById('ds-v2').textContent = sols[1].vswr.toFixed(3);

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
