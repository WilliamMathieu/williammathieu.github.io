
document.getElementById('af-btn').addEventListener('click', function() {
    var N     = parseInt(document.getElementById('af-n').value);
    var d     = parseFloat(document.getElementById('af-d').value); // in lambda
    var theta0= parseFloat(document.getElementById('af-theta').value)*Math.PI/180;
    if (isNaN(N)||N<2||isNaN(d)||d<=0) { return; }
    var canvas = document.getElementById('af-canvas');
    var ctx    = canvas.getContext('2d');
    var W=480, H=480, cx=W/2, cy=H/2, R=200;
    ctx.clearRect(0,0,W,H);
    // Grid
    ctx.strokeStyle='#ddd'; ctx.lineWidth=1;
    for (var r=50; r<=R; r+=50) { ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI); ctx.stroke(); }
    ctx.strokeStyle='#ccc';
    for (var a=0; a<360; a+=30) {
        var ar=a*Math.PI/180;
        ctx.beginPath(); ctx.moveTo(cx,cy);
        ctx.lineTo(cx+R*Math.sin(ar), cy-R*Math.cos(ar)); ctx.stroke();
    }
    // Labels
    ctx.fillStyle='#999'; ctx.font='11px monospace'; ctx.textAlign='center';
    ['0°','30°','60°','90°','120°','150°','180°','210°','240°','270°','300°','330°'].forEach(function(lbl,i){
        var lr=(i*30)*Math.PI/180;
        ctx.fillText(lbl, cx+(R+14)*Math.sin(lr), cy-(R+14)*Math.cos(lr)+4);
    });
    // Compute AF
    var nPts=720, maxAF=0;
    var afs=[];
    for (var i=0; i<nPts; i++) {
        var th=i*2*Math.PI/nPts;
        var psi=2*Math.PI*d*(Math.sin(th)-Math.sin(theta0));
        var af;
        if (Math.abs(psi)<1e-9) af=N;
        else af=Math.abs(Math.sin(N*psi/2)/Math.sin(psi/2));
        afs.push(af); if(af>maxAF)maxAF=af;
    }
    // Draw pattern
    ctx.beginPath();
    for (var j=0; j<nPts; j++) {
        var th2=j*2*Math.PI/nPts;
        var r2=(afs[j]/maxAF)*R;
        var x=cx+r2*Math.sin(th2), y=cy-r2*Math.cos(th2);
        if(j===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle='#AA77FF'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='rgba(170,119,255,0.15)'; ctx.fill();
    // Labels
    ctx.fillStyle='#333'; ctx.font='12px monospace'; ctx.textAlign='center';
    ctx.fillText('N='+N+', d='+d+'\u03bb, \u03b8\u2080='+Math.round(theta0*180/Math.PI)+'\u00b0', cx, H-8);
});
