/* Noise figure by the Y-factor method
 *
 *   F  = ENR_lin / (Y_lin - 1)      (ENR and Y entered in dB)
 *   NF = 10*log10(F)
 *   Te = T0 * (F - 1),  T0 = 290 K
 *
 *   References: Keysight AN 57-1; Pozar, Microwave Engineering 4e.
 */
var T0 = 290; // K

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var enrDb = parseFloat(document.getElementById("enr").value);
  var yDb   = parseFloat(document.getElementById("y").value);
  clearError();

  if (isNaN(enrDb) || isNaN(yDb)) {
    showError('Please enter both the ENR and the Y-factor (dB).');
    return;
  }
  var yLin = Math.pow(10, yDb / 10);
  if (yLin <= 1) {
    showError('Y-factor must be greater than 1 (0 dB) for a valid measurement.');
    return;
  }

  var enrLin = Math.pow(10, enrDb / 10);
  var F = enrLin / (yLin - 1);
  var NF = 10 * Math.log10(F);
  var Te = T0 * (F - 1);

  document.getElementById("nf").textContent = NF.toFixed(3) + ' dB';
  document.getElementById("f").textContent  = F.toFixed(3);
  document.getElementById("te").textContent = Te.toFixed(1) + ' K';

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
