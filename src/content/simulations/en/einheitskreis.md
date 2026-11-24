---
description: Interactive unit circle – sine, cosine and tangent for any angle, radians and how the sine curve emerges.
---

## What is it about?

The **unit circle** is the circle around the origin with radius 1. A point $P$ moves on this circle; the angle $\alpha$ is measured from the positive x-axis **anticlockwise**.

The coordinates of $P$ are exactly the cosine and sine of the angle:

$$
P\,(\cos\alpha \mid \sin\alpha)
$$

This defines sine and cosine not only for acute angles in right triangles but for **all angles** – including 150° or 300°.

- The **tangent** is $\tan\alpha = \frac{\sin\alpha}{\cos\alpha}$. On the unit circle, the line through the origin $O$ and $P$ meets the tangent line $x = 1$. The y-coordinate of this intersection is $\tan\alpha$ (negative below the x-axis).
- By Pythagoras, $\sin^2\alpha + \cos^2\alpha = 1$ always holds.

### Degrees and radians

In **radians**, an angle is measured by the length of its arc on the unit circle. A full circle has circumference $2\pi$, so $360^\circ$ corresponds exactly to $2\pi$:

$$
x = \frac{\pi}{180^\circ} \cdot \alpha
$$

| $\alpha$ | 0° | 30° | 45° | 60° | 90° | 180° | 270° | 360° |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Radians | 0 | $\frac{\pi}{6}$ | $\frac{\pi}{4}$ | $\frac{\pi}{3}$ | $\frac{\pi}{2}$ | $\pi$ | $\frac{3\pi}{2}$ | $2\pi$ |
| $\sin\alpha$ | 0 | $\frac{1}{2}$ | $\frac{\sqrt{2}}{2}$ | $\frac{\sqrt{3}}{2}$ | 1 | 0 | −1 | 0 |
| $\cos\alpha$ | 1 | $\frac{\sqrt{3}}{2}$ | $\frac{\sqrt{2}}{2}$ | $\frac{1}{2}$ | 0 | −1 | 0 | 1 |

### Symmetries on the unit circle

If you reflect $P$ in an axis or in the origin, you get points whose coordinates have the same absolute values. This gives the relations:

| Reflection | related angle | sine | cosine |
| --- | --- | --- | --- |
| in the y-axis | $180^\circ - \alpha$ | $\sin(180^\circ - \alpha) = \sin\alpha$ | $\cos(180^\circ - \alpha) = -\cos\alpha$ |
| in the origin | $180^\circ + \alpha$ | $\sin(180^\circ + \alpha) = -\sin\alpha$ | $\cos(180^\circ + \alpha) = -\cos\alpha$ |
| in the x-axis | $360^\circ - \alpha$ | $\sin(360^\circ - \alpha) = -\sin\alpha$ | $\cos(360^\circ - \alpha) = \cos\alpha$ |

This way all values can be traced back to angles between $0^\circ$ and $90^\circ$.

### Equations like $\sin\alpha = c$

A horizontal line $y = c$ with $-1 < c < 1$ meets the unit circle in **two** points. That is why $\sin\alpha = c$ has two solutions between $0^\circ$ and $360^\circ$: $\alpha_1$ (calculator: $\sin^{-1}$) and $\alpha_2 = 180^\circ - \alpha_1$. For $\cos\alpha = c$ a vertical line $x = c$ cuts the circle, and $\alpha_2 = 360^\circ - \alpha_1$. For $c = \pm 1$ there is only one solution. Because of the period, all multiples of $360^\circ$ can be added to each solution.

## Explore

1. Start the **animation**. Follow the height of $P$ and the point on the sine curve: how does the circular motion create the sine curve? On wide screens a horizontal helper line connects the two points.
2. Compare $\alpha = 30^\circ$ and $\alpha = 150^\circ$. What do the sine values have in common? [30°](?angle=30) [150°](?angle=150)
3. In which quadrants is the sine negative? In which is the cosine negative?
4. Show the **tangent** and drag $P$ close to 90°. What happens? [Show tangent](?angle=80&tan=1&cos=0)
5. Switch the axis to **radians**. [Radians](?unit=rad&angle=90)
6. **Symmetries:** choose “180° − α” and drag $P$. Which segment keeps its length, which changes its sign? [180° − α](?mode=symm&angle=30&rel=y) · [180° + α](?mode=symm&angle=50&rel=o) · [360° − α](?mode=symm&angle=40&rel=x)
7. **Solve an equation:** drag the horizontal line in the graph. When are there two solutions, when only one? [sin α = 0.5](?mode=solve&fn=sin&cv=0.5) · [cos α = −0.5](?mode=solve&fn=cos&cv=-0.5)
8. **Practice:** tap the point that matches the task. How many can you get right in a row? [Practice](?mode=quiz&q=1)

## Exercises

### Exercise 1: Values without a calculator

Find $\sin 120^\circ$ and $\cos 120^\circ$ using the symmetry of the unit circle.

<details>
<summary>Show solution</summary>

$P$ lies in the 2nd quadrant and is the mirror image of the point for $60^\circ$ in the y-axis. So $\sin 120^\circ = \sin 60^\circ = \frac{\sqrt{3}}{2}$ and $\cos 120^\circ = -\cos 60^\circ = -\frac{1}{2}$. [Check](?angle=120)

</details>

### Exercise 2: Solve an equation

For which angles $\alpha$ between 0° and 360° is $\sin\alpha = 0.5$? [Load exercise](?mode=solve&fn=sin&cv=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

For $\alpha_1 = 30^\circ$ and – since $\sin(180^\circ - \alpha) = \sin\alpha$ – for $\alpha_2 = 150^\circ$. [Show in the simulation](?mode=solve&fn=sin&cv=0.5)

</details>

### Exercise 3: Converting

1. Give $45^\circ$ and $225^\circ$ in radians.
2. Give $\frac{3\pi}{2}$ and $\frac{2\pi}{3}$ in degrees.

<details>
<summary>Show solution</summary>

1. $45^\circ = \frac{\pi}{4}$, $225^\circ = \frac{5\pi}{4}$
2. $\frac{3\pi}{2} = 270^\circ$, $\frac{2\pi}{3} = 120^\circ$

</details>

### Exercise 4: Tangent at 90°

Use the unit circle to explain why $\tan 90^\circ$ is undefined.

<details>
<summary>Show solution</summary>

At 90°, $\cos\alpha = 0$ – you would have to divide by zero. Geometrically, the line through the origin $O$ and $P$ is then parallel to the tangent line $x = 1$ and never meets it.

</details>

### Exercise 5: Negative cosine

Solve $\cos\alpha = -0.5$ for $0^\circ \le \alpha < 360^\circ$. [Load exercise](?mode=solve&fn=cos&cv=-0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\cos 60^\circ = 0.5$. The cosine is negative in the 2nd and 3rd quadrants, so $\alpha_1 = 180^\circ - 60^\circ = 120^\circ$ and $\alpha_2 = 180^\circ + 60^\circ = 240^\circ$. Check: $\alpha_2 = 360^\circ - \alpha_1$. [Show in the simulation](?mode=solve&fn=cos&cv=-0.5)

</details>

### Exercise 6: An angle from two pieces of information

For which angle between $0^\circ$ and $360^\circ$ is $\sin\alpha = -\frac{\sqrt{2}}{2}$ and $\cos\alpha > 0$?

<details>
<summary>Show solution</summary>

$\sin\alpha < 0$ and $\cos\alpha > 0$: 4th quadrant. The reference angle is $45^\circ$, so $\alpha = 360^\circ - 45^\circ = 315^\circ$. [Show the reflection in the x-axis](?mode=symm&angle=45&rel=x)

</details>

## Ideas for the classroom

- **Use:** the step from trigonometry in right triangles to trigonometric functions (usually grades 9/10).
- **On the projector:** run the animation slowly (e.g. 10 °/s) and let the class predict when the sine reaches its maximum.
- **Symmetries instead of memorising:** in the “Symmetries” view the animation keeps running and the reflected point moves along. In the graph, the height lines show when the values are equal and when they only differ in sign.
- **Practice:** the tasks are numbered. The same number means the same task, so the whole class can work on the same one. Odd numbers ask for an angle, even ones for values with signs. The points can also be chosen with the keyboard.
- **Common pitfalls:**
  - Sine and cosine exist "only in the triangle", i.e. only for angles below 90°.
  - Radians are seen as just another unit, without their geometric meaning as arc length.
  - The signs in the quadrants are memorised instead of read off the circle.
- **Next step:** the simulation "General sine function" builds directly on this.
