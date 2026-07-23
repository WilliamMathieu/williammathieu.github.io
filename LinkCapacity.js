/* Shannon capacity, Eb/N0 <-> SNR, and BPSK/QPSK BER
 *
 *   Shannon capacity:   C = B * log2(1 + SNR)
 *   Per-bit ratio:      Eb/N0 = SNR * B / Rb   (linear)
 *   Coherent BPSK/QPSK: BER = Q(sqrt(2*Eb/N0)),  Q(x) = 0.5*erfc(x/sqrt2)
 *
 *   References: Shannon 1948; Proakis & Salehi, Digital Communications 5e.
 */

// erfc via the Numerical Recipes rational approximation (|err| < 1.2e-7)
function erfc(x) {
  var z = Math.abs(x);
  var t = 1 / (1 + 0.5 * z);
  var y = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 +
    t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 +
    t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? y : 2 - y;
}
function qfunc(x) { return 0.5 * erfc(x / Math.SQRT2); }

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var B  = parseFloat(document.getElementById("B").value);
  var Rb = parseFloat(document.getElementById("Rb").value);
  var snrStr = document.getElementById("snr").value.trim();
  var ebStr  = document.getElementById("ebn0").value.trim();
  var snrIn = parseFloat(snrStr);
  var ebIn  = parseFloat(ebStr);
  clearError();

  if (isNaN(B) || isNaN(Rb) || B <= 0 || Rb <= 0) {
    showError('Please enter a positive bandwidth and bit rate.');
    return;
  }

  var snrLin, ebLin;
  if (snrStr !== '' && !isNaN(snrIn)) {
    snrLin = Math.pow(10, snrIn / 10);
    ebLin  = snrLin * B / Rb;
  } else if (ebStr !== '' && !isNaN(ebIn)) {
    ebLin  = Math.pow(10, ebIn / 10);
    snrLin = ebLin * Rb / B;
  } else {
    showError('Enter a value in either the SNR field or the Eb/N0 field.');
    return;
  }

  var C = B * Math.log2(1 + snrLin);
  var ber = qfunc(Math.sqrt(2 * ebLin)); // BPSK & QPSK have the same BER vs Eb/N0

  document.getElementById("cap").textContent   = engFmt(C, 'bit/s');
  document.getElementById("specC").textContent = (C / B).toFixed(3) + ' bit/s/Hz';
  document.getElementById("specL").textContent = (Rb / B).toFixed(3) + ' bit/s/Hz';
  document.getElementById("rSnr").textContent  = (10 * Math.log10(snrLin)).toFixed(2) + ' dB';
  document.getElementById("rEb").textContent   = (10 * Math.log10(ebLin)).toFixed(2) + ' dB';
  document.getElementById("rBer").textContent  = ber.toExponential(2) + (document.getElementById("mod").value === 'qpsk' ? ' (QPSK)' : ' (BPSK)');

  if (Rb > C) {
    showError('Note: Rb exceeds the Shannon capacity C — no code can achieve error-free transmission here.');
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
