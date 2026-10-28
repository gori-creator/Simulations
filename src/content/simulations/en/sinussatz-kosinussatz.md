---
description: "Interactive simulation for grade 10: the law of sines and the law of cosines in a general triangle – circumcircle and proof via the altitude, squares on the sides with the correction 2ab · cos γ, a solver for SSS, SAS, ASA and SSA (with two solutions) and two surveying tasks on a map."
---

## What is it about?

Sine, cosine and tangent help in a **right** triangle. For **any** triangle there are two laws. A side and the angle **opposite** it always belong together: $a$ and $\alpha$, $b$ and $\beta$, $c$ and $\gamma$ – in the simulation they share a colour.

**Law of sines:** In every triangle the ratio of a side to the sine of its opposite angle is the same for all three sides – and it equals the diameter $2r$ of the circumcircle:

$$
\frac{a}{\sin \alpha} = \frac{b}{\sin \beta} = \frac{c}{\sin \gamma} = 2r
$$

*Proof idea:* The altitude $h_c$ (foot $F$) splits the triangle into two right triangles. In triangle $AFC$, $\sin \alpha = \frac{h_c}{b}$, so $h_c = b \cdot \sin \alpha$; in triangle $BFC$, $h_c = a \cdot \sin \beta$. Equate and divide by $\sin \alpha \cdot \sin \beta$: $\frac{a}{\sin \alpha} = \frac{b}{\sin \beta}$. If an angle is obtuse, $F$ lies outside, and you need $\sin(180° - \alpha) = \sin \alpha$.

**Law of cosines:** For the side $c$ opposite $\gamma$,

$$
c^2 = a^2 + b^2 - 2ab \cdot \cos \gamma
$$

This is “Pythagoras with a correction”. The picture shows squares on the sides. The altitudes divide them into rectangles; the two rectangles at vertex $C$ each have area $ab \cdot \cos \gamma$. Take them away, and what is left is exactly as large as the square on $c$.

For $\gamma < 90°$, $\cos \gamma > 0$: the correction is subtracted, $c^2 < a^2 + b^2$. For $\gamma = 90°$, $\cos \gamma = 0$ – **Pythagoras’ theorem**. For $\gamma > 90°$, $\cos \gamma < 0$: the rectangles lie outside and are added, $c^2 > a^2 + b^2$.

Rearranged, you get an angle from three sides: $\cos \gamma = \frac{a^2 + b^2 - c^2}{2ab}$. **Area:** From $A = \frac12 \cdot c \cdot h_c$ and $h_c = b \cdot \sin \alpha$ it follows that $A = \frac12 \cdot b \cdot c \cdot \sin \alpha$, and likewise $A = \frac12 \cdot a \cdot b \cdot \sin \gamma$.

**Which law fits?** Three sides (SSS) or two sides and the angle between them (SAS): **law of cosines**. One side and two angles (ASA, angle sum first) or two sides and the angle opposite one of them (SSA): **law of sines**.

**The SSA case:** $a$, $c$ and the angle $\alpha$ opposite $a$ are given. The law of sines gives $\sin \gamma = \frac{c \cdot \sin \alpha}{a}$. There are three possibilities:

- $\sin \gamma > 1$: **no** triangle. The circle about $B$ with radius $a$ does not reach the free arm.
- $\sin \gamma = 1$ or $a \geq c$: **exactly one** triangle. For $\sin \gamma = 1$, $\gamma = 90°$ and the circle only touches the arm.
- $\sin \gamma < 1$ and $a < c$: **two** triangles. For example, $\sin \gamma = 0.75$ gives $\gamma_1 \approx 48.59°$ and $\gamma_2 = 180° - \gamma_1 \approx 131.41°$.

If $\alpha$ is obtuse, there is a triangle only if $a$ is the longest side ($a > c$).

## Try it

1. [Law of sines](?m=sin): Drag the vertices. The three bars always stay as long as the diameter $2r$. The dark part is the side – what share of the bar is it?
2. Press **“Play the proof”**: the altitude drops, the two smaller triangles light up one after the other, and the calculation appears line by line. With an [obtuse angle at B](?m=sin&ax=1&ay=1&bx=7&by=1&cx=10&cy=4): where is $F$ now? Why does the law still hold?
3. [Law of cosines](?m=cos): Press **“Sweep γ through 90°”** and watch the orange rectangles at vertex $C$. What happens at $90°$, and after that? Compare [γ = 90°](?m=cos&ax=2&ay=7&bx=10&by=1&cx=2&cy=1) and [obtuse γ](?m=cos&ax=0.5&ay=1&bx=11.5&by=1&cx=4&cy=3.5).
4. [Which law fits?](?m=solve&g=sws&a=7&b=5&ga=60): Tap SSS, SAS, ASA and SSA at the top of the picture. Let the simulation show you the solution step by step.
5. [SSA with two solutions](?m=solve&g=ssw&a=4&c=6&al=30): Reduce $a$ to $3\,\text{cm}$ and then to $2\,\text{cm}$. How many triangles are there each time?
6. Applications: one ASA case, one SAS case – [tree across the river](?m=app&app=tree) and [across the lake](?m=app&app=lake). Press “Play the measurement” and drag the points on the map.

## Tasks

### Task 1: Two sides and the included angle

You are given $a = 7\,\text{cm}$, $b = 5\,\text{cm}$ and $\gamma = 60°$. Find $c$ and the area. [Load task](?m=solve&g=sws&a=7&b=5&ga=60&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$c^2 = 49 + 25 - 2 \cdot 7 \cdot 5 \cdot \cos 60° = 74 - 35 = 39$, so $c = \sqrt{39}\,\text{cm} \approx 6.24\,\text{cm}$. $A = \frac12 \cdot 7 \cdot 5 \cdot \sin 60° \approx 15.16\,\text{cm}^2$. [Show solution](?m=solve&g=sws&a=7&b=5&ga=60)

</details>

### Task 2: Angles from three sides

A triangle has sides $4\,\text{cm}$, $5\,\text{cm}$ and $6\,\text{cm}$. Find all angles. [Load task](?m=solve&g=sss&a=4&b=5&c=6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Opposite the longest side: $\cos \gamma = \frac{16 + 25 - 36}{2 \cdot 4 \cdot 5} = \frac{5}{40} = 0.125$, so $\gamma \approx 82.82°$. $\cos \alpha = \frac{25 + 36 - 16}{2 \cdot 5 \cdot 6} = 0.75$, so $\alpha \approx 41.41°$. $\beta = 180° - \alpha - \gamma \approx 55.77°$. [Show solution](?m=solve&g=sss&a=4&b=5&c=6)

</details>

### Task 3: Two triangles?

You are given $a = 4\,\text{cm}$, $c = 6\,\text{cm}$ and $\alpha = 30°$. Find $\gamma$ and $b$. How many triangles are there? [Load task](?m=solve&g=ssw&a=4&c=6&al=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Law of sines: $\sin \gamma = \frac{6 \cdot \sin 30°}{4} = 0.75$. So $\gamma_1 \approx 48.59°$ or $\gamma_2 \approx 131.41°$. Since $30° + 131.41° < 180°$, both are possible: $\beta_1 \approx 101.41°$, $b_1 \approx 7.84\,\text{cm}$ and $\beta_2 \approx 18.59°$, $b_2 \approx 2.55\,\text{cm}$. There are two triangles (areas about $11.76\,\text{cm}^2$ and $3.83\,\text{cm}^2$). [Show solution](?m=solve&g=ssw&a=4&c=6&al=30)

</details>

### Task 4: Tree across the river

A baseline $|AB| = 200\,\text{m}$ is marked out on the bank. From $A$ the tree $T$ on the other bank is seen at $\alpha = 70°$ to the baseline, from $B$ at $\beta = 60°$. How far is the tree from $A$ and from $B$, and how far from the baseline? [Load task](?m=app&app=tree&s=200&p1=70&p2=60&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Angle at the tree: $180° - 70° - 60° = 50°$. Law of sines: $|AT| = \frac{200\,\text{m} \cdot \sin 60°}{\sin 50°} \approx 226.1\,\text{m}$ and $|BT| = \frac{200\,\text{m} \cdot \sin 70°}{\sin 50°} \approx 245.3\,\text{m}$. Distance to the baseline: $d = |AT| \cdot \sin 70° \approx 212.5\,\text{m}$. [Show solution](?m=app&app=tree&s=200&p1=70&p2=60)

</details>

### Task 5: Across the lake

From a point $C$, the places $A$ and $B$ on either side of a lake are $400\,\text{m}$ and $300\,\text{m}$ away. The angle $\angle ACB$ is $50°$. How far apart are $A$ and $B$? [Load task](?m=app&app=lake&d1=400&d2=300&w=50&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Law of cosines: $c^2 = 300^2 + 400^2 - 2 \cdot 300 \cdot 400 \cdot \cos 50° \approx 250{,}000 - 154{,}269 = 95{,}731$, so $c \approx 309.4\,\text{m}$. [Show solution](?m=app&app=lake&d1=400&d2=300&w=50)

</details>

### Task 6: Give reasons (puzzle)

a) In a triangle, $c^2 > a^2 + b^2$. What follows for $\gamma$? b) Why is there only one triangle in the SSA case if the side opposite the given angle is the longer one ($a \geq c$)?

<details>
<summary>Show solution</summary>

a) From $c^2 = a^2 + b^2 - 2ab \cdot \cos \gamma > a^2 + b^2$ it follows that $\cos \gamma < 0$, so $\gamma$ is obtuse. [Show example](?m=cos&ax=0.5&ay=1&bx=11.5&by=1&cx=4&cy=3.5)

b) The longer side is opposite the larger angle. From $a \geq c$ it follows that $\gamma \leq \alpha$, and since $\alpha + \gamma < 180°$, $\gamma$ must be acute. The second solution $180° - \gamma$ would be at least as large as $180° - \alpha$ – then there would be no room left for $\beta$. [Show example](?m=solve&g=ssw&a=7&c=6&al=30)

</details>

## Ideas for the classroom

- **Use:** About grade 10, the law of sines and cosines and sine/cosine on the unit circle. Prior knowledge: $\sin(180° - \alpha) = \sin \alpha$ and $\cos(180° - \alpha) = -\cos \alpha$.
- **Discover before proving:** First let students just watch the bars (“what stays the same while dragging?”), then comment on “Play the proof” together. The same works for the γ sweep in the law of cosines: when is the correction subtracted, when is it added?
- **Decision training:** Have students sort cards with the given parts (SSS, SAS, ASA, SSA); then let them calculate on their own in the solver with “Show results” off (`show=0`). The cases match the congruence criteria from grade 7; in the SSA case the circle construction shows why there can be two points of intersection.
- **Common stumbling blocks:**
  - In the law of sines, a side is paired with an angle that is not opposite it.
  - In the law of cosines, $a^2 + b^2 - 2ab$ is calculated first and then multiplied by $\cos \gamma$.
  - In the SSA case only $\sin^{-1}$ is used and the second solution $180° - \gamma$ is missed.
  - The law of sines is used for an obtuse angle – the calculator then returns the acute angle. Safer: find the largest angle with the law of cosines.
  - The calculator is set to radians.
