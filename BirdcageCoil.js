/* Birdcage resonator — unified low-/high-/band-pass model
 *
 * Per-branch series reactance:
 *   leg  : X_leg (ω)  = ωL_leg − 1/(ωC_leg)    (C_leg = ∞ ⇒ no leg cap)
 *   ring : X_ring(ω)  = ωL_arc − 1/(ωC_ring)   (C_ring = ∞ ⇒ no ring cap)
 * Mode-m resonance (Hayes/Tropp):
 *   X_leg(ω_m) + 4·sin²(mπ/N)·X_ring(ω_m) = 0
 *   ⇒ ω_m² = [1/C_leg + 4sin²(mπ/N)/C_ring] / [L_leg + 4sin²(mπ/N)·L_arc]
 *
 *   LP  (C_ring→∞): solve C_leg  = 1 / [ω₀²·L₁]
 *   HP  (C_leg→∞) : solve C_ring = 4sin²(π/N) / [ω₀²·L₁]
 *   BP  (both)    : user gives C_ring, solve C_leg = 1 / [ω₀²·L₁ − 4sin²(π/N)/C_ring]
 *   where L₁ = L_leg + 4sin²(π/N)·L_arc
 */
var MU0 = 4 * Math.PI * 1e-7;
function rosaInductance(length_m, diam_m) {
  var L = MU0 / (2 * Math.PI) * length_m * (Math.log(2 * length_m / diam_m) - 0.75);
  return Math.max(0, L);
}

/* exported bcType */
function bcType() {
  var bp = document.getElementById('bc-type').value === 'bp';
  document.getElementById('bc-cring-row').style.display = bp ? '' : 'none';
}

document.getElementById('bc-btn').addEventListener('click', function () {
  var N = parseInt(document.getElementById('bc-n').value, 10);
  var r = parseFloat(document.getElementById('bc-r').value) * 1e-3;
  var len = parseFloat(document.getElementById('bc-l').value) * 1e-3;
  var d = parseFloat(document.getElementById('bc-d').value) * 1e-3;
  var type = document.getElementById('bc-type').value;
  var f0 = parseFloat(document.getElementById('bc-f').value) * 1e6;
  var err = document.getElementById('error'); err.textContent = '';
  if ([N, r, len, d, f0].some(isNaN) || N < 4 || r <= 0 || len <= 0 || d <= 0 || f0 <= 0) {
    err.textContent = 'Enter valid values. N must be ≥ 4.'; return;
  }
  var w0 = 2 * Math.PI * f0;
  var L_leg = rosaInductance(len, d);
  var L_arc = rosaInductance(2 * Math.PI * r / N, d);
  var s2 = Math.pow(Math.sin(Math.PI / N), 2);   // sin²(π/N)  (mode m = 1)
  var L1 = L_leg + 4 * s2 * L_arc;
  var Cleg = NaN, Cring = NaN;
  if (type === 'lp') {
    Cleg = 1 / (w0 * w0 * L1);
  } else if (type === 'hp') {
    Cring = 4 * s2 / (w0 * w0 * L1);
  } else { // bp — user supplies the end-ring capacitor, we solve the leg capacitor
    Cring = parseFloat(document.getElementById('bc-cring').value) * 1e-12;
    if (isNaN(Cring) || Cring <= 0) { err.textContent = 'Enter a valid end-ring capacitor C_ring (pF).'; return; }
    var denom = w0 * w0 * L1 - 4 * s2 / Cring;
    if (denom <= 0) { err.textContent = 'Ring capacitor is too small for a band-pass design at this frequency — increase C_ring.'; return; }
    Cleg = 1 / denom;
  }
  function modeFreq(m) {
    var sm2 = Math.pow(Math.sin(m * Math.PI / N), 2);
    var Lm = L_leg + 4 * sm2 * L_arc;
    var invC = (isFinite(Cleg) ? 1 / Cleg : 0) + (isFinite(Cring) ? 4 * sm2 / Cring : 0);
    return Math.sqrt(invC / Lm) / (2 * Math.PI);
  }
  var f1 = modeFreq(1), f2 = modeFreq(2);
  var msep = Math.abs((f2 - f1) / f1) * 100;
  var rho = 1.72e-8, area = Math.PI * Math.pow(d / 2, 2), R_leg = rho * len / area;
  var Q = w0 * L_leg / R_leg;
  document.getElementById('bc-Lleg').textContent = engFmt(L_leg, 'H');
  document.getElementById('bc-Larc').textContent = engFmt(L_arc, 'H');
  document.getElementById('bc-Cleg').textContent = isFinite(Cleg) ? engFmt(Cleg, 'F') : '— (continuous leg)';
  document.getElementById('bc-Cring').textContent = isFinite(Cring) ? engFmt(Cring, 'F') : '— (continuous ring)';
  document.getElementById('bc-f1').textContent = (f1 / 1e6).toFixed(2) + ' MHz';
  document.getElementById('bc-f2').textContent = (f2 / 1e6).toFixed(2) + ' MHz';
  document.getElementById('bc-msep').textContent = msep.toFixed(1) + '%';
  document.getElementById('bc-Q').textContent = Q.toFixed(0);
  if (window.drawDiagram) drawDiagram(N, type);
});

// ── Unrolled birdcage ladder: two end rings + legs, capacitors per type ──────
// eslint-disable-next-line no-redeclare
function drawDiagram(N, type) {
  if (!N) { N = 16; type = 'lp'; }
  var W = 460, H = 214, PUR = '#5533aa', ACC = '#AA77FF';
  var legRing = (type === 'lp' || type === 'bp'); // caps in legs
  var ringCap = (type === 'hp' || type === 'bp'); // caps in end-ring segments
  var nLegs = 7, x0 = 46, x1 = W - 46, yTop = 58, yBot = 156, cg = 4, ph = 7;
  var xs = [];
  for (var i = 0; i < nLegs; i++) xs.push(x0 + (x1 - x0) * i / (nLegs - 1));
  function wire(a, b, c, d) { return '<line x1="' + a + '" y1="' + b + '" x2="' + c + '" y2="' + d + '" stroke="' + PUR + '" stroke-width="2" stroke-linecap="round"/>'; }
  function capH(cx, cy) { // capacitor on a horizontal wire
    return '<line x1="' + (cx - cg) + '" y1="' + (cy - ph) + '" x2="' + (cx - cg) + '" y2="' + (cy + ph) + '" stroke="' + ACC + '" stroke-width="2.6" stroke-linecap="round"/>' +
           '<line x1="' + (cx + cg) + '" y1="' + (cy - ph) + '" x2="' + (cx + cg) + '" y2="' + (cy + ph) + '" stroke="' + ACC + '" stroke-width="2.6" stroke-linecap="round"/>';
  }
  function capV(cx, cy) { // capacitor on a vertical wire
    return '<line x1="' + (cx - ph) + '" y1="' + (cy - cg) + '" x2="' + (cx + ph) + '" y2="' + (cy - cg) + '" stroke="' + ACC + '" stroke-width="2.6" stroke-linecap="round"/>' +
           '<line x1="' + (cx - ph) + '" y1="' + (cy + cg) + '" x2="' + (cx + ph) + '" y2="' + (cy + cg) + '" stroke="' + ACC + '" stroke-width="2.6" stroke-linecap="round"/>';
  }
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  s += '<rect width="' + W + '" height="' + H + '" fill="#faf9ff" rx="4"/>';
  // End rings (top & bottom) — one segment between each pair of legs
  [yTop, yBot].forEach(function (y) {
    for (var k = 0; k < nLegs - 1; k++) {
      var a = xs[k], b = xs[k + 1], mid = (a + b) / 2;
      if (ringCap) { s += wire(a, y, mid - cg, y) + capH(mid, y) + wire(mid + cg, y, b, y); }
      else { s += wire(a, y, b, y); }
    }
  });
  // Legs (rungs) — vertical, cap in the middle for LP/BP
  var midY = (yTop + yBot) / 2;
  xs.forEach(function (x) {
    if (legRing) { s += wire(x, yTop, x, midY - cg) + capV(x, midY) + wire(x, midY + cg, x, yBot); }
    else { s += wire(x, yTop, x, yBot); }
    s += '<circle cx="' + x + '" cy="' + yTop + '" r="2.4" fill="' + PUR + '"/><circle cx="' + x + '" cy="' + yBot + '" r="2.4" fill="' + PUR + '"/>';
  });
  // Labels
  s += '<text x="' + (x0 - 8) + '" y="' + (yTop - 10) + '" text-anchor="start" font-size="9.5" fill="#888">end ring</text>';
  s += '<text x="' + (x0 - 8) + '" y="' + (yBot + 18) + '" text-anchor="start" font-size="9.5" fill="#888">end ring</text>';
  s += '<text x="' + (x1 + 6) + '" y="' + (midY + 3) + '" text-anchor="start" font-size="9.5" fill="#888">legs</text>';
  var name = { lp: 'Low-pass — C in legs', hp: 'High-pass — C in end rings', bp: 'Band-pass — C in legs & rings' }[type];
  s += '<text x="' + (W / 2) + '" y="18" text-anchor="middle" font-size="11" fill="' + PUR + '" font-weight="bold">' + name + '</text>';
  s += '<text x="' + (W / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="9.5" fill="#888">unrolled cage · showing 7 of N = ' + N + ' rungs</text>';
  s += '</svg>';
  document.getElementById('tool-diagram').innerHTML = s;
}
