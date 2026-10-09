---
description: "Interactive simulation for solving equations graphically: both sides as graphs, solutions as x-coordinates of the intersections, difference function, touching points, fractional and absolute value equations and bisection with a magnifier."
---

## What is it about?

An equation such as $x^2 - 1 = 0.5x + 2$ compares two expressions. Read both sides as **functions**, $f(x) = x^2 - 1$ and $g(x) = 0.5x + 2$: you are looking for all $x$ at which both have **the same value** – exactly where the graphs of $f$ and $g$ **intersect** (or touch).

1. Draw the graphs of both sides.
2. Find the points of intersection.
3. Read off their **$x$-coordinates** – these are the solutions: here $S = \{-1.5,\ 2\}$.
4. **Check** by substituting into both sides: $f(2) = 2^2 - 1 = 3 = 0.5 \cdot 2 + 2 = g(2)$ ✓.

Two intersections mean two solutions, a **touching point** gives one, no common point gives none and coinciding graphs give infinitely many. Equivalently, the solutions are the **zeros** of the difference function $h(x) = f(x) - g(x)$: subtracting $g(x)$ moves every intersection straight down onto the $x$-axis.

When a solution is not on the grid, as for $x^2 = 2$, **bisection** traps it: $h(1) < 0 < h(2)$, so a solution lies in $[1, 2]$; testing the midpoint halves the interval at every step. At a touching point the sign does not change, so bisection fails there.

## Try it

1. Drag the vertex of the parabola or the points on the line. When are there two, one or no solutions? Try a [touching point](?e1=0&m2=2&t2=-1).
2. Switch on **As zeros of h(x) = f(x) − g(x)** and watch the intersections drop to the axis. [Load example](?diff=1)
3. Load [x² = 2](?e1=0&m2=0&t2=2) and press **Approximate x₂** / **Halve the interval** several times. The magnifier shows where you are.
4. Explore the fractional equation [2/(x − 1) = x](?f=hyp&a1=2&d1=1&e1=0&m2=1&t2=0). Why can $x = 1$ never be a solution?

## Tasks

### Task 1: Read off and check

[Load task](?e1=-4&m2=1&t2=2&show=0&_hide=1) Solve $x^2 - 4 = x + 2$ graphically and check.

<details>
<summary>Show solution</summary>

The graphs intersect at $(-2, 0)$ and $(3, 5)$, so $S = \{-2,\ 3\}$. Check: $(-2)^2 - 4 = 0 = -2 + 2$ ✓ and $3^2 - 4 = 5 = 3 + 2$ ✓.

</details>

### Task 2: Fractional equation

[Load task](?f=hyp&a1=4&d1=0&e1=0&m2=1&t2=3&show=0&_hide=1) State the domain and solve $\dfrac{4}{x} = x + 3$.

<details>
<summary>Show solution</summary>

$D = \mathbb{R} \setminus \{0\}$; the solutions are $-4$ and $1$ (from $x^2 + 3x - 4 = (x + 4)(x - 1) = 0$).

</details>

### Task 3: Trapping a root

[Load task](?e1=0&m2=0&t2=3&_hide=1) Use bisection on $x^2 = 3$ until the first decimal place is certain.

<details>
<summary>Show solution</summary>

$[1, 2] \to [1.5, 2] \to [1.5, 1.75] \to [1.625, 1.75] \to [1.6875, 1.75]$: every number in this interval rounds to $1.7$, so $x \approx 1.7$ ($\sqrt{3} \approx 1.732$).

</details>

## Notes for teachers

- **Use:** solving equations graphically, fractional equations as an intersection problem, quadratic equations (parabola and line), approximating irrational roots by bisection.
- **Model:** each side is a line, parabola $a(x - d)^2 + e$, hyperbola $\frac{a}{x - d} + e$ or V-shaped graph $a|x - d| + e$. Solutions are computed exactly (with square roots for quadratics), cubic cases numerically.
- **Task mode:** `show=0` hides intersections and solutions in the picture, `_hide=1` hides the results.
- **Misconceptions:** giving the point $(2, 3)$ instead of $x = 2$; missing a touching point; forgetting the domain of fractional equations.
