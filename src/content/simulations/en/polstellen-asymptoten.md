---
description: "Interactive simulation for upper secondary: rational functions built from linear factors – drag a numerator bead into a pole ring and watch the factor cancel and the pole turn into a hole; poles with and without sign change, horizontal and oblique asymptotes with step-by-step polynomial division, a table of values at the pole, a sign chart and a view from afar."
---

## What is it about?

A **rational function** is a quotient of two polynomials. Here it is given in linear factors, for example

$$f(x) = \frac{(x-1)(x+1)}{x-2}.$$

The zeros of the denominator are not in the **domain**, here $D = \mathbb{R} \setminus \{2\}$. What happens at such a **gap in the domain** depends on the numerator:

- **Pole:** the factor does not cancel (completely), for example $\frac{x-1}{(x-1)^2} = \frac{1}{x-1}$. The graph approaches the **vertical asymptote** $x = 2$, and the function values tend to $+\infty$ or $-\infty$. If the denominator factor occurs once (in general: an odd number of times), the sign changes (**with sign change**); for a double factor like $(x-1)^2$ it does not (**without sign change**).
- **Removable gap:** numerator and denominator share a linear factor, and it occurs in the numerator at least as often as in the denominator. After cancelling, $f$ can be extended continuously there; the graph keeps a **hole**. Example: $\frac{(x-1)(x+1)}{x-1} = x + 1$ for $x \neq 1$, hole at $(1 \mid 2)$. Cancelling does not change the domain.

For $x \to \pm\infty$ compare the degree $m$ of the numerator with the degree $n$ of the denominator:

| Degrees | Behaviour as $x \to \pm\infty$ |
|---|---|
| $m < n$ | horizontal asymptote $y = 0$ |
| $m = n$ | horizontal asymptote $y = \frac{\text{leading coefficient of numerator}}{\text{leading coefficient of denominator}}$ |
| $m = n + 1$ | oblique asymptote (polynomial division) |
| $m > n + 1$ | approximating polynomial curve (polynomial division) |

**Polynomial division** splits $f(x) = s(x) + \frac{r(x)}{q(x)}$ with a remainder $r$ whose degree is smaller than that of the denominator $q$. The fraction $\frac{r(x)}{q(x)}$ tends to $0$ as $x \to \pm\infty$, so the graph approaches $y = s(x)$. Example: $(x^2 - 1) : (x - 2) = x + 2$ remainder $3$, so $f(x) = x + 2 + \frac{3}{x-2}$ and $y = x + 2$ is the oblique asymptote. At $x = 40$ the distance is only $\frac{3}{38} \approx 0.079$.

## Try it

1. [One pole](?zn=1&z1=1&pn=1&p1=-2): drag the green bead (zero of the numerator, a dot) and the red ring (zero of the denominator, a circle with a cross) along the $x$-axis. What happens to the asymptote $y = 1$, and to the arrows at the pole?
2. **Gap instead of pole:** [load this example](?zn=2&z1=2&z2=-1&pn=1&p1=1) and drag the bead at $x = 2$ into the ring at $x = 1$. Watch the term: both factors are crossed out, and the vertical asymptote shrinks to a hole. Drag the bead out again.
3. [Double pole](?zn=0&a=2&pn=2&p1=1&p2=1): why do both branches point upwards? Compare with the sign strip along the $x$-axis.
4. [Oblique asymptote](?zn=2&z1=1&z2=-1&pn=1&p1=2): press “Polynomial division step by step” and follow the working as on the board. Then let a point run along the graph: the arrow shows the deviation $f(x) - s(x) = \frac{3}{x-2}$.
5. [View from afar](?zn=2&z1=1&z2=-1&pn=1&p1=2&far=1): switch “View from afar” on and off. Why does the graph almost merge with the line?
6. [Numerator of degree 3](?zn=3&z1=-2&z2=0&z3=2&pn=1&p1=-1&a=0.5): which curve approximates the graph for large $|x|$?
7. [Table of values at the pole](?zn=1&z1=1&pn=1&p1=-2&tab=1): how do the values change as $x$ gets closer and closer to $-2$? Compare with the [gap](?zn=2&z1=1&z2=-1&pn=1&p1=1&tab=1): there the values tend to a number.
8. [Sign chart](?zn=1&z1=0&pn=2&p1=-2&p2=2&a=2&vzt=1): at which points can the sign of $f$ change – and where does it not change? (In the chart, “N” marks numerator factors and “D” denominator factors.)

## Tasks

### Task 1: Profile

Investigate $f(x) = \frac{x-1}{x+2}$: domain, zero, pole (with or without sign change), asymptotes and $f(0)$. [Load task](?zn=1&z1=1&pn=1&p1=-2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$D = \mathbb{R} \setminus \{-2\}$; zero $x = 1$; pole $x = -2$ with sign change (on the left $f(x) \to +\infty$, on the right $f(x) \to -\infty$); $m = n = 1$, so the horizontal asymptote is $y = \frac{1}{1} = 1$, since $f(x) = 1 - \frac{3}{x+2}$. $f(0) = \frac{-1}{2} = -0.5$. [Show solution](?zn=1&z1=1&pn=1&p1=-2)

</details>

### Task 2: Hole or pole?

Investigate $f(x) = \frac{x^2-1}{x-1}$ at $x = 1$. [Load task](?zn=2&z1=1&z2=-1&pn=1&p1=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{x^2-1}{x-1} = \frac{(x-1)(x+1)}{x-1} = x + 1$ for $x \neq 1$. At $x = 1$ there is a removable gap: the graph is the line $y = x + 1$ with a hole at $(1 \mid 2)$; $D = \mathbb{R} \setminus \{1\}$. [Show solution](?zn=2&z1=1&z2=-1&pn=1&p1=1)

</details>

### Task 3: Polynomial division

Find the asymptote of $f(x) = \frac{x^2-1}{x-2}$. [Load task](?zn=2&z1=1&z2=-1&pn=1&p1=2&asy=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$(x^2 + 0x - 1) : (x - 2) = x + 2$: first subtract $x \cdot (x - 2) = x^2 - 2x$, leaving $2x - 1$; then subtract $2 \cdot (x - 2) = 2x - 4$, leaving the remainder $3$. So $f(x) = x + 2 + \frac{3}{x-2}$, oblique asymptote $y = x + 2$. [Show solution](?zn=2&z1=1&z2=-1&pn=1&p1=2)

</details>

### Task 4: Table of values at the pole

For $f(x) = \frac{x - 1}{x + 2}$ calculate $f(-2.01)$ and $f(-1.99)$. What does this tell you about the behaviour at the pole? [Load task](?zn=1&z1=1&pn=1&p1=-2&tab=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f(-2.01) = \frac{-3.01}{-0.01} = 301$ and $f(-1.99) = \frac{-2.99}{0.01} = -299$. The closer $x$ gets to $-2$, the larger the absolute values: $f(x) \to +\infty$ from the left, $f(x) \to -\infty$ from the right – a pole with sign change. [Show solution](?zn=1&z1=1&pn=1&p1=-2&tab=1)

</details>

### Task 5: Approximating parabola

Show that $f(x) = \frac{0.5\,(x + 2)\,x\,(x - 2)}{x + 1} = 0.5x^2 - 0.5x - 1.5 + \frac{1.5}{x+1}$. [Load task](?zn=3&z1=-2&z2=0&z3=2&pn=1&p1=-1&a=0.5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Multiplied out, the numerator is $0.5x^3 - 2x$. Divide by $(x + 1)$: $0.5x^2$, leaving $-0.5x^2 - 2x$; then $-0.5x$, leaving $-1.5x$; then $-1.5$, leaving the remainder $1.5$. Check: $(0.5x^2 - 0.5x - 1.5)(x + 1) + 1.5 = 0.5x^3 - 2x$. Approximating curve: the parabola $y = 0.5x^2 - 0.5x - 1.5$. [Show solution](?zn=3&z1=-2&z2=0&z3=2&pn=1&p1=-1&a=0.5)

</details>

### Task 6: May the graph cross the asymptote?

Find out whether the graph of $f(x) = \frac{(x+1)(x-3)}{(x+3)(x-1)}$ crosses its horizontal asymptote. [Load task](?zn=2&z1=-1&z2=3&pn=2&p1=-3&p2=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Equal degrees, leading coefficients $1$ and $1$: asymptote $y = 1$. $f(x) = 1 \iff x^2 - 2x - 3 = x^2 + 2x - 3 \iff x = 0$. Indeed $f(0) = \frac{1 \cdot (-3)}{3 \cdot (-1)} = 1$: the graph crosses the asymptote at $(0 \mid 1)$. That is allowed – the approach only holds for large $|x|$. [Show solution](?zn=2&z1=-1&z2=3&pn=2&p1=-3&p2=1)

</details>

### Task 7: Find a function

Give a rational function with a pole without sign change at $x = 1$ and the horizontal asymptote $y = 2$.

<details>
<summary>Show solution</summary>

For example $f(x) = \frac{2x^2}{(x-1)^2}$: double denominator factor → no sign change; equal degrees, leading coefficients $2$ and $1$ → $y = 2$. [Show](?zn=2&z1=0&z2=0&a=2&pn=2&p1=1&p2=1)

</details>

## Ideas for the classroom

- **Use:** in the Bavarian curriculum (LehrplanPLUS Gymnasium) in grade 11 (rational functions – limits and asymptotes) and grade 12 (investigating rational functions). Whether approximating curves (numerator degree greater than denominator degree + 1) are required there, please check the curriculum.
- **Discovery:** students drag a numerator bead into a pole ring and describe what happens to the term and the graph – the idea of a removable gap can grow out of this.
- **Profiles:** with “Show the properties” off, the profile, poles, gaps, asymptotes, the cancelled term and the table of values stay hidden; the graph remains visible as a check. After working it out, “Reveal the properties” shows everything. Task 7 works well in pairs: one person gives properties, the other builds a matching function.
- **Signs without calculation:** the sign can only change at zeros and poles, and only for odd multiplicity. The sign strip and the sign chart make this visible.
- **Model:** numerator and denominator split completely into linear factors with zeros on half units; denominators like $x^2 + 1$ do not occur.
- **Common stumbling blocks:**
  - Every zero of the denominator is automatically called a pole (cancelling forgotten).
  - The gap is “forgotten” after cancelling – cancelling does not change the domain.
  - For equal degrees, $y = 1$ is given instead of the ratio of the leading coefficients.
  - “A graph may never cross its asymptote.” – It may, see Task 6.
  - In polynomial division, placeholders like $0x$ are missing and the columns slip.
