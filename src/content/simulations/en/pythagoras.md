## What is it about?

In a **right triangle** the two sides at the right angle are called the **legs** ($a$ and $b$); the side opposite the right angle is called the **hypotenuse** ($c$). It is always the longest side.

> **Pythagorean theorem:** in every right triangle, the sum of the areas of the squares on the legs equals the area of the square on the hypotenuse:
> $$a^2 + b^2 = c^2$$

With it you can calculate a missing side:

$$
c = \sqrt{a^2 + b^2} \qquad b = \sqrt{c^2 - a^2}
$$

Example: $a = 3\,\text{cm}$, $b = 4\,\text{cm}$ gives $c = \sqrt{9 + 16} = \sqrt{25} = 5\,\text{cm}$.

### Puzzle proof

Place four identical right triangles in a square with side length $a + b$.

- In the first arrangement a square with side length $c$ is left uncovered in the middle: area $c^2$.
- If you rearrange the triangles, two squares are left uncovered: area $a^2 + b^2$.

The large square and the four triangles are the same – so the uncovered area must be the same: $c^2 = a^2 + b^2$.

### Converse

If $a^2 + b^2 = c^2$ holds in a triangle, then it is right-angled, and the right angle lies opposite $c$. What is more: comparing $c^2$ with $a^2 + b^2$ tells you the kind of angle $\gamma$ between $a$ and $b$:

| Comparison | Angle $\gamma$ |
| --- | --- |
| $c^2 < a^2 + b^2$ | acute (less than $90°$) |
| $c^2 = a^2 + b^2$ | right angle |
| $c^2 > a^2 + b^2$ | obtuse (greater than $90°$) |

The ancient Egyptians are said to have marked out right angles this way: with a rope divided by knots into $3 + 4 + 5 = 12$ equal pieces.

### Pythagorean triples

Three whole numbers with $a^2 + b^2 = c^2$ are called a **Pythagorean triple**, for example $(3, 4, 5)$, $(5, 12, 13)$, $(8, 15, 17)$ and $(20, 21, 29)$. Multiples of a triple are triples again: $(6, 8, 10)$, $(9, 12, 15)$. Triples without a common factor are called **primitive**. In a coordinate system, $c = \sqrt{a^2 + b^2}$ is the distance of the point $P(a, b)$ from the origin – so a triple belongs to a grid point at a whole-number distance.

### Applications

Wherever there is a right angle, there is a right triangle: ladder, wall and ground; width, height and diagonal of a screen; the distance between two points in a coordinate system $d = \sqrt{(\Delta x)^2 + (\Delta y)^2}$; the shortcut across a rectangular field.

## Try it

1. Drag the two coloured corners and count the unit squares. With the 3-4-5 triangle this works exactly. Does $a^2 + b^2 = c^2$ also hold for the isosceles triangle? [Isosceles](?a=3&b=3)
2. Switch to the **Puzzle proof** and let the triangles be rearranged. Which areas stay the same? [Puzzle proof](?mode=puzzle) · [Flat triangle](?mode=puzzle&a=1.5&b=5)
3. **Converse:** drag the corner $B$ and watch the bars at the top. At what angle are they equally long? [Obtuse angle](?mode=angle&gam=120) · [Acute angle](?mode=angle&gam=60)
4. **Applications:** how long must a ladder be that is to lean against a wall at a height of $6\,\text{m}$? [Ladder](?mode=apply&ex=ladder&a=6&b=1.5) · [Screen](?mode=apply&ex=screen&a=3.5&b=6) · [Distance of P and Q](?mode=apply&ex=coord&a=3&b=4) · [Field](?mode=apply&ex=field&a=3&b=4)
5. **Triples:** drag the point $P$ onto the marked grid points. Which triples are multiples of $(3, 4, 5)$? [Triple 5-12-13](?mode=triples&ta=5&tb=12)
6. **Practice:** calculate the missing side, enter your result and have it checked. “New task” continues. [Practice](?mode=quiz&q=1)

## Exercises

### Exercise 1: Finding the hypotenuse

The legs of a right triangle are $a = 1.5\,\text{cm}$ and $b = 2\,\text{cm}$ long. Calculate $c$. [Load exercise](?a=1.5&b=2&numbers=0&_hide=1)

<details>
<summary>Show solution</summary>

$$c = \sqrt{1.5^2 + 2^2} = \sqrt{2.25 + 4} = \sqrt{6.25} = 2.5\,\text{cm}$$

[Show in the simulation](?a=1.5&b=2)

</details>

### Exercise 2: Finding a leg

The hypotenuse is $c = 10\,\text{cm}$ long and one leg is $a = 6\,\text{cm}$. How long is $b$?

<details>
<summary>Show solution</summary>

$$b = \sqrt{c^2 - a^2} = \sqrt{100 - 36} = \sqrt{64} = 8\,\text{cm}$$

</details>

### Exercise 3: Ladder against a wall (modelling)

A ladder $5\,\text{m}$ long stands with its foot $1.4\,\text{m}$ away from a vertical wall. At what height does it lean against the wall?

<details>
<summary>Show solution</summary>

Ladder, wall and ground form a right triangle with the hypotenuse $5\,\text{m}$:

$$h = \sqrt{5^2 - 1.4^2} = \sqrt{25 - 1.96} = \sqrt{23.04} = 4.8\,\text{m}$$

</details>

### Exercise 4: Right-angled or not?

Check whether the triangles with side lengths $7, 24, 25$ and $5, 6, 8$ are right-angled.

<details>
<summary>Show solution</summary>

- $7^2 + 24^2 = 49 + 576 = 625 = 25^2$ – right-angled (converse of the theorem).
- $5^2 + 6^2 = 61 \neq 64 = 8^2$ – not right-angled. Because $64 > 61$, the angle opposite the longest side is even obtuse.

</details>

### Exercise 5: Screen diagonal

A screen is $60\,\text{cm}$ wide and $35\,\text{cm}$ high. How long is the diagonal? Also give it in inches ($1$ inch $= 2.54\,\text{cm}$). [Load exercise](?mode=apply&ex=screen&a=3.5&b=6&numbers=0&_hide=1)

<details>
<summary>Show solution</summary>

$$d = \sqrt{60^2 + 35^2} = \sqrt{3600 + 1225} = \sqrt{4825} \approx 69.5\,\text{cm} \approx 27.3\ \text{inches}$$

[Show in the simulation](?mode=apply&ex=screen&a=3.5&b=6)

</details>

### Exercise 6: Distance between two points

Calculate the distance between the points $P(1, 1)$ and $Q(5, 4)$. [Load exercise](?mode=apply&ex=coord&a=3&b=4&numbers=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta x = 5 - 1 = 4$, $\Delta y = 4 - 1 = 3$, so $d = \sqrt{4^2 + 3^2} = 5$. [Show in the simulation](?mode=apply&ex=coord&a=3&b=4)

</details>

### Exercise 7: Finding triples

Show that $(20, 21, 29)$ is a Pythagorean triple. Find another triple with $c = 25$.

<details>
<summary>Show solution</summary>

$20^2 + 21^2 = 400 + 441 = 841 = 29^2$ ✓. With $c = 25$: $(7, 24, 25)$, because $49 + 576 = 625$, and $(15, 20, 25)$ as five times $(3, 4, 5)$. [Show the triple](?mode=triples&ta=20&tb=21)

</details>

## Ideas for the classroom

- **Use:** around grade 8/9 (Pythagorean theorem), and earlier as a visual preparation. Counting unit squares in the squares view works particularly well with whole-number triples such as 3-4-5.
- **Proof:** the puzzle proof needs no calculation. Afterwards it can be checked algebraically: $(a + b)^2 = c^2 + 4 \cdot \frac{1}{2}ab$ gives $a^2 + b^2 = c^2$ with the binomial formula.
- **Hands-on converse:** stretch a 3-4-5 triangle in the schoolyard with a string divided into 12 equal sections and check the right angle with a set square; then show in the simulation what happens with other angles.
- **Practice:** the practice tasks are numbered. The same number means the same task – so the whole class can work on the same one. Odd numbers come out exactly; for even ones you have to round.
- **Common pitfalls:**
  - The theorem is applied to triangles that are not right-angled.
  - $c$ is taken to be any side instead of the side opposite the right angle.
  - $\sqrt{a^2 + b^2} = a + b$ – have students check with numbers ($\sqrt{9 + 16} = 5 \neq 7$).
  - For a leg, students add instead of subtract: $b = \sqrt{c^2 - a^2}$.
