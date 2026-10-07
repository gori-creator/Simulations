---
description: Interactive simulation of quadratic functions – parabolas in vertex form and standard form, zeros, discriminant and exercises.
---

## What is it about?

The graph of a **quadratic function** is a **parabola**. The simplest one is the **standard parabola** $y = x^2$ with its vertex at the origin.

In **vertex form** you can read off the vertex $S(d, e)$ directly:

$$
f(x) = a\,(x - d)^2 + e
$$

- $a$ determines the **opening** and the **shape**: for $a > 0$ the parabola opens upwards, for $a < 0$ downwards. For $|a| > 1$ it is **stretched** (narrower), for $|a| < 1$ **compressed** (wider).
- $d$ shifts the parabola **horizontally**. Watch the sign: $(x - 3)^2$ shifts 3 to the **right**.
- $e$ shifts the parabola **vertically**.

Expanding the brackets gives the **standard form**:

$$
f(x) = a x^2 + b x + c \quad\text{with}\quad b = -2ad,\;\; c = ad^2 + e
$$

The **discriminant** $D = b^2 - 4ac$ tells you how many zeros there are: two for $D > 0$, one (double) zero for $D = 0$ and none for $D < 0$. The zeros are

$$
x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## Explore

1. Change only $a$ – also to negative values – and compare with the dashed standard parabola. [a = 2](?a=2) [a = −0.5](?a=-0.5)
2. Set $d = 3$. Why is there a **minus** in the equation? [Load example](?d=3)
3. Drag the vertex $S$ up and down. When are there two, one or no zeros?
4. Switch to **standard form** at the top. The parabola stays the same – only the representation changes.

## Exercises

### Exercise 1: Read off the vertex form

[Load exercise](?a=0.5&d=-2&e=-4.5&_hide=1) Read off the vertex and find $a$. Write down the equation and calculate the zeros.

<details>
<summary>Show solution</summary>

Vertex $S(-2, -4.5)$ and $a = 0.5$, so $f(x) = 0.5\,(x + 2)^2 - 4.5$. Zeros: $(x + 2)^2 = 9$, so $x_1 = -5$ and $x_2 = 1$.

</details>

### Exercise 2: Throwing a ball (modelling)

A ball follows the path $h(x) = -0.2\,(x - 5)^2 + 6$ ($x$: distance in m, $h$: height in m). How high does it fly and how far? Tip: zoom out to check.

<details>
<summary>Show solution</summary>

The vertex $S(5, 6)$ is the highest point: 6 m. Landing: $(x - 5)^2 = 30 \Rightarrow x = 5 + \sqrt{30} \approx 10.5$ m. [Show in simulation](?a=-0.2&d=5&e=6)

</details>

## Notes for teachers

- **Common misconceptions:** the sign of $d$ is misread – $(x + 2)^2$ shifts to the **left**; "stretched" is confused with "wider"; the coefficient $b$ of the standard form is mistaken for a shift.
- **Exercise mode:** **Share → Hide results** hides equations, vertex and zeros, turning any setup into an exercise.
