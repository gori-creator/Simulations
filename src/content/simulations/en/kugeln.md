---
description: "A glass sphere in space: equation of the sphere and point test, circle of intersection with a plane, a line that misses the sphere, tangent or secant via the discriminant, and the tangent plane at a point on the sphere – rotatable, with the calculation alongside."
---

## What is it about?

A **sphere** $K$ with centre $M$ and radius $r$ consists of all points $X$ at distance $r$ from $M$: $|\overrightarrow{MX}| = r$. Squaring gives the **equation of the sphere** in vector and in coordinate form:

$$
K:\ (\vec x - \vec m)^2 = r^2 \qquad\Longleftrightarrow\qquad (x_1 - m_1)^2 + (x_2 - m_2)^2 + (x_3 - m_3)^2 = r^2
$$

For $M(1, 2, 3)$ and $r = 3$ it reads $(x_1 - 1)^2 + (x_2 - 2)^2 + (x_3 - 3)^2 = 9$.

**Point test:** substitute a point $P$ into the left-hand side and compare with $r^2$. Smaller means inside, equal means on the sphere, larger means outside. Example: $P(1, 7, 3)$ gives $0 + 25 + 0 = 25 > 9$, so $P$ lies outside.

**Sphere and plane:** what matters is the distance $d$ of the centre from the plane $E:\ n_1x_1 + n_2x_2 + n_3x_3 = c$ (Hesse normal form):

$$
d = \frac{|\vec n \cdot \vec m - c|}{|\vec n|}
$$

- $d > r$: no common point,
- $d = r$: $E$ touches $K$ at exactly one point (tangent plane),
- $d < r$: $E$ cuts $K$ in a **circle of intersection**. Its centre $M'$ is the foot of the perpendicular from $M$ to $E$; its radius follows from Pythagoras’ theorem: $\rho = \sqrt{r^2 - d^2}$. If $E$ passes through $M$, the circle of intersection is a **great circle** with $\rho = r$.

**Sphere and line:** substitute $g:\ \vec x = \vec a + t \cdot \vec u$ into the equation of the sphere to get a quadratic equation $At^2 + Bt + C = 0$. Its discriminant $D = B^2 - 4AC$ decides: $D > 0$ **secant** (two points of intersection), $D = 0$ **tangent** (one point of contact), $D < 0$ the line **misses** the sphere (no common point).

**Tangent plane:** at a point $B$ on the sphere, the tangent plane is perpendicular to the radius $\overrightarrow{MB}$. So this vector is a normal vector:

$$
T:\ (\vec x - \vec b) \cdot (\vec b - \vec m) = 0
$$

## Try it

1. Drag the point $P$ through space and watch the point test in the panel. When does “$>$” turn into “$=$”? [Point on K](?p1=1&p2=2&p3=6)
2. Drag the centre $M$ and the radius (handle at the bottom right of the sphere). How does the coordinate form change?
3. Choose “Sphere and plane” and tap **Slide the plane through the sphere**. The circle of intersection grows into a great circle and shrinks back to a point. [Load plane](?mode=plane)
4. Put the plane through the centre. How large is $\rho$? [Great circle](?mode=plane&n1=1&n2=1&n3=1&c=6)
5. In “Sphere and line”, move the line parallel to $x_3$ further and further outwards: secant, tangent, missing line. Watch the sign of $D$. [Tangent](?mode=line&a1=4&a2=2&a3=0&u1=0&u2=0&u3=1) · [Missing line](?mode=line&a1=5&a2=2&a3=0&u1=0&u2=0&u3=1)
6. In “Tangent plane”, drag the point $B$ over the sphere. The right angle between $\overrightarrow{MB}$ and the plane is always kept. [Tangent plane](?mode=tangent)
7. Start **Fly around**: only from all sides can you see that the circle of intersection really lies in the plane.

## Exercises

### Exercise 1: Point test

Given the sphere $K$ with $M(1, 2, 3)$ and $r = 3$. First set up the equation of the sphere yourself (the simulation shows it as a check), then test whether $P(1, 2, 6)$, $Q(2, 2, 3)$ and $R(5, 2, 3)$ lie inside, on or outside $K$. [Load exercise](?p1=1&p2=2&p3=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$K:\ (x_1 - 1)^2 + (x_2 - 2)^2 + (x_3 - 3)^2 = 9$.
$P$: $0 + 0 + 9 = 9$, so on $K$. $Q$: $1 + 0 + 0 = 1 < 9$, inside. $R$: $16 + 0 + 0 = 16 > 9$, outside. [Show P](?p1=1&p2=2&p3=6) · [Show Q](?p1=2&p2=2&p3=3) · [Show R](?p1=5&p2=2&p3=3)

</details>

### Exercise 2: Circle of intersection

The plane $E:\ x_3 = 5$ cuts $K$. Calculate the centre and radius of the circle of intersection. [Load exercise](?mode=plane&n1=0&n2=0&n3=1&c=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$d = |3 - 5| = 2 < 3$, so there is a circle of intersection. The foot of the perpendicular lies vertically above $M$: $M'(1, 2, 5)$. Radius $\rho = \sqrt{9 - 4} = \sqrt 5 \approx 2.24$. [Show in the simulation](?mode=plane&n1=0&n2=0&n3=1&c=5)

</details>

### Exercise 3: Touching planes

For which values of $c$ does the plane $x_3 = c$ touch the sphere $K$? Give the points of contact. [Load exercise](?mode=plane&n1=0&n2=0&n3=1&c=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Touching means $d = |3 - c| = 3$, so $c = 6$ or $c = 0$. Points of contact $(1, 2, 6)$ and $(1, 2, 0)$ – the “north pole” and the “south pole” of the sphere. [c = 6](?mode=plane&n1=0&n2=0&n3=1&c=6) · [c = 0](?mode=plane&n1=0&n2=0&n3=1&c=0)

</details>

### Exercise 4: A line through the sphere

Find the common points of $K$ and $g:\ \vec x = \begin{pmatrix} 1 \\ 2 \\ -5 \end{pmatrix} + t \cdot \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}$. [Load exercise](?mode=line&a1=1&a2=2&a3=-5&u1=0&u2=0&u3=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Substituting: $0^2 + 0^2 + (-5 + t - 3)^2 = 9$, so $(t - 8)^2 = 9$, i.e. $t^2 - 16t + 55 = 0$. $D = 256 - 220 = 36 > 0$: secant. $t_1 = 5$, $t_2 = 11$, points of intersection $S_1(1, 2, 0)$ and $S_2(1, 2, 6)$. [Show in the simulation](?mode=line&a1=1&a2=2&a3=-5&u1=0&u2=0&u3=1)

</details>

### Exercise 5: Tangent plane

Show that $B(3, 4, 4)$ lies on $K$ and find the tangent plane at $B$ in coordinate form. [Load exercise](?mode=tangent&b1=3&b2=4&b3=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Point test: $4 + 4 + 1 = 9$ ✓. Normal vector $\overrightarrow{MB} = \begin{pmatrix} 2 \\ 2 \\ 1 \end{pmatrix}$, so $2x_1 + 2x_2 + x_3 = c$ with $c = 2 \cdot 3 + 2 \cdot 4 + 4 = 18$: $T:\ 2x_1 + 2x_2 + x_3 = 18$. [Show in the simulation](?mode=tangent&b1=3&b2=4&b3=4)

</details>

### Exercise 6: A slanted plane

Investigate the position of $E:\ 2x_1 - x_2 + 2x_3 = 12$ relative to the sphere $K$ and, if there is one, calculate the centre and radius of the circle of intersection. [Load exercise](?mode=plane&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$d = \frac{|2 - 2 + 6 - 12|}{\sqrt{4 + 1 + 4}} = \frac{6}{3} = 2 < 3$: circle of intersection with $\rho = \sqrt 5$. Substitute the perpendicular line $\vec x = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + s \begin{pmatrix} 2 \\ -1 \\ 2 \end{pmatrix}$ into $E$: $6 + 9s = 12$, $s = \tfrac23$, so $M'\left(\tfrac73, \tfrac43, \tfrac{13}3\right)$. [Show in the simulation](?mode=plane)

</details>

## Ideas for the classroom

- **Use:** upper secondary, analytic geometry: the sphere with its equation, its position relative to planes and lines, and the tangent plane – scope and weighting differ between curricula. Suitable as an introduction (the sphere as a set of points) and for practice.
- **Link to what is known:** the equation of the sphere is the spatial distance $|\overrightarrow{MX}|$ – like the equation of a circle in the plane. The circle of intersection takes up the distance between a point and a plane and Pythagoras’ theorem.
- **Animation as a discussion starter:** while the plane slides through, the class can guess beforehand how $\rho$ depends on $d$ (not a linear relationship but a quarter circle).
- **Common pitfalls:**
  - Signs in the equation of the sphere are mixed up: $M(1, -2, 3)$ gives $(x_2 + 2)^2$.
  - The right-hand side is $r^2$, not $r$ – the point test compares with $r^2$.
  - The radius of the circle of intersection is given as $r$ or $r - d$ instead of $\sqrt{r^2 - d^2}$.
  - For the distance between point and plane, dividing by $|\vec n|$ is forgotten.
  - For the tangent plane, $\vec b$ is taken as the normal vector instead of $\vec b - \vec m$.
