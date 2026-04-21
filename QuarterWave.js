
document.getElementById('qw-btn').addEventListener('click', function() {
    var Z1=parseFloat(document.getElementById('qw-z1').value);
    var Z2=parseFloat(document.getElementById('qw-z2').value);
    var f=parseFloat(document.getElementById('qw-f').value)*parseFloat(document.getElementById('qw-fu').value);
    var er=parseFloat(document.getElementById('qw-er').value)||1;
    clearError();
    if(isNaN(Z1)||isNaN(Z2)||isNaN(f)||Z1<=0||Z2<=0||f<=0){showError('Enter valid positive values.');return;}
    if(er<=0){showError('\u03b5r must be positive.');return;}
    var Zt=Math.sqrt(Z1*Z2);
    var l=3e8/(f*Math.sqrt(er))/4;
    document.getElementById('qw-zt').textContent=Zt.toFixed(4)+' \u03a9';
    document.getElementById('qw-len').textContent=(l*1000).toFixed(4)+' mm';
    if(window.drawDiagram) window.drawDiagram();
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
