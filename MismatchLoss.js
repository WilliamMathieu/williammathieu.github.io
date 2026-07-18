/* Mismatch loss / return loss / VSWR
 *
 *   Gamma = (VSWR-1)/(VSWR+1)
 *   RL = -20*log10|Gamma|,  ML = -10*log10(1 - |Gamma|^2)
 *   P_reflected = |Gamma|^2,  P_transmitted = 1 - |Gamma|^2
 *
 *   References: Pozar, Microwave Engineering 4e §2.3; Keysight VSWR/RL note.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var known = document.getElementById("known").value;
  var val = parseFloat(document.getElementById("val").value);
  clearError();

  if (isNaN(val)) { showError('Enter a value for the selected quantity.'); return; }

  var G; // |Gamma|
  if (known === 'vswr') {
    if (val < 1) { showError('VSWR must be ≥ 1.'); return; }
    G = (val - 1) / (val + 1);
  } else if (known === 'gamma') {
    if (val < 0 || val >= 1) { showError('|Γ| must be in [0, 1).'); return; }
    G = val;
  } else { // return loss (dB, positive)
    var rl = Math.abs(val);
    G = Math.pow(10, -rl / 20);
  }

  var vswr = (1 + G) / (1 - G);
  var ML = -10 * Math.log10(1 - G * G);
  var refl = G * G;

  document.getElementById("rVswr").textContent = vswr.toFixed(4) + ' : 1';
  document.getElementById("rGam").textContent  = G.toFixed(4);
  document.getElementById("rRL").textContent   = (G > 0 ? (-20 * Math.log10(G)).toFixed(2) + ' dB' : '∞ (perfect)');
  document.getElementById("rML").textContent   = ML.toFixed(4) + ' dB';
  document.getElementById("rRef").textContent  = (refl * 100).toFixed(2) + ' %';
  document.getElementById("rTx").textContent   = ((1 - refl) * 100).toFixed(2) + ' %';

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
