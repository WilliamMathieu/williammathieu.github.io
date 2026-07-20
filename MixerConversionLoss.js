/* exported mxCalc */
/*
 * Mixer conversion loss & noise figure — Pozar §13.3
 *   F_DSB = L_c · t ,  F_SSB = 2 L_c · t  (SSB = DSB + 3 dB)
 *   Cascade with IF amp: F_sys = F_mix + (F_IF - 1) · L_c   (linear)
 */

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }

var T0 = 290;

function mxCalc() {
  clearError();
  var LcdB = parseFloat(document.getElementById('mx-lc').value);
  var tr = parseFloat(document.getElementById('mx-tr').value);
  var ifdB = parseFloat(document.getElementById('mx-if').value);
  var sb = document.getElementById('mx-sb').value;

  if (isNaN(LcdB) || LcdB < 0) { showError('Enter a conversion loss L_c ≥ 0 dB.'); return; }
  if (isNaN(tr) || tr <= 0) tr = 1;
  if (isNaN(ifdB) || ifdB < 0) { showError('Enter the IF amplifier noise figure (dB).'); return; }

  var Lc = Math.pow(10, LcdB / 10);
  var Fif = Math.pow(10, ifdB / 10);

  var Fdsb = Lc * tr;
  var Fssb = 2 * Lc * tr;
  var Fmix = (sb === 'ssb') ? Fssb : Fdsb;
  var Fsys = Fmix + (Fif - 1) * Lc;
  var Te = (Fsys - 1) * T0;

  document.getElementById('mx-g').textContent = (-LcdB).toFixed(2) + ' dB';
  document.getElementById('mx-nfd').textContent = (10 * Math.log10(Fdsb)).toFixed(2) + ' dB';
  document.getElementById('mx-nfs').textContent = (10 * Math.log10(Fssb)).toFixed(2) + ' dB';
  document.getElementById('mx-used').textContent = (sb === 'ssb') ? 'SSB' : 'DSB';
  document.getElementById('mx-sys').textContent = (10 * Math.log10(Fsys)).toFixed(2) + ' dB';
  document.getElementById('mx-te').textContent = Te.toFixed(1) + ' K';

  if (window.drawDiagram) window.drawDiagram();
}
