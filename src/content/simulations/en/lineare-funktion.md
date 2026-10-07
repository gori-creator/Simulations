---
description: Interactive simulation of the linear function f(x) = mx + b – with slope triangle, zero, a second line and exercises.
---

## What is it about?

A **linear function** has the equation

$$
f(x) = m \cdot x + b
$$

Its graph is always a **straight line**.

- The **y-intercept** $b$ tells you where the line crosses the y-axis: at the point $(0, b)$.
- The **slope** $m$ tells you how steep the line is: go **1 to the right** and the line goes **$m$ up** – or down if $m$ is negative. This is what the **slope triangle** shows.

If you know two points $P_1(x_1, y_1)$ and $P_2(x_2, y_2)$ on the line, the slope is

$$
m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{\Delta y}{\Delta x}
$$

The **zero** (x-intercept) is where the line crosses the x-axis. Set $f(x) = 0$: $x_0 = -\frac{b}{m}$ (for $m \neq 0$).

## Explore

1. Change only $b$. What happens to the line – and what stays the same? [Load example](?m=0.5&b=-3)
2. Change only $m$ and watch the slope triangle. What happens for $m = 0$? [Load example](?m=0&b=2)
3. Drag the highlighted points directly: the point on the y-axis and the tip of the slope triangle.
4. Turn on the second line $g$. When do two lines not intersect? [Parallel lines](?m=0.5&b=1&second=1&m2=0.5&b2=-2)

## Exercises

### Exercise 1: Read off the equation

[Load exercise](?m=-1.5&b=2&_hide=1) Read the slope and the y-intercept from the graph and write down the equation. The results on the right are hidden – reveal them only to check.

<details>
<summary>Show solution</summary>

The line crosses the y-axis at 2, so $b = 2$. Going 1 to the right, it goes 1.5 down, so $m = -1.5$:

$$f(x) = -1.5x + 2$$

</details>

### Exercise 2: Line through two points

Find the equation of the line through $A(-2, -1)$ and $B(2, 5)$. Then set it up in the simulation and check that it passes through both points.

<details>
<summary>Show solution</summary>

$$m = \frac{5 - (-1)}{2 - (-2)} = \frac{6}{4} = 1.5$$

Substituting $A$: $-1 = 1.5 \cdot (-2) + b$, so $b = 2$ and $f(x) = 1.5x + 2$. [Show in simulation](?m=1.5&b=2)

</details>

### Exercise 3: Phone tariff (modelling)

A phone tariff costs a basic fee of €5 per month plus €2 per gigabyte. A second tariff costs €8 plus €1 per gigabyte. From how many gigabytes on is the second tariff cheaper?

<details>
<summary>Show solution</summary>

$f(x) = 2x + 5$ and $g(x) = x + 8$. Intersection: $2x + 5 = x + 8 \Rightarrow x = 3$. For more than 3 GB the second tariff is cheaper. [Show both tariffs](?m=2&b=5&second=1&m2=1&b2=8)

</details>

## Notes for teachers

- **Use:** introduction in grade 7/8 or revision before quadratic functions. On the projector, let the class predict what will happen before moving a slider.
- **Common misconceptions:** slope and intercept are confused; the slope triangle is drawn "upwards" for negative slopes; the constant function ($m = 0$) is not recognised as linear.
- **Exercise mode:** **Share → Hide results** creates a link or QR code with the equation, zero and intersection hidden – ideal for reading-off exercises. **Lock controls** prevents accidental changes.
