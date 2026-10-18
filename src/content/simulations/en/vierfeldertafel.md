---
description: "Two-way table, area-proportional Venn diagram and tree diagram show the same data – highlighted in sync. Intersection, union and complement light up everywhere, the addition rule is computed, the tree can be reversed."
---

## What is it about?

Class 9a was asked: do you have a pet ($A$)? Do you have siblings ($B$)? Everyone lands in exactly one of four cells – a **two-way table** with the counts $10, 4, 9, 7$ and the totals $|A| = 14$, $|B| = 19$, $N = 30$.

The same data appear in a **Venn diagram** (areas proportional to the counts) and in a **tree diagram** (first $A$, then $B$; second-stage branches like $\frac{10}{14}$).

- **Intersection** $A \cap B$: one cell. **Union** $A \cup B$: three cells. **Complement** $\overline{A}$: everything except $A$.
- **Addition rule:** $P(A \cup B) = P(A) + P(B) - P(A \cap B) = \frac{14}{30} + \frac{19}{30} - \frac{10}{30} = \frac{23}{30}$.
- The **reversed tree** starts with $B$; its leaves are the same four cells.

## Try it

1. Hover over a cell: the same subset lights up everywhere. [Load example](?ev=none)
2. Choose the events $A \cap B$, $A \cup B$ and $\overline{A}$. [A or B](?ev=AuB)
3. Reverse the tree. [Reversed tree](?order=BA&ev=AB&num=frac)

## Tasks

### Task 1: Complete the table

$30$ people, $14$ with a pet, $19$ with siblings, $10$ with both. [Load task](?show=0&ev=none&_hide=1)

<details>
<summary>Show solution</summary>

$4$, $9$, $16$ and $7$. [Show in simulation](?show=1&ev=none)

</details>

### Task 2: Addition rule

Find $P(A \cup B)$ in two ways. [Load task](?ev=AuB&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{14 + 19 - 10}{30} = \frac{23}{30}$, or $1 - \frac{7}{30}$. [Show in simulation](?ev=AuB)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Two yes/no questions in class quickly give your own table.
- **Common stumbling blocks:** counting $A \cap B$ twice; reading “or” as “exactly one”; using shares of the total on second-stage branches.
