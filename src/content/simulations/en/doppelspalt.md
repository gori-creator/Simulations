## What is it about?

Laser light passing through two narrow slits gives a whole series of bright and dark fringes on a distant screen – explained by the **wave model of light**: each slit sends out a circular wave (**Huygens**), and the waves **interfere**. In direction $\alpha$ neighbouring slits have the path difference $\Delta s = g \cdot \sin\alpha$, so principal maxima appear at

$$
\sin\alpha_k = \frac{k \cdot \lambda}{g}, \qquad x_k = a \cdot \tan\alpha_k, \qquad \Delta x \approx \frac{\lambda \cdot a}{g} \text{ (small angles)}.
$$

More slits make the maxima **sharper**, with $N - 2$ weak secondary maxima in between. A **grating** (e.g. $500$ lines per mm, $g = 2\,\mu\text{m}$) gives sharp lines at large angles. In the picture the slits are greatly enlarged; the slit width in the model is $b = \frac{g}{6}$.

## Try it

1. Drag the measuring mark to the first maximum and compare with $\frac{\lambda a}{g}$. [Load example](?xm=13)
2. Increase the number of slits. [Five slits](?N=5&env=1)
3. Switch to the grating. [Grating](?mode=grating&gl=500&lam=500&a=1&xm=258)
4. Try a single slit. [Single slit](?N=1&xm=40)

## Tasks

### Task 1: Red laser

$\lambda = 650\,\text{nm}$, $g = 0.10\,\text{mm}$, $a = 2.0\,\text{m}$. Find the distance between neighbouring maxima. [Load task](?val=0&_hide=1)

<details>
<summary>Show solution</summary>

$\Delta x \approx \frac{650 \cdot 10^{-9}\,\text{m} \cdot 2.0\,\text{m}}{0.10 \cdot 10^{-3}\,\text{m}} = 13\,\text{mm}$. [Show in the simulation](?xm=13)

</details>

### Task 2: Grating

$500$ lines per mm, $\lambda = 500\,\text{nm}$, $a = 1.0\,\text{m}$. Find $\alpha_1$, $x_1$ and the highest visible order. [Load task](?mode=grating&gl=500&lam=500&a=1&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$g = 2\,\mu\text{m}$, $\sin\alpha_1 = 0.25$, $\alpha_1 \approx 14.48°$, $x_1 \approx 25.8\,\text{cm}$. $k = 4$ would lie at $90°$, so the highest visible order is $k = 3$. [Show in the simulation](?mode=grating&gl=500&lam=500&a=1&xm=258)

</details>

### Task 3: More slits

What changes with five instead of two slits (same $g$)?

<details>
<summary>Show solution</summary>

The positions of the principal maxima stay the same; they become narrower and brighter, with $3$ weak secondary maxima in between. [Show in the simulation](?N=5&env=1)

</details>

## Ideas for the classroom

- Predict here first, then measure with a real laser, double slit and grating.
- **Common stumbling blocks:**
  - “Larger slit spacing, larger fringe spacing.” – The opposite: $\Delta x \sim \frac{1}{g}$.
  - The small-angle approximation is often used for gratings without checking.
