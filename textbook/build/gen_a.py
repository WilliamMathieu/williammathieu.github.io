#!/usr/bin/env python3
"""Generate pedagogy .tex files for Parts II-V (27 chapters)."""
import os
PED = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pedagogy')

def emit(slug, d):
    obj = ("\\begin{objectives}\n\\begin{itemize}[leftmargin=1.4em,itemsep=2pt]\n"
           + "\n".join("\\item " + x for x in d['obj'])
           + "\n\\end{itemize}\n\\end{objectives}\n")
    body = ("\\begin{workedexample}[%s]\n%s\n\\end{workedexample}\n\n" % (d['wt'], d['we'].strip())
            + "\\begin{keytakeaways}\n\\begin{itemize}[leftmargin=1.4em,itemsep=2pt]\n"
            + "\n".join("\\item " + x for x in d['kt'])
            + "\n\\end{itemize}\n\\end{keytakeaways}\n\n"
            + "\\begin{exercises}\n" + "\n".join("\\item " + x for x in d['ex']) + "\n\\end{exercises}\n\n"
            + "\\furtherreading{%s}\n" % d['read'])
    sol = ("\\begin{enumerate}[leftmargin=1.6em,itemsep=2pt]\n"
           + "\n".join("\\item " + x for x in d['sol']) + "\n\\end{enumerate}\n")
    open(os.path.join(PED, slug + '_obj.tex'), 'w').write(obj)
    open(os.path.join(PED, slug + '.tex'), 'w').write(body)
    open(os.path.join(PED, slug + '_sol.tex'), 'w').write(sol)

CH = {
'wiki_db_dbm': dict(
 obj=["Convert between watts, dBm, and dBW.",
      "Add gains and losses in dB along a signal chain.",
      "Distinguish dBm, dBc, dBi, and dBW."],
 wt="Worked Example: A gain chain in dBm",
 we=r"""An antenna delivers $-40$~dBm to a front end with a $+15$~dB LNA, a
$-6$~dB filter, and $+30$~dB of IF gain. Because gains multiply as powers but
\emph{add} as decibels, the output level is
\[ P_{out} = -40 + 15 - 6 + 30 = -1\ \text{dBm}, \]
i.e.\ $P = 10^{-0.1} = 0.79\ \text{mW}$. Working in dB turns a product of linear
power ratios into a running sum.""",
 kt=[r"$P_{\text{dBm}} = 10\log_{10}(P/1\,\text{mW})$; $0$~dBm $=1$~mW, $+30$~dBm $=1$~W.",
     "Cascaded gains and losses simply add in dB.",
     r"dBc is relative to a carrier, dBi is antenna gain vs.\ isotropic, dBW $=$ dBm $-30$."],
 ex=[r"Convert $+43$~dBm to watts.",
     r"A signal is $-70$~dBm and a spur is $-90$~dBm. What is the spur level in dBc?",
     r"Express $+30$~dBm in dBW."],
 sol=[r"$10^{43/10} = 1.995\times10^{4}\ \text{mW} \approx 20\ \text{W}$.",
      r"$-90 - (-70) = -20\ \text{dBc}$.",
      r"$\text{dBW} = \text{dBm} - 30 = 0\ \text{dBW}$ ($=1\ \text{W}$)."],
 read=r"Pozar~\cite{pozar} (ch.~10); Hayward~\cite{hayward}."),

'wiki_complex_impedance': dict(
 obj=["Compute the reactance of an inductor or capacitor at a frequency.",
      "Combine resistance and reactance into a complex impedance and find its magnitude and phase.",
      "Relate quality factor to reactance and loss."],
 wt="Worked Example: Impedance of a series RL branch",
 we=r"""A $50\ \Omega$ resistor is in series with a $10\ \text{nH}$ inductor at
$1\ \text{GHz}$. The inductive reactance is
\[ X_L = 2\pi f L = 2\pi(10^{9})(10\times10^{-9}) = 62.8\ \Omega, \]
so $Z = 50 + j62.8\ \Omega$, with $|Z| = \sqrt{50^2 + 62.8^2} = 80.3\ \Omega$ and
$\angle Z = \arctan(62.8/50) = 51.5^{\circ}$.""",
 kt=[r"$X_L = \omega L$ rises with frequency; $X_C = 1/(\omega C)$ falls with frequency.",
     r"$Z = R + jX$: magnitude $\sqrt{R^2 + X^2}$, phase $\arctan(X/R)$.",
     r"A reactive element's quality factor is $Q = |X|/R$."],
 ex=[r"Find the reactance of a $2\ \text{pF}$ capacitor at $2.4\ \text{GHz}$.",
     r"At what frequency does a $10\ \text{nH}$ inductor present $50\ \Omega$ of reactance?",
     r"A branch has $Z = 30 - j40\ \Omega$. Give its magnitude and phase."],
 sol=[r"$X_C = 1/(2\pi f C) = 1/[2\pi(2.4\times10^{9})(2\times10^{-12})] = 33.2\ \Omega$.",
      r"$f = X_L/(2\pi L) = 50/[2\pi(10\times10^{-9})] = 796\ \text{MHz}$.",
      r"$|Z| = \sqrt{30^2 + 40^2} = 50\ \Omega$; $\angle Z = \arctan(-40/30) = -53.1^{\circ}$ (capacitive)."],
 read=r"Pozar~\cite{pozar} (ch.~1); Ludwig and Bogdanov~\cite{ludwig} (ch.~1)."),

'wiki_transmission_lines': dict(
 obj=["Relate characteristic impedance to a line's per-unit-length inductance and capacitance.",
      "Compute the reflection coefficient of a loaded line.",
      "Use a quarter-wave transformer as an impedance inverter."],
 wt="Worked Example: Quarter-wave transformer",
 we=r"""To match a $100\ \Omega$ load to a $50\ \Omega$ line, insert a
quarter-wavelength section of impedance
\[ Z_1 = \sqrt{Z_0 Z_L} = \sqrt{50\times100} = 70.7\ \Omega. \]
At the design frequency the $\lambda/4$ line transforms the load to
$Z_1^2/Z_L = 70.7^2/100 = 50\ \Omega$ --- a perfect match. The match degrades
away from that frequency.""",
 kt=[r"$Z_0 = \sqrt{L/C}$ from the per-unit-length $L$ and $C$.",
     r"$\Gamma = (Z_L - Z_0)/(Z_L + Z_0)$; a matched load ($Z_L = Z_0$) gives $\Gamma = 0$.",
     r"A $\lambda/4$ line inverts impedance: $Z_{in} = Z_0^2/Z_L$."],
 ex=[r"Find the reflection coefficient of a $75\ \Omega$ load on a $50\ \Omega$ line.",
     r"What $Z_0$ quarter-wave section matches $25\ \Omega$ to $50\ \Omega$?",
     r"A $70.7\ \Omega$ quarter-wave line is terminated in $50\ \Omega$. Find its input impedance."],
 sol=[r"$\Gamma = (75-50)/(75+50) = 0.20$.",
      r"$Z_1 = \sqrt{Z_0 Z_L} = \sqrt{50\times25} = 35.4\ \Omega$.",
      r"$Z_{in} = Z_1^2/Z_L = 70.7^2/50 = 100\ \Omega$."],
 read=r"Pozar~\cite{pozar} (ch.~2); Collin~\cite{collin} (ch.~3)."),

'wiki_tl_loss': dict(
 obj=["Distinguish conductor loss from dielectric loss.",
      "Convert an attenuation rate (dB/m) into total loss over a length.",
      "Estimate propagation delay from the velocity factor."],
 wt="Worked Example: Cable loss budget",
 we=r"""A $10\ \text{m}$ coax run is rated $0.2\ \text{dB/m}$ at $1\ \text{GHz}$,
so the total attenuation is $0.2\times10 = 2\ \text{dB}$: a $+10\ \text{dBm}$
signal arrives at $+8\ \text{dBm}$ ($6.3\ \text{mW}$ of the original $10\ \text{mW}$,
about $63\%$). With velocity factor $0.66$, the one-way delay over the run is
\[ t = \frac{\ell}{\text{VF}\cdot c} = \frac{10}{0.66\times3\times10^{8}} = 50.5\ \text{ns}. \]""",
 kt=["Total loss (dB) $=$ per-metre loss $\\times$ length; dB losses add.",
     r"Conductor loss grows as $\sqrt{f}$ (skin effect); dielectric loss grows roughly linearly with $f$.",
     r"Delay $t = \ell/(\text{VF}\cdot c)$; a lower velocity factor means more delay."],
 ex=[r"A cable loses $0.15\ \text{dB/m}$. What is the total loss over $20\ \text{m}$?",
     r"What fraction of the power survives $3\ \text{dB}$ of loss?",
     r"What is the delay through $5\ \text{m}$ of coax with velocity factor $0.66$?"],
 sol=[r"$0.15\times20 = 3\ \text{dB}$.",
      r"$10^{-3/10} = 0.50$ ($50\%$; $3$~dB is a halving).",
      r"$t = 5/(0.66\times3\times10^{8}) = 25.3\ \text{ns}$."],
 read=r"Pozar~\cite{pozar} (ch.~2); Ludwig and Bogdanov~\cite{ludwig}."),

'wiki_vswr': dict(
 obj=[r"Convert among $|\Gamma|$, VSWR, and return loss.",
      r"Relate reflected power to $|\Gamma|$.",
      "Choose a return-loss target for an application."],
 wt="Worked Example: A 75~$\\Omega$ load on a 50~$\\Omega$ line",
 we=r"""For $Z_L = 75\ \Omega$ on $Z_0 = 50\ \Omega$,
$\Gamma = (75-50)/(75+50) = 0.20$, hence
\[ \text{VSWR} = \frac{1+|\Gamma|}{1-|\Gamma|} = \frac{1.2}{0.8} = 1.5, \qquad
   \text{RL} = -20\log_{10}(0.2) = 14.0\ \text{dB}. \]
The reflected power is $|\Gamma|^2 = 4\%$ and the mismatch loss is
$-10\log_{10}(1-0.04) = 0.18\ \text{dB}$.""",
 kt=[r"$|\Gamma|$, VSWR, RL, and mismatch loss are one physical fact in four algebras.",
     r"Reflected-power fraction $= |\Gamma|^2$; $\text{VSWR} = (1+|\Gamma|)/(1-|\Gamma|)$.",
     r"RL $\ge 10\ \text{dB}$ (VSWR $\le 1.9$) is a common practical floor."],
 ex=[r"For VSWR $= 3.0$, find $|\Gamma|$, return loss, and reflected power.",
     r"A return loss of $20\ \text{dB}$ corresponds to what $|\Gamma|$ and VSWR?",
     "What VSWR and return loss does a perfectly matched load have?"],
 sol=[r"$|\Gamma| = (3-1)/(3+1) = 0.5$; RL $= -20\log_{10}0.5 = 6.0\ \text{dB}$; reflected $= |\Gamma|^2 = 25\%$.",
      r"$|\Gamma| = 10^{-20/20} = 0.1$; VSWR $= 1.1/0.9 = 1.22$.",
      r"VSWR $= 1$ and RL $= \infty$ ($\Gamma = 0$)."],
 read=r"Pozar~\cite{pozar} (ch.~2); Ludwig and Bogdanov~\cite{ludwig} (ch.~2)."),

'wiki_smith_chart_tutorial': dict(
 obj=["Read a normalized impedance from a point on the chart.",
      r"Convert impedance to admittance with a $180^{\circ}$ rotation.",
      r"Use constant-$|\Gamma|$ circles and the wavelength scale for matching."],
 wt="Worked Example: Normalized impedance and reflection",
 we=r"""A load $Z_L = 75 + j50\ \Omega$ in a $50\ \Omega$ system normalizes to
$z = Z_L/Z_0 = 1.5 + j1.0$. Its reflection coefficient is
\[ \Gamma = \frac{z-1}{z+1} = \frac{0.5 + j1.0}{2.5 + j1.0} = 0.38\angle 39^{\circ}, \]
so $|\Gamma| = 0.38$ (VSWR $\approx 2.2$). On the chart the point lies in the
upper, inductive half, on the $r = 1.5$ resistance circle.""",
 kt=[r"The chart plots $\Gamma$; constant-$r$ circles and constant-$x$ arcs overlay it.",
     r"A $\lambda/4$ line (a $180^{\circ}$ trip in $\Gamma$) turns $z$ into its admittance $y = 1/z$.",
     r"Motion toward the generator is clockwise; one full revolution is $\lambda/2$."],
 ex=[r"Normalize $Z_L = 25 - j50\ \Omega$ in a $50\ \Omega$ system.",
     "Where on the chart are a short circuit and an open circuit?",
     r"A load lies on the $r = 1$ circle. What does that imply for matching with a series reactance?"],
 sol=[r"$z = Z_L/Z_0 = 0.5 - j1.0$.",
      r"Short: $z = 0$ (left-most point); open: $z = \infty$ (right-most point).",
      "Its resistive part already equals $Z_0$; the right series reactance cancels $x$ and lands at the center (matched)."],
 read=r"Pozar~\cite{pozar} (ch.~2); Steer~\cite{steer}."),

'wiki_sparam': dict(
 obj=[r"Interpret $S_{11}$ and $S_{21}$ as reflection and transmission.",
      r"Relate $S_{11}$ to return loss and $S_{21}$ to insertion loss or gain.",
      "Recognize reciprocity and the role of the reference impedance."],
 wt="Worked Example: Reading a two-port",
 we=r"""An amplifier in a $50\ \Omega$ system shows $S_{11} = 0.1$ and
$S_{21} = 10$. The input return loss is $-20\log_{10}|S_{11}| = 20\ \text{dB}$
(well matched) and the forward gain is $20\log_{10}|S_{21}| = 20\ \text{dB}$.
Because $|S_{21}| > 1$ the device is active; a passive reciprocal network would
have $S_{21} = S_{12}$ with $|S_{21}| \le 1$.""",
 kt=[r"$S_{11} = b_1/a_1$ (reflection); $S_{21} = b_2/a_1$ (transmission), other ports matched.",
     r"RL $= -20\log|S_{11}|$; insertion loss/gain $= 20\log|S_{21}|$.",
     r"Reciprocal networks satisfy $S_{ij} = S_{ji}$; S-parameters are defined against a reference impedance."],
 ex=[r"$S_{11} = 0.316$. What is the return loss?",
     r"A filter has $S_{21} = 0.5$. What is its insertion loss in dB?",
     r"For a lossless two-port, what is $|S_{11}|^2 + |S_{21}|^2$?"],
 sol=[r"RL $= -20\log_{10}(0.316) = 10\ \text{dB}$.",
      r"IL $= -20\log_{10}(0.5) = 6.0\ \text{dB}$.",
      r"$|S_{11}|^2 + |S_{21}|^2 = 1$ (a lossless network conserves power)."],
 read=r"Pozar~\cite{pozar} (ch.~4); Gonzalez~\cite{gonzalez} (ch.~1)."),

'wiki_impedance_matching': dict(
 obj=["Explain why matching maximizes power transfer and minimizes reflections.",
      "Design a two-element L-network for a resistive mismatch.",
      "Choose among L-network, stub, and quarter-wave methods."],
 wt="Worked Example: L-network, 100~$\\Omega$ to 50~$\\Omega$",
 we=r"""To match $R_L = 100\ \Omega$ down to $R_0 = 50\ \Omega$, the network
quality factor is $Q = \sqrt{R_L/R_0 - 1} = \sqrt{2-1} = 1$. The series reactance
is $X_s = Q R_0 = 50\ \Omega$ and the shunt reactance $X_p = R_L/Q = 100\ \Omega$
(opposite signs). At $1\ \text{GHz}$ a series $50\ \Omega$ inductor is
$L = X_s/\omega = 7.96\ \text{nH}$ and a shunt $100\ \Omega$ capacitor is
$C = 1/(\omega X_p) = 1.59\ \text{pF}$.""",
 kt=[r"Matching delivers maximum power (conjugate match) and drives $\Gamma \to 0$.",
     r"L-network $Q = \sqrt{R_{\text{high}}/R_{\text{low}} - 1}$ sets the two reactances.",
     r"L-networks are narrowband; stubs and $\lambda/4$ transformers are distributed alternatives."],
 ex=[r"Find the L-network $Q$ to match $200\ \Omega$ to $50\ \Omega$.",
     "Which is inherently broader band: a single L-network or a multi-section transformer?",
     r"Conjugate-matching a source $Z_s = 50 + j30\ \Omega$ needs what load impedance?"],
 sol=[r"$Q = \sqrt{200/50 - 1} = \sqrt{3} = 1.73$.",
      "The multi-section transformer (more degrees of freedom broaden the band).",
      r"$Z_L = Z_s^{*} = 50 - j30\ \Omega$."],
 read=r"Pozar~\cite{pozar} (ch.~5); Ludwig and Bogdanov~\cite{ludwig} (ch.~8)."),

'wiki_microwave_lines': dict(
 obj=["Compare microstrip, stripline, CPW, and coax.",
      "Explain the effective permittivity of microstrip.",
      "Relate line geometry to characteristic impedance."],
 wt="Worked Example: Effective permittivity of microstrip",
 we=r"""Microstrip fields are partly in air and partly in the substrate, so the
effective permittivity lies between 1 and $\varepsilon_r$. A common estimate is
\[ \varepsilon_{\text{eff}} \approx \frac{\varepsilon_r + 1}{2}
   + \frac{\varepsilon_r - 1}{2}\,\frac{1}{\sqrt{1 + 12h/W}}. \]
On FR-4 ($\varepsilon_r = 4.4$) with $W/h = 2$:
$\varepsilon_{\text{eff}} = 2.7 + 1.7/\sqrt{7} = 3.34$. The guided wavelength is
then $\lambda_g = \lambda_0/\sqrt{\varepsilon_{\text{eff}}}$.""",
 kt=[r"Microstrip's mixed air/dielectric fields give an \emph{effective} permittivity between 1 and $\varepsilon_r$.",
     "Stripline is fully enclosed (TEM, non-dispersive); CPW has coplanar grounds; coax is shielded and broadband.",
     r"Wider lines (larger $W/h$) give lower $Z_0$."],
 ex=[r"A stripline sits in a uniform $\varepsilon_r = 4$ dielectric. What is its effective permittivity?",
     r"Does widening a microstrip raise or lower $Z_0$?",
     r"Find the guided wavelength at $2\ \text{GHz}$ for $\varepsilon_{\text{eff}} = 3.34$."],
 sol=[r"$\varepsilon_{\text{eff}} = \varepsilon_r = 4$ (all field is in the dielectric).",
      r"Lower $Z_0$ (more capacitance per unit length).",
      r"$\lambda_g = \lambda_0/\sqrt{\varepsilon_{\text{eff}}} = 15/\sqrt{3.34} = 8.2\ \text{cm}$."],
 read=r"Pozar~\cite{pozar} (ch.~3); Steer~\cite{steer}."),

'wiki_pcb_rf': dict(
 obj=["Design controlled-impedance traces (microstrip and stripline).",
      "Account for via and bond-wire parasitics.",
      "Apply RF grounding and return-path rules."],
 wt="Worked Example: Via inductance",
 we=r"""A plated through-via ($h = 1.6\ \text{mm}$, radius $r = 0.15\ \text{mm}$)
has an approximate inductance
\[ L \approx \frac{\mu_0 h}{2\pi}\!\left[\ln\!\frac{2h}{r} + 0.5\right]
   = 3.20\times10^{-10}\,[\ln(21.3) + 0.5] = 1.14\ \text{nH}. \]
At $5\ \text{GHz}$ that via presents $X_L = 2\pi f L = 36\ \Omega$ --- far from
negligible, so RF vias are kept short and often paralleled.""",
 kt=[r"Trace impedance is set by width, dielectric height, and $\varepsilon_r$; keep it controlled.",
     "Vias ($\\sim$1 nH) and bond wires ($\\sim$1 nH/mm) add series inductance that bites at GHz.",
     "Give the return current a continuous path directly under the signal trace."],
 ex=[r"A $2\ \text{mm}$ bond wire is $\sim2\ \text{nH}$. What is its reactance at $5\ \text{GHz}$?",
     "How does placing two identical vias in parallel change the inductance?",
     "Why route an RF trace over a solid ground plane rather than a slotted one?"],
 sol=[r"$X_L = 2\pi f L = 2\pi(5\times10^{9})(2\times10^{-9}) = 62.8\ \Omega$.",
      "It halves (two inductors in parallel).",
      "A solid plane gives an uninterrupted return path under the trace, keeping impedance controlled and loop area (radiation, crosstalk) small; a slot forces a detour."],
 read=r"Pozar~\cite{pozar} (ch.~3); Ott~\cite{ott}."),

'wiki_coax_cable': dict(
 obj=[r"Relate coax dimensions and dielectric to $Z_0$ and velocity factor.",
      "Read attenuation and power ratings from cable tables.",
      "Choose a cable for a frequency, loss, and power requirement."],
 wt="Worked Example: Characteristic impedance of coax",
 we=r"""For coax, $Z_0 = (138/\sqrt{\varepsilon_r})\log_{10}(D/d)$. With PTFE
($\varepsilon_r = 2.1$), inner conductor $d = 0.9\ \text{mm}$ and shield inner
diameter $D = 2.95\ \text{mm}$,
\[ Z_0 = \frac{138}{\sqrt{2.1}}\log_{10}\frac{2.95}{0.9}
   = 95.2\times0.516 = 49\ \Omega, \]
a $50\ \Omega$ cable. Its velocity factor is $1/\sqrt{2.1} = 0.69$.""",
 kt=[r"$Z_0 = (138/\sqrt{\varepsilon_r})\log_{10}(D/d)$; the diameter ratio sets impedance.",
     r"Velocity factor $= 1/\sqrt{\varepsilon_r}$; foamed dielectrics raise it and cut loss.",
     "Attenuation rises with frequency; larger cable (e.g.\\ LMR-400) is lower-loss but stiffer."],
 ex=[r"Velocity factor of solid-PE coax ($\varepsilon_r = 2.25$)?",
     r"Does doubling $D/d$ (same dielectric) raise or lower $Z_0$?",
     r"RG-58 loses $\sim0.5\ \text{dB/m}$ at $1\ \text{GHz}$. What is the loss over $6\ \text{m}$?"],
 sol=[r"$\text{VF} = 1/\sqrt{2.25} = 0.667$.",
      r"Raises $Z_0$ ($Z_0 \propto \log(D/d)$).",
      r"$0.5\times6 = 3\ \text{dB}$ (a halving of power)."],
 read=r"Pozar~\cite{pozar} (ch.~2); Ludwig and Bogdanov~\cite{ludwig}."),

'wiki_connectors': dict(
 obj=["Match a connector to a frequency range and cable.",
      "Explain why connector geometry sets the upper frequency.",
      "Apply torque and mating-cycle good practice."],
 wt="Worked Example: Connector frequency ceiling",
 we=r"""A coaxial connector supports a single TEM mode only up to the frequency
where higher-order modes appear, set by its air-gap dimensions. Standard SMA is
usable to about $18\ \text{GHz}$; the smaller 2.92~mm (``K'') connector reaches
$\sim40\ \text{GHz}$, and 1.85~mm (``V'') $\sim65\ \text{GHz}$. Smaller air
dimensions push the moding frequency higher --- at the cost of power handling
and ruggedness.""",
 kt=["Precision connectors trade size for bandwidth: SMA $\\sim$18 GHz, 2.92 mm $\\sim$40 GHz, 1.85 mm $\\sim$65 GHz.",
     r"Impedance ($50$ or $75\ \Omega$) and dielectric interface must match the cable.",
     "Torque to spec and limit mating cycles; a damaged interface spoils return loss."],
 ex=[r"Which connector suits a $26\ \text{GHz}$ link: SMA or 2.92~mm?",
     "Are SMA and 2.92~mm mechanically mateable?",
     "Why does over-torquing or excessive mating degrade RF performance?"],
 sol=[r"2.92~mm --- SMA is only specified to about $18\ \text{GHz}$.",
      "Yes; the 2.92~mm (``K'') interface is mechanically compatible with SMA, though careful use preserves precision.",
      "It deforms or wears the mating surfaces, degrading the impedance interface and raising reflections (worse return loss)."],
 read=r"Pozar~\cite{pozar}; Steer~\cite{steer}."),

'wiki_waveguide': dict(
 obj=[r"Compute the dominant $TE_{10}$ cutoff frequency.",
      r"Explain single-mode operation between $f_c$ and $2f_c$.",
      "Relate guide dimensions to the operating band."],
 wt="Worked Example: WR-90 cutoff",
 we=r"""The dominant $TE_{10}$ cutoff depends only on the broad wall $a$:
$f_c = c/(2a)$. WR-90 has $a = 22.86\ \text{mm}$, so
\[ f_c = \frac{3\times10^{8}}{2(22.86\times10^{-3})} = 6.56\ \text{GHz}. \]
Single-mode operation runs from $f_c$ to about $2f_c = 13.1\ \text{GHz}$; the
standard X-band rating $8.2$--$12.4\ \text{GHz}$ sits inside that window.""",
 kt=[r"$TE_{10}$ cutoff $f_c = c/(2a)$; below it the guide will not propagate.",
     r"Useful single-mode band is roughly $f_c$ to $2f_c$.",
     "Waveguide is low-loss and high-power but bulky and band-limited."],
 ex=[r"For $a = 15\ \text{mm}$, find the $TE_{10}$ cutoff.",
     r"Can a $5\ \text{GHz}$ signal propagate in WR-90 ($f_c = 6.56\ \text{GHz}$)?",
     "Roughly where is the top of WR-90's single-mode band?"],
 sol=[r"$f_c = c/(2a) = (3\times10^{8})/(2\times0.015) = 10\ \text{GHz}$.",
      r"No --- $5\ \text{GHz}$ is below cutoff, so the wave is evanescent (does not propagate).",
      r"About $2f_c \approx 13\ \text{GHz}$."],
 read=r"Pozar~\cite{pozar} (ch.~3); Collin~\cite{collin} (ch.~3)."),

'wiki_vna': dict(
 obj=["Explain SOL calibration and the reference plane.",
      r"Interpret a measured $S_{11}$ trace.",
      "Use port extension and time-domain gating."],
 wt="Worked Example: Return loss to VSWR on a VNA",
 we=r"""A VNA reads $S_{11} = -14\ \text{dB}$ at band center. That magnitude is
$|\Gamma| = 10^{-14/20} = 0.20$, so
\[ \text{VSWR} = \frac{1 + 0.20}{1 - 0.20} = 1.5. \]
A short-open-load calibration first moves the reference plane to the probe tips,
so the reading describes the device rather than the cables.""",
 kt=["SOL (short-open-load) calibration sets the reference plane and removes systematic cable error.",
     r"$S_{11}$ in dB is return loss; convert to $|\Gamma|$ and VSWR as needed.",
     "Port extension shifts the reference plane; time-domain gating isolates a reflection in space."],
 ex=[r"$S_{11} = -20\ \text{dB}$. What is the VSWR?",
     "Which three standards define a basic one-port calibration?",
     "Why calibrate at the probe tips rather than at the instrument port?"],
 sol=[r"$|\Gamma| = 10^{-20/20} = 0.1$; VSWR $= 1.1/0.9 = 1.22$.",
      "Short, open, and matched load.",
      "It places the reference plane at the device, calibrating out the cables and connectors."],
 read=r"Pozar~\cite{pozar} (ch.~4); Steer~\cite{steer}."),

'wiki_eseries': dict(
 obj=["Explain the logarithmic spacing of E-series values.",
      "Pick the nearest standard value and its tolerance.",
      "Choose an E-series for a required precision."],
 wt="Worked Example: Nearest E12 value",
 we=r"""The E12 series has 12 values per decade, spaced by $10^{1/12} = 1.21$
($21\%$ steps, matching $\pm10\%$ parts). Suppose a design needs
$R = 2.6\ \text{k}\Omega$. The E12 neighbours are $2.2$ and $2.7\ \text{k}\Omega$;
$2.7\ \text{k}\Omega$ is closest ($3.8\%$ away, inside the $10\%$ band), so it is
the value to fit.""",
 kt=[r"E$n$ has $n$ values per decade, spaced by $10^{1/n}$; larger $n$ means tighter steps.",
     r"E6/E12/E24 pair with $20/10/5\%$ tolerances; E96 is the $1\%$ series.",
     "Round a computed value to the nearest series member within tolerance."],
 ex=["What is the step ratio of the E24 series?",
     r"What is the nearest E12 value to $4.5\ \text{k}\Omega$?",
     r"Which series would you use for $1\%$ resistors?"],
 sol=[r"$10^{1/24} = 1.10$ (about a $10\%$ step; E24 is the $5\%$ series).",
      r"E12 neighbours are $3.9$ and $4.7\ \text{k}\Omega$; $4.7\ \text{k}\Omega$ is closest.",
      "E96 (the $1\%$ series)."],
 read=r"Ludwig and Bogdanov~\cite{ludwig}; IEC~60063 (preferred numbers)."),

'wiki_coupled_resonators': dict(
 obj=["Explain mode splitting when two resonators couple.",
      "Relate the coupling coefficient to bandwidth.",
      "Recognize critical coupling."],
 wt="Worked Example: Bandwidth from coupling",
 we=r"""Two identical LC resonators at $f_0 = 100\ \text{MHz}$ couple with
coefficient $k = 0.03$. The coupling splits the response into two peaks whose
spacing sets the passband:
\[ \text{BW} \approx k f_0 = 0.03\times100\ \text{MHz} = 3\ \text{MHz}. \]
Weaker coupling narrows the band (peaks merge); stronger coupling widens it into
a double hump.""",
 kt=["Coupling two resonators splits the single peak into two modes.",
     r"Fractional bandwidth $\approx k$, so $\text{BW} \approx k f_0$.",
     "Critical coupling gives the flattest single passband; over-coupling adds ripple."],
 ex=[r"For $k = 0.05$ and $f_0 = 1\ \text{GHz}$, estimate the bandwidth.",
     r"To halve the bandwidth, how should $k$ change?",
     "Which coupling state gives a maximally flat two-resonator response?"],
 sol=[r"$\text{BW} \approx k f_0 = 0.05\times1\ \text{GHz} = 50\ \text{MHz}$.",
      r"Halve it (BW $\propto k$).",
      "Critical coupling."],
 read=r"Pozar~\cite{pozar} (ch.~6); Collin~\cite{collin}."),

'wiki_attenuators': dict(
 obj=["Design Pi and T resistive attenuators for a target attenuation.",
      r"Preserve the $Z_0$ match while attenuating.",
      "Account for power dissipation in the pad."],
 wt="Worked Example: 3~dB Pi attenuator in 50~$\\Omega$",
 we=r"""For attenuation $A$ (voltage ratio $K = 10^{A/20}$) in a $Z_0$ system, the
Pi-pad resistors are
\[ R_{\text{series}} = Z_0\frac{K^2-1}{2K}, \qquad
   R_{\text{shunt}} = Z_0\frac{K+1}{K-1}. \]
For $A = 3\ \text{dB}$, $K = 1.413$: $R_{\text{series}} = 17.6\ \Omega$ and
$R_{\text{shunt}} = 292\ \Omega$. The pad attenuates $3\ \text{dB}$ while
presenting $50\ \Omega$ at both ports.""",
 kt=[r"Resistive Pi/T pads attenuate while keeping both ports matched to $Z_0$.",
     r"Values follow from $K = 10^{A/20}$; symmetric pads are bidirectional.",
     "The pad dissipates the lost power --- size the resistors for it."],
 ex=[r"What voltage ratio $K$ corresponds to a $6\ \text{dB}$ pad?",
     r"What fraction of input power reaches the load through a $10\ \text{dB}$ pad?",
     r"A $20\ \text{dB}$ pad passes $1\ \text{W}$ in. Roughly how much must it dissipate?"],
 sol=[r"$K = 10^{6/20} = 2.0$.",
      r"$10^{-10/10} = 0.10$ ($10\%$).",
      r"About $0.99\ \text{W}$ --- only $1\%$ ($10^{-20/10}$) reaches the load."],
 read=r"Pozar~\cite{pozar}; Hayward~\cite{hayward}."),

'wiki_power_dividers': dict(
 obj=["Design an equal-split Wilkinson divider.",
      "Explain isolation and the role of the resistor.",
      "Compare the Wilkinson to hybrid couplers."],
 wt="Worked Example: Wilkinson divider values",
 we=r"""An equal-split two-way Wilkinson uses two quarter-wave arms of impedance
$Z_{\text{arm}} = Z_0\sqrt{2} = 50\sqrt{2} = 70.7\ \Omega$ and an isolation
resistor $R = 2Z_0 = 100\ \Omega$ between the outputs. It splits input power
equally ($-3\ \text{dB}$ per port), matches all ports, and isolates the outputs;
for in-phase equal signals the resistor carries no current, so the divider is
lossless in normal use.""",
 kt=[r"Equal Wilkinson: $\lambda/4$ arms of $Z_0\sqrt{2}$, isolation resistor $2Z_0$.",
     r"Each output gets half the power ($-3\ \text{dB}$); outputs are isolated and matched.",
     r"Hybrids ($90^{\circ}/180^{\circ}$) also split power but impose a fixed phase relationship."],
 ex=[r"What arm impedance does a $75\ \Omega$ Wilkinson use?",
     "What is the ideal split loss to each output?",
     r"What isolation-resistor value does a $50\ \Omega$ Wilkinson use?"],
 sol=[r"$Z_{\text{arm}} = 75\sqrt{2} = 106\ \Omega$.",
      r"$3\ \text{dB}$ (half the power to each of two outputs).",
      r"$R = 2Z_0 = 100\ \Omega$."],
 read=r"Pozar~\cite{pozar} (ch.~7)."),

'wiki_balun': dict(
 obj=["Explain balanced-to-unbalanced conversion.",
      "Relate turns ratio to impedance ratio.",
      r"Recognize $90^{\circ}$ and $180^{\circ}$ hybrids."],
 wt="Worked Example: A 4:1 balun impedance transform",
 we=r"""A balun often also transforms impedance. Matching a $200\ \Omega$ balanced
antenna (e.g.\ a folded dipole) to a $50\ \Omega$ unbalanced feed needs a ratio
$Z_{\text{bal}}/Z_{\text{unbal}} = 200/50 = 4$, i.e.\ a turns ratio of
$\sqrt{4} = 2{:}1$. Beyond impedance, the balun forces equal-and-opposite
currents on the balanced side, suppressing common-mode current on the feedline.""",
 kt=["A balun couples a balanced load to an unbalanced line and suppresses common-mode current.",
     r"Impedance ratio $= (\text{turns ratio})^2$: a $2{:}1$ turns balun is $4{:}1$ in impedance.",
     r"$90^{\circ}$ and $180^{\circ}$ hybrids give fixed phase splits for mixers and balanced amplifiers."],
 ex=["What turns ratio gives a 9:1 impedance balun?",
     r"What impedance-ratio balun matches a $300\ \Omega$ folded dipole to $75\ \Omega$ coax?",
     r"What does a $180^{\circ}$ hybrid provide that a Wilkinson does not?"],
 sol=[r"$\sqrt{9} = 3{:}1$.",
      r"$300/75 = 4{:}1$.",
      r"A defined $180^{\circ}$ phase difference between outputs (sum/difference ports); the Wilkinson gives in-phase outputs."],
 read=r"Pozar~\cite{pozar} (ch.~7); Balanis~\cite{balanis}."),

'wiki_microwave_components': dict(
 obj=["Identify couplers, circulators, and isolators by function.",
      "Read coupling and directivity of a directional coupler.",
      "Use a circulator or isolator to protect a source."],
 wt="Worked Example: Directional coupler tap",
 we=r"""A directional coupler samples a fixed fraction of the forward wave. A
``$20\ \text{dB}$ coupler'' delivers $P_{\text{coupled}} = P_{in} - 20\ \text{dB}$,
i.e.\ $1\%$ of the input power to the coupled port. Its \emph{directivity} --- the
ratio of forward to reverse coupling --- should exceed $20\ \text{dB}$ so the
coupled port samples mainly the forward wave.""",
 kt=["A directional coupler samples the forward (or reverse) wave; coupling in dB sets the tap fraction.",
     "Directivity measures how well forward and reverse are separated; higher is better.",
     "A circulator routes power one way port-to-port; terminate one port to make an isolator."],
 ex=[r"What fraction of input power does a $10\ \text{dB}$ coupler tap?",
     "What component protects a transmitter from reflected power?",
     r"What is the coupled-port level for $+30\ \text{dBm}$ into a $20\ \text{dB}$ coupler?"],
 sol=[r"$10^{-10/10} = 0.10$ ($10\%$).",
      "An isolator (a circulator with one port terminated) absorbs the reflected wave.",
      r"$30 - 20 = +10\ \text{dBm}$."],
 read=r"Pozar~\cite{pozar} (ch.~7); Collin~\cite{collin}."),

'wiki_filters': dict(
 obj=["Distinguish Butterworth and Chebyshev responses.",
      "Read filter order from the roll-off rate.",
      "Realize an LC-ladder low-pass."],
 wt="Worked Example: Butterworth roll-off and order",
 we=r"""A Butterworth low-pass rolls off at $20n\ \text{dB/decade}$ for order $n$.
To get $60\ \text{dB}$ of rejection one decade above cutoff,
$n = 60/20 = 3$. A 3rd-order LC ladder (L--C--L or C--L--C) realizes it. A
Chebyshev design reaches the same rejection at lower order by allowing passband
ripple, at the cost of group-delay flatness.""",
 kt=["Butterworth is maximally flat; Chebyshev trades passband ripple for steeper roll-off.",
     r"Roll-off $\approx 20n\ \text{dB/decade}$ ($6n\ \text{dB/octave}$).",
     "Ladder networks (series L, shunt C) implement LC filters; order $=$ number of reactive elements."],
 ex=["What is the roll-off of a 5th-order Butterworth, in dB/decade?",
     "How many reactive elements are in a 3rd-order LC ladder?",
     r"Which reaches $40\ \text{dB}$ of rejection at lower order: Butterworth or Chebyshev?"],
 sol=[r"$20\times5 = 100\ \text{dB/decade}$.",
      "Three.",
      "Chebyshev (steeper per order, at the price of passband ripple)."],
 read=r"Pozar~\cite{pozar} (ch.~8); Ludwig and Bogdanov~\cite{ludwig}."),

'wiki_stepped_impedance': dict(
 obj=["Explain the stepped-impedance (hi-lo) low-pass realization.",
      "Map high-Z sections to series L and low-Z to shunt C.",
      "Understand where the approximation breaks down."],
 wt="Worked Example: Hi-Z / lo-Z sections",
 we=r"""A stepped-impedance low-pass alternates short high-impedance lines (series
inductors) and low-impedance lines (shunt capacitors). A short line of length
$\ell$ contributes
\[ L \approx \frac{Z_h\,\ell}{v_p}, \qquad C \approx \frac{\ell}{Z_l\,v_p}, \]
so a higher $Z_h$ raises the equivalent series $L$ and a lower $Z_l$ raises the
shunt $C$. The pattern approximates an LC ladder in microstrip with no lumped
parts.""",
 kt=["High-$Z$ (narrow) lines emulate series inductors; low-$Z$ (wide) lines emulate shunt capacitors.",
     "It builds an LC low-pass from microstrip alone --- easy to fabricate.",
     "Accuracy falls near and above cutoff where the lumped approximation breaks down."],
 ex=["A narrow, high-$Z$ microstrip section behaves as which element?",
     "A wide, low-$Z$ section behaves as which element?",
     "To increase the emulated series inductance, raise or lower the section's $Z_0$?"],
 sol=["A series inductor.",
      "A shunt capacitor.",
      "Raise $Z_0$ (use a narrower line)."],
 read=r"Pozar~\cite{pozar} (ch.~8)."),

'wiki_noise': dict(
 obj=["Compute thermal-noise power in a bandwidth.",
      "Relate noise figure to SNR degradation.",
      "Apply Friis to a cascade."],
 wt="Worked Example: Thermal noise floor and NF",
 we=r"""The available thermal-noise power in bandwidth $B$ is $P_n = kTB$. At
$T = 290\ \text{K}$, $kT = -174\ \text{dBm/Hz}$. In $B = 1\ \text{MHz}$
($60\ \text{dB-Hz}$),
\[ P_n = -174 + 60 = -114\ \text{dBm}. \]
An amplifier with $\text{NF} = 3\ \text{dB}$ raises the effective floor to
$-111\ \text{dBm}$ and degrades SNR by $3\ \text{dB}$.""",
 kt=[r"Thermal noise is $-174\ \text{dBm/Hz}$ at 290 K; add $10\log_{10}B$ for the bandwidth.",
     r"NF is the SNR degradation a stage adds; $F = \text{SNR}_{in}/\text{SNR}_{out}$.",
     r"Friis: $F_{\text{tot}} = F_1 + (F_2-1)/G_1 + \dots$ --- the first stage dominates."],
 ex=[r"What is the noise floor in a $10\ \text{MHz}$ bandwidth at 290 K?",
     r"A chain has $\text{NF}_1 = 2\ \text{dB}$, $G_1 = 20\ \text{dB}$, $\text{NF}_2 = 10\ \text{dB}$. What dominates the cascade NF?",
     r"An LNA (15 dB gain, 1 dB NF) precedes a mixer (10 dB NF). Which sets the system NF?"],
 sol=[r"$-174 + 10\log_{10}(10^{7}) = -174 + 70 = -104\ \text{dBm}$.",
      r"Stage 1 --- with $G_1 = 100$ the $(F_2-1)/G_1$ term is small, so $F_{\text{tot}} \approx F_1$.",
      "The LNA: as the first stage with substantial gain, its NF sets the system NF (Friis)."],
 read=r"Pozar~\cite{pozar} (ch.~10); Razavi~\cite{razavi} (ch.~2)."),

'wiki_amplifiers': dict(
 obj=["Distinguish LNA, gain, and power amplifiers.",
      "Read gain, P1dB, and IP3 from a datasheet.",
      "Understand the gain-noise-linearity trade."],
 wt="Worked Example: 1~dB compression",
 we=r"""An amplifier has $20\ \text{dB}$ small-signal gain and an output 1~dB
compression point $\text{OP1dB} = +18\ \text{dBm}$. Driven at
$P_{in} = -5\ \text{dBm}$ the linear output would be $+15\ \text{dBm}$, below
OP1dB, so it is still roughly linear. Push toward $P_{in} = -1\ \text{dBm}$
(linear output $+19\ \text{dBm}$) and it compresses, clipping and generating
distortion.""",
 kt=["LNAs optimize noise figure; PAs optimize output power and efficiency; both need stability.",
     "P1dB marks the onset of gain compression (the large-signal limit).",
     "Higher linearity (IP3, P1dB) usually costs DC power and/or gain."],
 ex=[r"Gain $= 12\ \text{dB}$, $P_{in} = -30\ \text{dBm}$. What is the small-signal output?",
     "Above P1dB, does the gain rise or fall?",
     "Which amplifier goes first in a receive chain, and why?"],
 sol=[r"$-30 + 12 = -18\ \text{dBm}$.",
      "Falls --- the amplifier compresses.",
      "The LNA, so its low noise figure dominates the cascade (Friis) before later stages add noise."],
 read=r"Gonzalez~\cite{gonzalez}; Razavi~\cite{razavi} (ch.~5)."),

'wiki_amp_stability': dict(
 obj=["Compute the Rollett K-factor from S-parameters.",
      r"Apply the $K$--$|\Delta|$ unconditional-stability test.",
      "Recognize stabilization methods."],
 wt="Worked Example: Rollett stability factor",
 we=r"""Unconditional stability requires $K > 1$ and $|\Delta| < 1$, where
$\Delta = S_{11}S_{22} - S_{12}S_{21}$ and
\[ K = \frac{1 - |S_{11}|^2 - |S_{22}|^2 + |\Delta|^2}{2\,|S_{12}S_{21}|}. \]
A device with $K = 0.8$ is \emph{potentially unstable} --- some source/load
impedances will oscillate. A small series or shunt resistor (usually at the
output) raises $K$ above 1, trading a little gain and noise for stability.""",
 kt=[r"Unconditional stability: $K > 1$ \emph{and} $|\Delta| < 1$.",
     r"$K < 1$ means some terminations cause oscillation (potentially unstable).",
     "Resistive loading or feedback stabilizes, trading gain/NF for stability."],
 ex=[r"A device has $K = 1.4$, $|\Delta| = 0.3$. Is it unconditionally stable?",
     r"What does $K = 0.6$ indicate?",
     "Name one way to raise $K$."],
 sol=[r"Yes --- both $K > 1$ and $|\Delta| < 1$ hold.",
      "Potentially unstable: some source/load impedances will oscillate.",
      "Add a stabilizing resistor (series or shunt, often at the output) or resistive feedback."],
 read=r"Gonzalez~\cite{gonzalez} (ch.~3); Pozar~\cite{pozar} (ch.~12)."),

'wiki_pa_design': dict(
 obj=["Compare PA classes A, B, AB, and switching classes.",
      "Relate conduction angle to efficiency.",
      "Explain back-off and linearity."],
 wt="Worked Example: Class efficiency limits",
 we=r"""Ideal drain efficiency depends on conduction angle. Class~A conducts the
whole cycle ($360^{\circ}$) with a theoretical maximum of $50\%$; Class~B
conducts a half cycle ($180^{\circ}$) with $\pi/4 = 78.5\%$; Class~AB sits
between. Switching classes (D, E, F) can approach $100\%$ ideally but require
hard switching. Backing a linear PA off $6\ \text{dB}$ from saturation trades
much of that efficiency for low distortion.""",
 kt=[r"Efficiency rises as conduction angle falls: A ($50\%$) $<$ AB $<$ B ($78.5\%$) $<$ switching.",
     "Linearity and efficiency trade off; back-off buys linearity at lower efficiency.",
     "Doherty and digital predistortion recover efficiency/linearity for modulated signals."],
 ex=["What is the ideal maximum efficiency of Class A?",
     "What is the ideal maximum efficiency of Class B?",
     "Backing a PA off from saturation improves what, at what cost?"],
 sol=[r"$50\%$.",
      r"$\pi/4 = 78.5\%$.",
      "Improves linearity (lower distortion) at the cost of drain efficiency."],
 read=r"Cripps~\cite{cripps}; Pozar~\cite{pozar} (ch.~12)."),

'wiki_intermodulation': dict(
 obj=["Locate third-order intermodulation products.",
      "Relate IIP3 to IMD and headroom.",
      "Cascade IP3."],
 wt="Worked Example: IMD from IIP3",
 we=r"""Two equal tones at input power $P_{in}$ per tone drive a device with input
third-order intercept $\text{IIP3}$. The third-order products fall below each tone
by
\[ \text{IMD} = 2(\text{IIP3} - P_{in}). \]
For $\text{IIP3} = +20\ \text{dBm}$ and $P_{in} = -10\ \text{dBm}$ per tone,
$\text{IMD} = 2(20 - (-10)) = 60\ \text{dBc}$. Every $1\ \text{dB}$ rise in tone
power worsens IMD by $3\ \text{dB}$ (the products grow with slope 3).""",
 kt=[r"IM3 products at $2f_1 - f_2$ and $2f_2 - f_1$ land in-band and cannot be filtered out.",
     r"$\text{IMD (dBc)} = 2(\text{IIP3} - P_{in})$; IM3 grows $3\ \text{dB}$ per dB of input.",
     "In a cascade, late high-gain stages usually dominate the overall IP3."],
 ex=[r"$\text{IIP3} = +10\ \text{dBm}$, $P_{in} = -20\ \text{dBm}$/tone. Find the IMD.",
     r"Raise each tone by $3\ \text{dB}$. How much do the IM3 products rise?",
     "Which stage tends to dominate cascade IP3: early low-gain or late high-gain?"],
 sol=[r"$\text{IMD} = 2(10 - (-20)) = 60\ \text{dBc}$.",
      r"IM3 grows with slope 3, so $3\times3 = 9\ \text{dB}$.",
      "The late, high-gain stage (its intercept is referred back divided by the preceding gain)."],
 read=r"Razavi~\cite{razavi} (ch.~2); Pozar~\cite{pozar} (ch.~10)."),
}

for slug, d in CH.items():
    emit(slug, d)
print("Parts II-V: wrote pedagogy for", len(CH), "chapters")
