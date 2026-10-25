---
description: Interactive simulation on the number π – roll a wheel for the circumference, rearrange circle sectors into a rectangle for the area and trap π like Archimedes.
---

## What is it about?

For **every** circle, the circumference is a fixed multiple of the diameter. This ratio is called the **number** $\pi$:

$$
\pi = \frac{C}{d} \approx 3.14159\ldots
$$

This gives the two most important circle formulas:

$$
C = \pi \cdot d = 2\pi \cdot r \qquad A = \pi \cdot r^2
$$

**Circumference:** If you roll a wheel once, the distance is a little more than three diameters.

**Area:** If you cut the circle into many sectors and lay them side by side, alternately pointing up and down, you get almost a rectangle. Its height is $r$, its width is half the circumference, $\pi r$. So $A = \pi r \cdot r = \pi r^2$.

**Archimedes** (around 250 BC) trapped the circle between an inner and an outer polygon. With the 96-gon he found $3\frac{10}{71} < \pi < 3\frac{1}{7}$, that is $3.1408 < \pi < 3.1429$. He calculated with fractions and rounded carefully. The simulation shows the exact bounds of the 96-gon: $3.1410 < \pi < 3.1427$.

$\pi$ is an **irrational number**: its decimal digits never end and never repeat.

## Try it

1. Press **Roll** and compare the rolled-out circumference with the diameters below it.
2. Choose **Area** and rearrange the sectors. What happens with more sectors? [48 sectors](?mode=flaeche&n=48)
3. Choose **Archimedes** and double the number of corners several times. How close do the bounds get to π? [Hexagon](?mode=archimedes)

## Exercises

### Exercise 1: Calculate circumference and area

A circle has the radius $r = 3\,\text{cm}$. Calculate its circumference and area – first as a multiple of $\pi$, then rounded. What is the circumference of a circle with $d = 10\,\text{cm}$?

<details>
<summary>Show solution</summary>

$C = 2\pi \cdot 3\,\text{cm} = 6\pi\,\text{cm} \approx 18.85\,\text{cm}$ and $A = \pi \cdot (3\,\text{cm})^2 = 9\pi\,\text{cm}^2 \approx 28.27\,\text{cm}^2$. For $d = 10\,\text{cm}$: $C = 10\pi\,\text{cm} \approx 31.42\,\text{cm}$.

</details>

### Exercise 2: Bicycle wheel

A bicycle wheel has a diameter of $70\,\text{cm}$. How far do you get with one turn? How many turns do you need for $1\,\text{km}$?

<details>
<summary>Show solution</summary>

$C = \pi \cdot 70\,\text{cm} \approx 219.9\,\text{cm} \approx 2.2\,\text{m}$. For $1000\,\text{m}$ you need $1000\,\text{m} : 2.199\,\text{m} \approx 454.7$, so about $455$ turns.

</details>

### Exercise 3: One big or two small pizzas?

Is one pizza with a diameter of $30\,\text{cm}$ bigger than two pizzas with $20\,\text{cm}$ each?

<details>
<summary>Show solution</summary>

Big pizza: $A = \pi \cdot 15^2 \approx 707\,\text{cm}^2$. Two small ones: $2 \cdot \pi \cdot 10^2 \approx 628\,\text{cm}^2$. The big pizza is bigger – the area grows with the square of the radius.

</details>

### Exercise 4: Rearranging sectors

Why does the rearranged figure look more and more like a rectangle with more sectors? What are the side lengths of this rectangle? [12 sectors](?mode=flaeche&n=12) · [48 sectors](?mode=flaeche&n=48)

<details>
<summary>Show solution</summary>

The narrower the sectors, the straighter the arcs at the top and bottom edges and the more vertical the sides. The height is the radius $r$; the top and the bottom each hold half the circumference, so the width is $\pi r$. Therefore $A = \pi r \cdot r = \pi r^2$.

</details>

### Exercise 5: Like Archimedes

For the hexagon, $3 < \pi < 2\sqrt{3} \approx 3.464$. Explain why the inscribed hexagon has a perimeter of exactly $3d$.

<details>
<summary>Show solution</summary>

The inscribed hexagon consists of six equilateral triangles with side length $r$. Its perimeter is $6r = 3d$. Since the circle around it is a little longer, $\pi > 3$. [Show hexagon](?mode=archimedes)

</details>

## Ideas for the classroom

- **Use:** Bavaria, grade 8 (circle and cylinder: circumference, area of a circle, approximations of π).
- **Three approaches:** rolling (circumference), rearranging (area) and Archimedes (approximation). You start all three animations with the button below the stage. With "reduced motion", the display jumps straight to the result.
- **Common pitfalls:**
  - Circumference and area are mixed up; $\pi r^2$ and $2\pi r$ are swapped.
  - "π is exactly 3.14."
- **Images:** The wheel and the pizza can be supplemented by photos (see `docs/BILDER.md`).
