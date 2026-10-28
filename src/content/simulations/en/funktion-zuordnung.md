---
description: "Interactive simulation on the concept of a function: relations as arrow diagram, table of values and graph in sync, checking uniqueness, reversing relations and the vertical line test on a circle, a sideways parabola, a step function and more."
---

## What is it about?

A **relation** assigns elements of a set $A$ to elements of a set $B$, e.g. every number its square or every child its birth month. A relation is called a **function** if it is **unique**:

> Every element of the domain $D$ is assigned **exactly one** element.

You then write $x \mapsto f(x)$, e.g. $x \mapsto x^2$. The set of all assigned values is called the **range** $R$.

This is how you recognise a function in the three representations:

| Representation | It is a function if … |
| --- | --- |
| arrow diagram | **exactly one** arrow leaves **every** element on the left |
| table of values | there is **exactly one** value under each $x$ |
| graph | there is **exactly one** point above each $x$ in $D$ (every vertical line meets it **at most once**) |

**Important:** **Several arrows arriving** at one element on the right is allowed. For $x \mapsto x^2$, both $-2$ and $2$ have the square $4$ – it is still a function. The only thing not allowed is that several arrows **leave** an element on the left, or **none at all**. An element on the left without an arrow means: on the set on the left, the relation is not a function.

**Reversing:** If you turn all arrows around, you get a relation again – but not always a function. “Number $\mapsto$ square” becomes “square number $\mapsto$ number with this square”: $4$ would be assigned $-2$ and $2$, and $2$ (in the integers) nothing at all.

**Vertical line test:** a graph belongs to a function exactly when **every line parallel to the $y$-axis** meets it **at most once**. If a vertical line $x = c$ meets the graph twice, two values would be assigned to $c$. So a circle or a “sideways” parabola is not the graph of a function, but a semicircle or a step function is.

**Domain and range on the graph:** $D$ is the “shadow” of the graph on the $x$-axis, $R$ the shadow on the $y$-axis. For $f(x) = 0.5x^2 - 2$: $D = \mathbb{R}$ and $R = \{y \mid y \geq -2\}$.

## Try it

1. Load [number ↦ square](?ex=square). At which elements on the right do two arrows arrive? Why is it still a function?
2. Press **Reverse** or load [square ↦ number](?ex=square&rev=1). Which two different problems does the arrow diagram show – and how do you see them in the table of values and in the graph?
3. Reverse [x ↦ 2x + 1](?ex=lin) as well. Why is the reversed relation a function again?
4. Something is wrong in [your own relation](?ex=own). Repair it with as few changes as possible: tap an element on the left, then one on the right (or drag an arrow) to add or remove arrows.
5. Switch to [graph & line test for the circle](?mode=graph&cur=circle&xl=1). Drag the vertical line: where does it meet the circle twice, once, not at all?
6. Compare the [semicircle](?mode=graph&cur=semi&xl=1) with the circle. Read off $D$ and $R$.
7. Look at the [step function](?mode=graph&cur=step&xl=2) at a whole number: which point belongs to the graph, the filled one or the hollow one?
8. For the [S-curve](?mode=graph&cur=scurve&xl=3), press **Sweep the line test** and watch the strip below the graph. Between which positions are there three intersections?

## Tasks

### Task 1: Function or not?

Decide and give a reason: (a) student $\mapsto$ height (measured today), (b) height $\mapsto$ student, (c) number $\mapsto$ its double, (d) number $\mapsto$ its divisors, (e) person $\mapsto$ birthday, (f) birthday $\mapsto$ person.

<details>
<summary>Show solution</summary>

(a) **Function:** today every student has exactly one height. (b) **Not a function:** two students can be equally tall; also, there are heights that nobody has. (c) **Function:** $x \mapsto 2x$. (d) **Not a function:** $6$ has the divisors $1$, $2$, $3$ and $6$. (e) **Function:** every person has exactly one birthday. Two people having their birthday on the same day is allowed. (f) **Not a function:** several people can have their birthday on one day, and on some days nobody does.

</details>

### Task 2: Repair the arrow diagram

[Load task](?ex=own&show=0&_hide=1) Is the relation a function? Change as few arrows as possible so that it becomes a function.

<details>
<summary>Show solution</summary>

Not a function: two arrows leave $3$ (to $1$ and $5$), none leaves $4$. Two changes are enough, e.g. remove the arrow $3 \to 5$ and add an arrow $4 \to 3$. If two arrows then arrive at the same number, that is allowed. [Show with verdict](?ex=own)

</details>

### Task 3: Check tables of values

Does the table of values belong to a function $x \mapsto y$?

**(a)**

| $x$ | $1$ | $2$ | $3$ | $4$ |
| --- | --- | --- | --- | --- |
| $y$ | $5$ | $7$ | $5$ | $9$ |

**(b)**

| $x$ | $2$ | $3$ | $2$ | $5$ |
| --- | --- | --- | --- | --- |
| $y$ | $1$ | $4$ | $6$ | $8$ |

<details>
<summary>Show solution</summary>

(a) **Yes:** every $x$ appears exactly once; the value $5$ appearing twice is allowed (in the arrow diagram, two arrows arrive at $5$).

(b) **No:** the values $1$ and $6$ are both assigned to $2$ – in the graph, $(2, 1)$ and $(2, 6)$ would lie vertically above each other.

</details>

### Task 4: Line test

[Load task](?mode=graph&cur=sideways&xl=-3&show=0&_hide=1) Is the sideways parabola $x = 0.5y^2 - 2$ the graph of a function? Give a position that shows it.

<details>
<summary>Show solution</summary>

No. The line $x = 0$ meets the parabola twice, at $(0, -2)$ and $(0, 2)$: two values would be assigned to $0$. For $x < -2$ there is no point at all. [Show](?mode=graph&cur=sideways&xl=0)

</details>

### Task 5: Domain and range

[Load task](?mode=graph&cur=parab&xl=0&show=0&_hide=1) Find $D$ and $R$ for $f(x) = 0.5x^2 - 2$.

<details>
<summary>Show solution</summary>

Any number may be substituted: $D = \mathbb{R}$. The smallest function value is $f(0) = -2$, and there is no upper limit: $R = \{y \mid y \geq -2\}$. [Show](?mode=graph&cur=parab&xl=0)

</details>

### Task 6: Jumps

For a step function, you draw one filled and one hollow point at every jump. Explain why both points must not be filled.

<details>
<summary>Show solution</summary>

If both points at $x = 2$ were filled, i.e. $(2, 1)$ and $(2, 2)$, two values would be assigned to $2$ – the vertical line $x = 2$ would meet the graph twice. [Show](?mode=graph&cur=step&xl=2)

</details>

### Task 7: Line and absolute value

Sketch the graphs and decide using the line test: (a) the line on which all points with $x = 2$ lie, (b) the line on which all points with $y = 2$ lie, (c) $f(x) = |x|$.

<details>
<summary>Show solution</summary>

(a) **Not a function:** the line itself is vertical. The test line $x = 2$ meets it in infinitely many points; all values would be assigned to $2$. (b) **Function:** $x \mapsto 2$. Every $x$ is assigned exactly one value, namely $2$. (c) **Function:** the graph is a “V” with its tip at $(0, 0)$. Every vertical line meets it exactly once; e.g. $(-3, 3)$ and $(3, 3)$ lie side by side, not above each other. $D = \mathbb{R}$, $R = \{y \mid y \geq 0\}$.

</details>

## Ideas for the classroom

- **Use (curriculum link as a draft):** about grade 8, function and term: function as a unique relation, domain and range, graphs. Works well as an introduction (everyday relations in the arrow diagram) and for consolidation (line test, reversing).
- **Representations:** arrow diagram, table of values and graph are in sync – tapping or dragging changes all three. Elements with several arrows (number) or without an arrow (?) are marked in red. With `show=0`, the colouring and the verdict are hidden; students decide themselves.
- **Line test:** the strip below the graph shows how many intersections the vertical line has at every position visited. For graphs of functions, the simulation marks $D$ (teal, on the $x$-axis) and $R$ (purple, on the $y$-axis). The semicircle $f(x) = \sqrt{9 - x^2}$ anticipates square roots from year 9 and can also be looked at just as a graph. A vertical line and the absolute value function are not built in as graphs; task 7 covers them on paper.
- **Common stumbling blocks:**
  - “If two arrows arrive at the same element, it is not a function.” – Only the arrows leaving an element matter.
  - “A function needs a formula.” – Child $\mapsto$ birth month is a function too.
  - “A graph must be connected.” – The hyperbola and the step function are graphs of functions.
  - The line test is done horizontally instead of vertically.
