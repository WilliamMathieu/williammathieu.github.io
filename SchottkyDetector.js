/* exported sdCalc */
/*
 * Square-law Schottky detector — Pozar §10.3
 *   V_T = kT/q ;  R_v = n V_T /(I_s + I_b)
 *   beta_i = 1/(2 n V_T) · R_v/(R_v+R_s)   [A/W]
 *   beta_v = beta_i · R_v                   [V/W]
 *   NEP = sqrt(4 k T R_v)/beta_v            [W/sqrt(Hz)]
 *   MDS = NEP·sqrt(B) ;  TSS ≈ 2.5·MDS
 */
var KB = 1.380649e-23, QE = 1.602176634e-19;

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
function dBm(p) { return (10 * Math.log10(p / 1e-3)).toFixed(1) + ' dBm'; }

function sdCalc() {
  clearError();
  var n = parseFloat(document.getElementById('sd-n').value);
  var Is = parseFloat(document.getElementById('sd-is').value) * 1e-6;
  var Rs = parseFloat(document.getElementById('sd-rs').value);
  var Ib = parseFloat(document.getElementById('sd-ib').value) * 1e-6;
  var B = parseFloat(document.getElementById('sd-b').value) * 1e6;
  var T = parseFloat(document.getElementById('sd-t').value);

  if (isNaN(n) || n <= 0) { showError('Enter the ideality factor n.'); return; }
  if (isNaN(Is) || Is <= 0) { showError('Enter a positive saturation current I_s (µA).'); return; }
  if (isNaN(Rs) || Rs < 0) Rs = 0;
  if (isNaN(Ib) || Ib < 0) Ib = 0;
  if (isNaN(B) || B <= 0) { showError('Enter a positive video bandwidth B (MHz).'); return; }
  if (isNaN(T) || T <= 0) T = 290;

  var VT = KB * T / QE;
  var Rv = n * VT / (Is + Ib);
  var betaI = (1 / (2 * n * VT)) * (Rv / (Rv + Rs));
  var betaV = betaI * Rv;
  var vn = Math.sqrt(4 * KB * T * Rv);          // V/sqrt(Hz)
  var NEP = vn / betaV;                          // W/sqrt(Hz)
  var MDS = NEP * Math.sqrt(B);                  // W
  var TSS = 2.5 * MDS;                           // W

  document.getElementById('sd-rv').textContent = (Rv >= 1000 ? (Rv / 1000).toFixed(2) + ' kΩ' : Rv.toFixed(0) + ' Ω');
  document.getElementById('sd-bi').textContent = betaI.toFixed(2) + ' A/W';
  document.getElementById('sd-bv').textContent = (betaV / 1000).toFixed(2) + ' kV/W';
  document.getElementById('sd-vn').textContent = (vn * 1e9).toFixed(2) + ' nV/√Hz';
  document.getElementById('sd-nep').textContent = (NEP * 1e12).toFixed(4) + ' pW/√Hz';
  document.getElementById('sd-mds').textContent = dBm(MDS);
  document.getElementById('sd-tss').textContent = dBm(TSS);
}
