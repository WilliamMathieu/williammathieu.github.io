/* exported clCalc, clSections */
var clSections = null;

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }

function computeG(N, type, ripple) {
  var g = new Array(N + 2);
  g[0] = 1;
  var k;
  if (type === 'cheby') {
    var beta = Math.log(1 / Math.tanh(ripple / 17.37));
    var gamma = Math.sinh(beta / (2 * N));
    var a = new Array(N + 1), b = new Array(N + 1);
    for (k = 1; k <= N; k++) {
      a[k] = Math.sin((2 * k - 1) * Math.PI / (2 * N));
      b[k] = gamma * gamma + Math.pow(Math.sin(k * Math.PI / N), 2);
    }
    g[1] = 2 * a[1] / gamma;
    for (k = 2; k <= N; k++) { g[k] = 4 * a[k - 1] * a[k] / (b[k - 1] * g[k - 1]); }
    g[N + 1] = (N % 2 === 0) ? Math.pow(1 / Math.tanh(beta / 4), 2) : 1;
  } else {
    for (k = 1; k <= N; k++) { g[k] = 2 * Math.sin((2 * k - 1) * Math.PI / (2 * N)); }
    g[N + 1] = 1;
  }
  return g;
}

function clCalc() {
  clearError();
  var N = parseInt(document.getElementById('cl-n').value, 10);
  var type = document.getElementById('cl-type').value;
  var ripple = parseFloat(document.getElementById('cl-rip').value);
  var f0 = parseFloat(document.getElementById('cl-f0').value);
  var bwPct = parseFloat(document.getElementById('cl-bw').value);
  var Z0 = parseFloat(document.getElementById('cl-z0').value);

  if (!(N >= 1 && N <= 9)) { showError('Order N must be an integer from 1 to 9.'); return; }
  if (type === 'cheby' && !(ripple > 0)) { showError('Chebyshev ripple L_Ar must be a positive number (dB).'); return; }
  if (!(bwPct > 0 && bwPct < 100)) { showError('Fractional bandwidth Δ must be between 0 and 100 %.'); return; }
  if (!(Z0 > 0)) { showError('Z₀ must be positive.'); return; }

  var g = computeG(N, type, ripple);
  var D = bwPct / 100;

  var sec = [];
  for (var n = 1; n <= N + 1; n++) {
    var JY;
    if (n === 1) {
      JY = Math.sqrt(Math.PI * D / (2 * g[1]));
    } else if (n === N + 1) {
      JY = Math.sqrt(Math.PI * D / (2 * g[N] * g[N + 1]));
    } else {
      JY = (Math.PI * D / 2) / Math.sqrt(g[n - 1] * g[n]);
    }
    var Z0e = Z0 * (1 + JY + JY * JY);
    var Z0o = Z0 * (1 - JY + JY * JY);
    sec.push({ n: n, JY: JY, Z0e: Z0e, Z0o: Z0o });
  }
  clSections = sec;

  var lam4 = (f0 > 0) ? (3e8 / (f0 * 1e9)) / 4 : 0; // quarter-wave in free space (informational)

  var html = '<table style="border-collapse:collapse;font-size:12.5px;min-width:100%;">';
  html += '<tr style="border-bottom:2px solid #5533aa;color:#5533aa;font-weight:bold;">' +
          '<td style="padding:5px 12px 5px 4px;">Section</td>' +
          '<td style="padding:5px 12px 5px 4px;">J<sub>n</sub>/Y₀</td>' +
          '<td style="padding:5px 12px 5px 4px;">Z<sub>0e</sub> (Ω)</td>' +
          '<td style="padding:5px 4px;">Z<sub>0o</sub> (Ω)</td></tr>';
  for (var i = 0; i < sec.length; i++) {
    html += '<tr style="border-bottom:1px solid #e6e0f5;">' +
            '<td style="padding:4px 12px 4px 4px;color:#888;">' + sec[i].n + '</td>' +
            '<td style="padding:4px 12px 4px 4px;">' + sec[i].JY.toFixed(4) + '</td>' +
            '<td style="padding:4px 12px 4px 4px;font-weight:bold;color:#AA77FF;">' + sec[i].Z0e.toFixed(2) + '</td>' +
            '<td style="padding:4px 4px;font-weight:bold;color:#0090c0;">' + sec[i].Z0o.toFixed(2) + '</td></tr>';
  }
  html += '</table>';
  html += '<p style="font-size:11px;color:#888;margin:8px 0 0;">' + (N + 1) + ' coupled sections, each λ/4 long at f₀' +
          (lam4 ? ' (≈ ' + (lam4 * 1000).toFixed(1) + ' mm in free space; divide by √ε_eff for the substrate).' : '.') + '</p>';
  document.getElementById('cl-table').innerHTML = html;

  drawDiagram();
}
