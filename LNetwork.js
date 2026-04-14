
document.getElementById('ln-btn').addEventListener('click', function() {
    var f  = parseFloat(document.getElementById('ln-f').value)
           * parseFloat(document.getElementById('ln-fu').value);
    var Rs = parseFloat(document.getElementById('ln-rs').value);
    var RL = parseFloat(document.getElementById('ln-rl').value);
    if ([f,Rs,RL].some(isNaN) || f<=0 || Rs<=0 || RL<=0 || Rs===RL) {
        document.getElementById('ln-out').innerHTML = 'Please enter valid values (Rs \u2260 RL).'; return;
    }
    var w = 2*Math.PI*f;
    // High-impedance to low: shunt element across high-Z side, series element on low-Z side
    var Rhigh = Math.max(Rs, RL), Rlow = Math.min(Rs, RL);
    var Q = Math.sqrt(Rhigh/Rlow - 1);
    // Solution 1: shunt C, series L (lowpass type)
    var Xshunt = Rhigh / Q;  // shunt reactance (capacitor if across Rhigh)
    var Xseries = Q * Rlow;  // series reactance (inductor)
    var C_shunt = 1/(w*Xshunt);
    var L_series = Xseries/w;
    // Solution 2: shunt L, series C (highpass type)
    var C_series = 1/(w*Xseries);
    var L_shunt  = Xshunt/w;
    var label = Rs > RL ? '(shunt across source, series toward load)'
                        : '(shunt across load, series toward source)';
    var out = '<p><b>Q = ' + Q.toFixed(4) + '</b></p>'
        + '<p><b>Solution 1 — Low-pass</b> ' + label + ':</p>'
        + '<p>Shunt C = ' + fmtE(C_shunt) + 'F</p>'
        + '<p>Series L = ' + fmtE(L_series) + 'H</p>'
        + '<p><b>Solution 2 — High-pass:</b></p>'
        + '<p>Series C = ' + fmtE(C_series) + 'F</p>'
        + '<p>Shunt L = ' + fmtE(L_shunt) + 'H</p>';
    document.getElementById('ln-out').innerHTML = out;
});
function fmtE(v) {
    return math.format(v, {notation:'engineering', precision:4}) + ' ';
}
