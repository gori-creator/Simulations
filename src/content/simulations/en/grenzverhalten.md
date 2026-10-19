---
description: "Interactive simulation for year 11: investigate how functions behave as x → +∞ and x → −∞ – with a running point, a zooming view, a table of values, the horizontal asymptote and a draggable ε-strip; plus counterexamples without a limit."
---

## What is it about?

If $f(x)$ gets arbitrarily close to a number $a$ as $x \to +\infty$, we write $\lim\limits_{x \to +\infty} f(x) = a$; the line $y = a$ is a **horizontal asymptote**. “Arbitrarily close” means: for every strip of width $\varepsilon$ around the asymptote there is a position $x_\varepsilon$ beyond which the graph stays inside the strip. If $f(x)$ grows beyond every bound, there is no limit.

Example: $\frac{2x + 1}{x - 1} = 2 + \frac{3}{x - 1} \to 2$. The graph may cross the asymptote, as $\frac{\sin x}{x}$ shows.

## Try it

1. Let $x$ run outwards and watch the table.
2. Drag the edge of the strip: where is $x_\varepsilon$ for [ε = 0.05](?eps=0.05)?
3. Compare [$\frac{\sin x}{x}$](?f=osc&eps=0.1), [$2^x$ for $x \to -\infty$](?f=exp&dir=m&eps=0.25) and [$0.1x^3 - x$](?f=poly).

## Tasks

### Task 1: Find the limit

$\lim\limits_{x \to +\infty} \frac{3x^2 + 1}{x^2 + 1}$? [Load task](?f=rat2&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$3 - \frac{2}{x^2 + 1} \to 3$; asymptote $y = 3$, approached from below. [Show](?f=rat2&eps=0.2)

</details>

### Task 2: How far out?

For $f(x) = 2 + \frac{3}{x - 1}$, from which $x$ on is $\lvert f(x) - 2\rvert < 0.05$?

<details>
<summary>Show solution</summary>

$\frac{3}{x - 1} < 0.05 \Rightarrow x > 61$. [Show](?eps=0.05)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Hide the limit first and let students conjecture it from the table, then check it with the strip.
- **Common stumbling blocks:** believing an asymptote is never crossed; calling $f(x) \to \infty$ a limit; reading calculator roundings as exact values.
