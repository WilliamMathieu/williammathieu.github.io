/* Doppler frequency shift
 *
 *   radial velocity v_r = v*cos(theta)
 *   one-way:  f_d = v_r/c * f = v_r/lambda
 *   two-way (radar):  f_d = 2*v_r/c * f
 *
 *   References: Skolnik, Introduction to Radar Systems 3e; Richards,
 *   Fundamentals of Radar Signal Processing 2e.
 */
var C_LIGHT = 299792458;

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var f  = parseFloat(document.getElementById("f").value);  // GHz
  var v  = parseFloat(document.getElementById("v").value);  // m/s
  var th = parseFloat(document.getElementById("th").value); // deg
  var mode = document.getElementById("mode").value;
  clearError();

  if (isNaN(f) || isNaN(v) || f <= 0) {
    showError('Enter a positive frequency and a speed.');
    return;
  }
  if (isNaN(th)) th = 0;

  var fHz = f * 1e9;
  var lam = C_LIGHT / fHz;
  var vr = v * Math.cos(th * Math.PI / 180);
  var factor = (mode === 'two') ? 2 : 1;
  var fd = factor * vr / C_LIGHT * fHz;

  document.getElementById("fd").textContent   = engFmt(fd, 'Hz');
  document.getElementById("frac").textContent = (fd / fHz).toExponential(3);
  document.getElementById("vr").textContent   = vr.toFixed(3) + ' m/s' + (v !== vr ? ' (v·cosθ)' : '');
  document.getElementById("lam").textContent  = engFmt(lam, 'm');

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
