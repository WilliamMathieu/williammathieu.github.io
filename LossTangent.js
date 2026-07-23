/* Dielectric loss tangent
 *
 *   eps'' = eps' * tanδ,   Q_d = 1/tanδ
 *   alpha (dB/m) ≈ 27.3 * sqrt(eps') * tanδ / lambda0   (low-loss approximation)
 *   lambda = lambda0/sqrt(eps'),  v_p = c/sqrt(eps'),  lambda0 = c/f
 *
 *   References: Pozar, Microwave Engineering 4e §1.6; Collin, Foundations for
 *   Microwave Engineering 2e.
 */
var C_LIGHT = 299792458;

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var er  = parseFloat(document.getElementById("er").value);
  var td  = parseFloat(document.getElementById("td").value);
  var f   = parseFloat(document.getElementById("f").value);   // GHz
  var len = parseFloat(document.getElementById("len").value); // mm, optional
  clearError();

  if (isNaN(er) || isNaN(td) || isNaN(f) || er <= 0 || td < 0 || f <= 0) {
    showError('Enter a positive permittivity, a non-negative loss tangent, and a positive frequency.');
    return;
  }

  var lam0 = C_LIGHT / (f * 1e9);       // m
  var lam  = lam0 / Math.sqrt(er);      // m
  var vp   = C_LIGHT / Math.sqrt(er);   // m/s
  var alphaDbm = 27.3 * Math.sqrt(er) * td / lam0; // dB/m

  document.getElementById("eim").textContent = (er * td).toExponential(3);
  document.getElementById("qd").textContent  = (td > 0 ? (1 / td).toFixed(0) : '∞');
  document.getElementById("lam").textContent = engFmt(lam, 'm');
  document.getElementById("att").textContent = alphaDbm.toFixed(3) + ' dB/m';
  document.getElementById("vp").textContent  = engFmt(vp, 'm/s') + ' (' + (vp / C_LIGHT).toFixed(3) + ' c)';

  if (!isNaN(len) && len > 0) {
    document.getElementById("tot").textContent = (alphaDbm * len / 1000).toFixed(4) + ' dB';
  } else {
    document.getElementById("tot").textContent = '— (enter ℓ)';
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
