
document.getElementById('fr-btn').addEventListener('click', function() {
    var Pt = parseFloat(document.getElementById('fr-pt').value); // dBm
    var Gt = parseFloat(document.getElementById('fr-gt').value); // dBi
    var Gr = parseFloat(document.getElementById('fr-gr').value); // dBi
    var d  = parseFloat(document.getElementById('fr-d').value);
    var f  = parseFloat(document.getElementById('fr-f').value)
           * parseFloat(document.getElementById('fr-fu').value);
    if ([Pt,Gt,Gr,d,f].some(isNaN) || d<=0 || f<=0) {
        document.getElementById('fr-out').innerHTML = 'Please enter valid values.'; return;
    }
    var lam = 3e8/f;
    var FSPL_dB = 20*Math.log10(4*Math.PI*d/lam); // free space path loss
    var Pr_dBm  = Pt + Gt + Gr - FSPL_dB;
    var Pr_W    = 1e-3 * Math.pow(10, Pr_dBm/10);
    var out = 'Free-space path loss = ' + FSPL_dB.toFixed(3) + ' dB<br>'
            + 'P<sub>r</sub> = ' + Pr_dBm.toFixed(3) + ' dBm<br>'
            + 'P<sub>r</sub> = ' + math.format(Pr_W,{notation:'engineering',precision:4}) + ' W';
    document.getElementById('fr-out').innerHTML = out;
});
