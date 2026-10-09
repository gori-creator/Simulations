---
description: "Interactive simulation of elastic, partially elastic and perfectly inelastic collisions on an air track – with momentum and energy balance, centre of mass and velocity–time and position–time graphs."
---

## What is it about?

Two gliders with masses $m_1$ and $m_2$ collide on an air track. The **momentum** of a body is $p = m \cdot v$; on the track "to the right" counts as positive. In **every** collision the total momentum is conserved:

$$
m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'
$$

- **Elastic collision** (spring bumper): kinetic energy $E = \tfrac{1}{2} m v^2$ is conserved as well.
- **Perfectly inelastic collision** (Velcro): the gliders stick together and move on with $v' = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$; part of the kinetic energy becomes **internal energy**.
- **Partially elastic collision**: the **coefficient of restitution** $k$ satisfies $v_2' - v_1' = k\,(v_1 - v_2)$.

The **centre of mass** moves with the constant velocity $v_S = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$, and $v_1' = v_S - k\,(v_1 - v_S)$, $v_2' = v_S - k\,(v_2 - v_S)$.

## Try it

1. Press **Start collision** and compare the purple total-momentum arrows before and after.
2. Drag the arrow tips to change $v_1$ and $v_2$.
3. Equal masses, elastic: [load example](?m2=0.2)
4. Velcro: how much kinetic energy is converted? [load example](?type=inel&m2=0.2)
5. A light glider hits a very heavy one: [load example](?m1=0.05&m2=2)

## Tasks

### Task 1: Velcro

Glider 1 ($0.2\,\text{kg}$, $0.5\,\tfrac{\text{m}}{\text{s}}$) hits glider 2 ($0.2\,\text{kg}$) at rest and sticks to it. Find the common velocity and the fraction of kinetic energy converted. [Load task](?type=inel&m2=0.2&_hide=1)

<details>
<summary>Show solution</summary>

$v' = 0.25\,\tfrac{\text{m}}{\text{s}}$; the energy drops from $25\,\text{mJ}$ to $12.5\,\text{mJ}$, so 50 % becomes internal energy.

</details>

### Task 2: Light hits heavy

Elastic collision: $m_1 = 0.2\,\text{kg}$ at $0.5\,\tfrac{\text{m}}{\text{s}}$, $m_2 = 0.4\,\text{kg}$ at rest. Find $v_1'$ and $v_2'$. [Load task](?_hide=1)

<details>
<summary>Show solution</summary>

$v_1' = \frac{(0.2 - 0.4) \cdot 0.5}{0.6}\,\tfrac{\text{m}}{\text{s}} \approx -0.167\,\tfrac{\text{m}}{\text{s}}$ (it bounces back), $v_2' = \frac{2 \cdot 0.2 \cdot 0.5}{0.6}\,\tfrac{\text{m}}{\text{s}} \approx 0.333\,\tfrac{\text{m}}{\text{s}}$.

</details>

### Task 3: At rest afterwards

Glider 1 ($0.2\,\text{kg}$, $0.5\,\tfrac{\text{m}}{\text{s}}$) and glider 2 ($0.4\,\text{kg}$) with Velcro move towards each other. How fast must glider 2 be so that both stop?

<details>
<summary>Show solution</summary>

The total momentum must be zero: $v_2 = -0.25\,\tfrac{\text{m}}{\text{s}}$. All $37.5\,\text{mJ}$ of kinetic energy become internal energy. [Show in the simulation](?type=inel&v2=-0.25)

</details>

## Notes for teachers

- **Use:** momentum and its conservation (grades 10/11), as a substitute for or preparation of the air-track experiment.
- **Model:** central, frictionless collision of negligible duration; the "after" balance only appears at the moment of collision, so students can predict first.
- **Misconception:** "Momentum is lost in an inelastic collision" – momentum is always conserved; only kinetic energy is converted.
