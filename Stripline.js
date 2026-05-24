document.getElementById('sl-btn').addEventListener('click', function(){
  var w=parseFloat(document.getElementById('sl-w').value);
  var b=parseFloat(document.getElementById('sl-b').value);
  var t=parseFloat(document.getElementById('sl-t').value);
  var er=parseFloat(document.getElementById('sl-er').value);
  document.getElementById('error').textContent='';
  if([w,b,t,er].some(isNaN)||w<=0||b<=0||t<=0||er<1){document.getElementById('error').textContent='Enter valid positive values. Ensure b > t.';return;}
  if(t>=b){document.getElementById('error').textContent='Trace thickness t must be less than ground separation b.';return;}
  var weff=w*(1-(t/b)*Math.log(2-t/b)/Math.PI);  // effective width correction
  var Z0=(60/Math.sqrt(er))*Math.log(4*b/(0.67*Math.PI*weff*(0.8+t/weff)));
  var vp=3e8/Math.sqrt(er);
  var C=er/Z0/vp*1e12; // pF/m
  var L=Z0/vp*1e9;     // nH/m
  document.getElementById('sl-z0').textContent=Z0.toFixed(3)+' Ω';
  document.getElementById('sl-vp').textContent=(vp/1e8).toFixed(3)+'×10⁸ m/s';
  document.getElementById('sl-c').textContent=C.toFixed(2)+' pF/m';
  document.getElementById('sl-l').textContent=L.toFixed(2)+' nH/m';
  if(window.drawDiagram) drawDiagram(w,b,t,er,Z0.toFixed(1));
});
// eslint-disable-next-line no-redeclare
function drawDiagram(w,b,t,er,z0lbl){
  if(!w){w=1;b=3;t=0.035;er=4.4;z0lbl='—';}
  var W=480,H=160,sc=Math.min(60,80/b);
  var wp=w*sc, bp=b*sc, tp=Math.max(4,t*sc);
  var cx=W/2, midY=75;
  var sv='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  sv+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  var gx1=cx-wp-30, gw=wp+60;
  // Top ground
  sv+='<rect x="'+gx1+'" y="'+(midY-bp/2-8)+'" width="'+gw+'" height="8" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  sv+='<text x="'+(gx1+gw+4)+'" y="'+(midY-bp/2-1)+'" font-size="9.5" fill="#7a5000">GND</text>';
  // Dielectric fill
  sv+='<rect x="'+gx1+'" y="'+(midY-bp/2)+'" width="'+gw+'" height="'+bp+'" fill="#d4ecca" stroke="#5a9020" stroke-width="1"/>';
  sv+='<text x="'+cx+'" y="'+(midY-bp/4)+'" text-anchor="middle" font-size="9.5" fill="#3a6010">εᵣ = '+er+'</text>';
  // Trace (centred)
  sv+='<rect x="'+(cx-wp/2)+'" y="'+(midY-tp/2)+'" width="'+wp+'" height="'+tp+'" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  // Bottom ground
  sv+='<rect x="'+gx1+'" y="'+(midY+bp/2)+'" width="'+gw+'" height="8" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  sv+='<text x="'+(gx1+gw+4)+'" y="'+(midY+bp/2+6)+'" font-size="9.5" fill="#7a5000">GND</text>';
  // b arrow
  sv+='<line x1="'+(gx1-14)+'" y1="'+(midY-bp/2)+'" x2="'+(gx1-14)+'" y2="'+(midY+bp/2)+'" stroke="#888" stroke-width="1" stroke-dasharray="2,2"/>';
  sv+='<line x1="'+(gx1-20)+'" y1="'+(midY-bp/2)+'" x2="'+(gx1-8)+'" y2="'+(midY-bp/2)+'" stroke="#888" stroke-width="1.2"/>';
  sv+='<line x1="'+(gx1-20)+'" y1="'+(midY+bp/2)+'" x2="'+(gx1-8)+'" y2="'+(midY+bp/2)+'" stroke="#888" stroke-width="1.2"/>';
  sv+='<text x="'+(gx1-28)+'" y="'+(midY+4)+'" text-anchor="end" font-size="9.5" fill="#888">b='+b+'mm</text>';
  // w label
  sv+='<text x="'+cx+'" y="'+(midY+bp/2+22)+'" text-anchor="middle" font-size="9.5" fill="#888">w = '+w+' mm</text>';
  sv+='<text x="'+W/2+'" y="152" text-anchor="middle" font-size="12" fill="#5533aa" font-weight="bold">Z₀ = '+z0lbl+' Ω</text>';
  sv+='</svg>';
  document.getElementById('tool-diagram').innerHTML=sv;
}
