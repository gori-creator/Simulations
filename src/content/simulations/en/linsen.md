## What is it about?

A **converging lens** (convex, thicker in the middle) refracts light that travels parallel to the optical axis so that it meets at the **focal point** $F$. The distance from the focal point to the centre of the lens is the **focal length** $f$. A **diverging lens** (concave, thinner in the middle) spreads parallel light out as if it came from a focal point in front of the lens.

**Ray construction.** Light leaves every point of an object. To find the image point of the arrow tip, two of three special rays are enough (for simplicity, the rays are refracted at the central plane of the lens):

- **Parallel ray:** runs parallel to the axis and becomes a focal ray – through $F$ behind the lens.
- **Central ray:** passes straight through the centre of the lens.
- **Focal ray:** passes through $F$ in front of the lens and then runs parallel to the axis.

If the rays meet behind the lens, a **real image** forms – you can catch it on a screen. If they spread out, they seem (traced backwards) to come from a point in front of the lens: a **virtual image**, which you only see when looking through the lens.

**Lens equation and magnification.** With the object distance $g$, the image distance $b$, the object size $G$ and the image size $B$:

$$
\frac{1}{f} = \frac{1}{g} + \frac{1}{b} \qquad\text{and}\qquad \frac{B}{G} = \frac{b}{g}.
$$

For a virtual image $b$ is negative; for a diverging lens $f$ is negative. The **power** $D = \frac{1}{f}$ is given in dioptres: $1\,\text{dpt} = \frac{1}{\text{m}}$, so a lens with $f = 10\,\text{cm}$ has $10\,\text{dpt}$.

| Object distance | Image | Application |
| --- | --- | --- |
| $g > 2f$ | real, inverted, reduced, $f < b < 2f$ | camera, eye |
| $g = 2f$ | real, inverted, same size, $b = 2f$ | – |
| $f < g < 2f$ | real, inverted, magnified, $b > 2f$ | projector |
| $g = f$ | no image (rays parallel) | headlight (reversed light path) |
| $g < f$ | virtual, upright, magnified | magnifying glass |

**Optical bench.** With a candle, a lens and a screen you only see a sharp image when the screen is at the image distance. In front of it or behind it, each light bundle hits the screen as a patch – the image is blurred. A small **aperture** makes the bundles narrower: the image gets darker but stays sharp over a larger range (**depth of field**).

## Try it

1. Drag the object slowly from far away up to the lens – or press **Play**. How do the position, size and orientation of the image change?
2. Place the object exactly at twice the focal length. What do you notice about the image? [g = 2f](?g=20)
3. What happens when the object is at the focal point? Switch on the light bundle. [g = f](?g=10&bun=1)
4. Move the object inside the focal length. Where is the image now? [Magnifier](?g=6&gs=4)
5. Switch to the diverging lens and move the object. Can you produce a real image? [Diverging lens](?lt=zer&g=20&gs=8)
6. Switch on the light bundle: all rays from the arrow tip meet in the image point – not only the three construction rays. [Light bundle](?bun=1)
7. On the optical bench, move the screen until the candle image is sharp. Check with the lens equation. [Optical bench](?mode=bench)
8. Make the aperture smaller. How do brightness and sharpness change? [Small aperture](?mode=bench&d=1&s=34)

## Tasks

### Task 1: Construct and calculate the image

An object of size $G = 4\,\text{cm}$ stands $g = 25\,\text{cm}$ in front of a converging lens with $f = 10\,\text{cm}$. Construct the image and calculate $b$ and $B$. What are the properties of the image? [Load task](?g=25&gs=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{1}{b} = \frac{1}{f} - \frac{1}{g} = \frac{1}{10\,\text{cm}} - \frac{1}{25\,\text{cm}} = \frac{3}{50\,\text{cm}}$, so $b \approx 16.7\,\text{cm}$.

$B = G \cdot \frac{b}{g} \approx 4\,\text{cm} \cdot \frac{16.7}{25} \approx 2.7\,\text{cm}$. The image is real, inverted and reduced ($g > 2f$). [Show in the simulation](?g=25&gs=4)

</details>

### Task 2: The projector

A projector has a lens with $f = 10\,\text{cm}$. The image of a $3\,\text{cm}$ slide should appear sharp on a screen $b = 50\,\text{cm}$ behind the lens. How far from the lens must the slide be, and how large is the image? [Load task](?f=10&gs=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{1}{g} = \frac{1}{10\,\text{cm}} - \frac{1}{50\,\text{cm}} = \frac{4}{50\,\text{cm}}$, so $g = 12.5\,\text{cm}$ – just outside the focal length. $B = 3\,\text{cm} \cdot \frac{50}{12.5} = 12\,\text{cm}$. [Show in the simulation](?g=12.5&gs=3)

</details>

### Task 3: The magnifying glass

A magnifying glass has the focal length $f = 8\,\text{cm}$. A $3\,\text{cm}$ stamp lies $6\,\text{cm}$ in front of the lens. Where does the image form, and how large does it appear? [Load task](?f=8&g=6&gs=3&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{1}{b} = \frac{1}{8\,\text{cm}} - \frac{1}{6\,\text{cm}} = -\frac{1}{24\,\text{cm}}$, so $b = -24\,\text{cm}$: a virtual image $24\,\text{cm}$ in front of the lens, on the same side as the stamp. $\frac{B}{G} = \frac{24}{6} = 4$, the image is upright and $12\,\text{cm}$ tall. [Show in the simulation](?f=8&g=6&gs=3)

</details>

### Task 4: Focusing a camera

A camera lens has $f = 5\,\text{cm}$. How far behind the lens must the sensor be when the object is $50\,\text{cm}$ or $20\,\text{cm}$ away? So what do you have to do when focusing on an object that comes closer?

<details>
<summary>Show solution</summary>

$b = \frac{f \cdot g}{g - f} = \frac{5 \cdot 50}{45}\,\text{cm} \approx 5.6\,\text{cm}$ or $\frac{5 \cdot 20}{15}\,\text{cm} \approx 6.7\,\text{cm}$. When the object comes closer, the lens must move further away from the sensor. The eye does it differently: the distance stays the same, and the eye lens becomes more strongly curved (shorter focal length). [Object at 50 cm](?mode=bench&f=5&g=50&s=5.5) · [at 20 cm](?mode=bench&f=5&g=20&s=6.5)

</details>

### Task 5: Diverging lens

An object of size $5\,\text{cm}$ stands $15\,\text{cm}$ in front of a diverging lens with $f = -10\,\text{cm}$. Calculate $b$ and $B$.

<details>
<summary>Show solution</summary>

$\frac{1}{b} = -\frac{1}{10\,\text{cm}} - \frac{1}{15\,\text{cm}} = -\frac{1}{6\,\text{cm}}$, so $b = -6\,\text{cm}$ (virtual, in front of the lens). $B = 5\,\text{cm} \cdot \frac{6}{15} = 2\,\text{cm}$: upright and reduced. [Show in the simulation](?lt=zer&g=15&gs=5)

</details>

### Task 6: Same size

Show with the lens equation: if the object is at twice the focal length, the image also forms at twice the focal length and has the same size.

<details>
<summary>Show solution</summary>

With $g = 2f$: $\frac{1}{b} = \frac{1}{f} - \frac{1}{2f} = \frac{1}{2f}$, so $b = 2f$, and $\frac{B}{G} = \frac{b}{g} = 1$. [Show in the simulation](?g=20)

</details>

## Ideas for the classroom

- **Use:** optics in lower secondary school (lenses, image formation, optical instruments), about grades 8 to 10. Part 1 is suited to introducing and practising ray construction, part 2 as a substitute for or preparation of the experiment on the optical bench.
- **Model:** thin lens, paraxial rays, no lens aberrations; refraction happens at the central plane. Construction rays may hit the central plane outside the drawn lens – they only serve the construction. The drawing adapts its scale to the focal length.
- **Signs:** virtual image $b < 0$, diverging lens $f < 0$; the magnification uses absolute values.
- **Construction practice:** image and rays can be hidden under “Display”; `_hide=1` hides the results.
- **Optical bench:** the screen image is made of the light bundles from all points of the candle (blur circle from similar triangles); a blur circle up to $3\,\text{mm}$ counts as sharp. The aperture reduces the effective opening of the lens.
- **Common stumbling blocks:**
  - “If you cover half the lens, half the image is missing.” – The whole image remains, it just gets darker (try a small aperture).
  - “The image only forms when there is a screen.” – The light bundles meet even without a screen; the screen makes the image visible.
  - “There are only the three construction rays.” – They are tools; the light bundle shows that all rays pass through the image point.
  - “You cannot see a virtual image.” – You see it when looking through the lens; you just cannot catch it on a screen.
