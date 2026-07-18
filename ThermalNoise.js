/* Thermal (Johnson–Nyquist) noise
 *
 *   v_n = sqrt(4*k*T*R*B),   i_n = sqrt(4*k*T*B/R)
 *   Available noise power P = k*T*B  (W),  dBm = 10*log10(P/1e-3)
 *   Density kT = -174 dBm/Hz at 290 K
 *
 *   References: Johnson & Nyquist, Phys. Rev. 32 (1928); Pozar, Microwave
 *   Engineering 4e.
 */
var K_B = 1.380649e-23; // J/K

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var R = parseFloat(document.getElementById("R").value);
  var T = parseFloat(document.getElementById("T").value);
  var B = parseFloat(document.getElementById("B").value);
  clearError();

  if (isNaN(T) || T <= 0) T = 290;
  if (isNaN(R) || isNaN(B) || R <= 0 || B <= 0) {
    showError('Enter a positive resistance and bandwidth.');
    return;
  }

  var vn = Math.sqrt(4 * K_B * T * R * B);
  var inA = Math.sqrt(4 * K_B * T * B / R);
  var P = K_B * T * B;              // W (available)
  var Pdbm = 10 * Math.log10(P / 1e-3);
  var ktDbm = 10 * Math.log10(K_B * T / 1e-3); // dBm/Hz

  document.getElementById("vn").textContent   = engFmt(vn, 'V');
  document.getElementById("in").textContent   = engFmt(inA, 'A');
  document.getElementById("vd").textContent   = engFmt(Math.sqrt(4 * K_B * T * R), 'V/√Hz');
  document.getElementById("pw").textContent   = engFmt(P, 'W');
  document.getElementById("pdbm").textContent = Pdbm.toFixed(2) + ' dBm';
  document.getElementById("kt").textContent   = ktDbm.toFixed(2) + ' dBm/Hz';

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
