---
description: "Function plotter for your own expressions: up to three graphs with zoom, a traced point, a table of values, approximate zeros, intersections and turning points, poles, gaps in the domain and families of functions."
---

## What is it about?

A **function plotter** draws the graph of an expression. Type up to three expressions $f(x)$, $g(x)$ and $h(x)$. The simulation typesets each one, so you can see **how your input was understood**, and draws the graph. If there is a typo, the spot is marked and explained.

| Input | means |
| --- | --- |
| `2x`, `3(x+1)` | $2x$, $3(x+1)$ – the multiplication sign may be left out |
| `x^2`, `2^x`, `x^(1/2)` | $x^2$, $2^x$, $x^{\frac{1}{2}}$ |
| `1/(x-1)` | $\dfrac{1}{x-1}$ – put the denominator in brackets |
| `sqrt(x)`, `abs(x)` | $\sqrt{x}$, $\lvert x \rvert$ |
| `sin(x)`, `e^x`, `ln(x)`, `log_2(x)` | angles in radians |
| `pi`, `e`, `a`, `b` | constants and parameters (sliders appear) |

The usual order of operations applies, so `1/2x` means $\frac{1}{2} \cdot x$; for $\frac{1}{2x}$ type `1/(2x)`.

The simulation can mark **zeros**, **intersections** (solutions of $f(x) = g(x)$), **maxima and minima**, **poles** (dashed asymptotes) and **holes** in the visible window. These are **approximations** rounded to two decimal places ($\approx$). Unlike a naive plotter, it never joins the two sides of a pole with a vertical line – that line would not belong to the graph.

## Try it

1. Load [parabola and sine](?f=x%5E2%20-%202&g=2sin%28x%29) and drag the traced point. Roughly which numbers solve $x^2 - 2 = 2 \sin x$?
2. Type `1/x` for $h(x)$, pan and zoom.
3. Make deliberate mistakes such as `2x+` or `sinus(x)`.
4. Change $a$ in the [family of parabolas](?f=a%20x%5E2&g=&a=0.5&sch=1&sct=0).
5. Compare [x² and 2ˣ](?f=x%5E2&g=2%5Ex&nst=0&x1=-3&x2=5&y1=-2&y2=18&eq=0&tx=3): how many intersections are there?
6. Look at [(x² − 1)/(x − 1)](?f=%28x%5E2%20-%201%29%2F%28x%20-%201%29&g=) near $x = 1$.

## Tasks

### Task 1: Zeros

[Load task](?f=x%5E3%20-%202x%20-%201&g=&nst=0&ext=0&_hide=1) Use the trace to find the zeros of $f(x) = x^3 - 2x - 1$ to two decimal places.

<details>
<summary>Show solution</summary>

$x_1 = -1$ exactly, $x_2 \approx -0.62$, $x_3 \approx 1.62$ (exactly $\frac{1 \pm \sqrt{5}}{2}$). [Show](?f=x%5E3%20-%202x%20-%201&g=&nst=1)

</details>

### Task 2: Solving graphically

[Load task](?f=2%5Ex&g=3%20-%20x&nst=0&sct=0&_hide=1) Solve $2^x = 3 - x$ graphically. Why is there only one solution?

<details>
<summary>Show solution</summary>

$x = 1$, since $2^1 = 2 = 3 - 1$. $2^x$ always increases and $3 - x$ always decreases, so the graphs meet only once.

</details>

### Task 3: Pole or hole?

[Load task](?f=%28x%5E2%20-%204%29%2F%28x%20-%202%29&g=%28x%20%2B%202%29%2F%28x%20-%202%29&asy=0&nst=0&sct=0&_hide=1) Both functions are undefined at $x = 2$. How do the graphs differ there?

<details>
<summary>Show solution</summary>

$f(x) = x + 2$ for $x \neq 2$: a line with a **hole** at $(2, 4)$. $g$ cannot be simplified; its values grow without bound: a **pole** with asymptote $x = 2$. [Show](?f=%28x%5E2%20-%204%29%2F%28x%20-%202%29&g=%28x%20%2B%202%29%2F%28x%20-%202%29&asy=1&nst=0&sct=0)

</details>

## Notes for teachers

- **Use:** from grade 8 (functions and their graphs) up to calculus and university; tangents and families of functions for upper grades.
- Expressions are evaluated by a custom parser (no `eval`). In task links, hide the result lists with `_hide=1` and switch off the marks in the picture (`nst=0`, `sct=0`, `ext=0`, `asy=0`).
- All special points are numerical approximations within the window; very flat turning points may be missed.
- **Misconceptions:** the vertical line at a pole is part of the graph; the computer gives exact values; `1/2x` instead of `1/(2x)`; expecting degrees in `sin(x)`.
