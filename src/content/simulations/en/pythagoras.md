---
description: Interactive simulation of the Pythagorean theorem – squares on the sides of a right triangle and an animated puzzle proof.
---

## What is it about?

In a **right triangle** the two sides next to the right angle are called **legs** ($a$ and $b$). The side opposite the right angle is called the **hypotenuse** ($c$). It is always the longest side.

> **Pythagorean theorem:** In every right triangle, the areas of the squares on the two legs add up to the area of the square on the hypotenuse:
> $$a^2 + b^2 = c^2$$

This lets you calculate a missing side:

$$
c = \sqrt{a^2 + b^2} \qquad a = \sqrt{c^2 - b^2}
$$

**Converse:** If $a^2 + b^2 = c^2$ holds in a triangle, then it is a right triangle (with the right angle opposite $c$).

### Puzzle proof

Place four identical right triangles inside a square with side length $a + b$.

- In the first arrangement, a square with side length $c$ is left uncovered in the middle: area $c^2$.
- After moving the triangles, two squares are left uncovered: area $a^2 + b^2$.

The big square and the four triangles are the same, so the uncovered area must be the same as well: $c^2 = a^2 + b^2$.

## Try it

1. Drag the two coloured vertices and count the unit squares inside the squares. For the 3-4-5 triangle this works exactly. Does $a^2 + b^2 = c^2$ also hold for the isosceles triangle? [Isosceles](?a=3&b=3)
2. Switch to the **puzzle proof** and let the triangles move. Which areas stay the same? [Puzzle proof](?mode=puzzle)
3. Try the puzzle proof with a flat triangle. Does it still work? [Flat triangle](?mode=puzzle&a=1.5&b=5)

## Exercises

### Exercise 1: Finding the hypotenuse

The legs of a right triangle are $a = 1.5\,\text{cm}$ and $b = 2\,\text{cm}$ long. Calculate $c$.

<details>
<summary>Show solution</summary>

$$c = \sqrt{1.5^2 + 2^2} = \sqrt{2.25 + 4} = \sqrt{6.25} = 2.5\,\text{cm}$$

[Show in the simulation](?a=1.5&b=2)

</details>

### Exercise 2: Finding a leg

The hypotenuse is $c = 10\,\text{cm}$ long, one leg is $a = 6\,\text{cm}$. How long is $b$?

<details>
<summary>Show solution</summary>

$$b = \sqrt{c^2 - a^2} = \sqrt{100 - 36} = \sqrt{64} = 8\,\text{cm}$$

[Show in the simulation](?a=6&b=8)

</details>

### Exercise 3: Ladder against a wall (modelling)

A $5\,\text{m}$ long ladder stands with its foot $1.4\,\text{m}$ away from a vertical wall. At what height does it touch the wall?

<details>
<summary>Show solution</summary>

Ladder, wall and ground form a right triangle with the hypotenuse $5\,\text{m}$:

$$h = \sqrt{5^2 - 1.4^2} = \sqrt{25 - 1.96} = \sqrt{23.04} = 4.8\,\text{m}$$

</details>

### Exercise 4: Right-angled or not?

Check whether the triangles with side lengths $7, 24, 25$ and $5, 6, 8$ are right triangles.

<details>
<summary>Show solution</summary>

- $7^2 + 24^2 = 49 + 576 = 625 = 25^2$ – right-angled (converse of the theorem).
- $5^2 + 6^2 = 61 \neq 64 = 8^2$ – not right-angled. Since $61 < 64$, the angle opposite the longest side is even obtuse.

</details>

## Ideas for the classroom

- **Use:** Bavaria grade 9 (Pythagorean theorem); as a visual preparation also earlier. Counting squares in the squares view works especially well with integer triples such as 3-4-5.
- **Proof:** The puzzle proof needs no calculation. Afterwards you can check it algebraically: $(a + b)^2 = c^2 + 4 \cdot \frac{1}{2}ab$ gives $a^2 + b^2 = c^2$ with the first binomial formula.
- **Common stumbling blocks:**
  - The theorem is applied to triangles that are not right-angled.
  - $c$ is taken to be any side instead of the side opposite the right angle.
  - $\sqrt{a^2 + b^2} = a + b$ – let students check with numbers ($\sqrt{9 + 16} = 5 \neq 7$).
