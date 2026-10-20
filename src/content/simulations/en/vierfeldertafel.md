---
description: "Two-way tables in four views: table, Venn diagram and tree in sync, a table to complete from row and column totals, tree and reversed tree from probabilities, and the unit square with draggable lines, independence and randomly drawn people."
---

## What is it about?

Class 9a was asked: do you have a pet ($A$)? Do you have siblings ($B$)? Each person falls into exactly one of four cells:

| | $B$ | $\overline{B}$ | Total |
| --- | --- | --- | --- |
| $A$ | $10$ | $4$ | $14$ |
| $\overline{A}$ | $9$ | $7$ | $16$ |
| Total | $19$ | $11$ | $30$ |

This is a **two-way table**. The inner cells are the **intersections** $A \cap B$, $A \cap \overline{B}$, $\overline{A} \cap B$, $\overline{A} \cap \overline{B}$. The margins hold the **totals** $|A|$, $|\overline{A}|$, $|B|$, $|\overline{B}|$ and the grand total. Dividing everything by $30$ gives probabilities (relative frequencies).

A **Venn diagram** shows the same data: the circles $A$ and $B$ lie in the sample space $\Omega$; here the areas are even proportional to the counts. So does a **tree diagram**: first split by $A$, then by $B$. The second-stage branches carry shares like $\frac{10}{14}$ – “of the $14$ with a pet, $10$ have siblings”.

**Events:**

- **Intersection** $A \cap B$ (“$A$ and $B$”): one cell.
- **Union** $A \cup B$ (“$A$ or $B$”, or both): three cells.
- **Complement** $\overline{A}$: everything except $A$, so $P(\overline{A}) = 1 - P(A)$.

For the union, the cell $A \cap B$ must not be counted twice – this is the **addition rule**:

$$
P(A \cup B) = P(A) + P(B) - P(A \cap B) = \frac{14}{30} + \frac{19}{30} - \frac{10}{30} = \frac{23}{30}.
$$

The **reversed tree** starts with $B$. Its leaves are the same four cells – only in a different order and with different shares on the branches: $\frac{19}{30} \cdot \frac{10}{19} = \frac{10}{30}$.

**Complete the table:** every row and every column is a sum. If you know two of the three values in a row or column, the third follows by adding or subtracting. In the view “Complete the table” only four values are known – tap a “?”: if it can already be worked out, the value appears with its calculation, otherwise you get a hint.

**Reverse the tree with probabilities:** often $P(A)$ and the conditional probabilities $P_A(B)$ and $P_{\overline{A}}(B)$ are given. The product rule gives the table, the sum rule gives $P(B)$ and from that the reversed tree:

$$
P(B) = P(A) \cdot P_A(B) + P(\overline{A}) \cdot P_{\overline{A}}(B), \qquad P_B(A) = \frac{P(A \cap B)}{P(B)}.
$$

With $P(A) = 0.4$, $P_A(B) = 0.7$ and $P_{\overline{A}}(B) = 0.2$ you get $P(B) = 0.4 \cdot 0.7 + 0.6 \cdot 0.2 = 0.40$ and $P_B(A) = \frac{0.28}{0.40} = 0.70$. With “counts” the table shows **natural frequencies**, e.g. out of $100$ people: $28$, $12$, $12$, $48$.

**Unit square:** the square has area $1$. It is split vertically in the ratio $P(A) : P(\overline{A})$, then each column horizontally by $P_A(B)$ or $P_{\overline{A}}(B)$. Each part is a path probability. If both horizontal lines are **at the same height**, then $P_A(B) = P_{\overline{A}}(B) = P(B)$: $A$ and $B$ are **(stochastically) independent**, and $P(A \cap B) = P(A) \cdot P(B)$. Randomly drawn people land as dots in the square – their relative frequencies are close to the areas.

## Try it

1. Hover over a cell of the table (or tap it): the same subset lights up in the Venn diagram and in the tree. [Load example](?ev=none)
2. Choose the events $A \cap B$, $A \cup B$ and $\overline{A}$ one after another. Which cells belong to each? [A or B](?ev=AuB)
3. Change the counts with the sliders. How do the circles change?
4. Turn the tree around (“Tree starts with B”). Why do the branches show different fractions, but the leaves the same numbers? [Reversed tree](?order=BA&ev=AB&num=frac)
5. Switch to percent and look at the survey of 200 teenagers. [200 teenagers](?ctx=club&c1=46&c2=34&c3=52&c4=68&num=pct&ev=xor)
6. Complete the table step by step. Which “?” can you work out first, which only at the very end? [Complete the table](?mode=fill&given=g1)
7. Compare the two trees: which numbers match, which do not? Tap a leaf. [Reverse the tree](?mode=tree&ctx=abc&num=frac)
8. In the unit square, drag both horizontal lines to the same height. What does the calculation show now? Then draw $100$ people. [Unit square](?mode=mosaic&ctx=abc&num=frac)

## Tasks

### Task 1: Complete the table

Of $30$ people, $14$ have a pet and $19$ have siblings; $10$ have both. Complete the two-way table. [Load task](?show=0&ev=none&_hide=1)

<details>
<summary>Show solution</summary>

$A \cap \overline{B}$: $14 - 10 = 4$, $\overline{A} \cap B$: $19 - 10 = 9$, $\overline{A}$: $30 - 14 = 16$, $\overline{A} \cap \overline{B}$: $16 - 9 = 7$. [Show in simulation](?show=1&ev=none)

</details>

### Task 2: Addition rule

Find the probability that a randomly chosen person has a pet **or** siblings – once with the addition rule and once via the complement. [Load task](?ev=AuB&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Addition rule: $\frac{14}{30} + \frac{19}{30} - \frac{10}{30} = \frac{23}{30} \approx 76.7\,\%$. Complement “neither”: $1 - \frac{7}{30} = \frac{23}{30}$ ✓. [Show in simulation](?ev=AuB)

</details>

### Task 3: Exactly one

In the survey of $200$ teenagers, $80$ are in a sports club, $98$ play an instrument and $46$ do both. What percentage do **exactly one** of the two? [Load task](?ctx=club&c1=46&c2=34&c3=52&c4=68&num=pct&ev=xor&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Sports club only: $80 - 46 = 34$, instrument only: $98 - 46 = 52$. Together $86$ out of $200$, so $43\,\%$. [Show in simulation](?ctx=club&c1=46&c2=34&c3=52&c4=68&num=pct&ev=xor)

</details>

### Task 4: Reversed tree

Draw the tree that starts with $B$ (siblings) and fill in all branch probabilities. Check on one path that you get the same leaf probability as in the first tree. [Load task](?order=BA&show=0&_hide=1)

<details>
<summary>Show solution</summary>

First stage: $P(B) = \frac{19}{30}$, $P(\overline{B}) = \frac{11}{30}$. Second stage: $\frac{10}{19}$ and $\frac{9}{19}$, and $\frac{4}{11}$ and $\frac{7}{11}$. Path $B \cap A$: $\frac{19}{30} \cdot \frac{10}{19} = \frac{10}{30}$ – the same as $\frac{14}{30} \cdot \frac{10}{14}$ in the first tree. [Show in simulation](?order=BA&num=frac)

</details>

### Task 5: Reverse the tree

$P(A) = 0.4$, $P_A(B) = 0.7$, $P_{\overline{A}}(B) = 0.2$. Find $P(B)$ and $P_B(A)$. How many out of $100$ people belong to $A \cap B$? [Load task](?mode=tree&ctx=abc&num=frac&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$P(B) = 0.4 \cdot 0.7 + 0.6 \cdot 0.2 = 0.28 + 0.12 = 0.40$ and $P_B(A) = \frac{0.28}{0.40} = 0.70$. Out of $100$ people, $28$ belong to $A \cap B$. [Show in simulation](?mode=tree&ctx=abc&num=abs&nn=100)

</details>

### Task 6: Independent?

For $50$ people: $|A \cap B| = 12$, $|A| = 30$, $|B| = 20$. Show that $P(A \cap B) = P(A) \cdot P(B)$. What does this mean? [Load task](?ctx=abc&c1=12&c2=18&c3=8&c4=12&ev=AB&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{12}{50} = 0.24$ and $\frac{30}{50} \cdot \frac{20}{50} = 0.6 \cdot 0.4 = 0.24$ ✓. The share of $B$ is the same within $A$ as within $\overline{A}$ ($\frac{12}{30} = \frac{8}{20} = 40\,\%$): $A$ and $B$ do not influence each other (statistically) – they are **independent**. In the unit square the lines are then at the same height. [Show in unit square](?mode=mosaic&ctx=abc&pa=0.6&pb1=0.4&pb2=0.4&num=frac)

</details>

### Task 7: Explore the unit square

Set $P(A) = 0.4$ and drag $P_A(B)$ and $P_{\overline{A}}(B)$ both to $0.6$. Find $P(A \cap B)$ and $P(A) \cdot P(B)$. What happens if you move only one line? [Load task](?mode=mosaic&ctx=abc&num=frac&pb1=0.6&pb2=0.6&_hide=1)

<details>
<summary>Show solution</summary>

$P(A \cap B) = 0.4 \cdot 0.6 = 0.24$ and $P(B) = 0.6$, so $P(A) \cdot P(B) = 0.24$ – equal, $A$ and $B$ are independent. If you move only one line, the two values are no longer equal. Example $P_{\overline{A}}(B) = 0.2$: $P(A \cap B) = 0.24$ stays, but $P(B) = 0.24 + 0.6 \cdot 0.2 = 0.36$ and $P(A) \cdot P(B) = 0.144$. The events are then dependent. [Show in simulation](?mode=mosaic&ctx=abc&num=frac&pb1=0.6&pb2=0.6)

</details>

## Ideas for the classroom

- **Use:** Year 9 (two-way table, Venn diagram, addition rule) and Year 11 (conditional probability, reversed tree) following the Bavarian LehrplanPLUS, Gymnasium – please check the exact assignment against the curriculum.
- **Your own survey:** two yes/no questions in class quickly give your own two-way table, which you can enter with the sliders.
- **Switching representations:** the synchronised highlighting can help students find each number of one representation in the others.
- **Common stumbling blocks:**
  - In $A \cup B$, the cell $A \cap B$ is counted twice.
  - “$A$ or $B$” is understood as “exactly one of the two”.
  - On second-stage branches, shares of the grand total are used instead of shares of the subgroup ($\frac{10}{30}$ instead of $\frac{10}{14}$).
  - In the reversed tree, the first-stage branches are simply copied.
  - $P_A(B)$ and $P_B(A)$ are confused (in Task 5 both happen to be $0.7$ – that is not always the case).
- **Unit square:** it works well for “seeing” independence before the formula $P(A \cap B) = P(A) \cdot P(B)$ is introduced.
