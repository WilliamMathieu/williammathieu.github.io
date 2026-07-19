/* exported rcaBuild, rcaCalc, rcaLoadExample */
/*
 * RF Cascade Analyzer
 *
 *   Gain:  G_tot(dB) = Σ Gk
 *   NF (Friis 1944):  F_tot = F1 + (F2-1)/G1 + (F3-1)/(G1 G2) + ...
 *   IIP3 (input-referred, linear mW; Razavi RF Microelectronics 2e):
 *       1/IIP3_tot = 1/IIP3_1 + G1/IIP3_2 + G1 G2/IIP3_3 + ...
 *   IIP2 combined with the same power-referred cascade (optional).
 *   MDS = -174 + NF + 10 log10(B_Hz);  SFDR = (2/3)(IIP3 - MDS).
 *   Rules of thumb:  OIP3 = IIP3 + G_tot;  input P1dB ~ IIP3 - 9.6 dB.
 *   (F, G, IIP3 handled as linear power ratios / mW.)
 */

var rcaCount = 3;

function rcaBuild() {
  rcaCount = parseInt(document.getElementById('rca-n').value) || 3;
  if (rcaCount < 1) rcaCount = 1;
  if (rcaCount > 8) rcaCount = 8;
  var h = '<table style="border-collapse:collapse;font-size:12px;margin-bottom:10px;">';
  h += '<tr style="color:#5533aa;font-weight:bold;">' +
       '<td style="padding:2px 8px 2px 0;">Stage</td>' +
       '<td style="padding:2px 6px;">Gain (dB)</td>' +
       '<td style="padding:2px 6px;">NF (dB)</td>' +
       '<td style="padding:2px 6px;">IIP3 (dBm)</td>' +
       '<td style="padding:2px 6px;">IIP2 (dBm) <span style="color:#aaa;font-weight:normal;">opt</span></td></tr>';
  for (var i = 1; i <= rcaCount; i++) {
    h += '<tr>' +
      '<td style="padding:2px 8px 2px 0;font-weight:bold;color:#888;">' + i + '</td>' +
      '<td style="padding:2px 6px;"><input type="text" id="rca-g' + i + '" style="width:64px"></td>' +
      '<td style="padding:2px 6px;"><input type="text" id="rca-f' + i + '" style="width:64px"></td>' +
      '<td style="padding:2px 6px;"><input type="text" id="rca-i3' + i + '" style="width:64px"></td>' +
      '<td style="padding:2px 6px;"><input type="text" id="rca-i2' + i + '" style="width:64px"></td>' +
      '</tr>';
  }
  h += '</table><button class="calc-btn" onclick="rcaCalc()">Calculate</button>';
  document.getElementById('rca-stages').innerHTML = h;
  ['rca-gain', 'rca-nf', 'rca-mds', 'rca-iip3', 'rca-oip3', 'rca-iip2', 'rca-sfdr', 'rca-p1']
    .forEach(function (id) { document.getElementById(id).textContent = '—'; });
  clearError();
}

function rcaCalc() {
  clearError();
  var g = [], f = [], i3 = [], i2 = [], haveI2 = true;
  for (var i = 1; i <= rcaCount; i++) {
    var gv = parseFloat(document.getElementById('rca-g' + i).value);
    var fv = parseFloat(document.getElementById('rca-f' + i).value);
    var av = parseFloat(document.getElementById('rca-i3' + i).value);
    if (isNaN(gv) || isNaN(fv) || isNaN(av)) {
      showError('Please fill Gain, NF and IIP3 for every stage.');
      return;
    }
    if (fv < 0) { showError('Noise figure cannot be negative.'); return; }
    var bv = parseFloat(document.getElementById('rca-i2' + i).value);
    if (isNaN(bv)) haveI2 = false;
    g.push(gv); f.push(fv); i3.push(av); i2.push(bv);
  }

  var Glin = g.map(function (x) { return Math.pow(10, x / 10); });
  var Flin = f.map(function (x) { return Math.pow(10, x / 10); });
  var I3lin = i3.map(function (x) { return Math.pow(10, x / 10); }); // mW

  // Total gain
  var Gtot = 1;
  for (var k = 0; k < rcaCount; k++) Gtot *= Glin[k];
  var GtotdB = 10 * Math.log10(Gtot);

  // Cascaded noise figure (Friis)
  var F = Flin[0], gc = Glin[0];
  for (var j = 1; j < rcaCount; j++) { F += (Flin[j] - 1) / gc; gc *= Glin[j]; }
  var NFtot = 10 * Math.log10(F);

  // Cascaded IIP3 (input-referred)
  var invI3 = 0, cum = 1;
  for (var m = 0; m < rcaCount; m++) { invI3 += cum / I3lin[m]; cum *= Glin[m]; }
  var IIP3 = 10 * Math.log10(1 / invI3);
  var OIP3 = IIP3 + GtotdB;

  document.getElementById('rca-gain').textContent = GtotdB.toFixed(2) + ' dB';
  document.getElementById('rca-nf').textContent = NFtot.toFixed(3) + ' dB';
  document.getElementById('rca-iip3').textContent = IIP3.toFixed(2) + ' dBm';
  document.getElementById('rca-oip3').textContent = OIP3.toFixed(2) + ' dBm';
  document.getElementById('rca-p1').textContent = (IIP3 - 9.6).toFixed(2) + ' dBm';

  // Cascaded IIP2 (optional, power-referred)
  if (haveI2) {
    var I2lin = i2.map(function (x) { return Math.pow(10, x / 10); });
    var invI2 = 0, cum2 = 1;
    for (var p = 0; p < rcaCount; p++) { invI2 += cum2 / I2lin[p]; cum2 *= Glin[p]; }
    document.getElementById('rca-iip2').textContent = (10 * Math.log10(1 / invI2)).toFixed(2) + ' dBm';
  } else {
    document.getElementById('rca-iip2').textContent = '— (enter all IIP2)';
  }

  // Noise floor + SFDR (need bandwidth)
  var B = parseFloat(document.getElementById('rca-bw').value); // MHz
  if (!isNaN(B) && B > 0) {
    var MDS = -174 + NFtot + 10 * Math.log10(B * 1e6);
    var SFDR = (2 / 3) * (IIP3 - MDS);
    document.getElementById('rca-mds').textContent = MDS.toFixed(2) + ' dBm';
    document.getElementById('rca-sfdr').textContent = SFDR.toFixed(2) + ' dB';
  } else {
    document.getElementById('rca-mds').textContent = '— (enter B)';
    document.getElementById('rca-sfdr').textContent = '— (enter B)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

rcaBuild();

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
