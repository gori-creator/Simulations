---
description: "Interactive adding and resolving of forces – parallelogram of forces, head-to-tail addition, resultant, equilibrium and balancing force, components, and the rope force for a lamp on two ropes or a clothesline."
---

## What is it about?

A **force** has a magnitude (in newtons), a direction and a point of application. We draw it as a **force arrow**: the length shows the magnitude (e.g. $1\,\text{cm} \mathrel{\widehat{=}} 1\,\text{N}$), the arrowhead shows the direction.

If several forces act at the same point, they can be replaced by **one** force with the same effect, the **resultant** $F_R$.

- **Same direction:** $F_R = F_1 + F_2$.
- **Opposite directions:** $F_R$ = larger minus smaller force, e.g. $F_R = F_1 - F_2$ for $F_1 > F_2$. $F_R$ points in the direction of the larger force. If both are equal, $F_R = 0\,\text{N}$.
- **Any directions – parallelogram of forces:** Complete the two force arrows to a parallelogram. The diagonal starting at the point of application is the resultant.
- **Head to tail:** Equivalently, shift the arrows parallel and attach each tail to the previous head. $F_R$ runs from the start of the first to the head of the last arrow. The order does not matter, so you can also add three or more forces (**polygon of forces**).

If two forces are **perpendicular**, Pythagoras' theorem gives the magnitude:

$$
F_R = \sqrt{F_1^2 + F_2^2} \qquad \text{e.g. } \sqrt{(4\,\text{N})^2 + (3\,\text{N})^2} = 5\,\text{N}
$$

In general, for the angle $\gamma$ between the forces, $F_R^2 = F_1^2 + F_2^2 + 2\,F_1 F_2 \cos\gamma$. So forces add like arrows, not like numbers: $4\,\text{N}$ and $3\,\text{N}$ give anything between $1\,\text{N}$ and $7\,\text{N}$, depending on the direction.

**Equilibrium:** A body is in equilibrium when the resultant of all forces is zero. The **balancing force** that keeps two forces in equilibrium is as large as $F_R$ but points the opposite way. If you place all forces head to tail, the polygon closes.

**Resolving a force:** Conversely, a force can be resolved into two **components** along given directions. Draw lines through the arrowhead parallel to the two directions. For perpendicular directions, $F_1 = F \cdot \cos\alpha$ and $F_2 = F \cdot \sin\alpha$, where $\alpha$ is the angle between $F$ and direction 1. Together, the components can be larger than the force itself!

**Lamp on two ropes:** The two rope forces together must balance the weight $F_G$. If both ropes make the angle $\alpha$ with the horizontal, each rope carries half of the load with its vertical part:

$$
2 \cdot F_S \cdot \sin\alpha = F_G \qquad\Longrightarrow\qquad F_S = \frac{F_G}{2 \cdot \sin\alpha}
$$

At $\alpha = 30^\circ$ each rope force is exactly as large as $F_G$; with flat ropes it is many times larger. That is why a clothesline with washing can never be pulled completely straight.

## Try it

1. Drag the arrow tips of $F_1$ and $F_2$. When is the resultant largest, when smallest? [Same direction](?w2=0) · [Opposite](?w2=180)
2. Hide the result, construct the resultant in your exercise book, then press **Construct**. [Without result](?f1=5&w1=20&f2=4&w2=110&res=0)
3. Add three forces head to tail. Does the resultant change if you swap the order of the forces? [Three forces](?n3=1&cons=poly)
4. Switch on the balancing force. Where is it in the parallelogram, where in the polygon? [Balancing force](?eq=1) · [Polygon](?n3=1&cons=poly&eq=1)
5. Resolve a force into two directions and turn the directions apart. [Resolve](?mode=split) · [Almost opposite directions](?mode=split&f=6&w=-90&d1=170&d2=10)
6. Drag the lamp up and watch the spring balances and the graph. [Lamp](?mode=lamp) · [Clothesline](?mode=lamp&obj=line&m=1.5&a=5)

## Tasks

### Task 1: Perpendicular forces

Two forces $F_1 = 6\,\text{N}$ (to the right) and $F_2 = 8\,\text{N}$ (upwards) act at the same point. Find the resultant by drawing and by calculation. [Load task](?f1=6&f2=8&res=0&_hide=1)

<details>
<summary>Show solution</summary>

$F_R = \sqrt{(6\,\text{N})^2 + (8\,\text{N})^2} = 10\,\text{N}$, at about $53^\circ$ to the horizontal. [Show solution](?f1=6&f2=8)

</details>

### Task 2: Two tugboats

Two tugboats pull a ship with $5\,\text{kN}$ each, at $30^\circ$ to the left and to the right of the direction of travel. How large is the pulling force in the direction of travel? (In the simulation: $1\,\text{N} \mathrel{\widehat{=}} 1\,\text{kN}$) [Load task](?f1=5&w1=30&f2=5&w2=-30&res=0&_hide=1)

<details>
<summary>Show solution</summary>

The parallelogram is a rhombus. $F_R = 2 \cdot 5\,\text{kN} \cdot \cos 30^\circ \approx 8.7\,\text{kN}$ – less than $10\,\text{kN}$, because the sideways parts cancel out. [Show solution](?f1=5&w1=30&f2=5&w2=-30)

</details>

### Task 3: Equilibrium

$F_1 = 4\,\text{N}$ to the right and $F_2 = 3\,\text{N}$ upwards act on a ring. Which third force keeps the ring in equilibrium? Set it in the simulation. [Load task](?n3=1&f3=0&cons=poly&_hide=1)

<details>
<summary>Show solution</summary>

The balancing force of the resultant: $5\,\text{N}$, direction $180^\circ + 37^\circ = 217^\circ$, i.e. $-143^\circ$ (down to the left). Then the polygon of forces closes. [Show solution](?n3=1&f3=5&w3=-143&cons=poly)

</details>

### Task 4: Resolving a force

A sledge is pulled with $8\,\text{N}$ on a string that rises at $30^\circ$ to the horizontal. Which part pulls the sledge forwards, which part lifts it? [Load task](?mode=split&f=8&w=30&res=0&_hide=1)

<details>
<summary>Show solution</summary>

Forwards: $8\,\text{N} \cdot \cos 30^\circ \approx 6.9\,\text{N}$, upwards: $8\,\text{N} \cdot \sin 30^\circ = 4\,\text{N}$. [Show solution](?mode=split&f=8&w=30)

</details>

### Task 5: Lamp

A lamp with $m = 2\,\text{kg}$ hangs on two ropes that make an angle of $10^\circ$ with the horizontal. How large is the force in each rope? [Load task](?mode=lamp&a=10&vals=0&_hide=1)

<details>
<summary>Show solution</summary>

$F_G = 2\,\text{kg} \cdot 9.81\,\tfrac{\text{N}}{\text{kg}} \approx 19.6\,\text{N}$, so $F_S = \frac{19.6\,\text{N}}{2 \cdot \sin 10^\circ} \approx 56.5\,\text{N}$ – almost three times the weight. [Show solution](?mode=lamp&a=10)

</details>

### Task 6: Pulled tight

At which rope angle is each rope force as large as the weight? Why does a tight clothesline break more easily than a sagging one?

<details>
<summary>Show solution</summary>

$F_S = F_G$ holds for $\sin\alpha = \tfrac12$, i.e. $\alpha = 30^\circ$. The flatter the line, the smaller $\sin\alpha$ and the larger the rope force. At $5^\circ$ it is already almost six times the weight of the washing. [Clothesline](?mode=lamp&obj=line&m=1.5&a=5)

</details>

## Ideas for the classroom

- **Use:** force as a directed quantity, adding and resolving forces, equilibrium (grades 8–10). Without trigonometry everything can be solved by drawing to scale; the grid shows the scale (“1 square ≙ … N”). Pythagoras, sine and cosine appear in the results for older students.
- **Task mode:** With `res=0` the parallelogram, polygon and components are hidden; **Construct** and **Resolve** show the construction step by step. `_hide=1` also covers the numbers in the results, `vals=0` the values at the arrows and the readings of the spring balances.
- **Directions** are given as angles to the horizontal pointing right (anticlockwise positive, $-180^\circ$ to $180^\circ$). When dragging, angles snap to multiples of $15^\circ$ and magnitudes to half newtons.
- **Model lamp/clothesline:** ropes and spring balances are massless, the load hangs in the middle between suspension points at the same height. The spring balances have a range of $100\,\text{N}$. With very steep ropes the suspension points move closer together in the drawing so that the lamp stays in the scene; the angle is always correct.
- **Common stumbling blocks:**
  - “Forces always add up to $F_1 + F_2$.” – only for the same direction.
  - “The resultant is an additional force.” – It **replaces** the individual forces; it does not act in addition.
  - “Components are always smaller than the force.” – For almost opposite directions they become very large.
  - “A tight rope can carry more.” – It is loaded more; the rope force grows the flatter the rope is.
