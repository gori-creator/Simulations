---
description: "Interactive simulation for grade 10: the law of sines and the law of cosines in a general triangle – circumcircle and proof via the altitude, squares on the sides with the correction 2ab · cos γ, a solver for SSS, SAS, ASA and SSA (with two solutions) and two surveying tasks on a map."
---

## What is it about?

In any triangle a side and the angle **opposite** it belong together: $a$ and $\alpha$, $b$ and $\beta$, $c$ and $\gamma$ – in the simulation they share a colour.

**Law of sines:** the ratio of a side to the sine of its opposite angle is the same for all three sides – and equals the diameter $2r$ of the circumcircle:

$$
\frac{a}{\sin \alpha} = \frac{b}{\sin \beta} = \frac{c}{\sin \gamma} = 2r
$$

*Proof idea:* the altitude $h_c$ (foot $F$) splits the triangle into two right triangles, so $h_c = b \cdot \sin \alpha$ and $h_c = a \cdot \sin \beta$. Equate and divide by $\sin \alpha \cdot \sin \beta$.

**Law of cosines:**

$$
c^2 = a^2 + b^2 - 2ab \cdot \cos \gamma
$$

The picture shows squares on the sides. The altitudes divide them into rectangles; the two rectangles at vertex $C$ each have area $ab \cdot \cos \gamma$. For $\gamma = 90°$ they vanish (**Pythagoras**); for an obtuse $\gamma$ they lie outside and are added.

**Area:** $A = \frac12 \cdot a \cdot b \cdot \sin \gamma$. **Which law?** SSS and SAS → law of cosines; ASA → angle sum, then law of sines; SSA → law of sines, with 0, 1 or 2 solutions (e.g. $\sin \gamma = 0{,}75$ gives $\gamma \approx 48{,}59°$ or $131{,}41°$).

## Try it

1. [Law of sines](?m=sin): drag the vertices – the three bars always stay as long as $2r$. Press **“Play the proof”**.
2. [Law of cosines](?m=cos): press **“Sweep γ through 90°”** and watch the orange rectangles at $C$.
3. [Which law fits?](?m=solve&g=sws&a=7&b=5&ga=60): tap SSS, SAS, ASA and SSA at the top and solve step by step. For [SSA](?m=solve&g=ssw&a=4&c=6&al=30), reduce $a$ to $3$ and then to $2$.
4. Applications: [tree across the river](?m=app&app=tree) and [across the lake](?m=app&app=lake).

## Tasks

### Task 1: Two sides and the included angle

$a = 7\,\text{cm}$, $b = 5\,\text{cm}$, $\gamma = 60°$. Find $c$ and the area. [Load task](?m=solve&g=sws&a=7&b=5&ga=60&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$c^2 = 49 + 25 - 35 = 39$, $c \approx 6{,}24\,\text{cm}$; $A = \frac12 \cdot 7 \cdot 5 \cdot \sin 60° \approx 15{,}16\,\text{cm}^2$. [Show](?m=solve&g=sws&a=7&b=5&ga=60)

</details>

### Task 2: Two triangles?

$a = 4\,\text{cm}$, $c = 6\,\text{cm}$, $\alpha = 30°$. [Load task](?m=solve&g=ssw&a=4&c=6&al=30&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\sin \gamma = \frac{6 \cdot 0{,}5}{4} = 0{,}75$, so $\gamma_1 \approx 48{,}59°$ ($b_1 \approx 7{,}84\,\text{cm}$) or $\gamma_2 \approx 131{,}41°$ ($b_2 \approx 2{,}55\,\text{cm}$). Both work. [Show](?m=solve&g=ssw&a=4&c=6&al=30)

</details>

### Task 3: Surveying

Baseline $200\,\text{m}$, angles $70°$ at $A$ and $60°$ at $B$ to a tree $T$. [Load task](?m=app&app=tree&s=200&p1=70&p2=60&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Angle at $T$: $50°$. $|AT| = \frac{200 \cdot \sin 60°}{\sin 50°} \approx 226{,}1\,\text{m}$, $|BT| \approx 245{,}3\,\text{m}$, distance to the baseline $\approx 212{,}5\,\text{m}$. [Show](?m=app&app=tree&s=200&p1=70&p2=60)

</details>

## Ideas for the classroom

*Just suggestions – you know your class best.*

- Grade 10 (Bavarian Gymnasium, law of sines and cosines; please check the exact curriculum reference). Let students watch the bars first (“what stays the same?”) before playing the proof.
- Sort cards with given parts (SSS, SAS, ASA, SSA), then solve in the solver with “Show results” off.
- **Common stumbling blocks:**
  - pairing a side with an angle that is not opposite to it; computing $a^2 + b^2 - 2ab$ first and then multiplying by $\cos \gamma$;
  - missing the second SSA solution $180° - \gamma$; the calculator set to radians.
