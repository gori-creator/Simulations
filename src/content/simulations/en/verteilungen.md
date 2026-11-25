## What is it about?

The binomial distribution fits when an experiment is repeated $n$ times under the same conditions. Often, though, the situation is different: you count rare events in a time span, you draw without replacement, or you measure a waiting time. Each has its own distribution.

### Poisson distribution: rare events

How many calls arrive in a minute, how many typos are on a page, how many nuclei decay in a second? If events are independent and occur on average $\lambda$ times,

$$P(X = k) = \frac{\lambda^k}{k!}\, e^{-\lambda}.$$

Expected value and variance are both $\lambda$.

**Approximating the binomial distribution:** if $n$ is large and $p$ small, with a fixed expected value $\lambda = n \cdot p$, then $B(n;\,p)$ becomes more and more like the Poisson distribution. In the comparison you see: at $n = 20$ there are still differences; at $n = 200$ the outlines lie almost exactly on the bars.

### Hypergeometric distribution: without replacement

An urn contains $N$ balls, $M$ of them hits. You draw $n$ balls **without replacement**. The probability of exactly $k$ hits is

$$P(X = k) = \frac{\binom{M}{k} \binom{N-M}{n-k}}{\binom{N}{n}}.$$

Example lottery 6 out of 49: $P(\text{3 right}) = \tfrac{\binom{6}{3}\binom{43}{3}}{\binom{49}{6}} \approx 1.77\,\%$. If the urn is very large compared with $n$, drawing hardly changes anything – then the binomial distribution with $p = M/N$ is a good approximation.

### Exponential distribution: waiting times

If events occur on average at the rate $\lambda$, the waiting time until the next event is exponentially distributed. It is a **continuous** random variable with density $f(t) = \lambda e^{-\lambda t}$:

$$P(T \le t) = 1 - e^{-\lambda t}, \qquad E(T) = \frac{1}{\lambda}.$$

The probability is the **area** under the density. A special feature is **memorylessness**: someone who has already waited for an hour still has to wait $1/\lambda$ on average.

## Try it

- [3 calls per minute](?mode=poisson&lam=3&k=5&vgl=0): How likely are at most 5 calls?
- [Poisson ≈ binomial](?mode=poisson&lam=3&n=200&vgl=1&k=3): Reduce $n$. When do the differences become clear?
- [Lottery](?mode=hyper&N=49&M=6&z=6&k=3&vgl=1): Compare with the binomial distribution.
- [Waiting time](?mode=exp&rate=0.5&t=2): How long must you wait for the probability to exceed 90 %?

## Exercises

**1. Call centre.** On average 3 calls arrive per minute. What is the probability that no call arrives in a minute? [Load exercise](?mode=poisson&lam=3&k=0&vgl=0&_hide=1)

<details><summary>Show solution</summary>

$P(X = 0) = e^{-3} \approx 0.050$, so about 5 %.

</details>

**2. Quality control.** A delivery of 20 parts contains 4 defective ones. 5 parts are tested without replacement. How likely is it that none of them is defective? [Load exercise](?mode=hyper&N=20&M=4&z=5&k=0&vgl=1&_hide=1)

<details><summary>Show solution</summary>

$P(X = 0) = \dfrac{\binom{4}{0}\binom{16}{5}}{\binom{20}{5}} = \dfrac{4368}{15504} \approx 0.282$.

</details>

**3. Waiting time.** A component fails on average once every 2 hours ($\lambda = 0.5$ per hour). How likely does it last at most 2 hours? [Load exercise](?mode=exp&rate=0.5&t=2&_hide=1)

<details><summary>Show solution</summary>

$P(T \le 2) = 1 - e^{-1} \approx 0.632$.

</details>
