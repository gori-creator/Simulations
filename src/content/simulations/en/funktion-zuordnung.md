---
description: "Interactive simulation on the concept of a function: relations as arrow diagram, table of values and graph in sync, checking uniqueness, reversing relations and the vertical line test on a circle, a sideways parabola, a step function and more."
---

## What is it about?

A **relation** assigns elements of a set $A$ to elements of a set $B$. It is a **function** if it is **unique**: every element of the domain $D$ is assigned **exactly one** element. The set of all assigned values is the **range**.

| Representation | It is a function if … |
| --- | --- |
| arrow diagram | **exactly one** arrow leaves **every** element on the left |
| table of values | there is **exactly one** value under each $x$ |
| graph | there is **at most one** point above each $x$ |

Several arrows **arriving** at the same element are fine: for $x \mapsto x^2$, both $-2$ and $2$ go to $4$. Reversing all arrows does not always give a function again.

**Vertical line test:** a graph belongs to a function exactly when every line parallel to the $y$-axis meets it at most once. A circle fails, a semicircle passes.

## Try it

1. Load [number ↦ square](?ex=square) and press **Reverse**. Which two different problems appear?
2. Reverse [x ↦ 2x + 1](?ex=lin) as well. Why is the reversed relation a function again?
3. Repair [your own relation](?ex=own): tap left, then right (or drag) to add or remove arrows.
4. Drag the vertical line across the [circle](?mode=graph&cur=circle&xl=1) and compare it with the [semicircle](?mode=graph&cur=semi&xl=1).
5. Press **Sweep the line test** for the [S-curve](?mode=graph&cur=scurve&xl=3).

## Tasks

### Task 1: Function or not?

(a) student ↦ height (measured today), (b) height ↦ student, (c) number ↦ its divisors.

<details>
<summary>Show solution</summary>

(a) Function. (b) Not a function: two students can be equally tall. (c) Not a function: $6$ has the divisors $1$, $2$, $3$, $6$.

</details>

### Task 2: Line test

[Load task](?mode=graph&cur=sideways&xl=-3&show=0&_hide=1) Is the sideways parabola $x = 0.5y^2 - 2$ the graph of a function?

<details>
<summary>Show solution</summary>

No: the line $x = 0$ meets it at $(0, -2)$ and $(0, 2)$. [Show](?mode=graph&cur=sideways&xl=0)

</details>

### Task 3: Domain and range

[Load task](?mode=graph&cur=parab&xl=0&show=0&_hide=1) Find $D$ and the range of $f(x) = 0.5x^2 - 2$.

<details>
<summary>Show solution</summary>

$D = \mathbb{R}$, range $\{y \mid y \geq -2\}$, since the smallest value is $f(0) = -2$.

</details>

## Notes for teachers

- **Use:** introducing functions as unique relations, domain and range, the vertical line test.
- `show=0` hides the colouring and the verdict so that students decide themselves.
- **Misconceptions:** “two arrows arriving at one element are not allowed”; “a function needs a formula”; “a graph must be connected”; doing the line test horizontally.
