/* PCB plated-through-hole via parasitics
 *   L_via = 0.2·h·[ln(4h/d)+1] nH      (h, d in mm; Johnson & Graham)
 *   C_via = 1.41·εr·h / ln(D/d) pF     (antipad clearance)
 *   f_SRF = 1 / (2π·√(L·C))
 */
document.getElementById('via-btn').addEventListener('click', function () {
  var h = parseFloat(document.getElementById('via-h').value);
  var d = parseFloat(document.getElementById('via-d').value);
  var D = parseFloat(document.getElementById('via-D').value);
  var er = parseFloat(document.getElementById('via-er').value);
  document.getElementById('error').textContent = '';
  if ([h, d, D, er].some(isNaN) || h <= 0 || d <= 0 || D <= d) {
    document.getElementById('error').textContent = 'Enter valid values. D must be greater than d.';
    return;
  }
  var L_nH = 0.2 * h * (Math.log(4 * h / d) + 1);
  var C_pF = 1.41 * er * h / Math.log(D / d);
  var SRF = 1 / (2 * Math.PI * Math.sqrt(L_nH * 1e-9 * C_pF * 1e-12)) / 1e9; // GHz
  document.getElementById('via-L').textContent = L_nH.toFixed(3) + ' nH';
  document.getElementById('via-C').textContent = C_pF.toFixed(3) + ' pF';
  document.getElementById('via-srf').textContent = SRF.toFixed(2) + ' GHz';
  if (window.drawDiagram) drawDiagram();
});
