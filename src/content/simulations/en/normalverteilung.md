## What is it about?

Many measured quantities – body heights, filling volumes, measurement errors, IQ scores – are approximately **normally distributed**. Their values cluster around the **mean** (expected value) $\mu$; the **standard deviation** $\sigma$ describes how widely they spread. One writes $X \sim N(\mu;\,\sigma^2)$.

For a continuous random variable a single value has probability $0$: there is no area above a point, so $P(X = a) = 0$. You ask about intervals. The probability $P(a \leq X \leq b)$ is the **area under the density curve**

$$\varphi(x) = \frac{1}{\sigma\sqrt{2\pi}} \cdot e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

between $a$ and $b$. The **distribution function** $F(x) = P(X \leq x)$ gives the area to the left of $x$; so $P(a \leq X \leq b) = F(b) - F(a)$ and $P(X \geq a) = 1 - F(a)$. For the standard normal distribution $N(0;\,1)$ it is called $\Phi$; after standardising, $F(x) = \Phi\!\left(\frac{x - \mu}{\sigma}\right)$, for example for IQ $P(X \leq 130) = F(130) = \Phi(2.00)$.

**Properties of the bell curve:** symmetric about $x = \mu$, maximum at $\mu$ with $\varphi(\mu) = \frac{1}{\sigma\sqrt{2\pi}}$ (about $0.3989$ for $\sigma = 1$), points of inflection at $\mu \pm \sigma$, total area $1$. The tangents at the points of inflection meet the $x$-axis exactly at $\mu \pm 2\sigma$. If you halve $\sigma$, the bell becomes half as wide and twice as tall.

**Sigma rules:** $P(\mu - \sigma \leq X \leq \mu + \sigma) \approx 68.3\%$, for $2\sigma$ about $95.4\%$, for $3\sigma$ about $99.7\%$ – for every normal distribution. **Standardising:** with $z = \frac{x - \mu}{\sigma}$ every normal distribution becomes the standard normal distribution $N(0;\,1)$. The bell is shifted by $\mu$ and stretched or squashed by the factor $\frac{1}{\sigma}$; the marked area stays the same. That is why a single table for $\Phi$ is enough. **Inverse (quantiles):** if the probability is given and the bound is wanted, you read the $z$ table backwards. From $P(X \geq x) = 5\%$ it follows that $\Phi(z) = 0.95$, so $z \approx 1.645$ and $x = \mu + z \cdot \sigma$.

**Approximating the binomial distribution:** for $X \sim B(n;\,p)$ with $\mu = n \cdot p$ and $\sigma = \sqrt{n \cdot p \cdot (1-p)}$, for large $\sigma$ the approximation $P(X \leq k) \approx \Phi\!\left(\frac{k + 0.5 - \mu}{\sigma}\right)$ holds. The $+\,0.5$ is the **continuity correction**: the bar for $k$ reaches from $k - 0.5$ to $k + 0.5$. As a rule of thumb, the **Laplace condition** $\sigma > 3$ applies.

## Try it

1. [Standard normal distribution](?sit=abs&mu=0&sg=1&a=-1&b=1): drag the bounds $a$ and $b$. How do the area and the bar $F(b) - F(a)$ change? (Here $F = \Phi$.) Press “μ ± σ”, “μ ± 2σ” and “μ ± 3σ” one after the other.
2. Change $\sigma$ while “μ ± σ” is marked. Why does the probability stay the same, although the curve looks completely different?
3. [Properties of the bell](?prop=1&cdf=0): where are the maximum, the points of inflection and the zeros of the inflection tangents? Then set [a very small σ](?sg=0.2&a=-0.2&b=0.2&prop=1): how tall does the bell become?
4. [Standardise](?sit=iq&typ=between&ia=115&ib=130): press “Standardise”. Watch how the IQ axis turns into the $z$ axis. Which numbers stand above $z = 1$ and $z = 2$ at the end?
5. [Special case X = a](?typ=eq&a=1): why is $P(X = 1) = 0$, although the curve is not zero there?
6. [Inverse](?mode=quant&sit=iq&qt=ge&qp=5): press “Find the bound” and drag the bound. Between which table values does $0.95$ lie?
7. [Two filling machines](?mode=cmp): which machine keeps to the range $495$ to $505\,\text{ml}$ better? Press “Centre both machines”. Compare with [narrow, but shifted](?mode=cmp&m2=504&s2=2).
8. [Approximating the binomial](?mode=binom&bn=50&bp=0.3&bk=12): switch the continuity correction off and on. Then draw 1000 values at once in the [sample](?mode=sample&sit=fill).

## Exercises

### Exercise 1: Standardising

a) Calculate $P(X \geq 130)$ and $P(115 \leq X \leq 130)$ for IQ ($\mu = 100$, $\sigma = 15$). [Load exercise](?sit=iq&typ=ge&ia=130&show=0&_hide=1) b) A machine fills bottles with $\mu = 500\,\text{ml}$ and $\sigma = 4\,\text{ml}$. How likely are $497$ to $503\,\text{ml}$? [Load exercise](?sit=fill&typ=between&fa=497&fb=503&show=0&_hide=1)

<details>
<summary>Show solution</summary>

a) $z = \frac{130 - 100}{15} = 2$, so $P(X \geq 130) = 1 - \Phi(2) \approx 1 - 0.9772 = 0.0228 \approx 2.3\%$. For $115$, $z = 1$: $P(115 \leq X \leq 130) = \Phi(2) - \Phi(1) \approx 0.9772 - 0.8413 = 0.1359$. [Show the solution](?sit=iq&typ=between&ia=115&ib=130&zs=1)

b) $z = \pm 0.75$, so $P = 2\Phi(0.75) - 1 \approx 2 \cdot 0.7734 - 1 = 0.5467 \approx 54.7\%$. [Show the solution](?sit=fill&typ=between&fa=497&fb=503)

</details>

### Exercise 2: The bound is wanted

a) Which IQ is exceeded by only $5\%$ of people? b) In what range, symmetric about $500\,\text{ml}$, do $95\%$ of the filling volumes lie? [Load exercise](?mode=quant&sit=iq&qt=ge&qp=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

a) $1 - \Phi(z) = 0.05$, so $\Phi(z) = 0.95$. In the table, $0.95$ lies between $\Phi(1.64) = 0.9495$ and $\Phi(1.65) = 0.9505$, so $z \approx 1.645$. Then $x = 100 + 1.645 \cdot 15 \approx 124.7$. [Show the solution](?mode=quant&sit=iq&qt=ge&qp=5)

b) $2\Phi(z) - 1 = 0.95$, so $\Phi(z) = 0.975$ and $z \approx 1.96$. $c = 1.96 \cdot 4\,\text{ml} = 7.84\,\text{ml}$, range $[492.16;\ 507.84]\,\text{ml}$. [Show the solution](?mode=quant&sit=fill&qt=mid&qp=95)

</details>

### Exercise 3: Two machines, one tolerance

Machine A: $\mu = 500\,\text{ml}$, $\sigma = 4\,\text{ml}$. Machine B: $\mu = 502\,\text{ml}$, $\sigma = 2.5\,\text{ml}$. $495$ to $505\,\text{ml}$ is allowed. Which machine is better? What changes if B is set to $500\,\text{ml}$? [Load exercise](?mode=cmp&show=0&_hide=1)

<details>
<summary>Show solution</summary>

A: $\Phi(1.25) - \Phi(-1.25) \approx 0.7887$. B: $z_1 = \frac{495 - 502}{2.5} = -2.8$, $z_2 = 1.2$, so $\Phi(1.2) - \Phi(-2.8) \approx 0.8849 - 0.0026 = 0.8824$. B is better. When centred, the limits are at $\pm 2\sigma$, and then it is even $95.4\%$. [Show the solution](?mode=cmp&m2=500)

</details>

### Exercise 4: Approximating the binomial distribution

A coin is tossed 100 times. Approximate $P(X \leq 55)$ for the number $X$ of heads. [Load exercise](?mode=binom&bn=100&bp=0.5&bk=55&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\mu = 50$, $\sigma = \sqrt{100 \cdot 0.5 \cdot 0.5} = 5 > 3$. $P(X \leq 55) \approx \Phi\!\left(\frac{55.5 - 50}{5}\right) = \Phi(1.1) \approx 0.8643$. Exactly: $0.8644$. Without the continuity correction: $\Phi(1) \approx 0.8413$. [Show the solution](?mode=binom&bn=100&bp=0.5&bk=55)

</details>

### Exercise 5: Laplace condition (puzzle)

For $p = 0.1$: from which number $n$ on is the Laplace condition $\sigma > 3$ satisfied? Is it satisfied for $n = 100$? [Load exercise](?mode=binom&bn=20&bp=0.1&bk=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\sigma = \sqrt{n \cdot 0.1 \cdot 0.9} > 3 \iff n \cdot 0.09 > 9 \iff n > 100$. For $n = 100$, $\sigma = 3$ – just not satisfied. Only from $n = 101$. [Show the solution](?mode=binom&bn=101&bp=0.1&bk=10)

</details>

## Ideas for the classroom

- **Use:** upper secondary (continuous random variables, normal distribution). Whether quantiles and the approximation of the binomial distribution are calculated in class – please check your curriculum.
- **Start with the area:** first let the class estimate what share lies between $a$ and $b$, then drag and compare. The bar in the graph of the distribution function shows why you subtract two table values.
- **Making standardising visible:** the animation helps to explain why a single $\Phi$ table is enough for all normal distributions.
- **Table backwards and quality control:** the “Inverse” view shows where to look in the table (compare with the calculator). When comparing two machines, the class can argue beforehand whether a small $\sigma$ or a centred $\mu$ matters more.
- **Common pitfalls:**
  - The height of the density curve is read as a probability – it is the area that counts; $\varphi$ can even be greater than $1$.
  - For $P(X \geq a)$, the $1 - F(a)$ is forgotten.
  - When standardising, $\mu$ and $\sigma$ are swapped, or students divide by $\sigma^2$.
  - For the inverse, $\Phi(z) = 0.05$ is looked for instead of $0.95$.
  - The continuity correction is forgotten or applied wrongly ($P(X < k) = P(X \leq k - 1)$).
