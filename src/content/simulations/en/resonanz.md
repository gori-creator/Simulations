## What is it about?

**Pohl’s wheel** is a torsion pendulum: a copper wheel on a spiral spring that, once pushed, oscillates at its **natural frequency** $f_0 = 0.5\,\text{Hz}$. An **eddy-current brake** damps it with decay constant $\delta$.

A motor moves the outer end of the spring (the **driver**) back and forth: $\varphi_E(t) = \hat\varphi_E \sin(\omega_E t)$. After a **transient**, in which the natural oscillation dies away with $e^{-\delta t}$, the wheel oscillates **at the driving frequency** $f_E$:

$$
\varphi(t) = \hat\varphi \sin(\omega_E t - \Delta\varphi), \qquad
\hat\varphi = \hat\varphi_E \cdot \frac{\omega_0^2}{\sqrt{(\omega_0^2 - \omega_E^2)^2 + (2\delta\,\omega_E)^2}} .
$$

The **resonance curve** $\hat\varphi(f_E)$ peaks at $\omega_R = \sqrt{\omega_0^2 - 2\delta^2}$, slightly below $f_0$; weak damping makes it tall and narrow. The wheel lags behind the driver: $\Delta\varphi \approx 0°$ for slow driving (in phase), $90°$ at $f_E = f_0$, $\approx 180°$ for fast driving (antiphase). With very weak damping the amplitude at resonance, $\hat\varphi \approx \hat\varphi_E\,\omega_0/(2\delta)$, exceeds the load limit of $120°$: a **resonance disaster**.

## Try it

1. Start from rest at $f_E = 0.3\,\text{Hz}$ and watch the amplitude settle. At what frequency does the wheel oscillate afterwards?
2. Set [resonance](?fE=0.5) and compare the amplitudes and the phase shift in the phasor diagram.
3. [Fast driving](?fE=1): does the wheel move with the driver lever or against it?
4. Record the resonance curve, then repeat with [strong damping](?damp=1) and [weak damping](?damp=0.08&speed=fast).
5. Try the [resonance disaster](?fE=0.5&damp=0.03&amp=10). How can you save the wheel?

## Tasks

**Task 1:** Match $f_E = 0.1$, $0.5$, $1.5\,\text{Hz}$ (with $f_0 = 0.5\,\text{Hz}$) to $\Delta\varphi \approx 0°$, $90°$, $180°$.

<details>
<summary>Show solution</summary>

$0.1\,\text{Hz} \to 0°$, $0.5\,\text{Hz} \to 90°$, $1.5\,\text{Hz} \to 180°$. The amplitude is smallest at $1.5\,\text{Hz}$ (about $0.6°$ for $\hat\varphi_E = 5°$).

</details>

**Task 2:** Calculate the amplitude at resonance for $\hat\varphi_E = 5°$ and $\delta = 0.25\,\text{s}^{-1}$.

<details>
<summary>Show solution</summary>

$\hat\varphi = \hat\varphi_E \cdot \omega_0/(2\delta) = 5° \cdot \pi / 0.5 \approx 31°$. [Check](?fE=0.5&damp=0.25&amp=5)

</details>

**Task 3:** Which damping keeps the wheel below $120°$ at resonance with $\hat\varphi_E = 10°$?

<details>
<summary>Show solution</summary>

$\delta > \hat\varphi_E\,\omega_0 / (2 \cdot 120°) = 10° \cdot \pi / 240° \approx 0.13\,\text{s}^{-1}$. [Check](?fE=0.5&amp=10&damp=0.16)

</details>

## Ideas for the classroom

- Model: $\ddot\varphi = -\omega_0^2(\varphi - \varphi_E) - 2\delta\dot\varphi$, solved with Runge–Kutta; $f_0 = 0.5\,\text{Hz}$ fixed; load limit $120°$.
- “Record resonance curve” skips the transient at each frequency and measures amplitude and phase shift; theory curves can be hidden.
- Common stumbling blocks: the wheel keeps its natural frequency (no – it follows $f_E$); at resonance driver and wheel are in phase (no – $\Delta\varphi = 90°$); faster driving always means larger amplitude (no).
