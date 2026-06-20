/* Circular Waveguide Calculator — Pozar §3.4
 *
 *   TE modes: kc = x'_mn/a  (x'_mn = n-th root of J'_m(x) = 0)
 *   TM modes: kc = x_mn/a   (x_mn  = n-th root of J_m(x)  = 0)
 *   fc = kc · c / (2π√εr)
 *   β  = √(k² − kc²);  k = k₀√εr
 *   λg = 2π/β;  Z_TE11 = ωμ₀/β
 *   vph = ω/β;  vgr = β·c²/(ω·εr)
 *   αc(TE_mn) = Rs/(a·η·√(1−(fc/f)²)) · [(fc/f)² + m²/(x'²_mn − m²)]   [Np/m]
 *   αc(TM_mn) = Rs/(a·η·√(1−(fc/f)²))                                     [Np/m]
 *   αd = k²·tanδ/(2β)  [Np/m]
 *   TE₀₁: αc decreases monotonically with frequency (m = 0 → no m²/… term).
 */

/* exported cwg_calc */

var C0 = 2.998e8;
var MU0_CWG = 4 * Math.PI * 1e-7;
var ETA0_CWG = 376.73;

/* Tabulated Bessel zeros.
 * TE: roots of J'_m(x) = 0  (x'_mn)
 * TM: roots of J_m(x)  = 0  (x_mn)
 * m = azimuthal index, p = radial order.
 */
var CWG_TE_ZEROS = [
  {m:1,p:1,x:1.8412}, // dominant TE₁₁
  {m:2,p:1,x:3.0542},
  {m:0,p:1,x:3.8317}, // TE₀₁ — loss decreases with f
  {m:3,p:1,x:4.2012},
  {m:4,p:1,x:5.3175},
  {m:1,p:2,x:5.3314},
  {m:5,p:1,x:6.4156},
  {m:2,p:2,x:6.7061},
  {m:0,p:2,x:7.0156},
  {m:6,p:1,x:7.5883},
  {m:3,p:2,x:8.0152},
];
var CWG_TM_ZEROS = [
  {m:0,p:1,x:2.4048},
  {m:1,p:1,x:3.8317},
  {m:2,p:1,x:5.1356},
  {m:0,p:2,x:5.5201},
  {m:3,p:1,x:6.3802},
  {m:1,p:2,x:7.0156},
  {m:4,p:1,x:7.5883},
  {m:2,p:2,x:8.4172},
  {m:0,p:3,x:8.6537},
];

document.getElementById('cwg-btn').addEventListener('click', cwg_calc);

function cwg_calc() {
  cwgClearError();

  var av   = parseFloat(document.getElementById('cwg-a').value);
  var amul = parseFloat(document.getElementById('cwg-a-unit').value);
  var fv   = parseFloat(document.getElementById('cwg-f').value);
  var fmul = parseFloat(document.getElementById('cwg-f-unit').value);
  var er   = parseFloat(document.getElementById('cwg-er').value) || 1;
  var tanD = parseFloat(document.getElementById('cwg-tanD').value) || 0;
  var sig  = parseFloat(document.getElementById('cwg-sigma').value) || 5.8e7;

  if (!(av > 0)) { cwgShowError('Enter a valid inner radius a.'); return; }
  if (!(fv > 0)) { cwgShowError('Enter a valid operating frequency.'); return; }

  var a = av * amul;
  var f = fv * fmul;
  var w = 2 * Math.PI * f;
  var k0 = w / C0;
  var km = k0 * Math.sqrt(er);
  var eta = ETA0_CWG / Math.sqrt(er);
  var Rs = Math.sqrt(Math.PI * f * MU0_CWG / sig);

  // Build and sort mode list
  var modes = [];
  CWG_TE_ZEROS.forEach(function(z) {
    var kc = z.x / a;
    var fc = kc * C0 / (2 * Math.PI * Math.sqrt(er));
    modes.push({type:'TE', m:z.m, p:z.p, x:z.x, kc:kc, fc:fc});
  });
  CWG_TM_ZEROS.forEach(function(z) {
    var kc = z.x / a;
    var fc = kc * C0 / (2 * Math.PI * Math.sqrt(er));
    modes.push({type:'TM', m:z.m, p:z.p, x:z.x, kc:kc, fc:fc});
  });
  modes.sort(function(a, b) { return a.fc - b.fc; });

  var te11 = modes.filter(function(md) {
    return md.type === 'TE' && md.m === 1 && md.p === 1;
  })[0];

  var res = {a:a, f:f, er:er, modes:modes, te11:te11, Rs:Rs, eta:eta, km:km};

  if (f > te11.fc) {
    var kc11 = te11.kc;
    var beta = Math.sqrt(km*km - kc11*kc11);
    var lambda_g = 2 * Math.PI / beta;
    var Zw = w * MU0_CWG / beta;
    var vph = w / beta;
    var vgr = beta * C0 * C0 / (w * er);

    // Conductor loss for TE₁₁ (Pozar §3.4): αc = Rs/(a·η·√(1-(fc/f)²))·[(fc/f)²+m²/(x'²−m²)]
    var fcr = te11.fc / f;  // fc/f
    var ac_npm = (Rs / (a * eta * Math.sqrt(1 - fcr*fcr))) *
                 (fcr*fcr + 1 / (te11.x*te11.x - 1));
    var alpha_c = 8.686 * ac_npm;

    // Dielectric loss [Np/m]
    var alpha_d = (tanD > 0 && er > 1)
      ? 8.686 * km*km * tanD / (2 * beta)
      : 0;

    // Bandwidth to first higher-order mode (TM₀₁)
    var tm01 = modes.filter(function(md) {
      return md.type === 'TM' && md.m === 0 && md.p === 1;
    })[0];
    var bw_ratio = tm01 ? tm01.fc / te11.fc : null;

    res.beta = beta; res.lambda_g = lambda_g; res.Zw = Zw;
    res.vph = vph;   res.vgr = vgr;
    res.alpha_c = alpha_c; res.alpha_d = alpha_d;
    res.bw_ratio = bw_ratio;
  }

  cwgShowResults(res);
  if (window.drawDiagram) window.drawDiagram(res);
}

function cwgShowResults(res) {
  var container = document.getElementById('cwg-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  var te11 = res.te11;
  var ratio = res.f / te11.fc;
  var above = res.f > te11.fc;

  var card1 = document.createElement('div');
  card1.className = 'res-card';
  card1.innerHTML = '<h4>TE<sub>11</sub> Dominant Mode</h4>' +
    cwgRr('TE<sub>11</sub> cutoff frequency', engFmt(te11.fc,'Hz')) +
    cwgRr('Operating frequency', engFmt(res.f,'Hz')) +
    cwgRr('f / f<sub>c,TE₁₁</sub>',
      ratio.toFixed(3) + (above
        ? ' — propagating'
        : ' — <span style="color:#c0392b">EVANESCENT (below cutoff)</span>'),
      false, true);

  if (above) {
    var bwStr = res.bw_ratio
      ? ' (single-mode up to ' + (res.bw_ratio).toFixed(3) + ' × f<sub>c,TE₁₁</sub>)'
      : '';
    card1.innerHTML +=
      cwgRr('Guide wavelength, λ<sub>g</sub>',     engFmt(res.lambda_g,'m')) +
      cwgRr('Wave impedance, Z<sub>TE₁₁</sub>',    res.Zw.toFixed(2)+' Ω') +
      cwgRr('Phase velocity, v<sub>ph</sub>',      (res.vph/C0).toFixed(3)+' × c') +
      cwgRr('Group velocity, v<sub>gr</sub>',      (res.vgr/C0).toFixed(3)+' × c') +
      cwgRr('Conductor loss, α<sub>c</sub> (TE<sub>11</sub>)', res.alpha_c.toFixed(4)+' dB/m') +
      cwgRr('Dielectric loss, α<sub>d</sub>',      res.alpha_d.toFixed(4)+' dB/m') +
      cwgRr('Single-mode bandwidth', '1.31 × f<sub>c,TE₁₁</sub>' + bwStr, false, true);
  }
  container.appendChild(card1);

  // Mode table
  var card2 = document.createElement('div');
  card2.className = 'res-card';
  card2.innerHTML = '<h4>Mode Cutoff Frequencies</h4>';
  var shown = res.modes.slice(0, 12);
  shown.forEach(function(mo) {
    var prop = res.f > mo.fc;
    var isDom = (mo.type === 'TE' && mo.m === 1 && mo.p === 1);
    var isTE01 = (mo.type === 'TE' && mo.m === 0 && mo.p === 1);
    var style = isDom ? 'color:#AA77FF;font-weight:700;' : prop ? 'color:#AA77FF;font-weight:600;' : 'color:#aaa;';
    var note = isDom ? ' (dominant)' : isTE01 ? ' ★' : '';
    card2.innerHTML += '<div class="res-row">' +
      '<span class="res-lbl" style="'+style+'">' +
        mo.type + '<sub>'+mo.m+mo.p+'</sub>' + note +
      '</span>' +
      '<span class="res-val" style="'+style+'">' +
        engFmt(mo.fc,'Hz') + (prop ? ' ✓' : '') +
      '</span></div>';
  });
  card2.innerHTML +=
    '<div style="font-size:10px;color:#aaa;margin-top:6px;">' +
    '★ TE<sub>01</sub>: conductor loss <em>decreases</em> with frequency.' +
    '</div>';
  container.appendChild(card2);
}

function cwgRr(lbl, val, hi, raw) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function cwgShowError(msg) {
  var el = document.getElementById('cwg-error');
  if (el) el.textContent = msg;
}
function cwgClearError() {
  var el = document.getElementById('cwg-error');
  if (el) el.textContent = '';
}
