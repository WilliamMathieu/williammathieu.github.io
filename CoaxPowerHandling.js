/* exported cpCalc */
/*
 * Coax power handling (voltage breakdown)
 *   a = d/2, b = D/2  (radii)
 *   Z0    = (60/√εr) ln(b/a)
 *   Vmax  = Ebd · a · ln(b/a)          (field is max at inner conductor)
 *   Ppeak = Vmax² / (2 Z0)             (matched line)
 */

function cpCalc() {
  clearError();
  var d = parseFloat(document.getElementById('cp-d').value);   // mm
  var D = parseFloat(document.getElementById('cp-D').value);   // mm
  var er = parseFloat(document.getElementById('cp-er').value);
  var Ebd = parseFloat(document.getElementById('cp-ebd').value); // kV/mm

  if (isNaN(d) || d <= 0) { showError('Enter a positive inner diameter (mm).'); return; }
  if (isNaN(D) || D <= d) { showError('Dielectric diameter must exceed the inner diameter.'); return; }
  if (isNaN(er) || er <= 0) er = 1;
  if (isNaN(Ebd) || Ebd <= 0) { showError('Enter the dielectric strength (kV/mm).'); return; }

  var a = d / 2, b = D / 2;                 // mm
  var lnba = Math.log(b / a);
  var Z0 = (60 / Math.sqrt(er)) * lnba;
  var Vmax = Ebd * 1e3 * a * lnba;          // (kV/mm·1e3 = V/mm)·mm = V
  var Ppeak = Vmax * Vmax / (2 * Z0);       // W

  document.getElementById('cp-z0').textContent = Z0.toFixed(2) + ' Ω';
  document.getElementById('cp-vmax').textContent = engFmt(Vmax, 'V');
  document.getElementById('cp-ppk').textContent = engFmt(Ppeak, 'W');
  document.getElementById('cp-pdbm').textContent = (10 * Math.log10(Ppeak / 1e-3)).toFixed(1) + ' dBm';

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
