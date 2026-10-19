---
description: "Histogram of B(n; p) with expected value and σ intervals: choose P(X = k), P(X ≤ k), P(X ≥ k) and P(a ≤ X ≤ b) right on the histogram, calculate with the values inserted, view the step function F(k) and simulate Bernoulli chains."
---

## What is it about?

A **Bernoulli chain** of length $n$ repeats an experiment with only two outcomes (**success** or **failure**) $n$ times **independently**, always with the same **probability of success** $p$. The number of successes $X$ is then **binomially distributed**, $X \sim B(n;\,p)$:

$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n - k}
$$

With the **cumulative distribution function** $F(k) = P(X \le k)$:

- at most $k$: $P(X \le k) = F(k)$
- at least $k$: $P(X \ge k) = 1 - F(k - 1)$
- between $a$ and $b$: $P(a \le X \le b) = F(b) - F(a - 1)$

Expected value $\mu = n \cdot p$, standard deviation $\sigma = \sqrt{n \cdot p \cdot (1-p)}$. The interval $[\mu - 2\sigma;\, \mu + 2\sigma]$ usually holds about $95\,\%$ of the probability.

## Try it

1. Drag the bound $k$ on the histogram and watch the calculation. [Load example](?n=10&p=0.5&ev=le&k=3)
2. Change $p$ and $n$: where does $\mu$ go, how wide is the histogram? [B(20; 0.3)](?n=20&p=0.3&ev=eq&k=6)
3. Switch to the cumulative view: every bar becomes a step of $F(k)$. [Step function](?n=20&p=0.3&ev=ge&k=9&view=cdf)
4. Run the experiment 1000 times and compare the orange outline with the bars.

## Tasks

### Task 1: Guessing in a test

$20$ questions with four answers each, guessing at random. Find $P(X = 5)$ and $P(X \ge 10)$. [Load task](?n=20&p=0.25&ev=ge&k=10&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(X = 5) = \binom{20}{5} \cdot 0.25^5 \cdot 0.75^{15} \approx 0.2023$; $P(X \ge 10) = 1 - F(9) \approx 1 - 0.9861 = 0.0139$. [Show in simulation](?n=20&p=0.25&ev=ge&k=10)

</details>

### Task 2: 100 coin tosses

Find $\mu$, $\sigma$ and $P(40 \le X \le 60)$. [Load task](?n=100&p=0.5&ev=ab&a=40&b=60&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\mu = 50$, $\sigma = 5$, $P(40 \le X \le 60) = F(60) - F(39) \approx 0.9824 - 0.0176 = 0.9648$ – exactly the $2\sigma$ interval. [Show in simulation](?n=100&p=0.5&ev=ab&a=40&b=60)

</details>

### Task 3: At least one

A part is faulty with probability $0.05$. Among $50$ parts, find $P(X \ge 1)$. [Load task](?n=50&p=0.05&ev=ge&k=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(X \ge 1) = 1 - 0.95^{50} \approx 0.9231$; $\mu = 2.5$. [Show in simulation](?n=50&p=0.05&ev=ge&k=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Use it after the Galton board: there the distribution emerges, here you calculate with it.
- Check the requirements together first (two outcomes, independent, same $p$) – drawing without replacement is a good counterexample.
- **Common stumbling blocks:**
  - “At least $k$” computed as $1 - F(k)$ instead of $1 - F(k - 1)$.
  - $P(a \le X \le b)$ computed as $F(b) - F(a)$, which misses $P(X = a)$.
  - Confusing $\sigma$ with the variance $n \cdot p \cdot (1-p)$.
