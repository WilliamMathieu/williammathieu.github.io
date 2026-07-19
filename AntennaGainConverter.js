/* exported agCalc */
/*
 * Antenna gain converter
 *   dBd = dBi - 2.15
 *   EIRP(dBm) = Pt(dBm) + G(dBi)
 *   Ae = G_lin λ²/(4π),  λ = c/f0
 *   R_ff = 2 D²/λ
 */
var AG_C = 2.99792458e8;

function agCalc() {
  clearError();
  var GdBi = parseFloat(document.getElementById('ag-g').value);
  var f0 = parseFloat(document.getElementById('ag-f0').value) * 1e9;
  var Pt = parseFloat(document.getElementById('ag-pt').value);
  var D = parseFloat(document.getElementById('ag-d').value);

  if (isNaN(GdBi)) { showError('Enter the antenna gain (dBi).'); return; }
  var Glin = Math.pow(10, GdBi / 10);

  document.getElementById('ag-dbd').textContent = (GdBi - 2.15).toFixed(2) + ' dBd';
  document.getElementById('ag-lin').textContent = engFmt(Glin, '');

  if (!isNaN(Pt)) {
    var eirp = Pt + GdBi;
    document.getElementById('ag-eirp').textContent = eirp.toFixed(2) + ' dBm';
    document.getElementById('ag-eirpw').textContent = engFmt(Math.pow(10, (eirp - 30) / 10), 'W');
  } else {
    document.getElementById('ag-eirp').textContent = '— (enter Pt)';
    document.getElementById('ag-eirpw').textContent = '—';
  }

  if (!isNaN(f0) && f0 > 0) {
    var lam = AG_C / f0;
    document.getElementById('ag-lam').textContent = engFmt(lam, 'm');
    document.getElementById('ag-ae').textContent = fmtArea(Glin * lam * lam / (4 * Math.PI));
    if (!isNaN(D) && D > 0) {
      document.getElementById('ag-ff').textContent = engFmt(2 * D * D / lam, 'm');
    } else {
      document.getElementById('ag-ff').textContent = '— (enter D)';
    }
  } else {
    document.getElementById('ag-lam').textContent = '— (enter f0)';
    document.getElementById('ag-ae').textContent = '— (enter f0)';
    document.getElementById('ag-ff').textContent = '— (enter f0, D)';
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
