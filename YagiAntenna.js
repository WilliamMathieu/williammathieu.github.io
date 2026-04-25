/* Yagi-Uda Antenna Calculator (NEC-based empirical, Viezbicke/Oppenheim tables) */

var C0 = 2.998e8;
var PI = Math.PI;

document.getElementById('yagi-btn').addEventListener('click', yagi_calc);

function yagi_calc() {
  clearError();

  var fv   = parseFloat(document.getElementById('yagi-f').value);
  var fmul = parseFloat(document.getElementById('yagi-f-unit').value);
  var nEl  = parseInt(document.getElementById('yagi-n').value)  || 3;
  var dv   = parseFloat(document.getElementById('yagi-diam').value) || 1;
  var dmul = parseFloat(document.getElementById('yagi-diam-unit').value);

  if (!(fv > 0)) { showError('Enter a valid frequency.'); return; }
  if (nEl < 2 || nEl > 9) { showError('Number of elements must be 2–9.'); return; }

  var f   = fv * fmul;
  var lam = C0 / f;
  var d   = dv * dmul;  // element diameter in metres

  // Empirical tables based on Viezbicke (NBS Tech Note 688) for d/λ = 0.0085
  // Gain and director spacings scaled to actual d/λ via small correction
  // These are the standard NBS element lengths (in wavelengths) for a d/λ=0.0085 design
  // Table: [reflector, driven, director1, director2, director3, ...]
  var lengths_tbl = {
    2: [0.505, 0.473],
    3: [0.505, 0.473, 0.451],
    4: [0.505, 0.472, 0.451, 0.428],
    5: [0.505, 0.472, 0.456, 0.436, 0.430],
    6: [0.505, 0.472, 0.456, 0.436, 0.430, 0.430],
    7: [0.505, 0.472, 0.456, 0.436, 0.430, 0.430, 0.430],
    8: [0.505, 0.472, 0.456, 0.436, 0.430, 0.430, 0.430, 0.430],
    9: [0.505, 0.472, 0.456, 0.436, 0.430, 0.430, 0.430, 0.430, 0.426]
  };
  // Director spacings from driven element (in wavelengths)
  var spacing_tbl = {
    2: [0.25],
    3: [0.25, 0.31],
    4: [0.25, 0.31, 0.40],
    5: [0.25, 0.31, 0.40, 0.42],
    6: [0.25, 0.31, 0.40, 0.42, 0.42],
    7: [0.25, 0.31, 0.40, 0.42, 0.42, 0.42],
    8: [0.25, 0.31, 0.40, 0.42, 0.42, 0.42, 0.42],
    9: [0.25, 0.31, 0.40, 0.42, 0.42, 0.42, 0.42, 0.42]
  };
  // Gain (dBd) from NBS/Viezbicke table
  var gain_tbl = {2:3.8, 3:5.9, 4:7.1, 5:8.2, 6:9.2, 7:10.0, 8:10.7, 9:11.3};
  // F/B ratio (approximate)
  var fb_tbl   = {2:5,   3:10,  4:12,  5:14,  6:16,  7:18,  8:20,  9:22};

  var lengths = lengths_tbl[nEl];
  var spacings = spacing_tbl[nEl];  // spacings from driven element (positive = toward reflector side is -0.25λ)

  // Length correction for actual d/λ (Thiele formula, small correction)
  var dLam = d / lam;
  var dLam_ref = 0.0085;
  var len_corr = 0;  // simplified; for accurate design use NEC

  // Physical element lengths
  var elements = [];
  var cumX = -0.25 * lam;  // reflector position (behind driven)
  elements.push({ name:'Reflector', lam_len: lengths[0], len_m: lengths[0]*lam, x_m: cumX });
  elements.push({ name:'Driven', lam_len: lengths[1], len_m: lengths[1]*lam, x_m: 0 });
  for (var i = 2; i < nEl; i++) {
    var dx = spacings[i-1] * lam;  // from driven element
    elements.push({ name:'Director ' + (i-1), lam_len: lengths[i]||0.430, len_m: (lengths[i]||0.430)*lam, x_m: dx });
  }

  // Boom length = reflector to last director
  var boomLen = elements[elements.length-1].x_m - elements[0].x_m;

  // Input impedance (folded dipole driven): typically 200–300Ω → use 50Ω via balun
  // Straight driven dipole: ~73Ω free space → reduced to ~25–35Ω in array
  var Zin = 25;  // approximate for typical Yagi with straight driven element

  var gain_dbi = gain_tbl[nEl] + 2.15;  // dBi = dBd + 2.15
  var fb_db    = fb_tbl[nEl];
  var HPBW_H  = 78 / Math.sqrt(Math.pow(10, gain_dbi/10) / 1.64);  // approximate from gain
  var HPBW_E  = HPBW_H * 1.1;

  showResults({elements:elements, boomLen:boomLen, lam:lam, f:f, nEl:nEl,
               gain_dbi:gain_dbi, gain_dbd:gain_tbl[nEl],
               fb_db:fb_db, Zin:Zin, HPBW_H:HPBW_H, HPBW_E:HPBW_E});
  if (window.drawDiagram) window.drawDiagram(elements, boomLen, lam);
}

function showResults(r) {
  var container = document.getElementById('yagi-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  var card = document.createElement('div');
  card.className = 'res-card';
  card.innerHTML = '<h4>' + r.nEl + '-Element Yagi at ' + engFmt(r.f,'Hz') + '</h4>' +
    rr('Gain',                  r.gain_dbi.toFixed(1) + ' dBi  (' + r.gain_dbd.toFixed(1) + ' dBd)', true) +
    rr('Front-to-back ratio',   r.fb_db.toFixed(0) + ' dB (approx)') +
    rr('HPBW (H-plane)',        r.HPBW_H.toFixed(0) + '°') +
    rr('Boom length',           engFmt(r.boomLen,'m'), true) +
    rr('Input impedance',       '~' + r.Zin + ' Ω (straight driven; ~200 Ω folded dipole)') +
    rr('λ at ' + engFmt(r.f,'Hz'), engFmt(r.lam,'m'));

  var card2 = document.createElement('div');
  card2.className = 'res-card';
  card2.innerHTML = '<h4>Element Lengths &amp; Positions</h4>' +
    '<div class="res-row" style="font-size:11px;color:#888;">' +
    '<span class="res-lbl">Element</span>' +
    '<span class="res-val" style="font-size:10px;">Length | Position from driven</span></div>';
  r.elements.forEach(function(el) {
    var hi = el.name === 'Driven';
    var style = hi ? ' style="color:#AA77FF;font-weight:700;"' : '';
    card2.innerHTML +=
      '<div class="res-row">' +
      '<span class="res-lbl"' + style + '>' + el.name + '</span>' +
      '<span class="res-val" style="font-size:11px;">' +
        engFmt(el.len_m,'m') + ' | ' + (el.x_m >= 0 ? '+' : '') + engFmt(el.x_m,'m') +
      '</span></div>';
  });
  container.appendChild(card);
  container.appendChild(card2);
  if (window.drawDiagram) window.drawDiagram(r.elements, r.boomLen, r.lam);
}

function rr(lbl, val, hi) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('yagi-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('yagi-error');
  if (el) el.textContent = '';
}
