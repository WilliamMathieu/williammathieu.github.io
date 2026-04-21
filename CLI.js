/* Circular Loop Inductance */
var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var d = parseFloat(document.getElementById("d").value);
  var D = parseFloat(document.getElementById("D").value);
  if (isNaN(d) || isNaN(D) || d <= 0 || D <= 0) { showError('Please enter valid positive values for d and D.'); return; }
  if (d >= D) { showError('Wire diameter d must be smaller than loop diameter D.'); return; }
  clearError();
  var dSI = d * 1e-3, DSI = D * 1e-3;
  var L = 1.25663706e-6 * (DSI/2) * (Math.log(8*DSI/dSI) - 2);
  document.getElementById("L").textContent = engFmt(L,'H');
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
