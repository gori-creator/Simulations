---
description: "The birthday problem in four views: one class in a calendar, 1000 simulated classes with a frequency curve, the complement calculation step by step and all pairs as lines – plus same month, same weekday and the pigeonhole principle."
---

## What is it about?

What is the probability that in a group of $n$ people **at least two share a birthday**? Model: $365$ equally likely days, independent birthdays. Using the complement “all different” and the path rule:

$$
P(\text{shared}) = 1 - \frac{365}{365} \cdot \frac{364}{365} \cdot \ldots \cdot \frac{365 - n + 1}{365}.
$$

For $n = 23$ this is $50.7\,\%$, for $n = 30$ $70.6\,\%$, for $n = 50$ $97.0\,\%$.

- **Pairs:** $n$ people form $\frac{n(n-1)}{2}$ pairs ($253$ for $n = 23$). Approximation: $1 - (364/365)^{\text{pairs}}$.
- **My birthday:** only $n$ pairs count, so $1 - (364/365)^n$, about $6.6\,\%$ for $n = 25$.
- **Simulation:** the relative frequency approaches $P$; the funnel shows the $95\,\%$ range $P \pm 1.96\sqrt{P(1-P)/N}$.
- **Same month / weekday:** with $12$ months, $5$ people already give $61.8\,\%$. From $13$ people on a shared month is certain (pigeonhole principle).

## Try it

1. Press **New class** a few times. [One class](?mode=class&n=25)
2. Run **1000 classes**. [Simulation](?mode=sim&n=23)
3. Watch the free days shrink. [Calculation](?mode=calc&n=30)
4. Tap a person in the pairs view. [Pairs](?mode=pairs&n=12)
5. Same month: what happens at $13$? [Same month](?d=12&n=13&mode=calc)

## Tasks

### Task 1: Three people

Find the probability that at least two of three people share a birthday. [Load task](?mode=calc&n=3&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 - \frac{365 \cdot 364 \cdot 363}{365^3} \approx 0.82\,\%$. [Show in the simulation](?mode=calc&n=3)

</details>

### Task 2: Pairs

How many pairs do $30$ people form? Compare the approximation with the exact value. [Load task](?mode=pairs&n=30&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$435$ pairs, approximation $1 - (364/365)^{435} \approx 69.7\,\%$, exact $70.6\,\%$. [Show in the simulation](?mode=pairs&n=30)

</details>

### Task 3: Same weekday

Probability that at least two of $4$ people were born on the same weekday? [Load task](?d=7&n=4&mode=calc&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 - \frac{840}{2401} \approx 65.0\,\%$; certain from $8$ people on. [Show in the simulation](?d=7&n=4&mode=calc)

</details>

## Ideas for the classroom

- Let the class estimate first, then simulate and calculate.
- **Common stumbling blocks:** confusing the problem with “someone shares my birthday”; computing $n/365$; adding instead of multiplying the factors.
