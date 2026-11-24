---
description: Interactive Hertzsprung–Russell diagram – real stars by temperature and luminosity, Stefan–Boltzmann and Wien's laws, the life of a star up to a supernova and distance from parallax.
---

## What is it about?

Stars differ above all in two things: how **hot** their surface is and how much light they give off in total, their **luminosity** $L$. If you plot every star with these two values in a diagram, you get the **Hertzsprung–Russell diagram** (HRD). The temperature **decreases to the right** (hot and blue on the left, cool and red on the right), the luminosity increases upwards. Both axes are logarithmic; otherwise stars with a million times and a thousandth of the Sun's luminosity would not fit into one picture.

The stars are not scattered at random:

- About 90 % lie on the **main sequence**. There they fuse hydrogen into helium in their core – just like the Sun.
- At the top right are **red giants** and **supergiants**: cool, but huge and therefore bright (for example Betelgeuse).
- At the bottom left are **white dwarfs**: hot, but only as large as the Earth (for example Sirius B).

**Stefan–Boltzmann law:** a star radiates $\sigma \cdot T^4$ per square metre of surface. With the surface area $4\pi R^2$:

$$
L = 4\pi R^2 \cdot \sigma \cdot T^4, \qquad \frac{L}{L_\odot} = \left(\frac{R}{R_\odot}\right)^{2} \cdot \left(\frac{T}{T_\odot}\right)^{4},
$$

with $T_\odot \approx 5772\,\text{K}$ (often rounded to $5778\,\text{K}$) and $L_\odot = 3.83 \cdot 10^{26}\,\text{W}$. Twice the temperature at the same radius gives $2^4 = 16$ times the luminosity, twice the radius gives $4$ times. That is why the dashed lines of equal radius in the HRD are straight lines.

**Colour and Wien's displacement law:** the maximum of the radiation lies at $\lambda_{\max} = \frac{2.898\,\text{mm}\cdot\text{K}}{T}$. For the Sun that is about $502\,\text{nm}$ (green; we still see the Sun as whitish because it emits all colours). Cool stars glow reddish, hot ones bluish. Stars are sorted by this into **spectral classes** O, B, A, F, G, K, M (from hot to cool); the Sun is a G star.

**Life cycle:** the **mass** determines the life of a star. On the main sequence roughly $L \sim M^{3.5}$ to $M^4$, and the lifetime is about $t \approx 10\,\text{billion years} \cdot \frac{M}{L}$ (in solar units). A star with $2\,M_\odot$ is 16 times as bright and lives only $1.25$ billion years. Stars like the Sun become red giants, shed their outer layers as a **planetary nebula** and end as a **white dwarf**. From about $8\,M_\odot$ upwards a star ends as a **supernova**; what remains is a **neutron star** or a **black hole**.

**Distance from parallax:** over the course of a year we see a nearby star from different points on the Earth's orbit. Against the distant stars it seems to move back and forth. Half the angle is called the **parallax** $p$. Then

$$
d = \frac{1}{p} \quad (d \text{ in parsecs, } p \text{ in arcseconds}), \qquad 1\,\text{pc} \approx 3.26\,\text{light years}.
$$

A **light year** is the distance light travels in one year, about $9.46 \cdot 10^{12}\,\text{km}$.

## Try it

1. Tap the Sun, Betelgeuse and Sirius B. Compare temperature, luminosity and radius. [HR diagram](?mode=hrd&star=sun&own=0)
2. Place your own star and drag it along a dashed line. What stays the same? [Own star](?mode=hrd&own=1&T=8000&lr=0.3)
3. Double the temperature at the same radius. By what factor does the luminosity increase? [Comparison](?mode=compare&star=sun&T=11500&lr=0)
4. Put the Sun next to Betelgeuse. How many Suns fit across its diameter? [Giant](?mode=compare&star=betelgeuse&T=5800&lr=0)
5. Play the life of the Sun. Which stage lasts longest? [Sun](?mode=life&m=1&age=30)
6. Compare with a star of 20 solar masses. [Supernova](?mode=life&m=20&age=30)
7. Choose nearby stars. Which can be seen with the naked eye? [Parallax](?mode=parallax&pstar=sirius&p=0.379)
8. Practice: place unknown stars in the HR diagram. [Practice](?mode=quiz&qn=1)
9. Switch on the spectral classes. Which class does the Sun belong to? [Classes](?mode=hrd&classes=1&star=sun)

## Exercises

### Exercise 1: Hot star

A star has the same radius as the Sun but twice its surface temperature. What is its luminosity?

<details>
<summary>Show solution</summary>

$\frac{L}{L_\odot} = 1^2 \cdot 2^4 = 16$. It gives off 16 times as much light as the Sun. [Show in the simulation](?mode=compare&star=sun&T=11500&lr=0)

</details>

### Exercise 2: Red giant

A star has 100 times the Sun's radius but only half the Sun's temperature. How bright is it?

<details>
<summary>Show solution</summary>

$\frac{L}{L_\odot} = 100^2 \cdot \left(\tfrac{1}{2}\right)^4 = \frac{10\,000}{16} = 625$. Despite its cool surface it is 625 times as bright as the Sun, because its surface is 10 000 times as large. [Show in the HRD](?mode=hrd&own=1&T=2900&lr=2)

</details>

### Exercise 3: Parallax

Proxima Centauri has a parallax of $0.768''$. How far away is the star?

<details>
<summary>Show solution</summary>

$d = \frac{1}{0.768}\,\text{pc} \approx 1.30\,\text{pc} \approx 1.30 \cdot 3.26\,\text{ly} \approx 4.25\,\text{ly}$. So its light takes just over four years to reach us. [Show in the simulation](?mode=parallax&pstar=proxima&p=0.768)

</details>

### Exercise 4: Lifetime

How long does a star with $2\,M_\odot$ stay on the main sequence if $L = M^4$?

<details>
<summary>Show solution</summary>

$L = 2^4 = 16\,L_\odot$, so $t \approx 10\,\text{billion years} \cdot \frac{2}{16} = 1.25\,\text{billion years}$. It has twice as much fuel as the Sun but uses it 16 times as fast. [Show in the simulation](?mode=life&m=2&age=30)

</details>

## Ideas for the classroom

- **Starter:** show a picture of Orion: why is Betelgeuse reddish and Rigel bluish? Then find both in the HRD.
- **Lines of equal radius:** drag your own star once along a line and once across it, and describe what changes each time.
- **Life cycle:** the timeline is not linear – the late stages are strongly stretched. This is a good reason to talk about representations and scales.
- **Common pitfalls:** “Red stars are hotter” (think of a hotplate!); “Big stars live longer”; the temperature axis decreasing to the right.
- **Curriculum link:** astrophysics is an optional or extension topic of upper secondary in many places; simple parts (light year, stellar evolution) sometimes appear from grade 7 – please check your own curriculum. The values for the real stars are rounded, the life cycle is schematic.
