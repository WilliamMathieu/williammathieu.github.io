# RF Toolbox — Calculator Inputs & Outputs Reference

All 55 calculators on rftoolbox.ca.

---

| # | Calculator | Inputs | Outputs |
|---|-----------|--------|---------|
| 1 | **dBmConverter** | Power level (dBm) | Power (mW), Power (dBW) |
| 2 | **VSWRConverter** | VSWR | Reflection coefficient Γ, Return loss (dB), Mismatch loss (dB) |
| 3 | **Wavelength** | Frequency (Hz/MHz/GHz), Relative permittivity εᵣ | Wavelength λ (mm), Half-wavelength λ/2 (mm), Quarter-wavelength λ/4 (mm) |
| 4 | **FreqEnergyConverter** | Frequency (Hz/MHz/GHz) | Frequency in Hz (output unit), Wavelength λ (m), Photon energy (eV, J) |
| 5 | **QuarterWave** | Source impedance Z₁ (Ω), Load impedance Z₂ (Ω), Frequency, εᵣ | Transformer impedance Zₜ = √(Z₁·Z₂) (Ω), Physical length (mm) |
| 6 | **Friis** | Tx power Pₜ (dBm), Tx gain Gₜ (dBi), Rx gain Gᵣ (dBi), Distance d (m), Frequency | Free-space path loss FSPL (dB), Received power Pᵣ (dBm) |
| 7 | **AttenuatorDesign** | Topology (Pi / T), Attenuation (dB), Reference impedance Z₀ (Ω) | Series resistance R₁ (Ω), Shunt resistance R₂ (Ω) |
| 8 | **SkinDepth** | Frequency, Material / conductivity σ (S/m) | Skin depth δ (µm) |
| 9 | **Coaxial** | Inner diameter d (mm), Outer diameter D (mm), εᵣ | Characteristic impedance Z₀ (Ω) |
| 10 | **LC** | Any two of: Inductance L, Capacitance C, Resonant frequency f (solve for third) | Missing quantity (L, C, or f₀) |
| 11 | **BandpassCalc** | Inductance L, Capacitance C, Resistance R, Configuration (series / parallel) | Quality factor Q, Resonant frequency f₀ (Hz), Bandwidth BW (Hz) |
| 12 | **FilterDesign** | Type (LP / HP), Response (Butterworth / Chebyshev), Order n, Cutoff frequency fc, Load impedance R₀, Ripple (Chebyshev only) | Element values: inductors (H), capacitors (F) |
| 13 | **SteppedImpedanceLPF** | Number of sections n, Cutoff frequency fc, Z₀ (Ω), High impedance Zh (Ω), Low impedance Zl (Ω), εᵣ | Section lengths (mm) for each high-Z and low-Z segment |
| 14 | **Microstrip** | *W→Z:* εᵣ, substrate height h, trace width w → **or** *Z→W:* target Z₀, h, εᵣ | *W→Z:* Z₀ (Ω), effective εᵣ — *Z→W:* trace width w (mm) |
| 15 | **Stripline** | εᵣ, ground plane spacing b, trace thickness t, trace width w (all mm) | Characteristic impedance Z₀ (Ω) |
| 16 | **CPW** | εᵣ, substrate height h, signal width w, gap s (all mm) | Characteristic impedance Z₀ (Ω) |
| 17 | **CoupledResonators** | Inductance L, Capacitance C, Mutual inductance M, Resistance R | Coupled resonant frequencies (Hz), coupling coefficient k, Q |
| 18 | **LCBalun** | Frequency, Topology (lattice / pi), Unbalanced impedance Zu (Ω), Balanced impedance Zb (Ω) | Inductor value (H), Capacitor value (F) |
| 19 | **LNetwork** | Source resistance Rs (Ω), Load resistance Rl (Ω), Frequency | Quality factor Q, Element 1 value (H or F), Element 2 value (H or F) |
| 20 | **PiTNetwork** | R₁ (Ω), R₂ (Ω), Desired Q, Frequency, Topology (Pi-LP / Pi-HP / T-LP / T-HP) | Three element values (H and/or F) |
| 21 | **ImpedanceMatchingNetwork** | Source Rs + jXs (Ω), Load Rl + jXl (Ω), Frequency, Z₀ (normalization) | Up to 4 L-network solutions, each with topology label and two element values (H or F) |
| 22 | **Coupler** | Type (edge-coupled / branch-line), Frequency, Z₀, Coupling C (dB) or power ratio | Line impedances (Ω), Electrical lengths (°) |
| 23 | **Wilkinson** | Frequency, Reference impedance Z₀ (Ω), εᵣ | Branch impedance Z₁ = Z₀√2 (Ω), Isolation resistor R = 2Z₀ (Ω), Physical length (mm) |
| 24 | **PowerCombiner** | Number of ports N, Input power Pᵢₙ (dBm), Combiner efficiency η, Number of failed ports | Combined output power Pₒᵤₜ (dBm), Combining gain (dB) |
| 25 | **StubCalc** | Stub type (open / short), Frequency, Z₀ (Ω), Target susceptance B (mS) | Electrical length (°), Physical length (mm, free space) |
| 26 | **AmpStability** | S₁₁, S₁₂, S₂₁, S₂₂ (magnitude + angle, degrees) | Rollett stability factor K, |Δ|, Stability circles (source/load), stability verdict |
| 27 | **NoiseFigure** | Number of stages n; per stage: NF (dB), Gain (dB) | Cascaded noise figure (Friis formula) NF_total (dB) |
| 28 | **IP3Calc** | Input power Pᵢₙ (dBm), Gain G (dB), Input IP3 IIP3 (dBm) | Output power Pₒᵤₜ (dBm), Output IP3 OIP3 (dBm) |
| 29 | **LinkBudget** | Tx power, Tx gain, Tx line loss, Distance, Frequency, Rx gain, Rx line loss, NF, Bandwidth, Required SNR, Miscellaneous losses | Received power (dBm), Noise floor (dBm), Required Rx sensitivity (dBm), Link margin (dB) |
| 30 | **RadarRange** | Tx power Pₜ (dBW), Tx gain Gₜ (dBi), Rx gain Gᵣ (dBi), Frequency, Radar cross section σ (m²), Minimum detectable power Pₘᵢₙ | Maximum range Rₘₐₓ (m / km) |
| 31 | **TwoPortConverter** | S-parameters S₁₁, S₁₂, S₂₁, S₂₂ (real + imaginary parts) | ABCD matrix, Y-parameters, Z-parameters |
| 32 | **PLLFilter** | Phase detector gain Kd (A/rad), VCO gain K₀ (rad/s/V), Divide ratio N, Loop bandwidth BW, Phase margin PM (°) | Loop filter resistor R (Ω), Capacitors C₁, C₂ (F) |
| 33 | **PhaseNoiseJitter** | Carrier frequency fc, Integration band fₗₒw–fₕᵢgₕ (Hz), Up to 5 offset/level pairs (Hz, dBc/Hz) | RMS jitter σₜ (ps), Peak-to-peak jitter (ps), Integrated phase noise (dBc) |
| 34 | **PhasedArrayDecoupling** | Element radius r (mm), Element spacing d (mm), Frequency (MHz), Port impedance Z₀ (Ω), Mutual impedance Zₚ (Ω) | Decoupling network element values, Isolation improvement (dB) |
| 35 | **SAREstimator** | B₁ field (µT), Frequency (MHz), Tissue type (or custom σ/ρ), Duty cycle | Peak SAR (W/kg), Average SAR (W/kg), B₁ limit for SAR threshold (µT) |
| 36 | **Waveguide** | Broad dimension a (mm), Narrow dimension b (mm), Frequency, εᵣ | TE₁₀ cutoff frequency (GHz), Phase velocity, Group velocity, Guide wavelength, Attenuation |
| 37 | **CircularWaveguide** | Inner radius a (mm), Frequency, εᵣ | TE₁₁ / TM₀₁ cutoff frequencies (GHz), propagation constants |
| 38 | **PatchAntenna** | εᵣ, Substrate height h (mm), Resonant frequency f | Patch width W (mm), Patch length L (mm), Effective εᵣ |
| 39 | **Dipole** | Frequency | Half-wave dipole arm length (mm), Total length (mm), Feed impedance (~73 Ω) |
| 40 | **HelicalAntenna** | Frequency, Number of turns N | Helix diameter D (mm), Turn spacing S (mm), Axial length (mm), Gain (dBi) |
| 41 | **YagiAntenna** | Frequency, Number of elements N (2–9), Element diameter (mm) | Element lengths and positions (mm), Boom length, Gain (dBi / dBd), F/B ratio (dB), HPBW (°), Input impedance |
| 42 | **BirdcageCoil** | Number of rungs N, Coil radius r (cm), Coil length l (cm), Frequency (MHz) | End-ring / rung capacitance (pF) for LP and HP birdcage configurations |
| 43 | **ESeries** | Target value, E-series (E6 / E12 / E24 / E48 / E96) | Nearest lower value, Nearest higher value, Closest value (Ω / F / H) |
| 44 | **BondWireVia** | Wire length l (mm), Wire diameter d (mm), Height above ground h (mm) | Inductance L (nH) via Grover formula |
| 45 | **DiffPair** | εᵣ, Substrate height h, Trace width w, Trace separation s, Trace thickness t (all mm) | Differential impedance Zdiff (Ω), Common-mode impedance Zcm (Ω) |

---

## Interactive / Graphical Tools (no calculated numeric output)

| # | Tool | Description |
|---|------|-------------|
| 46 | **SmithChart** | Interactive Smith chart — plot and manipulate impedance points |
| 47 | **TLLoss** | Transmission line loss vs. frequency chart for common cable types |
| 48 | **SParamPlotter** | Upload Touchstone (.s2p) files and plot S-parameters |
| 49 | **ArrayFactor** | Interactive phased-array pattern calculator and polar plot |
| 50 | **SpiceSim** | In-browser SPICE circuit simulator (text netlist → transient/AC/DC plots) |
| 51 | **RFSimulator** | Schematic-entry RF circuit simulator with S-parameter display |
| 52 | **SurfaceCoilDesigner** | MRI surface coil design wizard with geometry and inductance estimates |
| 53 | **CapacitorNetwork** | Series/parallel capacitor network solver with total capacitance |
| 54 | **CoilDesigner** | Multi-layer air-core coil inductance designer |
| 55 | **CLI** | Command-line interface for RF calculations |
