## What is it about?

Light is an **electromagnetic wave**: an electric field oscillates across the direction of travel. Two experiments show what follows from this.

### Polarisation

In light from a bulb or the Sun the field oscillates in all transverse directions at random – the light is **unpolarised**. A **polarising filter** only lets through the oscillation in one direction (its transmission axis). Behind it the light is **linearly polarised** and only half as bright.

A second filter (the **analyser**) only passes the part pointing along its own axis. If it is turned by the angle $\Delta\theta$, **Malus’s law** applies:

$$I = I_1 \cdot \cos^2 \Delta\theta$$

At $\Delta\theta = 90°$ (**crossed filters**) it goes dark. Surprisingly, if you put a third filter at an angle **in between**, it becomes bright again – even though you added a filter. The middle filter turns the direction of oscillation step by step.

Only **transverse waves** can be polarised. So the fact that light can be polarised shows that light oscillates sideways. Sound in air (a longitudinal wave) cannot be polarised.

**In everyday life:** polarising sunglasses block light reflected from water or roads, which is partly polarised. LCD screens control the brightness of every pixel with two polarising filters and a liquid-crystal layer in between.

### Refraction in the wave model

According to **Huygens’ principle**, every point of a wave front is the source of a small **wavelet**. The new wave front is the common tangent (envelope) of all wavelets.

When a wave hits a boundary at an angle, it reaches the points of the boundary one after another. In the second medium the wavelets travel more slowly ($c_2 < c_1$), so their circles stay smaller – the wave front bends. This gives **Snell’s law**:

$$\frac{\sin \alpha}{\sin \beta} = \frac{c_1}{c_2} = n$$

The frequency stays the same, so the wavelength becomes shorter in the slower medium: $\lambda_2 = \lambda_1 / n$.

### Total internal reflection

If the wave enters a **faster** medium ($n < 1$, e.g. from glass into air), $\beta$ becomes larger than $\alpha$. Beyond the **critical angle** with $\sin \alpha_c = n$ there is no refracted wave: the wavelets in the second medium would be so large that no common tangent exists. The light is reflected completely. This keeps light trapped in an **optical fibre**.

## Try it

- [Two filters](?mode=pol&th1=0&th2=60&mitte=0): Turn the analyser from 0° to 180°. When is it brightest, when dark?
- [Crossed filters](?mode=pol&th1=0&th2=90&mitte=0): No light. Now switch on the third filter.
- [Three filters](?mode=pol&th1=0&th2=90&mitte=1&th3=45): At which angle of the middle filter does most light get through?
- [Air → glass](?mode=huygens&alpha=40&n=1.5): Compare the spacing of the wave fronts above and below.
- [Glass → air](?mode=huygens&alpha=50&n=0.65): Reduce the angle of incidence until a refracted wave appears again.

## Exercises

**1. Malus.** The analyser is turned by 60° relative to the polariser. What fraction of the original, unpolarised light reaches the screen? [Load exercise](?mode=pol&th1=0&th2=60&mitte=0&_hide=1)

<details><summary>Show solution</summary>

First filter: $\tfrac12 I_0$. Second: $\cos^2 60° = \tfrac14$. Together $I = \tfrac18 I_0 = 12.5\,\%$.

</details>

**2. The third filter.** A third filter at 45° is placed between crossed filters (0° and 90°). How much light arrives now? [Load exercise](?mode=pol&th1=0&th2=90&mitte=1&th3=45&_hide=1)

<details><summary>Show solution</summary>

$I = \tfrac12 I_0 \cdot \cos^2 45° \cdot \cos^2 45° = \tfrac12 \cdot \tfrac12 \cdot \tfrac12\, I_0 = 12.5\,\%$ – before it was 0.

</details>

**3. Angle of refraction.** Light hits glass ($n = 1.5$) from air at 40°. Calculate the angle of refraction and the wavelength in glass if it is 600 nm in air. [Load exercise](?mode=huygens&alpha=40&n=1.5&_hide=1)

<details><summary>Show solution</summary>

$\sin \beta = \dfrac{\sin 40°}{1.5} \approx 0.43$, so $\beta \approx 25.4°$. $\lambda_2 = \dfrac{600\,\text{nm}}{1.5} = 400\,\text{nm}$.

</details>

**4. Critical angle.** Light travels from glass into air, $n = c_\text{glass}/c_\text{air} \approx 0.65$. From which angle of incidence does total internal reflection occur? [Load exercise](?mode=huygens&alpha=50&n=0.65&_hide=1)

<details><summary>Show solution</summary>

$\sin \alpha_c = 0.65$, so $\alpha_c \approx 40.5°$.

</details>
