---
description: "Turn fractions into decimals by long division: when does the division end, when does a repeating period appear – and how do the prime factors of the denominator tell?"
---

## What is it about?

A fraction is a division: $\frac{3}{8} = 3 \div 8$. In **long division** you write the decimal point after the whole-number part and bring down a **zero** to every remainder: $30 \div 8 = 3$ remainder $6$, $60 \div 8 = 7$ remainder $4$, $40 \div 8 = 5$ remainder $0$. So $\frac{3}{8} = 0.375$ – a **terminating decimal**.

For $\frac{3}{7}$ the remainder is never $0$. The remainders are $3, 2, 6, 4, 5, 1$ and then $3$ again. From there the whole calculation repeats, and so do the digits – a **repeating decimal** with a bar over the **period**:

$$
\frac{3}{7} = 0.428571428571\ldots = 0.\overline{428571}
$$

Digits before the period form the **pre-period**: $\frac{1}{6} = 0.1\overline{6}$.

**Why must something repeat?** When dividing by $n$, every remainder is less than $n$, so apart from $0$ there are only the remainders $1, \ldots, n - 1$. Sooner or later one comes back – the period has **at most $n - 1$ digits**. The **remainder circle** shows the path from remainder to remainder.

**Terminating or repeating?** Reduce the fraction fully and factorise the denominator. **Only the prime factors 2 and 5** → terminating, because you can expand to $10$, $100$, $1000$, …: $\frac{3}{8} = \frac{375}{1000}$. **Neither 2 nor 5** → purely repeating ($\frac{5}{11} = 0.\overline{45}$). **Both kinds** → repeating with a pre-period ($\frac{5}{12} = 0.41\overline{6}$). Reduce first: $\frac{3}{6} = \frac{1}{2} = 0.5$.

## Try it

1. Work through [3/7 step by step](?z=3&n=7&show=0) with “Next digit”. When do you notice that the digits repeat?
2. Compare with [3/8](?z=3&n=8&show=0). How can you see that the division ends?
3. Look at [1/13 with all remainder arrows](?z=1&n=13&alle=1), then tap remainder $2$ on the circle. How many cycles are there?
4. Open the [number line zoom for 1/3](?z=1&n=3&bild=lupe). Why does every level look the same?
5. In the [table of denominators](?mode=tafel&z=1&fak=1) the terminating fractions are green. Which denominators are they?

## Tasks

### Task 1: Terminating or repeating?

Decide using only the prime factors: $\frac{7}{40}$, $\frac{5}{6}$, $\frac{9}{12}$, $\frac{4}{15}$.

<details>
<summary>Show solution</summary>

$\frac{7}{40}$: $40 = 2^3 \cdot 5$ → terminating ($0.175$). $\frac{5}{6}$: $6 = 2 \cdot 3$ → pre-period ($0.8\overline{3}$). $\frac{9}{12} = \frac{3}{4}$ → terminating ($0.75$). $\frac{4}{15}$: $15 = 3 \cdot 5$ → pre-period ($0.2\overline{6}$).

</details>

### Task 2: Long division

Work out $\frac{5}{12}$ by long division and list the remainders. [Load task](?z=5&n=12&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$50 \div 12 = 4$ r $2$, $20 \div 12 = 1$ r $8$, $80 \div 12 = 6$ r $8$ – remainder $8$ repeats, so $\frac{5}{12} = 0.41\overline{6}$. [Show](?z=5&n=12)

</details>

### Task 3: Back to a fraction

Write $0.35$ and $0.\overline{36}$ as fully reduced fractions. Hint: $\frac{1}{99} = 0.\overline{01}$.

<details>
<summary>Show solution</summary>

$0.35 = \frac{35}{100} = \frac{7}{20}$ and $0.\overline{36} = \frac{36}{99} = \frac{4}{11}$. [Check](?z=4&n=11)

</details>

## Notes for teachers

- Fits grade 6 (Bavarian Gymnasium, learning area 1.2 “Decimals”). Use `show=0` for step-by-step work in class.
- The remainder circle makes the pigeonhole argument visible; the tags next to the remainders show that each remainder fixes its next digit.
- Common misconception: “the period starts when a digit repeats” – in $\frac{1}{17} = 0.0588\ldots$ the $8$ appears twice, yet the period has $16$ digits. What matters is the remainder.
