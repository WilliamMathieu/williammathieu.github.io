/* RF Coil Designer */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var d = parseFloat(document.getElementById("d").value);
  var D = parseFloat(document.getElementById("D").value);
  var f = parseFloat(document.getElementById("f").value);
  var fu = document.getElementById("f_dropdown").value;
  if (isNaN(d) || isNaN(D) || d <= 0 || D <= 0) { showError('Please enter valid values for wire diameter d and loop diameter D.'); return; }
  if (d >= D) { showError('Wire diameter d must be smaller than loop diameter D.'); return; }
  if (isNaN(f) || f <= 0) { showError('Please enter a valid Larmor frequency.'); return; }
  clearError();
  var dSI = d*1e-3, DSI = D*1e-3;
  var L = 1.25663706e-6 * (DSI/2) * (Math.log(8*DSI/dSI) - 2);
  var fmul = {'0':1e3,'1':1e6,'2':1e9,'3':1e12}[fu];
  var fHz = f * fmul;
  var C = 1 / (4 * Math.PI * Math.PI * fHz * fHz * L);
  document.getElementById("L").textContent = engFmt(L,'H');
  document.getElementById("C").textContent = engFmt(C,'F');
});

function showError(msg) {
  var el = document.getElementById('error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('error');
  if (el) el.textContent = '';
}
