
document.getElementById('fd-btn').addEventListener('click', function() {
    var typ    = document.getElementById('fd-type').value;
    var resp   = document.getElementById('fd-resp').value;
    var n      = parseInt(document.getElementById('fd-n').value);
    var fc     = parseFloat(document.getElementById('fd-fc').value)
               * parseFloat(document.getElementById('fd-fu').value);
    var R0     = parseFloat(document.getElementById('fd-r0').value);
    var ripple = parseFloat(document.getElementById('fd-ripple').value);
    if (isNaN(fc)||isNaN(R0)||fc<=0||R0<=0||n<1||n>9) {
        document.getElementById('fd-out').innerHTML='Enter valid values.'; return;
    }
    var g = [];
    if (typ === 'butter') {
        // Butterworth prototype g values
        g.push(1); // g0 = 1 (source)
        for (var k=1; k<=n; k++) {
            g.push(2*Math.sin((2*k-1)*Math.PI/(2*n)));
        }
        g.push(1); // g_{n+1} = 1
    } else {
        // Chebyshev prototype
        var eps  = Math.sqrt(Math.pow(10, ripple/10) - 1);
        var beta = Math.log(1/Math.tanh(ripple/17.37));
        var gam  = Math.sinh(beta/(2*n));
        g.push(1);
        var a = [], b = [];
        for (var i=1; i<=n; i++) {
            a.push(Math.sin((2*i-1)*Math.PI/(2*n)));
            b.push(gam*gam + Math.pow(Math.sin(i*Math.PI/n), 2));
        }
        g.push(2*a[0]/gam);
        for (var j=2; j<=n; j++) {
            g.push(4*a[j-2]*a[j-1] / (b[j-2]*g[j-1]));
        }
        g.push(n%2===1 ? 1 : 1/Math.pow(Math.tanh(beta/4),2));
    }
    var wc = 2*Math.PI*fc;
    var out = '<table style="font-family:monospace;font-size:13px;border-collapse:collapse;">'
            + '<tr><th style="text-align:left;padding:2px 12px;">Element</th>'
            + '<th style="text-align:left;padding:2px 12px;">Type</th>'
            + '<th style="text-align:right;padding:2px 12px;">Value</th></tr>';
    // Ladder: alternating series L and shunt C (low-pass prototype)
    for (var el=1; el<=n; el++) {
        var isL = (el % 2 === 1); // odd = series inductor, even = shunt capacitor
        var val, unit, etype;
        if (resp === 'lp') {
            if (isL) { val = g[el]*R0/wc;   unit = fmtE(val)+'H'; etype='Series L'; }
            else     { val = g[el]/(wc*R0);  unit = fmtE(val)+'F'; etype='Shunt C'; }
        } else {
            // High-pass: L <-> C swap + invert
            if (isL) { val = 1/(g[el]*wc*R0); unit = fmtE(val)+'F'; etype='Series C'; }
            else     { val = R0/(g[el]*wc);    unit = fmtE(val)+'H'; etype='Shunt L'; }
        }
        out += '<tr><td style="padding:2px 12px;">'+el+'</td>'
             + '<td style="padding:2px 12px;">'+etype+'</td>'
             + '<td style="text-align:right;padding:2px 12px;">'+unit+'</td></tr>';
    }
    out += '</table><br>Termination: ' + R0 + ' \u03A9 \u2192 ' + (g[n+1]*R0).toFixed(3) + ' \u03A9';
    document.getElementById('fd-out').innerHTML = out;
});
function fmtE(v) { return math.format(v,{notation:'engineering',precision:4})+' '; }
