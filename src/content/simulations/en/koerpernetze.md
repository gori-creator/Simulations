---
description: Interactive 3D simulation of nets – fold a cube, cuboid, prism, pyramid and cylinder, test cube nets and find the surface area from the net.
---

## What is it about?

Cut a solid along some of its edges and lay it out flat: you get a **net**. The net consists of all the faces of the solid, joined at edges. The other way round, a net can be **folded** into the solid.

The **surface area** $O$ is the sum of the areas of all faces, so it can be read straight off the net:

| Solid | Faces in the net | Surface area |
| --- | --- | --- |
| Cube (edge $a$) | 6 equal squares | $O = 6 \cdot a^2$ |
| Cuboid ($a$, $b$, $c$) | 3 pairs of equal rectangles | $O = 2 \cdot (ab + ac + bc)$ |
| Prism | base and top $G$, lateral surface $M$ | $O = 2 \cdot G + M$ |
| Square pyramid | square, 4 equal triangles | $O = a^2 + 4 \cdot \tfrac{1}{2} \cdot a \cdot h_a$ |
| Cylinder ($r$, $h$) | 2 circles, 1 rectangle | $O = 2 \cdot \pi r^2 + 2\pi r \cdot h$ |

The lateral surface of a cylinder is a rectangle with one side as long as the **circumference** $u = 2\pi r$ – otherwise it would not wrap exactly once around the circle.

**Cube nets:** There are exactly **11** different cube nets (rotations and reflections do not count as new). Not every arrangement of six squares is one of them. A useful hint: opposite faces of a cube are **never next to each other** in the net; in a row of three squares, the first and the third are opposite.

## Try it

1. Press **Fold** and watch the cross turn into a cube. Rotate the view by dragging on the canvas.
2. Is net no. 3 a cube net? Think first, then fold. [Load net no. 3](?net=3&pairs=0)
3. Turn on **Colour opposite faces alike** and step through the nets. Are two faces of the same colour ever next to each other?
4. Tap a face: “Tapped face” shows its area; for the cube and cuboid, the opposite face is marked with a dashed outline.
5. Roll up the cylinder's lateral surface slowly with the **Folding** slider. The highlighted edge $u = 2\pi r$ wraps exactly once around the base circle. [Half-rolled cylinder](?body=zylinder&f=55)
6. Change the height $h_a$ of the side triangles of the pyramid. How does the apex change? [Pyramid](?body=pyramide&a=3&ha=4&f=100)

## Tasks

### Task 1: Cube net or not?

Which of the 15 nets fold into a cube? Decide without folding first, then check with the simulation. [Load task](?pairs=0&areas=0&_hide=1)

<details>
<summary>Show solution</summary>

Nets 3, 7, 10 and 13 are **not** cube nets; all the others (11 of them) are.

- No. 3: Both “lids” are on the same side of the strip of four – they land on top of each other.
- No. 7: Five squares in a row – the fifth lands on the first.
- No. 10: Four squares form a $2 \times 2$ block – that never works for a cube.
- No. 13: A staircase of three squares at the top, two below and one to the right – the top-left square and the bottom end of the column land on the same side of the cube.

</details>

### Task 2: Game die

On a game die, the numbers on opposite faces always add up to 7. In net no. 9 the six is at the left end of the row of three (one more square is attached above and one below this square). Where must the one be? Think first, then turn on the dice pips. [Load net](?net=9&pairs=0&areas=0)

<details>
<summary>Show solution</summary>

The one is opposite the six. In a row of three squares, that is not the neighbouring square but the one after it – so the right end of the row of three. The two squares above and below the six are opposite each other (2 and 5), and so are the square between six and one and the square at the top left (3 and 4). [Show dice pips](?net=9&dice=1&f=100)

</details>

### Task 3: Surface area of a cuboid

A cuboid is $4\,\text{cm}$ long, $3\,\text{cm}$ wide and $2\,\text{cm}$ high. Find its surface area using the net. [Load task](?body=quader&a=4&b=3&c=2&areas=0&_hide=1)

<details>
<summary>Show solution</summary>

The net consists of two rectangles each of $4 \cdot 3 = 12\,\text{cm}^2$, $4 \cdot 2 = 8\,\text{cm}^2$ and $3 \cdot 2 = 6\,\text{cm}^2$:

$$O = 2 \cdot (12 + 8 + 6)\,\text{cm}^2 = 52\,\text{cm}^2$$

</details>

### Task 4: Pyramid

A square pyramid has the base edge $a = 3\,\text{cm}$; the side triangles have the height $h_a = 4\,\text{cm}$. Find the surface area. [Load task](?body=pyramide&a=3&ha=4&areas=0&_hide=1)

<details>
<summary>Show solution</summary>

$O = a^2 + 4 \cdot \tfrac{1}{2} \cdot a \cdot h_a = 9\,\text{cm}^2 + 4 \cdot 6\,\text{cm}^2 = 33\,\text{cm}^2$.

</details>

### Task 5: The lateral surface of a cylinder

A cylinder has the radius $r = 1.5\,\text{cm}$ and the height $h = 4\,\text{cm}$. How long is the rectangle of the lateral surface? Find the lateral surface and the surface area. [Load task](?body=zylinder&r=1.5&h=4&areas=0&_hide=1)

<details>
<summary>Show solution</summary>

The length is the circumference $u = 2\pi r = 3\pi\,\text{cm} \approx 9.42\,\text{cm}$.

$M = u \cdot h \approx 9.42\,\text{cm} \cdot 4\,\text{cm} \approx 37.70\,\text{cm}^2$, $\quad G = \pi r^2 \approx 7.07\,\text{cm}^2$

$O = 2 \cdot G + M \approx 14.14\,\text{cm}^2 + 37.70\,\text{cm}^2 \approx 51.84\,\text{cm}^2$

</details>

### Task 6: Thinking backwards

A cube has a surface area of $150\,\text{cm}^2$. How long is one edge?

<details>
<summary>Show solution</summary>

One face has $150\,\text{cm}^2 : 6 = 25\,\text{cm}^2$, so $a = 5\,\text{cm}$, because $5 \cdot 5 = 25$. [Cube with a = 5 cm](?a=5&f=100)

</details>

## Ideas for the classroom

- **Use:** Bavaria grade 5 (learning area 4.2: surface area of cuboids, cube and cuboid nets), grade 6 (learning area 2.1: surface area of simple solids) and grade 8 (learning area 7: net and surface area of prism and cylinder). The pyramid and cylinder are also suitable as an outlook.
- **Spatial reasoning first:** Before folding, you can collect predictions (e.g. with results hidden via “Share”). The areas and dimensions shown can be switched off.
- **Common stumbling blocks:**
  - “Every net of six squares is a cube net.” – Nets 3, 7, 10 and 13 show the opposite.
  - Opposite faces are looked for next to each other in the net.
  - For the cylinder, the diameter instead of the circumference is taken as the length of the rectangle.
  - For the pyramid, the height $h_a$ of the side triangles and the height $h$ of the solid are confused; $h = \sqrt{h_a^2 - \left(\tfrac{a}{2}\right)^2}$ (Pythagorean theorem, from grade 9). For the pyramid to close, $h_a > \tfrac{a}{2}$ is needed; the simulation requires $h_a \ge \tfrac{a}{2} + 0.5\,\text{cm}$ and adjusts $h_a$ otherwise.
- **About the display:** The cylinder's lateral surface is rolled up from 61 thin strips, and the circles are 61-gons with the same circumference; the difference from a true circle is less than one per mille. The prism has an equilateral triangle as its base.
