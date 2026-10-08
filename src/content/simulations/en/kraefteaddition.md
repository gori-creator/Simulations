---
description: "Interactive adding and resolving of forces – parallelogram of forces, head-to-tail addition, resultant, equilibrium and balancing force, components, and the rope force for a lamp on two ropes or a clothesline."
---

## What is it about?

A **force** has a magnitude (in newtons), a direction and a point of application; we draw it as an arrow. Several forces acting at one point can be replaced by a single force with the same effect, the **resultant** $F_R$. Construct it with the **parallelogram of forces** or by placing the arrows **head to tail**. For two perpendicular forces

$$
F_R = \sqrt{F_1^2 + F_2^2}
$$

so $4\,\text{N}$ and $3\,\text{N}$ at right angles give $5\,\text{N}$ – forces add like arrows, not like numbers. A body is in **equilibrium** when the resultant is zero; the head-to-tail polygon then closes.

Conversely, a force can be **resolved** into components along two given directions. For a **lamp on two ropes** at angle $\alpha$ to the horizontal, each rope pulls with

$$
F_S = \frac{F_G}{2 \cdot \sin\alpha}
$$

which equals $F_G$ at $30^\circ$ and becomes very large for flat ropes.

## Try it

1. Drag the arrow tips. When is the resultant largest, when smallest? [Same direction](?w2=0) · [Opposite](?w2=180)
2. Hide the result, construct it yourself, then press **Construct**. [Without result](?f1=5&w1=20&f2=4&w2=110&res=0)
3. Add three forces head to tail and switch on the balancing force. [Three forces](?n3=1&cons=poly&eq=1)
4. Resolve a force along almost opposite directions. [Resolve](?mode=split&f=6&w=-90&d1=170&d2=10)
5. Drag the lamp up and watch the spring balances. [Lamp](?mode=lamp) · [Clothesline](?mode=lamp&obj=line&m=1.5&a=5)

## Tasks

### Task 1: Perpendicular forces

$F_1 = 6\,\text{N}$ to the right and $F_2 = 8\,\text{N}$ upwards. Find the resultant. [Load task](?f1=6&f2=8&res=0&_hide=1)

<details>
<summary>Show solution</summary>

$F_R = \sqrt{6^2 + 8^2}\,\text{N} = 10\,\text{N}$ at about $53^\circ$ to the horizontal.

</details>

### Task 2: Equilibrium

$F_1 = 4\,\text{N}$ to the right and $F_2 = 3\,\text{N}$ upwards act on a ring. Which third force keeps it in equilibrium? [Load task](?n3=1&f3=0&cons=poly&_hide=1)

<details>
<summary>Show solution</summary>

$5\,\text{N}$ in the direction $-143^\circ$, opposite to the resultant. [Show](?n3=1&f3=5&w3=-143&cons=poly)

</details>

### Task 3: Lamp

A $2\,\text{kg}$ lamp hangs on two ropes at $10^\circ$ to the horizontal. Find the rope force. [Load task](?mode=lamp&a=10&_hide=1)

<details>
<summary>Show solution</summary>

$F_S = \frac{19.6\,\text{N}}{2 \cdot \sin 10^\circ} \approx 56.5\,\text{N}$ – almost three times the weight.

</details>

## Notes for teachers

- Everything can be solved graphically with the grid as scale; Pythagoras and trigonometry appear in the results for older students. `res=0` hides the construction, **Construct** and **Resolve** animate it step by step.
- Directions are angles to the horizontal, anticlockwise positive. Ropes and spring balances are massless; the balances have a range of $100\,\text{N}$.
- **Misconceptions:** “forces always add up to $F_1 + F_2$”, “the resultant is an additional force”, “components are always smaller than the force”, “a tight rope can carry more”.
