## What is it about?

In 1929 **Edwin Hubble** compared the distances of galaxies with their spectra. Almost all spectral lines were shifted towards the red end – and the further away the galaxy, the stronger the shift. Interpreted as a velocity, this means: **the further away, the faster a galaxy recedes.**

$$
v = H_0 \cdot d \qquad \text{(Hubble's law)}
$$

The **Hubble constant** $H_0$ is about $70\,\tfrac{\text{km}}{\text{s}\cdot\text{Mpc}}$ today. A megaparsec (Mpc) is about 3.26 million light years. So a galaxy at a distance of $100\,\text{Mpc}$ recedes at about $7000\,\tfrac{\text{km}}{\text{s}}$.

**Redshift:** it is measured using known lines, for example the hydrogen line H$\alpha$ ($\lambda_0 = 656.3\,\text{nm}$):

$$
z = \frac{\lambda - \lambda_0}{\lambda_0}, \qquad v \approx c \cdot z \quad (\text{only for } z \ll 1).
$$

For $v = 7000\,\tfrac{\text{km}}{\text{s}}$, $z = \tfrac{7000}{299\,792} \approx 0.023$, and H$\alpha$ appears at about $671.6\,\text{nm}$.

**No centre:** in the raisin bread model all distances grow by the same factor. From every raisin it looks as if all the others fly away, the distant ones faster. So our Milky Way is not the centre. The galaxies themselves do not get bigger, only the distances between them.

**Space is expanding:** strictly speaking, distant galaxies are not moving through space; space itself is expanding. Light on its way is stretched along with it: $1 + z = \tfrac{a_\text{today}}{a_\text{then}}$. Here $a$ is the **scale factor**, which tells how large distances were then compared with today. That is why $H_0 \cdot d$ may even be larger than the speed of light for very distant galaxies.

**Age of the universe:** if you run the motion backwards at constant speed, all galaxies were in one place a **Hubble time**

$$
t_H = \frac{1}{H_0} \approx 14.0\ \text{billion years}
$$

ago. How fast the universe really expanded depends on what it contains (Friedmann equations). Matter slows the expansion, **dark energy** speeds it up. In today's standard model ($\Omega_m = 0.3$, $\Omega_\Lambda = 0.7$) the universe is about **13.5 billion years** old.

**Background radiation:** about 380 000 years after the Big Bang, the universe became transparent. The light from that time ($T \approx 3000\,\text{K}$) has been stretched by $z \approx 1090$ and arrives today from all directions as microwave radiation with $T = 2.7\,\text{K}$ ($\lambda_\text{max} \approx 1.06\,\text{mm}$).

**Measuring distances:** type Ia supernovae all shine about equally brightly ($M \approx -19.3$). The measured brightness $m$ gives the distance: $d = 10^{(m - M)/5 + 1}\,\text{pc}$. Such objects are called **standard candles**.

## Try it

1. Choose a galaxy at the edge as home. Does the expansion look different from there? [Home at the edge](?mode=raisin&home=9&trail=1)
2. Drag the distant galaxy further away. When does the H$\alpha$ line leave the visible range? [Spectrum](?mode=spectrum&d=100&zc=cosmo)
3. Choose the simple calculation and push the galaxy to 5000 Mpc. What is strange about $v$? [v > c?](?mode=spectrum&d=5000&zc=classic)
4. Fit the line to Hubble's data from 1929 yourself. What age of the universe results? [Hubble 1929](?mode=diagram&set=1929&hu=300&fit=1)
5. Observe ten galaxies and determine $H_0$ yourself. [Research yourself](?mode=research&h0=70&noise=1&fit=1)
6. Compare the standard model with a universe made only of matter. Which one is older? [History](?mode=history&om=0.3&ol=0.7&lz=0.3)

## Exercises

### Exercise 1: Recession speed

A galaxy is 200 Mpc away. How fast does it recede ($H_0 = 70\,\tfrac{\text{km}}{\text{s}\cdot\text{Mpc}}$)? How many light years is that?

<details>
<summary>Show solution</summary>

$v = 70 \cdot 200 = 14\,000\,\tfrac{\text{km}}{\text{s}}$. $200\,\text{Mpc} \approx 200 \cdot 3.26 \approx 652$ million light years. [Show in the simulation](?mode=spectrum&d=200&zc=classic)

</details>

### Exercise 2: From the spectrum to the distance

In the spectrum of a galaxy, H$\alpha$ lies at $721.9\,\text{nm}$. Find $z$, $v$ and $d$.

<details>
<summary>Show solution</summary>

$z = \tfrac{721.9 - 656.3}{656.3} \approx 0.10$, $v \approx c \cdot z \approx 30\,000\,\tfrac{\text{km}}{\text{s}}$, $d = \tfrac{v}{H_0} \approx 428\,\text{Mpc}$. At $z = 0.1$, $v = c \cdot z$ is already only an approximation.

</details>

### Exercise 3: Standard candle

A type Ia supernova ($M = -19.3$) appears with $m = 15.7$. How far away is it?

<details>
<summary>Show solution</summary>

$m - M = 35$, so $d = 10^{35/5 + 1}\,\text{pc} = 10^8\,\text{pc} = 100\,\text{Mpc}$.

</details>

### Exercise 4: Hubble's error

In 1929 Hubble found about $H_0 = 500\,\tfrac{\text{km}}{\text{s}\cdot\text{Mpc}}$. What Hubble time follows from that? Why was this a problem?

<details>
<summary>Show solution</summary>

$t_H = \tfrac{1}{H_0} \approx \tfrac{14.0 \cdot 70}{500} \approx 2.0$ billion years. But the Earth is about 4.5 billion years old. The error lay in the distances: they were about 7 times too small. [Hubble 1929](?mode=diagram&set=1929&hu=500&fit=1)

</details>

### Exercise 5: Background radiation

The background radiation today has $T = 2.73\,\text{K}$. At what wavelength does it radiate most strongly? How hot was it at $z = 1090$?

<details>
<summary>Show solution</summary>

$\lambda_\text{max} = \tfrac{2.898 \cdot 10^{-3}\,\text{m K}}{2.73\,\text{K}} \approx 1.06\,\text{mm}$. Back then: $T = 2.73\,\text{K} \cdot 1091 \approx 2970\,\text{K}$. [Show in the simulation](?mode=history&om=0.3&ol=0.7&lz=3.04)

</details>

## Ideas for the classroom

- **Starter:** blow up a balloon with dots stuck on it. Each group measures the distances from “their” dot before and after.
- **Research:** in the “Research yourself” view, every group can record its own series of measurements. Then the values found for $H_0$ can be compared.
- **History:** Hubble's data from 1929 show nicely how strongly wrongly calibrated distances change the result.
- **Common pitfalls:**
  - “The Milky Way is the centre.” In the raisin bread model it looks the same from every galaxy.
  - Redshift as an ordinary Doppler effect: for distant galaxies the light stretches with space.
  - Hubble time and the age of the universe are not the same.
