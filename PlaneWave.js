/* Plane wave: intrinsic impedance, E/H fields and power density
 *
 *   eta = eta0 * sqrt(mu_r/eps_r),  eta0 = sqrt(mu0/eps0) ≈ 376.73 ohm
 *   S = E^2/eta = H^2*eta = E*H,  H = E/eta
 *   v_p = c / sqrt(eps_r*mu_r),  lambda = v_p/f
 *
 *   References: Cheng, Field and Wave Electromagnetics 2e; Balanis, Advanced
 *   Engineering Electromagnetics 2e.
 */
var C_LIGHT = 299792458;
var ETA0 = 376.730313668; // ohm

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var er  = parseFloat(document.getElementById("er").value);
  var mur = parseFloat(document.getElementById("mur").value);
  var known = document.getElementById("known").value;
  var val = parseFloat(document.getElementById("val").value);
  var f   = parseFloat(document.getElementById("f").value); // MHz
  clearError();

  if (isNaN(er) || er <= 0) er = 1;
  if (isNaN(mur) || mur <= 0) mur = 1;
  if (isNaN(val) || val <= 0) {
    showError('Enter a positive value for the selected field quantity.');
    return;
  }

  var eta = ETA0 * Math.sqrt(mur / er);
  var E, H, S;
  if (known === 'E') { E = val; H = E / eta; S = E * E / eta; }
  else if (known === 'H') { H = val; E = H * eta; S = H * H * eta; }
  else { S = val; E = Math.sqrt(S * eta); H = E / eta; }

  document.getElementById("eta").textContent = eta.toFixed(2) + ' Ω';
  document.getElementById("E").textContent   = engFmt(E, 'V/m');
  document.getElementById("H").textContent   = engFmt(H, 'A/m');
  document.getElementById("S").textContent   = engFmt(S, 'W/m²');

  var vp = C_LIGHT / Math.sqrt(er * mur);
  document.getElementById("vp").textContent = engFmt(vp, 'm/s') + ' (' + (vp / C_LIGHT).toFixed(3) + ' c)';
  if (!isNaN(f) && f > 0) {
    document.getElementById("lam").textContent = engFmt(vp / (f * 1e6), 'm');
  } else {
    document.getElementById("lam").textContent = '— (enter f)';
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
