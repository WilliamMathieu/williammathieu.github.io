/* Interactive Smith Chart */
var SC = {
    canvas: null, ctx: null,
    W: 480, H: 480,
    cx: 240, cy: 240, R: 210,
    z0: 50,
    points: [],
    colors: ['#AA77FF','#ff6644','#00ccff','#ff44aa','#00ffcc','#ffcc00','#88dd00']
};

window.addEventListener('load', function() {
    SC.canvas = document.getElementById('sc-canvas');
    SC.ctx    = SC.canvas.getContext('2d');
    scDrawChart();
    SC.canvas.addEventListener('click', scHandleClick);
    SC.canvas.addEventListener('mousemove', scHandleMove);
});

/* Convert normalised reflection coef (complex) to canvas coords */
function gammaToXY(gRe, gIm) {
    return {
        x: SC.cx + SC.R * gRe,
        y: SC.cy - SC.R * gIm
    };
}

/* Convert canvas coords to gamma */
function xyToGamma(x, y) {
    return {
        re: (x - SC.cx) / SC.R,
        im: -(y - SC.cy) / SC.R
    };
}

/* Gamma → normalised impedance z = (1+G)/(1-G) */
function gammaToZ(gRe, gIm) {
    var denom = (1-gRe)*(1-gRe) + gIm*gIm;
    if (denom < 1e-12) return { r: 1e9, x: 0 };
    var zRe = ((1-gRe*gRe - gIm*gIm)) / denom;
    var zIm = (2*gIm) / denom;
    return { r: zRe, x: zIm };
}

/* Normalised z → gamma */
function zToGamma(r, x) {
    var n_re = r - 1, n_im = x;
    var d_re = r + 1, d_im = x;
    var denom = d_re*d_re + d_im*d_im;
    return { re: (n_re*d_re + n_im*d_im)/denom, im: (n_im*d_re - n_re*d_im)/denom };
}

function scDrawChart() {
    SC.z0 = parseFloat(document.getElementById('sc-z0').value) || 50;
    var ctx = SC.ctx;
    var W=SC.W, H=SC.H, cx=SC.cx, cy=SC.cy, R=SC.R;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#fafafa'; ctx.fillRect(0,0,W,H);

    // Outer circle (|Γ|=1)
    ctx.strokeStyle='#333'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI); ctx.stroke();

    // Real axis
    ctx.strokeStyle='#aaa'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy); ctx.stroke();

    // Constant resistance circles: r = 0, 0.2, 0.5, 1, 2, 5
    var rValues = [0, 0.2, 0.5, 1, 2, 5, 10];
    rValues.forEach(function(r) {
        var rCircR = R / (1+r);           // radius in canvas units
        var rCircX = cx + R - rCircR;     // centre x
        ctx.strokeStyle = r===1 ? '#AA77FF' : '#aaa';
        ctx.lineWidth   = r===1 ? 1.2 : 0.7;
        ctx.beginPath(); ctx.arc(rCircX, cy, rCircR, 0, 2*Math.PI); ctx.stroke();
        // label
        if (r < 10) {
            ctx.fillStyle='#666'; ctx.font='9px monospace'; ctx.textAlign='center';
            ctx.fillText(r, rCircX, cy + rCircR + 10);
        }
    });

    // Constant reactance arcs: x = ±0.2, ±0.5, ±1, ±2, ±5
    var xValues = [0.2, 0.5, 1, 2, 5];
    xValues.forEach(function(x) {
        [x, -x].forEach(function(xi) {
            var xCircR = R / Math.abs(xi);   // radius
            var xCircY = cy - R / xi;        // centre y (sign handles ±)
            ctx.strokeStyle = (Math.abs(xi)===1) ? '#00aacc' : '#ccc';
            ctx.lineWidth   = (Math.abs(xi)===1) ? 1 : 0.7;
            // Clip to unit circle — draw full arc, canvas clips via path
            ctx.save();
            ctx.beginPath(); ctx.arc(cx,cy,R+0.5,0,2*Math.PI); ctx.clip();
            ctx.beginPath(); ctx.arc(cx+R, xCircY, xCircR, 0, 2*Math.PI);
            ctx.stroke(); ctx.restore();
        });
    });

    // Reactance axis labels
    ctx.fillStyle='#888'; ctx.font='9px monospace';
    [0.5,1,2].forEach(function(x){
        var g=zToGamma(0,x); var p=gammaToXY(g.re,g.im);
        ctx.textAlign='left'; ctx.fillText('+j'+x, p.x+3, p.y);
        var gn=zToGamma(0,-x); var pn=gammaToXY(gn.re,gn.im);
        ctx.textAlign='left'; ctx.fillText('-j'+x, pn.x+3, pn.y);
    });

    // Draw stored points
    SC.points.forEach(function(pt, i) {
        var g = zToGamma(pt.r/SC.z0, pt.x/SC.z0);
        var p = gammaToXY(g.re, g.im);
        ctx.fillStyle = SC.colors[i % SC.colors.length];
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 2*Math.PI); ctx.fill();
        ctx.fillStyle='#333'; ctx.font='bold 10px monospace'; ctx.textAlign='left';
        ctx.fillText((i+1), p.x+7, p.y-3);
    });
}

function scHandleMove(e) {
    var rect = SC.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    var g = xyToGamma(x, y);
    var mag = Math.sqrt(g.re*g.re + g.im*g.im);
    if (mag > 1.01) { document.getElementById('sc-info').textContent = 'Outside chart boundary'; return; }
    var z = gammaToZ(g.re, g.im);
    var Z0 = SC.z0;
    var Zr = z.r * Z0, Zx = z.x * Z0;
    var RL_dB = mag > 0 ? -20*Math.log10(mag) : Infinity;
    var VSWR  = mag < 1 ? (1+mag)/(1-mag) : Infinity;
    document.getElementById('sc-info').innerHTML =
        'Z = ' + Zr.toFixed(2) + (Zx>=0?'+':'')+Zx.toFixed(2)+'j \u03A9 &nbsp;|&nbsp; '
      + '|\u0393| = ' + mag.toFixed(4) + ' &nbsp;|&nbsp; '
      + 'RL = ' + (isFinite(RL_dB)?RL_dB.toFixed(2)+'dB':'\u221e') + ' &nbsp;|&nbsp; '
      + 'VSWR = ' + (isFinite(VSWR)?VSWR.toFixed(3):'\u221e');
}

function scHandleClick(e) {
    var rect = SC.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    var g = xyToGamma(x, y);
    var mag = Math.sqrt(g.re*g.re + g.im*g.im);
    if (mag > 1.01) return;
    var z = gammaToZ(g.re, g.im);
    var Z0 = SC.z0;
    var Zr = z.r * Z0, Zx = z.x * Z0;
    SC.points.push({ r: Zr, x: Zx });
    scUpdateTable();
    scDrawChart();
}

function scAddPoint() {
    var r = parseFloat(document.getElementById('sc-r').value);
    var x = parseFloat(document.getElementById('sc-x').value) || 0;
    if (isNaN(r) || r < 0) { alert('Enter a valid resistance R \u2265 0'); return; }
    SC.points.push({ r: r, x: x });
    scUpdateTable();
    scDrawChart();
}

function scClear() {
    SC.points = [];
    scUpdateTable();
    scDrawChart();
}

function scUpdateTable() {
    var Z0 = SC.z0;
    if (SC.points.length === 0) { document.getElementById('sc-points').innerHTML=''; return; }
    var h = '<table><tr><th>#</th><th>R (\u03A9)</th><th>X (\u03A9)</th><th>|\u0393|</th><th>RL (dB)</th><th>VSWR</th></tr>';
    SC.points.forEach(function(pt, i) {
        var g = zToGamma(pt.r/Z0, pt.x/Z0);
        var mag = Math.sqrt(g.re*g.re + g.im*g.im);
        var RL  = mag>0 ? -20*Math.log10(mag) : Infinity;
        var vswr= mag<1 ? (1+mag)/(1-mag) : Infinity;
        var col = SC.colors[i % SC.colors.length];
        h += '<tr style="color:'+col+'">'
           + '<td>'+(i+1)+'</td>'
           + '<td>'+pt.r.toFixed(2)+'</td>'
           + '<td>'+(pt.x>=0?'+':'')+pt.x.toFixed(2)+'</td>'
           + '<td>'+mag.toFixed(4)+'</td>'
           + '<td>'+(isFinite(RL)?RL.toFixed(2):'\u221e')+'</td>'
           + '<td>'+(isFinite(vswr)?vswr.toFixed(3):'\u221e')+'</td>'
           + '</tr>';
    });
    h += '</table>';
    document.getElementById('sc-points').innerHTML = h;
}
