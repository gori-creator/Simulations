---
description: "Interactive simulation of lenses – ray construction with parallel, central and focal rays, the lens equation, magnification, magnifier, projector and camera, and focusing an image on the optical bench."
---

## What is it about?

A **converging lens** brings light that travels parallel to the optical axis together at the **focal point** $F$; the distance to the lens centre is the **focal length** $f$. A **diverging lens** spreads such light out as if it came from a focal point in front of the lens.

To find the image of the arrow tip, two of three special rays are enough (refraction is simplified to the central plane): the **parallel ray** goes through $F$ behind the lens, the **central ray** passes straight through the centre, and the **focal ray** passes through $F$ in front of the lens and leaves parallel to the axis. If the rays meet behind the lens, the image is **real**; if they spread out, they seem to come from a **virtual** image in front of the lens.

$$
\frac{1}{f} = \frac{1}{g} + \frac{1}{b} \qquad\text{and}\qquad \frac{B}{G} = \frac{b}{g}
$$

with object distance $g$, image distance $b$ (negative for a virtual image), object size $G$ and image size $B$. For $g > 2f$ the image is reduced (camera, eye), for $f < g < 2f$ magnified (projector), for $g = f$ there is no image, and for $g < f$ it is virtual and magnified (magnifying glass).

## Try it

1. Drag the object from far away towards the lens – or press **Play**. Watch the image.
2. Place the object at twice the focal length. [g = 2f](?g=20)
3. Object inside the focal length: a magnifying glass. [Magnifier](?g=6&gs=4)
4. Switch on the light bundle: all rays from the tip meet in the image point. [Light bundle](?bun=1)
5. On the optical bench, move the screen until the candle is sharp; then make the aperture smaller. [Optical bench](?mode=bench)

## Tasks

### Task 1: Calculate the image

An object $G = 4\,\text{cm}$ stands $g = 25\,\text{cm}$ in front of a lens with $f = 10\,\text{cm}$. Find $b$ and $B$. [Load task](?g=25&gs=4&show=0&_hide=1)

<details>
<summary>Show solution</summary>

$\frac{1}{b} = \frac{1}{10\,\text{cm}} - \frac{1}{25\,\text{cm}}$ gives $b \approx 16.7\,\text{cm}$ and $B = 4\,\text{cm} \cdot \frac{16.7}{25} \approx 2.7\,\text{cm}$: real, inverted, reduced. [Show in the simulation](?g=25&gs=4)

</details>

### Task 2: Projector

A projector lens has $f = 10\,\text{cm}$; the screen is $50\,\text{cm}$ behind the lens. Where must the slide be?

<details>
<summary>Show solution</summary>

$\frac{1}{g} = \frac{1}{10\,\text{cm}} - \frac{1}{50\,\text{cm}}$ gives $g = 12.5\,\text{cm}$, and the image is $4$ times as large. [Show in the simulation](?g=12.5&gs=3)

</details>

### Task 3: Magnifying glass

A magnifier has $f = 8\,\text{cm}$; a stamp lies $6\,\text{cm}$ in front of it. Where is the image?

<details>
<summary>Show solution</summary>

$b = \frac{8 \cdot 6}{6 - 8}\,\text{cm} = -24\,\text{cm}$: a virtual, upright image $24\,\text{cm}$ in front of the lens, 4 times as large. [Show in the simulation](?f=8&g=6&gs=3)

</details>

## Notes for teachers

- **Use:** lower secondary optics (lenses, image formation, optical instruments).
- **Model:** thin lens, paraxial rays, refraction at the central plane; construction rays may hit the central plane outside the drawn lens. The drawing scale follows the focal length.
- **Construction practice:** image and rays can be hidden under “Display”; `_hide=1` hides the results.
- **Misconceptions:** covering half the lens removes half the image (it only gets darker); the image only exists when there is a screen; only the three construction rays exist.
