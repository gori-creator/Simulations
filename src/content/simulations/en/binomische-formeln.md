---
description: Interactive simulation of the binomial formulas – split squares and rectangles apart with an animation and understand (a + b)², (a − b)² and (a + b)(a − b).
---

## What is it about?

The three **binomial formulas** are shortcuts for expanding brackets:

$$
\begin{aligned}
(a + b)^2 &= a^2 + 2ab + b^2 \\
(a - b)^2 &= a^2 - 2ab + b^2 \\
(a + b)(a - b) &= a^2 - b^2
\end{aligned}
$$

You can see them as **areas**: a square with side length $a + b$ consists of the square $a^2$, the square $b^2$ and **two** rectangles with area $a \cdot b$. These two rectangles are exactly what is forgotten in the common mistake $(a + b)^2 = a^2 + b^2$.

The formulas hold for all numbers – the areas are only an illustration for positive lengths (with $a > b$ for the 2nd and 3rd formula).

## Try it

1. Press **Split apart** and watch which parts the large square falls into. How many rectangles $a \cdot b$ are there?
2. Choose the second formula. Why do you have to **add** $b^2$ again, even though something is being subtracted? [2nd formula](?formula=2&a=6&b=2)
3. Choose the third formula and let the strip be moved. Which rectangle appears? [3rd formula](?formula=3&a=6&b=2)
4. Change $a$ and $b$ and check the calculation with numbers under **Results**.

## Exercises

### Exercise 1: Clever mental arithmetic

Use a binomial formula to calculate in your head: $53^2$, $49^2$ and $21 \cdot 19$.

<details>
<summary>Show solution</summary>

- $53^2 = (50 + 3)^2 = 2500 + 300 + 9 = 2809$
- $49^2 = (50 - 1)^2 = 2500 - 100 + 1 = 2401$
- $21 \cdot 19 = (20 + 1)(20 - 1) = 400 - 1 = 399$

</details>

### Exercise 2: Expanding

Expand: $(x + 4)^2$, $(2x - 3)^2$ and $(5 + y)(5 - y)$.

<details>
<summary>Show solution</summary>

- $(x + 4)^2 = x^2 + 8x + 16$
- $(2x - 3)^2 = 4x^2 - 12x + 9$ – careful: $(2x)^2 = 4x^2$ and $2 \cdot 2x \cdot 3 = 12x$.
- $(5 + y)(5 - y) = 25 - y^2$

</details>

### Exercise 3: Find the mistake

Tom calculates $(a + b)^2 = a^2 + b^2$. Check with $a = 5$ and $b = 2$ and use the simulation to explain what Tom forgot.

<details>
<summary>Show solution</summary>

$(5 + 2)^2 = 49$, but $5^2 + 2^2 = 29$. The missing $20 = 2 \cdot 5 \cdot 2$ are the **two rectangles** $a \cdot b$. [Show in the simulation](?formula=1&a=5&b=2)

</details>

### Exercise 4: Backwards – factorising

Write as a product: $x^2 + 10x + 25$, $49 - y^2$ and $9a^2 - 12ab + 4b^2$.

<details>
<summary>Show solution</summary>

- $x^2 + 10x + 25 = (x + 5)^2$
- $49 - y^2 = (7 + y)(7 - y)$
- $9a^2 - 12ab + 4b^2 = (3a - 2b)^2$

</details>

## Ideas for the classroom

- **Use:** Grade 7 (Bavaria: terms with brackets, binomial formulas). The area model works as an introduction and as a justification of why the middle term $2ab$ appears.
- **Animation:** The button below the drawing area splits the figure apart or puts it back together. For the third formula a strip is rotated and moved – a visual justification of $a^2 - b^2$.
- **Common stumbling blocks:**
  - $(a + b)^2 = a^2 + b^2$ ("the square is distributed over the terms").
  - In $(a - b)^2$ the $+b^2$ feels wrong. The simulation shows that $b^2$ is subtracted twice when the two strips are removed.
  - $(2x)^2 = 2x^2$ instead of $4x^2$.
- **Limits of the model:** Areas need positive lengths, and for the 2nd and 3rd formula also $a > b$. If $a \le b$, the simulation shows no area model for these formulas, but the calculation with numbers under **Results** is still correct, e.g. $(3 - 5)^2 = 4 = 9 - 30 + 25$. The formulas also hold for negative numbers – you can let students check this with numerical examples.
