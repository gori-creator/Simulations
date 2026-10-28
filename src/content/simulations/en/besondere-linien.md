---
description: "Interactive simulation for years 7 and 8: perpendicular bisectors, angle bisectors, medians and altitudes are drawn with compasses, ruler and set square on squared paper – and each time all three meet at one point. With circumcircle, incircle, centroid (a card balancing on a pin), orthocentre, the Euler line and all special cases."
---

## What is it about?

Every triangle has four kinds of **special lines**, three of each. The surprising thing: each time, all three meet at **one** point.

| Lines | Point | Property |
| --- | --- | --- |
| perpendicular bisectors $m_a, m_b, m_c$ of the sides | circumcentre $U$ | $UA = UB = UC = r$ |
| angle bisectors $w_\alpha, w_\beta, w_\gamma$ | incentre $I$ (German books: $W$) | same distance $\rho$ from all three sides |
| medians $s_a, s_b, s_c$ (vertex → midpoint of the opposite side) | centroid $S$ | divides every median in the ratio $2 : 1$ |
| altitudes $h_a, h_b, h_c$ (perpendicular from a vertex to the opposite side) | orthocentre $H$ | – |

**Why do the perpendicular bisectors meet at one point?** The perpendicular bisector of a segment is a **locus**: exactly its points are equally far from both endpoints. If $U$ lies on $m_c$ and on $m_a$, then $UA = UB$ and $UB = UC$ – so $UA = UC$ as well. Hence $U$ also lies on $m_b$. The circle around $U$ with $r = UA$ passes through all three vertices: the **circumcircle**.

**For the angle bisectors** the argument is the same, only with the distances to the **sides**: every point on $w_\alpha$ is equally far from $b$ and $c$. The intersection $I$ has the distance $\rho$ from all sides; the circle around $I$ with radius $\rho$ **touches** each side (there the radius is perpendicular to the side): the **incircle**.

**The centroid** $S$ divides each median so that the piece from the vertex to $S$ is twice as long as the piece from $S$ to the midpoint of the side. Its coordinates are the means of the vertex coordinates:

$$
S\left(\tfrac{x_A + x_B + x_C}{3} \;\middle|\; \tfrac{y_A + y_B + y_C}{3}\right)
$$

A cardboard triangle balances on a pin exactly at $S$.

**Where are the points?** $I$ and $S$ always lie inside. $U$ and $H$ lie inside an **acute** triangle and outside an **obtuse** one (for two altitudes you have to extend the sides). In a **right** triangle $U$ is the midpoint of the hypotenuse (Thales circle!) and $H$ is the vertex with the right angle – the legs are altitudes themselves. In an **isosceles** triangle all four points lie on the line of symmetry; in an **equilateral** one they coincide.

**Outlook – the Euler line:** in every triangle $H$, $S$ and $U$ lie on one line, and $HS = 2 \cdot SU$. The incentre lies on it only in isosceles triangles.

## Try it

1. When the page loads, the construction is drawn once quickly. Press **“Construct”**: compasses and ruler draw the three perpendicular bisectors one after another, the matching line appears in the construction steps, then $U$ lights up and the compasses draw the circumcircle. **“Next step”** goes line by line.
2. [Find it yourself](?pt=0): point and circle are hidden. Drag the vertices – do the three lines always meet at one point? Then switch on “Show the point and the circle”.
3. Drag $C$ down until the triangle is [obtuse](?ax=2&ay=2&bx=12&by=2&cx=4.5&cy=4.5). Where is $U$ now? When does $U$ lie exactly on a side? Compare with the [right triangle](?ax=3&ay=2&bx=11&by=2&cx=3&cy=8).
4. [Incircle](?m=wh&ax=2.5&ay=1.5&bx=13.5&by=2&cx=8.5&cy=9): look at the right angles at the points of contact and at the three equal bars in the card. Can the incircle stick out of the triangle?
5. [Centroid](?m=sh&ax=2&ay=1.5&bx=14&by=3&cx=6&cy=9): the beads divide each median into three equal pieces. Press **“Balance on a pin”** or tap the card anywhere yourself: when does it tip over, when not?
6. [Altitudes in an obtuse triangle](?m=h&ax=2&ay=2&bx=12&by=2&cx=4.5&cy=4.5): two altitudes do not meet the opposite side – the set square needs the dashed extension.
7. [Euler line](?m=eu&ax=2&ay=2&bx=13&by=2&cx=4&cy=9): drag the vertices. Do $H$, $S$ and $U$ stay on one line? Make the triangle [isosceles](?m=eu&ax=3&ay=2&bx=11&by=2&cx=7&cy=9) and then (almost) [equilateral](?m=eu&ax=4&ay=2&bx=12&by=2&cx=8&cy=8.9).

## Tasks

### Task 1: A right triangle

The triangle $A(2|2)$, $B(10|2)$, $C(2|8)$ is given (in cm). Where are $U$ and $H$? How big is the circumradius? [Load task](?ax=2&ay=2&bx=10&by=2&cx=2&cy=8&pt=0&_hide=1)

<details>
<summary>Show solution</summary>

The triangle has a right angle at $A$. By Thales’ theorem $U$ is the midpoint of the hypotenuse $BC$: $U(6|5)$. The hypotenuse is $\sqrt{8^2 + 6^2}\,\text{cm} = 10\,\text{cm}$ long, so $r = 5\,\text{cm}$. The legs $AB$ and $AC$ are altitudes themselves, so $H = A(2|2)$. [Show circumcircle](?ax=2&ay=2&bx=10&by=2&cx=2&cy=8) · [Show altitudes](?m=h&ax=2&ay=2&bx=10&by=2&cx=2&cy=8)

</details>

### Task 2: The incircle

Show for the same triangle that the inradius is $\rho = 2\,\text{cm}$, and give $I$. Hint: split the triangle into the three triangles $ABI$, $BCI$ and $CAI$. [Load task](?m=wh&ax=2&ay=2&bx=10&by=2&cx=2&cy=8&pt=0&_hide=1)

<details>
<summary>Show solution</summary>

All three small triangles have the height $\rho$. Together they make up the whole triangle with area $A = \frac{1}{2}\cdot 8\,\text{cm}\cdot 6\,\text{cm} = 24\,\text{cm}^2$:

$\frac{1}{2}\cdot(8 + 10 + 6)\,\text{cm}\cdot\rho = 24\,\text{cm}^2$, so $12\,\text{cm}\cdot\rho = 24\,\text{cm}^2$ and $\rho = 2\,\text{cm}$.

$I$ is $2\,\text{cm}$ away from $AB$ (on $y = 2$) and from $AC$ (on $x = 2$), so $I(4|4)$. [Show incircle](?m=wh&ax=2&ay=2&bx=10&by=2&cx=2&cy=8)

</details>

### Task 3: Radio mast and well

Three villages lie at the vertices of a triangle. (a) A radio mast is to be equally far from all three villages. (b) A well in a triangular park is to be equally far from the three straight paths along its edge. Which points are wanted, and how do you construct them? Can the radio mast stand outside the triangle?

<details>
<summary>Show solution</summary>

(a) The circumcentre $U$: intersection of two perpendicular bisectors (the third one serves as a check). In an obtuse triangle it lies outside. [Show](?ax=2&ay=2&bx=12&by=2&cx=4.5&cy=4.5)

(b) The incentre $I$: intersection of two angle bisectors. It always lies inside. [Show](?m=wh)

</details>

### Task 4: Balancing

A cardboard triangle is to balance on a pin. Where must the pin be? How far is this point from $A$ if the median $s_a$ is exactly $6\,\text{cm}$ long?

<details>
<summary>Show solution</summary>

At the centroid $S$. It divides $s_a$ in the ratio $2 : 1$, so $AS = \frac{2}{3}\cdot 6\,\text{cm} = 4\,\text{cm}$ and $SM_a = 2\,\text{cm}$. [Show centroid](?m=sh&ax=2&ay=1.5&bx=14&by=3&cx=6&cy=9)

</details>

### Task 5: Compute the centroid, check the Euler line

The triangle $A(1|1)$, $B(7|1)$, $C(3|5)$ is given. Compute the centroid $S$. One can show: $U(4|2)$ and $H(3|3)$. Check that $HS = 2 \cdot SU$. [Load task](?m=eu&ax=1&ay=1&bx=7&by=1&cx=3&cy=5&pt=0&_hide=1)

<details>
<summary>Show solution</summary>

$S\left(\frac{1 + 7 + 3}{3} \,\middle|\, \frac{1 + 1 + 5}{3}\right) = S\left(\frac{11}{3} \,\middle|\, \frac{7}{3}\right) \approx S(3.67|2.33)$.

From $H$ to $S$ you go $\frac{2}{3}$ to the right and $\frac{2}{3}$ down, from $S$ to $U$ exactly $\frac{1}{3}$ to the right and $\frac{1}{3}$ down – the same direction, half as far. So $H$, $S$, $U$ lie on one line and $HS = 2\cdot SU$ (rounded $0.94\,\text{cm}$ and $0.47\,\text{cm}$). [Show Euler line](?m=eu&ax=1&ay=1&bx=7&by=1&cx=3&cy=5)

</details>

### Task 6: When do points coincide? (challenge)

In which triangles do $U$ and $I$ coincide? And in which do all four special points lie on one line? Try it out and give reasons.

<details>
<summary>Show solution</summary>

If $U$ and $I$ coincide, this point is $r$ away from the vertices and $\rho$ away from the sides. The perpendicular from it to a side meets the side at its midpoint (it lies on the perpendicular bisector, after all). This gives six right triangles such as $U M_c A$, each with hypotenuse $r$ and one leg $\rho$. By the congruence theorem SsA (RHS) they are all congruent, so all half sides are equally long: the triangle is **equilateral**, and even $U$, $I$, $S$ and $H$ coincide. [Show](?m=eu&ax=4&ay=2&bx=12&by=2&cx=8&cy=8.9)

All four points lie on one line if the triangle is **isosceles**: then the line of symmetry is at the same time perpendicular bisector, angle bisector, median and altitude. [Show](?m=eu&ax=3&ay=2&bx=11&by=2&cx=7&cy=9) (The converse is true as well: if $I$ lies on the Euler line, the triangle is isosceles – but the proof is much harder.)

</details>

## Ideas for the classroom

- **Use:** about grade 7, triangles, congruence and constructions: circumcircle and incircle as an application of the loci perpendicular bisector and angle bisector. Medians, altitudes and the Euler line are suitable as an extension or outlook.
- **On the projector:** “Next step” constructs line by line while the class draws along in their exercise books. The reasoning card (“equally far from the vertices”) can be the starting point for a proof formulated together.
- **Discovery:** with “Show the point and the circle” switched off (`pt=0`) point, circle and measurements stay hidden; the students state the conjecture “The three lines meet at one point” themselves.
- **Group work:** four groups each investigate one kind of line in acute, right and obtuse triangles and enter their results in a shared table (“Where is the point?”).
- **Hands-on:** cut out cardboard triangles, draw the medians and balance them on a pencil tip – then compare with the simulation. (The vertices snap to half centimetres when dragged; values are shown rounded.)
- **Common stumbling blocks:**
  - Perpendicular bisector and median are mixed up – both pass through the midpoint of the side, but only the perpendicular bisector is perpendicular to the side.
  - “The circumcentre always lies inside the triangle.” – In obtuse triangles it lies outside.
  - In obtuse triangles students forget to extend the sides for the altitudes.
  - The inradius is measured to a vertex instead of perpendicular to a side.
  - At the centroid the ratio is reversed ($1 : 2$ instead of $2 : 1$ from the vertex).
