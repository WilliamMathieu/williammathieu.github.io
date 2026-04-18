
document.getElementById('wl-btn').addEventListener('click', function() {
    var f=parseFloat(document.getElementById('wl-f').value)*parseFloat(document.getElementById('wl-fu').value);
    var er=parseFloat(document.getElementById('wl-er').value)||1;
    clearError();
    if(isNaN(f)||f<=0){showError('Enter a valid positive frequency.');return;}
    if(er<=0){showError('\u03b5r must be positive.');return;}
    var lam=3e8/(f*Math.sqrt(er));
    document.getElementById('wl-lam').textContent=math.format(lam,{notation:'engineering',precision:5})+' m';
    document.getElementById('wl-half').textContent=math.format(lam/2,{notation:'engineering',precision:5})+' m';
    document.getElementById('wl-qtr').textContent=math.format(lam/4,{notation:'engineering',precision:5})+' m';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
