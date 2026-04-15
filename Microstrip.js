/* Microstrip Calculator */
document.getElementById('ms-btn1').addEventListener('click', function() {
    var h  = parseFloat(document.getElementById('ms-h').value);
    var w  = parseFloat(document.getElementById('ms-w').value);
    var t  = parseFloat(document.getElementById('ms-t').value) || 0;
    var er = parseFloat(document.getElementById('ms-er').value);
    var err1 = document.getElementById('ms-err1');
    err1.textContent = '';
    if (isNaN(h) || isNaN(w) || isNaN(er) || h<=0 || w<=0 || er<=0) {
        err1.textContent = 'Please enter valid positive values for h, w, and εr.'; return;
    }
    var wEff = w;
    if (t > 0 && t < h) wEff = w + (t/Math.PI)*(1 + Math.log(2*h/t));
    var u = wEff/h, eEff, Z0;
    if (u <= 1) {
        var A = 1 + (1/49)*Math.log((Math.pow(u,4)+Math.pow(u/52,2))/(Math.pow(u,4)+0.432))+(1/18.7)*Math.log(1+Math.pow(u/18.1,3));
        var B = 0.564*Math.pow((er-0.9)/(er+3),0.053);
        eEff = (er+1)/2 + (er-1)/2*Math.pow(1+10/u,-A*B);
        Z0 = (60/Math.sqrt(eEff))*Math.log(8/u + u/4);
    } else {
        eEff = (er+1)/2 + (er-1)/2*Math.pow(1+12/u,-0.5);
        Z0 = 120*Math.PI/(Math.sqrt(eEff)*(u+1.393+0.667*Math.log(u+1.444)));
    }
    var vp = 3e8/Math.sqrt(eEff);
    document.getElementById('ms-z0-out').textContent  = Z0.toFixed(3) + ' Ω';
    document.getElementById('ms-eeff-out').textContent = eEff.toFixed(4);
    document.getElementById('ms-vp-out').textContent  = (vp/1e8).toFixed(4) + ' × 10⁸ m/s';
});

document.getElementById('ms-btn2').addEventListener('click', function() {
    var Z0 = parseFloat(document.getElementById('ms-z0').value);
    var h  = parseFloat(document.getElementById('ms-h2').value);
    var er = parseFloat(document.getElementById('ms-er2').value);
    var err2 = document.getElementById('ms-err2');
    err2.textContent = '';
    if (isNaN(Z0) || isNaN(h) || isNaN(er) || Z0<=0 || h<=0 || er<=0) {
        err2.textContent = 'Please enter valid positive values for Z₀, h, and εr.'; return;
    }
    var A = Z0/60*Math.sqrt((er+1)/2)+(er-1)/(er+1)*(0.23+0.11/er);
    var B = 377*Math.PI/(2*Z0*Math.sqrt(er));
    var w1 = 8*Math.exp(A)/(Math.exp(2*A)-2);
    var w2 = 2/Math.PI*(B-1-Math.log(2*B-1)+(er-1)/(2*er)*(Math.log(B-1)+0.39-0.61/er));
    var w = (w1 < 2 ? w1 : w2) * h;
    document.getElementById('ms-w-out').textContent = w.toFixed(4) + ' mm';
});
