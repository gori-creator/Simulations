## What is it about?

A **circle** with centre $M(a \mid b)$ and radius $r$ consists of all points $P(x \mid y)$ that are exactly $r$ away from $M$. Pythagoras' theorem turns this into an equation.

### The equation of a circle

$$(x - a)^2 + (y - b)^2 = r^2$$

This is the **centre–radius form**. For example, the circle about $M(1 \mid -1)$ with $r = 4$ has the equation $(x - 1)^2 + (y + 1)^2 = 16$. Watch the sign: $y - (-1)$ becomes $y + 1$.

Expanding the brackets gives the **general form**:

$$x^2 + y^2 + Dx + Ey + F = 0$$

Going the other way, you find $M$ and $r$ by **completing the square**. For example:

$$x^2 + y^2 - 4x + 6y - 3 = 0 \;\Leftrightarrow\; (x - 2)^2 + (y + 3)^2 = 16$$

This is a circle about $M(2 \mid -3)$ with $r = 4$.

### Position of a point

Substitute the point into the left-hand side and compare the result with $r^2$:

- If it is less than $r^2$, the point lies **inside** the circle.
- If it equals $r^2$, the point lies **on** the circle.
- If it is greater than $r^2$, the point lies **outside** the circle.

### Circle and line

A line can **cut** a circle (secant), **touch** it (tangent) or **miss** it. There are two ways to decide which:

1. **By calculation:** Substitute $y = mx + n$ into the equation of the circle. This gives a quadratic equation, and its discriminant decides. A positive discriminant means two intersection points, zero means one point of contact, and a negative one means no common point.
2. **By distance:** Compare the distance $d$ of the centre from the line with $r$. If $d < r$, the line is a secant. If $d = r$, it is a tangent. If $d > r$, it misses the circle.

### Two circles

What matters is the distance $|M_1M_2|$ between the centres:

| Distance between centres | Position |
| --- | --- |
| greater than $r_1 + r_2$ | outside each other |
| equal to $r_1 + r_2$ | touch from outside |
| between $\lvert r_1 - r_2 \rvert$ and $r_1 + r_2$ | intersect in two points |
| equal to $\lvert r_1 - r_2 \rvert$ | touch from inside |
| less than $\lvert r_1 - r_2 \rvert$ | one lies inside the other |

To find the intersection points, subtract the two equations. The terms $x^2$ and $y^2$ cancel and a line is left. Then intersect that line with either circle.

### Tangents

The tangent is **perpendicular to the radius** to the point of contact $T(t_1 \mid t_2)$. Its equation is:

$$(x - a)(t_1 - a) + (y - b)(t_2 - b) = r^2$$

From a point $P$ **outside** the circle there are two tangents. Their points of contact lie on the **Thales circle** over the segment $\overline{MP}$, because the angle at $T$ is a right angle.

## Try it

- [Circle about the origin](?mode=punkt&a=0&b=0&r=5&px=3&py=4): Does P(3|4) lie on the circle? Drag P inside and outside.
- [Secant](?mode=gerade&a=1&b=-1&r=4&m=0.5&n=1): Move the line until it only touches the circle.
- [Two circles](?mode=zwei&a=0&b=0&r=4&c=5&e=1&s=3): Drag M₂ and watch for the cases in the table.
- [Tangents from outside](?mode=tangente&a=0&b=0&r=3&px=7&py=2): Where does the Thales circle cut the circle?

## Exercises

**1. Setting up the equation.** Give the equation of the circle about $M(-2 \mid 3)$ with $r = 5$. Does $P(1 \mid 7)$ lie on it? [Load exercise](?mode=punkt&a=-2&b=3&r=5&px=1&py=7&_hide=1)

<details><summary>Show solution</summary>

$(x + 2)^2 + (y - 3)^2 = 25$. Substituting gives $3^2 + 4^2 = 25$, so $P$ lies on the circle.

</details>

**2. Finding the centre.** Find the centre and radius of $x^2 + y^2 + 2x - 4y - 4 = 0$.

<details><summary>Show solution</summary>

$(x + 1)^2 - 1 + (y - 2)^2 - 4 - 4 = 0$, so $(x + 1)^2 + (y - 2)^2 = 9$. The circle has centre $M(-1 \mid 2)$ and radius $r = 3$.

</details>

**3. Circle and line.** Does $y = 3$ cut the circle $x^2 + y^2 = 25$? [Load exercise](?mode=gerade&a=0&b=0&r=5&m=0&n=3&_hide=1)

<details><summary>Show solution</summary>

$x^2 + 9 = 25$, so $x = \pm 4$. The line is a secant with intersection points $(-4 \mid 3)$ and $(4 \mid 3)$.

</details>

**4. Tangent.** Find the tangent to $x^2 + y^2 = 25$ at $T(3 \mid 4)$. [Load exercise](?mode=tangente&a=0&b=0&r=5&px=3&py=4&_hide=1)

<details><summary>Show solution</summary>

$3x + 4y = 25$, so $y = -0.75x + 6.25$.

</details>
