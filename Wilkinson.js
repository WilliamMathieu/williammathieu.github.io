document.getElementById('wk-btn').addEventListener('click', function(){
  var Z0=parseFloat(document.getElementById('wk-z0').value);
  var K2=parseFloat(document.getElementById('wk-k2').value);
  var f=parseFloat(document.getElementById('wk-f').value)*parseFloat(document.getElementById('wk-fu').value);
  var er=parseFloat(document.getElementById('wk-er').value)||1;
  document.getElementById('error').textContent='';
  if([Z0,K2,f].some(isNaN)||Z0<=0||K2<=0||f<=0){document.getElementById('error').textContent='Enter valid positive values.';return;}
  var K=Math.sqrt(K2);
  var Z1=Z0*Math.sqrt((1+K2)/Math.pow(K,3));
  var Z2=Z0*Math.sqrt(K*(1+K2));
  var Riso=Z0*(K+1/K);
  var lam4=3e8/(4*f*Math.sqrt(er))*1000; // mm
  var s1_dB=10*Math.log10(1+1/K2);
  var s2_dB=10*Math.log10(1+K2);
  document.getElementById('wk-z1').textContent=Z1.toFixed(3)+' Ω';
  document.getElementById('wk-z2').textContent=Z2.toFixed(3)+' Ω';
  document.getElementById('wk-len').textContent=lam4.toFixed(2)+' mm (λ/4)';
  document.getElementById('wk-s1').textContent='-'+s1_dB.toFixed(2)+' dB';
  document.getElementById('wk-s2').textContent='-'+s2_dB.toFixed(2)+' dB';
  document.getElementById('wk-r').textContent=Riso.toFixed(2)+' Ω';
  document.getElementById('wk-iso').textContent='> 20 dB (ideal)';
  document.getElementById('wk-rl').textContent='> 20 dB (ideal)';
  if(window.drawDiagram) drawDiagram(Z1.toFixed(1),Z2.toFixed(1),Riso.toFixed(1),lam4.toFixed(1));
});
// eslint-disable-next-line no-redeclare
function drawDiagram(Z1,Z2,R,len){
  if(!Z1){Z1='70.7Ω';Z2='70.7Ω';R='100Ω';len='—';}
  var W=520,H=190,px=90,cx=W/2,py=80;
  var sv='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  sv+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  // Port 1 (left)
  sv+='<line x1="30" y1="'+py+'" x2="'+px+'" y2="'+py+'" stroke="#5533aa" stroke-width="2.5" stroke-linecap="round"/>';
  sv+='<circle cx="30" cy="'+py+'" r="4" fill="white" stroke="#5533aa" stroke-width="2"/>';
  sv+='<text x="20" y="'+(py-12)+'" text-anchor="middle" font-size="10" fill="#5533aa" font-weight="bold">Port 1</text>';
  // Split node
  sv+='<circle cx="'+px+'" cy="'+py+'" r="4" fill="#5533aa"/>';
  // Upper arm to port 2
  var p2y=50, p2x=W-58;
  sv+='<path d="M'+px+','+py+' Q'+(cx)+','+p2y+' '+p2x+','+p2y+'" fill="none" stroke="#AA77FF" stroke-width="2.5" stroke-dasharray="6,3" stroke-linecap="round"/>';
  sv+='<text x="'+cx+'" y="'+(p2y-8)+'" text-anchor="middle" font-size="9.5" fill="#AA77FF">Z_arm1 = '+Z1+' Ω  (λ/4 = '+len+' mm)</text>';
  sv+='<circle cx="'+p2x+'" cy="'+p2y+'" r="4" fill="white" stroke="#5533aa" stroke-width="2"/>';
  sv+='<text x="'+(p2x+10)+'" y="'+(p2y+4)+'" font-size="10" fill="#5533aa" font-weight="bold">Port 2</text>';
  // Lower arm to port 3
  var p3y=110, p3x=W-58;
  sv+='<path d="M'+px+','+py+' Q'+cx+','+p3y+' '+p3x+','+p3y+'" fill="none" stroke="#AA77FF" stroke-width="2.5" stroke-dasharray="6,3" stroke-linecap="round"/>';
  sv+='<text x="'+cx+'" y="'+(p3y+18)+'" text-anchor="middle" font-size="9.5" fill="#AA77FF">Z_arm2 = '+Z2+' Ω</text>';
  sv+='<circle cx="'+p3x+'" cy="'+p3y+'" r="4" fill="white" stroke="#5533aa" stroke-width="2"/>';
  sv+='<text x="'+(p3x+10)+'" y="'+(p3y+4)+'" font-size="10" fill="#5533aa" font-weight="bold">Port 3</text>';
  // Isolation resistor between port 2 and port 3
  sv+='<line x1="'+p2x+'" y1="'+p2y+'" x2="'+p2x+'" y2="'+(p2y+24)+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
  sv+='<rect x="'+(p2x-16)+'" y="'+(p2y+24)+'" width="32" height="22" fill="white" stroke="#5533aa" stroke-width="1.8" rx="2"/>';
  sv+='<text x="'+(p2x-20)+'" y="'+(p2y+39)+'" text-anchor="end" font-size="9.5" fill="#5533aa">'+R+' Ω</text>';
  sv+='<line x1="'+p2x+'" y1="'+(p2y+46)+'" x2="'+p2x+'" y2="'+p3y+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
  sv+='<text x="'+W/2+'" y="175" text-anchor="middle" font-size="10.5" fill="#888" font-style="italic">λ/4 arms + isolation resistor — all ports matched simultaneously</text>';
  sv+='</svg>';
  document.getElementById('tool-diagram').innerHTML=sv;
}
