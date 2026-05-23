document.getElementById('rd-btn').addEventListener('click', function(){
  var Pt=parseFloat(document.getElementById('rd-pt').value);
  var Gt=Math.pow(10,parseFloat(document.getElementById('rd-gt').value)/10);
  var Gr=Math.pow(10,parseFloat(document.getElementById('rd-gr').value)/10);
  var sig=parseFloat(document.getElementById('rd-sigma').value);
  var f=parseFloat(document.getElementById('rd-f').value)*parseFloat(document.getElementById('rd-fu').value);
  var Pmin_dBm=parseFloat(document.getElementById('rd-pmin').value);
  document.getElementById('error').textContent='';
  if([Pt,Gt,Gr,sig,f,Pmin_dBm].some(isNaN)||Pt<=0||sig<=0||f<=0){document.getElementById('error').textContent='Enter valid positive values.';return;}
  var lam=3e8/f;
  var Pmin_W=1e-3*Math.pow(10,Pmin_dBm/10);
  var Rmax=Math.pow(Pt*Gt*Gr*lam*lam*sig/Math.pow(4*Math.PI,3)/Pmin_W,0.25);
  var Pr1k=Pt*Gt*Gr*lam*lam*sig/Math.pow(4*Math.PI,3)/Math.pow(1000,4);
  var Pr1k_dBm=10*Math.log10(Pr1k/1e-3);
  var EIRP_dBm=10*Math.log10(Pt/1e-3)+10*Math.log10(Gt);
  document.getElementById('rd-rmax').textContent=engFmt(Rmax,'m');
  document.getElementById('rd-pr1k').textContent=Pr1k_dBm.toFixed(1)+' dBm';
  document.getElementById('rd-rangeatpmin').textContent=engFmt(Rmax,'m');
  document.getElementById('rd-lam').textContent=engFmt(lam,'m');
  document.getElementById('rd-eirp').textContent=EIRP_dBm.toFixed(1)+' dBm';
  document.getElementById('rd-dbeq').textContent=(10*Math.log10(Pt)+10*Math.log10(Gt)+10*Math.log10(Gr)+20*Math.log10(lam)+10*Math.log10(sig)-30*Math.log10(4*Math.PI)).toFixed(1)+' dBm·m⁴';
  if(window.drawDiagram) drawDiagram(Rmax,Pmin_dBm,Pt,Gt,lam,sig);
});
// eslint-disable-next-line no-redeclare
function drawDiagram(Rmax,Pmin,Pt,Gt,lam,sig){
  if(!Rmax){return;}
  var W=520,H=130,wy=65;
  var sv='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  sv+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  // Radar block
  sv+='<rect x="20" y="40" width="80" height="40" fill="#f0eeff" stroke="#5533aa" stroke-width="2" rx="4"/>';
  sv+='<text x="60" y="57" text-anchor="middle" font-size="10" font-weight="bold" fill="#5533aa">RADAR</text>';
  sv+='<text x="60" y="72" text-anchor="middle" font-size="9" fill="#888">'+Math.round(Pt)+'W  Gₜ='+Math.round(10*Math.log10(Gt))+'dBi</text>';
  // Range arrow
  var rmStr=Rmax>1000?(Rmax/1000).toFixed(1)+' km':Rmax.toFixed(0)+' m';
  sv+='<line x1="100" y1="'+wy+'" x2="400" y2="'+wy+'" stroke="#AA77FF" stroke-width="2" stroke-dasharray="6,4"/>';
  sv+='<polygon points="400,'+wy+' 390,'+(wy-5)+' 390,'+(wy+5)+'" fill="#AA77FF"/>';
  sv+='<polygon points="100,'+wy+' 110,'+(wy-5)+' 110,'+(wy+5)+'" fill="#AA77FF"/>';
  sv+='<text x="250" y="'+(wy-8)+'" text-anchor="middle" font-size="11" font-weight="bold" fill="#5533aa">R_max = '+rmStr+'</text>';
  // Target
  sv+='<circle cx="420" cy="'+wy+'" r="12" fill="none" stroke="#cc3333" stroke-width="2" stroke-dasharray="3,2"/>';
  sv+='<text x="420" y="'+(wy+4)+'" text-anchor="middle" font-size="9" fill="#cc3333">σ</text>';
  sv+='<text x="420" y="'+(wy+25)+'" text-anchor="middle" font-size="9" fill="#888">'+sig+'m²</text>';
  // Pmin note
  sv+='<text x="250" y="115" text-anchor="middle" font-size="10" fill="#888" font-style="italic">Pmin = '+Pmin+' dBm  |  R ∝ (Pt·Gt·Gr·σ)^¼</text>';
  sv+='</svg>';
  document.getElementById('tool-diagram').innerHTML=sv;
}
