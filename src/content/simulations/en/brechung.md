---
description: "Interactive simulation of refraction and total internal reflection – turn a laser on the optical disc, Snell’s law and Fresnel shares, Snell diagrams, fibres, prisms and gems, measure an unknown refractive index, plate, prism with dispersion and apparent depth."
---

## What is it about?

When light hits the boundary between two transparent materials at an angle, part of it is **reflected** and part of it is **refracted**, i.e. bent. All angles are measured from the **normal**, the line perpendicular to the boundary. For reflection $\alpha' = \alpha$; for refraction **Snell’s law** holds:

$$
n_1 \cdot \sin\alpha = n_2 \cdot \sin\beta
$$

The **refractive index** $n$ tells you how much slower light is in the material: $c = \frac{c_0}{n}$, so in water $c = \frac{299\,792\,458\,\text{m/s}}{1.33} \approx 2.25 \cdot 10^8\,\tfrac{\text{m}}{\text{s}}$. Strictly speaking, air has $n = 1.0003$; at school and in the simulation we use $n = 1.00$. For glass the simulation uses crown glass with $n = 1.52$ (often $n \approx 1.5$ is used as well). Going into the **optically denser** material (larger $n$), light is bent **towards the normal**, otherwise **away from the normal**. Wavefronts (Huygens) show why: in the denser material the fronts move closer together ($\lambda_2 = \lambda_1 \cdot \frac{n_1}{n_2}$) and bend at the boundary.

Plotting $\sin\beta$ against $\sin\alpha$ gives a **straight line through the origin** with slope $\frac{n_1}{n_2}$ – this is how an unknown refractive index can be measured.

**Total internal reflection:** going from the denser into the less dense material, there is a **critical angle** $\alpha_c$ with $\sin\alpha_c = \frac{n_2}{n_1}$: water → air $48.8^\circ$, glass → air $41.1^\circ$ (calculated with $n = 1.5$: $41.8^\circ$), diamond → air $24.4^\circ$. If $\alpha > \alpha_c$, all the light is reflected. This is used in **optical fibres**, **reflecting prisms** and cut **diamonds**.

How much light is reflected is described by the **Fresnel equations**. At normal incidence on glass it is $\left(\frac{1.52 - 1}{1.52 + 1}\right)^2 \approx 4.3\,\%$. Just before the critical angle the share rises steeply to $100\,\%$.

## Try it

1. Drag the laser around the protractor. When is the light bent towards the normal, when away from it? What happens at $\alpha = 0^\circ$? [Normal incidence](?alpha=0)
2. Switch on the wavefronts. Where are they closer together? [Wavefronts](?wave=1)
3. Let the light come from the glass and slowly increase $\alpha$. Watch the point in the graph of $\beta$ against $\alpha$ – where does the curve end? [Snell diagram](?mode=graph&from=bottom&bottom=glas&alpha=30)
4. Bend the acrylic light guide more and more tightly (drag the blue handle). When is light lost? [Light guide](?mode=total&mat=plexiglas&ain=40&rb=3)
5. Compare the brilliant cut in glass and in diamond. [Diamond](?mode=total&app=gem&mat=diamant&ain=0) · [Glass](?mode=total&app=gem&mat=glas&ain=0)
6. Send white light through a glass prism. Which colour is deviated most? [Prism](?mode=optics&ex=prism&alpha=50)
7. Measure at least three pairs $(\alpha \mid \beta)$ on an unknown sample. Do the points in the graph of $\sin\beta$ against $\sin\alpha$ lie on a straight line through the origin? [Unknown sample](?mode=measure)
8. Turn the laser at the parallel-sided plate. Does the emerging ray stay parallel to the incident ray? When is the shift largest? [Plate](?mode=optics&ex=plate&alpha=40)

## Tasks

### Task 1: Calculate the angle of refraction

Light goes from air into water ($n = 1.33$) at $\alpha = 40^\circ$. Calculate the angle of refraction. [Load task](?alpha=40&_hide=1)

<details>
<summary>Show solution</summary>

$$\sin\beta = \frac{1.00 \cdot \sin 40^\circ}{1.33} \approx 0.483 \quad\Rightarrow\quad \beta \approx 28.9^\circ$$

</details>

### Task 2: Critical angle

Calculate the critical angle of total internal reflection for glass → air and check it in the simulation. [Load task](?from=bottom&bottom=glas&alpha=35&_hide=1)

<details>
<summary>Show solution</summary>

$$\sin\alpha_c = \frac{1.00}{1.52} \quad\Rightarrow\quad \alpha_c \approx 41.1^\circ$$

From this angle on, the refracted ray disappears. [Show total internal reflection](?from=bottom&bottom=glas&alpha=50)

</details>

### Task 3: Unknown material

A group measures on sample 3: $\alpha = 30^\circ \to \beta = 20.0^\circ$, $\alpha = 50^\circ \to \beta = 31.5^\circ$, $\alpha = 70^\circ \to \beta = 39.5^\circ$. Find the refractive index from the slope of $\sin\beta$ against $\sin\alpha$. [Measure yourself](?mode=measure&x=3&_hide=1)

<details>
<summary>Show solution</summary>

Pairs $(\sin\alpha \mid \sin\beta)$: $(0.500 \mid 0.342)$, $(0.766 \mid 0.522)$, $(0.940 \mid 0.636)$. The line through the origin has slope $k \approx 0.680$, so $n = \frac{1}{k} \approx 1.47$ – this matches glycerol ($n = 1.47$).

</details>

### Task 4: Reflection at a glass pane

What percentage of the light is reflected at a glass surface at normal incidence? At which angle is the reflected light completely polarised (Brewster angle $\tan\alpha_B = \frac{n_2}{n_1}$)?

<details>
<summary>Show solution</summary>

$R = \left(\frac{0.52}{2.52}\right)^2 \approx 0.0426 = 4.26\,\%$. $\alpha_B = \arctan 1.52 \approx 56.7^\circ$; there the share $R_p$ is zero. [Show Brewster angle](?bottom=glas&alpha=57)

</details>

### Task 5: Fibre with cladding

A fibre has a glass core ($n = 1.52$) and a cladding with $n = 1.49$. Calculate the critical angle at the wall and the largest angle $\theta_{max}$ at which light from air may be coupled in ($\sin\theta_{max} = \sqrt{n_{core}^2 - n_{clad}^2}$).

<details>
<summary>Show solution</summary>

$\alpha_c = \arcsin\frac{1.49}{1.52} \approx 78.6^\circ$ – the light has to hit the wall very obliquely. $\sin\theta_{max} = \sqrt{1.52^2 - 1.49^2} \approx 0.300$, so $\theta_{max} \approx 17.5^\circ$. With such a small difference in refractive index, even gentle bends let light escape: the fibre in the simulation is $1\,\text{mm}$ thick, and even at $R = 15\,\text{mm}$ no light arrives at the end. Real optical fibres have a much thinner core (often less than $0.01\,\text{mm}$), so they can cope with bends of a few centimetres radius. [Fibre with cladding](?mode=total&clad=plexiglas&ain=10&rb=15)

</details>

### Task 6: The fish is deeper than it looks

A fish swims $1.00\,\text{m}$ deep. How deep does it appear when you look almost straight down? [Load task](?mode=optics&ex=depth&mat=wasser&alpha=0&_hide=1)

<details>
<summary>Show solution</summary>

For small angles $h' \approx h \cdot \frac{n_\text{air}}{n_\text{water}} = \frac{1.00\,\text{m}}{1.33} \approx 0.75\,\text{m}$. Looking obliquely (light at $30^\circ$ in the water), it appears only $0.65\,\text{m}$ deep. [Fish in water](?mode=optics&ex=depth&mat=wasser&alpha=30)

</details>

## Ideas for the classroom

- **Use:** optics in lower secondary school (refraction, total internal reflection), extended with Snell’s law, a series of measurements and applications; please check the exact place in your curriculum. The measurements on the unknown sample fit well before or after a real experiment with the optical disc.
- **Model:** the brightness of the rays follows the Fresnel equations for unpolarised light. Fibre, prism and gem are calculated as 2D cross-sections with ray tracing. Dispersion uses Cauchy’s formula for crown glass – an approximation; the colours lie so close together on the screen that a magnified detail is shown.
- **Common stumbling blocks:**
  - Angles are measured from the surface instead of the normal.
  - “In total internal reflection the light is swallowed.” – It is reflected completely; even otherwise a small part is always reflected.
  - “Total internal reflection also happens from air into water.” – Only when going into the optically less dense material.
  - “Light is faster in glass because it is denser.” – It is slower: $c = c_0/n$.
