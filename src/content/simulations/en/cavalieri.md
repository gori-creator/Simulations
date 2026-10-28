---
description: "Cavalieri’s principle: push stacks of coins and cards sideways, compare cross-sections at every height and use them to justify the volumes of oblique solids and of the sphere."
---

## What is it about?

If you push a straight stack of coins sideways or bend it, its shape changes – but every single coin stays the same. So the volume of the whole stack stays the same, too. The Italian mathematician **Bonaventura Cavalieri** (1598–1647) turned this idea into a principle:

> **Cavalieri’s principle:** If two solids have the same height and their cross-sections have equal areas at every height $z$, then the solids have the same volume.

The **cross-section** at height $z$ is the shape that a horizontal plane cuts out of the solid. Its area is called $A(z)$.

### Oblique solids

In an oblique cylinder, an oblique prism, an oblique pyramid and an oblique cone, every cross-section is only shifted sideways. That is why the formulas for the right solids still hold – with the **height $h$** as the perpendicular distance between the base and the top face or apex (not the slanted side length!):

$$
V_\text{cylinder} = \pi r^2 h, \qquad V_\text{prism} = G \cdot h, \qquad V_\text{pyramid} = \tfrac{1}{3} \cdot G \cdot h, \qquad V_\text{cone} = \tfrac{1}{3}\pi r^2 h .
$$

For cones and pyramids, the cross-section shrinks towards the top: at height $z$ the radius is $\rho = r \cdot \tfrac{h - z}{h}$ and the side is $b = a \cdot \tfrac{h - z}{h}$, so $A(z) = G \cdot \left(\tfrac{h - z}{h}\right)^2$ – no matter where the apex is.

### Volume of a sphere

Compare a **hemisphere** (radius $r$) with a **cylinder** (radius $r$, height $r$) from which a **cone** standing on its apex has been removed. At height $z$:

- Hemisphere: a circle with radius $\sqrt{r^2 - z^2}$ (Pythagorean theorem), so $A_1(z) = \pi (r^2 - z^2)$.
- Remaining solid: a ring with outer radius $r$ and inner radius $z$, so $A_2(z) = \pi r^2 - \pi z^2$.

The cross-sections are equal, so the volumes are equal as well:

$$
V_\text{hemisphere} = \pi r^3 - \tfrac{1}{3}\pi r^3 = \tfrac{2}{3}\pi r^3 \quad\Rightarrow\quad V_\text{sphere} = \tfrac{4}{3}\pi r^3 .
$$

### Slices and the limit

The simulation builds each solid from $n$ slices of thickness $\tfrac{h}{n}$. For the cylinder the stack fits exactly. For the cone each slice is a small cylinder that sticks out a little; the more slices, the smaller the error. As $n \to \infty$, the stack becomes the solid.

## Try it

1. Drag the cutting plane up and down by the handle with the label “z = … cm”. Compare $A_1$ and $A_2$. [Load coins](?s=2&z=2)
2. Push the stack sideways with the top handle and bend it with the middle handle. What happens to the volume? [Bent stack](?s=1&k=2.5&n=20)
3. Choose “Straighten” and then “Make oblique”: the slices slide one by one. Which quantities stay the same?
4. Move the apex of a cone. Does the height stay the same? Does the volume stay the same? [Oblique cone](?body=kegel&s=3&n=50)
5. Set only $n = 4$ slices for the cone and increase $n$ step by step. How does the volume of the stack approach the volume of the cone? [Coarse cone stack](?body=kegel&n=4&s=0)
6. Sweep the plane through the sphere comparison. Where are both cross-sections largest, and where do they vanish? [Volume of a sphere](?body=kugel&n=10&z=1.5)

## Tasks

### Task 1: Oblique cylinder

An oblique cylinder has radius $r = 2\,\text{cm}$ and height $h = 6\,\text{cm}$; its top face is shifted by $3\,\text{cm}$. Find its volume. [Load task](?r=2&h=6&s=3&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

Every cross-section is a circle with $A = \pi \cdot (2\,\text{cm})^2 = 4\pi\,\text{cm}^2$ – just as in the right cylinder. By Cavalieri, $V = \pi r^2 h = 4\pi\,\text{cm}^2 \cdot 6\,\text{cm} = 24\pi\,\text{cm}^3 \approx 75.40\,\text{cm}^3$. The shift does not matter.

[Show in the simulation](?r=2&h=6&s=3)

</details>

### Task 2: Oblique pyramid

A square pyramid has base edge $a = 6\,\text{cm}$ and height $h = 5\,\text{cm}$; its apex is not above the centre. (a) Find the cross-section at height $z = 2\,\text{cm}$. (b) Find the volume. [Load task](?body=pyr&a=6&h=5&s=3&z=2&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

(a) $b = 6\,\text{cm} \cdot \tfrac{5 - 2}{5} = 3.6\,\text{cm}$, so $A = (3.6\,\text{cm})^2 = 12.96\,\text{cm}^2$.

(b) $V = \tfrac{1}{3} \cdot 36\,\text{cm}^2 \cdot 5\,\text{cm} = 60\,\text{cm}^3$ – exactly as much as for the right pyramid.

[Show in the simulation](?body=pyr&a=6&h=5&s=3&z=2)

</details>

### Task 3: Tower of coins

A tower of 20 coins (diameter $2.5\,\text{cm}$, thickness $2\,\text{mm}$) is restacked at a slant. What is its volume? Why do you not need a slanted length for this?

<details>
<summary>Show solution</summary>

Height $h = 20 \cdot 0.2\,\text{cm} = 4\,\text{cm}$, radius $r = 1.25\,\text{cm}$. $V = \pi \cdot (1.25\,\text{cm})^2 \cdot 4\,\text{cm} = 6.25\pi\,\text{cm}^3 \approx 19.63\,\text{cm}^3$. Every coin keeps its volume; only the perpendicular height counts.

</details>

### Task 4: Sphere by Cavalieri

A hemisphere and the remaining solid have $r = 3\,\text{cm}$. (a) Find both cross-sections at height $z = 2\,\text{cm}$. (b) Find the volume of the whole sphere. [Load task](?body=kugel&r=3&z=2&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

(a) Hemisphere: $A_1 = \pi(9 - 4)\,\text{cm}^2 = 5\pi\,\text{cm}^2 \approx 15.71\,\text{cm}^2$. Remaining solid: $A_2 = \pi \cdot 9\,\text{cm}^2 - \pi \cdot 4\,\text{cm}^2 = 5\pi\,\text{cm}^2$ – the same size.

(b) $V = \tfrac{4}{3}\pi \cdot (3\,\text{cm})^3 = 36\pi\,\text{cm}^3 \approx 113.10\,\text{cm}^3$.

[Show in the simulation](?body=kugel&r=3&z=2)

</details>

### Task 5: Coarse and fine

A cone with $r = 3\,\text{cm}$ and $h = 5\,\text{cm}$ is replaced by 4 slices (cylinders) with radii $3\,\text{cm}$, $2.25\,\text{cm}$, $1.5\,\text{cm}$ and $0.75\,\text{cm}$. Find the volume of the stack and compare it with the volume of the cone. [Load task](?body=kegel&n=4&s=0&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$V_\text{stack} = \pi \cdot 1.25\,\text{cm} \cdot (9 + 5.0625 + 2.25 + 0.5625)\,\text{cm}^2 = 21.09375\pi\,\text{cm}^3 \approx 66.27\,\text{cm}^3$. The cone has $V = 15\pi\,\text{cm}^3 \approx 47.12\,\text{cm}^3$; the stack is about $41\,\%$ too large. With more slices the error gets smaller.

[Show in the simulation](?body=kegel&n=4&s=0)

</details>

## Ideas for the classroom

- **Use:** About grade 9/10, volumes of solids (pyramid, cone, sphere; Cavalieri’s principle). Works well as an introduction (stacks of coins and cards), to justify the formulas for oblique solids and as a highlight for deriving the volume of a sphere.
- **Model:** The slices enclose the solid (radius at the lower edge of each slice); the centre of every slice lies on the shifted or bent axis. The hatched orange area is the exact cross-section of the solid. The chart $A(z)$ shows the slices as bars – a first glimpse of integration (“area under the curve = volume”).
- **Common stumbling blocks:**
  - “An oblique cylinder holds more because it is longer.” – What counts is the perpendicular height, not the slanted side.
  - “Equal base and equal height are enough.” – Cone and cylinder show: the cross-sections must be equal **at every height**.
  - “For the sphere, the cross-section at half height is half the base.” – It is $\pi\left(r^2 - \tfrac{r^2}{4}\right) = \tfrac{3}{4}\pi r^2$.
