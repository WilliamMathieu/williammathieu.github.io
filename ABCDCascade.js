/* exported abCalc, abExample, abStages */
/*
 * ABCD (chain) matrix cascade — Pozar §4.4
 *   series Z: [[1,Z],[0,1]] ; shunt Y: [[1,0],[Y,1]]
 *   line:     [[cosθ, jZc sinθ],[j sinθ/Zc, cosθ]]
 *   xfmr n:1: [[n,0],[0,1/n]]
 *   S from ABCD (ref Z0): den = A + B/Z0 + C Z0 + D
 *     S11=(A+B/Z0-C Z0-D)/den, S21=2/den, S22=(-A+B/Z0-C Z0+D)/den, S12=2(AD-BC)/den
 */
var abStages = null;

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }

// complex helpers, [re, im]
function cadd(a, b) { return [a[0]+b[0], a[1]+b[1]]; }
function csub(a, b) { return [a[0]-b[0], a[1]-b[1]]; }
function cmul(a, b) { return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; }
function cdiv(a, b) { var d = b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d, (a[1]*b[0]-a[0]*b[1])/d]; }
function cmag(a) { return Math.hypot(a[0], a[1]); }
function cscale(a, k) { return [a[0]*k, a[1]*k]; }
function fmtC(a) {
  return a[0].toFixed(4) + (a[1] >= 0 ? ' + j' : ' − j') + Math.abs(a[1]).toFixed(4);
}
function fmtS(a) {
  return cmag(a).toFixed(4) + '∠' + (Math.atan2(a[1], a[0]) * 180 / Math.PI).toFixed(1) + '°';
}

// 2x2 complex matrix multiply: M = P·Q, entries [A,B,C,D]
function matmul(P, Q) {
  return {
    A: cadd(cmul(P.A, Q.A), cmul(P.B, Q.C)),
    B: cadd(cmul(P.A, Q.B), cmul(P.B, Q.D)),
    C: cadd(cmul(P.C, Q.A), cmul(P.D, Q.C)),
    D: cadd(cmul(P.C, Q.B), cmul(P.D, Q.D))
  };
}

function parseLine(tok) {
  var kind = tok[0].toUpperCase();
  var n = tok.slice(1).map(parseFloat);
  if (kind === 'ZS') {
    if (n.length < 2 || isNaN(n[0]) || isNaN(n[1])) return null;
    return { M: { A: [1, 0], B: [n[0], n[1]], C: [0, 0], D: [1, 0] }, label: 'Zs' };
  }
  if (kind === 'YP') {
    if (n.length < 2 || isNaN(n[0]) || isNaN(n[1])) return null;
    return { M: { A: [1, 0], B: [0, 0], C: [n[0], n[1]], D: [1, 0] }, label: 'Yp' };
  }
  if (kind === 'TL') {
    if (n.length < 2 || !(n[0] > 0) || isNaN(n[1])) return null;
    var Zc = n[0], th = n[1] * Math.PI / 180;
    var cs = Math.cos(th), sn = Math.sin(th);
    return { M: { A: [cs, 0], B: [0, Zc * sn], C: [0, sn / Zc], D: [cs, 0] }, label: 'TL' };
  }
  if (kind === 'XFMR') {
    if (n.length < 1 || !(n[0] !== 0) || isNaN(n[0])) return null;
    return { M: { A: [n[0], 0], B: [0, 0], C: [0, 0], D: [1 / n[0], 0] }, label: 'n:1' };
  }
  return null;
}

function abExample() {
  document.getElementById('ab-z0').value = '50';
  document.getElementById('ab-net').value = 'Zs 0 30\nYp 0 0.01\nTL 70.7 90';
  abCalc();
}

function abCalc() {
  clearError();
  var Z0 = parseFloat(document.getElementById('ab-z0').value);
  if (!(Z0 > 0)) { showError('Enter a positive reference Z₀.'); return; }
  var lines = document.getElementById('ab-net').value.split('\n')
    .map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
  if (lines.length === 0) { showError('List at least one element (e.g. "Zs 0 50").'); return; }

  var total = { A: [1, 0], B: [0, 0], C: [0, 0], D: [1, 0] }; // identity
  var stages = [];
  for (var i = 0; i < lines.length; i++) {
    var tok = lines[i].split(/\s+/);
    var el = parseLine(tok);
    if (!el) { showError('Cannot parse line ' + (i + 1) + ': "' + lines[i] + '". Check the element syntax.'); return; }
    total = matmul(total, el.M);
    stages.push(el.label);
  }
  abStages = stages;

  var A = total.A, B = total.B, C = total.C, D = total.D;
  var BoverZ0 = cscale(B, 1 / Z0);
  var CZ0 = cscale(C, Z0);
  var den = cadd(cadd(A, BoverZ0), cadd(CZ0, D));
  var S11 = cdiv(csub(cadd(A, BoverZ0), cadd(CZ0, D)), den);
  var S21 = cdiv([2, 0], den);
  var S22 = cdiv(cadd(csub(BoverZ0, A), csub(D, CZ0)), den);
  var det = csub(cmul(A, D), cmul(B, C));

  // ABCD matrix table
  var html = '<table style="border-collapse:collapse;font-size:12.5px;">' +
    '<tr><td style="padding:4px 16px 4px 4px;color:#5533aa;font-weight:bold;">A</td><td style="padding:4px 16px 4px 4px;">' + fmtC(A) + '</td>' +
    '<td style="padding:4px 16px 4px 4px;color:#5533aa;font-weight:bold;">B</td><td style="padding:4px 4px;">' + fmtC(B) + ' Ω</td></tr>' +
    '<tr><td style="padding:4px 16px 4px 4px;color:#5533aa;font-weight:bold;">C</td><td style="padding:4px 16px 4px 4px;">' + fmtC(C) + ' S</td>' +
    '<td style="padding:4px 16px 4px 4px;color:#5533aa;font-weight:bold;">D</td><td style="padding:4px 4px;">' + fmtC(D) + '</td></tr>' +
    '</table>';
  document.getElementById('ab-abcd').innerHTML = html;

  document.getElementById('ab-s11').textContent = fmtS(S11);
  document.getElementById('ab-s21').textContent = fmtS(S21);
  document.getElementById('ab-s21db').textContent = (20 * Math.log10(cmag(S21))).toFixed(2) + ' dB';
  document.getElementById('ab-s22').textContent = fmtS(S22);
  var s11m = cmag(S11);
  document.getElementById('ab-s11db').textContent = (s11m > 0) ? (20 * Math.log10(s11m)).toFixed(2) + ' dB' : '−∞ dB';
  document.getElementById('ab-det').textContent = fmtC(det) + ((Math.abs(det[0] - 1) < 1e-6 && Math.abs(det[1]) < 1e-6) ? ' ✓' : '');

  if (window.drawDiagram) window.drawDiagram();
}
