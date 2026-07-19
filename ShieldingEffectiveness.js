/* exported seCalc */
/*
 * Shielding effectiveness — far-field plane wave (Schelkunoff / Ott)
 *   A = 1.314 · t_mm · sqrt(µr · σr · f_MHz)   dB   (absorption)
 *   R = 168 + 10 log10(σr / (µr · f_MHz))      dB   (plane-wave reflection)
 *   SE = A + R   (multiple-reflection term B negligible for A > ~10 dB)
 *   σr, µr relative to copper.
 *   Ref: Ott, EMC Engineering, 2009.
 */

function seCalc() {
  clearError();
  var mat = document.getElementById('se-mat').value.split(',');
  var sr = parseFloat(mat[0]);   // relative conductivity
  var mur = parseFloat(mat[1]);  // relative permeability
  var t = parseFloat(document.getElementById('se-t').value);   // mm
  var f = parseFloat(document.getElementById('se-f').value);   // MHz

  if (isNaN(t) || t <= 0) { showError('Enter a positive thickness (mm).'); return; }
  if (isNaN(f) || f <= 0) { showError('Enter a positive frequency (MHz).'); return; }

  var A = 1.314 * t * Math.sqrt(mur * sr * f);
  var R = 168 + 10 * Math.log10(sr / (mur * f));
  var SE = A + R;

  document.getElementById('se-a').textContent = A.toFixed(1) + ' dB';
  document.getElementById('se-r').textContent = R.toFixed(1) + ' dB';
  document.getElementById('se-se').textContent = SE.toFixed(1) + ' dB';
  document.getElementById('se-att').textContent = '×' + engFmt(Math.pow(10, SE / 20), '');

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
