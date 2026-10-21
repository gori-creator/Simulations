---
description: "Interactive simulation of electromagnetic induction: push a magnet into a coil, pull a rod on rails through a magnetic field, turn a generator – with voltmeter, U(t) graph, Lenz’s law, U = B · l · v and Û = n · B · A · ω."
---

## What is it about?

When the magnetic flux $\Phi = B \cdot A \cdot \cos\varphi$ through a coil changes, a voltage is induced:

$$
U_\text{ind} = -n \cdot \frac{\Delta\Phi}{\Delta t}.
$$

Only the **change** of the flux counts. The three experiments change it in different ways: a moving **magnet** changes $B$; a **rod on rails** changes the area $A = l \cdot x$, giving $U = B \cdot l \cdot v$; a **generator** changes the angle, giving $U(t) = \hat U \sin(\omega t)$ with $\hat U = n \cdot B \cdot A \cdot \omega$.

**Lenz’s law:** the induced current opposes its cause – an approaching north pole meets a north pole of the coil, and the rod is braked by $F = B \cdot I \cdot l$. In the picture the generator runs ten times slower; the graph shows real time.

## Try it

1. Watch the voltmeter while the magnet moves in and out. [Load example](?mode=magnet)
2. Switch off “automatic” and drag the magnet yourself. [Drag it](?mode=magnet&auto=0)
3. Rod on rails: how does $U$ depend on $v$, $l$ and $B$? [Rod on rails](?mode=rail)
4. Generator: in which position is the voltage largest? [Generator](?mode=gen&B=0.1&n=100&A=100&f=5)

## Tasks

### Task 1: Moving rod

$l = 0.20\,\text{m}$, $v = 2.0\,\frac{\text{m}}{\text{s}}$, $B = 0.50\,\text{T}$. Find $U$. [Load task](?mode=rail&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$U = B \cdot l \cdot v = 0.20\,\text{V}$. [Show in the simulation](?mode=rail)

</details>

### Task 2: Generator

$n = 100$, $A = 100\,\text{cm}^2$, $B = 0.10\,\text{T}$, $f = 5\,\text{Hz}$. Find $\hat U$ and $U_\text{eff}$. [Load task](?mode=gen&B=0.1&n=100&A=100&f=5&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\hat U = 100 \cdot 0.10\,\text{T} \cdot 0.010\,\text{m}^2 \cdot 2\pi \cdot 5\,\text{Hz} \approx 3.14\,\text{V}$, $U_\text{eff} \approx 2.22\,\text{V}$. [Show in the simulation](?mode=gen&B=0.1&n=100&A=100&f=5)

</details>

### Task 3: Lenz’s law

A north pole is pushed into a coil. Which pole appears at the near end of the coil?

<details>
<summary>Show solution</summary>

A north pole – the coil repels the magnet. Pulling it out gives a south pole, which attracts it. [Show in the simulation](?mode=magnet)

</details>

## Ideas for the classroom

- Start qualitatively with the magnet, derive $U = B \cdot l \cdot v$ with the rod, finish with the generator.
- **Common stumbling blocks:**
  - “A strong magnet inside the coil gives a voltage.” – Only a change of flux does.
  - “The generator voltage is largest when the coil area is perpendicular to the field.” – Then the flux is largest but does not change.
