## What is it about?

In a **coordinate system** the position of a point is fixed by two numbers. The horizontal axis is called the **x-axis**, the vertical one the **y-axis**. They meet at the **origin** $O(0, 0)$.

For the point $P(3, 5)$ the **x-coordinate** comes first: from the origin you go **3 to the right** and then **5 up**. If you swap the numbers, you land at a completely different point, namely $(5, 3)$.

**Lines through two points A and B:**

| Name | Endpoints | Length |
| --- | --- | --- |
| segment AB | A and B | measurable, e.g. $AB = 5\,\text{cm}$ |
| ray AB | only A (starting point) | unlimited |
| line AB | none | unlimited |

**Position of two lines:** if two lines $g$ and $h$ form a right angle, they are **perpendicular** to each other: $g \perp h$. If they have no point in common, they are **parallel**: $g \parallel h$. With a **set square** you check it like this: place the drawing edge on $g$. If $h$ lies on the **centre line**, $h \perp g$. If $h$ runs along one of the thin lines that are parallel to the drawing edge, $h \parallel g$.

**Distance:** the distance of a point $P$ from a line $g$ is the length of the **perpendicular** from $P$ to $g$, i.e. the shortest connection. The perpendicular is at right angles to $g$; its foot is called $F$. Parallel lines are the same distance apart everywhere.

**Circle:** all points at the same distance $r$ from a **centre** $M$ form a circle. $r$ is called the **radius**; the **diameter** is twice as long:

$$
d = 2 \cdot r
$$

**Circle and line:** you compare the distance from $M$ to the line with the radius.

| Distance from M to the line | Common points | Name of the line |
| --- | --- | --- |
| greater than $r$ | none | non-intersecting line |
| equal to $r$ | exactly one (point of contact $T$) | **tangent** |
| less than $r$ | two ($S_1$, $S_2$) | secant |

At the point of contact, a tangent is **perpendicular** to the radius $MT$.

## Try it

1. Drag the points A and B. The dashed guide lines show how to read off the coordinates.
2. Switch between segment, ray and line (also by tapping on the right). What changes in the drawing and in the length? [Load line](?kind=gerade&ax=1&ay=6&bx=4&by=4)
3. Place the ruler on a [horizontal segment](?ruler=1&ax=1&ay=3&bx=7&by=3) and on a [slanted segment](?ruler=1&ax=1&ay=1&bx=7&by=5). For which one can you give the length without a ruler?
4. Investigate [two perpendicular lines](?mode=lage&geo=1) with the set square. Then drag D away: when does the cross ✗ appear?
5. Press “Make h parallel to g” and “Make h perpendicular to g”. Watch how D jumps.
6. Switch on the [distance of a point](?mode=lage&dist=1) and drag P. Where is the distance smallest?
7. For a [circle](?mode=kreis&ax=1&ay=1&bx=9&by=1&mx=5&my=4&r=2), slowly change the radius r from 2 cm to 4 cm. When does g become a tangent, and when a secant?
8. Play the [point game](?mode=spiel): how many tasks can you get right in a row?

## Exercises

### Exercise 1: Reading off and plotting points

Plot $A(1, 2)$, $B(6, 2)$ and $C(6, 7)$ in a coordinate system. Which point $D$ completes them to a square $ABCD$? Which sides of the square are parallel, and which are perpendicular to each other?

<details>
<summary>Show solution</summary>

$D(1, 7)$. Opposite sides are parallel: $AB \parallel DC$ and $BC \parallel AD$. Neighbouring sides are perpendicular to each other, e.g. $AB \perp BC$. [Show in the simulation](?mode=lage&ax=1&ay=2&bx=6&by=2&cx=6&cy=7&dx=1&dy=7&geo=1)

</details>

### Exercise 2: Segment, ray, line

(a) How many endpoints do a segment, a ray and a line have?
(b) Paul says: “The ray AB is longer than the segment AB.” Is he right?

<details>
<summary>Show solution</summary>

(a) Segment: two, ray: one (the starting point), line: none.
(b) No, a ray is unlimited and therefore has **no** length. Only segments can be measured.

</details>

### Exercise 3: Finding a perpendicular

The line $g$ passes through $A(2, 2)$ and $B(8, 5)$. You are looking for a line $h$ through $C(4, 7)$ with $h \perp g$. Give a suitable grid point $D$. [Load exercise](?mode=lage&dx=9&dy=7)

<details>
<summary>Show solution</summary>

On $g$, from A to B you go “6 to the right, 3 up”, i.e. 2 to the right and 1 up. A perpendicular then goes 1 to the right and 2 **down**. From C: $D(5, 5)$, $D(6, 3)$ or $D(7, 1)$. [Show the solution](?mode=lage&geo=1)

</details>

### Exercise 4: Parallels and distance

The line $g$ passes through $A(1, 2)$ and $B(9, 2)$. (a) Draw the parallel $h$ to $g$ through $C(2, 6)$. (b) How far apart are $g$ and $h$? (c) How far is the point $P(5, 7)$ from $g$?

<details>
<summary>Show solution</summary>

(a) $h$ runs horizontally through $C$, e.g. through $D(8, 6)$. (b) The distance is $4\,\text{cm}$ (from $y = 2$ to $y = 6$). (c) The perpendicular from $P$ to $g$ is vertical; its foot is $F(5, 2)$, so the distance is $5\,\text{cm}$. [Check](?mode=lage&ax=1&ay=2&bx=9&by=2&cx=2&cy=6&dx=8&dy=6&dist=1&px=5&py=7)

</details>

### Exercise 5: Tangents to a circle

A circle has the centre $M(5, 4)$ and the radius $r = 3\,\text{cm}$. (a) Give two tangents that are parallel to the x-axis. (b) Is the line through $(9, 0)$ and $(9, 8)$ a non-intersecting line, a tangent or a secant?

<details>
<summary>Show solution</summary>

(a) The horizontal lines through $(0, 1)$ and through $(0, 7)$: each is $3\,\text{cm} = r$ from M. Points of contact $T(5, 1)$ and $T(5, 7)$. [Lower tangent](?mode=kreis&ax=1&ay=1&bx=9&by=1&mx=5&my=4&r=3), [upper tangent](?mode=kreis&ax=1&ay=7&bx=9&by=7&mx=5&my=4&r=3)

(b) The distance from M is $4\,\text{cm} > 3\,\text{cm}$: a **non-intersecting line**. [Show](?mode=kreis&ax=9&ay=0&bx=9&by=8&mx=5&my=4&r=3)

</details>

### Exercise 6: Puzzle

How many grid points (integer coordinates) lie on the circle around $M(5, 4)$ with $r = 5\,\text{cm}$ if you look at the whole coordinate system?

<details>
<summary>Show solution</summary>

Twelve: four of them you reach with “5 to the right, left, up or down”, e.g. $(10, 4)$. Eight more with the steps “3 to the side and 4 up or down” or “4 to the side and 3 up or down”, e.g. $(8, 8)$ or $(9, 7)$ – the simulation shows this (and so does measuring with compasses); you will learn later with Pythagoras’ theorem why this is so. Ten of them can be seen in the simulation’s picture; $(5, 9)$ is too high up and the twelfth point lies below the x-axis. [Show the circle](?mode=kreis&mx=5&my=4&r=5)

</details>

## Ideas for the classroom

- **Use:** around grade 5, geometric figures and relative positions: introduction to the coordinate system, working out the terms parallel, perpendicular, distance and tangent, practice with the point game (also as a warm-up on the whiteboard).
- **Model:** all points lie on grid points in the first quadrant; one unit of length corresponds to 1 cm, i.e. two squares. “Perpendicular”, “parallel” and “tangent” are decided exactly (with integers). Lengths such as $AB$ or distances are rounded to millimetres as with a ruler ($\approx$). The set square is scaled down (drawing edge 8 cm instead of 16 cm).
- **Common pitfalls:**
  - x- and y-coordinates are swapped – the game recognises this mistake and gives targeted feedback (“first to the right, then up”).
  - “Perpendicular” is confused with “vertical/upright”. In mathematics, “perpendicular” is always a relationship **between two** lines; slanted lines can also be perpendicular to each other.
  - Parallel does not mean “the same length” or “horizontal”; lines have no length.
  - The distance is measured at a slant instead of at right angles (along the perpendicular).
- **Notation:** the German version of the simulation uses the notation common in German textbooks: points $P(3 \mid 5)$, segment $[AB]$, ray $[AB$, line $AB$, length $\overline{AB}$. English textbooks usually write $P(3, 5)$, segment $\overline{AB}$, ray $\overrightarrow{AB}$, line $\overleftrightarrow{AB}$ and length $AB$.
- **Point game:** it also works in locked links (`_lock=1`). The results “Relative position” and “Distance” can be hidden with `_hide=1`; they remain visible in the drawing.
