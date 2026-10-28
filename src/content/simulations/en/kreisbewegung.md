---
description: "Interactive simulation of uniform circular motion: speed, period, centripetal acceleration and centripetal force – with a ball on a string that can break and a car that skids out of a bend if it is too fast."
---

## What is it about?

In **uniform circular motion** the speed stays the same, but the **direction** of the velocity changes all the time; it always points along the **tangent**. For one revolution on a circle with radius $r$ the body needs the **period** $T$; the **frequency** is $f = \frac{1}{T}$ (unit $\frac{1}{\text{s}} = \text{Hz}$). For engines and machines it is often given as **revolutions per minute** (rpm): $1200\,\text{rpm} = \frac{1200}{60\,\text{s}} = 20\,\text{Hz}$.

$$
v = \frac{2\pi r}{T} \qquad \omega = \frac{2\pi}{T} = \frac{v}{r}
$$

($v$ is the **speed along the path**, $\omega = 2\pi f$ is the **angular velocity**; it gives the angle in radians per second.) Because the direction of $v$ changes, circular motion is an **accelerated** motion. The **centripetal acceleration** points to the centre:

$$
a_Z = \frac{v^2}{r} = \omega^2 \cdot r
$$

By Newton's second law this needs a force towards the centre, the **centripetal force**:

$$
F_Z = m \cdot \frac{v^2}{r} = m \cdot \omega^2 \cdot r
$$

The centripetal force is not a separate kind of force. Something else provides it: the **string** for the ball, **static friction** between tyres and road for the car, gravity for planets. Without it the body moves on in a straight line at constant speed because of its **inertia** – along the tangent.

**Centrifugal force?** On a merry-go-round you feel pushed outwards. This "centrifugal force" is a **fictitious force**: you only need it when you calculate in the rotating frame that moves with you. Seen from outside – as in this simulation – there is only the centripetal force towards the centre.

For a car, static friction is at most $F_{H,\max} = \mu_H \cdot m \cdot g$. From $m \frac{v^2}{r} \le \mu_H m g$ we get the **maximum speed in a bend**

$$
v_{\max} = \sqrt{\mu_H \cdot g \cdot r}
$$

It does not depend on the mass, but strongly on the state of the road.

## Try it

1. Press **Start**. In which direction do the velocity arrow and the force arrow point?
2. Press **Cut the string**. Does the ball fly outwards or along the tangent?
3. Halve the period. How do $v$ and $F_Z$ change? [Load example](?T=0.6)
4. Choose the graph "force against radius": for a fixed period $F_Z$ grows with $r$, for a fixed speed it decreases. [Load example](?chart=r)
5. Switch on "Positions at equal time intervals": the ball covers arcs of equal length in equal times. [Load example](?trace=1)
6. Reduce $T$ until the string breaks. [Too fast](?T=0.4)
7. Switch to the car and try a wet road, snow and ice. [Wet road](?mode=car&road=wet&vc=18)

## Tasks

### Task 1: Ball on a string

A ball ($m = 0.2\,\text{kg}$) moves in a circle on a string of length $0.8\,\text{m}$ with the period $T = 1.2\,\text{s}$. Calculate $v$, $a_Z$ and $F_Z$. [Load task](?_hide=1)

<details>
<summary>Show solution</summary>

$$v = \frac{2\pi \cdot 0.8\,\text{m}}{1.2\,\text{s}} \approx 4.19\,\tfrac{\text{m}}{\text{s}} \qquad a_Z = \frac{v^2}{r} \approx 21.9\,\tfrac{\text{m}}{\text{s}^2} \qquad F_Z = m \cdot a_Z \approx 4.39\,\text{N}$$

Also: $f = \frac{1}{1.2\,\text{s}} \approx 0.83\,\text{Hz}$ and $\omega = \frac{2\pi}{T} \approx 5.24\,\tfrac{1}{\text{s}}$. Check: $a_Z = \omega^2 \cdot r \approx 27.4 \cdot 0.8 \approx 21.9\,\tfrac{\text{m}}{\text{s}^2}$.

</details>

### Task 2: When does the string break?

The string from task 1 withstands at most $30\,\text{N}$. At which period does it break? [Load task](?_hide=1)

<details>
<summary>Show solution</summary>

From $F_Z = m \cdot \frac{4\pi^2 r}{T^2}$ we get $T = 2\pi \sqrt{\frac{m \cdot r}{F_Z}} = 2\pi \sqrt{\frac{0.2 \cdot 0.8}{30}}\,\text{s} \approx 0.46\,\text{s}$. For a shorter period the string breaks. [Show in the simulation](?T=0.4)

</details>

### Task 3: Maximum speed in a bend

A car drives through a bend with $r = 50\,\text{m}$. How fast may it go at most on a dry road ($\mu_H = 0.8$), and how fast on a wet road ($\mu_H = 0.5$)? [Load task](?mode=car&_hide=1)

<details>
<summary>Show solution</summary>

Dry: $v_{\max} = \sqrt{0.8 \cdot 9.81 \cdot 50}\,\tfrac{\text{m}}{\text{s}} \approx 19.8\,\tfrac{\text{m}}{\text{s}} \approx 71\,\tfrac{\text{km}}{\text{h}}$. Wet: $\sqrt{0.5 \cdot 9.81 \cdot 50}\,\tfrac{\text{m}}{\text{s}} \approx 15.7\,\tfrac{\text{m}}{\text{s}} \approx 56\,\tfrac{\text{km}}{\text{h}}$.

</details>

### Task 4: Heavy van

A van is twice as heavy as a car. May it drive through the same bend faster or slower?

<details>
<summary>Show solution</summary>

Equally fast: centripetal force and static friction are both proportional to $m$, so the mass cancels in $v_{\max} = \sqrt{\mu_H g r}$. (In reality tyres, centre of mass and braking distance also matter.) [Show with 2400 kg](?mode=car&mc=2400)

</details>

### Task 5: Black ice

On black ice ($\mu_H = 0.1$) a car drives at $10\,\tfrac{\text{m}}{\text{s}}$ (36 km/h). What is the smallest possible radius of the bend? [Load task](?mode=car&road=ice&vc=10&chart=r&_hide=1)

<details>
<summary>Show solution</summary>

$r_{\min} = \frac{v^2}{\mu_H \cdot g} = \frac{100}{0.1 \cdot 9.81}\,\text{m} \approx 102\,\text{m}$. In the bend with $r = 50\,\text{m}$ the car skids.

</details>

### Task 6: Spin cycle of a washing machine

The drum of a washing machine ($r = 0.25\,\text{m}$) spins at $1200\,\text{rpm}$. Calculate $f$, $\omega$, $v$ and $a_Z$. How many times the gravitational acceleration $g$ is $a_Z$?

<details>
<summary>Show solution</summary>

$f = \frac{1200}{60\,\text{s}} = 20\,\text{Hz}$, $\omega = 2\pi f \approx 126\,\tfrac{1}{\text{s}}$, $v = \omega \cdot r \approx 31.4\,\tfrac{\text{m}}{\text{s}}$, $a_Z = \omega^2 \cdot r \approx 3950\,\tfrac{\text{m}}{\text{s}^2}$. That is about 400 times $g$. The drum keeps the laundry on the circle; the water flies out through the holes along the tangent.

</details>

### Task 7: Loop

A roller coaster goes through a loop with $r = 6\,\text{m}$. What is the minimum speed of the car at the highest point so that it does not lift off the track?

<details>
<summary>Show solution</summary>

At the highest point the weight points to the centre. At the minimum speed it is just enough as centripetal force: $m \cdot g = m \cdot \frac{v^2}{r}$, so $v_{\min} = \sqrt{g \cdot r} = \sqrt{9.81 \cdot 6}\,\tfrac{\text{m}}{\text{s}} \approx 7.7\,\tfrac{\text{m}}{\text{s}} \approx 28\,\tfrac{\text{km}}{\text{h}}$. If the car is faster, the track also pushes downwards. Again, the mass cancels.

</details>

## Ideas for the classroom

- **Use:** circular motion and centripetal force in mechanics, lower or upper secondary (about grades 10/11). Good as a starter ("cut the string"), for working out $F_Z \sim v^2$ and $F_Z \sim \frac{1}{r}$ or $F_Z \sim r$ (graph), and as an application (cornering, road safety).
- **Model:** The ball moves without friction on a horizontal table (top view); the table balances the weight, and the string force is the centripetal force. The bend of the car is not drawn to scale. The coefficients of static friction are typical values. When the car skids, it is assumed for simplicity that the maximum static friction still acts at the same speed; the car then moves on a circle with the larger radius $r' = \frac{v^2}{\mu_H g}$ (in reality sliding friction is even smaller).
- **Common stumbling blocks:**
  - "A centrifugal force pushes the ball outwards." – In the frame at rest only the force towards the centre acts; without it the ball flies on along the tangent, not radially outwards. The centrifugal force is a fictitious force that only appears in the rotating frame.
  - "At constant speed no force acts." – The direction changes, and that needs a force.
  - "Heavy cars fly out of a bend more easily." – The maximum speed does not depend on the mass.
  - "A larger radius always means a larger force." – Only for the same period; for the same speed it is the other way round.
