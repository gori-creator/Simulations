---
description: "Interactive simulation of standing waves – incident and reflected waves superpose at a fixed and a free end, normal modes of a string and an air column with nodes and antinodes, a driver with any frequency and a resonance curve as in Melde’s experiment."
---

## What is it about?

A wave travelling towards the end of a rope is **reflected** there. The incident wave and the reflected wave have the same frequency and wavelength $\lambda = \frac{c}{f}$ and superpose to form a **standing wave**: some points never move (**nodes N**), others in between oscillate particularly strongly (**antinodes A**).

- **Fixed end:** reflection with a **phase jump of $\pi$**, there is always a node at the end: $y = 2\hat y \cdot \sin\!\left(2\pi \frac{d}{\lambda}\right) \cdot \cos(\omega t)$, nodes at $d = k \cdot \frac{\lambda}{2}$ from the end.
- **Free end:** reflection **without** a phase jump, an antinode at the end.

Neighbouring nodes are always $\frac{\lambda}{2}$ apart.

**Normal modes** of a medium of length $L$: with equal ends $L = n \cdot \frac{\lambda}{2}$, so $f_n = n \cdot \frac{c}{2L}$; with unequal ends $L = (2n-1) \cdot \frac{\lambda}{4}$, so $f_n = (2n-1) \cdot \frac{c}{4L}$ (odd multiples only). A guitar string with $L = 0.65\,\text{m}$ and $c = 286\,\frac{\text{m}}{\text{s}}$ has $f_1 = 220\,\text{Hz}$, $f_2 = 440\,\text{Hz}$, …

In an **air column** a closed end is a velocity node, an open end a velocity antinode; the pressure varies the other way round. A **stopped pipe** only has odd multiples of its fundamental.

A **driver** with any frequency only produces a large standing wave at the natural frequencies (**resonance**, Melde’s experiment).

The motion is shown greatly slowed down and enlarged; damping is neglected except for the driven rope, and the end correction of pipes is ignored.

## Try it

1. Press “Send the wave again”. When does the pattern lock in?
2. Drag $P$ onto a node and look at the phasors.
3. Compare with a free end. [Free end](?end=free&pd=0.22)
4. Increase $n$ for the string and count nodes and antinodes. [String, n = 4](?mode=eig&n=4)
5. Make one end free and tap the natural frequencies. [Fixed–free](?mode=eig&bc=fl&n=2)
6. Sweep the driving frequency through the resonance curve, with sound. [Driver](?mode=res&f=200)

## Tasks

### Task 1: Guitar string

$L = 0.65\,\text{m}$, both ends fixed, $c = 286\,\frac{\text{m}}{\text{s}}$. Find wavelength and frequency of the fundamental and the first two overtones. [Load task](?mode=eig&_hide=1)

<details>
<summary>Show solution</summary>

$\lambda_1 = 2L = 1.3\,\text{m}$, $f_1 = \frac{c}{\lambda_1} = 220\,\text{Hz}$; $\lambda_2 = 0.65\,\text{m}$, $f_2 = 440\,\text{Hz}$; $\lambda_3 \approx 0.433\,\text{m}$, $f_3 = 660\,\text{Hz}$. [Show](?mode=eig&n=3)

</details>

### Task 2: Open or stopped?

Two pipes of length $0.5\,\text{m}$ ($c = 340\,\frac{\text{m}}{\text{s}}$), one open, one stopped. Find the first three natural frequencies of each. [Load task](?mode=eig&med=air&pipe=closed&L=0.5&c=340&n=1&_hide=1)

<details>
<summary>Show solution</summary>

Open: $340$, $680$, $1020\,\text{Hz}$. Stopped: $170$, $510$, $850\,\text{Hz}$ – odd multiples only, the fundamental is an octave lower. [Show](?mode=eig&med=air&pipe=closed&L=0.5&c=340&n=2)

</details>

### Task 3: Melde’s experiment

$L = 1.2\,\text{m}$, $c = 240\,\frac{\text{m}}{\text{s}}$. At which driving frequencies is there resonance? [Load task](?mode=res&L=1.2&c=240&f=150&_hide=1)

<details>
<summary>Show solution</summary>

$f_n = n \cdot 100\,\text{Hz}$; at $300\,\text{Hz}$ there are three antinodes. [Show](?mode=res&L=1.2&c=240&f=300)

</details>

## Ideas for the classroom

- **Use:** upper secondary, mechanical waves, after reflection and interference; pairs well with a rope wave, Melde’s experiment and Kundt’s tube.
- **Applications:** string instruments, flutes and organ pipes; “Play sound” lets students hear the natural frequencies.
- **Common stumbling blocks:**
  - “There is no wave at a node.” – Both waves pass through and cancel there at every instant.
  - “Two nodes are $\lambda$ apart.” – They are $\frac{\lambda}{2}$ apart.
  - “At a node of the air column the pressure is zero.” – At a velocity node the pressure varies most.
