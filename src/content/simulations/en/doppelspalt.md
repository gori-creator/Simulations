## What is it about?

If you send laser light through two very narrow slits close together, a distant screen does not show two bright lines but a whole row of bright and dark fringes. This can only be explained with the **wave model of light**: according to **Huygens' principle** a circular wave spreads out from each slit, and the waves **superpose** (interference).

In the direction $\alpha$, the light from neighbouring slits has the **path difference** $\Delta s = g \cdot \sin\alpha$; $g$ is the distance between the centres of the slits. Principal maxima (reinforcement) occur when $\Delta s$ is a multiple of the wavelength:

$$
\sin\alpha_k = \frac{k \cdot \lambda}{g}, \qquad k = 0, \pm 1, \pm 2, \dots
$$

On a screen at distance $a$, the $k$-th maximum lies at $x_k = a \cdot \tan\alpha_k$. For small angles $\tan\alpha \approx \sin\alpha$, and neighbouring maxima are

$$
\Delta x \approx \frac{\lambda \cdot a}{g}
$$

apart.

For the double slit the dark fringes (minima) lie exactly in between: there the path difference is an odd multiple of half the wavelength, $\Delta s = (2k + 1) \cdot \frac{\lambda}{2}$, and the two waves cancel.

Because $|\sin\alpha| < 1$, there are only finitely many maxima: the highest order is the largest $k$ with $k < \frac{g}{\lambda}$. If $\lambda \geq g$, there is no maximum apart from the centre.

**More slits and gratings:** with $N$ slits the principal maxima stay in the same places but become **sharper and brighter**; between them lie $N - 1$ zeros and $N - 2$ weak **secondary maxima**. A **grating** has very many slits close together. Its slit spacing is the **grating constant** $g = \frac{1\,\text{mm}}{\text{lines per mm}}$, so with $500$ lines per mm $g = \frac{1\,\text{mm}}{500} = 2\,\mu\text{m}$. The maxima are sharp lines at large angles – ideal for measuring wavelengths precisely. Because the angles are large, you have to calculate with $\tan$ and $\sin$ here; the small-angle approximation is too inaccurate.

**Single slit:** a single slit of width $b$ also diffracts light. It produces a broad bright central maximum and minima at $\sin\alpha = k \cdot \frac{\lambda}{b}$. This **single-slit envelope** also limits the brightness of the maxima of the double slit and the grating. If a principal maximum falls exactly on a minimum of the envelope, it disappears completely (“missing order”).

**Light and colour:** visible light has wavelengths from about $380\,\text{nm}$ (violet) to $780\,\text{nm}$ (red); the slider covers $400$ to $700\,\text{nm}$. A red laser pointer has about $650\,\text{nm}$, a green one $532\,\text{nm}$. Red light is deflected more than blue light, so its fringes are further apart.

**About the display:** in the set-up at the top the slits are greatly enlarged and the distance $a$ is not to scale. In the model the slit width is $b = \frac{g}{6}$; that is why the orders $k = 6, 12, \dots$ are missing. The screen pattern and the values in the table, however, are calculated exactly.

## Try it

1. Look at the wave field behind the double slit. Where do the waves reinforce each other, where do they cancel? [Load example](?xm=13)
2. Drag the marker onto the first bright maximum next to the centre and read off $x_1$. Compare with $\Delta x \approx \frac{\lambda a}{g}$.
3. Change $\lambda$, $g$ and $a$ one after the other. How does the fringe spacing change each time?
4. Increase the number of slits from $2$ to $5$ and $10$. What happens to the maxima, and what appears in between? [Five slits](?N=5&env=1)
5. Switch to the grating. Why do you see only a few lines far apart? [Grating](?mode=grating&gl=500&lam=500&a=1&xm=258)
6. Only one slit: what does the pattern look like now? [Single slit](?N=1&xm=40)

## Exercises

### Exercise 1: Red laser and double slit

A laser ($\lambda = 650\,\text{nm}$) illuminates a double slit with $g = 0.10\,\text{mm}$. The screen is $2.0\,\text{m}$ away. How far apart are neighbouring maxima? [Load exercise](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta x \approx \frac{\lambda \cdot a}{g} = \frac{650 \cdot 10^{-9}\,\text{m} \cdot 2.0\,\text{m}}{0.10 \cdot 10^{-3}\,\text{m}} = 13\,\text{mm}$. The angle to the first maximum is only $0.37°$, so the small-angle approximation fits very well. [Show in the simulation](?xm=13)

</details>

### Exercise 2: Measuring the wavelength

With the same double slit ($g = 0.10\,\text{mm}$, $a = 2.0\,\text{m}$) you measure $52\,\text{mm}$ from the maximum $k = -2$ to $k = 2$. Find $\lambda$.

<details>
<summary>Show solution</summary>

Between $k = -2$ and $k = 2$ there are $4$ spacings: $\Delta x = 13\,\text{mm}$. $\lambda = \frac{\Delta x \cdot g}{a} = \frac{13 \cdot 10^{-3}\,\text{m} \cdot 0.10 \cdot 10^{-3}\,\text{m}}{2.0\,\text{m}} = 650\,\text{nm}$. Measuring across several spacings reduces the measurement error.

</details>

### Exercise 3: Grating

A grating has $500$ lines per mm; it is illuminated with $\lambda = 500\,\text{nm}$, and the screen is $1.0\,\text{m}$ away. Calculate $\alpha_1$ and $x_1$. What is the highest visible order? [Load exercise](?mode=grating&gl=500&lam=500&a=1&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$g = \frac{1\,\text{mm}}{500} = 2\,\mu\text{m}$. $\sin\alpha_1 = \frac{500\,\text{nm}}{2000\,\text{nm}} = 0.25$, so $\alpha_1 \approx 14.48°$ and $x_1 = 1.0\,\text{m} \cdot \tan 14.48° \approx 25.8\,\text{cm}$. Because $\frac{g}{\lambda} = 4$, $k = 4$ would lie exactly at $90°$; visible are $k = 0, \pm 1, \pm 2, \pm 3$ ($\alpha_3 \approx 48.6°$). [Show in the simulation](?mode=grating&gl=500&lam=500&a=1&xm=258)

</details>

### Exercise 4: Small-angle approximation with a grating

Why may you not use $\Delta x \approx \frac{\lambda a}{g}$ in Exercise 3? Compare $x_1$ and $x_2$.

<details>
<summary>Show solution</summary>

The angles are large ($\alpha_2 = 30°$). With $\tan$ you get $x_2 = \tan 30° \cdot 1.0\,\text{m} \approx 57.7\,\text{cm}$, which is not twice $x_1 = 25.8\,\text{cm}$. The approximation would give $25\,\text{cm}$ for every spacing.

</details>

### Exercise 5: More slits

What changes in the screen pattern if you use five slits with the same spacing instead of two? What stays the same? [Five slits](?N=5&env=1)

<details>
<summary>Show solution</summary>

The positions of the principal maxima stay the same, because they only depend on $g$ and $\lambda$. The maxima become narrower and brighter; in between there are $4$ zeros and $3$ weak secondary maxima.

</details>

### Exercise 6: First minimum

Where is the first dark minimum next to the centre for the double slit from Exercise 1? Explain using the path difference. [Load exercise](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

At the first minimum $\Delta s = \frac{\lambda}{2}$, so $\sin\alpha = \frac{\lambda}{2g} = \frac{650\,\text{nm}}{0.20\,\text{mm}} = 0.00325$. Hence $x \approx a \cdot \sin\alpha = 2.0\,\text{m} \cdot 0.00325 = 6.5\,\text{mm}$, exactly halfway between $k = 0$ and $k = 1$. The marker shows $0\,\%$ intensity there. [Show in the simulation](?xm=6.5)

</details>

### Exercise 7: Measuring a wavelength with a grating

A green laser illuminates a grating with $500$ lines per mm. On the screen $1.0\,\text{m}$ away, the first-order maximum is $27.6\,\text{cm}$ from the centre. Find $\lambda$.

<details>
<summary>Show solution</summary>

$\tan\alpha_1 = \frac{27.6\,\text{cm}}{100\,\text{cm}} = 0.276$, so $\alpha_1 \approx 15.43°$ and $\sin\alpha_1 \approx 0.266$. With $g = 2\,\mu\text{m}$ we get $\lambda = g \cdot \sin\alpha_1 \approx 2000\,\text{nm} \cdot 0.266 \approx 532\,\text{nm}$. The small-angle approximation ($\lambda \approx \frac{g \cdot x}{a}$) would give $552\,\text{nm}$, almost $4\,\%$ too much. [Show in the simulation](?mode=grating&gl=500&lam=532&a=1&xm=276)

</details>

## Ideas for the classroom

- **Use:** upper secondary, with the wave model of light; please check the exact place in your curriculum. Good as preparation for the student experiment with laser, double slit and grating: predict here first, then measure for real.
- **Possible sequence:** build on interference in the ripple tank, then transfer the condition $\Delta s = k \cdot \lambda$ to light, find $\Delta x$ with the marker and finally measure the wavelength precisely with the grating. The switch “Show values in the picture” hides angles and distances in the table; the exercise links do this automatically.
- **Model:** Fraunhofer approximation (screen far away), equal slit widths $b = \frac{g}{6}$, ideal monochromatic light.
- **Common pitfalls:**
  - “Larger slit spacing, larger fringe spacing.” – The other way round: $\Delta x \sim \frac{1}{g}$.
  - “The grating has more maxima because it has more slits.” – The number of principal maxima depends on $\frac{g}{\lambda}$, not on $N$; more slits only make them sharper.
  - The small-angle approximation is often used for gratings without checking.
- **Going further:** spectra with a grating, electron diffraction, X-ray diffraction by crystals, interference in thin films.
