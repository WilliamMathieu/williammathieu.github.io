/* Pi-network impedance matching (low-pass and high-pass)
 *
 *   Rv = R1/(Q^2 + 1),  Q2 = sqrt(R2/Rv - 1)
 *   Low-pass:  C1 = Q/(w*R1),  L = Rv*(Q+Q2)/w,  C2 = Q2/(w*R2)
 *   High-pass: L1 = R1/(w*Q),  C = 1/(w*Rv*(Q+Q2)), L2 = R2/(w*Q2)
 *   Q is referenced to the R1 port; when R1 > R2 it must exceed sqrt(R1/R2 - 1).
 *
 *   References: Terman, Radio Engineers' Handbook; Bowick, RF Circuit Design 2e.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var f  = parseFloat(document.getElementById("f").value);  // MHz
  var R1 = parseFloat(document.getElementById("r1").value); // ohm
  var R2 = parseFloat(document.getElementById("r2").value); // ohm
  var Q  = parseFloat(document.getElementById("q").value);
  var topo = document.getElementById("topo").value;
  clearError();

  if (isNaN(f) || isNaN(R1) || isNaN(R2) || isNaN(Q) || f <= 0 || R1 <= 0 || R2 <= 0 || Q <= 0) {
    showError('Please enter positive frequency, R1, R2 and Q.');
    return;
  }
  var Qmin = (R1 > R2) ? Math.sqrt(R1 / R2 - 1) : 0;
  if (Q <= Qmin) {
    showError('Q must exceed √(R1/R2 − 1) = ' + Qmin.toFixed(2) + ' for this impedance ratio.');
    return;
  }

  var w = 2 * Math.PI * f * 1e6;
  var Rv = R1 / (Q * Q + 1);
  var Q2 = Math.sqrt(R2 / Rv - 1);

  var v1, v2, v3, cap1, cap2, cap3;
  if (topo === 'lp') {
    v1 = Q / (w * R1);            cap1 = true;  // C1 (shunt)
    v2 = Rv * (Q + Q2) / w;       cap2 = false; // L  (series)
    v3 = Q2 / (w * R2);           cap3 = true;  // C2 (shunt)
  } else {
    v1 = R1 / (w * Q);            cap1 = false; // L1 (shunt)
    v2 = 1 / (w * Rv * (Q + Q2)); cap2 = true;  // C  (series)
    v3 = R2 / (w * Q2);           cap3 = false; // L2 (shunt)
  }

  document.getElementById("l1").textContent = (topo === 'lp' ? 'C₁ (shunt @ R₁)' : 'L₁ (shunt @ R₁)');
  document.getElementById("l2").textContent = (topo === 'lp' ? 'L (series)' : 'C (series)');
  document.getElementById("l3").textContent = (topo === 'lp' ? 'C₂ (shunt @ R₂)' : 'L₂ (shunt @ R₂)');
  document.getElementById("e1").textContent = engFmt(v1, cap1 ? 'F' : 'H');
  document.getElementById("e2").textContent = engFmt(v2, cap2 ? 'F' : 'H');
  document.getElementById("e3").textContent = engFmt(v3, cap3 ? 'F' : 'H');

  var Qloaded = Math.max(Q, Q2);
  document.getElementById("qv").textContent = Qloaded.toFixed(2);
  document.getElementById("bw").textContent = engFmt(f * 1e6 / Qloaded, 'Hz');
  document.getElementById("rv").textContent = Rv.toFixed(2) + ' Ω';

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
