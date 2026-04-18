/* LC BALUN Calculator */

var TOPO_NOTES = {
    lattice:  'Lattice BALUN: uses 2 inductors and 2 capacitors. Works for any impedance ratio. Provides ±45° phase shift on each balanced output (90° total split). The impedance transformation ratio equals (Zbal/Zunbal).',
    pi:       'LC \u03c0-BALUN: one series inductor + two shunt capacitors (low-pass type). Simple and compact. For a 1:1 impedance ratio use Zunbal = Zbal; for 1:4 ratio (e.g. 50\u03a9 \u2192 200\u03a9) use the built-in transformation.',
    marchand: 'Marchand BALUN (lumped approximation): equivalent LC network near the design frequency. True Marchand uses \u03bb/4 coupled lines; this gives the equivalent series L and shunt C valid in a ~10% bandwidth around f.'
};

var TOPO_EQ = {
    lattice:
        '<p>\\begin{align}' +
        'L &= \\frac{\\sqrt{Z_{unbal}\\cdot Z_{bal}}}{\\omega} \\\\' +
        'C &= \\frac{1}{\\omega\\sqrt{Z_{unbal}\\cdot Z_{bal}}}' +
        '\\end{align}</p>',
    pi:
        '<p>\\begin{align}' +
        'L &= \\frac{\\sqrt{Z_{unbal}\\cdot Z_{bal}}}{\\omega} \\\\' +
        'C_{shunt} &= \\frac{1}{\\omega\\sqrt{Z_{unbal}\\cdot Z_{bal}}}' +
        '\\end{align}</p>',
    marchand:
        '<p>\\begin{align}' +
        'L_s &= \\frac{Z_0}{\\omega},\\quad C_p = \\frac{1}{\\omega Z_0}\\\\' +
        'Z_0 &= \\sqrt{Z_{unbal}\\cdot Z_{bal}}' +
        '\\end{align}</p>'
};

function topoChange() {
    var topo = document.getElementById('bl-topo').value;
    document.getElementById('bl-note').textContent = TOPO_NOTES[topo];
    document.getElementById('bl-eq').innerHTML = TOPO_EQ[topo];
    if (window.MathJax) MathJax.typesetPromise();
    // Show/hide extra result rows
    var hasFour = (topo === 'lattice');
    document.getElementById('bl-r3-p').style.display = hasFour ? '' : 'none';
    document.getElementById('bl-r4-p').style.display = hasFour ? '' : 'none';
    // Update labels
    if (topo === 'lattice') {
        document.getElementById('bl-r1-p').firstChild.textContent = 'L\u2081 = ';
        document.getElementById('bl-r2-p').firstChild.textContent = 'C\u2081 = ';
        document.getElementById('bl-r3-p').firstChild.textContent = 'L\u2082 = ';
        document.getElementById('bl-r4-p').firstChild.textContent = 'C\u2082 = ';
    } else if (topo === 'pi') {
        document.getElementById('bl-r1-p').firstChild.textContent = 'L (series) = ';
        document.getElementById('bl-r2-p').firstChild.textContent = 'C (each shunt) = ';
    } else {
        document.getElementById('bl-r1-p').firstChild.textContent = 'L\u209b (series) = ';
        document.getElementById('bl-r2-p').firstChild.textContent = 'C\u209a (shunt) = ';
    }
    document.getElementById('bl-r1').textContent = '\u2014';
    document.getElementById('bl-r2').textContent = '\u2014';
    document.getElementById('bl-r3').textContent = '\u2014';
    document.getElementById('bl-r4').textContent = '\u2014';
    document.getElementById('bl-ratio').textContent = '\u2014';
    document.getElementById('bl-Q').textContent = '\u2014';
    clearError();
}

document.getElementById('bl-btn').addEventListener('click', function() {
    var f    = parseFloat(document.getElementById('bl-f').value)
             * parseFloat(document.getElementById('bl-fu').value);
    var Zu   = parseFloat(document.getElementById('bl-zu').value);
    var Zb   = parseFloat(document.getElementById('bl-zb').value);
    var topo = document.getElementById('bl-topo').value;
    clearError();
    if (isNaN(f) || f <= 0) { showError('Please enter a valid positive frequency.'); return; }
    if (isNaN(Zu) || Zu <= 0) { showError('Unbalanced port impedance must be positive.'); return; }
    if (isNaN(Zb) || Zb <= 0) { showError('Balanced port impedance must be positive.'); return; }

    var w  = 2 * Math.PI * f;
    var Zm = Math.sqrt(Zu * Zb);   // geometric mean impedance
    var ratio = Zb / Zu;
    var fmt = function(v) { return math.format(v, {notation:'engineering', precision:4}); };

    if (topo === 'lattice') {
        // Lattice BALUN: L = Zm/w, C = 1/(w*Zm) for each arm
        var L = Zm / w;
        var C = 1 / (w * Zm);
        // Q ≈ Zm / (series resistance) — ideal here so just show bandwidth estimate
        var Q = Math.sqrt(ratio) * 0.5 * (1 / Math.sqrt(ratio - 1 + 1e-9));
        document.getElementById('bl-r1').textContent = fmt(L) + ' H';
        document.getElementById('bl-r2').textContent = fmt(C) + ' F';
        document.getElementById('bl-r3').textContent = fmt(L) + ' H';
        document.getElementById('bl-r4').textContent = fmt(C) + ' F';
        document.getElementById('bl-Q').textContent  = (ratio >= 1.01 ? Math.sqrt(ratio / (ratio - 1)).toFixed(3) : 'N/A (1:1 ratio)');
    } else if (topo === 'pi') {
        // Pi BALUN: series L = Zm/w, shunt C = 1/(w*Zm) on each side
        var Lpi  = Zm / w;
        var Cpi  = 1 / (w * Zm);
        var Qpi  = Zm / Math.sqrt(Zu * Zb);
        document.getElementById('bl-r1').textContent = fmt(Lpi) + ' H';
        document.getElementById('bl-r2').textContent = fmt(Cpi) + ' F';
        document.getElementById('bl-Q').textContent  = Qpi.toFixed(3);
    } else {
        // Marchand lumped approximation: Ls = Z0/w, Cp = 1/(w*Z0)
        var Z0m  = Zm;
        var Lm   = Z0m / w;
        var Cm   = 1 / (w * Z0m);
        var Qm   = Math.PI / 2;   // inherent Q of Marchand structure
        document.getElementById('bl-r1').textContent = fmt(Lm) + ' H';
        document.getElementById('bl-r2').textContent = fmt(Cm) + ' F';
        document.getElementById('bl-Q').textContent  = Qm.toFixed(3) + ' (inherent \u03bb/4 resonator Q)';
    }

    document.getElementById('bl-ratio').textContent = ratio.toFixed(3) + ':1 (' + Zu + '\u03a9 \u2192 ' + Zb + '\u03a9)';
});

function showError(msg) { document.getElementById('error').textContent = msg; }
function clearError()   { document.getElementById('error').textContent = ''; }

// Init
topoChange();
