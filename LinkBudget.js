
document.getElementById('lb-btn').addEventListener('click', function() {
    var Pt    = parseFloat(document.getElementById('lb-pt').value);
    var Ltx   = parseFloat(document.getElementById('lb-ltx').value);
    var Gt    = parseFloat(document.getElementById('lb-gt').value);
    var f     = parseFloat(document.getElementById('lb-f').value)
              * parseFloat(document.getElementById('lb-fu').value);
    var d     = parseFloat(document.getElementById('lb-d').value);
    var Lmisc = parseFloat(document.getElementById('lb-lmisc').value);
    var Gr    = parseFloat(document.getElementById('lb-gr').value);
    var Lrx   = parseFloat(document.getElementById('lb-lrx').value);
    var NF    = parseFloat(document.getElementById('lb-nf').value);
    var BW    = parseFloat(document.getElementById('lb-bw').value)
              * parseFloat(document.getElementById('lb-bwu').value);
    var SNR_req = parseFloat(document.getElementById('lb-snr').value);
    if ([Pt,Ltx,Gt,f,d,Lmisc,Gr,Lrx,NF,BW,SNR_req].some(isNaN)) {
        document.getElementById('lb-out').innerHTML = 'Please fill all fields.'; return;
    }
    var lam   = 3e8/f;
    var FSPL  = 20*Math.log10(4*Math.PI*d/lam);
    var EIRP  = Pt - Ltx + Gt;
    var Pr    = EIRP - FSPL - Lmisc + Gr - Lrx; // dBm
    var kT    = -174;   // dBm/Hz at 290K
    var N_dBm = kT + 10*Math.log10(BW) + NF;
    var SNR_achieved = Pr - N_dBm;
    var margin = SNR_achieved - SNR_req;
    var out = '<table style="font-family:monospace;font-size:13px;border-collapse:collapse;">'
        + row('EIRP', EIRP, 'dBm')
        + row('Free-space path loss', FSPL, 'dB')
        + row('Additional losses', Lmisc, 'dB')
        + row('Received power', Pr, 'dBm')
        + row('Noise floor', N_dBm, 'dBm')
        + row('Achieved SNR', SNR_achieved, 'dB')
        + row('Required SNR', SNR_req, 'dB')
        + '<tr><td colspan="3" style="border-top:1px solid #ccc;padding-top:4px;"></td></tr>'
        + row2('Link margin', margin)
        + '</table>';
    document.getElementById('lb-out').innerHTML = out;
});
function row(label, val, unit) {
    return '<tr><td style="padding:2px 12px 2px 0;">' + label + '</td>'
         + '<td style="text-align:right;padding:2px 6px;">' + val.toFixed(2) + '</td>'
         + '<td>' + unit + '</td></tr>';
}
function row2(label, val) {
    var color = val >= 0 ? '#007700' : '#cc0000';
    return '<tr><td style="padding:2px 12px 2px 0;"><b>' + label + '</b></td>'
         + '<td style="text-align:right;padding:2px 6px;color:' + color + ';"><b>' + val.toFixed(2) + '</b></td>'
         + '<td>dB</td></tr>';
}
