
document.getElementById('ln-btn').addEventListener('click', function() {
    var f=parseFloat(document.getElementById('ln-f').value)*parseFloat(document.getElementById('ln-fu').value);
    var Rs=parseFloat(document.getElementById('ln-rs').value);
    var RL=parseFloat(document.getElementById('ln-rl').value);
    clearError();
    if(isNaN(f)||isNaN(Rs)||isNaN(RL)||f<=0||Rs<=0||RL<=0){showError('Enter valid positive values.');return;}
    if(Rs===RL){showError('Rs and RL must be different values.');return;}
    var w=2*Math.PI*f;
    var Rhigh=Math.max(Rs,RL), Rlow=Math.min(Rs,RL);
    var Q=Math.sqrt(Rhigh/Rlow-1);
    var Xshunt=Rhigh/Q, Xseries=Q*Rlow;
    document.getElementById('ln-Q').textContent=Q.toFixed(4);
    document.getElementById('ln-C1').textContent=math.format(1/(w*Xshunt),{notation:'engineering',precision:4})+' F';
    document.getElementById('ln-L1').textContent=math.format(Xseries/w,{notation:'engineering',precision:4})+' H';
    document.getElementById('ln-C2').textContent=math.format(1/(w*Xseries),{notation:'engineering',precision:4})+' F';
    document.getElementById('ln-L2').textContent=math.format(Xshunt/w,{notation:'engineering',precision:4})+' H';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
