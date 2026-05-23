document.getElementById('tp-btn').addEventListener('click', function() {
  var Z0=parseFloat(document.getElementById('tp-z0').value)||50;
  var type=document.getElementById('tp-type').value;
  var g=function(id){return parseFloat(document.getElementById(id).value)||0;};
  var p={a:[g('tp-11r'),g('tp-11i')],b:[g('tp-12r'),g('tp-12i')],c:[g('tp-21r'),g('tp-21i')],d:[g('tp-22r'),g('tp-22i')]};
  // Complex arithmetic helpers
  var C={
    add:function(a,b){return[a[0]+b[0],a[1]+b[1]];},
    sub:function(a,b){return[a[0]-b[0],a[1]-b[1]];},
    mul:function(a,b){return[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];},
    div:function(a,b){var d=b[0]*b[0]+b[1]*b[1];return[(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];},
    inv:function(a){var d=a[0]*a[0]+a[1]*a[1];return[a[0]/d,-a[1]/d];},
    sc:function(a,k){return[a[0]*k,a[1]*k];},
    neg:function(a){return[-a[0],-a[1]];},
    fmt:function(a){var r=a[0].toFixed(4),i=a[1];return r+(i>=0?'+':'')+i.toFixed(4)+'j';}
  };
  var S,Z,Y,ABCD;
  // Convert input to S first
  if(type==='s'){
    S=[p.a,p.b,p.c,p.d];
  } else if(type==='z'){
    // S = (Z-Z0*I)(Z+Z0*I)^-1 ... using explicit 2x2 inversion
    var za=p.a,zb=p.b,zc=p.c,zd=p.d;
    var z0c=[Z0,0];
    var Ap=C.sub(za,z0c), Bp=zb, Cp=zc, Dp=C.sub(zd,z0c);
    var Am=C.add(za,z0c), Bm=zb, Cm=zc, Dm=C.add(zd,z0c);
    // det of M+
    var det=C.sub(C.mul(Am,Dm),C.mul(Bm,Cm));
    // (M+)^-1 * M-
    var inv11=C.div(Dm,det), inv12=C.div(C.neg(Bm),det), inv21=C.div(C.neg(Cm),det), inv22=C.div(Am,det);
    S=[C.add(C.mul(inv11,Ap),C.mul(inv12,Cp)), C.add(C.mul(inv11,Bp),C.mul(inv12,Dp)),
       C.add(C.mul(inv21,Ap),C.mul(inv22,Cp)), C.add(C.mul(inv21,Bp),C.mul(inv22,Dp))];
  } else if(type==='y'){
    // Z = Y^-1 then convert
    var ya=p.a,yb=p.b,yc=p.c,yd=p.d;
    var dety=C.sub(C.mul(ya,yd),C.mul(yb,yc));
    var Za=C.div(yd,dety), Zb=C.div(C.neg(yb),dety), Zc=C.div(C.neg(yc),dety), Zd=C.div(ya,dety);
    // Re-run Z->S
    z0c=[Z0,0];
    Ap=C.sub(Za,z0c);Bp=Zb;Cp=Zc;Dp=C.sub(Zd,z0c);
    Am=C.add(Za,z0c);Bm=Zb;Cm=Zc;Dm=C.add(Zd,z0c);
    var det2=C.sub(C.mul(Am,Dm),C.mul(Bm,Cm));
    var i11=C.div(Dm,det2),i12=C.div(C.neg(Bm),det2),i21=C.div(C.neg(Cm),det2),i22=C.div(Am,det2);
    S=[C.add(C.mul(i11,Ap),C.mul(i12,Cp)),C.add(C.mul(i11,Bp),C.mul(i12,Dp)),
       C.add(C.mul(i21,Ap),C.mul(i22,Cp)),C.add(C.mul(i21,Bp),C.mul(i22,Dp))];
  } else {
    // ABCD → S
    var A=p.a,B=p.b,CC=p.c,D=p.d;
    z0c=[Z0,0];
    var denom=C.add(C.add(A,C.div(B,z0c)),C.add(C.mul(CC,z0c),D));
    S=[C.div(C.sub(C.sub(C.add(A,C.div(B,z0c)),C.mul(CC,z0c)),D),denom),
       C.div(C.sc([1,0],2),denom),
       C.div(C.sc([1,0],2),denom),
       C.div(C.sub(C.sub(C.add(C.neg(A),C.div(B,z0c)),C.mul(CC,z0c)),C.neg(D)),denom)];
    // S12: 2/(A+B/Z0+C*Z0+D), S11: (A+B/Z0-C*Z0-D)/denom
    S[0]=C.div(C.sub(C.sub(A,C.div(C.neg(B),z0c)),C.add(C.mul(CC,z0c),C.neg(D))),denom);
  }
  // S → Z
  var s11=S[0],s12=S[1],s21=S[2],s22=S[3];
  z0c=[Z0,0];
  // Z = Z0*(I+S)*(I-S)^-1
  var IS_a=C.add([1,0],s11),IS_b=s12,IS_c=s21,IS_d=C.add([1,0],s22);
  var ImS_a=C.sub([1,0],s11),ImS_b=C.neg(s12),ImS_c=C.neg(s21),ImS_d=C.sub([1,0],s22);
  var dIm=C.sub(C.mul(ImS_a,ImS_d),C.mul(ImS_b,ImS_c));
  var inv_a=C.div(ImS_d,dIm),inv_b=C.div(C.neg(ImS_b),dIm),inv_c=C.div(C.neg(ImS_c),dIm),inv_d=C.div(ImS_a,dIm);
  var ZZ_a=C.sc(C.add(C.mul(IS_a,inv_a),C.mul(IS_b,inv_c)),Z0);
  var ZZ_b=C.sc(C.add(C.mul(IS_a,inv_b),C.mul(IS_b,inv_d)),Z0);
  var ZZ_c=C.sc(C.add(C.mul(IS_c,inv_a),C.mul(IS_d,inv_c)),Z0);
  var ZZ_d=C.sc(C.add(C.mul(IS_c,inv_b),C.mul(IS_d,inv_d)),Z0);
  Z=[ZZ_a,ZZ_b,ZZ_c,ZZ_d];
  // Z → Y
  var detZ=C.sub(C.mul(Z[0],Z[3]),C.mul(Z[1],Z[2]));
  Y=[C.div(Z[3],detZ),C.div(C.neg(Z[1]),detZ),C.div(C.neg(Z[2]),detZ),C.div(Z[0],detZ)];
  // S → ABCD
  // ABCD:
  // A=(1-s11)(1+s22)/2/s21 + s12/(2s21) ... actually standard formula:
  // A = ((1+s11)(1-s22)+s12*s21)/(2s21), B=Z0*((1+s11)(1+s22)-s12*s21)/(2s21)
  // C = (1/Z0)*((1-s11)(1-s22)-s12*s21)/(2s21), D=((1-s11)(1+s22)+s12*s21)/(2s21)
  var AB=C.sc(s21,2);
  ABCD=[C.div(C.add(C.mul(C.add([1,0],s11),C.sub([1,0],s22)),C.mul(s12,s21)),AB),
        C.div(C.mul(z0c,C.add(C.mul(C.add([1,0],s11),C.add([1,0],s22)),C.neg(C.mul(s12,s21)))),AB),
        C.div(C.div(C.sub(C.mul(C.sub([1,0],s11),C.sub([1,0],s22)),C.mul(s12,s21)),AB),z0c),
        C.div(C.add(C.mul(C.sub([1,0],s11),C.add([1,0],s22)),C.mul(s12,s21)),AB)];
  function mat(label,m,cols){
    var h='<div style="margin-bottom:12px;"><div style="font-family:monospace;font-size:10px;font-weight:bold;color:#5533aa;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:6px;padding-bottom:3px;border-bottom:1px solid #e0d8ff;">'+label+'</div>';
    h+='<table style="font-size:12px;border-collapse:collapse;font-family:monospace;width:100%;">';
    var row=function(r,c,v){return '<td style="padding:4px 12px;border-bottom:1px dotted #e8e0ff;color:#1a1a1a;font-weight:bold;">'+v+'</td>';}
    h+='<tr>'+row(0,0,cols[0]+' = '+C.fmt(m[0]))+row(0,1,cols[1]+' = '+C.fmt(m[1]))+'</tr>';
    h+='<tr>'+row(1,0,cols[2]+' = '+C.fmt(m[2]))+row(1,1,cols[3]+' = '+C.fmt(m[3]))+'</tr>';
    h+='</table></div>'; return h;
  }
  document.getElementById('tp-out').innerHTML=
    mat('S-Parameters',S,['S₁₁','S₁₂','S₂₁','S₂₂'])+
    mat('Z-Parameters (Ω)',Z,['Z₁₁','Z₁₂','Z₂₁','Z₂₂'])+
    mat('Y-Parameters (S)',Y,['Y₁₁','Y₁₂','Y₂₁','Y₂₂'])+
    mat('ABCD Matrix',ABCD,['A','B (Ω)','C (S)','D']);
});
