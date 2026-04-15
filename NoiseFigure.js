/* Cascaded Noise Figure */
var nfCount = 3;
function nfBuild() {
    nfCount = parseInt(document.getElementById('nf-n').value)||3;
    var h = '';
    for (var i=1;i<=nfCount;i++) {
        h += 'Stage '+i+': &nbsp;Gain G<sub>'+i+'</sub>: <input type="text" id="nf-g'+i+'" placeholder="dB" style="width:60px"> dB &nbsp;'
           + 'NF F<sub>'+i+'</sub>: <input type="text" id="nf-f'+i+'" placeholder="dB" style="width:60px"> dB<br>';
    }
    h += '<br><button onclick="nfCalc()">Calculate</button>';
    document.getElementById('nf-stages').innerHTML = h;
    document.getElementById('nf-nf').textContent   = '—';
    document.getElementById('nf-gain').textContent = '—';
    clearError();
}
function nfCalc() {
    var gains=[],nfs=[];
    clearError();
    for (var i=1;i<=nfCount;i++) {
        var g=parseFloat(document.getElementById('nf-g'+i).value);
        var f=parseFloat(document.getElementById('nf-f'+i).value);
        if (isNaN(g)||isNaN(f)) { showError('Please fill in all gain and noise figure fields.'); return; }
        gains.push(Math.pow(10,g/10)); nfs.push(Math.pow(10,f/10));
    }
    var F_total=nfs[0], G_cum=gains[0];
    for (var j=1;j<nfCount;j++) { F_total+=(nfs[j]-1)/G_cum; G_cum*=gains[j]; }
    document.getElementById('nf-nf').textContent   = (10*Math.log10(F_total)).toFixed(4) + ' dB';
    document.getElementById('nf-gain').textContent = (10*Math.log10(G_cum)).toFixed(4) + ' dB';
}
nfBuild();

function showError(msg) {
  var el = document.getElementById('error');
  if (el) el.textContent = msg;
}
function clearError() {
  var el = document.getElementById('error');
  if (el) el.textContent = '';
}
