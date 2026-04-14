
document.getElementById('st-btn').addEventListener('click', function() {
    var f   = parseFloat(document.getElementById('st-f').value)
            * parseFloat(document.getElementById('st-fu').value);
    var Z0  = parseFloat(document.getElementById('st-z0').value);
    var B   = parseFloat(document.getElementById('st-B').value) * 1e-3; // S
    var typ = document.getElementById('st-type').value;
    if ([f,Z0,B].some(isNaN) || f<=0 || Z0<=0) {
        document.getElementById('st-out').innerHTML = 'Please enter valid values.'; return;
    }
    var Y0 = 1/Z0;
    var lam = 3e8/f; // free-space wavelength (electrical)
    // For shunt stub: B_stub = B_target
    // Short stub: B = Y0 * cot(beta*l) => beta*l = atan(Y0/B) (mod pi)
    // Open stub:  B = -Y0 * tan(beta*l) => beta*l = atan(-Y0/B) (mod pi)
    var betaL;
    if (typ === 'short') {
        betaL = Math.atan2(Y0, B); // atan(Y0/B)
        if (betaL < 0) betaL += Math.PI;
    } else {
        betaL = Math.atan2(-Y0, B);
        if (betaL < 0) betaL += Math.PI;
    }
    var l_elec = betaL; // radians
    var l_m    = l_elec / (2*Math.PI) * lam;
    var l_deg  = l_elec * 180 / Math.PI;
    var out = '<p>Electrical length = ' + l_deg.toFixed(3) + '\u00b0</p><p>'
            + 'Physical length = ' + (l_m*1000).toFixed(4) + ' mm (free space)</p><p>'
            + '(\u03bb/4 = ' + (lam/4*1000).toFixed(4) + ' mm)';
    document.getElementById('st-out').innerHTML = out + '</p>';
});
