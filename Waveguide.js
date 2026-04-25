/* Rectangular Waveguide Calculator */

var C0 = 2.998e8;
var MU0 = 4 * Math.PI * 1e-7;
var EPS0 = 8.854e-12;

document.getElementById('wg-btn').addEventListener('click', wg_calc);

function wg_calc() {
  clearError();

  var av  = parseFloat(document.getElementById('wg-a').value);
  var amul = parseFloat(document.getElementById('wg-a-unit').value);
  var bv  = parseFloat(document.getElementById('wg-b').value);
  var bmul = parseFloat(document.getElementById('wg-b-unit').value);
  var fv  = parseFloat(document.getElementById('wg-f').value);
  var fmul = parseFloat(document.getElementById('wg-f-unit').value);
  var er  = parseFloat(document.getElementById('wg-er').value) || 1;
  var sigmav = parseFloat(document.getElementById('wg-sigma').value) || 5.8e7;
  var tanD = parseFloat(document.getElementById('wg-tanD').value) || 0;

  if (!(av > 0)) { showError('Enter a valid broad-wall dimension a.'); return; }
  if (!(bv > 0)) { showError('Enter a valid narrow-wall dimension b.'); return; }
  if (!(fv > 0)) { showError('Enter a valid operating frequency.'); return; }

  var a = av * amul;
  var b = bv * bmul;
  var f = fv * fmul;

  if (b >= a) { showError('b must be less than a (narrow wall < broad wall).'); return; }

  var mu  = MU0;      // non-magnetic fill assumed
  var eps = er * EPS0;
  var vp_med = 1 / Math.sqrt(mu * eps);  // phase velocity in fill medium = c/√εr

  // Cutoff frequencies for first 8 modes (sorted)
  var modes = [];
  for (var m = 0; m <= 3; m++) {
    for (var n = 0; n <= 3; n++) {
      if (m === 0 && n === 0) continue;
      var fc = vp_med / 2 * Math.sqrt((m/a)*(m/a) + (n/b)*(n/b));
      var modeType = (m > 0 && n > 0) ? 'TE/TM' : (n === 0 ? 'TE' : 'TE');
      modes.push({ m:m, n:n, fc:fc, label:'TE'+m+n });
    }
  }
  // Add TM modes (require both m,n >= 1)
  for (var m = 1; m <= 3; m++) {
    for (var n = 1; n <= 3; n++) {
      var fc = vp_med / 2 * Math.sqrt((m/a)*(m/a) + (n/b)*(n/b));
      modes.push({ m:m, n:n, fc:fc, label:'TM'+m+n });
    }
  }
  modes.sort(function(x,y){ return x.fc - y.fc; });
  // Deduplicate label
  var seen = {}, uniqModes = [];
  modes.forEach(function(mo) {
    if (!seen[mo.label]) { seen[mo.label]=true; uniqModes.push(mo); }
  });
  modes = uniqModes.slice(0, 8);

  var fc10 = vp_med / (2 * a);  // dominant TE10 mode
  var fc20 = vp_med / a;         // TE20 (first higher-order TE)
  var fc01 = vp_med / (2 * b);  // TE01

  if (f < fc10) {
    // Below cutoff — show cutoff info but note evanescent
  }

  var result = { a:a, b:b, f:f, fc10:fc10, fc20:fc20, fc01:fc01,
                  er:er, modes:modes, sigma:sigmav, tanD:tanD };

  if (f > fc10) {
    // Guide wavelength and wave impedance for dominant TE10
    var k0  = 2 * Math.PI * f / C0;           // free-space wavenumber
    var km  = k0 * Math.sqrt(er);             // wavenumber in fill medium
    var kc  = Math.PI / a;                     // cutoff wavenumber for TE10
    var beta = Math.sqrt(km*km - kc*kc);       // phase constant
    var lambda_g = 2 * Math.PI / beta;
    var Zw = (2 * Math.PI * f * MU0) / beta;  // TE10 wave impedance

    // Phase velocity and group velocity
    var vph = 2 * Math.PI * f / beta;
    var vgr = beta * C0*C0 / (km * km / (2*Math.PI*f));  // simplified: vgr = c²/vph...
    // More correctly: vgr = dω/dβ = c²β/(ω·er) for TE10 in dielectric-filled guide
    vgr = (beta / (2*Math.PI*f)) * C0*C0 / er;

    // Conductor loss for TE10 (α_c) [Np/m] — exact formula for TE10
    var Rs = Math.sqrt(Math.PI * f * MU0 / sigmav);
    var alpha_c_npm = Rs / (a*a*a*b*beta*2*Math.PI*f*MU0) * (2*b*Math.PI*Math.PI + a*a*a*beta*beta);
    // Simplified Pozar form for TE10:
    alpha_c_npm = Rs / (a*b*beta*2*Math.PI*f*MU0) * (2*b*Math.PI*Math.PI + a*a*a*(beta*beta));
    // Even simpler standard result (Pozar eq 3.96):
    // αc = Rs/(a³b·β·ωµ) × (2b·π² + a³·β²) — let me use the clean Pozar form
    var w = 2*Math.PI*f;
    alpha_c_npm = Rs / (a*a*a * b * beta * w * MU0) * (2*b*Math.PI*Math.PI + a*a*a*beta*beta);
    var alpha_c = 8.686 * alpha_c_npm;  // dB/m

    // Dielectric loss (if filled)
    var alpha_d = (tanD > 0 && er > 1)
      ? 8.686 * km*km * tanD / (2*beta)
      : 0;

    result.beta     = beta;
    result.lambda_g = lambda_g;
    result.Zw       = Zw;
    result.vph      = vph;
    result.vgr      = vgr;
    result.alpha_c  = alpha_c;
    result.alpha_d  = alpha_d;
  }

  showResults(result);
  if (window.drawDiagram) window.drawDiagram(result);
}

function showResults(res) {
  var container = document.getElementById('wg-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  var fc10 = res.fc10;
  var ratio = res.f / fc10;
  var aboveCutoff = res.f > fc10;

  var card1 = document.createElement('div');
  card1.className = 'res-card';
  card1.innerHTML = '<h4>TE₁₀ Dominant Mode</h4>' +
    rr('TE₁₀ cutoff frequency, f<sub>c10</sub>', engFmt(fc10,'Hz')) +
    rr('Operating frequency', engFmt(res.f,'Hz')) +
    rr('f / f<sub>c10</sub>', ratio.toFixed(3) + (aboveCutoff ? ' — propagating' : ' — <span style="color:#c0392b">EVANESCENT (below cutoff)</span>'), false, true);

  if (aboveCutoff) {
    card1.innerHTML +=
      rr('Guide wavelength, λ<sub>g</sub>',  engFmt(res.lambda_g,'m')) +
      rr('TE₁₀ wave impedance, Z<sub>w</sub>', res.Zw.toFixed(2)+' Ω') +
      rr('Phase velocity, v<sub>ph</sub>',   (res.vph/C0).toFixed(3)+' × c') +
      rr('Group velocity, v<sub>gr</sub>',   (res.vgr/C0).toFixed(3)+' × c') +
      rr('Conductor loss, α<sub>c</sub>',    res.alpha_c.toFixed(4)+' dB/m') +
      rr('Dielectric loss, α<sub>d</sub>',   res.alpha_d.toFixed(4)+' dB/m');
  }
  container.appendChild(card1);

  // Mode table card
  var card2 = document.createElement('div');
  card2.className = 'res-card';
  card2.innerHTML = '<h4>Mode Cutoff Frequencies</h4>';
  res.modes.forEach(function(mo) {
    var propagates = res.f > mo.fc;
    var style = propagates ? 'color:#AA77FF;font-weight:600;' : 'color:#aaa;';
    card2.innerHTML += '<div class="res-row">' +
      '<span class="res-lbl" style="' + style + '">' + mo.label + '</span>' +
      '<span class="res-val" style="' + style + '">' + engFmt(mo.fc,'Hz') +
      (propagates ? ' ✓' : '') + '</span></div>';
  });
  container.appendChild(card2);
}

function rr(lbl, val, hi, raw) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  var v = raw ? val : val;
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + v + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('wg-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('wg-error');
  if (el) el.textContent = '';
}
