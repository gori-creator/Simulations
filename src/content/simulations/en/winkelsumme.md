---
description: "Interactive simulation for year 7: tear off the corners of a triangle and join them into a straight angle, prove the angle sum with a parallel line and alternate angles, split polygons into n − 2 triangles and discover that the exterior angles add up to 360°."
---

## What is it about?

In **every triangle** the interior angles add up to $180^\circ$: $\alpha + \beta + \gamma = 180^\circ$.

**Proof with a parallel:** draw the line $g$ through $C$ parallel to $AB$. Then $\alpha' = \alpha$ and $\beta' = \beta$ are **alternate angles** (Z shape). Together with $\gamma$ they form a **straight angle** on $g$: $\alpha' + \gamma + \beta' = 180^\circ$.

From one corner an $n$-gon splits into $n - 2$ triangles, so the **angle sum of an $n$-gon** is

$$
(n - 2) \cdot 180^\circ
$$

e.g. $360^\circ$ for $n = 4$, $540^\circ$ for $n = 5$, $1440^\circ$ for $n = 10$. Each angle of a **regular** $n$-gon is $(n - 2) \cdot 180^\circ : n$ ($108^\circ$ for a pentagon). The formula also holds for non-convex polygons, but not if sides cross. Walking once around a convex polygon you turn through all **exterior angles** – one full turn, $360^\circ$. In a triangle, $\alpha^* = \beta + \gamma$.

## Try it

1. Drag the corners. What happens to the sum?
2. Press “Tear off the corners” and “Proof with a parallel”.
3. Switch on the [exterior angles](?ax=1&ay=2&bx=15&by=2&cx=5&cy=6&ext=1) and compare $\alpha^*$ with $\beta + \gamma$.
4. Split a [pentagon](?mode=poly) into triangles, then change $n$ and compare with the table.
5. Look at a [non-convex hexagon](?mode=poly&n=6&pts=2,1;14,1;14,11;8,6.5;2,11;4,6) and at [crossing sides](?mode=poly&n=4&pts=2,2;12,10;12,2;2,10).
6. [Walk around](?mode=poly&n=8&ext=1) a regular octagon.

## Tasks

### Task 1: The third angle

$\alpha = 48^\circ$, $\beta = 67^\circ$. Find $\gamma$.

<details>
<summary>Show solution</summary>

$\gamma = 180^\circ - 48^\circ - 67^\circ = 65^\circ$.

</details>

### Task 2: Octagon

Find the angle sum of an octagon and one angle of a regular octagon.

<details>
<summary>Show solution</summary>

$6 \cdot 180^\circ = 1080^\circ$; $1080^\circ : 8 = 135^\circ$. [Show](?mode=poly&n=8)

</details>

### Task 3: Working backwards

A polygon has an angle sum of $1260^\circ$. How many corners does it have?

<details>
<summary>Show solution</summary>

$1260^\circ : 180^\circ = 7 = n - 2$, so $n = 9$. [Show](?mode=poly&n=9)

</details>

### Task 4: Exterior angles

Each exterior angle of a regular polygon is $40^\circ$. How many corners does it have?

<details>
<summary>Show solution</summary>

$360^\circ : 40^\circ = 9$ corners; each interior angle is $140^\circ$. [Show](?mode=poly&n=9&ext=1)

</details>

## Ideas for the classroom

- Start with real paper triangles, then compare with the animation; use the parallel proof to show why the experiment always works.
- Let students fill in the table for $n = 3 \ldots 10$ and find the rule themselves.
- **Common stumbling blocks:** thinking bigger triangles have a bigger angle sum; drawing diagonals from several corners (more than $n - 2$ triangles); mixing up alternate and corresponding angles; missing the reflex angle in non-convex polygons.
