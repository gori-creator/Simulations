---
description: "Interactive balance model for linear equations: x-boxes and weights on a balance, equivalent transformations as actions, the chain of transformations, a check and the limits of the model."
---

## What is it about?

You can think of an **equation** such as $3x + 2 = x + 8$ as a **balance in equilibrium**: on the left there are three boxes, each weighing $x$, and two unit weights of $1$; on the right one box and eight unit weights. Both sides weigh the same – that is what the equals sign means.

We are looking for the weight $x$ of one box. You change the balance so that it **stays level** until only one box is left on one side:

$$
\begin{aligned}
3x + 2 &= x + 8 &&\mid -x\\
2x + 2 &= 8 &&\mid -2\\
2x &= 6 &&\mid :2\\
x &= 3
\end{aligned}
$$

Transformations that do not change the solution set are called **equivalent transformations**:

- add or subtract **the same number or the same term on both sides**,
- multiply **both sides** by the same number or divide both sides by the same number (except $0$).

In the margin you note what you do to both sides, e.g. $\mid -x$. The result is written as the **solution set** $\{3\}$. You check it in the original equation: $3 \cdot 3 + 2 = 11$ and $3 + 8 = 11$.

**Special cases:** If $x$ disappears completely, a statement without a variable remains. If it is false (e.g. $3 = 5$), the equation has **no solution**: $\{\,\}$. If it is true (e.g. $4 = 4$), **every number** is a solution.

**Limits of the model:** Weights are always positive. Equations with a negative solution (e.g. $x + 9 = 3x + 13$, so $x = -2$) or with minus signs in the terms cannot be shown with a balance. $2x = 3$ cannot be split further in the model either – by calculation, $x = 1.5$.

## Try it

1. Tap a box on the **left only**. What happens to the balance? How do you restore the balance?
2. Solve $3x + 2 = x + 8$ with the buttons **Both sides − x**, **Both sides − 1** and **Both sides : 2**. Watch the chain of transformations on the right.
3. Open the boxes: how heavy is one? Does the check work?
4. Divide both sides of [4x + 2 = 2x + 6](?a=4&b=2&c=2&d=6) by 2. Why does the balance stay level?
5. [No solution?](?a=2&b=3&c=2&d=5) Remove all boxes on both sides. What is left?
6. [Limit of the model](?a=1&b=9&c=3&d=13): Why can the balance never be level here?
7. [2x = 5](?a=2&b=0&c=0&d=5): Why can't the weights be split into two equal parts? Open the boxes: how heavy is one?
8. Press **New equation** for a random task.

## Tasks

### Task 1: Solve with the balance

[Load task](?a=5&b=2&c=2&d=14&_hide=1) Solve $5x + 2 = 2x + 14$. Write down the chain of transformations and check your answer.

<details>
<summary>Show solution</summary>

$$
\begin{aligned}
5x + 2 &= 2x + 14 &&\mid -2x\\
3x + 2 &= 14 &&\mid -2\\
3x &= 12 &&\mid :3\\
x &= 4
\end{aligned}
$$

Solution set $\{4\}$. Check: $5 \cdot 4 + 2 = 22$ and $2 \cdot 4 + 14 = 22$.

</details>

### Task 2: The x is on the right

[Load task](?a=1&b=12&c=4&d=3&_hide=1) Solve $x + 12 = 4x + 3$.

<details>
<summary>Show solution</summary>

$x + 12 = 4x + 3 \mid -x$ gives $12 = 3x + 3 \mid -3$, so $9 = 3x \mid :3$ and $3 = x$. Solution set $\{3\}$.

</details>

### Task 3: From the picture to the equation

On the left there are 4 boxes and 1 weight, on the right 2 boxes and 9 weights; the balance is level. Set up the equation and find the weight of one box.

<details>
<summary>Show solution</summary>

$4x + 1 = 2x + 9 \mid -2x \Rightarrow 2x + 1 = 9 \mid -1 \Rightarrow 2x = 8 \mid :2 \Rightarrow x = 4$. [Show in the simulation](?a=4&b=1&c=2&d=9)

</details>

### Task 4: Find the mistake

Max writes: $3x + 4 = x + 10 \mid -x$ gives $3x + 4 = 10$. What did he do wrong? What does the balance show? [Load the original equation](?a=3&b=4&c=1&d=10)

<details>
<summary>Show solution</summary>

Max removed an $x$ on the right only – the balance tips. Correct: $2x + 4 = 10 \mid -4 \Rightarrow 2x = 6 \mid :2 \Rightarrow x = 3$.

</details>

### Task 5: Limits of the model

Solve by calculation: (a) $2x + 7 = 4x + 3$ and (b) $x + 6 = 3x + 10$. Which of the two equations can be solved with the balance?

<details>
<summary>Show solution</summary>

(a) $2x + 7 = 4x + 3 \mid -2x \Rightarrow 7 = 2x + 3 \mid -3 \Rightarrow 4 = 2x \mid :2 \Rightarrow x = 2$. This also works on the [balance](?a=2&b=7&c=4&d=3).

(b) $x + 6 = 3x + 10 \mid -x \Rightarrow 6 = 2x + 10 \mid -10 \Rightarrow -4 = 2x \mid :2 \Rightarrow x = -2$. A box with negative weight does not exist; even the step $\mid -10$ is impossible on the balance, because there are only 6 weights on the left. [Show the balance](?a=1&b=6&c=3&d=10)

</details>

### Task 6: Special cases

Find the solution set: (a) $3x + 5 = 3x + 2$, (b) $2x + 2 = 2(x + 1)$.

<details>
<summary>Show solution</summary>

(a) $\mid -3x$ gives $5 = 2$ – false, so the solution set is $\{\,\}$. The [balance](?a=3&b=5&c=3&d=2) tips to the left for every box weight.

(b) Expanding gives $2x + 2 = 2x + 2$. $\mid -2x$ gives $2 = 2$ – always true, so every number is a solution. The [balance](?a=2&b=2&c=2&d=2) is level for every box weight. The balance cannot show brackets, only the expanded form.

</details>

## Ideas for the classroom

- **Use:** About grade 7 (linear equations: setting up equations and solving them by equivalent transformations) – as a visual introduction before equations with negative numbers are solved purely by calculation.
- **How it works:** A tap removes an object **on one side only** – the balance tips and the transformation is marked red. Only when the same is removed on the other side does a valid line appear (consecutive steps of the same kind are combined as in an exercise book, e.g. $\mid -2$). The buttons transform both sides; "Both sides : n" suggests a suitable divisor and visibly splits the pans into equal groups.
- **Shared links** contain the original equation. "New equation" creates tasks with a natural-number solution from 1 to 6.
- **Limits of the model** (discuss them deliberately): no negative numbers and no differences such as $3x - 2$, positive solutions only, dividing only when it works out (for $2x = 5$ the simulation gives $x = 2.5$ as the calculated solution). Adding to and multiplying both sides are not offered here, because they are not needed to solve such equations. Mention them anyway: if you put the same on both pans, the balance also stays level.
- **Without mouse or finger:** Single objects can only be removed by tapping or clicking. With the keyboard, the buttons for both sides are available.
- **Common stumbling blocks:**
  - Only one side is transformed (exactly what the tipping balance shows).
  - When dividing, only part of a side is divided: $2x + 4 = 10 \mid :2$ does not give $x + 4 = 5$ but $x + 2 = 5$.
  - "Move it to the other side and change the sign" as a rule without understanding – the balance shows that in fact the same is subtracted on both sides.
