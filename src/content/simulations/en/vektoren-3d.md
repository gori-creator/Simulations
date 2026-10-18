---
description: "Vector arrows in space with draggable tips: tip to tail and the parallelogram, opposite vector and difference, multiples, linear combinations in a plane and the connecting vector AB = B − A – with the calculation in column form."
---

## What is it about?

A **vector** describes a translation; it is written as a column and drawn as an arrow. Arrows of equal length and direction represent the same vector.

- **Addition (tip to tail):** attach $\vec b$ to the tip of $\vec a$; the sum is the diagonal of the **parallelogram**. Components are added.
- **Subtraction:** $\vec a - \vec b = \vec a + (-\vec b)$; the difference also points from the tip of $\vec b$ to the tip of $\vec a$.
- **Scaling:** $k \cdot \vec a$ is parallel to $\vec a$ and $|k|$ times as long; negative $k$ reverses the direction.
- **Linear combination:** all $r \vec a + s \vec b$ lie in one plane (if $\vec a$, $\vec b$ are not parallel).
- **Connecting vector:** $\overrightarrow{AB} = \vec b - \vec a$ (“tip minus tail”), midpoint $M = \frac12(A + B)$, length $\sqrt{v_1^2 + v_2^2 + v_3^2}$.

## Try it

1. Play the animation and drag the tips of $\vec a$ and $\vec b$. [Load example](?op=add)
2. Set $k$ to $-1.5$. What happens to direction and length? [Scaling](?op=scale&k=-1.5)
3. Rotate the view until you look along the plane of the linear combinations. [Linear combination](?op=lin&r=1.5&s=0.5)

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

## Ideas for the classroom

*Just suggestions – you know your class best.*

- The shifted copy of $\vec b$ shows that a vector is not tied to a place.
- **Common stumbling blocks:** computing “tail minus tip”; changing only one sign when subtracting; assuming $|\vec a + \vec b| = |\vec a| + |\vec b|$.
