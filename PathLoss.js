/* RF path-loss models
 *
 *   Free space:  L_FS = 20log10(d_km) + 20log10(f_MHz) + 32.44
 *   Two-ray:     d_break = 4*ht*hr/lambda; beyond it,
 *                L = 40log10(d_m) - 20log10(ht*hr)   (free space below break)
 *   Okumura-Hata (150-1500 MHz) / COST-231 (1500-2000 MHz), medium-city a(hm):
 *     a(hm) = (1.1*log10 f - 0.7)*hm - (1.56*log10 f - 0.8)
 *     L_Hata     = 69.55 + 26.16 log10 f - 13.82 log10 hb - a + (44.9 - 6.55 log10 hb) log10 d
 *     L_COST231  = 46.3  + 33.9  log10 f - 13.82 log10 hb - a + (44.9 - 6.55 log10 hb) log10 d + Cm
 *     suburban:  - 2*(log10(f/28))^2 - 5.4        rural: - 4.78*(log10 f)^2 + 18.33 log10 f - 40.94
 *
 *   References: Hata 1980; COST 231 final report 1999; Rappaport, Wireless Communications 2e.
 */
var C_LIGHT = 299792458; // m/s

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var f  = parseFloat(document.getElementById("f").value);  // MHz
  var d  = parseFloat(document.getElementById("d").value);  // km
  var ht = parseFloat(document.getElementById("ht").value); // m (base)
  var hr = parseFloat(document.getElementById("hr").value); // m (mobile)
  var env = document.getElementById("env").value;
  clearError();

  if (isNaN(f) || isNaN(d) || f <= 0 || d <= 0) {
    showError('Please enter a positive frequency and distance.');
    return;
  }
  var needHeights = (env === 'tworay' || env === 'urban' || env === 'suburban' || env === 'rural');
  if (needHeights && (isNaN(ht) || isNaN(hr) || ht <= 0 || hr <= 0)) {
    showError('This model needs positive TX/base and RX/mobile heights.');
    return;
  }

  var lf = Math.log10(f);
  var fspl = 20 * Math.log10(d) + 20 * lf + 32.44;
  document.getElementById("fspl").textContent = fspl.toFixed(2) + ' dB';

  var pl, name = 'Free space', bpTxt = '—';
  var notes = [];

  if (env === 'freespace') {
    pl = fspl;
  } else if (env === 'tworay') {
    var lambda = C_LIGHT / (f * 1e6);
    var dbreak = 4 * ht * hr / lambda;           // m
    var dm = d * 1000;                            // m
    if (dm <= dbreak) {
      pl = fspl; name = 'Two-ray (below break — free space)';
    } else {
      pl = 40 * Math.log10(dm) - 20 * Math.log10(ht * hr);
      name = 'Two-ray ground';
    }
    bpTxt = (dbreak / 1000).toFixed(3) + ' km';
  } else {
    // Hata / COST-231 empirical
    var a = (1.1 * lf - 0.7) * hr - (1.56 * lf - 0.8);
    var slope = (44.9 - 6.55 * Math.log10(ht)) * Math.log10(d);
    var base, cost = (f > 1500);
    if (cost) {
      base = 46.3 + 33.9 * lf - 13.82 * Math.log10(ht) - a + slope;
      name = 'COST-231 Hata';
    } else {
      base = 69.55 + 26.16 * lf - 13.82 * Math.log10(ht) - a + slope;
      name = 'Okumura-Hata';
    }
    if (env === 'urban') {
      pl = base + (cost ? 3 : 0); // COST-231 metropolitan correction Cm = 3 dB
      name += ' (urban)';
    } else if (env === 'suburban') {
      pl = base - 2 * Math.pow(Math.log10(f / 28), 2) - 5.4;
      name += ' (suburban)';
    } else { // rural / open
      pl = base - 4.78 * lf * lf + 18.33 * lf - 40.94;
      name += ' (rural)';
      if (cost) notes.push('COST-231 has no rural model; Hata open-area correction applied.');
    }
    if (f < 150 || f > 2000) notes.push('frequency outside 150–2000 MHz model range');
    if (d < 1 || d > 20) notes.push('distance outside the typical 1–20 km range');
  }

  document.getElementById("model").textContent = pl.toFixed(2) + ' dB';
  document.getElementById("mname").textContent = name;
  document.getElementById("bp").textContent    = bpTxt;
  if (notes.length) showError('Note: ' + notes.join('; ') + '.');

  if (window.drawDiagram) window.drawDiagram();
});

function showError(msg) {
  var el = document.getElementById('error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('error');
  if (el) el.textContent = '';
}
