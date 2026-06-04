document.getElementById('at-btn').addEventListener('click', function() {
  var A  = parseFloat(document.getElementById('at-atten').value);
  var Z0 = parseFloat(document.getElementById('at-z0').value);
  var topo = document.getElementById('at-topo').value;
  document.getElementById('error').textContent='';
  if(isNaN(A)||A<=0||isNaN(Z0)||Z0<=0){document.getElementById('error').textContent='Enter valid positive values.';return;}
  var K=Math.pow(10,A/20), R1,R2,R3;
  if(topo==='pi'){
    R1=Z0*(K+1)/(K-1); R2=Z0*(K*K-1)/(2*K); R3=R1;
  } else if(topo==='t'){
    R1=Z0*(K-1)/(K+1); R2=2*Z0*K/(K*K-1); R3=R1;
  } else if(topo==='l'){
    var ZS=parseFloat(document.getElementById('at-zs').value);
    var ZL=parseFloat(document.getElementById('at-zl').value);
    if(isNaN(ZS)||isNaN(ZL)){document.getElementById('error').textContent='Enter ZS and ZL for L-pad.';return;}
    // L-pad: R_series in series with ZS side, R_shunt across ZL side
    // Attenuation A_lpad from voltage divider; also matches ZS to ZL
    R2=Math.sqrt(ZS*ZL*(1-1/(K*K)));  // shunt R
    R1=ZS/K - R2*ZL/(R2+ZL);           // series R
    if(R1<0){document.getElementById('error').textContent='ZS must be > ZL for L-pad. Swap if needed.';return;}
    R3=NaN;
  } else { // Bridged-T
    R1=Z0*(K-1); R2=Z0/(K-1); R3=Z0;
  }
  var set=function(id,v){var el=document.getElementById(id);el.textContent=isNaN(v)||!isFinite(v)?'N/A':engFmt(v,'Ω');};
  set('at-r1',R1); set('at-r2',R2); set('at-r3',R3);
  document.getElementById('at-atten-check').textContent=A.toFixed(2)+' dB';
  document.getElementById('at-rl').textContent='>'+Math.max(20,A*2).toFixed(0)+' dB (ideal)';
  if(window.drawDiagram) drawDiagram();
});
/* exported atTopoChange */
function atTopoChange(){
  var topo=document.getElementById('at-topo').value;
  document.getElementById('at-lpad-row').style.display=(topo==='l')?'':'none';
}
// eslint-disable-next-line no-redeclare
function drawDiagram(){
  var topo=document.getElementById('at-topo').value;
  var R1=document.getElementById('at-r1').textContent;
  var R2=document.getElementById('at-r2').textContent;
  var R3=document.getElementById('at-r3').textContent;
  var A=document.getElementById('at-atten').value||'?';
  var Z0=document.getElementById('at-z0').value||'50';
  var W=520,H=160,wy=75,gnd=130;
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  s+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  s+='<text x="'+W/2+'" y="14" text-anchor="middle" font-size="11" fill="#5533aa" font-weight="bold">'+topo.toUpperCase()+' Attenuator — '+A+' dB   Z₀ = '+Z0+' Ω</text>';

  if(topo==='pi'){
    // Pi: shunt R1 | series R2 | shunt R3
    var j1=100,j2=380,lx=30,rx=490;
    s+='<line x1="'+lx+'" y1="'+wy+'" x2="'+rx+'" y2="'+wy+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
    // Shunt R1
    [''+j1,''+j2].forEach(function(jx,i){
      var Rv=i===0?R1:R3;
      s+='<circle cx="'+jx+'" cy="'+wy+'" r="3" fill="#5533aa"/>';
      s+='<line x1="'+jx+'" y1="'+wy+'" x2="'+jx+'" y2="'+(wy+18)+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
      s+='<rect x="'+(parseInt(jx)-16)+'" y="'+(wy+18)+'" width="32" height="20" fill="white" stroke="#5533aa" stroke-width="1.8" rx="2"/>';
      s+='<text x="'+jx+'" y="'+(wy+32)+'" text-anchor="middle" font-size="9" fill="#5533aa">'+Rv+'</text>';
      s+='<line x1="'+jx+'" y1="'+(wy+38)+'" x2="'+jx+'" y2="'+gnd+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
      s+='<line x1="'+(parseInt(jx)-10)+'" y1="'+gnd+'" x2="'+(parseInt(jx)+10)+'" y2="'+gnd+'" stroke="#444" stroke-width="2" stroke-linecap="round"/>';
      s+='<line x1="'+(parseInt(jx)-6)+'" y1="'+(gnd+5)+'" x2="'+(parseInt(jx)+6)+'" y2="'+(gnd+5)+'" stroke="#444" stroke-width="1.4" stroke-linecap="round"/>';
    });
    // Series R2 between j1 and j2
    var rm=parseInt(j1)+(parseInt(j2)-parseInt(j1))/2;
    s+='<rect x="'+(rm-28)+'" y="'+(wy-11)+'" width="56" height="22" fill="white" stroke="#AA77FF" stroke-width="2" rx="2"/>';
    s+='<text x="'+rm+'" y="'+(wy+4)+'" text-anchor="middle" font-size="9" fill="#AA77FF">'+R2+'</text>';
    // Port circles
    s+='<circle cx="'+lx+'" cy="'+wy+'" r="4" fill="white" stroke="#5533aa" stroke-width="1.8"/>';
    s+='<circle cx="'+rx+'" cy="'+wy+'" r="4" fill="white" stroke="#5533aa" stroke-width="1.8"/>';
    s+='<text x="'+lx+'" y="'+(wy-12)+'" text-anchor="middle" font-size="9" fill="#888">IN</text>';
    s+='<text x="'+rx+'" y="'+(wy-12)+'" text-anchor="middle" font-size="9" fill="#888">OUT</text>';
  } else if(topo==='t'){
    // T: series R1 | shunt R2 | series R3
    var lx2=30,rx2=490,jm=260;
    s+='<line x1="'+lx2+'" y1="'+wy+'" x2="'+rx2+'" y2="'+wy+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
    // Series R1
    s+='<rect x="'+(lx2+30)+'" y="'+(wy-11)+'" width="56" height="22" fill="white" stroke="#AA77FF" stroke-width="2" rx="2"/>';
    s+='<text x="'+(lx2+58)+'" y="'+(wy+4)+'" text-anchor="middle" font-size="9" fill="#AA77FF">'+R1+'</text>';
    // Series R3
    s+='<rect x="'+(rx2-86)+'" y="'+(wy-11)+'" width="56" height="22" fill="white" stroke="#AA77FF" stroke-width="2" rx="2"/>';
    s+='<text x="'+(rx2-58)+'" y="'+(wy+4)+'" text-anchor="middle" font-size="9" fill="#AA77FF">'+R3+'</text>';
    // Shunt R2 at centre
    s+='<circle cx="'+jm+'" cy="'+wy+'" r="3" fill="#5533aa"/>';
    s+='<line x1="'+jm+'" y1="'+wy+'" x2="'+jm+'" y2="'+(wy+18)+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
    s+='<rect x="'+(jm-16)+'" y="'+(wy+18)+'" width="32" height="20" fill="white" stroke="#5533aa" stroke-width="1.8" rx="2"/>';
    s+='<text x="'+jm+'" y="'+(wy+32)+'" text-anchor="middle" font-size="9" fill="#5533aa">'+R2+'</text>';
    s+='<line x1="'+jm+'" y1="'+(wy+38)+'" x2="'+jm+'" y2="'+gnd+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
    s+='<line x1="'+(jm-10)+'" y1="'+gnd+'" x2="'+(jm+10)+'" y2="'+gnd+'" stroke="#444" stroke-width="2" stroke-linecap="round"/>';
    s+='<line x1="'+(jm-6)+'" y1="'+(gnd+5)+'" x2="'+(jm+6)+'" y2="'+(gnd+5)+'" stroke="#444" stroke-width="1.4" stroke-linecap="round"/>';
    s+='<circle cx="'+lx2+'" cy="'+wy+'" r="4" fill="white" stroke="#5533aa" stroke-width="1.8"/>';
    s+='<circle cx="'+rx2+'" cy="'+wy+'" r="4" fill="white" stroke="#5533aa" stroke-width="1.8"/>';
    s+='<text x="'+lx2+'" y="'+(wy-12)+'" text-anchor="middle" font-size="9" fill="#888">IN</text>';
    s+='<text x="'+rx2+'" y="'+(wy-12)+'" text-anchor="middle" font-size="9" fill="#888">OUT</text>';
  } else {
    // Generic label for L and BT
    s+='<rect x="160" y="40" width="200" height="60" fill="#f0eeff" stroke="#AA77FF" stroke-width="2" rx="6"/>';
    s+='<text x="260" y="68" text-anchor="middle" font-size="12" font-weight="bold" fill="#5533aa">'+topo.toUpperCase()+' Attenuator</text>';
    s+='<text x="260" y="85" text-anchor="middle" font-size="10" fill="#AA77FF">R₁='+R1+'  R₂='+R2+(R3!=='N/A'?'  R₃='+R3:'')+'</text>';
    s+='<line x1="30" y1="'+wy+'" x2="160" y2="'+wy+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
    s+='<line x1="360" y1="'+wy+'" x2="490" y2="'+wy+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
    s+='<circle cx="30" cy="'+wy+'" r="4" fill="white" stroke="#5533aa" stroke-width="1.8"/>';
    s+='<circle cx="490" cy="'+wy+'" r="4" fill="white" stroke="#5533aa" stroke-width="1.8"/>';
  }
  s+='</svg>';
  document.getElementById('tool-diagram').innerHTML=s;
}
