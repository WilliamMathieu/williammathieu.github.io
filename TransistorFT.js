/* Transistor transition frequency fT and max oscillation frequency fmax
 *
 *   fT   = gm / (2*pi*(Cgs + Cgd))
 *   fmax ~ sqrt( fT / (8*pi*Rg*Cgd) )      (gate-resistance-limited form)
 *
 *   References: T. H. Lee, Design of CMOS RF ICs 2e; Razavi, RF Microelectronics 2e.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var gm  = parseFloat(document.getElementById("gm").value) * 1e-3;  // mS -> S
  var Cgs = parseFloat(document.getElementById("Cgs").value) * 1e-12; // pF -> F
  var Cgd = parseFloat(document.getElementById("Cgd").value) * 1e-12; // pF -> F
  var Rg  = parseFloat(document.getElementById("Rg").value);          // ohm, optional
  clearError();

  if (isNaN(gm) || isNaN(Cgs) || isNaN(Cgd) || gm <= 0 || Cgs <= 0 || Cgd < 0) {
    showError('Please enter positive gm, Cgs and a non-negative Cgd.');
    return;
  }

  var Ctot = Cgs + Cgd;
  var fT = gm / (2 * Math.PI * Ctot);
  document.getElementById("ft").textContent   = engFmt(fT, 'Hz');
  document.getElementById("ctot").textContent = engFmt(Ctot, 'F');

  if (!isNaN(Rg) && Rg > 0 && Cgd > 0) {
    var fmax = Math.sqrt(fT / (8 * Math.PI * Rg * Cgd));
    document.getElementById("fmax").textContent = engFmt(fmax, 'Hz');
  } else {
    document.getElementById("fmax").textContent = '— (enter Rg, Cgd)';
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
