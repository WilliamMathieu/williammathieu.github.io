/* exported ofCalc */
/*
 * OFDM Parameters
 *   Tu   = 1/Δf                       useful symbol time
 *   fs   = N_FFT · Δf                 sample rate
 *   Tcp  = N_cp / fs                  cyclic-prefix duration
 *   Tsym = Tu + Tcp                   total symbol time
 *   BW   ≈ N_used · Δf                occupied bandwidth
 *   overhead = Tcp / Tsym
 *   PAPR_max = 10 log10(N_used) dB
 *   Rb = N_used · log2(M) · Rcode / Tsym
 *   Ref: 3GPP TS 36.211 / 38.211 numerology.
 */

function ofCalc() {
  clearError();
  var df = parseFloat(document.getElementById('of-df').value);     // kHz
  var nfft = parseFloat(document.getElementById('of-nfft').value);
  var nused = parseFloat(document.getElementById('of-nused').value);
  var ncp = parseFloat(document.getElementById('of-ncp').value);
  var M = parseFloat(document.getElementById('of-m').value);
  var rc = parseFloat(document.getElementById('of-rc').value);

  if (isNaN(df) || df <= 0) { showError('Enter a positive subcarrier spacing (kHz).'); return; }
  if (isNaN(nfft) || nfft <= 0) { showError('Enter a positive FFT size.'); return; }
  if (isNaN(nused) || nused <= 0) { showError('Enter the number of used subcarriers.'); return; }
  if (nused > nfft) { showError('Used subcarriers cannot exceed the FFT size.'); return; }
  if (isNaN(ncp) || ncp < 0) { showError('Enter a valid cyclic-prefix length (samples).'); return; }
  if (isNaN(rc) || rc <= 0 || rc > 1) rc = 1;

  var dfHz = df * 1e3;
  var Tu = 1 / dfHz;                     // s
  var fs = nfft * dfHz;                  // Hz
  var Tcp = ncp / fs;                    // s
  var Tsym = Tu + Tcp;                   // s
  var BW = nused * dfHz;                 // Hz
  var overhead = Tcp / Tsym;
  var papr = 10 * Math.log10(nused);
  var k = Math.log2(M);
  var Rb = nused * k * rc / Tsym;        // bits/s

  document.getElementById('of-tu').textContent = engFmt(Tu, 's');
  document.getElementById('of-fs').textContent = engFmt(fs, 'Hz');
  document.getElementById('of-tcp').textContent = engFmt(Tcp, 's');
  document.getElementById('of-tsym').textContent = engFmt(Tsym, 's');
  document.getElementById('of-bw').textContent = engFmt(BW, 'Hz');
  document.getElementById('of-ov').textContent = (overhead * 100).toFixed(2) + ' %';
  document.getElementById('of-papr').textContent = papr.toFixed(2) + ' dB';
  document.getElementById('of-rb').textContent = engFmt(Rb, 'bps');

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
