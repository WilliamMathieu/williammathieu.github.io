/* LC Resonant Frequency */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var L = parseFloat(document.getElementById("L").value);
  var C = parseFloat(document.getElementById("C").value);
  var Hu = document.getElementById("H_dropdown").value;
  var Fu = document.getElementById("F_dropdown").value;
  if (isNaN(L) || isNaN(C) || L <= 0 || C <= 0) { showError('Please enter valid positive values for L and C.'); return; }
  clearError();
  var Lmul = {'1':1e-6,'2':1e-9,'3':1e-12}[Hu];
  var Cmul = {'10':1e-6,'20':1e-9,'30':1e-12}[Fu];
  var f = 1 / (2 * Math.PI * Math.sqrt(L * Lmul * C * Cmul));
  document.getElementById("f").textContent = engFmt(f,'Hz');
});

function showError(msg) {
  var el = document.getElementById('error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('error');
  if (el) el.textContent = '';
}
