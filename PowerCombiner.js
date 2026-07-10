document.getElementById('pc-btn').addEventListener('click', function(){
  var N=parseInt(document.getElementById('pc-n').value);
  var P=parseFloat(document.getElementById('pc-p').value);
  var eta=parseFloat(document.getElementById('pc-eta').value);
  var k=parseInt(document.getElementById('pc-fail').value)||0;
  document.getElementById('error').textContent='';
  if(isNaN(N)||isNaN(P)||isNaN(eta)||N<1||eta<=0||eta>1||k<0||k>=N){document.getElementById('error').textContent='Enter valid values. k must be < N.';return;}
  var Peach_W=1e-3*Math.pow(10,P/10);
  var Ptotal_ideal_W=N*Peach_W;
  var Pout_W=Ptotal_ideal_W*eta;
  var Pout_dBm=10*Math.log10(Pout_W/1e-3);
  var Cgain=Pout_dBm-P; // dB over single module
  var Eloss_dB=-10*Math.log10(eta);
  // Failure: coherent combining → amplitude drops by (N-k)/N, power by ((N-k)/N)²
  var surv=N-k;
  var Pfail_W=Pout_W*(surv/N)*(surv/N);
  var Pfail_dBm=10*Math.log10(Pfail_W/1e-3);
  var degrad_dB=Pout_dBm-Pfail_dBm;
  var pct_retained=(Pfail_W/Pout_W)*100;
  document.getElementById('pc-pout').textContent=Pout_dBm.toFixed(2)+' dBm';
  document.getElementById('pc-pout-w').textContent=engFmt(Pout_W,'W');
  document.getElementById('pc-cgain').textContent='+'+Cgain.toFixed(1)+' dB';
  document.getElementById('pc-eloss').textContent=Eloss_dB.toFixed(2)+' dB';
  document.getElementById('pc-pfail').textContent=(k>0?Pfail_dBm.toFixed(2)+' dBm':'N/A (no failures)');
  document.getElementById('pc-degrad').textContent=(k>0?'-'+degrad_dB.toFixed(1)+' dB':'0 dB');
  document.getElementById('pc-surv').textContent=surv+' of '+N;
  document.getElementById('pc-pct').textContent=(k>0?pct_retained.toFixed(0)+'%':'100%');
  if(window.drawDiagram) drawDiagram(N,k,Pout_dBm.toFixed(1),P);
});
// eslint-disable-next-line no-redeclare
function drawDiagram(N,k,Pout,Peach){
  if(!N) return;
  var W=520,H=Math.max(140,N*32+60);
  var sv='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  sv+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  var jx=W-100, cy=H/2;
  // Combiner block
  sv+='<rect x="'+(jx-30)+'" y="'+(cy-30)+'" width="60" height="60" fill="#f0eeff" stroke="#5533aa" stroke-width="2" rx="4"/>';
  sv+='<text x="'+jx+'" y="'+(cy-4)+'" text-anchor="middle" font-size="10" font-weight="bold" fill="#5533aa">N-way</text>';
  sv+='<text x="'+jx+'" y="'+(cy+10)+'" text-anchor="middle" font-size="10" fill="#5533aa">combiner</text>';
  // Output
  sv+='<line x1="'+(jx+30)+'" y1="'+cy+'" x2="'+(W-20)+'" y2="'+cy+'" stroke="#5533aa" stroke-width="2.5" stroke-linecap="round"/>';
  sv+='<circle cx="'+(W-20)+'" cy="'+cy+'" r="4" fill="white" stroke="#5533aa" stroke-width="2"/>';
  sv+='<text x="'+(W-8)+'" y="'+(cy-12)+'" text-anchor="end" font-size="10" fill="#5533aa" font-weight="bold">'+Pout+' dBm</text>';
  // Input amplifier modules
  for(var i=0;i<Math.min(N,8);i++){
    var iy=H/(N+1)*(i+1);
    var failed=i<k;
    var col=failed?'#cc3333':'#5533aa';
    var fill=failed?'#ffeeee':'white';
    sv+='<rect x="30" y="'+(iy-14)+'" width="70" height="28" fill="'+fill+'" stroke="'+col+'" stroke-width="1.8" rx="3"/>';
    sv+='<text x="65" y="'+(iy+4)+'" text-anchor="middle" font-size="9" fill="'+col+'">'+(failed?'FAILED':'Amp '+(i+1))+' '+Peach+' dBm</text>';
    sv+='<line x1="100" y1="'+iy+'" x2="'+(jx-30)+'" y2="'+cy+'" stroke="'+(failed?'#ffaaaa':col)+'" stroke-width="1.8" '+(failed?'stroke-dasharray="4,3"':'')+' stroke-linecap="round"/>';
  }
  if(N>8){
    sv+='<text x="65" y="'+(H-20)+'" text-anchor="middle" font-size="9" fill="#888">… '+N+' modules total</text>';
  }
  sv+='</svg>';
  document.getElementById('tool-diagram').innerHTML=sv;
}
