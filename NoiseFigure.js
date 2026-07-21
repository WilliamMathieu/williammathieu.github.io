/* exported nfBuild, nfCalc, nfLoadExample */
/*
 * Cascaded Noise Figure — Friis 1944
 *
 *   F_total = F₁ + (F₂−1)/G₁ + (F₃−1)/(G₁·G₂) + ...
 *   (F = linear noise factor = 10^(NF_dB/10);  G = linear gain = 10^(G_dB/10))
 *   G_total = G₁·G₂·G₃·...
 */

var nfCount=3;
// eslint-disable-next-line no-redeclare
function nfBuild(){
    nfCount=parseInt(document.getElementById('nf-n').value)||3;
    if(nfCount<1)nfCount=1; if(nfCount>20)nfCount=20;
    var h='';
    for(var i=1;i<=nfCount;i++){
        h+='Stage '+i+': &nbsp;Gain G<sub>'+i+'</sub>: <input type="text" id="nf-g'+i+'" style="width:60px"> dB &nbsp;NF F<sub>'+i+'</sub>: <input type="text" id="nf-f'+i+'" style="width:60px"> dB<br>';
    }
    h+='<br><button onclick="nfCalc()">Calculate</button>';
    document.getElementById('nf-stages').innerHTML=h;
    document.getElementById('nf-nf').textContent='\u2014';
    document.getElementById('nf-gain').textContent='\u2014';
    clearError();
}
// eslint-disable-next-line no-redeclare
function nfCalc(){
    var gains=[],nfs=[];
    clearError();
    for(var i=1;i<=nfCount;i++){
        var g=parseFloat(document.getElementById('nf-g'+i).value);
        var f=parseFloat(document.getElementById('nf-f'+i).value);
        if(isNaN(g)||isNaN(f)){showError('Please fill all gain and NF fields.');return;}
        gains.push(Math.pow(10,g/10)); nfs.push(Math.pow(10,f/10));
    }
    var F=nfs[0], G=gains[0];
    for(var j=1;j<nfCount;j++){F+=(nfs[j]-1)/G; G*=gains[j];}
    document.getElementById('nf-nf').textContent=(10*Math.log10(F)).toFixed(4)+' dB';
    document.getElementById('nf-gain').textContent=(10*Math.log10(G)).toFixed(4)+' dB';
    if(window.drawDiagram) window.drawDiagram();
}
nfBuild();

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
