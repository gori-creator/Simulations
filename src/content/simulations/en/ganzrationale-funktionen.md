---
description: "Interactive simulation for years 10 and 11: drag the zeros of a polynomial function as beads, tap them to raise their multiplicity and let them merge – with factored and exact expanded form, sign chart, a magnifier for the behaviour at the zeros and a view from far away for the end behaviour."
---

## What is it about?

A **polynomial function** that splits into **linear factors** can be written like this:

$$
f(x) = a \cdot (x - x_1)^{m_1} \cdot (x - x_2)^{m_2} \cdot (x - x_3)^{m_3}
$$

Here $x_1, x_2, x_3$ are the **zeros**, $m_1, m_2, m_3$ their **multiplicities** and $a \neq 0$ the **leading coefficient**. The **degree** is $n = m_1 + m_2 + m_3$. If two zeros coincide, their multiplicities add up: $(x - 1) \cdot (x - 1)^2 = (x - 1)^3$. Multiplying out gives the **expanded form**, for example

$$
0.5 \cdot (x + 2)(x - 0.5)(x - 3) = 0.5x^3 - 0.75x^2 - 2.75x + 1.5 .
$$

The **y-intercept** is the constant term: $f(0) = 0.5 \cdot 2 \cdot (-0.5) \cdot (-3) = 1.5$.

| Multiplicity $m$ | Graph at the zero | Sign change? | near $x_0$ like … |
| --- | --- | --- | --- |
| 1 (simple) | crosses the $x$-axis | yes | a line |
| 2 (double) | touches the $x$-axis | no | a parabola |
| 3 (triple) | flattens out and crosses (terrace point) | yes | a cubic |
| 4 (fourfold) | touches, very flat | no | $x^4$ |

The last column gives the reason: near a zero $x_0$ the other factors hardly change. There, $f(x) \approx c \cdot (x - x_0)^m$, where $c$ is the product of $a$ and the other factors at $x_0$. For $f(x) = 0.2 \cdot (x + 3) \cdot x^2 \cdot (x - 3)$ near $0$ this gives $c = 0.2 \cdot 3 \cdot (-3) = -1.8$ and $f(x) \approx -1.8x^2$: a parabola opening downwards.

In the **sign chart** every factor gets its own row: $(x - x_0)^m$ is positive to the right of $x_0$ and $(-1)^m$ to the left, so negative for odd $m$. The sign of $f$ is the product of the column (together with the sign of $a$).

**End behaviour:** Factoring out $x^n$ gives $\frac{f(x)}{a \cdot x^n} = \left(1 - \frac{x_1}{x}\right)^{m_1} \cdots \to 1$ for $|x| \to \infty$. For large $|x|$ only the term $a x^n$ counts. In the example above, at $x = 100$ we already have $\frac{f(100)}{0.5 \cdot 100^3} = 1.02 \cdot 0.995 \cdot 0.97 \approx 0.984$. As $x \to +\infty$, $f(x)$ has the sign of $a$; for even $n$ both ends behave the same way, for odd $n$ they go in opposite directions.

## Try it

1. [Three simple zeros](?a=0.5&z=3&x1=-2&m1=1&x2=0.5&m2=1&x3=3&m3=1): Drag the beads on the $x$-axis. Tap a bead – every ring stands for one more multiplicity. How do the graph, the term and the sign chart change?
2. Compare a [double](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5), a [triple](?z=2&x1=1&m1=3&x2=-3&m2=1&a=0.3) and a [fourfold zero](?z=2&x1=1&m1=4&x2=-3&m2=1&a=0.1). When does the sign change?
3. Push two beads onto each other until they merge. What happens to the rings and to the term? [All three coincide](?z=3&x1=1&m1=1&x2=1&m2=2&x3=1&m3=1&a=0.5): Which function do you get?
4. Drag the handle for $a$ on the graph up and down, also below the $x$-axis. Which end-behaviour arrows turn around? [Negative a](?z=3&x1=-3&m1=1&x2=-0.5&m2=1&x3=2.5&m3=1&a=-0.4)
5. [Switch on the magnifier](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2&near=1): Point at the beads one after another with the mouse (on a tablet: move a bead a little). What does the graph look like in the magnifier each time? Compare with the dashed approximations.
6. Press “View from far away”. The view zooms out by a factor of 20. Why can you hardly tell $f$ and the dashed curve $a x^n$ apart?
7. [Degree 9](?z=3&x1=-2&m1=3&x2=1&m2=4&x3=3&m3=2&a=0.1&near=1) and [degree 12](?z=3&x1=-4&m1=4&x2=0&m2=4&x3=4&m3=4&a=-3): Use the sign chart to find where $f$ is negative.

## Tasks

### Task 1: Read off the properties

Let $f(x) = -0.4 \cdot (x + 3)(x + 0.5)(x - 2.5)$. Give the degree, the zeros, the end behaviour and $f(0)$. [Load task](?z=3&x1=-3&m1=1&x2=-0.5&m2=1&x3=2.5&m3=1&a=-0.4&info=0&ends=0&_hide=1)

<details>
<summary>Show solution</summary>

Degree 3, simple zeros $-3$, $-0.5$ and $2.5$ (each with a sign change). Since $a < 0$ and the degree is odd: as $x \to -\infty$, $f(x) \to +\infty$; as $x \to +\infty$, $f(x) \to -\infty$. $f(0) = -0.4 \cdot 3 \cdot 0.5 \cdot (-2.5) = 1.5$. [Show solution](?z=3&x1=-3&m1=1&x2=-0.5&m2=1&x3=2.5&m3=1&a=-0.4&yi=1)

</details>

### Task 2: Which term fits?

The graph of a cubic function touches the $x$-axis at $x = -2$, crosses it at $x = 2$ and passes through the point $(1, -4.5)$. Find the term in factored form and in expanded form. [Load task](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Touching point: double zero; crossing point: simple zero. So $f(x) = a \cdot (x + 2)^2 (x - 2)$. Using the point: $f(1) = a \cdot 9 \cdot (-1) = -4.5$, so $a = 0.5$. Expanded: $(x + 2)^2 (x - 2) = (x^2 + 4x + 4)(x - 2) = x^3 + 2x^2 - 4x - 8$, so $f(x) = 0.5x^3 + x^2 - 2x - 4$. [Show solution](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5)

</details>

### Task 3: Multiplying out

Multiply out $f(x) = 0.3 \cdot (x - 1)^3 (x + 3)$. Check with “Expand step by step”.

<details>
<summary>Show solution</summary>

$(x - 1)^3 = x^3 - 3x^2 + 3x - 1$; times $(x + 3)$: $x^4 - 6x^2 + 8x - 3$; times $0.3$: $f(x) = 0.3x^4 - 1.8x^2 + 2.4x - 0.9$. [Show](?z=2&x1=1&m1=3&x2=-3&m2=1&a=0.3)

</details>

### Task 4: Sign chart

Make a sign chart for $f(x) = 0.2 \cdot (x + 3) \cdot x^2 \cdot (x - 3)$ with one row per factor. Where is $f(x) < 0$? Calculate $f(1)$ and give the end behaviour. [Load task](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2&info=0&sign=0&ends=0&_hide=1)

<details>
<summary>Show solution</summary>

| | $x < -3$ | $-3 < x < 0$ | $0 < x < 3$ | $x > 3$ |
| --- | --- | --- | --- | --- |
| $x + 3$ | $-$ | $+$ | $+$ | $+$ |
| $x^2$ | $+$ | $+$ | $+$ | $+$ |
| $x - 3$ | $-$ | $-$ | $-$ | $+$ |
| $f(x)$ | $+$ | $-$ | $-$ | $+$ |

So $f(x) < 0$ for $-3 < x < 0$ and for $0 < x < 3$; no sign change at $0$ (double zero). $f(1) = 0.2 \cdot 4 \cdot 1 \cdot (-2) = -1.6$. Expanded form $0.2x^4 - 1.8x^2$: degree 4 is even and $a > 0$, so $f(x) \to +\infty$ as $x \to \pm\infty$. [Show](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2)

</details>

### Task 5: Magnifier at the double zero

Explain for the function from task 4 why the graph near $x = 0$ behaves like the parabola $y = -1.8x^2$. Compare $f(0.1)$ with $-1.8 \cdot 0.1^2$.

<details>
<summary>Show solution</summary>

Near $0$, $(x + 3)(x - 3) \approx 3 \cdot (-3) = -9$, so $f(x) \approx 0.2 \cdot (-9) \cdot x^2 = -1.8x^2$. Exactly: $f(0.1) = 0.2 \cdot 3.1 \cdot 0.01 \cdot (-2.9) = -0.01798$; the approximation gives $-0.018$. [Show magnifier](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2&near=1)

</details>

### Task 6: True or false?

a) “A polynomial function of degree 4 has four zeros.” b) “If $a > 0$, then $f(x) \to +\infty$ as $x \to -\infty$.”

<details>
<summary>Show solution</summary>

a) False: at most four. $f(x) = 0.5 \cdot (x - 1)^4$ has only the zero $1$ (fourfold), $x^4 + 1$ has none at all. [Example](?z=3&x1=1&m1=1&x2=1&m2=2&x3=1&m3=1&a=0.5) b) Only for even degree. For odd degree and $a > 0$, $f(x) \to -\infty$ as $x \to -\infty$.

</details>

## Ideas for the classroom

- **Use:** Year 10, learning area “polynomial functions” in the Bavarian LehrplanPLUS for Gymnasium (zeros with multiplicity, end behaviour); in year 11 as revision before curve sketching. Please check against the curriculum and your textbook whether sign charts with one row per factor are common there.
- **Guess the term:** With “Show the term and properties” switched off, only the graph appears. Pairs can set up graphs for each other and find the term; “Reveal the term” resolves it.
- **From the magnifier to the far view:** The magnifier shows why the graph crosses or touches at a zero (it behaves like a power $c \cdot (x - x_0)^m$ there), the view from far away shows why only $a x^n$ decides the end behaviour. Both work well discussed one after the other.
- **Model:** Zeros at half units between $-4$ and $4$, multiplicities up to 4. Only functions that split completely into linear factors are shown; functions such as $x^2 + 1$ do not occur.
- **Common stumbling blocks:**
  - Sign inside the bracket: the zero of $(x + 2)$ is $-2$.
  - “The graph crosses the axis at every zero.” – For even multiplicity it only touches it.
  - For the end behaviour only $a$ is considered and the degree is forgotten (or vice versa).
  - When multiplying out, $a$ is only multiplied with the first factor.
