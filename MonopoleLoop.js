/* exported mlCalc, mlHint, mlLoadExample */
/*
 * Monopole & small loop
 *   λ = c/f0
 *   Monopole: ℓ = λ/4, Rr ≈ 36.5 Ω, G ≈ 5.15 dBi
 *   Small loop: C = π d, Rr = 20 π² (C/λ)⁴ N², G ≈ 1.76 dBi
 *   Ref: Kraus & Marhefka, Antennas 3e.
 */
var ML_C = 2.99792458e8;

function mlCalc() {
  clearError();
  var type = document.getElementById('ml-type').value;
  var f0 = parseFloat(document.getElementById('ml-f0').value) * 1e6;
  if (isNaN(f0) || f0 <= 0) { showError('Enter a positive frequency (MHz).'); return; }
  var lam = ML_C / f0;
  document.getElementById('ml-lam').textContent = engFmt(lam, 'm');

  if (type === 'monopole') {
    var len = lam / 4;
    document.getElementById('ml-size').textContent = engFmt(len, 'm') + ' (length)';
    document.getElementById('ml-frac').textContent = '0.25 λ';
    document.getElementById('ml-rr').textContent = '≈ 36.5 Ω';
    document.getElementById('ml-gain').textContent = '≈ 5.15 dBi';
  } else {
    var d = parseFloat(document.getElementById('ml-d').value);
    var N = parseFloat(document.getElementById('ml-n').value);
    if (isNaN(d) || d <= 0) { showError('Enter a positive loop diameter (m).'); return; }
    if (isNaN(N) || N < 1) N = 1;
    var C = Math.PI * d;
    var frac = C / lam;
    var Rr = 20 * Math.PI * Math.PI * Math.pow(frac, 4) * N * N;
    document.getElementById('ml-size').textContent = engFmt(C, 'm') + ' (circumf.)';
    document.getElementById('ml-frac').textContent = frac.toFixed(4) + ' λ';
    document.getElementById('ml-rr').textContent = engFmt(Rr, 'Ω');
    document.getElementById('ml-gain').textContent = '≈ 1.76 dBi';
    if (frac > 0.33) {
      showError('Note: circumference ≈ ' + frac.toFixed(2) + 'λ — the small-loop formula assumes C ≪ λ (≲ λ/3); treat as approximate.');
    }
  }

  if (window.drawDiagram) window.drawDiagram();
}

function mlHint() {
  var type = document.getElementById('ml-type').value;
  var sh = document.getElementById('ml-typehint');
  var dh = document.getElementById('ml-dhint');
  var nh = document.getElementById('ml-nhint');
  if (type === 'monopole') { sh.textContent = 'over ground plane'; dh.textContent = '(unused)'; nh.textContent = '(unused)'; }
  else { sh.textContent = 'magnetic loop'; dh.textContent = 'loop diameter'; nh.textContent = 'turns'; }
  if (window.drawDiagram) window.drawDiagram();
}

function mlLoadExample() {
  document.getElementById('ml-type').value = 'monopole';
  mlHint();
  document.getElementById('ml-f0').value = '100';
  document.getElementById('ml-d').value = '';
  document.getElementById('ml-n').value = '';
  mlCalc();
}

function showError(msg) { var el = document.getElementById('error'); if (el) el.textContent = msg; }
function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
