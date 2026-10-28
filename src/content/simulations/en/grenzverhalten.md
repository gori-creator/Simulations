---
description: "Interactive simulation for year 11: investigate how functions behave as x → +∞ and x → −∞ – a point runs outwards on a logarithmic scale, the view zooms out, a magnifier shows the tiny distance to the horizontal asymptote, the table fills up and a draggable ε-strip makes the limit visible; plus counterexamples without a limit."
---

## What is it about?

How does $f(x)$ behave when $x$ gets larger and larger ($x \to +\infty$) or smaller and smaller ($x \to -\infty$)? There are two typical cases:

- **$f(x)$ gets arbitrarily close to a number $L$.** We write $\lim\limits_{x \to +\infty} f(x) = L$ and call $L$ the **limit**. The line $y = L$ is a **horizontal asymptote** of the graph.
- **$f(x)$ grows beyond every bound** (or falls below every bound). We write $f(x) \to +\infty$ or $f(x) \to -\infty$. Then there is no limit.

**What does “arbitrarily close” mean?** Put an **ε-strip** around the asymptote: all points with $L - \varepsilon < y < L + \varepsilon$. However narrow the strip is, from some position $x_\varepsilon$ on the graph stays inside, i.e. $\lvert f(x) - L\rvert < \varepsilon$ for all $x > x_\varepsilon$. The smaller $\varepsilon$, the further out $x_\varepsilon$ lies.

**Recognising limits:** A rewriting often helps, for example

$$
f(x) = \frac{2x + 1}{x - 1} = 2 + \frac{3}{x - 1} .
$$

As $x \to \pm\infty$, $\frac{3}{x - 1} \to 0$, so $f(x) \to 2$. For $x > 1$, $\lvert f(x) - 2\rvert = \frac{3}{x - 1}$; from $\frac{3}{x - 1} < 0.5$ we get $x > 7$. So $x_\varepsilon = 7$ for $\varepsilon = 0.5$.

**Degree rule for rational functions** (Z: numerator, N: denominator):

| Case | Behaviour as $x \to \pm\infty$ | Example |
| --- | --- | --- |
| deg Z < deg N | $f(x) \to 0$ | $\frac{2x}{x^2 + 1} \to 0$ |
| deg Z = deg N | ratio of the leading coefficients | $\frac{3x^2 + 1}{x^2 + 1} \to \frac{3}{1} = 3$ |
| deg Z > deg N | $f(x) \to +\infty$ or $-\infty$ | $0.1x^3 - x \to \pm\infty$ |

The graph **may** cross the asymptote – $\frac{\sin x}{x}$ does so at every $x = k\pi$. All that matters is that it gets arbitrarily close. And the limits for $+\infty$ and $-\infty$ can differ: $\frac{2^x}{2^x + 1}$ has the asymptote $y = 1$ on the right and $y = 0$ on the left.

## Try it

1. Press “Let x run outwards”. P runs from $x = 2$ to $x = 10\,000$, each power of ten at the same speed. The view zooms out, the table fills up, and as soon as the distance is too small to see, a magnifier opens. How close does $f(x)$ get to $2$? [Start](?f=rat&eps=0.5)
2. Drag the edge of the strip inwards or press “Make ε smaller” several times. Where does $x_\varepsilon$ glide to? [Narrow strip](?f=rat&eps=0.05)
3. [$\frac{1}{x} + 1$ as $x \to -\infty$](?f=inv&dir=m&eps=0.25): Does the graph approach from above or from below? Switch the direction.
4. [$\frac{\sin x}{x}$](?f=osc&eps=0.1): The graph crosses the asymptote again and again. Is there still a limit? What do the dashed curves $y = \pm\frac{1}{\lvert x\rvert}$ do?
5. [$\frac{2^x}{2^x + 1}$](?f=logi&dir=m&eps=0.2): Compare $x \to -\infty$ with [$x \to +\infty$](?f=logi&dir=p&eps=0.2).
6. [$x \cdot 2^{-x}$](?f=xexp&eps=0.25): The factor $x$ grows, yet $f(x)$ tends to $0$. Who “wins”?
7. [$0.1x^3 - x$](?f=poly): Move the trial strip “L = 3 ?” upwards. Is there a value $L$ around which the graph stays in the strip?

## Tasks

### Task 1: Find the limit

Find $\lim\limits_{x \to +\infty} \frac{2x}{x^2 + 1}$ without looking at the solution. Use the table and the run outwards. [Load task](?f=low&dir=p&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Divide numerator and denominator by $x^2$: $\frac{2x}{x^2 + 1} = \frac{\frac{2}{x}}{1 + \frac{1}{x^2}} \to \frac{0}{1} = 0$. deg Z = 1 < deg N = 2, so the limit is $0$; asymptote $y = 0$. For $x > 0$ the graph lies above it. [Show solution](?f=low&dir=p&eps=0.5)

</details>

### Task 2: How far out?

For $f(x) = \frac{2x + 1}{x - 1}$: from which $x$ on is $\lvert f(x) - 2\rvert < 0.5$, and from which $x$ on is $\lvert f(x) - 2\rvert < 0.1$? Also calculate $f(10)$ and $f(100)$.

<details>
<summary>Show solution</summary>

For $x > 1$, $\lvert f(x) - 2\rvert = \frac{3}{x - 1}$. From $\frac{3}{x - 1} < 0.5$ we get $x - 1 > 6$, so $x > 7$. From $\frac{3}{x - 1} < 0.1$ we get $x - 1 > 30$, so $x > 31$. $f(10) = \frac{21}{9} \approx 2.333$ and $f(100) = \frac{201}{99} \approx 2.0303$. [ε = 0.5](?f=rat&eps=0.5) · [ε = 0.1](?f=rat&eps=0.1)

</details>

### Task 3: From below

Show that $\frac{3x^2 + 1}{x^2 + 1} = 3 - \frac{2}{x^2 + 1}$ and find $x_\varepsilon$ for $\varepsilon = 0.2$. Why does the graph always lie below the asymptote?

<details>
<summary>Show solution</summary>

$3x^2 + 1 = 3(x^2 + 1) - 2$, which gives the rewriting. $\frac{2}{x^2 + 1} < 0.2 \iff x^2 + 1 > 10 \iff \lvert x\rvert > 3$. So $x_\varepsilon = 3$ for $x \to +\infty$ and $x_\varepsilon = -3$ for $x \to -\infty$. Since $\frac{2}{x^2 + 1} > 0$, we always have $f(x) < 3$. [Show](?f=rat2&eps=0.2)

</details>

### Task 4: Exponential function

For $f(x) = 2^x$ and $x \to -\infty$, find the position $x_\varepsilon$ for $\varepsilon = 0.25$. What happens as $x \to +\infty$?

<details>
<summary>Show solution</summary>

$2^x < 0.25 = 2^{-2} \iff x < -2$, so $x_\varepsilon = -2$; asymptote $y = 0$. As $x \to +\infty$, $2^x \to +\infty$: no limit and no asymptote on this side. [x → −∞](?f=exp&dir=m&eps=0.25) · [x → +∞](?f=exp&dir=p)

</details>

### Task 5: Crossing allowed

Use $\lvert \sin x\rvert \le 1$ to explain why $\lim\limits_{x \to +\infty} \frac{\sin x}{x} = 0$. From which $x$ on is $\lvert f(x)\rvert < 0.1$ certainly true? Compare with the $x_\varepsilon$ of the simulation.

<details>
<summary>Show solution</summary>

$\left\lvert\frac{\sin x}{x}\right\rvert \le \frac{1}{\lvert x\rvert} \to 0$, so the limit is $0$. Certainly $\frac{1}{\lvert x\rvert} < 0.1$ for $\lvert x\rvert > 10$. The exact position comes earlier, at $x_\varepsilon \approx 8.42$ (there $\lvert \sin x\rvert = 0.1 \cdot x$). The graph crosses the asymptote at every $x = k\pi$. [Show](?f=osc&eps=0.1)

</details>

### Task 6: No limit

Explain why $f(x) = 0.1x^3 - x$ has no limit as $x \to +\infty$. Give a position from which on $f(x) > 100$.

<details>
<summary>Show solution</summary>

$f(x) = x^3\left(0.1 - \frac{1}{x^2}\right)$: the bracket tends to $0.1$ and $x^3$ grows beyond every bound, so $f(x) \to +\infty$. Every strip is left; the trial strip around $3$ with $\varepsilon = 0.5$, for example, from $x \approx 4.27$ on. $f(11) = 133.1 - 11 = 122.1 > 100$, and $f$ keeps growing for $x > 2$; more precisely $f(x) > 100$ from $x \approx 10.33$ on. [Show](?f=poly&dir=p&c=3&eps=0.5)

</details>

## Ideas for the classroom

- **Use:** Upper secondary, limits at infinity and horizontal asymptotes; how far the ε idea is taken depends on the curriculum. The strip is meant as a visual picture, not as a formal definition.
- **Find the limit:** With “Show the limit and the asymptote” switched off, the asymptote, the strip and the distances are hidden. Students guess the limit from the table and the run, justify it with a rewriting and then check with “Reveal the limit”.
- **ε-game in pairs:** One person picks an ε, the other predicts $x_\varepsilon$ (for $\frac{2x + 1}{x - 1}$, $x_\varepsilon = 1 + \frac{3}{\varepsilon}$); the simulation checks.
- **Model:** Where possible $x_\varepsilon$ is calculated exactly, otherwise numerically ($\frac{\sin x}{x}$, $x \cdot 2^{-x}$). It is always the position from which the condition holds for all further $x$. Exact values are shown with “=”, rounded ones with “≈” (e.g. $x_\varepsilon \approx 8.42$ for $\frac{\sin x}{x}$).
- **Common stumbling blocks:**
  - “An asymptote is never crossed.” – $\frac{\sin x}{x}$ crosses it infinitely often.
  - “$f(x) \to \infty$ is a limit too.” – Then there is no (finite) limit.
  - For large $x$ a calculator often shows exactly $L$ (e.g. $2$). This is read as “$f(x) = L$”, although the distance is only very small – the magnifier shows that it never quite vanishes.
  - The limits for $+\infty$ and $-\infty$ are silently assumed to be equal.
