/* G/T figure of merit and system noise temperature
 *
 *   T_rx = T0*(F-1),  T0 = 290 K   (F from NF in dB)
 *   T_sys = T_ant + T_rx
 *   G/T = G(dBi) - 10*log10(T_sys)   (dB/K)
 *
 *   References: Pratt, Bostian & Allnutt, Satellite Communications 2e;
 *   Roddy, Satellite Communications 4e.
 */
var T0 = 290;

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var G    = parseFloat(document.getElementById("G").value);    // dBi
  var tant = parseFloat(document.getElementById("tant").value); // K
  var nf   = parseFloat(document.getElementById("nf").value);   // dB
  var trxIn = parseFloat(document.getElementById("trx").value); // K, alt
  clearError();

  if (isNaN(G) || isNaN(tant) || tant < 0) {
    showError('Enter the antenna gain and antenna noise temperature.');
    return;
  }

  var Trx;
  if (!isNaN(nf)) {
    Trx = T0 * (Math.pow(10, nf / 10) - 1);
  } else if (!isNaN(trxIn) && trxIn >= 0) {
    Trx = trxIn;
  } else {
    showError('Enter a receiver noise figure (dB) or a receiver noise temperature (K).');
    return;
  }

  var Tsys = tant + Trx;
  var GT = G - 10 * Math.log10(Tsys);

  document.getElementById("gt").textContent   = GT.toFixed(2) + ' dB/K';
  document.getElementById("rTrx").textContent = Trx.toFixed(1) + ' K';
  document.getElementById("tsys").textContent = Tsys.toFixed(1) + ' K';

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
