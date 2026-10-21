---
description: "Interactive simulation for year 9: how do length, area and volume grow when scaling with factor k? A segment, a plane figure and a rotatable solid are laid out copy by copy – plus a growth chart, working backwards and applications from pizza to model cars."
---

## What is it about?

Scaling a figure with the **scale factor** $k$ produces a **similar** figure: all angles stay the same, and every length becomes $k$ times as long. How do areas and volumes change?

The simulation lays out the image **copy by copy** with the original:

- A **segment** of length $k \cdot a$ consists of $k$ copies of the segment $a$.
- A **square** with twice the side length consists of $2 \cdot 2 = 4$ copies, with three times the side length of $3 \cdot 3 = 9$ copies. The triangle works the same way – some copies are upside down.
- A **cube** with twice the edge length consists of $2 \cdot 2 \cdot 2 = 8$ copies, layer by layer.

In general, for similar figures and solids with scale factor $k$:

$$
\text{length} \cdot k, \qquad \text{area} \cdot k^2, \qquad \text{volume} \cdot k^3 .
$$

This holds for **every** area, so also for the **surface area** of a solid: it grows with $k^2$ as well. If $k$ is not a whole number, there are **pieces** along the edge. For $k = 1.5$ the square consists of $1 + 0.5 + 0.5 + 0.25 = 2.25 = 1.5^2$ copies. A circle cannot be made of small circles, but it can be made of sectors that are each as large as the small circle.

**Reducing** ($0 < k < 1$): now the image fits into the original several times. For $k = 0.5$ the area is only $0.5^2 = \frac14$, the volume only $0.5^3 = \frac18$ as large. Then $k^3 < k^2 < k$.

**Backwards:** if you know by which factor the volume has grown, take the **cube root**; for the area, take the **square root**: $k^3 = 8 \Rightarrow k = \sqrt[3]{8} = 2$ and $k^2 = 2 \Rightarrow k = \sqrt{2} \approx 1.41$.

## Try it

1. [k = 2](?k=2): press “Lay out copies” and count along: first the segment, then the figure, then the cubes layer by layer. Rotate the cube with the mouse or your finger.
2. Drag the handle of the segment, the corner of the square or the cube. Watch in the chart “What grows how fast?” how $k^3$ runs away.
3. [Triangle with k = 3](?k=3&fig=d): how many copies are upside down? And how many cubes do you need now?
4. [k = 1.5 with a cuboid](?k=1.5&fig=r&obj=q): which pieces appear along the edge? Why do they add up to exactly $2.25$ and $3.375$ copies?
5. [k = 0.5](?k=0.5): now the original is laid out with images. How many fit inside? And for the [circle with k = 2](?k=2&fig=k)?
6. [Backwards](?mode=back&dim=v&f=27): the volume is 27 times as large. Press “Find k”. Then switch to [area factor 2](?mode=back&dim=a&f=2).
7. Applications: [pizza](?mode=pizza&d1=20&d2=30), [model car](?mode=modell&m=10), [surface and volume](?mode=ov&a=2) – press the button below the drawing each time.

## Tasks

### Task 1: Three times as large

A cube with edge length $1\,\text{cm}$ is scaled with $k = 3$. Find the edge length, surface area and volume of the image. [Load task](?k=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Edge $3\,\text{cm}$. Surface area $6\,\text{cm}^2 \cdot 3^2 = 54\,\text{cm}^2$. Volume $1\,\text{cm}^3 \cdot 3^3 = 27\,\text{cm}^3$ – so 27 original cubes fit inside. [Show solution](?k=3)

</details>

### Task 2: Half the edge

A cube with edge length $1\,\text{cm}$ is reduced with $k = 0.5$. What fraction of the surface area and of the volume remains? Give both values. [Load task](?k=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Surface area: $0.5^2 = \frac14$, so $6\,\text{cm}^2 : 4 = 1.5\,\text{cm}^2$. Volume: $0.5^3 = \frac18$, so $0.125\,\text{cm}^3$. Eight small cubes fill the original cube. [Show solution](?k=0.5)

</details>

### Task 3: Cuboid with pieces

A cuboid measuring $2\,\text{cm} \times 1\,\text{cm} \times 1\,\text{cm}$ is scaled with $k = 1.5$. Find the new dimensions, the volume and the surface area. [Load task](?k=1.5&fig=r&obj=q&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Dimensions $3\,\text{cm} \times 1.5\,\text{cm} \times 1.5\,\text{cm}$. Volume $3 \cdot 1.5 \cdot 1.5 = 6.75\,\text{cm}^3$; check: $2\,\text{cm}^3 \cdot 1.5^3 = 2 \cdot 3.375 = 6.75\,\text{cm}^3$. Surface area before $2 \cdot (2 + 1 + 2) = 10\,\text{cm}^2$, after $10\,\text{cm}^2 \cdot 2.25 = 22.5\,\text{cm}^2$. [Show solution](?k=1.5&fig=r&obj=q)

</details>

### Task 4: Thinking backwards

a) After scaling, a cube has 27 times the volume. By which factor was it scaled, and how has its surface area changed? [Load task](?mode=back&dim=v&f=27&show=0&_hide=1)

b) A figure is to get twice the area. Which $k$ do you need? [Load task](?mode=back&dim=a&f=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

a) $k^3 = 27 \Rightarrow k = \sqrt[3]{27} = 3$; the surface area becomes $3^2 = 9$ times as large. [Show](?mode=back&dim=v&f=27)

b) $k^2 = 2 \Rightarrow k = \sqrt{2} \approx 1.41$ – so **not** $k = 2$, which would give four times the area. [Show](?mode=back&dim=a&f=2)

</details>

### Task 5: Which pizza is better value?

A pizza with a diameter of $20\,\text{cm}$ costs €8, one with $30\,\text{cm}$ costs €15. Which one is cheaper relative to its area? [Load task](?mode=pizza&d1=20&d2=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$k = 30 : 20 = 1.5$, so the area is $1.5^2 = 2.25$ times as large ($\approx 707\,\text{cm}^2$ instead of $\approx 314\,\text{cm}^2$). For $2.25$ small pizzas you would pay $2.25 \cdot €8 = €18$ – the large pizza for €15 is better value (about $2.1$ cents instead of $2.5$ cents per $\text{cm}^2$). [Show solution](?mode=pizza&d1=20&d2=30)

</details>

### Task 6: Small cubes cool down faster

For cubes with $a = 1\,\text{cm}$, $2\,\text{cm}$ and $3\,\text{cm}$, work out the ratio $O : V$ (surface area to volume). What happens to the surface area if you cut the cube with $a = 3\,\text{cm}$ into cubes with an edge of $1\,\text{cm}$? [Load task](?mode=ov&a=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$O : V = \frac{6a^2}{a^3} = \frac{6}{a}$, so $6$, $3$ and $2$. If you cut the cube with $a = 3\,\text{cm}$ into $27$ small cubes, the volume stays $27\,\text{cm}^3$, but the surface area grows from $54\,\text{cm}^2$ to $27 \cdot 6\,\text{cm}^2 = 162\,\text{cm}^2$ (three times as much). Small bodies have a lot of surface area relative to their volume – that is why small animals cool down faster. [Show solution](?mode=ov&a=3)

</details>

## Ideas for the classroom

- **Use:** Year 9 (Jahrgangsstufe 9), similarity and enlargement (LehrplanPLUS Gymnasium Bavaria; please check the exact placement against the curriculum). The animation “Lay out copies” works well as an introduction before the rule $k$, $k^2$, $k^3$ is stated – for example with an estimate first: “How many small cubes do I need?” Interlocking cubes help to rebuild the figures.
- **Tasks from the picture:** with “Show the results” switched off (`show=0`), unknown values appear as “?” until the animation has run.
- **Applications:** pizza (price per area), model building (paint $\cdot \frac{1}{100}$, mass for the same material $\cdot \frac{1}{1000}$ at scale $1 : 10$) and the ratio of surface area to volume (heat loss in animals, icing sugar, wood shavings) offer opportunities for modelling.
- **Common stumbling blocks:**
  - “Double the side – double the area”: the copies in the picture show that there are four.
  - When reducing, students expect $k^2$ to be larger than $k$; but for $0 < k < 1$ we have $k^3 < k^2 < k$.
  - Working backwards, the factor itself is taken as $k$ (“double the area, so $k = 2$”) instead of taking the root.
  - The length scale and the area scale are mixed up: $1 : 10$ for lengths means $1 : 100$ for areas.
