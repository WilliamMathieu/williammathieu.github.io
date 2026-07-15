#!/usr/bin/env python3
"""Native chapters + pedagogy for Parts XIII (Comms), XIV (Antennas/Propagation), XV (Filters/Test)."""
import os
TB  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAT = os.path.join(TB, 'native'); PED = os.path.join(TB, 'pedagogy')
os.makedirs(NAT, exist_ok=True); os.makedirs(PED, exist_ok=True)

def emit(slug, d):
    open(os.path.join(NAT, slug + '.tex'), 'w').write(d['body'].strip() + '\n')
    obj = ("\\begin{objectives}\n\\begin{itemize}[leftmargin=1.4em,itemsep=2pt]\n"
           + "\n".join("\\item " + x for x in d['obj']) + "\n\\end{itemize}\n\\end{objectives}\n")
    body = ("\\begin{workedexample}[%s]\n%s\n\\end{workedexample}\n\n" % (d['wt'], d['we'].strip())
            + "\\begin{keytakeaways}\n\\begin{itemize}[leftmargin=1.4em,itemsep=2pt]\n"
            + "\n".join("\\item " + x for x in d['kt']) + "\n\\end{itemize}\n\\end{keytakeaways}\n\n"
            + "\\begin{exercises}\n" + "\n".join("\\item " + x for x in d['ex']) + "\n\\end{exercises}\n\n"
            + "\\furtherreading{%s}\n" % d['read'])
    sol = ("\\begin{enumerate}[leftmargin=1.6em,itemsep=2pt]\n"
           + "\n".join("\\item " + x for x in d['sol']) + "\n\\end{enumerate}\n")
    open(os.path.join(PED, slug + '_obj.tex'), 'w').write(obj)
    open(os.path.join(PED, slug + '.tex'), 'w').write(body)
    open(os.path.join(PED, slug + '_sol.tex'), 'w').write(sol)

CH = {
# ================= Part XIII: Communication Systems =================
'tb_digital_comm': dict(
 body=r"""
Modern RF exists to move bits, so the RF engineer needs the information-theory
vocabulary that sets how many bits a channel can carry and how reliably.

\section{Energy per Bit and SNR}
Digital links are compared not by raw SNR but by the energy-per-bit to
noise-density ratio $E_b/N_0$, which normalizes out data rate and bandwidth:
\[ \text{SNR} = \frac{E_b}{N_0}\cdot\frac{R_b}{B}. \]
A scheme's bit-error rate is a function of $E_b/N_0$ alone; for BPSK/QPSK,
$\text{BER} = Q\!\big(\sqrt{2E_b/N_0}\big)$.

\section{The Shannon Limit}
Shannon's capacity gives the ultimate error-free rate of a bandlimited channel:
\[ C = B\,\log_2(1 + \text{SNR}). \]
No modulation or code can exceed it; real systems operate some margin below it and
spend coding and bandwidth to approach it.

\section{Bandwidth, Pulse Shaping, and Efficiency}
Sharp symbols would need infinite bandwidth, so transmitters shape pulses (e.g.\
raised-cosine with roll-off $\beta$) to fit a spectral mask while limiting
inter-symbol interference. \emph{Spectral efficiency} (bit/s/Hz) rises with
constellation order but demands more SNR --- the same trade seen throughout digital
RF.
""",
 obj=[r"Relate $E_b/N_0$, SNR, data rate, and bandwidth.",
      "State the Shannon capacity limit.",
      "Explain pulse shaping and spectral efficiency."],
 wt="Worked Example: Shannon capacity",
 we=r"""A channel has bandwidth $B = 20\ \text{MHz}$ and $\text{SNR} = 100$
($20\ \text{dB}$). Its capacity is
\[ C = B\log_2(1+\text{SNR}) = 20\times10^{6}\,\log_2(101) = 20\times10^{6}\times6.66 = 133\ \text{Mbit/s}. \]
A practical link runs a few dB below this, choosing a modulation and code whose
required $E_b/N_0$ fits the available SNR.""",
 kt=[r"$\text{SNR} = (E_b/N_0)(R_b/B)$; BER depends on $E_b/N_0$, e.g.\ QPSK $= Q(\sqrt{2E_b/N_0})$.",
     r"Shannon capacity $C = B\log_2(1+\text{SNR})$ is the unbeatable ceiling.",
     "Pulse shaping fits the spectral mask; higher-order modulation trades SNR for spectral efficiency."],
 ex=[r"Shannon capacity of a $5\ \text{MHz}$ channel at $\text{SNR} = 31$ ($15\ \text{dB}$)?",
     r"Does BER depend on absolute SNR or on $E_b/N_0$?",
     "Why can't symbols be made arbitrarily sharp in time?"],
 sol=[r"$C = 5\times10^{6}\log_2(32) = 5\times10^{6}\times5 = 25\ \text{Mbit/s}$.",
      r"On $E_b/N_0$ (which normalizes out rate and bandwidth).",
      "Sharp (short) pulses require large bandwidth; pulse shaping limits bandwidth while controlling inter-symbol interference."],
 read=r"Proakis~\cite{proakis}; Sklar~\cite{sklar}."),

'tb_coding': dict(
 body=r"""
Getting close to the Shannon limit takes more than a good constellation: it takes
coding, and often spread-spectrum or multicarrier techniques matched to the
channel.

\section{Forward Error Correction}
FEC adds structured redundancy so the receiver can correct errors without
retransmission. Block, convolutional, turbo, and LDPC codes each buy a
\emph{coding gain} --- the reduction in required $E_b/N_0$ for a target BER ---
at the cost of overhead and decoder complexity. Modern LDPC/turbo codes approach
the Shannon limit within a fraction of a dB.

\section{Spread Spectrum}
Direct-sequence spread spectrum multiplies the data by a much faster pseudo-random
chip sequence, spreading the signal over a wide band. The receiver despreads it,
gaining a \emph{processing gain}
\[ G_p = \frac{R_{chip}}{R_{data}}, \]
which suppresses narrowband interference and enables code-division multiple
access. Frequency hopping spreads by rapidly changing carrier instead.

\section{OFDM}
Orthogonal frequency-division multiplexing splits a high-rate stream across many
narrow, orthogonal subcarriers, each seeing a nearly flat channel. A cyclic
prefix longer than the channel delay spread eliminates inter-symbol interference,
making equalization trivial --- the reason OFDM underlies Wi-Fi, LTE, and 5G. Its
cost is a high peak-to-average power ratio (PAPR) that stresses the power
amplifier.
""",
 obj=["Explain forward error correction and coding gain.",
      "Compute spread-spectrum processing gain.",
      "Describe OFDM and its cyclic prefix and PAPR trade-offs."],
 wt="Worked Example: Spreading processing gain",
 we=r"""A direct-sequence system spreads a $R_{data} = 10\ \text{kbit/s}$ stream
with a $R_{chip} = 10\ \text{Mchip/s}$ code. The processing gain is
\[ G_p = \frac{R_{chip}}{R_{data}} = \frac{10\times10^{6}}{10\times10^{3}} = 1000 = 30\ \text{dB}. \]
Despreading concentrates the wanted signal while spreading interference, so a
narrowband jammer is suppressed by $\sim30\ \text{dB}$ relative to the signal.""",
 kt=["FEC (block, convolutional, turbo, LDPC) buys coding gain; LDPC/turbo near the Shannon limit.",
     r"DSSS processing gain $G_p = R_{chip}/R_{data}$ suppresses narrowband interference and enables CDMA.",
     "OFDM: orthogonal subcarriers + cyclic prefix beat delay spread, at the cost of high PAPR."],
 ex=[r"Processing gain for $R_{chip} = 1\ \text{Mchip/s}$, $R_{data} = 2\ \text{kbit/s}$?",
     "What must the OFDM cyclic prefix be longer than?",
     "Name the main power-amplifier drawback of OFDM."],
 sol=[r"$G_p = 10^{6}/(2\times10^{3}) = 500 = 27\ \text{dB}$.",
      "The channel's delay spread (so inter-symbol interference is absorbed).",
      "Its high peak-to-average power ratio (PAPR), which forces PA back-off."],
 read=r"Sklar~\cite{sklar}; Goldsmith~\cite{goldsmith}."),

# ================= Part XIV: Advanced Antennas and Propagation =================
'tb_antenna_types': dict(
 body=r"""
Beyond the dipole and helix, the antenna zoo offers a form for every constraint
--- low profile, high gain, or wide band.

\section{Wire and Loop}
Dipoles, monopoles (a dipole over a ground plane), and loops are the simplest
resonant radiators, cheap and omnidirectional-ish, used from HF to UHF.

\section{Microstrip Patch}
A patch is a resonant metal rectangle over a ground plane, roughly a half
wavelength long in the substrate,
\[ L \approx \frac{c}{2 f\sqrt{\varepsilon_{\text{eff}}}}. \]
It is flat, cheap to print, and easily arrayed, but inherently narrowband. Feed
by edge line, probe, or aperture coupling.

\section{Aperture Antennas}
Horns and parabolic reflectors turn a large physical aperture into high gain
($G = \eta_a 4\pi A/\lambda^2$), dominating radar and satellite links where
directivity is paramount.

\section{Broadband and Mobile}
Log-periodic and spiral antennas trade size for octaves of bandwidth by scaling
their geometry. For handsets, the PIFA (planar inverted-F), monopole, and chip
antennas fold a resonant structure into a tiny volume against the challenge of a
small, detuning ground plane.
""",
 obj=["Match antenna types (patch, horn, reflector, log-periodic, PIFA) to requirements.",
      "Estimate a microstrip patch's resonant length.",
      "Explain the size--bandwidth--gain trade among antenna families."],
 wt="Worked Example: Patch resonant length",
 we=r"""A patch on FR-4 ($\varepsilon_r = 4.4$) at $f = 2.4\ \text{GHz}$ resonates
near a half wavelength in the substrate. Using
$\varepsilon_{\text{eff}} \approx (\varepsilon_r+1)/2 = 2.7$,
\[ L \approx \frac{c}{2f\sqrt{\varepsilon_{\text{eff}}}}
   = \frac{3\times10^{8}}{2(2.4\times10^{9})(1.64)} = 38\ \text{mm}, \]
trimmed slightly for fringing fields. Patches are low-profile and easily arrayed
but narrowband.""",
 kt=[r"Patch $L \approx c/(2f\sqrt{\varepsilon_{\text{eff}}})$: flat, cheap, arrayable, narrowband.",
     r"Aperture antennas (horn, reflector) give high gain $G = \eta_a 4\pi A/\lambda^2$.",
     "Log-periodic/spiral trade size for bandwidth; PIFA/monopole suit handsets."],
 ex=[r"Patch length on a substrate with $\varepsilon_{\text{eff}} = 6.25$ at $1\ \text{GHz}$?",
     "Which antenna family gives the widest bandwidth for its size?",
     "Which gives the highest gain: a patch or a parabolic reflector?"],
 sol=[r"$L \approx c/(2f\sqrt{\varepsilon_{\text{eff}}}) = 3\times10^{8}/(2\times10^{9}\times2.5) = 60\ \text{mm}$.",
      "Log-periodic or spiral (frequency-independent geometries).",
      "The parabolic reflector (a large aperture focuses a much narrower, higher-gain beam)."],
 read=r"Balanis~\cite{balanis} (ch.~14); Pozar~\cite{pozar} (ch.~14)."),

'tb_beamforming': dict(
 body=r"""
Combining many antenna elements lets a system synthesize and steer a beam
electronically --- the basis of modern radar and 5G.

\section{The Array Factor}
For $N$ identical elements spaced $d$ along a line, the far-field pattern is the
element pattern times the array factor
\[ \text{AF}(\theta) = \sum_{n=0}^{N-1} e^{\,j n (k d \cos\theta + \beta)}, \]
where $\beta$ is the progressive phase between elements. The array factor, not the
element, gives the array its directivity.

\section{Steering}
Choosing $\beta = -k d \sin\theta_0$ (for a broadside reference) points the main
beam to angle $\theta_0$ --- with no moving parts, just phase. The beam can be
repointed in microseconds, which is why phased arrays replaced mechanically
scanned dishes in radar.

\section{Beamwidth, Grating Lobes, Tapering}
More elements and wider aperture narrow the beam (beamwidth $\propto \lambda/(Nd)$).
If $d>\lambda$, extra \emph{grating lobes} appear (usually $d\le\lambda/2$ avoids
them). Amplitude tapering across the array trades a little beamwidth for much lower
sidelobes.

\section{Digital Beamforming and MIMO}
With a receiver per element, beams are formed in DSP --- many simultaneous beams,
adaptive nulling of interferers, and, in communications, spatial multiplexing
(MIMO/massive MIMO) that sends independent streams on the same frequency.
""",
 obj=["Write and interpret the array factor of a uniform linear array.",
      "Compute the progressive phase needed to steer the beam.",
      "Explain beamwidth, grating lobes, and tapering."],
 wt="Worked Example: Steering phase and beamwidth",
 we=r"""A uniform linear array with $d = \lambda/2$ is steered to $\theta_0 = 30^\circ$.
The required progressive phase per element is
\[ \beta = -k d \sin\theta_0 = -\frac{2\pi}{\lambda}\cdot\frac{\lambda}{2}\cdot\sin30^\circ = -\frac{\pi}{2} = -90^\circ. \]
For $N = 8$ elements at $d=\lambda/2$, the broadside half-power beamwidth is about
$0.886\,\lambda/(Nd) = 0.886/4 = 0.22\ \text{rad} = 12.7^\circ$.""",
 kt=[r"$\text{AF}(\theta) = \sum_n e^{jn(kd\cos\theta+\beta)}$; the array factor sets directivity.",
     r"Steer with $\beta = -kd\sin\theta_0$ --- electronic, instantaneous.",
     r"Beamwidth $\propto \lambda/(Nd)$; keep $d \le \lambda/2$ to avoid grating lobes; taper for low sidelobes."],
 ex=[r"Steering phase for $d = \lambda/2$ to $\theta_0 = 90^\circ$ (endfire)?",
     r"Why keep element spacing $d \le \lambda/2$?",
     "What does amplitude tapering buy, and at what cost?"],
 sol=[r"$\beta = -kd\sin90^\circ = -(2\pi/\lambda)(\lambda/2)(1) = -\pi = -180^\circ$.",
      "To avoid grating lobes (additional main-beam-strength lobes) that appear once $d > \lambda$.",
      "Lower sidelobes, at the cost of a slightly wider main beam (and lower peak directivity)."],
 read=r"Mailloux~\cite{mailloux}; Balanis~\cite{balanis} (ch.~6)."),

'tb_propagation': dict(
 body=r"""
Between transmitter and receiver the channel adds far more than free-space loss:
reflection, diffraction, and multipath shape every real link.

\section{Beyond Free Space}
Near the ground, a direct ray and a ground-reflected ray interfere; beyond a
break point the received power falls as $1/d^4$ rather than $1/d^2$. Empirical
models (Okumura--Hata, COST-231) fit measured path loss in urban and suburban
environments where a full calculation is hopeless.

\section{Diffraction and Fresnel Zones}
Waves bend around obstacles (diffraction), so a link can close even without line
of sight. The first Fresnel zone --- an ellipsoid around the direct path with
radius
\[ r_1 = \sqrt{\frac{\lambda\, d_1 d_2}{d_1 + d_2}} \]
at the point between distances $d_1$ and $d_2$ --- should be kept mostly clear of
obstructions to avoid diffraction loss.

\section{Multipath and Fading}
Many reflected paths arrive with different delays and phases, so the received
amplitude \emph{fades}. With no dominant path the envelope is Rayleigh
distributed; with a line-of-sight component it is Rician. The spread of path
delays (delay spread) sets the \emph{coherence bandwidth} beyond which the channel
is frequency-selective, and motion causes a Doppler spread that sets how fast the
fading changes.
""",
 obj=["Contrast free-space, two-ray, and empirical path-loss models.",
      "Compute a Fresnel-zone radius and explain clearance.",
      "Distinguish Rayleigh and Rician fading and relate delay spread to coherence bandwidth."],
 wt="Worked Example: First Fresnel-zone radius",
 we=r"""A $2.4\ \text{GHz}$ link ($\lambda = 0.125\ \text{m}$) spans $1\ \text{km}$
with the obstacle at midpoint ($d_1 = d_2 = 500\ \text{m}$). The first Fresnel-zone
radius there is
\[ r_1 = \sqrt{\frac{\lambda d_1 d_2}{d_1+d_2}} = \sqrt{\frac{0.125\cdot500\cdot500}{1000}} = \sqrt{31.25} = 5.6\ \text{m}. \]
Keeping about $60\%$ of this radius clear avoids significant diffraction loss.""",
 kt=[r"Two-ray ground reflection gives $1/d^4$ far-field loss; Okumura--Hata/COST-231 fit real environments.",
     r"First Fresnel radius $r_1 = \sqrt{\lambda d_1 d_2/(d_1+d_2)}$; keep it mostly clear.",
     "Multipath fades: Rayleigh (no LOS) or Rician (LOS); delay spread sets coherence bandwidth, Doppler sets fade rate."],
 ex=[r"First Fresnel radius at the midpoint of a $2\ \text{km}$, $900\ \text{MHz}$ link?",
     "What fading distribution applies with a strong line-of-sight component?",
     "What channel parameter sets the coherence bandwidth?"],
 sol=[r"$\lambda = 0.333\ \text{m}$; $r_1 = \sqrt{0.333\cdot1000\cdot1000/2000} = \sqrt{166.7} = 12.9\ \text{m}$.",
      "Rician.",
      "The delay spread (its inverse is roughly the coherence bandwidth)."],
 read=r"Rappaport~\cite{rappaport}; Goldsmith~\cite{goldsmith}."),

'tb_antenna_meas': dict(
 body=r"""
An antenna's real performance is measured, not just simulated, and RF metrology
has its own methods and pitfalls.

\section{The Far-Field Condition}
Pattern and gain are defined in the far field, beyond
\[ R \ge \frac{2 D^2}{\lambda}, \]
where $D$ is the largest aperture dimension. Measurements are made on outdoor
ranges or in anechoic chambers whose absorber suppresses reflections.

\section{Gain Measurement}
Two standard methods: the \emph{gain-comparison} method references the antenna to
a calibrated gain standard, and the \emph{three-antenna} method solves for three
unknown gains from three pairwise transmission measurements --- needing no prior
standard.

\section{Pattern, Polarization, and Near-Field}
Rotating the antenna traces its radiation pattern and, with a polarized source,
its polarization and axial ratio. When a far-field range is impractical, a probe
scans the near field over a plane, cylinder, or sphere and a mathematical
transform computes the far-field pattern. Impedance and return loss are measured
directly on a VNA, and radiation efficiency by methods such as the Wheeler cap.
""",
 obj=["Compute the far-field distance for a measurement.",
      "Describe gain-comparison and three-antenna gain measurement.",
      "Explain near-field scanning and pattern/polarization measurement."],
 wt="Worked Example: Far-field distance",
 we=r"""A reflector of largest dimension $D = 0.3\ \text{m}$ is measured at
$f = 10\ \text{GHz}$ ($\lambda = 0.03\ \text{m}$). The far field begins at
\[ R \ge \frac{2D^2}{\lambda} = \frac{2(0.3)^2}{0.03} = 6\ \text{m}. \]
Measuring closer than this corrupts the pattern; if $6\ \text{m}$ of range is
impractical, a near-field scan with a far-field transform is used instead.""",
 kt=[r"Far field begins at $R \ge 2D^2/\lambda$; measure in an anechoic chamber or on a range.",
     "Gain by comparison (to a standard) or the three-antenna method (no standard needed).",
     "Near-field scanning + transform yields the far-field pattern when a far-field range is impractical."],
 ex=[r"Far-field distance for $D = 1\ \text{m}$ at $3\ \text{GHz}$?",
     "Which gain method needs no pre-calibrated reference antenna?",
     "How is antenna impedance/return loss measured?"],
 sol=[r"$\lambda = 0.1\ \text{m}$; $R = 2(1)^2/0.1 = 20\ \text{m}$.",
      "The three-antenna method.",
      "Directly with a vector network analyzer ($S_{11}$)."],
 read=r"Balanis~\cite{balanis} (ch.~17); Pozar~\cite{pozar} (ch.~4)."),

# ================= Part XV: Filters, Control Components and Test =================
'tb_adv_filters': dict(
 body=r"""
Beyond lumped LC and stepped-impedance filters lies a family of high-performance
structures chosen for their $Q$, size, or steepness.

\section{Distributed Filters}
At microwave frequencies filters are built from coupled transmission lines:
coupled-line, combline, interdigital, and hairpin topologies realize bandpass
responses in microstrip. They avoid lumped parts and are printed directly on the
board.

\section{High-Q Resonator Filters}
Where low loss and high power matter, cavity and dielectric-resonator filters
provide unloaded $Q$ in the thousands --- versus a couple hundred for microstrip
--- giving very low insertion loss and sharp skirts for base-station duplexers.

\section{Acoustic Filters}
Surface-acoustic-wave (SAW) and bulk-acoustic-wave (BAW/FBAR) filters convert the
signal to an acoustic wave whose wavelength is $10^5$ times shorter, packing a
very steep, tiny filter into a chip --- the technology inside every phone's RF
front end. Crystal and ceramic filters serve narrowband IF and lower-frequency
needs.

\section{Specifications and Multiplexers}
Filters are judged on insertion loss, selectivity (shape factor), and power
handling, all tied to resonator $Q$. Combining filters into duplexers, diplexers,
and multiplexers lets one antenna serve transmit and receive or many bands at
once.
""",
 obj=["Match distributed, cavity/DR, and acoustic filters to requirements.",
      "Relate resonator Q to insertion loss and selectivity.",
      "Explain duplexers/diplexers/multiplexers."],
 wt="Worked Example: Loaded Q for a channel filter",
 we=r"""A bandpass filter at $f_0 = 2\ \text{GHz}$ must pass a $20\ \text{MHz}$
channel. Its loaded quality factor is
\[ Q_L = \frac{f_0}{\text{BW}} = \frac{2\times10^{9}}{20\times10^{6}} = 100. \]
For low insertion loss the resonators' \emph{unloaded} $Q$ must far exceed this
($Q_u \gg Q_L$). Microstrip ($Q_u\!\sim\!200$) would be lossy here; a cavity or
BAW resonator ($Q_u$ in the thousands) is the right choice.""",
 kt=["Distributed (coupled-line/combline/interdigital) filters print in microstrip; no lumped parts.",
     r"Cavity/DR give $Q_u$ in the thousands (low loss, sharp); SAW/BAW pack steep filters into a chip.",
     r"Insertion loss falls as $Q_u/Q_L$ rises; duplexers/diplexers share one antenna across TX/RX or bands."],
 ex=[r"Loaded $Q$ for a $1\%$ fractional-bandwidth filter?",
     "Which filter technology sits in a smartphone's RF front end for steep, tiny filters?",
     "Why does a base-station duplexer use cavity resonators rather than microstrip?"],
 sol=[r"$Q_L = f_0/\text{BW} = 1/0.01 = 100$.",
      "Acoustic filters (SAW and especially BAW/FBAR).",
      r"Their high unloaded $Q$ gives the low insertion loss and steep skirts needed to separate closely spaced TX/RX bands."],
 read=r"Hong~\cite{hong}; Pozar~\cite{pozar} (ch.~8)."),

'tb_control': dict(
 body=r"""
Control components route, attenuate, phase-shift, and protect RF signals --- the
switches and dials of a radio front end.

\section{Switches}
RF switches (PIN-diode, FET, or MEMS) select paths, band-switch, and share an
antenna between transmit and receive. They are judged on insertion loss,
isolation, linearity (IP3), and switching speed; MEMS give the best loss and
linearity but switch slowly.

\section{Phase Shifters}
Phase shifters set the progressive phase that steers a phased array. Switched-line,
loaded-line, reflection-type, and vector-modulator designs provide either discrete
bits or continuous control. A digital phase shifter of $n$ bits has a least
significant step of $360^\circ/2^n$.

\section{Ferrite Devices}
Magnetized ferrites are \emph{nonreciprocal}: a circulator routes power
port-to-port in one rotational direction, and terminating one port makes an
isolator that passes forward power while absorbing reflections --- protecting a
transmitter from a bad load. YIG spheres make electronically tunable filters and
oscillators.

\section{Attenuators and Limiters}
Variable attenuators (PIN or FET) set gain in AGC loops; limiters (PIN-diode)
protect sensitive receivers by clipping large input spikes.
""",
 obj=["Compare PIN, FET, and MEMS RF switches.",
      "Compute the resolution of a digital phase shifter.",
      "Explain nonreciprocal ferrite circulators and isolators."],
 wt="Worked Example: Digital phase-shifter resolution",
 we=r"""A $6$-bit digital phase shifter divides the full circle into
\[ \text{LSB} = \frac{360^\circ}{2^{6}} = 5.625^\circ, \]
so it can command any phase from $0^\circ$ to $354.375^\circ$ in $5.625^\circ$
steps. Finer beam pointing in a phased array needs more bits; array calibration
corrects the residual phase errors between elements.""",
 kt=["Switches (PIN/FET/MEMS): trade insertion loss, isolation, IP3, and speed.",
     r"An $n$-bit phase shifter has LSB $= 360^\circ/2^n$.",
     "Ferrites are nonreciprocal: circulators route one way; terminate a port for an isolator that protects the source."],
 ex=[r"Least-significant step of a $4$-bit phase shifter?",
     "What component protects a transmitter from power reflected by a bad antenna?",
     "Which switch technology offers the lowest insertion loss but the slowest switching?"],
 sol=[r"$360^\circ/2^{4} = 22.5^\circ$.",
      "An isolator (a circulator with one port terminated).",
      "RF MEMS switches."],
 read=r"Pozar~\cite{pozar} (ch.~7, 10); Steer~\cite{steer}."),

'tb_measurement': dict(
 body=r"""
RF engineering is empirical: designs are proven on the bench, and the instruments
have characteristic strengths and traps.

\section{Spectrum Analyzer}
A spectrum analyzer shows power versus frequency. Its resolution bandwidth (RBW)
sets both the frequency resolution and the displayed noise floor (narrower RBW
lowers the floor); the video bandwidth (VBW) smooths the trace. Swept analyzers
trade speed for span; FFT/real-time analyzers capture transients.

\section{Sources, Power, and Noise}
Signal and vector-signal generators provide clean or modulated stimuli; power
meters (diode or thermal) measure absolute level. Noise figure is measured by the
\emph{Y-factor} method: an excess-noise-ratio (ENR) source is switched on and off,
and the hot/cold power ratio $Y$ gives
\[ F = \frac{\text{ENR}}{Y - 1}. \]

\section{Network Analysis and Time Domain}
The VNA measures S-parameters after a SOLT or TRL calibration that moves the
reference plane to the device and removes systematic error. Time-domain
reflectometry (TDR) locates impedance discontinuities along a line by their echo
delay, and oscilloscopes/logic analyzers handle the digital side of an SDR.
""",
 obj=["Explain RBW/VBW and the spectrum-analyzer noise floor.",
      "Measure noise figure by the Y-factor method.",
      "Describe VNA calibration and time-domain reflectometry."],
 wt="Worked Example: Y-factor noise figure",
 we=r"""A noise source with $\text{ENR} = 15\ \text{dB}$ ($=31.6$ linear) is
switched on and off at a device's input, giving a hot/cold power ratio
$Y = 8\ \text{dB}$ ($=6.31$). The noise factor is
\[ F = \frac{\text{ENR}}{Y - 1} = \frac{31.6}{6.31 - 1} = 5.95, \]
i.e.\ $\text{NF} = 7.75\ \text{dB}$. A larger $Y$ (from a lower-noise device)
gives a lower, more accurate NF reading.""",
 kt=["Narrower RBW lowers the analyzer noise floor and sharpens resolution but slows the sweep.",
     r"Y-factor: $F = \text{ENR}/(Y-1)$ from the hot/cold power ratio.",
     "VNA needs SOLT/TRL calibration; TDR locates discontinuities by echo delay."],
 ex=[r"With $\text{ENR} = 15\ \text{dB}$ and $Y = 10\ \text{dB}$, find the noise figure.",
     "What happens to a spectrum analyzer's noise floor when you narrow the RBW?",
     "What does a TDR measurement locate?"],
 sol=[r"$Y = 10\ \text{dB} = 10$; $F = 31.6/(10-1) = 3.51$, so $\text{NF} = 5.5\ \text{dB}$.",
      "It drops (less noise power in a narrower bandwidth), revealing weaker signals.",
      "Impedance discontinuities (and their distance) along a transmission line, from the echo delay."],
 read=r"Pozar~\cite{pozar} (ch.~4); Steer~\cite{steer}."),

'tb_cad': dict(
 body=r"""
No modern RF design reaches hardware without simulation. Knowing which tool models
what --- and its limits --- is part of the craft.

\section{Circuit Simulation}
Linear (S-parameter) simulation gives frequency response instantly for matching
and filters. Nonlinear behavior needs \emph{harmonic balance} (steady-state
response to periodic drive --- ideal for amplifiers, mixers, and oscillators) or
\emph{transient/envelope} methods; SPICE handles time-domain and start-up. Each
answers a different question about the same circuit.

\section{Electromagnetic Simulation}
When layout parasitics or radiation matter, EM solvers compute the fields
directly: method-of-moments (planar structures, e.g.\ microstrip), finite-element
(arbitrary 3-D, e.g.\ connectors and packages), and FDTD (broadband, transient).
They are accurate but slow, so they verify critical structures rather than whole
boards.

\section{The Design Flow}
A typical flow: write the spec, design and simulate the schematic, lay it out, EM-
verify the critical nets, fabricate, then measure and tune. Models are de-embedded
against measurements, and Monte-Carlo/corner analysis checks yield against
component and process tolerances (design for manufacture). A mesh cell of roughly
$\lambda/10$ to $\lambda/20$ is the rule of thumb for EM accuracy.
""",
 obj=["Distinguish linear, harmonic-balance, transient, and SPICE circuit simulation.",
      "Choose among MoM, FEM, and FDTD electromagnetic solvers.",
      "Outline the schematic-to-measurement design flow and meshing rule."],
 wt="Worked Example: EM mesh cell size",
 we=r"""An EM solver models a microstrip structure at $f = 10\ \text{GHz}$
($\lambda_0 = 30\ \text{mm}$ in air). A common accuracy rule is a mesh cell no
larger than about $\lambda/10$:
\[ \Delta \le \frac{\lambda_0}{10} = 3\ \text{mm}, \]
and finer ($\lambda/20 = 1.5\ \text{mm}$) where fields vary rapidly (edges, gaps).
Too coarse a mesh mis-predicts resonances; too fine wastes hours of compute.""",
 kt=["Linear S-param for response; harmonic balance for nonlinear steady state; SPICE/transient for time domain.",
     "EM solvers: MoM (planar), FEM (3-D), FDTD (broadband); slow, so they verify critical structures.",
     r"Flow: spec $\to$ schematic sim $\to$ layout $\to$ EM verify $\to$ measure/tune; mesh $\sim\lambda/10$--$\lambda/20$."],
 ex=[r"Which simulation type best analyzes a mixer's conversion loss and spurs?",
     r"Recommended EM mesh cell at $5\ \text{GHz}$ in air (using $\lambda/10$)?",
     "Why EM-simulate only critical nets rather than the whole board?"],
 sol=[r"Harmonic balance (nonlinear steady-state response to a periodic drive).",
      r"$\lambda_0 = 60\ \text{mm}$, so $\Delta \le 6\ \text{mm}$.",
      "EM simulation is computationally expensive; verifying only critical structures keeps runtimes practical."],
 read=r"Steer~\cite{steer}; Pozar~\cite{pozar}."),
}

for slug, d in CH.items():
    emit(slug, d)
print("Parts XIII-XV: wrote native+pedagogy for", len(CH), "chapters")
