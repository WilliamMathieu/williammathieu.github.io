/* exported sfCalc, sfStubs */
var sfStubs = null;

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

function sfCalc() {
  clearError();
  var N = parseInt(document.getElementById('sf-n').value, 10);
  var type = document.getElementById('sf-type').value;
  var ripple = parseFloat(document.getElementById('sf-rip').value);
  var Z0 = parseFloat(document.getElementById('sf-z0').value);
  var fc = parseFloat(document.getElementById('sf-fc').value);
  var eps = parseFloat(document.getElementById('sf-eps').value);

  if (!(N >= 1 && N <= 10)) { showError('Order N must be an integer from 1 to 10.'); return; }
  if (type === 'cheby' && !(ripple > 0)) { showError('Chebyshev ripple L_Ar must be a positive number (dB).'); return; }
  if (!(Z0 > 0)) { showError('Z₀ must be positive.'); return; }
  if (isNaN(eps) || eps < 1) { eps = 1; }

  var g = computeG(N, type, ripple);

  // λ/8 physical length at fc
  var haveLen = (fc > 0);
  var len = haveLen ? (3e8 / (fc * 1e9 * Math.sqrt(eps))) / 8 : 0;

  // shunt-first prototype: k odd -> shunt C -> open shunt stub, Z = Z0/gk
  //                         k even -> series L -> series short stub, Z = gk*Z0
  var stubs = [];
  for (var k = 1; k <= N; k++) {
    var shunt = (k % 2 === 1);
    var Z = shunt ? (Z0 / g[k]) : (g[k] * Z0);
    stubs.push({ k: k, shunt: shunt, g: g[k], Z: Z });
  }
  sfStubs = stubs;

  var html = '<table style="border-collapse:collapse;font-size:12.5px;min-width:100%;">';
  html += '<tr style="border-bottom:2px solid #5533aa;color:#5533aa;font-weight:bold;">' +
          '<td style="padding:5px 12px 5px 4px;">k</td>' +
          '<td style="padding:5px 12px 5px 4px;">g<sub>k</sub></td>' +
          '<td style="padding:5px 12px 5px 4px;">Stub</td>' +
          '<td style="padding:5px 4px;">Z<sub>0</sub><sup>stub</sup> (Ω)</td></tr>';
  for (var i = 0; i < stubs.length; i++) {
    var kind = stubs[i].shunt ? 'open-circuit shunt' : 'short-circuit series';
    var col = stubs[i].shunt ? '#0090c0' : '#7a4fd0';
    html += '<tr style="border-bottom:1px solid #e6e0f5;">' +
            '<td style="padding:4px 12px 4px 4px;color:#888;">' + stubs[i].k + '</td>' +
            '<td style="padding:4px 12px 4px 4px;">' + stubs[i].g.toFixed(4) + '</td>' +
            '<td style="padding:4px 12px 4px 4px;color:' + col + ';">' + kind + '</td>' +
            '<td style="padding:4px 4px;font-weight:bold;color:' + col + ';">' + stubs[i].Z.toFixed(2) + '</td></tr>';
  }
  html += '</table>';
  html += '<p style="font-size:11px;color:#888;margin:8px 0 0;">All stubs are λ/8 long at f_c' +
          (haveLen ? ' ≈ ' + engFmt(len, 'm') + ' (ε_eff = ' + eps + ').' : '.') +
          ' Series short-circuit stubs are normally removed with Kuroda’s identities to leave shunt stubs on λ/8 connecting lines.</p>';
  document.getElementById('sf-table').innerHTML = html;

  drawDiagram();
}
