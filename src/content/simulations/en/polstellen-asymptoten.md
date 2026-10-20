---
description: "Interactive simulation for upper secondary: rational functions built from linear factors – drag a numerator bead into a pole ring and watch the factor cancel and the pole turn into a hole; poles with and without sign change, horizontal and oblique asymptotes with step-by-step polynomial division, a table of values at the pole, a sign chart and a view from afar."
---

## What is it about?

A **rational function** is a quotient of two polynomials, here given in linear factors, e.g. $f(x) = \frac{(x-1)(x+1)}{x-2}$. Zeros of the denominator are not in the domain:

- **Pole:** the factor does not cancel; the graph approaches a **vertical asymptote**. A simple factor gives a sign change, a double factor like $(x-1)^2$ does not.
- **Removable gap:** numerator and denominator share a factor; after cancelling only a **hole** remains, e.g. $\frac{(x-1)(x+1)}{x-1} = x + 1$ for $x \neq 1$, hole at $(1 \mid 2)$.

For $x \to \pm\infty$ the degrees decide: $m < n$ → $y = 0$; $m = n$ → $y =$ ratio of leading coefficients; $m = n + 1$ → oblique asymptote; $m > n + 1$ → approximating polynomial curve. Polynomial division gives $f(x) = s(x) + \frac{r(x)}{q(x)}$, and $\frac{r(x)}{q(x)} \to 0$: for example $\frac{x^2-1}{x-2} = x + 2 + \frac{3}{x-2}$.

## Try it

1. [One pole](?zn=1&z1=1&pn=1&p1=-2): drag the green bead and the red ring along the x-axis.
2. [Gap instead of pole](?zn=2&z1=2&z2=-1&pn=1&p1=1): drag the bead at $x = 2$ into the ring at $x = 1$ and watch the factors being crossed out.
3. [Oblique asymptote](?zn=2&z1=1&z2=-1&pn=1&p1=2): press “Polynomial division step by step”, then let the point run and switch on the [view from afar](?zn=2&z1=1&z2=-1&pn=1&p1=2&far=1).
4. [Table at the pole](?zn=1&z1=1&pn=1&p1=-2&tab=1): $f(-2.001) \approx 3001$, $f(-1.999) \approx -2999$ – the values grow without bound.

## Tasks

### Task 1: Profile

Investigate $f(x) = \frac{x-1}{x+2}$. [Load task](?zn=1&z1=1&pn=1&p1=-2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Domain $\mathbb{R} \setminus \{-2\}$; zero $x = 1$; pole $x = -2$ with sign change; $f(x) = 1 - \frac{3}{x+2}$, so the horizontal asymptote is $y = 1$; $f(0) = -0.5$. [Show](?zn=1&z1=1&pn=1&p1=-2)

</details>

### Task 2: Polynomial division

Find the asymptote of $f(x) = \frac{x^2-1}{x-2}$. [Load task](?zn=2&z1=1&z2=-1&pn=1&p1=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$(x^2 + 0x - 1) : (x - 2) = x + 2$ remainder $3$, so $f(x) = x + 2 + \frac{3}{x-2}$ and $y = x + 2$. [Show](?zn=2&z1=1&z2=-1&pn=1&p1=2)

</details>

### Task 3: Crossing the asymptote

Does the graph of $f(x) = \frac{(x+1)(x-3)}{(x+3)(x-1)}$ cross its asymptote $y = 1$?

<details>
<summary>Show solution</summary>

$f(x) = 1 \iff x^2 - 2x - 3 = x^2 + 2x - 3 \iff x = 0$, and indeed $f(0) = 1$. Yes, at $(0 \mid 1)$ – that is allowed. [Show](?zn=2&z1=-1&z2=3&pn=2&p1=-3&p2=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Let students drag a numerator bead into a pole ring and describe what happens to the term and the graph.
- With “Show the properties” off, students work out the profile first and then reveal it.
- **Common stumbling blocks:** calling every zero of the denominator a pole; forgetting that cancelling does not change the domain; believing a graph may never cross its asymptote.
