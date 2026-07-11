/*
 * First-Order RC / RL Filter — low-pass & high-pass
 *
 *   RC:  f_c = 1 / (2π·R·C),   τ = R·C
 *   RL:  f_c = R / (2π·L),     τ = L / R
 *   Roll-off = 20 dB/decade (6 dB/octave);  |H(f_c)| = −3.01 dB
 *
 *   Topology (series element → shunt element, output across the shunt):
 *     RC low-pass : series R, shunt C     RC high-pass: series C, shunt R
 *     RL low-pass : series L, shunt R      RL high-pass: series R, shunt L
 */

/* exported rcTopo */
function rcTopo() {
  var topo = document.getElementById('rc-topo').value;
  document.getElementById('rc-row-C').style.display = topo === 'RC' ? '' : 'none';
  document.getElementById('rc-row-L').style.display = topo === 'RL' ? '' : 'none';
}

document.getElementById('rc-btn').addEventListener('click', function() {
  var type = document.getElementById('rc-type').value;   // lp | hp
  var topo = document.getElementById('rc-topo').value;   // RC | RL
  var R = parseFloat(document.getElementById('rc-R').value) * parseFloat(document.getElementById('rc-Ru').value);
  clearError();
  if (isNaN(R) || R <= 0) { showError('Enter a valid positive resistance R.'); return; }

  var fc, tau;
  if (topo === 'RC') {
    var C = parseFloat(document.getElementById('rc-C').value) * parseFloat(document.getElementById('rc-Cu').value);
    if (isNaN(C) || C <= 0) { showError('Enter a valid positive capacitance C.'); return; }
    fc = 1 / (2 * Math.PI * R * C);
    tau = R * C;
  } else {
    var L = parseFloat(document.getElementById('rc-L').value) * parseFloat(document.getElementById('rc-Lu').value);
    if (isNaN(L) || L <= 0) { showError('Enter a valid positive inductance L.'); return; }
    fc = R / (2 * Math.PI * L);
    tau = L / R;
  }
  var wc = 2 * Math.PI * fc;

  document.getElementById('rc-fc').textContent   = engFmt(fc, 'Hz');
  document.getElementById('rc-wc').textContent   = engFmt(wc, 'rad/s');
  document.getElementById('rc-tau').textContent  = engFmt(tau, 's');
  document.getElementById('rc-slope').textContent = '20 dB/decade (' + (type === 'lp' ? 'above' : 'below') + ' f_c)';
  document.getElementById('rc-atten').textContent = '−3.01 dB at f_c';
  var names = { lp: 'low-pass', hp: 'high-pass' };
  document.getElementById('rc-desc').textContent = topo + ' ' + names[type];

  if (window.drawDiagram) window.drawDiagram();
});

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
