var numCapacitors = 2;

function buildInputs() {
  var n = parseInt(document.getElementById('numCaps').value, 10);
  if (isNaN(n) || n < 1 || n > 20) {
    showError('Please enter a number between 1 and 20.');
    return;
  }
  numCapacitors = n;
  clearError();
  document.getElementById('C_out').textContent = '';
  //document.getElementById('res-formula').textContent = '';
  var defUnit = document.getElementById('defaultUnit').value;

  var html = '';
  for (var i = 1; i <= n; i++) {
    html += 'C' + i + ': ';
    html += '<input type="number" id="cv-' + i + '" min="0" step="any" placeholder="value" style="width:90px">';
    html += '<select id="cu-' + i + '">';
    html += '<option value="uF"' + (defUnit === 'uF' ? ' selected' : '') + '>uF</option>';
    html += '<option value="nF"' + (defUnit === 'nF' ? ' selected' : '') + '>nF</option>';
    html += '<option value="pF"' + (defUnit === 'pF' ? ' selected' : '') + '>pF</option>';
    html += '</select><br>';
  }
  html += '<br><button onclick="calculate()">Calculate</button>';
  document.getElementById('inputs-area').innerHTML = html;
}

function toFarads(val, unit) {
  if (unit === 'uF') return val * 1e-6;
  if (unit === 'nF') return val * 1e-9;
  return val * 1e-12;
}

function formatF(f) {
  var uF = f * 1e6, nF = f * 1e9, pF = f * 1e12;
  if (uF >= 1) return { val: uF, label: 'uF' };
  if (nF >= 1) return { val: nF, label: 'nF' };
  return { val: pF, label: 'pF' };
}

function prettyNum(n) {
  return parseFloat(parseFloat(n).toPrecision(6)).toLocaleString();
}

function calculate() {
  var n = numCapacitors;
  var mode = document.getElementById('mode').value;
  var vals = [];
  var labels = [];

  for (var i = 1; i <= n; i++) {
    var el = document.getElementById('cv-' + i);
    var uel = document.getElementById('cu-' + i);
    if (!el || !uel) { showError('Please click "Set capacitors" before calculating.'); return; }
    var v = parseFloat(el.value);
    var u = uel.value;
    if (el.value === '' || isNaN(v) || v < 0) {
      showError('Please enter a valid non-negative value for C' + i + '.');
      return;
    }
    vals.push(toFarads(v, u));
    labels.push(v + ' ' + u);
  }
  clearError();

  var totalF, formula;

  if (mode === 'parallel') {
    totalF = 0;
    for (var j = 0; j < vals.length; j++) totalF += vals[j];
    formula = 'C_total = ' + labels.join(' + ');
  } else {
    for (var k = 0; k < vals.length; k++) {
      if (vals[k] === 0) { showError('Series capacitance with a 0 F capacitor is undefined.'); return; }
    }
    var sumRecip = 0;
    for (var m = 0; m < vals.length; m++) sumRecip += 1 / vals[m];
    totalF = 1 / sumRecip;
    var recipLabels = labels.map(function(l) { return '1/(' + l + ')'; });
    formula = '1/C_total = ' + recipLabels.join(' + ');
  }

  var fmt = formatF(totalF);
  formula += '\nC_total = ' + prettyNum(fmt.val) + ' ' + fmt.label;

  document.getElementById('C_out').textContent = prettyNum(fmt.val) + ' ' + fmt.label;
  //document.getElementById('res-formula').textContent = formula;
}

function showError(msg) {
  document.getElementById('error').textContent = msg;
}

function clearError() {
  document.getElementById('error').textContent = '';
}

buildInputs();
