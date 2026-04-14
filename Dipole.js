
document.getElementById('dp-btn').addEventListener('click', function() {
    var f = parseFloat(document.getElementById('dp-f').value)
          * parseFloat(document.getElementById('dp-fu').value);
    var k = parseFloat(document.getElementById('dp-k').value) || 0.95;
    if (isNaN(f) || f<=0) { document.getElementById('dp-out').innerHTML = 'Please enter a valid frequency.'; return; }
    var lam    = 3e8/f;
    var L_full = k*lam/2;
    var L_half_arm = L_full/2;
    var out = '<p>Full wavelength \u03bb = ' + (lam*1000).toFixed(2) + ' mm</p><p>'
            + 'Half-wave dipole total length = ' + (L_full*1000).toFixed(2) + ' mm</p><p>'
            + 'Each arm length = ' + (L_half_arm*1000).toFixed(2) + ' mm</p><p>'
            + 'Quarter-wave monopole = ' + (L_half_arm*1000).toFixed(2) + ' mm';
    document.getElementById('dp-out').innerHTML = out + '</p>';
});
