---
description: "Interactive simulation of elastic, partially elastic and perfectly inelastic collisions on an air track – with momentum and energy balance, centre of mass and velocity–time and position–time graphs."
---

## What is it about?

Two gliders with masses $m_1$ and $m_2$ glide almost without friction on an air track and collide. The **momentum** of a body is

$$
p = m \cdot v \qquad [p] = 1\,\text{kg}\cdot\tfrac{\text{m}}{\text{s}}
$$

It has a direction: on the track, "to the right" counts as positive and "to the left" as negative. For the closed system of both gliders, the **law of conservation of momentum** holds in **every** collision:

$$
m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'
$$

Kinetic energy $E = \tfrac{1}{2} m v^2$ behaves differently:

**Elastic collision** (spring bumper): kinetic energy is conserved as well. It follows that

$$
v_1' = \frac{(m_1 - m_2)\,v_1 + 2 m_2 v_2}{m_1 + m_2} \qquad v_2' = \frac{(m_2 - m_1)\,v_2 + 2 m_1 v_1}{m_1 + m_2}
$$

**Perfectly inelastic collision** (Velcro): the gliders stick together and move on with

$$
v' = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}
$$

Part of the kinetic energy is converted into **internal energy** (deformation, heating).

**Partially elastic collision** (rubber bumper): the **coefficient of restitution** $k$ tells you how fast the gliders separate afterwards compared with how fast they approached: $v_2' - v_1' = k \cdot (v_1 - v_2)$ with $0 \le k \le 1$.

The common **centre of mass** S moves with $v_S = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$ – the same before, during and after the collision, because $v_S$ is the total momentum divided by the total mass. This lets you write all three types of collision in one formula:

$$
v_1' = v_S - k\,(v_1 - v_S) \qquad v_2' = v_S - k\,(v_2 - v_S)
$$

## Try it

1. Press **Start collision** and watch the arrows. In the balance, compare the total-momentum arrows (purple) before and after the collision.
2. Drag the arrow tips to change $v_1$ and $v_2$ – also to the left. What happens if glider 1 is slower than glider 2?
3. Equal masses, elastic: what happens to the velocities? [Load example](?m2=0.2)
4. Switch to Velcro. What percentage of the kinetic energy is converted? [Load example](?type=inel&m2=0.2)
5. A light glider bounces off a very heavy one. Compare the momentum and the energy of the heavy glider after the collision. [Load example](?m1=0.05&m2=2)
6. Choose the position–time graph. What shape is the line of the centre of mass? [Load example](?type=part&k=0.5&v2=-0.4&m2=0.6&chart=x)

## Tasks

### Task 1: Gliders with Velcro

Glider 1 ($m_1 = 0.2\,\text{kg}$, $v_1 = 0.5\,\tfrac{\text{m}}{\text{s}}$) hits glider 2 ($m_2 = 0.2\,\text{kg}$), which is at rest. They stick together. Calculate the common velocity and the fraction of kinetic energy that is converted. [Load task](?type=inel&m2=0.2&_hide=1)

<details>
<summary>Show solution</summary>

$v' = \frac{0.2 \cdot 0.5}{0.4}\,\tfrac{\text{m}}{\text{s}} = 0.25\,\tfrac{\text{m}}{\text{s}}$. Before: $E = \tfrac{1}{2} \cdot 0.2 \cdot 0.5^2\,\text{J} = 25\,\text{mJ}$, after: $E' = \tfrac{1}{2} \cdot 0.4 \cdot 0.25^2\,\text{J} = 12.5\,\text{mJ}$. Half of the kinetic energy (50 %) becomes internal energy. [Show in the simulation](?type=inel&m2=0.2)

</details>

### Task 2: Light hits heavy

Elastic collision with $m_1 = 0.2\,\text{kg}$, $v_1 = 0.5\,\tfrac{\text{m}}{\text{s}}$ and glider 2 at rest with $m_2 = 0.4\,\text{kg}$. Calculate $v_1'$ and $v_2'$ and check that energy is conserved. [Load task](?_hide=1)

<details>
<summary>Show solution</summary>

$$v_1' = \frac{(0.2 - 0.4) \cdot 0.5}{0.6}\,\tfrac{\text{m}}{\text{s}} \approx -0.167\,\tfrac{\text{m}}{\text{s}} \qquad v_2' = \frac{2 \cdot 0.2 \cdot 0.5}{0.6}\,\tfrac{\text{m}}{\text{s}} \approx 0.333\,\tfrac{\text{m}}{\text{s}}$$

Glider 1 bounces back. Energy: $\tfrac{1}{2} \cdot 0.2 \cdot 0.167^2 + \tfrac{1}{2} \cdot 0.4 \cdot 0.333^2 \approx 2.8\,\text{mJ} + 22.2\,\text{mJ} = 25\,\text{mJ}$, the same as before.

</details>

### Task 3: At rest after the collision

Glider 1 ($m_1 = 0.2\,\text{kg}$) moves to the right at $0.5\,\tfrac{\text{m}}{\text{s}}$, glider 2 ($m_2 = 0.4\,\text{kg}$) comes towards it. Both have Velcro. How fast must glider 2 move so that both are at rest after the collision? Where does the energy go? Check your prediction by setting $v_2$. [Load task](?type=inel&_hide=1)

<details>
<summary>Show solution</summary>

The total momentum must be zero: $0.2 \cdot 0.5 + 0.4 \cdot v_2 = 0$, so $v_2 = -0.25\,\tfrac{\text{m}}{\text{s}}$. All of the kinetic energy, $25\,\text{mJ} + 12.5\,\text{mJ} = 37.5\,\text{mJ}$, is converted into internal energy. [Show in the simulation](?type=inel&v2=-0.25)

</details>

### Task 4: Like hitting a wall

A light glider ($m_1 = 0.05\,\text{kg}$, $v_1 = 0.5\,\tfrac{\text{m}}{\text{s}}$) collides elastically with a glider at rest that is 40 times heavier ($m_2 = 2\,\text{kg}$). Calculate the velocities after the collision. Which glider has more momentum afterwards, and which has more energy? [Load task](?m1=0.05&m2=2&_hide=1)

<details>
<summary>Show solution</summary>

$v_1' = \frac{(0.05 - 2) \cdot 0.5}{2.05}\,\tfrac{\text{m}}{\text{s}} \approx -0.476\,\tfrac{\text{m}}{\text{s}}$, $v_2' = \frac{2 \cdot 0.05 \cdot 0.5}{2.05}\,\tfrac{\text{m}}{\text{s}} \approx 0.024\,\tfrac{\text{m}}{\text{s}}$. With $p_2' \approx 0.049\,\text{kg}\cdot\tfrac{\text{m}}{\text{s}}$ the heavy glider takes almost **twice** the initial momentum ($0.025\,\text{kg}\cdot\tfrac{\text{m}}{\text{s}}$), but only $0.6\,\text{mJ}$ of the $6.25\,\text{mJ}$ of energy. For $m_2 \to \infty$, glider 1 bounces back with $-v_1$, as if from a wall.

</details>

### Task 5: Partially elastic collision

Two gliders of $0.2\,\text{kg}$ each collide partially elastically with $k = 0.5$; glider 1 moves at $0.5\,\tfrac{\text{m}}{\text{s}}$, glider 2 is at rest. Calculate $v_1'$, $v_2'$ and the fraction of energy that is converted. [Load task](?type=part&k=0.5&m2=0.2&_hide=1)

<details>
<summary>Show solution</summary>

$v_S = 0.25\,\tfrac{\text{m}}{\text{s}}$, so $v_1' = 0.25 - 0.5 \cdot (0.5 - 0.25) = 0.125\,\tfrac{\text{m}}{\text{s}}$ and $v_2' = 0.25 + 0.5 \cdot 0.25 = 0.375\,\tfrac{\text{m}}{\text{s}}$. After: $E' = \tfrac{1}{2} \cdot 0.2 \cdot (0.125^2 + 0.375^2)\,\text{J} \approx 15.6\,\text{mJ}$ of $25\,\text{mJ}$ – so $37.5\,\%$ is converted.

</details>

### Task 6: Equal masses, opposite directions

Two gliders of $0.2\,\text{kg}$ each move towards each other: glider 1 at $0.5\,\tfrac{\text{m}}{\text{s}}$ to the right, glider 2 at $0.3\,\tfrac{\text{m}}{\text{s}}$ to the left. The collision is elastic. Predict $v_1'$ and $v_2'$ without a long calculation. [Load task](?m2=0.2&v2=-0.3&_hide=1)

<details>
<summary>Show solution</summary>

With equal masses, the gliders swap their velocities in an elastic collision: $v_1' = -0.3\,\tfrac{\text{m}}{\text{s}}$ (to the left), $v_2' = 0.5\,\tfrac{\text{m}}{\text{s}}$ (to the right). With the formula: $v_1' = \frac{0 \cdot 0.5 + 2 \cdot 0.2 \cdot (-0.3)}{0.4}\,\tfrac{\text{m}}{\text{s}} = -0.3\,\tfrac{\text{m}}{\text{s}}$. Momentum check: $0.2 \cdot 0.5 + 0.2 \cdot (-0.3) = 0.04\,\text{kg}\cdot\tfrac{\text{m}}{\text{s}}$ before and after.

</details>

## Ideas for the classroom

- **Use:** momentum and its conservation in mechanics, grades 10/11 (at the Bavarian Gymnasium as part of Newtonian mechanics; assignment is a draft, please check against the curriculum). Suitable as a substitute for or preparation of the air-track experiment, for practising the collision formulas and for comparing conservation of momentum and of energy.
- **Let students predict:** the "after" balance only appears at the moment of collision. With `_hide=1` (task links) the calculated results are covered, as are the numbers after the collision at the arrows, at the centre of mass and in the energy balance. Arrows, bars and graph stay visible and allow a rough check of one's own calculation.
- **Model:** straight, central collision without friction; the duration of the collision is neglected (the velocities jump). The simulation chooses the starting positions so that the motion fits well onto the $1.6\,\text{m}$ track. Masses up to $2\,\text{kg}$ are shown as slotted masses on the glider.
- **Display:** in the position–time graph the bands show the length of the gliders ($0.2\,\text{m}$); they touch exactly at the collision. The line of the centre of mass is a straight line.
- **Common stumbling blocks:**
  - "Momentum is lost in an inelastic collision." – Momentum is conserved in every collision; only kinetic energy is converted.
  - "Energy is lost." – It becomes internal energy (deformation, heating) and has not disappeared.
  - "Momentum and kinetic energy are the same thing." – Momentum has a direction and is proportional to $v$; energy has no direction and is proportional to $v^2$ (see task 4).
