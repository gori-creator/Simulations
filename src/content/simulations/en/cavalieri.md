---
description: "Cavalieri’s principle: push stacks of coins and cards sideways, compare cross-sections at every height and derive the volumes of oblique solids and of the sphere."
---

## What is it about?

If you push a stack of coins sideways or bend it, its shape changes – but every coin stays the same, so the volume stays the same. **Bonaventura Cavalieri** (1598–1647) turned this into a principle:

> **Cavalieri’s principle:** If two solids have the same height and equal cross-sectional areas at every height $z$, they have the same volume.

Oblique cylinders, prisms, pyramids and cones therefore have the same volume formulas as the right ones, with $h$ the perpendicular height:

$$
V_\text{cylinder} = \pi r^2 h, \qquad V_\text{prism} = G h, \qquad V_\text{pyramid} = \tfrac{1}{3} G h, \qquad V_\text{cone} = \tfrac{1}{3}\pi r^2 h .
$$

**Sphere:** a hemisphere (radius $r$) and a cylinder (radius $r$, height $r$) with a cone removed have equal cross-sections $\pi(r^2 - z^2)$ at every height. Hence $V_\text{hemisphere} = \pi r^3 - \tfrac{1}{3}\pi r^3 = \tfrac{2}{3}\pi r^3$ and $V_\text{sphere} = \tfrac{4}{3}\pi r^3$.

The simulation builds each solid from $n$ slices; as $n \to \infty$, the stack becomes the solid.

## Try it

1. Drag the cutting plane up and down and compare $A_1$ and $A_2$. [Load coins](?s=2&z=2)
2. Shear and bend the stack with the handles. Does the volume change? [Bent stack](?s=1&k=2.5&n=20)
3. Move the apex of a cone. [Oblique cone](?body=kegel&s=3&n=50)
4. Sweep the plane through the hemisphere and the remaining solid. [Sphere](?body=kugel&n=10&z=1.5)

## Tasks

### Task 1: Oblique cylinder

An oblique cylinder has $r = 2\,\text{cm}$ and $h = 6\,\text{cm}$. Find its volume. [Load task](?r=2&h=6&s=3&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \pi \cdot (2\,\text{cm})^2 \cdot 6\,\text{cm} = 24\pi\,\text{cm}^3 \approx 75.40\,\text{cm}^3$ – the shift does not matter.

</details>

### Task 2: Oblique pyramid

A square pyramid has $a = 6\,\text{cm}$, $h = 5\,\text{cm}$ and an off-centre apex. Find the cross-section at $z = 2\,\text{cm}$ and the volume. [Load task](?body=pyr&a=6&h=5&s=3&z=2&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$b = 6\,\text{cm} \cdot \tfrac{3}{5} = 3.6\,\text{cm}$, $A = 12.96\,\text{cm}^2$; $V = \tfrac{1}{3} \cdot 36\,\text{cm}^2 \cdot 5\,\text{cm} = 60\,\text{cm}^3$.

</details>

### Task 3: Sphere

For $r = 3\,\text{cm}$, compare both cross-sections at $z = 2\,\text{cm}$ and find the volume of the sphere. [Load task](?body=kugel&r=3&z=2&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

Both are $5\pi\,\text{cm}^2 \approx 15.71\,\text{cm}^2$. $V = \tfrac{4}{3}\pi \cdot 27\,\text{cm}^3 = 36\pi\,\text{cm}^3 \approx 113.10\,\text{cm}^3$.

</details>

## Ideas for the classroom

- **Use:** Grade 10, volumes of pyramids, cones and spheres; Cavalieri’s principle. Good as an introduction (stacks of coins) and for deriving the volume of a sphere.
- **Model:** The slices enclose the solid; the orange area is the exact cross-section. The chart $A(z)$ shows the slices as bars – a first glimpse of integration.
- **Common stumbling blocks:** “An oblique cylinder holds more because it is longer.” – Only the perpendicular height counts.
