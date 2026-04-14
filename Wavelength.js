
document.getElementById('wl-btn').addEventListener('click', function() {
    var f  = parseFloat(document.getElementById('wl-f').value)
           * parseFloat(document.getElementById('wl-fu').value);
    var er = parseFloat(document.getElementById('wl-er').value) || 1;
    if (isNaN(f) || f<=0) { document.getElementById('wl-out').innerHTML = 'Enter a valid frequency.'; return; }
    var lam = 3e8 / (f * Math.sqrt(er));
    var out = '<p>\u03bb = ' + math.format(lam, {notation:'engineering', precision:5}) + ' m</p><p>'
            + '\u03bb/2 = ' + math.format(lam/2, {notation:'engineering', precision:5}) + ' m</p><p>'
            + '\u03bb/4 = ' + math.format(lam/4, {notation:'engineering', precision:5}) + ' m';
    document.getElementById('wl-out').innerHTML = out + '</p>';
});
