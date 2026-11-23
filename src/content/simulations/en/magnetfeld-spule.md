## What is it about?

In 1820 **Hans Christian Ørsted** noticed that a compass needle swings when current flows through a wire next to it: every current is surrounded by a **magnetic field**. Around a straight wire the field lines are circles (right-hand grip rule), and

$$
B = \frac{\mu_0 \cdot I}{2\pi \cdot r}, \qquad \mu_0 = 4\pi \cdot 10^{-7}\,\tfrac{\text{Vs}}{\text{Am}}.
$$

For $I = 10\,\text{A}$ and $r = 2\,\text{cm}$: $B = 0.1\,\text{mT}$, about five times the Earth’s horizontal field. Inside a long coil the field is almost uniform:

$$
B = \mu_0 \cdot \mu_r \cdot \frac{N \cdot I}{l},
$$

e.g. $N = 500$, $I = 2\,\text{A}$, $l = 0.25\,\text{m}$ gives $B \approx 5.03\,\text{mT}$. An iron core makes an electromagnet, used in relays and electric motors.

## Try it

1. Ørsted’s experiment: [load](?mode=wire&I=10&w2=none&earth=1&needles=1)
2. Two wires: [load](?mode=wire&I=15&w2=same&dw=6&earth=0)
3. Coil: [load](?mode=coil&N=500&I=2&len=25&rad=3&core=air)
4. Relay: [load](?mode=relay&ir=200)
5. Motor without commutator: [load](?mode=motor&im=2&comm=0)

## Tasks

### Task 1

Find $B$ at 2 cm and 4 cm from a wire carrying 10 A.

<details>
<summary>Show solution</summary>

$0.1\,\text{mT}$ and $0.05\,\text{mT}$.

</details>

### Task 2

$N = 500$, $l = 25\,\text{cm}$, $I = 2\,\text{A}$: field inside the coil?

<details>
<summary>Show solution</summary>

$B \approx 5.03\,\text{mT}$.

</details>

## Ideas for the classroom

- Show Ørsted’s experiment with a thick wire and a compass, then repeat it in the simulation.
- Measure $B$ in a coil with a Hall probe and compare with the formula.
