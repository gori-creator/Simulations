---
description: "Interactive simulation of electron diffraction by graphite: accelerated electrons are diffracted by a graphite foil and build up two rings on the screen electron by electron – with de Broglie wavelength λ = h/(m·v), Bragg condition, measuring circle and a graph of r against U."
---

## What is it about?

In an **electron diffraction tube** electrons from a hot cathode are accelerated by the voltage $U$, pass through a thin **graphite foil** and hit a fluorescent screen. Besides a bright central spot, **two bright rings** appear – a diffraction pattern, as known from waves.

According to **de Broglie**, a particle with momentum $p$ has the wavelength $\lambda = \frac{h}{p}$. With $e \cdot U = \frac{1}{2} m v^2$:

$$
\lambda = \frac{h}{\sqrt{2 \cdot m \cdot e \cdot U}} \approx \frac{1.226\,\text{nm}}{\sqrt{U/\text{V}}}.
$$

At $U = 4\,\text{kV}$, $\lambda \approx 19.4\,\text{pm}$. Graphite consists of many tiny crystals in all orientations. Lattice planes with spacing $d$ reflect the wave if $2 d \sin\theta = \lambda$ (**Bragg condition**); the beam is deflected by $2\theta$ and forms a ring of radius

$$
r = L \cdot \tan 2\theta \approx \frac{L \cdot \lambda}{d}
$$

on the screen ($L = 13.5\,\text{cm}$, $d_1 = 0.213\,\text{nm}$, $d_2 = 0.123\,\text{nm}$). So $r \sim \frac{1}{\sqrt{U}}$. Each electron arrives at a single point – only many electrons together show the rings.

## Try it

1. Watch the ring pattern build up from single electrons. [Load example](?U=4)
2. Change $U$. [Low voltage](?U=2.5) · [High voltage](?U=7.5)
3. Drag the dashed circle onto the inner ring and read off $r_1$. [Measure a ring](?U=5&rm=8&val=0)
4. Record an automatic series and switch to $r$ against $\frac{1}{\sqrt{U}}$. [Linearisation](?ch=rinv)

## Tasks

### Task 1: Wavelength of the electrons

Calculate speed and de Broglie wavelength at $U = 4.0\,\text{kV}$. [Load task](?U=4&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$v = \sqrt{\frac{2eU}{m}} \approx 3.75 \cdot 10^{7}\,\frac{\text{m}}{\text{s}}$, $\lambda = \frac{h}{m v} \approx 19.4\,\text{pm}$. [Show in the simulation](?U=4)

</details>

### Task 2: Lattice spacing

At $U = 5.0\,\text{kV}$ the inner ring has $r_1 = 11.0\,\text{mm}$. Find $d_1$. [Load task](?U=5&rm=8&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\lambda \approx 17.3\,\text{pm}$, $d_1 \approx \frac{L \lambda}{r_1} = \frac{135\,\text{mm} \cdot 17.3\,\text{pm}}{11.0\,\text{mm}} \approx 0.213\,\text{nm}$. [Show in the simulation](?U=5&rm=11)

</details>

### Task 3: Twice the voltage

How does the ring radius change from $4\,\text{kV}$ to $8\,\text{kV}$?

<details>
<summary>Show solution</summary>

$r \sim \frac{1}{\sqrt{U}}$: smaller by a factor $\sqrt{2}$, $r_1 \approx 8.7\,\text{mm}$. [Show in the simulation](?U=8)

</details>

## Ideas for the classroom

- Use it before or after the real experiment with the tube: here you can measure calmly without high voltage.
- With `val=0` the values in the picture are hidden for measuring exercises.
- **Common stumbling blocks:**
  - “Higher voltage, larger rings.” – The opposite: faster electrons have shorter wavelengths.
  - Students often measure the diameter $D$; then $D \approx \frac{2 L \lambda}{d}$.
  - “The electrons are deflected like balls.” – Only a wave with a fixed wavelength explains rings at fixed angles.
