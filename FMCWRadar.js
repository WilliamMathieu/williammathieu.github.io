/* exported fmCalc */
/*
 * FMCW radar
 *   S       = B / T_chirp                chirp slope (Hz/s)
 *   ΔR      = c / (2B)                   range resolution
 *   f_beat  = 2 R S / c                  beat frequency for a target at range R
 *   λ       = c / f0
 *   v_max   = λ / (4 T_chirp)            max unambiguous velocity
 *   Δv      = λ / (2 N T_chirp)          velocity resolution
 *   Ref: Richards, Fundamentals of Radar Signal Processing 2e.
 */
var FM_C = 2.99792458e8;

function fmCalc() {
  clearError();
  var B = parseFloat(document.getElementById('fm-b').value) * 1e9;   // Hz
  var T = parseFloat(document.getElementById('fm-t').value) * 1e-6;  // s
  var f0 = parseFloat(document.getElementById('fm-f0').value) * 1e9; // Hz
  var N = parseFloat(document.getElementById('fm-n').value);
  var R = parseFloat(document.getElementById('fm-r').value);         // m

  if (isNaN(B) || B <= 0) { showError('Enter a positive sweep bandwidth (GHz).'); return; }
  if (isNaN(T) || T <= 0) { showError('Enter a positive chirp time (µs).'); return; }

  var S = B / T;
  var dR = FM_C / (2 * B);
  document.getElementById('fm-dr').textContent = engFmt(dR, 'm');
  document.getElementById('fm-s').textContent = engFmt(S, 'Hz/s');

  if (!isNaN(R) && R >= 0) {
    document.getElementById('fm-beat').textContent = engFmt(2 * R * S / FM_C, 'Hz');
  } else {
    document.getElementById('fm-beat').textContent = '— (enter R)';
  }

  if (!isNaN(f0) && f0 > 0) {
    var lam = FM_C / f0;
    document.getElementById('fm-lam').textContent = engFmt(lam, 'm');
    document.getElementById('fm-vmax').textContent = '±' + engFmt(lam / (4 * T), 'm/s');
    if (!isNaN(N) && N > 0) {
      document.getElementById('fm-dv').textContent = engFmt(lam / (2 * N * T), 'm/s');
    } else {
      document.getElementById('fm-dv').textContent = '— (enter N)';
    }
  } else {
    document.getElementById('fm-lam').textContent = '— (enter f0)';
    document.getElementById('fm-vmax').textContent = '— (enter f0)';
    document.getElementById('fm-dv').textContent = '— (enter f0, N)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
