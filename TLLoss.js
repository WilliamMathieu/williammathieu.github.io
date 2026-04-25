/* Transmission Line Loss & Propagation Delay */

var MU0 = 4 * Math.PI * 1e-7;
var C0  = 2.998e8;

document.getElementById('tl-btn').addEventListener('click', tl_calc);
document.getElementById('tl-type').addEventListener('change', tl_type_change);

function tl_type_change() {
  var t = document.getElementById('tl-type').value;
  document.getElementById('mstrip-section').style.display = (t === 'mstrip') ? '' : 'none';
  document.getElementById('coax-section').style.display   = (t === 'coax')   ? '' : 'none';
}

function tl_calc() {
  clearError();
  var fv   = parseFloat(document.getElementById('tl-f').value);
  var fmul = parseFloat(document.getElementById('tl-f-unit').value);
  var Lv   = parseFloat(document.getElementById('tl-len').value);
  var Lmul = parseFloat(document.getElementById('tl-len-unit').value);
  if (!(fv > 0)) { showError('Enter a valid frequency.'); return; }
  if (!(Lv > 0)) { showError('Enter a valid line length.'); return; }
  var f  = fv * fmul;
  var Lm = Lv * Lmul;
  var type = document.getElementById('tl-type').value;
  var res = (type === 'mstrip') ? calc_mstrip(f, Lm) : calc_coax(f, Lm);
  if (res) {
    show_results(res, Lm);
    if (window.drawDiagram) window.drawDiagram(res);
  }
}

function calc_mstrip(f, Lm) {
  var er    = parseFloat(document.getElementById('ms-er').value);
  var Df    = parseFloat(document.getElementById('ms-df').value) || 0;
  var wv    = parseFloat(document.getElementById('ms-w').value);
  var wmul  = parseFloat(document.getElementById('ms-w-unit').value);
  var hv    = parseFloat(document.getElementById('ms-h').value);
  var hmul  = parseFloat(document.getElementById('ms-h-unit').value);
  var tv    = parseFloat(document.getElementById('ms-t').value) || 35;
  var tmul  = parseFloat(document.getElementById('ms-t-unit').value);
  var sigma = parseFloat(document.getElementById('ms-sigma').value) || 5.8e7;

  if (!(er >= 1))  { showError('Substrate εr must be ≥ 1.'); return null; }
  if (!(wv > 0))   { showError('Enter a valid trace width w.'); return null; }
  if (!(hv > 0))   { showError('Enter a valid substrate height h.'); return null; }
  if (!(sigma > 0)){ showError('Conductivity σ must be > 0.'); return null; }

  var w = wv * wmul;
  var h = hv * hmul;
  var t = tv * tmul;
  var u = w / h;

  // Hammerstad-Jensen closed-form εeff and Z0
  var eeff, Z0;
  if (u <= 1) {
    eeff = (er+1)/2 + (er-1)/2 * (Math.pow(1+12/u, -0.5) + 0.04*(1-u)*(1-u));
    Z0   = 60 / Math.sqrt(eeff) * Math.log(8/u + u/4);
  } else {
    eeff = (er+1)/2 + (er-1)/2 * Math.pow(1+12/u, -0.5);
    Z0   = 120*Math.PI / (Math.sqrt(eeff) * (u + 1.393 + 0.667*Math.log(u+1.444)));
  }

  var Rs = Math.sqrt(Math.PI * f * MU0 / sigma);

  // Effective width with conductor thickness correction (Hammerstad)
  var dw = (u < 1/(2*Math.PI))
    ? t/Math.PI * (1 + Math.log(4*Math.PI*w/t))
    : t/Math.PI * (1 + Math.log(2*h/t));
  var w_eff = Math.max(w + dw, w);

  // Conductor loss [dB/m]
  var alpha_c_npm;
  if (u < 1) {
    alpha_c_npm = Rs / (2*Math.PI*h*Z0) * (1 + h/(Math.PI*w) * (1 + Math.log(4*Math.PI*w/t)));
  } else {
    alpha_c_npm = Rs / (Z0 * w_eff);
  }
  var alpha_c = 8.686 * alpha_c_npm;

  // Dielectric loss [dB/m] — Pozar eq. 3.30
  var k0 = 2 * Math.PI * f / C0;
  var alpha_d = (Df > 0 && er > 1)
    ? 8.686 * k0 * er * (eeff-1) * Df / (2 * Math.sqrt(eeff) * (er-1))
    : 0;

  var vp = C0 / Math.sqrt(eeff);
  var td = Lm / vp;

  return { type:'Microstrip', Z0:Z0, eeff:eeff, vp:vp,
           alpha_c:alpha_c, alpha_d:alpha_d, td:td };
}

function calc_coax(f, Lm) {
  var er    = parseFloat(document.getElementById('cx-er').value);
  var Df    = parseFloat(document.getElementById('cx-df').value) || 0;
  var dv    = parseFloat(document.getElementById('cx-d').value);
  var dmul  = parseFloat(document.getElementById('cx-d-unit').value);
  var Dv    = parseFloat(document.getElementById('cx-D').value);
  var Dmul  = parseFloat(document.getElementById('cx-D-unit').value);
  var sigma = parseFloat(document.getElementById('cx-sigma').value) || 5.8e7;

  if (!(er >= 1))          { showError('Dielectric εr must be ≥ 1.'); return null; }
  if (!(dv > 0))           { showError('Enter inner conductor diameter d.'); return null; }
  if (!(Dv > 0))           { showError('Enter outer conductor inner diameter D.'); return null; }
  if (!(sigma > 0))        { showError('Conductivity σ must be > 0.'); return null; }

  var d  = dv * dmul;
  var D  = Dv * Dmul;
  var a  = d / 2;
  var b  = D / 2;

  if (D <= d) { showError('Outer diameter D must be greater than inner diameter d.'); return null; }

  var Z0   = 138 / Math.sqrt(er) * Math.log10(b/a);
  var eeff = er;
  var Rs   = Math.sqrt(Math.PI * f * MU0 / sigma);

  // Conductor loss: sum of inner and outer surface losses
  var alpha_c = 8.686 * Rs / (4*Math.PI*Z0) * (1/a + 1/b);

  // Dielectric loss
  var alpha_d = (Df > 0)
    ? 8.686 * Math.PI * f * Math.sqrt(er) * Df / C0
    : 0;

  var vp = C0 / Math.sqrt(er);
  var td = Lm / vp;

  return { type:'Coaxial', Z0:Z0, eeff:eeff, vp:vp,
           alpha_c:alpha_c, alpha_d:alpha_d, td:td };
}

function show_results(res, Lm) {
  var container = document.getElementById('tl-results');
  container.innerHTML = '';
  container.style.display = 'grid';
  var alpha_tot  = res.alpha_c + res.alpha_d;
  var loss_total = alpha_tot * Lm;
  var card = document.createElement('div');
  card.className = 'res-card';
  card.innerHTML = '<h4>' + res.type + ' Parameters</h4>' +
    rr('Characteristic impedance, Z₀',           res.Z0.toFixed(2) + ' Ω') +
    rr('Effective permittivity, ε<sub>eff</sub>', res.eeff.toFixed(4)) +
    rr('Phase velocity, v<sub>p</sub>',           (res.vp/C0*100).toFixed(2) + ' % of c') +
    rr('Conductor loss',                          res.alpha_c.toFixed(4) + ' dB/m') +
    rr('Dielectric loss',                         res.alpha_d.toFixed(4) + ' dB/m') +
    rr('Total attenuation',                       alpha_tot.toFixed(4) + ' dB/m') +
    rr('Total insertion loss (' + fmtLen(Lm) + ')', loss_total.toFixed(3) + ' dB', true) +
    rr('Propagation delay',                       engFmt(res.td, 's'), true);
  container.appendChild(card);
}

function fmtLen(Lm) {
  if (Lm >= 1)    return Lm.toFixed(3) + ' m';
  if (Lm >= 0.01) return (Lm*100).toFixed(1) + ' cm';
  return (Lm*1000).toFixed(1) + ' mm';
}

function rr(lbl, val, hi) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('tl-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('tl-error');
  if (el) el.textContent = '';
}
