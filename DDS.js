/* Direct digital synthesizer (DDS) output frequency
 *
 *   f_out = (M / 2^N) * f_clk       resolution df = f_clk / 2^N
 *   M     = round( f_target / f_clk * 2^N )
 *   Practical maximum output is ~40% of f_clk (image/filter limited).
 *
 *   References: ADI MT-085; Vankka & Halonen, Direct Digital Synthesizers.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var fclk = parseFloat(document.getElementById("fclk").value); // MHz
  var bits = parseFloat(document.getElementById("bits").value);
  var ftar = parseFloat(document.getElementById("ftar").value); // MHz
  clearError();

  if (isNaN(fclk) || isNaN(bits) || isNaN(ftar) || fclk <= 0 || bits <= 0 || ftar < 0) {
    showError('Please enter a positive clock, accumulator width and target frequency.');
    return;
  }
  if (bits > 53) { showError('Accumulator width above 53 bits exceeds exact double precision; results are approximate.'); }

  var twoN = Math.pow(2, bits);
  var fclkHz = fclk * 1e6;
  var df = fclkHz / twoN;                         // Hz per LSB
  var M = Math.round(ftar * 1e6 / fclkHz * twoN); // tuning word
  if (M < 0) M = 0;
  if (M > twoN - 1) M = twoN - 1;                 // clamp to accumulator range
  var fout = M / twoN * fclkHz;                   // Hz

  document.getElementById("M").textContent    = M.toLocaleString('en-US');
  document.getElementById("fout").textContent = (fout / 1e6).toFixed(6) + ' MHz';
  document.getElementById("ferr").textContent = engFmt(fout - ftar * 1e6, 'Hz');
  document.getElementById("res").textContent  = engFmt(df, 'Hz');
  document.getElementById("max").textContent  = (0.4 * fclk).toFixed(2) + ' MHz';

  if (ftar > fclk / 2) {
    showError('Target exceeds the Nyquist limit (f_clk/2); the output will alias.');
  } else if (ftar > 0.4 * fclk) {
    showError('Target is above ~40% of f_clk; anti-alias filtering becomes difficult.');
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
