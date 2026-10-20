---
description: "Interactive simulation for years 7 and 8: perpendicular bisectors, angle bisectors, medians and altitudes are drawn with compasses, ruler and set square on squared paper – and each time all three meet at one point. With circumcircle, incircle, centroid (a card balancing on a pin), orthocentre, the Euler line and all special cases."
---

## What is it about?

Every triangle has four kinds of **special lines**, three of each – and each time all three meet at **one** point:

| Lines | Point | Property |
| --- | --- | --- |
| perpendicular bisectors $m_a, m_b, m_c$ | circumcentre $U$ | $UA = UB = UC = r$ |
| angle bisectors $w_\alpha, w_\beta, w_\gamma$ | incentre $I$ | same distance $\rho$ from all three sides |
| medians $s_a, s_b, s_c$ (vertex → midpoint of opposite side) | centroid $S$ | divides every median in the ratio $2 : 1$ |
| altitudes $h_a, h_b, h_c$ | orthocentre $H$ | – |

**Why one point?** Every point on the perpendicular bisector of a segment is equally far from both endpoints (a **locus**). If $U$ lies on $m_c$ and $m_a$, then $UA = UB$ and $UB = UC$, so $UA = UC$ and $U$ lies on $m_b$ too. The same argument with distances to the **sides** works for the angle bisectors.

$I$ and $S$ always lie inside. $U$ and $H$ lie inside an acute triangle and outside an obtuse one; in a right triangle $U$ is the midpoint of the hypotenuse (Thales circle) and $H$ is the right-angled vertex. In an isosceles triangle all points lie on the line of symmetry; in an equilateral one they coincide. **Euler line:** $H$, $S$ and $U$ are collinear with $HS = 2 \cdot SU$.

## Try it

1. Press **“Construct”**: compasses and ruler draw the three perpendicular bisectors one after another, $U$ lights up and the compasses draw the circumcircle. **“Next step”** goes line by line.
2. [Find it yourself](?pt=0): the point is hidden. Do the three lines always meet at one point?
3. Make the triangle [obtuse](?ax=2&ay=2&bx=12&by=2&cx=4.5&cy=4.5) or [right-angled](?ax=3&ay=2&bx=11&by=2&cx=3&cy=8). Where is $U$?
4. [Centroid](?m=sh&ax=2&ay=1.5&bx=14&by=3&cx=6&cy=9): press **“Balance on a pin”** or tap the card anywhere. When does it tip over?
5. [Euler line](?m=eu&ax=2&ay=2&bx=13&by=2&cx=4&cy=9): drag the vertices. Then try an [equilateral](?m=eu&ax=4&ay=2&bx=12&by=2&cx=8&cy=8.9) triangle.

## Tasks

### Task 1: A right triangle

$A(2|2)$, $B(10|2)$, $C(2|8)$ (in cm). Where are $U$ and $H$? How big is the circumradius? [Load task](?ax=2&ay=2&bx=10&by=2&cx=2&cy=8&pt=0&_hide=1)

<details>
<summary>Show solution</summary>

The right angle is at $A$, so $U$ is the midpoint of the hypotenuse: $U(6|5)$, $r = \frac{1}{2}\cdot 10\,\text{cm} = 5\,\text{cm}$. The legs are altitudes, so $H = A(2|2)$. [Show](?ax=2&ay=2&bx=10&by=2&cx=2&cy=8)

</details>

### Task 2: Balancing

Where does a cardboard triangle balance on a pin? How far is that point from $A$ if the median $s_a$ is $6\,\text{cm}$ long?

<details>
<summary>Show solution</summary>

At the centroid $S$, which is $\frac{2}{3}\cdot 6\,\text{cm} = 4\,\text{cm}$ from $A$. [Show](?m=sh)

</details>

### Task 3: Euler line

$A(1|1)$, $B(7|1)$, $C(3|5)$ with $U(4|2)$ and $H(3|3)$. Compute $S$ and check $HS = 2 \cdot SU$. [Load task](?m=eu&ax=1&ay=1&bx=7&by=1&cx=3&cy=5&pt=0&_hide=1)

<details>
<summary>Show solution</summary>

$S\left(\frac{11}{3}\,\middle|\,\frac{7}{3}\right)$. From $H$ to $S$: $\frac{2}{3}$ right, $\frac{2}{3}$ down; from $S$ to $U$: $\frac{1}{3}$ right, $\frac{1}{3}$ down – same direction, half as far. [Show](?m=eu&ax=1&ay=1&bx=7&by=1&cx=3&cy=5)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- **Use:** year 7, constructions and loci; medians, altitudes and the Euler line as an extension. Step through the construction on the projector while the class draws along.
- **Discovery mode:** with `pt=0` point, circle and measurements stay hidden until the class has made its conjecture.
- **Common stumbling blocks:**
  - Perpendicular bisector and median are mixed up – both pass through the midpoint, only one is perpendicular.
  - “The circumcentre is always inside.” – Not in an obtuse triangle.
  - Forgetting to extend the sides for the altitudes of an obtuse triangle.
  - Reversing the ratio at the centroid ($1 : 2$ instead of $2 : 1$ from the vertex).
