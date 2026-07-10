/* exported scAddPoint, scClear, scLoadExample, zToGamma, gammaToZ */
/* ════════════════════════════════════════════════════════════════════
   RF Toolbox — Interactive Smith Chart  (self-contained)
   ════════════════════════════════════════════════════════════════════ */

const SC = {
  canvas: null, ctx: null,
  // Logical (CSS) size — actual pixel buffer is 2× for HiDPI
  W: 460, H: 460,
  cx: 230, cy: 230, R: 200,
  z0: 50,
  points: [],   // pinned
  liveR: null, liveX: null,   // current typed values
  hoverG: null,               // gamma from mouse hover
  tlDeg: 0,
  colors: ['#AA77FF','#ff6644','#00ccff','#dd44aa','#44ddaa','#ffaa00','#88cc00','#4499ff']
};

// ── Math helpers ───────────────────────────────────────────────────
function zToGamma(r, x) {
  const dr = r + 1, di = x;
  const nr = r - 1, ni = x;
  const den = dr*dr + di*di;
  return { re: (nr*dr + ni*di)/den, im: (ni*dr - nr*di)/den };
}

function gammaToZ(gRe, gIm) {
  const den = (1-gRe)*(1-gRe) + gIm*gIm;
  if (den < 1e-12) return { r: 1e9, x: 0 };
  return {
    r: (1 - gRe*gRe - gIm*gIm) / den,
    x: 2*gIm / den
  };
}

function gammaToXY(gRe, gIm) {
  return { x: SC.cx + SC.R * gRe, y: SC.cy - SC.R * gIm };
}

function xyToGamma(px, py) {
  return { re: (px - SC.cx) / SC.R, im: -(py - SC.cy) / SC.R };
}

function rotatGamma(g, degToGen) {
  // rotate clockwise (toward generator): subtract phase 2*beta*l = 2*theta_deg
  const theta = degToGen * Math.PI / 180;
  const cos2 = Math.cos(2*theta), sin2 = Math.sin(2*theta);
  return { re: g.re*cos2 + g.im*sin2, im: -g.re*sin2 + g.im*cos2 };
}

// ── Canvas setup ───────────────────────────────────────────────────
function scInit() {
  SC.canvas = document.getElementById('sc-canvas');
  SC.ctx    = SC.canvas.getContext('2d');

  // HiDPI
  const dpr = window.devicePixelRatio || 1;
  SC.canvas.width  = SC.W * dpr;
  SC.canvas.height = SC.H * dpr;
  SC.canvas.style.width  = SC.W + 'px';
  SC.canvas.style.height = SC.H + 'px';
  SC.ctx.scale(dpr, dpr);

  SC.canvas.addEventListener('mousemove', scOnMove);
  SC.canvas.addEventListener('mouseleave', scOnLeave);
  SC.canvas.addEventListener('click', scOnClick);

  // Live input listeners
  ['sc-r','sc-x','sc-z0'].forEach(id => {
    document.getElementById(id).addEventListener('input', scLiveUpdate);
  });

  // TL slider
  const slider = document.getElementById('tl-slider');
  const degInp = document.getElementById('tl-deg');
  slider.addEventListener('input', () => { degInp.value = slider.value; SC.tlDeg = +slider.value; scDraw(); scUpdateTL(); });
  degInp.addEventListener('input', () => { slider.value = +degInp.value || 0; SC.tlDeg = +slider.value; scDraw(); scUpdateTL(); });

  scDraw();
}

// ── Main draw routine ──────────────────────────────────────────────
function scDraw() {
  const ctx = SC.ctx;
  const {W, H, cx, cy, R} = SC;
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#faf9ff';
  ctx.fillRect(0, 0, W, H);

  // Clip to chart circle for arcs
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2*Math.PI); ctx.clip();

  // ── Constant-resistance circles ─────────────────────────────────
  const rVals = [0, 0.2, 0.5, 1, 2, 5, 10];
  rVals.forEach(r => {
    const cr = R / (1 + r);
    const ccx = cx + R - cr;
    ctx.strokeStyle = r === 1 ? '#AA77FF' : r === 0 ? '#bbb' : '#d8d0ef';
    ctx.lineWidth   = r === 1 ? 1.4 : 1;
    ctx.beginPath(); ctx.arc(ccx, cy, cr, 0, 2*Math.PI); ctx.stroke();
  });

  // ── Constant-reactance arcs ──────────────────────────────────────
  const xVals = [0.2, 0.5, 1, 2, 5, 10];
  xVals.forEach(x => {
    [x, -x].forEach(xi => {
      const xr   = R / Math.abs(xi);
      const xcy  = cy - R / xi;
      ctx.strokeStyle = Math.abs(xi) === 1 ? '#00aacc' : Math.abs(xi) === 0.5 ? '#b8e8f0' : '#d8edf0';
      ctx.lineWidth   = Math.abs(xi) === 1 ? 1.2 : 0.85;
      ctx.beginPath(); ctx.arc(cx + R, xcy, xr, 0, 2*Math.PI); ctx.stroke();
    });
  });
  ctx.restore(); // end clip

  // ── Outer circle ────────────────────────────────────────────────
  ctx.strokeStyle = '#555'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2*Math.PI); ctx.stroke();

  // ── Real axis ───────────────────────────────────────────────────
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(cx-R, cy); ctx.lineTo(cx+R, cy); ctx.stroke();

  // ── Labels (resistance circles) ─────────────────────────────────
  ctx.font = '10px monospace'; ctx.fillStyle = '#5533aa'; ctx.textAlign = 'center';
  rVals.forEach(r => {
    if (r >= 10) return;
    const cr = R/(1+r), ccx = cx+R-cr;
    ctx.fillText(r === 0 ? '0' : r, ccx, cy + cr + 14);
  });
  // Reactance labels
  [0.5, 1, 2].forEach(x => {
    const g = zToGamma(0, x); const p = gammaToXY(g.re, g.im);
    ctx.fillStyle = '#0088aa'; ctx.textAlign = 'left'; ctx.font = '9px monospace';
    if (p.x < cx+R-4 && p.y > cy-R+8) ctx.fillText('+j'+x, p.x+3, p.y-2);
    const gn = zToGamma(0, -x); const pn = gammaToXY(gn.re, gn.im);
    if (pn.x < cx+R-4 && pn.y < cy+R-8) ctx.fillText('−j'+x, pn.x+3, pn.y+10);
  });

  // ── Pinned points ────────────────────────────────────────────────
  SC.points.forEach((pt, i) => {
    const z0 = SC.z0;
    const g = zToGamma(pt.r/z0, pt.x/z0);
    const p = gammaToXY(g.re, g.im);
    const col = SC.colors[i % SC.colors.length];
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 2*Math.PI); ctx.fill();
    // Label
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText(i+1, p.x, p.y + 3.5);
  });

  // ── TL arc (if tlDeg > 0 and live point exists) ──────────────────
  if (SC.tlDeg > 0 && SC.liveR !== null) {
    const z0 = SC.z0;
    const g0 = zToGamma(SC.liveR/z0, SC.liveX/z0);
    const mag = Math.sqrt(g0.re*g0.re + g0.im*g0.im);
    if (mag < 1) {
      const gEnd = rotatGamma(g0, SC.tlDeg);
      const p0 = gammaToXY(g0.re, g0.im);
      const pEnd = gammaToXY(gEnd.re, gEnd.im);
      // Draw arc from p0 to pEnd along the |Γ| circle
      const angStart = Math.atan2(-(p0.y - cy), p0.x - cx);
      const angEnd   = Math.atan2(-(pEnd.y - cy), pEnd.x - cx);
      const arcR = mag * R;
      ctx.strokeStyle = '#ff6644'; ctx.lineWidth = 2; ctx.setLineDash([4,3]);
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, -angStart, -angEnd, true);
      ctx.stroke(); ctx.setLineDash([]);
      // End point
      ctx.fillStyle = '#ff6644';
      ctx.beginPath(); ctx.arc(pEnd.x, pEnd.y, 5, 0, 2*Math.PI); ctx.fill();
    }
  }

  // ── Live input point ─────────────────────────────────────────────
  if (SC.liveR !== null) {
    const z0 = SC.z0;
    const g = zToGamma(SC.liveR/z0, SC.liveX/z0);
    const mag = Math.sqrt(g.re*g.re + g.im*g.im);
    if (mag <= 1) {
      const p = gammaToXY(g.re, g.im);
      // |Γ| circle
      ctx.strokeStyle = 'rgba(170,119,255,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.arc(cx, cy, mag*R, 0, 2*Math.PI); ctx.stroke();
      ctx.setLineDash([]);
      // Crosshair
      ctx.strokeStyle = '#5533aa'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(p.x-14, p.y); ctx.lineTo(p.x+14, p.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, p.y-14); ctx.lineTo(p.x, p.y+14); ctx.stroke();
      // Dot
      ctx.fillStyle = '#AA77FF';
      ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 2*Math.PI); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('●', p.x, p.y + 3);
    }
  }

  // ── Hover cursor ─────────────────────────────────────────────────
  if (SC.hoverG) {
    const {re, im} = SC.hoverG;
    const mag = Math.sqrt(re*re + im*im);
    if (mag <= 1) {
      const p = gammaToXY(re, im);
      ctx.strokeStyle = 'rgba(100,100,100,0.45)'; ctx.lineWidth = 0.8; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(cx-R, p.y); ctx.lineTo(cx+R, p.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, cy-R); ctx.lineTo(p.x, cy+R); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(80,50,150,0.18)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 2*Math.PI); ctx.fill();
    }
  }
}

// ── Live update from input fields ─────────────────────────────────
function scLiveUpdate() {
  SC.z0   = parseFloat(document.getElementById('sc-z0').value) || 50;
  const R = parseFloat(document.getElementById('sc-r').value);
  const X = parseFloat(document.getElementById('sc-x').value) || 0;

  if (!isNaN(R) && R >= 0) {
    SC.liveR = R; SC.liveX = X;
    updateReadout(R/SC.z0, X/SC.z0);
    scUpdateTL();
  } else {
    SC.liveR = null; SC.liveX = null;
    clearReadout();
  }
  scDraw();
}

function updateReadout(r, x) {
  const z0 = SC.z0;
  const g   = zToGamma(r, x);
  const mag = Math.sqrt(g.re*g.re + g.im*g.im);
  const ang = Math.atan2(g.im, g.re) * 180 / Math.PI;
  const rl  = mag > 0 ? -20*Math.log10(mag) : Infinity;
  const vswr= mag < 1 ? (1+mag)/(1-mag) : Infinity;
  // Admittance Y = 1/Z
  const Zr = r*z0, Zx = x*z0;
  const Yden = Zr*Zr + Zx*Zx;
  const Yg = Yden > 0 ? Zr/Yden*1000 : 0;   // mS
  const Yb = Yden > 0 ? -Zx/Yden*1000 : 0;  // mS

  setText('ro-Z', Zr.toFixed(2) + (Zx>=0?'+':'') + Zx.toFixed(2) + 'j Ω');
  setText('ro-z', r.toFixed(3)  + (x>=0?'+':'')  + x.toFixed(3)  + 'j');
  setText('ro-Y', Yg.toFixed(2) + (Yb>=0?'+':'') + Yb.toFixed(2) + 'j mS');
  setText('ro-mag', mag.toFixed(4));
  setText('ro-ang', ang.toFixed(1) + '°');

  const rlEl = document.getElementById('ro-rl');
  rlEl.textContent = isFinite(rl) ? rl.toFixed(2) + ' dB' : '∞ dB';
  rlEl.className = 'sc-val ' + (rl > 20 ? 'good' : rl > 10 ? 'warn' : 'bad');

  const vsEl = document.getElementById('ro-vswr');
  vsEl.textContent = isFinite(vswr) ? vswr.toFixed(3) : '∞';
  vsEl.className = 'sc-val ' + (vswr < 1.5 ? 'good' : vswr < 2 ? 'warn' : 'bad');
}

function scUpdateTL() {
  if (SC.liveR === null) return;
  const z0 = SC.z0;
  const g0 = zToGamma(SC.liveR/z0, SC.liveX/z0);
  const gEnd = rotatGamma(g0, SC.tlDeg);
  const zEnd = gammaToZ(gEnd.re, gEnd.im);
  const mag  = Math.sqrt(gEnd.re*gEnd.re + gEnd.im*gEnd.im);
  const vswr = mag < 1 ? (1+mag)/(1-mag) : Infinity;
  const Zr = zEnd.r*z0, Zx = zEnd.x*z0;
  setText('ro-tl-Z',    Zr.toFixed(2)+(Zx>=0?'+':'')+Zx.toFixed(2)+'j Ω');
  setText('ro-tl-mag',  mag.toFixed(4));
  setText('ro-tl-vswr', isFinite(vswr) ? vswr.toFixed(3) : '∞');
}

function clearReadout() {
  ['ro-Z','ro-z','ro-Y','ro-mag','ro-ang','ro-rl','ro-vswr','ro-tl-Z','ro-tl-mag','ro-tl-vswr'].forEach(id => setText(id, '—'));
}

function setText(id, txt) {
  const el = document.getElementById(id); if (el) el.textContent = txt;
}

// ── Mouse handlers ────────────────────────────────────────────────
function scOnMove(e) {
  const rect = SC.canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (SC.W / rect.width);
  const py = (e.clientY - rect.top)  * (SC.H / rect.height);
  const g  = xyToGamma(px, py);
  const mag = Math.sqrt(g.re*g.re + g.im*g.im);
  if (mag > 1.01) {
    SC.hoverG = null;
    document.getElementById('sc-hover').textContent = 'Outside chart boundary.';
  } else {
    SC.hoverG = g;
    const z = gammaToZ(g.re, g.im);
    const z0 = SC.z0;
    const Zr = z.r*z0, Zx = z.x*z0;
    const rl = mag > 0 ? -20*Math.log10(mag) : Infinity;
    const vswr = mag < 1 ? (1+mag)/(1-mag) : Infinity;
    document.getElementById('sc-hover').textContent =
      'Z = ' + Zr.toFixed(1) + (Zx>=0?'+':'') + Zx.toFixed(1) + 'j Ω'
      + '  |  |Γ| = ' + mag.toFixed(3)
      + '  |  RL = ' + (isFinite(rl) ? rl.toFixed(1) + ' dB' : '∞')
      + '  |  VSWR = ' + (isFinite(vswr) ? vswr.toFixed(2) : '∞');
  }
  scDraw();
}

function scOnLeave() {
  SC.hoverG = null;
  document.getElementById('sc-hover').textContent = 'Move the mouse over the chart to read impedance values.';
  scDraw();
}

function scOnClick(e) {
  const rect = SC.canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (SC.W / rect.width);
  const py = (e.clientY - rect.top)  * (SC.H / rect.height);
  const g  = xyToGamma(px, py);
  if (Math.sqrt(g.re*g.re + g.im*g.im) > 1.01) return;
  const z = gammaToZ(g.re, g.im);
  const z0 = SC.z0;
  document.getElementById('sc-r').value = (z.r*z0).toFixed(2);
  document.getElementById('sc-x').value = (z.x*z0).toFixed(2);
  scLiveUpdate();
}

// ── Pin / Clear ───────────────────────────────────────────────────
function scAddPoint() {
  if (SC.liveR === null) return;
  SC.points.push({ r: SC.liveR, x: SC.liveX });
  scUpdateTable();
  scDraw();
}

function scClear() {
  SC.points = [];
  SC.liveR  = null; SC.liveX = null;
  document.getElementById('sc-r').value = '';
  document.getElementById('sc-x').value = '';
  document.getElementById('tl-slider').value = 0;
  document.getElementById('tl-deg').value   = 0;
  SC.tlDeg = 0;
  clearReadout(); scUpdateTable(); scDraw();
}

function scLoadExample() {
  document.getElementById('sc-z0').value = '50';
  document.getElementById('sc-r').value  = '73';
  document.getElementById('sc-x').value  = '42.5';
  scLiveUpdate();
}

// ── Pinned points table ───────────────────────────────────────────
function scUpdateTable() {
  const sec = document.getElementById('sc-pts-section');
  if (SC.points.length === 0) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  const z0 = SC.z0;
  let html = '<table class="sc-pts-tbl"><thead><tr>'
    + '<th>#</th><th>R (Ω)</th><th>X (Ω)</th><th>|Γ|</th><th>∠Γ (°)</th><th>RL (dB)</th><th>VSWR</th>'
    + '</tr></thead><tbody>';
  SC.points.forEach((pt, i) => {
    const g   = zToGamma(pt.r/z0, pt.x/z0);
    const mag = Math.sqrt(g.re*g.re + g.im*g.im);
    const ang = Math.atan2(g.im, g.re)*180/Math.PI;
    const rl  = mag > 0 ? -20*Math.log10(mag) : Infinity;
    const vswr= mag < 1 ? (1+mag)/(1-mag) : Infinity;
    const col = SC.colors[i % SC.colors.length];
    html += `<tr>
      <td><span class="swatch" style="background:${col}"></span>${i+1}</td>
      <td>${pt.r.toFixed(2)}</td>
      <td>${(pt.x>=0?'+':'')}${pt.x.toFixed(2)}</td>
      <td>${mag.toFixed(4)}</td>
      <td>${ang.toFixed(1)}°</td>
      <td>${isFinite(rl)?rl.toFixed(2):'∞'}</td>
      <td>${isFinite(vswr)?vswr.toFixed(3):'∞'}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('sc-pts-body').innerHTML = html;
}

window.addEventListener('load', scInit);
