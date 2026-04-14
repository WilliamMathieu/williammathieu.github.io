
/* Microstrip Calculator */
document.getElementById('ms-btn1').addEventListener('click', function() {
    var h = parseFloat(document.getElementById('ms-h').value);
    var w = parseFloat(document.getElementById('ms-w').value);
    var t = parseFloat(document.getElementById('ms-t').value) || 0;
    var er = parseFloat(document.getElementById('ms-er').value);
    if ([h,w,er].some(isNaN) || h<=0 || w<=0 || er<=0) {
        document.getElementById('ms-out1').innerHTML = 'Please enter valid positive values.'; return;
    }
    // Hammerstad-Jensen effective width correction for thickness
    var wEff = w;
    if (t > 0 && t < h) {
        var dw = (t / Math.PI) * (1 + Math.log(2 * h / t));
        wEff = w + dw;
    }
    var u = wEff / h;
    var Z0, eEff;
    if (u <= 1) {
        var F = 6 + (2*Math.PI - 6)*Math.exp(-Math.pow(30.666/u, 0.7528));
        Z0 = (60 / Math.sqrt(er)) * Math.log(F/u + Math.sqrt(1 + 4/(u*u)));
        // eEff
        var A = 1 + (1/49)*Math.log((Math.pow(u,4) + Math.pow(u/52,2)) / (Math.pow(u,4) + 0.432))
              + (1/18.7)*Math.log(1 + Math.pow(u/18.1, 3));
        var B = 0.564 * Math.pow((er-0.9)/(er+3), 0.053);
        eEff = Math.pow((er+1)/2 + (er-1)/2 * Math.pow(1+10/u, -A*B), 1);
        eEff = (er+1)/2 + (er-1)/2 * Math.pow(1 + 10/u, -A*B);
        Z0 = Z0 / Math.sqrt(eEff) * Math.sqrt(eEff); // already accounts for eEff via log formula
        // Use full Hammerstad formula
        Z0 = (60 / Math.sqrt(eEff)) * Math.log(8/u + u/4);
    } else {
        eEff = (er+1)/2 + (er-1)/2 * Math.pow(1 + 12/u, -0.5);
        Z0 = (120*Math.PI / (Math.sqrt(eEff) * (u + 1.393 + 0.667*Math.log(u+1.444))));
    }
    var vp = 3e8 / Math.sqrt(eEff);
    var out = '<p>Z\u2080 = ' + Z0.toFixed(3) + ' \u03A9</p>'
            + '<p>\u03b5<sub>eff</sub> = ' + eEff.toFixed(4) + '</p>'
            + '<p>v<sub>p</sub> = ' + (vp/1e8).toFixed(4) + ' \u00d7 10\u2078 m/s</p>';
    document.getElementById('ms-out1').innerHTML = out;
});

document.getElementById('ms-btn2').addEventListener('click', function() {
    var Z0 = parseFloat(document.getElementById('ms-z0').value);
    var h  = parseFloat(document.getElementById('ms-h2').value);
    var er = parseFloat(document.getElementById('ms-er2').value);
    if ([Z0,h,er].some(isNaN) || Z0<=0 || h<=0 || er<=0) {
        document.getElementById('ms-out2').innerHTML = 'Please enter valid positive values.'; return;
    }
    var A = Z0/60 * Math.sqrt((er+1)/2) + (er-1)/(er+1)*(0.23 + 0.11/er);
    var B = 377*Math.PI / (2*Z0*Math.sqrt(er));
    var w1 = 8*Math.exp(A) / (Math.exp(2*A) - 2); // narrow case
    var w2 = 2/Math.PI*(B-1-Math.log(2*B-1)+(er-1)/(2*er)*(Math.log(B-1)+0.39-0.61/er)); // wide case
    var w = (w1 < 2) ? w1 * h : w2 * h;
    document.getElementById('ms-out2').innerHTML = '<p>w = ' + (w).toFixed(4) + ' mm</p>';
});
