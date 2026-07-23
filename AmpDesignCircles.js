/* exported acCalc, acLoadExample, acCircles */
/*
 * Amplifier design circles — Pozar Microwave Engineering Ch. 12
 *   Δ = S11 S22 - S12 S21
 *   K = (1-|S11|²-|S22|²+|Δ|²)/(2|S12 S21|)
 *   μ = (1-|S11|²)/(|S22-Δ S11*| + |S12 S21|)
 *   input stability (ΓS):  C = (S11-Δ S22*)* / (|S11|²-|Δ|²), R = |S12 S21/(|S11|²-|Δ|²)|
 *   output stability (ΓL): C = (S22-Δ S11*)* / (|S22|²-|Δ|²), R = |S12 S21/(|S22|²-|Δ|²)|
 *   avail. gain (ΓS), ga=Ga/|S21|²:  C = ga(S11-Δ S22*)* / (1+ga(|S11|²-|Δ|²)),
 *                                    R = √(1-2K|S12 S21|ga+(|S12 S21|ga)²)/|1+ga(|S11|²-|Δ|²)|
 *   NF (ΓS), N=(F-Fmin)|1+Γopt|²/(4rn): C = Γopt/(1+N), R = √(N(N+1-|Γopt|²))/(1+N)
 */
var acCircles;

function csub(a, b) { return [a[0]-b[0], a[1]-b[1]]; }
function cmul(a, b) { return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; }
function cdiv(a, b) { var d = b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d, (a[1]*b[0]-a[0]*b[1])/d]; }
function cconj(a) { return [a[0], -a[1]]; }
function cmag(a) { return Math.hypot(a[0], a[1]); }
function cscale(a, k) { return [a[0]*k, a[1]*k]; }
function polar(m, deg) { var r = deg * Math.PI / 180; return [m*Math.cos(r), m*Math.sin(r)]; }
function fmtC(C, R) { return cmag(C).toFixed(3) + '∠' + (Math.atan2(C[1], C[0])*180/Math.PI).toFixed(1) + '°, r=' + R.toFixed(3); }

function getS(idm, ida) {
  var m = parseFloat(document.getElementById(idm).value);
  var a = parseFloat(document.getElementById(ida).value);
  if (isNaN(m) || isNaN(a)) return null;
  return polar(m, a);
}

function acCalc() {
  clearError();
  var S11 = getS('ac-s11m', 'ac-s11a'), S21 = getS('ac-s21m', 'ac-s21a');
  var S12 = getS('ac-s12m', 'ac-s12a'), S22 = getS('ac-s22m', 'ac-s22a');
  if (!S11 || !S21 || !S12 || !S22) { showError('Enter all four S-parameters as mag ∠ angle.'); return; }

  var D = csub(cmul(S11, S22), cmul(S12, S21));      // Δ
  var s11a2 = S11[0]*S11[0]+S11[1]*S11[1];
  var s22a2 = S22[0]*S22[0]+S22[1]*S22[1];
  var Da2 = D[0]*D[0]+D[1]*D[1];
  var s12s21 = cmag(cmul(S12, S21));
  var K = (1 - s11a2 - s22a2 + Da2) / (2 * s12s21);
  var mu = (1 - s11a2) / (cmag(csub(S22, cmul(D, cconj(S11)))) + s12s21);

  document.getElementById('ac-k').textContent = K.toFixed(3);
  document.getElementById('ac-delta').textContent = Math.sqrt(Da2).toFixed(3);
  document.getElementById('ac-mu').textContent = mu.toFixed(3);
  var stable = (K > 1 && Math.sqrt(Da2) < 1);
  document.getElementById('ac-verdict').textContent = stable ? 'unconditionally stable' : 'potentially unstable';
  if (stable) {
    var mag = cmag(cdiv(S21, S12)) * (K - Math.sqrt(K * K - 1));
    document.getElementById('ac-mag').textContent = (10*Math.log10(mag)).toFixed(2) + ' dB (MAG)';
  } else {
    document.getElementById('ac-mag').textContent = (10*Math.log10(cmag(cdiv(S21, S12)))).toFixed(2) + ' dB (MSG)';
  }

  acCircles = [];

  // stability circles
  var denS = s11a2 - Da2;
  var Cs = cscale(cconj(csub(S11, cmul(D, cconj(S22)))), 1/denS);
  var Rs = Math.abs(s12s21 / denS);
  document.getElementById('ac-cin').textContent = fmtC(Cs, Rs);
  acCircles.push({ cre: Cs[0], cim: Cs[1], r: Rs, color: '#c0392b', dash: true, name: 'input stability' });

  var denL = s22a2 - Da2;
  var Cl = cscale(cconj(csub(S22, cmul(D, cconj(S11)))), 1/denL);
  var Rl = Math.abs(s12s21 / denL);
  document.getElementById('ac-cout').textContent = fmtC(Cl, Rl);

  // available-gain circle (ΓS plane)
  var GadB = parseFloat(document.getElementById('ac-ga').value);
  if (!isNaN(GadB)) {
    var s21a2 = S21[0]*S21[0]+S21[1]*S21[1];
    var ga = Math.pow(10, GadB/10) / s21a2;
    var den = 1 + ga * (s11a2 - Da2);
    var arg = 1 - 2*K*s12s21*ga + Math.pow(s12s21*ga, 2);
    if (arg < 0) {
      document.getElementById('ac-cga').textContent = 'Ga exceeds MAG (unreachable)';
    } else {
      var Cga = cscale(cconj(csub(S11, cmul(D, cconj(S22)))), ga/den);
      var Rga = Math.sqrt(arg) / Math.abs(den);
      document.getElementById('ac-cga').textContent = fmtC(Cga, Rga);
      acCircles.push({ cre: Cga[0], cim: Cga[1], r: Rga, color: '#5533aa', dash: false, name: 'gain ' + GadB + ' dB' });
    }
  } else {
    document.getElementById('ac-cga').textContent = '— (enter Ga)';
  }

  // noise-figure circle (ΓS plane)
  var FmindB = parseFloat(document.getElementById('ac-fmin').value);
  var Gopt = getS('ac-goptm', 'ac-gopta');
  var rn = parseFloat(document.getElementById('ac-rn').value);
  var NFdB = parseFloat(document.getElementById('ac-nf').value);
  if (!isNaN(FmindB) && Gopt && !isNaN(rn) && !isNaN(NFdB)) {
    var Fmin = Math.pow(10, FmindB/10), F = Math.pow(10, NFdB/10);
    var gopt2 = Gopt[0]*Gopt[0]+Gopt[1]*Gopt[1];
    var one_gopt2 = (1+Gopt[0])*(1+Gopt[0]) + Gopt[1]*Gopt[1];
    var N = (F - Fmin) * one_gopt2 / (4 * rn);
    if (N < 0) { document.getElementById('ac-cnf').textContent = 'NF below Fmin'; }
    else {
      var Cnf = cscale(Gopt, 1/(1+N));
      var Rnf = Math.sqrt(N * (N + 1 - gopt2)) / (1 + N);
      document.getElementById('ac-cnf').textContent = fmtC(Cnf, Rnf);
      acCircles.push({ cre: Cnf[0], cim: Cnf[1], r: Rnf, color: '#2d7a4a', dash: false, name: 'NF ' + NFdB + ' dB' });
    }
  } else {
    document.getElementById('ac-cnf').textContent = '— (enter Fmin, Γopt, rn, NF)';
  }

  if (window.drawDiagram) window.drawDiagram();
}

function acLoadExample() {
  var v = { 'ac-s11m': '0.6', 'ac-s11a': '-60', 'ac-s21m': '1.9', 'ac-s21a': '81',
    'ac-s12m': '0.05', 'ac-s12a': '26', 'ac-s22m': '0.5', 'ac-s22a': '-60',
    'ac-ga': '8', 'ac-fmin': '1.6', 'ac-goptm': '0.62', 'ac-gopta': '100', 'ac-rn': '0.2', 'ac-nf': '2.0' };
  Object.keys(v).forEach(function (k) { document.getElementById(k).value = v[k]; });
  acCalc();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
