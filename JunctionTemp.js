/* exported jtCalc */
/*
 * Junction temperature — steady-state thermal chain
 *   θ_ja = θ_jc + θ_cs + θ_sa
 *   Tj   = Ta + Pdiss · θ_ja
 *   Pmax = (Tj_max - Ta) / θ_ja
 */

function jtCalc() {
  clearError();
  var P = parseFloat(document.getElementById('jt-p').value);
  var Ta = parseFloat(document.getElementById('jt-ta').value);
  var jc = parseFloat(document.getElementById('jt-jc').value);
  var cs = parseFloat(document.getElementById('jt-cs').value);
  var sa = parseFloat(document.getElementById('jt-sa').value);
  var tjmax = parseFloat(document.getElementById('jt-tjmax').value);

  if (isNaN(P) || P < 0) { showError('Enter a non-negative dissipated power (W).'); return; }
  if (isNaN(Ta)) { showError('Enter the ambient temperature (°C).'); return; }
  if (isNaN(jc) || jc < 0) { showError('Enter a valid θjc (°C/W).'); return; }
  if (isNaN(cs) || cs < 0) cs = 0;
  if (isNaN(sa) || sa < 0) sa = 0;

  var theta = jc + cs + sa;
  var rise = P * theta;
  var Tj = Ta + rise;

  document.getElementById('jt-theta').textContent = theta.toFixed(3) + ' °C/W';
  document.getElementById('jt-rise').textContent = rise.toFixed(2) + ' °C';
  document.getElementById('jt-tj').textContent = Tj.toFixed(2) + ' °C';

  if (!isNaN(tjmax)) {
    var margin = tjmax - Tj;
    document.getElementById('jt-margin').textContent = margin.toFixed(2) + ' °C' +
      (margin < 0 ? '  ⚠ over limit' : '');
    document.getElementById('jt-pmax').textContent =
      theta > 0 ? ((tjmax - Ta) / theta).toFixed(2) + ' W' : '∞';
  } else {
    document.getElementById('jt-margin').textContent = '— (enter Tj,max)';
    document.getElementById('jt-pmax').textContent = '— (enter Tj,max)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
