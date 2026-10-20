---
description: "Interactive simulation for year 11: Newton’s method step by step – vertical line to the graph, tangent, x-intercept, the slope triangle behind the formula, a magnifier for tiny steps, a table with the correct digits in bold, Newton = Heron for √2 and the cases where the method fails."
---

## What is it about?

Many equations cannot be solved for $x$, e.g. $x^3 - 2x - 5 = 0$ or $\cos x = x$. **Newton’s method** approximates a zero of $f$: start at $x_0$, go straight up (or down) to the graph, draw the **tangent** at $(x_n \mid f(x_n))$ and take its $x$-intercept as the next value $x_{n+1}$.

The vertical line, the $x$-axis and the tangent form a **slope triangle** with legs $f(x_n)$ and $x_n - x_{n+1}$. The slope of the tangent is $f'(x_n)$, so

$$f'(x_n) = \frac{f(x_n)}{x_n - x_{n+1}} \quad\Longrightarrow\quad x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}.$$

For $f(x) = x^2 - 2$ and $x_0 = 1$: $x_1 = 1.5$, $x_2 = \frac{17}{12} \approx 1.416667$, $x_3 \approx 1.4142157$. Here Newton’s method is exactly **Heron’s method**: $x_{n+1} = \frac12\left(x_n + \frac{2}{x_n}\right)$.

Near a simple zero the error is roughly squared in each step, $e_{n+1} \approx C \cdot e_n^2$ – the number of correct digits **roughly doubles** ($0 \to 2 \to 5 \to 11$ for $\sqrt2$). The method fails for a **horizontal tangent** ($f'(x_n) = 0$), can **jump** to a distant zero when starting near a turning point, can end in a **cycle**, and is slow at a **double zero**.

## Try it

1. [√2 with x₀ = 1](?fn=sq2&x0=1&k=0): press “Next step” and follow the animation, then “Play all”. From step 2 on the magnifier shows the tiny steps.
2. Drag $x_0$ or tap the $x$-axis. What happens at $x_0 = 0$?
3. [Newton’s example](?fn=cubic&x0=2&k=3) and [cos x = x](?fn=cos&x0=1&k=3).
4. [Horizontal tangent](?fn=three&x0=1&k=1), [jump to another zero with basins](?fn=three&x0=0.95&k=5&basin=1), [cycle](?fn=cycle&x0=0&k=4) and [double zero](?fn=dbl&x0=2&k=8).

## Tasks

### Task 1: Two steps by hand

For $f(x) = x^2 - 2$ and $x_0 = 2$ find $x_1$ and $x_2$. [Load task](?fn=sq2&x0=2&k=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$x_1 = 2 - \frac{2}{4} = 1.5$; $x_2 = 1.5 - \frac{0.25}{3} = \frac{17}{12} \approx 1.41667$ – the same numbers as Heron’s method. [Show](?fn=sq2&x0=2&k=2)

</details>

### Task 2: Newton’s own example

Find the zero of $f(x) = x^3 - 2x - 5$ to six decimal places, starting at $x_0 = 2$. [Load task](?fn=cubic&x0=2&k=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f(2) = -1$, $f'(2) = 10$, so $x_1 = 2.1$. $f(2.1) = 0.061$, $f'(2.1) = 11.23$, so $x_2 \approx 2.094568$; then $x_3 \approx 2.0945515$. The zero is $x \approx 2.094551$. [Show](?fn=cubic&x0=2&k=3)

</details>

### Task 3: Why does it fail?

a) $f(x) = x^3 - 3x + 1$ with $x_0 = 1$. b) $f(x) = x^3 - 2x + 2$ with $x_0 = 0$. [a)](?fn=three&x0=1&k=1) · [b)](?fn=cycle&x0=0&k=4)

<details>
<summary>Show solution</summary>

a) $f'(1) = 3 - 3 = 0$: the tangent is horizontal and never meets the $x$-axis. b) $x_1 = 0 - \frac{2}{-2} = 1$, $x_2 = 1 - \frac{1}{1} = 0$ – an endless cycle. Starting at $x_0 = -2$ works.

</details>

## Ideas for the classroom

- Year 11, applications of differential calculus (tangent equation, zeros of polynomials).
- Let students label the slope triangle with values hidden (`show=0`) and derive the formula themselves; for $x^2 - 2$ they rediscover Heron’s method.
- Rebuild the method in a spreadsheet and race it against bisection.
- **Common stumbling blocks:** sign errors in $x_n - \frac{f(x_n)}{f'(x_n)}$; calculator in degree mode for $\cos x$; believing the method always works.
