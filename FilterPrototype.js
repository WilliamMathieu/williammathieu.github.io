/* exported fpCalc, fpG */
var fpG = null;

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
    for (k = 2; k <= N; k++) {
      g[k] = 4 * a[k - 1] * a[k] / (b[k - 1] * g[k - 1]);
    }
    if (N % 2 === 0) {
      g[N + 1] = Math.pow(1 / Math.tanh(beta / 4), 2);
    } else {
      g[N + 1] = 1;
    }
  } else {
    for (k = 1; k <= N; k++) {
      g[k] = 2 * Math.sin((2 * k - 1) * Math.PI / (2 * N));
    }
    g[N + 1] = 1;
  }
  return g;
}

function fpCalc() {
  clearError();
  var N = parseInt(document.getElementById('fp-n').value, 10);
  var type = document.getElementById('fp-type').value;
  var ripple = parseFloat(document.getElementById('fp-rip').value);
  var Z0 = parseFloat(document.getElementById('fp-z0').value);
  var fc = parseFloat(document.getElementById('fp-fc').value);

  if (!(N >= 1 && N <= 10)) { showError('Order N must be an integer from 1 to 10.'); return; }
  if (type === 'cheby' && !(ripple > 0)) { showError('Chebyshev ripple L_Ar must be a positive number (dB).'); return; }

  var g = computeG(N, type, ripple);
  fpG = g;

  var haveScale = (Z0 > 0 && fc > 0);
  var wc = haveScale ? 2 * Math.PI * fc * 1e9 : 0;

  var html = '<table class="fp-tbl" style="border-collapse:collapse;font-size:12.5px;min-width:100%;">';
  html += '<tr style="border-bottom:2px solid #5533aa;color:#5533aa;font-weight:bold;">' +
          '<td style="padding:5px 12px 5px 4px;">k</td>' +
          '<td style="padding:5px 12px 5px 4px;">g<sub>k</sub></td>' +
          '<td style="padding:5px 12px 5px 4px;">Element</td>' +
          '<td style="padding:5px 4px;">Value' + (haveScale ? '' : ' (set Z₀ &amp; f_c)') + '</td></tr>';

  for (var k = 0; k <= N + 1; k++) {
    var role, val = '';
    if (k === 0) {
      role = 'g₀ (source)';
    } else if (k === N + 1) {
      role = 'g<sub>' + k + '</sub> (load)';
      if (haveScale) {
        // load termination: resistance (shunt-first ladder ends on a resistor)
        val = engFmt(g[k] * Z0, 'Ω');
      }
    } else {
      // ladder: k odd -> shunt C, k even -> series L (shunt-first prototype)
      if (k % 2 === 1) {
        role = 'shunt C<sub>' + k + '</sub>';
        if (haveScale) { val = engFmt(g[k] / (Z0 * wc), 'F'); }
      } else {
        role = 'series L<sub>' + k + '</sub>';
        if (haveScale) { val = engFmt(g[k] * Z0 / wc, 'H'); }
      }
    }
    var bg = (k === 0 || k === N + 1) ? 'background:#f3f0ff;' : '';
    html += '<tr style="border-bottom:1px solid #e6e0f5;' + bg + '">' +
            '<td style="padding:4px 12px 4px 4px;color:#888;">' + k + '</td>' +
            '<td style="padding:4px 12px 4px 4px;font-weight:bold;">' + g[k].toFixed(4) + '</td>' +
            '<td style="padding:4px 12px 4px 4px;">' + role + '</td>' +
            '<td style="padding:4px 4px;color:#5533aa;">' + val + '</td></tr>';
  }
  html += '</table>';
  if (!haveScale) {
    html += '<p style="font-size:11px;color:#888;margin:8px 0 0;">Enter Z₀ and f_c to denormalise the g-values into real L/C.</p>';
  }
  document.getElementById('fp-table').innerHTML = html;

  drawDiagram();
}
