/* Bandpass (undersampling) Nyquist-zone planner
 *
 *   zone n   = floor(fc / (fs/2)) + 1        (even zones invert the spectrum)
 *   f_IF     = |fc - fs*round(fc/fs)|        (alias in the 1st Nyquist zone)
 *   fs_min   = 2B                            (theoretical minimum)
 *   folding-free if floor(fL/(fs/2)) == floor(fH/(fs/2))
 *
 *   References: Vaughan, Scott & White, IEEE TSP 1991; ADI MT-002.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var fc = parseFloat(document.getElementById("fc").value); // MHz
  var B  = parseFloat(document.getElementById("B").value);  // MHz
  var fs = parseFloat(document.getElementById("fs").value); // MHz
  clearError();

  if (isNaN(fc) || isNaN(B) || isNaN(fs) || fc <= 0 || B <= 0 || fs <= 0) {
    showError('Please enter positive centre frequency, bandwidth and sample rate.');
    return;
  }
  var fL = fc - B / 2, fH = fc + B / 2;
  if (fL <= 0) { showError('Bandwidth is too wide for this centre frequency (fc − B/2 ≤ 0).'); return; }

  var half = fs / 2;
  var zone = Math.floor(fc / half) + 1;
  var inverted = (zone % 2 === 0);
  var IF = Math.abs(fc - fs * Math.round(fc / fs));
  var valid = (Math.floor(fL / half) === Math.floor(fH / half));

  document.getElementById("zone").textContent  = zone + (inverted ? ' (even)' : ' (odd)');
  document.getElementById("if").textContent    = IF.toFixed(3) + ' MHz';
  document.getElementById("inv").textContent   = inverted ? 'yes — spectrum reversed' : 'no';
  document.getElementById("valid").textContent = valid ? 'yes ✓' : 'no — band folds across a zone edge';
  document.getElementById("minfs").textContent = (2 * B).toFixed(3) + ' MHz';

  if (fs < 2 * B) {
    showError('Sample rate is below 2·B; the band cannot be captured without aliasing.');
  } else if (!valid) {
    showError('The band straddles a Nyquist-zone boundary (k·fs/2) and will fold — adjust fs.');
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
