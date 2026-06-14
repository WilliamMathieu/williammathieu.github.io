var MU0=4*Math.PI*1e-7;
function rosaInductance(length_m, diam_m){
  // Rosa formula for straight wire inductance (H)
  var L=MU0/(2*Math.PI)*length_m*(Math.log(2*length_m/diam_m)-0.75);
  return Math.max(0,L);
}
document.getElementById('bc-btn').addEventListener('click', function(){
  var N=parseInt(document.getElementById('bc-n').value);
  var r=parseFloat(document.getElementById('bc-r').value)*1e-3;
  var len=parseFloat(document.getElementById('bc-l').value)*1e-3;
  var d=parseFloat(document.getElementById('bc-d').value)*1e-3;
  var type=document.getElementById('bc-type').value;
  var f0=parseFloat(document.getElementById('bc-f').value)*1e6;
  document.getElementById('error').textContent='';
  if([N,r,len,d,f0].some(isNaN)||N<4||r<=0||len<=0||d<=0||f0<=0){
    document.getElementById('error').textContent='Enter valid values. N must be ≥ 4.';return;}
  var w0=2*Math.PI*f0;
  // Leg inductance (Rosa formula for straight wire of length ℓ)
  var L_leg=rosaInductance(len, d);
  // Ring arc inductance (curved wire segment, length = 2πr/N)
  var arc_len=2*Math.PI*r/N;
  var L_arc=rosaInductance(arc_len, d);
  var C;
  if(type==='lp'){
    // LP: C in legs. Mode m resonance: ω_m² = 2/C / (L_leg + 4*L_arc/N * sin²(mπ/N))
    // For m=1 (imaging mode):
    var Denom=L_leg+(4*L_arc/N)*Math.pow(Math.sin(Math.PI/N),2);
    C=2/(w0*w0*Denom);
  } else {
    // HP: C in ring arcs. Mode m: ω_m² = 2*N/C / (N*L_leg/(2*sin²(mπ/N)*... 
    // HP: capacitors C_arc in each ring arc segment.
    // ω_m² = 1/C_arc / (L_leg/(4*sin²(mπ/N)) + L_arc)
    var Denom2=L_leg/(4*Math.pow(Math.sin(Math.PI/N),2))+L_arc;
    C=1/(w0*w0*Denom2);
  }
  // Compute mode frequencies
  function modeFreq(m){
    if(type==='lp'){
      var D=L_leg+(4*L_arc/N)*Math.pow(Math.sin(m*Math.PI/N),2);
      return Math.sqrt(2/(C*D))/(2*Math.PI);
    } else {
      var D2=L_leg/(4*Math.pow(Math.sin(m*Math.PI/N),2))+L_arc;
      return Math.sqrt(1/(C*D2))/(2*Math.PI);
    }
  }
  var f1=modeFreq(1), f2=modeFreq(2);
  var msep=(f2-f1)/f1*100;
  // Rough Q estimate: wL/R_DC where R_DC ≈ ρ*l/(π*(d/2)²) for copper
  var rho=1.72e-8;
  var area=Math.PI*Math.pow(d/2,2);
  var R_leg=rho*len/area;
  var Q=w0*L_leg/R_leg;
  var cplace=type==='lp'?'One capacitor C per rung (leg)':'One capacitor C per ring arc segment (N total per ring, 2N total)';
  document.getElementById('bc-Lleg').textContent=engFmt(L_leg,'H');
  document.getElementById('bc-Larc').textContent=engFmt(L_arc,'H');
  document.getElementById('bc-C').textContent=engFmt(C,'F');
  document.getElementById('bc-cplace').textContent=cplace;
  document.getElementById('bc-f1').textContent=(f1/1e6).toFixed(2)+' MHz';
  document.getElementById('bc-f2').textContent=(f2/1e6).toFixed(2)+' MHz';
  document.getElementById('bc-msep').textContent=msep.toFixed(1)+'%';
  document.getElementById('bc-Q').textContent=Q.toFixed(0);
  if(window.drawDiagram) drawDiagram(N,r*1e3,type);
});
// eslint-disable-next-line no-redeclare
function drawDiagram(N,r,type){
  if(!N){N=16;r=150;type='lp';}
  var W=320,H=320,cx=W/2,cy=H/2,R=130;
  var sv='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  sv+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  // End ring
  sv+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="#5533aa" stroke-width="2.5"/>';
  var disp=Math.min(N,24);
  for(var i=0;i<disp;i++){
    var ang=2*Math.PI*i/disp-Math.PI/2;
    var x1=cx+R*Math.cos(ang), y1=cy+R*Math.sin(ang);
    // Rung (leg)
    var innerR=R*0.55;
    var x2=cx+innerR*Math.cos(ang), y2=cy+innerR*Math.sin(ang);
    sv+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>';
    // LP: capacitor on rung; HP: on ring arc
    if(type==='lp'){
      var mx=(x1+x2)/2, my=(y1+y2)/2;
      var perp_x=-(y1-y2)/Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))*6;
      var perp_y=(x1-x2)/Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))*6;
      sv+='<line x1="'+(mx-perp_x).toFixed(1)+'" y1="'+(my-perp_y).toFixed(1)+'" x2="'+(mx+perp_x).toFixed(1)+'" y2="'+(my+perp_y).toFixed(1)+'" stroke="#AA77FF" stroke-width="3" stroke-linecap="round"/>';
    } else {
      // Cap on ring arc
      var ang_mid=(ang+2*Math.PI*(i+1)/disp-Math.PI/2)/2;
      var cmx=cx+(R+1)*Math.cos(ang_mid), cmy=cy+(R+1)*Math.sin(ang_mid);
      var tg_x=-Math.sin(ang_mid)*6, tg_y=Math.cos(ang_mid)*6;
      sv+='<line x1="'+(cmx-tg_x).toFixed(1)+'" y1="'+(cmy-tg_y).toFixed(1)+'" x2="'+(cmx+tg_x).toFixed(1)+'" y2="'+(cmy+tg_y).toFixed(1)+'" stroke="#AA77FF" stroke-width="3" stroke-linecap="round"/>';
    }
  }
  // Inner ring label
  sv+='<text x="'+cx+'" y="'+(cy-10)+'" text-anchor="middle" font-size="11" fill="#AA77FF" font-weight="bold">N='+N+'</text>';
  sv+='<text x="'+cx+'" y="'+(cy+8)+'" text-anchor="middle" font-size="10" fill="#888">r='+r+'mm</text>';
  sv+='<text x="'+cx+'" y="'+(cy+24)+'" text-anchor="middle" font-size="10" fill="#5533aa">'+(type==='lp'?'LP: C in legs':'HP: C in arcs')+'</text>';
  sv+='</svg>';
  document.getElementById('tool-diagram').innerHTML=sv;
}
