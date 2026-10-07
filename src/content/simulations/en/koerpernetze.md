---
description: Interactive 3D simulation of nets – fold a cube, cuboid, prism, pyramid and cylinder, test cube nets and find the surface area from the net.
---

## What is it about?

Cut a solid along some of its edges and lay it out flat: you get a **net**. Folding the net gives the solid back. The **surface area** $O$ is the sum of the areas of all faces, so it can be read straight off the net:

| Solid | Faces in the net | Surface area |
| --- | --- | --- |
| Cube (edge $a$) | 6 equal squares | $O = 6a^2$ |
| Cuboid ($a$, $b$, $c$) | 3 pairs of equal rectangles | $O = 2(ab + ac + bc)$ |
| Square pyramid | square and 4 isosceles triangles | $O = a^2 + 4 \cdot \tfrac{1}{2} a h_a$ |
| Cylinder ($r$, $h$) | 2 circles and a rectangle | $O = 2\pi r^2 + 2\pi r h$ |

The lateral surface of a cylinder is a rectangle whose length equals the **circumference** $2\pi r$. There are exactly **11** different cube nets; opposite faces of a cube are never next to each other in a net.

## Try it

1. Press **Fold** and rotate the view by dragging.
2. Is net no. 3 a cube net? Think first, then fold. [Load net no. 3](?net=3&pairs=0)
3. Turn on **Colour opposite faces alike** and step through the nets.
4. Roll up the cylinder slowly with the **Folding** slider. [Half-rolled cylinder](?body=zylinder&f=55)

## Tasks

### Task 1: Cube net or not?

Which of the 15 nets fold into a cube? [Load task](?pairs=0&areas=0&_hide=1)

<details>
<summary>Show solution</summary>

All except nos. 3, 7, 10 and 13 – these have two faces landing on the same side of the cube, so another side stays open.

</details>

### Task 2: Surface area of a cuboid

Find the surface area of a cuboid measuring $4\,\text{cm} \times 3\,\text{cm} \times 2\,\text{cm}$. [Load task](?body=quader&a=4&b=3&c=2&areas=0&_hide=1)

<details>
<summary>Show solution</summary>

$O = 2 \cdot (12 + 8 + 6)\,\text{cm}^2 = 52\,\text{cm}^2$.

</details>

### Task 3: Cylinder

A cylinder has $r = 1.5\,\text{cm}$ and $h = 4\,\text{cm}$. How long is the rectangle of its net, and what is the surface area? [Load task](?body=zylinder&r=1.5&h=4&areas=0&_hide=1)

<details>
<summary>Show solution</summary>

Length $2\pi r \approx 9.42\,\text{cm}$; $O = 2\pi r^2 + 2\pi r h \approx 14.14\,\text{cm}^2 + 37.70\,\text{cm}^2 \approx 51.84\,\text{cm}^2$.

</details>

## Notes for teachers

- Suitable for grades 5–8: cuboids and cube nets first, prisms and cylinders later. Ask for predictions before folding; areas and dimensions can be switched off.
- **Misconceptions:** every arrangement of six squares is a cube net; the cylinder's rectangle has the diameter as its length; the slant height $h_a$ of a pyramid is confused with its height.
- The cylinder's lateral surface is rolled up from 61 thin strips; the circles are 61-gons with the same circumference.
