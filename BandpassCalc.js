
document.getElementById('bp-btn').addEventListener('click', function() {
    var L   = parseFloat(document.getElementById('bp-L').value)
            * parseFloat(document.getElementById('bp-Lu').value);
    var C   = parseFloat(document.getElementById('bp-C').value)
            * parseFloat(document.getElementById('bp-Cu').value);
    var R   = parseFloat(document.getElementById('bp-R').value);
    var cfg = document.getElementById('bp-config').value;
    if ([L,C,R].some(isNaN)||L<=0||C<=0||R<=0) {
        document.getElementById('bp-out').innerHTML='Enter valid positive values.'; return;
    }
    var f0  = 1/(2*Math.PI*Math.sqrt(L*C));
    var w0  = 2*Math.PI*f0;
    var BW, Q;
    if (cfg === 'series') {
        BW = R/L; // rad/s
        Q  = w0*L/R;
    } else {
        BW = 1/(R*C); // rad/s
        Q  = R/(w0*L);
    }
    var BW_Hz = BW/(2*Math.PI);
    var f_low = f0 - BW_Hz/2, f_high = f0 + BW_Hz/2;
    var out = '<p>f\u2080 = ' + math.format(f0,{notation:'engineering',precision:5}) + ' Hz</p>'
            + '<p>BW = ' + math.format(BW_Hz,{notation:'engineering',precision:4}) + ' Hz</p>'
            + '<p>Q = ' + Q.toFixed(4) + '</p>'
            + '<p>f\u2081 = ' + math.format(f_low,{notation:'engineering',precision:5}) + ' Hz</p>'
            + '<p>f\u2082 = ' + math.format(f_high,{notation:'engineering',precision:5}) + ' Hz</p>';
    document.getElementById('bp-out').innerHTML = out;
});
