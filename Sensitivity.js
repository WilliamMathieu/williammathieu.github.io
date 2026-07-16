/* Receiver sensitivity / MDS and SFDR
 *
 *   Thermal noise floor referred to the input (T0 = 290 K):
 *     P_floor(dBm) = -174 + 10*log10(B) + NF
 *   Minimum detectable signal / sensitivity:
 *     MDS(dBm) = P_floor + SNR_min
 *   Spurious-free dynamic range from the input IP3:
 *     SFDR(dB) = (2/3)*(IIP3 - P_floor)
 *
 *   References: Razavi, RF Microelectronics 2e; Rohde & Rudolph,
 *   RF/Microwave Circuit Design for Wireless Applications 2e.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var B    = parseFloat(document.getElementById("B").value);
  var NF   = parseFloat(document.getElementById("NF").value);
  var SNR  = parseFloat(document.getElementById("SNR").value);
  var IIP3 = parseFloat(document.getElementById("IIP3").value); // optional
  clearError();

  if (isNaN(B) || isNaN(NF) || isNaN(SNR) || B <= 0) {
    showError('Please enter a positive bandwidth and valid NF and required SNR.');
    return;
  }

  var floor = -174 + 10 * Math.log10(B) + NF; // dBm
  var mds   = floor + SNR;                     // dBm

  document.getElementById("floor").textContent = floor.toFixed(2) + ' dBm';
  document.getElementById("mds").textContent   = mds.toFixed(2) + ' dBm';
  document.getElementById("ktb").textContent   = (-174 + 10 * Math.log10(B)).toFixed(2) + ' dBm';

  if (!isNaN(IIP3)) {
    var sfdr = (2 / 3) * (IIP3 - floor);
    document.getElementById("sfdr").textContent = sfdr.toFixed(2) + ' dB';
  } else {
    document.getElementById("sfdr").textContent = '— (enter IIP3)';
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
