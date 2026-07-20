/* exported mtCalc, mtLastZ, mtLastZ0, mtLastRL */
/*
 * Multisection quarter-wave transformer — Pozar §5.6 (binomial) & §5.7 (Chebyshev)
 *   Binomial:  ln(Z_{n+1}/Z_n) = 2^-N C(N,n) ln(R_L/Z0)
 *   Chebyshev: Γ(θ)=A e^{-jNθ} T_N(secθm cosθ), A=Γm, secθm=cosh[(1/N)acosh(Γ0/Γm)]
 *              expand T_N(secθm cosθ) into a cosine series; ln(Z_{n+1}/Z_n)=2Γn.
 *   Fractional BW = 2 - (4/π)θm.  Γ0 = |ln(R_L/Z0)/2|.
 *   The section impedances are re-checked by sweeping the exact cascade.
 */
var mtLastZ, mtLastZ0, mtLastRL;

function binom(n, k) { var r = 1; for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); }

// Chebyshev polynomial T_N(u) coefficient array (index = power of u)
function chebCoeffs(N) {
  var Tm = [1], T = [0, 1];   // T0, T1
  if (N === 0) return Tm;
  if (N === 1) return T;
  for (var n = 2; n <= N; n++) {
    var Tn = new Array(n + 1).fill(0);
    for (var i = 0; i < T.length; i++) Tn[i + 1] += 2 * T[i];   // 2u*T_{n-1}
    for (var j = 0; j < Tm.length; j++) Tn[j] -= Tm[j];         // - T_{n-2}
    Tm = T; T = Tn;
  }
  return T;
}

// cosine-series coefficients F[m] of  Σ p[k] cos^k θ   (F[m] = coeff of cos mθ)
function cosSeries(p) {
  var F = {};
  for (var k = 0; k < p.length; k++) {
    if (!p[k]) continue;
    for (var j = 0; j <= k; j++) {
      var m = Math.abs(k - 2 * j);
      F[m] = (F[m] || 0) + p[k] * binom(k, j) / Math.pow(2, k);
    }
  }
  return F;
}

function mtCalc() {
  clearError();
  var Z0 = parseFloat(document.getElementById('mt-z0').value);
  var RL = parseFloat(document.getElementById('mt-rl').value);
  var N = parseInt(document.getElementById('mt-n').value);
  var type = document.getElementById('mt-type').value;
  var Gm = parseFloat(document.getElementById('mt-gm').value);
  if (isNaN(Z0) || Z0 <= 0 || isNaN(RL) || RL <= 0) { showError('Enter positive Z0 and R_L.'); return; }
  if (isNaN(N) || N < 1 || N > 8) { showError('Sections N must be 1–8.'); return; }
  if (isNaN(Gm) || Gm <= 0 || Gm >= 1) Gm = 0.05;

  var L = Math.log(RL / Z0);
  var G0 = Math.abs(L / 2);                  // small-reflection Γ(0)
  var Z = [];                                // section impedances Z_1..Z_N
  var theta_m;

  if (type === 'binomial') {
    var Zprev = Z0;
    for (var n = 0; n < N; n++) {
      var lnr = Math.pow(2, -N) * binom(N, n) * L;
      Zprev = Zprev * Math.exp(lnr);
      Z.push(Zprev);
    }
    if (Gm >= G0) { theta_m = null; }        // threshold above DC reflection → full band
    else { theta_m = Math.acos(Math.pow(Gm / G0, 1 / N)); }
  } else {
    if (Gm >= G0) { showError('For Chebyshev, ripple Γm must be less than |ln(R_L/Z0)/2| = ' + G0.toFixed(4) + '.'); return; }
    var secm = Math.cosh((1 / N) * Math.acosh(G0 / Gm));
    theta_m = Math.acos(1 / secm);
    // expand A·T_N(secθm·cosθ):  substitute u = secm·x into T_N, get poly in x, then cos series
    var c = chebCoeffs(N);
    var p = c.map(function (ck, k) { return ck * Math.pow(secm, k); });
    var F = cosSeries(p);
    // Γn = Γm · F[N-2n] / 2 ;  ln(Z_{n+1}/Z_n) = 2Γn
    // Γ_n = Γm F[|N-2n|]/2, except the even-N middle term (m=0) has no ½ factor
    var Zp = Z0;
    for (var i = 0; i < N; i++) {
      var m = Math.abs(N - 2 * i);
      var Gn = (m === 0) ? Gm * (F[0] || 0) : Gm * (F[m] || 0) / 2;
      Zp = Zp * Math.exp(2 * Gn);
      Z.push(Zp);
    }
  }

  // fractional bandwidth
  var bw = (theta_m === null) ? 2 : (2 - (4 / Math.PI) * theta_m);
  document.getElementById('mt-bw').textContent = (bw * 100).toFixed(1) + ' %';
  document.getElementById('mt-vswr').textContent = ((1 + Gm) / (1 - Gm)).toFixed(3);

  // verification: sweep exact cascade across the passband, report max |Γ|
  var lo = 1 - bw / 2, hi = 1 + bw / 2;
  if (lo < 0.01) lo = 0.01;
  var gmaxSwept = 0;
  for (var f = lo; f <= hi + 1e-9; f += (hi - lo) / 200) {
    var g = sweepGamma(Z, Z0, RL, f);
    if (g > gmaxSwept) gmaxSwept = g;
  }
  document.getElementById('mt-check').textContent = gmaxSwept.toFixed(4) +
    ' (VSWR ' + ((1 + gmaxSwept) / (1 - gmaxSwept)).toFixed(3) + ')';

  // section list
  var html = '<div style="font-size:12px;font-family:monospace;">';
  html += '<div style="font-weight:bold;color:#5533aa;margin-bottom:4px;">Section impedances (source → load)</div>';
  html += '<table style="border-collapse:collapse;font-size:12px;"><tr style="color:#5533aa;"><td style="padding:2px 12px 2px 0;">Section</td><td style="padding:2px 12px;">Z (Ω)</td><td style="padding:2px 12px;">nearest 50Ω-normalised</td></tr>';
  for (var s = 0; s < Z.length; s++) {
    html += '<tr><td style="padding:2px 12px 2px 0;">' + (s + 1) + '</td><td style="padding:2px 12px;font-weight:bold;">' + Z[s].toFixed(2) + '</td><td style="padding:2px 12px;color:#888;">' + (Z[s] / Z0).toFixed(4) + ' Z0</td></tr>';
  }
  html += '</table></div>';
  document.getElementById('mt-sections').innerHTML = html;

  mtLastZ = Z; mtLastZ0 = Z0; mtLastRL = RL;
  if (window.drawDiagram) window.drawDiagram();
}

// exact input reflection of the λ/4-section cascade at normalized freq f=f/f0
function sweepGamma(Z, Z0, RL, f) {
  var bl = (Math.PI / 2) * f;                // electrical length of each section
  var t = Math.tan(bl);
  var zr = RL, zi = 0;                        // impedance, complex
  for (var i = Z.length - 1; i >= 0; i--) {
    var Zc = Z[i];
    // Zin = Zc (z + jZc t)/(Zc + j z t)
    var nr = zr, ni = zi + Zc * t;
    var dr = Zc - zi * t, di = zr * t;
    var den = dr * dr + di * di;
    var rr = (nr * dr + ni * di) / den;
    var ri = (ni * dr - nr * di) / den;
    zr = Zc * rr; zi = Zc * ri;
  }
  var gr = zr - Z0, gi = zi, hr = zr + Z0, hi = zi;
  return Math.hypot(gr, gi) / Math.hypot(hr, hi);
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
