---
description: Interactive 3D simulation of prisms and cylinders – volume V = G · h by stacking layers, surface area by rolling the solid out, and the cylinder as the limit of prisms.
---

## What is it about?

A (right) **prism** has two equal, parallel **bases** – the bottom and the top face – and rectangles as its lateral faces. For a **cylinder** the base is a circle. Together the lateral faces form the **lateral surface**.

**Volume.** Imagine the solid cut into layers $1\,\text{cm}$ thick. Each layer has the volume $G \cdot 1\,\text{cm}$. If the solid is $h = 4\,\text{cm}$ high, there are 4 such layers; for $h = 4.5\,\text{cm}$ there are four and a half. So

$$
V = G \cdot h \qquad \text{cylinder: } V = \pi r^2 \cdot h
$$

**Surface area.** If you roll the solid once along the floor, every lateral face leaves its print. Together the prints form a rectangle: its length is the **perimeter** $u$ of the base, its width is the height $h$. Adding the bottom and the top face gives the net:

$$
M = u \cdot h, \qquad O = 2 \cdot G + M \qquad \text{cylinder: } O = 2\pi r^2 + 2\pi r \cdot h
$$

**The cylinder as a limit.** A regular $n$-gon with circumradius $r$ consists of $n$ isosceles triangles. The more vertices it has, the more it looks like the circle: $G$ approaches $\pi r^2$ and $u$ approaches $2\pi r$. The prism becomes more and more like a cylinder.

## Try it

1. Press **Stack layers** and watch the calculation in the picture: how does the volume depend on the number of layers?
2. Double the height $h$ of the solid. What happens to $V$? Then double the radius $r$ – why does the volume become four times as large now?
3. Choose **Surface: roll out** and press **Roll out**. The coloured starting face shows when one full turn is complete. [Roll a hexagonal prism](?mode=oberflaeche&roll=45)
4. Increase the number of vertices $n$ and turn on the comparison cylinder. [Almost a cylinder](?n=24&ghost=1)
5. Roll out a cylinder: the length of the rectangle is the circumference of the circle. [Net of a cylinder](?mode=oberflaeche&base=kreis&r=1.5&h=4&roll=100)

## Tasks

### Task 1: Triangular prism

The base of a prism is an isosceles triangle with base side $g = 4\,\text{cm}$ and height $h_g = 3\,\text{cm}$; the legs are about $3.6\,\text{cm}$ long. The prism is $h = 5\,\text{cm}$ high. Find its volume and surface area. [Load task](?base=dreieck&g=4&hg=3&h=5&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$G = \tfrac{1}{2} \cdot 4\,\text{cm} \cdot 3\,\text{cm} = 6\,\text{cm}^2$, so $V = G \cdot h = 6\,\text{cm}^2 \cdot 5\,\text{cm} = 30\,\text{cm}^3$.

$u \approx 4\,\text{cm} + 2 \cdot 3.6\,\text{cm} = 11.2\,\text{cm}$, $M = u \cdot h \approx 56\,\text{cm}^2$ and $O = 2 \cdot G + M \approx 12\,\text{cm}^2 + 56\,\text{cm}^2 = 68\,\text{cm}^2$.

</details>

### Task 2: Cylinder

A cylinder has radius $r = 2\,\text{cm}$ and height $h = 4\,\text{cm}$. Find its volume and surface area. [Load task](?base=kreis&r=2&h=4&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$V = \pi \cdot (2\,\text{cm})^2 \cdot 4\,\text{cm} = 16\pi\,\text{cm}^3 \approx 50.27\,\text{cm}^3$

$O = 2 \cdot \pi \cdot (2\,\text{cm})^2 + 2\pi \cdot 2\,\text{cm} \cdot 4\,\text{cm} = 8\pi\,\text{cm}^2 + 16\pi\,\text{cm}^2 = 24\pi\,\text{cm}^2 \approx 75.40\,\text{cm}^2$

</details>

### Task 3: The hexagon

In a regular hexagon every side is exactly as long as the circumradius. Explain why. Then use this to find the lateral surface of a hexagonal prism with $r = 2\,\text{cm}$ and $h = 4\,\text{cm}$. [Load task](?mode=oberflaeche&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

The hexagon consists of six triangles with the angle $360^\circ : 6 = 60^\circ$ at the centre. The other two angles are equal, so they are $60^\circ$ each as well – the triangles are equilateral, and the side is as long as the radius.

$u = 6 \cdot 2\,\text{cm} = 12\,\text{cm}$, $M = u \cdot h = 12\,\text{cm} \cdot 4\,\text{cm} = 48\,\text{cm}^2$. [Show the rolling](?mode=oberflaeche&roll=100)

</details>

### Task 4: A drinks can

A can has a diameter of $7\,\text{cm}$ and a height of $11\,\text{cm}$. How much paper (without overlap) do you need for the label that covers the lateral surface? Does half a litre fit into it?

<details>
<summary>Show solution</summary>

$M = 2\pi r \cdot h = \pi \cdot 7\,\text{cm} \cdot 11\,\text{cm} \approx 241.9\,\text{cm}^2$.

$V = \pi \cdot (3.5\,\text{cm})^2 \cdot 11\,\text{cm} \approx 423.3\,\text{cm}^3 \approx 0.42\,\text{l}$ – half a litre ($500\,\text{cm}^3$) does not fit.

</details>

### Task 5: When is the prism almost a cylinder?

A prism with a regular $n$-gon as its base and a cylinder have the same radius and the same height. From how many vertices on does the prism have more than $99\,\%$ of the cylinder's volume? Try it with the simulation. [Load task](?n=6&ghost=1&_hide=1)

<details>
<summary>Show solution</summary>

For $n = 6$ it is about $82.7\,\%$, for $n = 12$ about $95.5\,\%$. From $n = 26$ vertices on it is more than $99\,\%$ (for $n = 25$ only $98.95\,\%$). [n = 26](?n=26&ghost=1)

</details>

## Ideas for the classroom

- **Use:** Bavaria, grade 8, learning area 7 (circle and cylinder): prisms and cylinders with net, surface area and volume. Best used after working with the circle (see the simulation on the number π).
- **Two approaches:** “Stack layers” justifies $V = G \cdot h$ (it builds on counting cubes in a cuboid), “Roll out” justifies $M = u \cdot h$. You can switch off the calculation in the picture (`calc=0`).
- **Common stumbling blocks:**
  - Lateral surface and volume are mixed up ($u \cdot h$ instead of $G \cdot h$) – also the units $\text{cm}^2$ and $\text{cm}^3$.
  - For the cylinder, the diameter is used instead of the radius.
  - Only one base is counted for the surface area.
  - Students expect the volume to double when the radius doubles – in fact it becomes four times as large.
- **About the display:** When rolling, the prism tips over one edge at a time; the cylinder rolls without slipping, so after one full turn its print is exactly $2\pi r$ long. The triangle is isosceles; the length of the legs is calculated and shown rounded.
