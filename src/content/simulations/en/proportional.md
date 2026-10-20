---
description: "Interactive simulation for grades 6 to 8: direct and inverse proportion with apples on a scale, pumps filling a pool and a taxi with a base fare – picture, table with doubling arrows and graph in sync, with the rule of three step by step and a test “Is it proportional?”."
---

## What is it about?

In the simulation every quantity has its own colour: $x$ blue, $y$ purple, the constant $k$ orange.

**Directly proportional** – “twice as much, twice the price”: doubling (tripling, …) $x$ doubles (triples, …) $y$. All quotients are equal:

$$
\frac{y}{x} = k \qquad\text{so}\qquad y = k \cdot x
$$

The graph is a ray through the origin. *Example:* $4\,\text{kg}$ of apples cost $€10$, so $1\,\text{kg}$ costs $€2.50$ and $7\,\text{kg}$ cost $€17.50$.

**Inversely proportional** – “twice as many, half the time”: doubling $x$ halves $y$. All products are equal:

$$
x \cdot y = k \qquad\text{so}\qquad y = \frac{k}{x}
$$

The graph is a branch of a hyperbola, and all rectangles under its points have area $k$. *Example:* $6$ pumps fill a pool in $10\,\text{h}$; one pump would need $60\,\text{h}$, four pumps need $15\,\text{h}$.

**Rule of three:** go to one unit first, then to the wanted amount. Direct: the same operation on both sides (*same direction*). Inverse: the opposite operation on the right (*opposite direction*).

**Careful:** a taxi costs a base fare of $€3$ plus $€2$ per km. $5\,\text{km}$ cost $€13$, but $10\,\text{km}$ cost $€23$, not $€26$. The quotients $2.6$ and $2.3$ differ – not proportional.

## Try it

1. [Apples](?kind=dir&kd=2.5&x0=4&x=7): drag $P$ or tap a column of the table. What stays the same in the row $y : x$?
2. Press “Double it” for apples, [pumps](?kind=ind&ki=12&x0=3&x=4) and the [taxi](?kind=lin&kt=2&b=3&x0=5&x=10). What happens to $y$ each time?
3. [Six pumps, ten hours](?kind=ind&ki=60&x0=6&x=4): run “Rule of three step by step”. Why is there “$\cdot 6$” on the right when there is “$: 6$” on the left?
4. [Test](?kind=test&tab=b&show=0): tap your guess first, then “Check the table”. “Next table” brings two traps as well.

## Tasks

### Task 1: Apples

$4\,\text{kg}$ of apples cost $€10$. How much do $7\,\text{kg}$ cost? [Load task](?kind=dir&kd=2.5&x0=4&x=7&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$1\,\text{kg}$ costs $€10 : 4 = €2.50$, so $7\,\text{kg}$ cost $7 \cdot €2.50 = €17.50$. [Show](?kind=dir&kd=2.5&x0=4&x=7)

</details>

### Task 2: Pumps

$6$ pumps fill a pool in $10$ hours. How long do $4$ pumps take? [Load task](?kind=ind&ki=60&x0=6&x=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

One pump takes $6 \cdot 10\,\text{h} = 60\,\text{h}$, four pumps $60\,\text{h} : 4 = 15\,\text{h}$. Check: $6 \cdot 10 = 4 \cdot 15 = 60$. [Show](?kind=ind&ki=60&x0=6&x=4)

</details>

### Task 3: Check the tables

(a) $(1 \mid 3), (2 \mid 6), (5 \mid 15)$ (b) $(2 \mid 12), (3 \mid 8), (6 \mid 4)$ (c) $(1 \mid 5), (2 \mid 7), (3 \mid 9)$ [Load task](?kind=test&tab=a&show=0&_hide=1)

<details>
<summary>Show solution</summary>

(a) all quotients $3$: directly proportional, $y = 3x$. (b) all products $24$: inversely proportional, $y = \frac{24}{x}$. (c) quotients $5, 3.5, 3$ and products $5, 14, 27$: neither. [Show (c)](?kind=test&tab=c)

</details>

## Ideas for the classroom

- Picture, table and graph react together; cover one of them and let students predict what “Double it” will do there.
- With “Show the solution” off (`show=0`) unknown values appear as “?” – handy for tasks.
- **Common stumbling blocks:**
  - “The more – the more” is taken to mean directly proportional (taxi, age and height).
  - In the inverse rule of three both sides are treated the same way.
  - Only one quotient is checked instead of all pairs.
