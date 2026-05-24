var CIRCUITS = {

rc_lpf: {
	title: 'RC LOW-PASS FILTER',
	text:
'$ 1 0.000005 10.20027730826997 50 5 50 5e-11\n' +
'v 192 384 192 160 0 1 10000 5 0 0 0.5\n' +
'r 192 160 352 160 0 1000\n' +
'c 352 160 352 384 0 1.5915494309189535e-8 0\n' +
'w 192 384 352 384 0\n' +
'o 2 64 0 4099 10 0.1 0 2 0 3\n' +
'o 3 64 0 4099 10 0.1 1 2 3 3\n' +
'38 2 0\n'
},

rc_hpf: {
	title: 'RC HIGH-PASS FILTER',
	text:
'$ 1 0.000005 10.20027730826997 50 5 50 5e-11\n' +
'v 192 384 192 160 0 1 10000 5 0 0 0.5\n' +
'c 192 160 352 160 0 1.5915494309189535e-8 0\n' +
'r 352 160 352 384 0 1000\n' +
'w 192 384 352 384 0\n' +
'o 3 64 0 4099 10 0.1 0 2 0 3\n' +
'38 2 0\n'
},

lc_res: {
	title: 'LC RESONATOR (parallel tank)',
	text:
'$ 1 5e-9 10.20027730826997 50 5 50 5e-11\n' +
'v 192 400 192 160 0 1 159154943 1 0 0 0.5\n' +
'r 192 160 320 160 0 50\n' +
'w 320 160 416 160 0\n' +
'l 416 160 416 304 0 1e-7 0\n' +
'c 416 304 416 400 0 1e-11 0\n' +
'w 192 400 416 400 0\n' +
'o 4 64 0 4099 5 0.05 0 2 0 3\n'
},

rlc: {
	title: 'SERIES RLC BANDPASS',
	text:
'$ 1 5e-9 10.20027730826997 50 5 50 5e-11\n' +
'v 160 384 160 160 0 1 100000000 1 0 0 0.5\n' +
'r 160 160 272 160 0 50\n' +
'l 272 160 384 160 0 7.957747154594767e-8 0\n' +
'c 384 160 384 384 0 3.183098861837907e-11 0\n' +
'r 384 160 496 160 0 50\n' +
'w 160 384 496 384 0\n' +
'g 496 384 496 432 0 0\n' +
'o 5 64 0 4099 5 0.05 0 2 0 3\n'
},

lc_bp: {
	title: 'LC BAND-PASS FILTER',
	text:
'$ 1 5e-9 10.20027730826997 50 5 50 5e-11\n' +
'v 160 400 160 160 0 1 159154943 1 0 0 0.5\n' +
'r 160 160 256 160 0 50\n' +
'l 256 160 368 160 0 1e-7 0\n' +
'c 368 160 368 400 0 1e-11 0\n' +
'r 368 160 480 160 0 50\n' +
'w 160 400 480 400 0\n' +
'g 480 400 480 448 0 0\n' +
'o 4 64 0 4099 5 0.05 0 2 0 3\n'
},

lmatch: {
	title: 'L-MATCH NETWORK (50→200 Ω @ 100 MHz)',
	text:
'$ 1 5e-9 10.20027730826997 50 5 50 5e-11\n' +
'v 160 384 160 160 0 1 100000000 1 0 0 0.5\n' +
'r 160 160 256 160 0 50\n' +
'l 256 160 368 160 0 6.366197723675814e-8 0\n' +
'c 368 160 368 384 0 3.1830988618379067e-10 0\n' +
'r 368 160 480 160 0 200\n' +
'w 160 384 480 384 0\n' +
'g 480 384 480 432 0 0\n' +
'o 4 64 0 4099 5 0.05 0 2 0 3\n'
},

divider: {
	title: 'RESISTIVE VOLTAGE DIVIDER',
	text:
'$ 1 0.000005 10.20027730826997 50 5 50 5e-11\n' +
'v 176 368 176 144 0 0 40 5 0 0 0.5\n' +
'r 176 144 336 144 0 10000\n' +
'r 336 144 336 368 0 10000\n' +
'w 176 368 336 368 0\n' +
'o 1 64 0 4098 5 0.1 0 2 1 3\n'
},

amp: {
	title: 'COMMON-EMITTER AMPLIFIER',
	text:
'$ 1 5e-9 10.20027730826997 50 5 50 5e-11\n' +
'v 160 528 160 160 0 0 40 12 0 0 0.5\n' +
'r 352 160 352 272 0 47000\n' +
'r 352 272 352 528 0 10000\n' +
'w 160 160 352 160 0\n' +
'w 352 160 592 160 0\n' +
'r 592 160 592 384 0 2200\n' +
't 528 272 592 272 0 1 -0.6 0.6 100\n' +
'r 352 272 528 272 0 0\n' +
'c 256 272 352 272 0 0.00001 0\n' +
'v 256 528 256 272 0 1 1000 0.1 0 0 0.5\n' +
'r 592 384 592 528 0 470\n' +
'c 592 384 752 384 0 0.0001 0\n' +
'r 752 384 752 528 0 1000\n' +
'g 752 528 752 576 0 0\n' +
'w 160 528 752 528 0\n' +
'o 10 64 0 4099 10 0.1 0 2 0 3\n' +
'o 12 64 0 4099 10 0.1 1 2 12 3\n'
}

};

// Encode circuit text as a Falstad cct URL parameter (URL-encoded plain text)
function encodeCct(text) {
	return encodeURIComponent(text);
}

function selectPreset(name) {
	document.querySelectorAll('.preset-btn').forEach(function(b){ b.classList.remove('active'); });
	document.getElementById('btn-'+name).classList.add('active');
	var c = CIRCUITS[name];
	if (!c) return;
	document.getElementById('circuit-title').textContent = c.title;
	document.getElementById('circuit-text').textContent = c.text;
	// Update "Open in new tab" link with pre-loaded circuit
	document.getElementById('open-link').href =
		'https://falstad.com/circuit/circuitjs.html?cct=' + encodeCct(c.text);
}

function copyCircuit() {
	var txt = document.getElementById('circuit-text').textContent;
	var btn = document.getElementById('copy-btn');
	// Try modern clipboard API first
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(txt).then(function() {
			btn.textContent = '✓ Copied!';
			btn.classList.add('copied');
			setTimeout(function() { btn.textContent = 'Copy Circuit Text'; btn.classList.remove('copied'); }, 2000);
		}).catch(fallbackCopy);
	} else {
		fallbackCopy();
	}
	function fallbackCopy() {
		var ta = document.createElement('textarea');
		ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
		document.body.appendChild(ta); ta.select();
		try { document.execCommand('copy'); btn.textContent = '✓ Copied!'; btn.classList.add('copied'); }
		catch(e) { btn.textContent = 'Copy failed'; }
		document.body.removeChild(ta);
		setTimeout(function() { btn.textContent = 'Copy Circuit Text'; btn.classList.remove('copied'); }, 2000);
	}
}

// Load default preset
selectPreset('rc_lpf');
