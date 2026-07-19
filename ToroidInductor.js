/* exported tiCalc */
/*
 * Toroid inductor (AL method)
 *   L = AL N²   (AL in nH/N², L in nH)
 *   N = sqrt(L/AL)
 *   B_peak = Vrms·√2 / (2π f N Ae)    (Ae in m², f in Hz)
 */

function tiCalc() {
  clearError();
  var AL = parseFloat(document.getElementById('ti-al').value);   // nH/N²
  var Luh = parseFloat(document.getElementById('ti-l').value);   // µH
  var N = parseFloat(document.getElementById('ti-n').value);

  if (isNaN(AL) || AL <= 0) { showError('Enter a positive AL value (nH/N²).'); return; }

  var nRound;
  if (!isNaN(Luh) && Luh > 0) {
    var Lnh = Luh * 1e3;                 // nH
    var nExact = Math.sqrt(Lnh / AL);
    nRound = Math.ceil(nExact);
    document.getElementById('ti-nexact').textContent = nExact.toFixed(2) + ' turns';
    document.getElementById('ti-nround').textContent = nRound + ' turns';
  } else if (!isNaN(N) && N > 0) {
    nRound = Math.round(N);
    document.getElementById('ti-nexact').textContent = '(N given)';
    document.getElementById('ti-nround').textContent = nRound + ' turns';
  } else {
    showError('Enter a target inductance L or a turn count N.');
    return;
  }

  var Lact = AL * nRound * nRound;       // nH
  document.getElementById('ti-lact').textContent = engFmt(Lact * 1e-9, 'H');

  // Optional flux density
  var V = parseFloat(document.getElementById('ti-v').value);
  var f = parseFloat(document.getElementById('ti-f').value) * 1e6;    // Hz
  var Ae = parseFloat(document.getElementById('ti-ae').value) * 1e-6; // m²
  if (!isNaN(V) && V > 0 && !isNaN(f) && f > 0 && !isNaN(Ae) && Ae > 0) {
    var B = V * Math.SQRT2 / (2 * Math.PI * f * nRound * Ae); // tesla
    document.getElementById('ti-b').textContent = engFmt(B, 'T') + ' (' + engFmt(B * 1e4, 'G') + ')';
  } else {
    document.getElementById('ti-b').textContent = '— (enter V, f, Ae)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
