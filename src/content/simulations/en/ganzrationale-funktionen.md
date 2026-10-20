---
description: "Interactive simulation for years 10 and 11: drag the zeros of a polynomial function as beads, tap to raise their multiplicity and let them merge – with factored and exact expanded form, sign chart, a magnifier for the behaviour at the zeros and a view from far away for the end behaviour."
---

## What is it about?

A polynomial that splits into **linear factors** can be written as $f(x) = a (x - x_1)^{m_1} (x - x_2)^{m_2} (x - x_3)^{m_3}$ with **multiplicities** $m_i$, **leading coefficient** $a$ and **degree** $n = m_1 + m_2 + m_3$. Coinciding zeros add their multiplicities. Example: $0.5 (x + 2)(x - 0.5)(x - 3) = 0.5x^3 - 0.75x^2 - 2.75x + 1.5$, so $f(0) = 1.5$.

- Odd multiplicity: the sign changes (simple zero: crosses; triple zero: terrace point). Even multiplicity: the graph only touches the axis.
- Near a zero $x_0$, $f(x) \approx c (x - x_0)^m$, where $c$ is $a$ times the other factors at $x_0$ – a line, a parabola or a cubic. For $0.2 (x + 3) x^2 (x - 3)$ near $0$: $f(x) \approx -1.8x^2$.
- **End behaviour:** $\frac{f(x)}{a x^n} \to 1$ for $|x| \to \infty$ (at $x = 100$ in the example: $1.02 \cdot 0.995 \cdot 0.97 \approx 0.984$). For $x \to +\infty$, $f(x)$ has the sign of $a$; for even $n$ both ends go the same way.

## Try it

1. Drag the beads and tap one: every ring is one more multiplicity. Drag the handle on the graph to change $a$.
2. Compare a [double](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5) and a [triple zero](?z=2&x1=1&m1=3&x2=-3&m2=1&a=0.3).
3. Move two beads onto each other until they merge. [All three coincide](?z=3&x1=1&m1=1&x2=1&m2=2&x3=1&m3=1&a=0.5).
4. [Magnifier](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2&near=1) and then “View from far away”.

## Tasks

### Task 1: Read off the properties

$f(x) = -0.4 (x + 3)(x + 0.5)(x - 2.5)$: degree, zeros, end behaviour, $f(0)$? [Load task](?z=3&x1=-3&m1=1&x2=-0.5&m2=1&x3=2.5&m3=1&a=-0.4&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Degree 3, simple zeros $-3$, $-0.5$, $2.5$. Since $a < 0$ and $n$ is odd: $f(x) \to +\infty$ as $x \to -\infty$ and $f(x) \to -\infty$ as $x \to +\infty$. $f(0) = -0.4 \cdot 3 \cdot 0.5 \cdot (-2.5) = 1.5$.

</details>

### Task 2: Which term fits?

A cubic touches the $x$-axis at $-2$, crosses it at $2$ and passes through $(1, -4.5)$. [Load task](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$f(x) = a (x + 2)^2 (x - 2)$ and $f(1) = -9a = -4.5$, so $a = 0.5$: $f(x) = 0.5x^3 + x^2 - 2x - 4$. [Show](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5)

</details>

### Task 3: Sign chart

Where is $f(x) = 0.2 (x + 3) x^2 (x - 3)$ negative? [Load task](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Signs $+ \mid - \mid - \mid +$: $f(x) < 0$ for $-3 < x < 0$ and $0 < x < 3$, no sign change at the double zero $0$. $f(1) = -1.6$; both ends go to $+\infty$.

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Switch off “Show the term and properties” for a guessing game in pairs; “Reveal the term” resolves it.
- The magnifier explains crossing and touching locally, the view from far away explains the end behaviour – a nice pair for one lesson.
- **Common stumbling blocks:** the zero of $(x + 2)$ is $-2$; even multiplicity means touching, not crossing; for the end behaviour both $a$ and the degree matter.
