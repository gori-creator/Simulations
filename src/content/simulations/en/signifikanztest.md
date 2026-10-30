---
description: "One-sided significance test with the binomial distribution: the critical region is found automatically, type I and type II errors appear as coloured areas in two histograms, and samples and the power curve show how reliable the test is."
---

## What is it about?

A proven medicine cures $60\,\%$ of patients. A new one is claimed to be better. It is tested on $n = 50$ people; $X$ is the number cured.

- **Null hypothesis** $H_0\colon p \le 0.6$, **alternative** $H_1\colon p > 0.6$, **significance level** $\alpha = 5\,\%$.
- We calculate in the boundary case $p = 0.6$, i.e. $X \sim B(50;\,0.6)$.

The **critical region** is $\{k, \dots, 50\}$ with the *smallest* $k$ such that $P(X \ge k) \le \alpha$:

$$
P(X \ge 37) \approx 0.0280 \le 0.05, \qquad P(X \ge 36) \approx 0.0540 > 0.05.
$$

**Decision rule:** reject $H_0$ if $X \ge 37$. Rejecting a true $H_0$ is a **type I error** (probability at most $2.8\,\%$ here). Keeping $H_0$ although $H_1$ holds is a **type II error**; for a true $p_1 = 0.75$: $\beta = P_{0.75}(X \le 36) \approx 0.363$, power $1 - \beta \approx 0.637$. Not rejecting $H_0$ does **not** prove $H_0$.

## Try it

1. Tap bars in the upper histogram to set the observed value $x$. When is $H_0$ rejected? [Load example](?x=36)
2. Switch $\alpha$ between $1\,\%$ and $10\,\%$ and watch the red and orange areas. [α = 1 %](?alpha=1)
3. Switch on the **power curve** under “Display”, press “Let p₁ move” and watch $\beta$ shrink along the power curve. [With power curve](?curve=1)
4. Set $p_1 = p_0$ and draw 100 samples: how often is $H_0$ wrongly rejected? [Boundary case](?p1=0.6&x=33)

## Tasks

### Task 1: Coin

A coin is tossed $20$ times; test $H_0\colon p \le 0.5$ against $H_1\colon p > 0.5$ at the $5\,\%$ level. Find the critical region. [Load task](?ctx=free&n=20&p0=0.5&x=16&p1=0.7&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(X \ge 15) \approx 0.0207 \le 0.05$ but $P(X \ge 14) \approx 0.0577 > 0.05$, so the critical region is $\{15, \dots, 20\}$. [Show in the simulation](?ctx=free&n=20&p0=0.5&x=16&p1=0.7)

</details>

### Task 2: Type II error

In fact the coin is biased with $p = 0.7$. How likely is it that the test misses this? [Load task](?ctx=free&n=20&p0=0.5&x=16&p1=0.7&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$\beta = P_{0.7}(X \le 14) \approx 0.584$, power $\approx 0.416$. [Show in the simulation](?ctx=free&n=20&p0=0.5&x=16&p1=0.7)

</details>

### Task 3: Seeds (left-tailed)

At least $90\,\%$ of seeds are promised to germinate. Of $100$ seeds, $83$ germinate. Test $H_0\colon p \ge 0.9$ at the $5\,\%$ level. [Load task](?ctx=seed&n=100&p0=0.9&side=left&x=83&p1=0.82&info=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(X \le 84) \approx 0.0399$, $P(X \le 85) \approx 0.0726$, so the critical region is $\{0, \dots, 84\}$. Since $83$ lies in it, $H_0$ is rejected. [Show in the simulation](?ctx=seed&n=100&p0=0.9&side=left&x=83&p1=0.82)

</details>

## Ideas for the classroom

- Use it to introduce the procedure of a one-sided test and to compare both kinds of error; the power curve can serve as an outlook.
- Drawing many samples with $p_1 = p_0$ makes the type I error rate tangible.
- **Common stumbling blocks:**
  - “$H_0$ was not rejected, so $H_0$ is true.”
  - Using $P(X = k) \le \alpha$ instead of the tail sum $P(X \ge k)$.
  - Computing $\beta$ with $p_0$ instead of the true $p_1$.
