/* exported bfCalc, bfHint */
/*
 * Bode–Fano matching limit — Pozar §5.9
 *   Parallel RC:  ∫ ln(1/|Γ|) dω ≤ π/(RC) = K
 *   Series RL:    ∫ ln(1/|Γ|) dω ≤ πR/L   = K
 *   Rectangular band |Γ|=Γm over Δω:  Δω ln(1/Γm) ≤ K
 *     → Δω_max = K/ln(1/Γm) ;  Γm_min = exp(-K/Δω)
 */

function bfCalc() {
  clearError();
  var type = document.getElementById('bf-type').value;
  var R = parseFloat(document.getElementById('bf-r').value);
  var X = parseFloat(document.getElementById('bf-x').value);
  var f0 = parseFloat(document.getElementById('bf-f0').value) * 1e9;
  var Gm = parseFloat(document.getElementById('bf-gm').value);
  var bwPct = parseFloat(document.getElementById('bf-bw').value);
  if (isNaN(R) || R <= 0) { showError('Enter a positive load resistance R.'); return; }
  if (isNaN(X) || X <= 0) { showError('Enter the load reactive element.'); return; }
  if (isNaN(f0) || f0 <= 0) { showError('Enter the center frequency f0 (GHz).'); return; }

  var K, Q;
  if (type === 'rc') {
    var C = X * 1e-12;
    K = Math.PI / (R * C);                 // rad/s
    Q = 2 * Math.PI * f0 * R * C;          // parallel RC quality factor ωRC
  } else {
    var L = X * 1e-9;
    K = Math.PI * R / L;
    Q = 2 * Math.PI * f0 * L / R;          // series RL quality factor ωL/R
  }
  document.getElementById('bf-k').textContent = engFmt(K, 'rad/s');
  document.getElementById('bf-q').textContent = Q.toFixed(3);

  // target ripple -> max bandwidth
  if (!isNaN(Gm) && Gm > 0 && Gm < 1) {
    var dwMax = K / Math.log(1 / Gm);      // rad/s
    var fracMax = dwMax / (2 * Math.PI * f0);
    document.getElementById('bf-maxbw').textContent = (fracMax * 100).toFixed(1) + ' %';
    document.getElementById('bf-maxbwa').textContent = engFmt(dwMax / (2 * Math.PI), 'Hz');
  } else {
    document.getElementById('bf-maxbw').textContent = '— (enter Γm)';
    document.getElementById('bf-maxbwa').textContent = '—';
  }

  // target bandwidth -> best (min) ripple
  if (!isNaN(bwPct) && bwPct > 0) {
    var dw = (bwPct / 100) * 2 * Math.PI * f0;
    var GmMin = Math.exp(-K / dw);
    document.getElementById('bf-mingm').textContent = GmMin.toFixed(4);
    var vswr = GmMin < 0.9999 ? (1 + GmMin) / (1 - GmMin) : Infinity;
    var rl = GmMin > 0 ? (-20 * Math.log10(GmMin)).toFixed(2) : '∞';
    document.getElementById('bf-bestvswr').textContent = vswr.toFixed(3) + '  /  ' + rl + ' dB';
  } else {
    document.getElementById('bf-mingm').textContent = '— (enter BW)';
    document.getElementById('bf-bestvswr').textContent = '—';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function bfHint() {
  var rc = document.getElementById('bf-type').value === 'rc';
  document.getElementById('bf-xlabel').textContent = rc ? 'C' : 'L';
  document.getElementById('bf-xunit').textContent = rc ? 'pF' : 'nH';
  document.getElementById('bf-xhint').textContent = rc ? 'capacitance' : 'inductance';
  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
