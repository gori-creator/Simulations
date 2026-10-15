---
description: "Interactive spring pendulum – harmonic oscillation with a phasor diagram, y(t), v(t) and a(t) graphs, energy conversion, damping and measuring the period T = 2π·√(m/D) with a stopwatch."
---

## What is it about?

A body of mass $m$ hangs on a coil spring with spring constant $D$. At the **equilibrium position** the spring is stretched by $s_0 = \frac{m g}{D}$, so that the spring force balances the weight. If the body is displaced by $y$ (here: upwards positive), the resulting force is the **restoring force** $F = -D \cdot y$. This linear force law leads to a **harmonic oscillation**

$$
y(t) = \hat y \sin(\omega t + \varphi_0), \qquad T = 2\pi\sqrt{\frac{m}{D}} .
$$

The period depends neither on the amplitude nor on $g$. In the **phasor diagram** a pointer of length $\hat y$ rotates with angular frequency $\omega$; its vertical projection is the displacement. Velocity and acceleration are $v = \hat y\,\omega\cos(\omega t + \varphi_0)$ and $a = -\omega^2 y$. Without friction $\tfrac12 D y^2 + \tfrac12 m v^2 = \tfrac12 D \hat y^2$ stays constant; with damping the amplitude decreases as $e^{-\delta t}$.

## Try it

1. Pull the body down and let go. Watch the phasor and the graphs.
2. Pause and tap a graph to set the time marker, e.g. at a maximum of $y(t)$. What are $v$ and $a$ there?
3. Time 10 full turns of the phasor with the stopwatch and compare $t/10$ with the formula.
4. Compare two pendulums: [four times the mass](?cmp=1&m=0.25&m2=1&D2=20) or [four times as stiff](?cmp=1&m=0.3&D=10&m2=0.3&D2=40).
5. Look at the forces and all three forms of energy. [Forces and energy](?energy=full&vec=F&graphs=yv)

## Tasks

### Task 1: Period

Calculate the period for $m = 0.5\,\text{kg}$ and $D = 20\,\text{N/m}$. [Load task](?per=0&_hide=1)

<details>
<summary>Show solution</summary>

$T = 2\pi\sqrt{0.5/20}\,\text{s} \approx 0.99\,\text{s}$, $f \approx 1.01\,\text{Hz}$.

</details>

### Task 2: Doubling the period

How must the mass be changed to double the period?

<details>
<summary>Show solution</summary>

Since $T \sim \sqrt{m}$, the mass must be multiplied by four. [Show](?cmp=1&m=0.25&m2=1&D2=20)

</details>

### Task 3: Maximum values

For $m = 0.5\,\text{kg}$, $D = 20\,\text{N/m}$ and $\hat y = 8\,\text{cm}$ find the maximum speed and acceleration.

<details>
<summary>Show solution</summary>

$\omega \approx 6.32\,\text{s}^{-1}$, $\hat v = \hat y\,\omega \approx 0.51\,\text{m/s}$ (at the equilibrium position), $\hat a = \hat y\,\omega^2 = 3.2\,\text{m/s}^2$ (at the turning points).

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- **Model:** ideal massless spring obeying Hooke’s law, displacement positive upwards, velocity-proportional damping, Runge–Kutta integration with a step of $1\,\text{ms}$.
- The two pendulums in comparison mode are suspended so that their equilibrium positions are at the same height.
- The stopwatch counts full turns of the phasor since the start (green mark).
- **Common stumbling blocks:** “A larger amplitude means a longer period.” – “At the turning point the acceleration is zero.” – “On the Moon a spring pendulum oscillates more slowly.”
