---
description: Interactive Galton board – balls fall through rows of pegs and form the binomial distribution, with Pascal's triangle, expected value and bell curve.
---

## What is it about?

On a **Galton board**, balls fall through $n$ rows of pegs. At each peg a ball bounces **right** with probability $p$ and **left** with probability $1 - p$. At the bottom it lands in one of the bins $0, 1, \ldots, n$ – the bin number $k$ is exactly the **number of right bounces**.

Each peg is a **Bernoulli trial**, and the whole path is a **Bernoulli chain** of length $n$. The number $X$ of right bounces is **binomially distributed**:

$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n - k}
$$

- $\binom{n}{k}$ counts the **paths** to bin $k$. These numbers form **Pascal's triangle**: the number of paths to a peg is the sum of the paths to the two pegs above it.
- $p^k \cdot (1 - p)^{n - k}$ is the probability of **one** such path.

**Expected value and standard deviation:**

$$
\mu = n \cdot p \qquad \sigma = \sqrt{n \cdot p \cdot (1 - p)}
$$

With many rows, the shape of the distribution approaches a **bell curve** (normal distribution). As a rule of thumb, the approximation is good when $\sigma > 3$ (Laplace condition).

## Try it

1. Drop single balls and follow their paths. How is the bin related to the sequence of L and R?
2. Show Pascal's triangle. Why do more balls land in the middle? [Pascal's triangle](?n=6&pascal=1&binomial=1)
3. Set $p = 0.7$. Where does the distribution move? [Skewed](?p=0.7&binomial=1)
4. With 16 rows, drop **1000 instantly** and compare with the bell curve. Here $\sigma = 2$, so the Laplace condition is not met. For $p = 0.5$ the curve still fits well. [16 rows](?n=16&normal=1&binomial=1&rate=40)

## Exercises

### Exercise 1: Probability of a bin

A Galton board has $n = 4$ rows and $p = 0.5$. What is the probability that a ball lands in bin 2?

<details>
<summary>Show solution</summary>

$$P(X = 2) = \binom{4}{2} \cdot 0.5^2 \cdot 0.5^2 = \frac{6}{16} = 37.5\,\%$$

There are 6 paths with exactly two right bounces (e.g. RRLL, RLRL, …). [Show in the simulation](?n=4&pascal=1&binomial=1)

</details>

### Exercise 2: Counting paths

How many paths lead to bin 3 with $n = 6$ rows? Read it off Pascal's triangle and check by calculation.

<details>
<summary>Show solution</summary>

$$\binom{6}{3} = \frac{6 \cdot 5 \cdot 4}{3 \cdot 2 \cdot 1} = 20$$

The bottom row of pegs shows 1, 5, 10, 10, 5, 1 – bin 3 is reached from the two middle pegs: $10 + 10 = 20$. [Show in the simulation](?n=6&pascal=1)

</details>

### Exercise 3: Expected value and spread

Compute $\mu$ and $\sigma$ for $n = 10$ and $p = 0.7$. Check with 1000 balls.

<details>
<summary>Show solution</summary>

$\mu = 10 \cdot 0.7 = 7$, $\sigma = \sqrt{10 \cdot 0.7 \cdot 0.3} = \sqrt{2.1} \approx 1.45$. The mean of the 1000 balls is usually very close to 7. [Show in the simulation](?n=10&p=0.7&binomial=1)

</details>

### Exercise 4: Symmetry

Why is the distribution symmetric for $p = 0.5$ but not for $p = 0.7$? How are the distributions for $p = 0.3$ and $p = 0.7$ related?

<details>
<summary>Show solution</summary>

For $p = 0.5$ every path is equally likely, and there are as many paths to bin $k$ as to bin $n - k$: $\binom{n}{k} = \binom{n}{n-k}$. For $p = 0.7$, paths with many R are more likely. Swapping left and right turns the distribution for $p = 0.3$ into the one for $p = 0.7$ – they are mirror images: $P_{0.3}(X = k) = P_{0.7}(X = n - k)$.

</details>

## Ideas for the classroom

- **Use:** Upper secondary (Bernoulli chains, binomial distribution); qualitatively also earlier with multi-stage random experiments. The bell curve leads on to the normal distribution.
- **Display:** As long as they fit, the balls are stacked one by one; with many balls the bins are shown as bars. The horizontal marks (“B(n; p)” in the legend) show the expected count $N \cdot P(X = k)$ for $N$ balls.
- **Compare groups:** Let several groups drop 100 balls each. Every group gets a slightly different distribution – combined, the frequencies come closer and closer to the binomial distribution.
- **Images:** The wooden board and the balls are drawn; photos can be added optionally (see `docs/BILDER.md`).
- **Common stumbling blocks:**
  - “The ball is steered to the middle.” – There are just more paths leading there.
  - Bin number and path get confused: many different paths lead to the same bin.
  - The bell curve is an approximation for large $n$ – for small $n$ or $p$ close to 0 or 1 it fits poorly.
