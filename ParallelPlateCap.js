/* Parallel-plate capacitor
 *
 *   C = eps0 * er * A * (N-1) / d      (A in m^2, d in m)
 *   E = V/d      (field),  U = 0.5*C*V^2 (energy),  Q = C*V (charge)
 *   An N-plate stack behaves as (N-1) single-gap capacitors in parallel.
 *
 *   References: Cheng, Field and Wave Electromagnetics 2e; Pozar,
 *   Microwave Engineering 4e.
 */
var EPS0 = 8.8541878128e-12; // F/m

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var A  = parseFloat(document.getElementById("A").value);  // mm^2
  var d  = parseFloat(document.getElementById("d").value);  // mm
  var er = parseFloat(document.getElementById("er").value);
  var N  = parseFloat(document.getElementById("N").value);  // optional
  var V  = parseFloat(document.getElementById("V").value);  // optional
  clearError();

  if (isNaN(A) || isNaN(d) || isNaN(er) || A <= 0 || d <= 0 || er <= 0) {
    showError('Please enter positive area, separation and dielectric constant.');
    return;
  }
  if (isNaN(N) || N < 2) N = 2;
  N = Math.round(N);

  var Am = A * 1e-6;  // m^2
  var dm = d * 1e-3;  // m
  var Cgap = EPS0 * er * Am / dm;   // single-gap capacitance
  var C = Cgap * (N - 1);           // N-1 gaps in parallel

  document.getElementById("C").textContent  = engFmt(C, 'F');
  document.getElementById("Cg").textContent = engFmt(Cgap, 'F') + (N > 2 ? ' × ' + (N - 1) : '');

  if (!isNaN(V)) {
    var E = V / dm;                 // V/m
    var U = 0.5 * C * V * V;        // J
    var Qc = C * V;                 // C
    document.getElementById("E").textContent  = engFmt(E, 'V/m') + ' (' + (E / 1e6).toFixed(3) + ' kV/mm)';
    document.getElementById("U").textContent  = engFmt(U, 'J');
    document.getElementById("Qc").textContent = engFmt(Qc, 'C');
  } else {
    document.getElementById("E").textContent  = '— (enter V)';
    document.getElementById("U").textContent  = '— (enter V)';
    document.getElementById("Qc").textContent = '— (enter V)';
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
