---
description: "Interactive simulation for year 9: how do length, area and volume grow when scaling with factor k? A segment, a plane figure and a rotatable solid are laid out copy by copy – plus a growth chart, working backwards and applications from pizza to model cars."
---

## What is it about?

Scaling a figure with the **scale factor** $k$ produces a **similar** figure: all angles stay the same and every length becomes $k$ times as long. The simulation lays out the image **copy by copy** with the original: a square with twice the side consists of $2 \cdot 2 = 4$ copies, a cube with twice the edge of $2 \cdot 2 \cdot 2 = 8$ copies.

$$
\text{length} \cdot k, \qquad \text{area} \cdot k^2, \qquad \text{volume} \cdot k^3 .
$$

This holds for every area, including the **surface area** of a solid. If $k$ is not a whole number, pieces appear along the edge: for $k = 1.5$ the square consists of $1 + 0.5 + 0.5 + 0.25 = 2.25$ copies. When **reducing** ($0 < k < 1$) the image fits into the original several times; for $k = 0.5$ the area is $\frac14$, the volume $\frac18$. **Backwards:** $k^3 = 8 \Rightarrow k = \sqrt[3]{8} = 2$, and $k^2 = 2 \Rightarrow k = \sqrt{2} \approx 1.41$.

## Try it

1. [k = 2](?k=2): press “Lay out copies” and count along – segment, figure, then the cubes layer by layer. Rotate the cube.
2. Drag the handles and watch $k^3$ run away in the chart.
3. [Triangle, k = 3](?k=3&fig=d) and [cuboid, k = 1.5](?k=1.5&fig=r&obj=q): which pieces appear?
4. [k = 0.5](?k=0.5): how many images fit into the original?
5. [Backwards](?mode=back&dim=v&f=27), [pizza](?mode=pizza&d1=20&d2=30), [model car](?mode=modell&m=10), [surface to volume](?mode=ov&a=2).

## Tasks

### Task 1: Three times as large

A $1\,\text{cm}$ cube is scaled with $k = 3$. Find edge, surface area and volume. [Load task](?k=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Edge $3\,\text{cm}$, surface area $6 \cdot 9 = 54\,\text{cm}^2$, volume $27\,\text{cm}^3$. [Show](?k=3)

</details>

### Task 2: Cuboid with pieces

A $2\,\text{cm} \times 1\,\text{cm} \times 1\,\text{cm}$ cuboid is scaled with $k = 1.5$. Find the new dimensions and the volume. [Load task](?k=1.5&fig=r&obj=q&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$3\,\text{cm} \times 1.5\,\text{cm} \times 1.5\,\text{cm}$, $V = 6.75\,\text{cm}^3 = 2\,\text{cm}^3 \cdot 1.5^3$. [Show](?k=1.5&fig=r&obj=q)

</details>

### Task 3: Backwards

A figure is to get twice the area. Which $k$ is needed? [Load task](?mode=back&dim=a&f=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$k^2 = 2 \Rightarrow k = \sqrt{2} \approx 1.41$ – not $k = 2$, which would give four times the area. [Show](?mode=back&dim=a&f=2)

</details>

### Task 4: Pizza

A $20\,\text{cm}$ pizza costs €8, a $30\,\text{cm}$ pizza €15. Which is better value? [Load task](?mode=pizza&d1=20&d2=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Area factor $1.5^2 = 2.25$; $2.25$ small pizzas would cost €18, so the large one is better value. [Show](?mode=pizza&d1=20&d2=30)

</details>

## Ideas for the classroom

- Let students estimate “How many small cubes do I need?” before running the animation. With “Show the results” off (`show=0`) unknown values appear as “?” until the animation has run.
- The applications (pizza prices, model scale $1 : 10$, surface-to-volume ratio $6/a$ of a cube and why small animals cool down faster) invite modelling.
- **Common stumbling blocks:** “double the side – double the area”; expecting $k^2 > k$ for $k < 1$; taking the factor itself as $k$ instead of the root; mixing up the length scale $1 : 10$ with the area scale $1 : 100$.
