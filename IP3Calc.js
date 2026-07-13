document.getElementById('ip-btn').addEventListener('click', function(){
  var IIP3=parseFloat(document.getElementById('ip-iip3').value);
  var Pin=parseFloat(document.getElementById('ip-pin').value);
  var G=parseFloat(document.getElementById('ip-gain').value);
  document.getElementById('error').textContent='';
  if([IIP3,Pin,G].some(isNaN)){document.getElementById('error').textContent='Enter valid numeric values.';return;}
  var OIP3=IIP3+G;
  var Pout=Pin+G;
  var IM3=3*Pin-2*IIP3+G; // output IM3 power
  var IMD=Pout-IM3; // difference between desired and IM3
  var P1dB=IIP3-9.6; // approximate input 1dB compression
  document.getElementById('ip-pout').textContent=Pout.toFixed(1)+' dBm';
  document.getElementById('ip-oip3').textContent=OIP3.toFixed(1)+' dBm';
  document.getElementById('ip-im3').textContent=IM3.toFixed(1)+' dBm';
  document.getElementById('ip-imd').textContent=IMD.toFixed(1)+' dBc';
  document.getElementById('ip-headroom').textContent=(IIP3-Pin).toFixed(1)+' dB';
  document.getElementById('ip-oheadroom').textContent=(OIP3-Pout).toFixed(1)+' dB';
  document.getElementById('ip-p1db').textContent=P1dB.toFixed(1)+' dBm (input)';
  if(window.drawDiagram) drawDiagram(Pin,IIP3,G,OIP3,Pout,IM3,P1dB);
});
// eslint-disable-next-line no-redeclare
function drawDiagram(Pin,IIP3,G,OIP3,Pout,IM3,P1dB){
  if(isNaN(Pin)) return;
  var W=520, H=190;
  // Power vs input graph (output signal and IM3 vs Pin)
  var pts_min=-30, pts_max=IIP3+5;
  var gx1=60,gx2=W-30,gy1=20,gy2=H-50;
  var gw=gx2-gx1, gh=gy2-gy1;
  var xscale=gw/(pts_max-pts_min);
  // Output range: from Pin slope output to IM3 slope
  var pout_max=OIP3;
  var yscale=gh/(pout_max-(pts_min+G-20));
  function px(p){return gx1+(p-pts_min)*xscale;}
  function py(p){return gy2-(p-(pts_min+G-20))*yscale;}
  var sv='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  sv+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  sv+='<clipPath id="ip-box"><rect x="'+gx1+'" y="'+gy1+'" width="'+gw+'" height="'+gh+'"/></clipPath>';
  // Axes
  sv+='<line x1="'+gx1+'" y1="'+gy1+'" x2="'+gx1+'" y2="'+gy2+'" stroke="#ccc" stroke-width="1"/>';
  sv+='<line x1="'+gx1+'" y1="'+gy2+'" x2="'+gx2+'" y2="'+gy2+'" stroke="#ccc" stroke-width="1"/>';
  sv+='<text x="'+((gx1+gx2)/2)+'" y="'+(H-24)+'" text-anchor="middle" font-size="9.5" fill="#888">Input power (dBm)</text>';
  sv+='<text x="14" y="'+((gy1+gy2)/2)+'" text-anchor="middle" font-size="9.5" fill="#888" transform="rotate(-90 14 '+((gy1+gy2)/2)+')">Output power (dBm)</text>';
  // Signal output line (slope 1)
  var ps1=pts_min, pe1=Math.min(IIP3,pts_max);
  sv+='<line x1="'+px(ps1)+'" y1="'+py(ps1+G)+'" x2="'+px(pe1)+'" y2="'+py(pe1+G)+'" clip-path="url(#ip-box)" stroke="#5533aa" stroke-width="2.2" stroke-linecap="round"/>';
  sv+='<text x="'+px(pts_min+5)+'" y="'+py(pts_min+G+6)+'" font-size="9.5" fill="#5533aa">Desired output (slope 1)</text>';
  // IM3 line (slope 3)
  var IM3_at_min=3*pts_min-2*IIP3+G;
  var ps3=pts_min, pe3=Math.min(IIP3,pts_max);
  sv+='<line x1="'+px(ps3)+'" y1="'+py(IM3_at_min)+'" x2="'+px(pe3)+'" y2="'+py(OIP3)+'" clip-path="url(#ip-box)" stroke="#cc3333" stroke-width="2.2" stroke-linecap="round"/>';
  sv+='<text x="'+px(pts_min+5)+'" y="'+(py(pts_min+G+6)+16)+'" font-size="9.5" fill="#cc3333">IM3 (slope 3)</text>';
  // IP3 point
  if(IIP3>=pts_min&&IIP3<=pts_max){
    sv+='<circle cx="'+px(IIP3)+'" cy="'+py(OIP3)+'" r="5" fill="#AA77FF"/>';
    sv+='<text x="'+px(IIP3)+'" y="'+py(OIP3)-8+'" text-anchor="middle" font-size="9.5" fill="#5533aa" font-weight="bold">IP3</text>';
    sv+='<line x1="'+px(IIP3)+'" y1="'+gy1+'" x2="'+px(IIP3)+'" y2="'+gy2+'" stroke="#AA77FF" stroke-width="1" stroke-dasharray="3,3"/>';
  }
  // Current operating point
  if(Pin>=pts_min&&Pin<=pts_max){
    sv+='<circle cx="'+px(Pin)+'" cy="'+py(Pout)+'" r="4" fill="#1a8a1a"/>';
    sv+='<text x="'+px(Pin)+'" y="'+py(Pout)-8+'" text-anchor="middle" font-size="9" fill="#1a8a1a">Pout='+Pout.toFixed(0)+'dBm</text>';
    sv+='<circle cx="'+px(Pin)+'" cy="'+py(IM3)+'" r="3" fill="#cc3333"/>';
    sv+='<text x="'+px(Pin)+'" y="'+py(IM3)+8+'" text-anchor="middle" font-size="9" fill="#cc3333">IM3='+IM3.toFixed(0)+'dBm</text>';
  }
  sv+='<text x="'+W/2+'" y="'+(H-2)+'" text-anchor="middle" font-size="10" fill="#888" font-style="italic">IMD = '+(Pout-IM3).toFixed(1)+' dBc  |  OIP3 = '+OIP3.toFixed(1)+' dBm</text>';
  sv+='</svg>';
  document.getElementById('tool-diagram').innerHTML=sv;
}
