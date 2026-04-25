/* Stepped-Impedance Microstrip Low-Pass Filter */

var C0 = 2.998e8;
var MU0 = 4 * Math.PI * 1e-7;

document.getElementById('silpf-btn').addEventListener('click', silpf_calc);

function silpf_calc() {
  clearError();

  var n      = parseInt(document.getElementById('silpf-n').value) || 3;
  var fc_v   = parseFloat(document.getElementById('silpf-fc').value);
  var fc_mul = parseFloat(document.getElementById('silpf-fc-unit').value);
  var Zh     = parseFloat(document.getElementById('silpf-zh').value) || 120;
  var Zl     = parseFloat(document.getElementById('silpf-zl').value) || 20;
  var Z0     = parseFloat(document.getElementById('silpf-z0').value) || 50;
  var resp   = document.getElementById('silpf-resp').value;
  var er     = parseFloat(document.getElementById('silpf-er').value) || 4.4;
  var h      = parseFloat(document.getElementById('silpf-h').value) || 1;

  if (!(fc_v > 0)) { showError('Enter a valid cutoff frequency.'); return; }
  if (n < 1 || n > 9) { showError('Order n must be between 1 and 9.'); return; }
  if (Zh <= Z0)  { showError('High impedance Zh must be greater than Z0.'); return; }
  if (Zl >= Z0)  { showError('Low impedance Zl must be less than Z0.'); return; }

  var fc = fc_v * fc_mul;
  var wc = 2 * Math.PI * fc;

  // Prototype element values (Butterworth or Chebyshev 0.5 dB ripple)
  var g = get_prototype(n, resp);
  if (!g) { showError('Prototype values unavailable for this order/response.'); return; }

  // Convert prototype LC ladder → stepped-impedance sections
  // Even-indexed elements (g1, g3, ...) = series inductors → high-Z sections
  // Odd-indexed elements (g2, g4, ...) = shunt capacitors  → low-Z sections
  // (for LPF starting with series element; adjust based on n)
  //
  // Electrical length of each section:
  //   High-Z (inductor): β·l = g_k · Z0 / Zh  (in radians at ωc)
  //   Low-Z (capacitor): β·l = g_k · Zl / Z0  (in radians at ωc)

  var sections = [];
  var lambda4_m = C0 / (4 * fc * Math.sqrt(er));  // λ/4 at fc in substrate

  for (var i = 0; i < n; i++) {
    var gk   = g[i + 1];  // prototype element (g1..gn, skip g0)
    var isHigh = (i % 2 === 0);  // odd elements: series L → high Z
    var Zk   = isHigh ? Zh : Zl;
    var beta_l_rad = isHigh ? (gk * Z0 / Zh) : (gk * Zl / Z0);
    var beta_l_deg = beta_l_rad * 180 / Math.PI;
    // Physical length: l = (β·l) / β_substrate = (β·l / (2π)) × λ_substrate
    var lam_sub = C0 / (fc * Math.sqrt(er));  // substrate wavelength at fc
    var length_m = (beta_l_rad / (2 * Math.PI)) * lam_sub;

    // Approximate w/h for the two impedances using microstrip formula (inverse)
    var wh = zToWidthRatio(Zk, er);

    sections.push({
      idx: i + 1,
      type: isHigh ? 'High-Z (series L)' : 'Low-Z (shunt C)',
      gk: gk,
      Zk: Zk,
      beta_l_deg: beta_l_deg,
      length_m: length_m,
      wh: wh
    });
  }

  // Estimated −3 dB bandwidth correction: actual f3dB ≈ fc for Butterworth
  showResults(sections, fc, Z0, Zh, Zl, er, h, resp, n);
  if (window.drawDiagram) window.drawDiagram(sections, Zh, Zl);
}

function get_prototype(n, resp) {
  // Returns [g0, g1, ..., gn, g_{n+1}] prototype values
  // Butterworth (maximally flat)
  var butter = {
    1: [1, 2.000, 1],
    2: [1, 1.414, 1.414, 1],
    3: [1, 1.000, 2.000, 1.000, 1],
    4: [1, 0.765, 1.848, 1.848, 0.765, 1],
    5: [1, 0.618, 1.618, 2.000, 1.618, 0.618, 1],
    6: [1, 0.518, 1.414, 1.932, 1.932, 1.414, 0.518, 1],
    7: [1, 0.445, 1.247, 1.802, 2.000, 1.802, 1.247, 0.445, 1],
    8: [1, 0.390, 1.111, 1.663, 1.962, 1.962, 1.663, 1.111, 0.390, 1],
    9: [1, 0.347, 1.000, 1.532, 1.879, 2.000, 1.879, 1.532, 1.000, 0.347, 1]
  };
  // Chebyshev 0.5 dB ripple (Pozar Table 8.4 / standard tables)
  var cheby05 = {
    1: [1, 0.6986, 1],
    2: [1, 1.4029, 0.7071, 1.9841],
    3: [1, 1.5963, 1.0967, 1.5963, 1],
    4: [1, 1.6703, 1.1926, 2.3661, 0.8419, 1.9841],
    5: [1, 1.7058, 1.2296, 2.5408, 1.2296, 1.7058, 1],
    6: [1, 1.7254, 1.2479, 2.6064, 1.3137, 2.4758, 0.8696, 1.9841],
    7: [1, 1.7372, 1.2583, 2.6381, 1.3444, 2.6381, 1.2583, 1.7372, 1],
    8: [1, 1.7451, 1.2647, 2.6564, 1.3590, 2.6964, 1.3389, 2.5093, 0.8796, 1.9841],
    9: [1, 1.7504, 1.2690, 2.6678, 1.3673, 2.7239, 1.3673, 2.6678, 1.2690, 1.7504, 1]
  };
  return (resp === 'cheby') ? cheby05[n] : butter[n];
}

function zToWidthRatio(Z, er) {
  // Inverse microstrip formula: given Z0, find w/h
  // Approximate closed-form (Pozar)
  var A = Z/60 * Math.sqrt((er+1)/2) + (er-1)/(er+1) * (0.23 + 0.11/er);
  var wh_narrow = 8 * Math.exp(A) / (Math.exp(2*A) - 2);  // w/h < 2
  var B = 377 * Math.PI / (2 * Z * Math.sqrt(er));
  var wh_wide = 2/Math.PI * (B - 1 - Math.log(2*B-1) + (er-1)/(2*er) * (Math.log(B-1) + 0.39 - 0.61/er));
  return (wh_narrow < 2) ? wh_narrow : wh_wide;
}

function showResults(sections, fc, Z0, Zh, Zl, er, h, resp, n) {
  var container = document.getElementById('silpf-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  // Summary card
  var sum = document.createElement('div');
  sum.className = 'res-card';
  var totalLen = sections.reduce(function(acc,s){ return acc+s.length_m; }, 0);
  sum.innerHTML = '<h4>Filter Summary</h4>' +
    rr('Response',     resp === 'cheby' ? 'Chebyshev 0.5 dB ripple' : 'Butterworth') +
    rr('Order',        n) +
    rr('Cutoff f<sub>c</sub>', engFmt(fc,'Hz')) +
    rr('High-Z lines', Zh.toFixed(0) + ' Ω') +
    rr('Low-Z lines',  Zl.toFixed(0) + ' Ω') +
    rr('Total length', engFmt(totalLen,'m'), true);
  container.appendChild(sum);

  // Section table card
  var card = document.createElement('div');
  card.className = 'res-card';
  card.innerHTML = '<h4>Section Dimensions (εr = ' + er + ', h = ' + h + ' mm)</h4>' +
    '<div class="res-row" style="font-size:11px;color:#888;border-bottom:1px solid #e0d8ff;padding-bottom:4px;">' +
    '<span class="res-lbl">Section</span>' +
    '<span class="res-val" style="font-size:10px;">Z (Ω) | θ (°) | Length | w/h</span></div>';

  sections.forEach(function(s) {
    var w_mm = s.wh * h;
    var style = s.type.indexOf('High') >= 0 ? 'color:#5533aa;' : 'color:#AA77FF;';
    card.innerHTML +=
      '<div class="res-row">' +
      '<span class="res-lbl" style="' + style + '">' + s.idx + ': ' + s.type + '</span>' +
      '<span class="res-val" style="font-size:11px;">' +
        s.Zk.toFixed(0) + ' Ω | ' +
        s.beta_l_deg.toFixed(1) + '° | ' +
        engFmt(s.length_m,'m') + ' | w='+w_mm.toFixed(2)+'mm' +
      '</span></div>';
  });
  container.appendChild(card);
}

function rr(lbl, val, hi) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('silpf-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('silpf-error');
  if (el) el.textContent = '';
}
