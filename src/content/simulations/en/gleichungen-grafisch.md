## What is it about?

An equation such as $x^2 - 1 = 0.5x + 2$ compares two terms. If you treat both sides as **functions**, i.e. $f(x) = x^2 - 1$ and $g(x) = 0.5x + 2$, you are looking for all $x$ for which both functions have **the same value**. At exactly these points the graphs of $f$ and $g$ have a point in common – they **intersect** (or touch).

**Graphical method:**

1. Treat the left and right sides as functions $f$ and $g$ and draw both graphs in one coordinate system.
2. Look for the points of intersection of the graphs.
3. Read off the **$x$-coordinates** of the points of intersection – these are the solutions. The perpendiculars to the $x$-axis help with this.
4. **Check:** substitute the values read off into both sides.

In the example the graphs intersect at $S_1(-1.5 \mid 1.25)$ and $S_2(2 \mid 3)$, so $L = \{-1.5;\ 2\}$. Check for $x = 2$: $f(2) = 2^2 - 1 = 3$ and $g(2) = 0.5 \cdot 2 + 2 = 3$ ✓.

**How many solutions are there?**

| Position of the graphs | Solutions |
| --- | --- |
| intersect in exactly one point | one solution |
| intersect in two points | two solutions |
| intersect in three points | three solutions |
| touch at one point (point of contact) | one solution |
| have no point in common | no solution: $L = \{\,\}$ |
| coincide (partly) | infinitely many solutions |

**Difference function:** $f(x) = g(x) \iff f(x) - g(x) = 0$. So the solutions of the equation are the **zeros** of

$$
h(x) = f(x) - g(x).
$$

In the picture every point is shifted down by $g(x)$: the graph of $g$ moves onto the $x$-axis, and the points of intersection “drop” vertically onto the $x$-axis – the solutions stay the same.

**Fractional equations:** for $\dfrac{2}{x - 1} = x$, $x = 1$ is excluded; the domain is $D = \mathbb{R} \setminus \{1\}$. Graphically a hyperbola and a line intersect; the solutions are $-1$ and $2$.

**Approximation by bisection:** if a solution does not lie on the grid, e.g. for $x^2 = 2$, you can trap it. For $h(x) = x^2 - 2$, $h(1) = -1 < 0$ and $h(2) = 2 > 0$: the sign changes, so there is a solution between $1$ and $2$. Now check the middle $m = 1.5$: $h(1.5) = 0.25 > 0$, so the solution lies in $[1;\ 1.5]$. With every step the width of the interval halves; after 10 steps it is smaller than $0.001$. In this way you can approximate $\sqrt{2} \approx 1.414$ as accurately as you like. At a **point of contact** the sign does not change – the method does not work there.

## Try it

1. Drag the vertex of the parabola or the points of the line. When are there two, one or no solutions? Set up a [point of contact](?e1=0&m2=2&t2=-1).
2. Switch on **As zeros of h(x) = f(x) − g(x)** and watch where the points of intersection move. [Load example](?diff=1)
3. Load [x² = 2](?e1=0&m2=0&t2=2) and press **Approximate x₂** and then **Halve the interval** several times. The magnifier at the top left shows where you are. After how many steps is the second decimal place certain?
4. Investigate the fractional equation [2/(x − 1) = x](?f=hyp&a1=2&d1=1&e1=0&m2=1&t2=0). Why can $x = 1$ never be a solution?
5. Compare [|x − 1| = 0.5x + 1](?f=abs&a1=1&d1=1&e1=0&m2=0.5&t2=1) with [|x − 1| = −x + 1](?f=abs&a1=1&d1=1&e1=0&m2=-1&t2=1). What is special in the second case?
6. [1/x = x² − 2](?f=hyp&g=quad&a1=1&d1=0&e1=0&a2=1&d2=0&e2=-2) has three solutions. Which can you read off exactly, which only approximately?

## Exercises

### Exercise 1: Read off and check

[Load exercise](?e1=-4&m2=1&t2=2&show=0&_hide=1) Solve $x^2 - 4 = x + 2$ graphically and check.

<details>
<summary>Show solution</summary>

The graphs intersect at $(-2 \mid 0)$ and $(3 \mid 5)$, so $L = \{-2;\ 3\}$.
Check: $(-2)^2 - 4 = 0$ and $-2 + 2 = 0$ ✓; $3^2 - 4 = 5$ and $3 + 2 = 5$ ✓. [Show in the simulation](?e1=-4&m2=1&t2=2)

</details>

### Exercise 2: How many solutions?

Use the graphs to decide how many solutions the equation has: (a) $x^2 + 1 = x$, (b) $x^2 = 4x - 4$, (c) $0.5x^2 = 2$.

<details>
<summary>Show solution</summary>

(a) The parabola lies completely above the line: **no** solution. [Show](?e1=1&m2=1&t2=0)

(b) Parabola and line touch at $(2 \mid 4)$: **one** solution, $L = \{2\}$. [Show](?e1=0&m2=4&t2=-4)

(c) The parabola meets the line parallel to the $x$-axis twice: $L = \{-2;\ 2\}$. [Show](?a1=0.5&e1=0&m2=0&t2=2)

</details>

### Exercise 3: Fractional equation

[Load exercise](?f=hyp&a1=4&d1=0&e1=0&m2=1&t2=3&show=0&_hide=1) State the domain and solve $\dfrac{4}{x} = x + 3$ graphically.

<details>
<summary>Show solution</summary>

$D = \mathbb{R} \setminus \{0\}$. Hyperbola and line intersect at $(-4 \mid -1)$ and $(1 \mid 4)$, so $L = \{-4;\ 1\}$.
Algebraically: multiplying by $x$ (allowed, since $x \neq 0$) gives $4 = x^2 + 3x$, so $x^2 + 3x - 4 = 0$, i.e. $(x + 4)(x - 1) = 0$. Both solutions lie in $D$. [Show in the simulation](?f=hyp&a1=4&d1=0&e1=0&m2=1&t2=3)

</details>

### Exercise 4: Trapping a root

[Load exercise](?e1=0&m2=0&t2=3&_hide=1) The equation $x^2 = 3$ has a positive solution. Trap it by bisection until the first decimal place is certain.

<details>
<summary>Show solution</summary>

With $h(x) = x^2 - 3$: start $[1;\ 2]$. $h(1.5) < 0 \Rightarrow [1.5;\ 2]$; $h(1.75) > 0 \Rightarrow [1.5;\ 1.75]$; $h(1.625) < 0 \Rightarrow [1.625;\ 1.75]$; $h(1.6875) < 0 \Rightarrow [1.6875;\ 1.75]$.
After 4 steps the first decimal place is not yet certain: $1.6875$ rounds to $1.7$, but $1.75$ to $1.8$. So continue: $h(1.71875) < 0 \Rightarrow [1.71875;\ 1.75]$; $h(1.734375) > 0 \Rightarrow [1.71875;\ 1.734375]$.
After 6 steps both limits round to $1.7$, so $x \approx 1.7$ (more precisely $\sqrt{3} \approx 1.732$).

</details>

### Exercise 5: Absolute value equation

[Load exercise](?f=abs&a1=1&d1=-2&e1=0&m2=0&t2=3&show=0&_hide=1) Solve $|x + 2| = 3$ graphically. Interpret the solutions as distances on the number line.

<details>
<summary>Show solution</summary>

$L = \{-5;\ 1\}$. $|x + 2| = |x - (-2)|$ is the distance of $x$ from $-2$ – exactly the numbers $-5$ and $1$ are at distance $3$ from $-2$. [Show in the simulation](?f=abs&a1=1&d1=-2&e1=0&m2=0&t2=3)

</details>

### Exercise 6: Explain

Use the graph to explain why the equation $\dfrac{1}{x} = 0$ has no solution.

<details>
<summary>Show solution</summary>

The hyperbola $y = \frac{1}{x}$ comes arbitrarily close to the $x$-axis but never reaches it: the $x$-axis is an asymptote. A fraction with numerator $1$ is never $0$. So $L = \{\,\}$. [Show](?f=hyp&a1=1&d1=0&e1=0&m2=0&t2=0)

</details>

## Ideas for the classroom

- **Use (curriculum link as a draft):** around grade 8, solving fractional equations and interpreting them as an intersection problem of graphs, building on the concept of a function; around grade 9, quadratic equations, intersections of a parabola and a line, and approximations for square roots (bisection is a form of nested intervals). Suitable as an introduction, for practice and for comparing graphical and algebraic methods.
- **Model:** each side is a line $mx + c$, a parabola $a(x - d)^2 + e$, a hyperbola $\frac{a}{x - d} + e$ or an absolute value graph $a \cdot |x - d| + e$. The simulation calculates the solutions exactly (with roots for quadratic equations, e.g. $\frac{1 + \sqrt{5}}{2}$), and numerically for cubic equations (hyperbola and parabola). The basic set is $\mathbb{R}$; while only rational numbers are known, choose examples with rational solutions.
- **Certain digits:** for $x^2 = 2$ the simulation reports the second decimal place ($1.41$) as certain only after 11 steps, although the interval is already narrower than $0.01$ after 7 steps. A good reason to ask why the width alone is not enough.
- **Exercise mode:** `show=0` hides the points of intersection, the perpendiculars and the solution card in the picture; `_hide=1` hides the number of solutions, the solution set and the check in the results.
- **Common pitfalls:**
  - The point of intersection $(2 \mid 3)$ is given as the solution instead of its $x$-coordinate $2$.
  - A point of contact is overlooked or counted as “two solutions”.
  - With fractional equations the domain is forgotten. Multiplying by the denominator can create false solutions: $\frac{x}{x - 1} = \frac{1}{x - 1}$ leads to $x = 1$, which is not in $D$. The graphs of $\frac{1}{x - 1} + 1$ (that is $\frac{x}{x - 1}$) and $\frac{1}{x - 1}$ really have no point in common. [Show](?f=hyp&g=hyp&a1=1&d1=1&e1=1&a2=1&d2=1&e2=0)
  - Values read off are taken as exact – without a check, every graphical solution remains an approximation.
