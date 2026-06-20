/*
 * Bandpass / Bandstop LC Resonator — standard
 *
 *   f₀      = 1 / (2π·√(L·C))                (resonant frequency)
 *   Series:   Q = ω₀·L/R;   BW = R/(2π·L) = f₀/Q
 *   Parallel: Q = R/(ω₀·L); BW = 1/(2π·R·C) = f₀/Q
 *   f₁, f₂  = f₀·(√(1+1/(4Q²)) ∓ 1/(2Q))    (exact −3 dB band edges)
 *             → reduces to f₀ ± BW/2 for high Q; stays positive for Q < 0.5
 */

document.getElementById('bp-btn').addEventListener('click', function() {
    var L=parseFloat(document.getElementById('bp-L').value)*parseFloat(document.getElementById('bp-Lu').value);
    var C=parseFloat(document.getElementById('bp-C').value)*parseFloat(document.getElementById('bp-Cu').value);
    var R=parseFloat(document.getElementById('bp-R').value);
    var cfg=document.getElementById('bp-config').value;
    clearError();
    if(isNaN(L)||isNaN(C)||isNaN(R)||L<=0||C<=0||R<=0){showError('Enter valid positive values for L, C, R.');return;}
    var f0=1/(2*Math.PI*Math.sqrt(L*C)), w0=2*Math.PI*f0;
    var BW_Hz, Q;
    if(cfg==='series'){BW_Hz=R/(2*Math.PI*L); Q=w0*L/R;}
    else {BW_Hz=1/(2*Math.PI*R*C); Q=R/(w0*L);}
    document.getElementById('bp-f0').textContent=engFmt(f0,'Hz');
    document.getElementById('bp-bw').textContent=engFmt(BW_Hz,'Hz');
    document.getElementById('bp-Q').textContent=Q.toFixed(4);
    // Exact −3 dB edges: f1,2 = f0·(√(1+1/(4Q²)) ∓ 1/(2Q)). Always positive
    // (the f0±BW/2 approximation goes negative for Q < 0.5), and f1·f2 = f0².
    var half=1/(2*Q), mid=Math.sqrt(1+half*half);
    document.getElementById('bp-f1').textContent=engFmt(f0*(mid-half),'Hz');
    document.getElementById('bp-f2').textContent=engFmt(f0*(mid+half),'Hz');
    if(window.drawDiagram) window.drawDiagram();
});

function showError(msg){var el=document.getElementById('error');if(el)el.textContent=msg;}
function clearError(){var el=document.getElementById('error');if(el)el.textContent='';}
