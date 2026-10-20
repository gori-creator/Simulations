---
description: "Interactive roller coaster on conservation of energy – energy bars, synchronised energy graphs, a custom track, forces in the loop and a series of measurements for the smallest starting height."
---

## What is it about?

At the start the car has **potential energy**; rolling down, it turns into **kinetic energy** and back again:

$$
E_\text{pot} = m \cdot g \cdot h \qquad E_\text{kin} = \tfrac{1}{2}\, m\, v^2
$$

Without friction the total stays constant, so $v = \sqrt{2 g\,(h_0 - h)}$ – the mass cancels out. The car turns back exactly at the starting height and only gets over hills lower than $h_0$. With **friction** part of the energy becomes heat $W_\text{f}$: $E_\text{pot} + E_\text{kin} + W_\text{f} = m g h_0$.

**Loop (radius $r$):** at the top $v \geq \sqrt{g r}$ is needed, so without friction the car must start at least $2.5\,r$ above the lowest point. Starting lower (but above $r$) it would fall out at the height $h = \frac{2h_0 + r}{3}$ without safety bars.

## Try it

1. Press **Go** and watch the energy bars. Tap the track to set measuring points; drag the car before the ride.
2. Switch on friction. [With friction](?mu=0.03)
3. Open the energy graphs: potential energy along the path looks like the track, the gap up to the horizontal line is the kinetic energy. [Energy graphs](?mode=energy&track=tal&h0=15&mu=0.02)
4. Build your own track by dragging points 1–4. [Custom track](?track=eigen)
5. Compare the loop from 20 m and from 13 m. [20 m](?mode=loop&track=looping&h0=20) · [13 m](?mode=loop&track=looping&h0=13)
6. Find the smallest starting height for the loop. [Start the task](?mode=task&track=looping&h0=10&_hide=1)

## Tasks

### Task 1: Speed in the valley

The car starts in the valley at $15\,\text{m}$. How fast is it at the lowest point (no friction)? [Load task](?track=tal&h0=15&_hide=1)

<details>
<summary>Show solution</summary>

$v = \sqrt{2 \cdot 9.81 \cdot 15}\,\tfrac{\text{m}}{\text{s}} \approx 17.2\,\tfrac{\text{m}}{\text{s}} \approx 62\,\tfrac{\text{km}}{\text{h}}$

</details>

### Task 2: Energies on the way

A car with $m = 400\,\text{kg}$ starts at $20\,\text{m}$. Find $E_\text{pot}$ at the start and $v$ at $10\,\text{m}$. [Load task](?track=tal&h0=20&m=400&_hide=1)

<details>
<summary>Show solution</summary>

$E_\text{pot} = 400 \cdot 9.81 \cdot 20\,\text{J} = 78\,480\,\text{J}$. At $10\,\text{m}$ half of it is kinetic energy: $v = \sqrt{2 \cdot 9.81 \cdot 10}\,\tfrac{\text{m}}{\text{s}} \approx 14.0\,\tfrac{\text{m}}{\text{s}}$.

</details>

### Task 3: Minimum height for the loop

Show that without friction the car needs at least $2.5\,r = 15\,\text{m}$ for the loop with $r = 6\,\text{m}$.

<details>
<summary>Show solution</summary>

At the top $m g \leq m v^2/r$, so $v^2 \geq g r$. Energy: $m g h_0 = m g \cdot 2r + \tfrac12 m v^2 \geq 2.5\, m g r$, hence $h_0 \geq 15\,\text{m}$; then $v_\text{top} = \sqrt{9.81 \cdot 6}\,\tfrac{\text{m}}{\text{s}} \approx 7.67\,\tfrac{\text{m}}{\text{s}}$. [16 m](?mode=loop&track=looping&h0=16)

</details>

## Ideas for the classroom

- **Use:** conservation of energy (grades 9/10); the loop as an extension on circular motion. The discovery task works well in groups, first without, then with friction (with $\mu = 0.02$ about $17\,\text{m}$ are needed).
- **Model:** point mass on the rail, friction proportional to the normal force, $g = 9.81\,\tfrac{\text{m}}{\text{s}^2}$; the car is drawn larger than to scale.
- **Common stumbling blocks:**
  - "Heavier cars are faster." – The speed does not depend on the mass.
  - "Friction destroys energy." – It is converted into internal energy.
  - "A starting height of $2r$ is enough for the loop." – The car still needs speed at the top.
