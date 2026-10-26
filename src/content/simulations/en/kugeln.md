---
description: "A glass sphere in space: equation of the sphere and point test, circle of intersection with a plane, a line that misses the sphere, tangent or secant via the discriminant, and the tangent plane at a point on the sphere – rotatable, with the calculation alongside."
---

## What is it about?

A **sphere** $K$ with centre $M$ and radius $r$ consists of all points $X$ at distance $r$ from $M$:

$$
K:\ (\vec x - \vec m)^2 = r^2 \qquad\Longleftrightarrow\qquad (x_1 - m_1)^2 + (x_2 - m_2)^2 + (x_3 - m_3)^2 = r^2
$$

**Point test:** substitute a point and compare with $r^2$ (less: inside, equal: on, greater: outside).

**Sphere and plane:** compare the distance $d = \frac{|\vec n \cdot \vec m - c|}{|\vec n|}$ of the centre from $E:\ \vec n \cdot \vec x = c$ with $r$. For $d < r$ the plane cuts a circle with centre $M'$ (foot of the perpendicular from $M$) and radius $\rho = \sqrt{r^2 - d^2}$; for $d = r$ it touches the sphere.

**Sphere and line:** substituting $\vec x = \vec a + t\vec u$ gives $At^2 + Bt + C = 0$. The discriminant $D = B^2 - 4AC$ decides: secant ($D > 0$), tangent ($D = 0$) or a line that misses the sphere ($D < 0$, no common point).

**Tangent plane** at $B$ on the sphere: $(\vec x - \vec b) \cdot (\vec b - \vec m) = 0$.

## Try it

1. Drag $P$ and watch the point test. [Point on K](?p1=1&p2=2&p3=6)
2. Choose “Sphere and plane” and tap **Slide the plane through the sphere**. [Load](?mode=plane)
3. Put the plane through the centre: a great circle with $\rho = r$. [Great circle](?mode=plane&n1=1&n2=1&n3=1&c=6)
4. Move a vertical line outwards: secant, tangent, line missing the sphere. [Tangent](?mode=line&a1=4&a2=2&a3=0&u1=0&u2=0&u3=1) · [Line missing the sphere](?mode=line&a1=5&a2=2&a3=0&u1=0&u2=0&u3=1)
5. Drag $B$ over the sphere and watch the tangent plane. [Tangent plane](?mode=tangent)

## Tasks

### Task 1: Circle of intersection

$K$: $M(1, 2, 3)$, $r = 3$. Find the centre and radius of the circle in which $x_3 = 5$ cuts $K$. [Load task](?mode=plane&n1=0&n2=0&n3=1&c=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$d = 2 < 3$, $M'(1, 2, 5)$, $\rho = \sqrt{9 - 4} = \sqrt 5 \approx 2.24$. [Show](?mode=plane&n1=0&n2=0&n3=1&c=5)

</details>

### Task 2: Line and sphere

Find the common points of $K$ and $\vec x = (1, 2, -5) + t\,(0, 0, 1)$. [Load task](?mode=line&a1=1&a2=2&a3=-5&u1=0&u2=0&u3=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$(t - 8)^2 = 9$, i.e. $t^2 - 16t + 55 = 0$, $D = 36$, $t = 5$ or $t = 11$: $S_1(1, 2, 0)$, $S_2(1, 2, 6)$. [Show](?mode=line&a1=1&a2=2&a3=-5&u1=0&u2=0&u3=1)

</details>

### Task 3: Tangent plane

Find the tangent plane to $K$ at $B(3, 4, 4)$. [Load task](?mode=tangent&b1=3&b2=4&b3=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\overrightarrow{MB} = (2, 2, 1)$, so $2x_1 + 2x_2 + x_3 = 6 + 8 + 4 = 18$. [Show](?mode=tangent&b1=3&b2=4&b3=4)

</details>

## Ideas for the classroom

- The equation of a sphere is the distance formula $|\overrightarrow{MX}| = r$ – just like the equation of a circle in the plane.
- Before sliding the plane, students can predict how $\rho$ depends on $d$.
- **Common stumbling blocks:** wrong signs in $(x_k - m_k)^2$; comparing with $r$ instead of $r^2$; using $r - d$ instead of $\sqrt{r^2 - d^2}$; forgetting to divide by $|\vec n|$; using $\vec b$ instead of $\vec b - \vec m$ as the normal vector.
