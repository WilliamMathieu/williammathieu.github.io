// Build input rows
(function(){
  var defaults=[['1e3','-80'],['1e4','-100'],['1e5','-120'],['1e6','-140'],['1e7','-155']];
  var h='<div class="inp-grid" style="grid-template-columns:1fr 1fr 1fr 1fr 1fr;">';
  defaults.forEach(function(d,i){
    h+='<div class="inp-row"><label>Offset '+( i+1)+' (Hz)</label><input type="text" id="pn-f'+i+'" value="'+d[0]+'" style="width:100%;"></div>';
    h+='<div class="inp-row"><label>L(f) (dBc/Hz)</label><input type="text" id="pn-l'+i+'" value="'+d[1]+'" style="width:100%;"></div>';
    if(i<4) h+='<div></div>';
  });
  h+='</div>';
  document.getElementById('pn-rows').innerHTML=h;
})();
document.getElementById('pn-btn').addEventListener('click', function(){
  var fc=parseFloat(document.getElementById('pn-fc').value)*parseFloat(document.getElementById('pn-fcu').value);
  var flow=parseFloat(document.getElementById('pn-flow').value);
  var fhigh=parseFloat(document.getElementById('pn-fhigh').value);
  document.getElementById('error').textContent='';
  if([fc,flow,fhigh].some(isNaN)||fc<=0||flow<=0||fhigh<=flow){document.getElementById('error').textContent='Enter valid values. f_high must exceed f_low.';return;}
  // Collect points
  var pts=[];
  for(var i=0;i<5;i++){
    var f2=parseFloat(document.getElementById('pn-f'+i).value);
    var l=parseFloat(document.getElementById('pn-l'+i).value);
    if(!isNaN(f2)&&!isNaN(l)) pts.push([f2,l]);
  }
  if(pts.length<2){document.getElementById('error').textContent='Enter at least 2 offset/level pairs.';return;}
  pts.sort(function(a,b){return a[0]-b[0];});
  // Integrate L(f) (linear) over [flow,fhigh] using trapezoid on log scale
  // L(f) linear = 10^(L_dBc/10)
  function getLlin(f){
    if(f<=pts[0][0]) return Math.pow(10,pts[0][1]/10);
    if(f>=pts[pts.length-1][0]) return Math.pow(10,pts[pts.length-1][1]/10);
    for(var j=0;j<pts.length-1;j++){
      if(f>=pts[j][0]&&f<=pts[j+1][0]){
        // Log-log interpolation
        var t=(Math.log10(f)-Math.log10(pts[j][0]))/(Math.log10(pts[j+1][0])-Math.log10(pts[j][0]));
        var ldBc=pts[j][1]+(pts[j+1][1]-pts[j][1])*t;
        return Math.pow(10,ldBc/10);
      }
    }
    return 0;
  }
  // Numerical integration (100 steps log-spaced)
  var N=200;
  var integral=0;
  var lf1=Math.log10(flow), lf2=Math.log10(fhigh);
  for(i=0;i<N;i++){
    var f1=Math.pow(10,lf1+(lf2-lf1)*i/N);
    var f2b=Math.pow(10,lf1+(lf2-lf1)*(i+1)/N);
    var df=f2b-f1;
    integral+=(getLlin(f1)+getLlin(f2b))/2*df;
  }
  var sigma_t=Math.sqrt(2*integral)/(2*Math.PI*fc);
  var sigma_ps=sigma_t*1e12;
  var intdBc=10*Math.log10(integral);
  var l1k=pts[0][1]; // first point
  document.getElementById('pn-rms').textContent=sigma_ps.toFixed(2)+' ps RMS';
  document.getElementById('pn-pp').textContent=(6*sigma_ps).toFixed(1)+' ps (6σ)';
  document.getElementById('pn-int').textContent=intdBc.toFixed(1)+' dBc';
  document.getElementById('pn-fc-out').textContent=engFmt(fc,'Hz');
  document.getElementById('pn-band').textContent=engFmt(flow,'Hz')+' – '+engFmt(fhigh,'Hz');
  document.getElementById('pn-at1k').textContent=pts[0][1]+' dBc/Hz @ '+engFmt(pts[0][0],'Hz');
});
