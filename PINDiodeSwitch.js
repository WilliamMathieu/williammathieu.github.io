/* exported pdCalc, pdCfg */
/*
 * PIN diode SPST switch — Pozar §10.4
 *   series diode Z_d:  A = 20 log10|1 + Z_d/(2 Z0)|
 *   shunt  diode Z_d:  A = 20 log10|1 + Z0/(2 Z_d)|
 *   forward Z_d = R_f ; reverse Z_d = R_r - j/(ω C_j)
 * Series switch: ON = forward (insertion loss), OFF = reverse (isolation).
 * Shunt  switch: ON = reverse (insertion loss), OFF = forward (isolation).
 */
var pdCfg = 'series';

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }

function cmag(a) { return Math.hypot(a[0], a[1]); }

// attenuation (dB) of a diode of impedance Zd=[re,im] in the given config
function attenDB(cfg, Zd, Z0) {
  var f; // 1 + Zd/(2Z0) or 1 + Z0/(2Zd)
  if (cfg === 'series') {
    f = [1 + Zd[0] / (2 * Z0), Zd[1] / (2 * Z0)];
  } else {
    // Z0/(2 Zd) = Z0/2 * conj(Zd)/|Zd|^2
    var d = 2 * (Zd[0] * Zd[0] + Zd[1] * Zd[1]);
    f = [1 + Z0 * Zd[0] / d, -Z0 * Zd[1] / d];
  }
  return 20 * Math.log10(cmag(f));
}

function pdCalc() {
  clearError();
  var cfg = document.getElementById('pd-cfg').value;
  var Rf = parseFloat(document.getElementById('pd-rf').value);
  var Cj = parseFloat(document.getElementById('pd-cj').value);
  var Rr = parseFloat(document.getElementById('pd-rr').value);
  var Z0 = parseFloat(document.getElementById('pd-z0').value);
  var f = parseFloat(document.getElementById('pd-f').value);

  if (isNaN(Rf) || Rf < 0) { showError('Enter the forward resistance R_f (Ω).'); return; }
  if (isNaN(Cj) || Cj <= 0) { showError('Enter the reverse junction capacitance C_j (pF).'); return; }
  if (isNaN(Rr) || Rr < 0) Rr = 0;
  if (!(Z0 > 0)) { showError('Z₀ must be positive.'); return; }
  if (!(f > 0)) { showError('Enter a positive frequency (GHz).'); return; }

  pdCfg = cfg;
  var w = 2 * Math.PI * f * 1e9;
  var Xc = 1 / (w * Cj * 1e-12);           // magnitude of reverse reactance
  var Zfwd = [Rf, 0];
  var Zrev = [Rr, -Xc];

  var Afwd = attenDB(cfg, Zfwd, Z0);
  var Arev = attenDB(cfg, Zrev, Z0);

  var IL, ISO;
  if (cfg === 'series') { IL = Afwd; ISO = Arev; }
  else { IL = Arev; ISO = Afwd; }

  document.getElementById('pd-il').textContent = IL.toFixed(3) + ' dB';
  document.getElementById('pd-iso').textContent = ISO.toFixed(2) + ' dB';
  document.getElementById('pd-ratio').textContent = (ISO - IL).toFixed(2) + ' dB';
  document.getElementById('pd-zf').textContent = Rf.toFixed(2) + ' Ω';
  document.getElementById('pd-xc').textContent = Xc.toFixed(1) + ' Ω';
  document.getElementById('pd-zr').textContent = Rr.toFixed(2) + ' − j' + Xc.toFixed(1) + ' Ω';

  if (window.drawDiagram) window.drawDiagram();
}
