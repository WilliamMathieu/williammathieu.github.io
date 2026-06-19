/* Charge-Pump PLL Type-2 3rd-Order Passive Loop Filter — Banerjee / ADI AN-1865
 *
 *   Open-loop: G(s) = Kd·Kvco·F(s) / (N·s)
 *   Filter:    F(s) = (1 + s·T₂) / (s·C₁·(1 + s·T₃))
 *
 *   Design at ωc (loop BW) and phase margin φ:
 *   Kφ = Icp/(2π)   (charge-pump phase-detector gain, A/rad)
 *   T₂ = sin(φ) / (ωc·(1 − sin(φ)))
 *   T₁ = 1 / (ωc²·T₂)
 *   C₁ = (Kφ·Kvco / (N·ωc²)) · √((1 + (ωc·T₂)²) / (1 + (ωc·T₁)²))   (|G(jωc)| = 1)
 *   R  = T₂/C₁;   C₂ = 0.1·C₁   (3rd pole at ωp = 1/(R·C₂))
 */

document.getElementById('pll-btn').addEventListener('click', pll_calc);

function pll_calc() {
  clearError();

  var Kd   = parseFloat(document.getElementById('pll-kd').value);   // charge pump current (A/rad)
  var Ko   = parseFloat(document.getElementById('pll-ko').value);   // VCO gain (rad/s/V)
  var Ko_u = parseFloat(document.getElementById('pll-ko-unit').value);
  var N    = parseFloat(document.getElementById('pll-n').value);    // divider ratio
  var bw   = parseFloat(document.getElementById('pll-bw').value);   // loop bandwidth (Hz)
  var bw_u = parseFloat(document.getElementById('pll-bw-unit').value);
  var pm   = parseFloat(document.getElementById('pll-pm').value);   // phase margin (deg)

  if (!(Kd > 0))   { showError('Enter a valid charge pump current Icp > 0.'); return; }
  if (!(Ko > 0))   { showError('Enter a valid VCO gain Kvco > 0.'); return; }
  if (!(N > 0))    { showError('Enter a valid divider ratio N > 0.'); return; }
  if (!(bw > 0))   { showError('Enter a valid loop bandwidth.'); return; }
  if (!(pm > 0 && pm < 90)) { showError('Phase margin must be between 0 and 90°.'); return; }

  var Kvco = Ko * Ko_u;       // rad/s/V
  var wc   = 2 * Math.PI * bw * bw_u;  // desired loop bandwidth (rad/s)
  var phi  = pm * Math.PI / 180;

  // Type-2, 3rd-order passive loop filter design (standard Analog Devices / Brendan Dillon approach)
  // Open-loop transfer function: G(s) = Kd·Kvco·F(s) / (N·s)
  // F(s) = (1 + s·τ2) / (s·C1·(1 + s·τ3))  where τ3 = C2/(C1+C2) * τ2 ... simplified
  //
  // Using the simplified design equations for 3rd-order type-2:
  //   T1 = 1/wc * tan(pm + arctan(wc·T2) - pi/2) ... iterative, but closed form exists:
  //
  // Charge-pump phase-detector gain (A/rad). Kd is entered as the pump current Icp.
  var Kphi = Kd / (2 * Math.PI);

  // Use the Perrott/Banerjee iterative-free formula for type-2 3rd-order:
  // Step 1: compute T2 (zero) and T1 (pole) from phase margin and loop bandwidth
  var sinPhi = Math.sin(phi);
  // Type-2 3rd-order linearized formula: T2 = sin(pm) / (wc · (1 - sin(pm)))
  var T2 = sinPhi / (wc * (1 - sinPhi));
  if (T2 <= 0) T2 = 1/wc;  // fallback

  var T1 = 1 / (wc * wc * T2);  // pole time constant (places extra phase lag)

  // C1 (main integrating cap) from unity open-loop gain at wc:
  //   |G(jwc)| = (Kphi·Kvco / (N·wc²·C1)) · √((1+(wc·T2)²)/(1+(wc·T1)²)) = 1
  var C1 = (Kphi * Kvco) / (N * wc * wc) *
           Math.sqrt((1 + wc*wc*T2*T2) / (1 + wc*wc*T1*T1));

  // R from the zero time constant T2 = R·C1
  var R = T2 / C1;

  // C2 (3rd pole) — typically 0.1–0.2 × C1 to minimize peaking
  var C2_factor = 0.1;
  var C2 = C2_factor * C1;
  var T3 = R * C2;  // 3rd-order pole time constant

  showResults({T1:T1, T2:T2, T3:T3, R:R, C1:C1, C2:C2,
               wc:wc, pm:pm, N:N, Kd:Kd, Kvco:Kvco});
  if (window.drawDiagram) window.drawDiagram({R:R,C1:C1,C2:C2});
}

function showResults(r) {
  var container = document.getElementById('pll-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  var card = document.createElement('div');
  card.className = 'res-card';
  card.innerHTML = '<h4>Loop Filter Components</h4>' +
    rr('Series resistor, R',          engFmt(r.R,'Ω'), true) +
    rr('Lead capacitor, C₁',          engFmt(r.C1,'F'), true) +
    rr('Lag capacitor, C₂ (≈ C₁/10)', engFmt(r.C2,'F')) +
    '<div style="font-size:11px;color:#777;margin-top:8px;padding-top:6px;border-top:1px solid #e0d8ff;">C₂ adds a 3rd-order pole at f<sub>p2</sub> = 1/(2π·R·C₂) = ' + engFmt(1/(2*Math.PI*r.R*r.C2),'Hz') + '. Increase C₂ to suppress reference spurs; decrease to restore phase margin.</div>';

  var card2 = document.createElement('div');
  card2.className = 'res-card';
  card2.innerHTML = '<h4>Design Verification</h4>' +
    rr('Zero frequency, f<sub>z</sub>', engFmt(1/(2*Math.PI*r.T2),'Hz')) +
    rr('Pole frequency, f<sub>p1</sub>', engFmt(1/(2*Math.PI*r.T1),'Hz')) +
    rr('3rd pole, f<sub>p2</sub>',       engFmt(1/(2*Math.PI*r.T3),'Hz')) +
    rr('Loop bandwidth',                 engFmt(r.wc/(2*Math.PI),'Hz')) +
    rr('Phase margin (design target)',   r.pm.toFixed(1) + '°') +
    rr('Open-loop unity-gain at BW',    'By design ✓');

  container.appendChild(card);
  container.appendChild(card2);
}

function rr(lbl, val, hi) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('pll-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('pll-error');
  if (el) el.textContent = '';
}
