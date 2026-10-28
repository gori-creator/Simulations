## What is it about?

In a **reflection in a line** $s$, every point $P$ is mapped to an image point $P'$. The following holds:

- $P$ and $P'$ lie on a **perpendicular** to $s$ (the perpendicular from $P$ to $s$),
- $P$ and $P'$ are **the same distance** from $s$ – the line bisects the segment $PP'$.

In a **reflection in a point** $Z$, $Z$ is the **midpoint** of every segment $PP'$:

$$
\overline{PZ} = \overline{ZP'}
$$

A reflection in a point is the same as a **half turn ($180^\circ$)** about $Z$.

Both reflections are **congruence transformations**: image and original are congruent, lengths and angles stay the same. Differences:

| | Reflection in a line | Reflection in a point |
| --- | --- | --- |
| Orientation | reversed | kept |
| Fixed points | all points on $s$ | only $Z$ |
| Fixed lines | $s$ and every perpendicular to $s$ | every line through $Z$ |
| Image segments | in general not parallel | parallel to the original |

The **orientation** tells you in which direction you go round the corners $A \to B \to C$: anticlockwise or clockwise. A **fixed line** is mapped onto itself (its points may move along it).

A figure has **line symmetry** if a reflection in a line maps it onto itself, and **point symmetry** if a reflection in a point (half turn) maps it onto itself.

## Try it

1. Drag the corners of the triangle and the points of the line $s$. How can you see that $A$ and $A'$ are the same distance from $s$? What happens if a corner lies exactly on $s$?
2. Press “Fold over”: the triangle is folded over the line like a sheet of paper. Compare the circular arrows in the original and the image.
3. Reflect the [flag in a slanted axis](?shape=fahne&ax=3&ay=3&bx=3&by=12&cx=7&cy=10&px=6&py=1&qx=10&qy=13). Which way does the reflected flag point?
4. Switch to [reflection in a point](?mode=punkt) and press “Turn by 180°”. Does the orientation stay the same? Compare the positions of $AB$ and $A'B'$.
5. Switch on [fixed points and fixed lines](?fix=1&ax=10&ay=3&bx=14&by=5&cx=12&cy=10&px=9&py=1&qx=11&qy=13). Which lines are mapped onto themselves?
6. Drag the **image point** $A'$: where must $A$ be then?
7. In the mode [find the symmetry](?mode=symmetrie), find all lines of symmetry and centres of symmetry of the figures.

## Tasks

### Task 1: Construct the image

[Load task](?show=0&ax=3&ay=6&bx=7&by=4&cx=5&cy=11&px=8&py=1&qx=12&qy=13) In your exercise book, construct the image of the triangle under the reflection in $s$. Describe the steps. Then check with “Fold over”.

<details>
<summary>Show solution</summary>

For each corner: draw the perpendicular from the corner to $s$ (set square with its centre line on $s$), measure the distance to $s$ and mark the same distance on the other side. [Show solution](?ax=3&ay=6&bx=7&by=4&cx=5&cy=11&px=8&py=1&qx=12&qy=13)

</details>

### Task 2: Reflection in a point in your head

[Load task](?mode=punkt&show=0&ax=4&ay=3&bx=8&by=3&cx=6&cy=6&zx=10&zy=7) $Z$ is 6 squares to the right of $A$ and 4 squares above $A$. Where is $A'$?

<details>
<summary>Show solution</summary>

From $Z$ you go the same way once more: 6 squares to the right and 4 up. So $A'$ is 12 squares to the right of $A$ and 8 squares above $A$. [Show solution](?mode=punkt&ax=4&ay=3&bx=8&by=3&cx=6&cy=6&zx=10&zy=7)

</details>

### Task 3: Find the line

A triangle and its image under a reflection in a line are given, but the line is missing. How do you find it?

<details>
<summary>Show solution</summary>

The line is the **perpendicular bisector** of the segment $AA'$ (and also of $BB'$ and $CC'$): it is perpendicular to $AA'$ and passes through its midpoint.

</details>

### Task 4: Symmetry of letters

Which of the letters H, T, E, N, F have line symmetry, which have point symmetry? Check in the mode [find the symmetry](?mode=symmetrie&fig=N).

<details>
<summary>Show solution</summary>

H: two lines and point symmetry. T and E: one line each (for E it is horizontal). N: no line, but point symmetry. F: no symmetry.

</details>

### Task 5: The parallelogram

Lena says: “The diagonals of a parallelogram are lines of symmetry.” Check her claim. [Load figure](?mode=symmetrie&fig=parallelogramm&rot=15)

<details>
<summary>Show solution</summary>

Wrong: if you reflect in a diagonal, the image does not fit onto the parallelogram (exception: rhombus). But a parallelogram has **point symmetry** – the centre is the intersection of the diagonals.

</details>

### Task 6: Reflecting twice

Reflect a triangle twice in the same line. What do you get? And what happens to the orientation if you reflect in two different lines one after the other?

<details>
<summary>Show solution</summary>

Twice in the same line: the original again. With two reflections in lines, the orientation is reversed twice – in the end it is the same as in the original.

</details>

## Ideas for the classroom

- **Use:** About grade 7, figures with line and point symmetry: properties of reflections in a line and in a point, constructing image points with a set square, recognising symmetry. Suitable for introducing the topic (folding over as a hands-on idea) and for practice.
- **Controls:** Corners, the points of the line, the line itself, the centre and the whole figure can be dragged; image points too. Switch off “Show the image” for construction tasks in exercise books. In “find the symmetry”, students draw lines by dragging and tap a suspected centre; wrong attempts show the non-matching image in red.
- **Model:** All points lie on grid points of the squared paper (one square $= 0.5\,\text{cm}$); with a slanted line, image points in general do not lie on grid points. If part of the image lies outside the paper, a note appears. If $P$ and $Q$ coincide via a slider or link, the point moved last moves on by one square, so there is always a line. If the corners lie on one line, the simulation says that this is not a proper figure.
- **Common stumbling blocks:**
  - Reflecting “horizontally” instead of perpendicular to the (slanted) line.
  - In a reflection in a point, students only “turn round” without marking the same distance beyond $Z$.
  - “The diagonal of a parallelogram is a line of symmetry.”
  - “A reflection in a point reverses the orientation.” – It is a half turn ($180^\circ$) and keeps it.
