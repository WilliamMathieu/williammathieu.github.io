/* Unified dB/dBm Converter */

function switchMode(m) {
    document.querySelectorAll('.mode-tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.mode-panel').forEach(function(p){ p.classList.remove('active'); });
    event.target.classList.add('active');
    document.getElementById('panel-'+m).classList.add('active');
}

var ENG = function(v, unit) { return engFmt(v, unit || ''); };

// ── dBm ↔ Power ───────────────────────────────────────────────────────────────
function updateDbm(src) {
    var dbmEl = document.getElementById('v-dbm');
    var wEl   = document.getElementById('v-watt');
    var wuEl  = document.getElementById('v-wattu');
    var wmul  = parseFloat(wuEl.value);
    var W, dBm;

    if (src === 'dbm') {
        var d = parseFloat(dbmEl.value);
        if (isNaN(d)) { clearDbm(); return; }
        W = 1e-3 * Math.pow(10, d/10);
        // Update the watt field in its chosen unit
        wEl.value = parseFloat((W / wmul).toPrecision(6));
        dBm = d;
    } else {
        var wv = parseFloat(wEl.value);
        if (isNaN(wv) || wv <= 0) { clearDbm(); return; }
        W = wv * wmul;
        dBm = 10 * Math.log10(W / 1e-3);
        dbmEl.value = parseFloat(dBm.toPrecision(6));
    }

    document.getElementById('out-w').textContent   = engFmt(W, 'W');
    document.getElementById('out-mw').textContent  = (W*1e3).toPrecision(5) + ' mW';
    document.getElementById('out-uw').textContent  = (W*1e6).toPrecision(5) + ' µW';
    document.getElementById('out-dbm').textContent = dBm.toFixed(4) + ' dBm';
    document.getElementById('out-dbw').textContent = (dBm - 30).toFixed(4) + ' dBW';
}
function clearDbm() {
    ['out-w','out-mw','out-uw','out-dbm','out-dbw'].forEach(function(id){
        document.getElementById(id).textContent = '—';
    });
}

// ── dB ↔ Power Ratio (10·log) ─────────────────────────────────────────────────
function updatePow(src) {
    var dbEl = document.getElementById('v-dbpow');
    var rEl  = document.getElementById('v-ratiopow');
    var db, r;
    if (src === 'db') {
        db = parseFloat(dbEl.value);
        if (isNaN(db)) { clearPow(); return; }
        r = Math.pow(10, db/10);
        rEl.value = parseFloat(r.toPrecision(6));
    } else {
        r = parseFloat(rEl.value);
        if (isNaN(r) || r <= 0) { clearPow(); return; }
        db = 10 * Math.log10(r);
        dbEl.value = parseFloat(db.toPrecision(6));
    }
    document.getElementById('out-pow-lin').textContent = r.toPrecision(6) + ' ×';
    document.getElementById('out-pow-db').textContent  = db.toFixed(4) + ' dB';
}
function clearPow() {
    document.getElementById('out-pow-lin').textContent = '—';
    document.getElementById('out-pow-db').textContent  = '—';
}

// ── dB ↔ Amplitude Ratio (20·log) ─────────────────────────────────────────────
function updateAmp(src) {
    var dbEl = document.getElementById('v-dbamp');
    var rEl  = document.getElementById('v-ratioamp');
    var db, r;
    if (src === 'db') {
        db = parseFloat(dbEl.value);
        if (isNaN(db)) { clearAmp(); return; }
        r = Math.pow(10, db/20);
        rEl.value = parseFloat(r.toPrecision(6));
    } else {
        r = parseFloat(rEl.value);
        if (isNaN(r) || r <= 0) { clearAmp(); return; }
        db = 20 * Math.log10(r);
        dbEl.value = parseFloat(db.toPrecision(6));
    }
    document.getElementById('out-amp-lin').textContent = r.toPrecision(6) + ' ×';
    document.getElementById('out-amp-db').textContent  = db.toFixed(4) + ' dB';
}
function clearAmp() {
    document.getElementById('out-amp-lin').textContent = '—';
    document.getElementById('out-amp-db').textContent  = '—';
}
