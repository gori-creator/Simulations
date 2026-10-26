---
description: "Interactive simulation of refraction and total internal reflection – turn a laser on the optical disc, Snell’s law and Fresnel shares, Snell diagrams, fibres, prisms and gems, measure an unknown refractive index, plate, prism with dispersion and apparent depth."
---

## What is it about?

At the boundary between two transparent materials light is partly reflected and partly refracted. All angles are measured from the **normal**. Snell’s law:

$$
n_1 \sin\alpha = n_2 \sin\beta
$$

Light is slower in a material ($c = c_0/n$), so its wavefronts move closer together and bend. Plotting $\sin\beta$ against $\sin\alpha$ gives a straight line through the origin with slope $n_1/n_2$. Going into a less dense material, there is a **critical angle** $\alpha_c$ with $\sin\alpha_c = \frac{n_2}{n_1}$ (water → air $48.8^\circ$, glass → air $41.1^\circ$, diamond → air $24.4^\circ$); beyond it, light is totally reflected – the principle of optical fibres, reflecting prisms and sparkling diamonds.

## Try it

1. Drag the laser around the protractor. [Wavefronts](?wave=1)
2. Let light come from glass and increase the angle. [Snell diagram](?mode=graph&from=bottom&bottom=glas&alpha=30)
3. Bend the acrylic light guide more and more tightly. [Light guide](?mode=total&mat=plexiglas&ain=40&rb=3)
4. Measure an unknown sample. [Unknown sample](?mode=measure)

## Tasks

### Task 1: Angle of refraction

Light goes from air into water at $40^\circ$. Find $\beta$. [Load task](?alpha=40&_hide=1)

<details>
<summary>Show solution</summary>

$\sin\beta = \sin 40^\circ / 1.33 \approx 0.483$, so $\beta \approx 28.9^\circ$.

</details>

### Task 2: Critical angle

Find the critical angle for glass → air. [Load task](?from=bottom&bottom=glas&alpha=35&_hide=1)

<details>
<summary>Show solution</summary>

$\sin\alpha_c = 1/1.52$, so $\alpha_c \approx 41.1^\circ$. [Show total reflection](?from=bottom&bottom=glas&alpha=50)

</details>

### Task 3: Apparent depth

A fish swims $1.00\,\text{m}$ deep. How deep does it look from almost straight above?

<details>
<summary>Show solution</summary>

$h' \approx h \cdot \frac{1.00}{1.33} \approx 0.75\,\text{m}$. [Fish in water](?mode=optics&ex=depth&mat=wasser&alpha=30)

</details>

## Ideas for the classroom

- The brightness of the rays follows the Fresnel equations for unpolarised light; fibre, prism and gem are traced as 2D cross-sections. Dispersion uses Cauchy’s formula for crown glass – an approximation.
- **Common stumbling blocks:** angles are measured from the surface instead of the normal; total internal reflection only happens when going into the optically less dense material.
