---
description: "Interactive simulation for years 12 and 13: families of functions with a parameter k – extrema and points of inflection depending on k, loci derived step by step, points common to all members and the case analysis on a k-axis, with draggable extrema and a running k."
---

## What is it about?

A **family of functions** such as $f_k(x) = x^3 - kx$ contains one graph for each $k$. When differentiating, $k$ is a constant: $f_k'(x) = 3x^2 - k$. For $k > 0$ there are extrema at $x = \pm\sqrt{k/3}$, for $k = 0$ a terrace point, for $k < 0$ none. Solving $x^2 = k/3$ for $k$ ($k = 3x^2$) and substituting gives the **locus** $y = -2x^3$ ($x \neq 0$). All members pass through $(0 \mid 0)$: $(k_2 - k_1) \cdot x = 0$ gives $x = 0$. For $f_k(x) = (x - k) \cdot e^x$ there is **no** common point, since $(k_2 - k_1)e^x \neq 0$. For $x \cdot e^{-kx}$ and $kx^2 - x^4$ all curves **touch** at the origin. Points of inflection move on a locus as well – for $x \cdot e^{-kx}$ on $y = \frac{x}{e^2}$.

The extrema are red beads: when $k$ changes they glide along their locus and leave a glowing trace. The **k-axis** below the graph shows the case analysis; ▶ makes $k$ run.

## Try it

1. [x³ − kx](?fam=cub&k=1.5): drag the maximum, then press “Run through k”.
2. [Derivation from the start](?fam=cub&k=1.5&dv=1): press “Derivation: next step” several times.
3. [Parabolas](?fam=par&k=1) and [x · e^(−kx)](?fam=exp&k=1): tap faint curves to jump to other values of $k$.
4. [Points of inflection](?fam=exp&k=1&wp=1): run through $k$ and compare both traces.
5. [(x − k) · eˣ](?fam=expk&k=1&wp=1): why is there no common point?

## Tasks

### Task 1: Locus

Find the extrema of $f_k(x) = x^2 - 2kx + k$ and their locus. [Load task](?fam=par&k=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_k'(x) = 2x - 2k = 0 \Rightarrow T(k \mid k - k^2)$; substituting $k = x$ gives the locus $y = x - x^2$. [Show](?fam=par&k=1)

</details>

### Task 2: Locus of x³ − kx

Find the extrema of $f_k(x) = x^3 - kx$ ($k > 0$) and their locus; check with $k = 3$. [Load task](?fam=cub&k=3&dv=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$x_E = \pm\sqrt{k/3}$, so $k = 3x^2$ and $y = x^3 - 3x^2 \cdot x = -2x^3$ ($x \neq 0$). For $k = 3$: $H(-1 \mid 2)$, $T(1 \mid -2)$. [Show](?fam=cub&k=3)

</details>

### Task 3: No common point

For $f_k(x) = (x - k) \cdot e^x$ find the minimum, its locus and show that there is no common point. [Load task](?fam=expk&k=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_k'(x) = e^x(x - k + 1) = 0 \Rightarrow T(k - 1 \mid -e^{k-1})$; locus $y = -e^x$. $(k_2 - k_1)e^x = 0$ is impossible for $k_1 \neq k_2$. [Show](?fam=expk&k=1&wp=1)

</details>

## Ideas for the classroom

- Let students guess the locus from the glowing trace before computing it, then reveal the derivation step by step.
- Mark the cases on a number line first and compare with the k-axis of the simulation.
- **Common stumbling blocks:** treating $k$ as a variable when differentiating; forgetting the case analysis; dropping $k$ instead of solving for it; dividing by $k_1 - k_2$ without noting $k_1 \neq k_2$.
