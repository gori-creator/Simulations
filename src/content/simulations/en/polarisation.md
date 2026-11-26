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

### Only transverse waves can be polarised

In a **transverse wave** (a rope wave, light, radio waves) something oscillates across the direction of travel. A slit or filter lets through only the part of the oscillation along its direction – afterwards the wave is **linearly polarised**. In a **longitudinal wave** like sound the air oscillates along the direction of travel. Every slit lets it through equally, so it cannot be polarised. The fact that light can be polarised shows: light is a transverse wave.

### Polarisation by reflection

Light reflected from water or glass is partly polarised: it oscillates mainly horizontally (parallel to the surface). At **Brewster’s angle** $\tan \theta_B = n$ only horizontally oscillating light is reflected – for water at about 53°. **Polarising sunglasses** only let vertically oscillating light through and so block the glare on water and wet roads. Photographers use polarising filters for the same reason.

### LCD screens

Each pixel of an LCD sits between two crossed filters. In between, a **liquid crystal** twists the direction of oscillation by 90° – the light passes the second filter and the pixel is bright. When a voltage is applied, the molecules line up and stop twisting: the pixel goes dark. This is how digits appear on calculators and watches.

## Try it

- [Two filters](?mode=pol&th1=0&th2=60&mitte=0): Turn the analyser from 0° to 180°. When is it brightest, when dark?
- [Crossed filters](?mode=pol&th1=0&th2=90&mitte=0): No light. Now switch on the third filter.
- [Three filters](?mode=pol&th1=0&th2=90&mitte=1&th3=45): At which angle of the middle filter does most light get through?
- [Air → glass](?mode=huygens&alpha=40&n=1.5): Compare the spacing of the wave fronts above and below.
- [Glass → air](?mode=huygens&alpha=50&n=0.65): Reduce the angle of incidence until a refracted wave appears again.
- [Rope wave](?mode=welle&wt=quer&wpol=0&wf=30) and [sound](?mode=welle&wt=laengs&wf=0): Turn the slit. For which wave does anything change?
- [Reflection on a lake](?mode=spiegel&ra=53&stoff=wasser&brille=0): Put on the sunglasses. What remains of the glare?
- [LCD without voltage](?mode=lcd&u=0&ziffer=4): Raise the voltage slowly. When does the digit appear?
- [Practice](?mode=ueben&qn=1): Six kinds of tasks with a score.

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

**4. Sunglasses.** At which angle of incidence is light reflected from water ($n = 1.33$) completely polarised? [Load task](?mode=spiegel&ra=30&stoff=wasser&brille=1&_hide=1)

<details><summary>Show solution</summary>

$\theta_B = \arctan 1.33 \approx 53^\circ$. There polarising sunglasses block the glare completely.

</details>

## Ideas for teaching

- **Phone and sunglasses:** Look at a phone screen through polarising sunglasses and tilt your head – the screen goes dark. LCDs emit polarised light too.
- **Common mistake:** “The filter makes the light darker.” It selects a direction of oscillation; that is why a third filter makes crossed filters bright again.
- **Transverse wave with a rope:** Shake a rope through a picket fence – the rope wave shows polarisation directly.
