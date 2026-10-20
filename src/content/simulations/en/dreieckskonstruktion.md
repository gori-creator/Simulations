---
description: "Interactive simulation for grade 7: construct triangles from three given parts step by step with ruler, set square and compasses – with a sketch, construction steps as in an exercise book and the congruence criteria SSS, SAS, ASA and SsA. Plus the special cases: violated triangle inequality, parallel arms, no, one or two solutions for SSA and similar triangles for AAA."
---

## What is it about?

A triangle has six **parts**: the sides $a = [BC]$, $b = [CA]$, $c = [AB]$ (each opposite the vertex with the same letter) and the angles $\alpha$, $\beta$, $\gamma$ at $A$, $B$, $C$. Triangles that can be moved, turned or reflected onto each other are **congruent**.

Three suitable parts are often enough to fix a triangle. The **congruence criteria**:

| Criterion | given | condition |
| --- | --- | --- |
| SSS | three sides | the longest side is shorter than the other two together |
| SAS | two sides and the **included** angle | angle below $180°$ |
| ASA | one side and **both adjacent** angles | $\alpha + \beta < 180°$ |
| SsA | two sides and the angle opposite the **longer** one | – |

The SSS condition is the **triangle inequality**. If $a + b < c$, the circles around $A$ and $B$ do not reach each other.

**SSA** (angle opposite the **shorter** side, e.g. $\alpha$ with $a < c$) depends on the distance $h$ from $B$ to the free arm of $\alpha$: no solution for $a < h$, exactly one (right angle at $C$) for $a = h$, and **two** different triangles for $h < a < c$. **AAA** only fixes the shape: the triangles are **similar** but can have any size.

## Try it

1. When the page loads, the construction runs once. Press **“Construct again”** and step through with **“Next step”**: ruler, compasses and set square work, and the matching line appears in the construction steps.
2. Drag $C$ or $B$, then shrink $a$ and $b$ until the circles no longer meet – the red dimension line shows the **gap**. [Example](?c=6&b=3&a=2)
3. [ASA](?cs=wsw&c=6&al=50&be=60): set $\alpha + \beta$ to exactly [$180°$](?cs=wsw&c=6&al=100&be=80). What happens to the arms?
4. [SSA with two solutions](?cs=ssw&c=6&a=4&al=30): change $a$ to [$3\,\text{cm}$](?cs=ssw&c=6&a=3&al=30) and [$2\,\text{cm}$](?cs=ssw&c=6&a=2&al=30). How many triangles are there?

## Tasks

### Task 1: Constructible?

Is there a triangle with $a = 2\,\text{cm}$, $b = 3\,\text{cm}$ and $c = 6\,\text{cm}$? [Load task](?c=6&b=3&a=2&meas=0&_hide=1)

<details>
<summary>Show solution</summary>

No: $a + b = 5\,\text{cm} < 6\,\text{cm} = c$. The circles leave a gap of $1\,\text{cm}$ on $[AB]$. [Show](?c=6&b=3&a=2)

</details>

### Task 2: Which criterion?

Given $c = 6\,\text{cm}$, $b = 4.5\,\text{cm}$ and $\alpha = 50°$. Which criterion fits? Construct and measure $a$. [Load task](?cs=sws&c=6&b=4.5&al=50&meas=0&_hide=1)

<details>
<summary>Show solution</summary>

$\alpha$ lies between $b$ and $c$: SAS, the triangle is unique. You measure $a \approx 4.6\,\text{cm}$, $\beta \approx 48°$, $\gamma \approx 82°$. [Show](?cs=sws&c=6&b=4.5&al=50)

</details>

### Task 3: Two triangles

Given $c = 6\,\text{cm}$, $\alpha = 30°$ and $a = 4\,\text{cm}$. Why are there two triangles? [Load task](?cs=ssw&c=6&a=4&al=30&meas=0&_hide=1)

<details>
<summary>Show solution</summary>

The circle around $B$ with radius $4\,\text{cm}$ cuts the arm of $\alpha$ twice: $b_1 \approx 7.8\,\text{cm}$ ($\gamma_1 \approx 48.6°$) and $b_2 \approx 2.6\,\text{cm}$ ($\gamma_2 \approx 131.4°$). The angle lies opposite the shorter side, so SSA is not a criterion. With $a = 3\,\text{cm}$ (the distance $h$) there is exactly one triangle, with $a = 2\,\text{cm}$ none. [Show](?cs=ssw&c=6&a=4&al=30)

</details>

## Ideas for the classroom

- **Use:** grade 7, congruence and triangle constructions. The simulation can construct step by step on the projector while the class draws along; with `meas=0` the sheet starts blank and measurements stay hidden, so students construct first and compare afterwards.
- **Common stumbling blocks:**
  - The sketch is skipped or parts are assigned to the wrong side.
  - For SAS an angle is used that does **not** lie between the two sides – that is SSA.
  - For SSA only one of the two solutions is drawn.
  - “Three angles fix a triangle” – they only fix its shape.
