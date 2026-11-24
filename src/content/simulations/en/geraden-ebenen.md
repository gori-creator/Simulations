---
description: "Lines and planes in space: a point moves along the line x = a + t · u, trace points and point test; planes in parametric form, converted to normal and coordinate form with normal vector, trace points and trace triangle."
---

## What is it about?

A **line** in space is determined by a point $A$ and a direction. In **parametric form**:

$$
g\colon\ \vec x = \vec a + t \cdot \vec u, \qquad t \in \mathbb R .
$$

Here $\vec a$ is the **position vector** of $A$ (support vector) and $\vec u \ne \vec o$ is the **direction vector**. Every value of $t$ gives exactly one point $X$ of the line: you go from the origin to $A$ and then $t$ times the arrow $\vec u$ further. For $g\colon \vec x = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + t \cdot \begin{pmatrix} 2 \\ -1 \\ 1 \end{pmatrix}$ and $t = 2$ you get $X(5, 0, 5)$.

**Trace points** are the points where the line pierces a coordinate plane. For the $x_1x_2$ plane you set $x_3 = 0$: $3 + t = 0$, so $t = -3$ and $S_{12}(-5, 5, 0)$. Likewise $S_{23}(0, 2.5, 2.5)$ ($t = -0.5$) and $S_{13}(5, 0, 5)$ ($t = 2$). If, say, $u_3 = 0$, then $g$ runs parallel to the $x_1x_2$ plane or lies in it. Then there is no trace point in that plane (or $g$ lies completely in it).

**Point test:** $P$ lies on $g$ if the equation $\vec p = \vec a + t \cdot \vec u$ has a solution – that is, if all three rows give **the same** $t$. For $P(5, 0, 5)$: $t = 2$, $t = 2$, $t = 2$ ✓. For $Q(3, 1, 5)$: $t = 1$, $t = 1$, $t = 2$ – so $Q \notin g$.

A **plane** needs two directions, the **spanning vectors** $\vec u$ and $\vec v$ (not parallel):

$$
E\colon\ \vec x = \vec a + r \cdot \vec u + s \cdot \vec v .
$$

The **normal vector** $\vec n = \vec u \times \vec v$ is perpendicular to both spanning vectors and therefore to the plane. From it you get the **normal form** $\vec n \cdot (\vec x - \vec a) = 0$ and, by multiplying out, the **coordinate form**

$$
n_1 x_1 + n_2 x_2 + n_3 x_3 = d \quad\text{with}\quad d = \vec n \cdot \vec a .
$$

Example: $A(6, 0, 0)$, $\vec u = \begin{pmatrix} -3 \\ 2 \\ 0 \end{pmatrix}$, $\vec v = \begin{pmatrix} -3 \\ 0 \\ 1 \end{pmatrix}$ gives $\vec n = \begin{pmatrix} 2 \\ 3 \\ 6 \end{pmatrix}$, $d = 12$ and $E\colon 2x_1 + 3x_2 + 6x_3 = 12$. You read off the **trace points** (intercepts) by setting two coordinates to zero: $S_1(6, 0, 0)$, $S_2(0, 4, 0)$, $S_3(0, 0, 2)$. They form the **trace triangle**; its sides lie on the **trace lines**.

## Try it

1. Drag the point $X$ along the line or move the slider $t$. Watch the arrow chain $\vec a + t \cdot \vec u$. What happens for negative $t$? [Load example](?mode=line&t=1.5)
2. Set $t = -3$. What special point is $X$ now? [t = −3](?mode=line&t=-3)
3. Make $\vec u$ parallel to the $x_3$ axis. How many trace points are left? Rotate the view. [Line parallel to the x₃ axis](?mode=line&a1=2&a2=3&a3=1&u1=0&u2=0&u3=1&t=1.5)
4. Switch on the point test and drag $P$ onto the line. When do the three $t$ values agree? [Point test](?mode=line&probe=1&q1=3&q2=1&q3=5)
5. Plane in parametric form: drag $X$ in the plane. For which $r$ and $s$ does $X$ land on the $x_2$ axis? [Load plane](?mode=param&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&r=0.5&s=0.5)
6. Make $\vec v$ a multiple of $\vec u$. What happens? [u and v parallel](?mode=param&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=1.5&v2=-1&v3=0)
7. Start “Convert” and follow the four steps to the trace triangle. Rotate the view so that you look at the edge of the plane: the normal vector is perpendicular to it. [Convert](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1)
8. Here $\vec u \times \vec v$ gives a “large” normal vector. It may be simplified – why? [Simplify the normal vector](?mode=normal&a1=3&a2=0&a3=0&u1=-3&u2=3&u3=0&v1=-3&v2=0&v3=3)
9. A plane with only one trace point: [Plane parallel to the x₁x₂ plane](?mode=normal&a1=0&a2=0&a3=3&u1=2&u2=0&u3=0&v1=0&v2=2&v3=0)

## Exercises

### Exercise 1: Points on the line

Given $g\colon \vec x = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + t \cdot \begin{pmatrix} 2 \\ -1 \\ 1 \end{pmatrix}$. Calculate the point for $t = -1$ and check whether $R(7, -1, 6)$ lies on $g$. [Load exercise](?mode=line&probe=1&q1=7&q2=-1&q3=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$t = -1$: $(1 - 2, 2 + 1, 3 - 1) = (-1, 3, 2)$. Point test for $R$: $1 + 2t = 7 \Rightarrow t = 3$; $2 - t = -1 \Rightarrow t = 3$; $3 + t = 6 \Rightarrow t = 3$. All three rows give $t = 3$, so $R \in g$. [Show in the simulation](?mode=line&probe=1&q1=7&q2=-1&q3=6&t=3)

</details>

### Exercise 2: Trace points of a line

Calculate all trace points of $h\colon \vec x = \begin{pmatrix} 2 \\ -1 \\ 4 \end{pmatrix} + t \cdot \begin{pmatrix} 1 \\ 1 \\ -2 \end{pmatrix}$. [Load exercise](?mode=line&a1=2&a2=-1&a3=4&u1=1&u2=1&u3=-2&t=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$x_3 = 0$: $4 - 2t = 0$, $t = 2$, $S_{12}(4, 1, 0)$. $x_1 = 0$: $2 + t = 0$, $t = -2$, $S_{23}(0, -3, 8)$. $x_2 = 0$: $-1 + t = 0$, $t = 1$, $S_{13}(3, 0, 2)$. [Show in the simulation](?mode=line&a1=2&a2=-1&a3=4&u1=1&u2=1&u3=-2&t=2)

</details>

### Exercise 3: From parametric form to coordinate form

Find a coordinate form of $E\colon \vec x = \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} + r \cdot \begin{pmatrix} -1 \\ 1 \\ 0 \end{pmatrix} + s \cdot \begin{pmatrix} -1 \\ 0 \\ 1 \end{pmatrix}$ and its trace points. [Load exercise](?mode=normal&a1=1&a2=0&a3=0&u1=-1&u2=1&u3=0&v1=-1&v2=0&v3=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec n = \vec u \times \vec v = \begin{pmatrix} 1 \cdot 1 - 0 \cdot 0 \\ 0 \cdot (-1) - (-1) \cdot 1 \\ (-1) \cdot 0 - 1 \cdot (-1) \end{pmatrix} = \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix}$, $d = \vec n \cdot \vec a = 1$. So $E\colon x_1 + x_2 + x_3 = 1$ with $S_1(1, 0, 0)$, $S_2(0, 1, 0)$, $S_3(0, 0, 1)$. [Show in the simulation](?mode=normal&a1=1&a2=0&a3=0&u1=-1&u2=1&u3=0&v1=-1&v2=0&v3=1)

</details>

### Exercise 4: Trace triangle

The plane $E\colon 2x_1 + 3x_2 + 6x_3 = 12$ meets the axes at $S_1$, $S_2$, $S_3$. Calculate the trace points and the area of the trace triangle. [Load exercise](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$S_1(6, 0, 0)$, $S_2(0, 4, 0)$, $S_3(0, 0, 2)$. With $\overrightarrow{S_1S_2} = \begin{pmatrix} -6 \\ 4 \\ 0 \end{pmatrix}$ and $\overrightarrow{S_1S_3} = \begin{pmatrix} -6 \\ 0 \\ 2 \end{pmatrix}$, $\overrightarrow{S_1S_2} \times \overrightarrow{S_1S_3} = \begin{pmatrix} 8 \\ 12 \\ 24 \end{pmatrix}$, length $\sqrt{784} = 28$. Area: $\tfrac12 \cdot 28 = 14$. [Show in the simulation](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1)

</details>

### Exercise 5: Point test in the plane

Do $P(3, 0, 1)$ and $Q(5, 0, 5)$ lie in $E\colon 2x_1 + 3x_2 + 6x_3 = 12$? [Load exercise](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&probe=1&q1=5&q2=0&q3=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P$: $2 \cdot 3 + 3 \cdot 0 + 6 \cdot 1 = 12$ ✓, so $P \in E$. $Q$: $2 \cdot 5 + 0 + 6 \cdot 5 = 40 \ne 12$, so $Q \notin E$. [Show P](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&probe=1&q1=3&q2=0&q3=1) · [Show Q](?mode=normal&a1=6&a2=0&a3=0&u1=-3&u2=2&u3=0&v1=-3&v2=0&v3=1&probe=1&q1=5&q2=0&q3=5)

</details>

### Exercise 6: Special position

What trace points does the plane $E\colon x_3 = 3$ have? Give a parametric form and explain why there is no trace triangle.

<details>
<summary>Show solution</summary>

Only $S_3(0, 0, 3)$: for the $x_1$ and $x_2$ axes, $0 = 3$ would have to hold. A parametric form is $\vec x = \begin{pmatrix} 0 \\ 0 \\ 3 \end{pmatrix} + r \cdot \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} + s \cdot \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix}$; $E$ is parallel to the $x_1x_2$ plane. [Show in the simulation](?mode=normal&a1=0&a2=0&a3=3&u1=2&u2=0&u3=0&v1=0&v2=2&v3=0)

</details>

## Ideas for the classroom

- **Use:** upper secondary, analytic geometry: lines and planes in space. As an introduction to the parametric form, for practising trace points or as preparation for relative positions.
- **Parameter as a “timetable”:** the slider $t$ can be read as time – $X$ travels through space at the constant velocity $\vec u$. This helps to understand why $t$ may be negative.
- **Same plane, different equation:** two different parametric forms of the same plane lead to the same coordinate form (up to a factor). This can be tried out directly with the spanning vectors.
- **Drawing the trace triangle:** with the three trace points a plane can quickly be drawn into an oblique sketch – the simulation can serve as a check.
- **Common pitfalls:**
  - In the point test only two rows are checked – what matters is that **all three** give the same $t$.
  - Support point and direction vector are mixed up: $\vec u$ is not a point of the line but a displacement.
  - A sign gets lost in the cross product (middle component!). The check $\vec n \cdot \vec u = 0$ and $\vec n \cdot \vec v = 0$ reveals it.
  - The trace points of a line (with the coordinate **planes**) are confused with the trace points of a plane (with the coordinate **axes**).
