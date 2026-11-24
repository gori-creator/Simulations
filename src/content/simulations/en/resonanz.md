## What is it about?

**Pohl's wheel** is a torsion pendulum: a copper wheel hangs on a spiral spring and, once pushed, oscillates at its **natural frequency** $f_0$ (here $f_0 = 0.5\,\text{Hz}$, so $T_0 = 2\,\text{s}$). An **eddy-current brake** damps the motion: the larger the current through the coil, the larger the **damping constant** $\delta$.

In a **forced oscillation** a motor turns an eccentric. It moves the outer end of the spiral spring (the **driver**) back and forth periodically:

$$
\varphi_E(t) = \hat\varphi_E \cdot \sin(\omega_E t), \qquad \omega_E = 2\pi f_E .
$$

**Settling:** if the wheel starts from rest, the natural oscillation and the forced oscillation first superpose, and the amplitude fluctuates (“beats”). The natural oscillation dies away with $e^{-\delta t}$. After that the wheel oscillates **at the driving frequency** $f_E$, not at its natural frequency:

$$
\varphi(t) = \hat\varphi \cdot \sin(\omega_E t - \Delta\varphi) .
$$

**Amplitude:** how far the wheel swings in the steady state depends on $f_E$:

$$
\hat\varphi = \hat\varphi_E \cdot \frac{\omega_0^2}{\sqrt{(\omega_0^2 - \omega_E^2)^2 + (2\delta\,\omega_E)^2}} .
$$

Plotting $\hat\varphi$ against $f_E$ gives the **resonance curve**. Its maximum lies at $f_E \approx f_0$ (exactly at $\omega_R = \sqrt{\omega_0^2 - 2\delta^2}$, i.e. slightly below; the simulation shows $f_R = \omega_R/(2\pi)$ under “Natural frequency”). With weak damping the curve is tall and narrow, with strong damping flat and wide.

**Phase shift:** the wheel lags behind the driver by $\Delta\varphi$:

- $f_E \ll f_0$: wheel and driver oscillate **in phase** ($\Delta\varphi \approx 0°$), $\hat\varphi \approx \hat\varphi_E$.
- $f_E = f_0$: $\Delta\varphi = 90°$, the amplitude is (almost) at its maximum.
- $f_E \gg f_0$: wheel and driver oscillate **in antiphase** ($\Delta\varphi \approx 180°$), the amplitude becomes very small.

**Phasor diagram:** both phasors rotate with $\omega_E$. The angle between them is $\Delta\varphi$, their lengths are in the ratio of the amplitudes.

**Resonance disaster:** if the damping is very small, the amplitude at resonance becomes huge ($\hat\varphi \approx \hat\varphi_E \cdot \omega_0 / (2\delta)$). If it exceeds the **load limit** (here $120°$), the device is damaged. That is why resonance must be avoided or strongly damped in bridges, machines and buildings.

**Examples:**

- **Wine glass:** if you rub a wet finger round the rim, the glass sings at its natural frequency. If a very loud sound hits exactly this frequency, the glass can shatter.
- **Bridges:** groups of soldiers do not march in step across bridges, so that the bridge is not driven at the rhythm of their steps. London's Millennium Bridge swayed sideways when it opened in 2000, because pedestrians unconsciously walked in time with the swaying. Dampers were fitted afterwards.
- **Technology:** washing machines on spin, cars and loudspeakers are built so that their resonances are damped.

## Try it

1. Start “from rest” at the preset driving frequency $f_E = 0.3\,\text{Hz}$ and watch the upper graph: how does the swing develop until “steady” appears? At what frequency does the wheel oscillate afterwards?
2. Set [resonance](?fE=0.5) and start again. Compare the swing of the wheel and the driver and read the phase shift from the phasor diagram.
3. [Fast driving](?fE=1): where does the wheel's phasor point compared with the driver's? Also watch the wheel itself: does it move with the driving lever or against it?
4. Use “Record resonance curve” to take a series of measurements. Repeat with [strong damping](?damp=1) and with [weak damping](?damp=0.08&speed=fast). How do the height, width and position of the maximum change?
5. Switch [the theoretical curves off](?theory=0) and predict where the measured points will lie.
6. Dare the [resonance disaster](?fE=0.5&damp=0.03&amp=10). Which setting saves the wheel at $f_E = f_0$?

## Exercises

**Exercise 1:** A student says: “After settling, the wheel oscillates at its natural frequency.” Comment.

<details>
<summary>Show solution</summary>

Wrong. In the steady state the wheel oscillates at the **driving frequency** $f_E$. The natural oscillation still takes part while settling, but dies away with $e^{-\delta t}$. The natural frequency only determines **how strongly** and with what phase shift the wheel follows.

</details>

**Exercise 2:** Match: $f_E = 0.1\,\text{Hz}$, $f_E = 0.5\,\text{Hz}$, $f_E = 1.5\,\text{Hz}$ (with $f_0 = 0.5\,\text{Hz}$) and $\Delta\varphi \approx 0°$, $\Delta\varphi \approx 90°$, $\Delta\varphi \approx 180°$. At which frequency is the amplitude smallest?

<details>
<summary>Show solution</summary>

$0.1\,\text{Hz} \to \Delta\varphi \approx 0°$ (in phase), $0.5\,\text{Hz} \to \Delta\varphi = 90°$ (resonance), $1.5\,\text{Hz} \to \Delta\varphi \approx 180°$ (antiphase). The amplitude is smallest at $1.5\,\text{Hz}$: far above the natural frequency the sluggish wheel can hardly follow the fast driving (simulation: about $0.6°$ with $\hat\varphi_E = 5°$). At $0.1\,\text{Hz}$ it is about as large as the driving amplitude.

[Check](?fE=1.5)

</details>

**Exercise 3:** For $\hat\varphi_E = 5°$, $\delta = 0.25\,\tfrac{1}{\text{s}}$ and $f_0 = 0.5\,\text{Hz}$, calculate the amplitude at $f_E = f_0$.

<details>
<summary>Show solution</summary>

At $\omega_E = \omega_0$, $\omega_0^2 - \omega_E^2 = 0$, so

$$
\hat\varphi = \hat\varphi_E \cdot \frac{\omega_0^2}{2\delta\,\omega_0} = \hat\varphi_E \cdot \frac{\omega_0}{2\delta} = 5° \cdot \frac{\pi\,\tfrac{1}{\text{s}}}{0.5\,\tfrac{1}{\text{s}}} \approx 31° .
$$

[Check](?fE=0.5&damp=0.25&amp=5)

</details>

**Exercise 4:** How small may the damping be at most so that, at resonance with $\hat\varphi_E = 10°$, the wheel does not reach the load limit of $120°$?

<details>
<summary>Show solution</summary>

From $\hat\varphi = \hat\varphi_E \cdot \frac{\omega_0}{2\delta} < 120°$ it follows that

$$
\delta > \frac{\hat\varphi_E \cdot \omega_0}{2 \cdot 120°} = \frac{10° \cdot \pi\,\tfrac{1}{\text{s}}}{240°} \approx 0.13\,\tfrac{1}{\text{s}} .
$$

So the damping must be larger than about $0.13\,\tfrac{1}{\text{s}}$ (at $\delta = 0.16\,\tfrac{1}{\text{s}}$ about $98°$).

[Check: just above](?fE=0.5&amp=10&damp=0.16)

</details>

**Exercise 5:** Why does the maximum of the resonance curve lie visibly to the left of $f_0$ with strong damping, while the phase shift of $90°$ lies exactly at $f_0$?

<details>
<summary>Show solution</summary>

For the phase, $\tan \Delta\varphi = \frac{2\delta\,\omega_E}{\omega_0^2 - \omega_E^2}$; the denominator becomes zero exactly at $\omega_E = \omega_0$, and there $\Delta\varphi = 90°$ – independent of $\delta$. The amplitude, however, is largest where the square root in the denominator is smallest. That gives $\omega_R = \sqrt{\omega_0^2 - 2\delta^2}$, a slightly lower frequency. At $\delta = 1\,\tfrac{1}{\text{s}}$: $f_R = \frac{1}{2\pi}\sqrt{\pi^2 - 2}\,\tfrac{1}{\text{s}} = \frac{2.805}{2\pi}\,\text{Hz} \approx 0.45\,\text{Hz}$ instead of $0.50\,\text{Hz}$.

[Check](?fE=0.45&damp=1)

</details>

**Exercise 6:** Using the terms driving frequency, natural frequency and damping, explain why a group of soldiers should not cross a bridge in step.

<details>
<summary>Show solution</summary>

Marching in step, the steps drive the bridge periodically at the step frequency (driving frequency). If it is close to a natural frequency of the bridge and the bridge is only weakly damped, the oscillation builds up further with every step (resonance). In the worst case the load limit is exceeded. Without marching in step, the pushes come at different times and largely cancel out.

</details>

## Ideas for the classroom

- **Use:** forced oscillations and resonance in upper secondary, especially as a supplement to or replacement for the experiment with a real Pohl's wheel: watch the settling, record a resonance curve in a short time, investigate the influence of damping, make the phase shift visible in the phasor diagram.
- **Model:** equation of motion $\ddot\varphi = -\omega_0^2\,(\varphi - \varphi_E(t)) - 2\delta\,\dot\varphi$ with damping proportional to velocity (eddy-current brake), solved with the Runge–Kutta method. Natural frequency fixed at $f_0 = 0.5\,\text{Hz}$. With very small $\delta$ the amplitude can become unrealistically large, hence the load limit of $120°$. The damping cannot be set completely to zero (smallest value $0.03\,\tfrac{1}{\text{s}}$): without damping there would be no steady state at $f_E = f_0$.
- **Series of measurements:** “Record resonance curve” skips the settling at each frequency (note “time jump”) and then measures amplitude and phase shift. Measured points and the theoretical curve can be compared. If you switch the theory off, the calculated values under “Results” are hidden too (prediction from the measured points).
- **Bandwidth:** with weak damping the width of the resonance curve at the height $\hat\varphi_{\max}/\sqrt2$ is about $\Delta f \approx \delta/\pi$ – the smaller the damping, the narrower and taller the curve.
- **Common pitfalls:**
  - “The wheel oscillates at its natural frequency.” – Only while settling; afterwards at $f_E$.
  - “At resonance, wheel and driver are in phase.” – At resonance $\Delta\varphi = 90°$; they are in phase at low driving frequency.
  - “The faster the motor, the more the wheel swings.” – Above resonance the amplitude gets smaller again.
  - “Without damping, the amplitude at resonance would be infinite, immediately.” – It grows over time; in the model without damping linearly, until something breaks.
- **Curriculum link:** physics, mechanical oscillations (forced oscillation, resonance, damping; links to everyday life and technology, e.g. bridges, loudspeakers, oscillating circuits).
