/* ═══════════════════════════════════════════════════════════════════════════
   RF Toolbox — Browser SPICE Engine
   Modified Nodal Analysis (MNA) for DC, AC, and TRAN analysis.
   Supports: R, L, C, V (voltage source), I (current source)
   Analyses:  .OP, .DC sweep, .AC (LIN/DEC), .TRAN
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Complex number library ────────────────────────────────────────────────────
var J = {
    c:    function(re,im){ return [re||0, im||0]; },
    add:  function(a,b){ return [a[0]+b[0], a[1]+b[1]]; },
    sub:  function(a,b){ return [a[0]-b[0], a[1]-b[1]]; },
    mul:  function(a,b){ return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; },
    div:  function(a,b){ var d=b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]; },
    mag:  function(a){ return Math.sqrt(a[0]*a[0]+a[1]*a[1]); },
    phase:function(a){ return Math.atan2(a[1],a[0])*180/Math.PI; },
    inv:  function(a){ var d=a[0]*a[0]+a[1]*a[1]; return [a[0]/d,-a[1]/d]; },
    neg:  function(a){ return [-a[0],-a[1]]; },
    real: function(x){ return J.c(x,0); },
    imag: function(x){ return J.c(0,x); }
};

// ── Suffix parser ─────────────────────────────────────────────────────────────
function parseSuffix(s) {
    if (s === undefined || s === null) return NaN;
    s = String(s).trim().toLowerCase();
    var suffixes = {
        'f':1e-15,'p':1e-12,'n':1e-9,'u':1e-6,'m':1e-3,
        'k':1e3,'meg':1e6,'g':1e9,'t':1e12
    };
    // Try meg first (before m)
    var megM = s.match(/^([+-]?\d*\.?\d+(?:e[+-]?\d+)?)meg$/);
    if (megM) return parseFloat(megM[1]) * 1e6;
    for (var suf in suffixes) {
        if (suf === 'meg') continue;
        var re = new RegExp('^([+-]?\\d*\\.?\\d+(?:e[+-]?\\d+)?)'+suf+'$');
        var m  = s.match(re);
        if (m) return parseFloat(m[1]) * suffixes[suf];
    }
    var plain = parseFloat(s);
    return isNaN(plain) ? NaN : plain;
}

// ── Netlist parser ────────────────────────────────────────────────────────────
function parseNetlist(text) {
    var lines = text.split(/\r?\n/).map(function(l){ return l.trim(); });
    var title  = lines[0] || 'untitled';
    var elems  = [];   // {type, name, n1, n2, val, acval, acphase, extra}
    var analysis = null;
    var errors   = [];

    for (var i = 1; i < lines.length; i++) {
        var raw = lines[i];
        // Strip inline comments
        var ci = raw.indexOf(';');
        if (ci >= 0) raw = raw.slice(0,ci);
        ci = raw.indexOf('$');
        if (ci >= 0) raw = raw.slice(0,ci);
        var line = raw.trim();
        if (!line || line.charAt(0) === '*') continue;
        if (line.toUpperCase() === '.END') break;

        var toks = line.split(/\s+/);
        var t0   = toks[0].toUpperCase();

        if (t0.charAt(0) === '.') {
            // Analysis/control statement
            var cmd = t0.slice(1);
            if (cmd === 'AC') {
                // .AC DEC|LIN pts fstart fstop
                analysis = {
                    type:'AC',
                    scale: toks[1] ? toks[1].toUpperCase() : 'DEC',
                    pts:   parseInt(toks[2]) || 100,
                    fstart:parseSuffix(toks[3]),
                    fstop: parseSuffix(toks[4])
                };
            } else if (cmd === 'DC') {
                // .DC srcname start stop step
                analysis = {
                    type:'DC',
                    src:  toks[1] ? toks[1].toUpperCase() : '',
                    start:parseSuffix(toks[2]),
                    stop: parseSuffix(toks[3]),
                    step: parseSuffix(toks[4])
                };
            } else if (cmd === 'TRAN') {
                // .TRAN tstep tstop [tstart]
                analysis = {
                    type:'TRAN',
                    tstep:parseSuffix(toks[1]),
                    tstop:parseSuffix(toks[2]),
                    tstart:toks[3] ? parseSuffix(toks[3]) : 0
                };
            } else if (cmd === 'OP') {
                analysis = { type:'OP' };
            }
            continue;
        }

        var type = t0.charAt(0);
        if (!'RLCVI'.includes(type)) { errors.push('Unknown element: '+toks[0]); continue; }

        var elem = { type:type, name:toks[0].toUpperCase(), n1:toks[1], n2:toks[2] };

        if (type === 'V' || type === 'I') {
            // Parse: Vname n+ n- [DC val] [AC ampl [phase]]
            var dcVal = 0, acAmpl = 0, acPhase = 0;
            for (var k = 3; k < toks.length; k++) {
                var tok = toks[k].toUpperCase();
                if (tok === 'DC'  && toks[k+1]) { dcVal  = parseSuffix(toks[k+1]); k++; }
                if (tok === 'AC'  && toks[k+1]) { acAmpl = parseSuffix(toks[k+1]); k++;
                    if (toks[k+1] && !isNaN(parseSuffix(toks[k+1]))) { acPhase=parseSuffix(toks[k+1]); k++; } }
                // Plain value with no keyword
                if (tok !== 'DC' && tok !== 'AC' && k === 3) { dcVal = parseSuffix(toks[k]); }
            }
            // If just "Vname n+ n- val" with no keyword
            if (toks.length === 4 && !['DC','AC'].includes(toks[3].toUpperCase())) {
                dcVal = parseSuffix(toks[3]);
            }
            elem.dcval = dcVal; elem.acampl = acAmpl; elem.acphase = acPhase;
        } else {
            elem.val = parseSuffix(toks[3]);
            if (isNaN(elem.val)) { errors.push('Bad value for '+toks[0]+': '+toks[3]); }
        }
        elems.push(elem);
    }

    return { title:title, elems:elems, analysis:analysis, errors:errors };
}

// ── MNA stamp helpers ─────────────────────────────────────────────────────────
// nodeMap: node name → index (0 = ground, not in matrix)
// vcIdx: voltage source index → extra row/col index
function buildNodeMap(elems) {
    var nodes = {};
    elems.forEach(function(e) {
        if (e.n1 !== '0') nodes[e.n1] = true;
        if (e.n2 !== '0') nodes[e.n2] = true;
    });
    var nodeList = Object.keys(nodes).sort();
    var map = {};
    nodeList.forEach(function(n,i){ map[n] = i; });
    return { map:map, count:nodeList.length, list:nodeList };
}

// Allocate a dense complex matrix of size n×n
function zeros(n) {
    var m = [];
    for (var i=0;i<n;i++) { m[i]=[]; for(var j=0;j<n;j++) m[i][j]=J.c(0); }
    return m;
}

function zerosV(n) { var v=[]; for(var i=0;i<n;i++) v[i]=J.c(0); return v; }

// Stamp a conductance (admittance) between two nodes
function stampY(Y, ni, nj, val) {
    // val is a complex [re,im]
    if (ni >= 0) Y[ni][ni] = J.add(Y[ni][ni], val);
    if (nj >= 0) Y[nj][nj] = J.add(Y[nj][nj], val);
    if (ni >= 0 && nj >= 0) {
        Y[ni][nj] = J.sub(Y[ni][nj], val);
        Y[nj][ni] = J.sub(Y[nj][ni], val);
    }
}

// Stamp a voltage source (adds rows/cols)
function stampV(Y, RHS, ni, nj, vIdx, baseN, val) {
    var row = baseN + vIdx, col = baseN + vIdx;
    if (ni >= 0) { Y[ni][col] = J.add(Y[ni][col], J.c(1)); Y[row][ni] = J.add(Y[row][ni], J.c(1)); }
    if (nj >= 0) { Y[nj][col] = J.sub(Y[nj][col], J.c(1)); Y[row][nj] = J.sub(Y[row][nj], J.c(1)); }
    RHS[row] = J.add(RHS[row], val);
}

// ── Gaussian elimination with partial pivoting (complex) ──────────────────────
function solveComplex(A, b) {
    var n = b.length;
    // Augmented matrix
    var M = [];
    for (var i=0;i<n;i++) { M[i] = A[i].slice(); M[i].push(b[i]); }

    for (var col=0; col<n; col++) {
        // Find pivot
        var maxMag = 0, pivRow = col;
        for (var r=col; r<n; r++) {
            var mg = J.mag(M[r][col]);
            if (mg > maxMag) { maxMag=mg; pivRow=r; }
        }
        if (maxMag < 1e-30) return null; // singular

        // Swap rows
        var tmp = M[col]; M[col] = M[pivRow]; M[pivRow] = tmp;

        var inv = J.inv(M[col][col]);
        for (var row=col+1; row<n; row++) {
            var factor = J.mul(M[row][col], inv);
            for (var c2=col; c2<=n; c2++) {
                M[row][c2] = J.sub(M[row][c2], J.mul(factor, M[col][c2]));
            }
        }
    }

    // Back substitution
    var x = zerosV(n);
    for (var i2=n-1; i2>=0; i2--) {
        var s = M[i2][n];
        for (var j2=i2+1; j2<n; j2++) s = J.sub(s, J.mul(M[i2][j2], x[j2]));
        x[i2] = J.div(s, M[i2][i2]);
    }
    return x;
}

// ── Core MNA solver ───────────────────────────────────────────────────────────
// Returns node voltages + vsrc currents, or null on failure
// mode: 'dc' | complex frequency s=jω
function mnaStamp(elems, nodeMap, vsrcs, s, dcSweepVals) {
    var nNodes = nodeMap.count;
    var nV     = vsrcs.length;
    var N      = nNodes + nV;
    var Y      = zeros(N);
    var RHS    = zerosV(N);

    elems.forEach(function(e) {
        var ni = e.n1 === '0' ? -1 : nodeMap.map[e.n1];
        var nj = e.n2 === '0' ? -1 : nodeMap.map[e.n2];
        if (ni === undefined) ni = -1;
        if (nj === undefined) nj = -1;

        if (e.type === 'R') {
            if (!isNaN(e.val) && e.val !== 0) {
                stampY(Y, ni, nj, J.c(1/e.val, 0));
            }
        } else if (e.type === 'C') {
            if (!isNaN(e.val) && s) {
                // Y = sC
                var yc = J.mul(s, J.c(e.val, 0));
                stampY(Y, ni, nj, yc);
            }
        } else if (e.type === 'L') {
            if (!isNaN(e.val) && s) {
                // Y = 1/(sL)
                var yl = J.div(J.c(1,0), J.mul(s, J.c(e.val, 0)));
                stampY(Y, ni, nj, yl);
            } else if (!s) {
                // DC: inductor is short circuit → stamp as very small R
                stampY(Y, ni, nj, J.c(1e9, 0));
            }
        } else if (e.type === 'V') {
            var vIdx = vsrcs.indexOf(e.name);
            var dcV  = (dcSweepVals && dcSweepVals[e.name] !== undefined) ? dcSweepVals[e.name] : e.dcval;
            var val;
            if (s) {
                // AC: use AC amplitude and phase
                var acRe = e.acampl * Math.cos(e.acphase * Math.PI/180);
                var acIm = e.acampl * Math.sin(e.acphase * Math.PI/180);
                val = J.c(acRe, acIm);
                // Also add DC component for operating point
            } else {
                val = J.c(dcV, 0);
            }
            stampV(Y, RHS, ni, nj, vIdx, nNodes, val);
        } else if (e.type === 'I') {
            var iVal;
            if (s) {
                var iRe = e.acampl * Math.cos(e.acphase * Math.PI/180);
                var iIm = e.acampl * Math.sin(e.acphase * Math.PI/180);
                iVal = J.c(iRe, iIm);
            } else {
                var dcI = (dcSweepVals && dcSweepVals[e.name] !== undefined) ? dcSweepVals[e.name] : e.dcval;
                iVal = J.c(dcI, 0);
            }
            if (ni >= 0) RHS[ni] = J.add(RHS[ni], iVal);
            if (nj >= 0) RHS[nj] = J.sub(RHS[nj], iVal);
        }
    });

    return solveComplex(Y, RHS);
}

// ── Build frequency array ─────────────────────────────────────────────────────
function buildFreqs(an) {
    var freqs = [];
    if (an.scale === 'DEC') {
        var total = an.pts * Math.log10(an.fstop/an.fstart);
        var nPts  = Math.max(10, Math.round(total));
        for (var i=0; i<=nPts; i++) {
            freqs.push(Math.pow(10, Math.log10(an.fstart) + i/nPts * Math.log10(an.fstop/an.fstart)));
        }
    } else {
        var nPts2 = Math.max(10, an.pts);
        for (var j=0; j<=nPts2; j++) {
            freqs.push(an.fstart + j/nPts2 * (an.fstop - an.fstart));
        }
    }
    return freqs;
}

// ── Main simulation runner ────────────────────────────────────────────────────
var simResults = null;
var spiceChart = null, tranChart = null, dcChart = null;
var COLORS = ['#AA77FF','#00ccff','#ff6644','#00ffcc','#ffcc00','#ff44aa','#88dd00','#ff8800'];

function runSpice() {
    var text = document.getElementById('netlist-editor').value;
    clearLog();
    log('Parsing netlist...', 'info');

    var netlist = parseNetlist(text);
    netlist.errors.forEach(function(e){ log(e, 'err'); });

    if (!netlist.analysis) { log('No analysis statement found (.AC, .DC, .TRAN, .OP)', 'err'); return; }
    if (!netlist.elems.length) { log('No circuit elements found.', 'err'); return; }

    log('Circuit: '+netlist.title, 'info');
    log('Elements: '+netlist.elems.length+', Analysis: .'+netlist.analysis.type, 'info');

    var nm    = buildNodeMap(netlist.elems);
    var vsrcs = netlist.elems.filter(function(e){ return e.type==='V'; }).map(function(e){ return e.name; });

    log('Nodes: '+nm.list.join(', ')+'; VSources: '+vsrcs.join(', '), 'info');

    var an = netlist.analysis;
    simResults = null;

    // Hide all panels
    ['op-panel','plot-panel','tran-panel','dc-panel'].forEach(function(id){
        document.getElementById(id).style.display='none';
    });

    if (an.type === 'OP') {
        runOP(netlist, nm, vsrcs);
    } else if (an.type === 'AC') {
        runAC(netlist, nm, vsrcs, an);
    } else if (an.type === 'TRAN') {
        runTRAN(netlist, nm, vsrcs, an);
    } else if (an.type === 'DC') {
        runDC(netlist, nm, vsrcs, an);
    }
}

// ── .OP ───────────────────────────────────────────────────────────────────────
function runOP(netlist, nm, vsrcs) {
    var sol = mnaStamp(netlist.elems, nm, vsrcs, null, null);
    if (!sol) { log('Matrix singular — check circuit connectivity.', 'err'); return; }

    var html = '<tr><th>Node/Source</th><th>Value</th></tr>';
    nm.list.forEach(function(n,i){
        html += '<tr><td>V('+n+')</td><td>'+sol[i][0].toPrecision(6)+' V</td></tr>';
    });
    vsrcs.forEach(function(v,i){
        html += '<tr><td>I('+v+')</td><td>'+sol[nm.count+i][0].toPrecision(6)+' A</td></tr>';
    });
    document.getElementById('op-table').innerHTML = html;
    document.getElementById('op-panel').style.display='block';
    log('OP complete.', 'info');
}

// ── .AC ───────────────────────────────────────────────────────────────────────
function runAC(netlist, nm, vsrcs, an) {
    var freqs = buildFreqs(an);
    log('Running AC sweep: '+freqs.length+' points, '+fmtF(an.fstart)+' to '+fmtF(an.fstop), 'info');

    // Results keyed by node name
    var nodeData = {}; nm.list.forEach(function(n){ nodeData[n] = []; });
    var vsrcData = {}; vsrcs.forEach(function(v){ vsrcData[v] = []; });

    for (var fi=0; fi<freqs.length; fi++) {
        var w = 2*Math.PI*freqs[fi];
        var s = J.c(0, w);
        var sol = mnaStamp(netlist.elems, nm, vsrcs, s, null);
        if (!sol) { log('Singular at f='+fmtF(freqs[fi]), 'warn'); continue; }
        nm.list.forEach(function(n,i){ nodeData[n].push(sol[i]); });
        vsrcs.forEach(function(v,i){ vsrcData[v].push(sol[nm.count+i]); });
    }

    simResults = { type:'AC', freqs:freqs, nodeData:nodeData, vsrcData:vsrcData, an:an };
    buildACTraceCbs(nm.list, vsrcs);
    plotAC();
    log('AC analysis complete.', 'info');
}

function buildACTraceCbs(nodes, vsrcs) {
    var all = nodes.map(function(n){ return {id:'n_'+n, label:'V('+n+')'}; })
              .concat(vsrcs.map(function(v){ return {id:'v_'+v, label:'I('+v+')'}; }));
    var html = '';
    all.forEach(function(t,i){
        var checked = i < 4 ? 'checked' : '';
        html += '<label><input type="checkbox" id="tc_'+t.id+'" '+checked+' onchange="replot()"> '+t.label+'</label>';
    });
    document.getElementById('trace-checks').innerHTML = html;
    document.getElementById('plot-panel').style.display='block';
}

function replot() {
    if (!simResults) return;
    if (simResults.type==='AC')   plotAC();
    if (simResults.type==='TRAN') plotTRAN();
    if (simResults.type==='DC')   plotDC();
}

function getACValue(data, ytype) {
    return data.map(function(c){
        if (ytype==='mag_db')  return J.mag(c) > 0 ? 20*Math.log10(J.mag(c)) : -300;
        if (ytype==='mag_lin') return J.mag(c);
        if (ytype==='phase')   return J.phase(c);
        if (ytype==='real')    return c[0];
        if (ytype==='imag')    return c[1];
    });
}

function plotAC() {
    var res    = simResults;
    var ytype  = document.getElementById('plot-ytype').value;
    var xscale = document.getElementById('plot-xscale').value;
    var yLabels = {mag_db:'dB',mag_lin:'Linear',phase:'deg',real:'Re',imag:'Im'};

    var fMax = res.freqs[res.freqs.length-1];
    var fDiv = fMax>=1e9?1e9:fMax>=1e6?1e6:fMax>=1e3?1e3:1;
    var fUnit= fMax>=1e9?'GHz':fMax>=1e6?'MHz':fMax>=1e3?'kHz':'Hz';
    var fLabels = res.freqs.map(function(f){ return parseFloat((f/fDiv).toPrecision(4)); });

    var datasets = [];
    var ci = 0;
    Object.keys(res.nodeData).forEach(function(n){
        var cb = document.getElementById('tc_n_'+n);
        if (!cb || !cb.checked) return;
        datasets.push({
            label:'V('+n+')', data:getACValue(res.nodeData[n], ytype),
            borderColor:COLORS[ci++%COLORS.length], backgroundColor:'transparent',
            borderWidth:1.8, pointRadius:0, tension:0.1
        });
    });
    res.vsrcData && Object.keys(res.vsrcData).forEach(function(v){
        var cb = document.getElementById('tc_v_'+v);
        if (!cb || !cb.checked) return;
        datasets.push({
            label:'I('+v+')', data:getACValue(res.vsrcData[v], ytype),
            borderColor:COLORS[ci++%COLORS.length], backgroundColor:'transparent',
            borderWidth:1.8, pointRadius:0, tension:0.1
        });
    });

    if (spiceChart) spiceChart.destroy();
    spiceChart = new Chart(document.getElementById('spice-chart').getContext('2d'), {
        type:'line',
        data:{ labels:fLabels, datasets:datasets },
        options:{
            responsive:true, animation:false,
            interaction:{ mode:'index', intersect:false },
            plugins:{
                legend:{ labels:{ font:{family:'monospace',size:11}, color:'#333' }},
                tooltip:{ callbacks:{
                    title:function(items){ return fmtF(res.freqs[items[0].dataIndex]); },
                    label:function(i){ return i.dataset.label+': '+i.parsed.y.toFixed(4)+' '+yLabels[ytype]; }
                }}
            },
            scales:{
                x:{ type:xscale==='log'?'logarithmic':'linear',
                    title:{display:true,text:'Frequency ('+fUnit+')',font:{family:'monospace',size:11}},
                    ticks:{font:{family:'monospace',size:10},maxTicksLimit:10} },
                y:{ title:{display:true,text:yLabels[ytype],font:{family:'monospace',size:11}},
                    ticks:{font:{family:'monospace',size:10}} }
            }
        }
    });
}

// ── .TRAN ─────────────────────────────────────────────────────────────────────
// Backward Euler integration: L→R_eq+V_eq, C→R_eq+I_eq companion models
function runTRAN(netlist, nm, vsrcs, an) {
    var tstep = an.tstep, tstop = an.tstop;
    if (tstep <= 0 || tstop <= 0) { log('.TRAN: invalid tstep/tstop', 'err'); return; }
    var maxPts = 2000;
    var nSteps = Math.min(Math.ceil(tstop/tstep), maxPts);
    var dtAct  = tstop / nSteps;

    log('TRAN: '+nSteps+' steps, dt='+fmtT(dtAct), 'info');

    // State variables for L and C: { elemName: current value }
    var iL = {}, vC = {};
    netlist.elems.forEach(function(e){
        if (e.type==='L') iL[e.name] = 0;
        if (e.type==='C') vC[e.name] = 0;
    });

    var timeArr = [];
    var nodeHist = {}; nm.list.forEach(function(n){ nodeHist[n] = []; });
    var vsrcHist = {}; vsrcs.forEach(function(v){ vsrcHist[v] = []; });

    for (var step=0; step<=nSteps; step++) {
        var t = step * dtAct;
        timeArr.push(t);

        // Build companion-model augmented netlist
        var augElems = [];
        netlist.elems.forEach(function(e) {
            if (e.type === 'L') {
                // Backward Euler: V_L = L/dt*(i_L(t) - i_L(t-dt))
                // Companion: current source i_L(t-dt) + resistor L/dt
                var Req = e.val / dtAct;
                augElems.push({ type:'R', name:e.name+'_Leq', n1:e.n1, n2:e.n2, val:Req });
                // Current source for history (Norton)
                augElems.push({ type:'I', name:e.name+'_Lh', n1:e.n1, n2:e.n2, dcval:iL[e.name], acampl:0, acphase:0 });
            } else if (e.type === 'C') {
                // Backward Euler: i_C = C/dt*(v_C(t) - v_C(t-dt))
                // Companion: conductance C/dt + current source
                var Geq = e.val / dtAct;
                augElems.push({ type:'R', name:e.name+'_Ceq', n1:e.n1, n2:e.n2, val:1/Geq });
                var Ih = -Geq * vC[e.name];
                augElems.push({ type:'I', name:e.name+'_Ch', n1:e.n2, n2:e.n1, dcval:Ih, acampl:0, acphase:0 });
            } else {
                augElems.push(e);
            }
        });

        var augVsrcs = augElems.filter(function(e){ return e.type==='V'; }).map(function(e){ return e.name; });
        var augNm    = buildNodeMap(augElems);
        var sol      = mnaStamp(augElems, augNm, augVsrcs, null, null);
        if (!sol) { log('TRAN singular at t='+fmtT(t), 'warn'); break; }

        // Record node voltages
        nm.list.forEach(function(n){
            var augIdx = augNm.map[n];
            nodeHist[n].push(augIdx !== undefined ? sol[augIdx][0] : 0);
        });
        vsrcs.forEach(function(v){
            var augIdx = augVsrcs.indexOf(v);
            vsrcHist[v].push(augIdx >= 0 ? sol[augNm.count + augIdx][0] : 0);
        });

        // Update state: recover L currents and C voltages
        netlist.elems.forEach(function(e) {
            if (e.type === 'L') {
                var ni = augNm.map[e.n1], nj = augNm.map[e.n2];
                var vn1 = ni !== undefined ? sol[ni][0] : 0;
                var vn2 = nj !== undefined ? sol[nj][0] : 0;
                var vL  = vn1 - vn2;
                var Req = e.val / dtAct;
                iL[e.name] = vL / Req + iL[e.name];
            }
            if (e.type === 'C') {
                var ni2 = augNm.map[e.n1], nj2 = augNm.map[e.n2];
                var vn12 = ni2 !== undefined ? sol[ni2][0] : 0;
                var vn22 = nj2 !== undefined ? sol[nj2][0] : 0;
                vC[e.name] = vn12 - vn22;
            }
        });
    }

    simResults = { type:'TRAN', timeArr:timeArr, nodeHist:nodeHist, vsrcHist:vsrcHist };
    buildTRANTraceCbs(nm.list, vsrcs);
    plotTRAN();
    log('TRAN complete.', 'info');
}

function buildTRANTraceCbs(nodes, vsrcs) {
    var html = '';
    var ci = 0;
    nodes.forEach(function(n){
        var checked = ci < 4 ? 'checked' : '';
        html += '<label style="border-color:'+COLORS[ci%COLORS.length]+'"><input type="checkbox" id="tt_n_'+n+'" '+checked+' onchange="replot()"> V('+n+')</label>';
        ci++;
    });
    vsrcs.forEach(function(v){
        html += '<label style="border-color:'+COLORS[ci%COLORS.length]+'"><input type="checkbox" id="tt_v_'+v+'" onchange="replot()"> I('+v+')</label>';
        ci++;
    });
    document.getElementById('tran-checks').innerHTML = html;
    document.getElementById('tran-panel').style.display='block';
}

function plotTRAN() {
    var res = simResults;
    var tMax = res.timeArr[res.timeArr.length-1];
    var tDiv = tMax>=1?1:tMax>=1e-3?1e-3:tMax>=1e-6?1e-6:1e-9;
    var tUnit= tMax>=1?'s':tMax>=1e-3?'ms':tMax>=1e-6?'μs':'ns';
    var tLabels = res.timeArr.map(function(t){ return parseFloat((t/tDiv).toPrecision(4)); });
    var datasets = [];
    var ci = 0;
    Object.keys(res.nodeHist).forEach(function(n){
        var cb = document.getElementById('tt_n_'+n);
        if (!cb||!cb.checked) return;
        datasets.push({ label:'V('+n+')', data:res.nodeHist[n],
            borderColor:COLORS[ci++%COLORS.length], backgroundColor:'transparent',
            borderWidth:1.8, pointRadius:0, tension:0.1 });
    });
    Object.keys(res.vsrcHist).forEach(function(v){
        var cb = document.getElementById('tt_v_'+v);
        if (!cb||!cb.checked) return;
        datasets.push({ label:'I('+v+') A', data:res.vsrcHist[v],
            borderColor:COLORS[ci++%COLORS.length], backgroundColor:'transparent',
            borderWidth:1.8, pointRadius:0, tension:0.1 });
    });
    if (tranChart) tranChart.destroy();
    tranChart = new Chart(document.getElementById('tran-chart').getContext('2d'), {
        type:'line', data:{ labels:tLabels, datasets:datasets },
        options:{ responsive:true, animation:false,
            interaction:{ mode:'index', intersect:false },
            plugins:{ legend:{ labels:{ font:{family:'monospace',size:11}, color:'#333' }} },
            scales:{
                x:{ title:{display:true,text:'Time ('+tUnit+')',font:{family:'monospace',size:11}},
                    ticks:{font:{family:'monospace',size:10},maxTicksLimit:12} },
                y:{ title:{display:true,text:'Voltage (V)',font:{family:'monospace',size:11}},
                    ticks:{font:{family:'monospace',size:10}} }
            }
        }
    });
}

// ── .DC sweep ─────────────────────────────────────────────────────────────────
function runDC(netlist, nm, vsrcs, an) {
    var srcName = an.src.toUpperCase();
    var vals = [];
    var step = Math.abs(an.step) || Math.abs((an.stop-an.start)/100);
    if (step === 0) { log('.DC step is zero', 'err'); return; }
    var dir = an.stop > an.start ? 1 : -1;
    for (var v = an.start; dir*(v-an.stop) <= 1e-12; v += dir*step) vals.push(v);
    log('DC sweep '+srcName+': '+vals.length+' points', 'info');

    var nodeHist = {}; nm.list.forEach(function(n){ nodeHist[n] = []; });
    var vsrcHist = {}; vsrcs.forEach(function(v){ vsrcHist[v] = []; });

    vals.forEach(function(sv) {
        var dcMap = {}; dcMap[srcName] = sv;
        var sol = mnaStamp(netlist.elems, nm, vsrcs, null, dcMap);
        if (!sol) return;
        nm.list.forEach(function(n,i){ nodeHist[n].push(sol[i][0]); });
        vsrcs.forEach(function(v2,i){ vsrcHist[v2].push(sol[nm.count+i][0]); });
    });

    simResults = { type:'DC', vals:vals, nodeHist:nodeHist, vsrcHist:vsrcHist, srcName:srcName };
    buildDCTraceCbs(nm.list, vsrcs);
    plotDC();
    log('DC sweep complete.', 'info');
}

function buildDCTraceCbs(nodes, vsrcs) {
    var html = '';
    var ci = 0;
    nodes.forEach(function(n){
        var checked = ci < 4 ? 'checked' : '';
        html += '<label style="border-color:'+COLORS[ci%COLORS.length]+'"><input type="checkbox" id="dc_n_'+n+'" '+checked+' onchange="replot()"> V('+n+')</label>';
        ci++;
    });
    vsrcs.forEach(function(v){
        html += '<label style="border-color:'+COLORS[ci%COLORS.length]+'"><input type="checkbox" id="dc_v_'+v+'" onchange="replot()"> I('+v+')</label>';
        ci++;
    });
    document.getElementById('dc-checks').innerHTML = html;
    document.getElementById('dc-panel').style.display='block';
}

function plotDC() {
    var res = simResults;
    var datasets = [];
    var ci = 0;
    Object.keys(res.nodeHist).forEach(function(n){
        var cb = document.getElementById('dc_n_'+n);
        if (!cb||!cb.checked) return;
        datasets.push({ label:'V('+n+')', data:res.nodeHist[n],
            borderColor:COLORS[ci++%COLORS.length], backgroundColor:'transparent',
            borderWidth:1.8, pointRadius:0, tension:0.1 });
    });
    Object.keys(res.vsrcHist).forEach(function(v){
        var cb = document.getElementById('dc_v_'+v);
        if (!cb||!cb.checked) return;
        datasets.push({ label:'I('+v+') A', data:res.vsrcHist[v],
            borderColor:COLORS[ci++%COLORS.length], backgroundColor:'transparent',
            borderWidth:1.8, pointRadius:0, tension:0.1 });
    });
    if (dcChart) dcChart.destroy();
    dcChart = new Chart(document.getElementById('dc-chart').getContext('2d'), {
        type:'line', data:{ labels:res.vals.map(function(v){ return +v.toPrecision(5); }), datasets:datasets },
        options:{ responsive:true, animation:false,
            interaction:{ mode:'index', intersect:false },
            plugins:{ legend:{ labels:{ font:{family:'monospace',size:11}, color:'#333' }} },
            scales:{
                x:{ title:{display:true,text:res.srcName+' (V)',font:{family:'monospace',size:11}},
                    ticks:{font:{family:'monospace',size:10},maxTicksLimit:12} },
                y:{ title:{display:true,text:'Voltage (V)',font:{family:'monospace',size:11}},
                    ticks:{font:{family:'monospace',size:10}} }
            }
        }
    });
}

// ── Log helpers ───────────────────────────────────────────────────────────────
function clearLog() { document.getElementById('spice-log').innerHTML = ''; }
function log(msg, cls) {
    var el = document.getElementById('spice-log');
    el.innerHTML += '<span class="log-'+(cls||'info')+'">'+escHtml(msg)+'</span>\n';
    el.scrollTop = el.scrollHeight;
}
function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtF(f){ if(f>=1e9)return(f/1e9).toPrecision(4)+' GHz';if(f>=1e6)return(f/1e6).toPrecision(4)+' MHz';if(f>=1e3)return(f/1e3).toPrecision(4)+' kHz';return f+' Hz'; }
function fmtT(t){ if(t>=1)return t.toPrecision(4)+' s';if(t>=1e-3)return(t*1e3).toPrecision(4)+' ms';if(t>=1e-6)return(t*1e6).toPrecision(4)+' μs';return(t*1e9).toPrecision(4)+' ns'; }

// ── Preset netlists ───────────────────────────────────────────────────────────
var PRESETS = {

rc_lpf: `* RC Low-Pass Filter
V1 in 0 DC 0 AC 1
R1 in out 1k
C1 out 0 1n
.AC DEC 50 1k 1g
.END`,

rlc_series: `* Series RLC Band-Pass Filter
V1 in 0 DC 0 AC 1
R1 in 1 50
L1 1 2 100n
C1 2 out 25p
R2 out 0 50
.AC DEC 80 10meg 1g
.END`,

lc_tank: `* LC Tank (Parallel Resonator)
* Resonant at f0 = 1/(2*pi*sqrt(L*C)) = ~159 MHz
V1 in 0 DC 0 AC 1
R1 in tank 50
L1 tank 0 100n
C1 tank 0 10p
R2 tank 0 1k
.AC DEC 60 10meg 1g
.END`,

rl_lpf: `* RL Low-Pass Filter
V1 in 0 DC 0 AC 1
R1 in out 50
L1 out 0 80n
R2 out 0 50
.AC DEC 50 1meg 2g
.END`,

pi_filter: `* Pi Low-Pass Filter (50 ohm, 500 MHz cutoff)
V1 in 0 DC 0 AC 1
R1 in 1 50
C1 1 0 6.4p
L1 1 2 15.9n
C2 2 0 6.4p
R2 2 0 50
.AC DEC 60 10meg 3g
.END`,

tline_match: `* L-Match Network 50 → 200 ohm at 100 MHz
V1 in 0 DC 0 AC 1
R1 in 1 50
L1 1 out 63.7n
C1 out 0 318p
R2 out 0 200
.AC DEC 60 1meg 1g
.END`,

dc_divider: `* Resistive Voltage Divider
V1 vin 0 DC 5
R1 vin mid 10k
R2 mid 0 10k
.DC V1 0 10 0.1
.END`,

rc_tran: `* RC Charge/Discharge — step response
* R=1k, C=1n -> tau = 1 us
V1 in 0 DC 5
R1 in out 1k
C1 out 0 1n
.TRAN 0.1u 10u
.END`,

rlc_tran: `* RLC Step Response
* Underdamped: R=100, L=100n, C=1p
V1 in 0 DC 1
R1 in 1 10
L1 1 2 100n
C1 2 0 1p
R2 2 0 1k
.TRAN 0.1n 30n
.END`

};

function loadPreset(name) {
    if (PRESETS[name]) {
        document.getElementById('netlist-editor').value = PRESETS[name].trim();
        clearLog();
        log('Loaded preset: '+name, 'info');
    }
}

// Load default preset on page load
loadPreset('rc_lpf');
