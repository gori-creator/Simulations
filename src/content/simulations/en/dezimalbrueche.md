---
description: "Turn fractions into decimals by long division: when does the division end, when does a repeating period appear – and how do the prime factors of the denominator tell?"
---

## What is it about?

A fraction is a division: $\frac{3}{8} = 3 \div 8$. In **long division** you write the decimal point after the whole-number part and bring down a **zero** to every remainder:

$$
30 \div 8 = 3 \text{ remainder } 6, \quad 60 \div 8 = 7 \text{ remainder } 4, \quad 40 \div 8 = 5 \text{ remainder } 0
$$

So $\frac{3}{8} = 0.375$. Because the remainder eventually becomes $0$, this is a **terminating decimal**.

For $\frac{3}{7}$ the remainder is never $0$. The remainders are $3, 2, 6, 4, 5, 1$ – and then $3$ again. From there the whole calculation repeats, and so do the digits. This gives a **repeating decimal**. The digits that repeat are called the **period** and get a **bar** over them:

$$
\frac{3}{7} = 0.428571428571\ldots = 0.\overline{428571}
$$

If the period does not start right after the decimal point, the digits before it form the **pre-period**: $\frac{1}{6} = 0.1\overline{6}$. We distinguish **purely repeating** decimals ($0.\overline{3}$) and decimals **repeating after a pre-period** ($0.1\overline{6}$).

**Why must something repeat?** When dividing by $n$, every remainder is less than $n$. Apart from $0$ there are only the remainders $1, 2, \ldots, n-1$. After at most $n - 1$ steps a remainder must appear for the second time. That is why the period of a fraction with denominator $n$ has **at most $n - 1$ digits**. The **remainder circle** shows this: each arrow leads from one remainder to the next; the path ends at $0$ or runs in a cycle.

**Terminating or repeating – without dividing:** Reduce the fraction fully and factorise the denominator into primes.

- If **only the prime factors 2 and 5** occur, you can expand to $10$, $100$, $1000$, …; the decimal **terminates**: $\frac{3}{8} = \frac{3 \cdot 125}{8 \cdot 125} = \frac{375}{1000} = 0.375$.
- If **neither 2 nor 5** occurs, it is **purely repeating**: $\frac{5}{11} = 0.\overline{45}$.
- If **2 or 5 and other prime factors** occur, it **repeats after a pre-period**: $\frac{5}{12} = 0.41\overline{6}$, because $12 = 2 \cdot 2 \cdot 3$.

Important: **reduce** first! $\frac{3}{6}$ has the denominator $6 = 2 \cdot 3$, but it equals $\frac{1}{2} = 0.5$.

The **number line zoom** shows what a digit means: the first decimal place tells you in which tenth between two whole numbers the fraction lies. Magnify this tenth ten times and you read off the hundredths – and so on.

## Try it

1. Work through [3/7 step by step](?z=3&n=7&show=0) with “Next digit”. Write down the remainders. When do you notice that the digits repeat?
2. Compare with [3/8](?z=3&n=8&show=0). How can you see on the paper that the division ends?
3. For [1/6](?z=1&n=6) the remainder $4$ repeats at once. Why is the $1$ not under the bar?
4. Look at [1/13 with all remainder arrows](?z=1&n=13&alle=1). Then tap remainder $2$ on the circle. How many cycles are there for $13$?
5. Compare [1/17](?z=1&n=17) with [1/16](?z=1&n=16). The denominators are almost the same – the results are completely different. Why?
6. Open the [number line zoom for 1/3](?z=1&n=3&bild=lupe). Why does every level look the same? Compare with the [zoom for 3/8](?z=3&n=8&bild=lupe).
7. In the [table of all denominators](?mode=tafel&z=1&fak=1) the terminating fractions are green. Which denominators are they? Then set the [numerator to 3](?mode=tafel&z=3&fak=1): why do some tiles turn green?
8. Is [22/7](?z=22&n=7) equal to $\pi = 3.14159\ldots$? From which digit on do they differ?

## Tasks

### Task 1: Expanding to a power of ten

Write as a decimal without long division: a) $\frac{7}{20}$ b) $\frac{3}{16}$ c) $\frac{9}{12}$ [Load task b](?z=3&n=16&_hide=1)

<details>
<summary>Show solution</summary>

a) $\frac{7}{20} = \frac{35}{100} = 0.35$. b) $16 = 2^4$, so expand by $5^4 = 625$: $\frac{3}{16} = \frac{1875}{10000} = 0.1875$. c) Reduce first: $\frac{9}{12} = \frac{3}{4} = \frac{75}{100} = 0.75$. [Show the table](?mode=tafel&z=3&n=16&fak=1)

</details>

### Task 2: Terminating or repeating?

Decide using only the prime factors of the denominator: $\frac{7}{40}$, $\frac{5}{6}$, $\frac{9}{12}$, $\frac{4}{15}$, $\frac{11}{22}$, $\frac{3}{14}$. [Table for numerator 3](?mode=tafel&z=3&fak=1&_hide=1)

<details>
<summary>Show solution</summary>

- $\frac{7}{40}$: $40 = 2^3 \cdot 5$ → terminating ($0.175$).
- $\frac{5}{6}$: $6 = 2 \cdot 3$ → repeating after a pre-period ($0.8\overline{3}$).
- $\frac{9}{12} = \frac{3}{4}$ → terminating ($0.75$).
- $\frac{4}{15}$: $15 = 3 \cdot 5$ → repeating after a pre-period ($0.2\overline{6}$).
- $\frac{11}{22} = \frac{1}{2}$ → terminating ($0.5$).
- $\frac{3}{14}$: $14 = 2 \cdot 7$ → repeating after a pre-period ($0.2\overline{142857}$). [Show](?z=3&n=14)

</details>

### Task 3: Long division

Work out $\frac{5}{12}$ by long division. Write down all remainders and give the result with a bar. [Load task](?z=5&n=12&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$50 \div 12 = 4$ remainder $2$, $20 \div 12 = 1$ remainder $8$, $80 \div 12 = 6$ remainder $8$ – the remainder $8$ repeats. So $\frac{5}{12} = 0.41\overline{6}$ with the pre-period $41$. [Show](?z=5&n=12)

</details>

### Task 4: Two cycles

Work out $\frac{1}{13}$ and $\frac{2}{13}$. Both periods have $6$ digits. Why not $12$, although there are $12$ remainders other than $0$?

<details>
<summary>Show solution</summary>

$\frac{1}{13} = 0.\overline{076923}$ with the remainders $1, 10, 9, 12, 3, 4$; $\frac{2}{13} = 0.\overline{153846}$ with the remainders $2, 7, 5, 11, 6, 8$. The $12$ possible remainders split into **two** cycles of $6$ remainders each. Which one you run through depends on the starting remainder. So “at most $n - 1$” does not mean “always $n - 1$”. [Remainder circle with all arrows](?z=1&n=13&alle=1)

</details>

### Task 5: Back to a fraction

a) Write $0.35$ and $0.125$ as fully reduced fractions. b) We have $\frac{1}{9} = 0.\overline{1}$ and $\frac{1}{99} = 0.\overline{01}$. Use this to write $0.\overline{4}$ and $0.\overline{36}$ as fractions.

<details>
<summary>Show solution</summary>

a) $0.35 = \frac{35}{100} = \frac{7}{20}$ and $0.125 = \frac{125}{1000} = \frac{1}{8}$.

b) $0.\overline{4} = 4 \cdot 0.\overline{1} = \frac{4}{9}$ and $0.\overline{36} = 36 \cdot 0.\overline{01} = \frac{36}{99} = \frac{4}{11}$. [Check](?z=4&n=11)

</details>

### Task 6: Record (puzzle)

Which fraction with a denominator up to $50$ has the longest period? Explain why it cannot be longer.

<details>
<summary>Show solution</summary>

$\frac{1}{47}$ (and every other fraction $\frac{z}{47}$ that cannot be reduced) has a period of $46$ digits. For $47$ it cannot be longer, because there are only $46$ remainders other than $0$. A longer period would need the denominator $48$, $49$ or $50$: but fractions with the denominator $50 = 2 \cdot 5^2$ terminate, $\frac{1}{48} = 0.0208\overline{3}$ has a period of just one digit, and for $49$ the period has $42$ digits. [Show 1/47](?z=1&n=47)

</details>

## Ideas for the classroom

- **Use:** About grade 6, decimals: fractions as terminating or repeating decimals, converting. Suitable for introducing the topic (step by step with `show=0`) and for consolidation (remainder circle, table). The prime factorisation from the simulation “Prime factorisation and divisibility” is applied here.
- **Two views:** *Long division* (squared paper, with either the remainder circle or the number line zoom) and *Which denominators?* (all fractions $\frac{z}{n}$ with $n \leq 50$ as coloured tiles, optionally with prime factors; factors that cancel are crossed out).
- **Reasoning instead of memorising:** The remainder circle makes the pigeonhole principle visible: there are only finitely many remainders, so one must repeat. The tags next to the remainders show that each remainder fixes its next digit – that is why the digits repeat along with the remainder.
- **Going further:** The length of the pre-period is the larger of the two exponents of $2$ and $5$ in the reduced denominator ($12 = 2^2 \cdot 3$ → $2$ digits). Converting decimals with a pre-period back into fractions is not covered here.
- **Common stumbling blocks:**
  - “The period starts as soon as a digit repeats.” – In $\frac{1}{17} = 0.0588\ldots$ the $8$ appears twice, yet the period has $16$ digits. What matters is the **remainder**, not the digit.
  - “$0.\overline{3}$ is roughly $\frac{1}{3}$.” – $0.\overline{3}$ is **exactly** $\frac{1}{3}$; only $0.333$ is rounded. Calculators show rounded values such as $0.6666666667$.
  - “The denominator $6$ contains a $2$, so $\frac{1}{6}$ terminates.” – **Only** $2$ and $5$ may occur.
  - “$\frac{3}{6}$ repeats because $6$ has the factor $3$.” – Reduce first: $\frac{3}{6} = \frac{1}{2}$.
