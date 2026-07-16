/* EVM <-> SNR (MER) converter
 *
 *   EVM_rms (fraction) = 10^(-SNR/20)
 *   SNR (dB)           = -20*log10(EVM_rms)
 *   EVM (dB)           = 20*log10(EVM_rms) = -SNR(dB)
 *
 *   Assumes EVM dominated by additive noise (so SNR = MER).
 *   References: McKinley et al., ARFTG 2004; 3GPP TS 38.104.
 */

// Densest QAM whose typical rms-EVM limit (approx 3GPP) is met, worst first.
var QAM_LIMITS = [
  { evm: 17.5, name: 'QPSK' },
  { evm: 12.5, name: '16-QAM' },
  { evm: 8.0,  name: '64-QAM' },
  { evm: 3.5,  name: '256-QAM' },
  { evm: 2.2,  name: '1024-QAM' }
];

function maxQam(evmPct) {
  var best = 'below QPSK limit';
  for (var i = 0; i < QAM_LIMITS.length; i++) {
    if (evmPct <= QAM_LIMITS[i].evm) best = QAM_LIMITS[i].name;
  }
  return best;
}

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var evmStr = document.getElementById("evm").value.trim();
  var snrStr = document.getElementById("snr").value.trim();
  var evm = parseFloat(evmStr);
  var snr = parseFloat(snrStr);
  clearError();

  var evmFrac, snrDb;
  if (snrStr !== '' && !isNaN(snr)) {
    // SNR drives the conversion (takes precedence if both are filled)
    snrDb = snr;
    evmFrac = Math.pow(10, -snrDb / 20);
  } else if (evmStr !== '' && !isNaN(evm) && evm > 0) {
    evmFrac = evm / 100;
    snrDb = -20 * Math.log10(evmFrac);
  } else {
    showError('Enter a value in either the EVM field or the SNR field.');
    return;
  }

  var evmPct = evmFrac * 100;
  document.getElementById("rEvm").textContent   = evmPct.toFixed(3) + ' %';
  document.getElementById("rEvmDb").textContent = (20 * Math.log10(evmFrac)).toFixed(2) + ' dB';
  document.getElementById("rSnr").textContent   = snrDb.toFixed(2) + ' dB';
  document.getElementById("rQam").textContent   = maxQam(evmPct);

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
