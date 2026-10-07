---
description: Interactive Galton board – balls fall through rows of pegs and form the binomial distribution, with Pascal's triangle, expected value and bell curve.
---

## What is it about?

On a **Galton board** balls fall through $n$ rows of pegs. At each peg a ball goes **right** with probability $p$ and **left** with $1 - p$. The bin number $k$ is the **number of right bounces**, so $X$ is **binomially distributed**:

$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n - k}
$$

$\binom{n}{k}$ counts the **paths** to bin $k$ – the numbers of **Pascal's triangle**. Expected value and standard deviation: $\mu = np$, $\sigma = \sqrt{np(1-p)}$. For many rows the shape approaches a **bell curve** (normal distribution); a common rule of thumb asks for $\sigma > 3$.

## Try it

1. Drop single balls and follow their paths (L/R).
2. Show Pascal's triangle. [Pascal's triangle](?n=6&pascal=1&binomial=1)
3. Set $p = 0.7$. [Skewed](?p=0.7&binomial=1)
4. 16 rows with **1000 instantly** and the bell curve. [16 rows](?n=16&normal=1&binomial=1&rate=40)

## Exercises

### Exercise 1: One bin

$n = 4$, $p = 0.5$: probability of bin 2?

<details>
<summary>Show solution</summary>

$\binom{4}{2} \cdot 0.5^4 = \frac{6}{16} = 37.5\,\%$. [Show in the simulation](?n=4&pascal=1&binomial=1)

</details>

### Exercise 2: Expected value and spread

Compute $\mu$ and $\sigma$ for $n = 10$, $p = 0.7$.

<details>
<summary>Show solution</summary>

$\mu = 7$, $\sigma = \sqrt{2.1} \approx 1.45$. [Show in the simulation](?n=10&p=0.7&binomial=1)

</details>

## Notes for teachers

- **Use:** Grade 12 (Bernoulli trials, binomial distribution); qualitatively earlier.
- **Misconceptions:** "the ball is steered to the middle" – there are just more paths; bin and path are confused.
