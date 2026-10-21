---
description: "Interactive simulation for grade 7: construct triangles from three given parts step by step with ruler, set square and compasses – with a sketch, construction steps as in an exercise book and the congruence criteria SSS, SAS, ASA and SsA. Plus the special cases: violated triangle inequality, parallel arms, no, one or two solutions for SSA and similar triangles for AAA."
---

## What is it about?

A triangle has six **parts**: three sides $a$, $b$, $c$ and three angles $\alpha$, $\beta$, $\gamma$. The side $a = [BC]$ lies opposite the vertex $A$, $b = [CA]$ opposite $B$ and $c = [AB]$ opposite $C$; the angle $\alpha$ is at $A$, $\beta$ at $B$, $\gamma$ at $C$. Two triangles that can be moved, turned or reflected so that they fit exactly onto each other are called **congruent**.

Often **three** suitable parts are enough to fix a triangle uniquely. The **congruence criteria** tell you which ones:

| Criterion | given | condition |
| --- | --- | --- |
| SSS | three sides | the longest side is shorter than the sum of the other two |
| SAS | two sides and the **included** angle | angle less than $180°$ |
| ASA | one side and **both adjacent** angles | $\alpha + \beta < 180°$ |
| SsA | two sides and the angle opposite the **longer** side | – |

The condition for SSS is called the **triangle inequality**: $a + b > c$, $a + c > b$ and $b + c > a$. If, for example, $a + b < c$, the circles around $A$ and $B$ do not reach each other; if $a + b = c$, they only touch on the segment $[AB]$ – then there is no “real” triangle.

**Careful with SSA:** If the given angle lies opposite the **shorter** side (e.g. $\alpha$ with $a < c$), the distance $h$ from $B$ to the free arm of $\alpha$ decides:

- $a < h$: The circle around $B$ does not reach the arm – **no** solution.
- $a = h$: The circle **touches** the arm – **exactly one** solution, with a right angle at $C$.
- $h < a < c$: The circle cuts the arm **twice** – **two** different triangles $ABC_1$ and $ABC_2$.

If instead $a \ge c$ (SsA), the second intersection lies behind $A$ on the extension of the arm and gives no triangle – the solution is unique.

**AAA** is not a congruence criterion: three angles only fix the **shape**. Because $\alpha + \beta + \gamma = 180°$, the third angle is already determined by the other two. The triangles are **similar** but of different sizes.

**How to proceed:** First draw a **sketch** and highlight the given parts in colour. Then check which congruence criterion fits. You usually start from the given side: draw the base, mark angles with the set square, transfer lengths with the compasses. The **construction steps** record what you do, e.g. for SSS: “1. Draw $[AB]$ with $c = 6\,\text{cm}$. 2. Draw a circle around $A$ with $r = b$. 3. Draw a circle around $B$ with $r = a$. 4. The circles meet at $C$. 5. Join $C$ to $A$ and $B$.”

## Try it

1. When the page loads, the construction runs through once. Press **“Construct again”** and then step through line by line with **“Next step”**: ruler, compasses and set square work, and the matching line appears in the construction steps. Where would the second intersection of the circles be – and why does it not give a new triangle?
2. [3–4–5 triangle](?c=5&b=4&a=3): Which angle is special here?
3. Drag the point $C$ or $B$ on the finished triangle. Which parts change as well? Then shrink $a$ and $b$ until the circles no longer meet – the red dimension line shows the **gap**. [Example](?c=6&b=3&a=2)
4. [SAS](?cs=sws&c=6&b=4.5&al=50): Turn the arm of $\alpha$ with the round grip. Is there a setting where no triangle appears?
5. [ASA](?cs=wsw&c=6&al=50&be=60): Set $\alpha + \beta$ to exactly [$180°$](?cs=wsw&c=6&al=100&be=80) and then to [more](?cs=wsw&c=6&al=110&be=85). What happens to the arms?
6. [SSA with two solutions](?cs=ssw&c=6&a=4&al=30): Compare $\gamma_1$ and $\gamma_2$ in the result card. Shrink $a$ to [$3\,\text{cm}$](?cs=ssw&c=6&a=3&al=30) and [$2\,\text{cm}$](?cs=ssw&c=6&a=2&al=30), then make it longer than $6\,\text{cm}$ ([SsA](?cs=ssw&c=6&a=7&al=30)). How many solutions are there each time?
7. [AAA](?cs=www&c=4&al=50&be=60): Three triangles with the same angles. Are they congruent?

## Tasks

### Task 1: Constructible?

Can you construct a triangle with $a = 2\,\text{cm}$, $b = 3\,\text{cm}$ and $c = 6\,\text{cm}$? Give a reason without drawing. And with $a = 3\,\text{cm}$, $b = 4\,\text{cm}$, $c = 7\,\text{cm}$? [Load task](?c=6&b=3&a=2&meas=0&_hide=1)

<details>
<summary>Show solution</summary>

No: $a + b = 5\,\text{cm} < 6\,\text{cm} = c$. The circles around $A$ (radius $3\,\text{cm}$) and around $B$ (radius $2\,\text{cm}$) leave a gap of $1\,\text{cm}$ on $[AB]$. [Show](?c=6&b=3&a=2)

The second triangle does not exist either: $3\,\text{cm} + 4\,\text{cm} = 7\,\text{cm}$. The circles touch exactly on $[AB]$, so $C$ would lie on the segment. [Show](?c=7&b=4&a=3)

</details>

### Task 2: Which criterion?

Given $c = 6\,\text{cm}$, $b = 4.5\,\text{cm}$ and $\alpha = 50°$. Which congruence criterion fits? Construct the triangle, write down the construction steps and measure $a$, $\beta$ and $\gamma$. [Load task](?cs=sws&c=6&b=4.5&al=50&meas=0&_hide=1)

<details>
<summary>Show solution</summary>

$\alpha$ lies between $b$ and $c$: SAS, the triangle is unique. 1. Draw $[AB]$ with $c = 6\,\text{cm}$. 2. At $A$, mark the angle $\alpha = 50°$. 3. Draw the free arm. 4. The circle around $A$ with $r = 4.5\,\text{cm}$ cuts it at $C$. 5. Join $C$ to $B$. You measure $a \approx 4.6\,\text{cm}$, $\beta \approx 48°$, $\gamma \approx 82°$; check: $50° + 48° + 82° = 180°$. [Show solution](?cs=sws&c=6&b=4.5&al=50)

</details>

### Task 3: One side and two angles

Construct the triangle with $c = 6\,\text{cm}$, $\alpha = 50°$ and $\beta = 60°$. First calculate $\gamma$, then measure $a$ and $b$. [Load task](?cs=wsw&c=6&al=50&be=60&meas=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma = 180° - 50° - 60° = 70°$. The free arms of $\alpha$ and $\beta$ meet at $C$ (ASA). You measure $a \approx 4.9\,\text{cm}$ and $b \approx 5.5\,\text{cm}$. [Show solution](?cs=wsw&c=6&al=50&be=60)

</details>

### Task 4: Two triangles

Given $c = 6\,\text{cm}$, $\alpha = 30°$ and $a = 4\,\text{cm}$. Construct. Why are there two triangles? [Load task](?cs=ssw&c=6&a=4&al=30&meas=0&_hide=1)

<details>
<summary>Show solution</summary>

The circle around $B$ with radius $4\,\text{cm}$ cuts the free arm of $\alpha$ twice, at $C_1$ and $C_2$. Both triangles have the given parts: $b_1 \approx 7.8\,\text{cm}$, $\gamma_1 \approx 48.6°$ and $b_2 \approx 2.6\,\text{cm}$, $\gamma_2 \approx 131.4°$. The angles at $C$ add up to $180°$ because the triangle $BC_1C_2$ is isosceles. The reason for two solutions: $\alpha$ lies opposite the **shorter** side ($a < c$) – that is SSA, not a congruence criterion. [Show solution](?cs=ssw&c=6&a=4&al=30)

</details>

### Task 5: Exactly one solution

Keep $c = 6\,\text{cm}$ and $\alpha = 30°$. For which lengths $a$ are there no, exactly one or two triangles? Hint: How far is $B$ from the free arm?

<details>
<summary>Show solution</summary>

The perpendicular from $B$ to the arm forms a right-angled triangle with $[AB]$ that has $30°$ at $A$ – half of an equilateral triangle with side $6\,\text{cm}$. So the distance is $h = 3\,\text{cm}$. For $a < 3\,\text{cm}$ there is no solution, for $a = 3\,\text{cm}$ exactly one (right angle at $C$, $b \approx 5.2\,\text{cm}$), for $3\,\text{cm} < a < 6\,\text{cm}$ two, and for $a \ge 6\,\text{cm}$ exactly one again. [Show touching](?cs=ssw&c=6&a=3&al=30)

</details>

### Task 6: Same angles – same triangle? (Challenge)

Paul claims: “If two triangles agree in all three angles, they are congruent.” Prove him wrong with $\alpha = 50°$ and $\beta = 60°$. [Show](?cs=www&c=4&al=50&be=60)

<details>
<summary>Show solution</summary>

With $c = 4\,\text{cm}$ and with $c = 6.4\,\text{cm}$ you get two triangles with $\alpha = 50°$, $\beta = 60°$ and $\gamma = 70°$. The second is $1.6$ times as large – the triangles are similar but not congruent. A congruence criterion always includes at least one side.

</details>

## Ideas for the classroom

- **Use:** grade 7, unit on congruence and triangle constructions (in Bavaria: LehrplanPLUS Gymnasium; please check the exact name in the curriculum). On the projector the simulation can construct step by step while the class draws along in their exercise books; afterwards the lines of the construction steps can be compared together.
- **Task mode:** With “Measure the missing parts” switched off (`meas=0`) the construction starts on a blank sheet and measurements and verdict stay hidden. Students construct on their own first and then compare with “Next step”.
- **Model:** The construction always starts from the base $[AB]$, with $C$ above it; the intersection below gives a reflected, i.e. congruent, triangle. Lengths are set to $0.1\,\text{cm}$, angles to $1°$; measured parts are shown with “≈”.
- **Common stumbling blocks:**
  - The sketch is skipped or the parts are assigned wrongly (e.g. $a$ to the wrong side).
  - For SAS an angle is used that does **not** lie between the two sides – that is SSA.
  - For SSA only one of the two solutions is drawn.
  - “Three angles fix a triangle.” – They only fix the shape, not the size.
  - When marking $\beta$, the set square is placed on the wrong side or the wrong scale is read.
