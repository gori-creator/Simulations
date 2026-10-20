---
description: "Two lines, a line and a plane or two planes in a rotatable 3D picture: a decision tree leads to identical, parallel, intersecting or skew – with points and lines of intersection, angles, distances and an animated perpendicular from a point to a plane."
---

## What is it about?

Lines are written in parametric form $g\colon \vec x = \vec a + t \cdot \vec u$, planes in coordinate form $E\colon n_1x_1 + n_2x_2 + n_3x_3 = c$ with the normal vector $\vec n$.

**Two lines:** if the directions are parallel, the lines are **identical** or **parallel**; otherwise they either **intersect** (the system $\vec a + t\vec u = \vec b + s\vec v$ has a solution) or are **skew**. The angle between lines satisfies $\cos\varphi = \frac{|\vec u \cdot \vec v|}{|\vec u||\vec v|}$; skew lines have the distance $d = \frac{|(\vec b - \vec a)\cdot(\vec u \times \vec v)|}{|\vec u \times \vec v|}$.

**Line and plane:** if $\vec n \cdot \vec u = 0$ the line lies in $E$ or is parallel to it; otherwise there is one point of intersection, and $\sin\varphi = \frac{|\vec n \cdot \vec u|}{|\vec n||\vec u|}$.

**Two planes** are parallel (or identical) when their normals are parallel; otherwise they meet in a line with direction $\vec n \times \vec m$.

**Distance point – plane (Hesse normal form):** $d(P; E) = \frac{|n_1p_1 + n_2p_2 + n_3p_3 - c|}{|\vec n|}$. The foot $F$ lies on the perpendicular $\vec x = \vec p + t\vec n$; going the same distance again gives the mirror point $P'$.

## Try it

1. Play the animation for the skew lines and watch the path light up in the decision tree. Then use “View along g”. [Load example](?mode=ll)
2. Drag the tip of $\vec v$ until $h$ meets $g$.
3. Nearly parallel lines meet far away at a very small angle. [Small angle](?a1=0&a2=0&a3=0&u1=6&u2=0&u3=0&b1=0&b2=1&b3=0&v1=6&v2=0.5&v3=0)
4. View two intersecting planes along their line of intersection: the angle appears in true size. [Line of intersection](?mode=pp)
5. Drop the perpendicular, switch on the mirror point and drag $P$ into the plane. [Distance](?mode=pd&mir=1)

## Tasks

### Task 1: Intersecting lines

Find the point and angle of intersection of $g\colon \vec x = (1, 0, 0) + t(1, 1, 0)$ and $h\colon \vec x = (0, 1, 0) + s(1, -1, 0)$. [Load task](?a1=1&a2=0&a3=0&u1=1&u2=1&u3=0&b1=0&b2=1&b3=0&v1=1&v2=-1&v3=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 + t = s$, $t = 1 - s$ give $t = 0$, $s = 1$, so $S(1, 0, 0)$. Since $\vec u \cdot \vec v = 0$, the angle is $90°$. [Show in the simulation](?a1=1&a2=0&a3=0&u1=1&u2=1&u3=0&b1=0&b2=1&b3=0&v1=1&v2=-1&v3=0)

</details>

### Task 2: Point of intersection with a plane

Intersect $g\colon \vec x = (0, 0, 5) + t(1, 1, -1)$ with $E\colon x_1 + x_2 + x_3 = 2$. [Load task](?mode=lp&a1=0&a2=0&a3=5&u1=1&u2=1&u3=-1&n1=1&n2=1&n3=1&c=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$5 + t = 2$, so $t = -3$ and $D(-3, -3, 8)$; $\sin\varphi = \frac13$, $\varphi \approx 19.5°$. [Show in the simulation](?mode=lp&a1=0&a2=0&a3=5&u1=1&u2=1&u3=-1&n1=1&n2=1&n3=1&c=2)

</details>

### Task 3: Distance point – plane

Find $d(P; E)$, the foot $F$ and the mirror point for $P(1, 2, 3)$ and $E\colon 2x_1 - x_2 + 2x_3 = 3$. [Load task](?mode=pd&mir=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$d = \frac{|2 - 2 + 6 - 3|}{3} = 1$, $t = -\frac13$, $F\left(\frac13, \frac73, \frac73\right)$, $P'\left(-\frac13, \frac83, \frac53\right)$. [Show in the simulation](?mode=pd&mir=1)

</details>

### Task 4: Parallel planes

Find the distance between $x_1 + x_2 + x_3 = 1$ and $x_1 + x_2 + x_3 = 4$. [Load task](?mode=pp&n1=1&n2=1&n3=1&c=1&m1=1&m2=1&m3=1&k=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$d = \frac{3}{\sqrt 3} = \sqrt 3 \approx 1.73$. [Show in the simulation](?mode=pp&n1=1&n2=1&n3=1&c=1&m1=1&m2=1&m3=1&k=4)

</details>

## Ideas for the classroom

- Let students predict the path through the decision tree before playing the animation; each question is one step of the calculation.
- The edge-on views show why distances and angles appear in true size when looking parallel to a plane.
- **Common stumbling blocks:**
  - Skew lines look as if they cross in the oblique picture – rotating the view helps.
  - Using cosine instead of sine for the angle between a line and a plane.
  - Using the same parameter name for both lines.
  - Forgetting the absolute value or the division by $|\vec n|$ in the Hesse normal form.
