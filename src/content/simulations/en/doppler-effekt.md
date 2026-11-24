## What is it about?

When an ambulance with its siren passes you, the sound is **higher** while it approaches and **lower** while it moves away than when it stands still. This is the **Doppler effect** (after Christian Doppler, 1842).

The source sends out wavefronts with frequency $f_Q$; in still air they spread as circles (in space: spheres) at the **speed of sound** $c \approx 340\,\tfrac{\text{m}}{\text{s}}$ (air at about $15\,^\circ\text{C}$; at $20\,^\circ\text{C}$ it is $343\,\tfrac{\text{m}}{\text{s}}$). Each circle has its centre where the source **was** when it was emitted. If the source moves at $v_Q$, it moves forward by $v_Q \cdot T$ in every period $T = \frac{1}{f_Q}$. That is why the wavefronts are **closer together in front** and **further apart behind**:

$$
\lambda_v = \frac{c - v_Q}{f_Q}, \qquad \lambda_h = \frac{c + v_Q}{f_Q}.
$$

An observer at rest hears $f_B = \frac{c}{\lambda}$, so

$$
f_B = f_Q \cdot \frac{c}{c - v_Q} \;\; \text{(source approaching)}, \qquad f_B = f_Q \cdot \frac{c}{c + v_Q} \;\; \text{(source moving away)}.
$$

If instead the **observer** moves at $v_B$ towards a source at rest, the wavelength stays the same; but the observer moves into the wavefronts and meets them more often:

$$
f_B = f_Q \cdot \frac{c + v_B}{c} \;\; \text{(observer approaching)}, \qquad f_B = f_Q \cdot \frac{c - v_B}{c} \;\; \text{(observer moving away)}.
$$

Both together give $f_B = f_Q \cdot \frac{c + v_{B,r}}{c - v_{Q,r}}$. Here $v_{Q,r}$ and $v_{B,r}$ are the **components of the velocities along the line joining them** (positive towards the other one). If the observer stands to the side of the road, this component changes continuously as the vehicle passes: the sound **glides** from high to low. Exactly when the sound was emitted perpendicular to the direction of travel, you hear $f_Q$.

A numerical example: for $f_Q = 440\,\text{Hz}$ and $v_Q = 34\,\tfrac{\text{m}}{\text{s}}$ you hear $488.9\,\text{Hz}$ in front and $400\,\text{Hz}$ behind.

**Limiting cases:** if the source travels exactly at the speed of sound ($v_Q = c$, **Mach number** $Ma = \frac{v_Q}{c} = 1$), all wavefronts pile up in front of it – the “**sound barrier**”. If it is faster ($Ma > 1$), it overtakes its own sound. The wavefronts then form the **Mach cone** with the half-angle

$$
\sin \alpha = \frac{c}{v_Q}.
$$

In front of the cone it is silent; when it sweeps past the observer, you hear the **sonic boom**.

**About the display:** in reality the wavefronts are only about $0.8\,\text{m}$ apart. So that you can see them, only every $n$-th wavefront is drawn (the bottom left of the picture shows which). The brackets therefore measure $n \cdot \lambda$. Fast processes run automatically in slow motion.

## Try it

1. Press “Restart” and watch the rings. Where are they closer together, where further apart? Compare the centres of the rings with the position of the ambulance.
2. Watch the graph $f_B(t)$ while the ambulance passes. Why is it silent at first? Why does the sound glide rather than jump?
3. Drag the observer right up to the road and away again. How does the shape of the curve change? [Right next to the road](?d=6&bx=20)
4. Switch on the sound (button “Play sound”) and restart – with and without slow motion.
5. Let the observer walk towards a source at rest. What frequency does the observer hear? Is it the same as for a moving source at the same speed? [Observer moves](?vq=0&vb=34&d=6&bx=110)
6. Slowly increase $v_Q$ up to $340\,\tfrac{\text{m}}{\text{s}}$. What happens to the wavefronts in front of the source? [Sound barrier](?vq=340&lam=0)
7. At supersonic speed: measure the angle of the Mach cone and compare with $\sin\alpha = \frac{c}{v_Q}$. When does the observer hear something? [Mach 2](?vq=680&d=30&bx=0)

## Exercises

### Exercise 1: Siren

An ambulance travels at $34\,\tfrac{\text{m}}{\text{s}}$ (just over $120\,\tfrac{\text{km}}{\text{h}}$), its siren has $440\,\text{Hz}$. What frequency does an observer right next to the road hear as it approaches and as it moves away? [Load exercise](?d=6&bx=20&val=0&_hide=1)

<details>
<summary>Show solution</summary>

Approaching: $f_B = 440\,\text{Hz} \cdot \frac{340}{340 - 34} \approx 488.9\,\text{Hz}$. Moving away: $f_B = 440\,\text{Hz} \cdot \frac{340}{340 + 34} = 400\,\text{Hz}$. In the simulation the observer stands $6\,\text{m}$ beside the road. The component of $v_Q$ along the line is therefore slightly smaller than $34\,\tfrac{\text{m}}{\text{s}}$, and you read slightly less (for example $488.6\,\text{Hz}$). [Show in the simulation](?d=6&bx=20)

</details>

### Exercise 2: Wavelengths

For Exercise 1, calculate the wavelength in front of and behind the ambulance and at rest.

<details>
<summary>Show solution</summary>

$\lambda_v = \frac{306\,\text{m/s}}{440\,\text{Hz}} \approx 0.695\,\text{m}$, $\lambda_h = \frac{374\,\text{m/s}}{440\,\text{Hz}} = 0.85\,\text{m}$, at rest $\lambda = \frac{340\,\text{m/s}}{440\,\text{Hz}} \approx 0.773\,\text{m}$. Check: $\frac{c}{\lambda_v} \approx 488.9\,\text{Hz}$.

</details>

### Exercise 3: Who is moving?

A cyclist rides at $34\,\tfrac{\text{m}}{\text{s}}$ (very sporty!) towards a $440\text{-Hz}$ source at rest. What frequency does the cyclist hear? Compare with Exercise 1 and explain the difference. [Load exercise](?vq=0&vb=34&d=6&bx=110&val=0&_hide=1)

<details>
<summary>Show solution</summary>

$f_B = 440\,\text{Hz} \cdot \frac{340 + 34}{340} = 484\,\text{Hz}$ – a little less than $488.9\,\text{Hz}$. If the source moves, the waves themselves are compressed (shorter wavelength). If the observer moves, the wavelength stays the same; the observer just meets wavefronts more often. Because sound travels through the air, it matters who moves relative to the air. [Show in the simulation](?vq=0&vb=34&d=6&bx=110)

</details>

### Exercise 4: Both moving

Ambulance ($34\,\tfrac{\text{m}}{\text{s}}$) and cyclist ($34\,\tfrac{\text{m}}{\text{s}}$) move towards each other. What frequency does the cyclist hear, and what after they have passed each other? [Load exercise](?vb=34&d=6&bx=100&val=0&_hide=1)

<details>
<summary>Show solution</summary>

Before: $f_B = 440\,\text{Hz} \cdot \frac{340 + 34}{340 - 34} \approx 537.8\,\text{Hz}$. Afterwards both move apart: $f_B = 440\,\text{Hz} \cdot \frac{340 - 34}{340 + 34} = 360\,\text{Hz}$. Because of the $6\,\text{m}$ distance from the road, the simulation shows slightly less (for example $536.4\,\text{Hz}$). [Show in the simulation](?vb=34&d=6&bx=100)

</details>

### Exercise 5: Speed from the drop in pitch

As a car passes, its sound falls in the ratio $\frac{f_v}{f_h} = \frac{6}{5}$ (a minor third). How fast is the car going?

<details>
<summary>Show solution</summary>

$\frac{f_v}{f_h} = \frac{c + v_Q}{c - v_Q} = 1.2 \;\Rightarrow\; v_Q = c \cdot \frac{1.2 - 1}{1.2 + 1} \approx 30.9\,\tfrac{\text{m}}{\text{s}} \approx 111\,\tfrac{\text{km}}{\text{h}}$. You do not need to know the frequency of the source for this. [Check](?vq=31&d=6&bx=20)

</details>

### Exercise 6: Sonic boom

A plane flies at Mach 2 at a height of $3\,\text{km}$ directly over you. What is the half-angle of the Mach cone? How long after it passes overhead do you hear the boom?

<details>
<summary>Show solution</summary>

$\sin\alpha = \frac{1}{2}$, so $\alpha = 30^\circ$. The cone reaches you when the plane is already $\frac{3\,\text{km}}{\tan 30^\circ} \approx 5.2\,\text{km}$ further on; at $680\,\tfrac{\text{m}}{\text{s}}$ that takes about $7.6\,\text{s}$. [Watch Mach 2](?vq=680&d=30&bx=0)

</details>

## Ideas for the classroom

- **Use:** with waves (sound as a wave, $c = \lambda \cdot f$) in lower or upper secondary, depending on the curriculum. A good starter is the everyday experience of a siren, ideally first with sound and without numbers (`val=0`), then the explanation via the compressed wavefronts.
- **Model:** the air is at rest, the source moves uniformly in a straight line and emits from the start. For every moment the simulation calculates exactly when the sound arriving now was emitted ($|B(t) - S(\tau)| = c \cdot (t - \tau)$); frequency, loudness and the radial components follow from this. Seen from above the wavefronts are circles; only every $n$-th is drawn. The vehicle and the person are drawn larger than to scale so they are easier to see.
- **Sound:** the sound is off by default and only starts at the press of a button, quietly. In slow motion the pitch stays physically correct; only the sequence is slower. At supersonic speed, two tones can be heard at the same time after the boom; the one emitted earlier arrives in reverse order (dashed in the graph) – a nice extra question for those interested.
- **Common pitfalls:**
  - “The sound gets louder, so it sounds higher.” – Loudness and pitch are different quantities; the pitch depends only on the frequency.
  - “The sound jumps as it passes.” – Only right on the road; with a sideways distance it glides via the radial component.
  - “The source changes its frequency.” – $f_Q$ stays the same; only the spacing of the arriving wavefronts changes.
  - “Moving source and moving observer are the same.” – Not for sound (Exercise 3), because the air defines a frame of reference.
  - “The sonic boom only happens when breaking the sound barrier.” – The cone is dragged along; every place it sweeps over hears the boom.
- **Going further:** Doppler ultrasound in medicine, radar speed measurement, redshift of light (a different formula applies there, because there is no medium).
