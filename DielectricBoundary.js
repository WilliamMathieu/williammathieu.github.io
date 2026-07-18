/* Dielectric boundary — Fresnel equations
 *
 *   n = sqrt(er);  Snell: n1*sin(ti) = n2*sin(tt)
 *   r_TE = (n1 cosθi - n2 cosθt)/(n1 cosθi + n2 cosθt)
 *   r_TM = (n2 cosθi - n1 cosθt)/(n2 cosθi + n1 cosθt)
 *   R = |r|^2, T = 1 - R;  Brewster = atan(n2/n1);  critical = asin(n2/n1) if n1>n2
 *
 *   References: Cheng, Field and Wave Electromagnetics 2e; Kraus & Fleisch,
 *   Electromagnetics 5e.
 */
var DEG = Math.PI / 180;

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var er1 = parseFloat(document.getElementById("er1").value);
  var er2 = parseFloat(document.getElementById("er2").value);
  var ti  = parseFloat(document.getElementById("ti").value);
  clearError();

  if (isNaN(er1) || isNaN(er2) || isNaN(ti) || er1 <= 0 || er2 <= 0 || ti < 0 || ti >= 90) {
    showError('Enter positive permittivities and an incidence angle in [0, 90).');
    return;
  }
  var n1 = Math.sqrt(er1), n2 = Math.sqrt(er2);
  var thi = ti * DEG, ci = Math.cos(thi);
  var sinT = n1 / n2 * Math.sin(thi);

  // Brewster (always defined) and critical (only when entering a less-dense medium)
  document.getElementById("brew").textContent = (Math.atan(n2 / n1) / DEG).toFixed(2) + '°';
  if (n1 > n2) {
    document.getElementById("crit").textContent = (Math.asin(n2 / n1) / DEG).toFixed(2) + '°';
  } else {
    document.getElementById("crit").textContent = '— (n₁ ≤ n₂)';
  }

  if (sinT >= 1) {
    // total internal reflection
    document.getElementById("tt").textContent  = 'evanescent (TIR)';
    document.getElementById("rte").textContent = '1.000 (100%)';
    document.getElementById("rtm").textContent = '1.000 (100%)';
  } else {
    var tht = Math.asin(sinT), ct = Math.cos(tht);
    var rTE = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct);
    var rTM = (n2 * ci - n1 * ct) / (n2 * ci + n1 * ct);
    var RTE = rTE * rTE, RTM = rTM * rTM;
    document.getElementById("tt").textContent  = (tht / DEG).toFixed(2) + '°';
    document.getElementById("rte").textContent = RTE.toFixed(4) + '  (' + (RTE * 100).toFixed(1) + '%)';
    document.getElementById("rtm").textContent = RTM.toFixed(4) + '  (' + (RTM * 100).toFixed(1) + '%)';
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
