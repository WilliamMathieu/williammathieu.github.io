/* Directional Coupler / Hybrid Calculator */

var C0 = 2.998e8;

document.getElementById('coup-btn').addEventListener('click', coup_calc);
document.getElementById('coup-type').addEventListener('change', coup_type_change);

function coup_type_change() {
  var t = document.getElementById('coup-type').value;
  document.getElementById('coup-db-row').style.display   = (t === 'coupled') ? '' : 'none';
  document.getElementById('coup-ratio-row').style.display = (t !== 'coupled') ? '' : 'none';
}

function coup_calc() {
  clearError();
  var type = document.getElementById('coup-type').value;
  var fv   = parseFloat(document.getElementById('coup-f').value);
  var fmul = parseFloat(document.getElementById('coup-f-unit').value);
  var Z0   = parseFloat(document.getElementById('coup-z0').value) || 50;
  if (!(fv > 0)) { showError('Enter a valid frequency.'); return; }
  var f = fv * fmul;

  var res;
  if (type === 'coupled')    res = calc_coupled(f, Z0);
  else if (type === 'branch') res = calc_branchline(f, Z0);
  else                        res = calc_ratrace(f, Z0);

  if (res) {
    show_results(res, type, Z0, f);
    if (window.drawDiagram) window.drawDiagram(res, type);
  }
}

// ─── Coupled-line directional coupler ────────────────────────────────────────
function calc_coupled(f, Z0) {
  var Cdb = parseFloat(document.getElementById('coup-C').value);
  if (isNaN(Cdb) || Cdb <= 0) { showError('Enter a valid coupling value C > 0 dB.'); return null; }
  var C  = Math.pow(10, -Cdb/20);          // voltage coupling coefficient (linear)
  var Ze = Z0 * Math.sqrt((1+C)/(1-C));    // even-mode impedance
  var Zo = Z0 * Math.sqrt((1-C)/(1+C));    // odd-mode impedance
  var lam4 = C0 / (4 * f);                  // free-space λ/4 (use εeff if substrate specified)
  var isolation_db = Cdb;                   // ideal: isolation = coupling (symmetric)
  var throughLoss  = -10*Math.log10(1 - C*C);  // insertion loss from coupling
  return { Ze:Ze, Zo:Zo, lam4:lam4, C:C, Cdb:Cdb,
           through_loss:throughLoss, isolation:isolation_db };
}

// ─── Branchline (90° hybrid) coupler ─────────────────────────────────────────
function calc_branchline(f, Z0) {
  var ratioStr = document.getElementById('coup-ratio').value;
  var ratio = parseFloat(ratioStr);  // power split ratio P2/P3 (e.g. 1 for 3 dB equal split)
  if (isNaN(ratio) || ratio < 0) { showError('Enter a valid power split ratio (e.g. 1 for equal split).'); return null; }

  // For branchline: equal split (3 dB) unless ratio specified
  // Standard 90° hybrid: Z_shunt = Z0, Z_series = Z0/√2
  // Unequal split: Z_shunt_in = Z0·√(1+ratio), Z_shunt_out = Z0·√((1+ratio)/ratio)
  // ... using standard result for unequal power ratio R = P2/P3
  var R = ratio || 1;  // default equal split
  var Z_through = Z0 / Math.sqrt(1 + R);   // shunt arm toward through port
  var Z_coupled  = Z0 / Math.sqrt(1 + 1/R);// shunt arm toward coupled port
  var Z_series   = Z0;                       // series arms (both ports)
  var lam4 = C0 / (4 * f);

  var coup_db   = 10 * Math.log10(1 + R);   // coupling ratio to through port
  var through_db = 10 * Math.log10(1 + 1/R);

  return {
    Z_series: Z_series, Z_through: Z_through, Z_coupled: Z_coupled,
    lam4: lam4,
    coup_db: coup_db, through_db: through_db,
    phase_diff: 90,
    type_label: 'Branchline (90° Hybrid)'
  };
}

// ─── Rat-race (180° hybrid / ring) coupler ───────────────────────────────────
function calc_ratrace(f, Z0) {
  // Rat-race: ring with Z_ring = Z0·√2, circumference = 3λ/2
  var Z_ring = Z0 * Math.SQRT2;
  var lam = C0 / f;
  var ring_circumference = 1.5 * lam;
  var lam4 = C0 / (4 * f);

  return {
    Z_ring: Z_ring,
    ring_circ: ring_circumference,
    lam4: lam4,
    phase_diff: 180,
    type_label: 'Rat-Race (180° Hybrid)'
  };
}

function show_results(res, type, Z0, f) {
  var container = document.getElementById('coup-results');
  container.innerHTML = '';
  container.style.display = 'grid';
  var card = document.createElement('div');
  card.className = 'res-card';

  if (type === 'coupled') {
    card.innerHTML = '<h4>Coupled-Line Directional Coupler</h4>' +
      rr('Coupling, C',             res.Cdb.toFixed(1) + ' dB  (|C| = ' + (res.C*100).toFixed(1) + '%)') +
      rr('Even-mode impedance, Z<sub>oe</sub>', res.Ze.toFixed(2) + ' Ω', true) +
      rr('Odd-mode impedance, Z<sub>oo</sub>',  res.Zo.toFixed(2) + ' Ω', true) +
      rr('λ/4 length at f',         engFmt(res.lam4,'m')) +
      rr('Through-port insertion loss', res.through_loss.toFixed(3) + ' dB') +
      rr('Ideal isolation',         res.isolation.toFixed(1) + ' dB (= coupling)');

  } else if (type === 'branch') {
    card.innerHTML = '<h4>' + res.type_label + '</h4>' +
      rr('Series arm impedance',    res.Z_series.toFixed(2) + ' Ω') +
      rr('Shunt arm Z (through)',   res.Z_through.toFixed(2) + ' Ω', true) +
      rr('Shunt arm Z (coupled)',   res.Z_coupled.toFixed(2) + ' Ω', true) +
      rr('Arm length (λ/4)',        engFmt(res.lam4,'m')) +
      rr('Coupling',                res.coup_db.toFixed(2) + ' dB') +
      rr('Through-port loss',       res.through_db.toFixed(2) + ' dB') +
      rr('Port phase difference',   res.phase_diff + '°');
  } else {
    card.innerHTML = '<h4>' + res.type_label + '</h4>' +
      rr('Ring characteristic Z',   res.Z_ring.toFixed(2) + ' Ω (= Z₀√2)', true) +
      rr('Ring circumference',      engFmt(res.ring_circ,'m') + ' (= 3λ/2)') +
      rr('λ/4 section length',      engFmt(res.lam4,'m')) +
      rr('Equal power split',       '3.01 dB per output') +
      rr('Port phase difference',   '0° (sum) or 180° (difference)');
  }
  container.appendChild(card);
}

function rr(lbl, val, hi) {
  var s = hi ? ' style="font-weight:700;color:#AA77FF;"' : '';
  return '<div class="res-row"><span class="res-lbl">' + lbl + '</span>' +
         '<span class="res-val"' + s + '>' + val + '</span></div>';
}

function showError(msg) {
  var el = document.getElementById('coup-error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('coup-error');
  if (el) el.textContent = '';
}
