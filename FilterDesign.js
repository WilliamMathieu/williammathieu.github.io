
document.getElementById('fd-btn').addEventListener('click', function() {
    var typ=document.getElementById('fd-type').value;
    var resp=document.getElementById('fd-resp').value;
    var n=parseInt(document.getElementById('fd-n').value);
    var fc=parseFloat(document.getElementById('fd-fc').value)*parseFloat(document.getElementById('fd-fu').value);
    var R0=parseFloat(document.getElementById('fd-r0').value);
    var ripple=parseFloat(document.getElementById('fd-ripple').value);
    clearError();
    if(isNaN(fc)||isNaN(R0)||fc<=0||R0<=0||n<1||n>9){showError('Enter valid values. Order must be 1\u20139, fc and R\u2080 positive.');return;}
    var g=[1];
    if(typ==='butter'){
        for(var k=1;k<=n;k++) g.push(2*Math.sin((2*k-1)*Math.PI/(2*n)));
        g.push(1);
    } else {
        if(isNaN(ripple)||ripple<=0){showError('Ripple must be positive.');return;}
        var beta=Math.log(1/Math.tanh(ripple/17.37)), gam=Math.sinh(beta/(2*n));
        var a=[],b=[];
        for(var i=1;i<=n;i++){a.push(Math.sin((2*i-1)*Math.PI/(2*n))); b.push(gam*gam+Math.pow(Math.sin(i*Math.PI/n),2));}
        g.push(2*a[0]/gam);
        for(var j=2;j<=n;j++) g.push(4*a[j-2]*a[j-1]/(b[j-2]*g[j-1]));
        g.push(n%2===1?1:1/Math.pow(Math.tanh(beta/4),2));
    }
    var wc=2*Math.PI*fc;
    var html='<table style="font-family:monospace;font-size:13px;border-collapse:collapse;">'
        +'<tr><th style="text-align:left;padding:2px 12px;color:#5533aa;">#</th><th style="text-align:left;padding:2px 12px;color:#5533aa;">Type</th><th style="text-align:right;padding:2px 12px;color:#5533aa;">Value</th></tr>';
    for(var el=1;el<=n;el++){
        var isL=(el%2===1), val, etype;
        if(resp==='lp'){
            if(isL){val=g[el]*R0/wc; etype='Series L = '+math.format(val,{notation:'engineering',precision:4})+' H';}
            else{val=g[el]/(wc*R0); etype='Shunt C = '+math.format(val,{notation:'engineering',precision:4})+' F';}
        } else {
            if(isL){val=1/(g[el]*wc*R0); etype='Series C = '+math.format(val,{notation:'engineering',precision:4})+' F';}
            else{val=R0/(g[el]*wc); etype='Shunt L = '+math.format(val,{notation:'engineering',precision:4})+' H';}
        }
        html+='<tr><td style="padding:2px 12px;">'+el+'</td><td colspan="2" style="padding:2px 12px;">'+etype+'</td></tr>';
    }
    html+='</table><p style="margin-top:6px;">Termination: '+R0+' \u03a9 \u2192 '+(g[n+1]*R0).toFixed(3)+' \u03a9</p>';
    document.getElementById('fd-out').innerHTML=html;
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
