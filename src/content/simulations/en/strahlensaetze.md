---
description: "Interactive simulation for year 9: discover the intercept theorems in the V and X shape – the parallel slides from AB to A′B′, coloured scale bars show the common factor k, and without parallels the ratios fall apart. Plus unknown lengths solved step by step and two applications: a tree’s height from its shadow and the width of a pond."
---

## What is it about?

Two rays from a common point $Z$ are cut by two **parallel** lines: the first ray at $A$ and $A'$, the second at $B$ and $B'$. Then the **intercept theorems** hold:

$$
\frac{\overline{ZA'}}{\overline{ZA}} = \frac{\overline{ZB'}}{\overline{ZB}} \quad\text{(1st theorem, also } \tfrac{\overline{ZA}}{\overline{AA'}} = \tfrac{\overline{ZB}}{\overline{BB'}}\text{)}, \qquad \frac{\overline{A'B'}}{\overline{AB}} = \frac{\overline{ZA'}}{\overline{ZA}} \quad\text{(2nd theorem)}
$$

The common value is the **scale factor** $k$: triangle $ZA'B'$ is an enlargement of $ZAB$ with centre $Z$ – the triangles are **similar**. In the **X shape** the parallels lie on different sides of $Z$ (shown as $k < 0$); the theorems hold with lengths measured from $Z$. The "pieces" form only works on the rays, not for the parallels.

If $AB$ and $A'B'$ are not parallel, the ratios differ. **Converse of the 1st theorem:** equal ratios imply parallel lines. The **converse of the 2nd theorem is false** – a second point $B''$ can give the same ratio $\overline{A'B''} : \overline{AB}$ without being parallel.

To find an unknown length, set up a proportion with $x$ in the numerator, e.g. $\frac{x}{\overline{ZB}} = \frac{\overline{ZA'}}{\overline{ZA}}$, and multiply.

## Try it

1. Press **“Slide the parallel”** and watch the scale bars: all three ratios count up together.
2. [Reduction with $k = 0.5$](?k=0.5&a=6&b=7), [special case $k = 1$](?k=1), [a very acute angle](?th=10&k=3&a=8&b=8).
3. [X shape](?mode=x&a=4&b=5&k=0.75): slide the parallel – it passes through $Z$.
4. [Not parallel](?par=0&kb=1.4): which bars no longer match? Press “Adjust B′ (converse)”.
5. [Unknown length x](?mode=calc&ask=bb2&a=2.5&b=3&c=2&k=2.4): choose the unknown and solve step by step.
6. [Tree height](?mode=baum&ht=12&st=1.5&el=36.87) and [pond width](?mode=teich&w=24&kt=4): play the measurement, then drag the sun or $A'$.

## Tasks

### Task 1: 1st theorem

$\overline{ZA} = 3\,\text{cm}$, $\overline{ZA'} = 6\,\text{cm}$, $\overline{ZB} = 4\,\text{cm}$, $AB \parallel A'B'$. Find $\overline{ZB'}$. [Load task](?mode=calc&ask=zb2&a=3&b=4&c=2.6&k=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{x}{4\,\text{cm}} = \frac{6}{3} = 2$, so $\overline{ZB'} = 8\,\text{cm}$. [Show](?mode=calc&ask=zb2&a=3&b=4&c=2.6&k=2)

</details>

### Task 2: 2nd theorem

$\overline{ZA} = 4\,\text{cm}$, $\overline{ZA'} = 10\,\text{cm}$, $\overline{AB} = 3\,\text{cm}$. Find $\overline{A'B'}$. [Load task](?mode=calc&ask=a2b2&a=4&b=5&c=3&k=2.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{x}{3\,\text{cm}} = \frac{10}{4} = 2.5$, so $\overline{A'B'} = 7.5\,\text{cm}$. Using $\overline{AA'} : \overline{ZA} = 1.5$ would be wrong – measure from $Z$. [Show](?mode=calc&ask=a2b2&a=4&b=5&c=3&k=2.5)

</details>

### Task 3: Tree and pond

A $1.5\,\text{m}$ stick stands $2\,\text{m}$, the tree $16\,\text{m}$ from the common shadow tip. How tall is the tree? For a pond, $\overline{ZA'} = \frac14\,\overline{ZA}$, $\overline{ZB'} = \frac14\,\overline{ZB}$ and $\overline{A'B'} = 6\,\text{m}$. How wide is it? [Tree](?mode=baum&ht=12&st=1.5&el=36.87&show=0&_hide=1) · [Pond](?mode=teich&w=24&kt=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$h = 1.5\,\text{m} \cdot \frac{16}{2} = 12\,\text{m}$. Pond: equal ratios make $A'B' \parallel AB$, so $\overline{AB} = 4 \cdot 6\,\text{m} = 24\,\text{m}$.

</details>

### Task 4: Parallel or not?

$\overline{ZA} = 3$, $\overline{ZA'} = 6$, $\overline{ZB} = 4$, $\overline{ZB'} = 5.6$ (cm). Are $AB$ and $A'B'$ parallel?

<details>
<summary>Show solution</summary>

No: $6 : 3 = 2$ but $5.6 : 4 = 1.4$. A parallel would need $\overline{ZB'} = 8\,\text{cm}$. [Show](?par=0&kb=1.4)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Use “Slide the parallel” to prompt a conjecture, then let the cards confirm it with numbers. Switch off “Show the result” (`show=0`) to turn the pictures into exercises.
- The tree and pond tasks can be measured outside with a stick, ranging poles and a tape.
- **Common stumbling blocks:** using $\overline{AA'}$ instead of $\overline{ZA'}$ in the 2nd theorem; applying the theorems without parallels; adding lengths across $Z$ in the X shape; swapping numerator and denominator; concluding parallelism from $\overline{A'B'} : \overline{AB} = k$.
