/* exported pdCalc */
/*
 * Parabolic dish antenna
 *   λ = c/f0
 *   G = η (π D / λ)²
 *   HPBW ≈ 70 λ/D  (deg),  FNBW ≈ 140 λ/D (deg)
 *   Ae = η π D²/4
 *   Ref: Balanis, Antenna Theory 4e.
 */
var PD_C = 2.99792458e8;

function pdCalc() {
  clearError();
  var D = parseFloat(document.getElementById('pd-d').value);
  var f0 = parseFloat(document.getElementById('pd-f0').value) * 1e9;
  var eff = parseFloat(document.getElementById('pd-eff').value);

  if (isNaN(D) || D <= 0) { showError('Enter a positive diameter (m).'); return; }
  if (isNaN(f0) || f0 <= 0) { showError('Enter a positive frequency (GHz).'); return; }
  if (isNaN(eff) || eff <= 0 || eff > 1) eff = 0.6;

  var lam = PD_C / f0;
  var Glin = eff * Math.pow(Math.PI * D / lam, 2);
  var GdBi = 10 * Math.log10(Glin);
  var hpbw = 70 * lam / D;
  var fnbw = 140 * lam / D;
  var Ae = eff * Math.PI * D * D / 4;

  document.getElementById('pd-gain').textContent = GdBi.toFixed(2) + ' dBi';
  document.getElementById('pd-glin').textContent = engFmt(Glin, '');
  document.getElementById('pd-ae').textContent = fmtArea(Ae);
  document.getElementById('pd-lam').textContent = engFmt(lam, 'm');
  document.getElementById('pd-hpbw').textContent = hpbw.toFixed(3) + ' °';
  document.getElementById('pd-fnbw').textContent = fnbw.toFixed(3) + ' °';

  if (D < 3 * lam) {
    showError('Note: D ≈ ' + (D / lam).toFixed(1) + 'λ — the aperture formulas assume D ≫ λ; treat as approximate.');
  }

  if (window.drawDiagram) window.drawDiagram();
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
