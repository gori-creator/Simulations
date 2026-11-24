## What is it about?

In the **electron diffraction tube** electrons leave a hot cathode and are accelerated towards the anode by the voltage $U$. They then fly through a very thin **graphite foil** and hit a fluorescent screen. If you expect particles, only a bright spot should appear there. But you also see **two bright rings** – a typical diffraction pattern, as known from waves.

In 1924 **de Broglie** proposed that particles with momentum $p$ also have a wavelength:

$$
\lambda = \frac{h}{p} = \frac{h}{m \cdot v}.
$$

From the energy in the electric field, $e \cdot U = \frac{1}{2} m v^2$, it follows that $p = \sqrt{2 \cdot m \cdot e \cdot U}$ and hence

$$
\lambda = \frac{h}{\sqrt{2 \cdot m \cdot e \cdot U}} \approx \frac{1.226\,\text{nm}}{\sqrt{U/\text{V}}}.
$$

At $U = 4\,\text{kV}$, $\lambda \approx 19.4\,\text{pm}$ – much smaller than the wavelength of light, but of the same order as the distances between atoms in a crystal.

Graphite consists of many tiny crystals turned in all directions. At parallel **lattice planes** with spacing $d$, the scattered waves reinforce each other according to the **Bragg condition**

$$
2 \cdot d \cdot \sin\theta = k \cdot \lambda \qquad (k = 1, 2, \ldots).
$$

The bright rings on the screen belong to the first order $k = 1$; only these are drawn in the simulation. Higher-order rings are much fainter in the tube.

The beam is deflected by $2\theta$. Because the crystals lie in all directions, all deflected beams form a cone – on the screen at distance $L$, a ring with

$$
r = L \cdot \tan 2\theta \approx L \cdot 2\theta \approx \frac{L \cdot \lambda}{d}.
$$

Graphite has two important lattice spacings: $d_1 = 0.213\,\text{nm}$ (inner ring) and $d_2 = 0.123\,\text{nm}$ (outer ring). In the tube $L = 13.5\,\text{cm}$. Important: $r \sim \lambda \sim \frac{1}{\sqrt{U}}$ – higher voltage, smaller rings.

**Wave and particle:** each electron arrives at a single point on the screen. Only many electrons together show the ring pattern. The wave only determines *where* an electron arrives with what probability.

**About the display:** the de Broglie wave in the beam is drawn many times larger; its length, however, changes in the correct ratio with $U$. The screen is drawn flat here; real tubes have a curved bulb, which changes the radii only slightly. Calculated relativistically, $\lambda$ is only slightly smaller: by about $0.2\,\%$ at $4\,\text{kV}$, about $0.4\,\%$ at $8\,\text{kV}$. This is far below the measurement accuracy, so the simulation calculates non-relativistically.

## Try it

1. Watch the screen: how does the ring pattern build up from single electrons? [Load example](?U=4)
2. Change $U$. How do the speed, the wavelength and the rings change? [Low voltage](?U=2.5) · [High voltage](?U=7.5)
3. Drag the dashed measuring circle onto the inner ring and read off $r_1$. Compare with $r_1 \approx \frac{L \cdot \lambda}{d_1}$. [Measure a ring](?U=5&rm=8&val=0)
4. Record data with “Automatic series”. What shape does the graph of $r$ against $U$ have?
5. Switch to $r$ against $\frac{1}{\sqrt{U}}$. What do you notice? [Linearisation](?ch=rinv)

## Exercises

### Exercise 1: Wavelength of the electrons

Calculate the speed, momentum and de Broglie wavelength of the electrons at $U = 4.0\,\text{kV}$ ($m = 9.11 \cdot 10^{-31}\,\text{kg}$). [Load exercise](?U=4&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$v = \sqrt{\frac{2 e U}{m}} = \sqrt{\frac{2 \cdot 1.602 \cdot 10^{-19}\,\text{C} \cdot 4000\,\text{V}}{9.11 \cdot 10^{-31}\,\text{kg}}} \approx 3.75 \cdot 10^{7}\,\frac{\text{m}}{\text{s}}$, $p = m \cdot v \approx 3.42 \cdot 10^{-23}\,\text{kg}\cdot\frac{\text{m}}{\text{s}}$, $\lambda = \frac{h}{p} \approx 1.94 \cdot 10^{-11}\,\text{m} = 19.4\,\text{pm}$. [Show in the simulation](?U=4)

</details>

### Exercise 2: Predicting the ring radius

Calculate the Bragg angle and the radius of the inner ring at $U = 4.0\,\text{kV}$. [Load exercise](?U=4&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\sin\theta_1 = \frac{\lambda}{2 d_1} = \frac{19.4\,\text{pm}}{426\,\text{pm}} \approx 0.0455$, so $\theta_1 \approx 2.61°$ and $2\theta_1 \approx 5.22°$. $r_1 = 13.5\,\text{cm} \cdot \tan 5.22° \approx 12.3\,\text{mm}$. The approximation $r \approx \frac{L \lambda}{d}$ also gives $12.3\,\text{mm}$. [Show in the simulation](?U=4&rm=12.3)

</details>

### Exercise 3: Measuring the lattice spacing

At $U = 5.0\,\text{kV}$ you measure $r_1 = 11.0\,\text{mm}$ for the inner ring. Find the lattice spacing $d_1$. [Load exercise](?U=5&rm=8&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\lambda = \frac{1.226\,\text{nm}}{\sqrt{5000}} \approx 17.3\,\text{pm}$. $d_1 \approx \frac{L \cdot \lambda}{r_1} = \frac{135\,\text{mm} \cdot 17.3\,\text{pm}}{11.0\,\text{mm}} \approx 0.213\,\text{nm}$. [Show in the simulation](?U=5&rm=11)

</details>

### Exercise 4: Double the voltage

How does the ring radius change if you double the voltage from $4\,\text{kV}$ to $8\,\text{kV}$?

<details>
<summary>Show solution</summary>

$r \sim \lambda \sim \frac{1}{\sqrt{U}}$, so $r$ becomes smaller by the factor $\sqrt{2}$: $r_1 \approx \frac{12.3\,\text{mm}}{1.41} \approx 8.7\,\text{mm}$. [Show in the simulation](?U=8)

</details>

### Exercise 5: Evaluation by linearisation

Explain why the measured points in the graph of $r$ against $\frac{1}{\sqrt{U}}$ lie on a line through the origin. How do you find the lattice spacing from the slope $k$? [Linearisation](?ch=rinv)

<details>
<summary>Show solution</summary>

$r \approx \frac{L \lambda}{d} = \frac{L \cdot h}{d \cdot \sqrt{2 m e}} \cdot \frac{1}{\sqrt{U}}$, so $r = k \cdot \frac{1}{\sqrt{U}}$ with $k = \frac{L h}{d \sqrt{2 m e}}$. Hence $d = \frac{L h}{k \sqrt{2 m e}}$. After a series of measurements the simulation shows this evaluation under “Analysis”.

</details>

### Exercise 6: Voltage for a given ring

What voltage do you need for the inner ring to have the radius $r_1 = 10\,\text{mm}$? Use the approximation $r \approx \frac{L \cdot \lambda}{d}$. [Load exercise](?U=4&rm=10&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\lambda \approx \frac{r_1 \cdot d_1}{L} = \frac{10\,\text{mm} \cdot 0.213\,\text{nm}}{135\,\text{mm}} \approx 15.8\,\text{pm}$. From $\lambda \approx \frac{1.226\,\text{nm}}{\sqrt{U/\text{V}}}$ it follows that $\sqrt{U/\text{V}} \approx \frac{1226\,\text{pm}}{15.8\,\text{pm}} \approx 77.7$, so $U \approx 6000\,\text{V} = 6.0\,\text{kV}$. At $6.0\,\text{kV}$ the simulation shows $r_1 = 10.1\,\text{mm}$; the measuring circle at $10\,\text{mm}$ lies on the ring. [Show in the simulation](?U=6&rm=10)

</details>

### Exercise 7: Why not with light?

Green light has $\lambda = 530\,\text{nm}$. Why can it not produce diffraction rings with graphite?

<details>
<summary>Show solution</summary>

The Bragg condition $\sin\theta = \frac{\lambda}{2d}$ can only be met for $\lambda \le 2d$. With $2 d_1 = 0.43\,\text{nm}$, light's wavelength is about a thousand times too long. Electrons at a few kV, on the other hand, have wavelengths in the pm range.

</details>

## Ideas for the classroom

- **Use:** upper secondary, topic quantum objects and wave–particle duality; please check the exact place in your curriculum. Good for preparing or following up the real experiment with the electron diffraction tube: here you can measure calmly, without high voltage in the room.
- **Possible sequence:** first observe the ring pattern and discuss the wave hypothesis, then derive $\lambda = \frac{h}{p}$, read off radii with the measuring circle and finally determine the lattice spacing via linearisation. With “Show values in the picture” switched off (`val=0`) the results are hidden.
- **Model:** flat screen, only the two main rings, readings with about $1.5\,\%$ reading error. Some electrons pass through undiffracted (bright spot in the middle).
- **Common pitfalls:**
  - “The electrons are deflected by the atoms like balls.” – Then there would be no sharp rings; only the wave with a fixed wavelength explains the fixed angles.
  - “The ring radius is the lattice spacing.” – $r$ depends on $L$, $\lambda$ and $d$; large rings belong to small $d$.
  - “Higher voltage, larger rings.” – The other way round: faster electrons have shorter wavelengths.
  - When measuring, the diameter $D$ is often read off; then $D \approx \frac{2 L \lambda}{d}$.
- **Going further:** double slit with electrons, electron microscope, Bragg reflection of X-rays, photoelectric effect.
