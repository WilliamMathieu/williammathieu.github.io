/* Capacitance in LC */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var f = parseFloat(document.getElementById("f").value);
  var L = parseFloat(document.getElementById("L").value);
  var fu = document.getElementById("f_dropdown").value;
  var Lu = document.getElementById("L_dropdown").value;
  if (isNaN(f) || isNaN(L) || f <= 0 || L <= 0) { showError('Please enter valid positive values.'); return; }
  clearError();
  var fmul = {'0':1e3,'1':1e6,'2':1e9,'3':1e12}[fu];
  var Lmul = {'10':1e-6,'20':1e-9,'30':1e-12}[Lu];
  var fHz = f * fmul;
  var Lval = L * Lmul;
  var C = 1 / (4 * Math.PI * Math.PI * fHz * fHz * Lval);
  document.getElementById("C").textContent = engFmt(C,'F');
  if(window.drawDiagram) window.drawDiagram();
});

function showError(msg) {
  var el = document.getElementById('error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('error');
  if (el) el.textContent = '';
}
