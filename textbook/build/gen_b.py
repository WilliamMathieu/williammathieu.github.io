#!/usr/bin/env python3
"""Generate pedagogy .tex files for Parts VI-X (32 chapters)."""
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
'wiki_oscillators': dict(
 obj=["State the Barkhausen conditions for oscillation.",
      "Relate loaded Q to frequency stability and phase noise.",
      "Recognize common feedback and negative-resistance topologies."],
 wt="Worked Example: Barkhausen criterion",
 we=r"""A feedback oscillator sustains oscillation when the loop gain magnitude
is at least unity and the loop phase is a multiple of $360^{\circ}$:
\[ |A\beta| \ge 1, \qquad \angle A\beta = 0^{\circ}\ (\mathrm{mod}\ 360^{\circ}). \]
At start-up the small-signal loop gain must exceed 1 so noise builds up; amplitude
then grows until nonlinearity trims the effective gain to exactly 1 in steady
state. The frequency is set where the loop phase is zero --- usually a high-$Q$
resonator.""",
 kt=[r"Oscillation needs loop gain $\ge 1$ and $0^{\circ}$ (mod $360^{\circ}$) loop phase (Barkhausen).",
     "Start-up needs gain $>1$; steady state settles to unity via nonlinearity.",
     "A higher-$Q$ tank gives better frequency stability and lower phase noise."],
 ex=["What loop phase shift sustains oscillation?",
     "Why must the start-up loop gain exceed 1?",
     "Does a higher-$Q$ tank help or hurt phase noise?"],
 sol=[r"$0^{\circ}$ modulo $360^{\circ}$.",
      "Gain $>1$ lets the oscillation build from noise; nonlinear compression then holds it at unity in steady state.",
      "Helps --- higher $Q$ lowers phase noise (Leeson)."],
 read=r"Razavi~\cite{razavi} (ch.~8); Lee~\cite{lee} (ch.~14)."),

'wiki_phase_noise': dict(
 obj=[r"Define $\mathcal{L}(f)$ as single-sideband phase noise.",
      "Identify the Leeson slope regions.",
      "Integrate phase noise to RMS jitter."],
 wt="Worked Example: Phase noise to RMS jitter",
 we=r"""RMS timing jitter follows from integrated phase noise:
\[ \sigma_t = \frac{1}{2\pi f_c}\sqrt{2\int \mathcal{L}(f)\,df}. \]
Take $\mathcal{L} = -100\ \text{dBc/Hz}$ ($10^{-10}/\text{Hz}$) flat over a
$1\ \text{MHz}$ band around a $1\ \text{GHz}$ carrier. The integrated phase
variance is $2\times10^{-10}\times10^{6} = 2\times10^{-4}\ \text{rad}^2$, so
$\sigma_\phi = 0.0141\ \text{rad}$ and $\sigma_t = \sigma_\phi/(2\pi f_c) = 2.25\ \text{ps}$.""",
 kt=[r"$\mathcal{L}(f)$ is SSB phase noise (dBc/Hz), decreasing with offset.",
     r"Leeson: close-in $1/f^3$, then $1/f^2$, then a flat floor.",
     r"RMS jitter $\sigma_t = \sigma_\phi/(2\pi f_c)$ from the integrated phase noise."],
 ex=["Does phase noise rise or fall with offset frequency?",
     r"In the Leeson $1/f^2$ region, how many dB does $\mathcal{L}(f)$ drop per decade?",
     "For a fixed integrated phase error, does a higher carrier give more or less time jitter?"],
 sol=["Falls (it is highest close to the carrier).",
      r"$20\ \text{dB/decade}$ (the $1/f^2$ slope).",
      r"Less --- $\sigma_t = \sigma_\phi/(2\pi f_c)$, so higher $f_c$ reduces jitter for the same phase error."],
 read=r"Lee~\cite{lee} (ch.~17); Razavi~\cite{razavi} (ch.~8)."),

'wiki_pll': dict(
 obj=["Identify the PLL building blocks.",
      "Relate the divide ratio to output frequency.",
      "Understand the loop-bandwidth trade-off."],
 wt="Worked Example: Integer-N frequency synthesis",
 we=r"""An integer-N PLL locks its divided output to the reference:
$f_{out} = N f_{ref}$. To synthesize $2.44\ \text{GHz}$ from a $1\ \text{MHz}$
reference, $N = 2440$, and the channel step equals $f_{ref} = 1\ \text{MHz}$.
Inside the loop bandwidth the output tracks the clean reference (multiplied by
$N$); outside it, the VCO's own phase noise dominates. Reference spurs appear at
multiples of $f_{ref}$.""",
 kt=[r"PLL: phase detector, charge pump, loop filter, VCO, and $\div N$ feedback.",
     r"Integer-N: $f_{out} = N f_{ref}$; channel spacing equals $f_{ref}$.",
     "Loop bandwidth trades spurs/settling against VCO-noise suppression; fractional-N decouples step size from $f_{ref}$."],
 ex=[r"Output of an integer-N PLL with $N = 100$, $f_{ref} = 10\ \text{MHz}$?",
     r"For $1\ \text{MHz}$ channel spacing in integer-N, what is $f_{ref}$?",
     "Widening the loop bandwidth suppresses which noise more: reference or VCO?"],
 sol=[r"$f_{out} = N f_{ref} = 100\times10\ \text{MHz} = 1\ \text{GHz}$.",
      r"$f_{ref} = 1\ \text{MHz}$.",
      "VCO noise --- a wider loop tracks the reference over a broader offset, suppressing VCO phase noise inside the loop (at the cost of more reference-spur feedthrough)."],
 read=r"Rohde~\cite{rohde}; Razavi~\cite{razavi} (ch.~9)."),

'wiki_mixers': dict(
 obj=["Explain frequency conversion by multiplication.",
      "Locate sum, difference, and image frequencies.",
      "Distinguish conversion loss and mixer types."],
 wt="Worked Example: Downconversion and the image",
 we=r"""A mixer multiplies RF and LO, producing outputs at $f_{LO} \pm f_{RF}$. For
$f_{RF} = 2000\ \text{MHz}$ and $f_{LO} = 1800\ \text{MHz}$, the IF is
$|f_{RF} - f_{LO}| = 200\ \text{MHz}$. The \emph{image} at
$f_{LO} - f_{IF} = 1600\ \text{MHz}$ also lands at that IF and must be rejected
by filtering ahead of the mixer.""",
 kt=[r"A mixer produces $f_{LO} \pm f_{RF}$; the wanted IF is the sum or difference.",
     r"The image ($f_{LO} \mp f_{IF}$) maps onto the same IF and must be filtered or rejected.",
     "Passive diode mixers have conversion loss; active mixers can have gain but add noise."],
 ex=[r"$f_{RF} = 900\ \text{MHz}$, $f_{LO} = 800\ \text{MHz}$. What is the IF?",
     "For that low-side-LO case, where is the image?",
     "What blocks the image before it reaches the mixer?"],
 sol=[r"$\text{IF} = |f_{RF} - f_{LO}| = 100\ \text{MHz}$.",
      r"At $f_{LO} - f_{IF} = 800 - 100 = 700\ \text{MHz}$.",
      "An RF band-select / image-reject filter ahead of the mixer (or an image-reject mixer)."],
 read=r"Maas~\cite{maas}; Razavi~\cite{razavi} (ch.~6)."),

'wiki_modulation': dict(
 obj=["Distinguish amplitude, frequency, and phase modulation.",
      "Relate constellation size to bits per symbol.",
      "Understand the bandwidth-vs-robustness trade."],
 wt="Worked Example: Bits per symbol in QAM",
 we=r"""A scheme with $M$ constellation points carries $\log_2 M$ bits per symbol.
16-QAM ($M = 16$) carries $\log_2 16 = 4\ \text{bits/symbol}$; 64-QAM carries 6. At
symbol rate $R_s$ the bit rate is $R_b = R_s\log_2 M$: a $1\ \text{Msym/s}$
16-QAM link carries $4\ \text{Mbit/s}$ in about the same bandwidth as
$1\ \text{Mbit/s}$ BPSK --- higher order buys spectral efficiency at the cost of
SNR margin.""",
 kt=["AM varies amplitude; FM/PM vary frequency/phase; digital schemes map bits to constellation points.",
     r"Bits per symbol $= \log_2 M$; higher-order QAM is more spectrally efficient but needs more SNR.",
     "OFDM spreads data across many orthogonal subcarriers for multipath robustness."],
 ex=["How many bits per symbol does QPSK carry?",
     r"What is the bit rate of 64-QAM at $2\ \text{Msym/s}$?",
     "Which needs higher SNR for the same BER: QPSK or 256-QAM?"],
 sol=[r"$\log_2 4 = 2\ \text{bits/symbol}$.",
      r"$R_b = R_s\log_2 M = 2\ \text{Msym/s}\times6 = 12\ \text{Mbit/s}$.",
      "256-QAM --- denser constellations need higher SNR for the same bit-error rate."],
 read=r"Razavi~\cite{razavi} (ch.~3); Steer~\cite{steer}."),

'wiki_antennas': dict(
 obj=["Define gain, directivity, and efficiency.",
      "Relate aperture area to gain.",
      "Read a radiation pattern (HPBW, sidelobes)."],
 wt="Worked Example: Gain of an aperture antenna",
 we=r"""An aperture of physical area $A$ and efficiency $\eta_a$ has gain
$G = \eta_a\,4\pi A/\lambda^2$. A $1\ \text{m}^2$ dish at $10\ \text{GHz}$
($\lambda = 3\ \text{cm}$) with $\eta_a = 0.6$ gives
\[ G = 0.6\cdot\frac{4\pi(1)}{(0.03)^2} = 8.38\times10^{3} = 39.2\ \text{dBi}. \]
Gain rises as $(D/\lambda)^2$, so larger apertures and higher frequencies focus
the beam more tightly.""",
 kt=[r"Directivity is peak focusing; gain $= \eta_a\times$ directivity (efficiency included).",
     r"Aperture gain $G = \eta_a 4\pi A/\lambda^2$; larger $A/\lambda^2$ means higher gain, narrower beam.",
     r"Isotropic (dBi) and half-wave dipole (dBd) references differ by $2.15\ \text{dB}$."],
 ex=["Express a gain of 100 in dBi.",
     "Doubling frequency at fixed dish area changes gain by how many dB?",
     r"Convert $12\ \text{dBd}$ to dBi."],
 sol=[r"$10\log_{10}(100) = 20\ \text{dBi}$.",
      r"$G \propto f^2$, so $\times4$, i.e.\ $+6\ \text{dB}$.",
      r"$12 + 2.15 = 14.15\ \text{dBi}$."],
 read=r"Balanis~\cite{balanis} (ch.~2); Kraus~\cite{kraus}."),

'wiki_polarisation': dict(
 obj=["Distinguish linear, circular, and elliptical polarization.",
      "Compute polarization-mismatch loss.",
      "Read axial ratio."],
 wt="Worked Example: Polarization-mismatch loss",
 we=r"""Two linearly polarized antennas misaligned by angle $\theta$ couple power
as $\cos^2\theta$. For $\theta = 45^{\circ}$,
$\text{loss} = -10\log_{10}(\cos^2 45^{\circ}) = -10\log_{10}(0.5) = 3\ \text{dB}$.
Cross-polarized ($90^{\circ}$) antennas couple $\cos^2 90^{\circ} = 0$ (infinite
loss in theory), while linear-to-ideal-circular always loses $3\ \text{dB}$
regardless of rotation.""",
 kt=[r"Linear-to-linear mismatch loss $= -10\log_{10}(\cos^2\theta)$; $90^{\circ}$ gives (ideally) no coupling.",
     r"Linear-to-circular is a fixed $3\ \text{dB}$ loss.",
     r"Axial ratio (dB) measures circularity; $0\ \text{dB}$ is perfectly circular."],
 ex=[r"Mismatch loss for two linear antennas $30^{\circ}$ apart?",
     "Loss between a linear and an ideal circular antenna?",
     "Axial ratio of a perfectly circular wave?"],
 sol=[r"$-10\log_{10}(\cos^2 30^{\circ}) = -10\log_{10}(0.75) = 1.25\ \text{dB}$.",
      r"$3\ \text{dB}$ (fixed, independent of rotation).",
      r"$0\ \text{dB}$ (axial ratio $= 1$)."],
 read=r"Balanis~\cite{balanis} (ch.~2); Kraus~\cite{kraus}."),

'wiki_yagi': dict(
 obj=["Identify reflector, driven element, and directors.",
      "Relate element count to gain.",
      "Understand feed impedance and matching."],
 wt="Worked Example: Yagi element lengths",
 we=r"""In a Yagi-Uda array the reflector is slightly longer than the driven
element and the directors slightly shorter, so lengths order as reflector $>$
driven $>$ directors. Typical near-resonance values: reflector $\approx 0.505\lambda$,
driven $\approx 0.473\lambda$, directors $\approx 0.44\lambda$. Adding directors
raises gain with diminishing returns; a 5-element Yagi gives roughly
$10\ \text{dBi}$, rising only slowly beyond about ten elements.""",
 kt=["Reflector (longest) $>$ driven element $>$ directors (shortest).",
     "Gain grows with element count but with diminishing returns past $\\sim$10 elements.",
     r"The driven-element impedance is low; a matching network (gamma/hairpin) transforms it to $50\ \Omega$."],
 ex=["Which element is the longest?",
     "Are the directors longer or shorter than the driven element?",
     "Is a 5-element Yagi's gain closer to 3 dBi or 10 dBi?"],
 sol=[r"The reflector (about $0.505\lambda$).",
      "Shorter --- adding more directors raises gain with diminishing returns.",
      r"About $10\ \text{dBi}$."],
 read=r"Balanis~\cite{balanis} (ch.~10); Viezbicke~\cite{viezbicke}."),

'wiki_helical': dict(
 obj=["Recognize axial-mode operation.",
      "Apply the Kraus gain formula.",
      "Understand circular polarization from a helix."],
 wt="Worked Example: Axial-mode helix gain",
 we=r"""An axial-mode helix radiates a circularly polarized beam along its axis
when the circumference $C \approx \lambda$. Kraus's gain estimate is
\[ G \approx 15\,N\,\frac{C^2}{\lambda^2}\,\frac{S}{\lambda}. \]
For $N = 10$ turns, $C = \lambda$, and spacing $S = 0.25\lambda$:
$G \approx 15\cdot10\cdot1\cdot0.25 = 37.5 = 15.7\ \text{dBi}$. More turns give
more gain and a narrower axial beam.""",
 kt=[r"Axial mode needs $C \approx \lambda$ and pitch $\sim$12--14$^{\circ}$; it is naturally circularly polarized.",
     r"Kraus: $G \approx 15N(C/\lambda)^2(S/\lambda)$; more turns $N$ raise gain.",
     r"Input impedance is near-resistive ($\sim140\,C/\lambda\ \Omega$), matched with a taper."],
 ex=[r"What circumference (in $\lambda$) puts a helix in axial mode?",
     "Doubling the turns changes the Kraus gain by how many dB?",
     "What polarization does an axial-mode helix radiate?"],
 sol=[r"About one wavelength ($C \approx \lambda$).",
      r"$G \propto N$, so $\times2$, i.e.\ $+3\ \text{dB}$.",
      "Circular polarization."],
 read=r"Kraus~\cite{kraus} (ch.~7); Balanis~\cite{balanis}."),

'wiki_frequency_bands': dict(
 obj=["Recall the IEEE microwave band letters.",
      "Relate frequency to wavelength and antenna size.",
      "Match a band to typical applications."],
 wt="Worked Example: Band and wavelength",
 we=r"""The IEEE letter bands split the microwave spectrum: L (1--2 GHz), S (2--4),
C (4--8), X (8--12), Ku (12--18), K (18--27), Ka (27--40). A half-wave dipole
scales as $\ell = \lambda/2 = c/(2f)$: at S-band $2.45\ \text{GHz}$,
$\ell = (3\times10^8)/(2\cdot2.45\times10^9) = 61\ \text{mm}$; at Ka-band
$30\ \text{GHz}$ it is only $5\ \text{mm}$.""",
 kt=["IEEE bands (L, S, C, X, Ku, K, Ka) label microwave ranges.",
     r"Antenna size scales with $\lambda = c/f$; higher bands mean smaller antennas.",
     "Band choice trades bandwidth/size against rain and atmospheric loss."],
 ex=[r"Which IEEE band contains $10\ \text{GHz}$?",
     r"Half-wave dipole length at $1\ \text{GHz}$?",
     "Do higher bands give larger or smaller antennas at the same electrical size?"],
 sol=["X-band (8--12 GHz).",
      r"$\ell = c/(2f) = (3\times10^8)/(2\times10^9) = 15\ \text{cm}$.",
      r"Smaller ($\lambda = c/f$ shrinks with frequency)."],
 read=r"Pozar~\cite{pozar}; IEEE Std~521~\cite{ieee521}."),

'wiki_superheterodyne': dict(
 obj=["Trace the superheterodyne signal flow.",
      "Explain image rejection and IF choice.",
      "Understand dynamic-range placement."],
 wt="Worked Example: IF and image placement",
 we=r"""A superhet mixes RF down to a fixed IF for selectivity and gain. With
$f_{RF} = 100\ \text{MHz}$ and high-side LO $f_{LO} = 110\ \text{MHz}$, the IF is
$10\ \text{MHz}$ and the image sits at $f_{LO} + f_{IF} = 120\ \text{MHz}$ ---
$2f_{IF} = 20\ \text{MHz}$ from the wanted signal. A higher IF pushes the image
farther out (easier to filter) but complicates the IF stage --- the classic IF
trade-off.""",
 kt=["The superhet converts RF to a fixed IF where filtering and gain are easier.",
     r"The image lies $2f_{IF}$ from the RF; a higher IF eases image rejection.",
     "Front-end selectivity and gain distribution set sensitivity and dynamic range."],
 ex=[r"$f_{RF} = 1000\ \text{MHz}$, $f_{LO} = 1090\ \text{MHz}$. Find the IF and image.",
     "Does a higher IF make image rejection easier or harder?",
     "How far in frequency is the image from the desired signal?"],
 sol=[r"$\text{IF} = 90\ \text{MHz}$; image at $f_{LO} + f_{IF} = 1180\ \text{MHz}$.",
      "Easier --- the image moves farther from the passband.",
      r"$2f_{IF}$."],
 read=r"Razavi~\cite{razavi} (ch.~4); Pozar~\cite{pozar}."),

'wiki_cascade_analysis': dict(
 obj=["Combine stage gains, noise figures, and IP3.",
      "Apply Friis for cascaded NF.",
      "Identify the limiting stage."],
 wt="Worked Example: Cascaded noise figure",
 we=r"""For stages in series,
$F_{tot} = F_1 + (F_2-1)/G_1 + (F_3-1)/(G_1 G_2) + \dots$ Take an LNA
($\text{NF}_1 = 2\ \text{dB}$, $G_1 = 15\ \text{dB}$) then a mixer
($\text{NF}_2 = 10\ \text{dB}$). In linear terms $F_1 = 1.585$, $G_1 = 31.6$,
$F_2 = 10$:
\[ F_{tot} = 1.585 + \frac{10-1}{31.6} = 1.87, \]
i.e.\ $\text{NF}_{tot} = 2.72\ \text{dB}$ --- only $0.7\ \text{dB}$ above the LNA
alone, because its gain suppresses the mixer's noise.""",
 kt=["Cascaded NF (Friis): later stages' noise is divided by all preceding gain.",
     "A high-gain, low-NF first stage sets the system NF.",
     "Cascaded IP3 is instead dominated by the last high-level stages."],
 ex=["Why does a high-gain LNA first improve system NF?",
     r"LNA NF $= 1\ \text{dB}$, $G = 20\ \text{dB}$; second stage NF $= 10\ \text{dB}$. Approximate system NF?",
     "Does the first or last stage tend to dominate cascade IP3?"],
 sol=["Its gain $G_1$ divides every later stage's excess noise $(F_i-1)$, so early gain suppresses later noise.",
      r"$F_1 = 1.26$, $G_1 = 100$, $F_2 = 10$: $F_{tot} = 1.26 + 9/100 = 1.35$, so $\text{NF} = 1.3\ \text{dB}$.",
      "The last (high-level) stage."],
 read=r"Pozar~\cite{pozar} (ch.~10); Razavi~\cite{razavi} (ch.~2)."),

'wiki_link_budget': dict(
 obj=["Compute free-space path loss.",
      "Assemble a link budget for received power.",
      "Evaluate link margin."],
 wt="Worked Example: Path loss and margin",
 we=r"""Free-space path loss is
$\text{FSPL} = 20\log_{10}d + 20\log_{10}f + 32.44$ ($d$ in km, $f$ in MHz). At
$d = 10\ \text{km}$, $f = 2400\ \text{MHz}$:
$\text{FSPL} = 20 + 67.6 + 32.44 = 120\ \text{dB}$. With EIRP $= +30\ \text{dBm}$
and receive gain $+10\ \text{dBi}$, the received power is
$30 + 10 - 120 = -80\ \text{dBm}$; against a $-95\ \text{dBm}$ sensitivity the
margin is $15\ \text{dB}$.""",
 kt=[r"$\text{FSPL} = 20\log d + 20\log f + k$; loss grows $20\ \text{dB}$ per decade of $d$ or $f$.",
     r"$P_{rx} = \text{EIRP} + G_{rx} - \text{FSPL} - \text{losses}$.",
     r"Margin $= P_{rx} - \text{sensitivity}$; positive margin closes the link."],
 ex=["By how many dB does FSPL grow when distance is $\\times10$?",
     r"EIRP $+20\ \text{dBm}$, path loss $100\ \text{dB}$, RX gain $+3\ \text{dBi}$. Received power?",
     r"If sensitivity is $-90\ \text{dBm}$, what is the margin?"],
 sol=[r"$20\ \text{dB}$ (FSPL $\propto d^2$).",
      r"$P_{rx} = 20 + 3 - 100 = -77\ \text{dBm}$.",
      r"Margin $= -77 - (-90) = 13\ \text{dB}$."],
 read=r"Pozar~\cite{pozar}; Skolnik~\cite{skolnik}."),

'wiki_radar': dict(
 obj=["Apply the radar range equation.",
      "Relate range to round-trip time.",
      "Compute Doppler shift."],
 wt="Worked Example: Range from echo delay",
 we=r"""Radar range follows from the round-trip time: $R = c\,\Delta t/2$. An echo
returning $\Delta t = 20\ \mu\text{s}$ after transmission puts the target at
\[ R = \frac{(3\times10^8)(20\times10^{-6})}{2} = 3000\ \text{m}. \]
Received power falls as $1/R^4$ (two-way spreading times cross-section), so
doubling range cuts echo power by $12\ \text{dB}$.""",
 kt=[r"$R = c\Delta t/2$ from the round-trip delay.",
     r"The radar equation gives echo power $\propto 1/R^4$; doubling range loses $12\ \text{dB}$.",
     r"Doppler shift $f_d = 2v/\lambda$ gives radial velocity."],
 ex=[r"Echo delay $60\ \mu\text{s}$: what is the range?",
     "Doubling target range changes echo power by how many dB?",
     r"Doppler shift for $v = 30\ \text{m/s}$ at $\lambda = 3\ \text{cm}$?"],
 sol=[r"$R = c\Delta t/2 = (3\times10^8)(60\times10^{-6})/2 = 9000\ \text{m}$.",
      r"$-12\ \text{dB}$ (power $\propto 1/R^4$).",
      r"$f_d = 2v/\lambda = 2(30)/0.03 = 2000\ \text{Hz}$."],
 read=r"Skolnik~\cite{skolnik} (ch.~1--2)."),

'wiki_fmcw_radar': dict(
 obj=["Explain the FMCW beat frequency.",
      "Relate chirp bandwidth to range resolution.",
      "Understand the range-Doppler picture."],
 wt="Worked Example: Beat frequency and resolution",
 we=r"""A linear chirp of slope $S = B/T$ produces a beat frequency proportional to
range, $f_b = 2RS/c = 2RB/(cT)$. Range resolution depends only on sweep bandwidth:
$\Delta R = c/(2B)$. For $B = 150\ \text{MHz}$,
\[ \Delta R = \frac{3\times10^8}{2\times150\times10^6} = 1\ \text{m}. \]
Wider sweeps give finer range resolution; the beat frequency is read off an FFT of
the mixed signal.""",
 kt=[r"FMCW beat frequency $f_b = 2RS/c$ (slope $S = B/T$) encodes range.",
     r"Range resolution $\Delta R = c/(2B)$ depends only on sweep bandwidth.",
     "A 2-D FFT over chirps yields the range-Doppler map (range and velocity)."],
 ex=[r"Range resolution for $B = 1\ \text{GHz}$?",
     r"To halve $\Delta R$, how should $B$ change?",
     "Does the beat frequency increase or decrease with range?"],
 sol=[r"$\Delta R = c/(2B) = (3\times10^8)/(2\times10^9) = 0.15\ \text{m}$.",
      r"Double the bandwidth ($\Delta R \propto 1/B$).",
      r"Increases ($f_b \propto R$)."],
 read=r"Skolnik~\cite{skolnik}; Pozar~\cite{pozar}."),

'wiki_emc_shielding': dict(
 obj=["Decompose shielding effectiveness into reflection and absorption.",
      "Explain aperture leakage.",
      "Understand cable-shield transfer impedance."],
 wt="Worked Example: A slot as a leakage antenna",
 we=r"""A shield's effectiveness is set less by wall thickness than by its
apertures. A slot radiates efficiently once its length approaches a half
wavelength; leakage becomes severe near $f \approx c/(2L)$. A $30\ \text{cm}$ seam
leaks strongly around
\[ f = \frac{3\times10^8}{2\times0.30} = 500\ \text{MHz}. \]
The rule: keep the longest slot dimension $\ll \lambda/2$ --- many small holes
beat one long slot of equal area.""",
 kt=["Shielding effectiveness $=$ reflection $+$ absorption loss; apertures dominate real enclosures.",
     r"A slot leaks strongly as its length nears $\lambda/2$ ($f \approx c/2L$); slot length, not area, governs leakage.",
     "Cable shields couple via transfer impedance; pigtails ruin high-frequency shielding."],
 ex=[r"At what frequency does a $15\ \text{cm}$ slot become a strong radiator?",
     "For fixed total open area, are many small holes or one long slot better?",
     "What ruins a cable shield's HF performance at the connector?"],
 sol=[r"$f \approx c/(2L) = (3\times10^8)/(2\times0.15) = 1\ \text{GHz}$.",
      "Many small holes --- leakage depends on the longest slot dimension, not total area.",
      r"A pigtail (long, inductive shield termination); a $360^{\circ}$ shield bond is needed instead."],
 read=r"Ott~\cite{ott} (ch.~6); Paul~\cite{paul}."),

'wiki_rf_safety': dict(
 obj=["Compute power density versus distance.",
      "Apply ICNIRP/FCC exposure limits.",
      "Find a minimum safe distance."],
 wt="Worked Example: Minimum safe distance",
 we=r"""In the far field the power density from an EIRP source is
$S = \text{EIRP}/(4\pi R^2)$. Setting $S$ to the limit $S_{lim}$ and solving,
\[ R_{min} = \sqrt{\frac{\text{EIRP}}{4\pi S_{lim}}}. \]
For $\text{EIRP} = 100\ \text{W}$ and the ICNIRP general-public limit at
$900\ \text{MHz}$ ($f/200 = 4.5\ \text{W/m}^2$):
$R_{min} = \sqrt{100/(4\pi\cdot4.5)} = 1.33\ \text{m}$.""",
 kt=[r"Far-field power density $S = \text{EIRP}/(4\pi R^2)$ falls as $1/R^2$.",
     r"ICNIRP general-public limit is frequency-dependent (e.g.\ $f/200\ \text{W/m}^2$, 400 MHz--2 GHz).",
     r"Minimum safe distance $R_{min} = \sqrt{\text{EIRP}/(4\pi S_{lim})}$."],
 ex=[r"Power density from $100\ \text{W}$ EIRP at $5\ \text{m}$?",
     r"ICNIRP general-public limit at $1800\ \text{MHz}$?",
     "Doubling distance changes power density by how many dB?"],
 sol=[r"$S = 100/(4\pi\cdot25) = 0.318\ \text{W/m}^2$.",
      r"$f/200 = 1800/200 = 9\ \text{W/m}^2$.",
      r"$-6\ \text{dB}$ (power density $\propto 1/R^2$)."],
 read=r"ICNIRP~\cite{icnirp}; Balanis~\cite{balanis}."),

'wiki_nmr_basics': dict(
 obj=["State the Larmor relationship.",
      "Relate the gyromagnetic ratio to resonance frequency.",
      "Understand net magnetization and precession."],
 wt="Worked Example: Larmor frequency",
 we=r"""Nuclear spins precess at $f_0 = \gamma B_0$; for protons
$\gamma = 42.58\ \text{MHz/T}$. At $B_0 = 1.5\ \text{T}$,
\[ f_0 = 42.58\times1.5 = 63.9\ \text{MHz}; \]
at $3\ \text{T}$ it is $127.7\ \text{MHz}$. The RF coil must be tuned to this
frequency to excite and receive the spins.""",
 kt=[r"Larmor: $f_0 = \gamma B_0$; for protons $\gamma = 42.58\ \text{MHz/T}$.",
     r"Net magnetization aligns with $B_0$; an on-resonance $B_1$ pulse tips it into the transverse plane.",
     "Higher $B_0$ raises frequency (and signal), demanding higher-frequency coils."],
 ex=[r"Proton Larmor frequency at $3\ \text{T}$?",
     r"At what field is the proton frequency $300\ \text{MHz}$?",
     r"Does $7\ \text{T}$ need a higher- or lower-frequency coil than $1.5\ \text{T}$?"],
 sol=[r"$f_0 = 42.58\times3 = 127.7\ \text{MHz}$.",
      r"$B_0 = f_0/\gamma = 300/42.58 = 7.05\ \text{T}$.",
      r"Higher frequency ($\sim298\ \text{MHz}$ vs.\ $64\ \text{MHz}$)."],
 read=r"Nishimura~\cite{nishimura} (ch.~2); Haacke~\cite{haacke}."),

'wiki_mri_hardware': dict(
 obj=["Identify the main magnet, gradients, and RF chain.",
      "Understand field strength versus SNR.",
      "Recognize shielding and shimming needs."],
 wt="Worked Example: SNR scaling with field",
 we=r"""MRI signal-to-noise rises steeply with static field. In the
body-noise-dominated regime SNR grows roughly linearly with $B_0$, so moving from
$1.5\ \text{T}$ to $3\ \text{T}$ roughly doubles SNR. That gain drives high-field
imaging --- at the cost of higher RF frequency ($128$ vs.\ $64\ \text{MHz}$),
stronger susceptibility artefacts, and higher SAR (which scales as $B_0^2$).""",
 kt=[r"The magnet sets $B_0$ (and frequency); gradients encode space; the RF chain excites and receives.",
     r"Higher $B_0$ improves SNR but raises frequency, SAR ($\propto B_0^2$), and susceptibility artefacts.",
     r"Shimming homogenizes $B_0$; RF and gradient shielding contain stray fields."],
 ex=[r"Roughly how does SNR change from $1.5\ \text{T}$ to $3\ \text{T}$?",
     r"How does whole-body SAR scale with $B_0$?",
     "Which improves with higher field: SNR or susceptibility artefacts?"],
 sol=[r"Roughly doubles (SNR scales about linearly with $B_0$).",
      r"As $B_0^2$ (SAR $\propto f^2 \propto B_0^2$).",
      "SNR improves; susceptibility artefacts get worse."],
 read=r"Nishimura~\cite{nishimura}; Haacke~\cite{haacke} (ch.~27)."),

'wiki_mri_gradients': dict(
 obj=["Relate gradient strength to spatial encoding.",
      "Define slew rate and its PNS limit.",
      "Understand eddy-current effects."],
 wt="Worked Example: Gradient slew rate",
 we=r"""A gradient must ramp quickly to keep echo times short. Slew rate is
$\text{SR} = G_{max}/t_{rise}$. Ramping to $G_{max} = 40\ \text{mT/m}$ in
$t_{rise} = 200\ \mu\text{s}$ gives
\[ \text{SR} = \frac{0.04}{200\times10^{-6}} = 200\ \text{T/m/s}. \]
Faster ramps shorten sequences but are capped by peripheral nerve stimulation
(PNS), which responds to $dB/dt$.""",
 kt=[r"Gradients make resonance position-dependent: $f(z) = \gamma(B_0 + Gz)$.",
     r"Slew rate $= G_{max}/t_{rise}$; higher slew shortens TE and TR.",
     "PNS (from $dB/dt$) and eddy currents cap how fast gradients can switch."],
 ex=[r"Slew rate to reach $30\ \text{mT/m}$ in $150\ \mu\text{s}$?",
     "What physiological effect limits maximum slew rate?",
     "Faster gradient switching allows shorter what?"],
 sol=[r"$\text{SR} = 0.03/(150\times10^{-6}) = 200\ \text{T/m/s}$.",
      "Peripheral nerve stimulation (driven by $dB/dt$).",
      "Echo time and repetition time (faster sequences)."],
 read=r"Nishimura~\cite{nishimura} (ch.~5); Haacke~\cite{haacke}."),

'wiki_mri_sequences': dict(
 obj=["Distinguish spin echo, gradient echo, and EPI.",
      "Relate TR/TE to contrast.",
      "Understand k-space traversal."],
 wt="Worked Example: Spin echo versus gradient echo",
 we=r"""A spin echo uses a $90^{\circ}$ excitation and a $180^{\circ}$ refocusing
pulse that cancels static field inhomogeneity, so its contrast follows true
$T_2$. A gradient echo omits the $180^{\circ}$ pulse and refocuses with gradients
alone --- faster (short TR) but sensitive to $T_2^{*}$. Long TR with short TE gives
proton-density weighting; short TR emphasizes $T_1$; long TE emphasizes $T_2$.""",
 kt=[r"Spin echo (with a $180^{\circ}$ pulse) images true $T_2$; gradient echo images $T_2^{*}$ and is faster.",
     r"Contrast: short TR $\to T_1$; long TE $\to T_2$; long TR/short TE $\to$ proton density.",
     "Each excitation fills lines of k-space; the trajectory sets speed and artefacts."],
 ex=["Which sequence refocuses static field inhomogeneity: SE or GRE?",
     "Which weighting comes from a short TR?",
     r"What does the $180^{\circ}$ refocusing pulse cancel?"],
 sol=[r"Spin echo (its $180^{\circ}$ pulse refocuses static inhomogeneity).",
      r"$T_1$ weighting.",
      r"Phase dispersion from static $B_0$ inhomogeneity, so the echo decays with true $T_2$ rather than $T_2^{*}$."],
 read=r"Nishimura~\cite{nishimura} (ch.~6); Haacke~\cite{haacke}."),

'wiki_mri_contrast': dict(
 obj=[r"Define $T_1$, $T_2$, $T_2^{*}$, and proton density.",
      "Relate TR/TE to image weighting.",
      "Understand contrast agents."],
 wt="Worked Example: T1 recovery",
 we=r"""Longitudinal magnetization recovers as
$M_z(t) = M_0(1 - e^{-t/T_1})$. After a $90^{\circ}$ pulse, at $t = T_1$ the
recovery is $1 - e^{-1} = 63\%$ of $M_0$. Short-$T_1$ tissue (e.g.\ fat) recovers
quickly and looks bright on $T_1$-weighted images (short TR); long-$T_1$ tissue
(e.g.\ CSF) recovers slowly and looks dark.""",
 kt=[r"$T_1$ (longitudinal recovery) and $T_2$ (transverse decay) are tissue-specific; $T_2^{*} \le T_2$.",
     r"$M_z(t) = M_0(1 - e^{-t/T_1})$; $M_{xy}(t) = M_0 e^{-t/T_2}$.",
     r"Gadolinium shortens $T_1$, brightening enhancing tissue."],
 ex=[r"Fraction of $T_1$ recovery at $t = T_1$?",
     r"Fraction of transverse signal left at $t = T_2$?",
     r"Does gadolinium predominantly shorten $T_1$ or $T_2$ clinically?"],
 sol=[r"$1 - e^{-1} = 63\%$.",
      r"$e^{-1} = 37\%$.",
      r"Predominantly $T_1$ --- it brightens enhancing tissue on $T_1$-weighted images."],
 read=r"Nishimura~\cite{nishimura}; Haacke~\cite{haacke} (ch.~4)."),

'wiki_mri_artifacts': dict(
 obj=["Recognize common MRI artefacts.",
      "Relate chemical shift and susceptibility to field.",
      "Mitigate motion and aliasing."],
 wt="Worked Example: Chemical-shift displacement",
 we=r"""Fat and water precess about $3.5\ \text{ppm}$ apart. At $1.5\ \text{T}$
($64\ \text{MHz}$) that is $3.5\times10^{-6}\times64\times10^6 = 224\ \text{Hz}$; at
$3\ \text{T}$ it doubles to $448\ \text{Hz}$. Because the readout maps frequency to
position, fat shifts spatially relative to water --- worse at high field and with
low readout bandwidth.""",
 kt=["Chemical shift, susceptibility, motion, aliasing, and Gibbs ringing are the common artefacts.",
     r"Chemical-shift and susceptibility effects scale with $B_0$ (worse at high field).",
     "Higher readout bandwidth reduces chemical-shift displacement; oversampling cures aliasing."],
 ex=[r"Fat--water shift (Hz) at $3\ \text{T}$ ($3.5\ \text{ppm}$)?",
     r"Does the susceptibility artefact improve or worsen at $7\ \text{T}$?",
     "What reduces chemical-shift displacement in the readout?"],
 sol=[r"$3.5\times10^{-6}\times127.7\times10^{6} = 447\ \text{Hz}$.",
      r"Worsens (it scales with $B_0$).",
      "A higher readout (receive) bandwidth (more Hz per pixel)."],
 read=r"Haacke~\cite{haacke} (ch.~20); Nishimura~\cite{nishimura}."),

'wiki_coil_design': dict(
 obj=["Tune and match an RF coil to the Larmor frequency.",
      "Relate coil Q to SNR.",
      "Apply active/passive detuning."],
 wt="Worked Example: Tuning a loop coil",
 we=r"""A loop of inductance $L = 100\ \text{nH}$ resonates at $f_0$ when tuned with
$C = 1/[(2\pi f_0)^2 L]$. At $1.5\ \text{T}$ ($f_0 = 63.9\ \text{MHz}$),
\[ C = \frac{1}{(2\pi\cdot63.9\times10^6)^2(100\times10^{-9})} = 62\ \text{pF}. \]
A second (matching) capacitor transforms the coil to $50\ \Omega$. A high
unloaded-to-loaded Q ratio means the sample --- not the coil --- dominates the
noise, which is the goal for good SNR.""",
 kt=[r"Tune $C = 1/[(2\pi f_0)^2 L]$ to the Larmor frequency; add a matching capacitor for $50\ \Omega$.",
     r"Sample-dominated noise (high $Q_{\text{unloaded}}/Q_{\text{loaded}}$) gives the best SNR.",
     "Active detuning (PIN diodes) protects the receive coil during transmit."],
 ex=[r"Tuning capacitor for $L = 200\ \text{nH}$ at $64\ \text{MHz}$?",
     "What does a high unloaded/loaded Q ratio indicate?",
     "Why detune a receive coil during transmit?"],
 sol=[r"$C = 1/[(2\pi\cdot64\times10^6)^2(200\times10^{-9})] = 31\ \text{pF}$.",
      "That the sample (not the coil) dominates losses --- the SNR-optimal regime.",
      "To decouple it from the transmit field, preventing coupling, heating, and $B_1$ distortion."],
 read=r"Mispelter~\cite{mispelter}; Haacke~\cite{haacke} (ch.~27)."),

'wiki_coil_types': dict(
 obj=["Distinguish volume, surface, and array coils.",
      "Trade coverage against SNR.",
      "Match a coil to the application."],
 wt="Worked Example: Surface versus volume coil",
 we=r"""A surface coil sits close to the anatomy, sees little sample noise, and
gives high SNR near the surface --- but its sensitivity falls off roughly as
$1/d^3$ with depth and its $B_1$ is inhomogeneous. A volume coil (e.g.\ a
birdcage) surrounds the region for uniform $B_1$ and coverage at lower peak SNR.
Phased arrays combine many small elements to get surface-coil SNR over a
volume-coil field of view.""",
 kt=["Surface coils: high local SNR, poor depth penetration and uniformity.",
     r"Volume coils (birdcage): uniform $B_1$ and coverage, lower peak SNR.",
     "Phased arrays merge both: many small elements $\\to$ high SNR over a large FOV."],
 ex=["Which gives higher SNR near the skin: surface or volume coil?",
     r"Which gives more uniform $B_1$?",
     "What coil type gets surface-coil SNR over a large FOV?"],
 sol=["The surface coil (close coupling, low sample noise).",
      "The volume coil (e.g.\ birdcage).",
      "A phased array of small elements."],
 read=r"Mispelter~\cite{mispelter}; Roemer \emph{et al.}~\cite{roemer}."),

'wiki_birdcage': dict(
 obj=["Explain the birdcage resonant modes.",
      "Relate leg/end-ring reactance to tuning.",
      "Understand quadrature drive."],
 wt="Worked Example: The homogeneous mode",
 we=r"""A birdcage coil is a ladder of legs and end-ring segments forming a
resonant network with several modes. The useful \emph{homogeneous} mode produces
a uniform transverse $B_1$ across the bore. Driving two ports $90^{\circ}$ apart in
space and phase (quadrature) rotates the $B_1$ field, improving transmit
efficiency by $\sqrt{2}$ and receive SNR by up to $\sqrt{2}$ versus a single
linear drive.""",
 kt=[r"A birdcage supports several modes; the homogeneous ($k = 1$) mode gives uniform $B_1$.",
     "Leg and end-ring capacitances set the mode frequencies.",
     r"Quadrature drive (two ports at $90^{\circ}$) rotates $B_1$, gaining $\sqrt{2}$ in efficiency/SNR."],
 ex=[r"Which birdcage mode gives uniform $B_1$?",
     "Quadrature versus linear drive improves SNR by roughly what factor?",
     "What components set the mode frequencies?"],
 sol=[r"The homogeneous ($k = 1$) mode.",
      r"About $\sqrt{2}$ ($\approx1.41\times$).",
      "The leg and end-ring capacitors together with the conductor inductances."],
 read=r"Mispelter~\cite{mispelter}; Haacke~\cite{haacke} (ch.~27)."),

'wiki_coil_snr': dict(
 obj=["Identify coil and sample noise contributions.",
      "Relate loaded Q to SNR.",
      "Diagnose the noise-dominant regime."],
 wt="Worked Example: When the sample dominates noise",
 we=r"""A receive coil's noise is the sum of coil (conductor) and sample (body)
losses. The ratio of unloaded to loaded quality factor reveals which dominates:
\[ \frac{Q_{\text{unloaded}}}{Q_{\text{loaded}}} = 1 + \frac{R_{\text{sample}}}{R_{\text{coil}}}. \]
A ratio of 5 means the sample resistance is $4\times$ the coil resistance --- the
sample dominates, so polishing the conductor buys little. At low field or for
small coils the coil can dominate, and conductor quality matters more.""",
 kt=[r"Total noise $\propto R_{\text{coil}} + R_{\text{sample}}$; SNR is best when the sample dominates.",
     r"$Q_{\text{unloaded}}/Q_{\text{loaded}} = 1 + R_{\text{sample}}/R_{\text{coil}}$ diagnoses the regime.",
     "Sample noise rises with field; small or low-field coils are more coil-noise-limited."],
 ex=[r"If $Q_{\text{unloaded}}/Q_{\text{loaded}} = 3$, what is $R_{\text{sample}}/R_{\text{coil}}$?",
     "In the sample-dominated regime, does better conductor plating help much?",
     "Are small surface coils more coil- or sample-noise-limited?"],
 sol=[r"$R_{\text{sample}}/R_{\text{coil}} = 3 - 1 = 2$.",
      r"Little --- the sample already dominates, so lowering $R_{\text{coil}}$ barely moves the total.",
      "More coil-noise-limited (small coils and low field see relatively less sample loss)."],
 read=r"Mispelter~\cite{mispelter}; Roemer \emph{et al.}~\cite{roemer}."),

'wiki_preamplifier_decoupling': dict(
 obj=["Explain preamplifier decoupling in arrays.",
      "Relate low input impedance to element isolation.",
      r"Understand the $\lambda/4$ transform."],
 wt="Worked Example: Decoupling via a low-Z LNA",
 we=r"""In a receive array, current in one element couples to its neighbours.
Preamplifier decoupling uses a low-input-impedance LNA: a $\lambda/4$ network turns
the LNA's near-short input into a high series impedance in the coil loop, choking
the induced current. With line impedance $Z_0$ and preamp input $Z_{in}$, the
transformed loop impedance is $Z_0^2/Z_{in}$ --- large when $Z_{in}$ is small --- so
the loop current (and inter-element coupling) is suppressed while noise match is
preserved.""",
 kt=[r"Preamp decoupling suppresses induced loop current with a low-impedance LNA and a $\lambda/4$ transform.",
     r"The $\lambda/4$ line turns the LNA's low input impedance into a high series impedance ($Z_0^2/Z_{in}$).",
     "It complements geometric (overlap) decoupling in phased arrays."],
 ex=[r"A $\lambda/4$ line transforms a $2\ \Omega$ preamp input into what loop impedance in $50\ \Omega$?",
     "Does a lower preamp input impedance give more or less decoupling?",
     "What other decoupling method does it complement?"],
 sol=[r"$Z_0^2/Z_{in} = 50^2/2 = 1250\ \Omega$.",
      "More --- a lower $Z_{in}$ gives a higher transformed series impedance, choking the loop current harder.",
      "Nearest-neighbour geometric (overlap) decoupling."],
 read=r"Roemer \emph{et al.}~\cite{roemer}; Mispelter~\cite{mispelter}."),

'wiki_phased_arrays': dict(
 obj=["Explain array coils for parallel coverage.",
      "Relate element count to SNR and acceleration.",
      "Understand decoupling requirements."],
 wt="Worked Example: Coverage and decoupling",
 we=r"""An MRI phased array places many small coils to get surface-coil SNR over a
large field of view; each element also provides a distinct spatial sensitivity
used for parallel imaging. Elements must be decoupled: nearest neighbours by
geometric overlap (mutual inductance $M \to 0$) and the rest by preamplifier
decoupling. More elements raise SNR and the achievable acceleration, at the cost
of more receive channels and reconstruction complexity.""",
 kt=["Array coils combine small elements: high SNR over a large FOV plus distinct sensitivities for parallel imaging.",
     "Decoupling is essential: overlap for neighbours, preamp decoupling for the rest.",
     "More elements $\\to$ more SNR and acceleration, but more channels and complexity."],
 ex=["How are nearest-neighbour array elements typically decoupled?",
     "What do the distinct element sensitivities enable?",
     "More elements generally raise what two things?"],
 sol=[r"By geometric overlap that nulls the mutual inductance ($M \to 0$).",
      "Parallel imaging (SENSE/GRAPPA) for scan acceleration.",
      "SNR and the achievable acceleration factor."],
 read=r"Roemer \emph{et al.}~\cite{roemer}; Mispelter~\cite{mispelter}."),

'wiki_parallel_imaging': dict(
 obj=["Explain SENSE and GRAPPA.",
      "Relate acceleration factor to scan time and SNR.",
      "Understand the g-factor penalty."],
 wt="Worked Example: Acceleration and its SNR penalty",
 we=r"""Parallel imaging undersamples k-space by an acceleration factor $R$ and
uses the coil sensitivities to unfold the aliasing. Scan time scales as $1/R$, but
SNR drops:
\[ \text{SNR}_{acc} = \frac{\text{SNR}_{full}}{g\sqrt{R}}, \]
where the geometry factor $g \ge 1$ depends on the array. For $R = 2$ and
$g = 1.2$, SNR falls to $\text{SNR}_{full}/(1.2\sqrt{2}) = 0.59\,\text{SNR}_{full}$
--- a bit worse than the $1/\sqrt{2}$ from undersampling alone.""",
 kt=["SENSE unfolds in image space; GRAPPA fills missing k-space lines --- both use coil sensitivities.",
     r"Acceleration $R$ cuts scan time by $1/R$ and SNR by $g\sqrt{R}$.",
     "The g-factor ($\\ge 1$) penalizes SNR where element sensitivities overlap."],
 ex=[r"Scan-time factor for $R = 3$?",
     r"Ideal SNR loss ($g = 1$) for $R = 4$?",
     "What array property keeps the g-factor near 1?"],
 sol=[r"One third the scan time ($1/R$).",
      r"A factor of $1/\sqrt{4} = 1/2$.",
      "Distinct, weakly overlapping element sensitivities (good spatial separation)."],
 read=r"Roemer \emph{et al.}~\cite{roemer}; Haacke~\cite{haacke}."),

'wiki_b1_mapping': dict(
 obj=[r"Explain why $B_1$ must be measured.",
      "Describe the double-angle method.",
      "Relate $B_1$ to flip angle."],
 wt="Worked Example: Flip angle from B1",
 we=r"""The flip angle produced by an RF pulse is $\alpha = \gamma\int B_1(t)\,dt$
--- proportional to the transmit field. Because $B_1$ is non-uniform (especially at
high field), the actual flip angle varies across the image, altering contrast.
$B_1$ mapping measures this: the double-angle method acquires images at nominal
$\alpha$ and $2\alpha$ and uses the signal ratio $S_{2\alpha}/S_\alpha = 2\cos\alpha$
to solve for the true local flip angle.""",
 kt=[r"Flip angle $\alpha = \gamma\int B_1\,dt$; a non-uniform $B_1$ makes $\alpha$ vary spatially.",
     r"$B_1$ inhomogeneity worsens at high field (shorter RF wavelength in tissue).",
     r"Double-angle method: $S_{2\alpha}/S_\alpha = 2\cos\alpha$ recovers the true flip angle."],
 ex=["Flip angle is proportional to which field?",
     r"What does $S_{2\alpha}/S_\alpha = 2\cos\alpha$ let you solve for?",
     r"Does $B_1$ non-uniformity get worse at higher field?"],
 sol=[r"The transmit RF field $B_1$ ($\alpha = \gamma\int B_1\,dt$).",
      r"The actual local flip angle $\alpha$ (hence the local $B_1$).",
      "Yes --- the RF wavelength in tissue shortens with field, so $B_1$ becomes less uniform."],
 read=r"Haacke~\cite{haacke}; Nishimura~\cite{nishimura}."),

'wiki_sar': dict(
 obj=["Define SAR and its field dependence.",
      r"Compute SAR scaling with $B_0$ and flip angle.",
      "Apply the IEC operating modes."],
 wt="Worked Example: SAR scaling with field",
 we=r"""Specific absorption rate is the RF power deposited per unit mass. Because
heating goes as the square of the RF field and frequency,
\[ \text{SAR} \propto f^2 B_1^2 \propto B_0^2\,\alpha^2. \]
Moving from $1.5\ \text{T}$ to $3\ \text{T}$ at the same flip angle raises SAR about
fourfold ($f$ doubles). The IEC caps whole-body SAR (normal mode $2\ \text{W/kg}$),
so high-field sequences must lengthen TR, lower flip angles, or use low-SAR
refocusing to stay within limits.""",
 kt=[r"$\text{SAR} \propto f^2 B_1^2$, so it scales as $B_0^2$ for a given flip angle.",
     r"IEC normal-mode whole-body limit is $2\ \text{W/kg}$; first-level mode allows more under supervision.",
     "High field forces SAR management: longer TR, lower/variable flip angles, low-SAR refocusing."],
 ex=[r"How does SAR change from $1.5\ \text{T}$ to $3\ \text{T}$ at fixed flip angle?",
     "Halving the flip angle changes SAR by what factor?",
     "What is the IEC normal-mode whole-body SAR limit?"],
 sol=[r"About $\times4$ (SAR $\propto f^2$, and $f$ doubles).",
      r"A factor of $1/4$ (SAR $\propto \alpha^2$).",
      r"$2\ \text{W/kg}$ (whole body, normal operating mode)."],
 read=r"ICNIRP~\cite{icnirp}; IEC 60601-2-33~\cite{iec60601}."),
}

for slug, d in CH.items():
    emit(slug, d)
print("Parts VI-X: wrote pedagogy for", len(CH), "chapters")
