
document.getElementById('cx-btn').addEventListener('click', function() {
    var d=parseFloat(document.getElementById('cx-d').value);
    var D=parseFloat(document.getElementById('cx-D').value);
    var er=parseFloat(document.getElementById('cx-er').value);
    clearError();
    if(isNaN(d)||isNaN(D)||isNaN(er)||d<=0||er<=0){showError('Enter valid positive values.');return;}
    if(D<=d){showError('Outer diameter D must be greater than inner diameter d.');return;}
    var ratio=D/d;
    var Z0=60/Math.sqrt(er)*Math.log(ratio);
    var C=2*Math.PI*8.854e-12*er/Math.log(ratio);
    var L=4*Math.PI*1e-7/(2*Math.PI)*Math.log(ratio);
    var vp=3e8/Math.sqrt(er);
    var fc=1e-9*vp/(Math.PI*(D+d)/2*1e-3);
    document.getElementById('cx-z0').textContent=Z0.toFixed(3)+' \u03a9';
    document.getElementById('cx-C').textContent=(C*1e12).toFixed(4)+' pF/m';
    document.getElementById('cx-L').textContent=(L*1e9).toFixed(4)+' nH/m';
    document.getElementById('cx-vp').textContent=(vp/1e8).toFixed(4)+' \u00d7 10\u2078 m/s';
    document.getElementById('cx-fc').textContent=fc.toFixed(4)+' GHz';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
