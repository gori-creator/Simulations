---
description: "Two vectors in space: angle and projection from the dot product, rotating b with the curves of cos and sin, the cross product step by step as a normal vector with the parallelogram area, the triple product as a volume (with Cavalieri shear) – and discovery tasks that reveal the whole solution set."
---

## What is it about?

The **dot product** $\vec a \cdot \vec b = a_1b_1 + a_2b_2 + a_3b_3$ is a number. Since $\vec a \cdot \vec b = |\vec a|\,|\vec b| \cos\varphi$, it gives the angle: $(1, 0, 0)^T \cdot (1, 1, 0)^T = 1$, $\cos\varphi = \frac{1}{\sqrt2}$, $\varphi = 45°$. $\vec a \cdot \vec b = 0$ means perpendicular; $\frac{\vec a \cdot \vec b}{|\vec a|}$ is the signed length of the projection of $\vec b$ onto $\vec a$.

The **cross product** $\vec a \times \vec b = (a_2b_3 - a_3b_2,\ a_3b_1 - a_1b_3,\ a_1b_2 - a_2b_1)^T$ is perpendicular to $\vec a$ and $\vec b$ (right-hand rule), e.g. $(1, 0, 0)^T \times (0, 1, 0)^T = (0, 0, 1)^T$. Its length $|\vec a|\,|\vec b| \sin\varphi$ is the area of the parallelogram. For parallel vectors it is $\vec o$.

The **triple product** $(\vec a \times \vec b) \cdot \vec c$ gives the volume (base times height); shearing keeps it (Cavalieri). A negative sign means a left-handed system.

## Try it

1. Turn $\varphi$ from $0°$ to $180°$ and compare both curves. [Rotate](?mode=angle&a1=1&a2=0&a3=0&b1=1&b2=1&b3=0&phi=45)
2. Watch the cross product step by step. [Cross product](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6)
3. Shear the parallelepiped upright. [Cavalieri](?mode=spat&a1=2&a2=0&a3=0&b1=0&b2=3&b3=0&c1=2&c2=1&c3=2&cav=1)
4. Find three perpendicular vectors. [Discover](?mode=find&task=perp&b1=1&b2=1&b3=2)

## Tasks

### Task 1: Angle

Find the angle between $(1, 2, 0)^T$ and $(-2, -1, 2)^T$. [Load task](?b1=-2&b2=-1&b3=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\vec a \cdot \vec b = -4$, $\cos\varphi = \frac{-4}{3\sqrt5} \approx -0.596$, $\varphi \approx 126.6°$. [Show in simulation](?b1=-2&b2=-1&b3=2)

</details>

### Task 2: Area

Compute $(1, 2, 3)^T \times (4, 5, 6)^T$ and the area of the parallelogram. [Load task](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$(12 - 15,\ 12 - 6,\ 5 - 8)^T = (-3, 6, -3)^T$, area $\sqrt{54} \approx 7.35$. [Show in simulation](?mode=cross&a1=1&a2=2&a3=3&b1=4&b2=5&b3=6)

</details>

### Task 3: All solutions

Which $\vec c$ give volume $12$ with $\vec a = (2, 0, 0)^T$, $\vec b = (0, 3, 0)^T$? [Load task](?mode=find&task=vol&c1=1&c2=1&c3=1)

<details>
<summary>Show solution</summary>

$\vec a \times \vec b = (0, 0, 6)^T$, so $|6c_3| = 12$: $c_3 = \pm 2$, $c_1$, $c_2$ arbitrary – two planes. [Show in simulation](?mode=find&task=vol&c1=1&c2=1&c3=1)

</details>

## Ideas for the classroom

- Searching for perpendicular vectors in “Discover” first leads naturally to the normal form of a plane.
- **Common stumbling blocks:** writing the dot product as a vector; sign errors in the middle component (check with $(\vec a \times \vec b) \cdot \vec a = 0$); forgetting $\frac12$ or $\frac16$.
