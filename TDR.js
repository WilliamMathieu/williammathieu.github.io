/* TDR fault distance
 *
 *   d = VF * c * t / 2          (t = round-trip echo delay)
 *   VF = 1/sqrt(er)             (if VF not given)
 *   Z_fault = Z0 * (1 + rho)/(1 - rho)
 *
 *   References: Tektronix TDR primer; Pozar, Microwave Engineering 4e.
 */
var C_LIGHT = 299792458; // m/s

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var t   = parseFloat(document.getElementById("t").value);   // ns
  var vf  = parseFloat(document.getElementById("vf").value);  // 0..1
  var er  = parseFloat(document.getElementById("er").value);  // alt
  var rho = parseFloat(document.getElementById("rho").value); // optional
  var z0  = parseFloat(document.getElementById("z0").value);  // optional
  clearError();

  if (isNaN(t) || t <= 0) {
    showError('Please enter a positive round-trip echo delay (ns).');
    return;
  }
  // Resolve velocity factor from VF, else from er
  var VF = vf;
  if (isNaN(VF) || VF <= 0) {
    if (!isNaN(er) && er > 0) { VF = 1 / Math.sqrt(er); }
    else { showError('Enter a velocity factor, or a dielectric constant.'); return; }
  }
  if (VF > 1) { showError('Velocity factor cannot exceed 1.'); return; }

  var d = VF * C_LIGHT * (t * 1e-9) / 2; // metres
  document.getElementById("dist").textContent = engFmt(d, 'm');
  document.getElementById("vfu").textContent  = VF.toFixed(3) + ' (εr ≈ ' + (1 / (VF * VF)).toFixed(2) + ')';

  if (!isNaN(rho) && rho > -1 && rho < 1) {
    var Z0 = (!isNaN(z0) && z0 > 0) ? z0 : 50;
    var Zf = Z0 * (1 + rho) / (1 - rho);
    document.getElementById("zf").textContent = Zf.toFixed(1) + ' Ω';
    var type = 'partial mismatch';
    if (rho > 0.98) type = 'open circuit';
    else if (rho < -0.98) type = 'short circuit';
    else if (rho > 0) type = 'higher-Z (series/open-like)';
    else if (rho < 0) type = 'lower-Z (shunt/short-like)';
    document.getElementById("type").textContent = type;
  } else {
    document.getElementById("zf").textContent   = '— (enter ρ)';
    document.getElementById("type").textContent = '—';
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
