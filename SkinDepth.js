
document.getElementById('sd-mat').addEventListener('change', function() {
    document.getElementById('sd-sigma').disabled = this.value !== 'custom';
});
document.getElementById('sd-btn').addEventListener('click', function() {
    var f   = parseFloat(document.getElementById('sd-f').value)
            * parseFloat(document.getElementById('sd-fu').value);
    var mat = document.getElementById('sd-mat').value;
    var sig = mat === 'custom'
            ? parseFloat(document.getElementById('sd-sigma').value)
            : parseFloat(mat);
    if (isNaN(f) || f<=0 || isNaN(sig) || sig<=0) {
        document.getElementById('sd-out').innerHTML = 'Enter valid values.'; return;
    }
    var mu  = 4*Math.PI*1e-7;
    var delta = Math.sqrt(2 / (2*Math.PI*f * mu * sig));
    var out = '\u03b4 = ' + math.format(delta, {notation:'engineering', precision:5}) + ' m<br>'
            + '\u03b4 = ' + (delta*1e6).toFixed(4) + ' \u03bcm<br>'
            + 'Resistance ratio R<sub>AC</sub>/R<sub>DC</sub> \u2248 r/(2\u03b4) for wire radius r';
    document.getElementById('sd-out').innerHTML = out;
});
