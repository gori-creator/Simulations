---
description: "Interactive simulation for grades 9 and 10: sine, cosine and tangent as ratios of sides in a right triangle – opposite, adjacent and hypotenuse move with the reference angle, similar triangles grow from the vertex, the unit circle shows sin, cos and tan as lengths. Plus finding an angle from two sides and three applications: ramp gradient in percent, ladder against a wall, height of a tower."
---

## What is it about?

In a right triangle the side opposite the right angle is the **hypotenuse**; the other two sides are the **legs**. Seen from an acute angle, one leg is **adjacent** to it and the other is **opposite**:

$$
\sin \alpha = \frac{\text{opposite}}{\text{hypotenuse}}, \qquad \cos \alpha = \frac{\text{adjacent}}{\text{hypotenuse}}, \qquad \tan \alpha = \frac{\text{opposite}}{\text{adjacent}}
$$

All right triangles with the same angle $\alpha$ are **similar**: every side is multiplied by the same factor $k$, which cancels in the ratio. So the ratios depend on the angle only.

For the other angle $\beta = 90° - \alpha$ the legs swap roles, so $\sin \alpha = \cos(90° - \alpha)$. On the **unit circle** (hypotenuse $1$) the opposite side is $\sin \alpha$ and the adjacent side is $\cos \alpha$; Pythagoras gives $(\sin \alpha)^2 + (\cos \alpha)^2 = 1$, and $\tan \alpha = \frac{\sin \alpha}{\cos \alpha}$ can be read off on the tangent $x = 1$.

Special values: $\sin 30° = \frac12$, $\sin 45° = \frac{\sqrt2}{2}$, $\sin 60° = \frac{\sqrt3}{2}$, $\tan 30° = \frac{\sqrt3}{3}$, $\tan 60° = \sqrt3$.

## Try it

1. [Start](?al=35&c=6): drag vertex $B$. Press **“Grow similar triangles”** – which numbers in the table change, which stay?
2. Tap the angle arc at $B$: watch the names “opposite” and “adjacent” move. [Reference angle β](?ref=b&al=35&c=8)
3. [Unit circle](?mode=unit&al=30): press “Sweep the angle” and watch the table of special values.
4. [Finding the angle](?mode=inv&f=sin&go=3&hy=5): solve step by step. What happens if the [leg is longer than the hypotenuse](?mode=inv&f=sin&go=6&hy=5)?
5. Applications: [ramp](?mode=app&app=ramp&pc=6&rh=0.5), [ladder](?mode=app&app=ladder&ll=4&al=70), [tower](?mode=app&app=tower&d=50&al=32).

## Tasks

### Task 1: Sides

$c = 6\,\text{cm}$, $\alpha = 30°$. Find $a$ and $b$. [Load task](?al=30&c=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$a = 6\,\text{cm} \cdot \sin 30° = 3\,\text{cm}$, $b = 6\,\text{cm} \cdot \cos 30° \approx 5.20\,\text{cm}$. [Show](?al=30&c=6)

</details>

### Task 2: Angle from two sides

Opposite $3\,\text{cm}$, hypotenuse $5\,\text{cm}$. Find $\alpha$. [Load task](?mode=inv&f=sin&go=3&hy=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\sin \alpha = 0.6$, so $\alpha = \sin^{-1}(0.6) \approx 36.87°$; the adjacent side is $4\,\text{cm}$. [Show](?mode=inv&f=sin&go=3&hy=5)

</details>

### Task 3: Ramp

A ramp rises $0.5\,\text{m}$ with a gradient of $6\,\%$. Find the angle and the horizontal length. [Load task](?mode=app&app=ramp&pc=6&rh=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\tan \alpha = 0.06$, $\alpha \approx 3.43°$ (not $6°$!); $l = 0.5\,\text{m} : 0.06 \approx 8.33\,\text{m}$. [Show](?mode=app&app=ramp&pc=6&rh=0.5)

</details>

## Ideas for the classroom

- Let students discover the constant ratio with the growing triangles before naming sine, cosine and tangent.
- With “Show results” off (`show=0`) every topic becomes an exercise: unknowns appear as “?”.
- **Common stumbling blocks:**
  - Opposite and adjacent are chosen without looking at the reference angle.
  - A gradient in percent is read as degrees ($6\,\% \approx 3.43°$).
  - The eye height is forgotten when measuring a tower.
  - The calculator is set to radians.
