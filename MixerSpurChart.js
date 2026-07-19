/* exported msCalc */
/*
 * Mixer Spur Chart — spurious-response frequencies
 *
 *   A mixer converts an input f_in to the IF whenever
 *       | m·f_LO ± n·f_in | = f_IF     (m, n = 1, 2, 3 ...)
 *   Solving for the input gives the spurious-response frequencies
 *       f_in = ( m·f_LO ± f_IF ) / n
 *   The wanted response is (m,n) = (1,1); every other pair is a spur.
 *   f_IF   = |f_LO - f_RF|
 *   image  = f_LO + f_IF   (the (1,1,+) response = 2·f_LO - f_RF)
 *   half-IF response = f_LO ± f_IF/2   (the (2,2) pair)
 *   A spur is "critical" when its input falls inside the RF preselector
 *   passband f_RF ± BW/2, where the front-end filter cannot reject it.
 *   Ref: Maas, Microwave Mixers 2e, 1993.
 */

function msCalc() {
  clearError();
  var fRF = parseFloat(document.getElementById('ms-rf').value);
  var fLO = parseFloat(document.getElementById('ms-lo').value);
  var BW = parseFloat(document.getElementById('ms-bw').value);
  var K = parseInt(document.getElementById('ms-k').value);
  if (isNaN(K)) K = 6;

  if (isNaN(fRF) || isNaN(fLO) || fRF <= 0 || fLO <= 0) {
    showError('Enter positive RF and LO frequencies.');
    return;
  }
  if (K < 2) K = 2;
  if (K > 9) K = 9;
  var haveBW = !isNaN(BW) && BW > 0;

  var IF = Math.abs(fLO - fRF);
  if (IF === 0) { showError('LO and RF are equal — the IF is zero.'); return; }
  var image = fLO + IF;
  var halfLo = fLO - IF / 2, halfHi = fLO + IF / 2;

  document.getElementById('ms-if').textContent = engFmt(IF * 1e6, 'Hz');
  document.getElementById('ms-image').textContent = engFmt(image * 1e6, 'Hz');
  document.getElementById('ms-half').textContent =
    engFmt(halfLo * 1e6, 'Hz') + ' / ' + engFmt(halfHi * 1e6, 'Hz');

  // Spurious-response input frequencies:  f_in = (m·fLO ± fIF)/n
  var rows = [], critical = 0;
  for (var m = 1; m <= K; m++) {
    for (var n = 1; n <= K; n++) {
      if (m + n > K) continue;
      var signs = [-1, 1];
      for (var si = 0; si < signs.length; si++) {
        var s = signs[si];
        var fin = (m * fLO + s * IF) / n;
        if (fin <= 0) continue;
        var isWanted = (m === 1 && n === 1 && s < 0);
        var inBand = !isWanted && haveBW && Math.abs(fin - fRF) <= BW / 2 + 1e-9;
        if (inBand) critical++;
        rows.push({ m: m, n: n, s: s, fin: fin, order: m + n, inBand: inBand });
      }
    }
  }

  rows.sort(function (a, b) { return a.fin - b.fin; });

  document.getElementById('ms-count').textContent =
    (rows.length - 1) + (haveBW ? '  (' + critical + ' in preselector)' : '');

  var html = '<table style="border-collapse:collapse;font-size:12px;width:100%;min-width:460px;">' +
    '<tr style="color:#5533aa;font-weight:bold;border-bottom:1.5px solid #d9cff2;">' +
    '<td style="padding:4px 8px;">Response</td>' +
    '<td style="padding:4px 8px;">Order</td>' +
    '<td style="padding:4px 8px;">Input frequency</td>' +
    '<td style="padding:4px 8px;">Note</td></tr>';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var lbl = r.m + '·LO ' + (r.s < 0 ? '−' : '+') + ' ' + r.n + '·f<sub>in</sub> = IF';
    var wanted = (r.m === 1 && r.n === 1 && r.s < 0);
    var isImage = (r.m === 1 && r.n === 1 && r.s > 0);
    var isHalf = (r.m === 2 && r.n === 2);
    var note = wanted ? 'wanted (1×1)' : isImage ? 'image' : isHalf ? 'half-IF (2×2)' : '';
    if (r.inBand && !wanted) note = (note ? note + ', ' : '') + 'in preselector!';
    var bg = wanted ? 'background:#e7f7ec;' : (r.inBand ? 'background:#fdeaea;' : (r.order <= 3 ? 'background:#fbf6ff;' : ''));
    var col = wanted ? '#1e7a3d' : (r.inBand ? '#c0392b' : '#888');
    html += '<tr style="border-bottom:1px solid #eee;' + bg + '">' +
      '<td style="padding:4px 8px;font-family:monospace;color:#5533aa;">' + lbl + '</td>' +
      '<td style="padding:4px 8px;">' + r.order + '</td>' +
      '<td style="padding:4px 8px;font-weight:bold;">' + engFmt(r.fin * 1e6, 'Hz') + '</td>' +
      '<td style="padding:4px 8px;color:' + col + ';font-weight:' + (note ? 'bold' : 'normal') + ';">' + note + '</td>' +
      '</tr>';
  }
  html += '</table>';
  document.getElementById('ms-table').innerHTML = html;

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
