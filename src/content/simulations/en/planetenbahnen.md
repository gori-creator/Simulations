## What is it about?

A planet of mass $m$ is attracted only by the **gravitational force** of the star (mass $M$):

$$
F_G = G \cdot \frac{M \cdot m}{r^2} \qquad G = 6.674 \cdot 10^{-11}\,\tfrac{\text{N}\,\text{m}^2}{\text{kg}^2}
$$

The simulation knows nothing about ellipses: in very small time steps it calculates from $F_G$ the acceleration $a = \frac{G \cdot M}{r^2}$ (which does not depend on $m$), from that the new velocity and the new position. Nevertheless exactly the orbits appear that **Johannes Kepler** found between 1609 and 1619 from Tycho Brahe's observations.

**Kepler's first law:** the planets move on **ellipses** with the Sun at one **focus** $F_1$. For every point of the orbit the sum of the distances to both foci is the same: $r_1 + r_2 = 2a$ (string construction). Here $a$ is the **semi-major axis**, $b$ the semi-minor axis, $e = \sqrt{a^2 - b^2}$ the **linear eccentricity** (distance from the centre to a focus) and $\varepsilon = \frac{e}{a}$ the **eccentricity**. The point closest to the Sun is the **perihelion** with $r_P = a - e$, the furthest is the **aphelion** with $r_A = a + e$.

**Kepler's second law (law of areas):** the line joining the Sun and the planet (the **radius vector**) sweeps out equal areas in equal times. That is why the planet is faster near the Sun than far from it: $r_P \cdot v_P = r_A \cdot v_A$. Physically this is the conservation of angular momentum $L = m \cdot r \cdot v \cdot \sin\alpha$, because the gravitational force always points exactly towards the star.

**Kepler's third law:** for all planets of the same central body, the ratio of the square of the orbital period to the cube of the semi-major axis is the same. For a circular orbit it follows directly from $F_G = F_Z$, i.e. $G \frac{M m}{r^2} = m \frac{4\pi^2 r}{T^2}$:

$$
\frac{T^2}{a^3} = \frac{4\pi^2}{G \cdot M} \approx 2.97 \cdot 10^{-19}\,\tfrac{\text{s}^2}{\text{m}^3} \quad \text{(Sun)}
$$

**Which orbit results?** That depends on the launch speed $v_0$ at distance $r_0$. At the **circular orbital speed** $v_K$ (perpendicular to the radius vector) you get a circle; from the **escape speed** $v_F$ on, the planet never returns:

$$
v_K = \sqrt{\frac{G \cdot M}{r_0}} \qquad v_F = \sqrt{\frac{2\,G \cdot M}{r_0}} = \sqrt{2} \cdot v_K
$$

At the Earth's distance ($r_0 = 1\,\text{AU} = 1.496 \cdot 10^{11}\,\text{m}$) these are $v_K \approx 29.8\,\tfrac{\text{km}}{\text{s}}$ and $v_F \approx 42.1\,\tfrac{\text{km}}{\text{s}}$. What decides is the total energy $E = \frac{1}{2} m v^2 - G \frac{M m}{r}$: for $E < 0$ the orbit is bound (circle or ellipse), for $E = 0$ it is a parabola, for $E > 0$ a hyperbola.

## Try it

1. Press **Start**. Where is the planet fast, where slow? Compare the arrows at perihelion and aphelion and the graph $v(t)$.
2. After one orbit the ellipse is divided into 12 coloured areas, each swept by the radius vector in equal time intervals. Compare their shape and their area (bars on the right). For the circular orbit all pieces are congruent: [Circular orbit](?v0=29.78)
3. Drag the tip of the arrow slowly outwards. The inner ring marks $v_K$, the outer ring $v_F$. What happens if the arrow reaches beyond the outer ring? [Escape orbit](?v0=46&panel=energy)
4. Launch slower than $v_K$: now the starting point is the aphelion and the planet first falls towards the star. [Launch at aphelion](?v0=22&n=8)
5. Switch on the string construction and watch $r_1 + r_2$ during the orbit. [String construction](?str=1&sec=0)
6. Choose the table for Kepler's third law and let several orbits of different sizes run once each. Every complete orbit is measured. [Open the table](?panel=k3) · [Orbit of Mars with the planets](?r0=1.38&v0=26.51&panel=k3&pl=1&sec=0)
7. Double the mass of the star. How does $\frac{T^2}{a^3}$ change? [Two solar masses](?panel=k3&M=2&v0=50)

## Exercises

### Exercise 1: The Earth on a circular orbit

Calculate the circular orbital speed at the distance $r = 1.496 \cdot 10^{11}\,\text{m}$ from the Sun ($M = 1.989 \cdot 10^{30}\,\text{kg}$) and from it the orbital period. [Load exercise](?v0=29.78&num=0&_hide=1)

<details>
<summary>Show solution</summary>

$v_K = \sqrt{\frac{G M}{r}} = \sqrt{\frac{6.674 \cdot 10^{-11} \cdot 1.989 \cdot 10^{30}}{1.496 \cdot 10^{11}}}\,\tfrac{\text{m}}{\text{s}} \approx 2.98 \cdot 10^{4}\,\tfrac{\text{m}}{\text{s}} = 29.8\,\tfrac{\text{km}}{\text{s}}$

$T = \frac{2\pi r}{v_K} \approx \frac{2\pi \cdot 1.496 \cdot 10^{11}\,\text{m}}{2.98 \cdot 10^{4}\,\tfrac{\text{m}}{\text{s}}} \approx 3.16 \cdot 10^{7}\,\text{s} \approx 365\,\text{d}$ – one year. [Show in the simulation](?v0=29.78)

</details>

### Exercise 2: Faster than the escape speed

A body starts at a distance of $1\,\text{AU}$ with $46\,\tfrac{\text{km}}{\text{s}}$. Does it come back? Explain using the escape speed and the energy. [Load exercise](?v0=46&_hide=1)

<details>
<summary>Show solution</summary>

$v_F = \sqrt{2} \cdot 29.8\,\tfrac{\text{km}}{\text{s}} \approx 42.1\,\tfrac{\text{km}}{\text{s}} < 46\,\tfrac{\text{km}}{\text{s}}$. Per kilogram, $E = \frac{1}{2} v^2 - \frac{G M}{r} \approx 10.6 \cdot 10^{8}\,\tfrac{\text{J}}{\text{kg}} - 8.9 \cdot 10^{8}\,\tfrac{\text{J}}{\text{kg}} > 0$. The body escapes on a hyperbolic orbit – no matter in which direction it starts (as long as it does not hit the Sun). [Show the energy](?v0=46&panel=energy)

</details>

### Exercise 3: Perihelion and aphelion

A planet starts at perihelion $r_P = 1.00\,\text{AU}$ with $v_P = 36.0\,\tfrac{\text{km}}{\text{s}}$; its aphelion is at $r_A = 2.71\,\text{AU}$. Calculate $v_A$, the semi-major axis $a$ and the eccentricity $\varepsilon$. [Load exercise](?num=0&_hide=1)

<details>
<summary>Show solution</summary>

Law of areas: $v_A = v_P \cdot \frac{r_P}{r_A} = 36.0\,\tfrac{\text{km}}{\text{s}} \cdot \frac{1.00}{2.71} \approx 13.3\,\tfrac{\text{km}}{\text{s}}$

$a = \frac{r_P + r_A}{2} = \frac{1.00 + 2.71}{2}\,\text{AU} = 1.855\,\text{AU}$, $e = a - r_P = 0.855\,\text{AU}$, $\varepsilon = \frac{e}{a} = \frac{r_A - r_P}{r_A + r_P} = \frac{1.71}{3.71} \approx 0.461$. The simulation uses the more precise $r_A = 2.7099\,\text{AU}$ and therefore shows $a \approx 1.85\,\text{AU}$. [Show in the simulation](?str=1)

</details>

### Exercise 4: Mars and Jupiter

Mars has the semi-major axis $a = 1.524\,\text{AU}$. Calculate its orbital period with Kepler's third law (Earth: $a = 1\,\text{AU}$, $T = 1\,\text{yr}$). Jupiter needs $11.86\,\text{yr}$ for one orbit. What is its semi-major axis? [Load exercise](?r0=1.38&v0=26.51&pl=1&sec=0&num=0&_hide=1)

<details>
<summary>Show solution</summary>

With $\frac{T^2}{a^3} = 1\,\tfrac{\text{yr}^2}{\text{AU}^3}$: $T_{\text{Mars}} = \sqrt{1.524^3}\,\text{yr} \approx 1.88\,\text{yr}$ and $a_{\text{Jupiter}} = \sqrt[3]{11.86^2}\,\text{AU} \approx 5.20\,\text{AU}$. Compare with the table. [Show the measurement](?panel=k3&r0=1.38&v0=26.51&pl=1&sec=0)

</details>

### Exercise 5: Halley's Comet

Halley's Comet comes as close as $0.59\,\text{AU}$ to the Sun; its semi-major axis is about $17.8\,\text{AU}$. Calculate the orbital period and the largest distance from the Sun. Why can it only be seen for a few months? [Load exercise](?r0=0.59&v0=54.38&n=8&num=0&_hide=1)

<details>
<summary>Show solution</summary>

$T = \sqrt{17.8^3}\,\text{yr} \approx 75\,\text{yr}$, $r_A = 2a - r_P = 35.6\,\text{AU} - 0.59\,\text{AU} \approx 35.0\,\text{AU}$ (further out than Neptune). The simulation starts with $v_0 = 54.38\,\tfrac{\text{km}}{\text{s}}$ (slider step 0.01) and shows $a \approx 17.7\,\text{AU}$ and $T \approx 74.7\,\text{yr}$ – just 0.01 km/s more makes the orbit noticeably longer. By the law of areas, the radius vector sweeps a large area in a short time near the Sun: the comet races through the inner solar system and spends almost its whole period far out, where it is slow and faint. [Show in the simulation](?r0=0.59&v0=54.38&n=8)

</details>

### Exercise 6: Weighing the Sun

Determine the mass of the Sun from the Earth's orbit ($a = 1.496 \cdot 10^{11}\,\text{m}$, $T = 365.26\,\text{d}$).

<details>
<summary>Show solution</summary>

$M = \frac{4\pi^2 a^3}{G\,T^2} = \frac{4\pi^2 \cdot (1.496 \cdot 10^{11}\,\text{m})^3}{6.674 \cdot 10^{-11}\,\tfrac{\text{N}\,\text{m}^2}{\text{kg}^2} \cdot (3.156 \cdot 10^{7}\,\text{s})^2} \approx 1.99 \cdot 10^{30}\,\text{kg}$. This is how astronomers determine the masses of stars and of planets with moons.

</details>

## Ideas for the classroom

- **Use:** gravitation and Kepler's laws in upper secondary, also to revise circular motion and conservation of energy. Well suited to pair work: guess the law, check it in the simulation, confirm it with the table or the log–log graph.
- **Model:** star and planet are point masses, $m \ll M$ (the star stays at rest; strictly speaking both orbit their common centre of mass). Only the star's gravity acts; perturbations by other planets are missing. The orbit is calculated with the leapfrog (Verlet) method with a fixed step size; the energy is conserved to better than $10^{-4}$ (relative), the angular momentum exactly up to rounding. Star and planet are drawn much larger than to scale; one orbit takes about 8 seconds in the simulation. The dashed line is the exactly calculated conic section for comparison.
- **Data:** the planetary values are rounded mean orbital elements (JPL, after E. M. Standish); the period follows from the mean motion. The small deviations of $\frac{T^2}{a^3}$ (below 0.2 %) come from the planets disturbing each other and from the planets' own mass. Other sources differ slightly in the last digits.
- **Notation:** linear eccentricity $e$ (in AU), eccentricity $\varepsilon = \frac{e}{a}$; $1\,\text{AU} = 1.496 \cdot 10^{11}\,\text{m}$, $1\,\text{yr} = 3.156 \cdot 10^{7}\,\text{s}$, $1\,M_\odot \approx 1.99 \cdot 10^{30}\,\text{kg}$. With “Values in the picture” switched off and `_hide=1` you can set calculation tasks.
- **Common pitfalls:**
  - “The Sun is at the centre of the ellipse.” – It is at one focus; the second focus is empty.
  - “Planetary orbits are very elongated ellipses.” – The planets' orbits are almost circles (Earth: $\varepsilon \approx 0.017$); textbook pictures exaggerate the eccentricity. “Orbits of the planets for comparison” shows this to scale.
  - “In summer the Earth is closest to the Sun.” – The Earth passes perihelion in early January; the seasons are caused by the tilt of the Earth's axis.
  - “A heavy planet takes longer for one orbit.” – The mass $m$ cancels; $T$ depends only on $a$ and $M$.
  - “To escape you have to launch straight outwards.” – Only the speed matters (energy), not the direction.
