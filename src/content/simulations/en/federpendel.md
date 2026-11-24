## What is it about?

A body of mass $m$ hangs on a helical spring with **spring constant** $D$. In the **equilibrium position** the spring is stretched by $s_0$; there the spring force is exactly as large as the weight:

$$
D \cdot s_0 = m \cdot g \qquad\Rightarrow\qquad s_0 = \frac{m \cdot g}{D}
$$

If the body is displaced from equilibrium by the **displacement** $y$ (here: upwards positive), the resulting force is the **restoring force**

$$
F = -D \cdot y .
$$

It is proportional and opposite to the displacement (**linear force law**). This gives a **harmonic oscillation** with the time–displacement law

$$
y(t) = \hat y \cdot \sin(\omega t + \varphi_0), \qquad \omega = \frac{2\pi}{T} = 2\pi f .
$$

Here $\hat y$ is the **amplitude**, $\omega$ the **angular frequency** and $\varphi_0$ the **initial phase** (position at time $t = 0$). For the **period**

$$
T = 2\pi \sqrt{\frac{m}{D}} .
$$

$T$ depends neither on the amplitude nor on the gravitational field strength $g$: the weight only shifts the equilibrium position.

**Phasor diagram:** a phasor of length $\hat y$ rotates anticlockwise with angular velocity $\omega$. The angle to the horizontal is the phase angle $\varphi = \omega t + \varphi_0$; the vertical projection of the tip of the phasor is the displacement $y$. One full turn takes exactly one period.

**Velocity and acceleration** are sinusoidal too:

$$
v(t) = \hat y \, \omega \cos(\omega t + \varphi_0), \qquad a(t) = -\hat y \, \omega^2 \sin(\omega t + \varphi_0) = -\omega^2 \, y(t)
$$

At the equilibrium position the speed is largest ($\hat v = \hat y \, \omega$), at the turning points the acceleration ($\hat a = \hat y \, \omega^2$).

**Energy:** elastic and gravitational potential energy together change like $\tfrac12 D y^2$. Without friction

$$
\tfrac12 D y^2 + \tfrac12 m v^2 = \tfrac12 D \hat y^2 = \text{constant}.
$$

With **damping**, energy is converted into internal energy; the amplitude decreases as $e^{-\delta t}$.

## Try it

1. Pull the body down and let go. Follow how the projection of the phasor and the body move up and down together.
2. Stop and tap one of the graphs: the time marker shows the state at that moment. Put it on a maximum of $y(t)$. What is true there for $v$ and $a$?
3. Start the stopwatch when the phasor is at an easily recognisable place and stop it after 10 full turns. Compare $T = t/10$ with the formula.
4. Change the amplitude. Does the period change? [Small amplitude](?amp=2)
5. Compare two pendulums: four times the mass [Load example](?cmp=1&m=0.25&m2=1&D2=20) or four times the spring constant [Load example](?cmp=1&m=0.3&D=10&m2=0.3&D2=40).
6. Look at the forces and all three forms of energy. Elastic and gravitational energy change a lot, the kinetic energy stays small. Between which forms of energy is most of the energy converted? [Forces and forms of energy](?energy=full&vec=F&graphs=yv)
7. Switch on the damping and watch the phasor, the graph and the energy. [Damped](?damp=0.3&graphs=y)

## Exercises

### Exercise 1: Calculating the period

A body with $m = 0.5\,\text{kg}$ hangs on a spring with $D = 20\,\tfrac{\text{N}}{\text{m}}$. Calculate the period and the frequency and check with the stopwatch. [Load exercise](?per=0&_hide=1)

<details>
<summary>Show solution</summary>

$T = 2\pi\sqrt{\frac{0.5\,\text{kg}}{20\,\text{N/m}}} \approx 0.99\,\text{s}$ and $f = \frac1T \approx 1.01\,\text{Hz}$. So ten periods take just under $10\,\text{s}$. [Show in the simulation](?per=1)

</details>

### Exercise 2: Spring constant from a measurement

A body with $m = 0.4\,\text{kg}$ makes 10 oscillations in $12.6\,\text{s}$. What is the spring constant?

<details>
<summary>Show solution</summary>

$T = 1.26\,\text{s}$. From $T = 2\pi\sqrt{m/D}$ it follows that $D = \frac{4\pi^2 m}{T^2} = \frac{4\pi^2 \cdot 0.4\,\text{kg}}{(1.26\,\text{s})^2} \approx 9.9\,\tfrac{\text{N}}{\text{m}}$, so about $10\,\tfrac{\text{N}}{\text{m}}$. [Check](?m=0.4&D=10)

</details>

### Exercise 3: Twice the period

How must you change the mass so that the period doubles? And how the spring constant?

<details>
<summary>Show solution</summary>

Because $T \sim \sqrt{m}$ you need **four times** the mass; because $T \sim \frac{1}{\sqrt{D}}$, alternatively a spring with a **quarter** of the spring constant. [Show the comparison](?cmp=1&m=0.25&m2=1&D2=20)

</details>

### Exercise 4: Maximum values

For $m = 0.5\,\text{kg}$, $D = 20\,\tfrac{\text{N}}{\text{m}}$ and $\hat y = 8\,\text{cm}$: calculate the largest speed and the largest acceleration. Where do they occur? [Load exercise](?_hide=1)

<details>
<summary>Show solution</summary>

$\omega = \sqrt{D/m} \approx 6.32\,\tfrac1{\text{s}}$, so $\hat v = \hat y\,\omega \approx 0.51\,\tfrac{\text{m}}{\text{s}}$ (when passing through equilibrium) and $\hat a = \hat y\,\omega^2 = 3.2\,\tfrac{\text{m}}{\text{s}^2}$ (at the turning points, directed towards equilibrium).

</details>

### Exercise 5: Extension and period

Using $s_0 = \frac{m g}{D}$, show that $T = 2\pi\sqrt{\frac{s_0}{g}}$. What is $T$ for $s_0 = 24.5\,\text{cm}$?

<details>
<summary>Show solution</summary>

From $s_0 = \frac{mg}{D}$ it follows that $\frac{m}{D} = \frac{s_0}{g}$, so $T = 2\pi\sqrt{\frac{s_0}{g}} = 2\pi\sqrt{\frac{0.245\,\text{m}}{9.81\,\text{m/s}^2}} \approx 0.99\,\text{s}$. So you can read $T$ from the extension at equilibrium – no matter how $m$ and $D$ are chosen individually. [Example: m and D doubled](?m=1&D=40)

</details>

### Exercise 6: Phase angle

The body is pushed upwards from equilibrium: $y(t) = 8\,\text{cm} \cdot \sin(\omega t)$. Where is it at $t = \tfrac14 T$, $t = \tfrac12 T$ and $t = \tfrac34 T$? Which initial phase belongs to “pull down and release”?

<details>
<summary>Show solution</summary>

At $\tfrac14 T$ at the upper turning point ($y = 8\,\text{cm}$), at $\tfrac12 T$ back at equilibrium (moving down), at $\tfrac34 T$ at the lower turning point. Pulling down and releasing means $y(0) = -\hat y$, so $\varphi_0 = -\tfrac{\pi}{2}$ ($-90^\circ$). [Show the push](?phi=0)

</details>

### Exercise 7: Energy

For $m = 0.5\,\text{kg}$, $D = 20\,\tfrac{\text{N}}{\text{m}}$ and $\hat y = 8\,\text{cm}$ (without damping): what is the total energy $\tfrac12 D \hat y^2$? How fast is the body when it is at $y = 4\,\text{cm}$? Then reveal “Right now” and check with the time marker and the energy bars. [Load exercise](?_hide=1)

<details>
<summary>Show solution</summary>

$E = \tfrac12 \cdot 20\,\tfrac{\text{N}}{\text{m}} \cdot (0.08\,\text{m})^2 = 0.064\,\text{J}$. At $y = 4\,\text{cm}$, $\tfrac12 D y^2 = 0.016\,\text{J}$, so $E_\text{kin} = 0.048\,\text{J}$ and $v = \sqrt{\frac{2 \cdot 0.048\,\text{J}}{0.5\,\text{kg}}} \approx 0.44\,\tfrac{\text{m}}{\text{s}}$ (up or down). At half the displacement, only a quarter of the energy is in the spring.

</details>

## Ideas for the classroom

- **Use:** mechanical oscillations in upper secondary, or wherever the curriculum covers harmonic oscillations: introduction (observing, phasor diagram), deriving $T = 2\pi\sqrt{m/D}$ by measuring with the stopwatch and the comparison pendulum, going deeper (phase relationships of $y$, $v$, $a$ with the time marker; energy; damping).
- **Model:** ideal, massless spring for which Hooke's law also holds in compression. The displacement $y$ is **upwards positive**. The damping is proportional to velocity ($m\ddot y = -Dy - 2m\delta\dot y$). So that the displayed law $y(t) = \hat y\,e^{-\delta t}\sin(\omega_d t + \varphi_0)$ holds exactly, with damping the body starts with a small initial velocity (for $\varphi_0 = -90^\circ$: $v_0 = \delta\,\hat y$ upwards). The motion is calculated with the Runge–Kutta method (step size $1\,\text{ms}$). Elastic and gravitational energy are combined in the setting “½·D·y²”; the third setting shows them separately (reference level of the gravitational energy: lower turning point). The “forces” arrows show the spring force $F_F$, the weight $F_G$ and the resulting force $F_\text{res} = -D\,y$.
- **Comparison pendulum:** the two pendulums are hung so that their equilibrium positions are at the same height; they start with the same amplitude and the same initial phase.
- **Stopwatch:** the counter $n$ counts full turns of the phasor since the start (green mark). If you stop between two full periods, the evaluation points this out. Comparing with a measurement over only one period shows why you measure several periods.
- **Common pitfalls:**
  - “With a larger amplitude one oscillation takes longer.” – For a spring pendulum $T$ does not depend on $\hat y$.
  - “At the turning point the acceleration is zero because the body stops for a moment.” – There $|a|$ is largest.
  - “At equilibrium no force acts.” – Weight and spring force act; their sum is zero.
  - “On the Moon a spring pendulum oscillates more slowly.” – $g$ does not appear in $T$; only the extension $s_0$ is smaller.
