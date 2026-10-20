---
description: "Lines and planes in space: a point moves along the line x = a + t · u, trace points and point test; planes in parametric form, converted to normal and coordinate form with normal vector, trace points and trace triangle."
---

## What is it about?

A **line** in space is given by a point $A$ and a direction. In **parametric form**: $g\colon \vec x = \vec a + t \cdot \vec u$, where $\vec a$ is the position vector of $A$ and $\vec u \ne \vec o$ the **direction vector**. Every value of $t$ gives exactly one point $X$. For $\vec a = (1, 2, 3)^T$, $\vec u = (2, -1, 1)^T$ and $t = 2$ you get $X(5, 0, 5)$.

- **Trace points** are where the line pierces a coordinate plane, e.g. $x_3 = 0$ gives $t = -3$ and $S_{12}(-5, 5, 0)$. If a component of $\vec u$ is zero, the line is parallel to that coordinate plane.
- **Point test:** $P$ lies on $g$ if all three rows of $\vec p = \vec a + t \vec u$ give the **same** $t$.
- A **plane** needs two non-parallel spanning vectors: $E\colon \vec x = \vec a + r \vec u + s \vec v$.
- The **normal vector** $\vec n = \vec u \times \vec v$ is perpendicular to the plane. Normal form $\vec n \cdot (\vec x - \vec a) = 0$, coordinate form $n_1x_1 + n_2x_2 + n_3x_3 = d$ with $d = \vec n \cdot \vec a$.
- Example: $2x_1 + 3x_2 + 6x_3 = 12$ has the intercepts $S_1(6, 0, 0)$, $S_2(0, 4, 0)$, $S_3(0, 0, 2)$ – the **trace triangle**.

## Try it

1. Drag $X$ along the line or move the slider $t$. Watch the arrow chain $\vec a + t \vec u$. [Load example](?mode=line&t=1.5)
2. Make $\vec u$ parallel to the $x_3$ axis. How many trace points are left? [Parallel to the x₃ axis](?mode=line&a1=2&a2=3&a3=1&u1=0&u2=0&u3=1&t=1.5)
3. Press “Convert” and follow the four steps to the trace triangle. [Convert](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1)
4. Make $\vec v$ a multiple of $\vec u$. [u and v parallel](?mode=param&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=1.5&v2=-1&v3=0)

## Tasks

### Task 1: Point test

Does $R(7, -1, 6)$ lie on $g\colon \vec x = (1, 2, 3)^T + t \cdot (2, -1, 1)^T$? [Load task](?mode=line&probe=1&q1=7&q2=-1&q3=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 + 2t = 7$, $2 - t = -1$, $3 + t = 6$ all give $t = 3$, so $R \in g$. [Show in simulation](?mode=line&probe=1&q1=7&q2=-1&q3=6&t=3)

</details>

### Task 2: Coordinate form

Find a coordinate form and the intercepts of $E\colon \vec x = (1, 0, 0)^T + r \cdot (-1, 1, 0)^T + s \cdot (-1, 0, 1)^T$. [Load task](?mode=normal&a1=1&a2=0&a3=0&u1=-1&u2=1&u3=0&v1=-1&v2=0&v3=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec n = \vec u \times \vec v = (1, 1, 1)^T$, $d = 1$: $x_1 + x_2 + x_3 = 1$ with $S_1(1, 0, 0)$, $S_2(0, 1, 0)$, $S_3(0, 0, 1)$. [Show in simulation](?mode=normal&a1=1&a2=0&a3=0&u1=-1&u2=1&u3=0&v1=-1&v2=0&v3=1)

</details>

### Task 3: Trace triangle

Find the area of the trace triangle of $2x_1 + 3x_2 + 6x_3 = 12$.

<details>
<summary>Show solution</summary>

$\overrightarrow{S_1S_2} \times \overrightarrow{S_1S_3} = (-6, 4, 0)^T \times (-6, 0, 2)^T = (8, 12, 24)^T$ with length $28$, so the area is $14$. [Show in simulation](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- **Use:** upper secondary analytic geometry (grade 12/13), introducing parametric forms or practising intercepts.
- **Parameter as time:** $X$ travels through space with velocity $\vec u$ – this explains why $t$ may be negative.
- **Common stumbling blocks:**
  - Checking only two rows in the point test – all three must give the same $t$.
  - Losing a sign in the middle component of the cross product; the check $\vec n \cdot \vec u = 0$ reveals it.
  - Confusing trace points of a line (with coordinate planes) and of a plane (with the axes).
