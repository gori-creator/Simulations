---
description: "Interactive simulation of mechanical waves – transverse and longitudinal waves on a chain of coupled particles, wave front, wavelength between particles in phase, c = λ·f, snapshot y(x) and time graph y(t)."
---

## What is it about?

A **source** sets one particle of a chain of coupled particles oscillating. The coupling (springs) passes the motion on from particle to particle, each one starting a little later. What travels is the **state of oscillation** and **energy** – the particles themselves only oscillate about their **rest position**.

- **Transverse wave:** the particles oscillate **perpendicular** to the direction of travel (crests and troughs).
- **Longitudinal wave:** the particles oscillate **along** the direction of travel (compressions and rarefactions, e.g. sound).

The **wave front** moves with the **wave speed** $c$; ahead of it everything is still at rest. Every particle repeats the motion of the source with the delay $x/c$:

$$
y(x, t) = \hat y \cdot \sin\!\Big(2\pi \Big(\frac{t}{T} - \frac{x}{\lambda}\Big)\Big) \quad \text{for } t \ge \frac{x}{c}.
$$

The **wavelength** $\lambda$ is the smallest distance between two particles oscillating **in phase**. During one period the wave travels one wavelength: $c = \lambda \cdot f$. The source sets $f$, the medium sets $c$, so $\lambda = c/f$. Particles a distance $\Delta x$ apart have the phase difference $\Delta\varphi = 2\pi \cdot \Delta x / \lambda$.

## Try it

1. Press “Restart” and watch the wave front. What do the particles ahead of it do?
2. Follow the red marked particle. Does it travel with the wave? [Follow a crest](?type=trans&crest=1)
3. Tap another particle. When does it start to move? Compare its $y(t)$ graph with the source.
4. Read off $\lambda$ at the green bracket and check $c = \lambda \cdot f$. [High frequency](?f=2&c=1.2&amp=5)
5. Switch on the phasors. By what angle does the phasor turn from particle to particle? [Phasors](?type=trans&ph=1&f=1&c=1.6&pm=4)
6. Trigger a single pulse. [Single pulse](?exc=pulse&type=trans&crest=1&pm=20)

## Tasks

### Task 1: Wavelength

$f = 0.8\,\text{Hz}$ and $c = 1.2\,\text{m/s}$. Calculate $T$ and $\lambda$. [Load task](?lam=0&_hide=1)

<details>
<summary>Show solution</summary>

$T = 1/f = 1.25\,\text{s}$ and $\lambda = c/f = 1.5\,\text{m}$ – 15 particle spacings of $10\,\text{cm}$. [Show](?lam=1)

</details>

### Task 2: When does it start?

With the same values: when does particle no. 30 ($x = 3\,\text{m}$) start to oscillate, and what is its phase difference to the source? [Load task](?pm=30&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta t = x/c = 2.5\,\text{s}$; $\Delta\varphi = 2\pi \cdot 3/1.5 = 4\pi$: two full periods, so it oscillates in phase with the source.

</details>

### Task 3: Doubling the frequency

The frequency of the source is doubled. How do $c$, $\lambda$ and $T$ change?

<details>
<summary>Show solution</summary>

$c$ stays the same (property of the medium); $T$ and $\lambda$ are halved. [f = 1.6 Hz](?f=1.6&c=1.2&type=trans)

</details>

### Task 4: Sound

Sound travels through air at about $340\,\text{m/s}$. Find the wavelength of a $440\,\text{Hz}$ tone.

<details>
<summary>Show solution</summary>

$\lambda = 340/440\,\text{m} \approx 0.77\,\text{m}$.

</details>

## Notes for teachers

- **Model:** analytic wave on an ideal, lossless chain (4 m, particles 10 cm apart) without reflection or dispersion. The transverse wave is drawn enlarged across the chain (factor shown in the picture); the longitudinal wave is to scale. If $2\pi\hat y/\lambda \ge 1$, neighbouring particles of the longitudinal wave would overtake each other – the simulation points this out.
- **Misconceptions:** particles do not travel with the wave; a higher frequency does not make the wave faster; $y(x)$ and $y(t)$ look alike but show different things ($\lambda$ vs. $T$); compressions are not where the displacement is largest.
