---
description: "Two-way tables in four views: table, Venn diagram and tree in sync, a table to complete from row and column totals, tree and reversed tree from probabilities, and the unit square with draggable lines, independence and randomly drawn people."
---

## What is it about?

Class 9a was asked: do you have a pet ($A$)? Do you have siblings ($B$)? Everyone lands in exactly one of four cells – a **two-way table** with the counts $10, 4, 9, 7$ and the totals $|A| = 14$, $|B| = 19$, $N = 30$.

The same data appear in a **Venn diagram** (areas proportional to the counts) and in a **tree diagram** (first $A$, then $B$; second-stage branches like $\frac{10}{14}$).

- **Intersection** $A \cap B$: one cell. **Union** $A \cup B$: three cells. **Complement** $\overline{A}$: everything except $A$.
- **Addition rule:** $P(A \cup B) = P(A) + P(B) - P(A \cap B) = \frac{14}{30} + \frac{19}{30} - \frac{10}{30} = \frac{23}{30}$.
- The **reversed tree** starts with $B$; its leaves are the same four cells.
- **Complete the table:** every row and column is a sum – tap a “?” to work it out.
- **Reverse the tree:** $P(B) = P(A) \cdot P_A(B) + P(\overline{A}) \cdot P_{\overline{A}}(B)$ and $P_B(A) = \frac{P(A \cap B)}{P(B)}$. With $0.4$, $0.7$, $0.2$: $P(B) = 0.40$, $P_B(A) = 0.70$.
- **Unit square:** areas are path probabilities. If both horizontal lines are at the same height, $A$ and $B$ are independent: $P(A \cap B) = P(A) \cdot P(B)$.

## Try it

1. Hover over a cell: the same subset lights up everywhere. [Load example](?ev=none)
2. Choose the events $A \cap B$, $A \cup B$ and $\overline{A}$. [A or B](?ev=AuB)
3. Reverse the tree. [Reversed tree](?order=BA&ev=AB&num=frac)
4. Complete the table step by step. [Complete the table](?mode=fill)
5. Compare tree and reversed tree. [Reverse the tree](?mode=tree&ctx=abc&num=frac)
6. Drag both lines in the unit square to the same height. [Unit square](?mode=mosaic&ctx=abc&num=frac)

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

### Task 3: Reverse the tree

$P(A) = 0.4$, $P_A(B) = 0.7$, $P_{\overline{A}}(B) = 0.2$. Find $P(B)$ and $P_B(A)$. [Load task](?mode=tree&ctx=abc&num=frac&_hide=1)

<details>
<summary>Show solution</summary>

$P(B) = 0.28 + 0.12 = 0.40$, $P_B(A) = 0.28 / 0.40 = 0.70$. [Show in simulation](?mode=tree&ctx=abc&num=abs&nn=100)

</details>

## Ideas for the classroom

- Two yes/no questions in class quickly give your own table.
- **Common stumbling blocks:** counting $A \cap B$ twice; reading “or” as “exactly one”; using shares of the total on second-stage branches.
