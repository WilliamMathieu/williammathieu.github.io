/* Field strength converter (far field, free space)
 *
 *   E_dBµV/m = 20*log10(E / 1e-6)
 *   S = E^2/eta0 (W/m²),  H = E/eta0,  S_dBm/m² = 10*log10(S/1e-3)
 *   From EIRP + distance:  S = P_EIRP(W) / (4*pi*d^2),  E = sqrt(S*eta0)
 *
 *   References: Ott, EMC Engineering; ICNIRP 2020 guidelines.
 */
var ETA0 = 376.730313668;

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var known = document.getElementById("known").value;
  var val  = parseFloat(document.getElementById("val").value);
  var eirp = parseFloat(document.getElementById("eirp").value); // dBm
  var d    = parseFloat(document.getElementById("d").value);    // m
  clearError();

  var E; // V/m
  if (!isNaN(eirp) && !isNaN(d) && d > 0) {
    var Pw = Math.pow(10, eirp / 10) * 1e-3;   // W
    var Sff = Pw / (4 * Math.PI * d * d);      // W/m²
    E = Math.sqrt(Sff * ETA0);
  } else if (!isNaN(val) && val > 0 || (!isNaN(val) && (known === 'Edbuv' || known === 'Sdbm'))) {
    if (known === 'Evm')        E = val;
    else if (known === 'Edbuv') E = Math.pow(10, val / 20) * 1e-6;
    else if (known === 'Swm')   E = Math.sqrt(val * ETA0);
    else                        E = Math.sqrt(Math.pow(10, val / 10) * 1e-3 * ETA0); // dBm/m²
  } else {
    showError('Enter a field/power value, or an EIRP with a distance.');
    return;
  }
  if (isNaN(E) || E <= 0) { showError('Enter a valid positive level.'); return; }

  var S = E * E / ETA0;   // W/m²
  var H = E / ETA0;       // A/m

  document.getElementById("Evm").textContent   = engFmt(E, 'V/m');
  document.getElementById("Edbuv").textContent = (20 * Math.log10(E / 1e-6)).toFixed(2) + ' dBµV/m';
  document.getElementById("Ham").textContent   = engFmt(H, 'A/m');
  document.getElementById("Swm").textContent   = engFmt(S, 'W/m²');
  document.getElementById("Sdbm").textContent  = (10 * Math.log10(S / 1e-3)).toFixed(2) + ' dBm/m²';
  document.getElementById("Smwcm").textContent = (S * 1e3 / 1e4).toExponential(3) + ' mW/cm²';

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
