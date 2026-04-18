
document.getElementById('fr-btn').addEventListener('click', function() {
    var Pt=parseFloat(document.getElementById('fr-pt').value);
    var Gt=parseFloat(document.getElementById('fr-gt').value);
    var Gr=parseFloat(document.getElementById('fr-gr').value);
    var d=parseFloat(document.getElementById('fr-d').value);
    var f=parseFloat(document.getElementById('fr-f').value)*parseFloat(document.getElementById('fr-fu').value);
    clearError();
    if([Pt,Gt,Gr,d,f].some(isNaN)||d<=0||f<=0){showError('Enter valid values. Distance and frequency must be positive.');return;}
    var lam=3e8/f;
    var FSPL=20*Math.log10(4*Math.PI*d/lam);
    var Pr=Pt+Gt+Gr-FSPL;
    var PrW=1e-3*Math.pow(10,Pr/10);
    document.getElementById('fr-fspl').textContent=FSPL.toFixed(3)+' dB';
    document.getElementById('fr-pr-dbm').textContent=Pr.toFixed(3)+' dBm';
    document.getElementById('fr-pr-w').textContent=math.format(PrW,{notation:'engineering',precision:4})+' W';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
