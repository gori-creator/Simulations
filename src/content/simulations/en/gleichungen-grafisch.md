---
description: "Interactive simulation for solving equations graphically: both sides as graphs, solutions as x-coordinates of the intersections, difference function, touching points, fractional and absolute value equations and bisection with a magnifier."
---

## What is it about?

An equation such as $x^2 - 1 = 0.5x + 2$ compares two expressions. If you read both sides as **functions**, $f(x) = x^2 - 1$ and $g(x) = 0.5x + 2$, you are looking for all $x$ at which both functions have **the same value**. At exactly these points the graphs of $f$ and $g$ have a point in common – they **intersect** (or touch).

**Solving graphically:**

1. Read the left and right side as functions $f$ and $g$ and draw both graphs in one coordinate system.
2. Find the points of intersection of the graphs.
3. Read off the **$x$-coordinates** of the intersections – these are the solutions. The drop lines to the $x$-axis help.
4. **Check:** substitute the values you read off into both sides.

In the example the graphs intersect at $S_1(-1.5,\ 1.25)$ and $S_2(2,\ 3)$, so $S = \{-1.5,\ 2\}$. Check for $x = 2$: $f(2) = 2^2 - 1 = 3$ and $g(2) = 0.5 \cdot 2 + 2 = 3$ ✓.

**How many solutions are there?**

| Position of the graphs | Solutions |
| --- | --- |
| intersect in two points | two solutions |
| touch in one point (touching point) | one solution |
| have no point in common | no solution: $S = \{\,\}$ |
| (partly) coincide | infinitely many solutions |

**Difference function:** $f(x) = g(x) \iff f(x) - g(x) = 0$. So the solutions of the equation are the **zeros** of

$$
h(x) = f(x) - g(x).
$$

In the picture every point is moved down by $g(x)$: the graph of $g$ moves onto the $x$-axis, and the intersections "drop" straight down onto the $x$-axis – the solutions stay the same.

**Fractional equations:** In $\dfrac{2}{x - 1} = x$, $x = 1$ is excluded; the domain is $D = \mathbb{R} \setminus \{1\}$. Graphically a hyperbola and a line intersect; the solutions are $-1$ and $2$.

**Approximating by bisection:** If a solution is not on the grid, as for $x^2 = 2$, you can trap it. For $h(x) = x^2 - 2$ we have $h(1) = -1 < 0$ and $h(2) = 2 > 0$: the sign changes, so a solution lies between $1$ and $2$. Now test the midpoint $m = 1.5$: $h(1.5) = 0.25 > 0$, so the solution lies in $[1,\ 1.5]$. Each step halves the width of the interval; after 10 steps it is less than $0.001$. In this way you can approximate $\sqrt{2} \approx 1.414$ as closely as you like. At a **touching point** the sign does not change – there the method does not work.

## Try it

1. Drag the vertex of the parabola or the points on the line. When are there two, one or no solutions? Set up a [touching point](?e1=0&m2=2&t2=-1).
2. Switch on **As zeros of h(x) = f(x) − g(x)** and watch where the intersections go. [Load example](?diff=1)
3. Load [x² = 2](?e1=0&m2=0&t2=2) and press **Approximate x₂** and then **Halve the interval** several times. The magnifier at the top left shows where you are. After how many steps is the second decimal place certain?
4. Explore the fractional equation [2/(x − 1) = x](?f=hyp&a1=2&d1=1&e1=0&m2=1&t2=0). Why can $x = 1$ never be a solution?
5. Compare [|x − 1| = 0.5x + 1](?f=abs&a1=1&d1=1&e1=0&m2=0.5&t2=1) with [|x − 1| = −x + 1](?f=abs&a1=1&d1=1&e1=0&m2=-1&t2=1). What is special about the second case?
6. [1/x = x² − 2](?f=hyp&g=quad&a1=1&d1=0&e1=0&a2=1&d2=0&e2=-2) has three solutions. Which can you read off exactly, which only approximately?

## Tasks

### Task 1: Read off and check

[Load task](?e1=-4&m2=1&t2=2&show=0&_hide=1) Solve $x^2 - 4 = x + 2$ graphically and check your answer.

<details>
<summary>Show solution</summary>

The graphs intersect at $(-2,\ 0)$ and $(3,\ 5)$, so $S = \{-2,\ 3\}$.
Check: $(-2)^2 - 4 = 0$ and $-2 + 2 = 0$ ✓; $3^2 - 4 = 5$ and $3 + 2 = 5$ ✓. [Show in the simulation](?e1=-4&m2=1&t2=2)

</details>

### Task 2: How many solutions?

Use the graphs to decide how many solutions the equation has: (a) $x^2 + 1 = x$, (b) $x^2 = 4x - 4$, (c) $0.5x^2 = 2$.

<details>
<summary>Show solution</summary>

(a) The parabola lies entirely above the line: **no** solution. [Show](?e1=1&m2=1&t2=0)

(b) Parabola and line touch at $(2,\ 4)$: **one** solution, $S = \{2\}$. [Show](?e1=0&m2=4&t2=-4)

(c) The parabola meets the line parallel to the $x$-axis twice: $S = \{-2,\ 2\}$. [Show](?a1=0.5&e1=0&m2=0&t2=2)

</details>

### Task 3: Fractional equation

[Load task](?f=hyp&a1=4&d1=0&e1=0&m2=1&t2=3&show=0&_hide=1) State the domain and solve $\dfrac{4}{x} = x + 3$ graphically.

<details>
<summary>Show solution</summary>

$D = \mathbb{R} \setminus \{0\}$. Hyperbola and line intersect at $(-4,\ -1)$ and $(1,\ 4)$, so $S = \{-4,\ 1\}$.
By calculation: multiplying by $x$ gives $4 = x^2 + 3x$, so $x^2 + 3x - 4 = 0$, i.e. $(x + 4)(x - 1) = 0$. [Show in the simulation](?f=hyp&a1=4&d1=0&e1=0&m2=1&t2=3)

</details>

### Task 4: Trapping a root

[Load task](?e1=0&m2=0&t2=3&show=0&_hide=1) The equation $x^2 = 3$ has one positive solution. Trap it by bisection until the first decimal place is certain.

<details>
<summary>Show solution</summary>

With $h(x) = x^2 - 3$: start $[1,\ 2]$. $h(1.5) < 0 \Rightarrow [1.5,\ 2]$; $h(1.75) > 0 \Rightarrow [1.5,\ 1.75]$; $h(1.625) < 0 \Rightarrow [1.625,\ 1.75]$; $h(1.6875) < 0 \Rightarrow [1.6875,\ 1.75]$.
Not certain yet: $1.6875$ rounds to $1.7$, but $1.75$ rounds to $1.8$. Continue: $h(1.71875) < 0 \Rightarrow [1.71875,\ 1.75]$; $h(1.734375) > 0 \Rightarrow [1.71875,\ 1.734375]$.
After 6 steps every number in this interval rounds to $1.7$, so $x \approx 1.7$ (more precisely $\sqrt{3} \approx 1.732$). The simulation then shows "Certain: x₂ ≈ 1.7".

</details>

### Task 5: Absolute value equation

[Load task](?f=abs&a1=1&d1=-2&e1=0&m2=0&t2=3&show=0&_hide=1) Solve $|x + 2| = 3$ graphically. Interpret the solutions as distances on the number line.

<details>
<summary>Show solution</summary>

$S = \{-5,\ 1\}$. $|x + 2| = |x - (-2)|$ is the distance from $x$ to $-2$ – exactly the numbers $-5$ and $1$ are at distance $3$ from $-2$. [Show in the simulation](?f=abs&a1=1&d1=-2&e1=0&m2=0&t2=3)

</details>

### Task 6: Give reasons

Use the graph to explain why the equation $\dfrac{1}{x} = 0$ has no solution.

<details>
<summary>Show solution</summary>

The hyperbola $y = \frac{1}{x}$ gets arbitrarily close to the $x$-axis but never reaches it: the $x$-axis is an asymptote. A fraction with numerator $1$ is never $0$. So $S = \{\,\}$. [Show](?f=hyp&a1=1&d1=0&e1=0&m2=0&t2=0)

</details>

## Ideas for the classroom

- **Use (curriculum link is a draft, Bavarian Gymnasium):** grade 8, learning area 4 (solving fractional equations and interpreting them as intersection problems of graphs), building on the concept of a function from learning area 1; grade 9, learning area 2 (quadratic equations, intersections of parabola and line) and learning area 1 (approximations of square roots: bisection is a form of nested intervals). Suitable as an introduction, for practice and for comparing the graphical and the algebraic method.
- **Model:** each side is a line $mx + c$, a parabola $a(x - d)^2 + e$, a hyperbola $\frac{a}{x - d} + e$ or a V-shaped graph $a \cdot |x - d| + e$. The simulation computes the solutions exactly (for quadratic equations with square roots, e.g. $\frac{1 + \sqrt{5}}{2}$), and numerically for cubic equations (hyperbola and parabola). The underlying set is $\mathbb{R}$; in grade 8 (rational numbers) choose examples with rational solutions.
- **Task mode:** `show=0` hides the intersections, drop lines and the solution card in the picture, `_hide=1` covers the number of solutions, the solution set and the check in the results.
- **Common stumbling blocks:**
  - The point of intersection $(2,\ 3)$ is given as the solution instead of its $x$-coordinate $2$.
  - A touching point is overlooked or counted as "two solutions".
  - In fractional equations the domain is forgotten. Multiplying by the denominator can produce extraneous solutions: $\frac{x}{x - 1} = \frac{1}{x - 1}$ leads to $x = 1$, which is not in $D$. The graphs of $\frac{1}{x - 1} + 1$ (that is $\frac{x}{x - 1}$) and $\frac{1}{x - 1}$ really have no point in common. [Show](?f=hyp&g=hyp&a1=1&d1=1&e1=1&a2=1&d2=1&e2=0)
  - Values read off are taken as exact – without a check every graphical solution remains an approximation.
