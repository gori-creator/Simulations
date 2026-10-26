---
description: "Function plotter for your own expressions: up to three graphs with zoom, a traced point, a table of values, approximate zeros, intersections, maxima and minima, poles, gaps in the domain and families of functions."
---

## What is it about?

A **function plotter** draws the graph of a function expression. You type up to three expressions $f(x)$, $g(x)$ and $h(x)$. The simulation typesets each expression again – so you see at once **how your input was understood** – and draws the graph. If there is a typo, the spot is marked and the simulation explains what is missing.

| Input | means | Note |
| --- | --- | --- |
| `2x`, `3(x+1)` | $2x$, $3(x+1)$ | The multiplication sign may be left out. |
| `x^2`, `x²`, `2^x`, `x^(1/2)` | $x^2$, $x^2$, $2^x$, $x^{\frac{1}{2}}$ | Powers with `^`, longer exponents in brackets |
| `0.5x` or `0,5x` | $0.5x$ | Point or comma |
| `1/(x-1)` | $\dfrac{1}{x-1}$ | Put the denominator in brackets! |
| `sqrt(x)` or `√x` | $\sqrt{x}$ | |
| `abs(x-1)` or bars | $\lvert x-1 \rvert$ | |
| `sin(x)`, `cos x`, `tan(2x)` | $\sin x$, $\cos x$, $\tan 2x$ | Angles in radians |
| `e^x`, `exp(x)`, `ln(x)`, `lg(x)`, `log_2(x)` | $e^x$, $e^x$, $\ln x$, $\lg x$, $\log_2 x$ | `exp(x)` is another way of writing $e^x$. |
| `pi` or `π`, `e` | $\pi \approx 3.14$, $e \approx 2.72$ | Constants |
| `a`, `b` | parameters | Sliders appear for them. |

The usual **order of operations** applies: powers before multiplication and division before addition and subtraction, otherwise from left to right; only towers of powers are evaluated from the top down: `2^3^2` is $2^{(3^2)} = 2^9$. So `1/2x` means the same as $\frac{1}{2} \cdot x$ – if you mean $\frac{1}{2x}$, type `1/(2x)`. And `-x^2` is $-x^2$ (square first), not $(-x)^2$.

On request, the simulation marks **special points** in the visible window:

- **Zeros** (also touching points as for $x^2$): there $f(x) = 0$.
- **Intersections** of two graphs: their $x$-values are the solutions of the equation $f(x) = g(x)$.
- **Maxima and minima**.
- **Poles** (dashed vertical asymptote), **gaps in the domain** (hole in the graph) and **ends of the domain** as for $\sqrt{x}$.

The values are **approximations**: the program samples the graph and narrows the points down step by step by halving intervals. They are shown rounded to two decimal places, marked by the sign $\approx$. Exact values such as $\sqrt{2}$ can only be found by calculating.

**No vertical lines at poles:** a simple plotter joins the last point to the left of a pole with the first point to the right of it – this creates a vertical line that does **not** belong to the graph. Here the program checks between each pair of points whether the graph “jumps”; if so, the points are not joined.

With the **trace** you move a point along the graph and read off its coordinates; it snaps to special points. The **table of values** shows the function values from a start value with a step $\Delta x$ of your choice.

## Try it

1. Load [parabola and sine](?f=x%5E2%20-%202&g=2sin%28x%29). Drag the traced point along the graph or tap the green graph. Roughly which numbers solve the equation $x^2 - 2 = 2 \sin x$?
2. Type the expression `1/x` for $h(x)$. Where is the graph not defined? Pan the window with the mouse or your finger and zoom with the buttons.
3. Make deliberate mistakes: `2x+`, `sinus(x)` or `x2`. What does the simulation report?
4. Load the [family of parabolas](?f=a%20x%5E2&g=&a=0.5&sch=1&sct=0) $f_a(x) = a x^2$ and change $a$. What happens for $a < 0$, for $a = 0$ and for large $a$?
5. Compare [x² and 2ˣ](?f=x%5E2&g=2%5Ex&nst=0&x1=-3&x2=5&y1=-2&y2=18&eq=0&tx=3). How many intersections are there? Which function grows faster in the long run? Zoom out.
6. Load [three sine curves](?f=sin%28x%29&g=2sin%28x%29&h=sin%282x%29&nst=0&sct=0&pi=1&x1=-6.5&x2=6.5&y1=-3&y2=3&eq=0) with the $x$-axis in multiples of $\pi$. How can you see the amplitude, how the period?
7. Investigate the [tangent function](?f=tan%28x%29&g=&pi=1&x1=-6.5&x2=6.5): where are its zeros, where its poles?
8. Type [(x² − 1)/(x − 1)](?f=%28x%5E2%20-%201%29%2F%28x%20-%201%29&g=). The graph looks like a straight line – but what happens at $x = 1$?
9. *(From grade 11)* Switch on the [tangent](?f=x%5E3%20-%203x&g=&tg=1&tx=2) and drag the traced point. Where is the tangent horizontal?

## Tasks

### Task 1: Zeros approximately

[Load task](?f=x%5E3%20-%202x%20-%201&g=&nst=0&ext=0&_hide=1) Use the trace to find the zeros of $f(x) = x^3 - 2x - 1$ to two decimal places. One of them is a whole number – show by substituting that it is exact.

<details>
<summary>Show solution</summary>

$x_1 = -1$ (exactly: $(-1)^3 - 2 \cdot (-1) - 1 = -1 + 2 - 1 = 0$), $x_2 \approx -0.62$ and $x_3 \approx 1.62$. After dividing by $(x + 1)$, $x^2 - x - 1 = 0$ remains, with the exact solutions $\frac{1 \pm \sqrt{5}}{2}$. [Show in the simulation](?f=x%5E3%20-%202x%20-%201&g=&nst=1)

</details>

### Task 2: Solving an equation graphically

[Load task](?f=2%5Ex&g=3%20-%20x&nst=0&sct=0&_hide=1) Solve $2^x = 3 - x$ graphically. Explain why there cannot be another solution.

<details>
<summary>Show solution</summary>

The graphs intersect at $(1, 2)$, so $x = 1$. Check: $2^1 = 2$ and $3 - 1 = 2$. There are no other solutions, because $2^x$ always increases and $3 - x$ always decreases – the graphs can meet only once. [Show](?f=2%5Ex&g=3%20-%20x&nst=0&sct=1)

</details>

### Task 3: What did the plotter understand?

[Load task](?f=1%2F2x&g=1%2F%282x%29&nst=0&sct=0&_hide=1) Lea wants to draw $\frac{1}{2x}$ and types `1/2x`, Tom types `1/(2x)`. Which graph belongs to whom? Who is right?

<details>
<summary>Show solution</summary>

`1/2x` is calculated from left to right: $\frac{1}{2} \cdot x$ – a line through the origin with slope $\frac{1}{2}$ (blue). Only `1/(2x)` gives $\frac{1}{2x}$, a hyperbola with a pole at $x = 0$ (green). Tom is right; the typeset formula in the “Expressions” card shows the difference.

</details>

### Task 4: A family of parabolas

[Load task](?f=x%5E2%20-%202x%20%2B%20a&g=&a=0&sch=1&nst=0&_hide=1) For which values of $a$ does the graph of $f_a(x) = x^2 - 2x + a$ have two zeros, one zero or none? Try it with the slider and give a reason by calculation.

<details>
<summary>Show solution</summary>

The vertex is at $(1, a - 1)$. For $a < 1$ it lies below the $x$-axis: two zeros. For $a = 1$ the parabola touches the $x$-axis at $x = 1$: one zero. For $a > 1$: none. By calculation: discriminant $D = 4 - 4a$. [Show the borderline case](?f=x%5E2%20-%202x%20%2B%20a&g=&a=1&nst=1)

</details>

### Task 5: Pole or hole?

[Load task](?f=%28x%5E2%20-%204%29%2F%28x%20-%202%29&g=%28x%20%2B%202%29%2F%28x%20-%202%29&asy=0&nst=0&sct=0&_hide=1) Both functions are not defined at $x = 2$. Describe how the graphs differ there and explain the difference using the expressions.

<details>
<summary>Show solution</summary>

$f(x) = \frac{x^2 - 4}{x - 2} = \frac{(x - 2)(x + 2)}{x - 2} = x + 2$ for $x \neq 2$: the graph is a line with a **hole** at $(2, 4)$ – a removable gap in the domain. $g$ cannot be simplified; the numerator is not zero at $x = 2$. The values grow without bound: a **pole** with the vertical asymptote $x = 2$. [Show](?f=%28x%5E2%20-%204%29%2F%28x%20-%202%29&g=%28x%20%2B%202%29%2F%28x%20-%202%29&asy=1&nst=0&sct=0)

</details>

### Task 6: Tangent (from grade 11)

[Load task](?f=x%5E3%20-%203x&g=&tg=0&tx=2&ext=0&nst=0&_hide=1) For $f(x) = x^3 - 3x$, calculate the slope $f'(2)$ and the equation of the tangent at $x = 2$. Then check with “Tangent at the traced point”. At which points is the tangent horizontal?

<details>
<summary>Show solution</summary>

$f'(x) = 3x^2 - 3$, so $f'(2) = 9$, and with $f(2) = 2$: $t(x) = 9(x - 2) + 2 = 9x - 16$. Horizontal tangents where $f'(x) = 0$, i.e. $x = \pm 1$: maximum $(-1, 2)$, minimum $(1, -2)$. [Show the tangent as g(x)](?f=x%5E3%20-%203x&g=9x%20-%2016&tg=1&tx=2&ext=1)

</details>

## Ideas for the classroom

- **Use:** grade 8, functions and terms (drawing and investigating graphs with a function plotter), then as a tool through all grades: quadratic functions and families (9), power, exponential and sine functions (10), rational functions and derivatives (11–13), and also at university.
- **Safe and privacy-friendly:** the expressions are evaluated by a custom reader (no `eval`, nothing is sent anywhere). Shared links contain the expressions, the window and all settings; `_hide=1` covers the result lists, and in task links you switch off the marks in the picture one by one (`nst=0`, `sct=0`, `ext=0`, `asy=0`).
- **Numerics:** all special points are approximations within the visible window. Very flat turning points (e.g. for $x^{10}$) or zeros very close together can be missed; removable gaps are searched for on a grid of quarters. Powers with a negative base are only defined for whole-number exponents (as in school): `x^(1/3)` is not defined for $x < 0$. $0^0$ is not defined either: the graph of `x^0` has a hole at $(0, 1)$. Very large values (from one billion) are shown as powers of ten, e.g. $1.07 \cdot 10^9$. Anything beyond about $10^{308}$ (e.g. $e^{x^2}$ at $x = 30$) cannot be represented by the computer; then it says “too large” instead of “not defined”.
- **Common stumbling blocks:**
  - “The vertical line at the pole belongs to the graph.” – It only appears when a plotter joins points blindly.
  - “The computer gives exact values.” – It rounds; $1.41$ is not $\sqrt{2}$.
  - `1/2x` instead of `1/(2x)`, `-x^2` instead of `(-x)^2`, expecting degrees in `sin(x)`.
  - “The graph stops at the edge of the picture.” – Zooming out shows how it continues.
