---
description: Interactive simple pendulum – measure the period, compare with T = 2π√(l/g), explore energy, damping and large amplitudes.
---

## What is it about?

For small amplitudes the period of a simple pendulum is

$$
T_0 = 2\pi \sqrt{\frac{l}{g}}.
$$

It depends only on the length and on $g$ – not on the mass, and (for small angles) not on the amplitude. For large amplitudes the period gets longer (about $18\,\%$ at $90^\circ$). Potential and kinetic energy convert into each other; damping converts energy into internal energy.

## Try it

1. Drag the bob aside and press **Release**. Compare the measured period with the formula.
2. Change the mass. What happens to the period?
3. Release from $120^\circ$ and compare with the small-angle approximation. [Large amplitude](?amp=120&compare=1)

## Exercises

### Exercise 1: Seconds pendulum

How long must a pendulum be for a period of exactly $2\,\text{s}$?

<details>
<summary>Show solution</summary>

$l = g \left(\frac{T}{2\pi}\right)^2 \approx 0.994\,\text{m}$.

</details>

### Exercise 2: On the Moon

Find the period of a $1\,\text{m}$ pendulum on the Moon ($g = 1.62\,\tfrac{\text{m}}{\text{s}^2}$).

<details>
<summary>Show solution</summary>

$T \approx 4.94\,\text{s}$. [Show in the simulation](?planet=mond)

</details>

## Notes for teachers

- The simulation integrates the exact equation $\ddot\varphi = -\tfrac{g}{l}\sin\varphi - \gamma\dot\varphi$; the small-angle approximation can be shown as a second, translucent pendulum.
- **Misconception:** "A heavier pendulum swings faster."
