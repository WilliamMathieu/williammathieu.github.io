/* exported ntCalc */
/*
 * Noise Temperature <-> Noise Figure
 *   F  = 10^(NF/10)
 *   Te = T0 (F - 1),   F = 1 + Te/T0,   T0 = 290 K
 *   P_added = k Te B   (referred to input)
 */
var NT_T0 = 290;
var NT_K = 1.380649e-23;

function ntCalc() {
  clearError();
  var nf = parseFloat(document.getElementById('nt-nf').value);
  var te = parseFloat(document.getElementById('nt-te').value);
  var B = parseFloat(document.getElementById('nt-b').value);

  var F;
  if (!isNaN(nf)) {
    F = Math.pow(10, nf / 10);
    te = NT_T0 * (F - 1);
  } else if (!isNaN(te)) {
    if (te < 0) { showError('Noise temperature cannot be negative.'); return; }
    F = 1 + te / NT_T0;
    nf = 10 * Math.log10(F);
  } else {
    showError('Enter a noise figure (dB) or a noise temperature (K).');
    return;
  }
  if (F < 1) { showError('Noise figure cannot be below 0 dB (F < 1).'); return; }

  document.getElementById('nt-rnf').textContent = nf.toFixed(4) + ' dB';
  document.getElementById('nt-rf').textContent = F.toFixed(4);
  document.getElementById('nt-rte').textContent = te.toFixed(2) + ' K';

  if (!isNaN(B) && B > 0) {
    var P = NT_K * te * (B * 1e6);            // watts
    document.getElementById('nt-rp').textContent = engFmt(P, 'W');
    document.getElementById('nt-rpdbm').textContent =
      (P > 0 ? (10 * Math.log10(P / 1e-3)).toFixed(2) + ' dBm' : '−∞ dBm');
  } else {
    document.getElementById('nt-rp').textContent = '— (enter B)';
    document.getElementById('nt-rpdbm').textContent = '— (enter B)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
