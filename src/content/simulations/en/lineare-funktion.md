---
description: Interactive simulation of the linear function f(x) = mx + c – with slope triangle, zero, a second line and exercises.
---

## What is it about?

A **linear function** has the equation

$$
f(x) = m \cdot x + c
$$

Its graph is always a **straight line**.

- The **y-intercept** $c$ tells you where the line crosses the y-axis: at the point $(0, c)$.
- The **slope** $m$ tells you how steep the line is: go **1 to the right** and the line goes **$m$ up** – or down if $m$ is negative. This is what the **slope triangle** shows.

If you know two points $P_1(x_1, y_1)$ and $P_2(x_2, y_2)$ on the line, the slope is

$$
m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{\Delta y}{\Delta x}
$$

The **zero** (x-intercept) is where the line crosses the x-axis. Set $f(x) = 0$: $x_0 = -\frac{c}{m}$ (for $m \neq 0$). For $m = 0$ the line is horizontal: if $c \neq 0$ there is no zero, if $c = 0$ the line lies on the x-axis.

A **vertical** line is not the graph of a function, because one $x$-value belongs to infinitely many $y$-values. That is why you cannot set one up in the simulation.

## Explore

1. Change only $c$. What happens to the line – and what stays the same? [Load example](?m=0.5&b=-3)
2. Change only $m$ and watch the slope triangle. What happens for $m = 0$? [Load example](?m=0&b=2)
3. Drag the highlighted points directly in the coordinate system: the point on the y-axis and the tip of the slope triangle.
4. Turn on the second line $g$. When do two lines not intersect? [Parallel lines](?m=0.5&b=1&second=1&m2=0.5&b2=-2)

## Exercises

### Exercise 1: Read off the equation

[Load exercise](?m=-1.5&b=2&_hide=1) Read the slope and the y-intercept from the graph and write down the equation. The results on the right are hidden – reveal them only to check.

<details>
<summary>Show solution</summary>

The line crosses the y-axis at 2, so $c = 2$. Going 1 to the right, it goes 1.5 down, so $m = -1.5$:

$$f(x) = -1.5x + 2$$

</details>

### Exercise 2: Line through two points

Find the equation of the line through $A(-2, -1)$ and $B(2, 5)$. Then set it up in the simulation and check that it passes through both points.

<details>
<summary>Show solution</summary>

$$m = \frac{5 - (-1)}{2 - (-2)} = \frac{6}{4} = 1.5$$

Substituting $A$: $-1 = 1.5 \cdot (-2) + c$, so $c = 2$ and $f(x) = 1.5x + 2$. [Show in simulation](?m=1.5&b=2)

</details>

### Exercise 3: Find the zero

Calculate the zero of $f(x) = 0.5x - 2$ and check it in the simulation.

<details>
<summary>Show solution</summary>

$0 = 0.5x - 2 \;\Rightarrow\; x = 4$. The line crosses the x-axis at $N(4, 0)$. [Show in simulation](?m=0.5&b=-2)

</details>

### Exercise 4: Perpendicular lines

Set up $f(x) = 2x - 1$ and turn on the second line. Find a line $g$ that crosses $f$ at a **right angle**. What do you notice about the two slopes?

<details>
<summary>Show solution</summary>

For example $g(x) = -0.5x + 2$. For perpendicular lines $m \cdot m_2 = -1$, so $m_2 = -\frac{1}{2}$. The y-intercept of $g$ can be anything. [Show in simulation](?m=2&b=-1&second=1&m2=-0.5&b2=2)

</details>

### Exercise 5: Phone tariff (modelling)

A phone tariff costs a basic fee of €5 per month plus €2 per gigabyte used.

1. Write down the equation for the monthly cost ($x$: gigabytes, $f(x)$: cost in €).
2. How much does a month with 3 GB cost?
3. A second tariff costs €8 basic fee plus €1 per GB. From how many GB on is it cheaper?

<details>
<summary>Show solution</summary>

1. $f(x) = 2x + 5$
2. $f(3) = 2 \cdot 3 + 5 = 11$, so €11.
3. $g(x) = x + 8$. Intersection: $2x + 5 = x + 8 \Rightarrow x = 3$. At 3 GB both tariffs cost €11. For more than 3 GB the second tariff is cheaper. [Show both tariffs](?m=2&b=5&second=1&m2=1&b2=8)

</details>

## Ideas for the classroom

- **Use:** introduction in grade 7/8 or revision before quadratic functions. On the projector, let the class predict what will happen before moving a slider.
- **Notation:** The simulation writes $f(x) = mx + c$ (in German $f(x) = mx + t$, as in the Bavarian curriculum). If your textbook uses $b$ for the y-intercept, point this out briefly.
- **Common stumbling blocks:**
  - Slope and y-intercept are confused.
  - For a negative slope, the slope triangle is drawn "upwards".
  - The constant function ($m = 0$) is not recognised as a linear function.
  - A graph that looks flatter is taken to have a smaller slope, although only the axes are scaled differently. The simulation uses equal units on both axes.
- **Exercise mode:** **Share → Hide results** creates a link or QR code with the equation, zero and intersection hidden – ideal for reading-off exercises. **Lock controls** prevents accidental changes.
- **Differentiation:** Faster learners use the second line to explore parallel and perpendicular lines or solve systems of linear equations graphically.
