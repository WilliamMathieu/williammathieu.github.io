
document.getElementById('cx-btn').addEventListener('click', function() {
    var d  = parseFloat(document.getElementById('cx-d').value);
    var D  = parseFloat(document.getElementById('cx-D').value);
    var er = parseFloat(document.getElementById('cx-er').value);
    if ([d,D,er].some(isNaN) || d<=0 || D<=d || er<=0) {
        document.getElementById('cx-out').innerHTML = 'Please enter valid values (D must be > d).'; return;
    }
    var ratio = D / d;
    var Z0 = 60 / Math.sqrt(er) * Math.log(ratio);
    var C  = 2*Math.PI*8.854e-12*er / Math.log(ratio); // F/m
    var L  = 4*Math.PI*1e-7 / (2*Math.PI) * Math.log(ratio); // H/m
    var vp = 3e8 / Math.sqrt(er);
    var fc = 1e-9 * vp / (Math.PI * (D+d)/2 * 1e-3); // TM11 cutoff GHz
    var out = 'Z\u2080 = ' + Z0.toFixed(3) + ' \u03A9<br>'
            + 'C = ' + (C*1e12).toFixed(4) + ' pF/m<br>'
            + 'L = ' + (L*1e9).toFixed(4) + ' nH/m<br>'
            + 'v<sub>p</sub> = ' + (vp/1e8).toFixed(4) + ' \u00d7 10\u2078 m/s<br>'
            + 'Cutoff (TM\u2081\u2081) \u2248 ' + fc.toFixed(4) + ' GHz';
    document.getElementById('cx-out').innerHTML = out;
});
