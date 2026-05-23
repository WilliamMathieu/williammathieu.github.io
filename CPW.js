
// Complete elliptic integral K(k) via AGM
function ellipK(k){
  var a=1.0, b=Math.sqrt(1-k*k);
  for(var i=0;i<30;i++){var a1=(a+b)/2; b=Math.sqrt(a*b); a=a1;}
  return Math.PI/(2*a);
}
document.getElementById('cpw-btn').addEventListener('click', function(){
  var w=parseFloat(document.getElementById('cpw-w').value);
  var s=parseFloat(document.getElementById('cpw-s').value);
  var h=parseFloat(document.getElementById('cpw-h').value);
  var er=parseFloat(document.getElementById('cpw-er').value);
  var bg=parseInt(document.getElementById('cpw-bg').value);
  document.getElementById('error').textContent='';
  if([w,s,h,er].some(isNaN)||w<=0||s<=0||h<=0||er<1){document.getElementById('error').textContent='Enter valid positive values.';return;}
  var k0=w/(w+2*s), k0p=Math.sqrt(1-k0*k0);
  var Kk0=ellipK(k0), Kk0p=ellipK(k0p);
  var eeff, Z0;
  if(!bg){
    // CPW on thick substrate (Schneider)
    var k1=Math.sinh(Math.PI*w/4/h)/Math.sinh(Math.PI*(w+2*s)/4/h);
    var k1p=Math.sqrt(1-k1*k1);
    eeff=1+(er-1)/2*ellipK(k1)*Kk0p/(ellipK(k1p)*Kk0);
    Z0=30*Math.PI/Math.sqrt(eeff)*Kk0p/Kk0;
  } else {
    // GCPW (backed with ground plane)
    var k1b=Math.tanh(Math.PI*w/4/h)/Math.tanh(Math.PI*(w+2*s)/4/h);
    var k1bp=Math.sqrt(1-k1b*k1b);
    var q=0.5*ellipK(k1b)*Kk0p/(ellipK(k1bp)*Kk0);
    eeff=1+(er-1)*q;
    Z0=30*Math.PI/Math.sqrt(eeff)*Kk0p/Kk0;
  }
  var vp=3e8/Math.sqrt(eeff);
  var lam=vp/10e9*1000; // mm at 10 GHz
  document.getElementById('cpw-z0').textContent=Z0.toFixed(3)+' Ω';
  document.getElementById('cpw-eeff').textContent=eeff.toFixed(4);
  document.getElementById('cpw-vp').textContent=(vp/1e8).toFixed(3)+'×10⁸ m/s';
  document.getElementById('cpw-lam').textContent=lam.toFixed(2)+' mm';
  if(window.drawDiagram) drawDiagram(w,s,h,er,Z0.toFixed(1),bg);
});
function drawDiagram(w,s,h,er,Z0lbl,bg){
  if(!w){w=1;s=0.3;h=0.5;er=9.9;Z0lbl='—';bg=1;}
  var W=480,H=170,scale=Math.min(60,120/(w+2*s+2));
  var wp=w*scale, sp=s*scale, hp=Math.min(50,h*scale*0.6);
  var cx=W/2, topY=50, botY=topY+hp;
  var s2='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  s2+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  s2+='<rect x="'+(cx-wp/2-sp*2-20)+'" y="'+topY+'" width="'+(wp+sp*4+40)+'" height="'+hp+'" fill="#d4ecca" stroke="#5a9020" stroke-width="1" rx="1"/>';
  s2+='<text x="'+(cx+wp/4)+'" y="'+(topY+hp/2+4)+'" font-size="9.5" fill="#3a6010">εᵣ = '+er+'</text>';
  s2+='<rect x="'+(cx-wp/2-sp*2-20)+'" y="'+(topY-10)+'" width="'+(sp*2)+'" height="10" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  s2+='<rect x="'+(cx+wp/2+sp)+'" y="'+(topY-10)+'" width="'+(sp*2+20)+'" height="10" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  s2+='<rect x="'+(cx-wp/2-sp)+'" y="'+(topY-10)+'" width="'+sp+'" height="10" fill="#faf9ff" stroke="#e0d8ff" stroke-width="0.5"/>';
  s2+='<rect x="'+(cx+wp/2)+'" y="'+(topY-10)+'" width="'+sp+'" height="10" fill="#faf9ff" stroke="#e0d8ff" stroke-width="0.5"/>';
  s2+='<rect x="'+(cx-wp/2)+'" y="'+(topY-10)+'" width="'+wp+'" height="10" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  if(bg) s2+='<rect x="'+(cx-wp/2-sp*2-20)+'" y="'+botY+'" width="'+(wp+sp*4+40)+'" height="8" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
  s2+='<line x1="'+(cx-wp/2)+'" y1="'+(topY+hp+22)+'" x2="'+(cx+wp/2)+'" y2="'+(topY+hp+22)+'" stroke="#888" stroke-width="1" stroke-dasharray="2,2"/>';
  s2+='<text x="'+cx+'" y="'+(topY+hp+36)+'" text-anchor="middle" font-size="9.5" fill="#888">w = '+w+' mm</text>';
  s2+='<line x1="'+(cx+wp/2)+'" y1="'+(topY+hp+22)+'" x2="'+(cx+wp/2+sp)+'" y2="'+(topY+hp+22)+'" stroke="#888" stroke-width="1" stroke-dasharray="2,2"/>';
  s2+='<text x="'+(cx+wp/2+sp/2)+'" y="'+(topY+hp+16)+'" text-anchor="middle" font-size="9" fill="#888">s</text>';
  s2+='<text x="'+(cx-wp/2-sp*2-4)+'" y="'+(topY+hp/2+4)+'" text-anchor="end" font-size="9.5" fill="#888">h='+h+'mm</text>';
  s2+='<text x="'+W/2+'" y="162" text-anchor="middle" font-size="12" fill="#5533aa" font-weight="bold">Z₀ = '+Z0lbl+' Ω</text>';
  s2+='</svg>';
  document.getElementById('tool-diagram').innerHTML=s2;
}
