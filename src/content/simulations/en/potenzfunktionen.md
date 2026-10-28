---
description: "Interactive simulation on power functions f(x) = a · xⁿ with integer exponents: graphs morph smoothly, symmetry, key features, families with common points and a comparison of two power functions."
---

## What is it about?

A **power function** has the form

$$
f(x) = a \cdot x^n \qquad (a \neq 0,\; n \text{ an integer})
$$

The **exponent** $n$ decides the shape of the graph. The **stretch factor** $a$ stretches ($|a| > 1$) or compresses ($|a| < 1$) it vertically; for $a < 0$ it is also reflected in the $x$-axis. The point $Q(1 \mid a)$ always lies on the graph because $1^n = 1$.

Depending on $n$ there are four classes (shown in different colours in the simulation):

| Exponent | Graph (for $a = 1$) | Symmetry | Domain $D$ | Range $W$ |
| --- | --- | --- | --- | --- |
| $n$ even, $n > 0$ | parabola of order $n$, both branches up | about the $y$-axis | $\mathbb{R}$ | $\mathbb{R}_0^+$ |
| $n$ odd, $n > 0$ | parabola of order $n$ (for $n = 1$ a line through the origin), from bottom left to top right | about the origin | $\mathbb{R}$ | $\mathbb{R}$ |
| $n$ even, $n < 0$ | hyperbola, both branches up | about the $y$-axis | $\mathbb{R} \setminus \{0\}$ | $\mathbb{R}^+$ |
| $n$ odd, $n < 0$ | hyperbola, branches in quadrants I and III | about the origin | $\mathbb{R} \setminus \{0\}$ | $\mathbb{R} \setminus \{0\}$ |

- **Symmetry:** For even $n$, $f(-x) = f(x)$: the graph is **symmetric about the $y$-axis**. For odd $n$, $f(-x) = -f(x)$: the graph is **symmetric about the origin**.
- **Negative exponents:** $x^{-n} = \frac{1}{x^n}$. The function is not defined at $x = 0$ (**pole**); the axes $x = 0$ and $y = 0$ are **asymptotes**.
- **Special cases:** $n = 1$ gives the line $y = a \cdot x$ through the origin. For $n = 0$, $x^0 = 1$ (for $x \neq 0$), so $f(x) = a$: a line parallel to the $x$-axis. The expression $0^0$ is not considered here – the simulation leaves $0$ out of the domain (hollow point).
- **Common points:** All graphs of $y = x^n$ pass through $(1 \mid 1)$. For even $n$ they pass through $(-1 \mid 1)$, for odd $n$ through $(-1 \mid -1)$, and for $n > 0$ through the origin.
- **Between $-1$ and $1$:** the larger the (positive) exponent, the flatter the graph, e.g. $0.5^4 = 0.0625 < 0.5^2 = 0.25$. Outside this interval it is the other way round.

## Try it

1. Move the slider for $n$ slowly from $-4$ to $6$, or click **Run through all exponents**. The graph morphs smoothly. For which $n$ does the class change? Watch the colour and the label at the top right of the key features.
2. Click **Show symmetry** for $n = 3$: the right part is rotated through $180°$ about the origin. Try the same for $n = 4$. [Load example](?n=3&x=1.2)
3. Drag the point $Q(1 \mid a)$ up and down. What happens to the range and the monotonicity for $a < 0$? [Load example](?n=2&a=-0.5)
4. Drag $P$ along the graph and compare the calculation in the picture with the table of values. At the positions in the table, the matching row is highlighted.
5. Choose the **family** view and tap the individual exponents. The other graphs of the family are faint and labelled with their exponent. Which points always stay the same? [Even exponents](?view=family&n=4) · [Odd exponents](?view=family&n=3)
6. Compare $x$ and $x^3$ and let the vertical line run with **Compare from left to right**. Where does $x^3$ lie above $x$? [Load example](?view=compare&n=1&m=3)
7. Set $n = -1$ and $n = -2$. How do the function values behave near $0$ on the left and on the right? [Load example](?n=-1&x=0.5)

## Tasks

### Task 1: Checking points

Do the points $A(-2 \mid -4)$ and $B(3 \mid 13)$ lie on the graph of $f(x) = 0.5 \cdot x^3$?

<details>
<summary>Show solution</summary>

$f(-2) = 0.5 \cdot (-2)^3 = 0.5 \cdot (-8) = -4$, so $A$ lies on the graph. $f(3) = 0.5 \cdot 27 = 13.5 \neq 13$, so $B$ does not. [Show in the simulation](?n=3&a=0.5&x=-2)

</details>

### Task 2: Finding the stretch factor

The graph of $f(x) = a \cdot x^4$ passes through the point $(2 \mid 8)$. Find $a$ and state the range. [Load task](?n=4&a=0.5&x=2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$a \cdot 2^4 = 8 \Rightarrow 16a = 8 \Rightarrow a = 0.5$. Because $n$ is even and $a > 0$, the range is $W = \mathbb{R}_0^+$. [Show in the simulation](?n=4&a=0.5&x=2)

</details>

### Task 3: Key features

Describe $f(x) = -2 \cdot x^{-3}$: domain, range, symmetry, monotonicity, behaviour as $x \to \pm\infty$ and near $0$. Compute $f(1)$ and $f(-1)$.

<details>
<summary>Show solution</summary>

$D = W = \mathbb{R} \setminus \{0\}$, symmetric about the origin ($n$ odd). Because $a < 0$, the hyperbola $\frac{1}{x^3}$ is reflected in the $x$-axis: the branches lie in quadrants II and IV, and $f$ is **increasing** for $x < 0$ and for $x > 0$. As $x \to \pm\infty$, $f(x) \to 0$; to the left of $0$, $f(x) \to +\infty$, to the right $f(x) \to -\infty$. Asymptotes $x = 0$ and $y = 0$. $f(1) = -2$, $f(-1) = -2 \cdot \frac{1}{-1} = 2$. [Show in the simulation](?n=-3&a=-2&x=1)

</details>

### Task 4: Which is bigger?

For which $x$ is $x^4 < x^2$? Give a numerical example.

<details>
<summary>Show solution</summary>

The graphs intersect at $x = -1$, $0$ and $1$. For $0 < |x| < 1$, $x^4 < x^2$, e.g. $0.5^4 = 0.0625 < 0.25 = 0.5^2$. For $|x| > 1$ it is the other way round, e.g. $2^4 = 16 > 4$. [Show in the simulation](?view=compare&n=2&m=4)

</details>

### Task 5: Common points

Which points do all graphs of $y = x^n$ with odd $n > 0$ have in common? Which one is lost if $n = -1$ and $n = -3$ are also allowed?

<details>
<summary>Show solution</summary>

$(-1 \mid -1)$, $(0 \mid 0)$ and $(1 \mid 1)$, because $(-1)^n = -1$, $0^n = 0$ and $1^n = 1$. For negative $n$, $0$ is not in the domain, so the origin is lost. [Show in the simulation](?view=family&n=3)

</details>

### Task 6: Recognising a graph

A graph of $f(x) = x^n$ lies entirely above the $x$-axis, is symmetric about the $y$-axis and has a pole at $x = 0$. What do you know about $n$? Give an example.

<details>
<summary>Show solution</summary>

$n$ is even and negative, e.g. $n = -2$: $f(x) = \frac{1}{x^2}$ with $W = \mathbb{R}^+$. [Show in the simulation](?n=-2&x=0.5)

</details>

## Ideas for the classroom

- **Use:** About grades 9/10, power functions with natural exponents and extending powers, then polynomial functions. Negative exponents build on the hyperbola $y = \frac{1}{x}$ from Year 8; please check the curriculum for whether and how far they are covered.
- **Discovery:** The family view is a good way to collect conjectures ("What do they all have in common?"), which can then be justified with $1^n$, $(-1)^n$ and $0^n$.
- **Justifying symmetry:** The animation shows *what* symmetry about an axis and about a point mean; the reasoning $(-x)^n = x^n$ or $(-x)^n = -x^n$ can follow.
- **Common stumbling blocks:**
  - "$x^4$ is always bigger than $x^2$." – Only for $|x| > 1$; between $-1$ and $1$ it is the other way round.
  - $x^{-2}$ is read as $-x^2$. – In fact $x^{-2} = \frac{1}{x^2} > 0$.
  - For $n = 0$, $0^0$ is simply set to $1$. – The simulation deliberately leaves out $0$; a short discussion is worthwhile here.
  - Monotonicity for odd negative $n$: $\frac{1}{x}$ is decreasing on each part, but **not** on the whole domain (e.g. $f(-1) = -1 < f(1) = 1$).
- **Task mode:** With `info=0` and **Share → Hide results**, the key features, the table of values and the calculation are replaced by "?"; the graph stays visible.
