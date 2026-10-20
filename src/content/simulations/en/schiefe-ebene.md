---
description: "Interactive inclined plane – resolve the weight into the downhill force and the normal force, static and kinetic friction, limiting angle, sliding with a = g · (sin α − μ · cos α), spring balance, measurements and a graph F(α)."
---

## What is it about?

On an **inclined plane** with the angle of inclination $\alpha$, the **weight** $F_G = m \cdot g$ of a body acts vertically downwards. It is resolved into two components:

- the **downhill force** $F_H$ parallel to the slope (pointing down the slope) and
- the **normal force** $F_N$ perpendicular to the slope, which presses the body onto the surface.

The triangle of forces $F_G$, $F_H$, $F_N$ is similar to the triangle of length $l$, height $h$ and base of the plane. Therefore

$$
\frac{F_H}{F_G} = \frac{h}{l} \qquad F_H = F_G \cdot \sin\alpha \qquad F_N = F_G \cdot \cos\alpha
$$

The steeper the plane, the larger $F_H$ and the smaller $F_N$. At $\alpha = 30^\circ$ the downhill force is exactly half the weight.

**Gradient in per cent:** Road signs give the gradient as the change in height per horizontal distance, i.e. $\tan\alpha$. “12 %” means $\tan\alpha = 0.12$, so $\alpha \approx 6.8^\circ$.

**Friction:** A block stays at rest as long as **static friction** can balance the downhill force. Static friction is at most

$$
F_{R,\max} = \mu_s \cdot F_N
$$

($\mu_s$: coefficient of static friction, written $\mu_H$ in the simulation). If $F_H$ is larger, the block slides. While sliding, the smaller **kinetic friction** $F_R = \mu_k \cdot F_N$ (in the simulation $\mu_G$) slows it down. The block then slides down with constant acceleration

$$
a = \frac{F_H - F_R}{m} = g \cdot (\sin\alpha - \mu_k \cdot \cos\alpha)
$$

**Limiting angle:** Without any other force, the block starts to slide when $F_H = F_{R,\max}$, i.e. at $\tan\alpha_G = \mu_s$. The mass does not matter. Measuring the limiting angle gives the coefficient of static friction.

**Force converter:** A cart rolls almost without friction. To hold it on the slope or to pull it up steadily, you only need the force $F_H$ instead of $F_G$ – but the distance $l$ is longer than the height $h$. This is the **golden rule of mechanics**: $F_H \cdot l = F_G \cdot h$.

## Try it

1. Increase the angle by dragging the top end of the plane. Watch $F_H$ and $F_N$ in the scene and in the graph.
2. Press **Release** at $20^\circ$ and at $35^\circ$. [Wooden block at 35°](?a=35)
3. Find the limiting angle for each pair of materials, from which the block slides. Compare with the intersection of $F_H$ and $F_{R,\max}$ in the graph. [Rubber on asphalt](?mat=rubber&a=38) · [Steel on ice](?mat=ice&a=1)
4. Double the mass. Do the limiting angle and the acceleration change? [Mass 2 kg](?a=35&m=2)
5. Hook the spring balance to the cart and set the pulling force so that the cart stays put. Record measurements for several angles. [Cart with spring balance](?body=cart&km=1&fz=3)
6. Pull the wooden block up. From which pulling force does it start to move? [Pulling up](?km=1&fz=8.5)

## Tasks

### Task 1: Resolving the weight

A block with $m = 2\,\text{kg}$ lies on a plane with $\alpha = 30^\circ$. Calculate $F_G$, $F_H$ and $F_N$. [Load task](?a=30&m=2&_hide=1)

<details>
<summary>Show solution</summary>

$F_G = 2\,\text{kg} \cdot 9.81\,\tfrac{\text{N}}{\text{kg}} = 19.62\,\text{N}$, $F_H = F_G \cdot \sin 30^\circ = 9.81\,\text{N}$, $F_N = F_G \cdot \cos 30^\circ \approx 16.99\,\text{N}$.

</details>

### Task 2: Height and length

A ramp is $l = 1\,\text{m}$ long and $h = 34\,\text{cm}$ high. What force do you need at least to hold a $1\,\text{kg}$ cart on it (ignore friction)? [Load task](?body=cart&a=20&km=1&fz=1&_hide=1)

<details>
<summary>Show solution</summary>

$F_H = F_G \cdot \frac{h}{l} = 9.81\,\text{N} \cdot 0.34 \approx 3.3\,\text{N}$ – about a third of the weight. (With $\alpha = 20^\circ$ the simulation shows more precisely $3.36\,\text{N}$.) [Check](?body=cart&a=20&km=1&fz=3.4)

</details>

### Task 3: Does the block slide?

A wooden block ($\mu_s = 0.5$) lies on a plane with $\alpha = 25^\circ$. Does it start to slide by itself? [Load task](?a=25&_hide=1)

<details>
<summary>Show solution</summary>

$\tan 25^\circ \approx 0.47 < 0.5$ – the block stays put. It only slides from $\alpha_G = \arctan 0.5 \approx 26.6^\circ$. [Check at 27°](?a=27)

</details>

### Task 4: Acceleration

How strongly does the wooden block ($\mu_k = 0.3$) accelerate at $\alpha = 35^\circ$? How long does it take for $40\,\text{cm}$? [Load task](?a=35&_hide=1)

<details>
<summary>Show solution</summary>

$a = 9.81\,\tfrac{\text{m}}{\text{s}^2} \cdot (\sin 35^\circ - 0.3 \cdot \cos 35^\circ) \approx 3.22\,\tfrac{\text{m}}{\text{s}^2}$. From $s = \frac12 a t^2$ we get $t = \sqrt{\frac{2 \cdot 0.4\,\text{m}}{3.22\,\text{m/s}^2}} \approx 0.50\,\text{s}$.

</details>

### Task 5: Measuring the coefficient of friction

A block of an unknown material starts to slide at $\alpha = 31^\circ$. How large is the coefficient of static friction? Check with your own values. [Check](?mat=custom&mh=0.6&mg=0.45&a=31)

<details>
<summary>Show solution</summary>

$\mu_s = \tan 31^\circ \approx 0.60$. At $30^\circ$ the block still stays put, at $31^\circ$ it slides.

</details>

### Task 6: Pulling up

With what force must you pull the wooden block ($m = 1\,\text{kg}$, $\mu_k = 0.3$) at $\alpha = 20^\circ$ so that it slides up steadily? Why do you need more force to get it moving? [Load task](?km=1&fz=3&_hide=1)

<details>
<summary>Show solution</summary>

$F_Z = F_H + \mu_k \cdot F_N = 3.36\,\text{N} + 0.3 \cdot 9.22\,\text{N} \approx 6.1\,\text{N}$. To get it moving you first have to overcome the larger static friction: $F_H + \mu_s \cdot F_N \approx 8.0\,\text{N}$. [Try it](?km=1&fz=8.1)

</details>

### Task 7: Gradient in per cent

A road sign warns of a $12\,\%$ gradient. How large is the angle of inclination? What fraction of a car's weight acts as the downhill force?

<details>
<summary>Show solution</summary>

$\tan\alpha = 0.12$, so $\alpha \approx 6.8^\circ$. The fraction is $\frac{F_H}{F_G} = \sin 6.8^\circ \approx 0.12$, i.e. about $12\,\%$. For small angles $\sin\alpha$ and $\tan\alpha$ are almost equal. In the simulation (cart, $1\,\text{kg}$, $\alpha = 7^\circ$): $F_H \approx 1.20\,\text{N}$ out of $9.81\,\text{N}$. [Check](?body=cart&a=7)

</details>

## Ideas for the classroom

- **Use:** resolving forces on the inclined plane (graphically with the triangle of forces, with $h/l$ or with trigonometry), friction and limiting angle, the inclined plane as a force converter (grades 8–10); the equation of motion $a = g(\sin\alpha - \mu_k\cos\alpha)$ rather from grade 10.
- **Terms:** Here the component of the weight perpendicular to the plane is called the normal force $F_N$. Some textbooks distinguish it from the equally large force that the surface exerts on the body.
- **Model:** plane $1\,\text{m}$ long, $g = 9.81\,\tfrac{\text{N}}{\text{kg}}$. The coefficients of friction are **typical values**; real values depend strongly on surface, moisture and cleanliness. The cart has a very small rolling friction ($0.005$). Before release, a hand holds the body; that is why the static friction shown is at most $F_{R,\max}$. At the bottom end a stop holds the body.
- **Series of measurements:** With the spring balance attached, a measurement can only be recorded if the body stays at rest with this pulling force. For the cart, the points lie on the curve $F_H(\alpha)$; for the block there is a whole range of holding forces because of static friction – a good reason for discussion.
- **Common stumbling blocks:**
  - “The normal force always equals the weight.” – On the inclined plane it is smaller: $F_N = F_G \cdot \cos\alpha$.
  - “Heavy bodies start sliding earlier.” – The limiting angle depends only on $\mu_s$, not on the mass.
  - “Friction is always $\mu \cdot F_N$.” – Static friction is only as large as needed, at most $\mu_s \cdot F_N$.
  - “The inclined plane saves work.” – It saves force, but you have to cover a longer distance.
