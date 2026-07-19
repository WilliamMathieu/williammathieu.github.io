/* exported beCalc, beLoadExample, beBER */
/*
 * BER vs Eb/N0 in AWGN (coherent, Gray-coded, approximate)
 *   Q(x) = 0.5 erfc(x/sqrt2)
 *   BPSK/QPSK: Pb = Q(sqrt(2γ))
 *   M-PSK:     Pb ≈ (2/k) Q(sqrt(2kγ) sin(π/M))
 *   M-QAM:     Pb ≈ (4/k)(1-1/√M) Q(sqrt(3kγ/(M-1)))
 *   γ = Eb/N0 (linear), k = log2(M)
 *   Ref: Proakis & Salehi, Digital Communications 5e.
 */

// Numerical-Recipes erfc, accurate to ~1.2e-7
function erfc(x) {
  var z = Math.abs(x);
  var t = 1 / (1 + 0.5 * z);
  var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 +
    t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 +
    t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
function qfunc(x) { return 0.5 * erfc(x / Math.SQRT2); }

function beBER(fam, M, ebn0dB) {
  var g = Math.pow(10, ebn0dB / 10);   // linear Eb/N0
  var k = Math.log2(M);
  if (fam === 'psk' && M <= 4) {
    return qfunc(Math.sqrt(2 * g));                       // BPSK / QPSK
  }
  if (fam === 'psk') {
    return (2 / k) * qfunc(Math.sqrt(2 * k * g) * Math.sin(Math.PI / M));
  }
  // QAM
  return (4 / k) * (1 - 1 / Math.sqrt(M)) * qfunc(Math.sqrt(3 * k * g / (M - 1)));
}

function beCalc() {
  clearError();
  var sel = document.getElementById('be-mod').value.split(':');
  var fam = sel[0], M = parseFloat(sel[1]);
  var k = Math.log2(M);
  var ebn0 = parseFloat(document.getElementById('be-ebn0').value);
  var target = parseFloat(document.getElementById('be-target').value);

  document.getElementById('be-k').textContent = k.toFixed(0) + ' bits/sym';

  var opDefined = !isNaN(ebn0);
  if (opDefined) {
    var ber = beBER(fam, M, ebn0);
    document.getElementById('be-ber').textContent = fmtBER(ber);
    document.getElementById('be-esn0').textContent = (ebn0 + 10 * Math.log10(k)).toFixed(2) + ' dB';
  } else {
    document.getElementById('be-ber').textContent = '— (enter Eb/N0)';
    document.getElementById('be-esn0').textContent = '—';
  }

  if (!isNaN(target) && target > 0 && target < 0.5) {
    var req = solveEbN0(fam, M, target);
    if (req === null) {
      document.getElementById('be-req').textContent = '> 30 dB';
      document.getElementById('be-margin').textContent = '—';
    } else {
      document.getElementById('be-req').textContent = req.toFixed(2) + ' dB';
      document.getElementById('be-margin').textContent =
        opDefined ? (ebn0 - req).toFixed(2) + ' dB' : '—';
    }
  } else {
    document.getElementById('be-req').textContent = '— (enter target)';
    document.getElementById('be-margin').textContent = '—';
  }

  if (window.drawDiagram) window.drawDiagram();
}

// Bisection on Eb/N0 (dB) for a target BER (BER is monotonic decreasing)
function solveEbN0(fam, M, target) {
  var lo = -5, hi = 30;
  if (beBER(fam, M, hi) > target) return null;   // unreachable within 30 dB
  if (beBER(fam, M, lo) < target) return lo;
  for (var i = 0; i < 80; i++) {
    var mid = 0.5 * (lo + hi);
    if (beBER(fam, M, mid) > target) lo = mid; else hi = mid;
  }
  return 0.5 * (lo + hi);
}

function fmtBER(b) {
  if (b <= 0) return '< 1e-12';
  if (b >= 1e-3) return b.toFixed(5);
  return b.toExponential(3);
}

function beLoadExample() {
  document.getElementById('be-mod').value = 'qam:16';
  document.getElementById('be-ebn0').value = '10';
  document.getElementById('be-target').value = '1e-6';
  beCalc();
}

function clearError() { var el = document.getElementById('error'); if (el) el.textContent = ''; }
