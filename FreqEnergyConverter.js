var C=2.998e8, H=6.626e-34, E_CHARGE=1.602e-19;
function feUpdate(src){
  var f;
  try{
    if(src==='f'){
      f=parseFloat(document.getElementById('fe-f').value)*parseFloat(document.getElementById('fe-fu').value);
    } else if(src==='lam'){
      var lam=parseFloat(document.getElementById('fe-lam').value)*parseFloat(document.getElementById('fe-lamu').value);
      f=C/lam;
    } else if(src==='T'){
      var T=parseFloat(document.getElementById('fe-T').value)*parseFloat(document.getElementById('fe-tu').value);
      f=1/T;
    } else {
      var E=parseFloat(document.getElementById('fe-E').value)*E_CHARGE;
      f=E/H;
    }
    if(!isFinite(f)||f<=0) throw 0;
    document.getElementById('error').textContent='';
    var lam2=C/f, T2=1/f, k=2*Math.PI*f/C, w=2*Math.PI*f;
    var eV=H*f/E_CHARGE, eJ=H*f;
    var B0=f/(42.577e6); // Tesla for 1H
    var band='—';
    if(f<3e3) band='ELF / SLF';
    else if(f<30e3) band='LF (longwave)';
    else if(f<300e3) band='MF (mediumwave)';
    else if(f<3e6) band='HF (shortwave)';
    else if(f<30e6) band='HF';
    else if(f<300e6) band='VHF';
    else if(f<3e9) band='UHF (L/S band)';
    else if(f<30e9) band='SHF (microwave)';
    else if(f<300e9) band='EHF (mmWave)';
    else if(f<3e12) band='Sub-mm / THz';
    else band='Infrared / optical';
    document.getElementById('fe-of').textContent=engFmt(f,'Hz');
    document.getElementById('fe-olam').textContent=engFmt(lam2,'m');
    document.getElementById('fe-oT').textContent=engFmt(T2,'s');
    document.getElementById('fe-ok').textContent=engFmt(k,'rad/m');
    document.getElementById('fe-ow').textContent=engFmt(w,'rad/s');
    document.getElementById('fe-oE').textContent=eV.toExponential(4)+' eV';
    document.getElementById('fe-oEJ').textContent=engFmt(eJ,'J');
    document.getElementById('fe-oB0').textContent=B0.toFixed(4)+' T';
    document.getElementById('fe-oband').textContent=band;
  } catch(e){ document.getElementById('error').textContent='Enter a valid positive value.'; }
}
