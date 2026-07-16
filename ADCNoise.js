/* ADC SNR, ENOB and aperture jitter
 *
 *   Ideal quantization SNR (full-scale sine):  SNR_q = 6.02*N + 1.76  dB
 *   Aperture-jitter-limited SNR:               SNR_j = -20*log10(2*pi*f_in*sigma_t)
 *   Combined (noise powers add):               SNR_t = -10*log10(10^(-SNR_q/10) + 10^(-SNR_j/10))
 *   Effective number of bits:                  ENOB  = (SINAD - 1.76)/6.02
 *
 *   References: W. Kester (ed.), Data Conversion Handbook (Analog Devices);
 *   IEEE Std 1241-2010.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var N     = parseFloat(document.getElementById("N").value);
  var fin   = parseFloat(document.getElementById("fin").value);   // MHz
  var jitps = parseFloat(document.getElementById("jit").value);   // ps
  var sinad = parseFloat(document.getElementById("sinad").value); // optional
  clearError();

  if (isNaN(N) || N <= 0) {
    showError('Please enter a valid resolution N (bits).');
    return;
  }

  var snrq = 6.02 * N + 1.76;
  document.getElementById("snrq").textContent = snrq.toFixed(2) + ' dB';

  var haveJitter = !isNaN(fin) && fin > 0 && !isNaN(jitps) && jitps > 0;
  var snrt = snrq, limitedBy = 'quantization';
  if (haveJitter) {
    var f = fin * 1e6, st = jitps * 1e-12;
    var snrj = -20 * Math.log10(2 * Math.PI * f * st);
    snrt = -10 * Math.log10(Math.pow(10, -snrq / 10) + Math.pow(10, -snrj / 10));
    limitedBy = (snrj < snrq) ? 'jitter' : 'quantization';
    document.getElementById("snrj").textContent = snrj.toFixed(2) + ' dB';
  } else {
    document.getElementById("snrj").textContent = '— (enter f, σt)';
  }
  document.getElementById("snrt").textContent = snrt.toFixed(2) + ' dB';

  // ENOB: from measured SINAD if provided, else from the predicted combined SNR
  var enobBasis = !isNaN(sinad) ? sinad : snrt;
  var enob = (enobBasis - 1.76) / 6.02;
  document.getElementById("enob").textContent = enob.toFixed(2) + ' bits' + (!isNaN(sinad) ? ' (meas.)' : '');
  document.getElementById("limit").textContent = !isNaN(sinad) ? '— (from SINAD)' : limitedBy;

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
