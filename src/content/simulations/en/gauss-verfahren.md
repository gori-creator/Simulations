---
description: "Gaussian elimination step by step: bring a system to row echelon form, shown or with your own row operations – with unique, no or infinitely many solutions and the equations as planes in space."
---

## What is it about?

A system of linear equations is solved systematically with **Gaussian elimination**: write down the **augmented matrix** and use row operations until there are only zeros below the leading entries (**row echelon form**). Allowed are: swapping two rows, multiplying a row by a number $\ne 0$, and adding a multiple of one row to another (e.g. $\text{III} - 2\cdot\text{I}$). Then **substitute backwards**.

| Last row of the echelon form | Meaning |
| --- | --- |
| $-21z = 42$ | exactly one solution |
| $0 = 1$ | contradiction – no solution |
| $0 = 0$ | a free variable – infinitely many solutions |

With three unknowns each equation is a **plane**. In the simulation the planes turn at every operation, but the common point stays where it is – that is why row operations do not change the solution set.

## Try it

1. Step through the example with “Next”. [Example](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&k=0)
2. No solution – where does the contradiction appear? [Load](?lgs=x%20%2B%20y%20%2B%20z%20%3D%201%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%205&k=9)
3. A line of intersection: [load](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%209&k=9)
4. Transform yourself, e.g. “III − 2·I”: [load](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&mode=self&op=III%20-%202%C2%B7I)

## Tasks

### Task 1

Solve $x + y = 3$, $x - y = 1$.

<details>
<summary>Show solution</summary>

$\text{II} - \text{I}$: $-2y = -2$, so $y = 1$, $x = 2$. [Show](?lgs=x%20%2B%20y%20%3D%203%3B%20x%20-%20y%20%3D%201&k=9)

</details>

### Task 2

Solve the example yourself. [Load](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&mode=self&show=0)

<details>
<summary>Show solution</summary>

$\text{III} - 2\cdot\text{I}$, then $2\cdot\text{III} - 3\cdot\text{II}$ gives $-21z = 42$; so $z = -2$, $y = 3$, $x = 5$.

</details>

## Ideas for the classroom

- **Use:** introducing the systematic method in matrix notation and interpreting the number of solutions geometrically.
- **Common stumbling blocks:** sign errors on the right side; multiplying a row by 0; reading $0 = 0$ as “no solution”.
