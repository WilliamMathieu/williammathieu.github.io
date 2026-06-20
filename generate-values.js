'use strict';
const fs = require('fs');

class RNG {
  constructor(seed) { this.s = seed >>> 0; }
  next() { this.s = (this.s * 1664525 + 1013904223) >>> 0; return this.s / 4294967296; }
  range(lo, hi) { return lo + this.next() * (hi - lo); }
  irange(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
}

const rows = [];
const N = 100;

function n6(x) {
  if (typeof x === 'number') return Number(x.toPrecision(6)).toString();
  return String(x);
}
function inp(obj) {
  return Object.entries(obj).map(([k, v]) => `${k}=${n6(v)}`).join('; ');
}
function addNum(calc, iter, label, inputs, expected, tol, absFloor) {
  const tolStr = `±${(tol * 100).toFixed(1)}%${absFloor ? ` (abs≥${n6(absFloor)})` : ''}`;
  rows.push([calc, iter, label, 'numeric', inp(inputs), n6(expected), tolStr]);
}
function addPres(calc, iter, label, inputs, needle) {
  rows.push([calc, iter, label, 'presence', inp(inputs), `"${needle}"`, '—']);
}

// ── 1. dBmConverter ──────────────────────────────────────────────────────────
function runDbm(rng) {
  for (let i = 0; i < N; i++) {
    const dbm = rng.range(-50, 50);
    addNum('dBmConverter', i, `dBm[${i}] mW`,  {dbm}, Math.pow(10, dbm / 10), 0.002);
    addNum('dBmConverter', i, `dBm[${i}] dBW`, {dbm}, dbm - 30, 0.001);
  }
}

// ── 2. VSWRConverter ─────────────────────────────────────────────────────────
function runVswr(rng) {
  for (let i = 0; i < N; i++) {
    const vswr = rng.range(1.01, 50);
    const eg = (vswr - 1) / (vswr + 1);
    addNum('VSWRConverter', i, `VSWR[${i}] γ`,  {vswr}, eg, 0.003);
    addNum('VSWRConverter', i, `VSWR[${i}] RL`, {vswr}, -20 * Math.log10(eg), 0.02);
    addNum('VSWRConverter', i, `VSWR[${i}] ML`, {vswr}, -10 * Math.log10(1 - eg * eg), 0.01);
  }
}

// ── 3. Wavelength ─────────────────────────────────────────────────────────────
function runWavelength(rng) {
  for (let i = 0; i < N; i++) {
    const f  = rng.range(0.1, 30);   // GHz
    const er = rng.range(1, 12);
    const el = 300 / (f * Math.sqrt(er));  // mm
    addNum('Wavelength', i, `WL[${i}] λ`,   {f_GHz: f, er}, el,     0.003);
    addNum('Wavelength', i, `WL[${i}] λ/2`, {f_GHz: f, er}, el / 2, 0.003);
    addNum('Wavelength', i, `WL[${i}] λ/4`, {f_GHz: f, er}, el / 4, 0.003);
  }
}

// ── 4. FreqEnergyConverter ────────────────────────────────────────────────────
function runFreqEnergy(rng) {
  for (let i = 0; i < N; i++) {
    const f = rng.range(1, 10000);  // MHz
    addPres('FreqEnergyConverter', i, `FE[${i}] Hz`, {f_MHz: f}, 'Hz');
    addPres('FreqEnergyConverter', i, `FE[${i}] m`,  {f_MHz: f}, 'm');
  }
}

// ── 5. QuarterWave ────────────────────────────────────────────────────────────
function runQuarterWave(rng) {
  for (let i = 0; i < N; i++) {
    const z1 = rng.range(10, 300);
    const z2 = rng.range(10, 300);
    const f  = rng.range(0.1, 20);   // GHz
    const er = rng.range(1, 10);
    addNum('QuarterWave', i, `QW[${i}] Zt`,  {z1_ohm: z1, z2_ohm: z2, f_GHz: f, er}, Math.sqrt(z1 * z2), 0.002);
    addNum('QuarterWave', i, `QW[${i}] len`, {z1_ohm: z1, z2_ohm: z2, f_GHz: f, er}, 75 / (f * Math.sqrt(er)), 0.002);
  }
}

// ── 6. Friis ──────────────────────────────────────────────────────────────────
function runFriis(rng) {
  for (let i = 0; i < N; i++) {
    const pt = rng.range(-10, 43);
    const gt = rng.range(0, 30);
    const gr = rng.range(0, 30);
    const d  = rng.range(1, 100000);
    const f  = rng.range(0.1, 30);   // GHz
    const fspl = 20 * Math.log10(4 * Math.PI * d * f * 1e9 / 3e8);
    addNum('Friis', i, `Friis[${i}] FSPL`, {pt_dBm: pt, gt_dBi: gt, gr_dBi: gr, d_m: d, f_GHz: f}, fspl, 0.003);
    addNum('Friis', i, `Friis[${i}] Pr`,   {pt_dBm: pt, gt_dBi: gt, gr_dBi: gr, d_m: d, f_GHz: f}, pt + gt + gr - fspl, 0.003);
  }
}

// ── 7. AttenuatorDesign ───────────────────────────────────────────────────────
function runAttenuator(rng) {
  for (let i = 0; i < N; i++) {
    const topo  = rng.pick(['pi', 't']);
    const atten = rng.range(1, 40);
    const z0    = rng.range(25, 200);
    const K   = Math.pow(10, atten / 20);
    const expR1 = topo === 'pi' ? z0 * (K + 1) / (K - 1)    : z0 * (K - 1) / (K + 1);
    const expR2 = topo === 'pi' ? z0 * (K * K - 1) / (2 * K) : 2 * z0 * K / (K * K - 1);
    addNum('AttenuatorDesign', i, `Att[${i}] ${topo} R1`, {topo, atten_dB: atten, z0_ohm: z0}, expR1, 0.01);
    addNum('AttenuatorDesign', i, `Att[${i}] ${topo} R2`, {topo, atten_dB: atten, z0_ohm: z0}, expR2, 0.01);
  }
}

// ── 8. SkinDepth ──────────────────────────────────────────────────────────────
function runSkinDepth(rng) {
  const MU0 = 4 * Math.PI * 1e-7;
  for (let i = 0; i < N; i++) {
    const f_mhz = rng.range(1, 10000);
    const mat   = rng.pick(['5.8e7', '6.3e7', '4.1e7', '3.77e7']);
    const sigma  = parseFloat(mat);
    const expUm  = Math.sqrt(2 / (2 * Math.PI * f_mhz * 1e6 * MU0 * sigma)) * 1e6;
    addNum('SkinDepth', i, `SD[${i}]`, {f_MHz: f_mhz, sigma_S_m: sigma}, expUm, 0.01);
  }
}

// ── 9. Coaxial ───────────────────────────────────────────────────────────────
function runCoaxial(rng) {
  for (let i = 0; i < N; i++) {
    const d  = rng.range(0.5, 5);
    const D  = d + rng.range(1, 15);
    const er = rng.range(1, 5);
    addNum('Coaxial', i, `Coax[${i}] Z0`, {d_mm: d, D_mm: D, er}, (60 / Math.sqrt(er)) * Math.log(D / d), 0.003);
  }
}

// ── 10. LC Resonance ─────────────────────────────────────────────────────────
function runLC(rng) {
  for (let i = 0; i < N; i++) {
    const mode = rng.pick(['C', 'L', 'f']);
    const inputs = {mode};
    if (mode === 'C') {
      inputs.L_uH  = rng.range(1, 1000);
      inputs.f_MHz = rng.range(10, 3000);
    } else if (mode === 'L') {
      inputs.C_pF  = rng.range(1, 10000);
      inputs.f_MHz = rng.range(10, 3000);
    } else {
      inputs.L_uH = rng.range(1, 1000);
      inputs.C_pF = rng.range(1, 10000);
    }
    // custom check: result contains 'Hz' or 'H' or 'F'
    addPres('LC', i, `LC[${i}] solve${mode}`, inputs, 'Hz|H|F');
  }
}

// ── 11. BandpassCalc ─────────────────────────────────────────────────────────
function runBandpass(rng) {
  for (let i = 0; i < N; i++) {
    const L   = rng.range(1, 10000);    // nH
    const C   = rng.range(0.1, 10000);  // pF
    const R   = rng.range(1, 10000);
    const cfg = rng.pick(['series', 'parallel']);
    const w0   = 1 / Math.sqrt(L * 1e-9 * C * 1e-12);
    const expQ = cfg === 'series' ? (w0 * L * 1e-9 / R) : (R / (w0 * L * 1e-9));
    addNum('BandpassCalc',  i, `BP[${i}] ${cfg} Q`, {L_nH: L, C_pF: C, R_ohm: R, cfg}, expQ, 0.05);
    addPres('BandpassCalc', i, `BP[${i}] f0`,        {L_nH: L, C_pF: C, R_ohm: R, cfg}, 'Hz');
  }
}

// ── 12. FilterDesign ─────────────────────────────────────────────────────────
function runFilterDesign(rng) {
  for (let i = 0; i < N; i++) {
    const ftype  = rng.pick(['lp', 'hp']);
    const resp   = rng.pick(['butter', 'cheby']);
    const n      = rng.irange(2, 7);
    const fc     = rng.range(10, 5000);
    const r0     = rng.range(10, 500);
    const inputs = {ftype, resp, n, fc_MHz: fc, r0_ohm: r0};
    if (resp === 'cheby') inputs.ripple_dB = rng.range(0.1, 3);
    addPres('FilterDesign', i, `FD[${i}] H`, inputs, 'H');
    addPres('FilterDesign', i, `FD[${i}] F`, inputs, 'F');
  }
}

// ── 13. SteppedImpedanceLPF ──────────────────────────────────────────────────
function runSILPF(rng) {
  for (let i = 0; i < N; i++) {
    const n  = rng.irange(3, 9);
    const z0 = rng.range(20, 80);
    const zh = z0 + rng.range(10, 120);
    const zl = rng.range(5, z0 - 5);
    const fc = rng.range(100, 10000);
    const er = rng.range(1, 10);
    addPres('SteppedImpedanceLPF', i, `SILPF[${i}]`, {n, z0_ohm: z0, zh_ohm: zh, zl_ohm: zl, fc_MHz: fc, er}, 'mm');
  }
}

// ── 14. Microstrip W→Z (50) + Z→W (50) ──────────────────────────────────────
function runMicrostrip(rng) {
  for (let i = 0; i < 50; i++) {
    const er = rng.range(1.5, 15);
    const h  = rng.range(0.1, 5);
    const w  = rng.range(0.05, 10);
    addPres('Microstrip', i, `MS_W2Z[${i}]`, {er, h_mm: h, w_mm: w}, 'Ω');
  }
  for (let i = 0; i < 50; i++) {
    const z0  = rng.range(20, 150);
    const h2  = rng.range(0.1, 5);
    const er2 = rng.range(1.5, 15);
    addPres('Microstrip', 50 + i, `MS_Z2W[${i}]`, {z0_ohm: z0, h_mm: h2, er: er2}, 'mm');
  }
}

// ── 15. Stripline ─────────────────────────────────────────────────────────────
function runStripline(rng) {
  for (let i = 0; i < N; i++) {
    const b  = rng.range(0.5, 5);
    const w  = rng.range(0.05, b - 0.05);
    const er = rng.range(1.5, 10);
    const t  = rng.range(0.01, 0.15);
    addPres('Stripline', i, `SL[${i}]`, {er, b_mm: b, t_mm: t, w_mm: w}, 'Ω');
  }
}

// ── 16. CPW ───────────────────────────────────────────────────────────────────
function runCPW(rng) {
  for (let i = 0; i < N; i++) {
    const er = rng.range(1.5, 12);
    const h  = rng.range(0.1, 5);
    const w  = rng.range(0.1, 5);
    const s  = rng.range(0.05, 2);
    addPres('CPW', i, `CPW[${i}]`, {er, h_mm: h, w_mm: w, s_mm: s}, 'Ω');
  }
}

// ── 17. CoupledResonators ────────────────────────────────────────────────────
function runCoupledResonators(rng) {
  for (let i = 0; i < N; i++) {
    const L  = rng.range(1, 10000);
    const Mf = rng.range(0.01, 0.3);   // M = L * Mf
    const C  = rng.range(0.1, 10000);
    const R  = rng.range(1, 1000);
    addPres('CoupledResonators', i, `CR[${i}]`, {L_nH: L, M_nH: L * Mf, C_pF: C, R_ohm: R}, 'Hz');
  }
}

// ── 18. LCBalun ───────────────────────────────────────────────────────────────
function runLCBalun(rng) {
  for (let i = 0; i < N; i++) {
    const f    = rng.range(10, 5000);
    const topo = rng.pick(['lattice', 'pi']);
    const zu   = rng.range(20, 200);
    const zb   = rng.range(20, 1000);
    addPres('LCBalun', i, `LCBalun[${i}]`, {f_MHz: f, topo, zu_ohm: zu, zb_ohm: zb}, 'H');
  }
}

// ── 19. LNetwork ─────────────────────────────────────────────────────────────
function runLNetwork(rng) {
  for (let i = 0; i < N; i++) {
    const r1 = rng.range(10, 1000);
    const r2 = rng.range(10, 1000);
    const rs = Math.max(r1, r2), rl = Math.min(r1, r2);
    if (rs === rl) continue;   // consume f rng only when not skipping
    const f = rng.range(0.1, 10);  // GHz  (not consumed if rs===rl — vanishingly rare)
    addNum('LNetwork', i, `LNet[${i}] Q`, {rs_ohm: rs, rl_ohm: rl, f_GHz: f}, Math.sqrt(rs / rl - 1), 0.005);
  }
}

// ── 20. PiTNetwork ───────────────────────────────────────────────────────────
function runPiT(rng) {
  for (let i = 0; i < N; i++) {
    const r1   = rng.range(10, 1000);
    const r2   = rng.range(10, 1000);
    const q    = rng.range(1, 20);
    const f    = rng.range(1, 5000);
    const topo = rng.pick(['pi-lp', 'pi-hp', 't-lp', 't-hp']);
    addPres('PiTNetwork', i, `PiT[${i}]`, {r1_ohm: r1, r2_ohm: r2, Q: q, f_MHz: f, topo}, 'H');
  }
}

// ── 21. ImpedanceMatchingNetwork ─────────────────────────────────────────────
function runIMN(rng) {
  for (let i = 0; i < N; i++) {
    const rs = rng.range(10, 500);
    const rl = rng.range(10, 500);
    const f  = rng.range(1, 5000);
    addPres('ImpedanceMatchingNetwork', i, `IMN[${i}]`, {rs_ohm: rs, rl_ohm: rl, xs: 0, xl: 0, f_MHz: f}, 'Solution');
  }
}

// ── 22. Coupler ───────────────────────────────────────────────────────────────
function runCoupler(rng) {
  for (let i = 0; i < N; i++) {
    const ctype  = rng.pick(['coupled', 'branch']);
    const f      = rng.range(0.5, 20);   // GHz
    const z0     = rng.range(20, 150);
    const inputs = {ctype, f_GHz: f, z0_ohm: z0};
    if (ctype === 'coupled') inputs.C_dB = rng.range(5, 30);
    addPres('Coupler', i, `Coup[${i}]`, inputs, 'Ω');
  }
}

// ── 23. Wilkinson ────────────────────────────────────────────────────────────
function runWilkinson(rng) {
  for (let i = 0; i < N; i++) {
    const z0 = rng.range(20, 200);
    const f  = rng.range(0.1, 20);   // inline in audit3: fill '#wk-f' uses rng call
    const er = rng.range(1, 10);
    addNum('Wilkinson', i, `Wilk[${i}] Z1`, {z0_ohm: z0, f_GHz: f, er}, z0 * Math.SQRT2, 0.003);
  }
}

// ── 24. PowerCombiner ────────────────────────────────────────────────────────
function runPowerCombiner(rng) {
  for (let i = 0; i < N; i++) {
    const n   = rng.irange(2, 16);
    const eta = rng.range(0.5, 1.0);
    const p   = rng.range(-10, 40);   // inline in audit3 fill call
    addNum('PowerCombiner', i, `PC[${i}] N=${n}`, {n, eta, p_dBm: p}, 10 * Math.log10(n * eta), 0.02, 0.1);
  }
}

// ── 25. StubCalc ─────────────────────────────────────────────────────────────
function runStubCalc(rng) {
  for (let i = 0; i < N; i++) {
    const stype = rng.pick(['open', 'short']);
    const f     = rng.range(0.1, 20);
    const z0    = rng.range(20, 200);
    const B_mS  = rng.range(-100, 100);
    if (Math.abs(B_mS) < 0.001) continue;
    const inputs = {stype, f_GHz: f, z0_ohm: z0, B_mS};
    addPres('StubCalc', i, `Stub[${i}] mm`, inputs, 'mm');
    const Y0 = 1 / z0, B = B_mS * 1e-3;
    let betaL = stype === 'short' ? Math.atan2(Y0, B) : Math.atan2(-Y0, B);
    if (betaL < 0) betaL += Math.PI;
    addNum('StubCalc', i, `Stub[${i}] el°`, inputs, betaL * 180 / Math.PI, 0.002);
  }
}

// ── 26. AmpStability ─────────────────────────────────────────────────────────
function runAmpStability(rng) {
  for (let i = 0; i < N; i++) {
    const s11m = rng.range(0.05, 0.95);
    const s11a = rng.range(-180, 180);
    const s12m = rng.range(0.005, 0.5);
    const s12a = rng.range(-180, 180);
    const s21m = rng.range(0.5, 10);
    const s21a = rng.range(-180, 180);
    const s22m = rng.range(0.05, 0.95);
    const s22a = rng.range(-180, 180);
    addPres('AmpStability', i, `AmpStab[${i}]`,
      {s11m, s11a_deg: s11a, s12m, s12a_deg: s12a, s21m, s21a_deg: s21a, s22m, s22a_deg: s22a}, 'K');
  }
}

// ── 27. NoiseFigure ──────────────────────────────────────────────────────────
// Stage count fixed at 3; DOM elements filled in order nf0,nf1,nf2,g0,g1,g2
function runNF(rng) {
  for (let i = 0; i < N; i++) {
    const nf = [rng.range(1, 15), rng.range(1, 15), rng.range(1, 15)];
    const g  = [rng.range(-10, 25), rng.range(-10, 25), rng.range(-10, 25)];
    addPres('NoiseFigure', i, `NF[${i}] dB`,
      {nf1_dB: nf[0], nf2_dB: nf[1], nf3_dB: nf[2], g1_dB: g[0], g2_dB: g[1], g3_dB: g[2]}, 'dB');
  }
}

// ── 28. IP3Calc ───────────────────────────────────────────────────────────────
function runIP3(rng) {
  for (let i = 0; i < N; i++) {
    const pin  = rng.range(-60, 0);
    const gain = rng.range(-20, 40);
    const iip3 = rng.range(-20, 50);
    addNum('IP3Calc', i, `IP3[${i}] OIP3`, {pin_dBm: pin, gain_dB: gain, iip3_dBm: iip3}, iip3 + gain, 0.005, 0.1);
    addNum('IP3Calc', i, `IP3[${i}] Pout`, {pin_dBm: pin, gain_dB: gain, iip3_dBm: iip3}, pin + gain,  0.005, 0.1);
  }
}

// ── 29. LinkBudget ───────────────────────────────────────────────────────────
function runLinkBudget(rng) {
  for (let i = 0; i < N; i++) {
    const pt    = rng.range(10, 43);
    const gt    = rng.range(0, 20);
    const ltx   = rng.range(0, 5);
    const d     = rng.range(100, 50000);
    const f     = rng.range(0.1, 10);
    const gr    = rng.range(0, 25);
    const lrx   = rng.range(0, 5);
    const nf    = rng.range(1, 15);
    const bw    = rng.range(0.1, 100);
    const snr   = rng.range(5, 30);
    const lmisc = rng.range(0, 10);
    addPres('LinkBudget', i, `LB[${i}] dBm`,
      {pt_dBm: pt, gt_dBi: gt, ltx_dB: ltx, d_m: d, f_GHz: f, gr_dBi: gr, lrx_dB: lrx, nf_dB: nf, bw_MHz: bw, snr_dB: snr, lmisc_dB: lmisc}, 'dBm');
  }
}

// ── 30. RadarRange ───────────────────────────────────────────────────────────
function runRadarRange(rng) {
  for (let i = 0; i < N; i++) {
    const pt    = rng.range(40, 80);
    const gt    = rng.range(10, 40);
    const gr    = rng.range(10, 40);
    const f     = rng.range(1, 35);
    const sigma = rng.range(0.001, 100);
    const pmin  = rng.range(-120, -80);
    addPres('RadarRange', i, `RR[${i}] m`,
      {pt_dBW: pt, gt_dBi: gt, gr_dBi: gr, f_GHz: f, sigma_m2: sigma, pmin_dBm: pmin}, 'm');
  }
}

// ── 31. TwoPortConverter ─────────────────────────────────────────────────────
function runTwoPort(rng) {
  for (let i = 0; i < N; i++) {
    const s11r = rng.range(-1, 1), s11i = rng.range(-1, 1);
    const s12r = rng.range(-1, 1), s12i = rng.range(-1, 1);
    const s21r = rng.range(-1, 1), s21i = rng.range(-1, 1);
    const s22r = rng.range(-1, 1), s22i = rng.range(-1, 1);
    addPres('TwoPortConverter', i, `TP[${i}] ABCD`,
      {s11r, s11i, s12r, s12i, s21r, s21i, s22r, s22i}, 'ABCD');
  }
}

// ── 32. PLLFilter ────────────────────────────────────────────────────────────
function runPLL(rng) {
  for (let i = 0; i < N; i++) {
    const kd = rng.range(0.5e-3, 20e-3);
    const ko = rng.range(1, 500);
    const n  = rng.irange(10, 10000);
    const bw = rng.range(1, 500);
    const pm = rng.range(30, 85);
    addPres('PLLFilter', i, `PLL[${i}] Ω`, {kd_A_rad: kd, ko_MHz_V: ko, N: n, bw_kHz: bw, pm_deg: pm}, 'Ω');
    addPres('PLLFilter', i, `PLL[${i}] F`, {kd_A_rad: kd, ko_MHz_V: ko, N: n, bw_kHz: bw, pm_deg: pm}, 'F');
  }
}

// ── 33. PhaseNoiseJitter ─────────────────────────────────────────────────────
function runPhaseNoise(rng) {
  for (let i = 0; i < N; i++) {
    const fc        = rng.range(0.1, 10);
    const fcu       = rng.pick(['1e6', '1e9']);
    const baseLevel = rng.range(-160, -60);
    const levels    = [];
    for (let j = 0; j < 5; j++) levels.push(baseLevel + j * rng.range(5, 25));
    addPres('PhaseNoiseJitter', i, `PN[${i}] ps`,
      {fc, fc_unit: fcu, l0: levels[0], l1: levels[1], l2: levels[2], l3: levels[3], l4: levels[4]}, 'ps');
  }
}

// ── 34. PhasedArrayDecoupling ─────────────────────────────────────────────────
function runPAD(rng) {
  for (let i = 0; i < N; i++) {
    const r  = rng.range(30, 150);
    const d  = rng.range(50, 300);
    const f  = rng.range(64, 600);
    const z0 = rng.range(20, 100);
    const zp = rng.range(0.5, 20);
    addPres('PhasedArrayDecoupling', i, `PAD[${i}] dB`,
      {r_mm: r, d_mm: d, f_MHz: f, z0_ohm: z0, zp_ohm: zp}, 'dB');
  }
}

// ── 35. SAREstimator ─────────────────────────────────────────────────────────
function runSAR(rng) {
  const tissues = {muscle:{s:0.77,r:1050}, brain:{s:0.59,r:1040}, fat:{s:0.044,r:920}, blood:{s:1.24,r:1060}};
  for (let i = 0; i < N; i++) {
    const tissue = rng.pick(['muscle', 'brain', 'fat', 'blood']);
    const B1     = rng.range(1, 30);
    const f      = rng.range(64, 600);
    const dc     = rng.range(0.1, 1.0);
    const {s: sigma, r: rho} = tissues[tissue];
    const w   = 2 * Math.PI * f * 1e6;
    const E   = w * (B1 * 1e-6) * 0.10 / 2;
    const exp = sigma * E * E / (2 * rho);
    addNum('SAREstimator', i, `SAR[${i}] peak`, {tissue, B1_uT: B1, f_MHz: f, duty_cycle: dc}, exp, 0.02);
  }
}

// ── 36. Waveguide ─────────────────────────────────────────────────────────────
function runWaveguide(rng) {
  for (let i = 0; i < N; i++) {
    const a  = rng.range(5, 80);
    const b  = rng.range(a * 0.3, a * 0.55);
    const fc = 150 / a;
    const f  = fc * rng.range(1.1, 3);
    const er = rng.range(1, 5);
    addPres('Waveguide', i, `WG[${i}] GHz`, {a_mm: a, b_mm: b, f_GHz: f, er}, 'GHz');
  }
}

// ── 37. CircularWaveguide ─────────────────────────────────────────────────────
function runCircularWG(rng) {
  for (let i = 0; i < N; i++) {
    const a_mm   = rng.range(3, 50);
    const fc_ghz = 1.8412 * 30 / (Math.PI * a_mm);
    const f_ghz  = fc_ghz * rng.range(1.1, 3);
    const er     = rng.range(1, 4);
    addPres('CircularWaveguide', i, `CWG[${i}] GHz`, {a_mm, f_GHz: f_ghz, er}, 'GHz');
  }
}

// ── 38. PatchAntenna ─────────────────────────────────────────────────────────
function runPatchAntenna(rng) {
  for (let i = 0; i < N; i++) {
    const er = rng.range(2, 12);
    const h  = rng.range(0.5, 5);
    const f  = rng.range(0.5, 20);
    addPres('PatchAntenna', i, `PA[${i}] W`, {er, h_mm: h, f_GHz: f}, 'mm');
    addPres('PatchAntenna', i, `PA[${i}] L`, {er, h_mm: h, f_GHz: f}, 'mm');
  }
}

// ── 39. Dipole ───────────────────────────────────────────────────────────────
function runDipole(rng) {
  for (let i = 0; i < N; i++) {
    const f = rng.range(10, 10000);  // MHz
    addPres('Dipole', i, `Dipole[${i}] mm`, {f_MHz: f}, 'mm');
  }
}

// ── 40. HelicalAntenna ───────────────────────────────────────────────────────
function runHelical(rng) {
  for (let i = 0; i < N; i++) {
    const f = rng.range(0.1, 10);  // GHz
    const n = rng.irange(3, 20);
    addPres('HelicalAntenna', i, `Helix[${i}] mm`, {f_GHz: f, n_turns: n}, 'mm');
  }
}

// ── 41. YagiAntenna ──────────────────────────────────────────────────────────
function runYagi(rng) {
  for (let i = 0; i < N; i++) {
    const f    = rng.range(50, 2400);   // MHz
    const n    = rng.irange(2, 9);
    const diam = rng.range(1, 20);      // mm
    addPres('YagiAntenna', i, `Yagi[${i}] dBi`, {f_MHz: f, n_elements: n, diam_mm: diam}, 'dBi');
  }
}

// ── 42. BirdcageCoil ─────────────────────────────────────────────────────────
function runBirdcage(rng) {
  for (let i = 0; i < N; i++) {
    const n = rng.irange(2, 16) * 2;   // always even
    const r = rng.range(5, 50);
    const l = rng.range(5, 100);
    const f = rng.range(64, 600);
    addPres('BirdcageCoil', i, `BC[${i}] pF`, {n_rungs: n, r_cm: r, l_cm: l, f_MHz: f}, 'pF');
  }
}

// ── 43. ESeries ──────────────────────────────────────────────────────────────
function runESeries(rng) {
  for (let i = 0; i < N; i++) {
    const val    = rng.range(1, 10e6);
    const series = rng.pick(['E6', 'E12', 'E24', 'E48', 'E96']);
    addPres('ESeries', i, `ES[${i}] Ω`, {target: val, series}, 'Ω');
  }
}

// ── 44. BondWireVia ──────────────────────────────────────────────────────────
function runBondWire(rng) {
  for (let i = 0; i < N; i++) {
    const l = rng.range(0.3, 10);
    const d = rng.range(0.01, 0.2);
    const h = rng.range(0.05, 0.5);
    addNum('BondWireVia', i, `BW[${i}] L`, {l_mm: l, d_mm: d, h_mm: h},
      0.2 * l * (Math.log(2 * l / d) - 0.75), 0.02);
  }
}

// ── 45. DiffPair ─────────────────────────────────────────────────────────────
function runDiffPair(rng) {
  for (let i = 0; i < N; i++) {
    const er = rng.range(2, 12);
    const h  = rng.range(0.1, 5);
    const w  = rng.range(0.05, 3);
    const s  = rng.range(0.05, 3);
    const t  = rng.range(0.01, 0.2);
    addPres('DiffPair', i, `DP[${i}] Ω`, {er, h_mm: h, w_mm: w, s_mm: s, t_mm: t}, 'Ω');
  }
}

// ── 46. SmithChart ───────────────────────────────────────────────────────────
function runSmithChart(rng) {
  const Z0 = 50;
  for (let i = 0; i < N; i++) {
    const R = rng.range(1, 500);
    const X = rng.range(-300, 300);
    const mag2  = ((R - Z0) ** 2 + X * X) / ((R + Z0) ** 2 + X * X);
    const expRL = -20 * Math.log10(Math.sqrt(mag2));
    addNum('SmithChart', i, `SC[${i}] RL`, {R_ohm: R, X_ohm: X, Z0: Z0}, expRL, 0.003);
  }
}

// ── 47. TLLoss ───────────────────────────────────────────────────────────────
function runTLLoss(rng) {
  // 50 coax numeric checks
  for (let i = 0; i < 50; i++) {
    const er  = rng.range(1, 4);
    const d   = rng.range(0.5, 3);
    const D   = d + rng.range(1, 10);
    const f   = rng.range(0.1, 10);
    const len = rng.range(1, 100);
    const expZ0 = 138 / Math.sqrt(er) * Math.log10(D / d);
    addNum('TLLoss', i, `TL[${i}] coax Z0`, {type: 'coax', er, d_mm: d, D_mm: D, f_GHz: f, len_cm: len}, expZ0, 0.005);
  }
  // 50 microstrip presence checks
  for (let i = 0; i < 50; i++) {
    const f   = rng.range(0.1, 10);
    const len = rng.range(1, 100);
    const er  = rng.range(2, 12);
    const w   = rng.range(0.1, 5);
    const h   = rng.range(0.1, 3);
    addPres('TLLoss', 50 + i, `TL_ms[${i}] dB`, {type: 'mstrip', f_GHz: f, len_cm: len, er, w_mm: w, h_mm: h}, 'dB');
  }
}

// ── 48. SParamPlotter / 49. ArrayFactor — visual smoke-only ─────────────────
function runVisual(calc, needle) {
  addPres(calc, 0, `${calc} loaded`, {}, needle);
}

// ── 50. SpiceSim ─────────────────────────────────────────────────────────────
function runSpiceSim(rng) {
  const presets = ['rc_lpf','rlc_series','lc_tank','rl_lpf','pi_filter','dc_divider','rc_tran','rlc_tran'];
  for (let i = 0; i < N; i++) {
    const preset = rng.pick(presets);
    addPres('SpiceSim', i, `Spice[${i}] ${preset}`, {preset}, 'complete');
  }
}

// ── 51. RFSimulator ──────────────────────────────────────────────────────────
function runRFSim(rng) {
  const presets = ['lpf3', 'hpf3', 'bpf', 'lmatch', 'qw', 'stub'];
  for (let i = 0; i < N; i++) {
    const preset = rng.pick(presets);
    addPres('RFSimulator', i, `RFSim[${i}] ${preset}`, {preset}, 'dB');
  }
}

// ── 52. SurfaceCoilDesigner ──────────────────────────────────────────────────
function runSurfaceCoil(rng) {
  const MU0 = 4 * Math.PI * 1e-7;
  for (let i = 0; i < N; i++) {
    const D_mm = rng.range(20, 200);
    const d_mm = rng.range(0.5, Math.min(D_mm * 0.2, 8));
    const f    = rng.range(10, 500);
    const h    = rng.range(0, 50);
    const r = D_mm * 0.5e-3, a = d_mm * 0.5e-3;
    const expL = MU0 * r * (Math.log(8 * r / a) - 2);
    addNum('SurfaceCoilDesigner', i, `SCD[${i}] L`,
      {D_mm, d_mm, f_MHz: f, h_mm: h, sample: 'muscle'}, expL, 0.003);
  }
}

// ── 53. CapacitorNetwork ─────────────────────────────────────────────────────
function runCapNetwork(rng) {
  for (let i = 0; i < N; i++) {
    const n    = rng.irange(2, 4);
    const mode = rng.pick(['series', 'parallel']);
    const caps = Array.from({length: n}, () => rng.range(1, 10000));  // pF
    const expPF = mode === 'parallel'
      ? caps.reduce((s, c) => s + c, 0)
      : 1 / caps.reduce((s, c) => s + 1 / c, 0);
    const inputs = {n, mode};
    caps.forEach((c, j) => { inputs[`C${j + 1}_pF`] = c; });
    addNum('CapacitorNetwork', i, `Cap[${i}] ${mode} n=${n}`, inputs, expPF * 1e-12, 0.002);
  }
}

// ── 54. CoilDesigner ─────────────────────────────────────────────────────────
function runCoilDesigner(rng) {
  const MU0 = 4 * Math.PI * 1e-7;
  for (let i = 0; i < N; i++) {
    const D_mm = rng.range(20, 300);
    const d_mm = rng.range(0.3, Math.min(D_mm * 0.15, 5));
    const f    = rng.range(10, 500);
    const DSI = D_mm * 1e-3, dSI = d_mm * 1e-3;
    const expL = MU0 * (DSI / 2) * (Math.log(8 * DSI / dSI) - 2);
    addNum('CoilDesigner', i, `CD[${i}] L`, {D_mm, d_mm, f_MHz: f}, expL, 0.003);
  }
}

// ── 55. CLI ──────────────────────────────────────────────────────────────────
function runCLI(rng) {
  const MU0 = 4 * Math.PI * 1e-7;
  for (let i = 0; i < N; i++) {
    const D_mm = rng.range(20, 500);
    const d_mm = rng.range(0.3, Math.min(D_mm * 0.15, 10));
    const DSI = D_mm * 1e-3, dSI = d_mm * 1e-3;
    const expL = MU0 * (DSI / 2) * (Math.log(8 * DSI / dSI) - 2);
    addNum('CLI', i, `CLI[${i}] L`, {D_mm, d_mm}, expL, 0.003);
  }
}

// ─── Run in same order as audit3.js ──────────────────────────────────────────
const rng = new RNG(0xDEADBEEF);
runDbm(rng);
runVswr(rng);
runWavelength(rng);
runFreqEnergy(rng);
runQuarterWave(rng);
runFriis(rng);
runAttenuator(rng);
runSkinDepth(rng);
runCoaxial(rng);
runLC(rng);
runBandpass(rng);
runFilterDesign(rng);
runSILPF(rng);
runMicrostrip(rng);
runStripline(rng);
runCPW(rng);
runCoupledResonators(rng);
runLCBalun(rng);
runLNetwork(rng);
runPiT(rng);
runIMN(rng);
runCoupler(rng);
runWilkinson(rng);
runPowerCombiner(rng);
runStubCalc(rng);
runAmpStability(rng);
runNF(rng);
runIP3(rng);
runLinkBudget(rng);
runRadarRange(rng);
runTwoPort(rng);
runPLL(rng);
runPhaseNoise(rng);
runPAD(rng);
runSAR(rng);
runWaveguide(rng);
runCircularWG(rng);
runPatchAntenna(rng);
runDipole(rng);
runHelical(rng);
runYagi(rng);
runBirdcage(rng);
runESeries(rng);
runBondWire(rng);
runDiffPair(rng);
runSmithChart(rng);
runTLLoss(rng);
runVisual('SParamPlotter', 'Touchstone');
runVisual('ArrayFactor', 'Array');
runSpiceSim(rng);
runRFSim(rng);
runSurfaceCoil(rng);
runCapNetwork(rng);
runCoilDesigner(rng);
runCLI(rng);

// ─── Write CSV ───────────────────────────────────────────────────────────────
function csvCell(s) {
  s = String(s);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const header = '#,Calculator,Iter,CheckName,Type,Inputs,Expected,Tolerance';
const body   = rows.map((r, idx) => [idx + 1, ...r].map(csvCell).join(',')).join('\n');
fs.writeFileSync('check-values.csv', header + '\n' + body + '\n');
console.log(`Wrote ${rows.length} rows to check-values.csv`);
