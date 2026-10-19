---
description: "Interactive simulation for upper secondary: rational functions built from linear factors – drag the zeros of numerator and denominator and explore domain, poles with and without sign change, removable gaps and horizontal or oblique asymptotes via polynomial division, with a sign strip, a table of values at the pole and a view from afar."
---

## What is it about?

A **rational function** is a quotient of two polynomials. Zeros of the denominator are not in the domain:

- **Pole:** the numerator is not zero there; the graph approaches a **vertical asymptote**. A simple factor gives a sign change, a double factor like $(x-1)^2$ does not.
- **Removable gap:** numerator and denominator share a factor; after cancelling only a **hole** remains.

For $x \to \pm\infty$ the degrees decide: $m < n$ → $y = 0$; $m = n$ → $y =$ ratio of leading coefficients; $m = n + 1$ → oblique asymptote (polynomial division); $m > n + 1$ → approximating polynomial curve.

## Try it

1. [One pole](?zn=1&z1=1&pn=1&p1=-2): drag the green zero and the red marker.
2. [Removable gap](?zn=2&z1=1&z2=-1&pn=1&p1=1): move the marker away from $x = 1$ and back.
3. [Oblique asymptote](?zn=2&z1=1&z2=-1&pn=1&p1=2): let the point run along the graph, then switch on the [view from afar](?zn=2&z1=1&z2=-1&pn=1&p1=2&far=1).
4. [Table at the pole](?zn=1&z1=1&pn=1&p1=-2&tab=1): $f(-2.001) \approx 3001$, $f(-1.999) \approx -2999$ – the values grow without bound.

## Tasks

### Task 1: Profile

Investigate $f(x) = \frac{x-1}{x+2}$. [Load task](?zn=1&z1=1&pn=1&p1=-2&asy=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Domain $\mathbb{R} \setminus \{-2\}$; zero $x = 1$; pole $x = -2$ with sign change; horizontal asymptote $y = 1$. [Show](?zn=1&z1=1&pn=1&p1=-2)

</details>

### Task 2: Polynomial division

Find the asymptote of $f(x) = \frac{x^2-1}{x-2}$.

<details>
<summary>Show solution</summary>

$f(x) = x + 2 + \frac{3}{x-2}$, so $y = x + 2$. [Show](?zn=2&z1=1&z2=-1&pn=1&p1=2)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Let students drag a zero of the numerator onto a zero of the denominator and describe what happens.
- **Common stumbling blocks:** calling every zero of the denominator a pole; forgetting that cancelling does not change the domain.
