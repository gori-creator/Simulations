---
description: "A light clock on a moving train, a train and a tunnel, a flash in the middle of the train, muons and E = m · c²: special relativity to try out."
---

## What is it about?

**Special relativity** (Einstein, 1905) rests on two **postulates**: all inertial frames (frames of reference moving uniformly) are equivalent, and **light has the same speed in each of them**, $c \approx 3 \cdot 10^8\,\tfrac{\text{m}}{\text{s}}$. It follows that times and lengths depend on the frame of reference.

**Light clock:** a light pulse travels back and forth between two mirrors a distance $d$ apart. On the train it travels vertically, and one tick lasts $\Delta t_0 = \frac{2d}{c}$. Seen from the platform, the train moves on, so the pulse travels **diagonally** and therefore a longer path – at the same $c$ it takes longer. By Pythagoras, $\left(\frac{c\,\Delta t}{2}\right)^2 = d^2 + \left(\frac{v\,\Delta t}{2}\right)^2$, so

$$
\Delta t = \gamma \cdot \Delta t_0 \qquad \text{with the Lorentz factor} \qquad \gamma = \frac{1}{\sqrt{1 - \frac{v^2}{c^2}}} \geq 1.
$$

$\Delta t_0$ is the **proper time**, measured by a clock that is present at the process. Moving clocks run slow (**time dilation**).

**Length contraction:** a moving body is shortened in the direction of motion: $L = \frac{L_0}{\gamma}$ with the **rest length** $L_0$. Nothing changes perpendicular to the motion.

**Relativity of simultaneity:** if a lamp flashes in the middle of the train, on the train the light reaches both ends at the same time. Seen from the platform, the rear end moves towards the light and is reached earlier. The difference is $\Delta t = \frac{\gamma \cdot v \cdot L_0}{c^2}$.

**Energy:** a body of mass $m$ has the **rest energy** $E_0 = m \cdot c^2$. If it moves, its total energy is $E = \gamma \cdot m \cdot c^2$, and its kinetic energy is $E_{\text{kin}} = (\gamma - 1) \cdot m \cdot c^2$. People used to speak of a **relativistic increase in mass** $m_{\text{rel}} = \gamma \cdot m$; today one usually says: energy and momentum $p = \gamma \cdot m \cdot v$ grow without limit, while the speed stays below $c$.

All effects only become large close to $c$: at $v = 0.6\,c$, $\gamma = 1.25$; at $0.99\,c$, about $7.1$. In everyday life $\gamma - 1$ is tiny (GPS satellite: about $8 \cdot 10^{-11}$).

## Try it

1. Start the light clock and compare the path of the pulse on the train (top) and from the platform (bottom). How far apart are the clocks? [Light clock at 0.8 c](?v=0.8)
2. Slowly drag the point in the γ diagram to the right. From what speed on is $\gamma$ clearly larger than 1?
3. At $v = 0.6\,c$, $d$, $v\,\Delta t/2$ and $c\,\Delta t/2$ form a triangle with sides 4, 3 and 5. Check this on the triangle. [Show triangle](?v=0.6&tri=1)
4. Train and tunnel are equally long (rest length). Does the train fit inside? Compare both frames of reference. [Train and tunnel](?mode=len&v=0.8)
5. Let the lamp flash in the middle of the train. In which frame does the light reach the ends at the same time? [Flash of light](?mode=sim&v=0.6)
6. Compare how many muons reach the ground with and without time dilation. [Muons](?mode=muon&v=0.998)
7. Give an electron more and more energy. What grows without limit, and what does not? [Electron at 0.99 c](?mode=energy&v=0.99)
8. Choose different examples in “Everyday life and experiments”. When do you have to take relativity into account? [GPS](?mode=apps&ex=gps)

## Exercises

### Exercise 1: A slow train clock

A process takes $3\,\text{s}$ on the train. The train travels at $0.8\,c$. How long does the process take, measured from the platform? [Load exercise](?v=0.8&t0=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma = \frac{1}{\sqrt{1 - 0.64}} = \frac{1}{0.6} = \frac{5}{3}$, so $\Delta t = \frac{5}{3} \cdot 3\,\text{s} = 5\,\text{s}$. [Show in the simulation](?v=0.8&t0=3)

</details>

### Exercise 2: Derivation with Pythagoras

From $\left(\frac{c\,\Delta t}{2}\right)^2 = d^2 + \left(\frac{v\,\Delta t}{2}\right)^2$ and $d = \frac{c\,\Delta t_0}{2}$, derive the formula $\Delta t = \gamma \cdot \Delta t_0$.

<details>
<summary>Show solution</summary>

Substituting: $c^2 \Delta t^2 = c^2 \Delta t_0^2 + v^2 \Delta t^2$, so $\Delta t^2 (c^2 - v^2) = c^2 \Delta t_0^2$ and $\Delta t = \frac{\Delta t_0}{\sqrt{1 - v^2/c^2}} = \gamma \cdot \Delta t_0$. At $0.6\,c$: hypotenuse $1.25\,d$, leg $0.75\,d$ – the 3-4-5 triangle. [Show triangle](?v=0.6&tri=1)

</details>

### Exercise 3: Train in the tunnel

A train and a tunnel both have the rest length $200\,\text{m}$. The train travels at $0.6\,c$. How long are train and tunnel seen from the platform, and how long seen from the train? [Load exercise](?mode=len&v=0.6&L0=200&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma = 1.25$. From the platform: train $\frac{200\,\text{m}}{1.25} = 160\,\text{m}$, tunnel $200\,\text{m}$ – the train fits inside. From the train: train $200\,\text{m}$, tunnel $160\,\text{m}$ – it sticks out. Both are true, because “both ends in the tunnel at the same time” means different events in the two frames. [Show in the simulation](?mode=len&v=0.6&L0=200)

</details>

### Exercise 4: Simultaneous or not?

A train ($L_0 = 100\,\text{m}$) travels at $0.6\,c$, and a lamp flashes in its middle. When does the light reach the ends, on the train and seen from the platform? [Load exercise](?mode=sim&v=0.6&show=0&_hide=1)

<details>
<summary>Show solution</summary>

On the train: $t' = \frac{50\,\text{m}}{c} \approx 167\,\text{ns}$ for both ends. From the platform the train is $80\,\text{m}$ long: rear $t_h = \frac{40\,\text{m}}{1.6\,c} \approx 83.4\,\text{ns}$, front $t_v = \frac{40\,\text{m}}{0.4\,c} \approx 333.6\,\text{ns}$. Difference $\Delta t = \frac{\gamma v L_0}{c^2} = \frac{1.25 \cdot 0.6 \cdot 100\,\text{m}}{c} \approx 250.2\,\text{ns}$. [Show in the simulation](?mode=sim&v=0.6)

</details>

### Exercise 5: Muons

Muons are created at an altitude of about $10\,\text{km}$ and fly at $0.998\,c$. Their mean lifetime at rest is $\tau = 2.2\,\mu\text{s}$. How far do they get on average without and with time dilation? What share reaches the ground? [Load exercise](?mode=muon&v=0.998&show=0&_hide=1)

<details>
<summary>Show solution</summary>

Without: $0.998 \cdot c \cdot 2.2\,\mu\text{s} \approx 658\,\text{m}$. With $\gamma \approx 15.8$: $\approx 10.4\,\text{km}$. Flight time $\frac{10\,\text{km}}{0.998\,c} \approx 33.4\,\mu\text{s}$, so $e^{-33.4/(15.8 \cdot 2.2)} \approx 38\%$ arrive (classically only about $2.5 \cdot 10^{-7}$). From the muon’s point of view the atmosphere is only $\frac{10\,\text{km}}{15.8} \approx 632\,\text{m}$ thick. [Show in the simulation](?mode=muon&v=0.998)

</details>

### Exercise 6: A fast electron

An electron ($E_0 = 0.511\,\text{MeV}$) flies at $0.99\,c$. Calculate $E$ and $E_{\text{kin}}$ and compare with $\frac{1}{2} m v^2$. [Load exercise](?mode=energy&v=0.99&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\gamma \approx 7.09$: $E \approx 7.09 \cdot 0.511\,\text{MeV} \approx 3.62\,\text{MeV}$, $E_{\text{kin}} \approx 3.11\,\text{MeV}$. Classically, $\frac{1}{2} m v^2 = \frac{1}{2} \cdot 0.99^2 \cdot 0.511\,\text{MeV} \approx 0.25\,\text{MeV}$ – with $3.11\,\text{MeV}$ the electron would have to be faster than light according to Newton. [Show in the simulation](?mode=energy&v=0.99)

</details>

## Ideas for the classroom

- **Use:** an insight into special relativity in upper secondary (a compulsory or optional topic depending on the curriculum – please check yours). The light clock is a good starting point: first observe without numbers (`show=0`), then derive with Pythagoras.
- **Model:** the animations are strongly slowed down; the light clock has a mirror distance of $d \approx 1.5\,\text{m}$ (one tick $10\,\text{ns}$). In the animation, train and tunnel do not move at the set speed; only the lengths are correct. For the flash of light, the platform view runs in time-lapse at high speeds.
- **Increase in mass:** where the curriculum mentions the “relativistic increase in mass”, the view “Energy and momentum” shows the quantity $m_{\text{rel}} = \gamma m$. The view usual today, with $E = \gamma m c^2$ and $p = \gamma m v$, is shown next to it; comparing the two ways of speaking can be worthwhile.
- **Everyday life:** because of their motion, GPS clocks run about $7\,\mu\text{s}$ per day slow; because of the weaker gravity (general relativity) about $45\,\mu\text{s}$ fast. Without correction, positioning would be off by kilometres per day.
- **Common pitfalls:**
  - “The clock only appears to run slower.” – Time dilation is measurable (muons, atomic clocks in aircraft, particle accelerators).
  - “It is clear who is moving.” – Each side sees the other’s clocks running slow; this is symmetric.
  - “Either the train fits into the tunnel or it does not.” – The answer depends on what is simultaneous.
  - “With enough energy you become faster than light.” – $E$ and $p$ grow without limit; $v$ stays below $c$.
