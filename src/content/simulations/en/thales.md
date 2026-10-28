## What is it about?

Draw a circle whose **diameter** is exactly the segment $\overline{AB}$ – this is the **Thales circle**. Its centre $M$ is the midpoint of $\overline{AB}$.

> **Thales's theorem:** If point $C$ lies on the Thales circle over $\overline{AB}$ (and $C \neq A, B$), then triangle $ABC$ has a **right angle** at $C$: $\gamma = 90^\circ$.

It does not matter where on the circle $C$ lies – the angle at $C$ is always $90^\circ$.

**Converse:** If triangle $ABC$ has a right angle at $C$, then $C$ lies on the Thales circle over $\overline{AB}$. If $C$ lies inside the circle, $\gamma$ is greater than $90^\circ$; if $C$ lies outside, $\gamma$ is less than $90^\circ$.

### Proof idea

The radius $\overline{MC}$ splits the triangle into two **isosceles triangles**, because $\overline{MA} = \overline{MB} = \overline{MC} = r$.

- In triangle $AMC$ the base angles are equal: both are $\alpha$.
- In triangle $MBC$ the base angles are equal: both are $\beta$.

So the angle at $C$ is made up of $\alpha$ and $\beta$: $\gamma = \alpha + \beta$. The angle sum in triangle $ABC$ gives

$$
\alpha + \beta + (\alpha + \beta) = 180^\circ \quad\Rightarrow\quad \alpha + \beta = 90^\circ \quad\Rightarrow\quad \gamma = 90^\circ.
$$

## Try it

1. Drag point $C$ around the circle or press **Play**. What happens to the angle at $C$ – and to the angles at $A$ and $B$?
2. What happens when $C$ gets very close to $A$ or $B$? [Load example](?phi=170)
3. Switch on the **proof idea** and look for the equal angles. [Show proof idea](?phi=70&proof=1)
4. Switch on **Move C freely** and move $C$ into the circle or out of it. [C inside](?free=1&cx=0.8&cy=1.4) · [C outside](?free=1&cx=-1.2&cy=3.8)

## Exercises

### Exercise 1: Calculating angles

$C$ lies on the Thales circle over $\overline{AB}$ and $\alpha = 35^\circ$. Calculate $\beta$ and the angle $\angle AMC$ at the centre.

<details>
<summary>Show solution</summary>

By Thales's theorem $\gamma = 90^\circ$, so $\beta = 180^\circ - 90^\circ - 35^\circ = 55^\circ$.

Triangle $AMC$ is isosceles with base angles $35^\circ$, so $\angle AMC = 180^\circ - 2 \cdot 35^\circ = 110^\circ$. [Show in the simulation](?phi=70&proof=1)

</details>

### Exercise 2: Constructing a right triangle

Construct a right triangle with hypotenuse $c = \overline{AB} = 6\,\text{cm}$ and leg $a = \overline{BC} = 4\,\text{cm}$. Describe your steps.

<details>
<summary>Show solution</summary>

1. Draw $\overline{AB}$ with length $6\,\text{cm}$ and construct its midpoint $M$.
2. Draw the Thales circle around $M$ with radius $3\,\text{cm}$.
3. Draw a circle around $B$ with radius $4\,\text{cm}$. An intersection with the Thales circle is $C$.

By Thales's theorem the triangle has a right angle at $C$. There are two intersections (above and below $\overline{AB}$) – the two triangles are mirror images and therefore congruent.

</details>

### Exercise 3: Inside or outside?

Use **Move C freely**: how big is $\gamma$ when $C$ lies inside the circle, and how big when $C$ lies outside? State the converse of Thales's theorem.

<details>
<summary>Show solution</summary>

Inside the circle $\gamma > 90^\circ$ (obtuse angle), outside $\gamma < 90^\circ$ (acute angle). Only on the circle is $\gamma = 90^\circ$.

Converse: *If the angle at $C$ is a right angle, then $C$ lies on the circle with diameter $\overline{AB}$.* [Show C inside](?free=1&cx=0.8&cy=1.4)

</details>

### Exercise 4: Tangents to a circle (challenge)

You are given a circle $k$ with centre $M$ and a point $P$ outside the circle. Construct the two tangents from $P$ to the circle. Hint: a tangent is perpendicular to the radius at the point of contact.

<details>
<summary>Show solution</summary>

For a point of contact $B$ we have $\angle MBP = 90^\circ$. By the converse of Thales's theorem, $B$ lies on the Thales circle over $\overline{MP}$.

Construction: find the midpoint of $\overline{MP}$ and draw the Thales circle over $\overline{MP}$ – its intersections with $k$ are the points of contact $B_1$ and $B_2$. The lines $PB_1$ and $PB_2$ are the tangents.

</details>

## Ideas for the classroom

- **Use:** Discovery lesson in about grade 7/8 (congruence and special triangles, which also covers the tangent construction from Exercise 4). Students state the conjecture themselves before you show the proof idea.
- **Animation:** With **Play**, $C$ moves steadily around the circle. This is a good way to stress that $\gamma$ stays the same while $\alpha$ and $\beta$ change.
- **Common stumbling blocks:**
  - “The right angle is at $M$.” – The right angle is always opposite the diameter, i.e. at $C$.
  - Theorem and converse are not distinguished. The **Move C freely** mode lets students experience the converse.
  - When $C$ lies below $\overline{AB}$, the angle is not recognised – the theorem holds there too.
- **Task mode:** **Share → Hide results** hides the angle size (also in the picture) and the proof idea, so students can conjecture first and check afterwards. In class you can switch the angle size in the picture on and off with **Show the angle size in the picture**.
- **Note on moving freely:** $C$ moves in steps of $0.1$. “On the Thales circle” and $\gamma = 90^\circ$ only appear when $C$ lies exactly on the circle, e.g. at $C(0|3)$, $C(1.8|2.4)$ or $C(2.4|1.8)$. Just next to it, $\gamma$ is slightly larger or smaller than $90^\circ$, e.g. $C(0.3|3)$: $\gamma \approx 89.7^\circ$.
