// ═══════════════════════════════════════════════════════════════════════════
// Surface Receive Coil Designer — Physics Engine
// ═══════════════════════════════════════════════════════════════════════════

const MU0    = 4 * Math.PI * 1e-7;   // H/m
const C_LIGHT = 2.998e8;              // m/s
const RHO_CU  = 1.72e-8;             // Ω·m (copper resistivity at 20 °C)
const Z0      = 50;                   // Ω

// ── Tissue dielectric data ────────────────────────────────────────────────
// Format: [freq_MHz, sigma_S/m, eps_r]
// Sources: Gabriel et al. 1996 (Phys. Med. Biol. 41), IT'IS Foundation v4.1
const TD = {
  muscle:       { name:'Muscle',               pts:[[1,0.36,186],[10,0.51,134],[64,0.62,80],[128,0.69,72],[298,0.80,57],[447,0.88,54],[1000,0.98,46]] },
  gm:           { name:'Brain — gray matter',  pts:[[1,0.10,400],[10,0.28,150],[64,0.52,75],[128,0.59,65],[298,0.71,52],[447,0.80,48],[1000,0.95,42]] },
  wm:           { name:'Brain — white matter', pts:[[1,0.06,120],[10,0.15,60],[64,0.22,46],[128,0.28,41],[298,0.37,36],[447,0.43,34],[1000,0.50,32]] },
  liver:        { name:'Liver',                pts:[[1,0.14,280],[10,0.32,110],[64,0.42,76],[128,0.49,65],[298,0.61,49],[447,0.71,44],[1000,0.85,40]] },
  fat:          { name:'Fat / adipose',        pts:[[1,0.011,25],[10,0.022,14],[64,0.028,12],[128,0.033,11],[298,0.044,10.5],[447,0.055,10],[1000,0.07,9.5]] },
  blood:        { name:'Blood',                pts:[[1,0.70,800],[10,0.80,250],[64,0.94,90],[128,1.24,77],[298,1.37,69],[447,1.52,65],[1000,1.68,60]] },
  bone_cortical:{ name:'Cortical bone',        pts:[[1,0.020,40],[10,0.030,23],[64,0.055,15],[128,0.080,13],[298,0.120,11],[447,0.155,10],[1000,0.20,9]] },
  saline:       { name:'Body phantom (saline)',pts:[[1,0.70,80],[1000,0.70,78]] },
  water:        { name:'Distilled water',      pts:[[1,0.001,80],[1000,0.001,78]] }
};

function getTissue(key, fMHz) {
  if (key === 'custom') {
    return { sigma: +document.getElementById('sigma_c').value,
             eps_r: +document.getElementById('er_c').value,
             name: 'Custom' };
  }
  const td = TD[key]; if (!td) return { sigma:0.7, eps_r:78, name:'Unknown' };
  const pts = td.pts, f = fMHz;
  if (f <= pts[0][0]) return { sigma:pts[0][1], eps_r:pts[0][2], name:td.name };
  if (f >= pts[pts.length-1][0]) { const p=pts[pts.length-1]; return { sigma:p[1], eps_r:p[2], name:td.name }; }
  for (let i=0;i<pts.length-1;i++) {
    if (f>=pts[i][0] && f<=pts[i+1][0]) {
      // log-log interpolation for sigma, log-linear for eps_r
      const t = (Math.log(f)-Math.log(pts[i][0])) / (Math.log(pts[i+1][0])-Math.log(pts[i][0]));
      const sigma = Math.exp(Math.log(pts[i][1]) + t*(Math.log(pts[i+1][1])-Math.log(pts[i][1])));
      const eps_r = pts[i][2] + t*(pts[i+1][2]-pts[i][2]);
      return { sigma, eps_r, name:td.name };
    }
  }
  return { sigma:0.7, eps_r:78, name:td.name };
}

// ── Engineering-notation formatter ───────────────────────────────────────
function eng(val, unit) {
  if (!isFinite(val)||isNaN(val)) return '—';
  if (val===0) return `0 ${unit}`;
  const abs=Math.abs(val);
  const e=Math.floor(Math.log10(abs)/3)*3;
  const pfx={15:'P',12:'T',9:'G',6:'M',3:'k',0:'','-3':'m','-6':'μ','-9':'n','-12':'p','-15':'f'};
  const p=pfx[String(e)]??'';
  const s=val/Math.pow(10,e);
  const d=Math.abs(s)>=100?1:Math.abs(s)>=10?2:3;
  return `${s.toFixed(d)} ${p}${unit}`;
}
function fmt1(v){ return isFinite(v)&&!isNaN(v)?v.toFixed(1):'—'; }
function fmt0(v){ return isFinite(v)&&!isNaN(v)?Math.round(v).toString():'—'; }

// ── UI helpers ────────────────────────────────────────────────────────────
function applyWire(){ const v=document.getElementById('wire_preset').value; if(v) document.getElementById('d').value=v; }
function applyFreq(){ const v=document.getElementById('freq_preset').value; if(v) document.getElementById('f').value=v; }
function onSampleChange(){
  const s=document.getElementById('sample').value;
  document.getElementById('custom_row').style.display = s==='custom'?'block':'none';
  if (s!=='custom') showTissueChip(s, +document.getElementById('f').value);
  else document.getElementById('tissue_props').innerHTML='';
}
function showTissueChip(key, fMHz) {
  const t=getTissue(key,fMHz);
  const el=document.getElementById('tissue_props');
  el.innerHTML=`<span class="tissue-chip">σ = ${t.sigma.toFixed(3)} S/m</span><span class="tissue-chip">ε<sub>r</sub> = ${t.eps_r.toFixed(1)}</span><span style="font-size:10px;color:#888;">@ ${fMHz.toFixed(2)} MHz</span>`;
}
function showErr(m){const e=document.getElementById('err-msg');e.textContent=m;e.style.display='block';}
function clearErr(){const e=document.getElementById('err-msg');e.textContent='';e.style.display='none';}
/* exported applyWire, applyFreq, onSampleChange */
function setTxt(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CALCULATION
// ═══════════════════════════════════════════════════════════════════════════
function calculate() {
  clearErr();
  const D_mm  = +document.getElementById('D').value;
  const d_mm  = +document.getElementById('d').value;
  const f_MHz = +document.getElementById('f').value;
  const h_mm  = +document.getElementById('h').value;
  const skey  = document.getElementById('sample').value;

  if (!isFinite(D_mm)||D_mm<=0)        { showErr('Loop diameter D must be a positive number.'); return; }
  if (!isFinite(d_mm)||d_mm<=0)        { showErr('Conductor diameter d must be a positive number.'); return; }
  if (d_mm >= D_mm)                    { showErr('Conductor diameter d must be smaller than loop diameter D.'); return; }
  if (!isFinite(f_MHz)||f_MHz<=0)      { showErr('Larmor frequency must be positive.'); return; }
  if (!isFinite(h_mm)||h_mm<0)         { showErr('Sample distance h must be ≥ 0.'); return; }
  if (d_mm > D_mm*0.25)                { showErr('Warning: conductor is very thick relative to loop. Results may be less accurate.'); }

  // SI conversion
  const r  = D_mm*0.5e-3;      // loop radius (m)
  const a  = d_mm*0.5e-3;      // wire radius (m)
  const f0 = f_MHz*1e6;         // Hz
  const w  = 2*Math.PI*f0;      // angular frequency
  const h  = h_mm*1e-3;         // m

  const tissue = getTissue(skey, f_MHz);
  const sigma  = tissue.sigma;
  showTissueChip(skey, f_MHz);

  // ── 1. Loop inductance (Neumann / Rosa formula) ────────────────────────
  const L = MU0 * r * (Math.log(8*r/a) - 2);
  if (L <= 0) { showErr('Inductance is non-positive — the wire radius may be too large relative to the loop.'); return; }

  // ── 2. Skin depth and wire resistance ─────────────────────────────────
  const delta = Math.sqrt(2*RHO_CU / (w*MU0));            // m
  const R_wire = (RHO_CU/delta) * (r/a);                   // Ω
  // Derivation: R = ρ·l/A = ρ·(2πr)/(2πa·δ) = (ρ/δ)·(r/a)

  // ── 3. Sample noise resistance (quasi-static half-space model) ─────────
  // Derived from integrating the dissipated power in a conducting half-space
  // due to the vector potential of the circular loop current (Hoult/Foster approach)
  const R_s = (Math.PI/6) * MU0*MU0 * w*w * sigma * Math.pow(r,6) / Math.pow(r+h,3);

  // ── 4. Quality factors ─────────────────────────────────────────────────
  const R_total = R_wire + R_s;
  const wL      = w*L;                        // ω·L = coil reactance (Ω)
  const Q_u     = wL / R_wire;
  const Q_L     = wL / R_total;
  const Q_ratio = Q_u / Q_L;

  // ── 5. Resonance tuning ────────────────────────────────────────────────
  const C_total = 1/(w*w*L);                  // total series capacitance (F)

  // ── 6. Capacitor breaks ────────────────────────────────────────────────
  // The coil sits on the surface of the sample, so the effective wavelength
  // is shortened by the tissue dielectric.  We use an eighth-space model:
  //   ε_r_eff = (1 + ε_r_tissue) / 8   (capped at 9 to avoid over-counting
  //                                      with very high-ε tissues at 7T+)
  // This gives λ_eff = λ₀ / √ε_r_eff, and the criterion is segment < λ_eff/10.
  const lambda     = C_LIGHT/f0;
  const circ       = 2*Math.PI*r;
  const eps_r_eff  = Math.min(9, (1 + tissue.eps_r) / 8);
  const lambda_eff = lambda / Math.sqrt(eps_r_eff);
  const N_sw       = Math.ceil(circ / (lambda_eff / 10));
  const N_breaks   = Math.max(4, N_sw);
  const N_dist   = N_breaks - 1;              // distributed caps (series in loop)
  const C_dist   = C_total * N_dist;          // value of each distributed cap (F)

  // ── 7. L-network matching: C_m shunt + L_m series ─────────────────────
  // Coil at resonance → parallel resistance R_p = (ω·L)² / R_total
  const R_p = wL*wL / R_total;
  let Q_m, C_m, L_m;
  if (R_p > Z0) {
    // Standard case: step down from R_p → 50 Ω
    Q_m = Math.sqrt(R_p/Z0 - 1);
    C_m = Q_m / (w * R_p);                    // shunt cap at coil feed (F)
    L_m = Q_m * Z0 / w;                       // series inductor at output (H)
  } else {
    // Unusual (very lossy coil): step up from R_p → 50 Ω
    Q_m = Math.sqrt(Z0/R_p - 1);
    C_m = 1 / (w * Z0 * Q_m);
    L_m = Q_m * R_p / w;
  }

  // ── 8. λ/4 cable ──────────────────────────────────────────────────────
  // Standard MRI coax: RG-174 / RG-316 (foam, VF ≈ 0.82), or UT-85 (solid, VF ≈ 0.66)
  const VF   = f_MHz >= 200 ? 0.695 : 0.820; // UT-85 at high freq, RG-174 at low freq
  const L_cable = VF*C_LIGHT/(4*f0);          // m

  // ── 9. Decoupling estimates ────────────────────────────────────────────
  const Z_preamp = 2;                          // Ω (typical LNA input impedance)
  const Z_high   = Z0*Z0 / Z_preamp;          // Ω (λ/4 transformation)
  const decouple_dB = 20*Math.log10(1 + Z_high/wL);
  const BW_Hz    = f0 / Q_L;                  // matched coil bandwidth (Hz)

  // ═══════════════════════════════════════════════════════════════════════
  // POPULATE RESULTS
  // ═══════════════════════════════════════════════════════════════════════

  // Coil params
  setTxt('r_L',     eng(L,'H'));
  setTxt('r_delta', eng(delta,'m'));
  setTxt('r_Rw',    eng(R_wire,'Ω'));
  setTxt('r_Rs',    eng(R_s,'Ω'));
  setTxt('r_Rt',    eng(R_total,'Ω'));
  setTxt('r_Rp',    eng(R_p,'Ω'));

  const qu=document.getElementById('r_Qu'); qu.textContent=fmt0(Q_u);
  qu.className='res-val '+(Q_u>200?'good':Q_u>80?'':'warn');

  const ql=document.getElementById('r_Ql'); ql.textContent=fmt1(Q_L);
  ql.className='res-val '+(Q_L>=20?'good':Q_L>=8?'':'warn');

  const qr=document.getElementById('r_Qr'); qr.textContent=fmt1(Q_ratio)+'×';
  qr.className='res-val '+(Q_ratio>=5?'good':Q_ratio>=2?'':'warn');

  const dom=document.getElementById('r_dom');
  if(Q_ratio>=5)      { dom.textContent='Yes ✓ (sample limited)'; dom.className='res-val good'; }
  else if(Q_ratio>=2) { dom.textContent='Partially (~'+fmt1(100*R_s/R_total)+'% sample)'; dom.className='res-val warn'; }
  else                { dom.textContent='No — coil noise dominates'; dom.className='res-val bad'; }

  // Breaks
  setTxt('r_Nb', N_breaks);
  const seg_cm     = (circ / N_breaks * 100).toFixed(1);
  const leff_cm    = (lambda_eff * 100).toFixed(1);
  const leff_over_seg = (lambda_eff / (circ / N_breaks)).toFixed(1);
  const reason = N_sw <= 3
    ? `Loop circumference = ${(circ*100).toFixed(1)} cm (electrically small at this frequency/sample). Minimum 4 breaks enforced: 1× feed/output, ${N_dist}× distributed tuning.`
    : `λ_eff = ${leff_cm} cm (λ₀ reduced by √${eps_r_eff.toFixed(1)} from tissue loading). Each segment = ${seg_cm} cm = λ_eff/${leff_over_seg} — satisfies λ_eff/10 rule.`;
  setTxt('r_break_note', reason);

  // Component table
  const tbody = document.getElementById('comp_body');
  tbody.innerHTML='';
  const rows = [
    ['C<sub>dist</sub>',  eng(C_dist,'F'),   `${N_dist}×`,
     `Distributed tuning capacitors — placed evenly around the loop at the ${N_dist} non-feed break positions. Connected in series (each is a physical gap in the conductor). Their series combination equals the total tuning capacitance C<sub>total</sub> = 1/(ω²L) = ${eng(C_total,'F')}.`],
    ['C<sub>m</sub>',     eng(C_m,'F'),      '1×',
     `Matching capacitor — shunt (parallel) across the feed gap. Transforms the coil's high parallel resistance R<sub>p</sub> = ${eng(R_p,'Ω')} down toward 50 Ω. Forms the L-network with L<sub>m</sub>.`],
    ['L<sub>m</sub>',     eng(L_m,'H'),      '1×',
     `Series matching inductor — in series between the feed gap and the coaxial output connector. Completes the L-network impedance transformation (matching Q<sub>m</sub> = ${fmt1(Q_m)}). Also the key component for preamplifier decoupling: when the low-Z preamp is connected via λ/4 cable, the reflected high impedance Z<sub>high</sub> ≈ ${fmt0(Z_high)} Ω appears in series with the coil loop, suppressing induced currents.`],
    ['Coax',             `${(L_cable*100).toFixed(1)} cm`, '1×',
     `λ/4 cable to the preamplifier (velocity factor VF = ${VF}). Electrically transforms the preamp input impedance Z<sub>preamp</sub> ≈ ${Z_preamp} Ω to Z<sub>high</sub> = Z₀²/Z<sub>preamp</sub> = ${fmt0(Z_high)} Ω, which appears as a high series impedance in the coil loop for decoupling. Suggested type: ${VF>0.8?'RG-174 or RG-316 (foam, VF ≈ 0.82)':'UT-85 semi-rigid (solid, VF ≈ 0.695)'}. Cut to exact length on the bench using a VNA.`],
  ];
  rows.forEach(([comp,val,qty,fn])=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td style="font-family:monospace;font-weight:bold;color:#5533aa;">${comp}</td><td>${val}</td><td>${qty}</td><td>${fn}</td>`;
    tbody.appendChild(tr);
  });

  // Preamp decoupling panel
  setTxt('r_Lm',    eng(L_m,'H'));
  setTxt('r_Cm',    eng(C_m,'F'));
  setTxt('r_cable', `${(L_cable*100).toFixed(1)} cm (VF = ${VF})`);
  setTxt('r_Zp',    `≤ 5 Ω (ideal: 1–2 Ω)`);
  const dec=document.getElementById('r_dec');
  dec.textContent=`≈ ${fmt1(decouple_dB)} dB`;
  dec.className='res-val '+(decouple_dB>=20?'good':decouple_dB>=12?'warn':'bad');
  setTxt('r_Qm',  fmt1(Q_m));
  setTxt('r_XLm', eng(w*L_m,'Ω'));
  setTxt('r_bw',  eng(BW_Hz,'Hz'));
  setTxt('r_cabletype', VF>0.8?'RG-174 / RG-316 (foam coax)':'UT-85 semi-rigid (solid PE)');

  // Draw schematic
  drawSchematic(N_breaks, N_dist, {
    L:eng(L,'H'), C_dist:eng(C_dist,'F'), C_m:eng(C_m,'F'),
    L_m:eng(L_m,'H'), cable:((L_cable*100).toFixed(1))+'cm'
  });

  document.getElementById('results').style.display='block';
  if(window.MathJax && MathJax.typeset) MathJax.typeset();
}

// ═══════════════════════════════════════════════════════════════════════════
// SVG SCHEMATIC
// ═══════════════════════════════════════════════════════════════════════════
// Layout: loop on the left with feed on its right side, then matching network,
// coax, and LNA flowing left-to-right (signal-flow direction). Feed terminals
// A (top) and B (bottom, grounded) emerge from the feed gap. C_m shunts from
// the junction to ground; L_m is in series from the junction to the SMA.
function drawSchematic(N_breaks, N_dist, vals) {
  const W = 620, H = 330;

  // Loop
  const cx = 155, cy = 142, R = 92;
  const GAP = 0.12;                  // half-angle of each cap gap in the loop
  const fDX = R * Math.cos(GAP);     // horizontal offset of feed terminals
  const fDY = R * Math.sin(GAP);     // vertical offset of feed terminals

  // Feed terminals
  const aX = cx + fDX, aY = cy - fDY;   // A (top) — hot
  const bX = cx + fDX, bY = cy + fDY;   // B (bottom) — ground side

  // Feed wire routing — A diagonals DOWN to the loop's centerline so the whole
  // signal chain runs horizontally through y = cy (visually balanced).
  const aBendX    = aX + 14;            // A continues horizontal this far
  const convergeX = aX + 30;            // A reaches centerline here

  // Matching network layout — all on centerline (y = cy) past convergence
  const bDropX  = aX + 58;              // B drops to GND here (past convergence)
  const jX      = aX + 92;              // junction J on centerline
  const cmTopY  = cy + 20;              // top plate of C_m
  const cmBotY  = cmTopY + 8;           // bottom plate of C_m
  const gndY    = 262;                  // ground rail y

  const lmStart = jX + 28;              // inductor bumps start
  const lmEnd   = lmStart + 60;         // inductor bumps end
  const smaX    = lmEnd + 25;           // SMA connector centre
  const coaxA   = smaX + 9;             // coax start
  const coaxB   = coaxA + 85;           // coax end
  const lnaX    = coaxB + 4;            // LNA triangle left edge
  const lnaSz   = 16;                   // LNA triangle half-height
  const lnaTipX = lnaX + lnaSz * 1.5;

  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;font-family:monospace;">`;

  // Background
  s += `<rect width="${W}" height="${H}" fill="#faf9ff" rx="5"/>`;

  // Title
  s += `<text x="${W/2}" y="18" text-anchor="middle" font-size="11" fill="#5533aa" font-weight="bold">Single-Turn Surface Receive Coil · ${N_breaks} Capacitor Breaks</text>`;

  // ── Loop arcs (feed at angle 0 = right side) ─────────────────────────────
  for (let i = 0; i < N_breaks; i++) {
    const tc = (i / N_breaks) * 2 * Math.PI;
    const as = tc + GAP;
    const ae = ((i + 1) / N_breaks) * 2 * Math.PI - GAP;
    const x1 = cx + R * Math.cos(as), y1 = cy + R * Math.sin(as);
    const x2 = cx + R * Math.cos(ae), y2 = cy + R * Math.sin(ae);
    s += `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 0,1 ${x2.toFixed(2)},${y2.toFixed(2)}" fill="none" stroke="#5533aa" stroke-width="2.6" stroke-linecap="round"/>`;
  }

  // ── Distributed-tuning cap symbols (skip i=0 which is the feed) ──────────
  for (let i = 1; i < N_breaks; i++) {
    const tc = (i / N_breaks) * 2 * Math.PI;
    const xc = cx + R * Math.cos(tc);
    const yc = cy + R * Math.sin(tc);
    const rdX = Math.cos(tc), rdY = Math.sin(tc);         // radial direction
    const tgX = -rdY,         tgY = rdX;                   // tangential direction
    const pl = 6.5, pg = 2.8;                              // plate half-length, half-gap
    // Inner plate
    s += `<line x1="${(xc-pg*rdX+pl*tgX).toFixed(2)}" y1="${(yc-pg*rdY+pl*tgY).toFixed(2)}" x2="${(xc-pg*rdX-pl*tgX).toFixed(2)}" y2="${(yc-pg*rdY-pl*tgY).toFixed(2)}" stroke="#5533aa" stroke-width="2.4" stroke-linecap="round"/>`;
    // Outer plate
    s += `<line x1="${(xc+pg*rdX+pl*tgX).toFixed(2)}" y1="${(yc+pg*rdY+pl*tgY).toFixed(2)}" x2="${(xc+pg*rdX-pl*tgX).toFixed(2)}" y2="${(yc+pg*rdY-pl*tgY).toFixed(2)}" stroke="#5533aa" stroke-width="2.4" stroke-linecap="round"/>`;
  }

  // Inductance label (centre of loop)
  s += `<text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="15" fill="#AA77FF" font-weight="bold" font-style="italic">L</text>`;
  s += `<text x="${cx}" y="${cy+13}" text-anchor="middle" font-size="9" fill="#888">${vals.L}</text>`;

  // Label one distributed cap (the one on the left side of the loop for clarity)
  if (N_dist >= 1) {
    const bestI = Math.round(N_breaks / 2);
    const tc = (bestI / N_breaks) * 2 * Math.PI;
    const labX = cx + (R + 22) * Math.cos(tc);
    const labY = cy + (R + 22) * Math.sin(tc);
    s += `<text x="${labX.toFixed(1)}" y="${(labY+3).toFixed(1)}" text-anchor="middle" font-size="10" fill="#5533aa" font-weight="bold">C<tspan font-size="8" dy="2">d</tspan></text>`;
    s += `<text x="${labX.toFixed(1)}" y="${(labY+15).toFixed(1)}" text-anchor="middle" font-size="8" fill="#888">${vals.C_dist}</text>`;
  }

  // ── Feed wires ──────────────────────────────────────────────────────────
  // A: horizontal stub → diagonal down to centerline → horizontal to J
  s += `<line x1="${aX.toFixed(2)}" y1="${aY.toFixed(2)}" x2="${aBendX}" y2="${aY.toFixed(2)}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  s += `<line x1="${aBendX}" y1="${aY.toFixed(2)}" x2="${convergeX}" y2="${cy}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  s += `<line x1="${convergeX}" y1="${cy}" x2="${jX}" y2="${cy}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  // B: horizontal stub → drop to GND
  s += `<line x1="${bX.toFixed(2)}" y1="${bY.toFixed(2)}" x2="${bDropX}" y2="${bY.toFixed(2)}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  s += `<line x1="${bDropX}" y1="${bY.toFixed(2)}" x2="${bDropX}" y2="${gndY}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;

  // Terminal labels (small italic A, B)
  s += `<text x="${(aX+4).toFixed(1)}" y="${(aY-4).toFixed(1)}" font-size="9" fill="#999" font-style="italic">A</text>`;
  s += `<text x="${(bX+4).toFixed(1)}" y="${(bY+11).toFixed(1)}" font-size="9" fill="#999" font-style="italic">B</text>`;

  // ── Junction J on centerline — node dot ─────────────────────────────────
  s += `<circle cx="${jX}" cy="${cy}" r="3" fill="#5533aa"/>`;

  // ── C_m (shunt) from J → GND ─────────────────────────────────────────────
  s += `<line x1="${jX}" y1="${cy}" x2="${jX}" y2="${cmTopY.toFixed(2)}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  s += `<line x1="${jX-10}" y1="${cmTopY.toFixed(2)}" x2="${jX+10}" y2="${cmTopY.toFixed(2)}" stroke="#5533aa" stroke-width="2.6" stroke-linecap="round"/>`;
  s += `<line x1="${jX-10}" y1="${cmBotY.toFixed(2)}" x2="${jX+10}" y2="${cmBotY.toFixed(2)}" stroke="#5533aa" stroke-width="2.6" stroke-linecap="round"/>`;
  s += `<line x1="${jX}" y1="${cmBotY.toFixed(2)}" x2="${jX}" y2="${gndY}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  s += `<text x="${jX+15}" y="${((cmTopY+cmBotY)/2+2).toFixed(1)}" font-size="11" fill="#5533aa" font-weight="bold">C<tspan font-size="8" dy="2">m</tspan></text>`;
  s += `<text x="${jX+15}" y="${((cmTopY+cmBotY)/2+14).toFixed(1)}" font-size="8" fill="#888">${vals.C_m}</text>`;

  // ── L_m (series) from J → SMA — all on centerline ───────────────────────
  s += `<line x1="${jX}" y1="${cy}" x2="${lmStart}" y2="${cy}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  const bumps = 4;
  const bw = (lmEnd - lmStart) / bumps;
  let lmPath = `M${lmStart},${cy}`;
  for (let k = 0; k < bumps; k++) {
    lmPath += ` A${(bw/2).toFixed(2)},${(bw/2).toFixed(2)} 0 0,1 ${(lmStart+(k+1)*bw).toFixed(2)},${cy}`;
  }
  s += `<path d="${lmPath}" fill="none" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  s += `<line x1="${lmEnd}" y1="${cy}" x2="${smaX-7}" y2="${cy}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  const lmLabX = (lmStart + lmEnd) / 2;
  s += `<text x="${lmLabX}" y="${(cy-11).toFixed(1)}" text-anchor="middle" font-size="11" fill="#5533aa" font-weight="bold">L<tspan font-size="8" dy="2">m</tspan></text>`;
  s += `<text x="${lmLabX}" y="${(cy+22).toFixed(1)}" text-anchor="middle" font-size="8" fill="#888">${vals.L_m}</text>`;

  // ── SMA connector (circle with centre pin) ──────────────────────────────
  s += `<circle cx="${smaX}" cy="${cy}" r="7" fill="white" stroke="#5533aa" stroke-width="1.8"/>`;
  s += `<circle cx="${smaX}" cy="${cy}" r="2.2" fill="#5533aa"/>`;
  s += `<text x="${smaX}" y="${(cy+23).toFixed(1)}" text-anchor="middle" font-size="8" fill="#888">SMA</text>`;

  // ── λ/4 coax (dashed) ──────────────────────────────────────────────────
  s += `<line x1="${coaxA}" y1="${cy}" x2="${coaxB}" y2="${cy}" stroke="#AA77FF" stroke-width="2.2" stroke-dasharray="6,3" stroke-linecap="round"/>`;
  const coaxLabX = (coaxA + coaxB) / 2;
  s += `<text x="${coaxLabX}" y="${(cy-11).toFixed(1)}" text-anchor="middle" font-size="11" fill="#AA77FF" font-weight="bold">λ/4 coax</text>`;
  s += `<text x="${coaxLabX}" y="${(cy+22).toFixed(1)}" text-anchor="middle" font-size="8" fill="#888">${vals.cable}</text>`;

  // ── LNA (amplifier triangle pointing right) ────────────────────────────
  s += `<path d="M${lnaX},${(cy-lnaSz).toFixed(2)} L${lnaTipX.toFixed(2)},${cy} L${lnaX},${(cy+lnaSz).toFixed(2)} Z" fill="white" stroke="#4477cc" stroke-width="2" stroke-linejoin="round"/>`;
  s += `<text x="${(lnaX+lnaSz*0.6).toFixed(1)}" y="${(cy-lnaSz-4).toFixed(1)}" text-anchor="middle" font-size="10" fill="#4477cc" font-weight="bold">LNA</text>`;
  s += `<text x="${(lnaX+lnaSz*0.75).toFixed(1)}" y="${(cy+lnaSz+12).toFixed(1)}" text-anchor="middle" font-size="8" fill="#888">Z<tspan baseline-shift="sub" font-size="6.5">in</tspan> ≤ 5Ω</text>`;

  // LNA output to RX
  s += `<line x1="${lnaTipX}" y1="${cy}" x2="${(lnaTipX+18).toFixed(2)}" y2="${cy}" stroke="#5533aa" stroke-width="2" stroke-linecap="round"/>`;
  s += `<text x="${(lnaTipX+22).toFixed(1)}" y="${(cy+4).toFixed(1)}" font-size="9" fill="#5533aa" font-weight="bold">RX</text>`;

  // LNA ground (short drop from bottom-centre of triangle to GND rail)
  const lnaGndX = lnaX + lnaSz * 0.75;
  s += `<line x1="${lnaGndX.toFixed(1)}" y1="${(cy+lnaSz).toFixed(1)}" x2="${lnaGndX.toFixed(1)}" y2="${gndY}" stroke="#5533aa" stroke-width="1.6" stroke-linecap="round"/>`;

  // ── Ground rail ─────────────────────────────────────────────────────────
  const gndX1 = bDropX - 32;
  const gndX2 = lnaGndX + 12;
  s += `<line x1="${gndX1}" y1="${gndY}" x2="${gndX2}" y2="${gndY}" stroke="#444" stroke-width="2" stroke-linecap="round"/>`;
  // Standard ground symbol at centre of C_m drop
  const gsX = jX;
  s += `<line x1="${gsX-11}" y1="${gndY+5}" x2="${gsX+11}" y2="${gndY+5}" stroke="#444" stroke-width="1.9" stroke-linecap="round"/>`;
  s += `<line x1="${gsX-7}"  y1="${gndY+9}" x2="${gsX+7}"  y2="${gndY+9}" stroke="#444" stroke-width="1.5" stroke-linecap="round"/>`;
  s += `<line x1="${gsX-3}"  y1="${gndY+13}" x2="${gsX+3}" y2="${gndY+13}" stroke="#444" stroke-width="1.1" stroke-linecap="round"/>`;

  // Caption
  s += `<text x="${W/2}" y="${H-10}" text-anchor="middle" font-size="9" fill="#888" font-style="italic">L-match (C<tspan baseline-shift="sub" font-size="7">m</tspan> shunt + L<tspan baseline-shift="sub" font-size="7">m</tspan> series) → 50 Ω · low-Z LNA via λ/4 coax provides preamp decoupling</text>`;

  s += `</svg>`;
  document.getElementById('schematic').innerHTML = s;
}

// ── Run on load with default values ───────────────────────────────────────
window.addEventListener('load', ()=>{
  showTissueChip('muscle', 127.74);
  calculate();
});
