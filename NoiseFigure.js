
var nfCount = 3;
function nfBuild() {
    nfCount = parseInt(document.getElementById('nf-n').value) || 3;
    var h = '';
    for (var i = 1; i <= nfCount; i++) {
        h += 'Stage ' + i + ': &nbsp;'
           + 'Gain G<sub>' + i + '</sub>: <input type="text" id="nf-g'+i+'" placeholder="dB" style="width:60px"> dB &nbsp;'
           + 'NF F<sub>' + i + '</sub>: <input type="text" id="nf-f'+i+'" placeholder="dB" style="width:60px"> dB<br>';
    }
    h += '<br><button onclick="nfCalc()">Calculate</button>';
    document.getElementById('nf-stages').innerHTML = h;
    document.getElementById('nf-out').innerHTML = '';
}
function nfCalc() {
    var gains = [], nfs = [];
    for (var i = 1; i <= nfCount; i++) {
        var g = parseFloat(document.getElementById('nf-g'+i).value);
        var f = parseFloat(document.getElementById('nf-f'+i).value);
        if (isNaN(g) || isNaN(f)) { document.getElementById('nf-out').innerHTML = 'Please fill all fields.'; return; }
        gains.push(Math.pow(10, g/10));   // linear gain
        nfs.push(Math.pow(10, f/10));     // linear noise factor
    }
    // Friis: F_total = F1 + (F2-1)/G1 + (F3-1)/(G1*G2) + ...
    var F_total = nfs[0];
    var G_cum   = gains[0];
    for (var j = 1; j < nfCount; j++) {
        F_total += (nfs[j] - 1) / G_cum;
        G_cum   *= gains[j];
    }
    var NF_dB   = 10*Math.log10(F_total);
    var Gtot_dB = 10*Math.log10(G_cum);
    document.getElementById('nf-out').innerHTML =
        '<p>Cascaded NF = ' + NF_dB.toFixed(4) + ' dB</p>'
      + '<p>Total gain = ' + Gtot_dB.toFixed(4) + ' dB</p>';
}
nfBuild();
