---
description: "Interactive simulation of planetary orbits and Kepler’s three laws: choose a launch velocity, let the orbit be computed numerically from the law of gravitation and explore the ellipse, the law of areas, T²/a³, circular and escape speed."
---

## What is it about?

The planet is attracted only by the star’s gravitational force $F_G = G \frac{M m}{r^2}$. The simulation does not know about ellipses: it computes acceleration, velocity and position in tiny time steps. Still, exactly Kepler’s orbits appear.

- **First law:** planets move on **ellipses** with the Sun at one **focus** $F_1$. For every point $r_1 + r_2 = 2a$ ($a$: semi-major axis, $c = \sqrt{a^2 - b^2}$: focal distance, $e = \frac{c}{a}$: eccentricity). Closest point: **perihelion** $r_P = a - c$, farthest point: **aphelion** $r_A = a + c$.
- **Second law:** the line Sun–planet sweeps out equal areas in equal times, so $r_P v_P = r_A v_A$ (conservation of angular momentum).
- **Third law:** for all planets of the same star

$$
\frac{T^2}{a^3} = \frac{4\pi^2}{G M} \approx 2.97 \cdot 10^{-19}\,\tfrac{\text{s}^2}{\text{m}^3} \quad \text{(Sun)}
$$

With the **circular speed** $v_K = \sqrt{\frac{G M}{r_0}}$ (perpendicular start) the orbit is a circle; from the **escape speed** $v_F = \sqrt{2} \cdot v_K$ on it is open (parabola, hyperbola). At 1 AU: $v_K \approx 29.8\,\tfrac{\text{km}}{\text{s}}$, $v_F \approx 42.1\,\tfrac{\text{km}}{\text{s}}$. The total energy $E = \frac{1}{2} m v^2 - G \frac{M m}{r}$ is negative for bound orbits.

## Try it

1. Press **Start** and compare the speed at perihelion and aphelion. After one orbit the ellipse is divided into areas swept in equal times – compare the bars.
2. Drag the arrow tip across the rings $v_K$ and $v_F$: [circle](?v0=29.78) · [hyperbola](?v0=46&panel=energy)
3. Watch $r_1 + r_2$: [string construction](?str=1&sec=0)
4. Measure several orbits in the table: [Kepler’s third law](?panel=k3) · [two solar masses](?panel=k3&M=2&v0=50)

## Tasks

### Task 1: Earth’s orbit

Find the circular speed at $r = 1.496 \cdot 10^{11}\,\text{m}$ from the Sun ($M = 1.989 \cdot 10^{30}\,\text{kg}$) and the period. [Load task](?v0=29.78&num=0&_hide=1)

<details>
<summary>Show solution</summary>

$v_K = \sqrt{\frac{G M}{r}} \approx 29.8\,\tfrac{\text{km}}{\text{s}}$, $T = \frac{2\pi r}{v_K} \approx 3.16 \cdot 10^{7}\,\text{s} \approx 365\,\text{d}$.

</details>

### Task 2: Perihelion and aphelion

$r_P = 1.00\,\text{AU}$, $v_P = 36.0\,\tfrac{\text{km}}{\text{s}}$, $r_A = 2.71\,\text{AU}$. Find $v_A$, $a$ and $e$. [Load task](?num=0&_hide=1)

<details>
<summary>Show solution</summary>

$v_A = v_P \frac{r_P}{r_A} \approx 13.3\,\tfrac{\text{km}}{\text{s}}$, $a = \frac{r_P + r_A}{2} \approx 1.86\,\text{AU}$, $e = \frac{r_A - r_P}{r_A + r_P} \approx 0.46$.

</details>

### Task 3: Mars

Mars has $a = 1.524\,\text{AU}$. Find its period (Earth: $a = 1\,\text{AU}$, $T = 1$ year). [Load task](?panel=k3&r0=1.38&v0=26.51&pl=1&sec=0&num=0&_hide=1)

<details>
<summary>Show solution</summary>

$T = \sqrt{1.524^3}$ years $\approx 1.88$ years.

</details>

## Notes for teachers

- **Use:** gravitation and Kepler’s laws in upper secondary school (grades 11–13), from guessing a law to checking it with the table and the log–log graph.
- **Model:** point masses, $m \ll M$, only the star’s gravity; leapfrog (Verlet) integration with a fixed time step (energy conserved to better than $10^{-4}$, angular momentum exactly). Star and planet are not to scale. Planet data: rounded mean orbital elements (JPL, E. M. Standish).
- **Misconceptions:** the Sun is at a focus, not at the centre; real planetary orbits are almost circles; the period does not depend on the planet’s mass; the escape speed does not depend on the direction.
