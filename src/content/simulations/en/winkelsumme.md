---
description: "Interactive simulation for year 7: tear off the corners of a triangle and join them into a straight angle, prove the angle sum with a parallel line and alternate angles, split polygons into n − 2 triangles and discover that the exterior angles add up to 360°."
---

## What is it about?

In **every triangle** the three interior angles add up to $180^\circ$:

$$
\alpha + \beta + \gamma = 180^\circ
$$

**Proof with a parallel:** draw the line $g$ through $C$ parallel to the side $[AB]$. On the line $AC$, the angles $\alpha$ and $\alpha'$ are **alternate angles** at the parallels $AB$ and $g$ (Z shape), so $\alpha' = \alpha$. In the same way $\beta' = \beta$. The three angles $\alpha'$, $\gamma$ and $\beta'$ lie next to each other on $g$ and form a **straight angle**: $\alpha' + \gamma + \beta' = 180^\circ$. So $\alpha + \beta + \gamma = 180^\circ$.

It follows that if you know two angles, you know the third, e.g. $\alpha = 50^\circ$, $\beta = 70^\circ$ $\Rightarrow$ $\gamma = 180^\circ - 50^\circ - 70^\circ = 60^\circ$.

**Polygons:** from one corner, diagonals split a (convex) $n$-gon into $n - 2$ triangles. Their angles make up exactly the interior angles of the $n$-gon. So the **angle sum of an $n$-gon** is

$$
(n - 2) \cdot 180^\circ
$$

| $n$ | 3 | 4 | 5 | 6 | 8 | 10 |
| --- | --- | --- | --- | --- | --- | --- |
| Triangles | 1 | 2 | 3 | 4 | 6 | 8 |
| Angle sum | $180^\circ$ | $360^\circ$ | $540^\circ$ | $720^\circ$ | $1080^\circ$ | $1440^\circ$ |

In a **regular** $n$-gon all angles are equal: $(n - 2) \cdot 180^\circ : n$, e.g. $108^\circ$ in a pentagon and $120^\circ$ in a hexagon. The formula also holds for **non-convex** polygons with a reflex corner (interior angle greater than $180^\circ$) – but not if sides cross.

**Exterior angles:** if you extend a side beyond the corner, you get the exterior angle – the angle you turn through at this corner when walking around the shape. In a triangle, $\alpha^* = 180^\circ - \alpha = \beta + \gamma$. Walking once around a convex polygon, you turn exactly once all the way round: the **sum of the exterior angles** is always $360^\circ$.

## Try it

1. Drag the corners of the triangle. How do $\alpha$, $\beta$, $\gamma$ change – and how does their sum change? Watch the coloured bar.
2. Press “Tear off the corners”: the angle pieces turn about the midpoints of the sides and join at $C$ to form a straight angle. Also try a [very flat triangle](?ax=0&ay=1&bx=16&by=1&cx=6&cy=2.5).
3. Press “Proof with a parallel” and follow the steps. Where do you see the Z shape?
4. Switch on the [exterior angles](?ax=1&ay=2&bx=15&by=2&cx=5&cy=6&ext=1). Compare $\alpha^*$ with $\beta + \gamma$.
5. Switch to the [pentagon](?mode=poly) and press “Split into triangles”. How many triangles are there? Use the slider $n$ to set other numbers of corners and compare with the table.
6. Drag a corner inwards until you get a [non-convex hexagon](?mode=poly&n=6&pts=2,1;14,1;14,11;8,6.5;2,11;4,6). Is the sum still the same? From which corner is it split now?
7. What happens if [sides cross](?mode=poly&n=4&pts=2,2;12,10;12,2;2,10)?
8. Switch on the exterior angles for the [regular octagon](?mode=poly&n=8&ext=1) and press “Walk around”. Through how many degrees has the arrow turned at the end?

## Tasks

### Task 1: The third angle

In a triangle, $\alpha = 48^\circ$ and $\beta = 67^\circ$. Find $\gamma$.

<details>
<summary>Show solution</summary>

$\gamma = 180^\circ - 48^\circ - 67^\circ = 65^\circ$.

</details>

### Task 2: A right-angled triangle

[Load task](?ax=3&ay=2&bx=11&by=2&cx=3&cy=8&vals=0&_hide=1) There is a right angle at $A$, and $\beta \approx 36.9^\circ$. How big is $\gamma$? Why can a triangle not have two right angles?

<details>
<summary>Show solution</summary>

$\gamma \approx 180^\circ - 90^\circ - 36.9^\circ = 53.1^\circ$. Two right angles would already make $180^\circ$, leaving $0^\circ$ for the third angle – that is not a triangle. In a right-angled triangle the other two angles add up to $90^\circ$. [Show in the simulation](?ax=3&ay=2&bx=11&by=2&cx=3&cy=8)

</details>

### Task 3: Octagon

What is the angle sum of an octagon? How big is one interior angle of a regular octagon?

<details>
<summary>Show solution</summary>

$(8 - 2) \cdot 180^\circ = 6 \cdot 180^\circ = 1080^\circ$. In a regular octagon: $1080^\circ : 8 = 135^\circ$. [Show in the simulation](?mode=poly&n=8)

</details>

### Task 4: Working backwards

The interior angles of a polygon add up to $1260^\circ$. How many corners does it have?

<details>
<summary>Show solution</summary>

$1260^\circ : 180^\circ = 7$, so $n - 2 = 7$ and $n = 9$: a nonagon. [Show in the simulation](?mode=poly&n=9)

</details>

### Task 5: Exterior angles

At each corner of a regular polygon the exterior angle is $40^\circ$. How many corners does it have, and how big is one interior angle?

<details>
<summary>Show solution</summary>

The exterior angles add up to $360^\circ$, so $n = 360^\circ : 40^\circ = 9$. One interior angle is $180^\circ - 40^\circ = 140^\circ$ (check: $7 \cdot 180^\circ : 9 = 140^\circ$). [Show in the simulation](?mode=poly&n=9&ext=1)

</details>

### Task 6: Puzzle

Is there a regular polygon with interior angles of $100^\circ$? A quadrilateral has angles of $30^\circ$, $40^\circ$ and $50^\circ$. How big is the fourth angle, and what does the quadrilateral look like?

<details>
<summary>Show solution</summary>

From $(n - 2) \cdot 180^\circ = 100^\circ \cdot n$ it follows that $80^\circ \cdot n = 360^\circ$, so $n = 4.5$ – not a whole number, so there is no such polygon. (Or with exterior angles: $360^\circ : 80^\circ = 4.5$.)

The fourth angle is $360^\circ - 30^\circ - 40^\circ - 50^\circ = 240^\circ$. It is greater than $180^\circ$: the quadrilateral is not convex, it has a reflex corner (shaped like an arrowhead).

</details>

## Ideas for the classroom

- **Use:** about grade 7, angles in figures: justify the angle sum of a triangle and transfer it to polygons. Tearing off the corners works well as an introduction (ideally alongside real paper triangles), the proof with the parallel for consolidation, and the polygons for an exploration phase with the table.
- **From experiment to proof:** tearing off the corners only shows that it “fits” – a measurement is never quite exact. Comparing both approaches can lead to the question of why we prove things at all. The half turn of the pieces about the midpoints of the sides is exactly the point reflection that maps the alternate angles onto each other.
- **Model:** the corners snap to half grid squares; angles are rounded to one decimal place and distributed so that the displayed sum is correct. Switching off “Show the sizes of the angles” and `_hide=1` are useful for calculation tasks.
- **Common stumbling blocks:**
  - “Bigger triangles have a bigger angle sum.” – The angle sum does not depend on the size; dragging the corners shows this quickly.
  - When splitting, diagonals are drawn from several corners; this gives more than $n - 2$ triangles, some of whose angles lie inside the polygon.
  - Alternate and corresponding angles get mixed up – the Z shape can help.
  - In non-convex polygons the reflex interior angle is overlooked, or the angle on the outside ($360^\circ$ minus the interior angle) is measured instead.
- **Exterior angles:** walking around connects well with movement games in the schoolyard or with programming a “turtle”. At reflex corners you turn back; there the exterior angle is given as negative here – this goes beyond the curriculum and is meant as an outlook.
