---
description: "Interactive simulation for upper secondary: the normal distribution with a bell curve, draggable bounds and probability as area, the distribution function Φ, sigma rules, standardising as an animation, properties of the bell, quantiles with the z table, two filling machines compared, the binomial approximation and samples."
---

## What is it about?

For a normally distributed random variable $X \sim N(\mu;\,\sigma^2)$, the probability $P(a \leq X \leq b)$ is the **area under the bell curve** between $a$ and $b$, and equals $\Phi(b) - \Phi(a)$ with the distribution function $\Phi(x) = P(X \leq x)$. A single value has probability $P(X = a) = 0$.

**The bell:** symmetric about $\mu$, maximum $\frac{1}{\sigma\sqrt{2\pi}}$ at $\mu$, points of inflection at $\mu \pm \sigma$ (their tangents meet the $x$ axis at $\mu \pm 2\sigma$), total area $1$. **Sigma rules:** about $68.3\,\%$, $95.4\,\%$ and $99.7\,\%$ within $\mu \pm \sigma$, $\pm 2\sigma$, $\pm 3\sigma$.

**Standardising** with $z = \frac{x - \mu}{\sigma}$ shifts and squeezes the bell into $N(0;\,1)$ – the marked area stays the same. **Backwards (quantiles):** from $P(X \geq x) = 5\,\%$ we get $\Phi(z) = 0.95$, $z \approx 1.645$ and $x = \mu + z\sigma$.

**Approximating the binomial:** $P(X \leq k) \approx \Phi\left(\frac{k + 0.5 - \mu}{\sigma}\right)$ with $\mu = np$, $\sigma = \sqrt{np(1-p)}$; rule of thumb (Laplace condition): $\sigma > 3$.

## Try it

1. [Standard normal](?sit=abs&mu=0&sg=1&a=-1&b=1): drag the bounds and press “μ ± σ”, “μ ± 2σ”, “μ ± 3σ”.
2. [Properties of the bell](?prop=1&cdf=0) and [very small σ](?sg=0.2&a=-0.2&b=0.2&prop=1).
3. [Standardise](?sit=iq&typ=between&ia=115&ib=130): press “Standardise” and watch the IQ axis turn into the $z$ axis.
4. [Which IQ is exceeded by only 5 %?](?mode=quant&sit=iq&qt=ge&qp=5) Press “Find the bound”.
5. [Two filling machines](?mode=cmp) and [narrow, but shifted](?mode=cmp&m2=504&s2=2).
6. [Approximating the binomial](?mode=binom&bn=50&bp=0.3&bk=12) and [a sample](?mode=sample&sit=fill).

## Tasks

### Task 1: Standardising

IQ: $\mu = 100$, $\sigma = 15$. Find $P(X \geq 130)$. [Load task](?sit=iq&typ=ge&ia=130&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$z = 2$, so $1 - \Phi(2) \approx 0.0228$. [Show](?sit=iq&typ=ge&ia=130)

</details>

### Task 2: Finding the bound

Which IQ is exceeded by only $5\,\%$? [Load task](?mode=quant&sit=iq&qt=ge&qp=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Phi(z) = 0.95$ lies between $\Phi(1.64) = 0.9495$ and $\Phi(1.65) = 0.9505$, so $z \approx 1.645$ and $x \approx 100 + 1.645 \cdot 15 \approx 124.7$. [Show](?mode=quant&sit=iq&qt=ge&qp=5)

</details>

### Task 3: Two machines

A: $N(500;\,4^2)$, B: $N(502;\,2.5^2)$, tolerance $495$ to $505\,\text{ml}$. Which is better? [Load task](?mode=cmp&show=0&_hide=1)

<details>
<summary>Show solution</summary>

A: $2\Phi(1.25) - 1 \approx 0.7887$; B: $\Phi(1.2) - \Phi(-2.8) \approx 0.8824$. B is better. [Show](?mode=cmp)

</details>

### Task 4: Approximating the binomial

100 coin tosses: approximate $P(X \leq 55)$. [Load task](?mode=binom&bn=100&bp=0.5&bk=55&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\mu = 50$, $\sigma = 5$: $\Phi(1.1) \approx 0.8643$ (exact $0.8644$; without correction $0.8413$). [Show](?mode=binom&bn=100&bp=0.5&bk=55)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Let students estimate an area before dragging; the bar in the $\Phi$ chart explains the subtraction $\Phi(b) - \Phi(a)$.
- The standardising animation shows why one table for $\Phi$ is enough.
- **Common stumbling blocks:** reading the height of the curve as a probability; forgetting $1 - \Phi(a)$ for $P(X \geq a)$; looking for $\Phi(z) = 0.05$ instead of $0.95$; forgetting the continuity correction.
