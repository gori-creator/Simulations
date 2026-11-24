---
description: "Conic sections as loci: ellipse with the gardener's method, parabola from focus and directrix, hyperbola via the difference of distances, all via the eccentricity ε and as sections of a double cone."
---

## What is it about?

A **locus** is the set of all points with a certain property. The circle is the best-known example: all points at the same distance from the centre. Ellipse, parabola and hyperbola can be described in the same way:

| Curve | Property of every point $P$ | Equation |
| --- | --- | --- |
| Ellipse | $\lvert PF_1\rvert + \lvert PF_2\rvert = 2a$ | $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$ |
| Hyperbola | $\big\lvert \lvert PF_1\rvert - \lvert PF_2\rvert \big\rvert = 2a$ | $\dfrac{x^2}{a^2} - \dfrac{y^2}{b^2} = 1$ |
| Parabola | $\lvert PF\rvert = $ distance to the directrix $l$ | $y = \dfrac{x^2}{4f}$ |

**Ellipse:** the foci lie at $(\pm e \mid 0)$ with $e = \sqrt{a^2 - b^2}$. Example: $a = 5$, $b = 3$ gives $e = 4$, so $F_{1,2}(\pm 4 \mid 0)$, and for every point the sum of the distances is $10$. This is the basis of the **gardener's method**: a string of length $2a$ is tied to two pegs and kept taut with a pencil – this draws an oval flower bed.

**Parabola:** for $y = \tfrac14 x^2$, $4f = 4$, so $f = 1$: focus $F(0 \mid 1)$, directrix $y = -1$. For every point $Q$ on the directrix you find the parabola point $P$ vertically above $Q$ on the perpendicular bisector of $F$ and $Q$. This perpendicular bisector is also the tangent at $P$ – that is why parabolic mirrors focus light at the focus.

**Hyperbola:** here $e = \sqrt{a^2 + b^2}$. The branches approach the asymptotes $y = \pm \tfrac{b}{a} x$.

**One rule for all:** with focus $F$ and directrix $l$, $\lvert PF\rvert = \varepsilon \cdot \lvert Pl\rvert$. The **eccentricity** $\varepsilon$ decides: $\varepsilon < 1$ ellipse, $\varepsilon = 1$ parabola, $\varepsilon > 1$ hyperbola.

**Tangent and reflection:** the tangent at $P$ makes equal angles with both focal rays $PF_1$ and $PF_2$. A ray of light from $F_1$ is therefore always reflected to $F_2$ by a mirrored ellipse (whispering gallery). For the parabola, light coming in parallel to the axis is reflected into the focus. For the hyperbola, light from $F_2$ seems after reflection to come from $F_1$.

**Director circle:** if you draw a circle of radius $2a$ around $F_1$ and choose a point $Q$ on it, the perpendicular bisector of $Q$ and $F_2$ meets the line $F_1Q$ at a point $P$ of the curve. Because $\lvert PF_2\rvert = \lvert PQ\rvert$, we get $\lvert PF_1\rvert + \lvert PF_2\rvert = 2a$. If $F_2$ lies outside the circle, a hyperbola results.

**Conic sections:** if you cut a double cone with a plane, depending on the tilt you get a circle, an ellipse, a parabola (plane parallel to a generator) or a hyperbola (plane cuts both halves of the cone).

## Try it

1. Play the gardener's method and then drag $P$ along the ellipse. What stays the same? [Ellipse](?mode=ellipse&a=5&b=3&t=50)
2. Set $a = b$. Where are the foci now? [Circle](?mode=ellipse&a=4&b=4&t=30)
3. Drag $P$ along the parabola. Are the two coloured segments always the same length? [Parabola](?mode=parabola&f=1&t=50)
4. Slowly change $\varepsilon$ from $0$ to $2$. At what value does the curve open up? [Eccentricity](?mode=focal&eps=0.8&d=2.25&t=60)
5. Tilt the plane through the cone. At what angle do you get exactly a parabola? [Cone](?mode=cone&alpha=30&beta=35&h=1)
6. Switch on the tangent and drag $P$. Do the two angles stay equal? [Whispering gallery](?mode=ellipse&a=5&b=3&t=70&tan=1) · [Parabolic mirror](?mode=parabola&f=1.5&t=60&tan=1)
7. Drag $Q$ once around the director circle. Which curve does $P$ draw? [Director circle](?mode=ellipse&a=4&b=3&t=40&cons=circle)
8. Practice: drag the foci to the right place and check. [Practice](?mode=quiz&q=1)
9. Planetary orbit: increase the launch speed from 0.6 to 1.8. When does the ellipse become a parabola, when a hyperbola? [Planet](?mode=orbit&ov=1.2) · [Comet](?mode=orbit&ov=1.37)
10. General equation: change $B$. How does the ellipse rotate, and from when does it become a hyperbola? [Rotated ellipse](?mode=general&gA=1&gB=1&gC=2&gD=0&gE=0&gF=-4) · [xy = 1](?mode=general&gA=0&gB=1&gC=0&gD=0&gE=0&gF=-1)

## Exercises

### Exercise 1: Ellipse

An ellipse has $a = 5$ and $b = 3$. Find the foci and the sum of the distances.

<details>
<summary>Show solution</summary>

$e = \sqrt{25 - 9} = 4$, so $F_{1,2}(\pm 4 \mid 0)$. The sum of the distances is $2a = 10$. [Show in the simulation](?mode=ellipse&a=5&b=3&t=50)

</details>

### Exercise 2: Parabola

Find the focus and the directrix of the parabola $y = \tfrac14 x^2$.

<details>
<summary>Show solution</summary>

$\tfrac{1}{4f} = \tfrac14$, so $f = 1$: $F(0 \mid 1)$, directrix $y = -1$. [Show in the simulation](?mode=parabola&f=1&t=50)

</details>

### Exercise 3: Gardener's method

A gardener wants to lay out an oval bed 6 m long and 4 m wide. How far apart must the pegs be, and how long is the string?

<details>
<summary>Show solution</summary>

$a = 3$, $b = 2$, $e = \sqrt{9 - 4} = \sqrt5 \approx 2.24$ m. So the pegs are about $4.47$ m apart, and the string is $2a = 6$ m long. [Show in the simulation](?mode=ellipse&a=3&b=2&t=40)

</details>

### Exercise 4: Shifted ellipse

Where are the foci of the ellipse $\dfrac{(x-2)^2}{2.25} + \dfrac{(y+1)^2}{6.25} = 1$?

<details>
<summary>Show solution</summary>

Centre $(2 \mid -1)$. The larger number $6.25$ belongs to $y$, so the long axis is vertical: $a = 2.5$, $b = 1.5$, $e = \sqrt{6.25 - 2.25} = 2$. Foci $F_1(2 \mid -3)$ and $F_2(2 \mid 1)$. [Practise in the simulation](?mode=quiz&q=2)

</details>

### Exercise 5: Which curve?

What kind of conic section does $x^2 + 4xy + y^2 = 3$ describe?

<details>
<summary>Show solution</summary>

$B^2 - 4AC = 16 - 4 = 12 > 0$: a hyperbola. Its axes are rotated by $45°$, because $A = C$. [Show in the simulation](?mode=general&gA=1&gB=4&gC=1&gD=0&gE=0&gF=-3)

</details>

## Ideas for the classroom

- **Use:** loci hands-on (string, pegs, folded paper), then in the simulation; link to parabolas as graphs of functions.
- **Practice:** in the practice view every task has a number. The same number means the same task, so everyone can work on the same curve.
- **Applications:** planetary orbits (ellipses with the Sun at a focus), parabolic mirrors and satellite dishes, whispering galleries.
- **Common pitfalls:**
  - For the ellipse, calculating $e = \sqrt{a^2 + b^2}$ instead of $\sqrt{a^2 - b^2}$ (that only holds for the hyperbola).
  - Assuming the focus of the parabola is at $(0 \mid a)$ instead of $(0 \mid \tfrac{1}{4a})$.
