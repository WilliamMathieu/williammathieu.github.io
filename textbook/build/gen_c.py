#!/usr/bin/env python3
"""Native chapters + pedagogy for Parts XI (Active Devices) and XII (Receivers/Digital RF)."""
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
# ================= Part XI: Active Devices and Circuit Design =================
'tb_transistors': dict(
 body=r"""
Every active RF function --- amplification, oscillation, mixing --- rests on a
three-terminal transistor that turns a small control signal into a larger
controlled current. Choosing the right device technology is the first design
decision.

\section{Device Families}
\emph{Silicon BJT and SiGe HBT} devices offer low cost, low $1/f$ noise, and good
linearity into the tens of GHz (SiGe). \emph{CMOS} enables single-chip integration
of RF and digital, at the price of higher noise and lower breakdown. \emph{GaAs
MESFET/pHEMT} give very low noise figures and reach millimetre waves; \emph{GaN
HEMT} combines high breakdown voltage with high power density, dominating modern
power amplifiers.

\section{Figures of Merit}
The transition frequency $f_T$ is where the short-circuit current gain falls to
unity,
\[ f_T = \frac{g_m}{2\pi(C_{gs}+C_{gd})}, \]
where $g_m = \partial I_D/\partial V_{GS}$ is the transconductance. The maximum
oscillation frequency $f_{max}$, where the unilateral power gain reaches unity, is
the more relevant ceiling for amplifiers and typically exceeds $f_T$. A useful
device runs well below both.

\section{Biasing}
The transistor must be held at a quiescent operating point (bias) that sets its
$g_m$, linearity, and noise. Bias is delivered through RF chokes and bypass
capacitors that feed DC while blocking RF, and the network must itself be stable
and temperature-tolerant. Class-A bias (continuous conduction) gives the best
linearity and noise; lower conduction angles trade linearity for efficiency
(Part~V).

\section{Small-Signal Model and Technology Choice}
Near the operating point the device is described by a linear equivalent circuit
(a transconductance $g_m$, input and feedback capacitances, output conductance),
or equivalently by its measured S-parameters at that bias. Match the technology to
the job: SiGe or GaAs pHEMT for a low-noise front end, GaN for a power stage, and
CMOS when integration with baseband matters most.
""",
 obj=["Compare the major RF transistor technologies (Si BJT/SiGe, CMOS, GaAs, GaN).",
      r"Define $f_T$ and $f_{max}$ and relate them to $g_m$ and capacitance.",
      "Explain the purpose of the bias network and its trade-offs."],
 wt="Worked Example: Transition frequency",
 we=r"""A device has transconductance $g_m = 50\ \text{mS}$ and total input
capacitance $C_{gs}+C_{gd} = 0.2\ \text{pF}$. Its transition frequency is
\[ f_T = \frac{g_m}{2\pi(C_{gs}+C_{gd})} = \frac{0.05}{2\pi(0.2\times10^{-12})} = 39.8\ \text{GHz}. \]
Useful gain is available well below $f_T$; $f_{max}$ sets the true upper limit.""",
 kt=[r"$f_T = g_m/[2\pi(C_{gs}+C_{gd})]$; $f_{max}$ (unity power gain) is the practical ceiling.",
     "GaN for power, GaAs pHEMT / SiGe for low noise, CMOS for integration.",
     "Bias sets $g_m$, linearity, and noise; deliver it through chokes/bypass without spoiling stability."],
 ex=[r"A device has $g_m = 80\ \text{mS}$ and $C_{in} = 0.1\ \text{pF}$. Find $f_T$.",
     "Which technology would you pick for a high-power PA?",
     r"Is $f_T$ or $f_{max}$ the better indicator of usable amplifier bandwidth?"],
 sol=[r"$f_T = 0.08/[2\pi(0.1\times10^{-12})] = 127\ \text{GHz}$.",
      "GaN HEMT (high breakdown voltage and power density).",
      r"$f_{max}$ --- it is the frequency of unity \emph{power} gain, the real limit for amplification."],
 read=r"Razavi~\cite{razavi} (ch.~2, 5); Gonzalez~\cite{gonzalez} (ch.~2)."),

'tb_diodes': dict(
 body=r"""
Diodes are the workhorse two-terminal nonlinear elements of RF: they detect,
mix, switch, tune, and generate harmonics.

\section{Schottky Diodes}
A Schottky (metal--semiconductor) diode has no minority-carrier storage, so it
switches extremely fast and rectifies well into the millimetre-wave range. Its
low, sharp turn-on makes it the standard device for power detectors and for
diode (passive) mixers.

\section{Varactors}
A varactor is a reverse-biased junction used as a voltage-variable capacitor,
\[ C(V) = \frac{C_0}{(1 + V/\phi)^{\,n}}, \]
with built-in potential $\phi$ and grading coefficient $n$ ($n=1/2$ abrupt,
$n\!\to\!1$ hyperabrupt). Varactors tune VCOs and filters; the useful metric is the
capacitance (tuning) ratio over the control-voltage range.

\section{PIN Diodes}
A PIN diode has an intrinsic layer that, when forward biased, stores charge and
behaves at RF as a \emph{current-controlled resistor} --- low resistance when on,
high when off --- but it does not rectify the RF because the carriers cannot
follow it. This makes the PIN diode the standard element for RF switches,
variable attenuators, and phase shifters.

\section{Other Devices}
Step-recovery diodes snap off sharply to generate rich harmonic combs (comb
generators). Tunnel and Gunn diodes exhibit negative differential resistance and
can build simple oscillators. Each exploits a specific nonlinearity of the
junction.
""",
 obj=["Match Schottky, varactor, and PIN diodes to their RF roles.",
      "Compute a varactor's capacitance and tuning ratio versus bias.",
      "Explain why a PIN diode acts as an RF resistor, not a rectifier."],
 wt="Worked Example: Varactor tuning ratio",
 we=r"""An abrupt-junction varactor ($n = 1/2$) has $C_0 = 10\ \text{pF}$ and
$\phi = 0.7\ \text{V}$. At a reverse bias of $4\ \text{V}$,
\[ C(4) = \frac{10}{(1 + 4/0.7)^{1/2}} = \frac{10}{\sqrt{6.71}} = 3.86\ \text{pF}. \]
The tuning ratio from $0$ to $4\ \text{V}$ is $C(0)/C(4) = 10/3.86 = 2.6$, which
sets the frequency tuning range of a VCO built with it.""",
 kt=[r"Schottky: fast, low-drop --- detectors and passive mixers.",
     r"Varactor $C(V)=C_0/(1+V/\phi)^n$ --- VCO/filter tuning; ratio sets range.",
     "PIN: charge-controlled RF resistor --- switches, attenuators, phase shifters."],
 ex=[r"An abrupt varactor has $C_0 = 8\ \text{pF}$, $\phi = 0.7\ \text{V}$. Find $C$ at $3\ \text{V}$.",
     "Which diode would you use to build a broadband RF switch?",
     "Why does a PIN diode not demodulate the RF passing through it?"],
 sol=[r"$C = 8/\sqrt{1+3/0.7} = 8/\sqrt{5.29} = 3.48\ \text{pF}$.",
      "A PIN diode.",
      "Its stored charge in the intrinsic region cannot follow the fast RF, so it presents a fixed resistance set by the DC bias rather than rectifying."],
 read=r"Maas~\cite{maas}; Pozar~\cite{pozar} (ch.~10)."),

'tb_ssamp': dict(
 body=r"""
Once a transistor is chosen and biased, small-signal amplifier design is the art
of choosing the source and load terminations that deliver the wanted gain,
stability, and match.

\section{Power Gains}
Three gains matter, all computable from the S-parameters and the terminations
$\Gamma_s,\Gamma_L$: the \emph{transducer gain} $G_T$ (delivered/available from
source), the \emph{available gain} $G_A$, and the \emph{operating gain} $G_P$.
For a unilateral device ($S_{12}\!\approx\!0$) the maximum transducer gain
factors cleanly:
\[ G_{TU,\max} = \frac{|S_{21}|^2}{(1-|S_{11}|^2)(1-|S_{22}|^2)}, \]
achieved by conjugately matching input and output.

\section{Stability First}
A design is only meaningful if it is stable (Chapter on Amplifier Stability):
check $K>1$ and $|\Delta|<1$. If the device is only conditionally stable, restrict
$\Gamma_s,\Gamma_L$ to the stable regions or add resistive loading.

\section{Bilateral Design}
When $S_{12}$ is not negligible, input and output interact. The simultaneous
conjugate match $\Gamma_{MS},\Gamma_{ML}$ solves a coupled pair of equations and
yields the maximum available gain $G_{MA}=|S_{21}/S_{12}|(K-\sqrt{K^2-1})$ ---
defined only when the device is unconditionally stable.

\section{Design for a Specified Gain}
Rarely do we want maximum gain; more often a specific, flat gain across a band.
Constant-gain circles on the Smith chart show the loci of $\Gamma_s$ (or
$\Gamma_L$) that give a chosen gain, letting the designer trade gain for
bandwidth, match, or noise.
""",
 obj=[r"Distinguish transducer, available, and operating power gain.",
      "Compute the maximum unilateral transducer gain.",
      "Explain why stability must be checked before matching."],
 wt="Worked Example: Maximum unilateral gain",
 we=r"""A device has $|S_{21}| = 4$, $|S_{11}| = 0.5$, $|S_{22}| = 0.4$ (and
$S_{12}\!\approx\!0$). Its maximum unilateral transducer gain is
\[ G_{TU,\max} = \frac{|S_{21}|^2}{(1-|S_{11}|^2)(1-|S_{22}|^2)}
   = \frac{16}{(1-0.25)(1-0.16)} = \frac{16}{0.63} = 25.4, \]
i.e.\ $14.0\ \text{dB}$, obtained by conjugately matching both ports.""",
 kt=[r"$G_{TU,\max}=|S_{21}|^2/[(1-|S_{11}|^2)(1-|S_{22}|^2)]$ with input/output conjugate match.",
     r"Check stability ($K>1$, $|\Delta|<1$) before choosing terminations.",
     "Constant-gain circles trade gain for bandwidth, match, or noise."],
 ex=[r"$|S_{21}| = 3$, $|S_{11}| = 0.4$, $|S_{22}| = 0.3$. Find $G_{TU,\max}$ in dB.",
     "Why can maximum available gain be undefined for a real device?",
     "What does a constant-gain circle represent?"],
 sol=[r"$G_{TU,\max} = 9/[(1-0.16)(1-0.09)] = 9/0.764 = 11.8 = 10.7\ \text{dB}$.",
      "It is only defined when the device is unconditionally stable ($K>1$); otherwise no simultaneous conjugate match exists.",
      r"The locus of source (or load) reflection coefficients giving a chosen constant gain."],
 read=r"Gonzalez~\cite{gonzalez} (ch.~3); Pozar~\cite{pozar} (ch.~12)."),

'tb_lna': dict(
 body=r"""
The low-noise amplifier sets the noise figure of the whole receiver (Friis), so
its design optimizes noise before gain.

\section{Noise Parameters}
A two-port's noise is fully described by four numbers: the minimum noise figure
$F_{min}$, the optimum source reflection $\Gamma_{opt}$ that achieves it, and the
equivalent noise resistance $R_n$ that says how quickly noise degrades away from
$\Gamma_{opt}$:
\[ F = F_{min} + \frac{4 R_n}{Z_0}\,\frac{|\Gamma_s - \Gamma_{opt}|^2}
       {(1-|\Gamma_s|^2)\,|1+\Gamma_{opt}|^2}. \]

\section{The Noise--Gain Trade}
In general the source impedance for minimum noise ($\Gamma_{opt}$) is \emph{not}
the one for maximum gain or best input match. Noise circles and gain circles on
the Smith chart make the compromise visible; a good LNA source match lands near
$\Gamma_{opt}$ and accepts slightly less than maximum gain.

\section{Inductive Source Degeneration}
The elegant trick used in CMOS/SiGe LNAs is a small source inductor $L_s$. It
generates a real input resistance $\approx \omega_T L_s$ \emph{without adding
thermal noise} of its own, so the input can be matched to $50\,\Omega$ at the same
time as the noise match --- the celebrated simultaneous noise-and-input match.

\section{Output and Bias}
With the source chosen for low noise, the output is conjugately matched for gain,
and a clean bias network keeps the stage stable. The result is a stage with a
noise figure within a few tenths of a dB of $F_{min}$ and enough gain to suppress
the noise of everything after it.
""",
 obj=[r"State the four noise parameters $F_{min}$, $\Gamma_{opt}$, $R_n$.",
      "Explain why the noise match differs from the gain/input match.",
      "Describe inductive source degeneration."],
 wt="Worked Example: Noise figure off the optimum",
 we=r"""An LNA device has $F_{min} = 0.5\ \text{dB}$ ($=1.122$), $R_n = 20\ \Omega$
in a $50\ \Omega$ system. If the source is placed so that
$|\Gamma_s-\Gamma_{opt}|^2/[(1-|\Gamma_s|^2)|1+\Gamma_{opt}|^2] = 0.1$, the noise
factor is
\[ F = 1.122 + \frac{4(20)}{50}(0.1) = 1.122 + 0.16 = 1.282, \]
i.e.\ $\text{NF} = 1.08\ \text{dB}$ --- only $0.58\ \text{dB}$ above the minimum, a
typical compromise for a good input match.""",
 kt=[r"Noise: $F = F_{min} + (4R_n/Z_0)\,|\Gamma_s-\Gamma_{opt}|^2/[(1-|\Gamma_s|^2)|1+\Gamma_{opt}|^2]$.",
     r"The low-noise source match ($\Gamma_{opt}$) generally differs from the gain/input match.",
     r"Inductive source degeneration creates a real input resistance ($\approx\omega_T L_s$) noiselessly."],
 ex=[r"If $\Gamma_s = \Gamma_{opt}$, what is the noise figure?",
     "Why is $L_s$ degeneration preferred over a physical resistor for input matching?",
     "Which stage in a receiver most determines system NF?"],
 sol=[r"$F = F_{min}$ exactly (the mismatch term vanishes).",
      "A resistor would add its own thermal noise; the inductor sets a real input impedance without adding noise.",
      "The first stage (the LNA), by the Friis cascade formula."],
 read=r"Razavi~\cite{razavi} (ch.~5); Gonzalez~\cite{gonzalez} (ch.~4)."),

'tb_oscdesign': dict(
 body=r"""
An oscillator turns DC into a periodic RF signal. Design means guaranteeing
start-up, setting the frequency, and minimizing phase noise.

\section{Two Views of the Same Thing}
The \emph{feedback} view (Barkhausen): loop gain $\ge 1$ with $0^\circ$ (mod
$360^\circ$) phase. The equivalent \emph{negative-resistance} view: the active
device presents a negative resistance $-R_d$ that cancels the resonator loss
$R_{res}$. Oscillation starts when $|R_d| > R_{res}$ and settles when, through
nonlinear compression, $|R_d| = R_{res}$ at the resonant frequency.

\section{Topologies}
The Colpitts, Hartley, and Clapp oscillators differ only in how the tank taps
feedback (a capacitive divider, an inductive divider, or a series-tuned
variant). For the best stability, a \emph{crystal} replaces the LC tank: its
enormous $Q$ ($10^4$--$10^6$) pins the frequency and slashes phase noise.
Dielectric-resonator (DRO) and YIG oscillators serve the microwave range.

\section{Design Flow}
Choose a resonator with the highest practical loaded $Q$; bias the device for
sufficient small-signal negative resistance (start-up margin $\sim$3$\times$);
set the tank for the target frequency; and buffer the output so the load does not
pull the frequency. Leeson's model (Chapter on Phase Noise) ties the achievable
phase noise to $Q$ and the device's flicker noise --- high $Q$ and a low-$1/f$
device win.
""",
 obj=["Relate the feedback and negative-resistance views of oscillation.",
      "Compute the resonant frequency of a Colpitts tank.",
      "Explain how resonator Q governs phase noise and stability."],
 wt="Worked Example: Colpitts frequency",
 we=r"""A Colpitts oscillator uses a tank inductor $L = 10\ \text{nH}$ with a
capacitive divider $C_1 = C_2 = 2\ \text{pF}$. The feedback capacitors appear in
series, $C_s = C_1C_2/(C_1+C_2) = 1\ \text{pF}$, so
\[ f_0 = \frac{1}{2\pi\sqrt{L\,C_s}} = \frac{1}{2\pi\sqrt{(10\times10^{-9})(1\times10^{-12})}} = 1.59\ \text{GHz}. \]
The divider ratio sets the feedback needed to sustain oscillation.""",
 kt=[r"Start-up: $|R_d| > R_{res}$; steady state: $|R_d| = R_{res}$ (nonlinear limiting).",
     r"Colpitts: $f_0 = 1/(2\pi\sqrt{L C_s})$ with $C_s = C_1C_2/(C_1+C_2)$.",
     "Crystals give huge $Q$ --- best stability and lowest phase noise."],
 ex=[r"A Colpitts tank has $L = 5\ \text{nH}$, $C_1 = C_2 = 4\ \text{pF}$. Find $f_0$.",
     "Why buffer an oscillator's output?",
     "Why does a crystal oscillator have far lower phase noise than an LC one?"],
 sol=[r"$C_s = 2\ \text{pF}$; $f_0 = 1/(2\pi\sqrt{(5\times10^{-9})(2\times10^{-12})}) = 1.59\ \text{GHz}$.",
      "So the load cannot pull (shift) the oscillation frequency.",
      "Its $Q$ is orders of magnitude higher, and Leeson's model makes phase noise fall as $1/Q^2$."],
 read=r"Lee~\cite{lee} (ch.~14--15); Razavi~\cite{razavi} (ch.~8)."),

'tb_synth': dict(
 body=r"""
A frequency synthesizer produces a programmable, low-noise carrier locked to a
stable reference. The PLL chapter introduced the loop; here we design it.

\section{The Charge-Pump Loop}
A modern synthesizer is a type-II charge-pump PLL: a phase-frequency detector
drives a charge pump into a loop filter that tunes a VCO, whose output is divided
by $N$ and compared back to the reference. The open-loop gain sets the loop
bandwidth $\omega_c$ and the phase margin (typically $45$--$60^\circ$ for good
settling without peaking).

\section{Loop-Filter Trade-offs}
The loop filter (second- or third-order) sets the bandwidth, which trades two
things: a \emph{wide} loop settles fast and suppresses VCO phase noise inside the
band, but passes more reference spur; a \emph{narrow} loop is cleaner but slow.
The filter is designed around the chosen $\omega_c$ and phase margin.

\section{Integer-N, Fractional-N, and DDS}
Integer-N forces the channel step to equal $f_{ref}$. Fractional-N divides by a
non-integer average using a delta-sigma modulator, decoupling step size from
$f_{ref}$ and shaping the resulting quantization noise to high offsets. Direct
digital synthesis (DDS) takes a different route entirely: a phase accumulator
addresses a sine table feeding a DAC, giving very fine, fast-hopping frequency
control,
\[ f_{out} = \frac{M}{2^{\,n}}\,f_{clk}, \]
for an $n$-bit accumulator and tuning word $M$.
""",
 obj=["Describe the charge-pump PLL and the role of loop bandwidth and phase margin.",
      "Explain integer-N vs fractional-N vs DDS synthesis.",
      "Compute DDS output frequency and resolution."],
 wt="Worked Example: DDS resolution",
 we=r"""A direct digital synthesizer has an $n = 32$-bit phase accumulator clocked
at $f_{clk} = 100\ \text{MHz}$. Its frequency resolution is
\[ \Delta f = \frac{f_{clk}}{2^{\,32}} = \frac{10^{8}}{4.29\times10^{9}} = 0.023\ \text{Hz}, \]
and a tuning word $M = 2^{30}$ produces
$f_{out} = (2^{30}/2^{32})\,f_{clk} = 0.25\times100 = 25\ \text{MHz}$. DDS trades
this fine, fast control against DAC spurs and a Nyquist limit of $f_{clk}/2$.""",
 kt=["Charge-pump type-II PLL; design around loop bandwidth $\\omega_c$ and $45$--$60^\\circ$ phase margin.",
     "Wide loop: fast, low VCO noise, more spur; narrow loop: clean but slow.",
     r"Fractional-N decouples step from $f_{ref}$; DDS: $f_{out}=(M/2^n)f_{clk}$, resolution $f_{clk}/2^n$."],
 ex=[r"A $24$-bit DDS clocked at $50\ \text{MHz}$: what is its frequency resolution?",
     "Which synthesizer type lets the channel step be far finer than the reference?",
     "Name one penalty of widening the PLL loop bandwidth."],
 sol=[r"$\Delta f = 50\times10^{6}/2^{24} = 2.98\ \text{Hz}$.",
      "Fractional-N (or DDS).",
      "More reference-spur feedthrough (and it must stay well below $f_{ref}$ for stability)."],
 read=r"Rohde~\cite{rohde}; Razavi~\cite{razavi} (ch.~9)."),

# ================= Part XII: Receivers and Digital RF =================
'tb_rxarch': dict(
 body=r"""
The receiver architecture decides how the RF is brought down to where it can be
digitized, and each choice trades image rejection, integration, and impairments.

\section{Superheterodyne}
The classic superhet converts the RF to a fixed intermediate frequency where
high-$Q$ filtering and gain are cheap. Its weakness is the image, $2f_{IF}$ from
the wanted signal, which a front-end filter must reject before the mixer.

\section{Direct Conversion (Zero-IF)}
Setting $f_{LO}=f_{RF}$ folds the signal straight to baseband ($f_{IF}=0$). There
is no image, and the whole radio integrates on one chip --- but new problems
appear: DC offset (from LO self-mixing), flicker ($1/f$) noise at baseband, LO
leakage, and I/Q imbalance. Modern CMOS transceivers manage these with
calibration.

\section{Low-IF and Image-Reject Mixers}
A low-IF receiver uses a small non-zero IF to escape the DC problems while
keeping integration; the image, now close by, is removed by \emph{complex}
(polyphase) filtering or by an image-reject mixer. The Hartley and Weaver
architectures cancel the image by combining two quadrature mixing paths, so the
achievable rejection is set by the I/Q amplitude and phase balance.
""",
 obj=["Compare superheterodyne, direct-conversion, and low-IF receivers.",
      "List the impairments unique to zero-IF receivers.",
      "Explain how an image-reject mixer suppresses the image."],
 wt="Worked Example: Image rejection from I/Q imbalance",
 we=r"""An image-reject mixer's rejection is limited by gain error $g$ (fractional)
and phase error $\varphi$ (radians) between its I and Q paths:
\[ \text{IRR} \approx 10\log_{10}\!\frac{4}{g^2 + \varphi^2}. \]
For a $1\%$ gain error ($g = 0.01$) and $1^\circ$ phase error
($\varphi = 0.0175\ \text{rad}$),
\[ \text{IRR} \approx 10\log_{10}\frac{4}{(0.01)^2 + (0.0175)^2} = 10\log_{10}(9850) = 39.9\ \text{dB}. \]
Practical analog balance thus caps image rejection near $40\ \text{dB}$, which is
why calibration or an external filter is often still needed.""",
 kt=["Superhet: fixed IF, easy filtering, but an image $2f_{IF}$ away to reject.",
     "Zero-IF: no image, fully integrated, but DC offset, $1/f$ noise, LO leakage, I/Q imbalance.",
     r"Image-reject (Hartley/Weaver) cancellation is limited by I/Q balance: $\text{IRR}\approx 4/(g^2+\varphi^2)$."],
 ex=[r"How far from the wanted signal is a superhet's image?",
     "Name two impairments specific to a direct-conversion receiver.",
     r"With $g = 0.02$ and $\varphi = 0.01\ \text{rad}$, estimate the image-reject ratio."],
 sol=[r"$2f_{IF}$.",
      "Any two of: DC offset, flicker ($1/f$) noise, LO leakage/re-radiation, I/Q imbalance.",
      r"$\text{IRR} = 10\log_{10}[4/(0.0004+0.0001)] = 10\log_{10}(8000) = 39.0\ \text{dB}$."],
 read=r"Razavi~\cite{razavi} (ch.~4); Lee~\cite{lee}."),

'tb_iq': dict(
 body=r"""
Almost every modern radio represents its signal as a complex baseband envelope
carried on quadrature (I and Q) mixers. Understanding the ideal operation and its
impairments is central to receiver and transmitter design.

\section{Quadrature Up/Down Conversion}
An I/Q modulator forms $s(t) = I(t)\cos\omega_c t - Q(t)\sin\omega_c t$, placing
independent information on the in-phase and quadrature carriers; the demodulator
recovers $I$ and $Q$ by multiplying with $\cos$ and $\sin$ and low-pass
filtering. This is what lets a single RF channel carry a two-dimensional
constellation.

\section{Impairments}
Real quadrature paths are imperfect. \emph{Gain and phase imbalance} between I and
Q create a spectral image of the signal; \emph{DC offset} adds a tone at the
carrier; \emph{LO leakage} radiates carrier feedthrough. Each corrupts the
constellation in a characteristic way and must be calibrated out.

\section{Error Vector Magnitude}
EVM is the RMS distance between received and ideal constellation points, expressed
as a fraction (or dB) of the signal. For a link limited only by additive noise it
ties directly to SNR:
\[ \text{EVM}_{\text{rms}} \approx 10^{-\text{SNR}/20}. \]
EVM is the single most useful bench metric of modulation quality, capturing noise,
imbalance, distortion, and phase noise together.
""",
 obj=["Explain quadrature (I/Q) up- and down-conversion.",
      "Identify how gain/phase imbalance, DC offset, and LO leakage corrupt the signal.",
      "Relate EVM to SNR."],
 wt="Worked Example: EVM from SNR",
 we=r"""For a link degraded only by additive noise, the error-vector magnitude is
$\text{EVM}_{\text{rms}} \approx 10^{-\text{SNR}/20}$. At $\text{SNR} = 25\ \text{dB}$,
\[ \text{EVM}_{\text{rms}} \approx 10^{-25/20} = 0.056 = 5.6\%. \]
A $64$-QAM link typically needs EVM below about $2\%$ (SNR $>34\ \text{dB}$), so
this $25\ \text{dB}$ link would support only a lower-order constellation.""",
 kt=[r"I/Q carries two independent streams: $s = I\cos\omega_c t - Q\sin\omega_c t$.",
     "Gain/phase imbalance $\\to$ image; DC offset $\\to$ carrier tone; LO leakage $\\to$ carrier feedthrough.",
     r"EVM ties quality to SNR: $\text{EVM}\approx 10^{-\text{SNR}/20}$; it captures all impairments together."],
 ex=[r"What EVM corresponds to an SNR of $30\ \text{dB}$?",
     "What impairment produces a spectral image of the wanted signal?",
     "Why is EVM a more complete quality metric than SNR alone?"],
 sol=[r"$\text{EVM} \approx 10^{-30/20} = 3.2\%$.",
      "I/Q gain and/or phase imbalance.",
      "It lumps together noise, I/Q imbalance, nonlinear distortion, and phase noise into one measured number."],
 read=r"Razavi~\cite{razavi} (ch.~4); Steer~\cite{steer}."),

'tb_gainplan': dict(
 body=r"""
Gain planning distributes gain, noise, and linearity along the receive chain so
that the system meets both its sensitivity and its dynamic-range goals.

\section{The Balancing Act}
Put too little gain early and later stages' noise dominates (poor sensitivity);
put too much and a strong signal compresses the front end (poor large-signal
handling). The plan sets each stage's gain, NF, and IP3 so the cascaded noise
figure and cascaded IP3 both land where they must.

\section{Sensitivity}
The minimum detectable signal is the noise floor plus the required SNR:
\[ \text{MDS} = -174\ \text{dBm/Hz} + 10\log_{10}B + \text{NF} + \text{SNR}_{min}. \]
Lowering NF (a good LNA first) or narrowing $B$ improves sensitivity.

\section{Spurious-Free Dynamic Range}
The top of the usable range is set by third-order intermodulation. The
spurious-free dynamic range --- the span from the noise floor to where IM3
products rise out of it --- is
\[ \text{SFDR} = \tfrac{2}{3}\,(\text{IIP3} - \text{MDS}). \]
Automatic gain control extends the \emph{instantaneous} range by backing off gain
on strong signals, but SFDR is the fundamental figure.
""",
 obj=["Explain the trade-off in distributing gain along a chain.",
      "Compute the minimum detectable signal (sensitivity).",
      "Compute spurious-free dynamic range."],
 wt="Worked Example: Sensitivity and SFDR",
 we=r"""A receiver has bandwidth $B = 1\ \text{MHz}$ and noise figure
$\text{NF} = 5\ \text{dB}$. Its noise floor (with $\text{SNR}_{min}=0$) is
\[ \text{MDS} = -174 + 10\log_{10}(10^6) + 5 = -174 + 60 + 5 = -109\ \text{dBm}. \]
If its input third-order intercept is $\text{IIP3} = -10\ \text{dBm}$, then
\[ \text{SFDR} = \tfrac{2}{3}(\text{IIP3} - \text{MDS}) = \tfrac{2}{3}(-10 - (-109)) = 66\ \text{dB}. \]""",
 kt=[r"$\text{MDS} = -174 + 10\log B + \text{NF} + \text{SNR}_{min}$.",
     r"$\text{SFDR} = \tfrac{2}{3}(\text{IIP3} - \text{MDS})$.",
     "Too little early gain hurts NF; too much hurts large-signal handling; AGC extends the instantaneous range."],
 ex=[r"Noise floor for $B = 200\ \text{kHz}$, $\text{NF} = 8\ \text{dB}$ (SNR$_{min}=0$)?",
     r"With $\text{IIP3} = 0\ \text{dBm}$ and $\text{MDS} = -110\ \text{dBm}$, find the SFDR.",
     "What does AGC improve, and what does it not change?"],
 sol=[r"$-174 + 10\log_{10}(2\times10^5) + 8 = -174 + 53 + 8 = -113\ \text{dBm}$.",
      r"$\text{SFDR} = \tfrac{2}{3}(0 - (-110)) = 73.3\ \text{dB}$.",
      "AGC extends the instantaneous dynamic range (handling strong signals); it does not change SFDR, set by IIP3 and the noise floor."],
 read=r"Razavi~\cite{razavi} (ch.~2); Pozar~\cite{pozar} (ch.~10)."),

'tb_sampling': dict(
 body=r"""
Between the analog RF world and the digital signal processor sit the
data converters, and their sampling theory sets what the radio can do.

\section{Nyquist, Aliasing, and Zones}
Sampling at $f_s$ replicates the spectrum every $f_s$; any energy above $f_s/2$
folds (aliases) into the first Nyquist zone. An anti-alias filter must remove
out-of-band energy before the ADC.

\section{Bandpass (Undersampling) Sampling}
A band of width $B$ centered at a high frequency need not be sampled at twice its
top frequency --- only at $f_s \ge 2B$, chosen so the band folds cleanly into a
Nyquist zone without overlapping itself. This lets an ADC digitize an IF (or even
RF) band directly, the enabling trick of software-defined radio.

\section{Converter Metrics}
An ideal $N$-bit ADC has quantization-limited SNR
\[ \text{SNR} = 6.02\,N + 1.76\ \text{dB}. \]
Real converters fall short (ENOB), limited by distortion (SFDR) and especially by
aperture jitter: a clock jitter $\sigma_t$ caps the SNR at
$-20\log_{10}(2\pi f_{in}\sigma_t)$, which dominates at high input frequencies.
The DAC on the transmit side produces spectral images that a reconstruction
filter must suppress.
""",
 obj=["Explain aliasing, Nyquist zones, and anti-alias filtering.",
      "Describe bandpass (undersampling) sampling.",
      "Compute ADC SNR from resolution and from clock jitter."],
 wt="Worked Example: ADC SNR and the jitter limit",
 we=r"""A $12$-bit ADC has an ideal, quantization-limited SNR of
\[ \text{SNR} = 6.02(12) + 1.76 = 74\ \text{dB}. \]
But sampling a $f_{in} = 100\ \text{MHz}$ input with $\sigma_t = 1\ \text{ps}$ of
clock jitter caps the SNR at
\[ -20\log_{10}(2\pi f_{in}\sigma_t) = -20\log_{10}(2\pi\cdot10^{8}\cdot10^{-12}) = 64\ \text{dB}. \]
Here jitter, not quantization, limits performance --- a common situation for
high-IF sampling.""",
 kt=["Energy above $f_s/2$ aliases into the first Nyquist zone; filter before the ADC.",
     r"Bandpass sampling needs only $f_s \ge 2B$, folding a high band into a Nyquist zone.",
     r"ADC SNR $= 6.02N + 1.76\ \text{dB}$; jitter caps it at $-20\log_{10}(2\pi f_{in}\sigma_t)$."],
 ex=[r"Ideal SNR of a $10$-bit ADC?",
     r"Jitter-limited SNR for $f_{in} = 1\ \text{GHz}$, $\sigma_t = 0.5\ \text{ps}$?",
     r"Minimum sample rate to bandpass-sample a $5\ \text{MHz}$-wide band?"],
 sol=[r"$6.02(10) + 1.76 = 61.96\ \text{dB}$.",
      r"$-20\log_{10}(2\pi\cdot10^{9}\cdot0.5\times10^{-12}) = -20\log_{10}(3.14\times10^{-3}) = 50\ \text{dB}$.",
      r"$f_s \ge 2B = 10\ \text{Msps}$ (placed so the band folds without self-overlap)."],
 read=r"Razavi~\cite{razavi} (ch.~4); Steer~\cite{steer}."),

'tb_sdr': dict(
 body=r"""
Software-defined radio pushes the analog-to-digital boundary as close to the
antenna as possible and does the rest --- filtering, mixing, demodulation --- in
software.

\section{The Idea}
Instead of a fixed chain of analog filters and mixers, an SDR digitizes a wide
band and reconfigures its behavior in DSP. The same hardware can be an FM
receiver, a spectrum monitor, or a cellular base station, changed by loading new
code.

\section{Architectures}
Two dominate: \emph{direct RF sampling}, where a fast ADC digitizes the RF band
outright (using bandpass sampling); and \emph{direct-conversion}, where an
analog I/Q front end brings the band to baseband for a slower ADC. A digital
downconverter (a numerically controlled oscillator, digital mixer, and decimating
CIC/FIR filters) then selects and narrows the channel.

\section{Processing and Practicalities}
The wideband data rate off the ADC is large, so decimation reduces it to the
channel bandwidth before heavy processing on an FPGA or general-purpose
processor. SDR also enables digital predistortion, digital I/Q-imbalance and
DC-offset correction, and rapid retuning --- at the cost of ADC/DAC dynamic range
and raw data throughput.
""",
 obj=["Explain the SDR concept and why it is flexible.",
      "Compare direct-RF-sampling and direct-conversion SDR front ends.",
      "Describe digital downconversion and decimation."],
 wt="Worked Example: Data rate and decimation",
 we=r"""An SDR digitizes at $f_s = 100\ \text{Msps}$ with $16$-bit samples. Complex
(I and Q) sampling produces a raw rate of
\[ 100\times10^{6}\times16\times2 = 3.2\ \text{Gbit/s}, \]
far too much to process directly. A digital downconverter selects the wanted
channel and decimates by $50$, leaving $2\ \text{Msps}$ (a $2\ \text{MHz}$
processing bandwidth) that a modest processor can demodulate in real time.""",
 kt=["SDR digitizes wide and does filtering/mixing/demod in software --- one radio, many waveforms.",
     "Front ends: direct RF sampling (fast ADC, bandpass sampling) or direct conversion (I/Q to baseband).",
     "A digital downconverter (NCO + mixer + decimating filter) selects and narrows the channel."],
 ex=[r"Raw data rate of a $61.44\ \text{Msps}$, $12$-bit, complex ADC stream?",
     r"What decimation factor turns $100\ \text{Msps}$ into a $1\ \text{MHz}$ channel?",
     "Name one capability SDR gains from doing conversion digitally."],
 sol=[r"$61.44\times10^{6}\times12\times2 = 1.47\ \text{Gbit/s}$.",
      r"$100/1 = 100\times$ decimation (to $\sim$1--2 Msps for a $1\ \text{MHz}$ channel).",
      "Any of: reconfigurable waveform, digital predistortion, digital I/Q/DC-offset correction, instant retuning."],
 read=r"Steer~\cite{steer}; Razavi~\cite{razavi} (ch.~4)."),
}

for slug, d in CH.items():
    emit(slug, d)
print("Parts XI-XII: wrote native+pedagogy for", len(CH), "chapters")
