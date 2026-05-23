// Microstrip Z0 (Hammerstad-Jensen)
function msZ0(w,h,t,er){
  var weff=w+(t/Math.PI)*(1+Math.log(2*h/t));
  var u=weff/h;
  var fu=6+(2*Math.PI-6)*Math.exp(-Math.pow(30.666/u,0.7528));
  var Z0air=60*Math.log(fu/u+Math.sqrt(1+4/u/u));
  var a=1+(1/49)*Math.log((Math.pow(u,4)+Math.pow(u/52,2))/(Math.pow(u,4)+0.432))+
         (1/18.7)*Math.log(1+Math.pow(u/18.1,3));
  var b=0.564*Math.pow((er-0.9)/(er+3),0.053);
  var eeff=((er+1)/2+(er-1)/2*Math.pow(1+10/u,-a*b));
  return{Z0:Z0air/Math.sqrt(eeff), eeff:eeff};
}
document.getElementById('dp2-btn').addEventListener('click', function(){
  var w=parseFloat(document.getElementById('dp2-w').value);
  var s=parseFloat(document.getElementById('dp2-s').value);
  var h=parseFloat(document.getElementById('dp2-h').value);
  var t=parseFloat(document.getElementById('dp2-t').value);
  var er=parseFloat(document.getElementById('dp2-er').value);
  document.getElementById('error').textContent='';
  if([w,s,h,t,er].some(isNaN)||[w,s,h].some(function(v){return v<=0;})){document.getElementById('error').textContent='Enter valid positive values.';return;}
  var single=msZ0(w,h,t,er);
  var Z0=single.Z0;
  // Coupled microstrip correction (Kirschning & Jansen simplified)
  var Q=0.347*Math.exp(-2.655*s/h);
  var Zodd=Z0*(1-Q);
  var Zeven=Z0*(1+Q);
  document.getElementById('dp2-z0single').textContent=Z0.toFixed(2)+' Ω';
  document.getElementById('dp2-zodd').textContent=Zodd.toFixed(2)+' Ω';
  document.getElementById('dp2-zdiff').textContent=(2*Zodd).toFixed(2)+' Ω';
  document.getElementById('dp2-zeven').textContent=Zeven.toFixed(2)+' Ω';
  document.getElementById('dp2-zcm').textContent=(Zeven/2).toFixed(2)+' Ω';
  if(window.drawDiagram) drawDiagram(w,s,h,t,er,(2*Zodd).toFixed(1));
});
// eslint-disable-next-line no-redeclare
function drawDiagram(w,s,h,t,er,zdiff){
  if(!w){w=0.2;s=0.2;h=0.2;t=0.035;er=4.4;zdiff='—';}
  var W=480,H=175,sc=Math.min(80,50/w);
  var wp=w*sc, sp=s*sc, hp=Math.min(40,h*sc*0.8);
  var cx=W/2, topY=55, gndY=topY+hp;
  var sv='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  sv+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  sv+='<rect x="'+(cx-wp-sp/2-20)+'" y="'+topY+'" width="'+(wp*2+sp+40)+'" height="'+hp+'" fill="#d4ecca" stroke="#5a9020" stroke-width="1" rx="1"/>';
  sv+='<text x="'+cx+'" y="'+(topY+hp/2+4)+'" text-anchor="middle" font-size="9.5" fill="#3a6010">εᵣ = '+er+'</text>';
  // Two traces
  var tx1=cx-sp/2-wp, tx2=cx+sp/2;
  sv+='<rect x="'+tx1+'" y="'+(topY-8)+'" width="'+wp+'" height="8" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  sv+='<rect x="'+tx2+'" y="'+(topY-8)+'" width="'+wp+'" height="8" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  // Ground
  sv+='<rect x="'+(cx-wp-sp/2-20)+'" y="'+gndY+'" width="'+(wp*2+sp+40)+'" height="8" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  // Labels
  sv+='<text x="'+(tx1+wp/2)+'" y="'+(topY-14)+'" text-anchor="middle" font-size="10" fill="#5533aa" font-weight="bold">+</text>';
  sv+='<text x="'+(tx2+wp/2)+'" y="'+(topY-14)+'" text-anchor="middle" font-size="10" fill="#cc3333" font-weight="bold">−</text>';
  // w annotation
  sv+='<text x="'+(tx1+wp/2)+'" y="150" text-anchor="middle" font-size="9.5" fill="#888">w='+w+'mm</text>';
  sv+='<text x="'+cx+'" y="150" text-anchor="middle" font-size="9.5" fill="#888">s='+s+'mm</text>';
  sv+='<text x="'+(cx+wp*1.5+sp/2+10)+'" y="'+(topY+hp/2+4)+'" font-size="9.5" fill="#888">h='+h+'mm</text>';
  sv+='<text x="'+W/2+'" y="165" text-anchor="middle" font-size="12" fill="#5533aa" font-weight="bold">Z_diff = '+zdiff+' Ω</text>';
  sv+='</svg>';
  document.getElementById('tool-diagram').innerHTML=sv;
}
