---
description: "Draw a class and see the birthdays in a calendar – shared days light up. A hundred classes give a frequency close to the curve P(n); from 23 people on a shared birthday is more likely than none."
---

## What is it about?

What is the probability that in a group of $n$ people **at least two share a birthday**? Model: $365$ equally likely days, independent birthdays. Using the complement “all different”:

$$
P(\text{shared}) = 1 - \frac{365}{365} \cdot \frac{364}{365} \cdot \ldots \cdot \frac{365 - n + 1}{365}.
$$

For $n = 23$ this is about $50.7\,\%$, for $n = 25$ about $56.9\,\%$. The reason: $23$ people form $253$ pairs. In contrast, the probability that someone shares **my** birthday is only $1 - (364/365)^n$, about $6.6\,\%$ for $n = 25$.

## Try it

1. Press **New class** a few times. [Load example](?n=25)
2. Press **100 classes** several times and compare the circle with the curve.
3. From which size is the probability above $50\,\%$? [23 people](?n=23)
4. Compare both questions. [Comparison](?q=mine&both=1)

## Tasks

### Task 1: Three people

Find the probability that among three people at least two share a birthday. [Load task](?n=3&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 - \frac{364}{365} \cdot \frac{363}{365} \approx 0.82\,\%$. [Show in simulation](?n=3)

</details>

### Task 2: My birthday

With $25$ others, how likely is it that someone shares your birthday? [Load task](?q=mine&curve=0&_hide=1)

<details>
<summary>Show solution</summary>

$1 - (364/365)^{25} \approx 6.6\,\%$ – one specific day instead of any of $300$ pairs. [Show in simulation](?q=mine&both=1)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Asking for an estimate first works well; the simulation makes the result plausible, the complement explains it.
- **Common stumbling blocks:** confusing the problem with “someone shares my birthday”; computing $\frac{n}{365}$; adding instead of multiplying the factors.
