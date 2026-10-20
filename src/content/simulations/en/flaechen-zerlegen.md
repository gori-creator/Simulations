---
description: "Interactive simulation for grade 6: derive the area of parallelograms, triangles and trapeziums by cutting, moving and completing shapes – with counting squares as a check and a shear: same base and same height give the same area."
---

## What is it about?

You already know the area of a **rectangle**: length times width. Parallelograms, triangles and trapeziums can be turned into rectangles by **cutting**, **moving** and **completing** – the area does not change.

What matters is the **base** $g$ and the matching **height** $h$: the perpendicular distance of the opposite corner (or side) from the base. If its foot lies outside, extend the base.

- **Parallelogram:** cut off a triangle along the height and slide it to the other side: a rectangle $g$ long and $h$ wide, so $A = g \cdot h$. If it is steeply slanted, one cut is not enough – then it is cut into several strips.
- **Triangle:** a copy rotated by $180^\circ$ about the midpoint $M$ of a side completes it to a parallelogram with the same base and height. The triangle is half of it, so $A = g \cdot h : 2$.
- **Trapezium** with parallel sides $a$ and $c$: the rotated copy gives a parallelogram with base $a + c$, so $A = (a + c) \cdot h : 2$. Alternatively split it along a diagonal into two triangles: $a \cdot h : 2 + c \cdot h : 2$.

Example: $a = 7\,\text{cm}$, $c = 3\,\text{cm}$, $h = 4\,\text{cm}$ gives $A = (7 + 3) \cdot 4 : 2\,\text{cm}^2 = 20\,\text{cm}^2$.

One grid square is $1\,\text{cm}$ wide, so it is $1\,\text{cm}^2$; “Count the squares” checks every result.

## Try it

1. Press “Cut and move” for [this parallelogram](?g=6&h=4&s=2). Which piece moves where? Why does it fit exactly?
2. Then count the squares. Does the number match $g \cdot h$?
3. Cut up a [steeply slanted parallelogram](?g=3&h=4&s=7). Where is the foot of the height? Into how many pieces is it cut?
4. Double the [triangle](?fig=tri) and rearrange the parallelogram into a rectangle. Count the squares: which belong to the triangle, which to the copy – and what about the cut ones?
5. Press “Slide the top” for the [triangle](?fig=tri&sch=1) or drag the top $C$ yourself. What changes about the shape, what about the area?
6. Compare both ways for the [trapezium](?fig=trap): [rotated copy](?fig=trap&sz=erg) and [two triangles](?fig=trap&sz=drei). Do they give the same result?
7. Set [c = 0 cm](?fig=trap&c=0) and [c = a](?fig=trap&a=5&c=5) for the trapezium. Which shapes appear, and what becomes of the formula?

## Tasks

### Task 1: Parallelogram

[Load task](?g=5&h=3&s=2&show=0&_hide=1) Find the area of the parallelogram. Then cut it up to check.

<details>
<summary>Show solution</summary>

$g = 5\,\text{cm}$, $h = 3\,\text{cm}$, so $A = 5\,\text{cm} \cdot 3\,\text{cm} = 15\,\text{cm}^2$. The rectangle after moving consists of $15$ squares. [Show](?g=5&h=3&s=2&sp=rect)

</details>

### Task 2: Triangle

[Load task](?fig=tri&g=8&h=5&s=3&show=0&_hide=1) Calculate the area of the triangle.

<details>
<summary>Show solution</summary>

$A = 8\,\text{cm} \cdot 5\,\text{cm} : 2 = 40\,\text{cm}^2 : 2 = 20\,\text{cm}^2$. Two such triangles make a parallelogram of $40\,\text{cm}^2$. [Show](?fig=tri&g=8&h=5&s=3&st=erg)

</details>

### Task 3: An obtuse triangle

[Load task](?fig=tri&g=4&h=3&s=7&show=0&_hide=1) The corners are $A(0, 0)$, $B(4, 0)$ and $C(7, 3)$. Mia calculates $7 \cdot 3 : 2 = 10.5$. What went wrong?

<details>
<summary>Show solution</summary>

The base is $AB$ with $g = 4\,\text{cm}$, not $7\,\text{cm}$. The height is $h = 3\,\text{cm}$; its foot $(7, 0)$ lies outside the base. So $A = 4 \cdot 3 : 2\,\text{cm}^2 = 6\,\text{cm}^2$. [Show](?fig=tri&g=4&h=3&s=7&st=erg)

</details>

### Task 4: Trapezium two ways

[Load task](?fig=trap&a=9&c=5&h=4&s=2&show=0&_hide=1) Calculate the area with the trapezium formula and by splitting it into two triangles.

<details>
<summary>Show solution</summary>

Formula: $A = (9 + 5) \cdot 4 : 2\,\text{cm}^2 = 28\,\text{cm}^2$. Two triangles: $9 \cdot 4 : 2 + 5 \cdot 4 : 2 = 18 + 10 = 28$, so $28\,\text{cm}^2$. [Show](?fig=trap&a=9&c=5&h=4&s=2&sz=drei)

</details>

### Task 5: Same size, different shape

Find parallelograms with a whole-number base and height (in cm) and an area of $24\,\text{cm}^2$ (base at most $10\,\text{cm}$, height at most $8\,\text{cm}$). How many different parallelograms are there if you may also change the offset?

<details>
<summary>Show solution</summary>

$g \cdot h = 24$ with $g \le 10$ and $h \le 8$: $g = 3$, $h = 8$; $g = 4$, $h = 6$; $g = 6$, $h = 4$; $g = 8$, $h = 3$. For each pair there are infinitely many parallelograms: sliding the top side parallel to the base keeps the area at $24\,\text{cm}^2$. [Show an example](?g=4&h=6&s=5&sch=1)

</details>

### Task 6: Working backwards

A trapezium has the parallel sides $a = 8\,\text{cm}$ and $c = 4\,\text{cm}$ and an area of $30\,\text{cm}^2$. How high is it?

<details>
<summary>Show solution</summary>

$(8 + 4) \cdot h : 2 = 30$, so $6 \cdot h = 30$ and $h = 5\,\text{cm}$. [Show](?fig=trap&a=8&c=4&h=5&s=2)

</details>

## Ideas for the classroom

- **Use:** grade 6, area of parallelogram, triangle and trapezium derived by cutting and completing. Good as an introduction on the whiteboard: let the class guess first, then cut.
- **Order:** parallelogram → rectangle, then triangle → parallelogram, finally the trapezium in two ways. With “Show the area right away” off, the result only appears after cutting or counting.
- **Shear:** “Slide the top” shows that only base and height matter. This leads to the question why the slanted side appears in no formula.
- **Model:** all corners lie on grid points, the base is horizontal. The height is drawn from the top left corner; for the trapezium $h$ is the distance between the two parallel sides.
- **Common stumbling blocks:**
  - The slanted side is taken as the height – the height is perpendicular to the base.
  - For triangles “$: 2$” is forgotten; the doubled triangle is a reminder.
  - For obtuse triangles or steeply slanted parallelograms the foot of the height lies outside – the base must be extended, but its length stays $g$.
  - For the trapezium, $a$ and $c$ are multiplied instead of added.
