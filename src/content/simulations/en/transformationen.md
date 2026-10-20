---
description: "Interactive simulation for year 11: shift, stretch and reflect the graph of a basic function with g(x) = a · f(b(x − c)) + d – step by step on a timeline, with draggable anchor and shape points, moving key points, a table of points and the properties of g for parabola, square root, absolute value, hyperbola, sine and exponential function."
---

## What is it about?

From a **basic function** $f$ we get $g(x) = a \cdot f\big(b\,(x - c)\big) + d$ in four steps:

1. $b$: horizontal stretch by the factor $\frac{1}{b}$ (reflection in the $y$-axis if $b < 0$),
2. $c$: shift by $c$ to the right,
3. $a$: vertical stretch by the factor $a$ (reflection in the $x$-axis if $a < 0$),
4. $d$: shift by $d$ up.

A point $(x \mid y)$ of $f$ becomes $\left(\frac{x}{b} + c \mid a y + d\right)$. Example: for $g(x) = 2(x - 1)^2 - 2$ the vertex moves to $(1 \mid -2)$ and $(2 \mid 4)$ moves to $(3 \mid 6)$. Careful: $f(2x - 1) = f\big(2(x - 0.5)\big)$ is shifted by only $0.5$.

## Try it

1. Press “Play step by step” and follow the timeline. Pause, step back and forward, or drag the knob.
2. Drag the green anchor point $(c \mid d)$ and the red shape point ($a$ and $b$), also across the anchor.
3. [Square root with b = −1](?f=sqrt&a=1&b=-1&c=2&d=0), [sine](?f=sin&a=2&b=2&c=0&d=1), [hyperbola](?f=inv&a=2&b=1&c=-1&d=1).
4. [Wrong order](?f=sq&a=1&b=2&c=1&d=0&ord=swap): first shift, then stretch – compare $h$ with $g$.

## Tasks

### Task 1: Read off the parameters

The graph comes from $f(x) = \lvert x\rvert$ (with $b = 1$). Find $a$, $c$ and $d$. [Load task](?f=abs&a=-0.5&b=1&c=-2&d=3&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Corner at $(-2 \mid 3)$, opening downwards, half as steep: $g(x) = -0.5 \cdot \lvert x + 2\rvert + 3$. [Show](?f=abs&a=-0.5&b=1&c=-2&d=3)

</details>

### Task 2: Mind the bracket

By how much is $g(x) = (2x - 4)^2$ shifted compared with $f(x) = (2x)^2$?

<details>
<summary>Show solution</summary>

$g(x) = \big(2(x - 2)\big)^2$: shifted by $2$ to the right, not by $4$. [Show](?f=sq&a=1&b=2&c=2&d=0)

</details>

### Task 3: Build a sine curve

Find $g(x) = a \sin(bx) + d$ with amplitude $2$, period $\pi$ and midline $y = 1$. [Load task](?f=sin&a=1&b=1&c=0&d=0)

<details>
<summary>Show solution</summary>

$a = 2$, $\frac{2\pi}{b} = \pi \Rightarrow b = 2$, $d = 1$: $g(x) = 2\sin(2x) + 1$ with range $[-1, 3]$. [Show](?f=sin&a=2&b=2&c=0&d=1)

</details>

### Task 4: Asymptotes and zeros

Give the asymptotes and the zero of $g(x) = \frac{2}{x + 1} + 1$.

<details>
<summary>Show solution</summary>

Asymptotes $x = -1$ and $y = 1$; zero: $\frac{2}{x + 1} = -1 \Rightarrow x = -3$. [Show](?f=inv&a=2&b=1&c=-1&d=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Pause the timeline after each step and let the class predict where the graph goes next.
- Switch off “Show the term and the effects” for a guessing game; “New task” rolls new values, “Reveal the term” plays the steps.
- **Common stumbling blocks:** $f(x - 2)$ moves **right**; $f(2x)$ is **compressed**; $b$ is not factored out in $f(2x - 4)$; $a < 0$ reflects in the $x$-axis, $b < 0$ in the $y$-axis; $(2x)^2 = 4x^2$, so $a$ and $b$ are not always unique.
