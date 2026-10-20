---
description: "Interactive simulation for years 11 and 12: investigating polynomial functions in seven animated steps – derivatives, symmetry, zeros, necessary and sufficient conditions, sign charts for f′ and f″, maxima, minima, terrace and inflection points, monotonicity and curvature, with a draggable tangent and the graphs of f′ and f″ below."
---

## What is it about?

The simulation investigates a polynomial in seven steps: 1. derivatives with the power rule, 2. symmetry (only even exponents: about the $y$-axis; only odd: about the origin) and behaviour for $x \to \pm\infty$, 3. zeros, 4. necessary condition $f'(x_0) = 0$ (only candidates), 5. sufficient condition: a sign change of $f'$ from $+$ to $-$ gives a maximum, from $-$ to $+$ a minimum, no sign change a terrace point – cross-checked with $f''(x_0)$, 6. inflection points: $f''(x_0) = 0$ with a sign change of $f''$, 7. intervals of monotonicity and curvature.

Below the graph of $f$ the graphs of $f'$ and $f''$ share the $x$-axis, coloured green where positive and red where negative. The slope of the tangent at $P$ is exactly the value of $f'$ below.

*Example:* $x^3 - 3x$ has $H(-1 \mid 2)$, $T(1 \mid -2)$ and $W(0 \mid 0)$. Careful: $x^4$ has a minimum at $0$ although $f''(0) = 0$.

## Try it

1. [x³ − 3x](?q=0&a=1&b=0&c=-3&d=0&st=1&px=-2): press “Next step” and watch the sign chart fill cell by cell. Then press “Move the tangent”.
2. [Terrace point x³](?q=0&a=1&b=0&c=0&d=0&st=6&px=-1) and [x⁴](?q=1&a=0&b=0&c=0&d=0&st=6&px=-1): compare the sign charts of $f'$ and $f''$.
3. Drag the point on the $y$-axis: $f$ moves, $f'$ and $f''$ stay the same.

## Tasks

### Task 1: Full investigation

Investigate $f(x) = -x^3 + 3x^2$. [Load task](?q=0&a=-1&b=3&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = -3x(x - 2)$: $T(0 \mid 0)$, $H(2 \mid 4)$; $f''(x) = -6x + 6$: $W(1 \mid 2)$. Decreasing on $(-\infty, 0]$ and $[2, \infty)$, increasing on $[0, 2]$. [Show](?q=0&a=-1&b=3&c=0&d=0&st=7)

</details>

### Task 2: Tangent

Find the tangent to $f(x) = x^3 - 3x$ at $x_0 = 2$. [Load task](?q=0&a=1&b=0&c=-3&d=0&st=1&px=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f(2) = 2$, $f'(2) = 9$, so $t(x) = 9x - 16$. [Show](?q=0&a=1&b=0&c=-3&d=0&st=1&px=2)

</details>

## Ideas for the classroom

- Switch “Show the results” off, let students work out each step first and then reveal.
- Hide the graphs of $f'$ and $f''$, let students sketch them, then show them again.
- **Common stumbling blocks:** treating $f'(x_0) = 0$ as sufficient; concluding “no extremum” from $f''(x_0) = 0$; forgetting the $y$-coordinate of a point.
