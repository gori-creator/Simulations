---
description: "Explore pyramid, cone and sphere: helper triangles with Pythagoras, volume by pouring, surface area from the net."
---

## What is it about?

For pyramids, cones and spheres you cannot simply compute volume and surface area as "length times width times height". The simulation shows **where the formulas come from**: you can rotate the solid, pour water and unfold the net.

### Building blocks

- **Height $h$**: perpendicular distance of the apex from the base.
- **Slant height $h_a$** (pyramid): height of a lateral face, from the midpoint of a base edge to the apex.
- **Slant height $s$** (cone) or **lateral edge $s$** (pyramid): line from the apex to the edge of the base.
- **Radius $r$**: for cone and sphere, the distance from the centre.

These lengths are linked by right triangles (Pythagoras' theorem). For the square pyramid with base diagonal $d = a\sqrt{2}$:

$$
h_a^2 = h^2 + \left(\tfrac{a}{2}\right)^2, \qquad s^2 = h^2 + \left(\tfrac{d}{2}\right)^2 = h_a^2 + \left(\tfrac{a}{2}\right)^2 .
$$

For the cone, the slant height satisfies $s^2 = h^2 + r^2$. Careful: the slant height $h_a$ and the lateral edge $s$ of a pyramid are different lines. $h_a$ meets the base edge at its midpoint at a right angle, $s$ ends at a corner.

### Pyramid

With base area $G$ and height $h$:

$$
V = \tfrac{1}{3} \cdot G \cdot h, \qquad M = \text{sum of the lateral faces}, \qquad O = G + M .
$$

For the square pyramid, $G = a^2$ and $M = 4 \cdot \tfrac{1}{2} \cdot a \cdot h_a$. The water from three pyramids exactly fills the prism with the same base and height.

### Cone

$$
V = \tfrac{1}{3}\pi r^2 h, \qquad M = \pi r s, \qquad O = \pi r^2 + \pi r s .
$$

The lateral surface unrolls into a **circular sector** with radius $s$ and arc length $2\pi r$. Its angle is $\alpha = 360^\circ \cdot \tfrac{r}{s}$.

### Sphere

$$
V = \tfrac{4}{3}\pi r^3, \qquad O = 4\pi r^2 .
$$

- **Archimedes:** cylinder (height $r$, radius $r$) = cone + hemisphere. The cone holds $\tfrac{1}{3}\pi r^3$, the cylinder $\pi r^3$, so the hemisphere gets $\tfrac{2}{3}\pi r^3$ and the whole sphere $\tfrac{4}{3}\pi r^3$.
- **From pyramids:** if you cut the sphere into many pyramids of height $r$, then $V = \tfrac{1}{3} \cdot O \cdot r$. It follows that $O = 3V : r = 4\pi r^2$.

## Try it

1. Choose the square pyramid and switch between the helper triangles. Which line is always the longest? [Load pyramid](?a=4&h=5)
2. Pour the pyramid three times. How much of the prism does one pyramid fill? [Pouring](?mode=volumen&a=4&h=5)
3. Try the same with the cone. What changes when you change $r$ or $h$? [Pour a cone](?body=kegel&mode=volumen)
4. Unroll the lateral surface of the cone. Change $h$ and watch the angle $\alpha$. [Cone net](?body=kegel&mode=oberflaeche&open=100)
5. Pour after Archimedes: first the cone, then the hemisphere. [Archimedes](?body=kugel&mode=volumen&r=2.5)
6. Split the sphere into pyramids and rotate it. [Sphere made of pyramids](?body=kugel&mode=oberflaeche&r=2&split=70)

## Tasks

### Task 1: Square pyramid

A square pyramid has base edge $a = 4\,\text{cm}$ and height $h = 5\,\text{cm}$. Calculate the slant height, volume, lateral surface and surface area. [Load task](?a=4&h=5&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$h_a = \sqrt{5^2 + 2^2}\,\text{cm} = \sqrt{29}\,\text{cm} \approx 5.39\,\text{cm}$

$V = \tfrac{1}{3} \cdot 16\,\text{cm}^2 \cdot 5\,\text{cm} \approx 26.67\,\text{cm}^3$

$M = 4 \cdot \tfrac{1}{2} \cdot 4\,\text{cm} \cdot \sqrt{29}\,\text{cm} = 8\sqrt{29}\,\text{cm}^2 \approx 43.08\,\text{cm}^2$

$O = 16\,\text{cm}^2 + 43.08\,\text{cm}^2 \approx 59.08\,\text{cm}^2$

[Show in the simulation](?a=4&h=5)

</details>

### Task 2: Cone

A cone has radius $r = 3\,\text{cm}$ and height $h = 4\,\text{cm}$. Find $s$, $V$, $M$ and $O$. [Load task](?body=kegel&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$s = \sqrt{4^2 + 3^2}\,\text{cm} = 5\,\text{cm}$

$V = \tfrac{1}{3}\pi \cdot 9\,\text{cm}^2 \cdot 4\,\text{cm} = 12\pi\,\text{cm}^3 \approx 37.70\,\text{cm}^3$

$M = \pi \cdot 3\,\text{cm} \cdot 5\,\text{cm} = 15\pi\,\text{cm}^2 \approx 47.12\,\text{cm}^2$

$O = 9\pi\,\text{cm}^2 + 15\pi\,\text{cm}^2 = 24\pi\,\text{cm}^2 \approx 75.40\,\text{cm}^2$

[Show in the simulation](?body=kegel&mode=oberflaeche&open=100)

</details>

### Task 3: Sphere

A sphere has radius $r = 2.5\,\text{cm}$. Calculate its volume and surface area. What percentage of the enclosing cylinder (height $2r$) does the sphere fill? [Load task](?body=kugel&r=2.5&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \tfrac{4}{3}\pi \cdot (2.5\,\text{cm})^3 \approx 65.45\,\text{cm}^3$

$O = 4\pi \cdot (2.5\,\text{cm})^2 = 25\pi\,\text{cm}^2 \approx 78.54\,\text{cm}^2$

The cylinder has $V = 2\pi r^3 \approx 98.17\,\text{cm}^3$. The sphere fills $\tfrac{2}{3} \approx 66.7\,\%$ of it.

[Show in the simulation](?body=kugel&r=2.5&cyl=1)

</details>

## Ideas for the classroom

- **Use:** about grades 9/10, calculating solids. Suitable as an introduction (pouring experiment), for practice (Pythagoras in solids) and for going further (Archimedes).
- **Model:** the pyramid has a regular $n$-gon as its base, with the apex directly above the centre. When pouring, the amount of water is calculated exactly from the volume; the drawing only approximates it.
- **Common mistakes:**
  - The factor $\tfrac{1}{3}$ is forgotten – correct: pyramid and cone fill only a third.
  - $r$ and $d$ are mixed up – the formulas use the radius.
  - Height $h$ is confused with the slant height $h_a$ or $s$ – $s$ is always longer than $h$.
