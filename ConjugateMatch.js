/* exported cmCalc, cmLoadExample */
/*
 * Simultaneous conjugate match — Pozar §12.3
 *   B1 = 1+|S11|²-|S22|²-|Δ|² ,  C1 = S11 - Δ S22*
 *   B2 = 1+|S22|²-|S11|²-|Δ|² ,  C2 = S22 - Δ S11*
 *   ΓS = (B1 ± √(B1²-4|C1|²))/(2 C1)   (sign for |ΓS|<1)
 *   ΓL = (B2 ± √(B2²-4|C2|²))/(2 C2)
 *   G_T,max = |S21/S12| (K - √(K²-1))
 *   Verified: Γin = S11 + S12 S21 ΓL/(1-S22 ΓL) should equal ΓS*.
 */

function cadd(a, b) { return [a[0]+b[0], a[1]+b[1]]; }
function csub(a, b) { return [a[0]-b[0], a[1]-b[1]]; }
function cmul(a, b) { return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; }
function cdiv(a, b) { var d = b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d, (a[1]*b[0]-a[0]*b[1])/d]; }
function cconj(a) { return [a[0], -a[1]]; }
function cmag(a) { return Math.hypot(a[0], a[1]); }
function cscale(a, k) { return [a[0]*k, a[1]*k]; }
function polar(m, deg) { var r = deg*Math.PI/180; return [m*Math.cos(r), m*Math.sin(r)]; }
function fmtG(G) { return cmag(G).toFixed(3) + '∠' + (Math.atan2(G[1], G[0])*180/Math.PI).toFixed(1) + '°'; }
function fmtZ(Z) { return Z[0].toFixed(1) + (Z[1] >= 0 ? ' + j' : ' − j') + Math.abs(Z[1]).toFixed(1) + ' Ω'; }

function cmGetS(idm, ida) {
  var m = parseFloat(document.getElementById(idm).value), a = parseFloat(document.getElementById(ida).value);
  return (isNaN(m) || isNaN(a)) ? null : polar(m, a);
}

// solve Γ = (B ± √(B²-4|C|²))/(2C), pick |Γ|<1
function solveGamma(B, C) {
  var Cm2 = C[0]*C[0] + C[1]*C[1];
  var disc = B*B - 4*Cm2;
  if (disc < 0) return null;
  var sq = Math.sqrt(disc);
  // 1/C = C*/|C|², so (B±sq)/(2C) = (B±sq)·C*/(2|C|²)
  var G1 = cscale(cconj(C), (B - sq) / (2*Cm2));
  var G2 = cscale(cconj(C), (B + sq) / (2*Cm2));
  return cmag(G1) <= 1 ? G1 : G2;
}

function cmCalc() {
  clearError();
  var S11 = cmGetS('cm-s11m', 'cm-s11a'), S21 = cmGetS('cm-s21m', 'cm-s21a');
  var S12 = cmGetS('cm-s12m', 'cm-s12a'), S22 = cmGetS('cm-s22m', 'cm-s22a');
  var Z0 = parseFloat(document.getElementById('cm-z0').value); if (isNaN(Z0) || Z0 <= 0) Z0 = 50;
  if (!S11 || !S21 || !S12 || !S22) { showError('Enter all four S-parameters as mag ∠ angle.'); return; }

  var D = csub(cmul(S11, S22), cmul(S12, S21));
  var s11a2 = S11[0]*S11[0]+S11[1]*S11[1], s22a2 = S22[0]*S22[0]+S22[1]*S22[1], Da2 = D[0]*D[0]+D[1]*D[1];
  var s12s21 = cmag(cmul(S12, S21));
  var K = (1 - s11a2 - s22a2 + Da2) / (2 * s12s21);
  document.getElementById('cm-k').textContent = K.toFixed(3);
  document.getElementById('cm-d').textContent = Math.sqrt(Da2).toFixed(3);

  if (K <= 1 || Math.sqrt(Da2) >= 1) {
    ['cm-gs','cm-zs','cm-chk','cm-gl','cm-zl','cm-gain'].forEach(function (id) { document.getElementById(id).textContent = '—'; });
    showError('No simultaneous conjugate match: the device is not unconditionally stable (need K > 1 and |Δ| < 1).');
    if (window.drawDiagram) window.drawDiagram();
    return;
  }

  var B1 = 1 + s11a2 - s22a2 - Da2;
  var B2 = 1 + s22a2 - s11a2 - Da2;
  var C1 = csub(S11, cmul(D, cconj(S22)));
  var C2 = csub(S22, cmul(D, cconj(S11)));
  var GS = solveGamma(B1, C1);
  var GL = solveGamma(B2, C2);

  var Zs = cmul([Z0, 0], cdiv(cadd([1, 0], GS), csub([1, 0], GS)));
  var Zl = cmul([Z0, 0], cdiv(cadd([1, 0], GL), csub([1, 0], GL)));
  document.getElementById('cm-gs').textContent = fmtG(GS);
  document.getElementById('cm-gl').textContent = fmtG(GL);
  document.getElementById('cm-zs').textContent = fmtZ(Zs);
  document.getElementById('cm-zl').textContent = fmtZ(Zl);

  var mag = cmag(cdiv(S21, S12)) * (K - Math.sqrt(K*K - 1));
  document.getElementById('cm-gain').textContent = (10*Math.log10(mag)).toFixed(2) + ' dB';

  // verification: Γin = S11 + S12 S21 ΓL/(1-S22 ΓL) should equal conj(ΓS)
  var Gin = cadd(S11, cdiv(cmul(cmul(S12, S21), GL), csub([1, 0], cmul(S22, GL))));
  var err = cmag(csub(Gin, cconj(GS)));
  document.getElementById('cm-chk').textContent = err < 1e-3 ? '✓ matched (err ' + err.toExponential(1) + ')' : 'err ' + err.toFixed(4);

  if (window.drawDiagram) window.drawDiagram();
}

function cmLoadExample() {
  var v = { 'cm-s11m': '0.6', 'cm-s11a': '-60', 'cm-s21m': '1.9', 'cm-s21a': '81',
    'cm-s12m': '0.05', 'cm-s12a': '26', 'cm-s22m': '0.5', 'cm-s22a': '-60', 'cm-z0': '50' };
  Object.keys(v).forEach(function (k) { document.getElementById(k).value = v[k]; });
  cmCalc();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
