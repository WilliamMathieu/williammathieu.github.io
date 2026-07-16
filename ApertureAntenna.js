/* Aperture antenna gain and far-field distance
 *
 *   Gain:               G = eta_a * 4*pi*A / lambda^2
 *   Effective aperture: A_e = eta_a * A
 *   Far-field distance: R_ff = 2*D^2 / lambda   (D = largest aperture dimension)
 *
 *   References: Balanis, Antenna Theory 4e; Kraus & Marhefka, Antennas 3e.
 */
var C_LIGHT = 299792458; // m/s

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var A   = parseFloat(document.getElementById("A").value);   // m^2
  var eta = parseFloat(document.getElementById("eta").value); // 0..1
  var f   = parseFloat(document.getElementById("f").value);   // GHz
  var D   = parseFloat(document.getElementById("D").value);   // m (optional)
  clearError();

  if (isNaN(A) || isNaN(eta) || isNaN(f) || A <= 0 || eta <= 0 || f <= 0) {
    showError('Please enter positive area, efficiency and frequency.');
    return;
  }
  if (eta > 1) { showError('Aperture efficiency cannot exceed 1.'); return; }

  var lambda = C_LIGHT / (f * 1e9); // m
  var gLin = eta * 4 * Math.PI * A / (lambda * lambda);
  var gMaxLin = 4 * Math.PI * A / (lambda * lambda);

  // Far-field: use given D, else assume a circular aperture of area A
  var Duse = (!isNaN(D) && D > 0) ? D : Math.sqrt(4 * A / Math.PI);
  var Rff = 2 * Duse * Duse / lambda;

  document.getElementById("gain").textContent = (10 * Math.log10(gLin)).toFixed(2) + ' dBi';
  document.getElementById("ae").textContent   = (eta * A).toFixed(4) + ' m²';
  document.getElementById("gmax").textContent = (10 * Math.log10(gMaxLin)).toFixed(2) + ' dBi';
  document.getElementById("ff").textContent   = engFmt(Rff, 'm');
  document.getElementById("lam").textContent  = engFmt(lambda, 'm');

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
