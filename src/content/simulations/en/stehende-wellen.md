## What is it about?

A wave travelling towards the end of a rope is **reflected** there. The incident wave $y_h$ and the reflected wave $y_r$ have the same frequency $f$ and wavelength $\lambda = \frac{c}{f}$ and superpose ($y = y_h + y_r$). The result is a **standing wave**: there are points that never move (**nodes N**) and, in between, points that oscillate particularly strongly (**antinodes A**). Nothing travels any more – all points between two nodes oscillate up and down in phase.

- **Fixed end:** the wave is reflected with a **phase jump of $\pi$** (a crest comes back as a trough). There is always a node at the end. At a distance $d$ from the end,
  $$
  y(d, t) = 2\hat y \cdot \sin\!\left(2\pi \cdot \frac{d}{\lambda}\right) \cdot \cos(\omega t) .
  $$
  Nodes are at $d = k \cdot \frac{\lambda}{2}$, antinodes at $d = \frac{\lambda}{4} + k \cdot \frac{\lambda}{2}$ $(k = 0, 1, 2, \dots)$.
- **Free end:** reflection **without a phase jump**; there is an antinode at the end. Nodes and antinodes swap places.

In both cases **neighbouring nodes are $\frac{\lambda}{2}$ apart** – so the wavelength can be measured directly.

**Normal modes:** if a medium of length $L$ is bounded at both ends, only certain standing waves fit into it. With two equal ends (fixed–fixed or free–free), $L$ must be a multiple of $\frac{\lambda}{2}$; with unequal ends, an odd multiple of $\frac{\lambda}{4}$:

$$
L = n \cdot \frac{\lambda_n}{2} \;\Rightarrow\; f_n = n \cdot \frac{c}{2L}
\qquad\qquad
L = (2n - 1) \cdot \frac{\lambda_n}{4} \;\Rightarrow\; f_n = (2n - 1) \cdot \frac{c}{4L}
$$

$f_1$ is called the **fundamental frequency** (fundamental), $f_2, f_3, \dots$ belong to the **overtones**. A guitar string ($L = 0.65\,\text{m}$, $c = 286\,\frac{\text{m}}{\text{s}}$) has $f_1 = 220\,\text{Hz}$, $f_2 = 440\,\text{Hz}$, $f_3 = 660\,\text{Hz}$ … For a string, $c$ depends on the tension $F$ and the mass per length $\mu$: $c = \sqrt{F/\mu}$.

**Air column in a pipe:** here the air particles oscillate lengthwise. A **closed end** is a node for their motion (like a fixed end), an **open end** an antinode (like a free end). The **pressure** varies exactly the other way round: where the particles do not move, they are alternately squeezed together and pulled apart (pressure antinode); at the displacement antinodes the pressure stays constant (pressure node). An open pipe has all multiples $f_n = n \cdot \frac{c}{2L}$, a **stopped pipe** (one end closed) only the odd ones: $f_n = (2n-1) \cdot \frac{c}{4L}$.

**Resonance:** if a driver excites the rope at an arbitrary frequency, a large standing wave only forms at the natural frequencies (Melde’s experiment). In between, the driver sometimes works with the motion and sometimes against it, and the rope stays small and restless.

**About the display:** the oscillations in the picture are strongly slowed down (the top right shows by how much), and the displacements are exaggerated. For formation and normal modes damping is neglected; with the driver a weak damping is included so that the amplitude stays finite at resonance. For the pipe, the end correction is neglected.

## Try it

1. Press “Send the wave again”. Where does the first node form? When does the pattern “lock in” and stop changing?
2. Drag the point $P$ onto a node. What do the two phasors show there – and at an antinode?
3. Compare with the free end. What is right at the end now? [Free end](?end=free&pd=0.22)
4. Hide the superposition and watch only the blue and the red wave. Do they travel? And their sum? [Only the single waves](?sum=0&env=0)
5. Switch to the normal modes and increase $n$ step by step. How many nodes and antinodes are there each time? [String, n = 4](?mode=eig&n=4)
6. Make the right end free and tap the natural frequencies at the bottom. Which multiples of $f_1$ are missing? [Fixed–free](?mode=eig&bc=fl&n=2)
7. Investigate the air column: where do the particles move most, and where does the pressure vary most? [Open pipe](?mode=eig&med=air&pipe=open&L=0.5&c=340&n=2)
8. With the driver, slowly sweep the frequency through the resonance curve and switch on the sound. What happens exactly at $f_1, f_2, f_3$? [Driver](?mode=res&f=200)

## Exercises

### Exercise 1: Guitar string

A guitar string is $L = 0.65\,\text{m}$ long and fixed at both ends. Waves travel along it at $c = 286\,\frac{\text{m}}{\text{s}}$. Calculate the wavelength and frequency of the fundamental and of the first two overtones. [Load exercise](?mode=eig&_hide=1)

<details>
<summary>Show solution</summary>

Fundamental: $L = \frac{\lambda_1}{2}$, so $\lambda_1 = 2 \cdot 0.65\,\text{m} = 1.3\,\text{m}$ and $f_1 = \frac{c}{\lambda_1} = \frac{286}{1.3}\,\text{Hz} = 220\,\text{Hz}$. Overtones: $\lambda_2 = 0.65\,\text{m}$, $f_2 = 440\,\text{Hz}$; $\lambda_3 = \frac{1.3}{3}\,\text{m} \approx 0.433\,\text{m}$, $f_3 = 660\,\text{Hz}$. Conversely: if you know $L$ and the fundamental $f_1$, you get $c = 2L \cdot f_1$. [Show in the simulation](?mode=eig&n=3)

</details>

### Exercise 2: Nodes in front of the fixed end

A wave with $f = 660\,\text{Hz}$ and $c = 286\,\frac{\text{m}}{\text{s}}$ is reflected at a fixed end. At what distances from the end are the nodes, and at what distances the antinodes (up to $0.65\,\text{m}$)? [Load exercise](?kb=0&_hide=1)

<details>
<summary>Show solution</summary>

$\lambda = \frac{c}{f} = \frac{286}{660}\,\text{m} \approx 0.433\,\text{m}$. Nodes at $d = k \cdot \frac{\lambda}{2}$: $0$; $0.217$; $0.433$; $0.65\,\text{m}$. Antinodes in between: $0.108$; $0.325$; $0.542\,\text{m}$. [Show in the simulation](?kb=1)

</details>

### Exercise 3: Open or stopped?

Two organ pipes are each $0.5\,\text{m}$ long ($c = 340\,\frac{\text{m}}{\text{s}}$); one is open, the other stopped. Calculate the first three natural frequencies of each. [Load exercise](?mode=eig&med=air&pipe=closed&L=0.5&c=340&n=1&_hide=1)

<details>
<summary>Show solution</summary>

Open: $f_n = n \cdot \frac{340}{2 \cdot 0.5}\,\text{Hz} = n \cdot 340\,\text{Hz}$, so $340$, $680$, $1020\,\text{Hz}$. Stopped: $f_n = (2n - 1) \cdot \frac{340}{4 \cdot 0.5}\,\text{Hz}$, so $170$, $510$, $850\,\text{Hz}$ – only odd multiples, and the fundamental is an octave lower. [Show in the simulation](?mode=eig&med=air&pipe=closed&L=0.5&c=340&n=2)

</details>

### Exercise 4: Melde’s experiment

A rope of length $1.2\,\text{m}$ ($c = 240\,\frac{\text{m}}{\text{s}}$) is driven by a driver. At which frequencies do large standing waves form? How many antinodes do you see at $f = 300\,\text{Hz}$? [Load exercise](?mode=res&L=1.2&c=240&f=150&_hide=1)

<details>
<summary>Show solution</summary>

$f_n = n \cdot \frac{240}{2 \cdot 1.2}\,\text{Hz} = n \cdot 100\,\text{Hz}$: resonance at $100$, $200$, $300\,\text{Hz}$ … At $300\,\text{Hz}$, $n = 3$: three antinodes, node spacing $0.4\,\text{m}$. [Show in the simulation](?mode=res&L=1.2&c=240&f=300)

</details>

### Exercise 5: Tuning a string

A string sounds too low. How must the tension be changed so that the fundamental rises by an octave (double the frequency)?

<details>
<summary>Show solution</summary>

$f_1 = \frac{c}{2L}$ with $c = \sqrt{F/\mu}$. For double the frequency you need double $c$, so **four times** the tension. Easier: halve the vibrating length (12th fret on a guitar).

</details>

### Exercise 6: Kundt’s tube

In a tube closed at both ends, a loudspeaker produces a tone with $f = 2000\,\text{Hz}$. Fine cork dust collects in little heaps $8.5\,\text{cm}$ apart. Where do the heaps form, and what is the speed of sound? [Load exercise](?mode=eig&med=air&pipe=shut&L=0.51&c=340&n=6&_hide=1)

<details>
<summary>Show solution</summary>

The dust stays where the air particles do not move, i.e. at the displacement nodes (the pressure varies most there). Neighbouring nodes are $\frac{\lambda}{2}$ apart: $\lambda = 2 \cdot 0.085\,\text{m} = 0.17\,\text{m}$, so $c = \lambda \cdot f = 0.17\,\text{m} \cdot 2000\,\text{Hz} = 340\,\frac{\text{m}}{\text{s}}$. In the simulation: a tube with $L = 0.51\,\text{m}$ and $n = 6$, so $f_6 = 6 \cdot \frac{340}{2 \cdot 0.51}\,\text{Hz} = 2000\,\text{Hz}$. [Show in the simulation](?mode=eig&med=air&pipe=shut&L=0.51&c=340&n=6)

</details>

## Ideas for the classroom

- **Use:** in upper secondary in the topic of mechanical waves, after reflection and interference; where exactly it fits depends on the curriculum. The three topics build on each other and go well with a rope wave, Melde’s experiment and Kundt’s tube as real experiments.
- **Suggested sequence:** first run the formation several times and let the class predict where the nodes will be; then use $P$ and the phasor diagram to explain why it is still there. With “Mark nodes (N) and antinodes (A)” switched off (`kb=0`), the pictures work as measuring tasks.
- **Applications:** guitar, violin and piano (strings), flute and organ pipe (air columns); with “Play sound” you can hear the natural frequencies of a string directly.
- **Common pitfalls:**
  - “There is no wave at the nodes.” – Both waves pass through; they just cancel there at every instant.
  - “The distance between two nodes is $\lambda$.” – Neighbouring nodes are $\frac{\lambda}{2}$ apart.
  - “The standing wave moves to the right.” – The pattern stands still; only the single waves travel.
  - “At a node of the air column the pressure is zero.” – At a displacement node the pressure varies most.
  - “Closing an open pipe makes the note higher.” – The fundamental drops by an octave.
- **Further topics:** timbre and overtones, Kundt’s tube for measuring the speed of sound, standing waves in a microwave oven or for electrons in the atomic model.
