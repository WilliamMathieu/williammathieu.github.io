/* exported ktCalc, ktResp, ktLcur */
/*
 * Tapered-line matching — Pozar §5.8
 *   Γ0 = ½ ln(R_L/Z0),  θ = βL = 2π(L/λ)
 *   Exponential:  |Γ| = Γ0 |sinθ/θ|                (cutoff θ=π, L=λ/2)
 *   Triangular:   |Γ| = Γ0 (sin(θ/2)/(θ/2))²       (cutoff θ=2π, L=λ)
 *   Klopfenstein: A = acosh(Γ0/Γm)
 *                 θ≥A: |Γ| = Γm|cos√(θ²-A²)|
 *                 θ<A: |Γ| = Γ0 cosh√(A²-θ²)/cosh A   (cutoff θ=A)
 */
var ktG0Cur = 0, ktLcur = 0, ktTypeCur = 'klop', ktACur = 0, ktGmCur = 0;

function ktResp(Llam) {
  var th = 2 * Math.PI * Llam;
  if (ktTypeCur === 'exp') {
    return th === 0 ? ktG0Cur : ktG0Cur * Math.abs(Math.sin(th) / th);
  }
  if (ktTypeCur === 'tri') {
    var h = th / 2;
    return h === 0 ? ktG0Cur : ktG0Cur * Math.pow(Math.sin(h) / h, 2);
  }
  // klopfenstein
  var A = ktACur;
  if (th >= A) return ktGmCur * Math.abs(Math.cos(Math.sqrt(th * th - A * A)));
  return ktG0Cur * Math.cosh(Math.sqrt(A * A - th * th)) / Math.cosh(A);
}

function ktCalc() {
  clearError();
  var Z0 = parseFloat(document.getElementById('kt-z0').value);
  var RL = parseFloat(document.getElementById('kt-rl').value);
  var type = document.getElementById('kt-type').value;
  var Llam = parseFloat(document.getElementById('kt-l').value);
  var Gm = parseFloat(document.getElementById('kt-gm').value);
  if (isNaN(Z0) || Z0 <= 0 || isNaN(RL) || RL <= 0) { showError('Enter positive Z0 and R_L.'); return; }
  if (isNaN(Llam) || Llam <= 0) { showError('Enter a positive taper length (λ).'); return; }

  var G0 = Math.abs(Math.log(RL / Z0) / 2);
  ktG0Cur = G0; ktLcur = Llam; ktTypeCur = type;

  var cutoff, A = NaN;
  if (type === 'exp') { cutoff = 0.5; }
  else if (type === 'tri') { cutoff = 1.0; }
  else {
    if (isNaN(Gm) || Gm <= 0 || Gm >= G0) { showError('Klopfenstein ripple Γm must be between 0 and Γ₀ = ' + G0.toFixed(4) + '.'); return; }
    A = Math.acosh(G0 / Gm);
    ktACur = A; ktGmCur = Gm;
    cutoff = A / (2 * Math.PI);
  }

  var g = ktResp(Llam);
  document.getElementById('kt-g').textContent = g.toFixed(4);
  document.getElementById('kt-vswr').textContent = g < 0.9999 ? ((1 + g) / (1 - g)).toFixed(3) : '∞';
  document.getElementById('kt-rl2').textContent = g > 0 ? (-20 * Math.log10(g)).toFixed(2) + ' dB' : '∞ dB';
  document.getElementById('kt-g0').textContent = G0.toFixed(4) + '  (VSWR ' + ((1 + Math.tanh(G0)) / (1 - Math.tanh(G0))).toFixed(2) + ')';
  document.getElementById('kt-cut').textContent = cutoff.toFixed(4) + ' λ';
  document.getElementById('kt-a').textContent = isNaN(A) ? '— (Klopfenstein only)' : A.toFixed(4);

  if (window.drawDiagram) window.drawDiagram();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
