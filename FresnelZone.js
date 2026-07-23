/* Fresnel zone radius and clearance
 *
 *   r_n = sqrt( n * lambda * d1 * d2 / (d1 + d2) ),  lambda = c / f
 *   Recommended clearance: keep at least 0.6 * r1 unobstructed.
 *
 *   References: Parsons, The Mobile Radio Propagation Channel 2e; ITU-R P.526.
 */
var C_LIGHT = 299792458; // m/s

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var f  = parseFloat(document.getElementById("f").value);  // MHz
  var d1 = parseFloat(document.getElementById("d1").value); // km
  var d2 = parseFloat(document.getElementById("d2").value); // km
  clearError();

  if (isNaN(f) || isNaN(d1) || isNaN(d2) || f <= 0 || d1 <= 0 || d2 <= 0) {
    showError('Please enter a positive frequency and both distances.');
    return;
  }

  var lambda = C_LIGHT / (f * 1e6);       // m
  var D1 = d1 * 1000, D2 = d2 * 1000;     // m
  function rn(n) { return Math.sqrt(n * lambda * D1 * D2 / (D1 + D2)); }

  var r1 = rn(1);
  document.getElementById("r1").textContent  = r1.toFixed(2) + ' m';
  document.getElementById("r2").textContent  = rn(2).toFixed(2) + ' m';
  document.getElementById("r3").textContent  = rn(3).toFixed(2) + ' m';
  document.getElementById("clr").textContent = (0.6 * r1).toFixed(2) + ' m';
  document.getElementById("path").textContent = (d1 + d2).toFixed(3) + ' km';

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
