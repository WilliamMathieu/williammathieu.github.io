document.getElementById('bw-btn').addEventListener('click', function(){
  var l=parseFloat(document.getElementById('bw-l').value);
  var d=parseFloat(document.getElementById('bw-d').value);
  var h=parseFloat(document.getElementById('bw-h').value);
  document.getElementById('error').textContent='';
  if([l,d,h].some(isNaN)||l<=0||d<=0){document.getElementById('error').textContent='Enter valid positive values.';return;}
  // Grover formula for wire inductance (nH, lengths in mm)
  var L_nH=0.2*l*(Math.log(2*l/d)-0.75);
  var X1GHz=2*Math.PI*1e9*L_nH*1e-9;
  var X10GHz=2*Math.PI*10e9*L_nH*1e-9;
  document.getElementById('bw-L').textContent=L_nH.toFixed(3)+' nH';
  document.getElementById('bw-X').textContent=X1GHz.toFixed(1)+' Ω (1 GHz)';
  document.getElementById('bw-X10').textContent=X10GHz.toFixed(1)+' Ω (10 GHz)';
  if(window.drawDiagram) drawDiagram('bw',L_nH,null,null,l,d,h);
});
document.getElementById('via-btn').addEventListener('click', function(){
  var h=parseFloat(document.getElementById('via-h').value);
  var d=parseFloat(document.getElementById('via-d').value);
  var D=parseFloat(document.getElementById('via-D').value);
  var er=parseFloat(document.getElementById('via-er').value);
  document.getElementById('error2').textContent='';
  if([h,d,D,er].some(isNaN)||h<=0||d<=0||D<=d){document.getElementById('error2').textContent='Enter valid values. D must be > d.';return;}
  var L_nH=0.2*h*Math.log(4*h/d);
  var C_pF=1.41*er*h/Math.log(D/d);
  var L_H=L_nH*1e-9, C_F=C_pF*1e-12;
  var SRF=1/(2*Math.PI*Math.sqrt(L_H*C_F))/1e9; // GHz
  document.getElementById('via-L').textContent=L_nH.toFixed(3)+' nH';
  document.getElementById('via-C').textContent=C_pF.toFixed(3)+' pF';
  document.getElementById('via-srf').textContent=SRF.toFixed(2)+' GHz';
  if(window.drawDiagram) drawDiagram('via',null,L_nH,C_pF,h,d,D);
});
// eslint-disable-next-line no-redeclare
function drawDiagram(type,Lbw,Lvia,Cvia,p1,p2,p3){
  var p4=type==='via'?parseFloat(document.getElementById('via-er').value)||4.4:0;
  var W=520,H=150;
  var sv='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  sv+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  if(type==='bw'){
    var x1=80,x2=440,y1=115,arc_h=60;
    sv+='<rect x="30" y="105" width="100" height="22" fill="#e8e0ff" stroke="#5533aa" stroke-width="1.5" rx="3"/>';
    sv+='<text x="80" y="120" text-anchor="middle" font-size="9.5" fill="#5533aa">Bond pad</text>';
    sv+='<rect x="390" y="105" width="100" height="22" fill="#e8e0ff" stroke="#5533aa" stroke-width="1.5" rx="3"/>';
    sv+='<text x="440" y="120" text-anchor="middle" font-size="9.5" fill="#5533aa">Bond pad</text>';
    sv+='<path d="M'+x1+','+y1+' Q'+(W/2)+','+(y1-arc_h)+' '+x2+','+y1+'" fill="none" stroke="#AA77FF" stroke-width="3.5" stroke-linecap="round"/>';
    sv+='<text x="'+W/2+'" y="'+(y1-arc_h-10)+'" text-anchor="middle" font-size="13" font-weight="bold" fill="#5533aa">L = '+Lbw.toFixed(3)+' nH</text>';
    sv+='<text x="'+W/2+'" y="'+(y1-arc_h+8)+'" text-anchor="middle" font-size="10" fill="#888">ℓ='+p1+'mm  d='+p2+'mm  h='+p3+'mm</text>';
  } else {
    var cx2=W/2,topY=20,botY=110,hp=botY-topY;
    sv+='<rect x="150" y="'+topY+'" width="220" height="'+hp+'" fill="#d4ecca" stroke="#5a9020" stroke-width="1"/>';
    sv+='<text x="'+(cx2+80)+'" y="'+(topY+hp/2+4)+'" font-size="9.5" fill="#3a6010">εᵣ='+p4+'</text>';
    sv+='<rect x="100" y="'+(topY-8)+'" width="320" height="9" fill="#b8922a" stroke="#7a5000" stroke-width="1"/>';
    sv+='<rect x="100" y="'+botY+'" width="320" height="9" fill="#b8922a" stroke="#7a5000" stroke-width="1"/>';
    var vw=Math.min(60,Math.max(10,(p2/p3)*100));
    var ap=p3>0?(p3/p2)*vw:vw*2;
    sv+='<circle cx="'+cx2+'" cy="'+topY+'" r="'+(ap/2)+'" fill="#faf9ff" stroke="#7a5000" stroke-width="1.5" stroke-dasharray="3,2"/>';
    sv+='<circle cx="'+cx2+'" cy="'+botY+'" r="'+(ap/2)+'" fill="#faf9ff" stroke="#7a5000" stroke-width="1.5" stroke-dasharray="3,2"/>';
    sv+='<rect x="'+(cx2-vw/2)+'" y="'+topY+'" width="'+vw+'" height="'+hp+'" fill="#b8922a" stroke="#7a5000" stroke-width="1" rx="1"/>';
    sv+='<line x1="'+(cx2+vw/2)+'" y1="'+(topY+hp/2)+'" x2="'+(cx2+ap/2)+'" y2="'+(topY+hp/2)+'" stroke="#888" stroke-width="1" stroke-dasharray="2,2"/>';
    sv+='<text x="'+(cx2+ap/2+4)+'" y="'+(topY+hp/2+4)+'" font-size="9" fill="#888">antipad D='+p3+'mm</text>';
    sv+='<text x="'+cx2+'" y="'+(botY+24)+'" text-anchor="middle" font-size="9.5" fill="#888">d='+p2+'mm  h='+p1+'mm</text>';
    sv+='<text x="'+cx2+'" y="140" text-anchor="middle" font-size="12" font-weight="bold" fill="#5533aa">L='+Lvia.toFixed(3)+'nH  C='+Cvia.toFixed(3)+'pF</text>';
  }
  sv+='</svg>';
  document.getElementById('tool-diagram').innerHTML=sv;
}
