## What is it about?

For **every** circle, the circumference is a fixed multiple of the diameter. This ratio is called **pi** $\pi$:

$$
\pi = \frac{U}{d} \approx 3.14159\ldots
$$

The two most important circle formulas follow from it:

$$
U = \pi \cdot d = 2\pi \cdot r \qquad A = \pi \cdot r^2
$$

**Circumference:** if you roll a wheel once, the distance is a little more than three diameters long.

**Area:** if you cut the circle into many sectors and lay them side by side, alternately pointing up and down, you get almost a rectangle. Its height is $r$, its width half the circumference $\pi r$. So $A = \pi r \cdot r = \pi r^2$.

**Archimedes** (around 250 BC) trapped the circle between an inner and an outer polygon. With the 96-gon he found $3\frac{10}{71} < \pi < 3\frac{1}{7}$, i.e. $3.1408 < \pi < 3.1429$.

$\pi$ is an **irrational number**: its decimal places never end and never repeat.

### Measuring π yourself

Measure round objects (button, tin can, cup, CD, plate, clock): the diameter with a ruler and the circumference with a tape measure or a piece of string. If you plot the measurements in a chart ($d$ to the right, $C$ upwards), the points lie almost on a **straight line through the origin**: $C$ is **proportional** to $d$. The slope of this line is $\pi$. Single ratios $C : d$ differ a little because of measurement errors, for example $25.3 : 8 \approx 3.16$. The line through all points largely evens out these errors.

### Working backwards

If the circumference or the area is given, rearrange the formula:

$$
d = \frac{C}{\pi} \qquad r = \sqrt{\frac{A}{\pi}}
$$

## Try it

1. Press **Roll** and compare the rolled-out circumference with the diameters below it.
2. Choose **Area** and rearrange the sectors. What happens with more sectors? [48 sectors](?mode=flaeche&n=48)
3. Choose **Archimedes** and double the number of corners several times. How close do the bounds get to π? [Hexagon](?mode=archimedes)
4. **Measuring everyday objects:** unwind the tape measure from the button and read off the circumference. “Next object” adds a point to the chart each time. What is the slope of the line at the end? [Button](?mode=messen&obj=knopf) · [All six](?mode=messen&obj=uhr)
5. **Practice:** calculate the circumference, area, diameter or radius, enter your result and have it checked. “New task” continues. [Practice](?mode=ueben&q=1)

## Exercises

### Exercise 1: Bicycle tyre

A bicycle tyre has a diameter of $70\,\text{cm}$. How far do you get with one turn? How many turns do you need for $1\,\text{km}$?

<details>
<summary>Show solution</summary>

$U = \pi \cdot 70\,\text{cm} \approx 219.9\,\text{cm} \approx 2.2\,\text{m}$. For $1000\,\text{m}$ you need $1000\,\text{m} \div 2.199\,\text{m} \approx 454.7$, so about $455$ turns.

</details>

### Exercise 2: One large pizza or two small ones?

Is a pizza with a $30\,\text{cm}$ diameter larger than two pizzas of $20\,\text{cm}$ each?

<details>
<summary>Show solution</summary>

Large pizza: $A = \pi \cdot 15^2 \approx 707\,\text{cm}^2$. Two small ones: $2 \cdot \pi \cdot 10^2 \approx 628\,\text{cm}^2$. The large pizza is bigger – the area grows with the square of the radius.

</details>

### Exercise 3: Rearranging sectors

Why does the rearranged shape look more and more like a rectangle with more sectors? What are the side lengths of this rectangle? [12 sectors](?mode=flaeche&n=12) · [48 sectors](?mode=flaeche&n=48)

<details>
<summary>Show solution</summary>

The narrower the sectors, the straighter the arcs along the top and bottom and the more vertical the sides. The height is the radius $r$; along the top and the bottom lies half the circumference each, so the width is $\pi r$. Hence $A = \pi r \cdot r = \pi r^2$.

</details>

### Exercise 4: Like Archimedes

For the hexagon, $3 < \pi < 3.4641$ (the simulation shows these values). Explain why the inscribed hexagon has a perimeter of exactly $3d$.

<details>
<summary>Show solution</summary>

The inscribed hexagon consists of six equilateral triangles with side length $r$. Its perimeter is $6r = 3d$. Every arc of the circle between two corners is longer than the side of the hexagon below it. So the circumference is larger than $3d$, and $\pi > 3$. [Show the hexagon](?mode=archimedes)

</details>

### Exercise 5: Evaluating measurements

A class measured: tin can $d = 6.6\,\text{cm}$, $C = 20.6\,\text{cm}$; plate $d = 26\,\text{cm}$, $C = 81.9\,\text{cm}$. Calculate $C : d$ for each. Which measurement is probably more accurate, and why? [See the measurements](?mode=messen&obj=teller)

<details>
<summary>Show solution</summary>

Tin can: $20.6 : 6.6 \approx 3.12$. Plate: $81.9 : 26 = 3.15$. Both are close to $\pi \approx 3.14$. For the plate, an error of one millimetre matters much less because the lengths are larger. So the plate measurement is probably more accurate.

</details>

### Exercise 6: From circumference to diameter

A tree trunk has a circumference of $1.5\,\text{m}$. Roughly how thick is it? Does it fit through a gate $45\,\text{cm}$ wide?

<details>
<summary>Show solution</summary>

$d = C : \pi = 150\,\text{cm} : \pi \approx 47.7\,\text{cm}$. The trunk is wider than $45\,\text{cm}$ and does not fit through the gate.

</details>

### Exercise 7: From area to radius

A circular flower bed is to have an area of $20\,\text{m}^2$. What radius must it have? [Practice](?mode=ueben&q=6)

<details>
<summary>Show solution</summary>

$r = \sqrt{A : \pi} = \sqrt{20 : \pi} \approx \sqrt{6.37} \approx 2.52\,\text{m}$.

</details>

## Ideas for the classroom

- **Use:** around grade 8/9 (circle and cylinder: circumference, area of a circle, approximations of π).
- **Three approaches:** rolling (circumference), rearranging (area) and Archimedes (approximation). All three animations are started with the button below the stage.
- **Measuring yourself:** students first measure their own objects with string and ruler, then compare with the measurements in the simulation. The line of best fit shows that $C$ is proportional to $d$.
- **Practice:** the tasks are numbered. The same number means the same task – so the whole class can work on the same one. From task 6 on, every second one is a backward task (the diameter from $C$, the radius from $A$). Calculating with $\pi \approx 3.14$ is fine.
- **Common pitfalls:**
  - Circumference and area are confused; $\pi r^2$ and $2\pi r$ are swapped.
  - “π is exactly 3.14.”
  - When working backwards, students forget to take the square root of $A : \pi$, or use the diameter instead of the radius.
