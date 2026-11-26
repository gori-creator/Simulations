## What is it about?

An **LC circuit** consists of a capacitor (capacitance $C$) and a coil (inductance $L$). If you charge the capacitor and then connect it to the coil, an oscillation starts:

1. The capacitor discharges through the coil. The current only grows slowly because the coil slows it down (self-induction).
2. When the capacitor is empty, the largest current flows. Now all the energy is in the **magnetic field of the coil**.
3. The coil keeps the current going and charges the capacitor the other way round.
4. Then everything runs backwards – and so on.

The energy swings between the **electric field** of the capacitor and the **magnetic field** of the coil:

$$
E_\text{el} = \frac{Q^2}{2C} \qquad E_\text{mag} = \frac{1}{2} L I^2 \qquad E_\text{el} + E_\text{mag} = \text{constant}
$$

The period is given by **Thomson's formula**:

$$
T = 2\pi \sqrt{L \cdot C} \qquad f = \frac{1}{2\pi\sqrt{L \cdot C}}
$$

A larger capacitance or a larger inductance makes the oscillation slower. Four times the capacitance means twice the period.

### Damping

Every real circuit has a resistance $R$. There, part of the energy is turned into **heat** on every cycle, and the amplitude decreases. With weak damping the circuit keeps oscillating, just smaller and smaller (decay constant $\delta = \frac{R}{2L}$). If $R$ is large enough ($R = 2\sqrt{L/C}$, **critical damping**), the capacitor discharges without overshooting. Even larger resistances give the **overdamped** case.

### Compared with a spring pendulum

An LC circuit and a spring pendulum obey the same equation. The charge $Q$ corresponds to the displacement $s$, the current $I$ to the velocity $v$, the inductance $L$ to the mass $m$ (inertia) and $\frac{1}{C}$ to the spring constant $D$. The energy in the electric field corresponds to the elastic energy, the energy in the magnetic field to the kinetic energy.

### Self-induction

If the current in a coil changes, its magnetic field changes, and a voltage is induced in the coil itself that opposes the change (Lenz's law): $u_L = -L \cdot \frac{\Delta I}{\Delta t}$. The unit of inductance is the **henry**, $1\,\text{H} = 1\,\frac{\text{V}\,\text{s}}{\text{A}}$.

- **Switching on:** the current through the coil only rises gradually, $I(t) = I_0 \cdot (1 - e^{-t/\tau})$ with the time constant $\tau = \frac{L}{R}$. A lamp with a coil lights up later than a lamp with an equal resistor.
- **Switching off:** the coil keeps driving the current. If it flows through another branch, a large voltage can appear there briefly (spark at the switch, a glow lamp flashes).

The magnetic field of a coil carrying a current stores the energy $W = \frac{1}{2} L I^2$.

### Resonance: how a radio picks a station

All stations produce tiny alternating voltages in the antenna at the same time. The LC circuit in the radio, however, only responds strongly at its **natural frequency** $f_0 = \frac{1}{2\pi\sqrt{LC}}$ – that is **resonance**. A variable capacitor changes $C$ and so $f_0$: a smaller $C$ gives a higher frequency. The smaller the resistance in the circuit, the narrower the resonance curve and the better the radio separates neighbouring stations (**selectivity**).

### Feedback: undamped oscillations

Every real LC circuit loses energy in its resistance, so the oscillation dies away. In the **Meissner circuit** the oscillation itself controls an amplifier (transistor) that supplies energy from the battery at the right moment. The oscillation builds up until supply and loss are equal. This is how transmitters, quartz clocks and radio chips produce steady oscillations.

## Try it

1. Press **Charge and release** and watch the energy bars. When is all the energy in the coil?
2. Make the capacitance four times as large. What happens to the period? [C = 160 µF](?C=160)
3. Set a resistance. Where does the energy go? [Weakly damped](?R=400) · [Critically damped](?R=7070)
4. Compare with the spring pendulum: which quantity of the pendulum corresponds to the current? [Spring pendulum](?mode=pendel)
5. **Self-induction:** flip the switch and watch the two lamps, then switch off again. [Self-induction](?mode=spule)
6. **Radio:** set the variable capacitor so that you hear “Classical”. What happens with a large resistance? [Radio](?mode=radio&dc=127&rr=20) · [Poor selectivity](?mode=radio&dc=127&rr=200)
7. **Feedback:** compare the oscillation [without](?mode=rueck&R=400&rk=0) and [with](?mode=rueck&R=400&rk=1) the amplifier.
8. **Practice:** [six kinds of tasks](?mode=ueben&qn=1) with a score.

## Exercises

### Exercise 1: Thomson's formula

An LC circuit consists of a coil with $L = 500\,\text{H}$ (with iron core) and a capacitor with $C = 40\,\mu\text{F}$. Calculate the period and the frequency. [Check](?C=40&Lh=500)

<details>
<summary>Show solution</summary>

$T = 2\pi\sqrt{500\,\text{H} \cdot 40 \cdot 10^{-6}\,\text{F}} = 2\pi\sqrt{0.02\,\text{s}^2} \approx 0.889\,\text{s}$, $f = \frac{1}{T} \approx 1.13\,\text{Hz}$.

</details>

### Exercise 2: Energy in the circuit

The capacitor from exercise 1 is charged to $U_0 = 10\,\text{V}$. How much energy does the circuit contain? What is the largest current?

<details>
<summary>Show solution</summary>

$E = \frac{1}{2} C U_0^2 = \frac{1}{2} \cdot 40 \cdot 10^{-6}\,\text{F} \cdot (10\,\text{V})^2 = 0.002\,\text{J}$. When the capacitor is empty, everything is in the coil: $\frac{1}{2} L I_\text{max}^2 = E$, so $I_\text{max} = \sqrt{\frac{2E}{L}} = \sqrt{\frac{0.004}{500}}\,\text{A} \approx 2.83\,\text{mA}$.

</details>

### Exercise 3: Radio frequency

An LC circuit in a radio has $L = 10\,\text{mH}$ and $C = 1\,\text{nF}$. What is its frequency? Why can you no longer follow it with the naked eye?

<details>
<summary>Show solution</summary>

$f = \frac{1}{2\pi\sqrt{10^{-2} \cdot 10^{-9}}}\,\text{Hz} \approx 50\,\text{kHz}$. The circuit oscillates 50,000 times per second – far too fast to watch. That is why the simulation uses very large values of $L$ and $C$, as in school experiments with an iron-core coil.

</details>

### Exercise 4: Switching on a coil

A coil ($L = 500\,\text{H}$) and a lamp together have the resistance $R = 100\,\Omega$; the voltage is $10\,\text{V}$. After what time has the current reached about 63 % of its final value? What is the final value? [Self-induction](?mode=spule&Lh=500&Rz=100&U0=10)

<details>
<summary>Show solution</summary>

$\tau = \frac{L}{R} = \frac{500\,\text{H}}{100\,\Omega} = 5\,\text{s}$; after $\tau$, $I = I_0(1 - e^{-1}) \approx 0.63 \cdot I_0$. Final value $I_0 = \frac{U}{R} = 0.1\,\text{A}$. The magnetic field then stores $W = \frac{1}{2} \cdot 500 \cdot 0.1^2\,\text{J} = 2.5\,\text{J}$.

</details>

### Exercise 5: Tuning in a station

The coil in the radio has $L = 200\,\mu\text{H}$. Which capacitance is needed for the station at $800\,\text{kHz}$? [Radio](?mode=radio&dc=160&rr=20&_hide=1)

<details>
<summary>Show solution</summary>

$C = \frac{1}{4\pi^2 f^2 L} = \frac{1}{4\pi^2 \cdot (8 \cdot 10^5)^2 \cdot 2 \cdot 10^{-4}}\,\text{F} \approx 198\,\text{pF}$.

</details>

## Ideas for the classroom

- **Use:** upper secondary (induction and electromagnetic oscillations, often advanced course). Well prepared by the simulations on the capacitor and on induction.
- **Use the analogy:** first review the spring pendulum, then match the quantities in pairs. The table appears under “Results” in the part “Compared with a spring pendulum”.
- **Slow motion:** the values are chosen so that the circuit makes about one oscillation per second (as with an iron-core coil in a school experiment). With “Slow motion ¼” the four phases are easy to discuss.
- **Common pitfalls:**
  - “When the capacitor is empty, no current flows.” – That is exactly when the current is largest.
  - In an undamped circuit no energy is lost; it only changes place.
  - When switching off, many expect the current to be zero at once. The coil keeps driving it, and the current in the second lamp reverses its direction.
