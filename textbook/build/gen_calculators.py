#!/usr/bin/env python3
"""Generate the 'Companion Calculators' appendix (textbook/_calculators.tex)
from the live homepage index.html. Parses the visual category sections
(cat-header) and the tool-cards within each, emitting a LaTeX chapter that
lists every calculator grouped by category, cross-referenced to the book Part
that covers it. Run:  python3 build/gen_calculators.py <path-to-index.html>"""
import os, re, html, sys

TB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# display category (ch-label)  ->  book chapter it maps to
SECTION_PART = {
 'Fundamentals & EM'          : 'Chapter~1 (Electromagnetic Foundations)',
 'Resonance & Passives'       : 'Chapter~4 (Passive Components, Resonators and Filters)',
 'Transmission Lines'         : 'Chapters~2--3 (Transmission Lines; Guided-Wave Structures)',
 'Matching & Dividers'        : 'Chapter~2 (Transmission Lines and Impedance)',
 'Filters & Attenuators'      : 'Chapter~4 (Passive Components, Resonators and Filters)',
 'Amplifiers & Devices'       : 'Chapters~5--6 (Active Devices; Signal Generation)',
 'Receivers & DSP'            : 'Chapter~8 (RF Systems, Receivers and Communications)',
 'Antennas & Arrays'          : 'Chapter~7 (Antennas and Propagation)',
 'Propagation, Radar & Links' : 'Chapter~8 (RF Systems, Receivers and Communications)',
 'Waveguide'                  : 'Chapter~3 (Guided-Wave Structures and Interconnect)',
 'MRI Coils & Tools'          : 'Chapter~10 (MRI Physics and Coil Engineering)',
 'Converters'                 : 'Chapters~2 and~9 (Impedance; Measurement)',
 'Simulators'                 : 'Chapters~2--4 (Impedance; Components)',
}

SPECIAL = {'\\':r'\textbackslash{}','&':r'\&','%':r'\%','$':r'\$','#':r'\#',
           '_':r'\_','{':r'\{','}':r'\}','~':r'\textasciitilde{}',
           '^':r'\textasciicircum{}'}
def esc(t):
    t = html.unescape(t)
    t = t.replace('→', ' ').replace('&rarr;', ' ')
    return re.sub(r'[\\&%$#_{}~^]', lambda m: SPECIAL[m.group()], t)

def parse(idx_path):
    s = open(idx_path, encoding='utf-8').read()
    # keep only the tool listing region (before the CAT_MAP script)
    s = s.split('var CAT_MAP')[0]
    sections = []           # [(label, [(name, desc, href), ...]), ...]
    # split on cat-header labels, preserving order
    parts = re.split(r'<div class="cat-header"[^>]*>.*?<span class="ch-label">(.*?)</span>', s, flags=re.S)
    # parts[0] is preamble; then alternating label, chunk
    for i in range(1, len(parts), 2):
        label = html.unescape(parts[i]).strip()
        chunk = parts[i+1]
        cards = []
        for m in re.finditer(
            r'<a class="tool-card" href="([^"]+)">.*?'
            r'<div class="tool-card-name">(.*?)</div>\s*'
            r'<div class="tool-card-desc">(.*?)</div>', chunk, flags=re.S):
            href, name, desc = m.group(1), m.group(2), m.group(3)
            cards.append((href.strip(), name.strip(), desc.strip()))
        if cards:
            sections.append((label, cards))
    return sections

def emit(sections):
    seen = set(); total = 0
    out = [r'\chapter{Companion Calculators}\label{ch:calculators}', '']
    out.append(r'''Every formula in this book has a companion interactive calculator at
\href{https://rftoolbox.ca}{rftoolbox.ca} --- enter your own numbers and read the
answer, with the same diagrams used here. The tools are listed below by category,
each cross-referenced to the chapter of this book that develops its theory. All are
free and run in the browser.''')
    out.append('')
    for label, cards in sections:
        part = SECTION_PART.get(label)
        out.append(r'\section*{%s}' % esc(label))
        out.append(r'\addcontentsline{toc}{section}{%s}' % esc(label))
        if part:
            out.append(r'\noindent\emph{See %s.}' % part)
        out.append(r'\begin{longtable}{>{\raggedright\arraybackslash}p{0.30\linewidth}>{\raggedright\arraybackslash}p{0.62\linewidth}}')
        out.append(r'\hline')
        for href, name, desc in cards:
            if href in seen:            # a tool cross-listed in two categories
                continue
            seen.add(href); total += 1
            url = 'https://rftoolbox.ca/' + href
            out.append(r'\href{%s}{\textbf{%s}} & %s \\' % (url, esc(name), esc(desc)))
        out.append(r'\hline')
        out.append(r'\end{longtable}')
        out.append('')
    open(os.path.join(TB, '_calculators.tex'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    return total, len(sections)

if __name__ == '__main__':
    idx = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(TB), 'index.html')
    secs = parse(idx)
    n, ns = emit(secs)
    print('wrote _calculators.tex: %d calculators across %d categories' % (n, ns))
