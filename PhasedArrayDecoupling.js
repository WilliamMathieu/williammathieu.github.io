var MU0_PA=4*Math.PI*1e-7;
function neumann_M(r1,r2,d){
  // Mutual inductance between two coaxial circular loops separated by d
  // Neumann formula (exact for coaxial loops): M = µ0·√(r1·r2)·[(2/k-k)·K(k)-2/k·E(k)]
  // k² = 4r1r2/((r1+r2)²+d²)
  // Here r1=r2=r
  var k2=4*r1*r1/((2*r1)*(2*r1)+d*d);
  var k=Math.sqrt(k2), kp=Math.sqrt(1-k2);
  // Complete elliptic integrals via AGM
  function K(k2){var a=1,b=Math.sqrt(1-k2);for(var i=0;i<30;i++){var a1=(a+b)/2;b=Math.sqrt(a*b);a=a1;}return Math.PI/(2*a);}
  function E(k2){var a=1,b=Math.sqrt(1-k2),c=k2/2;for(var i=0;i<30;i++){var a1=(a+b)/2,b1=Math.sqrt(a*b);c-=Math.pow(2,i)*(a1-b1)*(a1-b1);a=a1;b=b1;}return Math.PI/(2*a)*(1-c);}
  var Kk=K(k2), Ek=E(k2);
  return MU0_PA*r1*((2/k-k)*Kk-2/k*Ek);
}
function rosaSelfL(r,a){
  // Self-inductance of circular loop (Rosa formula), r=loop radius, a=wire radius
  return MU0_PA*r*(Math.log(8*r/a)-2);
}
document.getElementById('pa2-btn').addEventListener('click', function(){
  var r=parseFloat(document.getElementById('pa2-r').value)*1e-3;
  var d=parseFloat(document.getElementById('pa2-d').value)*1e-3;
  var f=parseFloat(document.getElementById('pa2-f').value)*1e6;
  var Z0=parseFloat(document.getElementById('pa2-z0').value);
  var Zp=parseFloat(document.getElementById('pa2-zp').value);
  document.getElementById('error').textContent='';
  if([r,d,f,Z0,Zp].some(isNaN)||r<=0||d<=0||f<=0){document.getElementById('error').textContent='Enter valid positive values.';return;}
  var w=2*Math.PI*f;
  // Self inductance (assume wire radius = r/20)
  var L=rosaSelfL(r, r/20);
  var M=neumann_M(r,r,d);
  var k_coup=M/L;
  var iso_dB=-20*Math.log10(Math.abs(k_coup));
  // Optimal overlap: M=0 when c-to-c ≈ 1.54*r (empirical for circular loops, always 23% of diameter)
  var d_overlap=1.54*r; // optimal c-to-c for zero M
  var current_overlap_mm=Math.max(0,(2*r-d)*1e3);
  var current_ovfrac=d<2*r?(2*r-d)/(2*r)*100:0;
  // Capacitive decoupling: C_d cancels mutual reactance jωM → C_d = 1/(ω²M)...
  // Actually: C_d chosen so Z_d = 1/(jωC_d) cancels the mutual coupling term
  var C_d=1/(w*w*Math.abs(M));
  // Preamplifier decoupling
  var vf=0.82; // velocity factor RG-174
  var lam4=3e8*vf/(4*f);
  var Zhigh=Z0*Z0/Zp;
  var dec_dB=20*Math.log10(1+Zhigh/(w*L));
  var onote;
  if(d>=2*r){onote='No overlap — move to '+(d_overlap*1e3).toFixed(1)+' mm c-to-c for zero M';}
  else if(Math.abs(d-d_overlap)<0.05*r){onote='Near-optimal overlap — M ≈ 0 ✓';}
  else if(d<d_overlap){onote='Past zero-M point — increase to '+(d_overlap*1e3).toFixed(1)+' mm c-to-c';}
  else{onote='In overlap range — decrease to '+(d_overlap*1e3).toFixed(1)+' mm c-to-c for zero M';}
  document.getElementById('pa2-M').textContent=engFmt(M,'H');
  document.getElementById('pa2-k').textContent=k_coup.toFixed(4)+(Math.abs(k_coup)<0.02?' (low ✓)':' (significant)');
  document.getElementById('pa2-iso0').textContent=iso_dB.toFixed(1)+' dB';
  document.getElementById('pa2-overlap').textContent=current_overlap_mm.toFixed(1)+' mm  (optimal: '+(d_overlap*1e3).toFixed(1)+' mm)';
  document.getElementById('pa2-ovfrac').textContent=current_ovfrac.toFixed(1)+'%  (optimal: 23.0%)';
  document.getElementById('pa2-onote').textContent=onote;
  document.getElementById('pa2-Cd').textContent=engFmt(C_d,'F');
  document.getElementById('pa2-Cil').textContent='< 0.5 dB (typical)';
  document.getElementById('pa2-clen').textContent=(lam4*100).toFixed(1)+' cm';
  document.getElementById('pa2-Zhigh').textContent=Zhigh.toFixed(0)+' Ω';
  document.getElementById('pa2-pdec').textContent=dec_dB.toFixed(1)+' dB';
});
