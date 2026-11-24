## What is it about?

The graph of a **quadratic function** is a **parabola**. The simplest one is the **standard parabola** $y = x^2$ with its vertex at the origin.

In **vertex form** you can read off the vertex $S(d, e)$ directly:

$$
f(x) = a\,(x - d)^2 + e
$$

- $a$ determines the **opening** and the **shape**: for $a > 0$ the parabola opens upwards, for $a < 0$ downwards. For $|a| > 1$ it is **stretched** (narrower), for $|a| < 1$ **compressed** (wider).
- $d$ shifts the parabola **horizontally**. Watch the sign: $(x - 3)^2$ shifts it 3 to the **right**.
- $e$ shifts the parabola **vertically**.

Expanding the brackets gives the **standard form**:

$$
f(x) = a x^2 + b x + c \quad\text{with}\quad b = -2ad,\;\; c = ad^2 + e
$$

The other way round (completing the square): $d = -\frac{b}{2a}$ and $e = c - \frac{b^2}{4a}$.

### Zeros

The **discriminant** $D = b^2 - 4ac$ tells you whether and where the parabola crosses the x-axis:

| Discriminant | Number of zeros |
| --- | --- |
| $D > 0$ | two zeros |
| $D = 0$ | one (double) zero – the vertex lies on the x-axis |
| $D < 0$ | no zeros |

The quadratic formula gives the zeros themselves:

$$
x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### Parabola and line

Where does the parabola $f(x) = ax^2 + bx + c$ meet the line $y = mx + n$? Setting them equal gives the quadratic equation $ax^2 + (b - m)x + (c - n) = 0$. Its discriminant decides: positive – two points of intersection (**secant**), zero – one point of contact (**tangent**), negative – no common point (the line **misses** the parabola). Example: $x^2 = x + 2$ leads to $x^2 - x - 2 = 0$ with $x_1 = -1$, $x_2 = 2$.

## Explore

1. Change only $a$ – also to negative values. Compare with the dashed standard parabola. [a = 2](?a=2) [a = −0.5](?a=-0.5)
2. Set $d = 3$. Why is there a **minus** in the equation? [Load example](?d=3)
3. Drag the vertex $S$ up and down. When are there two zeros, one zero or none?
4. Switch on the **stretch triangle**: from the vertex you go 1 to the right and $a$ up. Drag the hollow point to the right of the vertex up or down – this changes $a$. [Load example](?a=1.5&d=-1&e=-2&step=1)
5. Switch to **standard form** at the top. The parabola stays the same – only the representation changes.
6. **Parabola and line:** drag the two points of the line. Set up a tangent: when is there exactly one common point? [Secant](?mode=line&a=1&d=0&e=0&m=1&n=2) · [Tangent](?mode=line&a=1&d=0&e=0&m=2&n=-1)
7. **Throwing a ball:** tap “Throw” and then change the highest point $(d, e)$ and $a$. How far does the ball fly? [Throw](?mode=throw&a=-0.1&d=6&e=5)
8. **Game:** read off the vertex and the stretch factor of the orange parabola and copy it. [Match the parabola](?mode=match&q=1&a=1&d=0&e=0)

## Exercises

### Exercise 1: Read off the vertex form

[Load exercise](?a=0.5&d=-2&e=-4.5&_hide=1) Read off the vertex and find $a$ with the stretch triangle. Write down the equation and calculate the zeros.

<details>
<summary>Show solution</summary>

Vertex $S(-2, -4.5)$. Going 1 to the right from the vertex, the graph goes up by 0.5, so $a = 0.5$:

$$f(x) = 0.5\,(x + 2)^2 - 4.5$$

Zeros: $0.5\,(x+2)^2 = 4.5 \Rightarrow (x+2)^2 = 9 \Rightarrow x + 2 = \pm 3$, so $x_1 = -5$ and $x_2 = 1$.

</details>

### Exercise 2: Converting

Write $f(x) = 2\,(x - 1)^2 - 8$ in standard form and find the zeros. Check with the simulation.

<details>
<summary>Show solution</summary>

$2\,(x^2 - 2x + 1) - 8 = 2x^2 - 4x - 6$. Zeros: $x^2 - 2x - 3 = 0 \Rightarrow x_1 = -1,\; x_2 = 3$. [Show in simulation](?form=allgemein&a=2&b=-4&c=-6)

</details>

### Exercise 3: How many zeros?

Decide without calculating the zeros how many zeros the functions have:

1. $f(x) = x^2 + 2x + 3$
2. $g(x) = -x^2 + 4x - 4$
3. $h(x) = 0.5x^2 - 2$

<details>
<summary>Show solution</summary>

1. $D = 4 - 12 = -8 < 0$: no zeros. [Show](?form=allgemein&b=2&c=3)
2. $D = 16 - 16 = 0$: one double zero at $x = 2$. [Show](?form=allgemein&a=-1&b=4&c=-4)
3. $D = 0 + 4 = 4 > 0$: two zeros ($x = \pm 2$). [Show](?form=allgemein&a=0.5&c=-2)

</details>

### Exercise 4: Throwing a ball (modelling)

The path of a ball is described by $h(x) = -0.2\,(x - 5)^2 + 6$ ($x$: distance in m, $h$: height in m). How high does the ball fly at most, and how far does it fly? The view “Throwing a ball” is good for checking.

<details>
<summary>Show solution</summary>

The vertex $S(5, 6)$ is the highest point: a height of 6 m after 5 m. Landing: $0.2\,(x-5)^2 = 6 \Rightarrow (x-5)^2 = 30 \Rightarrow x = 5 + \sqrt{30} \approx 10.5$ m. [Show in simulation](?mode=throw&a=-0.2&d=5&e=6)

</details>

### Exercise 5: A line through the parabola

Calculate the points of intersection of the parabola $f(x) = x^2$ with the line $y = x + 2$. For which $n$ is $y = 2x + n$ a tangent? [Load exercise](?mode=line&a=1&d=0&e=0&m=1&n=2&zeros=0&_hide=1)

<details>
<summary>Show solution</summary>

$x^2 = x + 2 \iff x^2 - x - 2 = 0 \iff (x + 1)(x - 2) = 0$: $S_1(-1, 1)$, $S_2(2, 4)$. Tangent: $x^2 - 2x - n = 0$ needs the discriminant $4 + 4n = 0$, so $n = -1$; point of contact $(1, 1)$. [Show the tangent](?mode=line&a=1&d=0&e=0&m=2&n=-1)

</details>

## Ideas for the classroom

- **Use:** introducing the vertex form (grade 9), linking the different forms, preparing the quadratic formula.
- **Throwing a ball as a starter:** first let the ball be thrown, then ask: what do $d$, $e$ and the sign of $a$ mean? The highest point and the landing point appear in the picture when **Zeros** is switched on.
- **Game “Match the parabola”:** the parabolas are numbered; the same number means the same parabola. Good practice for reading the stretch factor via “1 to the right, $a$ up”.
- **Common stumbling blocks:**
  - The sign of $d$ is misread: $(x + 2)^2$ shifts to the **left**.
  - "Stretched" is confused with "wider". The dashed comparison with the standard parabola helps.
  - The coefficient $b$ of the standard form is taken for a shift – dragging the vertex shows that $b$ and $c$ change together.
- **Regional differences:** depending on the region, students work with the $pq$ formula (normal form $x^2 + px + q$) or the $abc$ formula. The simulation shows the discriminant $b^2 - 4ac$; for $a = 1$ it equals $p^2 - 4q$.
- **Rounded values:** if zeros or the vertex cannot be shown exactly with two decimal places, the simulation shows "≈" instead of "=" (e.g. $x_2 \approx 10.48$ for the ball). This is a good opportunity to talk about exact values such as $5 + \sqrt{30}$.
- **Exercise mode:** **Share → Hide results** hides the equations, the vertex and the zeros. This turns any setup into a reading exercise.
- **Notation:** some curricula and textbooks write the term as $a \cdot (x + d)^2 + e$. Under **Display → Notation of the vertex form** you can switch the simulation to this notation; a positive $d$ then shifts to the left.
