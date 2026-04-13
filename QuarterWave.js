
document.getElementById('qw-btn').addEventListener('click', function() {
    var Z1 = parseFloat(document.getElementById('qw-z1').value);
    var Z2 = parseFloat(document.getElementById('qw-z2').value);
    var f  = parseFloat(document.getElementById('qw-f').value)
           * parseFloat(document.getElementById('qw-fu').value);
    var er = parseFloat(document.getElementById('qw-er').value) || 1;
    if ([Z1,Z2,f].some(isNaN) || Z1<=0 || Z2<=0 || f<=0) {
        document.getElementById('qw-out').innerHTML = 'Please enter valid values.'; return;
    }
    var Zt  = Math.sqrt(Z1*Z2);
    var lam = 3e8 / (f * Math.sqrt(er));
    var l   = lam / 4;
    var out = 'Z<sub>transformer</sub> = ' + Zt.toFixed(4) + ' \u03A9<br>'
            + 'Physical length = ' + (l*1000).toFixed(4) + ' mm<br>'
            + '(\u03bb/4 in medium with \u03b5<sub>r</sub> = ' + er + ')';
    document.getElementById('qw-out').innerHTML = out;
});
