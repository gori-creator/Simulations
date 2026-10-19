---
description: "Interactive simulation for year 9: approximate square roots with Heron’s method – a rectangle turns into a square step by step – and with nested intervals on a number line with a magnifier; plus why √2 is not a fraction, plus the spiral of Theodorus constructing √2 to √17."
---

## What is it about?

$\sqrt{a}$ is the non-negative number whose square is $a$ – the side of a square with area $a$. For natural numbers that are not perfect squares, $\sqrt{a}$ is **irrational** and can only be approximated.

**Heron’s method:** start with a rectangle of area $a$ and take the mean of its sides as the new length: $x_{n+1} = \frac{1}{2}\left(x_n + \frac{a}{x_n}\right)$. The area stays $a$ and the rectangle becomes a square very quickly.

**Nested intervals:** $1.4^2 = 1.96 < 2 < 2.25 = 1.5^2$, so $1.4 < \sqrt{2} < 1.5$; each digit makes the interval ten times shorter.

## Try it

1. [√2 with Heron](?a=2&x0=2) and [√10 from a long rectangle](?a=10&x0=10).
2. [Nesting √2](?mode=nest&a=2) and [√25](?mode=nest&a=25).

- [Spiral of square roots](?mode=spiral): each triangle has the legs $\sqrt{n}$ and $1$, so by Pythagoras the hypotenuse is $\sqrt{n + 1}$. A compass transfers each length to the number line – where does it land exactly on a whole number?

## Tasks

### Task 1: Heron by hand

Two approximations of $\sqrt{10}$ with $x_0 = 3$? [Load task](?a=10&x0=3)

<details>
<summary>Show solution</summary>

$x_1 = \frac{19}{6} \approx 3.1667$, $x_2 \approx 3.162281$ ($\sqrt{10} \approx 3.162278$).

</details>

### Task 2: An interval

Between which numbers with one decimal place is $\sqrt{3}$? [Load task](?mode=nest&a=3)

<details>
<summary>Show solution</summary>

$1.7^2 = 2.89 < 3 < 3.24 = 1.8^2$.

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- The rectangle picture explains Heron’s method without a formula.
- **Common stumbling blocks:** treating $1.41$ as the exact value of $\sqrt{2}$, not checking interval bounds by squaring, averaging the width as well.
