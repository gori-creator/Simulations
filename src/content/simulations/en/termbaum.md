---
description: "Interactive expression tree: type your own expressions, see their structure as a tree, evaluate them step by step in the correct order and name the type of expression."
---

## What is it about?

An **expression tree** shows how an expression such as $(12 - 4) \cdot 3 + 6 : 2$ is built: the numbers are at the top, the operations below. The operation at the very bottom is the **last one carried out** – it gives the value of the expression.

**Order of operations:** brackets first (innermost first), then powers, then $\cdot$ and $:$, then $+$ and $-$; otherwise from left to right.

The **type of an expression** is named after its last operation: sum, difference, product, quotient or power. So $(12 + 4) - 3 \cdot 2$ is a **difference**: the difference of the sum of $12$ and $4$ and the product of $3$ and $2$.

Careful: $-3^2 = -9$ (the opposite of $3^2$), but $(-3)^2 = 9$; $2x^2$ means $2 \cdot x^2$, not $(2x)^2$.

## Try it

1. Compare [3 + 4 · 5](?term=3%20%2B%204%20%C2%B7%205) and [(3 + 4) · 5](?term=%283%20%2B%204%29%20%C2%B7%205). Which operation is at the bottom?
2. Press **Next step** and watch the values flow through the tree.
3. In [4 · 5 + 2³](?term=4%20%C2%B7%205%20%2B%202%C2%B3) tap the multiplication first. Why does the result not change?
4. Compare [2x²](?term=2x%C2%B2&x=3) and [(2x)²](?term=%282x%29%C2%B2&x=3) and move the slider for $x$.

## Tasks

### Task 1: Type of expression

[Load task](?term=%2812%20%2B%204%29%20-%203%20%C2%B7%202&names=0&_hide=1) Name the type of $(12 + 4) - 3 \cdot 2$ and its parts, then evaluate it.

<details>
<summary>Show solution</summary>

The last operation is a subtraction, so it is a **difference** (minuend $12 + 4$, subtrahend $3 \cdot 2$): $16 - 6 = 10$.

</details>

### Task 2: Brackets

Insert brackets into $2 + 3 \cdot 4 - 1$ so that the value is $19$, $11$ or $15$.

<details>
<summary>Show solution</summary>

[$(2 + 3) \cdot 4 - 1 = 19$](?term=%282%20%2B%203%29%20%C2%B7%204%20-%201), [$2 + 3 \cdot (4 - 1) = 11$](?term=2%20%2B%203%20%C2%B7%20%284%20-%201%29), [$(2 + 3) \cdot (4 - 1) = 15$](?term=%282%20%2B%203%29%20%C2%B7%20%284%20-%201%29).

</details>

### Task 3: Values

Evaluate $2x^2 - 3x + 1$ for $x = -2$. [Load task](?term=2x%C2%B2%20-%203x%20%2B%201&x=-2&_hide=1)

<details>
<summary>Show solution</summary>

$2 \cdot (-2)^2 - 3 \cdot (-2) + 1 = 8 + 6 + 1 = 15$.

</details>

## Notes for teachers

- Input: `*` or `·`, `:` for division, `^` or `²` for powers, brackets `( )` and `[ ]`; `3/4` between two whole numbers is a fraction. Variables $a, b, c, n, x, y, z$. Custom expressions can be shared as a link.
- “Next step” follows the rules; tapping another possible operation is allowed and commented on – independent parts may be evaluated in any order.
- **Misconceptions:** working strictly from left to right; $-3^2 = 9$; naming the type after the first instead of the last operation.
