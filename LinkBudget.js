
document.getElementById('lb-btn').addEventListener('click', function() {
    var Pt=parseFloat(document.getElementById('lb-pt').value);
    var Ltx=parseFloat(document.getElementById('lb-ltx').value);
    var Gt=parseFloat(document.getElementById('lb-gt').value);
    var f=parseFloat(document.getElementById('lb-f').value)*parseFloat(document.getElementById('lb-fu').value);
    var d=parseFloat(document.getElementById('lb-d').value);
    var Lmisc=parseFloat(document.getElementById('lb-lmisc').value);
    var Gr=parseFloat(document.getElementById('lb-gr').value);
    var Lrx=parseFloat(document.getElementById('lb-lrx').value);
    var NF=parseFloat(document.getElementById('lb-nf').value);
    var BW=parseFloat(document.getElementById('lb-bw').value)*parseFloat(document.getElementById('lb-bwu').value);
    var SNR_req=parseFloat(document.getElementById('lb-snr').value);
    clearError();
    if([Pt,Ltx,Gt,f,d,Lmisc,Gr,Lrx,NF,BW,SNR_req].some(isNaN)||f<=0||d<=0||BW<=0){showError('Fill all fields with valid values.');return;}
    var lam=3e8/f;
    var FSPL=20*Math.log10(4*Math.PI*d/lam);
    var EIRP=Pt-Ltx+Gt;
    var Pr=EIRP-FSPL-Lmisc+Gr-Lrx;
    var N_dBm=-174+10*Math.log10(BW)+NF;
    var SNR=Pr-N_dBm;
    var margin=SNR-SNR_req;
    var color=margin>=0?'#007700':'#cc0000';
    function row(l,v,u){return '<tr><td style="padding:2px 12px 2px 0;">'+l+'</td><td style="text-align:right;padding:2px 6px;">'+v.toFixed(2)+'</td><td>'+u+'</td></tr>';}
    document.getElementById('lb-out').innerHTML='<table style="font-family:monospace;font-size:13px;">'
    if(window.drawDiagram) window.drawDiagram();
        +row('EIRP',EIRP,'dBm')+row('FSPL',FSPL,'dB')+row('Add. losses',Lmisc,'dB')
        +row('Received power',Pr,'dBm')+row('Noise floor',N_dBm,'dBm')
        +row('Achieved SNR',SNR,'dB')+row('Required SNR',SNR_req,'dB')
        +'<tr><td colspan="3" style="border-top:1px solid #ccc;padding-top:4px;"></td></tr>'
        +'<tr><td style="padding:2px 12px 2px 0;"><b>Link margin</b></td><td style="text-align:right;padding:2px 6px;color:'+color+';"><b>'+margin.toFixed(2)+'</b></td><td>dB</td></tr></table>';
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
