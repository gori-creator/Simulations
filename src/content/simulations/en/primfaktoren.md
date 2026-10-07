---
description: Interactive simulation on primes – grow factor trees, check divisibility rules, run the sieve of Eratosthenes and find gcd and lcm in a set diagram.
---

## What is it about?

A **prime number** has exactly **two divisors**: $1$ and itself. $1$ is not a prime. Every whole number greater than $1$ is a product of primes – and however you start the **factor tree**, you always end with the same prime factors:

$$
360 = 18 \cdot 20 = 2 \cdot 2 \cdot 2 \cdot 3 \cdot 3 \cdot 5 = 2^3 \cdot 3^2 \cdot 5
$$

**Divisibility rules:** last digit for $2$, $5$, $10$; last two digits for $4$ and $25$; digit sum for $3$ and $9$; $6$ means by $2$ and by $3$.

**Sieve of Eratosthenes:** cross out $1$; the smallest number not crossed out is prime – cross out its multiples. Up to $100$ the primes $2, 3, 5, 7$ suffice, because $11 \cdot 11 = 121 > 100$.

**gcd and lcm:** the gcd is the product of the **common** prime factors, the lcm the product of **all** prime factors (common ones counted once): $\gcd(24, 36) = 12$, $\operatorname{lcm}(24, 36) = 72$.

## Try it

1. Split [360 step by step](?show=0): tap the dashed numbers or press **Split**.
2. Press **Another tree** several times. What always stays the same?
3. Run the [sieve up to 100](?mode=sieb&show=0) with **Next prime**.
4. Find gcd and lcm of [24 and 36](?mode=ggt&show=0) with **Sort the factors**.

## Tasks

### Task 1: Prime factorisation

Write $84$, $126$ and $500$ as products of prime powers.

<details>
<summary>Show solution</summary>

$84 = 2^2 \cdot 3 \cdot 7$, $126 = 2 \cdot 3^2 \cdot 7$, $500 = 2^2 \cdot 5^3$. [Show 84](?n=84)

</details>

### Task 2: gcd and lcm

Find the gcd and lcm of $60$ and $84$.

<details>
<summary>Show solution</summary>

$\gcd(60, 84) = 2 \cdot 2 \cdot 3 = 12$, $\operatorname{lcm}(60, 84) = 2 \cdot 2 \cdot 3 \cdot 5 \cdot 7 = 420$. [Check](?mode=ggt&a=60&b=84)

</details>

### Task 3: Why stop at 7?

Explain why the sieve up to $100$ is finished after the multiples of $7$.

<details>
<summary>Show solution</summary>

A composite number $a \cdot b \le 100$ with $a \le b$ has $a \le 10$, so it has a prime factor $2$, $3$, $5$ or $7$ and has already been crossed out.

</details>

## Notes for teachers

- Three views: factor tree with divisibility rules, sieve and set diagram; each prime keeps its colour in all views.
- With `show=0` everything is built up step by step.
- **Misconceptions:** “$1$ is prime”, “odd numbers are prime” ($91 = 7 \cdot 13$), mixing up gcd and lcm.
