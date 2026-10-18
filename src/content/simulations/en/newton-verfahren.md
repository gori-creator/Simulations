---
description: "Interactive simulation for year 11: Newton’s method step by step – draw the tangent, use its x-intercept as the next approximation, with a draggable starting value, a table of correct digits and cases where the method fails."
---

## What is it about?

Newton’s method approximates zeros: draw the tangent at $(x_n \mid f(x_n))$ and take its $x$-intercept as the next value,

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}.$$

Near a simple zero the number of correct digits roughly doubles with every step. The method fails for a horizontal tangent, can cycle or run off, and the starting value decides which zero is found.

## Try it

1. [√2](?fn=sq2&x0=1&k=0): press “Next step” several times and watch the green digits.
2. [Zoom in](?fn=sq2&x0=1&k=3&zoom=1) and [Newton’s example](?fn=cubic&x0=2&k=2).
3. [The start value matters](?fn=three&x0=0.9&k=4) and [cycle](?fn=cycle&x0=0&k=3).

## Tasks

### Task 1: Two steps by hand

For $f(x) = x^2 - 2$ and $x_0 = 2$ find $x_1$ and $x_2$. [Load task](?fn=sq2&x0=2&k=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$x_1 = 2 - \frac{2}{4} = 1.5$; $x_2 = 1.5 - \frac{0.25}{3} \approx 1.4167$. [Show](?fn=sq2&x0=2&k=2)

</details>

### Task 2: Why does it fail?

$f(x) = x^3 - 2x + 2$, $x_0 = 0$ gives $1, 0, 1, \ldots$ Explain. [Show](?fn=cycle&x0=0&k=3)

<details>
<summary>Show solution</summary>

The tangent at $0$ hits the axis at $1$ and the tangent at $1$ hits it at $0$ again – an endless cycle.

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Derive the formula from the tangent equation with $y = 0$.
- **Common stumbling blocks:** sign errors; calculator in degree mode for $\cos x$; believing the method always works.
