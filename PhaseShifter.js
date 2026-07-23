/* Digital phase-shifter resolution
 *
 *   LSB    = 360 / 2^N          states = 2^N
 *   sigma  = LSB / sqrt(12)     (RMS quantization error, uniform rounding)
 *   nearest state for a target phase = round(target/LSB) * LSB
 *
 *   References: R. C. Hansen, Phased Array Antennas 2e; Mailloux, Phased Array
 *   Antenna Handbook 3e.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var bits   = parseFloat(document.getElementById("bits").value);
  var target = parseFloat(document.getElementById("target").value); // optional
  clearError();

  if (isNaN(bits) || bits <= 0 || bits !== Math.round(bits)) {
    showError('Please enter a whole number of bits (e.g. 3–6).');
    return;
  }

  var states = Math.pow(2, bits);
  var lsb = 360 / states;
  var sigma = lsb / Math.sqrt(12);

  document.getElementById("lsb").textContent    = lsb.toFixed(4) + '°';
  document.getElementById("states").textContent = states.toLocaleString('en-US');
  document.getElementById("rms").textContent    = sigma.toFixed(4) + '°';

  if (!isNaN(target)) {
    var near = Math.round(target / lsb) * lsb;
    var err = near - target;
    document.getElementById("near").textContent = ((near % 360 + 360) % 360).toFixed(4) + '°';
    document.getElementById("terr").textContent = (err >= 0 ? '+' : '') + err.toFixed(4) + '°';
  } else {
    document.getElementById("near").textContent = '— (enter target)';
    document.getElementById("terr").textContent = '—';
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
