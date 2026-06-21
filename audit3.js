'use strict';
let chromium;
try { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
// eslint-disable-next-line no-unused-vars
catch (_e) { ({ chromium } = require('playwright')); }
const { spawn } = require('child_process');

const PORT = 8772;
const BASE = `http://localhost:${PORT}`;
const N = 100;

class RNG {
  constructor(seed) { this.s = seed >>> 0; }
  next() { this.s = (this.s * 1664525 + 1013904223) >>> 0; return this.s / 4294967296; }
  range(lo, hi) { return lo + this.next() * (hi - lo); }
  irange(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
}

async function getNum(page, sel) {
  try {
    const txt = await page.textContent(sel);
    const m = txt.replace(/[−–]/g, '-').match(/-?[\d]+\.?[\d]*/);
    return m ? parseFloat(m[0]) : NaN;
  } catch { return NaN; }
}
// Returns value scaled to base units by interpreting engFmt prefix
const ENG_PREFIXES = { T:1e12, G:1e9, M:1e6, k:1e3, m:1e-3, µ:1e-6, u:1e-6, n:1e-9, p:1e-12, f:1e-15 };
async function getNumEng(page, sel) {
  try {
    const txt = await page.textContent(sel).then(t => t.replace(/[−–]/g, '-'));
    const m = txt.match(/(-?[\d.]+(?:[eE][+-]?\d+)?)\s*([TGMkmuµnpf]?)/);
    if (!m) return NaN;
    return parseFloat(m[1]) * (ENG_PREFIXES[m[2]] || 1);
  } catch { return NaN; }
}
// Normalises length output to mm (handles µm, nm, mm)
async function getMm(page, sel) {
  try {
    const txt = await page.textContent(sel) || '';
    const m = txt.replace(/[−–]/g, '-').match(/-?[\d.]+(?:[eE][+-]?\d+)?/);
    if (!m) return NaN;
    const v = parseFloat(m[0]);
    if (/µm|um/.test(txt)) return v * 1e-3;
    if (/\bnm\b/.test(txt)) return v * 1e-6;
    return v; // assume mm
  } catch { return NaN; }
}
async function getTxt(page, sel) {
  try { return await page.textContent(sel); } catch { return ''; }
}
async function fill(page, sel, val) {
  await page.fill(sel, String(val));
  await page.dispatchEvent(sel, 'input');
}

const PASS = [], FAIL = [];
function check(label, actual, expected, tol, absFloor) {
  if (isNaN(actual)) { FAIL.push(`${label}: got NaN, expected ~${expected}`); return; }
  const ok = Math.abs(actual - expected) <= Math.abs(expected) * tol + (absFloor || 1e-9);
  (ok ? PASS : FAIL).push(`${label}: ${ok?'✓':'✗'} got ${actual.toPrecision(5)}, exp ${Number(expected).toPrecision(5)} (±${(tol*100).toFixed(1)}%)`);
}
function checkPresent(label, txt, sub) {
  const ok = typeof txt === 'string' && txt.includes(sub);
  (ok ? PASS : FAIL).push(`${label}: ${ok?'✓':'✗'} ${ok?'found':'missing'} "${sub}"`);
}

// ── 1. dBmConverter ──────────────────────────────────────────────────────────
async function runDbm(page, rng) {
  await page.goto(`${BASE}/dBmConverter.html`);
  for (let i = 0; i < N; i++) {
    const dbm = rng.range(-50, 50);
    await fill(page, '#v-dbm', dbm.toFixed(3));
    const mw  = await getNum(page, '#out-mw');
    const dbw = await getNum(page, '#out-dbw');
    check(`dBm[${i}] mW`,  mw,  Math.pow(10, dbm / 10), 0.002);
    check(`dBm[${i}] dBW`, dbw, dbm - 30,                       0.001);
  }
}

// ── 2. VSWRConverter ─────────────────────────────────────────────────────────
async function runVswr(page, rng) {
  await page.goto(`${BASE}/VSWRConverter.html`);
  for (let i = 0; i < N; i++) {
    const vswr = rng.range(1.01, 50);
    await fill(page, '#v-vswr', vswr.toFixed(4));
    const gamma = await getNum(page, '#ro-gamma');
    const rl    = await getNum(page, '#ro-rl');
    const ml    = await getNum(page, '#ro-ml');
    const eg    = (vswr - 1) / (vswr + 1);
    check(`VSWR[${i}] γ`,  gamma, eg,                          0.003);
    check(`VSWR[${i}] RL`, rl,    -20 * Math.log10(eg),        0.02);  // display rounds to .2f → ±1.5% for small RL
    check(`VSWR[${i}] ML`, ml,    -10 * Math.log10(1 - eg*eg), 0.01);
  }
}

// ── 3. Wavelength ─────────────────────────────────────────────────────────────
async function runWavelength(page, rng) {
  await page.goto(`${BASE}/Wavelength.html`);
  await page.selectOption('#wl-fu', '1e9');
  for (let i = 0; i < N; i++) {
    const f  = rng.range(0.1, 30);
    const er = rng.range(1, 12);
    await page.fill('#wl-f',  f.toFixed(4));
    await page.fill('#wl-er', er.toFixed(3));
    await page.click('#wl-btn');
    const lam  = await getNum(page, '#wl-lam');
    const half = await getNum(page, '#wl-half');
    const el   = 300 / (f * Math.sqrt(er));
    check(`WL[${i}] λ`,   lam,          el,     0.003);
    check(`WL[${i}] λ/2`, half,         el / 2, 0.003);
    // λ/4 can display in µm for high-freq/high-er; normalise to mm
    check(`WL[${i}] λ/4`, await getMm(page, '#wl-qtr'), el / 4, 0.003);
  }
}

// ── 4. FreqEnergyConverter ────────────────────────────────────────────────────
async function runFreqEnergy(page, rng) {
  await page.goto(`${BASE}/FreqEnergyConverter.html`);
  await page.selectOption('#fe-fu', '1e6');
  for (let i = 0; i < N; i++) {
    const f = rng.range(1, 10000);
    await page.fill('#fe-f', f.toFixed(2));
    await page.dispatchEvent('#fe-f', 'input');
    checkPresent(`FE[${i}] Hz`, await getTxt(page, '#fe-of'),   'Hz');
    checkPresent(`FE[${i}] m`,  await getTxt(page, '#fe-olam'), 'm');
  }
}

// ── 5. QuarterWave ────────────────────────────────────────────────────────────
async function runQuarterWave(page, rng) {
  await page.goto(`${BASE}/QuarterWave.html`);
  await page.selectOption('#qw-fu', '1e9');
  for (let i = 0; i < N; i++) {
    const z1 = rng.range(10, 300);
    const z2 = rng.range(10, 300);
    const f  = rng.range(0.1, 20);
    const er = rng.range(1, 10);
    await page.fill('#qw-z1', z1.toFixed(2));
    await page.fill('#qw-z2', z2.toFixed(2));
    await page.fill('#qw-f',  f.toFixed(4));
    await page.fill('#qw-er', er.toFixed(3));
    await page.click('#qw-btn');
    check(`QW[${i}] Zt`,  await getNum(page, '#qw-zt'),  Math.sqrt(z1 * z2), 0.002);
    check(`QW[${i}] len`, await getNum(page, '#qw-len'), 75 / (f * Math.sqrt(er)), 0.002);
  }
}

// ── 6. Friis ──────────────────────────────────────────────────────────────────
async function runFriis(page, rng) {
  await page.goto(`${BASE}/Friis.html`);
  await page.selectOption('#fr-fu', '1e9');
  for (let i = 0; i < N; i++) {
    const pt = rng.range(-10, 43);
    const gt = rng.range(0, 30);
    const gr = rng.range(0, 30);
    const d  = rng.range(1, 100000);
    const f  = rng.range(0.1, 30);
    await page.fill('#fr-pt', pt.toFixed(2));
    await page.fill('#fr-gt', gt.toFixed(2));
    await page.fill('#fr-gr', gr.toFixed(2));
    await page.fill('#fr-d',  d.toFixed(1));
    await page.fill('#fr-f',  f.toFixed(4));
    await page.click('#fr-btn');
    const fspl = 20 * Math.log10(4 * Math.PI * d * f * 1e9 / 3e8);
    check(`Friis[${i}] FSPL`, await getNum(page, '#fr-fspl'),   fspl,        0.003);
    check(`Friis[${i}] Pr`,   await getNum(page, '#fr-pr-dbm'), pt+gt+gr-fspl, 0.003);
  }
}

// ── 7. AttenuatorDesign ───────────────────────────────────────────────────────
async function runAttenuator(page, rng) {
  await page.goto(`${BASE}/AttenuatorDesign.html`);
  for (let i = 0; i < N; i++) {
    const topo  = rng.pick(['pi', 't']);
    const atten = rng.range(1, 40);
    const z0    = rng.range(25, 200);
    await page.selectOption('#at-topo', topo);
    await page.fill('#at-atten', atten.toFixed(3));
    await page.fill('#at-z0',    z0.toFixed(2));
    await page.click('#at-btn');
    const K = Math.pow(10, atten / 20);
    const expR1 = topo === 'pi' ? z0*(K+1)/(K-1)   : z0*(K-1)/(K+1);
    const expR2 = topo === 'pi' ? z0*(K*K-1)/(2*K) : 2*z0*K/(K*K-1);
    // Use getNumEng to handle engFmt kΩ/MΩ prefixes in the output
    check(`Att[${i}] ${topo} R1`, await getNumEng(page, '#at-r1'), expR1, 0.01);
    check(`Att[${i}] ${topo} R2`, await getNumEng(page, '#at-r2'), expR2, 0.01);
  }
}

// ── 8. SkinDepth ──────────────────────────────────────────────────────────────
async function runSkinDepth(page, rng) {
  await page.goto(`${BASE}/SkinDepth.html`);
  await page.selectOption('#sd-fu', '1e6');
  const MU0 = 4 * Math.PI * 1e-7;
  for (let i = 0; i < N; i++) {
    const f_mhz = rng.range(1, 10000);
    const mat   = rng.pick(['5.8e7', '6.3e7', '4.1e7', '3.77e7']);
    await page.fill('#sd-f', f_mhz.toFixed(2));
    await page.selectOption('#sd-mat', mat);
    await page.click('#sd-btn');
    const sigma   = parseFloat(mat);
    const expUm   = Math.sqrt(2 / (2*Math.PI * f_mhz*1e6 * MU0 * sigma)) * 1e6;
    check(`SD[${i}] f=${f_mhz.toFixed(0)}`, await getNum(page, '#sd-um'), expUm, 0.01);
  }
}

// ── 9. Coaxial ───────────────────────────────────────────────────────────────
async function runCoaxial(page, rng) {
  await page.goto(`${BASE}/Coaxial.html`);
  for (let i = 0; i < N; i++) {
    const d  = rng.range(0.5, 5);
    const D  = d + rng.range(1, 15);
    const er = rng.range(1, 5);
    await page.fill('#cx-d',  d.toFixed(3));
    await page.fill('#cx-D',  D.toFixed(3));
    await page.fill('#cx-er', er.toFixed(3));
    await page.click('#cx-btn');
    check(`Coax[${i}] Z0`, await getNum(page, '#cx-z0'),
      (60 / Math.sqrt(er)) * Math.log(D / d), 0.003);
  }
}

// ── 10. LC Resonance ─────────────────────────────────────────────────────────
async function runLC(page, rng) {
  await page.goto(`${BASE}/LC.html`);
  for (let i = 0; i < N; i++) {
    const mode = rng.pick(['C', 'L', 'f']);
    if (mode === 'C') {
      await page.fill('#L', rng.range(1, 1000).toFixed(2)); await page.selectOption('#L-unit', '2');
      await page.fill('#C', '');
      await page.fill('#f', rng.range(10, 3000).toFixed(2)); await page.selectOption('#f-unit', '1');
    } else if (mode === 'L') {
      await page.fill('#L', '');
      await page.fill('#C', rng.range(1, 10000).toFixed(2)); await page.selectOption('#C-unit', '3');
      await page.fill('#f', rng.range(10, 3000).toFixed(2)); await page.selectOption('#f-unit', '1');
    } else {
      await page.fill('#L', rng.range(1, 1000).toFixed(2));  await page.selectOption('#L-unit', '2');
      await page.fill('#C', rng.range(1, 10000).toFixed(2)); await page.selectOption('#C-unit', '3');
      await page.fill('#f', '');
    }
    await page.click('#lc-btn');
    const txt = await getTxt(page, '#lc-results');
    const ok  = txt.includes('Hz') || txt.includes('H') || txt.includes('F');
    (ok ? PASS : FAIL).push(`LC[${i}] solve${mode}: ${ok?'✓':'✗'} result present`);
  }
}

// ── 11. BandpassCalc ─────────────────────────────────────────────────────────
async function runBandpass(page, rng) {
  await page.goto(`${BASE}/BandpassCalc.html`);
  for (let i = 0; i < N; i++) {
    const L   = rng.range(1, 10000);   // nH
    const C   = rng.range(0.1, 10000); // pF
    const R   = rng.range(1, 10000);
    const cfg = rng.pick(['series', 'parallel']);
    await page.fill('#bp-L', L.toFixed(3)); await page.selectOption('#bp-Lu', '1e-9');
    await page.fill('#bp-C', C.toFixed(3)); await page.selectOption('#bp-Cu', '1e-12');
    await page.fill('#bp-R', R.toFixed(3));
    await page.selectOption('#bp-config', cfg);
    await page.click('#bp-btn');
    const w0   = 1 / Math.sqrt(L*1e-9 * C*1e-12);
    const expQ = cfg === 'series' ? (w0 * L*1e-9 / R) : (R / (w0 * L*1e-9));
    check(`BP[${i}] ${cfg} Q`, await getNum(page, '#bp-Q'), expQ, 0.05);
    checkPresent(`BP[${i}] f0`, await getTxt(page, '#bp-f0'), 'Hz');
  }
}

// ── 12. FilterDesign ─────────────────────────────────────────────────────────
async function runFilterDesign(page, rng) {
  await page.goto(`${BASE}/FilterDesign.html`);
  for (let i = 0; i < N; i++) {
    const ftype  = rng.pick(['lp', 'hp']);
    const resp   = rng.pick(['butter', 'cheby']);
    const n      = rng.irange(2, 7);
    const fc     = rng.range(10, 5000);
    const r0     = rng.range(10, 500);
    await page.selectOption('#fd-type', ftype);
    await page.selectOption('#fd-resp', resp);
    await page.fill('#fd-n',  String(n));
    await page.fill('#fd-fc', fc.toFixed(2));
    await page.fill('#fd-r0', r0.toFixed(2));
    if (resp === 'cheby') await page.fill('#fd-ripple', rng.range(0.1, 3).toFixed(2));
    await page.click('#fd-btn');
    const txt = await getTxt(page, '#fd-out');
    checkPresent(`FD[${i}] H`, txt, 'H');
    checkPresent(`FD[${i}] F`, txt, 'F');
  }
}

// ── 13. SteppedImpedanceLPF ──────────────────────────────────────────────────
async function runSILPF(page, rng) {
  await page.goto(`${BASE}/SteppedImpedanceLPF.html`);
  for (let i = 0; i < N; i++) {
    const n  = rng.irange(3, 9);
    const z0 = rng.range(20, 80);
    const zh = z0 + rng.range(10, 120);
    const zl = rng.range(5, z0 - 5);
    await page.selectOption('#silpf-n', String(n));
    await page.fill('#silpf-fc', rng.range(100, 10000).toFixed(1));
    await page.fill('#silpf-z0', z0.toFixed(1));
    await page.fill('#silpf-zh', zh.toFixed(1));
    await page.fill('#silpf-zl', zl.toFixed(1));
    await page.fill('#silpf-er', rng.range(1, 10).toFixed(2));
    await page.click('#silpf-btn');
    checkPresent(`SILPF[${i}]`, await getTxt(page, '#silpf-results'), 'mm');
  }
}

// ── 14. Microstrip W→Z (50 sets) + Z→W (50 sets) ────────────────────────────
async function runMicrostrip(page, rng) {
  await page.goto(`${BASE}/Microstrip.html`);
  for (let i = 0; i < 50; i++) {
    await page.fill('#ms-er', rng.range(1.5, 15).toFixed(3));
    await page.fill('#ms-h',  rng.range(0.1, 5).toFixed(3));
    await page.fill('#ms-w',  rng.range(0.05, 10).toFixed(3));
    await page.click('#ms-btn1');
    checkPresent(`MS_W2Z[${i}]`, await getTxt(page, '#ms-z0-out'), 'Ω');
  }
  await page.goto(`${BASE}/Microstrip.html`);
  for (let i = 0; i < 50; i++) {
    await page.fill('#ms-z0',  rng.range(20, 150).toFixed(2));
    await page.fill('#ms-h2',  rng.range(0.1, 5).toFixed(3));
    await page.fill('#ms-er2', rng.range(1.5, 15).toFixed(3));
    await page.click('#ms-btn2');
    checkPresent(`MS_Z2W[${i}]`, await getTxt(page, '#ms-w-out'), 'mm');
  }
}

// ── 15. Stripline ─────────────────────────────────────────────────────────────
async function runStripline(page, rng) {
  await page.goto(`${BASE}/Stripline.html`);
  for (let i = 0; i < N; i++) {
    const b = rng.range(0.5, 5);
    const w = rng.range(0.05, b - 0.05);
    await page.fill('#sl-er', rng.range(1.5, 10).toFixed(3));
    await page.fill('#sl-b',  b.toFixed(3));
    await page.fill('#sl-t',  rng.range(0.01, 0.15).toFixed(3));
    await page.fill('#sl-w',  w.toFixed(3));
    await page.click('#sl-btn');
    checkPresent(`SL[${i}]`, await getTxt(page, '#sl-z0'), 'Ω');
  }
}

// ── 16. CPW ───────────────────────────────────────────────────────────────────
async function runCPW(page, rng) {
  await page.goto(`${BASE}/CPW.html`);
  for (let i = 0; i < N; i++) {
    await page.fill('#cpw-er', rng.range(1.5, 12).toFixed(3));
    await page.fill('#cpw-h',  rng.range(0.1, 5).toFixed(3));
    await page.fill('#cpw-w',  rng.range(0.1, 5).toFixed(3));
    await page.fill('#cpw-s',  rng.range(0.05, 2).toFixed(3));
    await page.click('#cpw-btn');
    checkPresent(`CPW[${i}]`, await getTxt(page, '#cpw-z0'), 'Ω');
  }
}

// ── 17. CoupledResonators ────────────────────────────────────────────────────
async function runCoupledResonators(page, rng) {
  await page.goto(`${BASE}/CoupledResonators.html`);
  for (let i = 0; i < N; i++) {
    const L = rng.range(1, 10000);
    const M = L * rng.range(0.01, 0.3);
    await page.fill('#cr-L', L.toFixed(2));   await page.selectOption('#cr-L-unit', '1e-9');
    await page.fill('#cr-C', rng.range(0.1, 10000).toFixed(2)); await page.selectOption('#cr-C-unit', '1e-12');
    await page.fill('#cr-M', M.toFixed(3));   await page.selectOption('#cr-M-unit', '1e-9');
    await page.fill('#cr-R', rng.range(1, 1000).toFixed(2));
    await page.click('#cr-btn');
    checkPresent(`CR[${i}]`, await getTxt(page, '#cr-results'), 'Hz');
  }
}

// ── 18. LCBalun ───────────────────────────────────────────────────────────────
async function runLCBalun(page, rng) {
  await page.goto(`${BASE}/LCBalun.html`);
  await page.selectOption('#bl-fu', '1e6');
  for (let i = 0; i < N; i++) {
    await page.fill('#bl-f',  rng.range(10, 5000).toFixed(2));
    await page.selectOption('#bl-topo', rng.pick(['lattice', 'pi']));
    await page.fill('#bl-zu', rng.range(20, 200).toFixed(2));
    await page.fill('#bl-zb', rng.range(20, 1000).toFixed(2));
    await page.click('#bl-btn');
    checkPresent(`LCBalun[${i}]`, await getTxt(page, 'article'), 'H');
  }
}

// ── 19. LNetwork ─────────────────────────────────────────────────────────────
async function runLNetwork(page, rng) {
  await page.goto(`${BASE}/LNetwork.html`);
  await page.selectOption('#ln-fu', '1e9');
  for (let i = 0; i < N; i++) {
    const r1 = rng.range(10, 1000);
    const r2 = rng.range(10, 1000);
    const rs = Math.max(r1, r2), rl = Math.min(r1, r2);
    if (rs === rl) continue;
    await page.fill('#ln-rs', rs.toFixed(2));
    await page.fill('#ln-rl', rl.toFixed(2));
    await page.fill('#ln-f',  rng.range(0.1, 10).toFixed(4));
    await page.click('#ln-btn');
    check(`LNet[${i}] Q`, await getNum(page, '#ln-Q'), Math.sqrt(rs / rl - 1), 0.005);
  }
}

// ── 20. PiTNetwork ───────────────────────────────────────────────────────────
async function runPiT(page, rng) {
  await page.goto(`${BASE}/PiTNetwork.html`);
  await page.selectOption('#pt-fu', '1e6');
  for (let i = 0; i < N; i++) {
    await page.fill('#pt-r1',  rng.range(10, 1000).toFixed(2));
    await page.fill('#pt-r2',  rng.range(10, 1000).toFixed(2));
    await page.fill('#pt-q',   rng.range(1, 20).toFixed(2));
    await page.fill('#pt-f',   rng.range(1, 5000).toFixed(2));
    await page.selectOption('#pt-topo', rng.pick(['pi-lp', 'pi-hp', 't-lp', 't-hp']));
    await page.click('#pt-btn');
    checkPresent(`PiT[${i}]`, await getTxt(page, 'article'), 'H');
  }
}

// ── 21. ImpedanceMatchingNetwork ─────────────────────────────────────────────
async function runIMN(page, rng) {
  await page.goto(`${BASE}/ImpedanceMatchingNetwork.html`);
  await page.selectOption('#imn-fu', '1e6');
  for (let i = 0; i < N; i++) {
    await page.fill('#imn-rs', rng.range(10, 500).toFixed(2));
    await page.fill('#imn-rl', rng.range(10, 500).toFixed(2));
    await page.fill('#imn-xs', '0');
    await page.fill('#imn-xl', '0');
    await page.fill('#imn-f',  rng.range(1, 5000).toFixed(2));
    await page.click('#imn-btn');
    checkPresent(`IMN[${i}]`, await getTxt(page, '#imn-results'), 'Solution');
  }
}

// ── 22. Coupler ───────────────────────────────────────────────────────────────
async function runCoupler(page, rng) {
  await page.goto(`${BASE}/Coupler.html`);
  await page.selectOption('#coup-f-unit', '1e9');
  for (let i = 0; i < N; i++) {
    const ctype = rng.pick(['coupled', 'branch']);
    await page.selectOption('#coup-type', ctype);
    await page.fill('#coup-f',  rng.range(0.5, 20).toFixed(3));
    await page.fill('#coup-z0', rng.range(20, 150).toFixed(2));
    if (ctype === 'coupled') await page.fill('#coup-C', rng.range(5, 30).toFixed(1));
    else { try { await page.fill('#coup-ratio', '1'); } catch {} }
    await page.click('#coup-btn');
    checkPresent(`Coup[${i}]`, await getTxt(page, '#coup-results'), 'Ω');
  }
}

// ── 23. Wilkinson ────────────────────────────────────────────────────────────
async function runWilkinson(page, rng) {
  await page.goto(`${BASE}/Wilkinson.html`);
  await page.selectOption('#wk-fu', '1e9');
  for (let i = 0; i < N; i++) {
    const z0 = rng.range(20, 200);
    await page.fill('#wk-f',  rng.range(0.1, 20).toFixed(4));
    await page.fill('#wk-z0', z0.toFixed(2));
    await page.fill('#wk-er', rng.range(1, 10).toFixed(3));
    await page.click('#wk-btn');
    check(`Wilk[${i}] Z1`, await getNum(page, '#wk-z1'), z0 * Math.SQRT2, 0.003);
  }
}

// ── 24. PowerCombiner ────────────────────────────────────────────────────────
async function runPowerCombiner(page, rng) {
  await page.goto(`${BASE}/PowerCombiner.html`);
  for (let i = 0; i < N; i++) {
    const n   = rng.irange(2, 16);
    const eta = rng.range(0.5, 1.0);
    await page.fill('#pc-n',    String(n));
    await page.fill('#pc-p',    rng.range(-10, 40).toFixed(2));
    await page.fill('#pc-eta',  eta.toFixed(3));
    await page.fill('#pc-fail', '0');
    await page.click('#pc-btn');
    // Display rounds to 1 decimal → use ±0.1 dBm absolute floor alongside 2% relative
    check(`PC[${i}] N=${n}`, await getNum(page, '#pc-cgain'), 10 * Math.log10(n * eta), 0.02, 0.1);
  }
}

// ── 25. StubCalc ─────────────────────────────────────────────────────────────
async function runStubCalc(page, rng) {
  await page.goto(`${BASE}/StubCalc.html`);
  await page.selectOption('#st-fu', '1e9');
  for (let i = 0; i < N; i++) {
    const stype = rng.pick(['open', 'short']);
    const f     = rng.range(0.1, 20);
    const z0    = rng.range(20, 200);
    const B_mS  = rng.range(-100, 100);
    if (Math.abs(B_mS) < 0.001) continue;
    await page.selectOption('#st-type', stype);
    await page.fill('#st-f',  f.toFixed(4));
    await page.fill('#st-z0', z0.toFixed(2));
    await page.fill('#st-B',  B_mS.toFixed(4));
    await page.click('#st-btn');
    checkPresent(`Stub[${i}] mm`, await getTxt(page, '#st-pl'), 'mm');
    const Y0 = 1 / z0, B = B_mS * 1e-3;
    let betaL = stype === 'short' ? Math.atan2(Y0, B) : Math.atan2(-Y0, B);
    if (betaL < 0) betaL += Math.PI;
    check(`Stub[${i}] el°`, await getNum(page, '#st-el'), betaL * 180 / Math.PI, 0.002);
  }
}

// ── 26. AmpStability ─────────────────────────────────────────────────────────
async function runAmpStability(page, rng) {
  await page.goto(`${BASE}/AmpStability.html`);
  for (let i = 0; i < N; i++) {
    await page.fill('#amp-s11m', rng.range(0.05, 0.95).toFixed(3));
    await page.fill('#amp-s11a', rng.range(-180, 180).toFixed(1));
    await page.fill('#amp-s12m', rng.range(0.005, 0.5).toFixed(3));
    await page.fill('#amp-s12a', rng.range(-180, 180).toFixed(1));
    await page.fill('#amp-s21m', rng.range(0.5, 10).toFixed(3));
    await page.fill('#amp-s21a', rng.range(-180, 180).toFixed(1));
    await page.fill('#amp-s22m', rng.range(0.05, 0.95).toFixed(3));
    await page.fill('#amp-s22a', rng.range(-180, 180).toFixed(1));
    await page.click('#amp-btn');
    checkPresent(`AmpStab[${i}]`, await getTxt(page, '#amp-results'), 'K');
  }
}

// ── 27. NoiseFigure (navigate once, vary stage values 100x) ──────────────────
async function runNF(page, rng) {
  await page.goto(`${BASE}/NoiseFigure.html`);
  await page.fill('#nf-n', '3');
  const btns0 = await page.$$('.calc-btn');
  if (btns0[0]) await btns0[0].click();
  await page.waitForTimeout(300);
  for (let i = 0; i < N; i++) {
    try {
      const nfI = await page.$$('input[id^="nf-nf"]');
      const gI  = await page.$$('input[id^="nf-gain"]');
      for (const el of nfI) await el.fill(rng.range(1, 15).toFixed(1));
      for (const el of gI)  await el.fill(rng.range(-10, 25).toFixed(1));
    } catch {}
    const btns = await page.$$('.calc-btn');
    const calcBtn = btns.length >= 2 ? btns[1] : btns[0];
    if (calcBtn) await calcBtn.click();
    checkPresent(`NF[${i}] dB`, await getTxt(page, 'article'), 'dB');
  }
}

// ── 28. IP3Calc ───────────────────────────────────────────────────────────────
async function runIP3(page, rng) {
  await page.goto(`${BASE}/IP3Calc.html`);
  for (let i = 0; i < N; i++) {
    const pin  = rng.range(-60, 0);
    const gain = rng.range(-20, 40);
    const iip3 = rng.range(-20, 50);
    await page.fill('#ip-pin',  pin.toFixed(2));
    await page.fill('#ip-gain', gain.toFixed(2));
    await page.fill('#ip-iip3', iip3.toFixed(2));
    await page.click('#ip-btn');
    // Display rounds to 1 decimal place → use ±0.1 dBm absolute floor to absorb rounding
    check(`IP3[${i}] OIP3`, await getNum(page, '#ip-oip3'), iip3 + gain, 0.005, 0.1);
    check(`IP3[${i}] Pout`, await getNum(page, '#ip-pout'), pin  + gain, 0.005, 0.1);
  }
}

// ── 29. LinkBudget ───────────────────────────────────────────────────────────
async function runLinkBudget(page, rng) {
  await page.goto(`${BASE}/LinkBudget.html`);
  await page.selectOption('#lb-fu', '1e9');
  await page.selectOption('#lb-bwu', '1e6');
  for (let i = 0; i < N; i++) {
    await page.fill('#lb-pt',   rng.range(10, 43).toFixed(1));
    await page.fill('#lb-gt',   rng.range(0, 20).toFixed(1));
    await page.fill('#lb-ltx',  rng.range(0, 5).toFixed(1));
    await page.fill('#lb-d',    rng.range(100, 50000).toFixed(0));
    await page.fill('#lb-f',    rng.range(0.1, 10).toFixed(3));
    await page.fill('#lb-gr',   rng.range(0, 25).toFixed(1));
    await page.fill('#lb-lrx',  rng.range(0, 5).toFixed(1));
    await page.fill('#lb-nf',   rng.range(1, 15).toFixed(1));
    await page.fill('#lb-bw',   rng.range(0.1, 100).toFixed(2));
    await page.fill('#lb-snr',  rng.range(5, 30).toFixed(1));
    await page.fill('#lb-lmisc', rng.range(0, 10).toFixed(1));
    await page.click('#lb-btn');
    checkPresent(`LB[${i}] dBm`, await getTxt(page, '#lb-out'), 'dBm');
  }
}

// ── 30. RadarRange ───────────────────────────────────────────────────────────
async function runRadarRange(page, rng) {
  await page.goto(`${BASE}/RadarRange.html`);
  await page.selectOption('#rd-fu', '1e9');
  for (let i = 0; i < N; i++) {
    await page.fill('#rd-pt',    rng.range(40, 80).toFixed(1));
    await page.fill('#rd-gt',    rng.range(10, 40).toFixed(1));
    await page.fill('#rd-gr',    rng.range(10, 40).toFixed(1));
    await page.fill('#rd-f',     rng.range(1, 35).toFixed(3));
    await page.fill('#rd-sigma', rng.range(0.001, 100).toFixed(4));
    await page.fill('#rd-pmin',  rng.range(-120, -80).toFixed(1));
    await page.click('#rd-btn');
    checkPresent(`RR[${i}] m`, await getTxt(page, '#rd-rmax'), 'm');
  }
}

// ── 31. TwoPortConverter ─────────────────────────────────────────────────────
async function runTwoPort(page, rng) {
  await page.goto(`${BASE}/TwoPortConverter.html`);
  for (let i = 0; i < N; i++) {
    const s = () => rng.range(-1, 1).toFixed(3);
    await page.fill('#tp-11r', s()); await page.fill('#tp-11i', s());
    await page.fill('#tp-12r', s()); await page.fill('#tp-12i', s());
    await page.fill('#tp-21r', s()); await page.fill('#tp-21i', s());
    await page.fill('#tp-22r', s()); await page.fill('#tp-22i', s());
    await page.click('#tp-btn');
    checkPresent(`TP[${i}] ABCD`, await getTxt(page, '#tp-out'), 'ABCD');
  }
}

// ── 32. PLLFilter ────────────────────────────────────────────────────────────
async function runPLL(page, rng) {
  await page.goto(`${BASE}/PLLFilter.html`);
  await page.selectOption('#pll-ko-unit', '6283185');
  await page.selectOption('#pll-bw-unit', '1e3');
  for (let i = 0; i < N; i++) {
    await page.fill('#pll-kd', rng.range(0.5e-3, 20e-3).toFixed(5));
    await page.fill('#pll-ko', rng.range(1, 500).toFixed(2));
    await page.fill('#pll-n',  String(rng.irange(10, 10000)));
    await page.fill('#pll-bw', rng.range(1, 500).toFixed(2));
    await page.fill('#pll-pm', rng.range(30, 85).toFixed(1));
    await page.click('#pll-btn');
    const txt = await getTxt(page, '#pll-results');
    checkPresent(`PLL[${i}] Ω`, txt, 'Ω');
    checkPresent(`PLL[${i}] F`, txt, 'F');
  }
}

// ── 33. PhaseNoiseJitter ─────────────────────────────────────────────────────
// #pn-rows is a div container; JS populates it with #pn-f0..4 / #pn-l0..4 inputs.
// Also needs #pn-flow / #pn-fhigh for the integration band.
async function runPhaseNoise(page, rng) {
  await page.goto(`${BASE}/PhaseNoiseJitter.html`);
  // Default integration bounds (1 kHz – 10 MHz) are fine; just vary fc and levels
  for (let i = 0; i < N; i++) {
    await page.fill('#pn-fc', rng.range(0.1, 10).toFixed(3));
    await page.selectOption('#pn-fcu', rng.pick(['1e6', '1e9']));
    // Fill each phase-noise level (keep offset freqs at defaults)
    const baseLevel = rng.range(-160, -60);
    for (let j = 0; j < 5; j++) {
      await page.fill(`#pn-l${j}`, (baseLevel + j * rng.range(5, 25)).toFixed(0));
    }
    await page.click('#pn-btn');
    checkPresent(`PN[${i}] ps`, await getTxt(page, 'article'), 'ps');
  }
}

// ── 34. PhasedArrayDecoupling ─────────────────────────────────────────────────
async function runPAD(page, rng) {
  await page.goto(`${BASE}/PhasedArrayDecoupling.html`);
  for (let i = 0; i < N; i++) {
    await page.fill('#pa2-r',  rng.range(30, 150).toFixed(1));
    await page.fill('#pa2-d',  rng.range(50, 300).toFixed(1));
    await page.fill('#pa2-f',  rng.range(64, 600).toFixed(1));
    await page.fill('#pa2-z0', rng.range(20, 100).toFixed(1));
    await page.fill('#pa2-zp', rng.range(0.5, 20).toFixed(2));
    await page.click('#pa2-btn');
    checkPresent(`PAD[${i}] dB`, await getTxt(page, 'article'), 'dB');
  }
}

// ── 35. SAREstimator ─────────────────────────────────────────────────────────
async function runSAR(page, rng) {
  await page.goto(`${BASE}/SAREstimator.html`);
  const tissues = { muscle:{s:0.77,r:1050}, brain:{s:0.59,r:1040}, fat:{s:0.044,r:920}, blood:{s:1.24,r:1060} };
  for (let i = 0; i < N; i++) {
    const tissue = rng.pick(['muscle', 'brain', 'fat', 'blood']);
    const B1     = rng.range(1, 30);
    const f      = rng.range(64, 600);
    const dc     = rng.range(0.1, 1.0);
    await page.fill('#sar-b1', B1.toFixed(3));
    await page.fill('#sar-f',  f.toFixed(1));
    await page.selectOption('#sar-tissue', tissue);
    await page.fill('#sar-dc', dc.toFixed(3));
    await page.click('#sar-btn');
    const { s: sigma, r: rho } = tissues[tissue];
    const w   = 2 * Math.PI * f * 1e6;
    const E   = w * (B1 * 1e-6) * 0.10 / 2;
    const exp = sigma * E * E / (2 * rho);
    check(`SAR[${i}] peak`, await getNum(page, '#sar-peak'), exp, 0.02);
  }
}

// ── 36. Waveguide ─────────────────────────────────────────────────────────────
async function runWaveguide(page, rng) {
  await page.goto(`${BASE}/Waveguide.html`);
  await page.selectOption('#wg-a-unit', '1e-3');
  await page.selectOption('#wg-b-unit', '1e-3');
  await page.selectOption('#wg-f-unit', '1e9');
  for (let i = 0; i < N; i++) {
    const a   = rng.range(5, 80);
    const b   = rng.range(a * 0.3, a * 0.55);
    const fc  = 150 / a;
    const f   = fc * rng.range(1.1, 3);
    await page.fill('#wg-a',  a.toFixed(2));
    await page.fill('#wg-b',  b.toFixed(2));
    await page.fill('#wg-f',  f.toFixed(3));
    await page.fill('#wg-er', rng.range(1, 5).toFixed(2));
    await page.click('#wg-btn');
    checkPresent(`WG[${i}] GHz`, await getTxt(page, '#wg-results'), 'GHz');
  }
}

// ── 37. CircularWaveguide ─────────────────────────────────────────────────────
async function runCircularWG(page, rng) {
  await page.goto(`${BASE}/CircularWaveguide.html`);
  await page.selectOption('#cwg-a-unit', '1e-3');
  await page.selectOption('#cwg-f-unit', '1e9');
  for (let i = 0; i < N; i++) {
    const a_mm  = rng.range(3, 50);
    const fc_ghz = 1.8412 * 30 / (Math.PI * a_mm);
    const f_ghz  = fc_ghz * rng.range(1.1, 3);
    await page.fill('#cwg-a',  a_mm.toFixed(2));
    await page.fill('#cwg-f',  f_ghz.toFixed(3));
    await page.fill('#cwg-er', rng.range(1, 4).toFixed(2));
    await page.click('#cwg-btn');
    checkPresent(`CWG[${i}] GHz`, await getTxt(page, '#cwg-results'), 'GHz');
  }
}

// ── 38. PatchAntenna ─────────────────────────────────────────────────────────
async function runPatchAntenna(page, rng) {
  await page.goto(`${BASE}/PatchAntenna.html`);
  await page.selectOption('#pa-fu', '1e9');
  for (let i = 0; i < N; i++) {
    await page.fill('#pa-er', rng.range(2, 12).toFixed(3));
    await page.fill('#pa-h',  rng.range(0.5, 5).toFixed(3));
    await page.fill('#pa-f',  rng.range(0.5, 20).toFixed(3));
    await page.click('#pa-btn');
    checkPresent(`PA[${i}] W`, await getTxt(page, '#pa-W'), 'mm');
    checkPresent(`PA[${i}] L`, await getTxt(page, '#pa-L'), 'mm');
  }
}

// ── 39. Dipole ───────────────────────────────────────────────────────────────
async function runDipole(page, rng) {
  await page.goto(`${BASE}/Dipole.html`);
  await page.selectOption('#dp-fu', '1e6');
  for (let i = 0; i < N; i++) {
    await page.fill('#dp-f', rng.range(10, 10000).toFixed(2));
    await page.click('#dp-btn');
    checkPresent(`Dipole[${i}] mm`, await getTxt(page, '#dp-arm'), 'mm');
  }
}

// ── 40. HelicalAntenna ───────────────────────────────────────────────────────
async function runHelical(page, rng) {
  await page.goto(`${BASE}/HelicalAntenna.html`);
  await page.selectOption('#helix-f-unit', '1e9');
  await page.selectOption('#helix-mode', 'design');
  for (let i = 0; i < N; i++) {
    await page.fill('#helix-f', rng.range(0.1, 10).toFixed(3));
    await page.fill('#helix-n', String(rng.irange(3, 20)));
    await page.click('#helix-btn');
    checkPresent(`Helix[${i}] mm`, await getTxt(page, '#helix-results'), 'mm');
  }
}

// ── 41. YagiAntenna ──────────────────────────────────────────────────────────
async function runYagi(page, rng) {
  await page.goto(`${BASE}/YagiAntenna.html`);
  await page.selectOption('#yagi-f-unit', '1e6');
  await page.selectOption('#yagi-diam-unit', '1e-3');
  for (let i = 0; i < N; i++) {
    await page.fill('#yagi-f',    rng.range(50, 2400).toFixed(1));
    await page.fill('#yagi-n',    String(rng.irange(2, 9)));
    await page.fill('#yagi-diam', rng.range(1, 20).toFixed(1));
    await page.click('#yagi-btn');
    // Use 'dBi' (always present from gain line) — low-freq elements show 'm' not 'mm'
    checkPresent(`Yagi[${i}] dBi`, await getTxt(page, '#yagi-results'), 'dBi');
  }
}

// ── 42. BirdcageCoil ─────────────────────────────────────────────────────────
async function runBirdcage(page, rng) {
  await page.goto(`${BASE}/BirdcageCoil.html`);
  for (let i = 0; i < N; i++) {
    const n = rng.irange(2, 16) * 2;  // always even
    await page.fill('#bc-n', String(n));
    await page.fill('#bc-r', rng.range(5, 50).toFixed(1));
    await page.fill('#bc-l', rng.range(5, 100).toFixed(1));
    await page.fill('#bc-f', rng.range(64, 600).toFixed(1));
    await page.click('#bc-btn');
    checkPresent(`BC[${i}] pF`, await getTxt(page, 'article'), 'pF');
  }
}

// ── 43. ESeries ──────────────────────────────────────────────────────────────
async function runESeries(page, rng) {
  await page.goto(`${BASE}/ESeries.html`);
  for (let i = 0; i < N; i++) {
    await page.fill('#es-val', rng.range(1, 10e6).toFixed(2));
    await page.selectOption('#es-series', rng.pick(['E6', 'E12', 'E24', 'E48', 'E96']));
    await page.click('#es-btn');
    checkPresent(`ES[${i}] Ω`, await getTxt(page, '#es-results'), 'Ω');
  }
}

// ── 44. BondWireVia ──────────────────────────────────────────────────────────
async function runBondWire(page, rng) {
  await page.goto(`${BASE}/BondWireVia.html`);
  for (let i = 0; i < N; i++) {
    const l = rng.range(0.3, 10);
    const d = rng.range(0.01, 0.2);
    await page.fill('#bw-l', l.toFixed(3));
    await page.fill('#bw-d', d.toFixed(4));
    await page.fill('#bw-h', rng.range(0.05, 0.5).toFixed(3));
    await page.click('#bw-btn');
    check(`BW[${i}] L`, await getNum(page, '#bw-L'),
      0.2 * l * (Math.log(2 * l / d) - 0.75), 0.02);
  }
}

// ── 45. DiffPair ─────────────────────────────────────────────────────────────
async function runDiffPair(page, rng) {
  await page.goto(`${BASE}/DiffPair.html`);
  for (let i = 0; i < N; i++) {
    await page.fill('#dp2-er', rng.range(2, 12).toFixed(3));
    await page.fill('#dp2-h',  rng.range(0.1, 5).toFixed(3));
    await page.fill('#dp2-w',  rng.range(0.05, 3).toFixed(3));
    await page.fill('#dp2-s',  rng.range(0.05, 3).toFixed(3));
    await page.fill('#dp2-t',  rng.range(0.01, 0.2).toFixed(3));
    await page.click('#dp2-btn');
    checkPresent(`DP[${i}] Ω`, await getTxt(page, '#dp2-zdiff'), 'Ω');
  }
}

// ── 46. SmithChart ───────────────────────────────────────────────────────────
// Pin R+jX points and verify RL = -20·log10(|Γ|), where |Γ|² = ((R-Z₀)²+X²)/((R+Z₀)²+X²)
async function runSmithChart(page, rng) {
  await page.goto(`${BASE}/SmithChart.html`);
  await page.fill('#sc-z0', '50');
  for (let i = 0; i < N; i++) {
    const R = rng.range(1, 500);
    const X = rng.range(-300, 300);
    await page.fill('#sc-r', R.toFixed(2));
    await page.fill('#sc-x', X.toFixed(2));
    await page.click('#sc-plot-btn');
    const Z0 = 50;
    const mag2 = ((R - Z0) ** 2 + X * X) / ((R + Z0) ** 2 + X * X);
    const mag = Math.sqrt(mag2);
    const expRL = -20 * Math.log10(mag);
    const result = await page.evaluate(function() {
      var Z0 = SC.z0;
      var pt  = SC.points[SC.points.length - 1];
      if (!pt) return null;
      var g   = zToGamma(pt.r / Z0, pt.x / Z0);
      var m   = Math.sqrt(g.re * g.re + g.im * g.im);
      return m > 0 ? -20 * Math.log10(m) : null;
    });
    if (result !== null) {
      check(`SC[${i}] RL`, result, expRL, 0.003);
    } else {
      FAIL.push(`SC[${i}]: no point returned`);
    }
  }
}

// ── 47. TLLoss ───────────────────────────────────────────────────────────────
// Coax: Z₀ = 138/√εr · log₁₀(D/d).  Microstrip: presence check for 'dB'.
async function runTLLoss(page, rng) {
  await page.goto(`${BASE}/TLLoss.html`);
  await page.selectOption('#tl-f-unit', '1e9');
  await page.selectOption('#tl-len-unit', '1e-2');
  // 50 coax numeric checks
  await page.selectOption('#tl-type', 'coax');
  await page.evaluate(() => tl_type_change());
  for (let i = 0; i < 50; i++) {
    const er = rng.range(1, 4);
    const d  = rng.range(0.5, 3);
    const D  = d + rng.range(1, 10);
    await page.fill('#tl-f',   rng.range(0.1, 10).toFixed(3));
    await page.fill('#tl-len', rng.range(1, 100).toFixed(1));
    await page.fill('#cx-er',  er.toFixed(3));
    await page.fill('#cx-df',  '0');
    await page.fill('#cx-d',   d.toFixed(3));
    await page.fill('#cx-D',   D.toFixed(3));
    await page.fill('#cx-sigma', '5.8e7');
    await page.click('#tl-btn');
    const expZ0 = 138 / Math.sqrt(er) * Math.log10(D / d);
    check(`TL[${i}] coax Z0`, await getNum(page, '#tl-results'), expZ0, 0.005);
  }
  // 50 microstrip presence checks
  await page.selectOption('#tl-type', 'mstrip');
  await page.evaluate(() => tl_type_change());
  for (let i = 0; i < 50; i++) {
    await page.fill('#tl-f',   rng.range(0.1, 10).toFixed(3));
    await page.fill('#tl-len', rng.range(1, 100).toFixed(1));
    await page.fill('#ms-er',  rng.range(2, 12).toFixed(3));
    await page.fill('#ms-df',  '0');
    await page.fill('#ms-w',   rng.range(0.1, 5).toFixed(3));
    await page.fill('#ms-h',   rng.range(0.1, 3).toFixed(3));
    await page.fill('#ms-t',   '35');
    await page.fill('#ms-sigma', '5.8e7');
    await page.click('#tl-btn');
    checkPresent(`TL_ms[${i}] dB`, await getTxt(page, '#tl-results'), 'dB');
  }
}

// ── 48. RFSimulator ──────────────────────────────────────────────────────────
// Load each built-in preset, simulate, verify sim-summary shows dB values.
// Chart.js can't load from CDN in headless mode — inject a minimal stub.
async function runRFSim(page, rng) {
  await page.goto(`${BASE}/RFSimulator.html`);
  await page.evaluate(() => {
    if (typeof Chart === 'undefined')
      window.Chart = function() { this.destroy = function() {}; };
  });
  const presets = ['lpf3', 'hpf3', 'bpf', 'lmatch', 'qw', 'stub'];
  for (let i = 0; i < N; i++) {
    const preset = rng.pick(presets);
    await page.evaluate((p) => { loadPreset(p); }, preset);
    await page.evaluate(() => simulate());
    checkPresent(`RFSim[${i}] ${preset}`, await getTxt(page, '#sim-summary'), 'dB');
  }
}

// ── 49. SpiceSim ─────────────────────────────────────────────────────────────
// Load presets and run; verify the log reports completion.
// Chart.js can't load from CDN in headless mode — inject a minimal stub.
async function runSpiceSim(page, rng) {
  await page.goto(`${BASE}/SpiceSim.html`);
  await page.evaluate(() => {
    if (typeof Chart === 'undefined')
      window.Chart = function() { this.destroy = function() {}; };
  });
  const presets = ['rc_lpf', 'rlc_series', 'lc_tank', 'rl_lpf', 'pi_filter', 'dc_divider', 'rc_tran', 'rlc_tran'];
  for (let i = 0; i < N; i++) {
    const preset = rng.pick(presets);
    await page.evaluate((p) => { loadPreset(p); }, preset);
    await page.evaluate(() => runSpice());
    checkPresent(`Spice[${i}] ${preset}`, await getTxt(page, '#spice-log'), 'complete');
  }
}

// ── 50. SurfaceCoilDesigner ──────────────────────────────────────────────────
// Inductance formula: L = μ₀·r·(ln(8r/a) − 2), r = D/2, a = d/2 (SI)
// MathJax.typeset() is called after calculate() but typeset never loads from CDN.
async function runSurfaceCoil(page, rng) {
  await page.goto(`${BASE}/SurfaceCoilDesigner.html`);
  await page.evaluate(() => {
    if (window.MathJax && typeof MathJax.typeset !== 'function')
      MathJax.typeset = function() {};
  });
  const MU0 = 4 * Math.PI * 1e-7;
  for (let i = 0; i < N; i++) {
    const D_mm = rng.range(20, 200);
    const d_mm = rng.range(0.5, Math.min(D_mm * 0.2, 8));
    const f    = rng.range(10, 500);
    const h    = rng.range(0, 50);
    await page.fill('#D', D_mm.toFixed(1));
    await page.fill('#d', d_mm.toFixed(2));
    await page.fill('#f', f.toFixed(2));
    await page.fill('#h', h.toFixed(1));
    await page.selectOption('#sample', 'muscle');
    await page.evaluate(() => calculate());
    const r = D_mm * 0.5e-3, a = d_mm * 0.5e-3;
    const expL = MU0 * r * (Math.log(8 * r / a) - 2);
    const gotL = await getNumEng(page, '#r_L');
    check(`SCD[${i}] L`, gotL, expL, 0.003);
  }
}

// ── 51. CapacitorNetwork ─────────────────────────────────────────────────────
// parallel: Σ Ci;  series: 1/Σ(1/Ci)
async function runCapNetwork(page, rng) {
  await page.goto(`${BASE}/CapacitorNetwork.html`);
  for (let i = 0; i < N; i++) {
    const n    = rng.irange(2, 4);
    const mode = rng.pick(['series', 'parallel']);
    const caps = Array.from({ length: n }, () => rng.range(1, 10000)); // pF values
    await page.fill('#numCaps', String(n));
    await page.selectOption('#defaultUnit', 'pF');
    await page.selectOption('#mode', mode);
    await page.evaluate((n) => { document.getElementById('numCaps').value = n; buildInputs(); }, n);
    for (let j = 1; j <= n; j++) {
      await page.fill(`#cv-${j}`, caps[j - 1].toFixed(3));
      // unit already defaulted to pF by buildInputs
    }
    await page.evaluate(() => calculate());
    const expPF = mode === 'parallel'
      ? caps.reduce((s, c) => s + c, 0)
      : 1 / caps.reduce((s, c) => s + 1 / c, 0);
    const gotF = await getNumEng(page, '#C_out');
    check(`Cap[${i}] ${mode} n=${n}`, gotF, expPF * 1e-12, 0.002);
  }
}

// ── 52. CoilDesigner ─────────────────────────────────────────────────────────
// L = μ₀·(D/2)·(ln(8D/d) − 2),  D and d in metres
async function runCoilDesigner(page, rng) {
  await page.goto(`${BASE}/CoilDesigner.html`);
  const MU0 = 4 * Math.PI * 1e-7;
  for (let i = 0; i < N; i++) {
    const D_mm = rng.range(20, 300);
    const d_mm = rng.range(0.3, Math.min(D_mm * 0.15, 5));
    const f    = rng.range(10, 500);
    await page.fill('#D', D_mm.toFixed(2));
    await page.fill('#d', d_mm.toFixed(3));
    await page.fill('#f', f.toFixed(2));
    await page.selectOption('#f_dropdown', '1');  // MHz
    await page.click('#btn');
    const DSI = D_mm * 1e-3, dSI = d_mm * 1e-3;
    const expL = MU0 * (DSI / 2) * (Math.log(8 * DSI / dSI) - 2);
    check(`CD[${i}] L`, await getNumEng(page, '#L'), expL, 0.003);
  }
}

// ── 53. CLI (Circular Loop Inductance) ───────────────────────────────────────
// Same Neumann formula as CoilDesigner (no frequency input)
async function runCLI(page, rng) {
  await page.goto(`${BASE}/CLI.html`);
  const MU0 = 4 * Math.PI * 1e-7;
  for (let i = 0; i < N; i++) {
    const D_mm = rng.range(20, 500);
    const d_mm = rng.range(0.3, Math.min(D_mm * 0.15, 10));
    await page.fill('#D', D_mm.toFixed(2));
    await page.fill('#d', d_mm.toFixed(3));
    await page.click('#btn');
    const DSI = D_mm * 1e-3, dSI = d_mm * 1e-3;
    const expL = MU0 * (DSI / 2) * (Math.log(8 * DSI / dSI) - 2);
    check(`CLI[${i}] L`, await getNumEng(page, '#L'), expL, 0.003);
  }
}

// ── Visual-only (load once) ───────────────────────────────────────────────────
async function runVisual(page, name, url, needle) {
  await page.goto(`${BASE}/${url}`);
  checkPresent(`${name} loaded`, await getTxt(page, 'body'), needle);
}

// ─── main ─────────────────────────────────────────────────────────────────────
(async () => {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', __dirname],
    { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 900));

  const browser = await chromium.launch();
  const page    = await browser.newPage();
  page.on('console', m => {
    if (m.type() === 'error') process.stderr.write('[page] ' + m.text() + '\n');
  });

  const rng = new RNG(0xDEADBEEF);
  const calcs = [
    ['dBmConverter',          () => runDbm(page, rng)],
    ['VSWRConverter',         () => runVswr(page, rng)],
    ['Wavelength',            () => runWavelength(page, rng)],
    ['FreqEnergyConverter',   () => runFreqEnergy(page, rng)],
    ['QuarterWave',           () => runQuarterWave(page, rng)],
    ['Friis',                 () => runFriis(page, rng)],
    ['AttenuatorDesign',      () => runAttenuator(page, rng)],
    ['SkinDepth',             () => runSkinDepth(page, rng)],
    ['Coaxial',               () => runCoaxial(page, rng)],
    ['LC',                    () => runLC(page, rng)],
    ['BandpassCalc',          () => runBandpass(page, rng)],
    ['FilterDesign',          () => runFilterDesign(page, rng)],
    ['SteppedImpedanceLPF',   () => runSILPF(page, rng)],
    ['Microstrip',            () => runMicrostrip(page, rng)],
    ['Stripline',             () => runStripline(page, rng)],
    ['CPW',                   () => runCPW(page, rng)],
    ['CoupledResonators',     () => runCoupledResonators(page, rng)],
    ['LCBalun',               () => runLCBalun(page, rng)],
    ['LNetwork',              () => runLNetwork(page, rng)],
    ['PiTNetwork',            () => runPiT(page, rng)],
    ['ImpedanceMatchingNetwork', () => runIMN(page, rng)],
    ['Coupler',               () => runCoupler(page, rng)],
    ['Wilkinson',             () => runWilkinson(page, rng)],
    ['PowerCombiner',         () => runPowerCombiner(page, rng)],
    ['StubCalc',              () => runStubCalc(page, rng)],
    ['AmpStability',          () => runAmpStability(page, rng)],
    ['NoiseFigure',           () => runNF(page, rng)],
    ['IP3Calc',               () => runIP3(page, rng)],
    ['LinkBudget',            () => runLinkBudget(page, rng)],
    ['RadarRange',            () => runRadarRange(page, rng)],
    ['TwoPortConverter',      () => runTwoPort(page, rng)],
    ['PLLFilter',             () => runPLL(page, rng)],
    ['PhaseNoiseJitter',      () => runPhaseNoise(page, rng)],
    ['PhasedArrayDecoupling', () => runPAD(page, rng)],
    ['SAREstimator',          () => runSAR(page, rng)],
    ['Waveguide',             () => runWaveguide(page, rng)],
    ['CircularWaveguide',     () => runCircularWG(page, rng)],
    ['PatchAntenna',          () => runPatchAntenna(page, rng)],
    ['Dipole',                () => runDipole(page, rng)],
    ['HelicalAntenna',        () => runHelical(page, rng)],
    ['YagiAntenna',           () => runYagi(page, rng)],
    ['BirdcageCoil',          () => runBirdcage(page, rng)],
    ['ESeries',               () => runESeries(page, rng)],
    ['BondWireVia',           () => runBondWire(page, rng)],
    ['DiffPair',              () => runDiffPair(page, rng)],
    ['SmithChart',          () => runSmithChart(page, rng)],
    ['TLLoss',              () => runTLLoss(page, rng)],
    ['SParamPlotter',       () => runVisual(page, 'SParamPlotter',    'SParamPlotter.html',    'Touchstone')],
    ['ArrayFactor',         () => runVisual(page, 'ArrayFactor',      'ArrayFactor.html',      'Array')],
    ['SpiceSim',            () => runSpiceSim(page, rng)],
    ['RFSimulator',         () => runRFSim(page, rng)],
    ['SurfaceCoilDesigner', () => runSurfaceCoil(page, rng)],
    ['CapacitorNetwork',    () => runCapNetwork(page, rng)],
    ['CoilDesigner',        () => runCoilDesigner(page, rng)],
    ['CLI',                 () => runCLI(page, rng)],
  ];

  console.log(`Running ${N} random input sets per calculator (${calcs.length} calculators)…\n`);
  try {
    for (const [name, fn] of calcs) {
      const passB = PASS.length, failB = FAIL.length;
      await fn();
      const nP = PASS.length - passB, nF = FAIL.length - failB;
      const marker = nF > 0 ? ` ← ${nF} FAILED` : '';
      console.log(`  ${name}: ${nP}/${nP+nF}${marker}`);
    }
  } catch (e) {
    console.error('Fatal:', e.message);
  }

  await browser.close();
  server.kill();

  const total = PASS.length + FAIL.length;
  console.log(`\n${PASS.length}/${total} checks passed`);
  if (FAIL.length) {
    console.log(`\n✗ ${FAIL.length} FAILED:`);
    FAIL.forEach(f => console.log('  ' + f));
    process.exit(1);
  } else {
    console.log('\nAll checks passed!');
    process.exit(0);
  }
})();
