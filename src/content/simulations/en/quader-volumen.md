---
description: Interactive 3D simulation of the volume of cuboids – unit cubes fill a cuboid row by row and layer by layer; with cm³, dm³, litres and m³.
---

## What is it about?

The **volume** of a solid tells you how many **unit cubes** fit inside. A unit cube with edge length $1\,\text{cm}$ has a volume of $1\,\text{cm}^3$ (one **cubic centimetre**).

For a cuboid you do not have to count the cubes one by one:

- A **row** along the length $a$ consists of $a$ cubes.
- A **layer** on the bottom consists of $b$ such rows, so of $a \cdot b$ cubes.
- The cuboid has $c$ layers on top of each other.

$$
V = a \cdot b \cdot c
$$

Example: A cuboid with $a = 5\,\text{cm}$, $b = 3\,\text{cm}$ and $c = 4\,\text{cm}$ has the volume $V = 5 \cdot 3 \cdot 4\,\text{cm}^3 = 60\,\text{cm}^3$. Since the base area is $G = a \cdot b$, we also have $V = G \cdot c$.

**Units of volume:** A cube with edge length $1\,\text{dm} = 10\,\text{cm}$ holds $10 \cdot 10 \cdot 10 = 1000$ centimetre cubes. That is why the conversion factor for units of volume is $1000$:

$$
1\,\text{m}^3 = 1000\,\text{dm}^3, \qquad 1\,\text{dm}^3 = 1000\,\text{cm}^3, \qquad 1\,\text{cm}^3 = 1000\,\text{mm}^3
$$

For liquids we use **litres**: $1\,\text{l} = 1\,\text{dm}^3$ and $1\,\text{ml} = 1\,\text{cm}^3$.

## Try it

1. Press **Fill** and count along: first one row cube by cube, then whole rows, then whole layers.
2. Drag the marked corners of the glass box to change the length, width and height. How does the counting aid change?
3. Double the height $c$. What happens to the volume? Then double the length $a$ as well.
4. One litre: fill a cube with edge length $10\,\text{cm}$. [1 litre = 1000 cm³](?a=10&b=10&c=10&fill=voll)
5. Compare a flat and a tall cuboid. [Just one layer](?a=8&b=5&c=1&fill=voll) · [Tall tower](?a=2&b=2&c=9&fill=voll)

## Tasks

### Task 1: Counting systematically

How many unit cubes fit into a cuboid with $a = 6\,\text{cm}$, $b = 4\,\text{cm}$ and $c = 3\,\text{cm}$? Describe how you count. [Load task](?a=6&b=4&c=3&fill=reihe&count=0&_hide=1)

<details>
<summary>Show solution</summary>

One row has 6 cubes, one layer $4 \cdot 6 = 24$ cubes, three layers $3 \cdot 24 = 72$ cubes. So $V = 6 \cdot 4 \cdot 3\,\text{cm}^3 = 72\,\text{cm}^3$. [Show solution](?a=6&b=4&c=3&fill=voll)

</details>

### Task 2: Same volume, different shape

Find as many different cuboids as possible made of exactly $24$ unit cubes. The edge lengths should be whole numbers up to $10$; a rotated cuboid does not count as new.

<details>
<summary>Show solution</summary>

There are four: $1 \cdot 3 \cdot 8$, $1 \cdot 4 \cdot 6$, $2 \cdot 2 \cdot 6$ and $2 \cdot 3 \cdot 4$. With longer edges, $1 \cdot 2 \cdot 12$ and $1 \cdot 1 \cdot 24$ would be added. All of them have the same volume but look very different. [Example 4 × 3 × 2](?a=4&b=3&c=2&fill=voll) · [Example 8 × 3 × 1](?a=8&b=3&c=1&fill=voll)

</details>

### Task 3: Doubling the height

A cuboid has a volume of $60\,\text{cm}^3$. What is the volume if you (a) double the height, (b) double the length and the height, (c) double all three edges?

<details>
<summary>Show solution</summary>

(a) $120\,\text{cm}^3$ – twice as many layers. (b) $240\,\text{cm}^3$ – factor $2 \cdot 2 = 4$. (c) $480\,\text{cm}^3$ – factor $2 \cdot 2 \cdot 2 = 8$. [Original cuboid 5 × 3 × 4](?a=5&b=3&c=4&fill=voll) · [all edges doubled](?a=10&b=6&c=8&fill=voll)

</details>

### Task 4: The fish tank

A fish tank is $60\,\text{cm}$ long, $30\,\text{cm}$ wide and $40\,\text{cm}$ high on the inside. How many litres of water does it hold? Tip: calculate in decimetres. [Load task](?a=6&b=3&c=4&unit=dm&fill=leer&_hide=1)

<details>
<summary>Show solution</summary>

$60\,\text{cm} = 6\,\text{dm}$, $30\,\text{cm} = 3\,\text{dm}$, $40\,\text{cm} = 4\,\text{dm}$. $V = 6 \cdot 3 \cdot 4\,\text{dm}^3 = 72\,\text{dm}^3 = 72\,\text{l}$.

</details>

### Task 5: Converting units

Give in the other unit: (a) $3\,\text{dm}^3$ in $\text{cm}^3$, (b) $2500\,\text{cm}^3$ in litres, (c) $0.5\,\text{m}^3$ in litres.

<details>
<summary>Show solution</summary>

(a) $3000\,\text{cm}^3$ (b) $2.5\,\text{l}$ (c) $500\,\text{l}$ – the conversion factor is always $1000$, because a large cube holds $10 \cdot 10 \cdot 10$ small ones.

</details>

## Ideas for the classroom

- **Use:** About grade 5/6 (volume): volume of cuboids via unit cubes, units of volume including litres.
- **Didactic core:** The formula $V = a \cdot b \cdot c$ grows out of structured counting (row → layer → layers). You can switch off the counting aid (`count=0`) so that students describe the structure themselves.
- **Common stumbling blocks:**
  - Volume and surface area are confused ("counting outside" instead of "filling inside").
  - The conversion factor 1000 is mixed up with 100 (units of area) or 10 (units of length). The cube with $10\,\text{cm}$ edges shows clearly why $1\,\text{dm}^3 = 1000\,\text{cm}^3$.
  - When all edges are doubled, students expect twice the volume instead of eight times.
- **Operation:** You can also drag the edges directly at the marked corners; "Fill level" jumps with an animation to empty, one row, one layer or full.
