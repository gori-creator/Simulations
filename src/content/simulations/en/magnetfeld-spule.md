## What is it about?

In 1820 **Hans Christian Ørsted** noticed that a compass needle swings when a current flows through a wire next to it. Every electric current is surrounded by a **magnetic field**.

**Straight conductor:** The field lines are concentric circles around the wire. Their direction follows the **right-hand grip rule**: the thumb points in the direction of the current, the curled fingers show the direction of the field lines. The **magnetic flux density** $B$ (unit tesla, $1\,\text{T} = 1\,\tfrac{\text{Vs}}{\text{m}^2}$) decreases with the distance $r$:

$$
B = \frac{\mu_0 \cdot I}{2\pi \cdot r}, \qquad \mu_0 = 4\pi \cdot 10^{-7}\,\tfrac{\text{Vs}}{\text{Am}} \approx 1.257 \cdot 10^{-6}\,\tfrac{\text{Vs}}{\text{Am}}.
$$

Example: $I = 10\,\text{A}$, $r = 2\,\text{cm}$ gives $B = \tfrac{1.257 \cdot 10^{-6} \cdot 10}{2\pi \cdot 0.02}\,\text{T} = 0.1\,\text{mT}$. That is about five times the Earth's magnetic field (around $20\,\mu\text{T}$ horizontally). This is why the compass needle swings so clearly.

**Two conductors:** The fields superpose. If the currents flow in the same direction, the conductors attract each other; with opposite currents they repel. The force per metre is $\tfrac{F}{l} = \tfrac{\mu_0 \cdot I_1 \cdot I_2}{2\pi \cdot d}$.

**Loop and coil:** If you bend the wire into a ring, the field lines bunch together inside. Many turns in a row form a **coil** (solenoid). Inside, its field is almost **uniform**; outside it looks like the field of a bar magnet. For a long coil

$$
B = \mu_0 \cdot \mu_r \cdot \frac{N \cdot I}{l}.
$$

Example: $N = 500$, $I = 2\,\text{A}$, $l = 0.25\,\text{m}$ gives $B = 1.257 \cdot 10^{-6} \cdot \tfrac{500 \cdot 2}{0.25}\,\text{T} \approx 5.03\,\text{mT}$. At the end of the coil the field is only about half as strong.

**Electromagnet:** An **iron core** strengthens the field a lot (relative permeability $\mu_r$ from a few hundred to a few thousand). Because iron saturates at about $2\,\text{T}$, the field cannot become arbitrarily strong in reality.

**Applications:** In a **relay** the electromagnet pulls an armature and so closes a second circuit. A small current switches a large one. In an **electric motor**, forces act on the sides of a current-carrying coil in a magnetic field. The **commutator** reverses the current every half turn so that the coil keeps on turning.

## Try it

1. Increase the current slowly. From what point do the compass needles no longer point north? [Ørsted](?mode=wire&I=10&w2=none&earth=1&needles=1)
2. Drag the probe away from the wire. How does $B$ change when you double the distance? [Probe](?mode=wire&I=10&w2=none&probe=1)
3. Compare currents in the same and in opposite directions. Where is the field zero? [Two conductors](?mode=wire&I=15&w2=same&dw=6&earth=0)
4. Shorten the coil while keeping the number of turns. What happens to $B$ and to the field lines inside? [Coil](?mode=coil&N=500&I=2&len=25&rad=3&core=air)
5. With the relay pulled in, reduce the current slowly. When does the armature drop? [Relay](?mode=relay&ir=200)
6. Switch off the commutator of the motor. What does the coil do now? [Motor](?mode=motor&im=2&comm=0)

## Tasks

### Task 1: Straight conductor

A conductor carries $I = 10\,\text{A}$. How large is $B$ at a distance of $2\,\text{cm}$ and of $4\,\text{cm}$?

<details>
<summary>Show solution</summary>

$B(2\,\text{cm}) = \tfrac{1.257 \cdot 10^{-6} \cdot 10}{2\pi \cdot 0.02}\,\text{T} = 0.1\,\text{mT}$; at twice the distance half as much: $0.05\,\text{mT}$. [Show in the simulation](?mode=wire&I=10&w2=none&probe=1)

</details>

### Task 2: Ørsted's experiment

At what distance from a wire carrying $10\,\text{A}$ is its field as strong as the Earth's field ($20\,\mu\text{T}$)? By what angle does a compass needle turn there if, without current, it points north at right angles to the wire's field?

<details>
<summary>Show solution</summary>

$r = \tfrac{\mu_0 \cdot I}{2\pi \cdot B} = \tfrac{1.257 \cdot 10^{-6} \cdot 10}{2\pi \cdot 20 \cdot 10^{-6}}\,\text{m} = 0.1\,\text{m} = 10\,\text{cm}$. Both fields are equally strong and perpendicular to each other, so the needle turns by $45^\circ$.

</details>

### Task 3: Coil

A coil has $N = 500$ turns, is $25\,\text{cm}$ long and carries $2\,\text{A}$. How large is $B$ inside? How does $B$ change if you push the coil together to half its length with the same number of turns?

<details>
<summary>Show solution</summary>

$B = 1.257 \cdot 10^{-6} \cdot \tfrac{500 \cdot 2}{0.25}\,\text{T} \approx 5.03\,\text{mT}$. At half the length $B$ doubles, as long as the coil is still clearly longer than it is wide. [Show in the simulation](?mode=coil&N=500&I=2&len=25&rad=3&core=air)

</details>

### Task 4: Two conductors

Two parallel conductors $6\,\text{cm}$ apart each carry $15\,\text{A}$ in the same direction. How large is the force on $1\,\text{m}$ of conductor? Do they attract or repel?

<details>
<summary>Show solution</summary>

$\tfrac{F}{l} = \tfrac{1.257 \cdot 10^{-6} \cdot 15 \cdot 15}{2\pi \cdot 0.06}\,\tfrac{\text{N}}{\text{m}} \approx 0.75\,\tfrac{\text{mN}}{\text{m}}$. Currents in the same direction attract. [Show in the simulation](?mode=wire&I=15&w2=same&dw=6&earth=0)

</details>

### Task 5: Electric motor

The coil of a motor has $50$ turns and an area of $12\,\text{cm}^2$. It lies in a field of $B = 0.25\,\text{T}$ and carries $2\,\text{A}$. What is the largest torque?

<details>
<summary>Show solution</summary>

$M = N \cdot B \cdot I \cdot A = 50 \cdot 0.25\,\text{T} \cdot 2\,\text{A} \cdot 0.0012\,\text{m}^2 = 0.03\,\text{N m} = 30\,\text{mN m}$. [Show in the simulation](?mode=motor&im=2&comm=1)

</details>

## Ideas for the classroom

- **Starter:** Demonstrate Ørsted's experiment with a thick wire, a power supply and a compass needle. Then increase the current slowly in the simulation.
- **Measuring:** Use a Hall probe to measure $B$ in a school coil at different currents and lengths and compare with $B = \mu_0 \cdot \tfrac{N \cdot I}{l}$.
- **Applications:** Let students take apart a relay and a motor and find the parts again in the simulation.
- **Common pitfalls:**
  - The field lines do not point away from the wire; they run in circles around it.
  - The formula for long coils is only approximate for short, wide coils.
  - The iron core does not strengthen the field without limit.
