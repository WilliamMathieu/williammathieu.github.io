/* exported paCalc */
/*
 * PA load-line (Cripps)
 *   Ropt   = 2 (Vdd - Vknee) / Imax
 *   Pout   = (Vdd - Vknee) Imax / 4        (fundamental, sinusoidal)
 *   eta    = class maximum drain efficiency
 *   Pdc    = Pout / eta ;  Pdiss = Pdc - Pout
 *   Ref: Cripps, RF Power Amplifiers for Wireless Communications 2e.
 */

function paCalc() {
  clearError();
  var vdd = parseFloat(document.getElementById('pa-vdd').value);
  var vk = parseFloat(document.getElementById('pa-vk').value);
  var imax = parseFloat(document.getElementById('pa-imax').value);
  var eff = parseFloat(document.getElementById('pa-class').value) / 100;

  if (isNaN(vdd) || vdd <= 0) { showError('Enter a positive supply voltage.'); return; }
  if (isNaN(vk) || vk < 0) vk = 0;
  if (vk >= vdd) { showError('Knee voltage must be below the supply voltage.'); return; }
  if (isNaN(imax) || imax <= 0) { showError('Enter a positive peak current.'); return; }

  var vsw = vdd - vk;
  var Ropt = 2 * vsw / imax;
  var Pout = vsw * imax / 4;
  var Pdc = Pout / eff;
  var Pdiss = Pdc - Pout;

  document.getElementById('pa-ropt').textContent = Ropt.toFixed(2) + ' Ω';
  document.getElementById('pa-pout').textContent = engFmt(Pout, 'W');
  document.getElementById('pa-poutdbm').textContent = (10 * Math.log10(Pout / 1e-3)).toFixed(2) + ' dBm';
  document.getElementById('pa-eff').textContent = (eff * 100).toFixed(1) + ' %';
  document.getElementById('pa-pdc').textContent = engFmt(Pdc, 'W');
  document.getElementById('pa-pdiss').textContent = engFmt(Pdiss, 'W');

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
