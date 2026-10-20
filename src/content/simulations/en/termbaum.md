---
description: "Interactive expression tree: type your own expressions, see their structure as a tree, evaluate them step by step in the correct order and name the type of expression."
---

## What is it about?

An **expression** (term) is a meaningful calculation made of numbers, variables, operators and brackets, e.g. $(12 - 4) \cdot 3 + 6 : 2$. The **expression tree** shows how it is built: the numbers are at the top, the operations below. Each operation joins two parts; at the very bottom is the **last operation carried out** – it gives the value of the expression.

**Order of operations:**

1. Work out what is in **brackets** first (with several brackets, the innermost first).
2. **Powers before $\cdot$ and $:$ before $+$ and $-$.**
3. Otherwise work **from left to right**: $20 - 8 - 2 = 12 - 2 = 10$.

**Type of expression:** An expression is named after its **last operation**:

| last operation | type | parts |
| --- | --- | --- |
| $+$ | sum | first addend $+$ second addend |
| $-$ | difference | minuend $-$ subtrahend |
| $\cdot$ | product | first factor $\cdot$ second factor |
| $:$ | quotient | dividend $:$ divisor |
| raising to a power | power | base$^{\text{exponent}}$ |

So $(12 + 4) - 3 \cdot 2$ is a **difference**: the difference of the sum of $12$ and $4$ and the product of $3$ and $2$.

**Careful with signs and powers:** $-3^2$ is the opposite of $3^2$, so $-9$. But $(-3)^2 = (-3) \cdot (-3) = 9$. In the same way, $2x^2$ means $2 \cdot x^2$ – not $(2x)^2$.

**Variables:** If you substitute a number for a variable, you get a **value** of the expression. Negative numbers are put in brackets: for $x = -2$, $3x + 1 = 3 \cdot (-2) + 1 = -5$.

## Try it

1. Compare the trees of [3 + 4 · 5](?term=3%20%2B%204%20%C2%B7%205) and [(3 + 4) · 5](?term=%283%20%2B%204%29%20%C2%B7%205). Which operation is at the bottom? What type of expression is it?
2. Press **Next step** and watch the values flow through the tree. The line above the tree shows the working.
3. In [4 · 5 + 2³](?term=4%20%C2%B7%205%20%2B%202%C2%B3) tap the multiplication first. The simulation allows it – why does the result not change? Then tap the addition before everything above it has been worked out.
4. [−3² or (−3)²?](?term=-3%C2%B2%20%2B%20%28-3%29%C2%B2) Where is the sign in the tree?
5. Compare [2x²](?term=2x%C2%B2&x=3) and [(2x)²](?term=%282x%29%C2%B2&x=3). Move the slider for $x$.
6. Calculate with [fractions](?term=%281%2F2%20%2B%201%2F3%29%20%C2%B7%206): the simulation works exactly, $\frac{1}{2} + \frac{1}{3} = \frac{5}{6}$.
7. Type your own expressions. What does the simulation say for $3 + {}$, for $5 \cdot -3$ or for $5 : (3 - 3)$?

## Tasks

### Task 1: Type of expression

[Load task](?term=%2812%20%2B%204%29%20-%203%20%C2%B7%202&names=0&_hide=1) Find the type of $(12 + 4) - 3 \cdot 2$, name its two parts and work out its value. Then check with the tree.

<details>
<summary>Show solution</summary>

The last operation is a subtraction, so the expression is a **difference**. Minuend: the sum $12 + 4$, subtrahend: the product $3 \cdot 2$.

$$(12 + 4) - 3 \cdot 2 = 16 - 6 = 10$$

</details>

### Task 2: Order of operations

Work out step by step: $2 \cdot [3 + (4 - 1)] - 12 : (2 + 4) + 5^2$. What type of expression is it? [Load task](?term=2%20%C2%B7%20%5B3%20%2B%20%284%20-%201%29%5D%20-%2012%20%3A%20%282%20%2B%204%29%20%2B%205%C2%B2&_hide=1)

<details>
<summary>Show solution</summary>

Innermost bracket first, then the other brackets, then the power, then $\cdot$ and $:$ before $+$ and $-$, finally from left to right:

$$2 \cdot [3 + 3] - 12 : 6 + 25 = 2 \cdot 6 - 2 + 25 = 12 - 2 + 25 = 35$$

The last operation is an addition – the expression is a **sum**.

</details>

### Task 3: From words to an expression

Write as an expression and work it out: “the difference of the product of 7 and 8 and the sum of 15 and 9”.

<details>
<summary>Show solution</summary>

$7 \cdot 8 - (15 + 9) = 56 - 24 = 32$. The brackets are needed because the whole sum $15 + 9$ is subtracted. [Show tree](?term=7%20%C2%B7%208%20-%20%2815%20%2B%209%29)

</details>

### Task 4: Inserting brackets

Insert brackets into $2 + 3 \cdot 4 - 1$ so that the value is $19$, $11$ or $15$. How does the tree change each time? [Without brackets](?term=2%20%2B%203%20%C2%B7%204%20-%201)

<details>
<summary>Show solution</summary>

- [$(2 + 3) \cdot 4 - 1 = 19$](?term=%282%20%2B%203%29%20%C2%B7%204%20-%201) – a difference
- [$2 + 3 \cdot (4 - 1) = 11$](?term=2%20%2B%203%20%C2%B7%20%284%20-%201%29) – a sum
- [$(2 + 3) \cdot (4 - 1) = 15$](?term=%282%20%2B%203%29%20%C2%B7%20%284%20-%201%29) – a product

Without brackets the value is $2 + 12 - 1 = 13$.

</details>

### Task 5: Values

Work out the value of $2x^2 - 3x + 1$ for $x = -2$ and for $x = 0.5$. [Load task](?term=2x%C2%B2%20-%203x%20%2B%201&x=-2&_hide=1)

<details>
<summary>Show solution</summary>

$x = -2$: $2 \cdot (-2)^2 - 3 \cdot (-2) + 1 = 8 + 6 + 1 = 15$

$x = 0.5$: $2 \cdot 0.25 - 1.5 + 1 = 0$. So for $x = 0.5$ the expression has the value $0$. The table of values below the tree shows more values.

</details>

### Task 6: Find the mistakes

Tim calculates: $-3^2 = 9$ and $20 - 8 - 2 = 20 - 6 = 14$. Explain his mistakes using the expression tree.

<details>
<summary>Show solution</summary>

- [$-3^2$](?term=-3%C2%B2): First square, then take the opposite: $-3^2 = -9$. Only $(-3)^2 = 9$.
- [$20 - 8 - 2$](?term=20%20-%208%20-%202): Operations of the same rank are done from left to right: $20 - 8 - 2 = 12 - 2 = 10$. Tim calculated $20 - (8 - 2)$ – [that is a different tree](?term=20%20-%20%288%20-%202%29).

</details>

## Ideas for the classroom

- **Use:** Bavaria, grade 5 (LB 1.2 and 3.2: structure of expressions, multiplication and division before addition and subtraction), grade 6 (LB 1.5: structure of expressions with rational numbers) and grade 7 (LB 1.1: expressions with variables, values, naming the structure).
- **Input:** `*` or `·` for multiplication, `:` for division, `^` or `²` for powers, brackets `( )` and `[ ]`. A slash between two whole numbers (`3/4`) stands for a **fraction** (one number), otherwise for a division. Allowed variables: $a, b, c, n, x, y, z$. Your own expressions can be shared as a link or QR code with **Share**.
- **Display:** As in many textbooks, the numbers are at the top and the result at the bottom; under “Display” you can turn the tree upside down. The operations have different colours (addition and subtraction blue, multiplication and division green, powers orange).
- **Order and structure:** “Next step” follows the rules. If you tap another *possible* operation yourself, it is carried out and commented on: independent parts may be worked out in any order – the rules fix the structure, not the order within independent parts.
- **Calculation:** exact with fractions; decimals are shown as decimals if they occur in the expression or in a variable. A sign directly after an operator is not accepted (as in class): $5 \cdot (-3)$ instead of $5 \cdot -3$. $0^0$ and division by $0$ are not defined.
- **Common stumbling blocks:**
  - Working strictly from left to right: $3 + 4 \cdot 5 = 35$.
  - $-3^2 = 9$ and $2x^2 = (2x)^2$.
  - Naming the type after the first operator instead of the last operation carried out.
- **Task mode:** With `names=0` and `_hide=1` (see Task 1) the types and results are hidden at first.
