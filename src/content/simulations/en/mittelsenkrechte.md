---
description: "Interactive simulation for year 7: discover the perpendicular bisector and the angle bisector as loci of equal distances, follow both constructions with compasses and ruler step by step, find a meeting point by a road and explore the circumcentre of a triangle as an outlook."
---

## What is it about?

The **perpendicular bisector** $m$ of a segment $AB$ is the line that passes through the midpoint $M$ of $AB$ and is perpendicular to $AB$. It has a special property:

> Every point $P$ on $m$ is equally far from $A$ and $B$: $PA = PB$. Conversely, every point with $PA = PB$ lies on $m$.

(In the simulation, $PA$ stands for the length of the segment from $P$ to $A$.) A line consisting of exactly the points with a given property is called a **locus**. The perpendicular bisector splits the plane into two halves: on one side lie all points that are closer to $A$, on the other side all points that are closer to $B$. Reason: reflecting in $m$ maps $A$ onto $B$, and every point of $m$ stays where it is – so the segments $PA$ and $PB$ have the same length.

The **angle bisector** $w$ of an angle $\alpha$ with vertex $S$ splits it into two equal angles of $\frac{\alpha}{2}$. It is a locus as well:

> Every point on $w$ is equally far from both arms – and inside the angle only these points.

The **distance** of a point from an arm is measured **perpendicularly**, i.e. along the perpendicular. (If the foot of the perpendicular would lie behind the vertex, the nearest point of the arm is the vertex $S$ itself.)

**Construction with compasses and ruler:**

- *Perpendicular bisector:* Open the compasses wider than $\frac{1}{2}\,AB$ and draw arcs around $A$ and around $B$ with **the same radius**. The intersections $S_1$ and $S_2$ are equally far from $A$ and $B$, so they lie on $m$. The line $S_1S_2$ is the perpendicular bisector. ($AS_1BS_2$ is even a rhombus.)
- *Angle bisector:* An arc around $S$ cuts the arms at $P_1$ and $P_2$. Arcs with equal radius around $P_1$ and $P_2$ meet at $W$. The ray $SW$ is the angle bisector, because $SP_1WP_2$ is a kite with line of symmetry $SW$.

**Outlook:** The three perpendicular bisectors of a triangle $ABC$ meet at one point $U$. It is equally far from all vertices and is the centre of the **circumcircle**: $UA = UB = UC = r$.

## Try it

1. [Discover the locus](?line=0&zones=0): Drag $P$ to places where $PA = PB$. Every hit leaves a green dot. What do you notice once you have found five such points? Then switch on “Show the locus” and the colouring.
2. Drag $A$ and $B$. Where does $m$ always lie? Look at the right angle and the marks on $AM$ and $MB$.
3. [Angle bisector](?mode=winkel): Drag $P$ so that both perpendiculars have the same length. Also test an [obtuse angle](?mode=winkel&sx=8&sy=2&th=330&al=150) and a [straight angle](?mode=winkel&sx=10&sy=3&th=0&al=180). What is the angle bisector of a straight angle?
4. [Construct the perpendicular bisector](?mode=konstr&ax=4&ay=6&bx=15&by=8): Go through the construction with “Next step” and describe each step in your own words. Why must the radius be more than half of the segment?
5. [Construct the angle bisector](?mode=konstr&what=winkel&sx=3&sy=3&th=5&al=64): Which quadrilateral do $S$, $P_1$, $W$ and $P_2$ form at the end?
6. [Playground by the road](?mode=anw&ax=4&ay=9&bx=15&by=12&gx=0&gy=3&hx=20&hy=5&line=0): Slide $P$ along the road until both paths have the same length. Then switch on the locus.
7. [Circumcircle](?mode=umk&ax=3&ay=2&bx=15&by=4&cx=8&cy=12): Drag $C$ until the triangle is [right-angled](?mode=umk&ax=4&ay=2&bx=16&by=2&cx=4&cy=11) or [obtuse](?mode=umk&ax=2&ay=3&bx=18&by=3&cx=7&cy=6). Where is $U$ then?

## Tasks

### Task 1: Equally far?

Given are $A(4|5)$ and $B(12|9)$ (in squares; one square is $0.5\,\text{cm}$ wide). Do $P(7|9)$ and $Q(9|6)$ lie on the perpendicular bisector of $AB$? Count squares or measure. [Load task](?line=0&zones=0&_hide=1)

<details>
<summary>Show solution</summary>

$P$: From $A$ you go 3 squares to the right and 4 up, from $B$ 5 squares to the left. Both segments are 5 squares long (3-4-5 triangle), so $PA = PB = 2.5\,\text{cm}$: $P$ lies on $m$. $Q$: $QA \approx 2.5\,\text{cm}$, $QB \approx 2.1\,\text{cm}$ – $Q$ is closer to $B$ and does not lie on $m$. [Show the locus](?line=1)

</details>

### Task 2: Compasses too small

Tim wants to construct the perpendicular bisector of a $6\,\text{cm}$ segment and sets his compasses to $2.5\,\text{cm}$. What happens? Which radii are suitable?

<details>
<summary>Show solution</summary>

The arcs around $A$ and $B$ do not meet, because $2.5\,\text{cm} + 2.5\,\text{cm} < 6\,\text{cm}$. At exactly $3\,\text{cm}$ they only touch at the midpoint $M$ – that is not enough for a line. Any radius above $3\,\text{cm}$ works; $4$ to $5\,\text{cm}$ is easy to draw, for example.

</details>

### Task 3: Give reasons

Use a reflection to explain why every point $P$ of the perpendicular bisector $m$ is equally far from $A$ and $B$.

<details>
<summary>Show solution</summary>

Reflecting in $m$ maps $A$ onto $B$, because $m$ is perpendicular to $AB$ and bisects the segment. The point $P$ lies on the axis and stays fixed. So the segment $PA$ is mapped onto $PB$. A reflection does not change lengths, therefore $PA = PB$.

</details>

### Task 4: The playground

The houses are at $A(4|9)$ and $B(15|12)$, the road passes through $G(0|3)$ and $H(20|5)$. Where on the road must the playground be so that it is equally far from both houses? Describe the construction. [Load task](?mode=anw&ax=4&ay=9&bx=15&by=12&gx=0&gy=3&hx=20&hy=5&line=0&_hide=1)

<details>
<summary>Show solution</summary>

Construct the perpendicular bisector of $AB$; where it crosses the road is the place $T$ you are looking for. It lies at about $T(11.2|4.1)$, and $TA = TB \approx 4.4\,\text{cm}$. [Show solution](?mode=anw&ax=4&ay=9&bx=15&by=12&gx=0&gy=3&hx=20&hy=5&line=1)

</details>

### Task 5: No meeting point?

Can it happen that no place on the road is equally far from $A$ and $B$? Can it be that every place on the road fits?

<details>
<summary>Show solution</summary>

No place fits if the road is parallel to the perpendicular bisector, i.e. perpendicular to $AB$. [Example](?mode=anw&ax=4&ay=9&bx=15&by=12&gx=12&gy=0&hx=9&hy=11) Every place fits if the road lies exactly on the perpendicular bisector. [Example](?mode=anw&ax=6&ay=8&bx=14&by=8&gx=10&gy=0&hx=10&hy=14)

</details>

### Task 6: A radio mast for three villages

The villages are at $A(3|2)$, $B(15|4)$ and $C(8|12)$. A radio mast is to be equally far from all three villages. Where must it stand? [Load task](?mode=umk&ax=3&ay=2&bx=15&by=4&cx=8&cy=12&line=0&circ=0&_hide=1)

<details>
<summary>Show solution</summary>

It belongs at the intersection $U$ of the perpendicular bisectors (two are enough; the third automatically passes through $U$ as well). $U$ lies at about $(8.6|5.5)$, and the distance to each village is about $3.3\,\text{cm}$. [Show solution](?mode=umk&ax=3&ay=2&bx=15&by=4&cx=8&cy=12)

</details>

## Ideas for the classroom

- **Use:** Year 7, Lernbereich 2.1 “Achsen- und punktsymmetrische Figuren” (LehrplanPLUS Gymnasium Bavaria): basic constructions of the perpendicular bisector and the angle bisector, reasoning via symmetry, loci. Suitable for discovering (finding the locus), for demonstrating the constructions on a projector and for practice. The circumcircle is meant as an outlook here and is deepened when triangles are covered.
- **Operation:** $P$, the points $A$, $B$, $C$, the vertex $S$, the arms as well as $G$ and $H$ can be dragged. With “Show the locus” switched off, students can discover the line themselves; “Clear the trace” starts again. The construction can be played step by step or all at once.
- **Model:** squared paper with $0.5\,\text{cm}$ per square. For the perpendicular bisector, $P$ jumps to grid points and snaps onto $m$ when it is close; for the angle bisector, $P$ moves freely inside the angle and snaps onto $w$. Rounded lengths are shown with “≈”. The angle $\alpha$ can be set between $20°$ and $180°$. If you set $A$ and $B$ to the same point with the sliders, the point moved last moves one square further, because there is no perpendicular bisector without a segment.
- **Common stumbling blocks:**
  - “Every perpendicular to $AB$ is a perpendicular bisector.” – It has to pass through the midpoint.
  - The compasses are changed between the two arcs or opened to less than half of the segment.
  - The distance to an arm is measured at a slant instead of perpendicularly.
  - “The perpendicular bisector is a segment.” – It is a line; points far away from $AB$ lie on it as well.
  - “The circumcentre always lies inside the triangle.” – For obtuse triangles it lies outside.
