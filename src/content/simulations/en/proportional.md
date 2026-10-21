---
description: "Interactive simulation for grades 6 to 8: direct and inverse proportion with apples on a scale, pumps filling a pool and a taxi with a base fare – picture, table with doubling arrows and graph in sync, with the rule of three step by step and a test “Is it proportional?”."
---

## What is it about?

In a **relation** (or *assignment*) each $x$ value goes with exactly one $y$ value. Two special relations come up all the time in everyday life. In the simulation every quantity has its own colour: $x$ blue, $y$ purple, the constant $k$ orange.

**Directly proportional** – “twice as much, twice the price”: doubling (tripling, …) $x$ doubles (triples, …) $y$. All quotients are equal (**constant quotient**):

$$
\frac{y}{x} = k \qquad\text{so}\qquad y = k \cdot x
$$

$k$ is called the **constant of proportionality**. The graph is a ray through the origin; the slope triangles “1 to the right, $k$ up” have the same shape everywhere.

**Inversely proportional** – “twice as many, half the time”: doubling $x$ halves $y$, tripling $x$ gives a third of $y$. All products are equal (**constant product**):

$$
x \cdot y = k \qquad\text{so}\qquad y = \frac{k}{x}
$$

The graph is a branch of a hyperbola. All rectangles under its points have area $k$ – they become narrower and taller or wider and flatter, but never bigger or smaller.

**The rule of three** uses exactly these properties: first work out one unit, then the wanted amount. Examples: apples ($4\,\text{kg}$ cost $€10$) and a pool that $6$ pumps fill in $10\,\text{h}$.

| | directly proportional | inversely proportional |
| --- | --- | --- |
| known | $4\,\text{kg} \;\hat{=}\; €10$ | $6\ \text{pumps} \;\hat{=}\; 10\,\text{h}$ |
| one unit | $1\,\text{kg} \;\hat{=}\; €2.50$ (both sides $: 4$) | $1\ \text{pump} \;\hat{=}\; 60\,\text{h}$ (left $: 6$, right $\cdot 6$) |
| wanted | $7\,\text{kg} \;\hat{=}\; €17.50$ (both sides $\cdot 7$) | $4\ \text{pumps} \;\hat{=}\; 15\,\text{h}$ (left $\cdot 4$, right $: 4$) |
| memory aid | **same direction** | **opposite direction** |

**Careful, trap:** not every “the more – the more” relation is proportional. A taxi costs a base fare of $€3$ plus $€2$ per km. $5\,\text{km}$ cost $€13$, but $10\,\text{km}$ cost only $€23$ – not $€26$. The quotients $13 : 5 = 2.6$ and $23 : 10 = 2.3$ differ, and the line $y = 2x + 3$ does not pass through the origin.

**How to check a table of values:** work out the quotients $y : x$ – all equal? Then directly proportional. Otherwise work out the products $x \cdot y$ – all equal? Then inversely proportional. Otherwise neither.

## Try it

1. [Apples on the scales](?kind=dir&kd=2.5&x0=4&x=7): drag $P$ along the graph or tap a column of the table. What always stays the same in the row $y : x$? Compare the small orange triangles.
2. Press “Double it”: the mass is doubled. What happens to the price on the scales, in the table (arrows below) and in the graph?
3. [Pumps at the pool](?kind=ind&ki=12&x0=3&x=4): press “Double it”. How fast does the pool fill now? Then drag $P$ and watch the rectangle: which number never changes?
4. [Six pumps, ten hours](?kind=ind&ki=60&x0=6&x=4): run “Rule of three step by step”. Why is there “$\cdot 6$” on the right when there is “$: 6$” on the left?
5. [Taxi trap](?kind=lin&kt=2&b=3&x0=5&x=10): press “Double it”. Where is the point “€26?” and where is the real fare? What do the dashed rays from the origin show?
6. [Test: sharing pizza](?kind=test&tab=b&show=0): tap your guess first, then “Check the table”. “Next table” takes you on – including two traps.

## Tasks

### Task 1: Buying apples

$4\,\text{kg}$ of apples cost $€10$. How much do $7\,\text{kg}$ cost? [Load task](?kind=dir&kd=2.5&x0=4&x=7&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$4\,\text{kg} \;\hat{=}\; €10 \;\xrightarrow{:4}\; 1\,\text{kg} \;\hat{=}\; €2.50 \;\xrightarrow{\cdot 7}\; 7\,\text{kg} \;\hat{=}\; €17.50$. Check: $17.50 : 7 = 2.5 = 10 : 4$. [Show the solution](?kind=dir&kd=2.5&x0=4&x=7)

</details>

### Task 2: Pumps at the pool

$6$ pumps of equal power fill a pool in $10$ hours. How long do $4$ pumps take, how long do $5$ pumps take? [Load task](?kind=ind&ki=60&x0=6&x=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

One pump takes $6 \cdot 10\,\text{h} = 60\,\text{h}$. Four pumps take $60\,\text{h} : 4 = 15\,\text{h}$, five pumps $60\,\text{h} : 5 = 12\,\text{h}$. Check: $6 \cdot 10 = 4 \cdot 15 = 5 \cdot 12 = 60$. [Show the solution](?kind=ind&ki=60&x0=6&x=4)

</details>

### Task 3: Doubling and tripling

$3$ pumps fill a pool in $4$ hours. How long do $6$ pumps take, how long do $9$ pumps take? Give the second answer in hours and minutes. [Load task](?kind=ind&ki=12&x0=3&x=9&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Twice as many pumps need half the time: $4\,\text{h} : 2 = 2\,\text{h}$. Three times as many pumps need a third: $4\,\text{h} : 3 = 1\tfrac{1}{3}\,\text{h} = 1\,\text{h}\;20\,\text{min}$. [Show the solution](?kind=ind&ki=12&x0=3&x=9)

</details>

### Task 4: Lisa and the taxi

A taxi costs a base fare of $€3$ plus $€2$ per km. Lisa says: “$5\,\text{km}$ cost $€13$, so $10\,\text{km}$ cost twice as much, that is $€26$.” Is she right? [Load task](?kind=lin&kt=2&b=3&x0=5&x=10&show=0&_hide=1)

<details>
<summary>Show solution</summary>

No. $10\,\text{km}$ cost $€3 + 10 \cdot €2 = €23$. The base fare is paid only once, so the fare is not proportional to the distance. The quotients show it too: $13 : 5 = 2.6$, but $23 : 10 = 2.3$. [Show the solution](?kind=lin&kt=2&b=3&x0=5&x=10)

</details>

### Task 5: Check three tables

Which table belongs to a directly proportional relation, which to an inversely proportional one, and which to neither? For the proportional ones, give the value of $k$.

(a) $(1 \mid 3),\ (2 \mid 6),\ (5 \mid 15)$ (b) $(2 \mid 12),\ (3 \mid 8),\ (6 \mid 4)$ (c) $(1 \mid 5),\ (2 \mid 7),\ (3 \mid 9)$

[Load task](?kind=test&tab=a&show=0&_hide=1)

<details>
<summary>Show solution</summary>

(a) Quotients $3 : 1 = 6 : 2 = 15 : 5 = 3$: directly proportional, $y = 3x$.
(b) Products $2 \cdot 12 = 3 \cdot 8 = 6 \cdot 4 = 24$: inversely proportional, $y = \frac{24}{x}$.
(c) Quotients $5,\ 3.5,\ 3$ and products $5,\ 14,\ 27$ – neither ($y = 2x + 3$, like the taxi).
[Show (a)](?kind=test&tab=a) · [Show (b)](?kind=test&tab=b) · [Show (c)](?kind=test&tab=c)

</details>

### Task 6: Getting there faster

For a distance of $120\,\text{km}$ you need exactly $3\,\text{h}$ at $40\,\tfrac{\text{km}}{\text{h}}$. Explain why speed and travel time are inversely proportional, and work out the travel time at $50\,\tfrac{\text{km}}{\text{h}}$ and at $90\,\tfrac{\text{km}}{\text{h}}$. [Load task](?kind=test&tab=f&show=0&_hide=1)

<details>
<summary>Show solution</summary>

The distance stays the same: speed times travel time is always $120\,\text{km}$, so $v \cdot t = 120$ (constant product). At $50\,\tfrac{\text{km}}{\text{h}}$: $t = 120 : 50 = 2.4\,\text{h} = 2\,\text{h}\;24\,\text{min}$. At $90\,\tfrac{\text{km}}{\text{h}}$: $t = 120 : 90 = 1\tfrac{1}{3}\,\text{h} = 1\,\text{h}\;20\,\text{min}$. [Show](?kind=test&tab=f)

</details>

## Ideas for the classroom

- **Use:** proportional and inversely proportional relations with the rule of three (grade 6 or 7, depending on school type and federal state) and their return in grade 8 in the Bavarian LehrplanPLUS for the Gymnasium: direct proportion with linear functions (Lernbereich 2), inverse proportion with hyperbolas (Lernbereich 3) – please check against the curriculum.
- **Three representations:** picture, table and graph react together. It can pay off to cover one of them and let students predict what “Double it” will do there.
- **Tasks from the picture:** with “Show the solution” off (`show=0`) unknown values appear as “?”. In the test, students can tap a guess first and then check it; “Next table” works well for a short round with the whole class.
- **Sorting task:** students collect everyday examples (fuel price, workers and working time, age and shoe size, phone contract with a base fee …) and sort them into the three cases before checking.
- **Model:** for the pumps only whole numbers make sense; the branch of the hyperbola connects the meaningful points. The age and height values are approximate averages.
- **Common stumbling blocks:**
  - “The more – the more” is taken to mean directly proportional (taxi, age and height).
  - In the inverse rule of three the right side is treated the same way as the left – the memory aid “opposite direction” helps here.
  - The graph of an inverse proportion is drawn as a falling straight line; the products show that this does not fit.
  - Only one quotient is worked out. To decide, you need all pairs of the table.
