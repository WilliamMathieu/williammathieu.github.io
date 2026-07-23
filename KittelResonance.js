/* exported ktCalc */
/*
 * Ferrite gyromagnetic resonance — Pozar §9.2
 *   γ/2π = 2.8025 (g/2) MHz/Oe
 *   f0 = γ H0 ,  fm = γ (4πMs)   [GHz with fields in Oe/Gauss]
 *   sphere: f_res = f0 ; in-plane film: √(f0(f0+fm)) ; ⟂ film: f0 - fm
 *   Polder: μ = 1 + f0 fm/(f0²-f²) ,  κ = f fm/(f0²-f²)
 */
var GAMMA_MHz_Oe = 2.8025;   // for g = 2

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }

function ktCalc() {
  clearError();
  var H0 = parseFloat(document.getElementById('kt-h0').value);
  var Ms = parseFloat(document.getElementById('kt-ms').value);
  var f = parseFloat(document.getElementById('kt-f').value);
  var g = parseFloat(document.getElementById('kt-g').value);
  var shape = document.getElementById('kt-shape').value;

  if (isNaN(H0) || H0 <= 0) { showError('Enter a positive bias field H₀ (Oe).'); return; }
  if (isNaN(Ms) || Ms <= 0) { showError('Enter a positive 4πM_s (Gauss).'); return; }
  if (isNaN(g) || g <= 0) g = 2;

  var gam = GAMMA_MHz_Oe * (g / 2);   // MHz/Oe
  var f0 = gam * H0 / 1000;           // GHz
  var fm = gam * Ms / 1000;           // GHz

  var fres, note = '';
  if (shape === 'inplane') {
    fres = Math.sqrt(f0 * (f0 + fm));
  } else if (shape === 'perp') {
    fres = f0 - fm;
    if (fres <= 0) note = ' (needs H₀ > 4πM_s to resonate)';
  } else {
    fres = f0;
  }

  document.getElementById('kt-gam').textContent = gam.toFixed(3) + ' MHz/Oe';
  document.getElementById('kt-f0').textContent = f0.toFixed(3) + ' GHz';
  document.getElementById('kt-fm').textContent = fm.toFixed(3) + ' GHz';
  document.getElementById('kt-fr').textContent = fres.toFixed(3) + ' GHz' + note;

  if (!isNaN(f) && f > 0) {
    var den = f0 * f0 - f * f;
    if (Math.abs(den) < 1e-6) {
      document.getElementById('kt-mu').textContent = '→ ∞ (at resonance)';
      document.getElementById('kt-kap').textContent = '→ ∞ (at resonance)';
      document.getElementById('kt-mpm').textContent = '—';
      document.getElementById('kt-meff').textContent = '—';
    } else {
      var mu = 1 + f0 * fm / den;
      var kap = f * fm / den;
      var muEff = (mu * mu - kap * kap) / mu;
      document.getElementById('kt-mu').textContent = mu.toFixed(3);
      document.getElementById('kt-kap').textContent = kap.toFixed(3);
      document.getElementById('kt-mpm').textContent = (mu + kap).toFixed(3) + ' / ' + (mu - kap).toFixed(3);
      document.getElementById('kt-meff').textContent = muEff.toFixed(3);
    }
  } else {
    document.getElementById('kt-mu').textContent = '— (enter f)';
    document.getElementById('kt-kap').textContent = '—';
    document.getElementById('kt-mpm').textContent = '—';
    document.getElementById('kt-meff').textContent = '—';
  }

  if (window.drawDiagram) window.drawDiagram();
}
