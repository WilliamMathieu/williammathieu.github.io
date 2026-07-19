/* exported hnCalc, hnHint, hnLoadExample */
/*
 * Horn antenna gain
 *   λ = c/f0
 *   Pyramidal: A = a·b ;  Conical: A = π D²/4  (D = a)
 *   G  = ε_ap · 4π A / λ²      (ε_ap ≈ 0.51 optimum horn)
 *   Ae = ε_ap · A
 *   Beamwidth (pyramidal, optimum): θ_E ≈ 56 λ/b°, θ_H ≈ 67 λ/a°
 *   Ref: Balanis, Antenna Theory 4e.
 */
var HN_C = 2.99792458e8;

function hnCalc() {
  clearError();
  var type = document.getElementById('hn-type').value;
  var a = parseFloat(document.getElementById('hn-a').value);
  var b = parseFloat(document.getElementById('hn-b').value);
  var f0 = parseFloat(document.getElementById('hn-f0').value) * 1e9;
  var eff = parseFloat(document.getElementById('hn-eff').value);

  if (isNaN(a) || a <= 0) { showError('Enter a positive aperture dimension a (m).'); return; }
  if (isNaN(f0) || f0 <= 0) { showError('Enter a positive frequency (GHz).'); return; }
  if (isNaN(eff) || eff <= 0 || eff > 1) eff = 0.51;

  var lam = HN_C / f0;
  var A;
  if (type === 'conical') {
    A = Math.PI * a * a / 4;
  } else {
    if (isNaN(b) || b <= 0) { showError('Pyramidal horn needs the second dimension b (m).'); return; }
    A = a * b;
  }

  var Glin = eff * 4 * Math.PI * A / (lam * lam);
  document.getElementById('hn-gain').textContent = (10 * Math.log10(Glin)).toFixed(2) + ' dBi';
  document.getElementById('hn-ae').textContent = fmtArea(eff * A);
  document.getElementById('hn-lam').textContent = engFmt(lam, 'm');

  if (type === 'conical') {
    var th = 70 * lam / a;   // conical ~ symmetric
    document.getElementById('hn-e').textContent = th.toFixed(2) + ' °';
    document.getElementById('hn-h').textContent = th.toFixed(2) + ' °';
  } else {
    document.getElementById('hn-e').textContent = (56 * lam / b).toFixed(2) + ' °';
    document.getElementById('hn-h').textContent = (67 * lam / a).toFixed(2) + ' °';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function hnHint() {
  var type = document.getElementById('hn-type').value;
  var sh = document.getElementById('hn-typehint');
  var ah = document.getElementById('hn-ahint');
  var bh = document.getElementById('hn-bhint');
  if (type === 'conical') { sh.textContent = 'circular aperture'; ah.textContent = 'diameter D'; bh.textContent = '(unused)'; }
  else { sh.textContent = 'rectangular aperture'; ah.textContent = 'H-plane width'; bh.textContent = 'E-plane height'; }
}

function hnLoadExample() {
  document.getElementById('hn-type').value = 'pyramidal';
  hnHint();
  document.getElementById('hn-a').value = '0.15';
  document.getElementById('hn-b').value = '0.10';
  document.getElementById('hn-f0').value = '10';
  document.getElementById('hn-eff').value = '0.51';
  hnCalc();
}

function fmtArea(x) {
  if (!isFinite(x)) return '∞';
  var a = Math.abs(x);
  if (a === 0) return '0 m²';
  if (a >= 1e-4) return parseFloat(x.toPrecision(4)) + ' m²';
  return x.toExponential(3) + ' m²';
}
function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
