---
description: "Gaussian elimination step by step: bring a system to row echelon form, shown or with your own row operations – with unique, no or infinitely many solutions and the equations as planes in space."
---

## What is it about?

A **system of linear equations** such as

$$
\begin{aligned}
\text{I:}\quad & x + y + z = 6\\
\text{II:}\quad & 2y + 5z = -4\\
\text{III:}\quad & 2x + 5y - z = 27
\end{aligned}
$$

is solved systematically with **Gaussian elimination**. You write down only the numbers – the **augmented coefficient matrix** – and transform the rows until there are only zeros below the leading numbers (**row echelon form**). Three operations are allowed that do not change the solution set:

- **swap** two rows ($\text{I} \leftrightarrow \text{III}$),
- **multiply** a row by a number $\ne 0$ ($2 \cdot \text{II}$),
- **add** a multiple of another row to a row ($\text{III} - 2 \cdot \text{I}$).

In the example: $\text{III} - 2\cdot\text{I}$ gives $3y - 3z = 15$, then $2\cdot\text{III} - 3\cdot\text{II}$ gives $-21z = 42$. Now **substitute backwards**: $z = -2$, from II it follows that $y = 3$, from I that $x = 5$. So $L = \{(5, 3, -2)\}$.

At the end you can see how many solutions there are:

| Last row of the echelon form | Meaning |
| --- | --- |
| $-21z = 42$ (every step occupied) | exactly one solution |
| $0 = 1$ | contradiction – **no** solution |
| $0 = 0$ | one unknown can be chosen freely – **infinitely many** solutions |

**Geometrically**, every equation with three unknowns is a **plane** in space. Three planes intersect in a point, in a line – or have no common point. In the simulation the planes rotate with every row operation, but the common point stays where it is: that is exactly why the operations do not change the solution set.

## Try it

1. Go through the example with “Next ▶”. Which plane rotates at $\text{III} - 2\cdot\text{I}$? [Example](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&k=0)
2. Switch off “Avoid fractions (integers only)” and compare the intermediate steps: when do fractions appear? [With fractions](?lgs=2x%20%2B%203y%20-%20z%20%3D%205%3B%203x%20-%202y%20%2B%202z%20%3D%203%3B%205x%20%2B%20y%20-%203z%20%3D%20-2&int=0&k=0)
3. Here there is no solution: where does the contradiction appear, and how are the planes positioned? [No solution](?lgs=x%20%2B%20y%20%2B%20z%20%3D%201%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%205&k=9)
4. Three planes with a common line: which unknown becomes the parameter? [Line of intersection](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%209&k=9)
5. Transform yourself: type e.g. “III − 2·I” and press “Apply”. [Transform yourself](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&mode=self&op=III%20-%202%C2%B7I)

## Exercises

### Exercise 1: Echelon form

Bring $x + y = 3$, $x - y = 1$ to echelon form and solve.

<details>
<summary>Show solution</summary>

$\text{II} - \text{I}$: $-2y = -2$, so $y = 1$ and $x = 2$. $L = \{(2, 1)\}$ – the two lines intersect at $(2, 1)$. [Show in the simulation](?lgs=x%20%2B%20y%20%3D%203%3B%20x%20-%20y%20%3D%201&k=9)

</details>

### Exercise 2: Three unknowns

Solve the system from the example yourself with your own row operations. [Load exercise](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&mode=self&show=0)

<details>
<summary>Show solution</summary>

$\text{III} - 2\cdot\text{I}$, then $2\cdot\text{III} - 3\cdot\text{II}$: echelon form with $-21z = 42$. Backwards: $z = -2$, $y = 3$, $x = 5$.

</details>

### Exercise 3: How many solutions?

Investigate $x + y + z = 1$, $x - y + 2z = 3$, $2x + 3z = 5$.

<details>
<summary>Show solution</summary>

$\text{II} - \text{I}$ and $\text{III} - 2\cdot\text{I}$ give $-2y + z = 2$ and $-2y + z = 3$. Subtracting these from each other leaves $0 = 1$: no solution. The three planes have no common point. [Show in the simulation](?lgs=x%20%2B%20y%20%2B%20z%20%3D%201%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%205&k=9)

</details>

### Exercise 4: Infinitely many solutions

Find the solution set of $x + y + z = 6$, $x - y + 2z = 3$, $2x + 3z = 9$.

<details>
<summary>Show solution</summary>

The echelon form contains the row $0 = 0$. With $z = t$ it follows that $y = \tfrac32 + \tfrac12 t$ and $x = \tfrac92 - \tfrac32 t$. The solutions form a line – the line of intersection of the three planes. [Show in the simulation](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%209&k=9)

</details>

## Ideas for the classroom

- **Use:** for introducing the systematic method (matrix notation) and for interpreting the number of solutions; the practice mode works well for pair work (“Which operation next?”).
- **Geometry:** the rotating planes show clearly why row operations keep the solution set.
- **Common pitfalls:**
  - Sign errors when subtracting, especially on the right-hand side.
  - Multiplying a row by 0 – this loses an equation.
  - Interpreting $0 = 0$ as “no solution”.
- **Curriculum link:** in some courses the echelon form is enough, in others you continue to diagonal form (Gauss–Jordan) – both can be set.
