## What is it about?

A **family of functions** combines infinitely many functions that differ only in a **parameter** $k$, for example $f_k(x) = x^3 - kx$. Each $k$ gives its own graph. When differentiating, $k$ is treated like a fixed number: $f_k'(x) = 3x^2 - k$, $f_k''(x) = 6x$.

- **Case analysis:** for which $k$ are there extreme points? $f_k'(x) = 0 \iff x^2 = \frac{k}{3}$. For $k < 0$ this has no solution ($f_k$ is strictly increasing), for $k = 0$ there is the saddle point $(0 \mid 0)$, for $k > 0$ a maximum and a minimum at $x = \pm\sqrt{\frac{k}{3}}$.
- **Locus:** on which curve do the extreme points move when $k$ changes? Find the extreme point in terms of $k$, solve the $x$-coordinate for $k$ ($x^2 = \frac{k}{3} \Rightarrow k = 3x^2$) and substitute into the $y$-coordinate: $y = x^3 - 3x^2 \cdot x = -2x^3$. The point $(0 \mid 0)$ does not belong to it, since for $k = 0$ it is not an extreme point: locus $y = -2x^3$ with $x \neq 0$.
- **Common points:** from $f_{k_1}(x) = f_{k_2}(x)$ with $k_1 \neq k_2$ it follows here that $(k_2 - k_1) \cdot x = 0$, so $x = 0$ and the point $(0 \mid 0)$. There may also be **no** common point: for $f_k(x) = (x - k) \cdot e^x$, $f_{k_1}(x) - f_{k_2}(x) = (k_2 - k_1) \cdot e^x$ is never zero. For $x \cdot e^{-kx}$ and $kx^2 - x^4$ all curves **touch** at the origin, because they all have the same slope there.
- **Inflection points** also move on a locus. For $f_k(x) = x \cdot e^{-kx}$, $f_k''(x) = k \cdot (kx - 2) \cdot e^{-kx}$, so $W\left(\frac{2}{k} \mid \frac{2}{k \cdot e^2}\right)$ on the line $y = \frac{x}{e^2}$.

In the simulation the extreme points are red beads: when $k$ changes, they slide along their locus and leave a glowing trace. The **k-ray** below the picture shows the case analysis; with ▶, $k$ runs by itself. The “Locus” card leads through the derivation in four steps.

## Try it

1. [x³ − kx](?fam=cub&k=1.5): drag the maximum (red bead). On which curve does it slide, and what happens to $k$?
2. Press “Run through k” or ▶ on the k-ray. When do the extreme points disappear? Watch the highlighted row in the case analysis.
3. [Derivation from the start](?fam=cub&k=1.5&dv=1): press “Derivation: next step” several times. In the picture first $x_E$ and $y_E$ appear, then the check for $k$, and finally the locus grows.
4. [Family of parabolas](?fam=par&k=1): all parabolas pass through one point. Which? Tap faint curves to jump to other values of $k$.
5. [x · e^(−kx)](?fam=exp&k=1): what happens to the extreme point when $k$ becomes negative? And at $k = 0$?
6. [kx² − x⁴](?fam=quart&k=2): drag the point on the k-ray past $k = 0$. How does the shape change?
7. [Inflection points](?fam=exp&k=1&wp=1): let $k$ run. What traces do the extreme points and inflection points leave?
8. [(x − k) · eˣ](?fam=expk&k=1&wp=1): why do these curves have no point in common?

## Exercises

### Exercise 1: Extreme points in terms of k

Find the extreme points of $f_k(x) = x^2 - 2kx + k$ and the locus. [Load exercise](?fam=par&k=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_k'(x) = 2x - 2k = 0 \Rightarrow x = k$, $f_k''(x) = 2 > 0$, $f_k(k) = k^2 - 2k^2 + k = k - k^2$, so minimum $T(k \mid k - k^2)$. Locus: substitute $k = x$: $y = x - x^2$. For $k = 1$: $T(1 \mid 0)$. [Show the solution](?fam=par&k=1)

</details>

### Exercise 2: Common point

Show that all graphs of $f_k(x) = x^2 - 2kx + k$ pass through the point $\left(\frac{1}{2} \mid \frac{1}{4}\right)$.

<details>
<summary>Show solution</summary>

$f_k\left(\frac{1}{2}\right) = \frac{1}{4} - k + k = \frac{1}{4}$ – independent of $k$. In general: $f_k(x) = x^2 + k(1 - 2x)$, and the term with $k$ vanishes exactly for $x = \frac{1}{2}$. [Show](?fam=par&k=-1)

</details>

### Exercise 3: Case analysis

For which $k$ does $f_k(x) = kx^2 - x^4$ have three extreme points? State them. [Load exercise](?fam=quart&k=2&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_k'(x) = 2kx - 4x^3 = 2x(k - 2x^2)$. For $k > 0$: $x = 0$ (minimum) and $x = \pm\sqrt{\frac{k}{2}}$ (maxima $\left(\pm\sqrt{\frac{k}{2}} \mid \frac{k^2}{4}\right)$), so for $k = 2$: $H(\pm 1 \mid 1)$ and $T(0 \mid 0)$. For $k \leq 0$ only the maximum $(0 \mid 0)$. [Show the solution](?fam=quart&k=2)

</details>

### Exercise 4: Locus step by step

For $f_k(x) = x^3 - kx$ ($k > 0$), find the extreme points and the equation of the curve they lie on. Check with $k = 3$. [Load exercise](?fam=cub&k=3&dv=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$x_E = \pm\sqrt{\frac{k}{3}}$, $y_E = x_E\left(x_E^2 - k\right) = \mp\frac{2k}{3}\sqrt{\frac{k}{3}}$. From $x^2 = \frac{k}{3}$ it follows that $k = 3x^2$; substituted: $y = x^3 - 3x^2 \cdot x = -2x^3$ (with $x \neq 0$). Check $k = 3$: $H(-1 \mid 2)$, $T(1 \mid -2)$, and indeed $-2 \cdot (-1)^3 = 2$. [Show the solution](?fam=cub&k=3)

</details>

### Exercise 5: Inflection points and their locus

Find the inflection point of $f_k(x) = x \cdot e^{-kx}$ ($k \neq 0$) and the curve on which all inflection points lie. $f_k''(x) = k \cdot e^{-kx}(kx - 2)$. [Load exercise](?fam=exp&k=1&wp=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_k''(x) = 0 \Rightarrow x = \frac{2}{k}$ (change of sign, because $kx - 2$ changes sign there). $f_k\left(\frac{2}{k}\right) = \frac{2}{k} \cdot e^{-2}$, so $W\left(\frac{2}{k} \mid \frac{2}{k e^2}\right)$; for $k = 1$: $W(2 \mid 0.27)$. Locus: substituting $k = \frac{2}{x}$ gives $y = \frac{x}{e^2}$. [Show the solution](?fam=exp&k=1&wp=1)

</details>

### Exercise 6: A family without a common point

Let $f_k(x) = (x - k) \cdot e^x$. Find the minimum in terms of $k$ and its locus, and show that there is no point common to all curves of the family. [Load exercise](?fam=expk&k=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_k'(x) = e^x + (x - k)e^x = e^x(x - k + 1) = 0 \Rightarrow x = k - 1$; $f_k(k - 1) = -e^{k-1}$, so $T(k - 1 \mid -e^{k-1})$, for $k = 1$: $T(0 \mid -1)$. Locus: $k = x + 1$, $y = -e^x$. Common points: $(x - k_1)e^x = (x - k_2)e^x \iff (k_2 - k_1)e^x = 0$ – impossible for $k_1 \neq k_2$, because $e^x > 0$. [Show the solution](?fam=expk&k=1&wp=1)

</details>

## Ideas for the classroom

- **Use:** upper secondary: polynomial functions with parameters, then applications and combined functions with parameters (including families of exponential functions).
- **Guess first, then calculate:** first make the locus visible as a glowing trace with “Run through k” and let the class guess an equation, then calculate with “Show the results” switched off and reveal step by step.
- **Case analysis on the k-ray:** beforehand, the class marks on a number line for which $k$ which kind of extreme points appear, and compares with the simulation's k-ray.
- **Special cases:** gap in the locus at $x = 0$, saddle point at $k = 0$, touching instead of crossing at the common point – good for a discussion about precise wording.
- **Common pitfalls:**
  - When differentiating, $k$ is treated like a variable.
  - The case analysis (e.g. $k < 0$) is forgotten; square roots of negative numbers.
  - For the locus, $x$ is not solved for $k$; instead $k$ is simply left out.
  - When setting up common points, $k_1 \neq k_2$ is not used, so you divide by zero.
