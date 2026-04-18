
document.getElementById('st-btn').addEventListener('click', function() {
    var f=parseFloat(document.getElementById('st-f').value)*parseFloat(document.getElementById('st-fu').value);
    var Z0=parseFloat(document.getElementById('st-z0').value);
    var B=parseFloat(document.getElementById('st-B').value)*1e-3;
    var typ=document.getElementById('st-type').value;
    clearError();
    if(isNaN(f)||isNaN(Z0)||isNaN(B)||f<=0||Z0<=0){showError('Enter valid positive values for all fields.');return;}
    var Y0=1/Z0, lam=3e8/f;
    var betaL;
    if(typ==='short'){betaL=Math.atan2(Y0,B); if(betaL<0) betaL+=Math.PI;}
    else {betaL=Math.atan2(-Y0,B); if(betaL<0) betaL+=Math.PI;}
    var l_m=betaL/(2*Math.PI)*lam;
    var l_deg=betaL*180/Math.PI;
    document.getElementById('st-el').textContent=l_deg.toFixed(3)+'\u00b0';
    document.getElementById('st-pl').textContent=(l_m*1000).toFixed(4)+' mm (free space)';
    document.getElementById('st-lam4').textContent=(lam/4*1000).toFixed(4)+' mm';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
