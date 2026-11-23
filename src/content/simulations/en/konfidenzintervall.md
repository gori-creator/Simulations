---
description: "Prediction and confidence intervals: draw many samples and see how often the intervals hit the true p – with the prediction interval, the confidence ellipse and the required sample size."
---

## What is it about?

**Prediction interval (p known):** for $n = 100$ coin tosses, $h$ lies in $[p - 1.96\sigma;\, p + 1.96\sigma] = [0.402;\, 0.598]$ with about 95% probability, where $\sigma = \sqrt{p(1-p)/n}$.

**Confidence interval (p unknown):** from $h = 0.4$ and $n = 100$ the approximation gives $0.4 \pm 1.96\sqrt{0.24/100} = [0.304;\, 0.496]$. The interval is random, not $p$: about 95% of such intervals contain the true $p$ – green intervals hit, red ones miss.

The **confidence ellipse** contains all $(p \mid h)$ with $|h - p| \le z\sqrt{p(1-p)/n}$. For a margin $\pm\varepsilon$ you need $n \ge z^2 p(1-p)/\varepsilon^2$; without prior knowledge $p = 0.5$.

## Try it

1. Draw 100 samples and count the misses. [Load](?mode=conf&p=0.4&n=100&level=95&method=wald)
2. Small $p$, small $n$: the approximation fails. [Load](?mode=conf&p=0.05&n=30&level=95&method=wald)
3. The ellipse: [load](?mode=ellipse&n=100&h=0.4&p=0.5&level=95&method=wilson)

- Hypothesis test with rejection region, type I and II errors and power function: [load](?mode=test&n=100&p0=0.5&side=right&alpha=5&kobs=60&p=0.6)
- Coverage of both methods over p: [load](?mode=cover&n=30&level=95&p=0.1)
- Practice calculations: [load](?mode=ex&q=1)

## Tasks

### Task 1

40 of 100 people agree. Find the 95% confidence interval.

<details>
<summary>Show solution</summary>

Approximation $[0.304;\, 0.496]$, via the ellipse $[0.309;\, 0.498]$.

</details>

### Task 2

How many people for a margin of ±5% at 95%?

<details>
<summary>Show solution</summary>

$n \ge (1.96/0.1)^2 = 384.2$, so 385. [Show](?mode=size&eps=0.05&level=95)

</details>

## Ideas for the classroom

- **Misconception:** “$p$ lies in the interval with 95% probability” – $p$ is fixed, the interval varies.
- Twice the accuracy needs four times the sample size.
