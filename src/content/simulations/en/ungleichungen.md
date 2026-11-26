## What is it about?

An **inequality** compares two terms using one of the signs $<$, $\le$, $>$ or $\ge$. An example is $2x + 1 < 7$. Unlike a linear equation, it usually has **infinitely many** solutions, namely all the numbers in a range. Here, that is every $x$ less than $3$.

### Solution set

The **solution set** collects all the solutions:

$$S = \{x \mid x < 3\}$$

On the number line this is a ray. An **open circle** means the boundary is not included ($<$ or $>$). A **filled circle** means it is included ($\le$ or $\ge$).

### Solving by transforming

You transform the inequality as you would an equation, and write each step next to it:

$$\begin{aligned} 3x - 2 &> x + 4 && \mid -x \\ 2x - 2 &> 4 && \mid +2 \\ 2x &> 6 && \mid :2 \\ x &> 3 \end{aligned}$$

Adding and subtracting are always allowed. Multiplying or dividing by a **positive** number does not change the sign either.

### Watch out: reverse the sign

If you multiply or divide by a **negative** number, you have to **reverse** the inequality sign:

$$\begin{aligned} -2x + 4 &\ge 0 && \mid -4 \\ -2x &\ge -4 && \mid :(-2) \quad \text{reverse the sign!} \\ x &\le 2 \end{aligned}$$

Why is that? We know $1 < 2$. Multiplying both sides by $-1$ gives $-1$ and $-2$. On the number line $-1$ lies to the right of $-2$, so $-1 > -2$. Multiplying by a negative number reflects everything at zero, and that reverses the order.

### Solving graphically

Draw both sides as lines: $y = ax + b$ and $y = cx + d$. Wherever the left line lies **below** the right one, $ax + b < cx + d$ holds. The boundary is at the **intersection** of the two lines. The simulation shades this region green.

### Special cases

If every $x$ cancels while you transform, a statement without $x$ is left:

- $x + 1 > x$ leads to $1 > 0$. This is **always true**, so $S = \mathbb{R}$.
- $x > x + 1$ leads to $0 > 1$. This is **never true**, so $S = \{\,\}$.

Graphically these are two **parallel** lines.

### Trying it out on a balance

Before transforming, you can substitute numbers: for each x a balance shows which side is larger. Trying many numbers one after another produces a green region on the number line – exactly the solution set. At the boundary the balance tips over.

### Two conditions: and, or

Often two conditions hold at once, for example $-2 < x \le 3$. That means $x > -2$ **and** $x \le 3$. On the number line the solution is where both rays overlap, written as the interval $(-2, 3]$: a round bracket means “boundary not included”. With **or** one condition is enough: $x < -3$ or $x > 4$ consists of two separate rays. If the conditions do not fit together ($x > 5$ and $x < 1$), the solution set is empty.

### Inequalities in everyday life

Many everyday questions are inequalities: from how many minutes is a flat rate worth it? How many boxes may I load into the lift? Set up the inequality, solve it and round sensibly: for “at most” round down, for “at least” round up (18.3 weeks → 19 weeks).

### Two variables: half-planes

An inequality like $y < 0.5x + 1$ has infinitely many solution points $(x \mid y)$. They all lie **below** the line $y = 0.5x + 1$ – a half-plane. With $<$ and $>$ the line itself is not included (dashed), with $\le$ and $\ge$ it is (solid).

## Try it

- [2x + 1 < 7](?a=2&b=1&rel=lt&c=0&d=7&t=1): Drag the test point. When does the inequality hold?
- [−2x + 4 ≥ 0](?a=-2&b=4&rel=ge&c=0&d=0&t=0): Look for the step where the sign reverses.
- [Comparing tariffs](?a=0.5&b=2&rel=lt&c=1&d=0&t=6): Tariff A costs €2 plus €0.50 per hour, tariff B costs €1 per hour. From when on is A cheaper?
- [x + 1 > x](?a=1&b=1&rel=gt&c=1&d=0&t=2): What happens when the lines are parallel?
- [Balance](?mode=waage&a=2&b=1&rel=lt&c=0&d=7&t=-4): Press “Try all numbers”.
- [−2 < x ≤ 3](?mode=doppelt&lo=-2&lr=lt&hi=3&hr=le&op=und) and [x < −3 or x > 4](?mode=doppelt&lo=4&lr=lt&hi=-3&hr=lt&op=oder): What do “and” and “or” look like?
- [Phone plan](?mode=alltag&sc=handy&mh=60), [saving](?mode=alltag&sc=sparen&ws=10), [lift](?mode=alltag&sc=aufzug&kb=10): Drag the point to the boundary.
- [Half-plane](?mode=halbebene&m=0.5&n=1&rel=lt&px=2&py=1): Which points satisfy $y < 0.5x + 1$?
- [Practice](?mode=ueben&qn=1): Six kinds of tasks with a score.

## Exercises

**1. Solution set.** Solve $3x - 5 \le 7$ and draw the solution set on the number line. [Load exercise](?a=3&b=-5&rel=le&c=0&d=7&t=0&_hide=1)

<details><summary>Show solution</summary>

$3x \le 12$, so $x \le 4$. The solution set is $S = \{x \mid x \le 4\}$: a filled circle at $4$ and a ray to the left.

</details>

**2. Reverse the sign.** Solve $5 - x > 2$. [Load exercise](?a=-1&b=5&rel=gt&c=0&d=2&t=0&_hide=1)

<details><summary>Show solution</summary>

$-x > -3$. Dividing by $-1$ reverses the sign: $x < 3$.

</details>

**3. x on both sides.** Solve $4x + 1 \ge 2x + 7$. [Load exercise](?a=4&b=1&rel=ge&c=2&d=7&t=0&_hide=1)

<details><summary>Show solution</summary>

$2x + 1 \ge 7$, then $2x \ge 6$, so $x \ge 3$.

</details>

**4. Tariffs.** One bike rental charges €2 plus €0.50 per hour, another charges €1 per hour with no base fee. From how many hours on is the first one cheaper? [Load exercise](?a=0.5&b=2&rel=lt&c=1&d=0&t=2&_hide=1)

<details><summary>Show solution</summary>

We need $0.5x + 2 < x$, so $2 < 0.5x$ and therefore $x > 4$. For more than 4 hours the first rental is cheaper. At exactly 4 hours both cost €4.

</details>

**5. Between two numbers.** How many integers satisfy $-2 < x \le 3$? [Load task](?mode=doppelt&lo=-2&lr=lt&hi=3&hr=le&op=und&_hide=1)

<details><summary>Show solution</summary>

$-1, 0, 1, 2, 3$ – that is 5 numbers. −2 is not included, 3 is.

</details>

**6. Lift.** A lift carries at most 630 kg. A person (80 kg) loads boxes of 25 kg each. How many boxes can they take at most? [Load task](?mode=alltag&sc=aufzug&kb=10&_hide=1)

<details><summary>Show solution</summary>

$25x + 80 \le 630$, so $25x \le 550$ and $x \le 22$. At most 22 boxes.

</details>

## Ideas for teaching

- **Balance as a starting point:** Let students try out numbers first, then ask how to find the boundary without trying.
- **Common mistake:** Forgetting to reverse the sign when dividing by a negative number. A check with a number from the green region reveals it immediately.
- **Everyday life:** Students look up real plans (phone, streaming, cinema pass) and set up the inequality themselves.
