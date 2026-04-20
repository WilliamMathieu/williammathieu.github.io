
document.getElementById('sd-mat').addEventListener('change',function(){
    document.getElementById('sd-sigma').disabled=this.value!=='custom';
});
document.getElementById('sd-btn').addEventListener('click', function() {
    var f=parseFloat(document.getElementById('sd-f').value)*parseFloat(document.getElementById('sd-fu').value);
    var mat=document.getElementById('sd-mat').value;
    var sig=mat==='custom'?parseFloat(document.getElementById('sd-sigma').value):parseFloat(mat);
    clearError();
    if(isNaN(f)||f<=0){showError('Enter a valid positive frequency.');return;}
    if(isNaN(sig)||sig<=0){showError('Enter a valid positive conductivity.');return;}
    var delta=Math.sqrt(2/(2*Math.PI*f*4*Math.PI*1e-7*sig));
    document.getElementById('sd-m').textContent=engFmt(delta,'m');
    document.getElementById('sd-um').textContent=(delta*1e6).toFixed(3)+' µm';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
