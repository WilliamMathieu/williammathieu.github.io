/* Spread-spectrum processing gain and jamming margin
 *
 *   Processing gain:  Gp = 10*log10(R_chip / R_data)
 *   Jamming margin:   Mj = Gp - (Eb/N0)_req - L_sys
 *
 *   References: Peterson, Ziemer & Borth, Introduction to Spread Spectrum
 *   Communications; Sklar, Digital Communications 2e.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var rchip = parseFloat(document.getElementById("rchip").value);
  var rdata = parseFloat(document.getElementById("rdata").value);
  var ebn0  = parseFloat(document.getElementById("ebn0").value); // optional
  var lsys  = parseFloat(document.getElementById("lsys").value); // optional
  clearError();

  if (isNaN(rchip) || isNaN(rdata) || rchip <= 0 || rdata <= 0) {
    showError('Please enter positive chip and data rates.');
    return;
  }
  if (rchip < rdata) {
    showError('Chip rate should exceed the data rate for spreading.');
  }

  var gp = 10 * Math.log10(rchip / rdata);
  document.getElementById("gp").textContent = gp.toFixed(2) + ' dB';
  document.getElementById("sf").textContent = (rchip / rdata).toFixed(0) + '×';

  if (!isNaN(ebn0)) {
    var L = isNaN(lsys) ? 0 : lsys;
    var mj = gp - ebn0 - L;
    document.getElementById("mj").textContent = mj.toFixed(2) + ' dB';
  } else {
    document.getElementById("mj").textContent = '— (enter Eb/N0)';
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
