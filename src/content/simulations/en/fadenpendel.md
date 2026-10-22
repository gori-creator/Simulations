---
description: "Interactive simple pendulum – drag and release the bob, forces and energy live, φ(t) against the small-angle approximation, measurements to determine g, large amplitudes and damping in a phase diagram."
---

## What is it about?

The restoring force $F_r = m g \sin\varphi$ pulls the bob back to equilibrium. For small amplitudes ($\sin\varphi \approx \varphi$) the motion is harmonic with

$$
T_0 = 2\pi \sqrt{\frac{l}{g}}.
$$

The period depends only on the length and on $g$ – not on the mass. Since $T^2 = \frac{4\pi^2}{g}\, l$, a graph of $T^2$ against $l$ is a straight line through the origin with slope $4\pi^2/g$. For large amplitudes the period gets longer: up to about $60^\circ$, $T \approx T_0 \,(1 + \varphi_0^2/16)$ with $\varphi_0$ in radians; the simulation itself solves the equation of motion numerically and computes the period exactly as $T = T_0 / \operatorname{AGM}(1, \cos\tfrac{\varphi_0}{2})$, more than $1\,\%$ above $22.8^\circ$ and $18\,\%$ at $90^\circ$. Above $90^\circ$ a string would go slack, so the simulation uses a rigid rod.

## Try it

1. Drag the bob aside and let go. Watch the energy bars while the total stays the same.
2. Turn on the force arrows. [Forces from 90°](?arrows=F&amp=90)
3. Compare with the small-angle approximation. [Graphs](?mode=graphs&amp=70&compare=1)
4. Time 10 oscillations at several lengths and determine $g$. [Measurements](?mode=period&amp=6)
5. Damping turns the phase-space path into a spiral. [Damped](?mode=phase&amp=40&damping=0.2)

## Tasks

### Task 1: Seconds pendulum

How long must a pendulum be for $T = 2\,\text{s}$?

<details>
<summary>Show solution</summary>

$l = g \left(\frac{T}{2\pi}\right)^2 \approx 0.994\,\text{m}$. [Show](?l=0.99)

</details>

### Task 2: On the Moon

Find $T_0$ of a $1\,\text{m}$ pendulum on the Moon ($g = 1.62\,\tfrac{\text{m}}{\text{s}^2}$).

<details>
<summary>Show solution</summary>

$T_0 \approx 4.94\,\text{s}$. [Show in the simulation](?planet=mond)

</details>

### Task 3: Speed and tension

$m = 0.5\,\text{kg}$, $l = 1\,\text{m}$, released from $20^\circ$: how fast is the bob at the bottom? What is the tension there when released from $90^\circ$?

<details>
<summary>Show solution</summary>

$h \approx 0.0603\,\text{m}$, $v = \sqrt{2gh} \approx 1.09\,\tfrac{\text{m}}{\text{s}}$. From $90^\circ$: $F_T = 3mg \approx 14.7\,\text{N}$.

</details>

## Ideas for the classroom

- The measurement series (with random reaction time) prepares a real stopwatch experiment: why time many periods, why use a small amplitude?
- The exact equation $\ddot\varphi = -\tfrac{g}{l}\sin\varphi - 2\gamma\dot\varphi$ is solved numerically; the small-angle approximation runs alongside as a dashed pendulum.
- **Common stumbling blocks:** "A heavier pendulum swings faster." – "The tension always equals the weight." (At the bottom it is larger by $m v^2 / l$.)
