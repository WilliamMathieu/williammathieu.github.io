/* LNA noise figure vs source reflection, from the four noise parameters
 *
 *   F = Fmin + (4 * Rn/Z0 * |Gs - Gopt|^2) / ((1 - |Gs|^2) * |1 + Gopt|^2)
 *   Fmin entered in dB; Gopt and Gs entered as magnitude + angle (degrees).
 *
 *   References: Pozar, Microwave Engineering 4e; Gonzalez, Microwave
 *   Transistor Amplifiers 2e.
 */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var fminDb = parseFloat(document.getElementById("fmin").value);
  var Rn  = parseFloat(document.getElementById("rn").value);
  var gom = parseFloat(document.getElementById("gom").value);
  var goa = parseFloat(document.getElementById("goa").value);
  var gsm = parseFloat(document.getElementById("gsm").value);
  var gsa = parseFloat(document.getElementById("gsa").value);
  var z0  = parseFloat(document.getElementById("z0").value);
  clearError();

  if (isNaN(fminDb) || isNaN(Rn) || isNaN(gom) || isNaN(goa) || isNaN(gsm) || isNaN(gsa) || Rn < 0) {
    showError('Please enter Fmin, Rn, and both reflection coefficients (magnitude and angle).');
    return;
  }
  if (gsm >= 1 || gom > 1 || gsm < 0 || gom < 0) {
    showError('Reflection magnitudes must be between 0 and 1 (|Γs| < 1).');
    return;
  }
  var Z0 = (!isNaN(z0) && z0 > 0) ? z0 : 50;

  var gor = gom * Math.cos(goa * Math.PI / 180), goi = gom * Math.sin(goa * Math.PI / 180);
  var gsr = gsm * Math.cos(gsa * Math.PI / 180), gsi = gsm * Math.sin(gsa * Math.PI / 180);

  var dr = gsr - gor, di = gsi - goi;
  var distSq = dr * dr + di * di;                 // |Gs - Gopt|^2
  var opr = 1 + gor, opi = goi;
  var denom = (1 - gsm * gsm) * (opr * opr + opi * opi);

  var Fmin = Math.pow(10, fminDb / 10);
  var F = Fmin + (4 * Rn / Z0) * distSq / denom;
  var NF = 10 * Math.log10(F);

  document.getElementById("nf").textContent   = NF.toFixed(3) + ' dB';
  document.getElementById("f").textContent    = F.toFixed(4);
  document.getElementById("pen").textContent  = (NF - fminDb).toFixed(3) + ' dB';
  document.getElementById("dist").textContent = Math.sqrt(distSq).toFixed(4);

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
