/* Image frequency and I/Q image rejection
 *
 *   High-side LO:  f_LO = f_RF + f_IF,  f_image = f_RF + 2*f_IF
 *   Low-side  LO:  f_LO = f_RF - f_IF,  f_image = f_RF - 2*f_IF
 *
 *   Image-rejection ratio from I/Q amplitude (A) and phase (theta) imbalance:
 *     IRR(dB) = 10*log10[ (1 + A^2 + 2A*cos(theta)) / (1 + A^2 - 2A*cos(theta)) ]
 *   with A = 10^(dg/20), dg the gain imbalance in dB.
 *
 *   References: Razavi, RF Microelectronics 2e; ADI mixer tutorials.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var fRF = parseFloat(document.getElementById("fRF").value); // MHz
  var fIF = parseFloat(document.getElementById("fIF").value); // MHz
  var side = document.getElementById("side").value;
  var amp = parseFloat(document.getElementById("amp").value); // dB, optional
  var ph  = parseFloat(document.getElementById("ph").value);  // deg, optional
  clearError();

  if (isNaN(fRF) || isNaN(fIF) || fRF <= 0 || fIF <= 0) {
    showError('Please enter positive RF and IF frequencies.');
    return;
  }

  var fLO, fImg;
  if (side === 'low') {
    fLO = fRF - fIF;
    fImg = fRF - 2 * fIF;
  } else {
    fLO = fRF + fIF;
    fImg = fRF + 2 * fIF;
  }

  document.getElementById("fLO").textContent  = fLO.toFixed(3) + ' MHz';
  document.getElementById("fImg").textContent = fImg.toFixed(3) + ' MHz' + (fImg <= 0 ? ' (folds; check IF)' : '');

  // Image rejection from I/Q imbalance (default 0 dB / 0° → ideal)
  var dg = isNaN(amp) ? 0 : amp;
  var th = (isNaN(ph) ? 0 : ph) * Math.PI / 180;
  if (dg === 0 && th === 0) {
    document.getElementById("irr").textContent = '∞ (ideal I/Q)';
  } else {
    var A = Math.pow(10, dg / 20);
    var num = 1 + A * A + 2 * A * Math.cos(th);
    var den = 1 + A * A - 2 * A * Math.cos(th);
    var irr = 10 * Math.log10(num / den);
    document.getElementById("irr").textContent = irr.toFixed(2) + ' dB';
  }

  if (window.drawDiagram) window.drawDiagram();
});

function showError(msg) {
  var el = document.getElementById('error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('error');
  if (el) el.textContent = '';
}
