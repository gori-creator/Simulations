---
description: "Vector arrows in space with draggable tips: tip to tail and the parallelogram, opposite vector and difference, multiples, linear combinations in a plane, the connecting vector AB = B − A, finding a linear combination, vector paths in a parallelepiped, length and unit vector, centroid and dividing point, and a random walk of many unit steps – with the calculation in column form."
---

## What is it about?

A **vector** describes a translation; it is written as a column and drawn as an arrow. Arrows of equal length and direction represent the same vector.

- **Addition (tip to tail):** attach $\vec b$ to the tip of $\vec a$; the sum is the diagonal of the **parallelogram**. Components are added.
- **Subtraction:** $\vec a - \vec b = \vec a + (-\vec b)$; the difference also points from the tip of $\vec b$ to the tip of $\vec a$.
- **Scaling:** $k \cdot \vec a$ is parallel to $\vec a$ and $|k|$ times as long; negative $k$ reverses the direction.
- **Linear combination:** all $r \vec a + s \vec b$ lie in one plane (if $\vec a$, $\vec b$ are not parallel).
- **Connecting vector:** $\overrightarrow{AB} = \vec b - \vec a$ (“tip minus tail”), midpoint $M = \frac12(A + B)$, length $\sqrt{v_1^2 + v_2^2 + v_3^2}$, e.g. $|(2, 3, 6)| = 7$.
- **Find a linear combination:** set $r$, $s$ (or drag the tip in the plane) so that $r \vec a + s \vec b = \vec c$. If $\vec c$ is not in the plane, it is impossible.
- **Parallelepiped:** $\vec a$, $\vec b$, $\vec c$ span it; every corner is a sum of edges, e.g. $\vec a + \vec b + \vec c$. If the three vectors are coplanar, it is flat.
- **Unit vector:** $\vec v^{\,0} = \vec v / |\vec v|$, e.g. $(1, 2, 2)^T$ has length $3$ and $\vec v^{\,0} = (\frac13, \frac23, \frac23)^T$.
- **Centroid:** $S = \frac13(A + B + C)$ divides every median $2 : 1$; $T = A + t \cdot \overrightarrow{AB}$ divides $[AB]$ in the ratio $t : (1 - t)$.
- **Random walk:** the sum of $n$ random unit steps does not depend on their order; on average $|\vec s|^2 = n$.

## Try it

1. Play the animation and drag the tips of $\vec a$ and $\vec b$. [Load example](?op=add)
2. Set $k$ to $-1.5$. What happens to direction and length? [Scaling](?op=scale&k=-1.5)
3. Rotate the view until you look along the plane of the linear combinations. [Linear combination](?op=lin&r=1.5&s=0.5)
4. Hit the target $\vec c$. [Find](?op=goal&c1=3&c2=3&c3=3&r=0.5&s=0.5)
5. Tap corners of the parallelepiped. [Parallelepiped](?op=spat&a1=3&a2=0&a3=0&b1=1&b2=3&b3=0&c1=0.5&c2=0.5&c3=2.5)
6. Find five integer vectors of length $3$. [Length](?op=len&a1=1&a2=1&a3=1)
7. Drag the vertices of the triangle. [Centroid](?op=tri&a1=3&a2=0&a3=0&b1=0&b2=3&b3=0&c1=0&c2=0&c3=3)
8. Walk 100 steps, then sort them. [Random walk](?op=walk)

## Tasks

### Task 1: Sum and difference

Compute $\vec a + \vec b$ and $\vec a - \vec b$ for $\vec a = (2, 4, 0)^T$, $\vec b = (1, -1, 3)^T$. [Load task](?op=add&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec a + \vec b = (3, 3, 3)^T$ with length $\sqrt{27} \approx 5.20$; $\vec a - \vec b = (1, 5, -3)^T$. [Show in simulation](?op=sub)

</details>

### Task 2: Connecting vector

$A(3, -1, 1)$, $B(-1, 3, 3)$: find $\overrightarrow{AB}$, its length and the midpoint. [Load task](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\overrightarrow{AB} = (-4, 4, 2)^T$, length $6$, $M(1, 1, 2)$. [Show in simulation](?op=ab&a1=3&a2=-1&a3=1&b1=-1&b2=3&b3=3)

</details>

### Task 3: Centroid

Find the centroid of $A(3, 0, 0)$, $B(0, 3, 0)$, $C(0, 0, 3)$. [Load task](?op=tri&a1=3&a2=0&a3=0&b1=0&b2=3&b3=0&c1=0&c2=0&c3=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$S = \frac13 (3, 3, 3) = (1, 1, 1)$. [Show in simulation](?op=tri&a1=3&a2=0&a3=0&b1=0&b2=3&b3=0&c1=0&c2=0&c3=3)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- The shifted copy of $\vec b$ shows that a vector is not tied to a place.
- **Common stumbling blocks:** computing “tail minus tip”; changing only one sign when subtracting; assuming $|\vec a + \vec b| = |\vec a| + |\vec b|$.
