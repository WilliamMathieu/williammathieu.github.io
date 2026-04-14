/* ── RF Circuit Simulator ───────────────────────────────────────────────────
   Uses ABCD (transmission) matrix analysis on a ladder network.
   Each element has a 2×2 complex ABCD matrix. They are cascaded by
   multiplication. S-parameters are derived from the total ABCD matrix.
   ────────────────────────────────────────────────────────────────────────── */

var components = [];    // [{type, topo, val, unit, z0tl, len, f0tl}]
var chartInstances = {};

// ── Complex number helpers ────────────────────────────────────────────────────
function C(re, im) { return { re: re || 0, im: im || 0 }; }
function cadd(a, b) { return C(a.re+b.re, a.im+b.im); }
function csub(a, b) { return C(a.re-b.re, a.im-b.im); }
function cmul(a, b) { return C(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re); }
function cdiv(a, b) {
    var d = b.re*b.re + b.im*b.im;
    return C((a.re*b.re+a.im*b.im)/d, (a.im*b.re-a.re*b.im)/d);
}
function cmag(a) { return Math.sqrt(a.re*a.re + a.im*a.im); }
function cphase(a) { return Math.atan2(a.im, a.re) * 180/Math.PI; }
function cconj(a) { return C(a.re, -a.im); }
function cj(x) { return C(0, x); }  // purely imaginary

// ── 2×2 complex matrix multiplication ────────────────────────────────────────
// Matrix = [[a,b],[c,d]]
function matmul(M1, M2) {
    return [
        [ cadd(cmul(M1[0][0],M2[0][0]), cmul(M1[0][1],M2[1][0])),
          cadd(cmul(M1[0][0],M2[0][1]), cmul(M1[0][1],M2[1][1])) ],
        [ cadd(cmul(M1[1][0],M2[0][0]), cmul(M1[1][1],M2[1][0])),
          cadd(cmul(M1[1][0],M2[0][1]), cmul(M1[1][1],M2[1][1])) ]
    ];
}

function matIdentity() {
    return [[C(1),C(0)],[C(0),C(1)]];
}

// ── Element ABCD matrices ─────────────────────────────────────────────────────
function abcdSeries(Z) {
    // Series impedance: [[1,Z],[0,1]]
    return [[C(1), Z], [C(0), C(1)]];
}

function abcdShunt(Y) {
    // Shunt admittance: [[1,0],[Y,1]]
    return [[C(1), C(0)], [Y, C(1)]];
}

function abcdTL(Z0, betaL) {
    // Lossless transmission line
    var cosbl = C(Math.cos(betaL), 0);
    var sinbl = C(Math.sin(betaL), 0);
    var jZ0sinbl  = cj(Z0  * Math.sin(betaL));
    var jsinblZ0  = cj(     Math.sin(betaL) / Z0);
    return [
        [cosbl,      jZ0sinbl ],
        [jsinblZ0,   cosbl    ]
    ];
}

// ── Build ABCD for one component at frequency f (Hz) ─────────────────────────
function componentABCD(comp, f) {
    var w = 2 * Math.PI * f;
    var Z, Y;
    switch (comp.type) {
        case 'R':
            Z = C(comp.val, 0);
            return comp.topo === 'series' ? abcdSeries(Z) : abcdShunt(cdiv(C(1), Z));
        case 'L':
            Z = cj(w * comp.val);  // jωL
            return comp.topo === 'series' ? abcdSeries(Z) : abcdShunt(cdiv(C(1), Z));
        case 'C':
            Z = cdiv(C(1), cj(w * comp.val));  // 1/jωC
            return comp.topo === 'series' ? abcdSeries(Z) : abcdShunt(cdiv(C(1), Z));
        case 'TL':
            // betaL = (f/f0) * len_deg * π/180
            var betaL = (f / comp.f0tl) * comp.len * Math.PI / 180;
            return abcdTL(comp.z0tl, betaL);
        default:
            return matIdentity();
    }
}

// ── ABCD → S-parameters (with port impedance Z0) ─────────────────────────────
function abcdToS(M, Z0) {
    var A = M[0][0], B = M[0][1], C_ = M[1][0], D = M[1][1];
    var z0 = C(Z0, 0);
    var denom = cadd(cadd(A, cdiv(B, z0)), cadd(cmul(C_, z0), D));
    // S11 = (A + B/Z0 - C*Z0 - D) / denom
    var S11 = cdiv(csub(cadd(A, cdiv(B,z0)), cadd(cmul(C_,z0), D)), denom);
    // S21 = 2 / denom
    var S21 = cdiv(C(2), denom);
    // S12 = 2(AD-BC) / denom
    var S12 = cdiv(cmul(C(2), csub(cmul(A,D), cmul(B,C_))), denom);
    // S22 = (-A + B/Z0 - C*Z0 + D) / denom
    var S22 = cdiv(cadd(csub(cdiv(B,z0), A), csub(D, cmul(C_,z0))), denom);
    return { S11: S11, S21: S21, S12: S12, S22: S22 };
}

// ── Run simulation ────────────────────────────────────────────────────────────
function simulate() {
    if (components.length === 0) {
        alert('Add at least one component first.'); return;
    }

    var fStart = parseFloat(document.getElementById('f-start').value)
               * parseFloat(document.getElementById('f-start-u').value);
    var fStop  = parseFloat(document.getElementById('f-stop').value)
               * parseFloat(document.getElementById('f-stop-u').value);
    var nPts   = Math.max(50, Math.min(2000, parseInt(document.getElementById('f-pts').value) || 500));
    var Z0     = parseFloat(document.getElementById('sim-z0').value) || 50;
    var logScale = document.getElementById('f-scale').value === 'log';

    var freqs = [];
    for (var i = 0; i < nPts; i++) {
        var t = i / (nPts - 1);
        if (logScale) {
            freqs.push(Math.pow(10, Math.log10(fStart) + t * (Math.log10(fStop) - Math.log10(fStart))));
        } else {
            freqs.push(fStart + t * (fStop - fStart));
        }
    }

    var s11dB=[], s21dB=[], s11ph=[], s21ph=[], zInRe=[], zInIm=[], vswr=[], gdelay=[];

    // For group delay we need phase at adjacent frequencies
    var phaseArr = [];

    freqs.forEach(function(f) {
        var M = matIdentity();
        components.forEach(function(comp) {
            M = matmul(M, componentABCD(comp, f));
        });
        var S = abcdToS(M, Z0);
        var m11 = cmag(S.S11), m21 = cmag(S.S21);
        s11dB.push(m11 > 0 ? 20*Math.log10(m11) : -200);
        s21dB.push(m21 > 0 ? 20*Math.log10(m21) : -200);
        s11ph.push(cphase(S.S11));
        s21ph.push(cphase(S.S21));
        phaseArr.push(cphase(S.S21) * Math.PI / 180); // radians for GD calc
        // Input impedance: Zin = (A*ZL + B) / (C*ZL + D), ZL = Z0
        var ZL = C(Z0);
        var Zin = cdiv(cadd(cmul(M[0][0],ZL), M[0][1]), cadd(cmul(M[1][0],ZL), M[1][1]));
        zInRe.push(Zin.re);
        zInIm.push(Zin.im);
        vswr.push(m11 < 1 ? (1+m11)/(1-m11) : 999);
    });

    // Group delay = -dφ/dω (s), approximate with finite difference
    for (var k = 0; k < freqs.length; k++) {
        var k0 = Math.max(0, k-1), k1 = Math.min(freqs.length-1, k+1);
        var dPhi = phaseArr[k1] - phaseArr[k0];
        var dW   = 2*Math.PI*(freqs[k1] - freqs[k0]);
        gdelay.push(dW !== 0 ? -dPhi/dW * 1e9 : 0); // ns
    }

    // Summary
    var s21min = Math.min.apply(null, s21dB);
    var s21max = Math.max.apply(null, s21dB);
    var s11min = Math.min.apply(null, s11dB);
    var il = -s21max; // insertion loss at passband peak
    document.getElementById('sim-summary').style.display='block';
    document.getElementById('sim-summary').innerHTML =
        'S21 range: ' + s21min.toFixed(1) + ' to ' + s21max.toFixed(1) + ' dB &nbsp;|&nbsp; '
      + 'S11 min: ' + s11min.toFixed(1) + ' dB &nbsp;|&nbsp; '
      + 'Insertion loss: ' + il.toFixed(2) + ' dB';

    // Frequency axis labels
    var fMax = freqs[freqs.length-1];
    var fDiv = fMax >= 1e9 ? 1e9 : fMax >= 1e6 ? 1e6 : 1e3;
    var fUnit = fMax >= 1e9 ? 'GHz' : fMax >= 1e6 ? 'MHz' : 'kHz';
    var fLabels = freqs.map(function(f){ return parseFloat((f/fDiv).toPrecision(4)); });

    function makeDataset(label, data, color) {
        return { label:label, data:data, borderColor:color, backgroundColor:'transparent',
                 borderWidth:1.8, pointRadius:0, tension:0.1 };
    }

    function buildChart(id, datasets, yLabel, yMin, yMax) {
        if (chartInstances[id]) { chartInstances[id].destroy(); }
        var ctx = document.getElementById(id).getContext('2d');
        chartInstances[id] = new Chart(ctx, {
            type:'line',
            data:{ labels:fLabels, datasets:datasets },
            options:{
                responsive:true, animation:false,
                interaction:{ mode:'index', intersect:false },
                plugins:{
                    legend:{ labels:{ font:{family:'monospace',size:11}, color:'#333' }},
                    tooltip:{ callbacks:{
                        title:function(items){ return formatFreq(freqs[items[0].dataIndex]); },
                        label:function(i){ return i.dataset.label+': '+i.parsed.y.toFixed(3)+' '+yLabel; }
                    }}
                },
                scales:{
                    x:{ type:logScale?'logarithmic':'linear',
                        title:{display:true,text:'Frequency ('+fUnit+')',font:{family:'monospace',size:11}},
                        ticks:{font:{family:'monospace',size:10},maxTicksLimit:10} },
                    y:{ title:{display:true,text:yLabel,font:{family:'monospace',size:11}},
                        ticks:{font:{family:'monospace',size:10}},
                        min:yMin, max:yMax }
                }
            }
        });
    }

    buildChart('chart-s',
        [makeDataset('S11 (dB)', s11dB, '#AA77FF'), makeDataset('S21 (dB)', s21dB, '#00ccff')],
        'dB');
    buildChart('chart-z',
        [makeDataset('Re(Zin) Ω', zInRe, '#ff6644'), makeDataset('Im(Zin) Ω', zInIm, '#00ffaa')],
        'Ω');
    buildChart('chart-ph',
        [makeDataset('S11 phase °', s11ph, '#AA77FF'), makeDataset('S21 phase °', s21ph, '#00ccff')],
        'deg');
    buildChart('chart-gd',
        [makeDataset('Group delay (ns)', gdelay, '#ff8800')],
        'ns');
    buildChart('chart-vswr',
        [makeDataset('VSWR', vswr.map(function(v){return Math.min(v,20);}), '#ff44aa')],
        'VSWR', 1);

    document.getElementById('charts-wrap').style.display='block';
}

function formatFreq(f) {
    if(f>=1e9) return (f/1e9).toPrecision(4)+' GHz';
    if(f>=1e6) return (f/1e6).toPrecision(4)+' MHz';
    if(f>=1e3) return (f/1e3).toPrecision(4)+' kHz';
    return f+' Hz';
}

// ── Chart tab switching ───────────────────────────────────────────────────────
function switchTab(name) {
    document.querySelectorAll('.chart-tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.chart-panel').forEach(function(p){ p.classList.remove('active'); });
    document.getElementById('panel-'+name).classList.add('active');
    event.target.classList.add('active');
}

// ── Component UI ──────────────────────────────────────────────────────────────
var UNITS = {
    R: [{v:'1',l:'Ω'}],
    L: [{v:'1e-3',l:'mH'},{v:'1e-6',l:'μH'},{v:'1e-9',l:'nH'},{v:'1e-12',l:'pH'}],
    C: [{v:'1e-6',l:'μF'},{v:'1e-9',l:'nF'},{v:'1e-12',l:'pF'},{v:'1e-15',l:'fF'}],
    TL:[],
    S: []
};
var DEFAULT_VALS = { R:'50', L:'10', C:'10', TL:'', S:'' };
var DEFAULT_UNITS = { R:0, L:2, C:2, TL:0, S:0 };

function compTypeChange() {
    var t = document.getElementById('comp-type').value;
    var valRow = document.getElementById('comp-val-row');
    var tlRow  = document.getElementById('comp-tl-row');
    if (t === 'TL') { valRow.style.display='none'; tlRow.style.display='flex'; }
    else            { valRow.style.display='flex';  tlRow.style.display='none'; }
    var units = UNITS[t] || [];
    var sel = document.getElementById('comp-unit');
    sel.innerHTML = units.map(function(u){ return '<option value="'+u.v+'">'+u.l+'</option>'; }).join('');
    document.getElementById('comp-val').value = DEFAULT_VALS[t] || '';
    if (DEFAULT_UNITS[t] !== undefined && sel.options[DEFAULT_UNITS[t]]) {
        sel.selectedIndex = DEFAULT_UNITS[t];
    }
}

function addComponent() {
    var t    = document.getElementById('comp-type').value;
    var topo = document.getElementById('comp-topo').value;
    if (t === 'TL') {
        var z0tl = parseFloat(document.getElementById('tl-z0').value) || 50;
        var len  = parseFloat(document.getElementById('tl-len').value) || 90;
        var f0tl = parseFloat(document.getElementById('tl-f0').value)
                 * parseFloat(document.getElementById('tl-f0-u').value);
        components.push({ type:'TL', topo:'series', z0tl:z0tl, len:len, f0tl:f0tl,
            label:'TL Z₀='+z0tl+'Ω '+len+'° @ '+fmt(f0tl) });
    } else {
        var val    = parseFloat(document.getElementById('comp-val').value);
        var unit   = parseFloat(document.getElementById('comp-unit').value) || 1;
        var valSI  = val * unit;
        var unitLbl= document.getElementById('comp-unit').options[document.getElementById('comp-unit').selectedIndex]
                       ? document.getElementById('comp-unit').options[document.getElementById('comp-unit').selectedIndex].text
                       : '';
        components.push({ type:t, topo:topo, val:valSI,
            label:t+'='+val+' '+unitLbl+' ('+topo+')' });
    }
    renderList();
    drawSchematic();
}

function removeComponent(i) {
    components.splice(i, 1);
    renderList(); drawSchematic();
}

function moveComponent(i, dir) {
    var j = i + dir;
    if (j < 0 || j >= components.length) return;
    var tmp = components[i]; components[i] = components[j]; components[j] = tmp;
    renderList(); drawSchematic();
}

function renderList() {
    var el = document.getElementById('comp-list');
    if (components.length === 0) {
        el.innerHTML = '<div style="padding:8px;color:#999;font-family:monospace;font-size:12px;">No components yet — add some above.</div>';
        return;
    }
    var h = '';
    components.forEach(function(c, i) {
        var badge = '<span class="comp-badge badge-'+c.type+'">'+c.type+'</span>';
        var topo  = c.type !== 'TL' ? '<span class="comp-mode">'+c.topo+'</span>' : '<span class="comp-mode">series</span>';
        h += '<div class="comp-item">'
           + badge + ' ' + topo + ' &nbsp;' + escHtml(c.label)
           + '<button class="comp-move" onclick="moveComponent('+i+',-1)" title="Move up">&#8679;</button>'
           + '<button class="comp-move" onclick="moveComponent('+i+',1)"  title="Move down">&#8681;</button>'
           + '<button class="comp-del"  onclick="removeComponent('+i+')"  title="Delete">&times;</button>'
           + '</div>';
    });
    el.innerHTML = h;
}

function fmt(f) {
    if(f>=1e9) return (f/1e9).toPrecision(3)+'GHz';
    if(f>=1e6) return (f/1e6).toPrecision(3)+'MHz';
    if(f>=1e3) return (f/1e3).toPrecision(3)+'kHz';
    return f+'Hz';
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── Schematic drawing ─────────────────────────────────────────────────────────
function drawSchematic() {
    var svg = document.getElementById('schematic');
    if (components.length === 0) { svg.innerHTML=''; svg.setAttribute('height','60'); return; }

    var CW = 60,  // component width
        CH = 36,  // component height
        PAD = 20, // horizontal padding
        MID = 50, // vertical midline
        SHUNT_H = 28; // depth of shunt elements below midline

    var seriesCount = components.filter(function(c){ return c.topo!=='shunt'; }).length;
    var shuntCount  = components.filter(function(c){ return c.topo==='shunt'; }).length;
    var totalW = PAD + components.length * (CW + 16) + PAD;
    var totalH = shuntCount > 0 ? MID + SHUNT_H + 24 : MID + 20;
    svg.setAttribute('width', Math.max(400, totalW));
    svg.setAttribute('height', totalH);

    var out = '';
    var x = PAD;

    // Source port
    out += circle(x, MID, 5, '#AA77FF') + label(x, MID-12, 'P1', '#5533aa');
    out += line(x+5, MID, x+16, MID, '#333');
    x += 16;

    components.forEach(function(c, i) {
        var cx = x + CW/2;
        if (c.topo === 'shunt') {
            // Horizontal line through
            out += line(x, MID, x+CW, MID, '#333');
            // Vertical drop
            out += line(cx, MID, cx, MID+SHUNT_H, '#333');
            // Component box at bottom
            out += rect(cx-CW/4, MID+SHUNT_H-CH/2+4, CW/2, CH-8, compColor(c.type));
            out += label(cx, MID+SHUNT_H+14, c.type, '#333');
            // Ground
            out += groundSym(cx, MID+SHUNT_H+CH/2-4);
        } else {
            // Series component box on midline
            out += rect(x, MID-CH/2, CW, CH, compColor(c.type));
            out += label(cx, MID+5, c.type, '#333');
        }
        x += CW + 16;
        // Wire between components
        if (i < components.length-1) {
            out += line(x-16, MID, x, MID, '#333');
        }
    });

    // Load port
    out += line(x-16, MID, x, MID, '#333');
    out += circle(x, MID, 5, '#00ccff') + label(x, MID-12, 'P2', '#006699');

    svg.innerHTML = out;
}

function compColor(t) {
    return {R:'#ffd0b0',L:'#c8e8ff',C:'#c8ffd8',TL:'#ffe8c8',S:'#f0c8ff'}[t] || '#eee';
}
function rect(x,y,w,h,fill) {
    return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="#777" stroke-width="1" rx="3"/>';
}
function circle(x,y,r,fill) {
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'"/>';
}
function line(x1,y1,x2,y2,stroke) {
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+stroke+'" stroke-width="1.5"/>';
}
function label(x,y,txt,fill) {
    return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="11" fill="'+fill+'" font-family="monospace">'+txt+'</text>';
}
function groundSym(x,y) {
    return line(x-8,y,x+8,y,'#555')+line(x-5,y+4,x+5,y+4,'#555')+line(x-2,y+8,x+2,y+8,'#555');
}

// ── Presets ───────────────────────────────────────────────────────────────────
var PRESETS = {
    blank: [],
    lpf3: [
        {type:'L',topo:'series',val:159e-9,   label:'L=159 nH (series)'},
        {type:'C',topo:'shunt', val:636e-12,   label:'C=636 pF (shunt)'},
        {type:'L',topo:'series',val:159e-9,   label:'L=159 nH (series)'}
    ],
    hpf3: [
        {type:'C',topo:'series',val:159e-12,   label:'C=159 pF (series)'},
        {type:'L',topo:'shunt', val:636e-9,    label:'L=636 nH (shunt)'},
        {type:'C',topo:'series',val:159e-12,   label:'C=159 pF (series)'}
    ],
    bpf: [
        {type:'L',topo:'series',val:50.3e-9,  label:'L=50.3 nH (series)'},
        {type:'C',topo:'series',val:10.1e-12, label:'C=10.1 pF (series)'},
        {type:'C',topo:'shunt', val:40.5e-12, label:'C=40.5 pF (shunt)'},
        {type:'L',topo:'shunt', val:125e-9,   label:'L=125 nH (shunt)'},
        {type:'L',topo:'series',val:50.3e-9,  label:'L=50.3 nH (series)'},
        {type:'C',topo:'series',val:10.1e-12, label:'C=10.1 pF (series)'}
    ],
    lmatch: [
        {type:'L',topo:'series',val:63.7e-9,  label:'L=63.7 nH (series)'},
        {type:'C',topo:'shunt', val:318e-12,  label:'C=318 pF (shunt)'}
    ],
    qw: [
        {type:'TL',topo:'series',z0tl:100,len:90,f0tl:500e6, label:'TL Z₀=100Ω 90° @ 500MHz'}
    ],
    stub: [
        {type:'TL',topo:'series',z0tl:50, len:90, f0tl:1e9, label:'TL Z₀=50Ω 90° @ 1GHz'},
        {type:'TL',topo:'shunt', z0tl:50, len:90, f0tl:1e9, label:'TL Z₀=50Ω 90° @ 1GHz (shunt stub)'}
    ]
};

function loadPreset(name) {
    components = (PRESETS[name] || []).map(function(c){ return Object.assign({},c); });
    renderList(); drawSchematic();
    document.getElementById('sim-summary').style.display='none';
    document.getElementById('charts-wrap').style.display='none';
}

// ── Init ──────────────────────────────────────────────────────────────────────
compTypeChange();
renderList();
drawSchematic();
