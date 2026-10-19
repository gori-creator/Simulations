---
description: "Interactive simulation for years 12 and 13: families of functions with a parameter k – extrema and points of inflection depending on k, loci with derivation, points common to all members and the case analysis on a draggable k-axis."
---

## What is it about?

A **family of functions** such as $f_k(x) = x^3 - kx$ contains one graph for each $k$. For $k > 0$ it has extrema at $x = \pm\sqrt{k/3}$, for $k = 0$ a terrace point, for $k < 0$ none. Solving $x = \sqrt{k/3}$ for $k$ and substituting gives the **locus** $y = -2x^3$. All members pass through $(0 \mid 0)$: $(k_2 - k_1) \cdot x = 0$ gives $x = 0$. For $f_k(x) = (x - k) \cdot e^x$ there is **no** common point, since $(k_2 - k_1)e^x \neq 0$. Points of inflection move on a locus as well – for $x \cdot e^{-kx}$ on $y = \frac{x}{e^2}$. The **k-axis** below the graph shows the case analysis.

## Try it

1. [x³ − kx](?fam=cub&k=1.5): drag the maximum, then press “Run through k”.
2. [Parabolas](?fam=par&k=1) and [x · e^(−kx)](?fam=exp&k=1).
3. [Points of inflection](?fam=exp&k=1&wp=1): run through $k$ and compare both traces.
4. [(x − k) · eˣ](?fam=expk&k=1&wp=1): why is there no common point?

## Tasks

### Task 1: Locus

Find the extrema of $f_k(x) = x^2 - 2kx + k$ and their locus. [Load task](?fam=par&k=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$T(k \mid k - k^2)$, locus $y = x - x^2$. [Show](?fam=par&k=1)

</details>

### Task 2: No common point

For $f_k(x) = (x - k) \cdot e^x$ find the minimum, its locus and show that there is no common point. [Load task](?fam=expk&k=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_k'(x) = e^x(x - k + 1) = 0 \Rightarrow T(k - 1 \mid -e^{k-1})$; locus $y = -e^x$. $(k_2 - k_1)e^x = 0$ is impossible for $k_1 \neq k_2$. [Show](?fam=expk&k=1&wp=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Let students guess the locus from the trace before computing it.
- **Common stumbling blocks:** treating $k$ as a variable when differentiating; forgetting the case analysis.
