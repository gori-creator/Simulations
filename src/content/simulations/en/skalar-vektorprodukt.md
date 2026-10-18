---
description: "Two vectors in space: angle and projection from the dot product, perpendicular when a · b = 0; the cross product grows as a normal vector out of the parallelogram, the triple product gives the volume of the parallelepiped."
---

## What is it about?

The **dot product** $\vec a \cdot \vec b = a_1b_1 + a_2b_2 + a_3b_3$ is a number. Since $\vec a \cdot \vec b = |\vec a|\,|\vec b| \cos\varphi$, it gives the angle between the vectors; $\vec a \cdot \vec b = 0$ means perpendicular. $\frac{\vec a \cdot \vec b}{|\vec a|}$ is the length of the projection of $\vec b$ onto $\vec a$.

The **cross product** $\vec a \times \vec b = (a_2b_3 - a_3b_2,\ a_3b_1 - a_1b_3,\ a_1b_2 - a_2b_1)^T$ is a vector perpendicular to $\vec a$ and $\vec b$ (right-hand rule). Its length is the area of the parallelogram; the triangle has half of it. $\vec b \times \vec a = -(\vec a \times \vec b)$.

The **triple product** $(\vec a \times \vec b) \cdot \vec c$ gives the volume of the parallelepiped; the pyramid has one sixth of it.

## Try it

1. Drag $\vec b$ until the angle is $90°$. [Load example](?b1=-2&b2=1&b3=2)
2. Switch to the cross product, rotate the view and swap $\vec a$ and $\vec b$. [Cross product](?mode=cross)
3. Drag $\vec c$ into the plane of $\vec a$ and $\vec b$. [Triple product](?mode=spat)

## Tasks

### Task 1: Angle

Find the angle between $(1, 2, 0)^T$ and $(-2, -1, 2)^T$. [Load task](?b1=-2&b2=-1&b3=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec a \cdot \vec b = -4$, $\cos\varphi = \frac{-4}{3\sqrt5} \approx -0.596$, $\varphi \approx 126.6°$. [Show in simulation](?b1=-2&b2=-1&b3=2)

</details>

### Task 2: Area

Compute $(1, 2, 0)^T \times (0, 1, 2)^T$ and the area of the triangle. [Load task](?mode=cross&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$(4, -2, 1)^T$, triangle area $\frac12\sqrt{21} \approx 2.29$. [Show in simulation](?mode=cross&tri=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Searching for pairs with $\vec a \cdot \vec b = 0$ before introducing the angle formula can work well.
- **Common stumbling blocks:** writing the dot product as a vector; sign errors in the middle component of the cross product (check with $(\vec a \times \vec b) \cdot \vec a = 0$); forgetting $\frac12$ or $\frac16$.
