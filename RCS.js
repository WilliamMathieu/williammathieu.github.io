/* exported rcCalc, rcLoadExample, rcHint */
/*
 * Radar cross section — canonical optical-region shapes
 *   Sphere (a=radius):        σ = π a²
 *   Flat plate (a×b):         σ = 4π (a b)² / λ²
 *   Cylinder (a=radius, L):   σ = 2π a L² / λ
 *   Trihedral corner (a):     σ = 4π a⁴ / (3 λ²)
 *   λ = c / f0,  σ_dBsm = 10 log10(σ)
 *   Ref: Knott, Shaeffer & Tuley, Radar Cross Section 2e.
 */
var RC_C = 2.99792458e8;

function rcCalc() {
  clearError();
  var shape = document.getElementById('rc-shape').value;
  var a = parseFloat(document.getElementById('rc-a').value);
  var bL = parseFloat(document.getElementById('rc-b').value);
  var f0 = parseFloat(document.getElementById('rc-f0').value) * 1e9;

  if (isNaN(a) || a <= 0) { showError('Enter a positive primary dimension a (m).'); return; }
  if (isNaN(f0) || f0 <= 0) { showError('Enter a positive frequency (GHz).'); return; }
  var lam = RC_C / f0;

  var needsB = (shape === 'plate' || shape === 'cylinder');
  if (needsB && (isNaN(bL) || bL <= 0)) {
    showError('This shape needs the second dimension (b / L).');
    return;
  }

  var sig;
  if (shape === 'sphere') {
    sig = Math.PI * a * a;
  } else if (shape === 'plate') {
    var A = a * bL;
    sig = 4 * Math.PI * A * A / (lam * lam);
  } else if (shape === 'cylinder') {
    sig = 2 * Math.PI * a * bL * bL / lam;
  } else { // trihedral
    sig = 4 * Math.PI * Math.pow(a, 4) / (3 * lam * lam);
  }

  document.getElementById('rc-sig').textContent = fmtArea(sig);
  document.getElementById('rc-dbsm').textContent = (10 * Math.log10(sig)).toFixed(2) + ' dBsm';
  document.getElementById('rc-lam').textContent = engFmt(lam, 'm');

  // Optical-region validity hint
  if (a < 3 * lam) {
    showError('Note: a ≈ ' + (a / lam).toFixed(1) + 'λ — the optical-region formulas assume dimensions ≫ λ; treat as approximate.');
  }

  if (window.drawDiagram) window.drawDiagram();
}

function rcHint() {
  var shape = document.getElementById('rc-shape').value;
  var sh = document.getElementById('rc-shapehint');
  var ah = document.getElementById('rc-ahint');
  var bh = document.getElementById('rc-bhint');
  if (shape === 'sphere') { sh.textContent = 'a = radius'; ah.textContent = 'radius'; bh.textContent = '(unused)'; }
  else if (shape === 'plate') { sh.textContent = 'rectangular plate'; ah.textContent = 'plate side'; bh.textContent = 'plate side'; }
  else if (shape === 'cylinder') { sh.textContent = 'broadside cylinder'; ah.textContent = 'radius'; bh.textContent = 'length L'; }
  else { sh.textContent = 'corner reflector'; ah.textContent = 'edge length'; bh.textContent = '(unused)'; }
  if (window.drawDiagram) window.drawDiagram();
}

function rcLoadExample() {
  document.getElementById('rc-shape').value = 'plate';
  rcHint();
  document.getElementById('rc-a').value = '0.3';
  document.getElementById('rc-b').value = '0.3';
  document.getElementById('rc-f0').value = '10';
  rcCalc();
}

function fmtArea(x) {
  if (!isFinite(x)) return '∞';
  var a = Math.abs(x);
  if (a === 0) return '0 m²';
  if (a >= 1e-4) return parseFloat(x.toPrecision(4)) + ' m²';
  return x.toExponential(3) + ' m²';
}
function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
