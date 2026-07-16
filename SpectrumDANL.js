/* Spectrum analyzer DANL (displayed average noise level) and sensitivity
 *
 *   DANL = -174 dBm/Hz + NF + L_att + 10*log10(RBW)
 *   noise density = -174 + NF + L_att   (dBm/Hz)
 *   sensitivity   = DANL + SNR_min
 *
 *   References: Keysight AN 150; Rohde & Schwarz spectrum-analysis primer.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var rbw = parseFloat(document.getElementById("rbw").value); // Hz
  var nf  = parseFloat(document.getElementById("nf").value);  // dB
  var att = parseFloat(document.getElementById("att").value); // dB, optional
  var snr = parseFloat(document.getElementById("snr").value); // dB, optional
  clearError();

  if (isNaN(rbw) || isNaN(nf) || rbw <= 0) {
    showError('Please enter a positive RBW and a noise figure.');
    return;
  }
  var Latt = isNaN(att) ? 0 : att;

  var density = -174 + nf + Latt;               // dBm/Hz
  var danl = density + 10 * Math.log10(rbw);     // dBm in RBW

  document.getElementById("danl").textContent = danl.toFixed(2) + ' dBm';
  document.getElementById("dens").textContent = density.toFixed(2) + ' dBm/Hz';
  document.getElementById("d1").textContent   = density.toFixed(2) + ' dBm';

  if (!isNaN(snr)) {
    document.getElementById("sens").textContent = (danl + snr).toFixed(2) + ' dBm';
  } else {
    document.getElementById("sens").textContent = '— (enter SNR)';
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
