/* LC Circuit Solver — bidirectional: given any two of {L, C, f₀}, solve for the third */
document.getElementById('lc-btn').addEventListener('click', lc_solve);

var Lmul_map = {'1':1e-6,'2':1e-9,'3':1e-12};
var Cmul_map = {'1':1e-6,'2':1e-9,'3':1e-12};
var fmul_map = {'0':1e3,'1':1e6,'2':1e9,'3':1e12};

function lc_solve() {
  clearError();
  clearResults();

  var Lstr = document.getElementById('L').value.trim();
  var Cstr = document.getElementById('C').value.trim();
  var fstr = document.getElementById('f').value.trim();

  var LFilled = Lstr !== '';
  var CFilled = Cstr !== '';
  var fFilled = fstr !== '';
  var filled = (LFilled ? 1 : 0) + (CFilled ? 1 : 0) + (fFilled ? 1 : 0);

  if (filled < 2) { showError('Fill in any two fields; leave the third blank to solve for it.'); return; }
  if (filled === 3) { showError('Leave one field blank — the tool solves for the missing variable.'); return; }

  var Lmul = Lmul_map[document.getElementById('L-unit').value];
  var Cmul = Cmul_map[document.getElementById('C-unit').value];
  var fmul = fmul_map[document.getElementById('f-unit').value];

  var Lv, Cv, fv, solved;

  if (!fFilled) {
    Lv = parseFloat(Lstr) * Lmul;
    Cv = parseFloat(Cstr) * Cmul;
    if (!(Lv > 0) || !(Cv > 0)) { showError('Enter valid positive values for L and C.'); return; }
    fv = 1 / (2 * Math.PI * Math.sqrt(Lv * Cv));
    solved = 'f';
  } else if (!CFilled) {
    Lv = parseFloat(Lstr) * Lmul;
    fv = parseFloat(fstr) * fmul;
    if (!(Lv > 0) || !(fv > 0)) { showError('Enter valid positive values for L and f.'); return; }
    Cv = 1 / (4 * Math.PI * Math.PI * fv * fv * Lv);
    solved = 'C';
  } else {
    Cv = parseFloat(Cstr) * Cmul;
    fv = parseFloat(fstr) * fmul;
    if (!(Cv > 0) || !(fv > 0)) { showError('Enter valid positive values for C and f.'); return; }
    Lv = 1 / (4 * Math.PI * Math.PI * fv * fv * Cv);
    solved = 'L';
  }

  showResults(Lv, Cv, fv, solved);
  if (window.drawDiagram) window.drawDiagram(Lv, Cv, fv);
}

function showResults(L, C, f, solved) {
  var container = document.getElementById('lc-results');
  container.style.display = 'grid';
  var highlight = 'font-weight:700;color:#AA77FF;';
  var card = document.createElement('div');
  card.className = 'res-card';
  card.innerHTML =
    '<h4>LC Resonance</h4>' +
    resRow('Inductance, L',          engFmt(L, 'H'),           solved === 'L' ? highlight : '') +
    resRow('Capacitance, C',         engFmt(C, 'F'),           solved === 'C' ? highlight : '') +
    resRow('Resonant frequency, f₀', engFmt(f, 'Hz'),          solved === 'f' ? highlight : '') +
    resRow('Angular frequency, ω₀',  engFmt(2*Math.PI*f,'rad/s'), '');
  container.appendChild(card);
}

function resRow(lbl, val, style) {
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val" style="' + style + '">' + val + '</span></div>';
}

function clearResults() {
  var container = document.getElementById('lc-results');
  container.innerHTML = '';
  container.style.display = '';
}

function showError(msg) {
  var el = document.getElementById('lc-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('lc-error');
  if (el) el.textContent = '';
}
