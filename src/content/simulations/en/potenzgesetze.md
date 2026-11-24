---
description: "Laws of exponents and roots to look at: factor tiles for aᵐ · aⁿ, aᵐ ÷ aⁿ and (aᵐ)ⁿ, a ladder for a⁰ and negative exponents, fractional exponents as roots and a term simplifier with steps."
---

## What is it about?

A **power** $a^n$ is shorthand for a product of equal factors: $2^3 = 2 \cdot 2 \cdot 2 = 8$. The **laws of exponents** follow from this – you do not have to learn them by heart, you can see them by counting the factors:

| Law | Why? | Example |
| --- | --- | --- |
| $a^m \cdot a^n = a^{m+n}$ | $m$ factors and $n$ factors in a row | $2^3 \cdot 2^4 = 2^7 = 128$ |
| $a^m : a^n = a^{m-n}$ | equal factors above and below cancel | $a^6 : a^2 = a^4$ |
| $(a^m)^n = a^{m \cdot n}$ | $n$ groups of $m$ factors each | $(a^2)^3 = a^6$ |
| $(a \cdot b)^n = a^n \cdot b^n$ | rearrange the factors | $(2 \cdot 3)^3 = 2^3 \cdot 3^3$ |

**Zero and negative exponents:** going down the ladder $2^3 = 8$, $2^2 = 4$, $2^1 = 2$ by one step, you divide by 2. This takes you to $2^0 = 1$ and further to $2^{-1} = \tfrac12$, $2^{-2} = \tfrac14$. In general:

$$
a^0 = 1, \qquad a^{-n} = \frac{1}{a^n}.
$$

**Fractional exponents** are roots: because $(a^{1/n})^n = a^{n/n} = a$, we have $a^{1/n} = \sqrt[n]{a}$ and

$$
a^{m/n} = \sqrt[n]{a^m} = \left(\sqrt[n]{a}\right)^m.
$$

Examples: $8^{2/3} = (\sqrt[3]{8})^2 = 2^2 = 4$ and $4^{-1/2} = \tfrac{1}{\sqrt4} = 0.5$. Roots can be combined in the same way: $\sqrt2 \cdot \sqrt8 = 2^{1/2} \cdot 2^{3/2} = 2^2 = 4$.

## Try it

1. Watch $2^3$ and $2^4$ slide together to $2^7$. What happens if you set $m = 0$? [Multiplying](?mode=laws&law=mul&a=2&m=3&n=4)
2. When dividing, tiles cancel. Set $m < n$: where are the tiles left over now? [Dividing](?mode=laws&law=div&a=2&m=2&n=5&sym=1)
3. How many tiles does $(a^2)^3$ have? And why is it not $a^5$? [Power of a power](?mode=laws&law=powpow&a=2&m=2&n=3&sym=1)
4. Walk down the ladder. Why must $2^0 = 1$? [Ladder](?mode=ladder&a=2)
5. Set $8^{1/3}$, $8^{2/3}$ and $8^{-1/3}$. Where do the points lie on the graph? [Roots](?mode=roots&a=8&pm=2&pn=3)
6. Let $(a^2 \cdot b)^3 : (a^4 \cdot b^2)$ be simplified step by step. [Term](?mode=terms&t=(a%5E2%20%C2%B7%20b)%5E3%20%3A%20(a%5E4%20%C2%B7%20b%5E2))
7. Compare y = x², x³, x⁻¹ and x^(1/2). Which graphs are symmetric? [Power functions](?mode=fn&fm=3&fd=1&fam=1&fx=1.5)
8. Travel in powers of ten from the proton to the Milky Way. [Powers of ten](?mode=sci&zx=0)
9. Ten questions in your head: how long will your streak be? [Mental arithmetic](?mode=drill&dq=1)

## Exercises

### Exercise 1

Calculate $2^3 \cdot 2^4$, $\dfrac{a^7}{a^3}$ and $(x^2)^3$.

<details>
<summary>Show solution</summary>

$2^7 = 128$, $a^4$ and $x^6$. [Show in the simulation](?mode=terms&t=2%5E3%20%C2%B7%202%5E4)

</details>

### Exercise 2

Calculate without a calculator: $8^{2/3}$, $4^{-1/2}$, $\sqrt2 \cdot \sqrt8$.

<details>
<summary>Show solution</summary>

$8^{2/3} = (\sqrt[3]8)^2 = 4$, $4^{-1/2} = \tfrac12$, $\sqrt2 \cdot \sqrt8 = \sqrt{16} = 4$. [Show in the simulation](?mode=terms&t=%E2%88%9A2%20%C2%B7%20%E2%88%9A8)

</details>

### Exercise 3: Simplify it yourself

Simplify $(x^2)^3 : x^4$, enter your result and press “Check”. [Load exercise](?mode=terms&t=(x%5E2)%5E3%20%3A%20x%5E4&g=&show=0)

<details>
<summary>Show solution</summary>

$(x^2)^3 = x^6$, then $x^6 : x^4 = x^2$.

</details>

### Exercise 4: Orders of magnitude

The Earth has a diameter of about $1.27 \cdot 10^7\,\text{m}$, a person is about $1.7\,\text{m}$ tall. Roughly how many people would you have to stack on top of each other to reach the Earth's diameter?

<details>
<summary>Show solution</summary>

$\frac{1.27 \cdot 10^7}{1.7} \approx 0.75 \cdot 10^7 = 7.5 \cdot 10^6$, so about seven and a half million people. The orders of magnitude differ by about $10^7$. [Show in the simulation](?mode=sci&zx=7.4)

</details>

## Ideas for the classroom

- **Use:** derive the laws by counting factors; the ladder motivates $a^0 = 1$ and negative exponents without memorising.
- **Common mistakes** (also shown in the simulation):
  - $a^m \cdot a^n = a^{m \cdot n}$ instead of $a^{m+n}$.
  - $a^0 = 0$.
  - $(a + b)^n = a^n + b^n$ – the law only holds for products.
  - Reading $a^{-n}$ as a negative number.
- **Curriculum link:** whether fractional exponents come in grade 9 or later differs – please check your own curriculum.
