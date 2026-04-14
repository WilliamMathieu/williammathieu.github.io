
document.getElementById('pa-btn').addEventListener('click', function() {
    var f  = parseFloat(document.getElementById('pa-f').value)
           * parseFloat(document.getElementById('pa-fu').value);
    var er = parseFloat(document.getElementById('pa-er').value);
    var h  = parseFloat(document.getElementById('pa-h').value) * 1e-3;
    if ([f,er,h].some(isNaN) || f<=0 || er<=0 || h<=0) {
        document.getElementById('pa-out').innerHTML = 'Please enter valid values.'; return;
    }
    var c = 3e8;
    // Patch width W
    var W = c / (2*f) * Math.sqrt(2/(er+1));
    // Effective dielectric constant
    var erEff = (er+1)/2 + (er-1)/2 * Math.pow(1 + 12*h/W, -0.5);
    // Effective length extension
    var dL = 0.412*h*(erEff+0.3)*(W/h+0.264) / ((erEff-0.258)*(W/h+0.8));
    // Patch length L
    var Leff = c / (2*f*Math.sqrt(erEff));
    var L = Leff - 2*dL;
    var out = '<p>Patch width W = ' + (W*1000).toFixed(3) + ' mm</p><p>'
            + 'Patch length L = ' + (L*1000).toFixed(3) + ' mm</p><p>'
            + '\u03b5<sub>reff</sub> = ' + erEff.toFixed(4) + '</p><p>'
            + '\u0394L (end extension) = ' + (dL*1000).toFixed(4) + ' mm';
    document.getElementById('pa-out').innerHTML = out + '</p>';
});
