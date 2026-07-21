#!/usr/bin/env python3
"""Build the RF Toolbox textbook: convert the 64 wiki_*.html articles into
LaTeX chapters (re-sequenced into 10 Parts), rendering their inline SVG
figures to PDF via rsvg-convert. Emits textbook/chapters/*.tex, textbook/
figures/*.pdf and textbook/_book_body.tex (the \\part/\\include spine)."""
import os, re, html, subprocess, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TB   = os.path.join(ROOT, 'textbook')
CHDIR = os.path.join(TB, 'chapters'); FIGDIR = os.path.join(TB, 'figures')
os.makedirs(CHDIR, exist_ok=True); os.makedirs(FIGDIR, exist_ok=True)

# ---------------------------------------------------------------- manifest
PARTS = [
 ("Electromagnetic Foundations",
  [("wiki_maxwells","Maxwell's Equations"),
   ("wiki_em_waves","Electromagnetic Waves"),
   ("wiki_dielectrics","Dielectrics and Permittivity"),
   ("wiki_magnetic_materials","Magnetic Materials"),
   ("wiki_skin_effect","Skin Effect")]),
 ("Transmission Lines and Impedance",
  [("wiki_db_dbm","Decibels, dBm and RF Power Units"),
   ("wiki_complex_impedance","Complex Impedance and Reactance"),
   ("wiki_transmission_lines","Transmission Line Theory"),
   ("wiki_tl_loss","Transmission Line Loss and Attenuation"),
   ("wiki_vswr","VSWR, Return Loss and Reflection Coefficient"),
   ("wiki_smith_chart_tutorial","The Smith Chart"),
   ("wiki_sparam","S-Parameters"),
   ("wiki_impedance_matching","Impedance Matching")]),
 ("Guided-Wave Structures and Interconnect",
  [("wiki_microwave_lines","Microwave Transmission Lines"),
   ("wiki_pcb_rf","RF PCB Design"),
   ("wiki_coax_cable","Coaxial Cable"),
   ("wiki_connectors","RF Connectors"),
   ("wiki_waveguide","Waveguides"),
   ("wiki_vna","VNA Measurements and Calibration")]),
 ("Passive Components, Resonators and Filters",
  [("wiki_eseries","E-Series Standard Component Values"),
   ("wiki_coupled_resonators","Coupled Resonators"),
   ("wiki_attenuators","RF Attenuators"),
   ("wiki_power_dividers","Power Dividers and Combiners"),
   ("wiki_balun","BALUNs and Hybrids"),
   ("wiki_microwave_components","Microwave Passive Components"),
   ("wiki_filters","RF Filters"),
   ("wiki_group_delay","Group Delay and Phase Linearity"),
   ("wiki_stepped_impedance","Stepped-Impedance Low-Pass Filters"),
   ("tb_adv_filters","Advanced Filters"),
   ("tb_control","Switches, Phase Shifters and Ferrite Devices")]),
 ("Active Devices and Amplifier Design",
  [("tb_transistors","RF Transistors"),
   ("tb_diodes","RF Diodes and Varactors"),
   ("wiki_amplifiers","RF Amplifiers"),
   ("wiki_amp_stability","Amplifier Stability"),
   ("tb_ssamp","Small-Signal Amplifier Design"),
   ("tb_lna","Low-Noise Amplifier Design"),
   ("wiki_noise","Noise in RF Systems"),
   ("wiki_pa_design","Power Amplifier Design"),
   ("wiki_thermal","Thermal Management and Junction Temperature"),
   ("wiki_intermodulation","Intermodulation Distortion and IP3")]),
 ("Signal Generation and Frequency Conversion",
  [("wiki_oscillators","Oscillators"),
   ("wiki_crystals","Quartz Crystal Resonators"),
   ("tb_oscdesign","Oscillator Design"),
   ("wiki_phase_noise","Phase Noise and Jitter"),
   ("wiki_pll","Phase-Locked Loops and Frequency Synthesis"),
   ("tb_synth","PLL and Synthesizer Design"),
   ("wiki_mixers","Mixers and Frequency Conversion"),
   ("wiki_modulation","Modulation Schemes")]),
 ("Antennas and Propagation",
  [("wiki_antennas","Antenna Fundamentals"),
   ("wiki_polarisation","Antenna Polarisation"),
   ("wiki_yagi","Yagi-Uda Antennas"),
   ("wiki_helical","Helical Antennas"),
   ("wiki_aperture_antennas","Aperture Antennas: Reflectors and Horns"),
   ("tb_antenna_types","Antenna Types"),
   ("tb_beamforming","Phased Arrays and Beamforming"),
   ("tb_propagation","Radio Propagation and Fading"),
   ("tb_antenna_meas","Antenna Measurement")]),
 ("RF Systems, Receivers and Communications",
  [("wiki_frequency_bands","RF Frequency Bands"),
   ("wiki_superheterodyne","The Superheterodyne Receiver"),
   ("tb_rxarch","Receiver Architectures"),
   ("wiki_cascade_analysis","Receiver Cascade Analysis"),
   ("tb_gainplan","Gain Planning and Dynamic Range"),
   ("tb_iq","I/Q Modulation and Impairments"),
   ("tb_sampling","Sampling and Data Conversion"),
   ("tb_sdr","Software-Defined Radio"),
   ("wiki_link_budget","Link Budgets"),
   ("wiki_radar","Radar Fundamentals"),
   ("wiki_fmcw_radar","FMCW and Pulsed Radar"),
   ("tb_digital_comm","Digital Communication Fundamentals"),
   ("tb_coding","Coding, Spread Spectrum and OFDM")]),
 ("Measurement, EMC and RF Safety",
  [("tb_measurement","RF Measurement and Instrumentation"),
   ("tb_cad","RF Simulation and Design Flow"),
   ("wiki_emc_shielding","EMC Shielding Effectiveness"),
   ("wiki_rf_safety","RF Safety and Human Exposure")]),
 ("MRI Physics and Coil Engineering",
  [("wiki_nmr_basics","NMR Basics"),
   ("wiki_mri_hardware","MRI Hardware"),
   ("wiki_mri_gradients","MRI Gradient Coils"),
   ("wiki_mri_sequences","MRI Pulse Sequences"),
   ("wiki_mri_contrast","MRI Contrast and Relaxation"),
   ("wiki_mri_artifacts","MRI Artefacts"),
   ("wiki_coil_design","RF Coil Design for MRI"),
   ("wiki_coil_types","MRI Coil Types"),
   ("wiki_birdcage","The Birdcage Coil"),
   ("wiki_coil_snr","SNR in MRI Receive Coils"),
   ("wiki_preamplifier_decoupling","Preamplifier Decoupling"),
   ("wiki_phased_arrays","Phased-Array Coils"),
   ("wiki_parallel_imaging","Parallel Imaging"),
   ("wiki_b1_mapping","B1 Field Mapping"),
   ("wiki_sar","SAR and RF Safety in MRI")]),
]

# ---------------------------------------------------------------- helpers
def balanced_div(s, start):
    """Return (inner, end_index_after_close) for a <div ...> starting at `start`."""
    i = s.index('>', start) + 1
    depth = 1; j = i
    for m in re.finditer(r'<(/?)div\b', s[i:]):
        if m.group(1): depth -= 1
        else: depth += 1
        if depth == 0:
            k = i + m.start()
            return s[i:k], s.index('>', i + m.end()-1) + 1
        j = i + m.end()
    return s[i:], len(s)

def extract_wa(s):
    m = re.search(r'<div class="wa">', s)
    if not m: return None
    inner, _ = balanced_div(s, m.start())
    inner = re.sub(r'<h3\b[^>]*>.*?</h3>', '', inner, count=1, flags=re.S)  # drop title
    return inner

def unwrap_figrows(s):
    while True:
        m = re.search(r'<div class="fig-row">', s)
        if not m: break
        inner, end = balanced_div(s, m.start())
        s = s[:m.start()] + inner + s[end:]
    return s

SPECIAL = {'\\':r'\textbackslash{}','&':r'\&','%':r'\%','$':r'\$','#':r'\#',
           '_':r'\_','{':r'\{','}':r'\}','~':r'\textasciitilde{}',
           '^':r'\textasciicircum{}','<':r'\textless{}','>':r'\textgreater{}'}
def esc(t):
    return re.sub(r'[\\&%$#_{}~^<>]', lambda m: SPECIAL[m.group()], t)

def inline(t):
    """Escape text but keep inline math \\(..\\) -> $..$ and figure tokens raw."""
    out = []
    for seg in re.split(r'(@@FIG\d+@@)', t):
        if re.fullmatch(r'@@FIG\d+@@', seg or ''):
            out.append(seg); continue
        # split math
        parts = re.split(r'(\\\(.*?\\\))', seg, flags=re.S)
        for p in parts:
            if p.startswith('\\(') and p.endswith('\\)'):
                out.append('$' + p[2:-2] + '$')
            else:
                out.append(esc(p))
    return ''.join(out)

# ---------------------------------------------------------------- converter
class Conv(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = []; self.stack = [self.root]  # output buffers
        self.skip = 0                # inside svg/script/style
        self.in_eq = 0
        self.table = None            # {'rows':[], 'row':[], 'header':False}
        self.cell = None
    # buffer helpers
    def emit(self, x): self.stack[-1].append(x)
    def push(self): b=[]; self.stack.append(b); return b
    def pop(self): return ''.join(self.stack.pop())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('svg','script','style'): self.skip += 1; return
        if self.skip: return
        cls = a.get('class','')
        if tag == 'div':
            if 'eq' in cls.split(): self.in_eq += 1; self.push()
            return
        if tag in ('p',): self.emit('\n\n'); return
        if tag == 'h4': self.emit('\n\n\\section{'); self.push(); return
        if tag in ('h5','h6'): self.emit('\n\n\\subsection{'); self.push(); return
        if tag == 'ul': self.emit('\n\\begin{itemize}\n'); return
        if tag == 'ol': self.emit('\n\\begin{enumerate}\n'); return
        if tag == 'li': self.emit('\\item '); return
        if tag in ('strong','b'): self.emit('\\textbf{'); return
        if tag in ('em','i'): self.emit('\\emph{'); return
        if tag in ('code','tt','kbd'): self.emit('\\texttt{'); return
        if tag == 'sub': self.emit('\\textsubscript{'); return
        if tag == 'sup': self.emit('\\textsuperscript{'); return
        if tag == 'br': self.emit('\\newline '); return
        if tag == 'a':
            href = a.get('href','')
            if href and not href.startswith('#'):
                if not href.startswith('http'): href = 'https://rftoolbox.ca/' + href
                self.emit('\\href{'+href+'}{'); self._alink = True
            else: self._alink = False
            return
        if tag == 'table':
            self.table = {'rows':[], 'row':[], 'header':False}; return
        if tag == 'tr':
            if self.table is not None: self.table['row'] = []
            return
        if tag in ('td','th'):
            if self.table is not None:
                if tag == 'th' and not self.table['rows']: self.table['header'] = True
                self.cell = tag; self.push()
            return
        # span, details, summary, figure(handled), etc. -> passthrough

    def handle_endtag(self, tag):
        if tag in ('svg','script','style'):
            if self.skip: self.skip -= 1
            return
        if self.skip: return
        if tag == 'div':
            # close eq if we're in one (assumes eq divs not nested in other divs)
            if self.in_eq:
                inner = self.pop().strip()
                m = re.fullmatch(r'\\\((.*)\\\)', inner, re.S)
                if m:                                   # pure display math
                    self.emit('\n\\[' + m.group(1).strip() + '\\]\n')
                else:                                   # math + prose callout
                    self.emit('\n\n\\noindent\\hspace*{1.2em}\\textit{' + inline(inner) + '}\n\n')
                self.in_eq -= 1
            return
        if tag == 'p': self.emit('\n\n'); return
        if tag == 'h4': self.emit(self.pop().strip() + '}\n'); return
        if tag in ('h5','h6'): self.emit(self.pop().strip() + '}\n'); return
        if tag == 'ul': self.emit('\n\\end{itemize}\n'); return
        if tag == 'ol': self.emit('\n\\end{enumerate}\n'); return
        if tag == 'li': self.emit('\n'); return
        if tag in ('strong','b','em','i','code','tt','kbd','sub','sup'): self.emit('}'); return
        if tag == 'a':
            if getattr(self,'_alink',False): self.emit('}')
            return
        if tag in ('td','th'):
            if self.table is not None and self.cell:
                self.table['row'].append(self.pop().strip()); self.cell = None
            return
        if tag == 'tr':
            if self.table is not None and self.table['row']:
                self.table['rows'].append(self.table['row']); self.table['row'] = []
            return
        if tag == 'table':
            self.emit(self._render_table(self.table)); self.table = None; return

    def handle_data(self, data):
        if self.skip: return
        if self.in_eq:
            self.emit(data); return          # raw TeX inside .eq
        # figure tokens + inline text
        self.emit(inline(data))

    def _render_table(self, t):
        rows = t['rows']
        if not rows: return ''
        n = max(len(r) for r in rows)
        w = 0.92 / n
        col = '>{\\raggedright\\arraybackslash}p{%.3f\\linewidth}' % w
        spec = ''.join(col for _ in range(n))
        out = ['\n\n{\\small\\begin{longtable}{'+spec+'}\n\\hline\n']
        for i, r in enumerate(rows):
            cells = r + ['']*(n-len(r))
            if i == 0 and t['header']:
                cells = ['\\textbf{'+c+'}' for c in cells]
            out.append(' & '.join(cells) + ' \\\\\n')
            if i == 0 and t['header']: out.append('\\hline\n')
        out.append('\\hline\n\\end{longtable}}\n\n')
        return ''.join(out)

# ---------------------------------------------------------------- per-file
def render_svg(svg, path):
    if os.path.exists(path):          # keep existing figures stable (rsvg embeds a
        return True                   # timestamp, so re-rendering churns git). Delete
                                      # figures/ to force a full re-render.
    try:
        with open('/tmp/_f.svg','w',encoding='utf-8') as fh:
            fh.write('<?xml version="1.0" encoding="UTF-8"?>\n'+svg)
        subprocess.run(['rsvg-convert','-f','pdf','-o',path,'/tmp/_f.svg'],
                       check=True, capture_output=True)
        return True
    except Exception as e:
        sys.stderr.write('  figure FAIL %s: %s\n' % (path, e)); return False

def convert(slug, title):
    src = os.path.join(ROOT, slug + '.html')
    s = open(src, encoding='utf-8').read()
    wa = extract_wa(s)
    if wa is None: raise RuntimeError('no .wa in '+slug)
    wa = unwrap_figrows(wa)
    wa = re.sub(r'<!--.*?-->', '', wa, flags=re.S)
    wa = wa.replace('\xa0', ' ').replace('&nbsp;', ' ')
    # extract figures -> tokens
    figs = []
    def figrepl(m):
        block = m.group(0)
        sm = re.search(r'<svg\b.*?</svg>', block, re.S)
        cm = re.search(r'<figcaption\b[^>]*>(.*?)</figcaption>', block, re.S)
        if not sm: return ''
        k = len(figs)
        fname = '%s_%d.pdf' % (slug, k+1)
        ok = render_svg(sm.group(0), os.path.join(FIGDIR, fname))
        cap = cm.group(1) if cm else ''
        figs.append((fname, cap, ok))
        return '\n@@FIG%d@@\n' % k
    wa = re.sub(r'<figure\b.*?</figure>', figrepl, wa, flags=re.S)
    # convert HTML -> LaTeX
    c = Conv(); c.feed(wa); c.close()
    body = ''.join(c.root)
    # substitute figure tokens
    def tokrepl(m):
        k = int(m.group(1)); fname, cap, ok = figs[k]
        if not ok: return ''
        cap_tex = inline(html.unescape(cap)).strip() if cap else ''
        cap_arg = cap_tex if cap_tex else '\\relax'
        return '\n\\rffig{%s}{%s}\n' % (fname, cap_arg)
    body = re.sub(r'@@FIG(\d+)@@', tokrepl, body)
    # tidy blank lines
    body = re.sub(r'\n{3,}', '\n\n', body).strip()
    ped = os.path.join(TB, 'pedagogy')
    obj  = ('\\input{pedagogy/%s_obj}\n\n' % slug) if os.path.exists(os.path.join(ped, slug+'_obj.tex')) else ''
    prac = ('\n\n\\input{pedagogy/%s}\n' % slug) if os.path.exists(os.path.join(ped, slug+'.tex')) else ''
    tex = ('%% chapter: %s\n\\chapter{%s}\\label{ch:%s}\n\n%s%s\n%s'
           % (slug, title.replace('&','\\&'), slug, obj, body, prac))
    open(os.path.join(CHDIR, slug + '.tex'), 'w', encoding='utf-8').write(tex)
    return len(figs), sum(1 for f in figs if not f[2])

def convert_native(slug, title):
    """Hand-authored chapter: body LaTeX lives in textbook/native/<slug>.tex."""
    body = open(os.path.join(TB, 'native', slug + '.tex'), encoding='utf-8').read().strip()
    ped = os.path.join(TB, 'pedagogy')
    obj  = ('\\input{pedagogy/%s_obj}\n\n' % slug) if os.path.exists(os.path.join(ped, slug+'_obj.tex')) else ''
    prac = ('\n\n\\input{pedagogy/%s}\n' % slug) if os.path.exists(os.path.join(ped, slug+'.tex')) else ''
    tex = ('%% chapter: %s (native)\n\\chapter{%s}\\label{ch:%s}\n\n%s%s\n%s'
           % (slug, title.replace('&','\\&'), slug, obj, body, prac))
    open(os.path.join(CHDIR, slug + '.tex'), 'w', encoding='utf-8').write(tex)
    return 0, 0

# ---------------------------------------------------------------- drive
def roman(n):
    vals=[(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]; r=''
    for v,sy in vals:
        while n>=v: r+=sy; n-=v
    return r

body_lines = []; sol_lines = []; total_fig = 0; total_bad = 0; nch = 0; nsol = 0
for pi,(ptitle, chs) in enumerate(PARTS, 1):
    body_lines.append('\n\\part{%s}\n' % ptitle.replace('&','\\&'))
    for slug, title in chs:
        if os.path.exists(os.path.join(ROOT, slug + '.html')):
            nf, bad = convert(slug, title)
        else:
            nf, bad = convert_native(slug, title)
        total_fig += nf; total_bad += bad; nch += 1
        body_lines.append('\\include{chapters/%s}' % slug)
        if os.path.exists(os.path.join(TB, 'pedagogy', slug + '_sol.tex')):
            sol_lines.append('\\needspace{4\\baselineskip}\\subsection*{Chapter~\\ref{ch:%s}: %s}'
                             % (slug, title.replace('&','\\&')))
            sol_lines.append('\\input{pedagogy/%s_sol}' % slug); nsol += 1
    print('Part %s — %s (%d chapters)' % (roman(pi), ptitle, len(chs)))
open(os.path.join(TB, '_book_body.tex'), 'w').write('\n'.join(body_lines)+'\n')
open(os.path.join(TB, '_solutions.tex'), 'w').write('\n'.join(sol_lines)+'\n')
print('\n%d chapters, %d figures rendered (%d failed), %d solution sets'
      % (nch, total_fig, total_bad, nsol))
