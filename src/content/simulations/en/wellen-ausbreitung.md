## What is it about?

A **mechanical wave** is produced when a **source** sets one particle of a chain of coupled particles (oscillators) oscillating. Through the coupling (here: springs) the motion is passed on to the next particle, from there to the one after, and so on. Each particle starts to oscillate a little later than the one before it. So what spreads out is a **state of oscillation** and with it **energy** – the particles themselves do **not** travel along; they only oscillate about their **rest position**.

- **Transverse wave:** the particles oscillate **perpendicular** to the direction of travel. **Crests** and **troughs** form (e.g. a wave on a rope).
- **Longitudinal wave:** the particles oscillate **along** the direction of travel. **Compressions** and **rarefactions** form (e.g. sound in air).

The **wavefront** moves at the **wave speed** $c$; ahead of it everything is still at rest. The wave needs the time $\Delta t = \frac{x}{c}$ to reach the position $x$. Because every particle only repeats the motion of the source $y_E(t) = \hat y \cdot \sin(\omega t)$ with a delay,

$$
y(x, t) = \hat y \cdot \sin\!\Big(\omega \Big(t - \frac{x}{c}\Big)\Big) = \hat y \cdot \sin\!\Big(2\pi \Big(\frac{t}{T} - \frac{x}{\lambda}\Big)\Big) \quad \text{for } t \ge \frac{x}{c}.
$$

The **wavelength** $\lambda$ is the smallest distance between two particles that oscillate **in phase** (e.g. from crest to crest or from compression to compression). During one period $T$ the wave travels exactly one wavelength further:

$$
c = \frac{\lambda}{T} = \lambda \cdot f .
$$

The **frequency** $f$ is set by the source, the wave speed $c$ by the **medium** (coupling, mass of the particles). The wavelength follows from them: $\lambda = \frac{c}{f}$.

Two particles a distance $\Delta x$ apart have the **phase difference** $\Delta\varphi = 2\pi \cdot \frac{\Delta x}{\lambda}$. At a distance $\lambda$ it is $2\pi$ (in phase), at a distance $\frac{\lambda}{2}$ it is $\pi$ (in antiphase).

Two graphs describe the wave: the **snapshot** $y(x)$ shows the displacement of all particles at **one** instant (you read off $\lambda$ from it), the **time graph** $y(t)$ shows the motion of **one** particle (you read off $T$ from it).

## Try it

1. Press “Restart” and watch the wavefront. What are the particles ahead of the front doing?
2. Follow the red marked particle. Does it move to the right with the wave? Watch the red range of oscillation. [Follow a crest](?type=trans&crest=1)
3. Tap another particle (in the chain or in the snapshot). When does it start to oscillate? Compare with the source in the $y(t)$ graph.
4. Read off the wavelength at the green bracket and check $c = \lambda \cdot f$. Change $f$ while keeping $c$: what happens to $\lambda$? [High frequency](?f=2&c=1.2&amp=5)
5. Compare the transverse and the longitudinal wave. Where are the compressions compared with the crests? [Both compared](?type=both&crest=1)
6. Switch on the phasors. They stand at equal distances above the chain (read off the distance $\Delta x$ on the measuring tape). By what angle is a phasor turned compared with its left neighbour? Check with $\Delta\varphi = 2\pi \cdot \frac{\Delta x}{\lambda}$. [Phasors](?type=trans&ph=1&f=1&c=1.6&pm=4)
7. Send a single pulse and pause playback when it is in the middle of the chain. How long is the pulse? [Single pulse](?exc=pulse&type=trans&crest=1&pm=20)

## Exercises

### Exercise 1: Calculating the wavelength

A source oscillates at $f = 0.8\,\text{Hz}$, and the wave travels at $c = 1.2\,\tfrac{\text{m}}{\text{s}}$. Calculate the period and the wavelength and measure $\lambda$ in the simulation. [Load exercise](?lam=0&_hide=1)

<details>
<summary>Show solution</summary>

$T = \frac{1}{f} = 1.25\,\text{s}$ and $\lambda = \frac{c}{f} = \frac{1.2\,\text{m/s}}{0.8\,\text{Hz}} = 1.5\,\text{m}$. On the measuring tape there are 15 particle spacings of $10\,\text{cm}$ each between two particles in phase. [Show in the simulation](?lam=1)

</details>

### Exercise 2: Wave speed from a measurement

In a snapshot, two neighbouring crests are $0.8\,\text{m}$ apart. A particle makes 10 oscillations in $8\,\text{s}$. How fast does the wave travel?

<details>
<summary>Show solution</summary>

$\lambda = 0.8\,\text{m}$, $T = 0.8\,\text{s}$, so $f = 1.25\,\text{Hz}$ and $c = \lambda \cdot f = 1.0\,\tfrac{\text{m}}{\text{s}}$. [Check](?f=1.25&c=1&type=trans)

</details>

### Exercise 3: When does it start?

With $f = 0.8\,\text{Hz}$ and $c = 1.2\,\tfrac{\text{m}}{\text{s}}$: when does particle no. 30 ($x = 3\,\text{m}$) start to oscillate? What is its phase difference to the source? [Load exercise](?pm=30&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta t = \frac{x}{c} = \frac{3\,\text{m}}{1.2\,\text{m/s}} = 2.5\,\text{s}$. $\Delta\varphi = 2\pi \cdot \frac{3\,\text{m}}{1.5\,\text{m}} = 4\pi$, exactly two full periods: once it has started, the particle oscillates **in phase** with the source.

</details>

### Exercise 4: Doubling the frequency

The frequency of the source is doubled; the medium stays the same. How do $c$, $\lambda$ and $T$ change?

<details>
<summary>Show solution</summary>

$c$ stays the same (a property of the medium); $T$ and $\lambda = \frac{c}{f}$ are halved. [Compare: f = 0.8 Hz](?f=0.8&c=1.2&type=trans) and [f = 1.6 Hz](?f=1.6&c=1.2&type=trans)

</details>

### Exercise 5: Compression and crest

In the longitudinal wave the compressions are not where the particles are displaced furthest to the right. Use the snapshot to explain where they are. [Load example](?type=both&crest=1)

<details>
<summary>Show solution</summary>

A compression forms where the particles to its left are displaced to the right and those to its right are displaced to the left – that is, at a zero of $y(x)$ where $y$ changes from positive to negative values as $x$ increases. It lies a quarter wavelength ahead of or behind a “crest” of the displacement. There the particles are moving fastest in the direction of travel.

</details>

### Exercise 6: Sound

Sound travels through air as a longitudinal wave at about $340\,\tfrac{\text{m}}{\text{s}}$ (more precisely $343\,\tfrac{\text{m}}{\text{s}}$ at $20\,^\circ\text{C}$). What is the wavelength of the concert pitch A ($440\,\text{Hz}$)? And of a low note at $50\,\text{Hz}$?

<details>
<summary>Show solution</summary>

$\lambda = \frac{340\,\text{m/s}}{440\,\text{Hz}} \approx 0.77\,\text{m}$ and $\lambda = \frac{340\,\text{m/s}}{50\,\text{Hz}} = 6.8\,\text{m}$.

</details>

### Exercise 7: Same note, different medium

The concert pitch A ($440\,\text{Hz}$) is heard under water. There sound travels at about $1480\,\tfrac{\text{m}}{\text{s}}$. Which quantities change compared with air, and which do not? Calculate the wavelength in water.

<details>
<summary>Show solution</summary>

The frequency stays $440\,\text{Hz}$, because the source sets it. The wave speed depends on the medium; it is larger in water. So the wavelength becomes larger too: $\lambda = \frac{1480\,\text{m/s}}{440\,\text{Hz}} \approx 3.4\,\text{m}$ (in air $0.77\,\text{m}$). In the simulation: increase $c$, keep $f$. [Compare: c = 0.8 m/s](?f=1&c=0.8&type=trans) and [c = 1.6 m/s](?f=1&c=1.6&type=trans)

</details>

## Ideas for the classroom

- **Use:** introduction to mechanical waves (grade 10 or upper secondary, depending on the curriculum): how waves form through coupling, transverse versus longitudinal, the wave equation $c = \lambda \cdot f$, snapshot and time graph. Good for working through at the board (pause playback, set a time mark) and for student work with the tasks.
- **Model:** the motion is calculated analytically: every particle repeats the motion of the source with the delay $x/c$ (an ideal, lossless chain without reflection at the end, no dispersion). The chain is $4\,\text{m}$ long, and the particles are $10\,\text{cm}$ apart. Across the chain, the transverse wave is drawn exaggerated so it is easier to see (the factor is shown in the picture); the longitudinal wave is to scale.
- **Display:** the shading of the band shows the particle density. If $2\pi\hat y/\lambda \ge 1$, neighbouring particles of the longitudinal wave would overtake each other – the simulation points this out.
- **Common pitfalls:**
  - “The particles travel along with the wave.” – They only oscillate about their rest position; what is transported is energy or the state of oscillation (red range of oscillation, “Follow a crest”).
  - “A higher frequency makes the wave faster.” – $c$ depends on the medium; at a higher $f$, $\lambda$ becomes smaller.
  - “The snapshot $y(x)$ and the graph $y(t)$ are the same.” – Same shape, but a different axis: the distance between the maxima is $\lambda$ or $T$; they are also mirror images (the wave travels to the right, and the particle excited first is on the left).
  - “In the longitudinal wave the compressions are where the particles are displaced furthest.” – See exercise 5.
- **Limits of the model:** the particles are $10\,\text{cm}$ apart. If $\lambda$ becomes shorter than about three particle spacings (e.g. $f = 2\,\text{Hz}$ and $c = 0.2\,\tfrac{\text{m}}{\text{s}}$), the chain can no longer show the wave recognisably; the simulation points this out. The curve of the snapshot remains correct.
