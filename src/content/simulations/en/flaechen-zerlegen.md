---
description: "Interactive simulation for grade 6: derive the area of parallelograms, triangles and trapeziums by cutting, moving and completing shapes – with counting squares as a check and a shear: same base and same height give the same area."
---

## What is it about?

You already know the area of a **rectangle**: length times width. Parallelograms, triangles and trapeziums can be turned into rectangles by **cutting**, **moving** and **completing** – the area does not change.

What matters is the **base** $g$ and the matching **height** $h$: the perpendicular distance of the opposite corner (or side) from the base. If its foot lies outside, extend the base.

- **Parallelogram:** cut off a triangle along the height and slide it to the other side: a rectangle $g$ long and $h$ wide, so $A = g \cdot h$.
- **Triangle:** a copy rotated by $180^\circ$ about the midpoint $M$ of a side completes it to a parallelogram, so $A = g \cdot h : 2$.
- **Trapezium** with parallel sides $a$ and $c$: the rotated copy gives a parallelogram with base $a + c$, so $A = (a + c) \cdot h : 2$. Alternatively split it into two triangles: $a \cdot h : 2 + c \cdot h : 2$.

One grid square is $1\,\text{cm}^2$; “Count the squares” checks every result.

## Try it

1. Press “Cut and move” for [this parallelogram](?g=6&h=4&s=2), then count the squares.
2. Cut up a [steeply slanted parallelogram](?g=3&h=4&s=7). Where is the foot of the height?
3. Double the [triangle](?fig=tri) and rearrange it into a rectangle.
4. Press “Slide the top” for the [triangle](?fig=tri&sch=1). What changes, what stays the same?
5. Compare both ways for the [trapezium](?fig=trap): [rotated copy](?fig=trap&sz=erg) and [two triangles](?fig=trap&sz=drei).

## Tasks

### Task 1: Parallelogram

[Load task](?g=5&h=3&s=2&show=0&_hide=1) Find the area.

<details>
<summary>Show solution</summary>

$A = 5\,\text{cm} \cdot 3\,\text{cm} = 15\,\text{cm}^2$. [Show](?g=5&h=3&s=2&sp=rect)

</details>

### Task 2: An obtuse triangle

[Load task](?fig=tri&g=4&h=3&s=7&show=0&_hide=1) The corners are $A(0, 0)$, $B(4, 0)$ and $C(7, 3)$. Mia calculates $7 \cdot 3 : 2 = 10.5$. What went wrong?

<details>
<summary>Show solution</summary>

The base is $AB$ with $g = 4\,\text{cm}$; the height is $h = 3\,\text{cm}$ with its foot outside the base. $A = 4 \cdot 3 : 2\,\text{cm}^2 = 6\,\text{cm}^2$. [Show](?fig=tri&g=4&h=3&s=7&st=erg)

</details>

### Task 3: Trapezium two ways

[Load task](?fig=trap&a=9&c=5&h=4&s=2&show=0&_hide=1) Use the formula and the two triangles.

<details>
<summary>Show solution</summary>

$(9 + 5) \cdot 4 : 2 = 28$ and $9 \cdot 4 : 2 + 5 \cdot 4 : 2 = 18 + 10 = 28$, so $A = 28\,\text{cm}^2$. [Show](?fig=trap&a=9&c=5&h=4&s=2&sz=drei)

</details>

### Task 4: Working backwards

A trapezium has $a = 8\,\text{cm}$, $c = 4\,\text{cm}$ and an area of $30\,\text{cm}^2$. How high is it?

<details>
<summary>Show solution</summary>

$(8 + 4) \cdot h : 2 = 30$, so $6h = 30$ and $h = 5\,\text{cm}$. [Show](?fig=trap&a=8&c=4&h=5&s=2)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- A good order: parallelogram → rectangle, then triangle → parallelogram, finally the trapezium in two ways. With “Show the area right away” off, the result only appears after cutting or counting.
- “Slide the top” shows that only base and height matter – why does the slanted side appear in no formula?
- **Common stumbling blocks:** taking the slanted side as the height; forgetting “$: 2$” for triangles; a foot of the height outside the base; multiplying $a$ and $c$ instead of adding them.
