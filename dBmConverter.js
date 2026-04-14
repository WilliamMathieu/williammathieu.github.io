
document.getElementById('db-btn1').addEventListener('click', function() {
    var dbm = parseFloat(document.getElementById('db-dbm').value);
    if (isNaN(dbm)) { document.getElementById('db-out1').innerHTML = 'Enter a valid dBm value.'; return; }
    var W  = 1e-3 * Math.pow(10, dbm/10);
    var out = '<p>' + math.format(W, {notation:'engineering', precision:5}) + ' W</p>'
            + '<p>' + math.format(W*1e3, {notation:'engineering', precision:5}) + ' mW</p>'
            + '<p>' + math.format(W*1e6, {notation:'engineering', precision:5}) + ' \u03bcW</p>';
    document.getElementById('db-out1').innerHTML = out;
});
document.getElementById('db-btn2').addEventListener('click', function() {
    var W = parseFloat(document.getElementById('db-w').value);
    if (isNaN(W) || W<=0) { document.getElementById('db-out2').innerHTML = 'Enter a valid positive power.'; return; }
    var dbm = 10*Math.log10(W/1e-3);
    document.getElementById('db-out2').innerHTML = '<p>' + dbm.toFixed(6) + ' dBm</p>';
});
