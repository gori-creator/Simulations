---
description: "Interactive simulation on power functions f(x) = a · xⁿ with integer exponents: graphs morph smoothly, symmetry, key features, families with common points and a comparison of two power functions."
---

## What is it about?

A **power function** has the form $f(x) = a \cdot x^n$ with an integer exponent $n$ and $a \neq 0$. The exponent decides the shape, the factor $a$ stretches or compresses the graph vertically and reflects it in the $x$-axis when $a < 0$. The point $Q(1 \mid a)$ always lies on the graph because $1^n = 1$.

- **Even $n$:** $f(-x) = f(x)$ – symmetric about the $y$-axis. **Odd $n$:** $f(-x) = -f(x)$ – symmetric about the origin.
- **Negative $n$:** $x^{-n} = \frac{1}{x^n}$ is undefined at $x = 0$ (pole); the axes $x = 0$ and $y = 0$ are asymptotes.
- **$n = 0$:** $f(x) = a$ for $x \neq 0$. The expression $0^0$ is not considered here, so $0$ is left out of the domain.
- **Common points:** all graphs of $y = x^n$ pass through $(1 \mid 1)$; even $n$ through $(-1 \mid 1)$, odd $n$ through $(-1 \mid -1)$, and $n > 0$ through the origin.
- Between $-1$ and $1$, a larger positive exponent gives smaller values: $0.5^4 = 0.0625 < 0.5^2 = 0.25$.

## Try it

1. Move the slider for $n$ from $-4$ to $6$, or click **Run through all exponents**, and watch the graph morph.
2. Click **Show symmetry** for $n = 3$ and for $n = 4$. [Load example](?n=3&x=1.2)
3. Drag $Q(1 \mid a)$ below the $x$-axis. What happens to the range? [Load example](?n=2&a=-0.5)
4. Open the **family** view and tap the exponents. Which points never move? [Even exponents](?view=family&n=4)
5. Compare $x$ and $x^3$ with **Compare from left to right**. [Load example](?view=compare&n=1&m=3)

## Tasks

### Task 1: Checking points

Do $A(-2 \mid -4)$ and $B(3 \mid 13)$ lie on the graph of $f(x) = 0.5 \cdot x^3$?

<details>
<summary>Show solution</summary>

$f(-2) = 0.5 \cdot (-8) = -4$, so $A$ lies on the graph; $f(3) = 13.5 \neq 13$, so $B$ does not. [Show in the simulation](?n=3&a=0.5&x=-2)

</details>

### Task 2: Finding a

The graph of $f(x) = a \cdot x^4$ passes through $(2 \mid 8)$. Find $a$. [Load task](?n=4&a=0.5&x=2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$16a = 8$, so $a = 0.5$; the range is $[0; \infty)$. [Show in the simulation](?n=4&a=0.5&x=2)

</details>

### Task 3: Which is bigger?

For which $x$ is $x^4 < x^2$?

<details>
<summary>Show solution</summary>

For $0 < |x| < 1$, e.g. $0.5^4 = 0.0625 < 0.25$. The graphs intersect at $x = -1, 0, 1$. [Show in the simulation](?view=compare&n=2&m=4)

</details>

### Task 4: Key features

Describe $f(x) = -2 \cdot x^{-3}$ and compute $f(1)$ and $f(-1)$.

<details>
<summary>Show solution</summary>

Domain and range $\mathbb{R} \setminus \{0\}$, symmetric about the origin, increasing for $x < 0$ and for $x > 0$, $f(x) \to 0$ as $x \to \pm\infty$, asymptotes $x = 0$ and $y = 0$. $f(1) = -2$, $f(-1) = 2$. [Show in the simulation](?n=-3&a=-2&x=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Use the family view to collect conjectures and then justify them with $1^n$, $(-1)^n$ and $0^n$.
- The symmetry animation shows what the conditions $f(-x) = f(x)$ and $f(-x) = -f(x)$ mean.
- **Common stumbling blocks:**
  - "$x^4$ is always bigger than $x^2$" – only for $|x| > 1$.
  - Reading $x^{-2}$ as $-x^2$ – in fact $x^{-2} = \frac{1}{x^2} > 0$.
  - $\frac{1}{x}$ is decreasing on each part, but not on its whole domain.
