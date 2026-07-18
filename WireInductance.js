/* Wire inductance — straight wire, circular loop, two-wire line
 *
 *   straight wire:  L = mu0*l/(2*pi) * (ln(2l/r) - 3/4)
 *   circular loop:  L = mu0*R * (ln(8R/r) - 2)
 *   two-wire line:  L = (mu0/pi) * ln(s/r) * l    (loop inductance of the pair)
 *   External (low-frequency) inductance; skin effect removes the internal part at RF.
 *
 *   References: Grover, Inductance Calculations; C. R. Paul, Inductance 2010.
 */
var MU0 = 1.25663706212e-6; // H/m

var btn = document.getElementById("btn");
btn.addEventListener('click', function() {
  var shape = document.getElementById("shape").value;
  var dw  = parseFloat(document.getElementById("dw").value);  // mm
  var len = parseFloat(document.getElementById("len").value); // mm
  var D   = parseFloat(document.getElementById("D").value);   // mm
  var sp  = parseFloat(document.getElementById("s").value);   // mm
  var f   = parseFloat(document.getElementById("f").value);   // MHz
  clearError();

  if (isNaN(dw) || dw <= 0) { showError('Enter a positive wire diameter.'); return; }
  var r = (dw / 2) * 1e-3; // m
  var L, Lpm = null;

  if (shape === 'wire') {
    if (isNaN(len) || len <= 0) { showError('Enter a positive wire length.'); return; }
    var l = len * 1e-3;
    L = MU0 * l / (2 * Math.PI) * (Math.log(2 * l / r) - 0.75);
    Lpm = L / l;
  } else if (shape === 'loop') {
    if (isNaN(D) || D <= 0) { showError('Enter a positive loop diameter.'); return; }
    var R = (D / 2) * 1e-3;
    if (R <= r) { showError('Loop radius must exceed the wire radius.'); return; }
    L = MU0 * R * (Math.log(8 * R / r) - 2);
  } else { // two-wire
    if (isNaN(sp) || isNaN(len) || sp <= 0 || len <= 0) { showError('Enter a positive spacing and length.'); return; }
    var sm = sp * 1e-3, lm = len * 1e-3;
    if (sm <= r) { showError('Spacing must exceed the wire radius.'); return; }
    Lpm = MU0 / Math.PI * Math.log(sm / r);
    L = Lpm * lm;
  }

  document.getElementById("L").textContent   = engFmt(L, 'H');
  document.getElementById("Lpm").textContent = (Lpm !== null) ? engFmt(Lpm, 'H/m') : '—';

  if (!isNaN(f) && f > 0) {
    document.getElementById("XL").textContent = engFmt(2 * Math.PI * f * 1e6 * L, 'Ω') + ' @ ' + f + ' MHz';
  } else {
    document.getElementById("XL").textContent = '— (enter f)';
  }

  if (window.drawDiagram) window.drawDiagram();
});

function showError(msg) {
  var el = document.getElementById('error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('error');
  if (el) el.textContent = '';
}
