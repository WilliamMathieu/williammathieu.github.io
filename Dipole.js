
document.getElementById('dp-btn').addEventListener('click', function() {
    var f=parseFloat(document.getElementById('dp-f').value)*parseFloat(document.getElementById('dp-fu').value);
    var k=parseFloat(document.getElementById('dp-k').value)||0.95;
    clearError();
    if(isNaN(f)||f<=0){showError('Enter a valid positive frequency.');return;}
    if(k<=0||k>1){showError('Velocity factor k must be between 0 and 1.');return;}
    var lam=3e8/f, L=k*lam/2, arm=L/2;
    document.getElementById('dp-lam').textContent=(lam*1000).toFixed(2)+' mm';
    document.getElementById('dp-half').textContent=(L*1000).toFixed(2)+' mm';
    document.getElementById('dp-arm').textContent=(arm*1000).toFixed(2)+' mm';
    document.getElementById('dp-mono').textContent=(arm*1000).toFixed(2)+' mm';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
