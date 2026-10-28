---
description: "Interactive simulation for years 11 and 12: investigating polynomial functions in seven animated steps – derivatives, symmetry, zeros, necessary and sufficient conditions, sign charts for f′ and f″, maxima, minima, terrace and inflection points, monotonicity and curvature, with a draggable tangent and the graphs of f′ and f″ below."
---

## What is it about?

In a **curve sketching** investigation you use the derivatives to find where the graph of $f$ rises or falls, where it has maxima and minima and where its curvature changes. The simulation works in seven steps:

1. **Find the derivatives:** with the power rule $(x^n)' = n \cdot x^{n-1}$ for each term, e.g. $f(x) = x^3 - 3x$, $f'(x) = 3x^2 - 3$, $f''(x) = 6x$.
2. **Symmetry and behaviour for $x \to \pm\infty$:** only even exponents ⇒ symmetric about the $y$-axis, only odd ⇒ symmetric about the origin. For $x \to \pm\infty$ the term with the highest exponent decides.
3. **Zeros:** $f(x) = 0$, often by factoring out or by substitution.
4. **Necessary condition:** at an extremum the tangent is horizontal, so $f'(x_0) = 0$. The solutions are only **candidates**.
5. **Sufficient condition:** if $f'$ changes sign at $x_0$ from $+$ to $-$, there is a **maximum**, from $-$ to $+$ a **minimum**. Without a sign change it is a **terrace point** (saddle point). Cross-check with the second-derivative test: $f''(x_0) < 0$ ⇒ maximum, $f''(x_0) > 0$ ⇒ minimum.
6. **Inflection points:** $f''(x_0) = 0$ **with** a sign change of $f''$ (also sufficient: $f'''(x_0) \neq 0$). There the graph switches between **concave up** ($f'' > 0$) and **concave down** ($f'' < 0$).
7. **Monotonicity and curvature:** where $f' > 0$, $f$ is strictly increasing, where $f' < 0$, strictly decreasing.

The **sign chart** sums up step 5. For $f(x) = x^3 - 3x$ with $f'(x) = 3(x + 1)(x - 1)$:

| $x$ | $x < -1$ | $-1$ | $-1 < x < 1$ | $1$ | $x > 1$ |
| --- | --- | --- | --- | --- | --- |
| $f'(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
| $G_f$ | increases | $H(-1, 2)$ | decreases | $T(1, -2)$ | increases |

So $f$ is strictly increasing on $(-\infty, -1]$ and $[1, \infty)$ and decreasing on $[-1, 1]$. From $f''(x) = 6x = 0$ we get the inflection point $W(0, 0)$. (The simulation uses the German labels H for a maximum, T for a minimum, TP for a terrace point and W for an inflection point.)

**Careful with the second-derivative test:** if $f''(x_0) = 0$, it tells you nothing. $f(x) = x^4$ still has a **minimum** at $0$ ($f'$ changes from $-$ to $+$), but no inflection point, because $f''(x) = 12x^2$ does not change sign. $f(x) = x^3$ has a terrace point at $0$ – that is also an inflection point with a horizontal tangent.

In the simulation the graphs of $f'$ and $f''$ share the $x$-axis below $f$. The area between graph and $x$-axis is green above the axis ($+$) and red below ($-$). Dashed lines link the zeros of $f'$ with the extreme points and those of $f''$ with the inflection points. The point $P$ carries the tangent: its slope is exactly the value of $f'$ below.

## Try it

1. [f(x) = x³ − 3x](?q=0&a=1&b=0&c=-3&d=0&st=1&px=-2): press “Next step” several times (or tap the dots 1–7 on the card) and watch the sign chart fill cell by cell.
2. Drag $P$ slowly along the graph or press “Move the tangent”. Where is the bar in the picture of $f'$ longest, where does it vanish? At a horizontal tangent $P$ snaps into place. [Tangent at x₀ = 2](?q=0&a=1&b=0&c=-3&d=0&st=1&px=2): check $t(x) = 9x - 16$.
3. Drag the point on the $y$-axis up and down. What changes for $f'$ and $f''$, what for the positions of the extrema and for their $y$-values?
4. Change the coefficient of $x$ in [x³ + c·x](?q=0&a=1&b=0&c=-3&d=0&st=5). From which value of $c$ on do the maximum and minimum disappear?
5. [Terrace point x³](?q=0&a=1&b=0&c=0&d=0&st=6&px=-1) and [x⁴](?q=1&a=0&b=0&c=0&d=0&st=6&px=-1): compare the sign charts of $f'$ and $f''$ in each case. Why is $x = 0$ an extremum once and not the other time?

## Tasks

### Task 1: Full investigation

Investigate $f(x) = -x^3 + 3x^2$ for extreme and inflection points and state the intervals of monotonicity. [Load task](?q=0&a=-1&b=3&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = -3x^2 + 6x = -3x(x - 2)$, candidates $0$ and $2$. Signs of $f'$: $- \mid + \mid -$, so $T(0, 0)$ and $H(2, 4)$; cross-check $f''(0) = 6 > 0$, $f''(2) = -6 < 0$. $f''(x) = -6x + 6 = 0 \Rightarrow x = 1$ with a sign change: $W(1, 2)$. Strictly decreasing on $(-\infty, 0]$ and $[2, \infty)$, increasing on $[0, 2]$. [Show in the simulation](?q=0&a=-1&b=3&c=0&d=0&st=7)

</details>

### Task 2: W shape

Find the extreme and inflection points of $f(x) = x^4 - 2x^2$. [Load task](?q=1&a=0&b=-2&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = 4x^3 - 4x = 4x(x - 1)(x + 1)$: candidates $-1$, $0$, $1$. Signs $- \mid + \mid - \mid +$, so $T(-1, -1)$, $H(0, 0)$, $T(1, -1)$. $f''(x) = 12x^2 - 4 = 0 \Rightarrow x = \pm\frac{1}{\sqrt{3}} \approx \pm 0.58$ with a sign change; $f\left(\pm\frac{1}{\sqrt{3}}\right) = \frac{1}{9} - \frac{2}{3} = -\frac{5}{9} \approx -0.56$. Because of the symmetry about the $y$-axis it is enough to investigate $x \geq 0$. [Show in the simulation](?q=1&a=0&b=-2&c=0&d=0&st=7)

</details>

### Task 3: When the second-derivative test is silent

Show that $f'(x_0) = 0$ is not sufficient for an extremum, and that $f''(x_0) = 0$ does not imply “no extremum”.

<details>
<summary>Show solution</summary>

$f(x) = x^3$: $f'(0) = 0$, but $f'(x) = 3x^2$ is positive to the left and right of $0$ – no sign change, so a terrace point $(0, 0)$. [Show](?q=0&a=1&b=0&c=0&d=0&st=5&px=-1) $f(x) = x^4$: $f'(0) = 0$ and $f''(0) = 0$, yet $f'(x) = 4x^3$ changes from $-$ to $+$: minimum $(0, 0)$. [Show](?q=1&a=0&b=0&c=0&d=0&st=6&px=-1)

</details>

### Task 4: Curve sketching in seven steps

Investigate $f(x) = -0.25x^4 + x^3$ completely: symmetry, behaviour for $x \to \pm\infty$, zeros, extreme and inflection points, monotonicity and curvature. [Load task](?q=-0.25&a=1&b=0&c=0&d=0&st=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Even and odd exponents: no simple symmetry. Leading coefficient $-0.25$ with degree $4$: $f(x) \to -\infty$ for $x \to \pm\infty$. Zeros: $x^3(1 - 0.25x) = 0 \Rightarrow x = 0$ (triple) and $x = 4$. $f'(x) = -x^3 + 3x^2 = x^2(3 - x)$: no sign change at $0$ (terrace point $(0, 0)$), from $+$ to $-$ at $3$: $H(3, 6.75)$, cross-check $f''(3) = -9 < 0$. $f''(x) = -3x^2 + 6x = -3x(x - 2)$: $W_1(0, 0)$ and $W_2(2, 4)$. Strictly increasing on $(-\infty, 3]$, decreasing on $[3, \infty)$; concave down on $(-\infty, 0)$ and $(2, \infty)$, concave up on $(0, 2)$. [Show in the simulation](?q=-0.25&a=1&b=0&c=0&d=0&st=7&px=1)

</details>

### Task 5: Make the profile yourself

Make the profile of $f(x) = x^3 - 3x^2 + 2$, then reveal the results step by step. [Load task](?q=0&a=1&b=-3&c=0&d=2&st=1&px=-1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f'(x) = 3x^2 - 6x = 3x(x - 2)$: $H(0, 2)$ because $f''(0) = -6 < 0$, and $T(2, -2)$ because $f''(2) = 6 > 0$. $f''(x) = 6x - 6 = 0 \Rightarrow W(1, 0)$. Zeros: $x = 1$ and from $x^2 - 2x - 2 = 0$ also $x = 1 \pm \sqrt{3}$, so $x \approx -0.73$ and $x \approx 2.73$. No symmetry about the origin or the $y$-axis (but the graph is symmetric about its inflection point). [Show in the simulation](?q=0&a=1&b=-3&c=0&d=2&st=7&px=-1)

</details>

## Ideas for the classroom

- **Use:** The simulation fits upper secondary calculus, investigating polynomial functions. Steps 2 and 3 (symmetry, behaviour for $x \to \pm\infty$, zeros with multiplicity) pick up polynomial functions from lower secondary. It suits introducing, practising and revising before exams.
- **Work it out first, then reveal:** with “Show the results” off, students work out each step on paper, go on with “Next step” and check with “Reveal the results”.
- **Sketching derivatives:** switch off “Show the graphs of f′ and f″ below”, let students sketch $f'$, then show it – the guide lines show whether the zeros are in the right place.
- **Exploring parameters:** when does $x^3 + cx$ have extreme points? (Only for $c < 0$.) This prepares families of functions.
- **Common stumbling blocks:**
  - The necessary condition $f'(x_0) = 0$ is taken as proof of an extremum.
  - From $f''(x_0) = 0$ students conclude too quickly “no extremum” or “inflection point”.
  - Maxima and minima are given without their $y$-coordinate.
  - A constant term is overlooked when checking symmetry: $x^3 - 3x + 1$ is not symmetric about the origin.
  - Monotonicity is read from the sign of $f$ instead of $f'$.
