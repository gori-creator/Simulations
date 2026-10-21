---
description: "Interactive simulation for grade 7: vertical and adjacent angles at two intersecting lines, comparing corresponding, alternate and co-interior angles at a transversal by sliding and turning, and giving reasons for angle sizes."
---

## What is it about?

**Two lines intersect** at the point $S$. This forms four angles $\alpha$, $\beta$, $\gamma$, $\delta$ (anticlockwise).

- **Vertical angles** lie opposite each other at the intersection. They are **equal**: $\alpha = \gamma$ and $\beta = \delta$.
- **Adjacent angles** lie side by side on a line and together form a straight angle. They **add up to $180^\circ$**: $\alpha + \beta = 180^\circ$.

Example: if the lines intersect at $\alpha = 65^\circ$, then $\gamma = 65^\circ$ and $\beta = \delta = 180^\circ - 65^\circ = 115^\circ$. All four angles together make $360^\circ$. If the lines are perpendicular, all four angles are $90^\circ$.

**Transversal:** two lines $g$ and $h$ are crossed by a third line $s$. There are four angles at each crossing: $\alpha_1, \beta_1, \gamma_1, \delta_1$ at $g$ and $\alpha_2, \beta_2, \gamma_2, \delta_2$ at $h$.

| Pair of angles | Position | Shape | if $g \parallel h$ |
| --- | --- | --- | --- |
| corresponding angles | same position at both crossings | F | equal |
| alternate angles | opposite sides of $s$, both between $g$ and $h$ (or both outside) | Z | equal |
| co-interior angles | same side of $s$, both between $g$ and $h$ (or both outside) | C (in German books: E) | add up to $180^\circ$ |

Why? If you slide the crossing at $g$ along $s$ until it lies on the crossing at $h$, then $g$ covers $h$ exactly when $g \parallel h$ – and then the corresponding angles cover each other too. Alternate angles are vertical angles of corresponding angles: $\gamma_2 = \alpha_2 = \alpha_1$. Conversely: if corresponding (or alternate) angles are equal, then $g$ and $h$ are parallel.

$$
g \parallel h \;\Longrightarrow\; \alpha_1 = \alpha_2, \qquad \alpha_1 = \gamma_2, \qquad \alpha_1 + \delta_2 = 180^\circ
$$

## Try it

1. Drag the handles on $g$ and $h$. Which angles always stay equal? What do two neighbouring angles add up to? [Load example](?w=65&a=20)
2. Press “Join adjacent angles” and “Turn vertical angle”. Tap a different angle first.
3. Set up [perpendicular lines](?w=90&a=0) and [almost parallel lines](?w=8&a=15). What happens to the adjacent angles?
4. Switch to the [transversal](?mode=doppel). Press “Slide along s”: the crossing at $g$ slides upwards. What do you notice?
5. Choose [alternate angles](?mode=doppel&rel=wechsel&g=62&s=60) and press “Turn by 180°”.
6. Switch off “g ∥ h” ([example](?mode=doppel&par=0&g=50&h=58)) and slide again. How big is the difference?
7. Give a reason for every angle in the [exercise mode](?mode=aufgabe). Compare with the reason in the side panel.

## Tasks

### Task 1: Four angles

Two lines intersect at $\alpha = 38^\circ$. Find $\beta$, $\gamma$ and $\delta$ and give reasons. [Load task](?w=38&a=10&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma = 38^\circ$ (vertical angle to $\alpha$), $\beta = 180^\circ - 38^\circ = 142^\circ$ (adjacent angle to $\alpha$), $\delta = 142^\circ$ (vertical angle to $\beta$). Check: $38^\circ + 142^\circ + 38^\circ + 142^\circ = 360^\circ$. [Show in the simulation](?w=38&a=10)

</details>

### Task 2: Three times as big

An angle is three times as big as its adjacent angle. How big are the two angles?

<details>
<summary>Show solution</summary>

Adjacent angle $x$, angle $3x$: $x + 3x = 180^\circ$, so $4x = 180^\circ$ and $x = 45^\circ$. The angles are $45^\circ$ and $135^\circ$. [Show in the simulation](?w=45&a=0)

</details>

### Task 3: Eight angles at parallels

$g \parallel h$, the transversal $s$ crosses $g$ at $\alpha_1 = 62^\circ$. Find all eight angles. [Load task](?mode=doppel&g=62&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma_1 = 62^\circ$ (vertical angle), $\beta_1 = \delta_1 = 180^\circ - 62^\circ = 118^\circ$ (adjacent angles). Because $g \parallel h$, corresponding angles are equal: $\alpha_2 = \gamma_2 = 62^\circ$, $\beta_2 = \delta_2 = 118^\circ$. So every angle is either $62^\circ$ or $118^\circ$. [Show in the simulation](?mode=doppel&g=62)

</details>

### Task 4: A chain of reasons

$g \parallel h$ and $\beta_2 = 70^\circ$. Find $\alpha_1$ and give a reason for every step. [Load task](?mode=aufgabe&gi=b2&gv=70&tg=5)

<details>
<summary>Show solution</summary>

$\alpha_2 = 180^\circ - 70^\circ = 110^\circ$ (adjacent angle to $\beta_2$), then $\alpha_1 = \alpha_2 = 110^\circ$ (corresponding angles, $g \parallel h$). Other ways are just as correct, e.g. $\beta_1 = \beta_2 = 70^\circ$ (corresponding angles) and $\alpha_1 = 180^\circ - 70^\circ = 110^\circ$ (adjacent angles).

</details>

### Task 5: Parallel or not?

The transversal $s$ crosses $g$ at $\alpha_1 = 50^\circ$ and $h$ at $\alpha_2 = 58^\circ$. Are $g$ and $h$ parallel? Give a reason using a pair of angles. [Load task](?mode=doppel&par=0&g=50&h=58&vals=0)

<details>
<summary>Show solution</summary>

No. $\alpha_1$ and $\alpha_2$ are corresponding angles. If $g$ and $h$ were parallel, they would have to be equal; but they differ by $58^\circ - 50^\circ = 8^\circ$. So the lines intersect somewhere (here outside the picture). [Sliding shows the difference](?mode=doppel&par=0&g=50&h=58)

</details>

### Task 6: The converse (extension)

At a transversal, $\alpha_1 = 75^\circ$ and $\delta_2 = 105^\circ$. Explain why $g \parallel h$.

<details>
<summary>Show solution</summary>

$\alpha_2 = 180^\circ - \delta_2 = 75^\circ$ (adjacent angles). So the corresponding angles $\alpha_1$ and $\alpha_2$ are equal, and therefore $g \parallel h$. Shorter: the co-interior angles $\alpha_1$ and $\delta_2$ add up to $75^\circ + 105^\circ = 180^\circ$. [Show in the simulation](?mode=doppel&rel=nachbar&g=75)

</details>

## Ideas for the classroom

- **Use:** grade 7, angles in figures: vertical, adjacent, corresponding and alternate angles as groundwork for proving the angle sum of a triangle. The animations work well as a whole-class introduction on the whiteboard, the exercise mode for individual or pair work with spoken reasons.
- **Reasoning:** In the exercise mode, every tapped angle shows a short chain of reasons. You could let students give their own reasons first and use the chain shown for comparison – there are often several correct ways.
- **Terms:** Several names are common for co-interior angles (same-side interior angles, allied angles, C or U shape; German books often say E shape). Some textbooks write $\alpha'$, $\beta'$, … instead of $\alpha_2$, $\beta_2$, … Please check which terms your textbook uses.
- **Model:** Angles are rounded to whole degrees; $g \parallel h$ here means that $s$ crosses both lines at the same angle.
- **Common stumbling blocks:**
  - “Corresponding angles are always equal” – only if $g$ and $h$ are parallel. Sliding with non-parallel lines makes the difference visible.
  - Mixing up vertical and adjacent angles: vertical angles lie opposite and share only the vertex, adjacent angles share an arm.
  - Looking for alternate angles on the same side of $s$ – the Z shape helps.
  - Reasons that leave out the condition “because $g \parallel h$”.
