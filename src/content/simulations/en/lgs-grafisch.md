---
description: "Interactive simulation for solving systems of linear equations graphically: two lines, reading off the intersection, checking by substitution, parallel and identical lines and a tariff comparison."
---

## What is it about?

A **system of linear equations** in two variables consists of two linear equations, e.g.

$$
\begin{aligned}
\text{I}\quad & y = 2x - 1\\
\text{II}\quad & y = -x + 5
\end{aligned}
$$

We are looking for all pairs $(x, y)$ that satisfy **both** equations. Each equation describes a **line**: every point on the line satisfies the equation. A point that satisfies both equations therefore lies on both lines – it is their **point of intersection**.

**Graphical method:**

1. Rearrange both equations for $y$ (slope-intercept form $y = mx + c$). $2x + y = 5$ becomes $y = -2x + 5$.
2. Draw both lines: mark the $y$-intercept $c$, then use the slope triangle "1 to the right, $m$ up".
3. Read off the point of intersection, here $S(2, 3)$.
4. **Check** by substituting into both equations: $2 \cdot 2 - 1 = 3$ ✓ and $-2 + 5 = 3$ ✓. So the solution set is $\{(2, 3)\}$.

**How many solutions are there?**

| Position of the lines | Feature | Solution set |
| --- | --- | --- |
| intersect | different slopes | exactly one solution |
| parallel, distinct | same slope, different $c$ | no solution: $\{\,\}$ |
| identical | same slope, same $c$ | infinitely many solutions |

**Limits of the method:** If the intersection does not lie on grid points, it can only be read off approximately. Then an algebraic method helps, e.g. **equating** the two expressions for $y$: $2x - 1 = -x + 5 \Rightarrow 3x = 6 \Rightarrow x = 2$.

## Try it

1. Drag the marked points: the $y$-intercept and the tip of the slope triangle. How does the intersection move?
2. Press **Check by substituting**.
3. Show [parallel lines](?m1=0.5&t1=1&m2=0.5&t2=-2). Why is there no point of intersection?
4. What happens with [2x − y = 1 and −4x + 2y = −2](?form=general&a1=2&b1=-1&c1=1&a2=-4&b2=2&c2=-2)?
5. Read off the intersection of [y = x and y = −0.5x + 2](?m1=1&t1=0&m2=-0.5&t2=2). How accurate can you be?
6. Compare two [phone tariffs](?form=tarif): from how many minutes of calls on is tariff A cheaper?

## Tasks

### Task 1: Solve graphically

[Load task](?m1=1&t1=1&m2=-2&t2=7&_hide=1) Solve the system graphically and check your answer:
$\text{I}\; y = x + 1$, $\text{II}\; y = -2x + 7$.

<details>
<summary>Show solution</summary>

The lines intersect at $S(2, 3)$. Check: $2 + 1 = 3$ ✓ and $-2 \cdot 2 + 7 = 3$ ✓. Solution set $\{(2, 3)\}$.

</details>

### Task 2: Rearrange for y first

[Load task](?form=general&a1=1&b1=1&c1=6&a2=2&b2=-1&c2=3&_hide=1) Solve $\text{I}\; x + y = 6$, $\text{II}\; 2x - y = 3$.

<details>
<summary>Show solution</summary>

$\text{I}\; y = -x + 6$ and $\text{II}\; y = 2x - 3$. Point of intersection $S(3, 3)$; check: $3 + 3 = 6$ ✓, $2 \cdot 3 - 3 = 3$ ✓.

</details>

### Task 3: Number of solutions

Decide without drawing how many solutions the system has:
(a) $y = 3x - 2$ and $y = 3x + 1$, (b) $2x + 4y = 8$ and $x + 2y = 4$, (c) $y = 2x + 1$ and $y = -0.5x + 1$.

<details>
<summary>Show solution</summary>

(a) Same slope, different $y$-intercepts: parallel, **no** solution. [Show](?m1=3&t1=-2&m2=3&t2=1)

(b) Both give $y = -0.5x + 2$: identical, **infinitely many** solutions. [Show](?form=general&a1=2&b1=4&c1=8&a2=1&b2=2&c2=4)

(c) Different slopes: **exactly one** solution, namely $(0, 1)$ – both lines have the same $y$-intercept. [Show](?m1=2&t1=1&m2=-0.5&t2=1)

</details>

### Task 4: Read off or calculate?

[Load task](?m1=1&t1=0&m2=-0.5&t2=2&_hide=1) Read off the intersection of $y = x$ and $y = -0.5x + 2$, then find it algebraically.

<details>
<summary>Show solution</summary>

Read off: about $S(1.3, 1.3)$. Equating: $x = -0.5x + 2 \Rightarrow 1.5x = 2 \Rightarrow x = \frac{4}{3}$, so $S\left(\frac{4}{3}, \frac{4}{3}\right)$ – only approximately visible in the graph.

</details>

### Task 5: Phone tariffs

Tariff A costs €10 per month plus 5 ct per minute, tariff B €4 per month plus 11 ct per minute. For both tariffs, write the cost $y$ (in €) as a function of the call time $x$ (in min). From what call time on is tariff A cheaper? [Load task](?form=tarif&_hide=1)

<details>
<summary>Show solution</summary>

$\text{A}\; y = 0.05x + 10$, $\text{B}\; y = 0.11x + 4$. Equating: $0.05x + 10 = 0.11x + 4 \Rightarrow 6 = 0.06x \Rightarrow x = 100$. At 100 minutes both cost €15; above 100 minutes tariff A is cheaper.

If tariff B lowers its price to 9 ct per minute, the break-even point moves to 150 minutes (€17.50). [Show](?form=tarif&p2=9)

</details>

### Task 6: Two numbers

The sum of two numbers is $10$, their difference is $4$. Set up a system of equations and solve it graphically.

<details>
<summary>Show solution</summary>

$\text{I}\; x + y = 10$, $\text{II}\; x - y = 4$. The lines intersect at $(7, 3)$: the numbers are $7$ and $3$. [Show](?form=general&a1=1&b1=1&c1=10&a2=1&b2=-1&c2=4)

</details>

## Ideas for the classroom

- **Use:** Bavaria, Year 8, learning area 6 (systems of linear equations: setting up, solving graphically and algebraically, solvability and number of solutions). Linear functions (learning area 2) are a prerequisite.
- **Representations:** slope-intercept form $y = mx + c$ (sliders and draggable points), general form $ax + by = c$ with integer coefficients (including vertical lines; the point on the $y$-axis shifts the line parallel to itself) and a tariff comparison with axes in minutes and euros. When switching between slope-intercept form and general form, the equations are converted as far as the sliders allow.
- **Exactness:** The simulation calculates with fractions. If the intersection does not lie on "nice" values, it shows the approximate reading and the exact value – a good reason for algebraic methods. The results "Relative position", "Solution set", "Algebraically (equating)", "Check" and "Which tariff is cheaper?" can be hidden with `_hide=1`.
- **Common stumbling blocks:**
  - The intersection is checked in only one equation.
  - Parallel lines are mistaken for "solution $x = 0$"; for identical lines "no solution" is given.
  - The equation $ax + by = c$ is drawn without rearranging, e.g. $c$ is taken as the $y$-intercept.
- **Notation:** solution set $\{(2, 3)\}$; for identical lines all points $(x, y)$ with $y = 2x - 1$.
