---
description: Interactive 3D simulation of prisms and cylinders – volume V = G · h by stacking layers, surface area by rolling the solid out, and the cylinder as the limit of prisms.
---

## What is it about?

A (right) **prism** has two equal, parallel bases and rectangles as its lateral faces; a **cylinder** has a circle as its base.

- **Volume:** cut the solid into layers $1\,\text{cm}$ thick. Each layer has volume $G \cdot 1\,\text{cm}$; a solid $4\,\text{cm}$ high consists of 4 layers: $V = G \cdot h$ (cylinder: $V = \pi r^2 h$).
- **Surface area:** roll the solid once along the floor. The prints of the lateral faces form a rectangle of length $u$ (perimeter of the base) and width $h$: $M = u \cdot h$ and $O = 2G + M$ (cylinder: $O = 2\pi r^2 + 2\pi r h$).
- **Limit:** a regular $n$-gon gets closer and closer to a circle as $n$ grows – the prism turns into a cylinder.

## Try it

1. Press **Stack layers** and watch the calculation in the picture.
2. Choose **Surface: roll out** and press **Roll out**. [Roll a hexagonal prism](?mode=oberflaeche&roll=45)
3. Increase $n$ and turn on the comparison cylinder. [Almost a cylinder](?n=24&ghost=1)

## Tasks

### Task 1: Cylinder

Find the volume and surface area of a cylinder with $r = 2\,\text{cm}$ and $h = 4\,\text{cm}$. [Load task](?base=kreis&r=2&h=4&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = 16\pi\,\text{cm}^3 \approx 50.27\,\text{cm}^3$, $O = 24\pi\,\text{cm}^2 \approx 75.40\,\text{cm}^2$.

</details>

### Task 2: Hexagonal prism

In a regular hexagon each side is as long as the radius of the circumcircle. Find the lateral surface of a hexagonal prism with $r = 2\,\text{cm}$ and $h = 4\,\text{cm}$. [Load task](?mode=oberflaeche&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$u = 6 \cdot 2\,\text{cm} = 12\,\text{cm}$, $M = u \cdot h = 48\,\text{cm}^2$.

</details>

### Task 3: Almost a cylinder

From how many vertices on does the prism have more than $99\,\%$ of the cylinder's volume?

<details>
<summary>Show solution</summary>

From $n = 26$ on (for $n = 6$ it is only about $82.7\,\%$). [n = 26](?n=26&ghost=1)

</details>

## Notes for teachers

- “Stack layers” justifies $V = G \cdot h$, “Roll out” justifies $M = u \cdot h$. The calculation in the picture can be switched off with `calc=0`.
- **Misconceptions:** confusing $u \cdot h$ with $G \cdot h$ (and cm² with cm³), using the diameter instead of the radius, counting only one base, expecting the volume to double when the radius doubles.
