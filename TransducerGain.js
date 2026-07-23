/* Maximum unilateral transducer gain from S-parameter magnitudes
 *
 *   G_TU,max = |S21|^2 / ((1-|S11|^2)(1-|S22|^2))
 *            = G_S,max * |S21|^2 * G_L,max
 *   G_S,max = 1/(1-|S11|^2),  G_L,max = 1/(1-|S22|^2)
 *   Inputs are magnitudes in dB.
 *
 *   References: Pozar, Microwave Engineering 4e; Gonzalez, Microwave
 *   Transistor Amplifiers 2e.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var s11 = parseFloat(document.getElementById("s11").value); // dB
  var s21 = parseFloat(document.getElementById("s21").value); // dB
  var s22 = parseFloat(document.getElementById("s22").value); // dB
  clearError();

  if (isNaN(s11) || isNaN(s21) || isNaN(s22)) {
    showError('Please enter |S11|, |S21| and |S22| in dB.');
    return;
  }
  var a = Math.pow(10, s11 / 20); // |S11|
  var c = Math.pow(10, s22 / 20); // |S22|
  if (a >= 1 || c >= 1) {
    showError('|S11| and |S22| must be below 1 (negative dB) for a passive-termination match.');
    return;
  }

  var gsDb = -10 * Math.log10(1 - a * a);
  var glDb = -10 * Math.log10(1 - c * c);
  var gtuDb = s21 + gsDb + glDb; // |S21|^2 in dB is 20log10|S21| = s21 (already a magnitude in dB)

  document.getElementById("gtu").textContent = gtuDb.toFixed(3) + ' dB';
  document.getElementById("gs").textContent  = gsDb.toFixed(3) + ' dB';
  document.getElementById("gd").textContent  = s21.toFixed(3) + ' dB';
  document.getElementById("gl").textContent  = glDb.toFixed(3) + ' dB';

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
