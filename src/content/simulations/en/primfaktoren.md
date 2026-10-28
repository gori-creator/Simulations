## What is it about?

A **prime number** is a natural number with exactly **two divisors**: $1$ and itself. $2, 3, 5, 7, 11, 13, \ldots$ are primes. $1$ is not a prime, because it has only one divisor. $2$ is the only even prime. Numbers with more than two divisors are called **composite**.

**Prime factorisation:** Every natural number greater than $1$ can be written as a product of primes. In a **factor tree** you keep splitting until only primes are left:

$$
360 = 18 \cdot 20 = 2 \cdot 2 \cdot 2 \cdot 3 \cdot 3 \cdot 5 = 2^3 \cdot 3^2 \cdot 5
$$

However you start the tree, you always end with **the same prime factors**. The prime factorisation is unique (apart from the order).

**Divisibility rules** help you find divisors quickly:

- by $2$, $5$ or $10$: look at the **last digit**.
- by $4$ or $25$: look at the number formed by the **last two digits**.
- by $3$ or $9$: check the **digit sum**, e.g. $3 + 6 + 0 = 9$.
- by $6$: the number is divisible by $2$ **and** by $3$.

**Sieve of Eratosthenes:** Cross out $1$. The smallest number not crossed out is a prime; circle it and cross out all its multiples. For a prime $p$, the first multiple that gets newly crossed out is $p \cdot p$, e.g. $49$ for $7$ – smaller multiples are already crossed out. Up to $100$ the primes $2, 3, 5$ and $7$ are enough, because $11 \cdot 11 = 121$ is already greater than $100$.

**gcd and lcm:** The greatest common divisor is the product of the **common** prime factors. The least common multiple is the product of **all** prime factors, where common ones are counted only once. With $24 = 2 \cdot 2 \cdot 2 \cdot 3$ and $36 = 2 \cdot 2 \cdot 3 \cdot 3$:

$$
\gcd(24, 36) = 2 \cdot 2 \cdot 3 = 12 \qquad \operatorname{lcm}(24, 36) = 2 \cdot 2 \cdot 2 \cdot 3 \cdot 3 = 72
$$

## Try it

1. Split [360 step by step](?show=0): tap the dashed numbers or press **Split**.
2. Press **Another tree** several times. What changes, and what always stays the same?
3. Always split off the [smallest prime factor](?split=klein). What does the tree look like now?
4. Split [512](?n=512&split=klein) and write the result as a power.
5. Tap a number in the tree: next to it (below it on a phone) you see which numbers divide it. Try [783](?n=783) – the digit sum tells you a lot.
6. Run the [sieve up to 100](?mode=sieb&show=0) with **Next prime**. Tap a crossed-out number: which prime crossed it out?
7. Arrange the numbers in [6 columns](?mode=sieb&cols=6&max=120). In which columns are the primes from $5$ on? Why?
8. Find gcd and lcm of [24 and 36](?mode=ggt&show=0) with **Sort the factors**. What happens with [8 and 15](?mode=ggt&a=8&b=15)?

## Tasks

### Task 1: Prime factorisation

[Load task](?n=84&show=0&_hide=1) Split $84$, $126$ and $500$ into prime factors and write them with powers.

<details>
<summary>Show solution</summary>

$84 = 2^2 \cdot 3 \cdot 7$, $126 = 2 \cdot 3^2 \cdot 7$ and $500 = 2^2 \cdot 5^3$. [Show 126](?n=126) · [Show 500](?n=500)

</details>

### Task 2: Divisibility rules

Check without a calculator whether $852$ is divisible by $2$, $3$, $4$, $6$ and $9$.

<details>
<summary>Show solution</summary>

The last digit $2$ is even: divisible by $2$. The digit sum $8 + 5 + 2 = 15$ is divisible by $3$, but not by $9$. $52$ is divisible by $4$, so $852$ is too. Divisible by $2$ and by $3$ means divisible by $6$. $852$ is only not divisible by $9$. [Check](?n=852)

</details>

### Task 3: Finding primes

Which primes lie between $50$ and $70$?

<details>
<summary>Show solution</summary>

$53$, $59$, $61$ and $67$. All other numbers in between are divisible by $2$, $3$, $5$ or $7$, e.g. $51 = 3 \cdot 17$ and $57 = 3 \cdot 19$. [Show the sieve](?mode=sieb)

</details>

### Task 4: gcd and lcm

[Load task](?mode=ggt&a=60&b=84&show=0&_hide=1) Find the gcd and lcm of $60$ and $84$ using their prime factors.

<details>
<summary>Show solution</summary>

$60 = 2 \cdot 2 \cdot 3 \cdot 5$ and $84 = 2 \cdot 2 \cdot 3 \cdot 7$. The common factors are $2 \cdot 2 \cdot 3$, so $\gcd(60, 84) = 12$. All factors: $\operatorname{lcm}(60, 84) = 2 \cdot 2 \cdot 3 \cdot 5 \cdot 7 = 420$.

</details>

### Task 5: Buses

Two buses leave at the same time at $8$ o'clock. Bus A leaves every $12$ minutes, bus B every $18$ minutes. When do they next leave at the same time?

<details>
<summary>Show solution</summary>

You need the least common multiple: $\operatorname{lcm}(12, 18) = 36$. The buses leave together again at $8{:}36$. [Show in the simulation](?mode=ggt&a=12&b=18)

</details>

### Task 6: Why is 7 enough?

Explain why you can stop after the multiples of $7$ when sieving up to $100$.

<details>
<summary>Show solution</summary>

A composite number up to $100$ is a product $a \cdot b$ with $a \le b$. If $a$ were greater than $10$, then $a \cdot b > 10 \cdot 10 = 100$. So every composite number up to $100$ has a divisor up to $10$ and therefore a prime factor $2$, $3$, $5$ or $7$ – it has already been crossed out.

</details>

## Ideas for the classroom

- **Use:** About grade 5 (prime factorisation and divisibility rules). gcd and lcm are needed later for simplifying fractions and finding common denominators (year 6).
- **Three views:** factor tree with divisibility rules, sieve of Eratosthenes and gcd/lcm in a set diagram. Each prime keeps the same colour in all views.
- **Step by step:** If “Show the result right away” is off (`show=0`), tree, sieve and set diagram start empty and are built up with the buttons or by tapping.
- **Uniqueness:** “Another tree” splits with random divisors. That the same prime factors always appear is a good reason to ask why (without proof in year 5).
- **Common stumbling blocks:**
  - “$1$ is a prime.”
  - “Odd numbers are primes.” – $9$, $15$, $51 = 3 \cdot 17$ and $91 = 7 \cdot 13$ are not.
  - The digit-sum rule is applied to $4$.
  - gcd and lcm are mixed up; the set diagram shows: the intersection gives the gcd, everything together the lcm.
