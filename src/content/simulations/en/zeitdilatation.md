---
description: "A light clock on a moving train, a train and a tunnel, a flash in the middle of the train, muons and E = m · c²: special relativity to try out."
---

## What is it about?

**Special relativity** (Einstein, 1905) rests on two **postulates**: all inertial frames are equivalent, and **light has the same speed** $c \approx 3 \cdot 10^8\,\tfrac{\text{m}}{\text{s}}$ in every one of them. As a consequence, times and lengths depend on the frame of reference.

**Light clock:** a light pulse bounces between two mirrors a distance $d$ apart. On the train it moves straight up and down; one tick takes $\Delta t_0 = \frac{2d}{c}$. Seen from the platform the train moves on, so the pulse travels **diagonally** – a longer path at the same speed $c$. Pythagoras gives

$$
\Delta t = \gamma \cdot \Delta t_0 \qquad \text{with the Lorentz factor} \qquad \gamma = \frac{1}{\sqrt{1 - \frac{v^2}{c^2}}} \geq 1.
$$

$\Delta t_0$ is the **proper time**. Moving clocks run slow (**time dilation**). A moving body is shorter along its motion: $L = \frac{L_0}{\gamma}$ (**length contraction**, rest length $L_0$). Events that are **simultaneous** on the train are not simultaneous seen from the platform. The **rest energy** is $E_0 = m c^2$, the total energy $E = \gamma m c^2$ and the momentum $p = \gamma m v$; older books call $\gamma m$ the relativistic mass.

## Try it

1. Start the light clock and compare the path of the pulse on the train and from the platform. [Light clock at 0.8 c](?v=0.8)
2. Drag the point in the γ chart to the right. From which speed on is $\gamma$ clearly larger than 1?
3. Does the train fit into a tunnel of the same rest length? [Train and tunnel](?mode=len&v=0.8)
4. Let the lamp in the middle of the train flash. [Flash](?mode=sim&v=0.6)
5. How many muons reach the ground with and without time dilation? [Muons](?mode=muon&v=0.998)
6. Where in everyday life does relativity matter? [GPS](?mode=apps&ex=gps)

## Tasks

### Task 1: Slow train clock

A process on the train lasts $3\,\text{s}$; the train moves at $0.8\,c$. How long does it last, measured from the platform? [Load task](?v=0.8&t0=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma = \frac{1}{0.6} = \frac{5}{3}$, so $\Delta t = 5\,\text{s}$. [Show in the simulation](?v=0.8&t0=3)

</details>

### Task 2: Train in the tunnel

Train and tunnel both have a rest length of $200\,\text{m}$; the train moves at $0.6\,c$. How long are they in each frame? [Load task](?mode=len&v=0.6&L0=200&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma = 1.25$. From the platform: train $160\,\text{m}$, tunnel $200\,\text{m}$ – it fits. From the train: train $200\,\text{m}$, tunnel $160\,\text{m}$ – it sticks out. Both are right because “both ends inside at the same time” means different events in the two frames. [Show in the simulation](?mode=len&v=0.6&L0=200)

</details>

### Task 3: Muons

Muons are created at about $10\,\text{km}$, fly at $0.998\,c$ and have a mean lifetime of $2.2\,\mu\text{s}$ at rest. How far do they get on average, without and with time dilation? [Load task](?mode=muon&v=0.998&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Without: about $658\,\text{m}$. With $\gamma \approx 15.8$: about $10.4\,\text{km}$, and about $38\,\%$ reach the ground. [Show in the simulation](?mode=muon&v=0.998)

</details>

### Task 4: Fast electron

An electron ($E_0 = 0.511\,\text{MeV}$) moves at $0.99\,c$. Find $E$ and $E_{\text{kin}}$. [Load task](?mode=energy&v=0.99&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma \approx 7.09$: $E \approx 3.62\,\text{MeV}$, $E_{\text{kin}} \approx 3.11\,\text{MeV}$ – classically only $\frac{1}{2} m v^2 \approx 0.25\,\text{MeV}$. [Show in the simulation](?mode=energy&v=0.99)

</details>

## Ideas for the classroom

- **Use:** an introduction to special relativity in upper secondary school. The light clock works well as a starting point: first observe without numbers (`show=0`), then derive the formula with Pythagoras.
- **Model:** the animations are heavily slowed down; the train and tunnel do not move at the set speed, only the lengths are to scale.
- **Common stumbling blocks:**
  - “The clock only seems to run slow.” – Time dilation is measurable (muons, atomic clocks in aircraft, accelerators).
  - “It is clear who is moving.” – Each side sees the other’s clocks run slow.
  - “With enough energy you can go faster than light.” – $E$ and $p$ grow without limit, $v$ stays below $c$.
