/* dBm Converter */
document.getElementById('db-btn1').addEventListener('click', function() {
    var dbm = parseFloat(document.getElementById('db-dbm').value);
    document.getElementById('db-err1').textContent = '';
    if (isNaN(dbm)) { document.getElementById('db-err1').textContent = 'Please enter a valid dBm value.'; return; }
    var W = 1e-3*Math.pow(10,dbm/10);
    document.getElementById('db-W').textContent  = math.format(W,    {notation:'engineering',precision:5});
    document.getElementById('db-mW').textContent = math.format(W*1e3,{notation:'engineering',precision:5});
    document.getElementById('db-uW').textContent = math.format(W*1e6,{notation:'engineering',precision:5});
});
document.getElementById('db-btn2').addEventListener('click', function() {
    var W = parseFloat(document.getElementById('db-w').value);
    document.getElementById('db-err2').textContent = '';
    if (isNaN(W)||W<=0) { document.getElementById('db-err2').textContent = 'Please enter a valid positive power value.'; return; }
    document.getElementById('db-dbm-out').textContent = (10*Math.log10(W/1e-3)).toFixed(6);
});

document.getElementById('db-btn3').addEventListener('click', function() {
    var db  = parseFloat(document.getElementById('db-db').value);
    var typ = document.getElementById('db-db-type').value;
    document.getElementById('db-err3').textContent = '';
    if (isNaN(db)) { document.getElementById('db-err3').textContent = 'Please enter a valid dB value.'; return; }
    // Both power and voltage use 10^(dB/20) for linear ratio — the difference
    // is only in the forward direction (power uses 10*log, voltage uses 20*log).
    // dB → ratio: power ratio = 10^(dB/10), voltage ratio = 10^(dB/20)
    var ratio = typ === 'power' ? Math.pow(10, db/10) : Math.pow(10, db/20);
    document.getElementById('db-lin').textContent = ratio.toPrecision(6);
});

document.getElementById('db-btn4').addEventListener('click', function() {
    var ratio = parseFloat(document.getElementById('db-ratio').value);
    var typ   = document.getElementById('db-ratio-type').value;
    document.getElementById('db-err4').textContent = '';
    if (isNaN(ratio) || ratio <= 0) { document.getElementById('db-err4').textContent = 'Please enter a valid positive ratio.'; return; }
    var db = typ === 'power' ? 10*Math.log10(ratio) : 20*Math.log10(ratio);
    document.getElementById('db-db-out').textContent = db.toFixed(6);
});
