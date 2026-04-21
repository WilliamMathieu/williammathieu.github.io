
document.getElementById('wl-btn').addEventListener('click', function() {
    var f=parseFloat(document.getElementById('wl-f').value)*parseFloat(document.getElementById('wl-fu').value);
    var er=parseFloat(document.getElementById('wl-er').value)||1;
    clearError();
    if(isNaN(f)||f<=0){showError('Enter a valid positive frequency.');return;}
    if(er<=0){showError('\u03b5r must be positive.');return;}
    var lam=3e8/(f*Math.sqrt(er));
    document.getElementById('wl-lam').textContent=engFmt(lam,'m');
    document.getElementById('wl-half').textContent=engFmt(lam/2,'m');
    document.getElementById('wl-qtr').textContent=engFmt(lam/4,'m');
    if(window.drawDiagram) window.drawDiagram();
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
