---
description: "One-sided significance test with the binomial distribution: the critical region is found automatically, type I and type II errors appear as coloured areas in two histograms, and samples and the power curve show how reliable the test is."
---

## What is it about?

A proven medicine cures $60\%$ of patients. A new one is supposed to be better. It is tested on $n = 50$ people; $X$ is the number cured. If $X$ is “conspicuously large”, this speaks against the assumption that the new medicine is not better.

- **Null hypothesis** $H_0\colon p \le 0.6$ (the new medicine is not better), **alternative hypothesis** $H_1\colon p > 0.6$.
- **Significance level** $\alpha = 5\%$: the probability of rejecting $H_0$ although $H_0$ is true may be at most this large.
- The calculation uses the boundary case $p = 0.6$, i.e. $X \sim B(50;\,0.6)$.

You are looking for the **critical region** $\overline{A} = \{k;\,\dots;\,50\}$ with the *smallest* $k$ for which $P(X \ge k) \le \alpha$:

$$
P(X \ge 37) \approx 0.0280 \le 0.05, \qquad P(X \ge 36) \approx 0.0540 > 0.05.
$$

So $\overline{A} = \{37;\,\dots;\,50\}$, acceptance region $A = \{0;\,\dots;\,36\}$. **Decision rule:** reject $H_0$ if $X \ge 37$.

Two wrong decisions are possible:

| | $H_0$ is true | $H_1$ is true |
| --- | --- | --- |
| $H_0$ is rejected | **type I error** | correct |
| $H_0$ is not rejected | correct | **type II error** |

The probability of a **type I error** here is at most $P(X \ge 37) \approx 2.8\%$ – this is the actual probability of error; it is never larger than $\alpha$. For a **type II error** you have to assume a true $p_1$ from $H_1$. For $p_1 = 0.75$,

$$
\beta = P_{0.75}(X \le 36) \approx 0.363, \qquad 1 - \beta \approx 0.637.
$$

$1 - \beta$ is called the **power** of the test. The **power curve** shows for every $p$ how likely the test is to reject $H_0$. In a left-tailed test ($H_1\colon p < p_0$) the critical region lies on the left: the largest $k$ with $P(X \le k) \le \alpha$.

**Important:** if $H_0$ is not rejected, this does **not prove** $H_0$ – the data just do not contradict it clearly enough.

## Try it

1. Tap different bars in the upper histogram: this sets the observed value $x$. When is $H_0$ rejected? [Load example](?x=36)
2. Set $\alpha$ to $1\%$ and to $10\%$. How does the boundary move, and how do the red and orange areas change? [α = 1 %](?alpha=1)
3. Under “Display”, switch on the **power curve**, press “Let p₁ move” and watch $\beta$ shrink and the point on the power curve move up. [With power curve](?curve=1)
4. Set $p_1 = p_0$. What does the lower histogram show now? [Boundary case](?p1=0.6&x=33)
5. Set $p_1 = 0.68$ and compare the power for $n = 50$ and $n = 200$. [n = 50](?p1=0.68) · [n = 200](?n=200&x=135&p1=0.68)
6. Use “100 samples” to draw many samples with $p_1 = p_0$: how often is $H_0$ (wrongly) rejected? [p₁ = p₀](?p1=0.6&x=33)

## Exercises

### Exercise 1: Coin

A coin is tossed $20$ times. $H_0\colon p \le 0.5$ is tested against $H_1\colon p > 0.5$ ($p$: probability of heads) at the $5\%$ level. Find the critical region. [Load exercise](?ctx=free&n=20&p0=0.5&x=16&p1=0.7&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(X \ge 15) \approx 0.0207 \le 0.05$, but $P(X \ge 14) \approx 0.0577 > 0.05$. So $\overline{A} = \{15;\,\dots;\,20\}$; the actual probability of error is about $2.1\%$. [Show in the simulation](?ctx=free&n=20&p0=0.5&x=16&p1=0.7)

</details>

### Exercise 2: Type II error

In the test from exercise 1, the coin is in fact biased: $p = 0.7$. What is the probability that the test does not notice this? [Load exercise](?ctx=free&n=20&p0=0.5&x=16&p1=0.7&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$\beta = P_{0.7}(X \le 14) \approx 0.584$. In more than half of the cases the biased coin is not detected; the power is only $1 - \beta \approx 0.416$. [Show in the simulation](?ctx=free&n=20&p0=0.5&x=16&p1=0.7)

</details>

### Exercise 3: A loaded die

A die is thrown $60$ times; $X$ is the number of sixes. $H_0\colon p \le \frac{1}{6}$ is tested at the $5\%$ level. $18$ sixes come up. What is the decision? [Load exercise](?ctx=dice&n=60&x=18&p1=0.25&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(X \ge 16) \approx 0.0338 \le 0.05$, $P(X \ge 15) \approx 0.0648 > 0.05$, so $\overline{A} = \{16;\,\dots;\,60\}$. Because $18 \in \overline{A}$, $H_0$ is rejected: at the $5\%$ level the die is significantly “six-heavy” – this is not proved. If the die were fair, the test would decide this way with a probability of only about $3.4\%$ at most. [Show in the simulation](?ctx=dice&n=60&x=18&p1=0.25)

</details>

### Exercise 4: Left-tailed – seeds

A dealer promises that at least $90\%$ of the seeds germinate. A gardener sows $100$ seeds and tests $H_0\colon p \ge 0.9$ against $H_1\colon p < 0.9$ ($\alpha = 5\%$). Find the critical region. $83$ seeds germinate – decision? [Load exercise](?ctx=seed&n=100&p0=0.9&side=left&x=83&p1=0.82&info=0&_hide=1)

<details>
<summary>Show solution</summary>

Largest $k$ with $P(X \le k) \le 0.05$: $P(X \le 84) \approx 0.0399$, $P(X \le 85) \approx 0.0726$. So $\overline{A} = \{0;\,\dots;\,84\}$. Because $83 \in \overline{A}$, $H_0$ is rejected. [Show in the simulation](?ctx=seed&n=100&p0=0.9&side=left&x=83&p1=0.82)

</details>

### Exercise 5: Stricter or safer?

In the medicine test ($n = 50$, $p_0 = 0.6$, $p_1 = 0.75$), $\alpha$ is reduced from $5\%$ to $1\%$. How do the critical region and $\beta$ change? Explain why you cannot make both errors small at the same time without increasing $n$. [Load exercise](?alpha=1&info=0&_hide=1)

<details>
<summary>Show solution</summary>

At $\alpha = 1\%$: $P(X \ge 39) \approx 0.0057$, $P(X \ge 38) \approx 0.0133$, so $\overline{A} = \{39;\,\dots;\,50\}$. The acceptance region gets larger, so $\beta = P_{0.75}(X \le 38) \approx 0.618$ increases (previously $0.363$). Whoever rejects wrongly less often rejects less often overall – also when $H_1$ is true. Only a larger $n$ makes both distributions narrower and separates them better. [Show in the simulation](?alpha=1)

</details>

## Ideas for the classroom

- **Use:** upper secondary, one-sided significance test – introducing the procedure and going deeper into type I and type II errors. The power curve can serve as an outlook.
- **Notation:** the simulation uses $H_0\colon p \le p_0$ or $p \ge p_0$ and $\overline{A}$ for the critical region; some books write $H_0\colon p = p_0$ or $K$ – the calculation is the same.
- **Simulating the type I error:** with $p_1 = p_0$ and “100 samples” you can experience that the test wrongly rejects in about $2.8\%$ of cases (actual probability of error $\alpha^\ast$).
- **Common pitfalls:**
  - “$H_0$ was not rejected, so $H_0$ is true.” – The test just does not provide sufficient contradiction.
  - The critical value is determined via $P(X = k) \le \alpha$ instead of via the sum $P(X \ge k)$.
  - For the type II error, $p_0$ is used instead of the true $p_1$.
  - In a left-tailed test, $P(X \ge k)$ is considered instead of $P(X \le k)$.
