---
description: "Interactive simulation of uniform circular motion: speed, period, centripetal acceleration and centripetal force – with a ball on a string that can break and a car that skids out of a bend if it is too fast."
---

## What is it about?

In **uniform circular motion** the speed stays the same, but the **direction** of the velocity changes all the time; it always points along the **tangent**. With radius $r$ and period $T$ (frequency $f = \frac{1}{T}$):

$$
v = \frac{2\pi r}{T} \qquad \omega = \frac{2\pi}{T} = \frac{v}{r} \qquad a_Z = \frac{v^2}{r} \qquad F_Z = m \cdot \frac{v^2}{r}
$$

The **centripetal force** points to the centre. It is provided by the string, by static friction (car) or by gravity (planets). Without it the body moves on in a straight line because of its **inertia**. For a car, static friction is at most $\mu_H m g$, so the maximum speed in a bend is $v_{\max} = \sqrt{\mu_H g r}$ – independent of the mass.

## Try it

1. Press **Start** and look at the arrows. Then **cut the string**.
2. Halve the period: [load example](?T=0.6). How do $v$ and $F_Z$ change?
3. Graph "force against radius": [load example](?chart=r)
4. Car on a wet road: [load example](?mode=car&road=wet&vc=18)

## Tasks

### Task 1: Ball on a string

$m = 0.2\,\text{kg}$, $r = 0.8\,\text{m}$, $T = 1.2\,\text{s}$. Find $v$, $a_Z$ and $F_Z$. [Load task](?_hide=1)

<details>
<summary>Show solution</summary>

$v \approx 4.19\,\tfrac{\text{m}}{\text{s}}$, $a_Z \approx 21.9\,\tfrac{\text{m}}{\text{s}^2}$, $F_Z \approx 4.39\,\text{N}$.

</details>

### Task 2: Maximum speed in a bend

$r = 50\,\text{m}$, dry road ($\mu_H = 0.8$) and wet road ($\mu_H = 0.5$). [Load task](?mode=car&_hide=1)

<details>
<summary>Show solution</summary>

Dry: $v_{\max} \approx 19.8\,\tfrac{\text{m}}{\text{s}} \approx 71\,\tfrac{\text{km}}{\text{h}}$; wet: $\approx 15.7\,\tfrac{\text{m}}{\text{s}} \approx 56\,\tfrac{\text{km}}{\text{h}}$.

</details>

## Notes for teachers

- **Use:** circular motion and centripetal force (grades 10/11), from the "cut the string" experiment to cornering safety.
- **Model:** frictionless horizontal table; the bend is not drawn to scale; when skidding, the car is assumed to keep its speed with maximum static friction.
- **Misconception:** "A centrifugal force pushes the ball outwards" – without the string the ball moves along the tangent, not radially outwards.
