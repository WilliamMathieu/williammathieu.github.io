/* exported mbCalc, mbLoadExample */
/*
 * Modulation Bandwidth & Eb/N0
 *   Rs = Rb / log2(M)          symbol rate
 *   BW = Rs (1 + alpha)        raised-cosine occupied bandwidth
 *   eta = Rb / BW              spectral efficiency (bits/s/Hz)
 *   Es/N0 = Eb/N0 * log2(M)
 *   SNR   = Eb/N0 * log2(M)/(1+alpha)   (in the occupied bandwidth)
 *   Ref: Proakis & Salehi, Digital Communications 5e.
 */

function mbCalc() {
  clearError();
  var Rb = parseFloat(document.getElementById('mb-rb').value); // Mbps
  var M = parseFloat(document.getElementById('mb-m').value);
  var a = parseFloat(document.getElementById('mb-a').value);
  var ebn0 = parseFloat(document.getElementById('mb-ebn0').value); // dB

  if (isNaN(Rb) || Rb <= 0) { showError('Enter a positive bit rate (Mbps).'); return; }
  if (isNaN(M) || M < 2) { showError('Choose a modulation order.'); return; }
  if (isNaN(a) || a < 0 || a > 1) { showError('Roll-off α must be between 0 and 1.'); return; }

  var k = Math.log2(M);              // bits/symbol
  var Rs = Rb / k;                   // MSym/s
  var BW = Rs * (1 + a);             // MHz
  var eta = Rb / BW;                 // bits/s/Hz

  document.getElementById('mb-bps').textContent = k.toFixed(3) + ' bits/sym';
  document.getElementById('mb-rs').textContent = engFmt(Rs * 1e6, 'Sym/s');
  document.getElementById('mb-bw').textContent = engFmt(BW * 1e6, 'Hz');
  document.getElementById('mb-eta').textContent = eta.toFixed(3) + ' bits/s/Hz';

  if (!isNaN(ebn0)) {
    var esn0 = ebn0 + 10 * Math.log10(k);
    var snr = ebn0 + 10 * Math.log10(k / (1 + a));
    document.getElementById('mb-esn0').textContent = esn0.toFixed(2) + ' dB';
    document.getElementById('mb-snr').textContent = snr.toFixed(2) + ' dB';
  } else {
    document.getElementById('mb-esn0').textContent = '— (enter Eb/N0)';
    document.getElementById('mb-snr').textContent = '— (enter Eb/N0)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function mbLoadExample() {
  document.getElementById('mb-rb').value = '100';
  document.getElementById('mb-m').value = '16';
  document.getElementById('mb-a').value = '0.35';
  document.getElementById('mb-ebn0').value = '12';
  mbCalc();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
