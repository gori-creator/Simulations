---
description: "Interactive simulation for year 11: investigate how functions behave as x → +∞ and x → −∞ – a point runs outwards on a logarithmic scale, the view zooms out, a magnifier shows the tiny distance to the horizontal asymptote, the table fills up and a draggable ε-strip makes the limit visible; plus counterexamples without a limit."
---

## What is it about?

If $f(x)$ gets arbitrarily close to a number $L$ as $x \to +\infty$, we write $\lim\limits_{x \to +\infty} f(x) = L$; the line $y = L$ is a **horizontal asymptote**. “Arbitrarily close” means: for every **ε-strip** $L - \varepsilon < y < L + \varepsilon$, however narrow, there is a position $x_\varepsilon$ beyond which the graph stays inside, i.e. $\lvert f(x) - L\rvert < \varepsilon$ for all $x > x_\varepsilon$. If $f(x)$ grows beyond every bound, there is no limit.

Example: $\frac{2x + 1}{x - 1} = 2 + \frac{3}{x - 1} \to 2$, and $\frac{3}{x - 1} < 0.5 \iff x > 7$, so $x_\varepsilon = 7$ for $\varepsilon = 0.5$. For rational functions: degree of numerator < degree of denominator → $0$; equal degrees → ratio of the leading coefficients; numerator degree larger → $\pm\infty$. The graph may cross the asymptote, as $\frac{\sin x}{x}$ shows, and the limits for $+\infty$ and $-\infty$ may differ.

## Try it

1. Press “Let x run outwards” and watch the table and the magnifier. [Start](?f=rat&eps=0.5)
2. Drag the edge of the strip or press “Make ε smaller”. Where does $x_\varepsilon$ go? [Narrow strip](?f=rat&eps=0.05)
3. [$\frac{\sin x}{x}$](?f=osc&eps=0.1) crosses its asymptote infinitely often – is there still a limit?
4. [$\frac{2^x}{2^x + 1}$](?f=logi&dir=m&eps=0.2) has different limits on the [two sides](?f=logi&dir=p&eps=0.2).
5. [$0.1x^3 - x$](?f=poly): move the red trial strip. Can you keep the graph inside?

## Tasks

### Task 1: Find the limit

Find $\lim\limits_{x \to +\infty} \frac{2x}{x^2 + 1}$. [Load task](?f=low&dir=p&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Divide by $x^2$: $\frac{2/x}{1 + 1/x^2} \to \frac{0}{1} = 0$. The asymptote is $y = 0$. [Show](?f=low&dir=p&eps=0.5)

</details>

### Task 2: How far out?

For $f(x) = \frac{2x + 1}{x - 1}$, from which $x$ on is $\lvert f(x) - 2\rvert < 0.1$?

<details>
<summary>Show solution</summary>

$\frac{3}{x - 1} < 0.1 \iff x - 1 > 30 \iff x > 31$. [Show](?f=rat&eps=0.1)

</details>

### Task 3: No limit

Explain why $0.1x^3 - x$ has no limit as $x \to +\infty$.

<details>
<summary>Show solution</summary>

$f(x) = x^3\left(0.1 - \frac{1}{x^2}\right)$; the bracket tends to $0.1$ and $x^3$ exceeds every bound, so $f(x) \to +\infty$. The graph leaves every strip. [Show](?f=poly&dir=p&c=3&eps=0.5)

</details>

## Ideas for the classroom

- Switch off “Show the limit and the asymptote”: students guess the limit from the table, justify it algebraically and then reveal it.
- ε-game in pairs: one picks ε, the other predicts $x_\varepsilon$ (for $\frac{2x + 1}{x - 1}$: $x_\varepsilon = 1 + \frac{3}{\varepsilon}$).
- **Common stumbling blocks:**
  - “An asymptote is never crossed.” – $\frac{\sin x}{x}$ crosses it infinitely often.
  - “$f(x) \to \infty$ is a limit too.” – Then there is no (finite) limit.
  - The limits for $+\infty$ and $-\infty$ are silently assumed to be equal.
