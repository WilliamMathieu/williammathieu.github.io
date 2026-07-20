/* exported trCalc */
/*
 * Transmission-line resonator — Pozar §6.1
 *   β = 2π f0 √εr / c ,  λg = c/(f0√εr)
 *   Q0 = β/(2α)   (α in Np/m)
 *   short λ/2, open λ/4  → series RLC:   R = Z0 α ℓ,   L = R Q0/ω0,  C = 1/(ω0² L)
 *   open λ/2, short λ/4  → parallel RLC: R = Z0/(α ℓ), C = Q0/(ω0 R), L = 1/(ω0² C)
 */
var TR_C = 2.99792458e8;

function trCalc() {
  clearError();
  var type = document.getElementById('tr-type').value;
  var Z0 = parseFloat(document.getElementById('tr-z0').value);
  var f0 = parseFloat(document.getElementById('tr-f0').value) * 1e9;
  var adBm = parseFloat(document.getElementById('tr-a').value);
  var er = parseFloat(document.getElementById('tr-er').value);
  if (isNaN(Z0) || Z0 <= 0 || isNaN(f0) || f0 <= 0) { showError('Enter positive Z0 and f0.'); return; }
  if (isNaN(adBm) || adBm < 0) { showError('Enter the attenuation (dB/m).'); return; }
  if (isNaN(er) || er <= 0) er = 1;

  var alpha = adBm / 8.685889638;                  // Np/m
  var lam = TR_C / (f0 * Math.sqrt(er));            // guide wavelength
  var beta = 2 * Math.PI / lam;
  var w0 = 2 * Math.PI * f0;
  var quarter = (type[1] === '4');
  var len = quarter ? lam / 4 : lam / 2;
  var series = (type === 's2' || type === 'o4');

  var Q0 = alpha > 0 ? beta / (2 * alpha) : Infinity;
  document.getElementById('tr-len').textContent = engFmt(len, 'm');
  document.getElementById('tr-lam').textContent = engFmt(lam, 'm');
  document.getElementById('tr-beh').textContent = series ? 'series RLC' : 'parallel RLC';
  document.getElementById('tr-q').textContent = isFinite(Q0) ? Math.round(Q0).toLocaleString() : '∞ (lossless)';

  if (alpha > 0) {
    if (series) {
      var Rs = Z0 * alpha * len;
      var Ls = Rs * Q0 / w0, Cs = 1 / (w0 * w0 * Ls);
      document.getElementById('tr-r').textContent = engFmt(Rs, 'Ω');
      document.getElementById('tr-lc').textContent = engFmt(Ls, 'H') + ' / ' + engFmt(Cs, 'F');
    } else {
      var Rp = Z0 / (alpha * len);
      var Cp = Q0 / (w0 * Rp), Lp = 1 / (w0 * w0 * Cp);
      document.getElementById('tr-r').textContent = engFmt(Rp, 'Ω');
      document.getElementById('tr-lc').textContent = engFmt(Lp, 'H') + ' / ' + engFmt(Cp, 'F');
    }
  } else {
    document.getElementById('tr-r').textContent = '— (lossless)';
    document.getElementById('tr-lc').textContent = '—';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
