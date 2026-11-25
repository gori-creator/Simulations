## What is it about?

A workshop builds tables ($x$) and chairs ($y$). A table brings in a profit of €30, a chair €20. But wood, working time and storage space are limited. How many tables and chairs should the workshop build to make the profit as large as possible? Questions like this are solved by **linear programming**.

### 1. Setting up the constraints

Each limit becomes a linear inequality:

| Constraint | Inequality |
| --- | --- |
| wood: table 2 units, chair 1, at most 16 | $2x + y \le 16$ |
| working time: table 1 h, chair 2 h, at most 14 h | $x + 2y \le 14$ |
| storage: at most 6 chairs | $y \le 6$ |
| no negative quantities | $x \ge 0,\; y \ge 0$ |

### 2. Drawing the feasible polygon

Each inequality describes a **half-plane** whose boundary is a line. All points that satisfy **every** constraint make up the **feasible polygon**. In the simulation it is shaded green.

### 3. Objective function and objective line

The profit is $z = 30x + 20y$. For a fixed value of $z$ this is a line, the **objective line**. All objective lines are parallel to each other, and the further you slide one in the direction of the arrow, the larger $z$ becomes.

Slide the objective line until it **only just touches** the polygon. That point is the **optimum**. It always lies at a **vertex** of the polygon. If the objective line is parallel to an edge, every point of that edge is optimal.

In the example the best vertex is $(6 \mid 4)$: $6$ tables and $4$ chairs give $z = 30 \cdot 6 + 20 \cdot 4 = €260$ profit.

### Checking the vertices

Instead of sliding, you can substitute every vertex into the objective function and pick the best:

| Vertex | $(0 \mid 0)$ | $(8 \mid 0)$ | $(6 \mid 4)$ | $(2 \mid 6)$ | $(0 \mid 6)$ |
| --- | --- | --- | --- | --- | --- |
| $z$ | $0$ | $240$ | $260$ | $180$ | $120$ |

### Minimising and whole numbers

In cost problems you look for the **minimum**. The constraints then often say "at least …" ($\ge$), and the region is open upwards. If only **whole quantities** are allowed, a vertex with fractions is not permitted. Then you look for the best lattice point inside the polygon.

## Try it

- [Tables and chairs](?sz=werkstatt&p=30&q=20&zl=0.4): Slide the objective line outwards. Where does it last leave the polygon?
- [Objective line parallel to an edge](?sz=werkstatt&p=20&q=10&zl=0.8&sol=1): What is different here?
- [Feed mix](?sz=futter&p=3&q=2&zl=0.3): Here the cost should be as small as possible.
- [Whole-number solution](?sz=eigen&a1=2&b1=3&c1=12&a2=3&b2=1&c2=11&p=4&q=5&goal=max&int=1&sol=1): Compare the best vertex with the best lattice point.

## Exercises

**1. Different profits.** A table now brings in €40 and a chair €10. Which vertex is optimal now? [Load exercise](?sz=werkstatt&p=40&q=10&zl=0.5&_hide=1)

<details><summary>Show solution</summary>

$(8 \mid 0)$ with $z = €320$. It pays to build only tables.

</details>

**2. Working out a vertex.** Find the intersection of the lines $2x + y = 16$ and $x + 2y = 14$.

<details><summary>Show solution</summary>

From the first equation, $y = 16 - 2x$. Substituting into the second gives $x + 32 - 4x = 14$, so $x = 6$ and $y = 4$.

</details>

**3. Feed mix.** Bag A costs €3 and bag B costs €2. Which mix is cheapest? [Load exercise](?sz=futter&p=3&q=2&zl=0.3&_hide=1)

<details><summary>Show solution</summary>

$2$ bags of A and $4$ bags of B cost $3 \cdot 2 + 2 \cdot 4 = €14$.

</details>
