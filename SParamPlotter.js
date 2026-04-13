/* S-Parameter Plotter — Touchstone file parser and Chart.js renderer */

var parsedData = null; // { freqHz[], nPorts, params: { 'S11': [{re,im},...], ... } }

// ── Colour palette per parameter ─────────────────────────────────────────────
var COLORS = [
  '#AA77FF','#00ccff','#ff6644','#00ffcc','#ffcc00',
  '#ff44aa','#88dd00','#ff8800','#4488ff','#cc44ff',
  '#00ff88','#ff4466','#aabb00','#00aaff','#ff6600','#9933cc'
];

// ── Drag and drop setup ───────────────────────────────────────────────────────
var dropZone = document.getElementById('drop-zone');
var fileInput = document.getElementById('file-input');

dropZone.addEventListener('dragover', function(e) {
  e.preventDefault(); dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', function() {
  dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', function(e) {
  e.preventDefault(); dropZone.classList.remove('drag-over');
  var file = e.dataTransfer.files[0];
  if (file) loadFile(file);
});
fileInput.addEventListener('change', function() {
  if (fileInput.files[0]) loadFile(fileInput.files[0]);
});

function loadFile(file) {
  document.getElementById('sp-error').textContent = '';
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      parsedData = parseTouchstone(e.target.result, file.name);
      showFileInfo(file.name, parsedData);
      buildParamChecks(parsedData);
      document.getElementById('controls-wrap').style.display = 'block';
      document.getElementById('charts-wrap').innerHTML = '';
      renderCharts();
    } catch(err) {
      document.getElementById('sp-error').textContent = 'Parse error: ' + err.message;
      document.getElementById('controls-wrap').style.display = 'none';
    }
  };
  reader.readAsText(file);
}

// ── Touchstone parser ─────────────────────────────────────────────────────────
function parseTouchstone(text, filename) {
  // Detect number of ports from extension
  var extMatch = filename.match(/\.s(\d+)p$/i);
  var nPorts = extMatch ? parseInt(extMatch[1]) : null;

  var lines = text.split(/\r?\n/);
  var freqUnit = 'GHz';
  var dataFormat = 'MA'; // MA, DB, RI
  var refImpedance = 50;
  var dataLines = [];
  var optionFound = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line === '' || line.charAt(0) === '!') continue; // comment/blank

    if (line.charAt(0) === '#') {
      // Option line: # [freq_unit] [param_type] [data_format] R [impedance]
      var parts = line.slice(1).trim().toUpperCase().split(/\s+/);
      for (var p = 0; p < parts.length; p++) {
        if (['HZ','KHZ','MHZ','GHZ','THZ'].indexOf(parts[p]) !== -1) freqUnit = parts[p];
        if (['MA','DB','RI'].indexOf(parts[p]) !== -1) dataFormat = parts[p];
        if (parts[p] === 'R' && parts[p+1]) refImpedance = parseFloat(parts[p+1]);
      }
      optionFound = true;
      continue;
    }

    // Strip inline comments
    var commentIdx = line.indexOf('!');
    if (commentIdx !== -1) line = line.slice(0, commentIdx).trim();
    if (line === '') continue;
    dataLines.push(line);
  }

  if (!optionFound) {
    // Try to guess — assume default GHz MA 50 ohm
  }

  // Determine nPorts from data if not from extension
  if (!nPorts) {
    // First data line token count: 1 + 2*nPorts*nPorts values (for 2+ ports)
    // or 1 + 2 for 1-port
    var firstTokens = dataLines[0].split(/\s+/).filter(Boolean);
    var valCount = firstTokens.length - 1; // minus frequency
    // valCount = 2*nPorts^2, or for multiline it could be less
    // Try common port counts
    for (var n = 1; n <= 8; n++) {
      if (valCount === 2 * n * n) { nPorts = n; break; }
    }
    if (!nPorts) nPorts = 2; // fallback
  }

  // Convert all data lines into a flat token array (handles multi-line entries)
  var allTokens = [];
  for (var d = 0; d < dataLines.length; d++) {
    var toks = dataLines[d].split(/\s+/).filter(Boolean);
    for (var t = 0; t < toks.length; t++) allTokens.push(parseFloat(toks[t]));
  }

  // Each frequency point: 1 freq value + 2 * nPorts^2 values
  var valsPerPoint = 1 + 2 * nPorts * nPorts;
  // For 1-port: 1 + 2 = 3 tokens
  // For 2-port: 1 + 8 = 9 tokens
  // Note: for n>2, data wraps at 4 pairs per line but we've already flattened

  var freqHz = [];
  var rawParams = []; // array of { name, data: [{re,im}] }

  // Build param names in Touchstone order
  // For 2-port: S11 S21 S12 S22
  var paramNames = [];
  for (var row = 1; row <= nPorts; row++) {
    for (var col = 1; col <= nPorts; col++) {
      paramNames.push('S' + row + '' + col);
    }
  }
  for (var pn = 0; pn < paramNames.length; pn++) {
    rawParams.push({ name: paramNames[pn], data: [] });
  }

  // Frequency multiplier
  var freqMul = { 'HZ':1,'KHZ':1e3,'MHZ':1e6,'GHZ':1e9,'THZ':1e12 }[freqUnit] || 1e9;

  var idx = 0;
  while (idx + valsPerPoint <= allTokens.length) {
    var freq = allTokens[idx] * freqMul;
    freqHz.push(freq);
    idx++;
    for (var sp = 0; sp < nPorts * nPorts; sp++) {
      var a = allTokens[idx], b = allTokens[idx+1];
      idx += 2;
      var re, im;
      if (dataFormat === 'RI') {
        re = a; im = b;
      } else if (dataFormat === 'MA') {
        var angRad = b * Math.PI / 180;
        re = a * Math.cos(angRad);
        im = a * Math.sin(angRad);
      } else if (dataFormat === 'DB') {
        var mag = Math.pow(10, a / 20);
        var angRad2 = b * Math.PI / 180;
        re = mag * Math.cos(angRad2);
        im = mag * Math.sin(angRad2);
      }
      rawParams[sp].data.push({ re: re, im: im });
    }
  }

  if (freqHz.length === 0) throw new Error('No data points found in file.');

  // Build result object
  var params = {};
  for (var rp = 0; rp < rawParams.length; rp++) {
    params[rawParams[rp].name] = rawParams[rp].data;
  }

  return {
    freqHz: freqHz,
    nPorts: nPorts,
    params: params,
    paramNames: paramNames,
    refImpedance: refImpedance,
    dataFormat: dataFormat,
    freqUnit: freqUnit
  };
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showFileInfo(filename, d) {
  var fmin = formatFreq(d.freqHz[0]);
  var fmax = formatFreq(d.freqHz[d.freqHz.length - 1]);
  var el = document.getElementById('file-info');
  el.style.display = 'block';
  el.innerHTML =
    '<strong>' + escHtml(filename) + '</strong> &nbsp;|&nbsp; ' +
    d.nPorts + '-port &nbsp;|&nbsp; ' +
    d.freqHz.length + ' points &nbsp;|&nbsp; ' +
    fmin + ' – ' + fmax + ' &nbsp;|&nbsp; ' +
    'Z\u2080 = ' + d.refImpedance + '\u03A9 &nbsp;|&nbsp; ' +
    'Format: ' + d.dataFormat;
}

function buildParamChecks(d) {
  var wrap = document.getElementById('param-checks');
  wrap.innerHTML = '';
  d.paramNames.forEach(function(name, i) {
    var color = COLORS[i % COLORS.length];
    var label = document.createElement('label');
    label.style.borderColor = color;
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = name; cb.id = 'cb-' + name;
    cb.checked = true;
    var dot = document.createElement('span');
    dot.style.cssText = 'display:inline-block;width:10px;height:10px;border-radius:50%;background:' + color + ';';
    label.appendChild(cb);
    label.appendChild(dot);
    label.appendChild(document.createTextNode(' ' + name));
    wrap.appendChild(label);
  });
}

function getSelectedParams() {
  var selected = [];
  document.querySelectorAll('#param-checks input[type=checkbox]').forEach(function(cb) {
    if (cb.checked) selected.push(cb.value);
  });
  return selected;
}

function formatFreq(hz) {
  if (hz >= 1e9) return (hz/1e9).toPrecision(4) + ' GHz';
  if (hz >= 1e6) return (hz/1e6).toPrecision(4) + ' MHz';
  if (hz >= 1e3) return (hz/1e3).toPrecision(4) + ' kHz';
  return hz + ' Hz';
}

function freqAxisLabel(freqHz) {
  var max = freqHz[freqHz.length - 1];
  if (max >= 1e9) return { vals: freqHz.map(function(f){return f/1e9;}), unit: 'GHz' };
  if (max >= 1e6) return { vals: freqHz.map(function(f){return f/1e6;}), unit: 'MHz' };
  if (max >= 1e3) return { vals: freqHz.map(function(f){return f/1e3;}), unit: 'kHz' };
  return { vals: freqHz.slice(), unit: 'Hz' };
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Math helpers ──────────────────────────────────────────────────────────────
function toMagDB(c) {
  var mag = Math.sqrt(c.re*c.re + c.im*c.im);
  return mag > 0 ? 20 * Math.log10(mag) : -200;
}
function toPhase(c) {
  return Math.atan2(c.im, c.re) * 180 / Math.PI;
}
function toVSWR(c) {
  var mag = Math.sqrt(c.re*c.re + c.im*c.im);
  if (mag >= 1) return 999;
  return (1 + mag) / (1 - mag);
}

// ── Chart rendering ───────────────────────────────────────────────────────────
var chartInstances = [];

function destroyCharts() {
  chartInstances.forEach(function(ch) { ch.destroy(); });
  chartInstances = [];
}

function makeDatasets(selected, fn) {
  return selected.map(function(name, i) {
    var colorIdx = parsedData.paramNames.indexOf(name);
    var color = COLORS[colorIdx % COLORS.length];
    return {
      label: name,
      data: parsedData.params[name].map(fn),
      borderColor: color,
      backgroundColor: 'transparent',
      borderWidth: 1.8,
      pointRadius: parsedData.freqHz.length > 200 ? 0 : 2,
      tension: 0.1
    };
  });
}

function buildChart(canvasId, title, datasets, freqData, yLabel, isLog) {
  var ctx = document.getElementById(canvasId).getContext('2d');
  var ch = new Chart(ctx, {
    type: 'line',
    data: {
      labels: freqData.vals.map(function(v) { return parseFloat(v.toPrecision(5)); }),
      datasets: datasets
    },
    options: {
      responsive: true,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { font: { family: 'monospace', size: 12 }, color: '#333' } },
        tooltip: {
          callbacks: {
            title: function(items) {
              return formatFreq(parsedData.freqHz[items[0].dataIndex]);
            },
            label: function(item) {
              return item.dataset.label + ': ' + item.parsed.y.toFixed(3) + ' ' + yLabel;
            }
          }
        }
      },
      scales: {
        x: {
          type: isLog ? 'logarithmic' : 'linear',
          title: { display: true, text: 'Frequency (' + freqData.unit + ')', font: { family: 'monospace', size: 11 } },
          ticks: { font: { family: 'monospace', size: 10 }, maxTicksLimit: 10 }
        },
        y: {
          title: { display: true, text: yLabel, font: { family: 'monospace', size: 11 } },
          ticks: { font: { family: 'monospace', size: 10 } }
        }
      }
    }
  });
  chartInstances.push(ch);
}

function renderCharts() {
  if (!parsedData) return;
  destroyCharts();

  var selected = getSelectedParams();
  if (selected.length === 0) {
    document.getElementById('charts-wrap').innerHTML = '<p style="font-family:monospace;font-size:13px;color:#c0392b;">Select at least one parameter.</p>';
    return;
  }

  var plotType = document.getElementById('plot-type').value;
  var isLog = document.getElementById('freq-scale').value === 'log';
  var freqData = freqAxisLabel(parsedData.freqHz);
  var wrap = document.getElementById('charts-wrap');
  wrap.innerHTML = '';

  function addChart(id, title, yLabel) {
    var div = document.createElement('div');
    div.className = 'chart-wrap';
    var titleEl = document.createElement('div');
    titleEl.className = 'chart-title';
    titleEl.textContent = title;
    var canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.style.maxHeight = '320px';
    div.appendChild(titleEl);
    div.appendChild(canvas);
    wrap.appendChild(div);
  }

  if (plotType === 'mag' || plotType === 'both') {
    addChart('chart-mag', 'Magnitude (dB)', 'dB');
    buildChart('chart-mag', 'Magnitude', makeDatasets(selected, toMagDB), freqData, 'dB', isLog);
  }
  if (plotType === 'phase' || plotType === 'both') {
    addChart('chart-phase', 'Phase (degrees)', 'deg');
    buildChart('chart-phase', 'Phase', makeDatasets(selected, toPhase), freqData, 'deg', isLog);
  }
  if (plotType === 'vswr') {
    // Only reflection parameters (Sii) make sense for VSWR
    var reflSelected = selected.filter(function(n) {
      return n.length === 3 && n[1] === n[2];
    });
    if (reflSelected.length === 0) reflSelected = selected;
    addChart('chart-vswr', 'VSWR', '');
    buildChart('chart-vswr', 'VSWR', makeDatasets(reflSelected, toVSWR), freqData, 'VSWR', isLog);
  }
  if (plotType === 'ri') {
    addChart('chart-re', 'Real part', '');
    buildChart('chart-re', 'Real', makeDatasets(selected, function(c){ return c.re; }), freqData, 'Re', isLog);
    addChart('chart-im', 'Imaginary part', '');
    buildChart('chart-im', 'Imaginary', makeDatasets(selected, function(c){ return c.im; }), freqData, 'Im', isLog);
  }
}
