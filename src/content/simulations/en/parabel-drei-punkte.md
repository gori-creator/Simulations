## What is it about?

Two points determine a line. A **parabola** $y = ax^2 + bx + c$ needs **three points**, because three numbers $a$, $b$, $c$ are unknown. Substituting each point $P_i(x_i \mid y_i)$ gives one equation, so you get a **system of linear equations** in $a$, $b$, $c$:

$$
x_i^2\,a + x_i\,b + c = y_i \qquad (i = 1, 2, 3)
$$

It is solved by **elimination**. First eliminate $c$ ($\text{II} - \text{I}$, $\text{III} - \text{I}$). Then eliminate $b$, which gives $a$. Finally back-substitute to get $b$ and $c$. If one point lies on the $y$-axis, $c$ can be read off at once.

Shortcuts: if one point is the **vertex**, use $y = a(x - x_S)^2 + y_S$. If two points are **zeros**, use $y = a(x - x_1)(x - x_2)$.

Special cases: two points with the same $x$ but different $y$ give a contradiction, so no function passes through them. If two points coincide, infinitely many parabolas pass through them. Three points on a line give $a = 0$: a line, not a parabola.

## Try it

1. Drag the points: the parabola always passes through all three. [Load example](?x1=-1&y1=1.5&x2=2&y2=3&x3=4&y3=-1)
2. Click **Step-by-step solution** and see where the coloured numbers come from.
3. Load the points $(0 \mid 0)$, $(1 \mid 1)$ and $(2 \mid 4)$. Which parabola is it? Why does equation I only say “c = 0”? [Load example](?x1=0&y1=0&x2=1&y2=1&x3=2&y3=4)
4. Points on a line: drag $P_2$ slightly up and back again. What happens to $a$? [Load example](?x1=-2&y1=-3&x2=0&y2=1&x3=2&y3=5)
5. Same $x$-value: why is there no solution? Which equation does II − I give? [Load example](?x1=1&y1=3&x2=1&y2=-1.5&x3=3.5&y3=1)
6. Put two points on top of each other. How many parabolas are there now? [Load example](?x1=1&y1=2&x2=1&y2=2&x3=3&y3=-1)
7. Choose the method **Vertex form**: here $P_2$ is the vertex. Compare the length of the working with the system of equations. [Load example](?way=vertex&x1=-1&y1=2&x2=1&y2=-2&x3=2&y3=-1)
8. Choose the application **Path of a thrown ball** and throw the ball. Where does it land? [Load example](?scene=ball&x1=-5&y1=1&x2=-3&y2=4&x3=3&y3=1)

## Tasks

### Task 1

Find the parabola through $A(0 \mid 1)$, $B(1 \mid 0)$, $C(2 \mid 3)$. [Load task](?x1=0&y1=1&x2=1&y2=0&x3=2&y3=3&calc=0&_hide=1)

<details>
<summary>Show solution</summary>

$c = 1$. Then $a + b = -1$ and $4a + 2b = 2$, so $a = 2$ and $b = -3$: $f(x) = 2x^2 - 3x + 1$. [Show](?x1=0&y1=1&x2=1&y2=0&x3=2&y3=3)

</details>

### Task 2

A parabola has its vertex at $S(2 \mid -3)$ and passes through $P(4 \mid 1)$. Find its equation in vertex form and in general form.

<details>
<summary>Show solution</summary>

$y = a(x - 2)^2 - 3$. Substituting $P$ gives $1 = a \cdot 2^2 - 3$, so $a = 1$: $f(x) = (x - 2)^2 - 3 = x^2 - 4x + 1$. [Show](?way=vertex&x1=0&y1=1&x2=2&y2=-3&x3=4&y3=1)

</details>

### Task 3

A parabola has the zeros $-2$ and $4$ and passes through $(2 \mid 4)$. Find its equation.

<details>
<summary>Show solution</summary>

$y = a(x + 2)(x - 4)$. Substituting gives $4 = a \cdot 4 \cdot (-2) = -8a$, so $a = -\frac{1}{2}$: $f(x) = -\frac{1}{2}x^2 + x + 4$. [Show](?way=roots&x1=-2&y1=0&x2=4&y2=0&x3=2&y3=4)

</details>

### Task 4

Is there a parabola through $(-1 \mid -1)$, $(1 \mid 3)$, $(2.5 \mid 6)$? Use the system of equations to explain.

<details>
<summary>Show solution</summary>

$\text{II} - \text{I}$: $2b = 4$, so $b = 2$. $\text{III} - \text{II}$: $5.25a + 1.5b = 3$, so $a = 0$, and then $c = 1$. The points lie on the line $y = 2x + 1$, so no parabola passes through them. [Show](?x1=-1&y1=-1&x2=1&y2=3&x3=2.5&y3=6)

</details>

### Task 5

Three positions of a thrown ball were measured (coordinates in m): $(-5 \mid 1)$, $(-3 \mid 4)$, $(3 \mid 1)$. Find the parabola, the greatest height and the landing point.

<details>
<summary>Show solution</summary>

$(-5 \mid 1)$ and $(3 \mid 1)$ are at the same height, so the vertex lies halfway at $x = -1$: $y = a(x + 1)^2 + y_S$. Then $16a + y_S = 1$ and $4a + y_S = 4$, so $a = -\frac{1}{4}$ and $y_S = 5$: $f(x) = -\frac{1}{4}x^2 - \frac{1}{2}x + 4.75$, greatest height $5\,\text{m}$. Landing: $(x + 1)^2 = 20$, so $x = -1 + \sqrt{20} \approx 3.47$. [Show](?scene=ball&x1=-5&y1=1&x2=-3&y2=4&x3=3&y3=1)

</details>

### Task 6

A parabolic bridge arch is $10\,\text{m}$ wide at the bottom and $5\,\text{m}$ high. How high is it $3\,\text{m}$ from the centre?

<details>
<summary>Show solution</summary>

The points are $(-5 \mid 0)$, $(0 \mid 5)$ and $(5 \mid 0)$, which give $f(x) = -\frac{1}{5}x^2 + 5$. Then $f(3) = 3.2$, so the arch is $3.2\,\text{m}$ high there. [Show](?scene=bridge&x1=-5&y1=0&x2=0&y2=5&x3=5&y3=0)

</details>

## Ideas for the classroom

- About grade 9, quadratic functions combined with systems of linear equations. How far systems with three unknowns are required in year 9 should be checked against your own curriculum and textbook. Good for consolidation and modelling (thrown ball, bridge arch).
- The working uses II − I and III − I. Other orders are just as correct; comparing them with students' solutions is worthwhile.
- Points snap to a 0.5 grid, so the working stays exact. Non-terminating results are shown as reduced fractions.
- Common mistakes: treating $x$, $y$ as the unknowns, sign errors when squaring negative numbers, and believing that three points always determine a parabola.
- Task mode: `calc=0` together with **Share → hide results** hides the working, the equation and the vertex.
