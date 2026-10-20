---
description: "Explore pyramid, cone and sphere: helper triangles with Pythagoras, volume by pouring, surface area from the net."
---

## What is it about?

For pyramids, cones and spheres, volume and surface area need their own formulas. The simulation shows **where they come from**: rotate the solid, pour water and unfold the net.

- **Height $h$**, **slant height $h_a$** (pyramid), **slant edge or generatrix $s$**, **radius $r$**. They are linked by right triangles: $h_a^2 = h^2 + (a/2)^2$, $s^2 = h^2 + r^2$.
- **Pyramid:** $V = \tfrac{1}{3} G h$, $O = G + M$.
- **Cone:** $V = \tfrac{1}{3}\pi r^2 h$, $M = \pi r s$, $O = \pi r^2 + \pi r s$. The lateral surface unrolls into a circular sector with angle $\alpha = 360^\circ \cdot r/s$.
- **Sphere:** $V = \tfrac{4}{3}\pi r^3$, $O = 4\pi r^2$. Archimedes: cylinder (height $r$) = cone + hemisphere. Cut into pyramids of height $r$: $V = \tfrac{1}{3} O r$.

## Try it

1. Pour the pyramid three times. How much of the prism does one pyramid fill? [Pouring](?mode=volumen&a=4&h=5)
2. Unroll the cone and change $h$. What happens to $\alpha$? [Cone net](?body=kegel&mode=oberflaeche&open=100)
3. Pour after Archimedes. [Archimedes](?body=kugel&mode=volumen&r=2.5)

## Tasks

### Task 1: Pyramid

Square pyramid, $a = 4\,\text{cm}$, $h = 5\,\text{cm}$: find $h_a$, $V$, $M$, $O$. [Load task](?a=4&h=5&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$h_a = \sqrt{29}\,\text{cm} \approx 5.39\,\text{cm}$, $V \approx 26.67\,\text{cm}^3$, $M \approx 43.08\,\text{cm}^2$, $O \approx 59.08\,\text{cm}^2$.

</details>

### Task 2: Cone

Cone with $r = 3\,\text{cm}$, $h = 4\,\text{cm}$: find $s$, $V$, $M$, $O$. [Load task](?body=kegel&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$s = 5\,\text{cm}$, $V = 12\pi\,\text{cm}^3 \approx 37.70\,\text{cm}^3$, $M = 15\pi\,\text{cm}^2 \approx 47.12\,\text{cm}^2$, $O = 24\pi\,\text{cm}^2 \approx 75.40\,\text{cm}^2$.

</details>

### Task 3: Sphere

Sphere with $r = 2.5\,\text{cm}$: find $V$ and $O$. [Load task](?body=kugel&r=2.5&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$V \approx 65.45\,\text{cm}^3$, $O = 25\pi\,\text{cm}^2 \approx 78.54\,\text{cm}^2$. The sphere fills $\tfrac{2}{3}$ of its enclosing cylinder.

</details>

## Ideas for the classroom

- **Use:** grade 10, solids (Bavarian Gymnasium curriculum; assignment is a draft, please check against the current curriculum).
- **Common mistakes:** forgetting the factor $\tfrac{1}{3}$; mixing up $r$ and $d$; confusing $h$ with $h_a$ or $s$.
