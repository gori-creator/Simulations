## What is it about?

A **system of linear equations** in two variables consists of two linear equations, e.g.

$$
\begin{aligned}
\text{I}\quad & y = 2x - 1\\
\text{II}\quad & y = -x + 5
\end{aligned}
$$

We are looking for all pairs of numbers $(x \mid y)$ that satisfy **both** equations. Each equation describes a **straight line**: all points on the line satisfy the equation. A point that satisfies both equations therefore lies on both lines – it is their **point of intersection**.

**Graphical method:**

1. Solve both equations for $y$ (slope–intercept form $y = mx + c$). $2x + y = 5$ becomes $y = -2x + 5$.
2. Draw both lines: mark the $y$-intercept $c$, then use the slope triangle “1 to the right, $m$ up”.
3. Read off the point of intersection, here $S(2 \mid 3)$.
4. **Check** by substituting into both equations: $2 \cdot 2 - 1 = 3$ ✓ and $-2 + 5 = 3$ ✓. So $L = \{(2 \mid 3)\}$.

**How many solutions are there?**

| Position of the lines | Sign | Solution set |
| --- | --- | --- |
| intersecting | different slopes | exactly one solution |
| parallel, distinct | same slope, different $c$ | no solution: $L = \{\,\}$ |
| identical | same slope, same $c$ | infinitely many solutions |

**Limits of the method:** if the point of intersection does not lie on grid points, you can only read it off approximately. Then an algebraic method helps, e.g. **equating**: $2x - 1 = -x + 5 \Rightarrow 3x = 6 \Rightarrow x = 2$.

## Try it

1. Drag the marked points: the $y$-intercept (at $x = 0$) and the point at $x = 1$. With **Display → Slope triangles** you see the slope. How does the point of intersection move?
2. Press **Check by substituting**.
3. Set up [parallel lines](?m1=0.5&t1=1&m2=0.5&t2=-2). Why is there no point of intersection?
4. What happens with [2x − y = 1 and −4x + 2y = −2](?form=general&a1=2&b1=-1&c1=1&a2=-4&b2=2&c2=-2)?
5. Read off the point of intersection of [y = x and y = −0.5x + 2](?m1=1&t1=0&m2=-0.5&t2=2). How accurately can you do this?
6. Compare two [phone plans](?form=tarif): from how many minutes of calls is plan A worth it?

## Exercises

### Exercise 1: Solve graphically

[Load exercise](?m1=1&t1=1&m2=-2&t2=7&_hide=1) Solve the system graphically and check:
$\text{I}\; y = x + 1$, $\text{II}\; y = -2x + 7$.

<details>
<summary>Show solution</summary>

The lines intersect at $S(2 \mid 3)$. Check: $2 + 1 = 3$ ✓ and $-2 \cdot 2 + 7 = 3$ ✓. $L = \{(2 \mid 3)\}$.

</details>

### Exercise 2: Solve for y first

[Load exercise](?form=general&a1=1&b1=1&c1=6&a2=2&b2=-1&c2=3&_hide=1) Solve $\text{I}\; x + y = 6$, $\text{II}\; 2x - y = 3$.

<details>
<summary>Show solution</summary>

$\text{I}\; y = -x + 6$ and $\text{II}\; y = 2x - 3$. Point of intersection $S(3 \mid 3)$; check: $3 + 3 = 6$ ✓, $2 \cdot 3 - 3 = 3$ ✓.

</details>

### Exercise 3: Number of solutions

Decide without drawing how many solutions the system has:
(a) $y = 3x - 2$ and $y = 3x + 1$, (b) $2x + 4y = 8$ and $x + 2y = 4$, (c) $y = 2x + 1$ and $y = -0.5x + 1$.

<details>
<summary>Show solution</summary>

(a) Same slope, different $y$-intercepts: parallel, **no** solution. [Show](?m1=3&t1=-2&m2=3&t2=1)

(b) Both give $y = -0.5x + 2$: identical, **infinitely many** solutions. [Show](?form=general&a1=2&b1=4&c1=8&a2=1&b2=2&c2=4)

(c) Different slopes: **exactly one** solution, namely $(0 \mid 1)$ – both lines have the same $y$-intercept. [Show](?m1=2&t1=1&m2=-0.5&t2=1)

</details>

### Exercise 4: Read off or calculate?

[Load exercise](?m1=1&t1=0&m2=-0.5&t2=2&_hide=1) Read off the point of intersection of $y = x$ and $y = -0.5x + 2$, then find it algebraically.

<details>
<summary>Show solution</summary>

Read off: about $S(1.3 \mid 1.3)$. Equating: $x = -0.5x + 2 \Rightarrow 1.5x = 2 \Rightarrow x = \frac{4}{3}$, so $S\left(\frac{4}{3} \mid \frac{4}{3}\right)$ – only approximately visible in the graph.

</details>

### Exercise 5: Phone plans

Plan A costs €10 a month and 5 cents per minute, plan B €4 a month and 11 cents per minute. Write down the cost $y$ (in €) as a function of the call time $x$ (in min) for both plans. From what call time on is plan A cheaper? [Load exercise](?form=tarif&_hide=1)

<details>
<summary>Show solution</summary>

$\text{A}\; y = 0.05x + 10$, $\text{B}\; y = 0.11x + 4$. Equating: $0.05x + 10 = 0.11x + 4 \Rightarrow 6 = 0.06x \Rightarrow x = 100$. At $100$ minutes both cost €15; for more than 100 minutes plan A is cheaper.

If plan B lowers its price per minute to 9 cents, the break-even point moves to $150$ minutes (€17.50). [Show](?form=tarif&p2=9)

</details>

### Exercise 6: Two numbers wanted

The sum of two numbers is $10$, their difference is $4$. Set up a system of equations and solve it graphically.

<details>
<summary>Show solution</summary>

$\text{I}\; x + y = 10$, $\text{II}\; x - y = 4$. The lines intersect at $(7 \mid 3)$: the numbers are $7$ and $3$. [Show](?form=general&a1=1&b1=1&c1=10&a2=1&b2=-1&c2=4)

</details>

## Ideas for the classroom

- **Use:** around grade 8 (systems of linear equations: setting up, solving graphically and algebraically, number of solutions). Linear functions are a prerequisite.
- **Representations:** slope–intercept form $y = mx + c$ (sliders and draggable points), general form $ax + by = c$ with integer coefficients (including vertical lines; the point on the $y$-axis shifts the line in parallel) and a comparison of phone plans with axes in minutes and euros. When switching between the slope–intercept form and the general form, the equations are converted as far as the sliders allow.
- **Exactness:** the simulation calculates with fractions. If the point of intersection does not have “nice” values, it shows the value read off and the exact value – a good reason for the algebraic methods. With `_hide=1` the results (position, solution set, calculation, check, plan) are hidden. The picture then shows no coordinates of the point of intersection, and the check is locked. The switch **Display → Show solution** (in links: `show=0`) does the same.
- **Common pitfalls:**
  - The point of intersection is checked with only one equation.
  - With parallel lines, the calculation leads to a contradiction such as $0 = 3$. This is wrongly read as “$x = 0$”. With identical lines, “no solution” is given.
  - The equation $ax + by = c$ is drawn without solving for $y$, e.g. with $c$ as the $y$-intercept.
- **Notation:** solution set as $L = \{(2 \mid 3)\}$; for identical lines $L = \{(x \mid y) \mid y = 2x - 1\}$.
