---
description: "Interactive inclined plane – resolve the weight into the downhill force and the normal force, static and kinetic friction, limiting angle, sliding with a = g · (sin α − μ · cos α), spring balance, measurements and a graph F(α)."
---

## What is it about?

On a plane inclined at the angle $\alpha$, the weight $F_G = m \cdot g$ of a body is resolved into the **downhill force** $F_H$ parallel to the slope and the **normal force** $F_N$ perpendicular to it:

$$
F_H = F_G \cdot \sin\alpha = F_G \cdot \frac{h}{l} \qquad F_N = F_G \cdot \cos\alpha
$$

A block stays at rest as long as static friction can balance $F_H$; static friction is at most $F_{R,\max} = \mu_s \cdot F_N$ (in the simulation $\mu_H$). Beyond the **limiting angle** $\tan\alpha_G = \mu_s$ it slides with

$$
a = g \cdot (\sin\alpha - \mu_k \cdot \cos\alpha)
$$

A cart rolls almost without friction; holding it needs only $F_H$ instead of $F_G$, but the distance $l$ is longer than the height $h$: $F_H \cdot l = F_G \cdot h$.

## Try it

1. Drag the top of the plane and watch $F_H$ and $F_N$ in the scene and in the graph.
2. Press **Release** at $20^\circ$ and at $35^\circ$. [Block at 35°](?a=35)
3. Find the limiting angle for each pair of materials. [Rubber on asphalt](?mat=rubber&a=38)
4. Hold the cart with the spring balance and record measurements for several angles. [Cart](?body=cart&km=1&fz=3)

## Tasks

### Task 1: Components

A $2\,\text{kg}$ block lies on a $30^\circ$ slope. Find $F_G$, $F_H$ and $F_N$. [Load task](?a=30&m=2&_hide=1)

<details>
<summary>Show solution</summary>

$F_G = 19.62\,\text{N}$, $F_H = 9.81\,\text{N}$, $F_N \approx 16.99\,\text{N}$.

</details>

### Task 2: Does it slide?

A wooden block ($\mu_s = 0.5$) lies on a $25^\circ$ slope. Does it slide? [Load task](?a=25&_hide=1)

<details>
<summary>Show solution</summary>

$\tan 25^\circ \approx 0.47 < 0.5$, so it stays put. It slides from $\alpha_G \approx 26.6^\circ$.

</details>

### Task 3: Acceleration

How fast does the block ($\mu_k = 0.3$) accelerate at $35^\circ$? [Load task](?a=35&_hide=1)

<details>
<summary>Show solution</summary>

$a = 9.81\,\tfrac{\text{m}}{\text{s}^2} \cdot (\sin 35^\circ - 0.3 \cdot \cos 35^\circ) \approx 3.22\,\tfrac{\text{m}}{\text{s}^2}$.

</details>

## Notes for teachers

- Plane length $1\,\text{m}$, $g = 9.81\,\tfrac{\text{N}}{\text{kg}}$. The coefficients of friction are typical values only; the cart has a very small rolling friction ($0.005$).
- A measurement can only be recorded when the body stays at rest with the set pulling force. For the cart the points lie on $F_H(\alpha)$.
- **Misconceptions:** “the normal force always equals the weight”, “heavy bodies start sliding earlier”, “friction is always $\mu \cdot F_N$”, “the inclined plane saves work”.
