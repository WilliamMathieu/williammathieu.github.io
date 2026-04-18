
document.getElementById('pa-btn').addEventListener('click', function() {
    var f=parseFloat(document.getElementById('pa-f').value)*parseFloat(document.getElementById('pa-fu').value);
    var er=parseFloat(document.getElementById('pa-er').value);
    var h=parseFloat(document.getElementById('pa-h').value)*1e-3;
    clearError();
    if(isNaN(f)||isNaN(er)||isNaN(h)||f<=0||er<=0||h<=0){showError('Enter valid positive values.');return;}
    var c=3e8;
    var W=c/(2*f)*Math.sqrt(2/(er+1));
    var erEff=(er+1)/2+(er-1)/2*Math.pow(1+12*h/W,-0.5);
    var dL=0.412*h*(erEff+0.3)*(W/h+0.264)/((erEff-0.258)*(W/h+0.8));
    var L=c/(2*f*Math.sqrt(erEff))-2*dL;
    document.getElementById('pa-W').textContent=(W*1000).toFixed(3)+' mm';
    document.getElementById('pa-L').textContent=(L*1000).toFixed(3)+' mm';
    document.getElementById('pa-eeff').textContent=erEff.toFixed(4);
    document.getElementById('pa-dL').textContent=(dL*1000).toFixed(4)+' mm';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
