---
description: "Interactive simulation of hyperbolas f(x) = a/(x − b) + c: asymptotes, domain and range, inverse proportion with rectangles of equal area and how the graph approaches its asymptotes."
---

## What is it about?

Two quantities are **inversely proportional** if their product is constant: $x \cdot y = a$, i.e. $y = \frac{a}{x}$ for $x \neq 0$. All **rectangles** between the axes and a point $P(x \mid y)$ on the graph have the same **area** $|a|$. The graph is a **hyperbola**; the simplest one is $y = \frac{1}{x}$.

Stretching by $a$ and shifting by $b$ horizontally and $c$ vertically gives

$$
f(x) = \frac{a}{x - b} + c
$$

- **Vertical asymptote** $x = b$ (pole): the denominator is zero, $f$ is undefined there and its values grow without bound near $b$.
- **Horizontal asymptote** $y = c$: for $x \to \pm\infty$ the graph gets arbitrarily close to $y = c$ without reaching it.
- **Domain** $D = \mathbb{R} \setminus \{b\}$, **range** $W = \mathbb{R} \setminus \{c\}$.
- Relative to the asymptotes, the branches lie in quadrants I and III for $a > 0$ and in II and IV for $a < 0$. Measured from the asymptotes, $(x - b)(y - c) = a$ still holds.
- Zero $x = b - \frac{a}{c}$ (if $c \neq 0$), $y$-intercept $f(0) = c - \frac{a}{b}$ (if $b \neq 0$).

## Try it

1. Drag the orange point $P$ along the graph: the green rectangle changes its shape, but its area stays $4$. [Load example](?a=4&u=1)
2. Make $a$ negative. Which quadrants do the branches lie in now? [Load example](?a=-3&u=1.5)
3. Click **First stretch, then shift** to watch the hyperbola emerge from $\frac{1}{x}$ step by step. [Load example](?a=2&b=3&c=-2&u=1)
4. Choose “x → ±∞” as table of values and let $P$ run outwards. How does the distance to $y = c$ change when $x - b$ becomes ten times as large? [Load example](?a=2&b=-1&c=1.5&u=3&lim=inf)
5. Let $P$ run to the pole. [Load example](?a=-2&b=1&c=-1&u=0.5&lim=pole)

## Tasks

### Task 1: Read off the equation

[Load task](?a=-2&b=2&c=1&u=1&info=0&_hide=1) Read off the asymptotes and find $a$ using a point on the graph. State the equation, $D$ and $W$.

<details>
<summary>Show solution</summary>

$b = 2$, $c = 1$; the point $P(3 \mid -1)$ gives $(3 - 2)(-1 - 1) = -2 = a$. So $f(x) = \frac{-2}{x - 2} + 1$, $D = \mathbb{R} \setminus \{2\}$, $W = \mathbb{R} \setminus \{1\}$. [Show in the simulation](?a=-2&b=2&c=1&u=1)

</details>

### Task 2: Intercepts

Find the points where the graph of $f(x) = \frac{3}{x - 2} + 1$ meets the axes.

<details>
<summary>Show solution</summary>

$\frac{3}{x-2} = -1 \Rightarrow x = -1$, so $N(-1 \mid 0)$; $f(0) = -1{.}5 + 1 = -0{.}5$, so $S_y(0 \mid -0{.}5)$. [Show in the simulation](?a=3&b=2&c=1&u=2)

</details>

### Task 3: Through two points

The hyperbola $f(x) = \frac{a}{x} + c$ passes through $A(1 \mid 5)$ and $B(4 \mid 2)$. Find $a$ and $c$.

<details>
<summary>Show solution</summary>

$a + c = 5$ and $\frac{a}{4} + c = 2$, so $\frac{3}{4}a = 3$: $a = 4$, $c = 1$. [Show in the simulation](?a=4&c=1&u=1)

</details>

## Notes for teachers

- **Use:** Grade 8 (Bavaria: elementary rational functions), starting from inverse proportion, then the effect of the parameters, domain, range and asymptotes. The form $\frac{a}{x-b} + c$ mirrors the vertex form of a parabola.
- **Limits** are treated informally with tables of values only.
- **Misconceptions:** the sign of $b$ ($\frac{a}{x+2}$ has its pole at $x = -2$); the two branches are **one** function with a gap in its domain; the pole is not a zero.
- **Task mode:** `info=0` together with *Share → hide results* hides the key features, table values and labels.
