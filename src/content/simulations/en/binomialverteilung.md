---
description: "Histogram of B(n; p) with expected value and σ intervals: choose P(X = k), P(X ≤ k), P(X ≥ k) and P(a ≤ X ≤ b) right on the histogram, calculate with the values inserted, view the step function F(k) and simulate Bernoulli chains."
---

## What is it about?

A random experiment with only two outcomes – **success** or **failure** – is called a **Bernoulli trial**. If it is repeated $n$ times **independently** and the **probability of success** $p$ is the same each time, it is called a **Bernoulli chain** of length $n$. The random variable $X$ = “number of successes” is then **binomially distributed**, $X \sim B(n;\,p)$ for short:

$$
P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{n - k}, \qquad k = 0, 1, \dots, n
$$

Here the **binomial coefficient** $\binom{n}{k}$ counts the number of ways the $k$ successes can be distributed over the $n$ places of the chain, and $p^k \cdot (1-p)^{n-k}$ is the probability of a single such path. Example $B(10;\,0.5)$: $P(X = 5) = 252 \cdot 0.5^{10} \approx 0.2461$.

Usually ranges are asked for. With the **cumulative distribution function** $F(k) = P(X \le k)$:

- “at most $k$”: $P(X \le k) = F(k)$
- “at least $k$”: $P(X \ge k) = 1 - P(X \le k - 1) = 1 - F(k - 1)$
- “between $a$ and $b$”: $P(a \le X \le b) = F(b) - F(a - 1)$

The **expected value** $\mu = n \cdot p$ is the centre of mass of the histogram; the **standard deviation** $\sigma = \sqrt{n \cdot p \cdot (1-p)}$ measures its width. The $\sigma$ interval $[\mu - \sigma;\, \mu + \sigma]$ often contains about $68\%$ of the probability, the $2\sigma$ interval usually about $95\%$ (for $\sigma$ that is not too small; the values vary because only whole $k$ count – the simulation shows them exactly).

## Try it

1. Drag the bound $k$ back and forth on the histogram. Together the marked bars give the probability you are looking for; the card calculates along. [Load example](?n=10&p=0.5&ev=le&k=3)
2. Slowly change $p$ from $0.1$ to $0.9$. Where does $\mu$ move? When is the histogram symmetric? [B(20; 0.3)](?n=20&p=0.3&ev=eq&k=6)
3. Increase $n$ with $p = 0.5$ fixed. The histogram becomes wider ($\sigma$ grows with $\sqrt{n}$), and the individual bars become lower.
4. Switch to “cumulative”. Every bar of the histogram becomes a step of the step function $F(k)$. How high is the step at $k$? [Step function](?n=20&p=0.3&ev=ge&k=9&view=cdf)
5. Start single Bernoulli chains and then “Run experiment 1000 times”. How well does the orange outline of the relative frequencies match the bars?
6. Set the edge cases $p = 0$ and $p = 1$. Where is all the probability now? [p = 1](?n=10&p=1&ev=ge&k=10)

## Exercises

### Exercise 1: Guessing in a test

A test has $20$ questions with four answers each; exactly one is correct. Someone ticks completely at random. Calculate the probability of exactly $5$ correct answers. [Load exercise](?n=20&p=0.25&ev=eq&k=5&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$X \sim B(20;\,0.25)$: $P(X = 5) = \binom{20}{5} \cdot 0.25^5 \cdot 0.75^{15} = 15504 \cdot 0.0009766 \cdot 0.01336 \approx 0.2023$. [Show in the simulation](?n=20&p=0.25&ev=eq&k=5)

</details>

### Exercise 2: Passing by guessing?

To pass the test from exercise 1 you need at least $10$ correct answers. How likely is that when purely guessing? [Load exercise](?n=20&p=0.25&ev=ge&k=10&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(X \ge 10) = 1 - F(9) \approx 1 - 0.9861 = 0.0139$, so only about $1.4\%$. [Show in the simulation](?n=20&p=0.25&ev=ge&k=10)

</details>

### Exercise 3: Penalty kicks

A player scores a penalty with probability $0.8$. She shoots $10$ times. What is the probability that she scores at least $8$ times? [Load exercise](?n=10&p=0.8&ev=ge&k=8&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(X \ge 8) = P(X = 8) + P(X = 9) + P(X = 10) \approx 0.3020 + 0.2684 + 0.1074 = 0.6778$. Likewise: $1 - F(7) \approx 1 - 0.3222 = 0.6778$. [Show in the simulation](?n=10&p=0.8&ev=ge&k=8)

</details>

### Exercise 4: 100 coin tosses

A coin is tossed $100$ times. Calculate $\mu$, $\sigma$ and $P(40 \le X \le 60)$ for the number $X$ of heads. Which interval around $\mu$ is this? [Load exercise](?n=100&p=0.5&ev=ab&a=40&b=60&sig=0&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\mu = 100 \cdot 0.5 = 50$, $\sigma = \sqrt{100 \cdot 0.5 \cdot 0.5} = 5$. $P(40 \le X \le 60) = F(60) - F(39) \approx 0.9824 - 0.0176 = 0.9648$. This is exactly the $2\sigma$ interval $[50 - 10;\, 50 + 10]$. [Show in the simulation](?n=100&p=0.5&ev=ab&a=40&b=60)

</details>

### Exercise 5: At least one success

A component is faulty with probability $0.05$. How likely is it that at least one of $50$ components is faulty? How many faulty ones do you expect? [Load exercise](?n=50&p=0.05&ev=ge&k=1&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Via the complementary event “no success”: $P(X \ge 1) = 1 - P(X = 0) = 1 - 0.95^{50} \approx 1 - 0.0769 = 0.9231$. Expected value $\mu = 50 \cdot 0.05 = 2.5$. [Show in the simulation](?n=50&p=0.05&ev=ge&k=1)

</details>

### Exercise 6: Binomially distributed or not?

From a class of $12$ girls and $13$ boys, $5$ people are drawn by lot without replacement; $X$ is the number of girls. Is $X$ binomially distributed? Explain.

<details>
<summary>Show solution</summary>

No. Without replacement, the probability of “girl” changes from draw to draw (first $\frac{12}{25}$, then e.g. $\frac{11}{24}$), and the draws are not independent. A Bernoulli chain requires the same probability of success in every trial.

</details>

## Ideas for the classroom

- **Use:** upper secondary probability (binomial distribution, expected value, standard deviation, σ intervals). A good complement to the Galton board, which shows how the distribution arises.
- **From the table book to the picture:** the step view shows what is in tables of the cumulative binomial distribution; values from them can be read off directly at the steps.
- **Modelling:** before calculating, check together whether the conditions are met (two outcomes, independent, same $p$) – exercise 6 offers a counterexample to start with.
- **Common pitfalls:**
  - “At least $k$” is calculated as $1 - F(k)$ instead of $1 - F(k - 1)$ – the value $k$ itself belongs to it.
  - For $P(a \le X \le b)$, $F(b) - F(a)$ is calculated; then $P(X = a)$ is missing.
  - “At most” and “at least” are mixed up; colouring the bars can help here.
  - $\sigma$ is confused with the variance $n \cdot p \cdot (1-p)$.
