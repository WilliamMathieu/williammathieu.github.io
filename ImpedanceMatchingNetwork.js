/* Impedance Matching Network Calculator */

document.getElementById('imn-btn').addEventListener('click', calculate);

function calculate() {
  clearError();

  var Rs = parseFloat(document.getElementById('imn-rs').value);
  var Xs = parseFloat(document.getElementById('imn-xs').value) || 0;
  var Rl = parseFloat(document.getElementById('imn-rl').value);
  var Xl = parseFloat(document.getElementById('imn-xl').value) || 0;
  var fv = parseFloat(document.getElementById('imn-f').value);
  var fu = parseFloat(document.getElementById('imn-fu').value);
  var Z0 = parseFloat(document.getElementById('imn-z0').value) || 50;

  if (isNaN(Rs) || Rs <= 0) { showError('Enter a valid source resistance Rs > 0.'); return; }
  if (isNaN(Rl) || Rl <= 0) { showError('Enter a valid load resistance Rl > 0.'); return; }
  if (isNaN(fv) || fv <= 0) { showError('Enter a valid frequency.'); return; }

  var f = fv * fu;
  var w = 2 * Math.PI * f;

  // Complex load impedance: Zl = Rl + jXl
  // Complex source impedance: Zs = Rs + jXs
  // Goal: find L-network such that Zin = Zs* = Rs - jXs (conjugate match)

  var Gl = Rl / (Rl*Rl + Xl*Xl);     // conductance of load
  var Bl = -Xl / (Rl*Rl + Xl*Xl);    // susceptance of load
  var ZsModSq = Rs*Rs + Xs*Xs;        // |Zs|^2

  var solutions = [];

  // ── Topology A: shunt element across Zl, then series element toward source ─
  // Condition: Rs <= |Zl|^2 / Rl  i.e. Rs*Gl^2 <= Gl - Gl^2*Rs...
  // disc_A = Gl*(1/Rs - Gl) = (Gl - Rs*Gl^2)/Rs
  var disc_A = Gl * (1/Rs - Gl);
  if (disc_A >= 0) {
    var sqrtA = Math.sqrt(disc_A);
    [+1, -1].forEach(function(sign) {
      var B = -Bl + sign * sqrtA;         // shunt susceptance
      // (Bl_new + B) = sign*sqrtA
      var Bl_new = Bl + B;                // = sign*sqrtA
      // Z_int = Gl/(Gl^2+Bl_new^2) - j*Bl_new/(Gl^2+Bl_new^2)
      // Re(Z_int) = Rs (by design)
      // Im(Z_int) = -Bl_new/(Gl^2+Bl_new^2) = -Bl_new*Rs/Gl
      var X_int = -Bl_new / (Gl * Gl + Bl_new * Bl_new);  // = -sign*sqrtA/(Gl/Rs)... = -Rs*Bl_new/Gl
      var X = -Xs - X_int;               // series reactance to cancel imaginary part
      solutions.push({
        topo: 'A', sign: sign,
        elem1: { type: 'shunt', X: -1/B },   // B = 1/(-X) => X = -1/B (reactance of shunt element)
        elem2: { type: 'series', X: X },
        B: B, Xseries: X,
        label: 'Shunt → Series'
      });
    });
  }

  // ── Topology B: series element added to Zl, then shunt element toward source ─
  // Condition: |Zs|^2 / Rs >= Rl  i.e. ZsModSq >= Rs*Rl
  var disc_B = Rl * (ZsModSq / Rs - Rl);
  if (disc_B >= 0) {
    var sqrtB = Math.sqrt(disc_B);
    [+1, -1].forEach(function(sign) {
      var X = -Xl + sign * sqrtB;         // series reactance
      var Rl2_XlX2 = Rl*Rl + (Xl + X)*(Xl + X);  // = Rl*ZsModSq/Rs by design
      var B = Xs / ZsModSq + (Xl + X) / Rl2_XlX2; // shunt susceptance
      solutions.push({
        topo: 'B', sign: sign,
        elem1: { type: 'series', X: X },
        elem2: { type: 'shunt', X: -1/B },
        B: B, Xseries: X,
        label: 'Series → Shunt'
      });
    });
  }

  if (solutions.length === 0) {
    showError('No realizable L-network solutions found. Check that Rs and Rl have different magnitudes, or try swapping source and load.');
    clearResults();
    return;
  }

  renderSolutions(solutions, w, Rs, Xs, Rl, Xl, Z0, f);
  if (window.drawMatchingDiagram) window.drawMatchingDiagram(solutions, Rs, Xs, Rl, Xl, Z0);
}

function renderSolutions(solutions, w, Rs, Xs, Rl, Xl, Z0, f) {
  var container = document.getElementById('imn-results');
  container.innerHTML = '';
  container.style.display = 'grid';

  solutions.forEach(function(sol, idx) {
    var e1 = sol.elem1, e2 = sol.elem2;

    // Element 1
    var c1 = componentFromX(e1.X, w, e1.type);
    // Element 2
    var c2 = componentFromX(e2.X, w, e2.type);

    // Q of matching (based on ratio of larger to smaller R)
    var Rhigh = Math.max(Rs, Rl), Rlow = Math.min(Rs, Rl);
    var Q = Math.sqrt(Rhigh / Rlow - 1);

    var card = document.createElement('div');
    card.className = 'res-card';
    card.innerHTML =
      '<h4>Solution ' + (idx+1) + ' — ' + sol.label + '</h4>' +
      '<div class="res-row"><span class="res-lbl">Network Q</span><span class="res-val">' + Q.toFixed(3) + '</span></div>' +
      '<div class="res-row"><span class="res-lbl">' + e1.type.charAt(0).toUpperCase()+e1.type.slice(1) + ' element 1</span>' +
        '<span class="res-val">' + c1.label + '</span></div>' +
      '<div class="res-row"><span class="res-lbl">' + e2.type.charAt(0).toUpperCase()+e2.type.slice(1) + ' element 2</span>' +
        '<span class="res-val">' + c2.label + '</span></div>';
    container.appendChild(card);
  });
}

function componentFromX(X, w, pos) {
  // X is reactance for series element, or -1/B for shunt element (in both cases: X>0 = inductor, X<0 = capacitor)
  if (Math.abs(X) < 1e-20) return { label: '0 (short)' };
  if (X > 0) {
    var L = X / w;
    return { label: engFmt(L, 'H'), type: 'L', value: L };
  } else {
    var C = -1 / (w * X);
    return { label: engFmt(C, 'F'), type: 'C', value: C };
  }
}

function clearResults() {
  var container = document.getElementById('imn-results');
  container.innerHTML = '';
}

function showError(msg) {
  var el = document.getElementById('imn-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('imn-error');
  if (el) el.textContent = '';
}
