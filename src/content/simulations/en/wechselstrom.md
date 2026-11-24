## What is it about?

The mains supplies **alternating voltage**: it changes direction 50 times a second and follows a sine curve:

$$
u(t) = \hat{u} \cdot \sin(\omega t) \qquad \omega = 2\pi f
$$

Usually the **rms value** $U = \frac{\hat{u}}{\sqrt{2}}$ is quoted – the 230 V of a socket is an rms value. A direct current of that size would produce the same heat in a resistor.

### Three components, three behaviours

- **Resistor $R$:** current and voltage are **in phase**. $I = \frac{U}{R}$, independent of frequency.
- **Coil $L$:** self-induction resists every change in current. The current **lags the voltage by 90°**. The inductive reactance grows with frequency: $X_L = \omega L$.
- **Capacitor $C$:** it must be charged before a voltage appears. The current **leads by 90°**. The capacitive reactance falls with frequency: $X_C = \frac{1}{\omega C}$.

### Phasor diagram

A sine oscillation can be drawn as a **phasor** rotating with angular velocity $\omega$. Its height is the instantaneous value. In the simulation the phasors rotate in slow motion.

In a **series circuit** the same current flows everywhere. The partial voltages point in different directions: $U_R$ along the current, $U_L$ 90° ahead, $U_C$ 90° behind. They add **as phasors** (head to tail), not as numbers:

$$
U = \sqrt{U_R^2 + (U_L - U_C)^2} \qquad Z = \frac{U}{I} = \sqrt{R^2 + (X_L - X_C)^2} \qquad \tan\varphi = \frac{X_L - X_C}{R}
$$

$Z$ is the **impedance**, $\varphi$ the **phase shift** between voltage and current.

### Power

The instantaneous power $p(t) = u(t) \cdot i(t)$ is sometimes negative: then the coil or capacitor returns energy to the source. On average only the **real power** arrives:

$$
P = U \cdot I \cdot \cos\varphi \qquad Q = U \cdot I \cdot \sin\varphi \qquad S = U \cdot I
$$

$Q$ is the **reactive power** (it only swings back and forth), $S$ the **apparent power**. For a pure coil or capacitor $P = 0$.

### Resonance

In a **series RLC circuit** $X_L$ and $X_C$ cancel at the resonance frequency:

$$
f_0 = \frac{1}{2\pi\sqrt{L \cdot C}}
$$

Then $Z = R$, the current is largest and in phase with the voltage. The voltages across coil and capacitor can become **much larger** than the applied voltage.

## Try it

- [Resistor only](?kreis=R): both curves move in step, $p(t)$ is never negative.
- [Coil only](?kreis=L): the current comes a quarter period later. Half of the power curve is negative – zero on average.
- [Capacitor only](?kreis=C): now the current is a quarter period early. Raise the frequency: the current grows.
- [R and L](?kreis=RL): change the frequency and watch the angle $\varphi$.
- [Series RLC](?kreis=RLC&Lm=500&C=20&R=50&f=30): slowly raise $f$ to about 50 Hz. The phasors $U_L$ and $U_C$ grow long, $U$ and $I$ line up.

## Exercises

**1. Coil on the mains.** A coil with $L = 0.3\,\text{H}$ (no resistance) is connected to $U = 12\,\text{V}$, $f = 50\,\text{Hz}$. Calculate the reactance and the current. [Load exercise](?kreis=L&Lm=300&f=50&U=12&_hide=1)

<details><summary>Show solution</summary>

$X_L = 2\pi \cdot 50\,\text{Hz} \cdot 0.3\,\text{H} \approx 94.2\,\Omega$, so $I = \frac{12\,\text{V}}{94.2\,\Omega} \approx 127\,\text{mA}$. The current lags the voltage by 90°.

</details>

**2. Capacitor and frequency.** A capacitor with $C = 20\,\mu\text{F}$ is connected to 50 Hz. How large is $X_C$? What changes if the frequency is doubled? [Load exercise](?kreis=C&C=20&f=50&_hide=1)

<details><summary>Show solution</summary>

$X_C = \frac{1}{2\pi \cdot 50\,\text{Hz} \cdot 20 \cdot 10^{-6}\,\text{F}} \approx 159\,\Omega$. At 100 Hz $X_C$ halves to about $79.6\,\Omega$ and the current doubles.

</details>

**3. R and L in series.** $R = 100\,\Omega$ and $L = 0.3\,\text{H}$ in series at $12\,\text{V}$, $50\,\text{Hz}$. Calculate $Z$, $\varphi$, $I$ and the real power $P$. [Load exercise](?kreis=RL&R=100&Lm=300&f=50&U=12&_hide=1)

<details><summary>Show solution</summary>

$X_L \approx 94.2\,\Omega$, $Z = \sqrt{100^2 + 94.2^2}\,\Omega \approx 137.4\,\Omega$, $\varphi \approx 43.3°$, $I \approx 87.3\,\text{mA}$ and $P = I^2 R \approx 0.763\,\text{W}$.

</details>

**4. Resonance.** A series circuit has $L = 0.5\,\text{H}$, $C = 20\,\mu\text{F}$, $R = 50\,\Omega$ and is connected to $12\,\text{V}$. Find the resonance frequency, the current at resonance and the voltage across the coil. [Load exercise](?kreis=RLC&Lm=500&C=20&R=50&U=12&f=50&_hide=1)

<details><summary>Show solution</summary>

$f_0 \approx 50.3\,\text{Hz}$. There $Z = R = 50\,\Omega$, so $I = 240\,\text{mA}$. With $X_L = 2\pi f_0 L \approx 158\,\Omega$ the coil carries $U_L \approx 37.9\,\text{V}$ – more than three times the applied voltage.

</details>

## Ideas for teaching

- **Hook:** a lamp in series with a coil glows brightly on DC but dimly on AC. Why? The simulation shows the reactance.
- **Phasors as a tool:** first let the phasors rotate and compare their height with the line graph, then read the partial voltages as a head-to-tail chain.
- **Everyday link:** reactive power loads the grid without doing work, which is why factories with many motors compensate it with capacitors.
