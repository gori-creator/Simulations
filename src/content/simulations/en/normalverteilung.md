---
description: "Interactive simulation for upper secondary: the normal distribution with a bell curve, draggable bounds, probability as area, the distribution function Φ, sigma rules and standardisation – also for IQ scores and filling volumes."
---

## What is it about?

For a normally distributed random variable, the probability $P(a \leq X \leq b)$ is the **area under the bell curve** between $a$ and $b$, and equals $\Phi(b) - \Phi(a)$ with the distribution function $\Phi(x) = P(X \leq x)$. The curve is symmetric about $\mu$ with points of inflection at $\mu \pm \sigma$.

**Sigma rules:** about $68.3\,\%$ within $\mu \pm \sigma$, $95.4\,\%$ within $\mu \pm 2\sigma$, $99.7\,\%$ within $\mu \pm 3\sigma$. **Standardise** with $z = \frac{x - \mu}{\sigma}$.

**Approximating the binomial** (view *Approximating the binomial*): for $X \sim B(n;\,p)$, $P(X \leq k) \approx \Phi\left(\frac{k + 0.5 - \mu}{\sigma}\right)$ with $\mu = np$, $\sigma = \sqrt{np(1-p)}$ and the continuity correction $+0.5$; rule of thumb (Laplace condition): $\sigma > 3$. **Samples** (view *Sample*): with many values the histogram approaches the bell curve and $\bar{x}$, $s$ approach $\mu$, $\sigma$.

## Try it

1. [Standard normal](?sit=abs&mu=0&sg=1&a=-1&b=1): drag the bounds and press “μ ± σ”, “μ ± 2σ”, “μ ± 3σ”.
2. [IQ above 130](?sit=iq&typ=ge&ia=130) and [filling volume](?sit=fill&typ=le&fb=495).
3. [Approximating the binomial](?mode=binom&bn=50&bp=0.3&bk=12): change $n$ and $p$; toggle the continuity correction. [Too rough](?mode=binom&bn=20&bp=0.1&bk=1): why?
4. [Sample from the filling machine](?mode=sample&sit=fill): draw 50 values several times, then 1000.

## Tasks

### Task 1: Standardising

IQ: $\mu = 100$, $\sigma = 15$. Find $P(X \geq 130)$. [Load task](?sit=iq&typ=ge&ia=130&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$z = 2$, so $1 - \Phi(2) \approx 0.0228$. [Show](?sit=iq&typ=ge&ia=130)

</details>

### Task 2: Filling machine

$\mu = 500\,\text{ml}$, $\sigma = 4\,\text{ml}$: find $P(497 \leq X \leq 503)$. [Load task](?sit=fill&typ=between&fa=497&fb=503&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$z = \pm 0.75$: $P \approx 0.5467$. [Show](?sit=fill&typ=between&fa=497&fb=503)

</details>

### Task 3: Approximating the binomial

100 coin tosses: approximate $P(X \leq 55)$. [Load task](?mode=binom&bn=100&bp=0.5&bk=55&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\mu = 50$, $\sigma = 5$: $\Phi\left(\frac{55.5 - 50}{5}\right) = \Phi(1.1) \approx 0.8643$ (exact $0.8644$; without correction $0.8413$). [Show](?mode=binom&bn=100&bp=0.5&bk=55)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Start from the Galton board and the binomial distribution.
- **Common stumbling blocks:** reading the height of the curve as a probability; forgetting $1 - \Phi(a)$ for $P(X \geq a)$; forgetting the continuity correction.
