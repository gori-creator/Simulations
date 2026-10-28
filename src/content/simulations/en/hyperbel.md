## What is it about?

Two quantities are **inversely proportional** if their product is always the same: if one doubles, the other halves. For a fixed number $a$:

$$
x \cdot y = a \quad\Longleftrightarrow\quad y = \frac{a}{x} \qquad (x \neq 0)
$$

In a picture: all **rectangles** between the axes and a point $P(x \mid y)$ on the graph have the same **area** $|a|$ – a narrow tall rectangle just like a wide flat one. The graph is called a **hyperbola**; the simplest one is the basic function $y = \frac{1}{x}$.

Stretching by the factor $a$ and then shifting by $b$ in the $x$-direction and by $c$ in the $y$-direction gives

$$
f(x) = \frac{a}{x - b} + c
$$

- **Vertical asymptote** $x = b$: there the denominator is zero and $f$ is not defined (**pole**). As $x$ gets closer and closer to $b$, the absolute values of $f(x)$ grow without bound.
- **Horizontal asymptote** $y = c$: for $x \to +\infty$ and $x \to -\infty$, $\frac{a}{x-b}$ gets arbitrarily small; the graph approaches the line $y = c$ but never reaches it.
- **Domain** $D = \mathbb{R} \setminus \{b\}$, **range** $W = \mathbb{R} \setminus \{c\}$.
- **Sign of $a$**: relative to the cross formed by the asymptotes (intersection $Z(b \mid c)$), the two **branches** lie in quadrants I and III for $a > 0$ (decreasing on both intervals) and in quadrants II and IV for $a < 0$ (increasing). The larger $|a|$, the farther the branches are from the asymptotes.
- The inverse proportion still holds after shifting – measured from the asymptotes: $(x - b) \cdot (y - c) = a$.

**Intersections with the axes:**

$$
f(x) = 0 \;\Longleftrightarrow\; x = b - \frac{a}{c} \quad (c \neq 0), \qquad f(0) = c - \frac{a}{b} \quad (b \neq 0)
$$

For $c = 0$ the $x$-axis itself is the asymptote – then there is no zero; for $b = 0$ there is no $y$-intercept.

## Try it

1. Drag the orange point $P$ along the graph. The green rectangle changes its shape, but its area stays $4$. Look at the table of values: what happens to $y$ when $x$ doubles? [Load example](?a=4&u=1)
2. Make $a$ negative. Which quadrants do the branches lie in now? What does that mean for monotonicity? [Load example](?a=-3&u=1.5)
3. Click **First stretch, then shift**: step by step the hyperbola emerges from the basic function $\frac{1}{x}$. [Load example](?a=2&b=3&c=-2&u=1)
4. Drag the asymptote cross $Z$. How are $D$ and $W$ related to $Z$?
5. Choose “x → ±∞” as table of values and let $P$ run outwards. By how much does the distance to the horizontal asymptote shrink when $x - b$ becomes ten times as large? [Load example](?a=2&b=-1&c=1.5&u=3&lim=inf)
6. Let $P$ run to the pole. What happens to the function values? [Load example](?a=-2&b=1&c=-1&u=0.5&lim=pole)
7. Drag the green point $Q(b + 1 \mid c + a)$: it lies $1$ to the right of $Z$ and is shifted by $a$ (so below $Z$ for $a < 0$). The rectangle of width $1$ has the area $|a|$. If $P$ is right there, $Q$ jumps to the other side: $Q(b - 1 \mid c - a)$.

## Tasks

### Task 1: Inversely proportional?

A rectangle is to have an area of $12\,\text{cm}^2$. Express the length $y$ in terms of the width $x$ and calculate $y$ for $x = 1.5$; $3$; $6$.

<details>
<summary>Show solution</summary>

$x \cdot y = 12$, so $y = \frac{12}{x}$: $y = 8$; $4$; $2$ (each in cm). Double the width – half the length. The graph is the branch in quadrant I of the hyperbola $y = \frac{12}{x}$ (only $x > 0$ makes sense). The simulation goes up to $a = 8$, but it shows the principle just the same: [Show](?a=8&u=2)

</details>

### Task 2: Read off the equation

[Load task](?a=-2&b=2&c=1&u=1&info=0&_hide=1) Read off the asymptotes in the picture (not from the sliders) and find $a$ using a point on the graph. State the equation, $D$ and $W$.

<details>
<summary>Show solution</summary>

Asymptotes $x = 2$ and $y = 1$, so $b = 2$, $c = 1$. The point $P(3 \mid -1)$ lies on the graph: $(3 - 2) \cdot (-1 - 1) = -2 = a$. So $f(x) = \frac{-2}{x - 2} + 1$, $D = \mathbb{R} \setminus \{2\}$, $W = \mathbb{R} \setminus \{1\}$. The branches lie in quadrants II and IV because $a < 0$. [Show in the simulation](?a=-2&b=2&c=1&u=1)

</details>

### Task 3: Zero and y-intercept

Find the points where the graph of $f(x) = \frac{3}{x - 2} + 1$ meets the coordinate axes.

<details>
<summary>Show solution</summary>

Zero: $\frac{3}{x-2} = -1 \Rightarrow x - 2 = -3 \Rightarrow x = -1$, so $N(-1 \mid 0)$. $y$-axis: $f(0) = \frac{3}{-2} + 1 = -0.5$, so $S_y(0 \mid -0.5)$. [Show in the simulation](?a=3&b=2&c=1&u=2)

</details>

### Task 4: Approaching the asymptote

For $f(x) = \frac{2}{x + 1} + 1.5$: from which $x$ on do the function values differ from $1.5$ by less than $0.01$ (for $x > -1$)?

<details>
<summary>Show solution</summary>

$\frac{2}{x+1} < 0.01 \Leftrightarrow x + 1 > 200 \Leftrightarrow x > 199$. The table of values shows: at $x - b = 100$ the distance is still $0.02$, at $1000$ only $0.002$. [Show in the simulation](?a=2&b=-1&c=1.5&u=3&lim=inf)

</details>

### Task 5: Hyperbola through two points

The hyperbola $f(x) = \frac{a}{x} + c$ passes through $A(1 \mid 5)$ and $B(4 \mid 2)$. Find $a$ and $c$.

<details>
<summary>Show solution</summary>

$a + c = 5$ and $\frac{a}{4} + c = 2$. Subtracting gives $\frac{3}{4}a = 3$, so $a = 4$ and $c = 1$: $f(x) = \frac{4}{x} + 1$. [Show in the simulation](?a=4&c=1&u=1)

</details>

## Ideas for the classroom

- **Use:** About grade 8, elementary rational functions: start with inverse proportion (rectangles of equal area), then the effect of the parameters, domain and range, asymptotes. The form $\frac{a}{x - b} + c$ corresponds to the vertex form of a parabola – the animation “First stretch, then shift” builds on this.
- **Limits:** approaching the asymptotes is treated only informally with tables of values (“gets arbitrarily close but never reaches it”); $x \to \infty$ is a way of speaking here, not a formal limit.
- **Common stumbling blocks:**
  - “The graph never crosses the asymptote.” – True for these hyperbolas; in general (later: rational functions) a graph may well cross its horizontal asymptote.
  - The sign of $b$: for $\frac{a}{x + 2}$ the pole is at $x = -2$.
  - “The two branches are two functions.” – It is **one** function with a gap in its domain; the branches are point-symmetric about $Z(b \mid c)$.
  - The pole is mistaken for a zero because the **denominator** is zero there.
- **Task mode:** with `info=0` and **Share → hide results**, the key features, table of values and labels are hidden; asymptotes and graph stay visible and can be read off.
