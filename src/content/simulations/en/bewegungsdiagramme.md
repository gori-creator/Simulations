---
description: Interactive motion graphs – a car moves uniformly, accelerates or follows a schedule while the distance–time, velocity–time and acceleration–time graphs appear live.
---

## What is it about?

The position $s$ of the car is plotted against time $t$. The **velocity** is the slope of the s–t graph, $v = \frac{\Delta s}{\Delta t}$ ($1\,\tfrac{\text{m}}{\text{s}} = 3.6\,\tfrac{\text{km}}{\text{h}}$).

- **Uniform motion:** $s(t) = s_0 + v \cdot t$ – a straight line in the s–t graph, a horizontal line in the v–t graph.
- **Uniformly accelerated motion:** $a = \frac{\Delta v}{\Delta t}$, $v(t) = v_0 + a t$, $s(t) = s_0 + v_0 t + \tfrac12 a t^2$ – a parabola in the s–t graph. Starting from rest, the distances in equal time intervals grow like $1 : 3 : 5 : 7$.
- The **area** under the v–t graph is the displacement $\Delta s$. Braking from $v_0$ with deceleration $|a|$ takes the distance $s_B = \frac{v_0^2}{2|a|}$.

## Try it

1. Press **Start** and watch the stroboscope: equal gaps for uniform motion.
2. Drive backwards. [Example](?v=-5&s0=50)
3. Accelerate from rest and compare the gaps. [Example](?mode=acc)
4. Choose the **schedule** and drag the corners of the v–t graph. [Example](?mode=plan)

## Tasks

### Task 1: Braking distance

A car moving at $20\,\tfrac{\text{m}}{\text{s}}$ brakes at $a = -5\,\tfrac{\text{m}}{\text{s}^2}$. Find the braking distance. What happens at twice the speed? [Load task](?mode=acc&v0=20&a=-5&T=6&_hide=1)

<details>
<summary>Show solution</summary>

$s_B = \frac{20^2}{2 \cdot 5}\,\text{m} = 40\,\text{m}$ after $4\,\text{s}$. At $40\,\tfrac{\text{m}}{\text{s}}$ it is $160\,\text{m}$ – four times as far.

</details>

### Task 2: Evaluate a schedule

From rest to $15\,\tfrac{\text{m}}{\text{s}}$ in $5\,\text{s}$, then $10\,\text{s}$ at constant speed, then braking to rest in $5\,\text{s}$. Find the total distance and the average velocity. [Load task](?mode=plan&_hide=1)

<details>
<summary>Show solution</summary>

Areas: $37.5\,\text{m} + 150\,\text{m} + 37.5\,\text{m} = 225\,\text{m}$, so $\bar v = \frac{225\,\text{m}}{20\,\text{s}} = 11.25\,\tfrac{\text{m}}{\text{s}}$.

</details>

### Task 3: There and back

In the example “There and back” the car returns to its start. Compare displacement and distance travelled. [Load task](?mode=plan&v1=8&t1=4&v2=-8&t2=8&v3=0&t3=4&_hide=1)

<details>
<summary>Show solution</summary>

Displacement $0$, distance travelled $64\,\text{m}$. At the turning point $v = 0$ but $a = -2\,\tfrac{\text{m}}{\text{s}^2}$.

</details>

## Notes for teachers

- Many textbooks write $x$ instead of $s$ for the position. The car is treated as a point (white marker); braking stops at $v = 0$.
- Switch off “Show the graphs before the trip” for prediction tasks.
- **Misconceptions:** reading the s–t graph as a picture of the path; “high in the v–t graph means far away”; “$v = 0$ implies $a = 0$”.
