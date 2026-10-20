---
description: "Interactive simulation for grade 9: square roots as the side of a square on squared paper, Heron’s method as a rectangle that becomes a square step by step, nested intervals with a magnifier and checks by squaring – and why √2 is not a fraction."
---

## What is it about?

The **square root** $\sqrt{a}$ (for $a \geq 0$) is the non-negative number whose square is $a$: $\left(\sqrt{a}\right)^2 = a$. Geometrically, $\sqrt{a}$ is the **side of a square with area $a$**. Laying $a$ unit squares as growing squares ($1 + 3 + 5 + \ldots$) only works out exactly for **square numbers** ($\sqrt{49} = 7$). Otherwise $\sqrt{a}$ lies between two whole numbers: $49 < 50 < 64$, so $7 < \sqrt{50} < 8$. With a square factor you can simplify: $\sqrt{50} = \sqrt{25 \cdot 2} = 5\sqrt{2} \approx 7.071$.

**Heron’s method:** start with a rectangle of area $a$ with sides $x_0$ and $\frac{a}{x_0}$. The new side is the **mean** of the two sides, the other side is again $a$ divided by it:

$$
x_{n+1} = \frac{x_n + \frac{a}{x_n}}{2}
$$

Cutting a strip off the long side and putting it on the short side gives almost a square with side $x_{n+1}$ – only a small corner is missing. So from the first step on, $x_{n+1}$ is slightly above $\sqrt{a}$ and $\frac{a}{x_{n+1}}$ slightly below. The number of correct digits roughly doubles: for $\sqrt{2}$ from $x_0 = 2$ we get $1.5$, $\frac{17}{12} \approx 1.416667$, $\frac{577}{408} \approx 1.4142157$.

**Nested intervals:** $1.4 < \sqrt{2} < 1.5$ because $1.96 < 2 < 2.25$; $1.41 < \sqrt{2} < 1.42$ because $1.9881 < 2 < 2.0164$. Each digit makes the interval ten times shorter.

**$\sqrt{2}$ is irrational:** the square on the diagonal of the unit square is made of four half unit squares, so it has area $2$ and the diagonal is $\sqrt{2}$ long. If $\sqrt{2} = \frac{p}{q}$ were fully reduced, then $p^2 = 2q^2$, so $p$ is even, $p = 2r$, and $q^2 = 2r^2$, so $q$ is even too – a contradiction.

## Try it

1. [49 unit squares](?mode=square&a=49): press “Lay the square” and compare with [50](?mode=square&a=50). Drag the green corner.
2. [√2 with Heron](?a=2&x0=2): press “Next step” and watch the strip and the missing corner. Bold digits in the table are correct.
3. [A long rectangle](?a=10&x0=10): try other starting lengths by dragging the blue corner at step 0.
4. [Nesting √2](?mode=nest&a=2): tap the subinterval that contains $\sqrt{2}$.
5. [√2 is not a fraction](?mode=irr): go through the proof step by step.

## Tasks

### Task 1: Between square numbers

Between which whole numbers does $\sqrt{50}$ lie? Simplify $\sqrt{50}$. [Load task](?mode=square&a=50&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$7^2 = 49 < 50 < 64 = 8^2$, so $7 < \sqrt{50} < 8$, and $\sqrt{50} = \sqrt{25 \cdot 2} = 5\sqrt{2} \approx 7.071$. [Show](?mode=square&a=50)

</details>

### Task 2: Heron by hand

Find two approximations of $\sqrt{10}$ with Heron’s method, starting at $x_0 = 3$. [Load task](?a=10&x0=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$x_1 = \frac{3 + 10/3}{2} = \frac{19}{6} \approx 3.16667$, $x_2 = \frac{721}{228} \approx 3.162281$; $\sqrt{10} \approx 3.162278$. [Show](?a=10&x0=3&n=2)

</details>

### Task 3: Nested intervals

Between which numbers with one and with two decimal places does $\sqrt{3}$ lie? [Load task](?mode=nest&a=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1.7^2 = 2.89 < 3 < 3.24 = 1.8^2$ and $1.73^2 = 2.9929 < 3 < 3.0276 = 1.74^2$. [Show](?mode=nest&a=3&n=2)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Grade 9, topic “square roots” (definition, approximation methods, irrational and real numbers). The squares view suits an introduction, Heron and nested intervals the main phase, the proof a deeper look.
- With “Show values” off (`show=0`), $\sqrt{a}$ and the approximations appear as “?” in the picture.
- **Common stumbling blocks:**
  - “$\sqrt{2} = 1.41$” – only an approximation, since $1.41^2 = 1.9881$.
  - Averaging both sides in Heron’s method instead of computing $a : x$ – the area is then no longer $a$.
  - $\sqrt{a + b} = \sqrt{a} + \sqrt{b}$ – false ($\sqrt{9 + 16} = 5 \neq 7$); only $\sqrt{a \cdot b} = \sqrt{a} \cdot \sqrt{b}$ holds.
