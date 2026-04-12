/* global document, math */

var btn = document.getElementById('btn');

btn.addEventListener('click', function () {
    var errorEl = document.getElementById('error');
    errorEl.innerHTML = '';

    var d_mm = parseFloat(document.getElementById('d').value);
    var D_mm = parseFloat(document.getElementById('D').value);
    var l_mm = parseFloat(document.getElementById('l').value);
    var N    = parseFloat(document.getElementById('N').value);
    var f    = parseFloat(document.getElementById('f').value);
    var f_dropdown = document.getElementById('f_dropdown').value;

    if (isNaN(d_mm) || isNaN(D_mm) || isNaN(l_mm) || isNaN(N) || isNaN(f)) {
        errorEl.innerHTML = 'Please fill in all fields with valid numbers.';
        return;
    }
    if (d_mm <= 0 || D_mm <= 0 || l_mm <= 0 || N <= 0 || f <= 0) {
        errorEl.innerHTML = 'All values must be positive.';
        return;
    }
    if (d_mm >= D_mm) {
        errorEl.innerHTML = 'Wire diameter must be smaller than coil diameter.';
        return;
    }

    // Convert to SI
    var d = d_mm * 1e-3;
    var D = D_mm * 1e-3;
    var l = l_mm * 1e-3;
    var r = D / 2.0;

    // Frequency in Hz
    var fHz;
    switch (f_dropdown) {
        case '0': fHz = f * 1e3;  break;
        case '1': fHz = f * 1e6;  break;
        case '2': fHz = f * 1e9;  break;
        case '3': fHz = f * 1e12; break;
        default:  fHz = f * 1e6;
    }

    var mu0 = 1.25663706e-6;

    // Inductance — Wheeler formula for short solenoid
    // L = (mu0 * N^2 * pi * r^2 / l) * (1 / (1 + 0.9 * r / l))
    var L = (mu0 * N * N * Math.PI * r * r / l) / (1.0 + 0.9 * (r / l));

    // Tuning capacitance: C = 1 / (4 * pi^2 * f^2 * L)
    var C = 1.0 / (4.0 * Math.PI * Math.PI * fHz * fHz * L);

    // Wire length: l_wire = N * pi * D
    var l_wire = N * Math.PI * D;

    // Wire resistance (copper): rho = 1.68e-8 ohm*m
    var rho = 1.68e-8;
    var r_wire = d / 2.0;
    var R = (rho * l_wire) / (Math.PI * r_wire * r_wire);

    // Q factor: Q = (1/R) * sqrt(L/C)
    var Q = (1.0 / R) * Math.sqrt(L / C);

    document.getElementById('L_out').innerHTML    = math.format(L,      { notation: 'engineering' }) + ' H';
    document.getElementById('C_out').innerHTML    = math.format(C,      { notation: 'engineering' }) + ' F';
    document.getElementById('R_out').innerHTML    = math.format(R,      { notation: 'engineering' }) + ' \u03A9';
    document.getElementById('Lwire_out').innerHTML = math.format(l_wire, { notation: 'engineering' }) + ' m';
    document.getElementById('Q_out').innerHTML    = math.format(Q,      { notation: 'engineering' });
});
