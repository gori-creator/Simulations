---
description: "Interactive simulation for year 7: construct triangles from three given parts with ruler, set square and compasses step by step, meet the congruence criteria SSS, SAS, ASA and SsA, and explore special cases such as the triangle inequality, two solutions for SSA and similar triangles for AAA."
---

## What is it about?

A triangle has six **parts**: the sides $a$, $b$, $c$ (opposite the vertices $A$, $B$, $C$) and the angles $\alpha$, $\beta$, $\gamma$. Three suitable parts are often enough to fix a triangle completely. Triangles that can be moved onto each other exactly are **congruent**.

- **SSS:** three sides – if the **triangle inequality** holds ($a + b > c$ and so on).
- **SAS:** two sides and the angle **between** them.
- **ASA:** a side and both **adjacent** angles, with $\alpha + \beta < 180°$.
- **SsA:** two sides and the angle opposite the **longer** one.

If the given angle is opposite the **shorter** side (SSA), there may be two triangles, one or none. **AAA** only fixes the shape: the triangles are **similar**, not congruent.

## Try it

1. Step through the [SSS construction](?cs=sss&c=6&b=4.5&a=5). Then make $a + b$ smaller than $c$: [example](?c=7&b=3&a=2.5).
2. [SAS](?cs=sws&c=7&b=4&al=40): drag $C$ or $B$ at the end.
3. [ASA](?cs=wsw&c=6&al=45&be=70): what happens when $\alpha + \beta \ge 180°$?
4. [SSA with two solutions](?cs=ssw&c=7&a=4.5&al=35): compare $\gamma_1$ and $\gamma_2$.
5. [AAA](?cs=www&c=4&al=50&be=60): same angles, different sizes.

## Tasks

### Task 1: Possible?

Is there a triangle with $a = 3\,\text{cm}$, $b = 4\,\text{cm}$, $c = 8\,\text{cm}$? [Load task](?c=8&b=4&a=3&_hide=1)

<details>
<summary>Show solution</summary>

No: $a + b = 7\,\text{cm} < 8\,\text{cm}$, so the arcs never meet. [Show](?c=8&b=4&a=3)

</details>

### Task 2: Two triangles

Construct the triangle with $c = 7\,\text{cm}$, $\alpha = 35°$, $a = 4.5\,\text{cm}$. Why are there two? [Load task](?cs=ssw&c=7&a=4.5&al=35&_hide=1)

<details>
<summary>Show solution</summary>

The arc around $B$ cuts the free arm of $\alpha$ twice ($b_1 \approx 7.8\,\text{cm}$, $b_2 \approx 3.7\,\text{cm}$), because $\alpha$ is opposite the shorter side ($a < c$). [Show](?cs=ssw&c=7&a=4.5&al=35)

</details>

### Task 3: Angles too large

Can you construct a triangle with $c = 5\,\text{cm}$, $\alpha = 110°$, $\beta = 75°$?

<details>
<summary>Show solution</summary>

No – the angle sum would already exceed $180°$; the arms diverge. [Show](?cs=wsw&c=5&al=110&be=75)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Demonstrate a construction on the projector while students construct in their exercise books, then let them write the construction steps in their own words.
- Let students test which combinations of three parts fix a triangle; SSA and AAA show why the conditions matter.
- **Common stumbling blocks:** skipping the sketch, mixing up which side is opposite which vertex, taking an angle that is not between the two sides (SSA instead of SAS), believing that three angles fix a triangle.
