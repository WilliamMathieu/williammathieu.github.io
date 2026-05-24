// eslint-disable-next-line no-redeclare
function vswrUpdate(src) {
  var vswr,gamma,rl,ml;
  try {
    if(src==='vswr')  { vswr =parseFloat(document.getElementById('v-vswr').value);  if(vswr<1)throw 1; gamma=(vswr-1)/(vswr+1); }
    else if(src==='gamma') { gamma=parseFloat(document.getElementById('v-gamma').value); if(gamma<0||gamma>1)throw 1; vswr=(1+gamma)/(1-gamma); }
    else if(src==='rl') { rl=parseFloat(document.getElementById('v-rl').value); if(rl<0)throw 1; gamma=Math.pow(10,-rl/20); vswr=(1+gamma)/(1-gamma); }
    else { ml=parseFloat(document.getElementById('v-ml').value); if(ml<0)throw 1; gamma=Math.sqrt(1-Math.pow(10,-ml/10)); vswr=(1+gamma)/(1-gamma); }
    if(!isFinite(vswr)||!isFinite(gamma)) throw 1;
    rl  = -20*Math.log10(gamma);
    ml  = -10*Math.log10(1-gamma*gamma);
    var tx = (1-gamma*gamma)*100;
    document.getElementById('ro-vswr').textContent  = vswr.toFixed(4);
    document.getElementById('ro-gamma').textContent = gamma.toFixed(4);
    document.getElementById('ro-rl').textContent    = (isFinite(rl)?rl.toFixed(2):'∞')+' dB';
    document.getElementById('ro-ml').textContent    = ml.toFixed(4)+' dB';
    document.getElementById('ro-tx').textContent    = tx.toFixed(2)+'%';
    // Colour code VSWR result
    var el=document.getElementById('ro-vswr');
    el.className='res-val '+(vswr<=1.5?'good':vswr<=2?'warn':'bad');
    document.getElementById('error').textContent='';
    if(window.drawDiagram) drawDiagram(gamma);
  } catch(e) { document.getElementById('error').textContent='Enter a valid value.'; }
}
// eslint-disable-next-line no-redeclare
function drawDiagram(g) {
  if(g===undefined){var rl=parseFloat(document.getElementById('v-rl').value)||20;g=Math.pow(10,-rl/20);}
  var W=480,H=130,wy=65;
  var tx_len=Math.round((1-g)*240+20), ref_len=Math.round(g*240);
  var col=g<0.1?'#1a8a1a':g<0.316?'#aa6600':'#cc2222';
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg" style="font-family:monospace;max-width:100%;">';
  s+='<rect width="'+W+'" height="'+H+'" fill="#faf9ff" rx="4"/>';
  // Incident wave arrow
  s+='<line x1="20" y1="45" x2="'+(20+tx_len)+'" y2="45" stroke="#5533aa" stroke-width="3" stroke-linecap="round"/>';
  s+='<polygon points="'+(20+tx_len)+',45 '+(20+tx_len-10)+',39 '+(20+tx_len-10)+',51" fill="#5533aa"/>';
  s+='<text x="'+(20+tx_len/2)+'" y="36" text-anchor="middle" font-size="11" fill="#5533aa">Incident power ('+((1-g*g)*100).toFixed(1)+'% transmitted)</text>';
  // Load block
  s+='<rect x="'+(20+tx_len)+'" y="30" width="50" height="30" fill="#f0eeff" stroke="#5533aa" stroke-width="2" rx="4"/>';
  s+='<text x="'+(20+tx_len+25)+'" y="50" text-anchor="middle" font-size="10" fill="#5533aa" font-weight="bold">Z_L</text>';
  // Reflected arrow
  if(ref_len>4){
    s+='<line x1="'+(20+tx_len)+'" y1="88" x2="'+(20+tx_len-ref_len)+'" y2="88" stroke="'+col+'" stroke-width="3" stroke-linecap="round"/>';
    s+='<polygon points="'+(20+tx_len-ref_len)+',88 '+(20+tx_len-ref_len+10)+',82 '+(20+tx_len-ref_len+10)+',94" fill="'+col+'"/>';
    s+='<text x="'+(20+tx_len-ref_len/2)+'" y="106" text-anchor="middle" font-size="11" fill="'+col+'">Reflected (|Γ|='+g.toFixed(3)+', RL='+(isFinite(-20*Math.log10(g))?(-20*Math.log10(g)).toFixed(1):'∞')+'dB)</text>';
  } else {
    s+='<text x="240" y="100" text-anchor="middle" font-size="11" fill="#1a8a1a">Near-perfect match — negligible reflection</text>';
  }
  s+='</svg>';
  document.getElementById('tool-diagram').innerHTML=s;
}
window.addEventListener('load',()=>{vswrUpdate('rl');});
