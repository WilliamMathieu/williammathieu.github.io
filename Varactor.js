/* Varactor (varicap) C-V tuning
 *
 *   C(V) = C0 / (1 + V/phi)^n
 *   Capacitance tuning ratio = C(Vmin) / C(Vmax)
 *   With resonator L:  f(V) = 1/(2*pi*sqrt(L*C)),  f_max/f_min = sqrt(Cmax/Cmin)
 *
 *   References: Razavi, RF Microelectronics 2e; Sze & Ng, Physics of
 *   Semiconductor Devices 3e.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var C0   = parseFloat(document.getElementById("C0").value) * 1e-12; // pF -> F
  var phi  = parseFloat(document.getElementById("phi").value);
  var n    = parseFloat(document.getElementById("n").value);
  var Vmin = parseFloat(document.getElementById("Vmin").value);
  var Vmax = parseFloat(document.getElementById("Vmax").value);
  var Lin  = parseFloat(document.getElementById("L").value); // nH, optional
  clearError();

  if (isNaN(C0) || isNaN(phi) || isNaN(n) || isNaN(Vmin) || isNaN(Vmax) || C0 <= 0 || phi <= 0 || n <= 0) {
    showError('Please enter positive C0, φ, n and both bias voltages.');
    return;
  }
  if (Vmax <= Vmin) { showError('V_max must be greater than V_min.'); return; }
  if (Vmin < 0 || Vmax < 0) { showError('Reverse-bias voltages should be ≥ 0.'); return; }

  function Cv(V) { return C0 / Math.pow(1 + V / phi, n); }
  var Cmax = Cv(Vmin); // low bias -> high C
  var Cmin = Cv(Vmax); // high bias -> low C

  document.getElementById("cmax").textContent   = engFmt(Cmax, 'F');
  document.getElementById("cmin").textContent   = engFmt(Cmin, 'F');
  document.getElementById("cratio").textContent = (Cmax / Cmin).toFixed(3) + ' : 1';

  if (!isNaN(Lin) && Lin > 0) {
    var L = Lin * 1e-9;
    var fLow  = 1 / (2 * Math.PI * Math.sqrt(L * Cmax)); // high C -> low f
    var fHigh = 1 / (2 * Math.PI * Math.sqrt(L * Cmin)); // low C  -> high f
    document.getElementById("frange").textContent = engFmt(fLow, 'Hz') + ' – ' + engFmt(fHigh, 'Hz');
    document.getElementById("fratio").textContent = (fHigh / fLow).toFixed(3) + ' : 1';
  } else {
    document.getElementById("frange").textContent = '— (enter L)';
    document.getElementById("fratio").textContent = '— (enter L)';
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
