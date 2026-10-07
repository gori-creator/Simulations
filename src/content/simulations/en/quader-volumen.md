---
description: Interactive 3D simulation of the volume of cuboids – unit cubes fill a cuboid row by row and layer by layer; with cm³, dm³, litres and m³.
---

## What is it about?

The **volume** of a solid tells you how many **unit cubes** fit inside. A cube with edge $1\,\text{cm}$ has a volume of $1\,\text{cm}^3$. For a cuboid you do not have to count one by one: a **row** has $a$ cubes, a **layer** has $b$ rows ($a \cdot b$ cubes), and there are $c$ layers:

$$
V = a \cdot b \cdot c
$$

Units of volume differ by a factor of $1000$, because a cube of edge $1\,\text{dm} = 10\,\text{cm}$ holds $10 \cdot 10 \cdot 10 = 1000$ centimetre cubes: $1\,\text{dm}^3 = 1000\,\text{cm}^3 = 1$ litre, $1\,\text{m}^3 = 1000\,\text{dm}^3$.

## Try it

1. Press **Fill** and count along: a row cube by cube, then whole rows, then whole layers.
2. Drag the marked corners of the glass box to change the length, width and height.
3. One litre: fill a cube with edge $10\,\text{cm}$. [1 litre = 1000 cm³](?a=10&b=10&c=10&fill=voll)

## Tasks

### Task 1: Counting cleverly

How many unit cubes fit into a cuboid measuring $6\,\text{cm} \times 4\,\text{cm} \times 3\,\text{cm}$? [Load task](?a=6&b=4&c=3&fill=reihe&count=0&_hide=1)

<details>
<summary>Show solution</summary>

One row: 6, one layer: $4 \cdot 6 = 24$, three layers: $72$. So $V = 72\,\text{cm}^3$.

</details>

### Task 2: Fish tank

A tank measures $60\,\text{cm} \times 30\,\text{cm} \times 40\,\text{cm}$ inside. How many litres does it hold? [Load task](?a=6&b=3&c=4&unit=dm&fill=leer&_hide=1)

<details>
<summary>Show solution</summary>

$6 \cdot 3 \cdot 4\,\text{dm}^3 = 72\,\text{dm}^3 = 72$ litres.

</details>

### Task 3: Doubling

What happens to the volume if you double all three edges?

<details>
<summary>Show solution</summary>

It becomes $2 \cdot 2 \cdot 2 = 8$ times as large. [5 × 3 × 4](?a=5&b=3&c=4&fill=voll) · [10 × 6 × 8](?a=10&b=6&c=8&fill=voll)

</details>

## Notes for teachers

- The formula grows out of structured counting (row → layer → layers). Switch off the counting aid with `count=0` so that students describe the structure themselves.
- **Misconceptions:** volume and surface area are confused; the conversion factor 1000 is mixed up with 100 or 10; doubling all edges is expected to double the volume.
