/* Bond wire parasitic inductance — Grover formula
 *   L_wire = 0.2·ℓ·[ln(4ℓ/d) − 0.75] nH   (ℓ, d in mm; 4ℓ/d = 2ℓ/r)
 */
document.getElementById('bw-btn').addEventListener('click', function () {
  var l = parseFloat(document.getElementById('bw-l').value);
  var d = parseFloat(document.getElementById('bw-d').value);
  var h = parseFloat(document.getElementById('bw-h').value);
  document.getElementById('error').textContent = '';
  if ([l, d, h].some(isNaN) || l <= 0 || d <= 0) {
    document.getElementById('error').textContent = 'Enter valid positive values.';
    return;
  }
  var L_nH = 0.2 * l * (Math.log(4 * l / d) - 0.75);
  var X1 = 2 * Math.PI * 1e9 * L_nH * 1e-9;
  var X10 = 2 * Math.PI * 10e9 * L_nH * 1e-9;
  document.getElementById('bw-L').textContent = L_nH.toFixed(3) + ' nH';
  document.getElementById('bw-X').textContent = X1.toFixed(1) + ' Ω (1 GHz)';
  document.getElementById('bw-X10').textContent = X10.toFixed(1) + ' Ω (10 GHz)';
  if (window.drawDiagram) drawDiagram();
});
