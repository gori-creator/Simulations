---
description: Interactive simulation of Thales's theorem – drag point C along the semicircle, watch the right angle, explore the proof idea and the converse.
---

## What is it about?

Draw a circle whose **diameter** is the segment $\overline{AB}$ – this is the **Thales circle**. Its centre $M$ is the midpoint of $\overline{AB}$.

> **Thales's theorem:** If point $C$ lies on the Thales circle over $\overline{AB}$ (and $C \neq A, B$), then triangle $ABC$ has a **right angle** at $C$: $\gamma = 90^\circ$.

**Converse:** If triangle $ABC$ has a right angle at $C$, then $C$ lies on the Thales circle. Inside the circle $\gamma > 90^\circ$, outside $\gamma < 90^\circ$.

### Proof idea

The radius $\overline{MC}$ splits the triangle into two **isosceles triangles**, because $\overline{MA} = \overline{MB} = \overline{MC} = r$. Their base angles are $\alpha, \alpha$ and $\beta, \beta$, so $\gamma = \alpha + \beta$. The angle sum gives

$$
\alpha + \beta + (\alpha + \beta) = 180^\circ \quad\Rightarrow\quad \gamma = \alpha + \beta = 90^\circ.
$$

## Try it

1. Drag $C$ around the circle or press **Play**. What happens to the angle at $C$ – and to the angles at $A$ and $B$?
2. Show the **proof idea** and look for equal angles. [Show proof idea](?phi=70&proof=1)
3. Switch on **Move C freely** and move $C$ inside or outside the circle. [C inside](?free=1&cx=0.8&cy=1.4) · [C outside](?free=1&cx=-1.2&cy=3.8)

## Exercises

### Exercise 1: Calculating angles

$C$ lies on the Thales circle and $\alpha = 35^\circ$. Find $\beta$ and the angle $\angle AMC$.

<details>
<summary>Show solution</summary>

$\gamma = 90^\circ$, so $\beta = 55^\circ$. Triangle $AMC$ is isosceles with base angles $35^\circ$, so $\angle AMC = 180^\circ - 70^\circ = 110^\circ$. [Show in the simulation](?phi=70&proof=1)

</details>

### Exercise 2: Constructing a right triangle

Construct a right triangle with hypotenuse $\overline{AB} = 6\,\text{cm}$ and leg $\overline{BC} = 4\,\text{cm}$.

<details>
<summary>Show solution</summary>

Draw $\overline{AB}$, construct its midpoint $M$ and the Thales circle (radius $3\,\text{cm}$). Draw a circle around $B$ with radius $4\,\text{cm}$; an intersection with the Thales circle is $C$. By Thales's theorem the angle at $C$ is a right angle.

</details>

### Exercise 3: Tangents to a circle (challenge)

Construct the two tangents from a point $P$ outside a circle with centre $M$. Hint: a tangent is perpendicular to the radius at the point of contact.

<details>
<summary>Show solution</summary>

For a point of contact $B$ we have $\angle MBP = 90^\circ$, so $B$ lies on the Thales circle over $\overline{MP}$. Its intersections with the given circle are the points of contact.

</details>

## Notes for teachers

- **Use:** Discovery lesson in grade 7. Let students state a conjecture before showing the proof idea.
- **Misconceptions:** the right angle is placed at $M$; theorem and converse are not distinguished; the triangle below $\overline{AB}$ is not recognised.
- **Task mode:** **Share → Hide results** hides the angle and proof idea so students can conjecture first.
